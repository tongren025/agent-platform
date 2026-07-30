"""单进程 AgentRun 控制面。

迁入 Yuxi AgentRun cancel signal / safe lifecycle boundary 的核心边界，但不搬
PostgreSQL 队列和 Redis 事件总线。默认单人模式只在内存中登记当前运行与取消信号；
服务重启后登记自然清空，历史结果仍由现有 JSON/可选 PostgreSQL 运行仓储保存。
"""
from __future__ import annotations

from dataclasses import dataclass
from threading import Lock
from time import monotonic


class ActiveRunConflictError(RuntimeError):
    """同一 run_id 已经在当前进程运行。"""


@dataclass
class ActiveRunState:
    """一个当前进程内的运行控制状态。"""

    run_id: str
    employee_key: str
    session_id: str | None
    started_at: float
    cancel_requested: bool = False


class InProcessRunControl:
    """线程安全的进程内运行登记表；不依赖数据库或 Redis。"""

    def __init__(self) -> None:
        self._runs: dict[str, ActiveRunState] = {}
        self._lock = Lock()

    def register(
        self,
        run_id: str,
        *,
        employee_key: str,
        session_id: str | None,
    ) -> ActiveRunState:
        """登记运行；重复的活动 run_id 明确拒绝，防止两个请求共享取消信号。"""
        with self._lock:
            if run_id in self._runs:
                raise ActiveRunConflictError(f"Run already active: {run_id}")
            state = ActiveRunState(
                run_id=run_id,
                employee_key=employee_key,
                session_id=session_id,
                started_at=monotonic(),
            )
            self._runs[run_id] = state
            return state

    def request_cancel(self, run_id: str) -> ActiveRunState | None:
        """设置取消信号；不存在返回 None，重复请求保持幂等。"""
        with self._lock:
            state = self._runs.get(run_id)
            if state is None:
                return None
            state.cancel_requested = True
            return ActiveRunState(**vars(state))

    def should_cancel(self, run_id: str) -> bool:
        """供 AgentLoop 在模型/工具安全边界快速检查取消信号。"""
        with self._lock:
            state = self._runs.get(run_id)
            return bool(state and state.cancel_requested)

    def finish(self, run_id: str) -> None:
        """运行结束后移除瞬时状态；历史结果由 AgentRunStore 负责。"""
        with self._lock:
            self._runs.pop(run_id, None)

    def get(self, run_id: str) -> ActiveRunState | None:
        """返回当前状态快照，避免调用方修改登记表中的对象。"""
        with self._lock:
            state = self._runs.get(run_id)
            if state is None:
                return None
            return ActiveRunState(**vars(state))


active_run_control = InProcessRunControl()
