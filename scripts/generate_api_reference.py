"""从两个服务的 OpenAPI 生成接口接入手册、请求参数和模型字段清单。

运行 python scripts/generate_api_reference.py 生成文档；使用 --check 校验版本库
中的文档是否同步。只导入应用并读取 OpenAPI，不启动服务，也不执行业务端点。
"""
from __future__ import annotations

import argparse
import html
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "API_REFERENCE.md"
HTTP_METHODS = frozenset({"get", "put", "post", "delete", "options", "head", "patch", "trace"})
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


@dataclass(frozen=True)
class Operation:
    """OpenAPI 中一个 HTTP 方法的展示信息，保留参数别名和请求体声明。"""

    method: str
    path: str
    operation_id: str
    summary: str
    parameters: tuple[dict[str, Any], ...]
    request_body: dict[str, Any]


def _resolve_ref(value: dict[str, Any], schema: dict[str, Any]) -> dict[str, Any]:
    """解析文档内的 JSON Pointer 引用；外部或无法解析的引用保持原样。"""
    visited: set[str] = set()
    while isinstance(value.get("$ref"), str):
        reference = value["$ref"]
        if not reference.startswith("#/") or reference in visited:
            break
        visited.add(reference)
        target: Any = schema
        for segment in reference[2:].split("/"):
            key = segment.replace("~1", "/").replace("~0", "~")
            if not isinstance(target, dict) or key not in target:
                return value
            target = target[key]
        if not isinstance(target, dict):
            return value
        value = {**target, **{key: item for key, item in value.items() if key != "$ref"}}
    return value


def _route_rows(schema: dict[str, Any]) -> list[Operation]:
    """按路径和方法读取真实 OpenAPI operations，兼容嵌套路由与多方法端点。"""
    rows: list[Operation] = []
    for path, raw_item in sorted(schema.get("paths", {}).items()):
        path_item = _resolve_ref(raw_item, schema)
        for method in sorted(HTTP_METHODS & path_item.keys()):
            operation = path_item[method]
            # 同名同位置的操作级参数覆盖路径级参数，遵循 OpenAPI 的继承规则。
            parameters: dict[tuple[str, str], dict[str, Any]] = {}
            for raw_parameter in [*path_item.get("parameters", []), *operation.get("parameters", [])]:
                parameter = _resolve_ref(raw_parameter, schema)
                parameters[(parameter.get("in", ""), parameter.get("name", ""))] = parameter
            description = str(operation.get("description", "")).strip()
            summary = description.splitlines()[0] if description else operation.get("summary", "")
            rows.append(Operation(
                method=method.upper(),
                path=path,
                operation_id=operation.get("operationId", ""),
                summary=str(summary),
                parameters=tuple(parameters.values()),
                request_body=_resolve_ref(operation.get("requestBody", {}), schema),
            ))
    return rows


def _cell(value: Any) -> str:
    """转义 Markdown 表格中的 HTML、竖线和换行，避免字段说明破坏排版。"""
    return html.escape(str(value), quote=False).replace("|", "&#124;").replace("\r", "").replace("\n", "<br>")


def _json(value: Any) -> str:
    """以紧凑 JSON 展示默认值和枚举，保留中文。"""
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def _schema_type(schema: dict[str, Any] | bool) -> str:
    """将常见 JSON Schema 类型压缩为可读表达式，保留引用、联合和容器类型。"""
    if isinstance(schema, bool):
        return "任意值" if schema else "不允许"
    if "$ref" in schema:
        return schema["$ref"].rsplit("/", 1)[-1].replace("~1", "/").replace("~0", "~")
    for keyword, separator in (("anyOf", " 或 "), ("oneOf", " 互斥或 "), ("allOf", " 且 ")):
        if keyword in schema:
            return separator.join(_schema_type(item) for item in schema[keyword])
    value_type = schema.get("type", "object" if "properties" in schema else "未声明")
    if isinstance(value_type, list):
        result = " 或 ".join(value_type)
    elif value_type == "array":
        result = f"array<{_schema_type(schema.get('items', {}))}>"
    elif value_type == "object" and isinstance(schema.get("additionalProperties"), dict):
        result = f"object<string, {_schema_type(schema['additionalProperties'])}>"
    else:
        result = str(value_type)
    if schema.get("format"):
        result += f" ({schema['format']})"
    if schema.get("contentMediaType"):
        result += f" ({schema['contentMediaType']})"
    if schema.get("contentEncoding"):
        result += f" ({schema['contentEncoding']})"
    if schema.get("nullable") and "null" not in result:
        result += " 或 null"
    return result


def _schema_notes(schema: dict[str, Any]) -> str:
    """展示字段描述、默认值、枚举及常用长度/数值限制。"""
    notes: list[str] = []
    if schema.get("description"):
        notes.append(str(schema["description"]).strip())
    if "default" in schema:
        notes.append(f"默认值：{_json(schema['default'])}")
    if "enum" in schema:
        notes.append(f"可选值：{_json(schema['enum'])}")
    if "const" in schema:
        notes.append(f"固定值：{_json(schema['const'])}")
    for key in (
        "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
        "minLength", "maxLength", "pattern", "minItems", "maxItems", "uniqueItems",
    ):
        if key in schema:
            notes.append(f"{key}={_json(schema[key])}")
    return "；".join(notes)


def _parameters_text(parameters: tuple[dict[str, Any], ...]) -> str:
    """按请求中的原始名称展示 path/query/header/cookie 参数。"""
    parts: list[str] = []
    for parameter in parameters:
        schema = parameter.get("schema", {})
        required = "必填" if parameter.get("required") else "可选"
        text = f"{parameter.get('in', '?')} {parameter.get('name', '?')}：{_schema_type(schema)}，{required}"
        notes = _schema_notes({**schema, **({"description": parameter["description"]} if parameter.get("description") else {})})
        if notes:
            text += f"；{notes}"
        parts.append(_cell(text))
    return "<br>".join(parts) or "—"


def _body_text(body: dict[str, Any]) -> str:
    """显示请求体的媒体类型、必填性及模型；上传表单同样保留其声明。"""
    if not body:
        return "—"
    required = "必填" if body.get("required") else "可选"
    parts = [f"{media_type}：{_schema_type(content.get('schema', {}))}，{required}"
             for media_type, content in sorted(body.get("content", {}).items())]
    if body.get("description"):
        parts.append(str(body["description"]))
    return "<br>".join(_cell(part) for part in parts) or "未声明结构"


def _table(rows: list[Operation]) -> str:
    """生成方法清单，不把框架文档页面或静态挂载误算作业务操作。"""
    lines = [
        "| 方法 | 路径 | operationId | 用途 | 参数 | 请求体 |",
        "|---|---|---|---|---|---|",
    ]
    for row in rows:
        lines.append(
            f"| `{row.method}` | `{_cell(row.path)}` | `{_cell(row.operation_id)}` | "
            f"{_cell(row.summary)} | {_parameters_text(row.parameters)} | {_body_text(row.request_body)} |"
        )
    return "\n".join(lines)


def _models(schema: dict[str, Any]) -> str:
    """生成 OpenAPI 组件模型表，字段名使用实际请求/响应别名而非 Python 属性名。"""
    sections: list[str] = []
    for name, raw_model in sorted(schema.get("components", {}).get("schemas", {}).items()):
        model = _resolve_ref(raw_model, schema)
        lines = [f"### {_cell(name)}", ""]
        if model.get("description"):
            lines.extend([_cell(model["description"]), ""])
        properties = model.get("properties", {})
        if properties:
            required = set(model.get("required", []))
            lines.extend(["| 字段 | 类型 | 必填 | 说明 |", "|---|---|---|---|"])
            for field_name, field in properties.items():
                lines.append(
                    f"| `{_cell(field_name)}` | {_cell(_schema_type(field))} | "
                    f"{'是' if field_name in required else '否'} | {_cell(_schema_notes(field))} |"
                )
            if model.get("additionalProperties") is False:
                lines.extend(["", "不接受未声明字段。"])
        else:
            lines.append(f"类型：{_cell(_schema_type(model))}。{_cell(_schema_notes(model))}")
        sections.append("\n".join(lines))
    return "\n\n".join(sections) or "本服务未声明组件模型。"


GUIDANCE = """# API 参考与业务接入手册

> 本文件由 `scripts/generate_api_reference.py` 生成。接口清单、参数和模型字段来自两个服务的 `app.openapi()`；固定章节说明代码中的鉴权和业务约定。
> 清单覆盖 OpenAPI 已公开的方法，不包含 `include_in_schema=False` 的隐藏端点、静态文件挂载及框架自动提供的文档页，也不代表已对每个接口完成运行验收。服务启动后可访问 `/docs`、`/redoc` 和 `/openapi.json`。

## 1. 服务边界与鉴权

| 服务 | 默认地址 | 作用 | 鉴权 |
|---|---|---|---|
| 用户端 app | `http://127.0.0.1:8000` | 项目、生产看板、画布、员工、工作流和任务 | Bearer token，账号状态、写操作权限及项目成员校验 |
| 管理端 admin | `http://127.0.0.1:8001` | 用户、角色、供应商和系统概览 | Bearer token，受保护管理接口校验当前 `system:admin` 权限 |
| 同源管理代理 | 用户端 `/api/admin/*` | 将浏览器管理请求转发到 admin 服务 | 由目标管理服务校验，代理保留认证头 |

两个登录入口共用用户存储、`admin.auth` 的 HMAC token 签发/校验及 `ADMIN_SECRET`。部署使用相同密钥和用户数据时，token 可跨两个服务验证；能否执行操作取决于当前账号状态和权限，不能用“从哪个入口登录”代替权限判断。管理鉴权会实时检查账号存在且启用，管理操作按当前 `system:admin` 权限放行，token 中历史 `role` 不作为最终授权依据。

用户端默认开启 `USER_API_AUTH`：`/api/*` 需要 Bearer token，写操作按路径前缀映射权限；生产项目相关接口还会校验成员，管理员按实现豁免成员限制。`/api/v1/agentapp/auth/*` 自行校验登录或 token，`/api/admin/*` 转交管理服务，OPTIONS 预检、非 API 静态路径以及生产素材 `/resource/*` 的 GET/HEAD 不经过用户鉴权中间件。全局中间件的认证要求不会自动出现在每行 OpenAPI 参数中。

生产环境必须配置 `ADMIN_SECRET` 和安全的管理员初始口令；未配置密钥时仅开发环境允许使用固定开发密钥。两个进程应读取一致的配置。

## 2. 最小调用流程

### 用户端

```http
POST /api/v1/agentapp/auth/login
Content-Type: application/json

{"username":"alice","password":"***"}

GET /api/v1/agentapp/production/projects
Authorization: Bearer <data.token>
```

登录成功返回 `{"code":200,"data":{"token":"...","username":"...","displayName":"...","role":"..."}}`。后续业务请求使用 `Authorization: Bearer <token>`；`GET /api/v1/agentapp/auth/me` 返回当前身份和权限。兼容接口 `GET /api/v1/agentapp/auth/check` 接收 query 参数 `token`；新接入优先使用 `/me`，避免凭证进入 URL 日志。

### 管理端

```http
POST /api/admin/auth/login
Content-Type: application/json

{"username":"admin","password":"***"}

GET /api/admin/system/overview
Authorization: Bearer <data.token>
```

浏览器生产入口使用同源 `/api/admin/*`；开发调试可以直接访问 :8001。代理转发 HTTP 方法、查询串、请求体和非 hop-by-hop 请求头。登录成功不表示获得管理权限，受保护管理接口仍会重新授权。

## 3. 制作流程与真实交付状态

### 生产看板与导演工作台

下列 `/production` 和 `/director` 均指完整前缀 `/api/v1/agentapp/production`、`/api/v1/agentapp/director`。

1. `POST /production/projects` 创建项目；`POST /production/projects/{pid}/generate` 按 `target_stage`、员工及上下文生成阶段卡片。生成文本、提示词或卡片不等于生成图片和视频。
2. 调用具体生图或视频任务接口，读取返回的实际资源 URL、job 和状态；只有真实媒体结果才能进入素材验收。
3. 图片通过 `/production/projects/{pid}/cards/{card_id}/review` 记录评审，再通过 `/image-candidates/activate` 采用候选。视频对应 `/video-review` 和 `/video-candidates/activate`。具体完整路径与请求字段见接口清单。
4. 标记卡片 `done` 时，会阻止当前已登记、要求精品评审但尚未获准的媒体直接完成；该检查不等于所有手动卡片都做过质量检测。候选采用接口另外校验评审及精品分数。
5. `GET /director/projects/{project_id}` 查看镜头与成片状态。`POST /director/projects/{project_id}/compose` 使用就绪的镜头视频生成整片候选：镜头不齐或已过期时可返回 400；合成期间源镜头改变返回 409；合成服务异常返回 502。成功后 final 卡进入 `review`，仍需整片验收和采用。不要只凭 HTTP 200 或存在 final 卡判定可交付。

批量卡片接口按 `card_id` 找到项目并逐项校验成员权限；未知卡片静默跳过，已知但无权访问的项目返回 403。质量失败是否留下评审记录取决于调用的评审接口；普通请求被拒绝不保证自动写入返工记录。

### 画布工作台

画布接口前缀为 `/api/v1/agentapp/canvas`。`POST /workbench/tasks` 的文本和图片分支等待结果后返回，视频分支提交上游任务；应依据返回的 `status` 和素材字段继续处理。视频通过 `GET /workbench/tasks/{task_id}` 轮询，已不存在的上游任务返回 404，上游错误通常返回 502。`GET /workbench/assets` 必须带 `project_id`。

### 工作流、队列与 CLI 流水线

- `/api/v1/agentapp/workflow` 管理工作流定义及运行；`/api/v1/agentapp/tasks` 提供 Redis 异步任务。队列不可用时任务列表降级为空列表，入队及具体任务查询返回 503；空列表不能用作“任务已完成”的证据。
- `POST /api/v1/pipeline/run` 等待本地 CLI 流水线执行结束再返回，不是 Redis 入队。没有可用 CLI 时返回 503。该流水线的 `finalFile` 与 `GET /api/v1/pipeline/runs/{run_id}/final` 指 Markdown 合并文档，不是商业成片视频。

## 4. 请求和响应约定

- 多数业务成功响应使用 `{"code":200,"data":...}`。CLI pipeline 的成功响应直接返回对象或列表；媒体下载、健康探针、流式接口及代理响应也不能一律按该信封解析。
- 全局 HTTP 异常和参数校验失败使用 `{"code":<HTTP状态>,"message":"...","data":...,"requestId":"..."}`；`requestId` 在请求上下文可用时出现。422 的 `data` 包含字段错误数组。中间件错误可能不带 `requestId`，代理响应由上游定义。
- OpenAPI 自动生成的 `HTTPValidationError` 描述的是框架默认结构，尚未完整表达上述自定义错误信封；调用方以本节说明及实际响应为准。未声明响应模型的端点也不代表没有响应数据。
- 400 表示业务输入或前置条件不满足；401 表示凭证或账号状态无效；403 表示权限或成员检查失败；404 表示资源不存在；409 表示评审门禁或并发状态冲突；422 表示参数结构不匹配。具体接口可能只使用其中一部分。
- 部分上游调用将故障映射为 502，任务队列或 CLI 不可用使用 503。错误码的完整范围仍取决于具体端点，不能假设所有供应商或数据库故障都已统一映射。
- 上传接口按请求体栏使用 `multipart/form-data`；浏览器传入 `FormData` 时让 `fetch` 自动生成 boundary。请求体标为 `application/json` 的接口才发送 JSON。
- 参数栏保留请求的别名、位置、必填性、类型和约束。模型字段“可选”表示允许省略；只有类型包含 `null` 才声明可显式传 `null`。默认值未列出不代表没有服务端默认工厂。
- `GET /api/v1/agentapp/skills/list` 需要 `query`；画布素材索引需要 `project_id`。缺少必填参数返回 422。

## 5. 配置和启动

```powershell
# 在仓库根目录启动用户端
uvicorn app.main:app --host 0.0.0.0 --port 8000
# 在另一个终端启动管理端
uvicorn admin.main:app --host 0.0.0.0 --port 8001
# 在 web 目录启动前端开发服务
npm run dev
```

`ADMIN_API_URL` 控制同源管理代理目标（Compose 默认 `http://admin:8001`）；`Agent.AdminApiBaseUrl` 配置的是外部充值策略 API（开发配置为 :5040），不是本仓库管理服务。策略上传/查询依赖该外部系统，不能仅启动 :8001 就认为该能力可用。

`USE_DB_STORES=true` 需要 PostgreSQL；异步任务还需要 Redis 和 worker。供应商密钥应通过加密配置或环境变量提供。详细部署参数以 `README.md`、`.env.example` 和对应配置模块为准。

## 6. 排错与同步校验

先检查两个服务的 `GET /healthcheck`。它们只表示进程存活，不证明 Redis、数据库或供应商可用。401 检查 token、共享密钥与账号状态；403 检查当前权限及项目成员；422 对照下表的请求别名和必填参数；400/409 按响应说明修正前置素材、评审或并发状态；上游错误使用 `requestId` 联查服务日志。

```powershell
# 在仓库根目录执行
python scripts/generate_api_reference.py
python scripts/generate_api_reference.py --check
python -m pytest -q tests/test_api_reference.py
```

`--check` 会在文件缺失或内容过时时返回非零并给出修复命令，不会修改文件。生成过程只校验文档与当前 OpenAPI 是否同步，不访问上游服务或验证实际媒体效果。接口、请求模型或固定接入说明改变后应重新生成并提交文档。

"""


def render() -> str:
    """读取用户端和管理端 OpenAPI，生成说明、方法清单及组件模型表。"""
    from admin.main import app as admin_app
    from app.main import app as user_app

    user_schema = user_app.openapi()
    admin_schema = admin_app.openapi()
    user_rows = _route_rows(user_schema)
    admin_rows = _route_rows(admin_schema)
    return (
        GUIDANCE
        + f"当前 OpenAPI 公开方法：用户端 {len(user_rows)} 条，管理端 {len(admin_rows)} 条。\n\n"
        + "## 7. 用户端接口清单\n\n" + _table(user_rows)
        + "\n\n## 8. 管理端接口清单\n\n" + _table(admin_rows)
        + "\n\n## 9. 用户端组件模型\n\n" + _models(user_schema)
        + "\n\n## 10. 管理端组件模型\n\n" + _models(admin_schema)
        + "\n"
    )


def main(argv: list[str] | None = None) -> int:
    """生成或检查文档；缺失、过期及读写失败均给出明确说明和非零退出码。"""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="只校验，不写文件")
    args = parser.parse_args(argv)
    if args.check and not OUTPUT.is_file():
        print(f"接口文档不存在：{OUTPUT}。请运行 python scripts/generate_api_reference.py 生成。", file=sys.stderr)
        return 1
    rendered = render()
    try:
        if args.check:
            current = OUTPUT.read_text(encoding="utf-8")
            if current != rendered:
                print("接口文档已过期，请运行 python scripts/generate_api_reference.py 后提交更新。", file=sys.stderr)
                return 1
            print("接口文档与当前 OpenAPI 一致。")
            return 0
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(rendered, encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        print(f"接口文档{'读取' if args.check else '写入'}失败：{OUTPUT}（{exc}）", file=sys.stderr)
        return 1
    print(f"已生成接口文档：{OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
