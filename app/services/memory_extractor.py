"""
后台记忆提取器。

对应 LangMem 的 "Subconscious Formation (Background)" 模式：
对话结束后，用 LLM 从聊天历史中提取三层记忆（语义/经验/行为），
不阻塞用户对话，不增加交互延迟。
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
from typing import Optional

from app.models.memory_types import (
    EpisodicMemory,
    MemoryExtractionResult,
    ProceduralMemory,
    SemanticMemory,
)

logger = logging.getLogger(__name__)

_session_locks: dict[str, asyncio.Lock] = {}


class MemoryExtractionRetryableError(RuntimeError):
    """LLM/解析暂时失败；调用方不得推进消息游标。"""

_EXTRACTION_PROMPT = """\
你是一个记忆提取专家。分析以下对话历史，提取三类长期记忆。

## 语义记忆（semantic）
从对话中提取的事实、用户偏好、知识点。每条包含：
- content: 记忆内容（简洁的陈述句）
- category: preference（偏好）| fact（事实）| knowledge（知识）| context（上下文）
- importance: 0~1 重要程度

## 经验记忆（episodic）
成功的交互模式，可复用的经验。每条包含：
- observation: 用户的需求/场景描述
- action: 采取的策略/方法
- result: 效果/结果
- success_score: 0~1 成功程度

## 行为记忆（procedural）
应该习得的行为规则，用于改善未来回复。每条包含：
- rule: 行为规则（祈使句）
- rationale: 为什么学到这条规则
- confidence: 0~1 置信度

要求：
1. 只提取用户明确表达、且有长期复用价值的信息，不要记录琐碎细节
2. 助手自己生成的项目设定、推断、文章内容和制作结果不得写入语义记忆
3. 经验记忆必须有用户明确认可或可观察的成功证据，否则返回空数组
4. 行为记忆只来自用户对系统行为的明确纠正，不从助手自己的总结推导规则
5. 项目正典、制作卡片全文和一次性任务参数不得进入长期记忆
6. 如果对话太短、没有明确证据或存在不确定性，宁可返回空数组
7. 每类最多提取 5 条

返回严格的 JSON，格式：
{
  "semantic": [{"content": "...", "category": "...", "importance": 0.8}],
  "episodic": [{"observation": "...", "action": "...", "result": "...", "success_score": 0.9}],
  "procedural": [{"rule": "...", "rationale": "...", "confidence": 0.7}]
}
"""


def _build_conversation_text(messages: list[dict]) -> str:
    """把消息列表拼成喂给 LLM 的对话文本：跳过 system 与空消息，标注用户/助手，单条截断 2000 字。"""
    lines = []
    for msg in messages:
        role = msg.get("role", "unknown")
        content = msg.get("content", "")
        if role == "system":
            continue
        if not content.strip():
            continue
        label = "用户" if role == "user" else "助手"
        lines.append(f"[{label}]: {content[:2000]}")
    return "\n\n".join(lines)


async def extract_memories(
    messages: list[dict],
    employee_key: str,
    session_id: str,
) -> Optional[MemoryExtractionResult]:
    """用 LLM 从对话历史中提取三层记忆（语义/经验/行为），无有效产出返回 None。

    流程：拼对话文本 → 太短(<50 字)直接跳过 → 取默认 LLM 客户端 → 按固定提示词抽取 →
    从返回中截取 JSON 并清洗 LaTeX 残留 → 各类最多取 5 条、数值裁剪到 [0,1]。
    无价值对话返回 None；LLM 或解析失败抛出可重试异常，由后台入口吞掉且不推进游标。
    """
    from app.dependencies import ai_service

    conversation_text = _build_conversation_text(messages)
    if len(conversation_text) < 50:
        logger.debug("对话太短，跳过记忆提取: %s", session_id)
        return None

    try:
        client, model = ai_service.get_default_client()
    except Exception as exc:
        logger.warning("无法获取 AI 客户端进行记忆提取: %s", exc)
        raise MemoryExtractionRetryableError("AI client unavailable") from exc

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": _EXTRACTION_PROMPT},
                {"role": "user", "content": f"以下是对话历史：\n\n{conversation_text}"},
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        raw = resp.choices[0].message.content or ""
    except Exception as exc:
        logger.warning("记忆提取 LLM 调用失败: %s", exc)
        raise MemoryExtractionRetryableError("memory extraction call failed") from exc

    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start < 0 or end <= start:
            logger.warning("记忆提取返回非 JSON: %s", raw[:200])
            raise MemoryExtractionRetryableError("memory extraction returned non-JSON")
        # 在 json.loads 前清洗：模型常把箭头写成 $\rightarrow$，其中 \r/\t 会被 JSON
        # 解析成控制字符（CR/TAB）造成乱码。趁反斜杠还在，先还原成 unicode 符号。
        from app.utils import strip_latex_artifacts
        data = json.loads(strip_latex_artifacts(raw[start:end]))
    except json.JSONDecodeError as exc:
        logger.warning("记忆提取 JSON 解析失败: %s", exc)
        raise MemoryExtractionRetryableError("memory extraction JSON invalid") from exc

    result = MemoryExtractionResult(session_id=session_id)

    for item in data.get("semantic", [])[:5]:
        if not isinstance(item, dict) or not item.get("content"):
            continue
        result.semantic.append(SemanticMemory(
            employee_key=employee_key,
            content=item["content"],
            category=item.get("category", "fact"),
            importance=min(1.0, max(0.0, float(item.get("importance", 0.5)))),
            source_session=session_id,
        ))

    for item in data.get("episodic", [])[:5]:
        if not isinstance(item, dict) or not item.get("observation"):
            continue
        result.episodic.append(EpisodicMemory(
            employee_key=employee_key,
            observation=item["observation"],
            action=item.get("action", ""),
            result=item.get("result", ""),
            success_score=min(1.0, max(0.0, float(item.get("success_score", 0.5)))),
            source_session=session_id,
        ))

    for item in data.get("procedural", [])[:5]:
        if not isinstance(item, dict) or not item.get("rule"):
            continue
        result.procedural.append(ProceduralMemory(
            employee_key=employee_key,
            rule=item["rule"],
            rationale=item.get("rationale", ""),
            confidence=min(1.0, max(0.0, float(item.get("confidence", 0.5)))),
            source_session=session_id,
        ))

    total = len(result.semantic) + len(result.episodic) + len(result.procedural)
    logger.info(
        "记忆提取完成: session=%s, 语义=%d 经验=%d 行为=%d",
        session_id, len(result.semantic), len(result.episodic), len(result.procedural),
    )
    return result if total > 0 else None


async def extract_and_store(
    messages: list[dict],
    employee_key: str,
    session_id: str,
    *,
    idempotency_key: str | None = None,
) -> None:
    """提取并存储记忆；传入事件幂等键时为每条候选生成稳定 memoryId。"""
    from app.dependencies import long_term_memory

    result = await extract_memories(messages, employee_key, session_id)
    if result is None:
        return

    from app.utils import strip_latex_artifacts as _clean

    for index, m in enumerate(result.semantic):
        if idempotency_key:
            m.memory_id = _stable_memory_id(idempotency_key, "semantic", index)
        m.content = _clean(m.content)
        long_term_memory.add_semantic(employee_key, m)

    for index, m in enumerate(result.episodic):
        if idempotency_key:
            m.memory_id = _stable_memory_id(idempotency_key, "episodic", index)
        m.observation = _clean(m.observation)
        m.action = _clean(m.action)
        m.result = _clean(m.result)
        long_term_memory.add_episodic(employee_key, m)

    for index, m in enumerate(result.procedural):
        if idempotency_key:
            m.memory_id = _stable_memory_id(idempotency_key, "procedural", index)
        m.rule = _clean(m.rule)
        m.rationale = _clean(m.rationale)
        long_term_memory.add_procedural(employee_key, m)


def _stable_memory_id(event_key: str, kind: str, index: int) -> str:
    """把提取消息范围映射为稳定 ID，使“记忆已写、游标未写”的重试不重复。"""
    digest = hashlib.sha256(f"{event_key}:{kind}:{index}".encode("utf-8")).hexdigest()
    return f"mem_{digest[:12]}"


async def extract_session_delta(employee_key: str, session_id: str) -> bool:
    """只提取会话中尚未处理的消息；成功推进单调游标，失败留给下次重试。

    进程内锁避免同实例重复调用。跨进程 CAS/文件锁已列入知识体系蓝图，当前实现不把
    进程内锁宣称为分布式正确性保证。
    """
    from app.dependencies import memory_store
    from app.services.session_messages import ensure_message_identity

    lock = _session_locks.setdefault(session_id, asyncio.Lock())
    async with lock:
        session = memory_store.load_session(session_id)
        if session is None or session.employee_key != employee_key:
            return False

        identity_changed = ensure_message_identity(session)
        try:
            cursor = max(0, int(session.metadata.get("lastMemorySequence", 0)))
        except (TypeError, ValueError):
            cursor = 0
        pending = [message for message in session.messages if message.sequence > cursor]
        if not pending:
            if identity_changed:
                memory_store.save_session(session)
            return False

        start_sequence = pending[0].sequence
        end_sequence = pending[-1].sequence
        event_key = f"{session_id}:{start_sequence}:{end_sequence}:v1"
        payload = [{"role": item.role, "content": item.content} for item in pending]

        try:
            await extract_and_store(
                payload,
                employee_key,
                session_id,
                idempotency_key=event_key,
            )
        except MemoryExtractionRetryableError:
            logger.warning("增量记忆提取失败，保留游标等待重试: %s", session_id)
            return False
        except Exception:
            logger.warning("增量记忆写入失败，保留游标等待重试: %s", session_id, exc_info=True)
            return False

        # 提取期间可能又追加了消息，重新加载后只推进到本次范围终点。
        latest = memory_store.load_session(session_id) or session
        ensure_message_identity(latest)
        try:
            latest_cursor = int(latest.metadata.get("lastMemorySequence", 0))
        except (TypeError, ValueError):
            latest_cursor = 0
        latest.metadata["lastMemorySequence"] = max(latest_cursor, end_sequence)
        memory_store.save_session(latest)
        return True
