"""内置漫剧配置 revision 迁移的覆盖、幂等与用户归属保护。"""
from __future__ import annotations

import json
from pathlib import Path
from types import SimpleNamespace

import pytest

from app.models.registry import (
    EmployeeDefinition,
    TeamDefinition,
    ToolDefinition,
)
from app.models.workflow import WorkflowDefinition
from app.services.builtin_registry_migration import (
    RegistryTarget,
    migrate_builtin_comic_registry,
)


class MemoryRegistry:
    """最小注册表替身；行为与 FileJsonRegistry 的 get/save 合同一致。"""

    def __init__(self):
        self.items = {}
        self.save_count = 0

    def get(self, key):
        return self.items.get(key)

    def save(self, item):
        key = item.get_key()
        if not key:
            raise ValueError("empty key")
        self.items[key] = item.model_copy(deep=True)
        self.save_count += 1
        return item


@pytest.fixture()
def registry_targets():
    registries = {
        "employees": MemoryRegistry(),
        "team": MemoryRegistry(),
        "tools": MemoryRegistry(),
        "workflows": MemoryRegistry(),
    }
    targets = {
        "employees": RegistryTarget(registries["employees"], EmployeeDefinition),
        "team": RegistryTarget(registries["team"], TeamDefinition),
        "tools": RegistryTarget(registries["tools"], ToolDefinition),
        "workflows": RegistryTarget(registries["workflows"], WorkflowDefinition),
    }
    return registries, targets


def _manifest(revision=3):
    return {
        "revision": revision,
        "employees": [
            {
                "employeeKey": "comic-writer",
                "name": "漫剧编剧",
                "roleProfile": "输出结构化剧本",
            },
        ],
        "team": [
            {
                "teamCode": "comic-drama-team",
                "name": "漫剧团队",
                "memberEmployeeKeys": ["comic-writer"],
            },
        ],
        "tools": [
            {
                "toolCode": "comic-render",
                "name": "漫剧渲染",
                "bindingCode": "comic_render",
            },
        ],
        "workflows": [
            {
                "workflowKey": "comic-flow",
                "name": "漫剧流程",
                "teamCode": "comic-drama-team",
                "nodes": [],
                "edges": [],
            },
        ],
    }


def _write_manifest(tmp_path: Path, payload: dict) -> Path:
    path = tmp_path / "comic_team_manifest.json"
    path.write_text(
        json.dumps(payload, ensure_ascii=False),
        encoding="utf-8",
    )
    return path


def test_bundled_manifest_matches_current_builtin_sources():
    """防止只改 data JSON 却忘记同步镜像内迁移清单。"""
    root = Path(__file__).resolve().parents[1]
    manifest = json.loads(
        (
            root / "app" / "resources" / "comic_team_manifest.json"
        ).read_text(encoding="utf-8")
    )
    expected_employees = [
        json.loads(path.read_text(encoding="utf-8"))
        for path in sorted(
            (root / "data" / "employees").glob("comic-*.json")
        )
    ]
    expected_tools = [
        json.loads(
            (
                root / "data" / "tools" / f"{tool_code}.json"
            ).read_text(encoding="utf-8")
        )
        for tool_code in (
            "generate_image",
            "generate_video",
            "check_video_generation",
            "inspect_media",
        )
    ]
    expected_workflows = [
        json.loads(
            (
                root / "data" / "workflows" / f"{workflow_key}.json"
            ).read_text(encoding="utf-8")
        )
        for workflow_key in ("comic-drama", "comic-drama-10s")
    ]

    assert manifest["revision"] == 3
    assert sorted(
        manifest["employees"],
        key=lambda item: item["employeeKey"],
    ) == expected_employees
    assert manifest["team"] == [
        json.loads(
            (
                root / "data" / "teams" / "comic-drama-team.json"
            ).read_text(encoding="utf-8")
        )
    ]
    assert manifest["tools"] == expected_tools
    assert manifest["workflows"] == expected_workflows


def test_first_import_creates_strongly_typed_entities_with_revision(
    tmp_path,
    registry_targets,
):
    """首次启动创建四类实体，并把顶层 revision 写进 managedRevision extra。"""
    registries, targets = registry_targets
    path = _write_manifest(tmp_path, _manifest(revision=7))

    stats = migrate_builtin_comic_registry(path, targets=targets)

    assert stats["manifest_found"] is True
    assert stats["revision"] == 7
    assert stats["created"] == 4
    assert stats["updated"] == 0
    assert stats["failed"] == 0
    assert isinstance(registries["employees"].get("comic-writer"), EmployeeDefinition)
    assert isinstance(registries["team"].get("comic-drama-team"), TeamDefinition)
    assert isinstance(registries["tools"].get("comic-render"), ToolDefinition)
    assert isinstance(registries["workflows"].get("comic-flow"), WorkflowDefinition)
    for registry in registries.values():
        entity = next(iter(registry.items.values()))
        assert entity.model_extra["managedRevision"] == 7


def test_existing_file_registry_persists_managed_revision(
    tmp_path,
    registry_targets,
):
    """使用真实 FileJsonRegistry.save 落盘，确认 extra revision 可跨读取保留。"""
    from app.services.registry import EmployeeRegistryService

    registries, targets = registry_targets
    file_registry = EmployeeRegistryService()
    file_registry._dir = tmp_path / "employees"
    file_registry._dir.mkdir(parents=True)
    targets["employees"] = RegistryTarget(file_registry, EmployeeDefinition)
    payload = _manifest(revision=5)
    payload["team"] = []
    payload["tools"] = []
    payload["workflows"] = []
    path = _write_manifest(tmp_path, payload)

    stats = migrate_builtin_comic_registry(path, targets=targets)

    stored = json.loads(
        (file_registry._dir / "comic-writer.json").read_text(encoding="utf-8")
    )
    reloaded = file_registry.get("comic-writer")
    second = migrate_builtin_comic_registry(path, targets=targets)
    assert stats["created"] == 1
    assert stored["managedRevision"] == 5
    assert reloaded.model_extra["managedRevision"] == 5
    assert second["skipped_revision"] == 1
    assert not registries["team"].items


def test_second_import_is_idempotent(tmp_path, registry_targets):
    """相同 manifest 重跑不再次保存任何实体。"""
    registries, targets = registry_targets
    path = _write_manifest(tmp_path, _manifest(revision=3))
    first = migrate_builtin_comic_registry(path, targets=targets)
    save_counts = {
        category: registry.save_count
        for category, registry in registries.items()
    }

    second = migrate_builtin_comic_registry(path, targets=targets)

    assert first["created"] == 4
    assert second["created"] == 0
    assert second["updated"] == 0
    assert second["skipped_revision"] == 4
    assert {
        category: registry.save_count
        for category, registry in registries.items()
    } == save_counts


def test_owner_entity_is_never_overwritten(tmp_path, registry_targets):
    """ownerUserId 非空时，即使 revision 较旧也保护用户实体。"""
    registries, targets = registry_targets
    employee = EmployeeDefinition.model_validate({
        "employeeKey": "comic-writer",
        "name": "用户自己的编剧",
        "ownerUserId": "user-1",
        "managedRevision": 1,
    })
    registries["employees"].save(employee)
    save_count = registries["employees"].save_count
    payload = _manifest(revision=8)
    payload["team"] = []
    payload["tools"] = []
    payload["workflows"] = []
    path = _write_manifest(tmp_path, payload)

    stats = migrate_builtin_comic_registry(path, targets=targets)

    current = registries["employees"].get("comic-writer")
    assert stats["skipped_owner"] == 1
    assert current.name == "用户自己的编剧"
    assert current.model_extra["managedRevision"] == 1
    assert registries["employees"].save_count == save_count


def test_same_revision_preserves_later_manual_edit(tmp_path, registry_targets):
    """系统导入后用户手动编辑，manifest revision 未升级时不回写覆盖。"""
    registries, targets = registry_targets
    path = _write_manifest(tmp_path, _manifest(revision=4))
    migrate_builtin_comic_registry(path, targets=targets)
    current = registries["employees"].get("comic-writer")
    current.name = "用户后来改的名称"
    current.role_profile = "用户后来改的提示词"
    registries["employees"].save(current)
    save_count = registries["employees"].save_count

    stats = migrate_builtin_comic_registry(path, targets=targets)

    preserved = registries["employees"].get("comic-writer")
    assert stats["skipped_revision"] == 4
    assert preserved.name == "用户后来改的名称"
    assert preserved.role_profile == "用户后来改的提示词"
    assert registries["employees"].save_count == save_count


def test_lower_unowned_revision_is_upgraded(tmp_path, registry_targets):
    """无 owner 的旧内置实体在 revision 提升时更新为 manifest 内容。"""
    registries, targets = registry_targets
    old = EmployeeDefinition.model_validate({
        "employeeKey": "comic-writer",
        "name": "旧版编剧",
        "managedRevision": 1,
    })
    registries["employees"].save(old)
    payload = _manifest(revision=2)
    payload["team"] = []
    payload["tools"] = []
    payload["workflows"] = []
    path = _write_manifest(tmp_path, payload)

    stats = migrate_builtin_comic_registry(path, targets=targets)

    current = registries["employees"].get("comic-writer")
    assert stats["updated"] == 1
    assert current.name == "漫剧编剧"
    assert current.model_extra["managedRevision"] == 2


def test_higher_revision_is_not_downgraded(tmp_path, registry_targets):
    """本地 managedRevision 高于镜像时保持本地版本。"""
    registries, targets = registry_targets
    newer = EmployeeDefinition.model_validate({
        "employeeKey": "comic-writer",
        "name": "未来版本",
        "managedRevision": 9,
    })
    registries["employees"].save(newer)
    payload = _manifest(revision=8)
    payload["team"] = []
    payload["tools"] = []
    payload["workflows"] = []
    path = _write_manifest(tmp_path, payload)

    stats = migrate_builtin_comic_registry(path, targets=targets)

    assert stats["skipped_revision"] == 1
    assert registries["employees"].get("comic-writer").name == "未来版本"


def test_missing_manifest_is_safe(tmp_path, registry_targets, monkeypatch):
    """镜像尚未携带 manifest 时告警并返回空统计，不触碰任何注册表。"""
    import app.services.builtin_registry_migration as migration

    registries, targets = registry_targets
    missing = tmp_path / "does-not-exist.json"
    warnings = []
    monkeypatch.setattr(
        migration,
        "logger",
        SimpleNamespace(
            warning=lambda *args, **kwargs: warnings.append((args, kwargs)),
            info=lambda *args, **kwargs: None,
        ),
    )

    stats = migrate_builtin_comic_registry(missing, targets=targets)

    assert stats["manifest_found"] is False
    assert stats["revision"] is None
    assert stats["created"] == 0
    assert stats["updated"] == 0
    assert stats["failed"] == 0
    assert all(not registry.items for registry in registries.values())
    assert warnings
    assert "清单不存在" in warnings[0][0][0]


def test_invalid_item_does_not_block_other_entries(tmp_path, registry_targets):
    """单条主键缺失只计失败，后续员工和工具仍继续导入。"""
    registries, targets = registry_targets
    payload = _manifest(revision=2)
    payload["employees"].insert(0, {"name": "缺少 employeeKey"})
    payload["team"] = []
    payload["workflows"] = []
    path = _write_manifest(tmp_path, payload)

    stats = migrate_builtin_comic_registry(path, targets=targets)

    assert stats["failed"] == 1
    assert stats["created"] == 2
    assert registries["employees"].get("comic-writer") is not None
    assert registries["tools"].get("comic-render") is not None


@pytest.mark.asyncio
async def test_lifespan_runs_builtin_migration_after_existing_migrations(monkeypatch):
    """内置 revision 迁移独立于 demo seed，并位于现有迁移之后、调度器之前。"""
    import app.dependencies as dependencies
    import app.main as app_main
    import app.services.builtin_registry_migration as migration

    events = []

    class FakeScheduler:
        def start(self):
            events.append("scheduler_start")

        async def stop(self):
            events.append("scheduler_stop")

    monkeypatch.setattr(
        app_main,
        "_migrate_employees",
        lambda: events.append("employees"),
    )
    monkeypatch.setattr(
        app_main,
        "_migrate_teams_and_seed",
        lambda: events.append("teams"),
    )
    monkeypatch.setattr(
        migration,
        "migrate_builtin_comic_registry",
        lambda: events.append("builtin"),
    )
    monkeypatch.setattr(dependencies, "daily_scheduler", FakeScheduler())

    async with app_main.lifespan(app_main.app):
        events.append("running")

    assert events == [
        "employees",
        "teams",
        "builtin",
        "scheduler_start",
        "running",
        "scheduler_stop",
    ]
