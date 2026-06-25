"""验证工作流 tool 节点的授权闸门：黑名单 / 必须 employeeKey / 必须绑定该工具。"""
import asyncio
from app.models.workflow import WorkflowDefinition, WorkflowNode, WorkflowEdge
from app.services.workflow_executor import run_workflow


def wf(tool_cfg):
    return WorkflowDefinition(
        workflowKey="test-tool-sec", name="t",
        nodes=[
            WorkflowNode(nodeKey="s", type="start"),
            WorkflowNode(nodeKey="tool", type="tool", config=tool_cfg),
            WorkflowNode(nodeKey="e", type="end"),
        ],
        edges=[
            WorkflowEdge(edgeId="1", source="s", target="tool"),
            WorkflowEdge(edgeId="2", source="tool", target="e"),
        ],
    )


async def main():
    # 1) 黑名单工具（Shell 执行）被拒
    r = await run_workflow(wf({"toolCode": "execute", "employeeKey": "comic-director", "argsTemplate": "{}"}), {})
    tool_step = next(s for s in r.steps if s.node_key == "tool")
    print("BLOCKED:", tool_step.status, "|", tool_step.error)
    assert tool_step.status == "failed" and "不允许" in (tool_step.error or "")

    # 2) 未指定 employeeKey 被拒
    r = await run_workflow(wf({"toolCode": "some_tool", "argsTemplate": "{}"}), {})
    tool_step = next(s for s in r.steps if s.node_key == "tool")
    print("NO-EMP :", tool_step.status, "|", tool_step.error)
    assert tool_step.status == "failed" and "employeeKey" in (tool_step.error or "")

    # 3) 员工未绑定该工具被拒（comic-director 默认无 tool_refs）
    r = await run_workflow(wf({"toolCode": "knowledge_query", "employeeKey": "comic-director", "argsTemplate": "{}"}), {})
    tool_step = next(s for s in r.steps if s.node_key == "tool")
    print("UNBOUND:", tool_step.status, "|", tool_step.error)
    assert tool_step.status == "failed" and ("未绑定" in (tool_step.error or "") or "不存在" in (tool_step.error or ""))

    print("\nTOOL-NODE SECURITY TESTS PASSED")

asyncio.run(main())
