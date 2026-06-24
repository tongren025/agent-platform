"""
后台记忆提取器。

对应 LangMem 的 "Subconscious Formation (Background)" 模式：
对话结束后，用 LLM 从聊天历史中提取三层记忆（语义/经验/行为），
不阻塞用户对话，不增加交互延迟。
"""
from __future__ import annotations

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
1. 只提取有长期复用价值的记忆，不要记录琐碎的对话细节
2. 语义记忆重点关注用户的偏好、习惯、背景信息
3. 经验记忆只记录明确成功或被用户认可的交互
4. 行为记忆关注"下次应该怎么做"而非"这次做了什么"
5. 如果对话太短或无有价值信息，返回空数组
6. 每类最多提取 5 条

返回严格的 JSON，格式：
{
  "semantic": [{"content": "...", "category": "...", "importance": 0.8}],
  "episodic": [{"observation": "...", "action": "...", "result": "...", "success_score": 0.9}],
  "procedural": [{"rule": "...", "rationale": "...", "confidence": 0.7}]
}
"""


def _build_conversation_text(messages: list[dict]) -> str:
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
    """用 LLM 从对话历史中提取三层记忆。"""
    from app.dependencies import ai_service

    conversation_text = _build_conversation_text(messages)
    if len(conversation_text) < 50:
        logger.debug("对话太短，跳过记忆提取: %s", session_id)
        return None

    try:
        client, model = ai_service.get_default_client()
    except Exception as exc:
        logger.warning("无法获取 AI 客户端进行记忆提取: %s", exc)
        return None

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
        return None

    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start < 0 or end <= start:
            logger.warning("记忆提取返回非 JSON: %s", raw[:200])
            return None
        data = json.loads(raw[start:end])
    except json.JSONDecodeError as exc:
        logger.warning("记忆提取 JSON 解析失败: %s", exc)
        return None

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
) -> None:
    """提取记忆并存入长期记忆库（后台任务入口）。"""
    from app.dependencies import long_term_memory

    result = await extract_memories(messages, employee_key, session_id)
    if result is None:
        return

    for m in result.semantic:
        long_term_memory.add_semantic(employee_key, m)

    for m in result.episodic:
        long_term_memory.add_episodic(employee_key, m)

    for m in result.procedural:
        long_term_memory.add_procedural(employee_key, m)
