"""API 文档生成器回归测试，覆盖嵌套路由、请求合同与版本库同步。"""
from __future__ import annotations

import re
from typing import Annotated

import pytest
from fastapi import APIRouter, FastAPI, File, Header, Query, UploadFile
from pydantic import BaseModel, Field

from scripts import generate_api_reference as reference


class _NestedItem(BaseModel):
    """嵌套模型使用真实请求别名。"""

    display_name: str = Field(alias="displayName", description="名字 | 显示\n多行 <说明>")


class _CreateBody(BaseModel):
    """包含别名、嵌套集合及默认值的请求体。"""

    employee_key: str = Field(alias="employeeKey", min_length=1)
    items: list[_NestedItem]
    enabled: bool = False


def _contract_app() -> FastAPI:
    """构造通过两层 include_router 注册、含查询参数和表单的独立应用。"""
    child = APIRouter(prefix="/widgets")

    @child.post("/{widget_id}")
    def create_widget(
        widget_id: str,
        body: _CreateBody,
        page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
        request_id: Annotated[str | None, Header(alias="X-Request-ID")] = None,
    ):
        return {"id": widget_id}

    @child.post("/{widget_id}/upload")
    def upload_widget(widget_id: str, file: Annotated[UploadFile, File()]):
        return {"id": widget_id}

    @child.get("/hidden", include_in_schema=False)
    def hidden_widget():
        return {}

    parent = APIRouter(prefix="/v2")
    parent.include_router(child)
    app = FastAPI()
    app.include_router(parent, prefix="/api")
    return app


def test_nested_routers_parameters_aliases_and_upload_models():
    """接口与模型需反映线上的参数别名、必填性和上传媒体类型。"""
    schema = _contract_app().openapi()
    rows = reference._route_rows(schema)
    assert {(row.method, row.path) for row in rows} == {
        ("POST", "/api/v2/widgets/{widget_id}"),
        ("POST", "/api/v2/widgets/{widget_id}/upload"),
    }
    create = next(row for row in rows if row.path.endswith("{widget_id}"))
    parameters = {item["name"]: item for item in create.parameters}
    assert parameters["widget_id"]["required"] is True
    assert parameters["pageSize"]["in"] == "query"
    assert parameters["pageSize"]["required"] is False
    assert parameters["pageSize"]["schema"]["default"] == 20
    assert parameters["X-Request-ID"]["in"] == "header"
    assert create.request_body["required"] is True

    table = reference._table(rows)
    assert "query pageSize：integer，可选；默认值：20；minimum=1；maximum=100" in table
    assert "header X-Request-ID：" in table
    assert "application/json：_CreateBody，必填" in table
    assert "multipart/form-data：" in table
    models = reference._models(schema)
    assert "| `employeeKey` | string | 是 |" in models
    assert "| `displayName` | string | 是 |" in models
    assert "array&lt;_NestedItem&gt;" in models
    assert "| `enabled` | boolean | 否 | 默认值：false |" in models
    assert "名字 &#124; 显示<br>多行 &lt;说明&gt;" in models
    assert "string (application/octet-stream)" in models or "string (binary)" in models
    assert "employee_key" not in models


def test_one_endpoint_with_multiple_methods_keeps_each_operation():
    """不能按端点名称或共享 operationId 去重而遗漏一个 HTTP 方法。"""
    router = APIRouter()

    @router.api_route("/items", methods=["PUT", "PATCH"], operation_id="update_item")
    def update_item():
        return {}

    app = FastAPI()
    app.include_router(router)
    with pytest.warns(UserWarning, match="Duplicate Operation ID"):
        schema = app.openapi()
    rows = reference._route_rows(schema)
    assert [(row.method, row.path, row.operation_id) for row in rows] == [
        ("PATCH", "/items", "update_item"),
        ("PUT", "/items", "update_item"),
    ]


def test_path_parameters_and_local_references_follow_openapi_override_rules():
    """路径级参数继承与操作级覆盖不能出现同名重复或错误的必填性。"""
    schema = {
        "paths": {
            "/items": {
                "summary": "不是 HTTP 方法",
                "parameters": [
                    {"$ref": "#/components/parameters/Limit"},
                    {"name": "X-Tenant", "in": "header", "required": True, "schema": {"type": "string"}},
                ],
                "post": {
                    "operationId": "create",
                    "parameters": [{"name": "limit", "in": "query", "required": True, "schema": {"type": "integer"}}],
                    "requestBody": {"$ref": "#/components/requestBodies/Create"},
                },
            },
        },
        "components": {
            "parameters": {"Limit": {"name": "limit", "in": "query", "required": False, "schema": {"type": "integer"}}},
            "requestBodies": {"Create": {"required": True, "content": {"application/json": {"schema": {"type": "object"}}}}},
        },
    }
    rows = reference._route_rows(schema)
    assert len(rows) == 1
    assert len(rows[0].parameters) == 2
    assert rows[0].parameters[0]["required"] is True
    assert rows[0].parameters[1]["name"] == "X-Tenant"
    assert reference._body_text(rows[0].request_body) == "application/json：object，必填"


def test_check_missing_document_reports_action_without_loading_apps(tmp_path, monkeypatch, capsys):
    """缺文件检查应直接给出修复指令并失败，而不是读文件后抛异常。"""
    missing = tmp_path / "missing.md"
    monkeypatch.setattr(reference, "OUTPUT", missing)

    def unexpected_render():
        pytest.fail("缺文件时不应导入应用或生成完整文档")

    monkeypatch.setattr(reference, "render", unexpected_render)
    assert reference.main(["--check"]) == 1
    assert not missing.exists()
    assert "文档不存在" in capsys.readouterr().err


def test_generate_and_check_distinguish_stale_content_without_overwriting(tmp_path, monkeypatch, capsys):
    """生成能创建目录，检查过期文件不会悄悄覆盖用户已保存的版本。"""
    output = tmp_path / "docs" / "api.md"
    monkeypatch.setattr(reference, "OUTPUT", output)
    monkeypatch.setattr(reference, "render", lambda: "新版接口文档\n")
    assert reference.main([]) == 0
    assert output.read_text(encoding="utf-8") == "新版接口文档\n"
    assert reference.main(["--check"]) == 0

    output.write_text("旧版接口文档", encoding="utf-8")
    assert reference.main(["--check"]) == 1
    assert output.read_text(encoding="utf-8") == "旧版接口文档"
    assert "文档已过期" in capsys.readouterr().err


def test_check_unreadable_text_reports_error_without_traceback(tmp_path, monkeypatch, capsys):
    """损坏编码应报告文件读取失败，不输出裸 traceback。"""
    output = tmp_path / "broken.md"
    output.write_bytes(bytes([255]))
    monkeypatch.setattr(reference, "OUTPUT", output)
    monkeypatch.setattr(reference, "render", lambda: "当前内容")
    assert reference.main(["--check"]) == 1
    error = capsys.readouterr().err
    assert "读取失败" in error
    assert "Traceback" not in error


def _expected_operations(schema):
    """独立按 OpenAPI 规范列出方法，用于与生成后的 Markdown 清单比较。"""
    return {
        (method.upper(), path)
        for path, item in schema["paths"].items()
        for method in ("get", "put", "post", "delete", "options", "head", "patch", "trace")
        if method in item
    }


def test_real_service_inventories_and_committed_document_match_openapi():
    """逐方法比较真实应用的完整清单，不用写死的接口数量掩盖遗漏。"""
    from admin.main import app as admin_app
    from app.main import app as user_app

    rendered = reference.render()
    user_table = rendered.split("## 7. 用户端接口清单\n\n", 1)[1].split("## 8. 管理端接口清单", 1)[0]
    admin_table = rendered.split("## 8. 管理端接口清单\n\n", 1)[1].split("## 9. 用户端组件模型", 1)[0]
    for app, table in ((user_app, user_table), (admin_app, admin_table)):
        actual = re.findall(r"^\| `([A-Z]+)` \| `([^`]+)` \|", table, re.MULTILINE)
        expected = _expected_operations(app.openapi())
        assert set(actual) == expected
        assert len(actual) == len(expected)
        assert all(path not in {"/docs", "/redoc", "/openapi.json"} for _, path in actual)

    assert reference.OUTPUT.read_text(encoding="utf-8") == rendered


def test_guidance_method_paths_exist_in_real_services():
    """手写业务步骤引用的路径也必须存在，避免清单正确而入门示例失效。"""
    from admin.main import app as admin_app
    from app.main import app as user_app

    operations = _expected_operations(user_app.openapi()) | _expected_operations(admin_app.openapi())
    for method, path in re.findall(r"`(GET|POST|PUT|PATCH|DELETE) ([^`]+)`", reference.GUIDANCE):
        if path.startswith(("/production/", "/director/")):
            path = "/api/v1/agentapp" + path
        elif path.startswith("/workbench/"):
            path = "/api/v1/agentapp/canvas" + path
        assert (method, path) in operations
