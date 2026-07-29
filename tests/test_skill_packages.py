"""SKILL.md 只读发现与按需加载回归测试。"""
from __future__ import annotations

import json

import pytest

from app.models.registry import SkillDefinition
from app.models.runtime import EmployeeRuntimeSnapshot, RuntimeSkill
from app.runtime.prompt import compile
from app.services.registry import SkillRegistryService
from app.services.skill_packages import load_skill_package
from app.tools.base import ToolContext
from app.tools.builtin import SkillDetailHandler


def _write_skill_package(root, code: str = "cinematic-video"):
    skill_dir = root / code
    skill_dir.mkdir(parents=True)
    skill_file = skill_dir / "SKILL.md"
    skill_file.write_text(
        """---
name: cinematic-video
displayName: 电影感视频
description: >
  先规划镜头，再生成视频。
tool_dependencies:
  - generate_video
mcp_dependencies:
  - media-search
skill_dependencies:
  - storyboard
---

# 完整工作流

这是只应按需读取的完整技能正文。
""",
        encoding="utf-8",
    )
    return skill_dir, skill_file


def test_load_skill_package_parses_frontmatter_and_body(tmp_path):
    skill_dir, skill_file = _write_skill_package(tmp_path)

    skill = load_skill_package(skill_dir)

    assert skill.code == "cinematic-video"
    assert skill.name == "电影感视频"
    assert skill.summary == "先规划镜头，再生成视频。"
    assert "只应按需读取" in (skill.description or "")
    assert skill.source_type == "skill_md"
    assert skill.skill_path == str(skill_file)
    assert skill.tool_dependencies == ["generate_video"]
    assert skill.mcp_dependencies == ["media-search"]
    assert skill.skill_dependencies == ["storyboard"]


def test_registry_discovers_package_but_json_override_wins(tmp_path):
    root = tmp_path / "skills"
    _, skill_file = _write_skill_package(root)
    registry = SkillRegistryService(str(root))

    discovered = registry.get("cinematic-video")
    assert discovered is not None
    assert discovered.source_type == "skill_md"
    assert [item.code for item in registry.list_all()] == ["cinematic-video"]

    registry.save(
        SkillDefinition(
            code="cinematic-video",
            name="后台覆盖配置",
            summary="JSON 配置优先",
        )
    )

    overridden = registry.get("cinematic-video")
    assert overridden is not None
    assert overridden.name == "后台覆盖配置"
    assert overridden.source_type == "json"
    assert skill_file.exists()
    assert [item.code for item in registry.list_all()] == ["cinematic-video"]


def test_invalid_package_isolated_from_valid_packages(tmp_path, caplog):
    root = tmp_path / "skills"
    _write_skill_package(root)
    invalid_dir = root / "invalid"
    invalid_dir.mkdir()
    (invalid_dir / "SKILL.md").write_text("# missing frontmatter", encoding="utf-8")

    registry = SkillRegistryService(str(root))

    assert [item.code for item in registry.list_all()] == ["cinematic-video"]
    assert "SKILL.md 技能包加载失败" in caplog.text


async def test_existing_skill_detail_tool_reads_package_body(tmp_path, monkeypatch):
    root = tmp_path / "skills"
    _write_skill_package(root)
    registry = SkillRegistryService(str(root))

    import app.tools.builtin as builtin_tools

    monkeypatch.setattr(builtin_tools, "skill_registry", registry)
    result = json.loads(
        await SkillDetailHandler().handle(
            ToolContext(
                tool_code="get_skill_detail",
                arguments_json='{"skill_code": "cinematic-video"}',
                employee_key="director",
            )
        )
    )

    assert result["summary"].startswith("先规划镜头")
    assert "只应按需读取" in result["description"]


def test_prompt_keeps_skill_body_on_demand():
    tree_skill = RuntimeSkill(
        code="video-workflow",
        name="视频工作流",
        summary="视频制作摘要",
        children=[
            {
                "code": "cinematic-video",
                "name": "电影感视频",
                "summary": "子技能摘要",
                "description": "不应提前注入的超长完整正文",
            }
        ],
    )
    snapshot = EmployeeRuntimeSnapshot(
        employee_key="director",
        skills_by_scope={"global": [tree_skill]},
        skill_trees_by_scope={"global": [tree_skill]},
    )

    result = compile(snapshot, ["global"])

    assert "视频制作摘要" in result.system_prompt
    assert "子技能摘要" in result.system_prompt
    assert "不应提前注入的超长完整正文" not in result.system_prompt
    assert "get_skill_detail(skill_code)" in result.system_prompt


def test_package_requires_frontmatter(tmp_path):
    skill_dir = tmp_path / "broken"
    skill_dir.mkdir()
    (skill_dir / "SKILL.md").write_text("# no frontmatter", encoding="utf-8")

    with pytest.raises(ValueError, match="frontmatter"):
        load_skill_package(skill_dir)
