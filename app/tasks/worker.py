"""arq Worker 定义 —— `python -m app.tasks.worker` 启动独立 worker 进程。

也可以用 arq CLI：arq app.tasks.worker.WorkerSettings
docker-compose 里加一个 worker 服务指向这个模块即可。
"""
from __future__ import annotations

from arq.connections import RedisSettings
from arq.constants import default_queue_name

from app.core.queue import _redis_settings
from app.tasks.agent_task import run_agent_task


class WorkerSettings:
    """arq worker 配置：注册任务函数、Redis 连接、并发数与单任务超时。arq CLI 与 __main__ 都读它。"""
    functions = [run_agent_task]
    # worker 是常驻进程且没有等待中的用户：Redis 稍晚启动时应该多等一会儿再放弃，
    # 而不是套用 API 进程那套「1 秒内快速失败」的参数直接退出。
    redis_settings: RedisSettings = _redis_settings(conn_retries=5, conn_retry_delay=1)
    max_jobs = 10
    job_timeout = 600
    # enqueue_job 未显式指定队列时写入 arq:queue；worker 必须监听同一个键。
    queue_name = default_queue_name


if __name__ == "__main__":
    from arq import run_worker
    run_worker(WorkerSettings)  # type: ignore[arg-type]
