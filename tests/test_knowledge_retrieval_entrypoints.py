"""所有在线检索入口必须委托统一的 retrieve_knowledge 服务。"""
from __future__ import annotations

import json
from types import SimpleNamespace

import pytest

from app.models.knowledge import KnowledgeSnippet
from app.services.workflow_nodes import KnowledgeExecutor, NodeContext
from app.tools.base import ToolContext
from app.tools.builtin import KnowledgeQueryHandler


@pytest.mark.asyncio
async def test_workflow_knowledge_node_uses_unified_retrieval(monkeypatch):
    calls = []

    async def fake_retrieve(employee_key, query, top_k=5):
        calls.append((employee_key, query, top_k))
        return [KnowledgeSnippet(doc_id="d1", file_name="guide.md", excerpt="命中")]

    monkeypatch.setattr("app.services.vector_store.retrieve_knowledge", fake_retrieve)
    node = SimpleNamespace(config={"employeeKey": "writer", "queryTemplate": "角色弧光", "topK": 3})
    ctx = NodeContext(node=node, variables={}, run=None, run_id="r1", workflow_key="w1")

    result = await KnowledgeExecutor().execute(ctx)

    assert calls == [("writer", "角色弧光", 3)]
    assert result.output["count"] == 1
    assert "guide.md" in result.output["output"]


@pytest.mark.asyncio
async def test_agent_tool_uses_unified_retrieval(monkeypatch):
    calls = []

    async def fake_retrieve(employee_key, query, top_k=5):
        calls.append((employee_key, query, top_k))
        return [KnowledgeSnippet(doc_id="d1", file_name="guide.md", excerpt="命中", score=0.9)]

    monkeypatch.setattr("app.services.vector_store.retrieve_knowledge", fake_retrieve)
    ctx = ToolContext("query_knowledge_base", '{"query":"镜头语言","top_k":99}', "director")

    payload = json.loads(await KnowledgeQueryHandler().handle(ctx))

    assert calls == [("director", "镜头语言", 20)]
    assert payload["hits"][0]["doc_id"] == "d1"
