"""知识图谱 API —— 聚合所有实体及关系，供前端可视化。"""
from __future__ import annotations

from fastapi import APIRouter

from app.api.common import ok as _ok
from app.dependencies import (
    employee_registry,
    tool_registry,
    skill_registry,
    mcp_server_registry,
    team_registry,
    workflow_registry,
)

router = APIRouter(prefix="/api/v1/agentapp/knowledge-graph", tags=["knowledge-graph"])



@router.get("")
def get_knowledge_graph():
    nodes: list[dict] = []
    edges: list[dict] = []
    edge_id = 0

    def _add_edge(source: str, target: str, relation: str):
        nonlocal edge_id
        edge_id += 1
        edges.append({"id": f"e{edge_id}", "source": source, "target": target, "relation": relation})

    # ── 收集所有实体 ──────────────────────────────────────────

    emp_keys: set[str] = set()
    for emp in employee_registry.list_all():
        k = emp.employee_key
        if not k:
            continue
        emp_keys.add(k)
        nodes.append({
            "id": f"emp:{k}",
            "type": "employee",
            "label": emp.name or k,
            "metadata": {"key": k, "role": (emp.role_profile or "")[:80], "enabled": emp.enabled},
        })

    tool_codes: set[str] = set()
    for t in tool_registry.list_all():
        c = t.tool_code
        if not c:
            continue
        tool_codes.add(c)
        nodes.append({
            "id": f"tool:{c}",
            "type": "tool",
            "label": t.name or c,
            "metadata": {"code": c, "description": t.description or ""},
        })

    skill_codes: set[str] = set()
    for s in skill_registry.list_all():
        c = s.code
        if not c:
            continue
        skill_codes.add(c)
        nodes.append({
            "id": f"skill:{c}",
            "type": "skill",
            "label": s.name or c,
            "metadata": {"code": c, "description": s.description or ""},
        })

    mcp_codes: set[str] = set()
    for m in mcp_server_registry.list_all():
        c = m.server_code
        if not c:
            continue
        mcp_codes.add(c)
        nodes.append({
            "id": f"mcp:{c}",
            "type": "mcp_server",
            "label": m.name or c,
            "metadata": {"code": c, "transport": m.transport_type, "description": m.description or ""},
        })

    team_codes: set[str] = set()
    for tm in team_registry.list_all():
        c = tm.team_code
        if not c:
            continue
        team_codes.add(c)
        nodes.append({
            "id": f"team:{c}",
            "type": "team",
            "label": tm.name or c,
            "metadata": {"code": c, "description": tm.description or "", "memberCount": len(tm.member_employee_keys)},
        })

    wf_keys: set[str] = set()
    for wf in workflow_registry.list_all():
        k = wf.workflow_key
        if not k:
            continue
        wf_keys.add(k)
        nodes.append({
            "id": f"wf:{k}",
            "type": "workflow",
            "label": wf.name or k,
            "metadata": {"key": k, "description": wf.description or "", "nodeCount": len(wf.nodes or [])},
        })

    # ── 构建关系 ──────────────────────────────────────────────

    for emp in employee_registry.list_all():
        k = emp.employee_key
        if not k:
            continue
        src = f"emp:{k}"

        for ref in emp.tool_refs or []:
            if ref in tool_codes:
                _add_edge(src, f"tool:{ref}", "uses_tool")

        for ref in emp.skill_refs or []:
            if ref in skill_codes:
                _add_edge(src, f"skill:{ref}", "has_skill")

        for ref in emp.mcp_server_refs or []:
            if ref in mcp_codes:
                _add_edge(src, f"mcp:{ref}", "uses_mcp")

    for tm in team_registry.list_all():
        tc = tm.team_code
        if not tc:
            continue
        tid = f"team:{tc}"

        for mk in tm.member_employee_keys:
            if mk in emp_keys:
                _add_edge(f"emp:{mk}", tid, "member_of")

        if tm.leader_employee_key and tm.leader_employee_key in emp_keys:
            _add_edge(f"emp:{tm.leader_employee_key}", tid, "leads")

    for wf in workflow_registry.list_all():
        wk = wf.workflow_key
        if not wk:
            continue
        wid = f"wf:{wk}"
        for node in wf.nodes or []:
            if node.type == "agent":
                ek = (node.config or {}).get("employeeKey", "")
                if ek and ek in emp_keys:
                    _add_edge(wid, f"emp:{ek}", "workflow_contains")

    return _ok({"nodes": nodes, "edges": edges})
