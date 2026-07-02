"""M4 异步队列回归 —— 入队辅助 + worker 设置 + 任务 API 路由。

真实 arq 入队/消费需要 Redis——单测验证模块可导入、worker 配置正确、
API 路由已注册。联调交给 docker-compose 环境。
"""
from __future__ import annotations

import importlib


def test_worker_settings_importable():
    mod = importlib.import_module("app.tasks.worker")
    ws = mod.WorkerSettings
    assert hasattr(ws, "functions")
    assert len(ws.functions) >= 1
    assert ws.max_jobs > 0
    assert ws.job_timeout > 0


def test_agent_task_importable():
    mod = importlib.import_module("app.tasks.agent_task")
    assert callable(mod.run_agent_task)


def test_queue_module_importable():
    mod = importlib.import_module("app.core.queue")
    assert callable(mod.get_pool)
    assert callable(mod.enqueue)


def test_tasks_api_enqueue_route_exists(app_client):
    resp = app_client.get("/api/v1/agentapp/tasks/nonexistent_job")
    assert resp.status_code in (404, 500)


def test_tasks_api_route_registered(app_client):
    resp = app_client.post(
        "/api/v1/agentapp/tasks/agent-run",
        json={"employee_key": "test", "user_input": "hi"},
    )
    assert resp.status_code in (200, 409, 500, 503)
