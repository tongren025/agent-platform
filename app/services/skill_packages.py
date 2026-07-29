"""SKILL.md 技能包读取器。

沿用 Yuxi Skills Service 的 frontmatter 校验与“摘要先行、正文按需读取”格式，
只提供安全的只读发现能力；JSON 注册表仍是可编辑配置层。
"""
from __future__ import annotations

import hashlib
import logging
import re
from pathlib import Path
from typing import Any

import yaml

from app.models.registry import SkillDefinition

logger = logging.getLogger(__name__)

_SKILL_CODE_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
_MAX_SKILL_FILE_BYTES = 1024 * 1024


def _normalize_string_list(value: Any) -> list[str]:
    """把 YAML 中的字符串或列表规整为去重字符串列表。"""
    if value is None:
        return []
    values = value if isinstance(value, list) else [value]
    result: list[str] = []
    seen: set[str] = set()
    for item in values:
        if not isinstance(item, str):
            continue
        normalized = item.strip()
        if normalized and normalized not in seen:
            result.append(normalized)
            seen.add(normalized)
    return result


def _split_frontmatter(content: str) -> tuple[str, str]:
    """拆分 ``---`` YAML frontmatter 与 Markdown 正文。"""
    lines = content.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        raise ValueError("SKILL.md 缺少有效 frontmatter（--- ... ---）")

    frontmatter_lines: list[str] = []
    for index, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            return "".join(frontmatter_lines), "".join(lines[index + 1 :]).strip()
        frontmatter_lines.append(line)
    raise ValueError("SKILL.md 缺少结束 frontmatter（---）")


def _validate_code(raw: Any, fallback: str) -> str:
    """验证 skill code，保持与 Yuxi 的小写短横线 slug 规则一致。"""
    code = str(raw or fallback).strip()
    if not code or len(code) > 128 or not _SKILL_CODE_PATTERN.fullmatch(code):
        raise ValueError(
            "SKILL.md 的 slug/name 必须是小写字母、数字和单个短横线组合"
        )
    return code


def load_skill_package(skill_dir: Path) -> SkillDefinition:
    """读取一个根目录含 SKILL.md 的技能包并转换成现有 SkillDefinition。"""
    skill_file = skill_dir / "SKILL.md"
    if not skill_file.is_file():
        raise ValueError(f"技能目录缺少根级 SKILL.md: {skill_dir}")
    if skill_file.stat().st_size > _MAX_SKILL_FILE_BYTES:
        raise ValueError(f"SKILL.md 超过 1 MiB 限制: {skill_file}")

    content = skill_file.read_text(encoding="utf-8")
    frontmatter_raw, body = _split_frontmatter(content)
    try:
        metadata = yaml.safe_load(frontmatter_raw)
    except yaml.YAMLError as exc:
        raise ValueError(f"SKILL.md frontmatter YAML 解析失败: {exc}") from exc
    if not isinstance(metadata, dict):
        raise ValueError("SKILL.md frontmatter 必须是对象")

    code = _validate_code(metadata.get("slug") or metadata.get("name"), skill_dir.name)
    description = str(metadata.get("description") or "").strip()
    if not description:
        raise ValueError("SKILL.md frontmatter 缺少 description")

    display_name = str(
        metadata.get("displayName")
        or metadata.get("display_name")
        or metadata.get("title")
        or metadata.get("name")
        or code
    ).strip()
    if not display_name:
        display_name = code

    content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
    return SkillDefinition(
        code=code,
        binding_code=code,
        name=display_name,
        summary=description,
        description=body,
        required=bool(metadata.get("required", False)),
        source_type="skill_md",
        skill_path=str(skill_file),
        tool_dependencies=_normalize_string_list(
            metadata.get("tool_dependencies")
            or metadata.get("tool-dependencies")
        ),
        mcp_dependencies=_normalize_string_list(
            metadata.get("mcp_dependencies")
            or metadata.get("mcp-dependencies")
        ),
        skill_dependencies=_normalize_string_list(
            metadata.get("skill_dependencies")
            or metadata.get("skill-dependencies")
        ),
        contentHash=content_hash,
        version=str(metadata.get("version") or ""),
        homepage=str(metadata.get("homepage") or ""),
        license=str(metadata.get("license") or ""),
        allowedTools=metadata.get("allowed-tools") or metadata.get("allowed_tools"),
    )


def discover_skill_packages(root: Path) -> list[SkillDefinition]:
    """发现 root 的一级 SKILL.md 包；单包损坏只告警跳过，不影响 JSON 技能。"""
    if not root.exists():
        return []

    skills: list[SkillDefinition] = []
    for entry in sorted(root.iterdir(), key=lambda item: item.name):
        try:
            if not entry.is_dir() or not (entry / "SKILL.md").is_file():
                continue
            skills.append(load_skill_package(entry))
        except Exception:
            logger.warning("SKILL.md 技能包加载失败: %s", entry, exc_info=True)
    return skills
