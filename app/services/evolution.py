"""
自我进化引擎 —— 审视对话历史，生成改进建议。

默认凌晨 4:00 运行，回顾最近 7 天的对话，用 LLM 分析交互模式
并生成四类改进建议：
- prompt_improve: 优化角色提示词
- new_rule: 新增行为规则（ProceduralMemory）
- skill_suggest: 推荐学习新技能
- tool_suggest: 推荐使用新工具
"""
from __future__ import annotations

import json
import logging
import secrets
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

from app.config import BASE_DIR
from app.models.evolution import EvolutionInsight, EvolutionRunLog

logger = logging.getLogger(__name__)

_LOOKBACK_DAYS = 7

_EVOLUTION_PROMPT = """\
你是一个 AI 员工自我进化分析引擎。分析该员工最近的对话记录，生成改进建议。

## 员工信息
- 名称: {emp_name}
- 角色: {role_profile}

## 最近对话摘要
{session_summaries}

## 当前行为记忆
{procedural_json}

请分析对话模式，生成改进建议。每条建议为以下四类之一：

1. **prompt_improve**: 提示词改进——发现角色设定中缺失或可优化的部分
   - title: 改进标题
   - content: 具体的提示词补充内容
   - rationale: 为什么要加这段
   - confidence: 0~1

2. **new_rule**: 新行为规则——从对话中归纳出应该固化的行为模式
   - title: 规则名称
   - content: 规则内容（祈使句）
   - rationale: 从哪些对话中归纳
   - confidence: 0~1

3. **skill_suggest**: 技能建议——推荐该员工应学习的新能力
   - title: 技能名称
   - content: 技能描述和学习方向
   - rationale: 为什么需要
   - confidence: 0~1

4. **tool_suggest**: 工具建议——推荐该员工应使用的新工具
   - title: 工具名称
   - content: 工具描述和使用场景
   - rationale: 为什么需要
   - confidence: 0~1

要求：
- 只提有实际价值的建议，不要泛泛而谈
- 不要重复已有的行为规则
- 置信度反映建议的证据充分程度
- 每类最多 3 条，总共不超过 8 条
- 返回严格 JSON 数组：[{{"type":"prompt_improve","title":"...","content":"...","rationale":"...","confidence":0.8}}]
- 如果对话质量不足以生成有意义的建议，返回空数组 []
"""


def _data_dir(emp_key: str) -> Path:
    d = BASE_DIR / "data" / "evolution" / emp_key
    d.mkdir(parents=True, exist_ok=True)
    return d


def _insights_path(emp_key: str) -> Path:
    return _data_dir(emp_key) / "insights.json"


def _run_logs_path(emp_key: str) -> Path:
    return _data_dir(emp_key) / "run_logs.json"


def _atomic_write(path: Path, text: str) -> None:
    import os
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + f".tmp{os.getpid()}")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


def _load_json_list(path: Path, model_cls):
    if not path.exists():
        return []
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
        return [model_cls.model_validate(d) for d in raw]
    except Exception:
        return []


def list_insights(emp_key: str) -> list[EvolutionInsight]:
    return _load_json_list(_insights_path(emp_key), EvolutionInsight)


def list_run_logs(emp_key: str) -> list[EvolutionRunLog]:
    return _load_json_list(_run_logs_path(emp_key), EvolutionRunLog)


def _save_insights(emp_key: str, items: list[EvolutionInsight]) -> None:
    data = [it.model_dump(by_alias=True, mode="json") for it in items]
    _atomic_write(_insights_path(emp_key), json.dumps(data, ensure_ascii=False, indent=2))


def _save_run_logs(emp_key: str, logs: list[EvolutionRunLog]) -> None:
    logs = logs[-50:]
    data = [lg.model_dump(by_alias=True, mode="json") for lg in logs]
    _atomic_write(_run_logs_path(emp_key), json.dumps(data, ensure_ascii=False, indent=2))


def _get_recent_sessions(emp_key: str, days: int) -> list[dict]:
    from app.dependencies import memory_store
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    sessions = []
    for s in memory_store.list_sessions(emp_key):
        if s.created_at and s.created_at >= cutoff and len(s.messages) >= 2:
            summary_lines = []
            for msg in s.messages[:10]:
                if msg.role == "system":
                    continue
                label = "用户" if msg.role == "user" else "助手"
                summary_lines.append(f"[{label}]: {(msg.content or '')[:200]}")
            sessions.append({
                "session_id": s.session_id,
                "created_at": s.created_at.isoformat() if s.created_at else "",
                "message_count": len(s.messages),
                "preview": "\n".join(summary_lines[:6]),
            })
    return sessions[-20:]


async def run_evolution_analysis(employee_key: str) -> EvolutionRunLog:
    from app.dependencies import ai_service, employee_registry, long_term_memory

    t0 = time.monotonic()
    run_log = EvolutionRunLog(
        log_id="evo_" + secrets.token_hex(6),
        employee_key=employee_key,
    )

    emp = employee_registry.get(employee_key)
    if emp is None:
        run_log.error = "员工不存在"
        run_log.duration_ms = int((time.monotonic() - t0) * 1000)
        logs = list_run_logs(employee_key)
        logs.append(run_log)
        _save_run_logs(employee_key, logs)
        return run_log

    sessions = _get_recent_sessions(employee_key, _LOOKBACK_DAYS)
    run_log.sessions_analyzed = len(sessions)

    if not sessions:
        run_log.duration_ms = int((time.monotonic() - t0) * 1000)
        logs = list_run_logs(employee_key)
        logs.append(run_log)
        _save_run_logs(employee_key, logs)
        return run_log

    procedural = long_term_memory.list_procedural(employee_key)
    proc_json = json.dumps(
        [{"rule": m.rule, "confidence": m.confidence} for m in procedural],
        ensure_ascii=False, indent=1,
    )

    session_text = "\n\n---\n\n".join(
        f"### 对话 {i+1}（{s['created_at'][:10]}，{s['message_count']} 条消息）\n{s['preview']}"
        for i, s in enumerate(sessions)
    )

    prompt = _EVOLUTION_PROMPT.format(
        emp_name=emp.name or employee_key,
        role_profile=(emp.role_profile or "")[:500],
        session_summaries=session_text,
        procedural_json=proc_json,
    )

    try:
        client, model = ai_service.get_default_client()
        run_log.llm_model = model
    except Exception as exc:
        run_log.error = f"无法获取 AI 客户端: {exc}"
        run_log.duration_ms = int((time.monotonic() - t0) * 1000)
        logs = list_run_logs(employee_key)
        logs.append(run_log)
        _save_run_logs(employee_key, logs)
        return run_log

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "你是自我进化分析引擎。只返回 JSON 数组。"},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=3000,
        )
        raw = resp.choices[0].message.content or "[]"
    except Exception as exc:
        run_log.error = f"LLM 调用失败: {exc}"
        run_log.duration_ms = int((time.monotonic() - t0) * 1000)
        logs = list_run_logs(employee_key)
        logs.append(run_log)
        _save_run_logs(employee_key, logs)
        return run_log

    try:
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start < 0 or end <= start:
            raise ValueError("无 JSON 数组")
        insights_raw = json.loads(raw[start:end])
    except Exception as exc:
        run_log.error = f"JSON 解析失败: {exc}"
        run_log.duration_ms = int((time.monotonic() - t0) * 1000)
        logs = list_run_logs(employee_key)
        logs.append(run_log)
        _save_run_logs(employee_key, logs)
        return run_log

    existing = list_insights(employee_key)
    for item in insights_raw[:8]:
        if not isinstance(item, dict) or not item.get("title"):
            continue
        insight = EvolutionInsight(
            insight_id="ins_" + secrets.token_hex(6),
            employee_key=employee_key,
            type=item.get("type", "prompt_improve"),
            title=item["title"],
            content=item.get("content", ""),
            rationale=item.get("rationale", ""),
            confidence=max(0.0, min(1.0, float(item.get("confidence", 0.5)))),
        )
        existing.append(insight)

    _save_insights(employee_key, existing)
    run_log.insights_generated = min(len(insights_raw), 8)
    run_log.duration_ms = int((time.monotonic() - t0) * 1000)

    logs = list_run_logs(employee_key)
    logs.append(run_log)
    _save_run_logs(employee_key, logs)

    logger.info(
        "自我进化分析完成: emp=%s, sessions=%d, insights=%d, %dms",
        employee_key, len(sessions), run_log.insights_generated, run_log.duration_ms,
    )
    return run_log


def accept_insight(employee_key: str, insight_id: str) -> bool:
    from app.dependencies import employee_registry, long_term_memory
    from app.models.memory_types import ProceduralMemory

    insights = list_insights(employee_key)
    target = None
    for ins in insights:
        if ins.insight_id == insight_id:
            target = ins
            break
    if target is None or target.status != "pending":
        return False

    target.status = "accepted"
    target.resolved_at = datetime.now(timezone.utc)

    if target.type == "prompt_improve":
        emp = employee_registry.get(employee_key)
        if emp:
            addition = f"\n\n<!-- evolution: {target.title} -->\n{target.content}\n<!-- /evolution -->"
            emp.role_profile = (emp.role_profile or "") + addition
            employee_registry.save(emp)

    elif target.type == "new_rule":
        mem = ProceduralMemory(
            employee_key=employee_key,
            rule=target.content,
            rationale=f"[自我进化] {target.rationale}",
            confidence=target.confidence,
        )
        long_term_memory.add_procedural(employee_key, mem)

    _save_insights(employee_key, insights)
    return True


def reject_insight(employee_key: str, insight_id: str) -> bool:
    insights = list_insights(employee_key)
    for ins in insights:
        if ins.insight_id == insight_id:
            if ins.status != "pending":
                return False
            ins.status = "rejected"
            ins.resolved_at = datetime.now(timezone.utc)
            _save_insights(employee_key, insights)
            return True
    return False
