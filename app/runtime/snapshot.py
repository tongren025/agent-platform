from __future__ import annotations

import logging
from typing import Optional

from app.dependencies import (
    employee_registry,
    mcp_server_registry,
    skill_registry,
    team_registry,
    tool_registry,
)
from app.models.runtime import (
    EmployeeRuntimeSnapshot,
    RuntimeMcpServer,
    RuntimeSkill,
    RuntimeTool,
    TeamMemberSummary,
)

logger = logging.getLogger(__name__)

_DEFAULT_MODEL_POLICY: dict = {
    "model_id": "gpt-4o",
    "temperature": 0.7,
    "max_tokens": 4096,
}


def load_snapshot(
    employee_key: str,
    active_scopes: list[str],
) -> Optional[EmployeeRuntimeSnapshot]:
    employee = employee_registry.get(employee_key)
    if employee is None:
        logger.warning("Employee not found: %s", employee_key)
        return None

    snapshot = EmployeeRuntimeSnapshot(
        employee_key=employee.employee_key,
        system_prompt_block=employee.role_profile,
        deep_agent=employee.deep_agent,
        default_model_policy=(
            employee.default_model_policy
            if employee.default_model_policy
            else dict(_DEFAULT_MODEL_POLICY)
        ),
        has_knowledge_base=employee.has_knowledge_base,
        team_code=employee.team_code,
    )

    if employee.skill_refs:
        skills: list[RuntimeSkill] = []
        tree_skills: list[RuntimeSkill] = []
        for ref in employee.skill_refs:
            defn = skill_registry.get(ref)
            if defn is None:
                logger.warning("Skill ref not found: %s (employee=%s)", ref, employee_key)
                continue
            rt = RuntimeSkill(
                code=defn.code,
                binding_code=defn.binding_code or "",
                name=defn.name,
                summary=defn.summary,
                description=defn.description,
                required=defn.required,
                sort_order=defn.sort_order,
                children=defn.children,
            )
            skills.append(rt)
            if defn.is_tree:
                tree_skills.append(rt)
        if skills:
            snapshot.skills_by_scope["global"] = skills
        if tree_skills:
            snapshot.skill_trees_by_scope["global"] = tree_skills

    if employee.tool_refs:
        tools: list[RuntimeTool] = []
        for ref in employee.tool_refs:
            defn = tool_registry.get(ref)
            if defn is None:
                logger.warning("Tool ref not found: %s (employee=%s)", ref, employee_key)
                continue
            tools.append(RuntimeTool(
                tool_code=defn.tool_code,
                binding_code=defn.binding_code or "",
                name=defn.name,
                description=defn.description,
                input_schema=defn.input_schema,
                sort_order=defn.sort_order,
            ))
        if tools:
            snapshot.tools_by_scope["global"] = tools

    if employee.mcp_server_refs:
        servers: list[RuntimeMcpServer] = []
        for ref in employee.mcp_server_refs:
            defn = mcp_server_registry.get(ref)
            if defn is None:
                logger.warning("MCP server ref not found: %s (employee=%s)", ref, employee_key)
                continue
            servers.append(RuntimeMcpServer(
                server_code=defn.server_code,
                binding_code="",
                name=defn.name,
                description=defn.description,
                transport_type=defn.transport_type,
                command=defn.command,
                command_args=defn.command_args,
                url=defn.url,
                env=defn.env,
                sort_order=defn.sort_order,
            ))
        if servers:
            snapshot.mcp_by_scope["global"] = servers

    if employee.team_code:
        team = team_registry.get(employee.team_code)
        if team is None:
            logger.warning(
                "Team not found: %s (employee=%s)", employee.team_code, employee_key
            )
        else:
            members: list[TeamMemberSummary] = []
            for member_key in team.member_employee_keys:
                member_emp = employee_registry.get(member_key)
                if member_emp is None:
                    logger.warning(
                        "Team member not found: %s (team=%s)",
                        member_key,
                        employee.team_code,
                    )
                    continue
                summary = (
                    member_emp.role_profile[:200]
                    if member_emp.role_profile
                    else None
                )
                members.append(TeamMemberSummary(
                    employee_key=member_emp.employee_key,
                    name=member_emp.name,
                    role_profile_summary=summary,
                ))
            snapshot.team_members = members

    return snapshot
