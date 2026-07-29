"""DeepAgent 会话工作区：轻量索引、按需文件读取与 checkpoint 脱敏。"""
from __future__ import annotations

from app.api import sessions as sessions_api
from app.models.conversation import ConversationSession
from app.runtime.runner import DEEP_AGENT_CHECKPOINT_KEY
from app.services.deep_workspace import (
    build_workspace_view,
    session_payload_without_checkpoint,
)


def _session(checkpoint: object) -> ConversationSession:
    return ConversationSession(
        session_id="ses_workspace",
        employee_key="director",
        metadata={
            "teamName": "导演组",
            DEEP_AGENT_CHECKPOINT_KEY: checkpoint,
        },
    )


def _checkpoint() -> dict:
    return {
        "version": 1,
        "todos": [
            {"content": "整理素材", "status": "completed"},
            {"content": "输出分镜", "status": "in_progress"},
        ],
        "files": {
            "draft.md": "分镜草稿",
            "/outputs/large_tool_results/search-abc.txt": "完整检索结果",
        },
    }


def test_workspace_view_lists_progress_and_files_without_content():
    """工作区观察返回进度和文件索引，不把正文内联进列表。"""
    view = build_workspace_view(_session(_checkpoint()))
    payload = view.model_dump(by_alias=True)

    assert payload["status"] == "success"
    assert payload["summary"] == "待办 1/2 已完成，工作区共有 2 个文件。"
    assert payload["nextActions"] == ["输出分镜"]
    assert payload["artifacts"] == [
        "/outputs/large_tool_results/search-abc.txt",
        "draft.md",
    ]
    assert payload["files"] == [
        {
            "path": "/outputs/large_tool_results/search-abc.txt",
            "size": 6,
            "kind": "large_tool_result",
        },
        {"path": "draft.md", "size": 4, "kind": "workspace"},
    ]
    assert "完整检索结果" not in str(payload)


def test_unknown_checkpoint_returns_recovery_guidance():
    """未知版本不抛异常，返回明确原因、重试动作和停止边界。"""
    view = build_workspace_view(_session({"version": 99, "files": {"x": "y"}}))

    assert view.status == "warning"
    assert "无法识别" in view.summary
    assert len(view.next_actions) == 2
    assert view.files == []


def test_session_payload_keeps_metadata_but_removes_checkpoint_body():
    """会话响应只移除 checkpoint 正文，底层会话对象和其他 metadata 保持原样。"""
    session = _session(_checkpoint())

    payload = session_payload_without_checkpoint(session)

    assert payload["metadata"]["teamName"] == "导演组"
    assert DEEP_AGENT_CHECKPOINT_KEY not in payload["metadata"]
    assert payload["metadata"]["deepAgentWorkspace"] == {
        "checkpointVersion": 1,
        "todoCount": 2,
        "fileCount": 2,
    }
    assert session.metadata[DEEP_AGENT_CHECKPOINT_KEY]["files"]["draft.md"] == "分镜草稿"


def test_workspace_http_endpoints_read_file_on_demand(app_client, monkeypatch):
    """HTTP 先取索引、再按精确路径取正文；不存在时给可恢复错误。"""
    session = _session(_checkpoint())

    class MemoryStoreStub:
        def load_session(self, session_id):
            return session if session_id == session.session_id else None

    monkeypatch.setattr(sessions_api, "memory_store", MemoryStoreStub())

    workspace_response = app_client.get(
        f"/api/v1/agentapp/agent/sessions/{session.session_id}/workspace"
    )
    assert workspace_response.status_code == 200
    assert workspace_response.json()["data"]["files"][1]["path"] == "draft.md"

    file_response = app_client.get(
        f"/api/v1/agentapp/agent/sessions/{session.session_id}/workspace/file",
        params={"path": "draft.md"},
    )
    assert file_response.status_code == 200
    assert file_response.json()["data"] == {
        "status": "success",
        "summary": "已读取工作区文件 draft.md，共 4 个字符。",
        "nextActions": ["可复制内容，或回到会话让 DeepAgent 继续编辑这个文件。"],
        "artifacts": ["draft.md"],
        "path": "draft.md",
        "size": 4,
        "content": "分镜草稿",
    }

    missing_response = app_client.get(
        f"/api/v1/agentapp/agent/sessions/{session.session_id}/workspace/file",
        params={"path": "missing.md"},
    )
    assert missing_response.status_code == 404
    error = missing_response.json()
    assert error["code"] == 404
    assert "刷新工作区文件列表" in error["message"]
    assert "停止使用旧路径" in error["message"]
