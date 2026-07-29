"""DeepAgent 会话 checkpoint：状态提取、运行器恢复与会话持久化。"""
from __future__ import annotations

import json
from contextlib import asynccontextmanager

import pytest

import app.runtime.runner as runner_module
import app.services.invocation as invocation_module
from app.models.conversation import (
    AgentRunRequest,
    ConversationSession,
    PendingApprovalDetail,
)
from app.models.runtime import (
    EmployeeRuntimeSnapshot,
    PromptCompileResult,
    RuntimeTool,
)
from app.runtime.loop import AgentLoopResult
from app.runtime.runner import (
    DEEP_AGENT_CHECKPOINT_KEY,
    AgentRunResult,
    run_agent,
)
from app.tools.deep import DeepAgentState


def test_deep_state_checkpoint_round_trip_omits_approval():
    """checkpoint 只保留公开工作状态，并规整待办与文件顺序。"""
    state = DeepAgentState(
        todos=[
            {"content": "列大纲", "status": "IN PROGRESS"},
            {"content": "写正文", "status": "unknown"},
        ],
        files={"z.md": "结尾", "a.md": "开头"},
        pending_approval=PendingApprovalDetail(
            description="运行危险命令",
            action_type="shell",
        ),
    )

    checkpoint = state.to_checkpoint()
    restored = DeepAgentState.from_checkpoint(checkpoint)

    assert checkpoint == {
        "version": 1,
        "todos": [
            {"content": "列大纲", "status": "in_progress"},
            {"content": "写正文", "status": "pending"},
        ],
        "files": {"a.md": "开头", "z.md": "结尾"},
    }
    assert restored.todos == checkpoint["todos"]
    assert restored.files == checkpoint["files"]
    assert restored.pending_approval is None


def test_deep_state_checkpoint_rejects_unknown_or_malformed_data():
    """会话 metadata 可人工编辑，坏版本与坏字段必须安全降级。"""
    assert DeepAgentState.from_checkpoint({"version": 2}).to_checkpoint() == {
        "version": 1,
        "todos": [],
        "files": {},
    }

    restored = DeepAgentState.from_checkpoint({
        "version": 1,
        "todos": ["bad", {"content": "保留", "status": 9}],
        "files": {"ok.md": "正文", "bad.md": {"nested": True}, 7: "bad"},
    })

    assert restored.todos == [{"content": "保留", "status": "pending"}]
    assert restored.files == {"ok.md": "正文"}


@pytest.mark.asyncio
async def test_runner_restores_and_returns_deep_checkpoint(monkeypatch):
    """运行器把恢复状态注入真实工具 handler，并返回本轮更新后的 checkpoint。"""
    observed: dict = {}

    async def fake_run_agent_loop(*, tools, options, **_kwargs):
        handlers = {tool.name: tool for tool in tools}
        observed["read"] = json.loads(await handlers["read_file"].handler(
            json.dumps({"path": "draft.md"})
        ))
        observed["large_result"] = "工具结果-" * 400
        observed["compacted"] = options.tool_result_transform(
            "mcp__search",
            observed["large_result"],
        )
        await handlers["write_todos"].handler(json.dumps({
            "todos": [{"content": "继续润色", "status": "completed"}],
        }, ensure_ascii=False))
        await handlers["write_file"].handler(json.dumps({
            "path": "final.md",
            "content": "完成稿",
        }, ensure_ascii=False))
        return AgentLoopResult(final_text="已完成", success=True, iterations=1)

    @asynccontextmanager
    async def no_mcp(_servers):
        yield []

    monkeypatch.setattr(
        runner_module.ai_service,
        "get_client",
        lambda *_args, **_kwargs: (object(), "gpt-4o"),
    )
    monkeypatch.setattr(runner_module, "run_agent_loop", fake_run_agent_loop)
    monkeypatch.setattr(runner_module, "mcp_tool_handlers", no_mcp)

    result = await run_agent(
        snapshot=EmployeeRuntimeSnapshot(
            employee_key="director",
            deep_agent=True,
            default_model_policy={"model_id": "gpt-4o"},
        ),
        compiled_prompt=PromptCompileResult(),
        user_message="继续",
        visible_tools=[
            RuntimeTool(tool_code="read_file"),
            RuntimeTool(tool_code="write_file"),
            RuntimeTool(tool_code="write_todos"),
        ],
        visible_mcp_servers=[],
        employee_key="director",
        existing_deep_state_checkpoint={
            "version": 1,
            "todos": [{"content": "初稿", "status": "in_progress"}],
            "files": {"draft.md": "上一轮草稿"},
        },
    )

    assert observed["read"]["content"] == "上一轮草稿"
    assert result.deep_state_checkpoint["version"] == 1
    assert result.deep_state_checkpoint["todos"] == [
        {"content": "继续润色", "status": "completed"},
    ]
    files = result.deep_state_checkpoint["files"]
    assert files["draft.md"] == "上一轮草稿"
    assert files["final.md"] == "完成稿"
    offload_paths = [
        path for path in files
        if path.startswith("/outputs/large_tool_results/mcp__search-")
    ]
    assert len(offload_paths) == 1
    assert files[offload_paths[0]] == observed["large_result"]
    assert f"Full output path: {offload_paths[0]}" in observed["compacted"]


@pytest.mark.asyncio
async def test_invocation_persists_checkpoint_in_existing_session_metadata(
    monkeypatch,
):
    """编排层从同一会话读取 checkpoint，并交给现有 JSON/DB 会话仓储保存。"""
    previous = {
        "version": 1,
        "todos": [{"content": "上一轮", "status": "completed"}],
        "files": {"draft.md": "旧稿"},
    }
    updated = {
        "version": 1,
        "todos": [{"content": "本轮", "status": "completed"}],
        "files": {"draft.md": "新稿"},
    }
    session = ConversationSession(
        session_id="ses_checkpoint",
        employee_key="director",
        metadata={DEEP_AGENT_CHECKPOINT_KEY: previous},
    )

    class MemoryStoreStub:
        saved: ConversationSession | None = None

        def load_session(self, _session_id):
            return session

        def save_session(self, value):
            self.saved = value

    class RunStoreStub:
        def save_run(self, _record):
            return None

    store = MemoryStoreStub()
    seen: dict = {}

    async def fake_run_agent(**kwargs):
        seen["checkpoint"] = kwargs["existing_deep_state_checkpoint"]
        return AgentRunResult(
            assistant_message="已恢复并继续",
            success=False,
            deep_state_checkpoint=updated,
        )

    monkeypatch.setattr(invocation_module, "memory_store", store)
    monkeypatch.setattr(invocation_module, "agent_run_store", RunStoreStub())
    monkeypatch.setattr(invocation_module, "build_scopes", lambda *_args: ["global"])
    monkeypatch.setattr(
        invocation_module,
        "load_snapshot",
        lambda *_args: EmployeeRuntimeSnapshot(
            employee_key="director",
            deep_agent=True,
        ),
    )
    monkeypatch.setattr(
        invocation_module,
        "compile",
        lambda *_args, **_kwargs: PromptCompileResult(),
    )
    monkeypatch.setattr(invocation_module, "run_agent", fake_run_agent)
    monkeypatch.setattr(
        invocation_module,
        "record_run_metrics",
        lambda *_args, **_kwargs: None,
    )
    monkeypatch.setattr(
        invocation_module,
        "record_token_usage",
        lambda *_args, **_kwargs: None,
    )

    result = await invocation_module.run_invocation(AgentRunRequest(
        employeeKey="director",
        userInput="继续上一轮",
        sessionId="ses_checkpoint",
    ))

    assert seen["checkpoint"] == previous
    assert store.saved is session
    assert store.saved.metadata[DEEP_AGENT_CHECKPOINT_KEY] == updated
    assert result.session_id == "ses_checkpoint"
