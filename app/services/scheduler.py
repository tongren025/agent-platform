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

logger = logging.getLogger(__name__)

_TICK_SECONDS = 30


_DISTILLATION_TIME = "03:00"
_EVOLUTION_TIME = "04:00"


class DailyScheduler:
    def __init__(self) -> None:
        self._task: asyncio.Task | None = None
        self._stop = asyncio.Event()
        self._inflight: set[str] = set()        # 提示词采集在途
        self._inflight_learn: set[str] = set()  # 文章学习在途
        self._inflight_distill: set[str] = set()  # 蒸馏在途
        self._inflight_evolve: set[str] = set()   # 进化在途
        self._distill_done_today: set[str] = set()
        self._evolve_done_today: set[str] = set()
        self._last_date: str = ""

    def start(self) -> None:
        if self._task is not None:
            return
        self._stop.clear()
        self._task = asyncio.create_task(self._loop(), name="daily-scrape-scheduler")
        logger.info("每日采集调度器已启动")

    async def stop(self) -> None:
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
        from app.dependencies import learn_source_store, scrape_source_store

        now = datetime.now()
        today = now.strftime("%Y-%m-%d")
        cur_hhmm = now.strftime("%H:%M")

        if today != self._last_date:
            self._distill_done_today.clear()
            self._evolve_done_today.clear()
            self._last_date = today

        self._scan(scrape_source_store.list_all(), today, cur_hhmm, self._inflight, self._dispatch_scrape)
        self._scan(learn_source_store.list_all(), today, cur_hhmm, self._inflight_learn, self._dispatch_learn)

        if cur_hhmm >= _DISTILLATION_TIME:
            self._scan_distillation()
        if cur_hhmm >= _EVOLUTION_TIME:
            self._scan_evolution()

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
        from app.services.scrape_runner import run_scrape

        code = src.source_code
        self._inflight.add(code)
        logger.info("定时触发采集：%s @ %s", code, src.schedule_time)

        async def _run() -> None:
            try:
                await run_scrape(src)
            except Exception:  # noqa: BLE001
                logger.exception("定时采集执行失败：%s", code)
            finally:
                self._inflight.discard(code)

        asyncio.create_task(_run(), name=f"scrape-{code}")

    def _dispatch_learn(self, src) -> None:
        from app.services.learn_runner import run_learn

        code = src.source_code
        self._inflight_learn.add(code)
        logger.info("定时触发文章学习：%s @ %s", code, src.schedule_time)

        async def _run() -> None:
            try:
                await run_learn(src)
            except Exception:  # noqa: BLE001
                logger.exception("定时文章学习执行失败：%s", code)
            finally:
                self._inflight_learn.discard(code)

        asyncio.create_task(_run(), name=f"learn-{code}")

    # ── Deep Dream 蒸馏 ───────────────────────────────────

    def _scan_distillation(self) -> None:
        from app.dependencies import employee_registry

        for emp in employee_registry.list_all():
            k = emp.employee_key
            if not k or not emp.enabled:
                continue
            if k in self._distill_done_today or k in self._inflight_distill:
                continue
            self._dispatch_distill(k)

    def _dispatch_distill(self, emp_key: str) -> None:
        self._inflight_distill.add(emp_key)
        logger.info("定时触发蒸馏：%s @ %s", emp_key, _DISTILLATION_TIME)

        async def _run() -> None:
            try:
                from app.services.distillation import run_distillation
                await run_distillation(emp_key)
                self._distill_done_today.add(emp_key)
            except Exception:  # noqa: BLE001
                logger.exception("定时蒸馏执行失败：%s", emp_key)
            finally:
                self._inflight_distill.discard(emp_key)

        asyncio.create_task(_run(), name=f"distill-{emp_key}")

    # ── 自我进化 ───────────────────────────────────────────

    def _scan_evolution(self) -> None:
        from app.dependencies import employee_registry

        for emp in employee_registry.list_all():
            k = emp.employee_key
            if not k or not emp.enabled:
                continue
            if k in self._evolve_done_today or k in self._inflight_evolve:
                continue
            self._dispatch_evolve(k)

    def _dispatch_evolve(self, emp_key: str) -> None:
        self._inflight_evolve.add(emp_key)
        logger.info("定时触发自我进化：%s @ %s", emp_key, _EVOLUTION_TIME)

        async def _run() -> None:
            try:
                from app.services.evolution import run_evolution_analysis
                await run_evolution_analysis(emp_key)
                self._evolve_done_today.add(emp_key)
            except Exception:  # noqa: BLE001
                logger.exception("定时自我进化执行失败：%s", emp_key)
            finally:
                self._inflight_evolve.discard(emp_key)

        asyncio.create_task(_run(), name=f"evolve-{emp_key}")
