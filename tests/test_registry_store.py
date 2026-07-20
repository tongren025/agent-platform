"""service 单元层 —— 文件存储的 CRUD / 键校验 / 时间戳语义。

全部指向 tmp（见 conftest 的 make_registry / provider_store），不碰真实 data/。
这层锁住「持久化契约」：只要 FileJsonRegistry / AiProviderStore 的读写路径被改坏，立刻红。
"""
from __future__ import annotations

import json

import pytest
from cryptography.fernet import Fernet
from fastapi import HTTPException

from app.models.registry import EmployeeDefinition, SkillDefinition
from app.services.ai import AiProviderStore, ProviderSecretError


# ── FileJsonRegistry ───────────────────────────────────────────────

def test_registry_crud_roundtrip(make_registry):
    reg = make_registry(EmployeeDefinition, "employees")
    assert reg.list_all() == []

    reg.save(EmployeeDefinition(employee_key="emp-1", name="测试员工"))

    assert reg.exists("emp-1")
    loaded = reg.get("emp-1")
    assert loaded is not None
    assert loaded.name == "测试员工"
    assert len(reg.list_all()) == 1

    assert reg.delete("emp-1") is True
    assert reg.get("emp-1") is None
    # 二次删除幂等返回 False
    assert reg.delete("emp-1") is False


def test_registry_list_sorted_by_sort_order(make_registry):
    reg = make_registry(SkillDefinition, "skills")
    reg.save(SkillDefinition(code="b", name="B", sort_order=2))
    reg.save(SkillDefinition(code="a", name="A", sort_order=1))

    keys = [s.code for s in reg.list_all()]
    assert keys == ["a", "b"]


def test_registry_save_preserves_created_at(make_registry):
    reg = make_registry(SkillDefinition, "skills")
    reg.save(SkillDefinition(code="s1", name="one"))
    first_created = reg.get("s1").created_at

    reg.save(SkillDefinition(code="s1", name="two"))
    updated = reg.get("s1")

    assert updated.name == "two"                 # 覆盖写生效
    assert updated.created_at == first_created    # created_at 保留
    assert updated.updated_at >= first_created    # updated_at 前移


@pytest.mark.parametrize("bad_key", ["../etc/passwd", "a/b", "a\\b", "..", ""])
def test_registry_rejects_bad_key(make_registry, bad_key):
    reg = make_registry(SkillDefinition, "skills")
    with pytest.raises(ValueError):
        reg.get(bad_key)


# ── AiProviderStore ────────────────────────────────────────────────

def _provider(name: str) -> dict:
    return {
        "name": name,
        "endpoint": "http://example.local/v1",
        "apiKey": "sk-test",
        "enabled": True,
        "models": [{"modelName": "gpt-x", "modelId": "gpt-x"}],
    }


def test_provider_store_crud(provider_store):
    assert provider_store.list_all() == []

    provider_store.save(_provider("openai"))
    got = provider_store.get("openai")
    assert got is not None
    assert got["endpoint"] == "http://example.local/v1"
    assert got["apiKey"] == "sk-test"
    assert len(provider_store.list_all()) == 1

    disk_text = (provider_store.provider_dir / "openai.json").read_text(encoding="utf-8")
    disk_data = json.loads(disk_text)
    assert "sk-test" not in disk_text
    assert "apiKey" not in disk_data
    assert disk_data["apiKeyStorage"] == "fernet-v1"
    assert disk_data["apiKeyEncrypted"].startswith("fernet:v1:")

    assert provider_store.delete("openai") is True
    assert provider_store.get("openai") is None
    assert provider_store.delete("openai") is False


@pytest.mark.parametrize("bad_name", ["../secret", "a/b", "a\\b", ""])
def test_provider_store_rejects_bad_name(provider_store, bad_name):
    with pytest.raises(ValueError):
        provider_store.get(bad_name)


def test_provider_store_to_ai_configs(provider_store):
    provider_store.save(_provider("p1"))
    configs = provider_store.to_ai_configs()

    assert len(configs) == 1
    cfg = configs[0]
    assert cfg.name == "p1"
    assert cfg.endpoint == "http://example.local/v1"
    assert cfg.api_key == "sk-test"
    assert cfg.enabled is True
    assert cfg.models == [{"modelName": "gpt-x", "modelId": "gpt-x"}]


def test_provider_store_restart_can_decrypt(provider_store):
    """模拟服务重启：同一服务器主密钥必须能重新读取已保存 Key。"""
    provider_store.save(_provider("restart"))

    restarted = AiProviderStore(provider_dir=provider_store.provider_dir)

    assert restarted.get("restart")["apiKey"] == "sk-test"


def test_provider_store_keeps_env_reference_plain(provider_store):
    """环境变量引用不是密钥，可原样保留并在运行时解析。"""
    data = _provider("openrouter")
    data["apiKey"] = "${OPENROUTER_API_KEY}"

    provider_store.save(data)

    disk_data = json.loads(
        (provider_store.provider_dir / "openrouter.json").read_text(encoding="utf-8")
    )
    assert disk_data["apiKey"] == "${OPENROUTER_API_KEY}"
    assert "apiKeyEncrypted" not in disk_data


def test_provider_store_migrates_legacy_plaintext(provider_store):
    """读取旧版明文 JSON 时自动加密改写，不要求用户手工迁移。"""
    fp = provider_store.provider_dir / "legacy.json"
    fp.write_text(json.dumps(_provider("legacy")), encoding="utf-8")

    loaded = provider_store.get("legacy")

    assert loaded["apiKey"] == "sk-test"
    migrated_text = fp.read_text(encoding="utf-8")
    assert "sk-test" not in migrated_text
    assert "apiKeyEncrypted" in json.loads(migrated_text)


def test_provider_store_auto_generated_key_persists(tmp_path, monkeypatch):
    """未配置环境主密钥时，服务器在 data 持久卷生成并复用本地主密钥。"""
    monkeypatch.delenv("AI_PROVIDER_ENCRYPTION_KEY", raising=False)
    provider_dir = tmp_path / "data" / "ai-providers"
    first = AiProviderStore(provider_dir=provider_dir)
    first.save(_provider("generated"))

    key_file = tmp_path / "data" / ".secrets" / "provider-encryption.key"
    assert key_file.exists()
    assert "sk-test" not in key_file.read_text(encoding="ascii")

    restarted = AiProviderStore(provider_dir=provider_dir)
    assert restarted.get("generated")["apiKey"] == "sk-test"


def test_provider_store_rejects_wrong_master_key(tmp_path):
    """主密钥丢失或换错时失败关闭，不能把密文误当成可用 Key。"""
    provider_dir = tmp_path / "ai-providers"
    first = AiProviderStore(
        provider_dir=provider_dir,
        encryption_key=Fernet.generate_key(),
    )
    first.save(_provider("wrong-key"))
    second = AiProviderStore(
        provider_dir=provider_dir,
        encryption_key=Fernet.generate_key(),
    )

    with pytest.raises(ProviderSecretError, match="无法解密"):
        second.get("wrong-key")


def test_user_provider_api_never_returns_plaintext(provider_store, monkeypatch):
    """用户端新增/详情响应都只能返回掩码，不能把后台 Key 回传浏览器。"""
    import app.api.ai_providers as api_mod

    monkeypatch.setattr(api_mod.ai_service, "_store", provider_store)
    body = api_mod.AiProviderBody(**_provider("user-api"))

    created = api_mod.save_ai_provider(body)["data"]
    detail = api_mod.get_ai_provider("user-api")["data"]

    for response in (created, detail):
        assert "apiKey" not in response
        assert "apiKeyEncrypted" not in response
        assert response["hasApiKey"] is True
        assert response["apiKeyMasked"] == "****"

    updated = api_mod.update_ai_provider(
        "user-api",
        api_mod.AiProviderBody(
            name="user-api",
            endpoint="http://changed.local/v1",
            apiKey="",
            enabled=True,
            models=[],
        ),
    )["data"]
    assert "apiKey" not in updated
    assert provider_store.get("user-api")["apiKey"] == "sk-test"


def test_provider_api_requires_key_for_new_managed_provider(provider_store, monkeypatch):
    """新建或从配置文件转托管时必须提交 Key，防止空值覆盖可用的环境配置。"""
    import app.api.ai_providers as api_mod

    monkeypatch.setattr(api_mod.ai_service, "_store", provider_store)
    body = api_mod.AiProviderBody(
        name="empty",
        endpoint="http://example.local/v1",
        apiKey="",
        enabled=True,
        models=[],
    )

    with pytest.raises(HTTPException) as exc_info:
        api_mod.save_ai_provider(body)
    assert exc_info.value.status_code == 400


def test_admin_provider_api_never_returns_plaintext(provider_store, monkeypatch):
    """管理端保存与留空更新均不回传明文，并能保留服务器上的旧 Key。"""
    import admin.api.providers as api_mod

    monkeypatch.setattr(api_mod.ai_service, "_store", provider_store)
    created = api_mod.save_provider(api_mod.ProviderBody(**_provider("admin-api")), {})["data"]
    updated = api_mod.update_provider(
        "admin-api",
        api_mod.ProviderBody(
            name="admin-api",
            endpoint="http://changed.local/v1",
            apiKey="",
            enabled=True,
            models=[],
        ),
        {},
    )["data"]

    for response in (created, updated):
        assert "apiKey" not in response
        assert "apiKeyEncrypted" not in response
        assert response["hasApiKey"] is True
    assert provider_store.get("admin-api")["apiKey"] == "sk-test"
