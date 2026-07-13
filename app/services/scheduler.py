"""
轻量级每日定时调度器（基于 asyncio，无第三方依赖）。

采用「水位线 / 边沿触发」语义：每 30 秒巡检一次，对每个启用的采集源，
当本地时间已越过其 scheduleTime(HH:MM) 且「当天尚未运行过」时触发一次采集。

- 当天是否运行过以采集源持久化的 lastRunAt 为准（而非纯内存状态），
  因此应用重启 / 热重载不会丢失去重状态、也不会重复触发。
- 采集通过 create_task 后台派发，不在巡检循环里 await，避免长耗时抓取
  阻塞后续巡检导致「错过整分钟」。
- 同源用 in-flight 集合做互斥，防止上一轮未结束又触发。
- 错过精确分钟也会被下一次巡检补触发（run-if-missed）。
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime

from app.core.settings import settings as core_settings

logger = logging.getLogger(__name__)

_TICK_SECONDS = 30


_DISTILLATION_TIME = "03:00"
_EVOLUTION_TIME = "04:00"

# 趋势同步安排在蒸馏/进化之前：报告依赖当天刚拉到的榜单数据。
_TRENDS_KEY = "trends"


class DailyScheduler:
    """每日定时调度器：巡检并在到点时后台派发采集/学习/蒸馏/进化任务（边沿触发、当天去重）。"""

    def __init__(self) -> None:
        """初始化调度状态：后台任务句柄、停止信号、各类在途集合与当天已完成集合。"""
        self._task: asyncio.Task | None = None
        self._stop = asyncio.Event()
        self._inflight: set[str] = set()        # 提示词采集在途
        self._inflight_learn: set[str] = set()  # 文章学习在途
        self._inflight_distill: set[str] = set()  # 蒸馏在途
        self._inflight_evolve: set[str] = set()   # 进化在途
        self._inflight_trends: set[str] = set()   # 趋势同步在途
        self._distill_done_today: set[str] = set()
        self._evolve_done_today: set[str] = set()
        self._trends_done_today: set[str] = set()
        self._last_date: str = ""

    def start(self) -> None:
        """启动后台巡检任务（幂等：已启动则直接返回）。"""
        if self._task is not None:
            return
        self._stop.clear()
        self._task = asyncio.create_task(self._loop(), name="daily-scrape-scheduler")
        logger.info("每日采集调度器已启动")

    async def stop(self) -> None:
        """停止调度器：先发停止信号优雅等待（最多 5 秒），超时则强制取消任务。"""
        if self._task is None:
            return
        self._stop.set()
        try:
            await asyncio.wait_for(asyncio.shield(self._task), timeout=5)
        except asyncio.TimeoutError:
            self._task.cancel()
            try:
                await self._task
            except (asyncio.CancelledError, Exception):  # noqa: BLE001
                pass
        except asyncio.CancelledError:
            pass
        self._task = None
        logger.info("每日采集调度器已停止")

    async def _loop(self) -> None:
        """巡检主循环：每 _TICK_SECONDS 秒 tick 一次，直到收到停止信号；单次 tick 异常只记录不中断。"""
        while not self._stop.is_set():
            try:
                self._tick()
            except Exception:  # noqa: BLE001
                logger.exception("采集调度巡检异常")
            try:
                await asyncio.wait_for(self._stop.wait(), timeout=_TICK_SECONDS)
            except asyncio.TimeoutError:
                pass

    def _tick(self) -> None:
        """单次巡检：跨天时重置当天标记，扫描采集/学习源，到点后扫描蒸馏(03:00)/进化(04:00)。"""
        from app.dependencies import learn_source_store, scrape_source_store

        now = datetime.now()
        today = now.strftime("%Y-%m-%d")
        cur_hhmm = now.strftime("%H:%M")

        if today != self._last_date:
            self._distill_done_today.clear()
            self._evolve_done_today.clear()
            self._trends_done_today.clear()
            self._last_date = today

        self._scan(scrape_source_store.list_all(), today, cur_hhmm, self._inflight, self._dispatch_scrape)
        self._scan(learn_source_store.list_all(), today, cur_hhmm, self._inflight_learn, self._dispatch_learn)

        if core_settings.trends_auto_sync and cur_hhmm >= core_settings.trends_sync_time:
            self._scan_trends()
        if cur_hhmm >= _DISTILLATION_TIME:
            self._scan_distillation(today)
        if cur_hhmm >= _EVOLUTION_TIME:
            self._scan_evolution(today)

    @staticmethod
    def _ran_on(last: datetime | None, today: str) -> bool:
        """落盘的上次运行时间是否已是今天（本地日期）。

        日志里的 ranAt 是 UTC（带 Z），而调度器按本地时间判断"今天"，必须先转本地时区。
        用 >= 而非 == ，是为了对付时钟回拨——宁可今天少跑一次，也不要疯狂重跑。
        """
        if last is None:
            return False
        if last.tzinfo is not None:
            last = last.astimezone()
        return last.strftime("%Y-%m-%d") >= today

    def _scan(self, sources, today: str, cur_hhmm: str, inflight: set, dispatch) -> None:
        """水位线/边沿触发：到点且当天未跑过且不在途，则派发。两类采集源共用。"""
        for src in sources:
            if not src.enabled or not src.schedule_time:
                continue
            # 还没到点（字符串按 HH:MM 比较，零填充下等价于时间比较）
            if cur_hhmm < src.schedule_time:
                continue
            # 当天已运行过（以持久化的 lastRunAt 本地日期为准）
            if src.last_run_at is not None:
                last_local = src.last_run_at.astimezone().strftime("%Y-%m-%d")
                if last_local >= today:
                    continue
            if src.source_code in inflight:
                continue
            dispatch(src)

    def _dispatch_scrape(self, src) -> None:
        """把一个采集源标记为在途并后台派发采集任务（不阻塞巡检循环）。"""
        from app.services.scrape_runner import run_scrape

        code = src.source_code
        self._inflight.add(code)
        logger.info("定时触发采集：%s @ %s", code, src.schedule_time)

        async def _run() -> None:
            """后台跑采集，无论成败最后都清除在途标记。"""
            try:
                await run_scrape(src)
            except Exception:  # noqa: BLE001
                logger.exception("定时采集执行失败：%s", code)
            finally:
                self._inflight.discard(code)

        asyncio.create_task(_run(), name=f"scrape-{code}")

    def _dispatch_learn(self, src) -> None:
        """把一个学习源标记为在途并后台派发文章学习任务。"""
        from app.services.learn_runner import run_learn

        code = src.source_code
        self._inflight_learn.add(code)
        logger.info("定时触发文章学习：%s @ %s", code, src.schedule_time)

        async def _run() -> None:
            """后台跑文章学习，无论成败最后都清除在途标记。"""
            try:
                await run_learn(src)
            except Exception:  # noqa: BLE001
                logger.exception("定时文章学习执行失败：%s", code)
            finally:
                self._inflight_learn.discard(code)

        asyncio.create_task(_run(), name=f"learn-{code}")

    # ── AI 趋势自动同步 ───────────────────────────────────

    def _scan_trends(self) -> None:
        """到点且当天未同步过、且不在途，则派发一次趋势全量同步。"""
        if _TRENDS_KEY in self._trends_done_today or _TRENDS_KEY in self._inflight_trends:
            return
        self._dispatch_trends()

    def _dispatch_trends(self) -> None:
        """后台批量刷新全部趋势 query，成功后强制重生成 AI 分析报告。

        单个 query 失败不影响其他（网络/GitHub 限流是常态）；只要有任意一个 query
        刷新成功就重算报告。全部失败则不标记当天完成，留给下一次巡检重试。
        """
        self._inflight_trends.add(_TRENDS_KEY)
        logger.info("定时触发趋势同步 @ %s", core_settings.trends_sync_time)

        async def _run() -> None:
            try:
                from skill_tracker import tracker
                from skill_tracker.daily_run import DEFAULT_QUERIES
                from app.api.skills import generate_analysis, is_query_fresh

                pulled, skipped = 0, 0
                for q in DEFAULT_QUERIES:
                    # 别的入口（Windows 计划任务 / CLI）今天可能已经拉过了
                    if is_query_fresh(q):
                        skipped += 1
                        continue
                    try:
                        # tracker.run 是同步网络 IO，丢线程池避免阻塞事件循环
                        await asyncio.to_thread(tracker.run, q, 15, 180, True)
                        pulled += 1
                    except Exception:  # noqa: BLE001 单 query 失败不中断
                        logger.exception("趋势同步失败：query=%r", q)

                if pulled == 0 and skipped == 0:
                    logger.error("趋势同步全部失败，不标记当天完成，等待下轮重试")
                    return

                # 真拉到新数据才 force 重算；否则交给 generate_analysis 自己判断当天缓存
                try:
                    report = await generate_analysis(force=pulled > 0)
                    logger.info("趋势 AI 报告就绪，模型=%s", report.get("model"))
                except Exception:  # noqa: BLE001 报告失败不影响榜单数据已落盘
                    logger.exception("趋势 AI 报告生成失败")

                # 个人化简报：只挑没看过且与画像相关的几条。放在报告之后，
                # 失败也不影响榜单与全景报告。
                try:
                    from app.services.trend_digest import generate_digest
                    d = await generate_digest(force=pulled > 0)
                    logger.info("趋势简报就绪：%d 条(候选 %d)", len(d.get("picks", [])), d.get("candidateCount", 0))
                except Exception:  # noqa: BLE001
                    logger.exception("趋势简报生成失败")

                # 清理旧产出：每个 query 只留最近几份，否则目录无限增长、
                # 拖慢每次 API 调用的目录扫描。快照目录绝不触碰（star 走势唯一来源）。
                if pulled > 0:
                    try:
                        from skill_tracker.retention import prune_outputs
                        r = prune_outputs()
                        if r["deleted"]:
                            logger.info(
                                "清理旧趋势产出：删除 %d 份，释放 %.1f KB",
                                r["deleted"], r["freed_bytes"] / 1024,
                            )
                    except Exception:  # noqa: BLE001 清理失败不影响主流程
                        logger.exception("清理旧趋势产出失败")

                self._trends_done_today.add(_TRENDS_KEY)
                logger.info(
                    "趋势同步完成：新拉 %d 个，跳过 %d 个（当天已有），共 %d 个 query",
                    pulled, skipped, len(DEFAULT_QUERIES),
                )
            except Exception:  # noqa: BLE001
                logger.exception("趋势同步任务异常")
            finally:
                self._inflight_trends.discard(_TRENDS_KEY)

        asyncio.create_task(_run(), name="trends-sync")

    # ── Deep Dream 蒸馏 ───────────────────────────────────

    def _scan_distillation(self, today: str) -> None:
        """扫描全部启用员工，对当天未蒸馏且不在途者派发蒸馏。

        「当天已跑过」以**落盘的运行日志**为准，而不是只看内存标记——
        否则进程一重启就把全部员工重跑一遍（实测某天累计 151 次，应为 11 次）。
        """
        from app.dependencies import employee_registry
        from app.services import distillation

        for emp in employee_registry.list_all():
            k = emp.employee_key
            if not k or not emp.enabled:
                continue
            if k in self._distill_done_today or k in self._inflight_distill:
                continue
            if self._ran_on(distillation.last_run_at(k), today):
                self._distill_done_today.add(k)  # 缓存，免得每 30 秒重读一次日志文件
                continue
            self._dispatch_distill(k)

    def _dispatch_distill(self, emp_key: str) -> None:
        """把一个员工标记为在途并后台派发蒸馏任务。"""
        self._inflight_distill.add(emp_key)
        logger.info("定时触发蒸馏：%s @ %s", emp_key, _DISTILLATION_TIME)

        async def _run() -> None:
            """后台跑蒸馏；无论成败都记入当天已完成，最后清除在途标记。

            失败也标记：否则下一次 30 秒巡检又会重新派发，失败一次就会疯狂重试一整天。
            想立刻重跑走 `POST /memory/{key}/distill`。
            """
            try:
                from app.services.distillation import run_distillation
                await run_distillation(emp_key)
            except Exception:  # noqa: BLE001
                logger.exception("定时蒸馏执行失败（今天不再自动重试）：%s", emp_key)
            finally:
                self._distill_done_today.add(emp_key)
                self._inflight_distill.discard(emp_key)

        asyncio.create_task(_run(), name=f"distill-{emp_key}")

    # ── 自我进化 ───────────────────────────────────────────

    def _scan_evolution(self, today: str) -> None:
        """扫描全部启用员工，对当天未进化且不在途者派发自我进化分析。

        与蒸馏同理：当天是否跑过以落盘的运行日志为准，跨进程重启依然有效。
        """
        from app.dependencies import employee_registry
        from app.services import evolution

        for emp in employee_registry.list_all():
            k = emp.employee_key
            if not k or not emp.enabled:
                continue
            if k in self._evolve_done_today or k in self._inflight_evolve:
                continue
            if self._ran_on(evolution.last_run_at(k), today):
                self._evolve_done_today.add(k)
                continue
            self._dispatch_evolve(k)

    def _dispatch_evolve(self, emp_key: str) -> None:
        """把一个员工标记为在途并后台派发自我进化任务。"""
        self._inflight_evolve.add(emp_key)
        logger.info("定时触发自我进化：%s @ %s", emp_key, _EVOLUTION_TIME)

        async def _run() -> None:
            """后台跑自我进化分析；无论成败都记入当天已完成，最后清除在途标记。

            与蒸馏同理：失败不标记会导致每 30 秒重试一整天。
            想立刻重跑走 `POST /evolution/{key}/analyze`。
            """
            try:
                from app.services.evolution import run_evolution_analysis
                await run_evolution_analysis(emp_key)
            except Exception:  # noqa: BLE001
                logger.exception("定时自我进化执行失败（今天不再自动重试）：%s", emp_key)
            finally:
                self._evolve_done_today.add(emp_key)
                self._inflight_evolve.discard(emp_key)

        asyncio.create_task(_run(), name=f"evolve-{emp_key}")
