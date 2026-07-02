"""
Deep Dream 记忆蒸馏 —— 模拟人类睡眠时的记忆整合。

定期（默认凌晨 3:00）对每个员工的长期记忆执行：
1. 合并重复/高度相似的记忆
2. 调整重要性（被多次引用的提升，长期未访问的降低）
3. 剪枝低价值记忆（importance < 0.15 且 access_count == 0）
"""
from __future__ import annotations

import json
import logging
import secrets
import time
from datetime import datetime, timezone
from pathlib import Path

from app.config import BASE_DIR
from app.models.distillation import DistillationAction, DistillationLog

logger = logging.getLogger(__name__)

_DISTILLATION_PROMPT = """\
你是一个记忆整合专家，负责在"夜间"对 AI 员工的长期记忆进行蒸馏——合并重复、调整权重、剪枝低价值。

当前员工拥有以下记忆：

## 语义记忆（semantic）
{semantic_json}

## 经验记忆（episodic）
{episodic_json}

## 行为记忆（procedural）
{procedural_json}

请分析上述记忆，输出以下操作（JSON 数组），每个操作为一个对象：

1. **merge**：合并两条高度相似的记忆
   - action: "merge"
   - memory_type: "semantic" | "episodic" | "procedural"
   - target_id: 被合并掉（将删除）的记忆 ID
   - merge_into_id: 保留的记忆 ID
   - new_content: 合并后的新内容（取两者精华）
   - reason: 合并理由

2. **adjust**：调整记忆的重要性/置信度
   - action: "adjust"
   - memory_type: "semantic" | "episodic" | "procedural"
   - target_id: 目标记忆 ID
   - new_importance: 新的重要性值（0~1）
   - reason: 调整理由

3. **prune**：删除低价值、过时或矛盾的记忆
   - action: "prune"
   - memory_type: "semantic" | "episodic" | "procedural"
   - target_id: 要删除的记忆 ID
   - reason: 删除理由

要求：
- 保守操作，宁少勿多。只在有明确理由时才操作
- 高重要性 / 高置信度的记忆不要轻易删除
- 相似度极高的才合并，不要过度概括
- 返回严格的 JSON 数组，格式：[{"action":"merge","memory_type":"semantic","target_id":"...","merge_into_id":"...","new_content":"...","reason":"..."},...]
- 如果记忆状态良好无需操作，返回空数组 []
"""


def _log_path(emp_key: str) -> Path:
    d = BASE_DIR / "data" / "memory" / emp_key
    d.mkdir(parents=True, exist_ok=True)
    return d / "distillation_logs.json"


def _load_logs(emp_key: str) -> list[DistillationLog]:
    fp = _log_path(emp_key)
    if not fp.exists():
        return []
    try:
        raw = json.loads(fp.read_text(encoding="utf-8"))
        return [DistillationLog.model_validate(d) for d in raw]
    except Exception:
        return []


def _save_logs(emp_key: str, logs: list[DistillationLog]) -> None:
    from app.services.long_term_memory import _atomic_write
    logs = logs[-50:]
    data = [lg.model_dump(by_alias=True, mode="json") for lg in logs]
    _atomic_write(_log_path(emp_key), json.dumps(data, ensure_ascii=False, indent=2))


def list_distillation_logs(emp_key: str) -> list[DistillationLog]:
    return _load_logs(emp_key)


async def run_distillation(employee_key: str) -> DistillationLog:
    from app.dependencies import ai_service, long_term_memory

    t0 = time.monotonic()
    log = DistillationLog(
        log_id="dist_" + secrets.token_hex(6),
        employee_key=employee_key,
    )

    semantic = long_term_memory.list_semantic(employee_key)
    episodic = long_term_memory.list_episodic(employee_key)
    procedural = long_term_memory.list_procedural(employee_key)

    log.before_counts = {
        "semantic": len(semantic),
        "episodic": len(episodic),
        "procedural": len(procedural),
    }

    total = len(semantic) + len(episodic) + len(procedural)
    if total == 0:
        log.after_counts = log.before_counts.copy()
        log.duration_ms = int((time.monotonic() - t0) * 1000)
        logs = _load_logs(employee_key)
        logs.append(log)
        _save_logs(employee_key, logs)
        return log

    def _dump(items, fields):
        return json.dumps(
            [{f: getattr(m, f, "") for f in fields} for m in items],
            ensure_ascii=False, indent=1,
        )

    # 用 replace 而非 format：模板里含字面 JSON 示例 {"action":...}，format 会把它当成
    # 格式字段名抛 KeyError。replace 对花括号免疫。
    prompt = (
        _DISTILLATION_PROMPT
        .replace("{semantic_json}", _dump(semantic, ["memory_id", "content", "category", "importance", "access_count"]))
        .replace("{episodic_json}", _dump(episodic, ["memory_id", "observation", "action", "result", "success_score", "access_count"]))
        .replace("{procedural_json}", _dump(procedural, ["memory_id", "rule", "rationale", "confidence", "activation_count"]))
    )

    try:
        client, model = ai_service.get_default_client()
        log.llm_model = model
    except Exception as exc:
        log.error = f"无法获取 AI 客户端: {exc}"
        log.duration_ms = int((time.monotonic() - t0) * 1000)
        logs = _load_logs(employee_key)
        logs.append(log)
        _save_logs(employee_key, logs)
        return log

    try:
        import asyncio
        resp = await asyncio.to_thread(
            lambda: client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "你是记忆蒸馏引擎。只返回 JSON 数组，不要解释。"},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=3000,
            )
        )
        raw = resp.choices[0].message.content or "[]"
    except Exception as exc:
        log.error = f"LLM 调用失败: {exc}"
        log.duration_ms = int((time.monotonic() - t0) * 1000)
        logs = _load_logs(employee_key)
        logs.append(log)
        _save_logs(employee_key, logs)
        return log

    try:
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start < 0 or end <= start:
            raise ValueError("无 JSON 数组")
        actions_raw = json.loads(raw[start:end])
    except Exception as exc:
        log.error = f"JSON 解析失败: {exc}"
        log.duration_ms = int((time.monotonic() - t0) * 1000)
        logs = _load_logs(employee_key)
        logs.append(log)
        _save_logs(employee_key, logs)
        return log

    sem_map = {m.memory_id: m for m in semantic}
    epi_map = {m.memory_id: m for m in episodic}
    proc_map = {m.memory_id: m for m in procedural}

    for a_raw in actions_raw:
        try:
            act = DistillationAction.model_validate(a_raw)
        except Exception:
            continue
        log.actions.append(act)

        if act.action == "prune":
            if act.memory_type == "semantic":
                long_term_memory.delete_semantic(employee_key, act.target_id)
            elif act.memory_type == "episodic":
                long_term_memory.delete_episodic(employee_key, act.target_id)
            elif act.memory_type == "procedural":
                long_term_memory.delete_procedural(employee_key, act.target_id)

        elif act.action == "merge" and act.merge_into_id:
            if act.memory_type == "semantic" and act.merge_into_id in sem_map:
                target = sem_map[act.merge_into_id]
                if act.new_content:
                    target.content = act.new_content
                target.updated_at = datetime.now(timezone.utc)
                long_term_memory.delete_semantic(employee_key, act.target_id)
                items = long_term_memory.list_semantic(employee_key)
                for it in items:
                    if it.memory_id == act.merge_into_id:
                        it.content = target.content
                        it.updated_at = target.updated_at
                        break
                long_term_memory._save_semantic(employee_key, items)

            elif act.memory_type == "procedural" and act.merge_into_id in proc_map:
                target = proc_map[act.merge_into_id]
                if act.new_content:
                    target.rule = act.new_content
                target.updated_at = datetime.now(timezone.utc)
                long_term_memory.delete_procedural(employee_key, act.target_id)
                items = long_term_memory.list_procedural(employee_key)
                for it in items:
                    if it.memory_id == act.merge_into_id:
                        it.rule = target.rule
                        it.updated_at = target.updated_at
                        break
                long_term_memory._save_procedural(employee_key, items)

        elif act.action == "adjust" and act.new_importance is not None:
            val = max(0.0, min(1.0, act.new_importance))
            if act.memory_type == "semantic":
                items = long_term_memory.list_semantic(employee_key)
                for it in items:
                    if it.memory_id == act.target_id:
                        it.importance = val
                        it.updated_at = datetime.now(timezone.utc)
                        break
                long_term_memory._save_semantic(employee_key, items)

            elif act.memory_type == "procedural":
                items = long_term_memory.list_procedural(employee_key)
                for it in items:
                    if it.memory_id == act.target_id:
                        it.confidence = val
                        it.updated_at = datetime.now(timezone.utc)
                        break
                long_term_memory._save_procedural(employee_key, items)

    log.after_counts = long_term_memory.get_stats(employee_key)
    log.duration_ms = int((time.monotonic() - t0) * 1000)

    logs = _load_logs(employee_key)
    logs.append(log)
    _save_logs(employee_key, logs)

    logger.info(
        "蒸馏完成: emp=%s, actions=%d, before=%s, after=%s, %dms",
        employee_key, len(log.actions), log.before_counts, log.after_counts, log.duration_ms,
    )
    return log
