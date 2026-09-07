"""员工协作规则升级必须幂等，且不得重置用户模型、工具或原有专业画像。"""
import json
from pathlib import Path
from types import SimpleNamespace

import pytest

from scripts.upgrade_comic_handoffs import MARKER, ROLE_NOTES, upgrade_profile, upgrade_profiles


@pytest.mark.parametrize("key", ROLE_NOTES)
def test_upgrade_preserves_original_profile_and_employee_configuration(key):
    employee = {
        "employeeKey": key, "roleProfile": "用户已有专业规则", "enabled": True,
        "defaultModelPolicy": {"model_id": "custom-model"}, "toolRefs": ["custom-tool"],
        "teamCode": "custom-team", "ownerUserId": "owner-1",
    }
    upgraded = upgrade_profile(employee)
    assert upgraded["roleProfile"].startswith(employee["roleProfile"])
    assert MARKER in upgraded["roleProfile"]
    assert "不编造" not in employee["roleProfile"]
    for field in employee.keys() - {"roleProfile"}:
        assert upgraded[field] == employee[field]
    assert upgrade_profile(upgraded) == upgraded


def test_upgrade_does_not_enable_disabled_or_unknown_roles():
    for key in ("comic-director", "comic-trajectory-artist", "my-employee"):
        employee = {"employeeKey": key, "roleProfile": "保留", "enabled": False}
        assert upgrade_profile(employee) == employee


def test_preview_does_not_write_and_explicit_upgrade_is_idempotent(tmp_path):
    for key in ROLE_NOTES:
        (tmp_path / f"{key}.json").write_text(json.dumps({
            "employeeKey": key, "roleProfile": "original", "enabled": True,
        }), encoding="utf-8")
    before = {path.name: path.read_bytes() for path in tmp_path.iterdir()}
    assert len(upgrade_profiles(tmp_path)) == 12
    assert {path.name: path.read_bytes() for path in tmp_path.iterdir()} == before
    assert len(upgrade_profiles(tmp_path, write=True)) == 12
    assert upgrade_profiles(tmp_path, write=True) == []


def test_all_active_bundled_employees_have_handoff_policy():
    root = Path(__file__).resolve().parents[1]
    for key in ROLE_NOTES:
        employee = json.loads((root / "data" / "employees" / f"{key}.json").read_text(encoding="utf-8"))
        assert MARKER in employee["roleProfile"]
        assert "付费授权" in employee["roleProfile"]
        assert "structuredSchema/输出合同" in employee["roleProfile"]


def test_runtime_output_contract_overrides_role_default(monkeypatch):
    from app.models.runtime import EmployeeRuntimeSnapshot
    from app.runtime.prompt import compile

    monkeypatch.setattr("app.dependencies.long_term_memory", SimpleNamespace(
        list_procedural=lambda _key: [], list_semantic=lambda _key: [], list_episodic=lambda _key: [],
    ))
    result = compile(
        EmployeeRuntimeSnapshot(employee_key="test-writer", system_prompt_block="默认输出 script_package"),
        [], structured_schema_json='{"type":"object","required":["cards"]}',
    )
    assert "本次输出合同优先于角色画像" in result.system_prompt
    assert '"required":["cards"]' in result.system_prompt
