"""临时单测：验证执行引擎的菱形分支 join/skip 传播 + 环检测。不依赖 LLM/网络。"""
import asyncio
from app.models.workflow import WorkflowDefinition, WorkflowNode, WorkflowEdge
from app.services.workflow_executor import run_workflow, validate_graph


def diamond():
    return WorkflowDefinition(
        workflowKey="test-diamond",
        name="diamond",
        nodes=[
            WorkflowNode(nodeKey="s", type="start"),
            WorkflowNode(nodeKey="c", type="condition", config={
                "cases": [{"label": "hi", "var": "{{start.score}}", "op": "gt", "value": "5"}],
                "elseLabel": "lo",
            }),
            WorkflowNode(nodeKey="A", type="template", config={"template": "high path {{start.score}}"}),
            WorkflowNode(nodeKey="B", type="template", config={"template": "low path {{start.score}}"}),
            WorkflowNode(nodeKey="J", type="template", config={"template": "joined:[{{A.output}}][{{B.output}}]"}),
            WorkflowNode(nodeKey="e", type="end", config={"outputTemplate": "{{J.output}}"}),
        ],
        edges=[
            WorkflowEdge(edgeId="1", source="s", target="c"),
            WorkflowEdge(edgeId="2", source="c", target="A", sourceHandle="hi"),
            WorkflowEdge(edgeId="3", source="c", target="B", sourceHandle="lo"),
            WorkflowEdge(edgeId="4", source="A", target="J"),
            WorkflowEdge(edgeId="5", source="B", target="J"),
            WorkflowEdge(edgeId="6", source="J", target="e"),
        ],
    )


async def main():
    wf = diamond()

    # 高分支
    run = await run_workflow(wf, {"score": 10})
    st = {s.node_key: s.status for s in run.steps}
    print("HI  status=", run.status, "final=", repr(run.final_output))
    print("HI  steps=", st)
    assert run.status == "success", run.error
    assert st["A"] == "success" and st["B"] == "skipped", st
    assert run.final_output == "joined:[high path 10][]", run.final_output

    # 低分支
    run = await run_workflow(wf, {"score": 1})
    st = {s.node_key: s.status for s in run.steps}
    print("LO  status=", run.status, "final=", repr(run.final_output))
    print("LO  steps=", st)
    assert st["B"] == "success" and st["A"] == "skipped", st
    assert run.final_output == "joined:[][low path 1]", run.final_output

    # 环检测
    cyc = WorkflowDefinition(
        workflowKey="test-cycle", name="c",
        nodes=[WorkflowNode(nodeKey="s", type="start"),
               WorkflowNode(nodeKey="a", type="template", config={"template": "x"}),
               WorkflowNode(nodeKey="e", type="end")],
        edges=[WorkflowEdge(edgeId="1", source="s", target="a"),
               WorkflowEdge(edgeId="2", source="a", target="s"),
               WorkflowEdge(edgeId="3", source="a", target="e")],
    )
    print("CYCLE validate=", validate_graph(cyc))
    assert validate_graph(cyc) is not None

    # 缺 start
    nostart = WorkflowDefinition(workflowKey="t", name="t",
        nodes=[WorkflowNode(nodeKey="e", type="end")], edges=[])
    print("NOSTART validate=", validate_graph(nostart))
    assert validate_graph(nostart) is not None

    print("\nALL WORKFLOW ENGINE TESTS PASSED")


asyncio.run(main())
