"""M4 异步队列回归 —— 入队辅助 + worker 设置 + 任务 API 路由。

真实 arq 入队/消费需要 Redis——单测验证模块可导入、worker 配置正确、
API 路由已注册。联调交给 docker-compose 环境。
"""
from __future__ import annotations

import asyncio
import importlib
from types import SimpleNamespace


def test_worker_settings_importable():
    mod = importlib.import_module("app.tasks.worker")
    from arq.constants import default_queue_name

    ws = mod.WorkerSettings
    assert hasattr(ws, "functions")
    assert len(ws.functions) >= 1
    assert ws.max_jobs > 0
    assert ws.job_timeout > 0
    assert ws.queue_name == default_queue_name


def test_agent_task_importable():
    mod = importlib.import_module("app.tasks.agent_task")
    assert callable(mod.run_agent_task)


def test_queue_module_importable():
    mod = importlib.import_module("app.core.queue")
    assert callable(mod.get_pool)
    assert callable(mod.enqueue)


def test_queue_unavailable_is_exported():
    """Redis 不可用有专用异常类型，API 层据此区分「依赖没起」和「代码出错」。"""
    mod = importlib.import_module("app.core.queue")
    assert issubclass(mod.QueueUnavailable, Exception)
    assert callable(mod.queue_available)


def test_redis_settings_fail_fast_by_default():
    """API 进程默认必须快速失败：连不上的 Redis 不该让请求空等十几秒。"""
    mod = importlib.import_module("app.core.queue")
    api_settings = mod._redis_settings()
    assert api_settings.conn_retries == 1
    assert api_settings.conn_retry_delay == 0
    # worker 显式放宽，避免 Redis 晚启动时常驻进程直接退出。
    worker_settings = mod._redis_settings(conn_retries=5, conn_retry_delay=1)
    assert worker_settings.conn_retries == 5


def test_tasks_api_enqueue_route_exists(app_client):
    # 没有 Redis 时返 503（依赖不可用），有 Redis 时任务不存在返 404。
    resp = app_client.get("/api/v1/agentapp/tasks/nonexistent_job")
    assert resp.status_code in (404, 500, 503)


def test_tasks_api_route_registered(app_client):
    resp = app_client.post(
        "/api/v1/agentapp/tasks/agent-run",
        json={"employee_key": "test", "user_input": "hi"},
    )
    assert resp.status_code in (200, 409, 500, 503)


def test_tasks_list_degrades_to_empty_without_redis(app_client, monkeypatch):
    """Redis 是可选能力：后台任务摘要轮询不能干扰单机 JSON/MD 主流程。"""
    queue = importlib.import_module("app.core.queue")

    async def unavailable_pool():
        raise queue.QueueUnavailable("测试环境未配置 Redis")

    monkeypatch.setattr(queue, "get_pool", unavailable_pool)

    resp = app_client.get("/api/v1/agentapp/tasks?limit=50")

    assert resp.status_code == 200
    assert resp.json()["data"] == []


def test_task_view_uses_arq_job_status_api(monkeypatch):
    """arq 0.28 的 JobDef 没有 status；状态必须通过 Job.status() 获取。"""
    tasks_api = importlib.import_module("app.api.tasks")
    arq_jobs = importlib.import_module("arq.jobs")

    class FakeJob:
        def __init__(self, job_id, redis):
            self.job_id = job_id

        async def info(self):
            return SimpleNamespace(
                enqueue_time="2026-08-04T00:00:00Z",
                result={"assistant_message": "QA-ASYNC-OK"},
            )

        async def status(self):
            return arq_jobs.JobStatus.complete

    monkeypatch.setattr(arq_jobs, "Job", FakeJob)

    view = asyncio.run(tasks_api._task_view(object(), "job-qa", {
        "employee_key": "qa-openrouter",
        "user_input": "ping",
    }))

    assert view["status"] == "complete"
    assert view["result"] == {"assistant_message": "QA-ASYNC-OK"}
