"""会话消息身份工具：为新旧消息提供稳定 ID 与单调序号，支撑增量记忆游标。"""
from __future__ import annotations

import hashlib
import secrets
from datetime import datetime

from app.models.conversation import ConversationMessage, ConversationSession


def ensure_message_identity(session: ConversationSession) -> bool:
    """按现有顺序回填缺失/冲突的 sequence 和 messageId；有修改返回 True。"""
    changed = False
    last_sequence = 0
    for index, message in enumerate(session.messages, start=1):
        if message.sequence <= last_sequence:
            message.sequence = last_sequence + 1
            changed = True
        last_sequence = message.sequence
        if not message.message_id:
            raw = (
                f"{session.session_id}:{index}:{message.role}:"
                f"{message.timestamp.isoformat()}:{message.content}"
            )
            digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]
            message.message_id = f"msg_{digest}"
            changed = True
    return changed


def append_session_message(
    session: ConversationSession,
    *,
    role: str,
    content: str,
    timestamp: datetime,
    tool_name: str | None = None,
) -> ConversationMessage:
    """先规范旧消息，再追加一条带随机稳定 ID 和单调序号的新消息。"""
    ensure_message_identity(session)
    sequence = session.messages[-1].sequence + 1 if session.messages else 1
    message = ConversationMessage(
        role=role,
        content=content,
        timestamp=timestamp,
        tool_name=tool_name,
        message_id=f"msg_{secrets.token_hex(8)}",
        sequence=sequence,
    )
    session.messages.append(message)
    return message
