from __future__ import annotations

import asyncio
import logging
import secrets
from datetime import datetime, timezone
from typing import Optional

from app.dependencies import memory_store
from app.models.conversation import (
    AgentRunRequest,
    ConversationMessage,
    ConversationSession,
)
from app.runtime.prompt import compile
from app.runtime.runner import AgentRunResult, run_agent
from app.runtime.scope import build_scopes
from app.runtime.snapshot import load_snapshot

logger = logging.getLogger(__name__)


def _generate_session_id() -> str:
    return "ses_" + secrets.token_hex(8)


async def run_invocation(request: AgentRunRequest) -> AgentRunResult:
    scopes = build_scopes(request.employee_key, request.workflow_key)

    snapshot = load_snapshot(request.employee_key, scopes)
    if snapshot is None:
        return AgentRunResult(
            success=False,
            error_message=f"Employee not found: {request.employee_key}",
        )

    compiled_prompt = compile(snapshot, scopes, request.structured_schema_json)

    user_message = request.user_input
    if request.extra_context:
        user_message = f"{request.extra_context}\n\n{user_message}"

    if compiled_prompt.response_instruction:
        user_message = f"{user_message}\n\n{compiled_prompt.response_instruction}"

    existing_messages: Optional[list[dict]] = None
    existing_session: Optional[ConversationSession] = None

    if request.session_id:
        existing_session = memory_store.load_session(request.session_id)
        if existing_session is not None and existing_session.messages:
            existing_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in existing_session.messages
            ]

    extra_context = request.extra_context
    if request.approval_decision and request.session_id:
        # 审批决定必须以 JSON 键 __approval_decision 传给 RequireApprovalHandler；
        # 此前拼成自由文本会被 parse_extra_context() 当成非法 JSON 丢弃（审批永远无法通过），
        # 还会把已有的 __delegation_stack JSON 破坏掉。这里合并进 JSON dict 再序列化。
        import json as _json
        try:
            extra = _json.loads(extra_context) if extra_context else {}
            if not isinstance(extra, dict):
                extra = {}
        except (_json.JSONDecodeError, TypeError):
            extra = {}
        extra["__approval_decision"] = request.approval_decision
        extra_context = _json.dumps(extra, ensure_ascii=False)

    result = await run_agent(
        snapshot=snapshot,
        compiled_prompt=compiled_prompt,
        user_message=user_message,
        visible_tools=compiled_prompt.visible_tools,
        visible_mcp_servers=compiled_prompt.visible_mcp_servers,
        employee_key=request.employee_key,
        extra_context=extra_context,
        existing_messages=existing_messages,
    )

    now = datetime.now(timezone.utc)

    if existing_session is not None:
        session = existing_session
    else:
        session_id = request.session_id or _generate_session_id()
        session = ConversationSession(
            session_id=session_id,
            employee_key=request.employee_key,
            created_at=now,
        )

    session.messages.append(
        ConversationMessage(role="user", content=request.user_input, timestamp=now)
    )
    session.messages.append(
        ConversationMessage(
            role="assistant",
            content=result.assistant_message,
            timestamp=now,
        )
    )

    session.last_active_at = now
    memory_store.save_session(session)
    result.session_id = session.session_id

    # LangMem Background Formation: 后台提取长期记忆，不阻塞响应
    if result.success and len(session.messages) >= 4:
        try:
            from app.services.memory_extractor import extract_and_store
            all_msgs = [{"role": m.role, "content": m.content} for m in session.messages]
            asyncio.create_task(
                extract_and_store(all_msgs, request.employee_key, session.session_id)
            )
        except Exception:
            logger.debug("后台记忆提取启动失败", exc_info=True)

    return result
