"""项目问题修复运行记录与进程内并发控制。

默认以项目目录里的 JSON 保存最近运行，不依赖数据库或 Redis。单机单用户部署可直接
使用；未来多进程部署时可在保持 API 契约不变的前提下替换共享控制器。
"""
from __future__ import annotations

import json
import threading
import uuid
from pathlib import Path
from typing import Any


QUALITY_REPAIR_GUIDANCE = {
    "storyboard_fields_missing": "逐项补齐门禁指出的生产字段，不得用同义的抽象概括代替字段值。",
    "abstract_visual": "把抽象情绪或氛围改写为可见的身体动作、物体变化和空间关系。",
    "negative_language": "删除正向提示词里的“不要、避免、禁止、无”等负向表达，只保留希望出现的内容。",
    "visual_noise_risk": "减少裂纹、颗粒、碎石、尘埃等高频细节，确保主体和动作是第一视觉层级。",
    "unstable_motion": "把快速、剧烈或多重运动改为单一、缓慢、可稳定生成的连续动作。",
    "segment_too_long": "把连续生成段拆成多个不超过 6 秒的子段，每张卡只保留一个连续动作。",
}


def build_repair_instruction(
    issue: dict[str, Any],
    user_instruction: str = "",
) -> str:
    """把诊断问题转成范围明确、可按静态门禁验收的返工提示。"""
    stage = str(issue.get("stage") or "")
    episode = issue.get("episode")
    unit = issue.get("unit")
    scope = "当前聚合内容"
    if episode is not None:
        scope = f"EP{int(episode):02d}"
    if unit is not None:
        scope += f" / G{int(unit)}"

    problem_lines = [
        str(issue.get("message") or "").strip(),
        *[
            str(detail).strip()
            for detail in (issue.get("details") or [])
            if str(detail).strip()
        ],
    ]
    guidance = [
        QUALITY_REPAIR_GUIDANCE[code]
        for code in (issue.get("detailCodes") or [])
        if code in QUALITY_REPAIR_GUIDANCE
    ]
    acceptance = [
        str(item).strip()
        for item in (issue.get("acceptanceCriteria") or [])
        if str(item).strip()
    ]

    sections = [
        "这是一次问题驱动的定向返工。",
        f"返工范围：{scope} 的 {stage} 阶段。",
        "唯一目标：修复下面列出的诊断问题；不要扩写无关镜头，不要改动已经正确的剧情事实、"
        "角色设定、镜头编号、时间顺序和上下游引用。",
        "诊断问题：\n" + "\n".join(f"- {line}" for line in problem_lines if line),
    ]
    if guidance:
        sections.append("针对性修改要求：\n" + "\n".join(f"- {line}" for line in guidance))
    if acceptance:
        sections.append("输出前逐项自检：\n" + "\n".join(f"- {line}" for line in acceptance))
    sections.append("只输出当前阶段要求的最终结构化结果，不解释修改过程。")
    if user_instruction.strip():
        sections.append(f"用户补充要求：{user_instruction.strip()}")
    return "\n\n".join(sections)


class ProjectOptimizationControl:
    """同一项目一次只允许一个自动修复，避免重复覆盖同一生产槽位。"""

    def __init__(self) -> None:
        self._active: set[str] = set()
        self._lock = threading.Lock()

    def begin(self, project_id: str) -> bool:
        with self._lock:
            if project_id in self._active:
                return False
            self._active.add(project_id)
            return True

    def finish(self, project_id: str) -> None:
        with self._lock:
            self._active.discard(project_id)

    def is_active(self, project_id: str) -> bool:
        with self._lock:
            return project_id in self._active


optimization_control = ProjectOptimizationControl()


def _history_path(project_dir: Path) -> Path:
    return project_dir / "optimization-runs.json"


def list_optimization_runs(project_dir: Path, limit: int = 30) -> list[dict[str, Any]]:
    """读取最近的自动修复记录；文件不存在时返回空列表。"""
    path = _history_path(project_dir)
    if not path.exists():
        return []
    payload = json.loads(path.read_text("utf-8"))
    if not isinstance(payload, list):
        raise ValueError("optimization-runs.json 必须是 JSON 数组")
    safe_limit = max(1, min(limit, 100))
    return list(reversed(payload[-safe_limit:]))


def append_optimization_run(project_dir: Path, record: dict[str, Any]) -> None:
    """原子追加修复记录，并只保留最近 100 次运行。"""
    path = _history_path(project_dir)
    current = list(reversed(list_optimization_runs(project_dir, 100)))
    current.append(record)
    current = current[-100:]
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    try:
        temp_path.write_text(
            json.dumps(current, ensure_ascii=False, indent=2),
            "utf-8",
        )
        temp_path.replace(path)
    finally:
        temp_path.unlink(missing_ok=True)
