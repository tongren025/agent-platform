from __future__ import annotations

import logging
from typing import Optional

from app.models.runtime import (
    EmployeeRuntimeSnapshot,
    PromptCompileResult,
    RuntimeMcpServer,
    RuntimeSkill,
    RuntimeTool,
)
from app.runtime.infra_tools import get_platform_infra_tools

logger = logging.getLogger(__name__)

_DEEP_AGENT_WORKFLOW = """\
你是深度代理模式。请遵循以下工作流程：
1. 首先使用 write_todos 规划你的任务步骤
2. 按步骤执行，使用虚拟文件系统存储中间结果
3. 可以使用 task 工具委托子任务给子代理
4. 需要人工确认时使用 require_approval
5. 使用 ls/read_file/write_file/edit_file 管理文件
6. 执行完毕后更新 todos 状态
7. 最终汇总结果给用户"""


def compile(
    snapshot: EmployeeRuntimeSnapshot,
    active_scopes: list[str],
    structured_schema_json: Optional[str] = None,
) -> PromptCompileResult:
    visible_skills: list[RuntimeSkill] = []
    visible_skill_trees: list[RuntimeSkill] = []
    visible_tools: list[RuntimeTool] = []
    visible_mcp_servers: list[RuntimeMcpServer] = []

    seen_skill_codes: set[str] = set()
    seen_tree_codes: set[str] = set()
    seen_tool_codes: set[str] = set()
    seen_mcp_codes: set[str] = set()

    for scope in active_scopes:
        for sk in snapshot.skills_by_scope.get(scope, []):
            if sk.code not in seen_skill_codes:
                visible_skills.append(sk)
                seen_skill_codes.add(sk.code)

        for sk in snapshot.skill_trees_by_scope.get(scope, []):
            if sk.code not in seen_tree_codes:
                visible_skill_trees.append(sk)
                seen_tree_codes.add(sk.code)

        for tl in snapshot.tools_by_scope.get(scope, []):
            if tl.tool_code not in seen_tool_codes:
                visible_tools.append(tl)
                seen_tool_codes.add(tl.tool_code)

        for ms in snapshot.mcp_by_scope.get(scope, []):
            if ms.server_code not in seen_mcp_codes:
                visible_mcp_servers.append(ms)
                seen_mcp_codes.add(ms.server_code)

    infra_tools = get_platform_infra_tools(snapshot)
    for it in infra_tools:
        if it.tool_code not in seen_tool_codes:
            visible_tools.append(it)
            seen_tool_codes.add(it.tool_code)

    parts: list[str] = []

    if snapshot.system_prompt_block:
        parts.append(f"<role_profile>\n{snapshot.system_prompt_block}\n</role_profile>")

    if snapshot.deep_agent:
        parts.append(f"<deep_agent_workflow>\n{_DEEP_AGENT_WORKFLOW}\n</deep_agent_workflow>")

    if snapshot.team_members:
        member_lines: list[str] = []
        for m in snapshot.team_members:
            line = f"  <member key=\"{m.employee_key}\" name=\"{m.name}\">"
            if m.role_profile_summary:
                line += f"\n    <summary>{m.role_profile_summary}</summary>"
            line += "\n  </member>"
            member_lines.append(line)
        parts.append(
            "<team_members>\n" + "\n".join(member_lines) + "\n</team_members>"
        )

    if visible_skills:
        skill_lines: list[str] = []
        for sk in visible_skills:
            summary_text = sk.summary or sk.description or ""
            line = f"  <skill code=\"{sk.code}\" name=\"{sk.name}\">"
            if summary_text:
                line += f"\n    <summary>{summary_text}</summary>"
            if sk.code in seen_tree_codes and sk.children:
                children_parts: list[str] = []
                for child in sk.children:
                    child_code = child.get("code", "")
                    child_name = child.get("name", "")
                    child_desc = child.get("description", child.get("summary", ""))
                    children_parts.append(
                        f"      <child code=\"{child_code}\" name=\"{child_name}\">"
                        f"{child_desc}</child>"
                    )
                line += "\n    <children>\n" + "\n".join(children_parts) + "\n    </children>"
            line += "\n  </skill>"
            skill_lines.append(line)
        parts.append("<skills>\n" + "\n".join(skill_lines) + "\n</skills>")

    if visible_tools:
        tool_lines: list[str] = []
        for tl in visible_tools:
            desc = tl.description or ""
            schema = tl.input_schema or "{}"
            tool_lines.append(
                f"  <tool code=\"{tl.tool_code}\" name=\"{tl.name}\">\n"
                f"    <description>{desc}</description>\n"
                f"    <input_schema>{schema}</input_schema>\n"
                f"  </tool>"
            )
        parts.append("<tools>\n" + "\n".join(tool_lines) + "\n</tools>")

    if visible_mcp_servers:
        mcp_lines: list[str] = []
        for ms in visible_mcp_servers:
            desc = ms.description or ""
            mcp_lines.append(
                f"  <mcp_server code=\"{ms.server_code}\" name=\"{ms.name}\">\n"
                f"    <description>{desc}</description>\n"
                f"  </mcp_server>"
            )
        parts.append("<mcp_servers>\n" + "\n".join(mcp_lines) + "\n</mcp_servers>")

    # ── LangMem: 注入长期记忆 ──────────────────────────
    try:
        from app.dependencies import long_term_memory
        mem_data = long_term_memory.get_all_for_prompt(snapshot.employee_key)
        mem_lines: list[str] = []

        if mem_data["procedural"]:
            rules = [f"  - {m.rule}" for m in mem_data["procedural"][:10]]
            mem_lines.append("<learned_behaviors>\n" + "\n".join(rules) + "\n</learned_behaviors>")

        if mem_data["semantic"]:
            facts = [f"  - [{m.category}] {m.content}" for m in mem_data["semantic"][:20]]
            mem_lines.append("<user_knowledge>\n" + "\n".join(facts) + "\n</user_knowledge>")

        if mem_data["episodic"]:
            eps = []
            for m in mem_data["episodic"][:5]:
                eps.append(
                    f"  <experience>\n"
                    f"    <situation>{m.observation}</situation>\n"
                    f"    <approach>{m.action}</approach>\n"
                    f"    <outcome>{m.result}</outcome>\n"
                    f"  </experience>"
                )
            mem_lines.append("<past_experiences>\n" + "\n".join(eps) + "\n</past_experiences>")

        if mem_lines:
            parts.append("<long_term_memory>\n" + "\n".join(mem_lines) + "\n</long_term_memory>")
    except Exception:
        logger.debug("长期记忆注入跳过", exc_info=True)

    if structured_schema_json:
        parts.append(
            f"<output_contract>\n{structured_schema_json}\n</output_contract>"
        )

    system_prompt = "\n\n".join(parts)

    response_instruction = ""
    if structured_schema_json:
        response_instruction = (
            "请严格按照 <output_contract> 中定义的 JSON Schema 格式输出结果。"
        )

    resolved_model_config = dict(snapshot.default_model_policy)

    return PromptCompileResult(
        system_prompt=system_prompt,
        response_instruction=response_instruction,
        active_scopes=list(active_scopes),
        resolved_model_config=resolved_model_config,
        visible_skills=visible_skills,
        visible_skill_trees=visible_skill_trees,
        visible_tools=visible_tools,
        visible_mcp_servers=visible_mcp_servers,
    )
