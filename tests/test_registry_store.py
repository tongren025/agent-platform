"""service 单元层 —— 文件存储的 CRUD / 键校验 / 时间戳语义。

全部指向 tmp（见 conftest 的 make_registry / provider_store），不碰真实 data/。
这层锁住「持久化契约」：只要 FileJsonRegistry / AiProviderStore 的读写路径被改坏，立刻红。
"""
from __future__ import annotations

import pytest

from app.models.registry import EmployeeDefinition, SkillDefinition


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
    assert len(provider_store.list_all()) == 1

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
    assert cfg.enabled is True
    assert cfg.models == [{"modelName": "gpt-x", "modelId": "gpt-x"}]
