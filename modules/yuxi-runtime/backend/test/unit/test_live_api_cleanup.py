from __future__ import annotations

from typing import Any

import httpx
import pytest

from test.live_api_cleanup import cleanup_pytest_knowledge_resources

pytestmark = pytest.mark.asyncio


async def test_cleanup_deletes_pytest_evaluation_resources_and_knowledge_databases():
    """只删除 pytest 前缀资源，并使用知识库真实返回的 kb_id。"""

    deleted_paths: list[str] = []
    responses: dict[str, dict[str, Any]] = {
        "/api/knowledge/databases": {
            "databases": [
                {"kb_id": "kb_test", "name": "Pytest knowledge base"},
                {"kb_id": "kb_legacy", "name": "py_test_legacy"},
                {"kb_id": "kb_prod", "name": "Production knowledge base"},
            ]
        },
        "/api/evaluation/databases/kb_test/runs": {"data": [{"run_id": "run_test", "name": "PYTEST evaluation"}]},
        "/api/evaluation/databases/kb_test/datasets": {"data": [{"dataset_id": "dataset_test", "name": "pytest plan"}]},
        "/api/evaluation/databases/kb_legacy/runs": {"data": []},
        "/api/evaluation/databases/kb_legacy/datasets": {"data": []},
        "/api/evaluation/databases/kb_prod/runs": {"data": [{"run_id": "run_prod", "name": "Production evaluation"}]},
        "/api/evaluation/databases/kb_prod/datasets": {
            "data": [
                {"dataset_id": "dataset_shared_test", "name": "Pytest shared plan"},
                {"dataset_id": "dataset_prod", "name": "Production plan"},
            ]
        },
    }

    def handle_request(request: httpx.Request) -> httpx.Response:
        """返回清理 API 的最小真实 HTTP 响应。"""

        if request.method == "DELETE":
            deleted_paths.append(request.url.path)
            return httpx.Response(200, json={})
        return httpx.Response(200, json=responses[request.url.path])

    async with httpx.AsyncClient(transport=httpx.MockTransport(handle_request), base_url="http://test") as client:
        await cleanup_pytest_knowledge_resources(client, {"Authorization": "test"})

    assert set(deleted_paths) == {
        "/api/evaluation/databases/kb_test/runs/run_test",
        "/api/evaluation/datasets/dataset_test",
        "/api/evaluation/datasets/dataset_shared_test",
        "/api/knowledge/databases/kb_test",
        "/api/knowledge/databases/kb_legacy",
    }


async def test_cleanup_rejects_knowledge_list_error_payload():
    """知识库列表以 200 返回内部错误时，清理必须显式失败。"""

    def handle_request(request: httpx.Request) -> httpx.Response:
        """模拟知识库列表路由当前的 200 错误响应。"""

        return httpx.Response(200, json={"message": "获取数据库列表失败", "databases": []})

    async with httpx.AsyncClient(transport=httpx.MockTransport(handle_request), base_url="http://test") as client:
        with pytest.raises(RuntimeError, match="获取数据库列表失败"):
            await cleanup_pytest_knowledge_resources(client, {"Authorization": "test"})
