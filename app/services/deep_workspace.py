"""DeepAgent 会话工作区只读视图。

复用 Yuxi ``get_agent_state_view`` / ``extract_agent_state`` 的按需观察边界：
列表只返回 todos 与文件索引，文件正文通过路径单独读取。底层仍是现有会话
metadata，因此 JSON 与 PostgreSQL 仓储零差异。
"""
from __future__ import annotations

from app.models.conversation import (
    ConversationSession,
    DeepAgentWorkspaceFile,
    DeepAgentWorkspaceFileView,
    DeepAgentWorkspaceTodo,
    DeepAgentWorkspaceView,
)
from app.runtime.context_compaction import LARGE_TOOL_RESULTS_PREFIX
from app.runtime.runner import DEEP_AGENT_CHECKPOINT_KEY
from app.tools.deep import DeepAgentState

_CHECKPOINT_VERSION = 1


def _checkpoint_from_session(session: ConversationSession) -> object:
    """读取原始 checkpoint；metadata 可被人工编辑，故返回 object 交给下游校验。"""
    return (session.metadata or {}).get(DEEP_AGENT_CHECKPOINT_KEY)


def build_workspace_view(session: ConversationSession) -> DeepAgentWorkspaceView:
    """把会话 checkpoint 转成不含文件正文的稳定工作区观察。"""
    raw = _checkpoint_from_session(session)
    if raw is None:
        return DeepAgentWorkspaceView(
            summary="这个会话还没有 DeepAgent 工作区。",
            next_actions=["让 DeepAgent 创建待办或工作文件后再刷新。"],
        )

    if not isinstance(raw, dict) or raw.get("version") != _CHECKPOINT_VERSION:
        return DeepAgentWorkspaceView(
            status="warning",
            summary="工作区 checkpoint 格式无法识别，已安全忽略。",
            next_actions=[
                "继续发送一条消息，让 DeepAgent 生成新的工作区状态。",
                "若问题重复出现，再检查会话 JSON 的 deepAgentCheckpoint 字段。",
            ],
        )

    state = DeepAgentState.from_checkpoint(raw)
    todos = [
        DeepAgentWorkspaceTodo(
            content=str(item.get("content", "")),
            status=str(item.get("status", "pending")),
        )
        for item in state.todos
    ]
    files = [
        DeepAgentWorkspaceFile(
            path=path,
            size=len(content),
            kind=(
                "large_tool_result"
                if path.startswith(f"{LARGE_TOOL_RESULTS_PREFIX}/")
                else "workspace"
            ),
        )
        for path, content in sorted(state.files.items())
    ]
    completed = sum(todo.status == "completed" for todo in todos)
    pending = [todo.content for todo in todos if todo.status != "completed"]

    next_actions = pending[:3]
    if not next_actions and files:
        next_actions = ["打开工作区文件检查或复制结果。"]
    if not next_actions:
        next_actions = ["继续与 DeepAgent 对话以创建下一步工作。"]

    return DeepAgentWorkspaceView(
        summary=(
            f"待办 {completed}/{len(todos)} 已完成，"
            f"工作区共有 {len(files)} 个文件。"
        ),
        next_actions=next_actions,
        artifacts=[item.path for item in files],
        checkpoint_version=_CHECKPOINT_VERSION,
        todos=todos,
        files=files,
    )


def read_workspace_file(
    session: ConversationSession,
    path: str,
) -> DeepAgentWorkspaceFileView | None:
    """按精确虚拟路径读取文件；checkpoint/路径无效时返回 None。"""
    raw = _checkpoint_from_session(session)
    state = DeepAgentState.from_checkpoint(raw)
    content = state.files.get(path)
    if content is None:
        return None
    return DeepAgentWorkspaceFileView(
        summary=f"已读取工作区文件 {path}，共 {len(content)} 个字符。",
        next_actions=["可复制内容，或回到会话让 DeepAgent 继续编辑这个文件。"],
        artifacts=[path],
        path=path,
        size=len(content),
        content=content,
    )


def session_payload_without_checkpoint(session: ConversationSession) -> dict:
    """序列化会话但不内联大型 checkpoint，只保留轻量工作区摘要。"""
    data = session.model_dump(by_alias=True, mode="json")
    metadata = dict(data.get("metadata") or {})
    raw = metadata.pop(DEEP_AGENT_CHECKPOINT_KEY, None)
    if isinstance(raw, dict):
        state = DeepAgentState.from_checkpoint(raw)
        metadata["deepAgentWorkspace"] = {
            "checkpointVersion": raw.get("version"),
            "todoCount": len(state.todos),
            "fileCount": len(state.files),
        }
    data["metadata"] = metadata
    return data
