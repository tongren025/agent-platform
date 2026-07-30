"""Yuxi AgentRun 取消边界：进程内信号、循环安全停止和 HTTP 观察。"""
from __future__ import annotations

from types import SimpleNamespace

import pytest

from app.api import agent as agent_api
from app.api import runs as runs_api
from app.models.run_record import AgentRunRecord
from app.runtime.loop import AgentLoopOptions, ToolHandler, run_agent_loop
from app.runtime.runner import AgentRunResult
from app.runtime.run_control import (
    ActiveRunConflictError,
    InProcessRunControl,
    active_run_control,
)


def _tool_call_response() -> object:
    return SimpleNamespace(
        usage=None,
        choices=[SimpleNamespace(
            finish_reason="tool_calls",
            message=SimpleNamespace(
                content="准备执行工具",
                tool_calls=[SimpleNamespace(
                    id="call_1",
                    function=SimpleNamespace(name="dangerous_tool", arguments="{}"),
                )],
            ),
        )],
    )


class _OneResponseCreate:
    def __init__(self, response: object):
        self.response = response
        self.calls = 0

    def __call__(self, **_kwargs):
        self.calls += 1
        return self.response


def test_in_process_control_is_idempotent_and_clears_finished_run():
    """取消信号可重复请求，结束后立即清理，不需要 Redis。"""
    control = InProcessRunControl()
    control.register("run_local", employee_key="director", session_id="ses_1")

    assert control.should_cancel("run_local") is False
    assert control.request_cancel("run_local").cancel_requested is True
    assert control.request_cancel("run_local").cancel_requested is True
    assert control.should_cancel("run_local") is True

    with pytest.raises(ActiveRunConflictError):
        control.register("run_local", employee_key="director", session_id=None)

    control.finish("run_local")
    assert control.get("run_local") is None
    assert control.should_cancel("run_local") is False


@pytest.mark.asyncio
async def test_agent_loop_stops_before_calling_model_when_cancelled():
    """运行开始前已取消时，不再消耗一次模型调用。"""
    create = _OneResponseCreate(_tool_call_response())
    client = SimpleNamespace(
        chat=SimpleNamespace(completions=SimpleNamespace(create=create))
    )

    result = await run_agent_loop(
        client=client,
        options=AgentLoopOptions(
            model="test-model",
            should_cancel=lambda: True,
        ),
        system_prompt="system",
        user_message="继续",
        tools=[],
    )

    assert result.cancelled is True
    assert result.success is False
    assert result.final_text == "已停止当前运行。"
    assert create.calls == 0


@pytest.mark.asyncio
async def test_agent_loop_does_not_start_tool_after_cancel_signal():
    """模型调用期间收到取消信号时，保留响应边界但绝不启动后续工具。"""
    create = _OneResponseCreate(_tool_call_response())
    client = SimpleNamespace(
        chat=SimpleNamespace(completions=SimpleNamespace(create=create))
    )
    checks = iter([False, True])
    tool_called = False

    async def handle(_args: str) -> str:
        nonlocal tool_called
        tool_called = True
        return "不应执行"

    result = await run_agent_loop(
        client=client,
        options=AgentLoopOptions(
            model="test-model",
            max_retries=0,
            should_cancel=lambda: next(checks, True),
        ),
        system_prompt="system",
        user_message="继续",
        tools=[ToolHandler(
            name="dangerous_tool",
            description="测试工具",
            input_schema={"type": "object", "properties": {}},
            handler=handle,
        )],
    )

    assert result.cancelled is True
    assert result.final_text == "已停止当前运行。"
    assert tool_called is False
    assert result.traces == []


@pytest.mark.asyncio
async def test_agent_loop_stops_after_current_tool_boundary():
    """工具执行期间收到停止时记录本次 trace，但不再进入下一轮模型。"""
    create = _OneResponseCreate(_tool_call_response())
    client = SimpleNamespace(
        chat=SimpleNamespace(completions=SimpleNamespace(create=create))
    )
    checks = iter([False, False, False, True])

    async def handle(_args: str) -> str:
        return "工具已完成"

    result = await run_agent_loop(
        client=client,
        options=AgentLoopOptions(
            model="test-model",
            max_retries=0,
            should_cancel=lambda: next(checks, True),
        ),
        system_prompt="system",
        user_message="继续",
        tools=[ToolHandler(
            name="dangerous_tool",
            description="测试工具",
            input_schema={"type": "object", "properties": {}},
            handler=handle,
        )],
    )

    assert result.cancelled is True
    assert result.final_text == "已停止当前运行。"
    assert create.calls == 1
    assert len(result.traces) == 1
    assert result.traces[0].result == "工具已完成"


def test_cancel_api_returns_stable_recovery_observation(app_client):
    """活动运行收到取消信号时返回 status/summary/nextActions/artifacts。"""
    run_id = "run_http_cancel"
    active_run_control.register(
        run_id,
        employee_key="director",
        session_id="ses_http",
    )
    try:
        response = app_client.post(
            f"/api/v1/agentapp/agent/runs/{run_id}/cancel"
        )
        assert response.status_code == 200
        payload = response.json()["data"]
        assert payload["status"] == "success"
        assert payload["runId"] == run_id
        assert payload["state"] == "cancelling"
        assert payload["artifacts"] == [run_id]
        assert len(payload["nextActions"]) == 2
        assert active_run_control.should_cancel(run_id) is True
    finally:
        active_run_control.finish(run_id)


def test_run_endpoint_uses_client_run_id_and_clears_control(app_client, monkeypatch):
    """同步运行沿用客户端 runId，执行期间可观察，返回后清理瞬时控制状态。"""
    run_id = "run_endpoint_contract"

    async def fake_run_invocation(request):
        assert request.run_id == run_id
        assert active_run_control.get(run_id) is not None
        return AgentRunResult(
            run_id=run_id,
            assistant_message="完成",
            session_id="ses_endpoint",
        )

    monkeypatch.setattr(agent_api, "run_invocation", fake_run_invocation)

    response = app_client.post(
        "/api/v1/agentapp/agent/run",
        json={
            "employeeKey": "director",
            "userInput": "测试",
            "runId": run_id,
        },
    )

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["runId"] == run_id
    assert payload["cancelled"] is False
    assert payload["assistantMessage"] == "完成"
    assert active_run_control.get(run_id) is None


def test_team_run_uses_same_run_control_contract(app_client, monkeypatch):
    """团队端点复用同一执行边界，并正确传递客户端 runId。"""
    run_id = "run_team_contract"
    team = SimpleNamespace(
        team_code="story-team",
        name="故事团队",
        description="",
        leader_employee_key="director",
        default_employee_key="",
        default_workflow_key="",
        member_employee_keys=["director"],
        roles=[],
    )
    employee = SimpleNamespace(name="导演")

    class TeamRegistryStub:
        def get(self, code: str):
            return team if code == team.team_code else None

    class EmployeeRegistryStub:
        def get(self, key: str):
            return employee if key == "director" else None

    class MemoryStoreStub:
        def load_session(self, _session_id: str):
            return None

    async def fake_run_invocation(request):
        assert request.employee_key == "director"
        assert request.run_id == run_id
        return AgentRunResult(
            run_id=run_id,
            assistant_message="团队完成",
            session_id="ses_team",
        )

    monkeypatch.setattr(agent_api, "team_registry", TeamRegistryStub())
    monkeypatch.setattr(agent_api, "employee_registry", EmployeeRegistryStub())
    monkeypatch.setattr(agent_api, "memory_store", MemoryStoreStub())
    monkeypatch.setattr(agent_api, "run_invocation", fake_run_invocation)

    response = app_client.post(
        "/api/v1/agentapp/agent/team-run",
        json={
            "teamCode": "story-team",
            "userInput": "测试团队",
            "runId": run_id,
        },
    )

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["runId"] == run_id
    assert payload["assistantMessage"] == "团队完成"
    assert active_run_control.get(run_id) is None


def test_cancel_api_reports_finished_and_unknown_runs(app_client, monkeypatch):
    """已结束保持幂等；未知 ID 给出刷新、重试和停止边界。"""

    class RunStoreStub:
        def load_run(self, run_id: str):
            if run_id == "run_finished":
                return AgentRunRecord(run_id=run_id, success=True)
            if run_id == "run_cancelled":
                return AgentRunRecord(
                    run_id=run_id,
                    success=False,
                    error_message="运行已由用户停止",
                )
            return None

    monkeypatch.setattr(runs_api, "agent_run_store", RunStoreStub())

    finished = app_client.post(
        "/api/v1/agentapp/agent/runs/run_finished/cancel"
    )
    assert finished.status_code == 200
    assert finished.json()["data"]["status"] == "warning"
    assert finished.json()["data"]["state"] == "completed"

    cancelled = app_client.post(
        "/api/v1/agentapp/agent/runs/run_cancelled/cancel"
    )
    assert cancelled.status_code == 200
    assert cancelled.json()["data"]["state"] == "cancelled"

    missing = app_client.post(
        "/api/v1/agentapp/agent/runs/run_missing/cancel"
    )
    assert missing.status_code == 404
    message = missing.json()["message"]
    assert "刷新页面" in message
    assert "停止使用该 runId" in message
