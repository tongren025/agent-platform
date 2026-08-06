import json

from scripts import refresh_comic_profiles


def test_refresh_profiles_preserves_canonical_prompt_and_disabled_state(
    tmp_path, monkeypatch
):
    employee_key = "comic-disabled-example"
    employee_path = tmp_path / f"{employee_key}.json"
    original_prompt = "新的专业判断框架，不得被历史模板覆盖。"
    employee_path.write_text(
        json.dumps(
            {
                "employeeKey": employee_key,
                "name": "停用兼容岗位",
                "roleProfile": original_prompt,
                "enabled": False,
                "teamCode": None,
                "updatedAt": "2026-01-01T00:00:00Z",
            },
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(refresh_comic_profiles, "EMPLOYEE_DIR", tmp_path)
    monkeypatch.setattr(
        refresh_comic_profiles,
        "PROFILES",
        {employee_key: "过时的硬编码提示词"},
    )

    refresh_comic_profiles.refresh_profiles()

    refreshed = json.loads(employee_path.read_text(encoding="utf-8"))
    assert refreshed["roleProfile"] == original_prompt
    assert refreshed["enabled"] is False
    assert refreshed["name"] == "停用兼容岗位"
    assert refreshed["teamCode"] == "comic-drama-team"
    assert refreshed["updatedAt"] != "2026-01-01T00:00:00Z"
