"""arq Worker 定义 —— `python -m app.tasks.worker` 启动独立 worker 进程。

也可以用 arq CLI：arq app.tasks.worker.WorkerSettings
docker-compose 里加一个 worker 服务指向这个模块即可。
"""
from __future__ import annotations

from arq.connections import RedisSettings

from app.core.queue import _redis_settings
from app.tasks.agent_task import run_agent_task


class WorkerSettings:
    """arq worker 配置：注册任务函数、Redis 连接、并发数与单任务超时。arq CLI 与 __main__ 都读它。"""
    functions = [run_agent_task]
    redis_settings: RedisSettings = _redis_settings()
    max_jobs = 10
    job_timeout = 600
    queue_name = "default"


if __name__ == "__main__":
    from arq import run_worker
    run_worker(WorkerSettings)  # type: ignore[arg-type]
