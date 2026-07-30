"""系统管家服务的页面指导、诊断与确认门测试。"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from types import SimpleNamespace

import pytest

from app.models.registry import McpServerDefinition
from app.services.system_manager import SystemManagerService


class _Registry:
    def __init__(self, items=None):
        self.items = {item.get_key(): item for item in (items or [])}

    def list_all(self):
        return list(self.items.values())

    def get(self, key):
        return self.items.get(key)

    def save(self, item):
        self.items[item.get_key()] = item
        return item

    def delete(self, key):
        return self.items.pop(key, None) is not None


class _RunStore:
    def __init__(self, runs=None):
        self.runs = runs or []

    def list_runs(self, **_kwargs):
        return self.runs


@dataclass
class _Run:
    run_id: str = "run_failed"
    employee_key: str = "screenwriter"
    created_at: datetime = datetime(2026, 7, 30, tzinfo=timezone.utc)
    error_message: str = "模型返回空内容"


def _service(*, mcps=None, runs=None, root_dir=None, ai_service=None):
    return SystemManagerService(
        skill_registry=_Registry(),
        mcp_registry=_Registry(mcps),
        tool_registry=_Registry(),
        employee_registry=_Registry(),
        run_store=_RunStore(runs),
        ai_service=ai_service,
        root_dir=root_dir,
    )


def test_canvas_context_explains_next_steps():
    result = _service().context("/canvas?project=demo")

    assert result["page"]["title"] == "画布中心"
    assert result["page"]["steps"]
    assert result["inventory"]["mcpServers"] == 0


def test_context_redacts_mcp_env_and_reports_missing_login(monkeypatch):
    monkeypatch.delenv("DEMO_TOKEN", raising=False)
    mcp = McpServerDefinition(
        serverCode="demo",
        name="Demo",
        transportType="stdio",
        command="demo-command",
        env={"TOKEN": "${DEMO_TOKEN}"},
    )

    result = _service(mcps=[mcp]).context("/advanced/tools")

    assert result["mcpStatus"][0]["status"] == "auth_required"
    assert result["mcpStatus"][0]["missingEnvironmentVariables"] == ["DEMO_TOKEN"]
    assert "env" not in result["mcpStatus"][0]


def test_mcp_chat_requires_confirmation_and_never_accepts_literal_secret(tmp_path, monkeypatch):
    service = _service(root_dir=tmp_path / "manager")
    monkeypatch.setattr(service, "_audit_path", lambda: tmp_path / "audit.jsonl")
    valid = (
        '请添加 MCP {"serverCode":"demo","name":"Demo","transportType":"stdio",'
        '"command":"demo","env":{"TOKEN":"${DEMO_TOKEN}"}}'
    )

    reply = service.chat(valid, "/advanced/tools")
    assert reply["proposal"]["action"] == "add_mcp"
    assert service._mcps.get("demo") is None

    result = service.confirm(reply["proposal"]["proposalId"])
    assert result["action"] == "add_mcp"
    assert service._mcps.get("demo") is not None
    audit = service._audit_path().read_text(encoding="utf-8")
    assert "literal-secret" not in audit
    assert '"action": "add_mcp"' in audit

    with pytest.raises(ValueError, match="不能直接写入"):
        service.chat(
            '添加 MCP {"serverCode":"bad","name":"Bad","command":"bad",'
            '"env":{"TOKEN":"literal-secret"}}',
            "/advanced/tools",
        )


def test_recent_failure_is_explained(tmp_path):
    reply = _service(runs=[_Run()], root_dir=tmp_path / "manager").chat(
        "刚才一直生成，看看日志为什么失败",
        "/production/demo",
    )

    assert reply["mode"] == "diagnose"
    assert "模型返回空内容" in reply["answer"]
    assert "run_failed" in reply["answer"]


def test_system_manager_api_exposes_page_context(app_client, tmp_path, monkeypatch):
    from app.dependencies import system_manager

    monkeypatch.setattr(system_manager, "_root", tmp_path / "manager")
    response = app_client.get(
        "/api/v1/agentapp/system-manager/context",
        params={"pagePath": "/canvas"},
    )

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["page"]["title"] == "画布中心"
    assert "knowledgeSources" in payload


def test_system_manager_chat_api_returns_actionable_guide(app_client, tmp_path, monkeypatch):
    from app.dependencies import system_manager

    monkeypatch.setattr(system_manager, "_root", tmp_path / "manager")
    response = app_client.post(
        "/api/v1/agentapp/system-manager/chat",
        json={"message": "告诉我下一步", "pagePath": "/canvas"},
    )

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["mode"] == "guide"
    assert "建议下一步" in payload["answer"]


def test_natural_language_mcp_infers_config_without_server_code(tmp_path):
    service = _service(root_dir=tmp_path / "manager")

    reply = service.chat("帮我添加 MCP：https://example.com/mcp，需要 OAuth 登录", "/advanced/tools")

    assert reply["proposal"]["action"] == "add_mcp"
    proposal = service._consume_proposal(reply["proposal"]["proposalId"], "local")
    definition = proposal.payload["definition"]
    assert definition["serverCode"] == "example-com"
    assert definition["transportType"] == "streamable_http"
    assert definition["authType"] == "oauth"
    assert definition["name"] == "Example"


def test_initial_mcp_message_respects_explicit_display_name(tmp_path):
    service = _service(root_dir=tmp_path / "manager")

    reply = service.chat(
        "帮我添加 MCP：https://mcp.notion.com/mcp，名称叫我的 Notion 知识库，需要 OAuth 登录",
        "/advanced/tools",
    )
    proposal = service._consume_proposal(reply["proposal"]["proposalId"], "local")

    assert proposal.payload["definition"]["name"] == "我的 Notion 知识库"
    assert "我的 Notion 知识库" in reply["answer"]


def test_followup_can_rename_pending_mcp_by_pronoun(tmp_path):
    service = _service(root_dir=tmp_path / "manager")
    first = service.chat(
        "添加 MCP：https://mcp.notion.com/mcp，需要 OAuth 登录",
        "/advanced/tools",
        owner="alice",
    )

    second = service.chat(
        "把它的名字改成内容知识库",
        "/advanced/tools",
        owner="alice",
        session_id=first["sessionId"],
    )

    assert second["proposal"]["action"] == "add_mcp"
    changed = service.confirm(second["proposal"]["proposalId"], owner="alice")
    assert changed["resource"]["name"] == "内容知识库"
    with pytest.raises(ValueError, match="不存在|已经执行|已过期"):
        service.confirm(first["proposal"]["proposalId"], owner="alice")

    session = service.get_session("alice", first["sessionId"])
    assert session["state"]["focusedResource"]["code"] == "mcp-notion-com"
    assert session["state"]["focusedResource"]["name"] == "内容知识库"


def test_followup_can_rename_installed_mcp_without_changing_code(tmp_path):
    service = _service(root_dir=tmp_path / "manager")
    first = service.chat(
        "添加 MCP：https://mcp.notion.com/mcp",
        "/advanced/tools",
        owner="alice",
    )
    service.confirm(first["proposal"]["proposalId"], owner="alice")

    rename = service.chat(
        "名字改成 Notion 正式库",
        "/advanced/tools",
        owner="alice",
        session_id=first["sessionId"],
    )
    result = service.confirm(rename["proposal"]["proposalId"], owner="alice")

    assert result["action"] == "rename_mcp"
    assert result["resource"]["serverCode"] == "mcp-notion-com"
    assert service._mcps.get("mcp-notion-com").name == "Notion 正式库"


class _FakeAiService:
    def __init__(self):
        self.calls: list[dict] = []
        self.client = SimpleNamespace(
            _agent_provider_name="test-provider",
            chat=SimpleNamespace(
                completions=SimpleNamespace(create=self._create),
            ),
        )

    def _create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(content="我记得上一轮内容。", tool_calls=None),
                    finish_reason="stop",
                )
            ],
            usage=None,
        )

    def get_default_client(self):
        return self.client, "test-model"

    def get_client(self, _model_ref):
        return self.client, "test-model"


def test_model_fallback_receives_real_conversation_history(tmp_path, monkeypatch):
    from app.config import settings

    monkeypatch.setattr(settings.agent, "system_manager_model", "")
    ai = _FakeAiService()
    service = _service(root_dir=tmp_path / "manager", ai_service=ai)
    first = service.chat("请记住我把这个环境叫做北区", "/settings", owner="alice")
    second = service.chat(
        "我刚才怎么称呼这个环境？",
        "/settings",
        owner="alice",
        session_id=first["sessionId"],
    )

    payload = __import__("json").loads(ai.calls[-1]["messages"][1]["content"])
    history_text = "\n".join(item["content"] for item in payload["conversationHistory"])
    assert "北区" in history_text
    assert second["agent"]["modelReference"] == "test-provider:test-model"
    assert second["agent"]["decisionSource"] == "model"
    assert second["agent"]["contextMessages"] == 2


def test_manager_reports_actual_model_without_calling_model(tmp_path, monkeypatch):
    from app.config import settings

    monkeypatch.setattr(settings.agent, "system_manager_model", "")
    ai = _FakeAiService()
    service = _service(root_dir=tmp_path / "manager", ai_service=ai)

    reply = service.chat("你调用的什么模型？", "/advanced/tools", owner="alice")

    assert "test-provider:test-model" in reply["answer"]
    assert "平台默认模型" in reply["answer"]
    assert reply["agent"]["modelReference"] == "test-provider:test-model"
    assert reply["agent"]["decisionSource"] == "rules"
    assert ai.calls == []


def test_manager_session_survives_service_restart(tmp_path):
    root = tmp_path / "manager"
    first = _service(root_dir=root)
    reply = first.chat("告诉我下一步", "/canvas", owner="alice")

    second = _service(root_dir=root)
    session = second.get_session("alice", reply["sessionId"])

    assert [item["role"] for item in session["messages"]] == ["user", "assistant"]
    assert "画布中心" in session["messages"][1]["content"]


def test_mcp_change_can_be_rolled_back(tmp_path):
    service = _service(root_dir=tmp_path / "manager")
    reply = service.chat(
        '添加 MCP {"serverCode":"rollback-demo","name":"Rollback","command":"demo"}',
        "/advanced/tools",
    )
    changed = service.confirm(reply["proposal"]["proposalId"])
    assert service._mcps.get("rollback-demo") is not None

    rollback = service.propose_rollback(changed["changeId"])
    service.confirm(rollback["proposalId"])

    assert service._mcps.get("rollback-demo") is None


def test_uploaded_skill_is_risk_scanned_and_proposed(tmp_path):
    import io
    import zipfile

    archive = io.BytesIO()
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr(
            "demo-skill/SKILL.md",
            "---\nname: demo-skill\ndescription: 测试技能\nallowed-tools: [shell]\n---\n# Demo\n",
        )
        bundle.writestr("demo-skill/scripts/run.py", "print('not executed')\n")
    service = _service(root_dir=tmp_path / "manager")

    result = service.preview_uploaded_skill("demo.zip", archive.getvalue())

    assert result["proposal"]["action"] == "install_skill_archive"
    assert result["preview"]["skillCode"] == "demo-skill"
    assert len(result["preview"]["risks"]) == 2


def test_oauth_token_storage_is_encrypted(tmp_path, monkeypatch):
    from cryptography.fernet import Fernet
    from mcp.shared.auth import OAuthToken
    import app.services.mcp_oauth as oauth_module

    monkeypatch.setattr(oauth_module, "BASE_DIR", tmp_path)
    monkeypatch.setenv("AI_PROVIDER_ENCRYPTION_KEY", Fernet.generate_key().decode("ascii"))
    storage = oauth_module.EncryptedMcpTokenStorage("secure-mcp")
    import asyncio

    asyncio.run(storage.set_tokens(OAuthToken(access_token="top-secret", token_type="Bearer")))
    raw = (tmp_path / "data" / "mcp-auth" / "secure-mcp.json").read_text(encoding="utf-8")

    assert "top-secret" not in raw
    assert asyncio.run(storage.get_tokens()).access_token == "top-secret"


def test_system_manager_write_permissions_use_tool_manage():
    from app.core.auth import _required_write_perm

    base = "/api/v1/agentapp/system-manager"
    assert _required_write_perm(f"{base}/actions/confirm") == "tool:manage"
    assert _required_write_perm(f"{base}/skills/import") == "tool:manage"
    assert _required_write_perm(f"{base}/mcp/demo/oauth/start") == "tool:manage"
    assert _required_write_perm(f"{base}/chat") == "workbench:use"
