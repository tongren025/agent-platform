"""Skill 运行时依赖解析。

移植 Yuxi SkillsMiddleware 的依赖闭包思路，解析员工已绑定 Skill 所需的子 Skill、
本地工具与 MCP 服务。这里只生成确定性的运行时绑定，不改写注册表配置。
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field

from app.models.registry import SkillDefinition

logger = logging.getLogger(__name__)


def _normalize_codes(values: list[str] | None) -> list[str]:
    """规整 code 列表并保持原顺序去重。"""
    result: list[str] = []
    seen: set[str] = set()
    for value in values or []:
        if not isinstance(value, str):
            continue
        code = value.strip()
        if code and code not in seen:
            result.append(code)
            seen.add(code)
    return result


@dataclass
class ResolvedSkillBindings:
    """员工 Skill 绑定展开结果。"""

    skill_codes: list[str] = field(default_factory=list)
    tool_codes: list[str] = field(default_factory=list)
    mcp_server_codes: list[str] = field(default_factory=list)
    missing_skill_codes: list[str] = field(default_factory=list)
    dependency_cycles: list[list[str]] = field(default_factory=list)


def resolve_skill_bindings(
    root_skill_codes: list[str] | None,
    available_skills: dict[str, SkillDefinition],
) -> ResolvedSkillBindings:
    """按 DFS 展开 Skill 依赖闭包，并汇总闭包内的工具与 MCP 依赖。

    根 Skill 与依赖均按配置顺序输出；缺失依赖和循环只记录并跳过对应边，
    不影响其余可用 Skill。这与 Yuxi 的 fail-soft 行为一致。
    """
    result = ResolvedSkillBindings()
    seen_skills: set[str] = set()
    missing_seen: set[str] = set()
    cycle_seen: set[tuple[str, ...]] = set()

    def visit(code: str, path: list[str]) -> None:
        if code in path:
            cycle_start = path.index(code)
            cycle = [*path[cycle_start:], code]
            cycle_key = tuple(cycle)
            if cycle_key not in cycle_seen:
                result.dependency_cycles.append(cycle)
                cycle_seen.add(cycle_key)
                logger.warning("Skill 依赖存在循环，已跳过: %s", " -> ".join(cycle))
            return
        if code in seen_skills:
            return

        skill = available_skills.get(code)
        if skill is None:
            if code not in missing_seen:
                result.missing_skill_codes.append(code)
                missing_seen.add(code)
                logger.warning("Skill 依赖不存在，已跳过: %s", code)
            return

        seen_skills.add(code)
        result.skill_codes.append(code)
        next_path = [*path, code]
        for dependency in _normalize_codes(skill.skill_dependencies):
            visit(dependency, next_path)

    for root_code in _normalize_codes(root_skill_codes):
        visit(root_code, [])

    seen_tools: set[str] = set()
    seen_mcps: set[str] = set()
    for skill_code in result.skill_codes:
        skill = available_skills[skill_code]
        for tool_code in _normalize_codes(skill.tool_dependencies):
            if tool_code not in seen_tools:
                result.tool_codes.append(tool_code)
                seen_tools.add(tool_code)
        for server_code in _normalize_codes(skill.mcp_dependencies):
            if server_code not in seen_mcps:
                result.mcp_server_codes.append(server_code)
                seen_mcps.add(server_code)

    return result
