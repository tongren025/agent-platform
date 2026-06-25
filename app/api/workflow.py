"""
工作流编排 API。

Prefix: /api/v1/agentapp/workflow
- GET    ""               列出全部工作流
- POST   ""               创建（草稿可保存；图非法时仍保存，返回 validationError 供前端提示）
- GET    /node-types      可用节点类型（前端调色板用）
- GET    /{key}           取单个
- PUT    /{key}           更新
- DELETE /{key}           删除（连同运行记录）
- POST   /{key}/run       立即运行（asyncio.wait_for + 504，仿 agent.py）
- GET    /{key}/runs      运行历史
- GET    /{key}/runs/{run_id}  单次运行详情
"""
from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.common import ok as _ok, validate_key as _validate
from app.config import settings
from app.dependencies import workflow_registry, workflow_run_store
from app.models.workflow import WorkflowDefinition
from app.services.workflow_executor import run_workflow, validate_graph
from app.services.workflow_nodes import get_all_node_executors

router = APIRouter(prefix="/api/v1/agentapp/workflow")

logger = logging.getLogger(__name__)

_NODE_TYPE_META = {
    "start": {"label": "开始", "desc": "工作流入口，声明输入字段"},
    "agent": {"label": "智能体", "desc": "调用一个数字员工（多 subagent 的核心）"},
    "knowledge": {"label": "知识检索", "desc": "检索指定员工知识库片段"},
    "condition": {"label": "条件分支", "desc": "按 if/else 规则走不同分支"},
    "template": {"label": "文本拼装", "desc": "用 {{node.field}} 组合文本，不耗 token"},
    "tool": {"label": "工具", "desc": "调用已注册的工具 / MCP"},
    "iteration": {"label": "循环", "desc": "对数组逐项调用指定员工，收集结果"},
    "http": {"label": "HTTP 请求", "desc": "调用外部 API，响应注入变量池"},
    "code": {"label": "代码", "desc": "安全 Python 表达式做数据变换，不耗 token"},
    "sub-workflow": {"label": "子工作流", "desc": "嵌套执行另一个工作流"},
    "end": {"label": "结束", "desc": "汇总输出并返回"},
}


class _RunBody(BaseModel):
    model_config = {"populate_by_name": True}
    inputs: dict = {}


@router.get("")
def list_workflows():
    items = workflow_registry.list_all()
    return _ok([w.model_dump(by_alias=True, mode="json") for w in items])


@router.get("/node-types")
def list_node_types():
    available = set(get_all_node_executors().keys())
    ordered = ["start", "agent", "knowledge", "condition", "template", "tool",
               "iteration", "http", "code", "sub-workflow", "end"]
    result = [
        {"type": t, **_NODE_TYPE_META.get(t, {"label": t, "desc": ""})}
        for t in ordered if t in available
    ]
    return _ok(result)


@router.get("/{key}")
def get_workflow(key: str):
    _validate(key)
    wf = workflow_registry.get(key)
    if wf is None:
        raise HTTPException(status_code=404, detail=f"Workflow not found: {key}")
    return _ok(wf.model_dump(by_alias=True, mode="json"))


@router.post("")
def create_workflow(body: WorkflowDefinition):
    _validate(body.workflow_key)
    if workflow_registry.exists(body.workflow_key):
        raise HTTPException(status_code=409, detail=f"Workflow already exists: {body.workflow_key}")
    saved = workflow_registry.save(body)
    data = saved.model_dump(by_alias=True, mode="json")
    data["validationError"] = validate_graph(saved)  # 草稿可保存，仅作提示
    return _ok(data)


@router.put("/{key}")
def update_workflow(key: str, body: WorkflowDefinition):
    _validate(key)
    if not workflow_registry.exists(key):
        raise HTTPException(status_code=404, detail=f"Workflow not found: {key}")
    body.workflow_key = key
    saved = workflow_registry.save(body)
    data = saved.model_dump(by_alias=True, mode="json")
    data["validationError"] = validate_graph(saved)
    return _ok(data)


@router.delete("/{key}")
def delete_workflow(key: str):
    _validate(key)
    if not workflow_registry.delete(key):
        raise HTTPException(status_code=404, detail=f"Workflow not found: {key}")
    workflow_run_store.delete_all(key)
    return _ok(True)


@router.post("/{key}/run")
async def run_workflow_now(key: str, body: _RunBody):
    _validate(key)
    wf = workflow_registry.get(key)
    if wf is None:
        raise HTTPException(status_code=404, detail=f"Workflow not found: {key}")
    timeout = settings.workflow.run_timeout_seconds
    try:
        run = await asyncio.wait_for(run_workflow(wf, body.inputs), timeout=timeout)
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail=f"Workflow run timed out after {timeout}s",
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Workflow run failed for %s", key)
        raise HTTPException(status_code=500, detail=f"Workflow run failed: {exc}")
    return _ok(run.model_dump(by_alias=True, mode="json"))


@router.get("/{key}/runs")
def list_runs(key: str):
    _validate(key)
    runs = workflow_run_store.list(key)
    return _ok([r.model_dump(by_alias=True, mode="json") for r in runs])


@router.get("/{key}/runs/{run_id}")
def get_run(key: str, run_id: str):
    _validate(key)
    run = workflow_run_store.get(key, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail=f"Run not found: {run_id}")
    return _ok(run.model_dump(by_alias=True, mode="json"))
