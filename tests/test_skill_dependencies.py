"""Skill 依赖闭包与员工快照接入回归测试。"""
from __future__ import annotations

from app.models.registry import (
    EmployeeDefinition,
    McpServerDefinition,
    SkillDefinition,
    ToolDefinition,
)
from app.runtime.skills import resolve_skill_bindings
from app.runtime.snapshot import load_snapshot


class _Registry:
    """内存注册表桩。"""

    def __init__(self, items):
        self.items = {item.get_key(): item for item in items}

    def get(self, key):
        return self.items.get(key)

    def list_all(self):
        return list(self.items.values())


def test_resolve_skill_dependency_closure_is_ordered_and_deduplicated():
    skills = {
        "root": SkillDefinition(
            code="root",
            name="Root",
            skill_dependencies=["child", "shared"],
            tool_dependencies=["tool-a"],
            mcp_dependencies=["mcp-a"],
        ),
        "child": SkillDefinition(
            code="child",
            name="Child",
            skill_dependencies=["shared"],
            tool_dependencies=["tool-b", "tool-a"],
        ),
        "shared": SkillDefinition(
            code="shared",
            name="Shared",
            mcp_dependencies=["mcp-b", "mcp-a"],
        ),
    }

    result = resolve_skill_bindings(["root"], skills)

    assert result.skill_codes == ["root", "child", "shared"]
    assert result.tool_codes == ["tool-a", "tool-b"]
    assert result.mcp_server_codes == ["mcp-a", "mcp-b"]
    assert result.missing_skill_codes == []
    assert result.dependency_cycles == []


def test_missing_and_cyclic_dependencies_fail_soft():
    skills = {
        "a": SkillDefinition(
            code="a",
            name="A",
            skill_dependencies=["b", "missing"],
        ),
        "b": SkillDefinition(
            code="b",
            name="B",
            skill_dependencies=["a"],
        ),
    }

    result = resolve_skill_bindings(["a"], skills)

    assert result.skill_codes == ["a", "b"]
    assert result.missing_skill_codes == ["missing"]
    assert result.dependency_cycles == [["a", "b", "a"]]


def test_snapshot_adds_bound_skill_dependencies_without_replacing_explicit_refs(
    monkeypatch,
):
    root_skill = SkillDefinition(
        code="root-skill",
        name="Root Skill",
        summary="root",
        skill_dependencies=["child-skill"],
        tool_dependencies=["skill-tool"],
        mcp_dependencies=["skill-mcp"],
    )
    child_skill = SkillDefinition(
        code="child-skill",
        name="Child Skill",
        summary="child",
        tool_dependencies=["child-tool"],
        mcp_dependencies=["child-mcp"],
    )
    employee = EmployeeDefinition(
        employee_key="director",
        name="导演",
        role_profile="负责导演工作",
        skill_refs=["root-skill"],
        tool_refs=["explicit-tool", "skill-tool"],
        mcp_server_refs=["explicit-mcp", "skill-mcp"],
    )
    tools = [
        ToolDefinition(tool_code="explicit-tool", name="Explicit"),
        ToolDefinition(tool_code="skill-tool", name="Skill"),
        ToolDefinition(tool_code="child-tool", name="Child"),
    ]
    mcps = [
        McpServerDefinition(server_code="explicit-mcp", name="Explicit MCP"),
        McpServerDefinition(server_code="skill-mcp", name="Skill MCP"),
        McpServerDefinition(server_code="child-mcp", name="Child MCP"),
    ]

    import app.runtime.snapshot as snapshot_module

    monkeypatch.setattr(
        snapshot_module,
        "employee_registry",
        _Registry([employee]),
    )
    monkeypatch.setattr(
        snapshot_module,
        "skill_registry",
        _Registry([root_skill, child_skill]),
    )
    monkeypatch.setattr(snapshot_module, "tool_registry", _Registry(tools))
    monkeypatch.setattr(snapshot_module, "mcp_server_registry", _Registry(mcps))
    monkeypatch.setattr(snapshot_module, "team_registry", _Registry([]))

    snapshot = load_snapshot("director", ["global"])

    assert snapshot is not None
    assert [
        skill.code for skill in snapshot.skills_by_scope["global"]
    ] == ["root-skill", "child-skill"]
    assert [
        tool.tool_code for tool in snapshot.tools_by_scope["global"]
    ] == ["explicit-tool", "skill-tool", "child-tool"]
    assert [
        server.server_code for server in snapshot.mcp_by_scope["global"]
    ] == ["explicit-mcp", "skill-mcp", "child-mcp"]
    assert employee.tool_refs == ["explicit-tool", "skill-tool"]
    assert employee.mcp_server_refs == ["explicit-mcp", "skill-mcp"]
