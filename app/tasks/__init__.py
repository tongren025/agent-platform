"""M4 异步任务包 —— arq 任务函数与 worker 配置。

API 进程只负责入队（app.core.queue.enqueue），任务体在独立 worker 进程
（`python -m app.tasks.worker`）中消费执行，长任务不阻塞 API。
"""
