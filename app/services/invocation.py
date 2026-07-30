"""Agent 调用编排层。

把一次「员工对话请求」跑完整条链路：编译提示词 → 载入历史会话 →
执行 agent 循环 → 落库会话/运行记录/指标 → 后台异步提取长期记忆。
是用户端 /run、工作流节点、委派调用共用的统一入口。
"""
from __future__ import annotations

import asyncio
import logging
import secrets
import time
from datetime import datetime, timezone
from typing import Awaitable, Callable, Optional

from app.dependencies import agent_run_store, memory_store
from app.models.conversation import (
    AgentRunRequest,
    ConversationArtifact,
    ConversationMessage,
    ConversationSession,
)
from app.core.metrics import record_run_metrics
from app.core.rate_limit import record_token_usage
from app.models.run_record import AgentRunRecord, generate_run_id
from app.services.run_store import estimate_cost
from app.runtime.prompt import compile
from app.runtime.runner import (
    DEEP_AGENT_CHECKPOINT_KEY,
    AgentRunResult,
    run_agent,
)
from app.runtime.scope import build_scopes
from app.runtime.snapshot import load_snapshot

logger = logging.getLogger(__name__)

TextDeltaCallback = Callable[[str, str], Awaitable[None]]
_HISTORY_MAX_MESSAGES = 24
_HISTORY_MAX_CHARS = 32_000


def _bounded_history(session: ConversationSession) -> list[dict]:
    """按消息数和字符数裁剪历史，保留最近上下文并避免长会话无限膨胀。"""
    selected: list[dict] = []
    used_chars = 0
    for message in reversed(session.messages):
        content = message.content or ""
        if not selected and len(content) > _HISTORY_MAX_CHARS:
            content = "【较长消息已截取末尾】\n" + content[-_HISTORY_MAX_CHARS:]
        elif (
            len(selected) >= _HISTORY_MAX_MESSAGES
            or used_chars + len(content) > _HISTORY_MAX_CHARS
        ):
            break
        selected.append({"role": message.role, "content": content})
        used_chars += len(content)
    selected.reverse()
    if session.compressed_summary and len(selected) < len(session.messages):
        selected.insert(0, {
            "role": "system",
            "content": f"较早会话摘要：\n{session.compressed_summary[:6000]}",
        })
    return selected


def _generate_session_id() -> str:
    """生成会话 ID，形如 ses_xxxx（16 位十六进制随机串）。"""
    return "ses_" + secrets.token_hex(8)


def _generate_artifact_id() -> str:
    """生成产出物 ID，形如 art_xxxx（12 位十六进制随机串）。"""
    return "art_" + secrets.token_hex(6)


def _session_title(text: str) -> str:
    """用用户首条输入生成会话标题：压缩连续空白后截断到 36 字，超长补省略号。"""
    title = " ".join(text.strip().split())
    if not title:
        return "新会话"
    return title[:36] + ("..." if len(title) > 36 else "")


def _maybe_add_artifact(session: ConversationSession, content: str) -> None:
    """把足够"重"的助手回复沉淀为一条 artifact（可在前端单独查看的产出物）。

    仅当回复较长（≥400 字）或含代码块 / Markdown 标题等结构化内容时才提取；
    并按来源消息下标去重，同一条回复只会沉淀一次。
    """
    text = content.strip()
    # 短且无结构的普通闲聊不值得单独存成产出物
    if len(text) < 400 and "```" not in text and "# " not in text and "## " not in text:
        return
    idx = len(session.messages) - 1
    if any(a.source_message_index == idx for a in session.artifacts):
        return
    session.artifacts.append(ConversationArtifact(
        artifact_id=_generate_artifact_id(),
        title=f"回复产出 {len(session.artifacts) + 1}",
        kind="markdown" if ("```" in text or "#" in text) else "document",
        content=text,
        source_message_index=idx,
    ))


async def run_invocation(
    request: AgentRunRequest,
    *,
    on_text_delta: TextDeltaCallback | None = None,
) -> AgentRunResult:
    """执行一次完整的 agent 调用，并把过程与结果持久化。

    流程：
      1. 按员工 + 工作流构建可见范围(scopes)、加载员工快照；员工不存在直接返回失败。
      2. 编译系统提示词，拼接额外上下文与结构化输出指令。
      3. 若带 session_id 则载入历史消息与 DeepAgent checkpoint，恢复多轮上下文。
      4. 审批场景：把 approval_decision 合并进 __approval_decision JSON 再传给 agent。
      5. 跑 agent 循环并记录耗时。
      6. 追加 user / assistant 两条消息、按需沉淀 artifact，保存会话。
      7. 落库运行记录 + Prometheus 指标 + token 配额累加（失败绝不影响主流程）。
      8. 满足条件时后台异步提取长期记忆，不阻塞本次返回。

    返回 AgentRunResult，其中 session_id 会被回填为本次实际使用的会话 ID。
    """
    total_started_at = time.monotonic()
    run_id = request.run_id or generate_run_id()
    request.run_id = run_id

    # 1. 构建可见范围并加载员工快照（快照 = 该员工当前生效的模型/工具/记忆等只读切片）
    scopes = build_scopes(request.employee_key, request.workflow_key)

    snapshot = load_snapshot(request.employee_key, scopes)
    if snapshot is None:
        return AgentRunResult(
            run_id=run_id,
            success=False,
            error_message=f"Employee not found: {request.employee_key}",
        )

    # 2. 编译系统提示词
    # 知识库 RAG：async 上下文预检索（向量优先兜底关键词），传给同步的 compile
    kb_snippets = None
    if snapshot.has_knowledge_base and request.user_input:
        from app.services.vector_store import retrieve_knowledge
        kb_snippets = await retrieve_knowledge(
            request.employee_key, request.user_input, top_k=5
        )

    compiled_prompt = compile(
        snapshot, scopes, request.structured_schema_json,
        user_query=request.user_input,
        kb_snippets=kb_snippets,
    )

    user_message_parts = [
        value.strip()
        for value in (
            request.transient_context,
            request.extra_context,
            request.user_input,
        )
        if value and value.strip()
    ]
    user_message = "\n\n".join(user_message_parts)

    if compiled_prompt.response_instruction:
        user_message = f"{user_message}\n\n{compiled_prompt.response_instruction}"

    # 3. 载入历史会话（若指定了 session_id），把过往消息喂给 agent 作多轮上下文
    existing_messages: Optional[list[dict]] = None
    existing_session: Optional[ConversationSession] = None
    existing_deep_state_checkpoint: Optional[dict] = None

    if request.session_id:
        existing_session = memory_store.load_session(request.session_id)
        if existing_session is not None:
            if existing_session.messages:
                existing_messages = _bounded_history(existing_session)
            checkpoint = existing_session.metadata.get(DEEP_AGENT_CHECKPOINT_KEY)
            if isinstance(checkpoint, dict):
                existing_deep_state_checkpoint = checkpoint

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

    # 5. 执行 agent 循环（工具调用 / 多轮自动推进都在 run_agent 内部完成）
    preflight_ms = int((time.monotonic() - total_started_at) * 1000)
    streamed_first_token_ms: int | None = None

    async def measured_text_delta(delta: str, text: str) -> None:
        """把首字时间按用户请求起点计量，再转交展示层。"""
        nonlocal streamed_first_token_ms
        if streamed_first_token_ms is None:
            streamed_first_token_ms = int(
                (time.monotonic() - total_started_at) * 1000
            )
        if on_text_delta is not None:
            await on_text_delta(delta, text)

    result = await run_agent(
        snapshot=snapshot,
        compiled_prompt=compiled_prompt,
        user_message=user_message,
        visible_tools=compiled_prompt.visible_tools,
        visible_mcp_servers=compiled_prompt.visible_mcp_servers,
        employee_key=request.employee_key,
        extra_context=extra_context,
        existing_messages=existing_messages,
        existing_deep_state_checkpoint=existing_deep_state_checkpoint,
        run_id=run_id,
        on_text_delta=measured_text_delta if on_text_delta is not None else None,
    )
    if streamed_first_token_ms is not None:
        result.first_token_ms = streamed_first_token_ms
    elif result.first_token_ms is not None:
        result.first_token_ms += preflight_ms
    elapsed_ms = int((time.monotonic() - total_started_at) * 1000)

    # 6. 组织会话：复用旧会话或新建，追加本轮 user / assistant 消息
    now = datetime.now(timezone.utc)

    if existing_session is not None:
        session = existing_session
    else:
        session_id = request.session_id or _generate_session_id()
        session = ConversationSession(
            session_id=session_id,
            employee_key=request.employee_key,
            created_at=now,
            title=_session_title(request.user_input),
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
    if not session.title:
        session.title = _session_title(request.user_input)
    if result.deep_state_checkpoint is not None:
        session.metadata[DEEP_AGENT_CHECKPOINT_KEY] = result.deep_state_checkpoint
    _maybe_add_artifact(session, result.assistant_message)
    memory_store.save_session(session)
    result.session_id = session.session_id

    # 运行落库 + 指标：把这次 run 的 trace/token/成本落成可查记录并累加 Prometheus 指标
    # （失败绝不影响主流程）
    try:
        pt = result.token_usage.prompt_tokens if result.token_usage else 0
        ct = result.token_usage.completion_tokens if result.token_usage else 0
        requested_model_id = (snapshot.default_model_policy or {}).get("model_id", "")
        model_id = result.resolved_model or requested_model_id
        cost = estimate_cost(model_id, pt, ct)
        agent_run_store.save_run(AgentRunRecord(
            run_id=run_id,
            session_id=session.session_id,
            employee_key=request.employee_key,
            workflow_key=request.workflow_key,
            model=model_id,
            success=result.success,
            iterations=result.auto_invoke_count,
            prompt_tokens=pt,
            completion_tokens=ct,
            total_tokens=pt + ct,
            cost_usd=cost,
            elapsed_ms=elapsed_ms,
            error_message=result.error_message,
            pending_approval=result.pending_approval is not None,
            traces=result.traces,
            created_at=now,
        ))
        record_run_metrics(request.employee_key, result.success, pt, ct, cost)
        record_token_usage(request.employee_key, pt + ct)
        logger.info(
            "Agent latency run=%s employee=%s requested_model=%s resolved_model=%s "
            "preflight_ms=%d llm_ms=%d first_token_ms=%s model_calls=%d retries=%d total_ms=%d",
            run_id,
            request.employee_key,
            requested_model_id,
            model_id,
            preflight_ms,
            result.llm_elapsed_ms,
            result.first_token_ms,
            result.model_call_count,
            result.retry_count,
            elapsed_ms,
        )
    except Exception:
        logger.warning("运行记录落库/指标失败（不影响主流程）", exc_info=True)

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
