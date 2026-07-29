"""把镜像内置的漫剧团队配置按 revision 安全迁移到可写注册表。"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

from pydantic import BaseModel

from app.core.logging import get_logger
from app.models.registry import (
    EmployeeDefinition,
    RegistryEntity,
    TeamDefinition,
    ToolDefinition,
)
from app.models.workflow import WorkflowDefinition


logger = get_logger(__name__)
MANIFEST_PATH = (
    Path(__file__).resolve().parents[1]
    / "resources"
    / "comic_team_manifest.json"
)


@dataclass(frozen=True)
class RegistryTarget:
    """一个 manifest 数组对应的强类型模型和文件注册表。"""

    registry: Any
    model_cls: type[RegistryEntity]


def _default_targets() -> dict[str, RegistryTarget]:
    """延迟读取全局注册表，避免服务模块导入时形成依赖环。"""
    from app.dependencies import (
        employee_registry,
        team_registry,
        tool_registry,
        workflow_registry,
    )

    return {
        "employees": RegistryTarget(employee_registry, EmployeeDefinition),
        "team": RegistryTarget(team_registry, TeamDefinition),
        "tools": RegistryTarget(tool_registry, ToolDefinition),
        "workflows": RegistryTarget(workflow_registry, WorkflowDefinition),
    }


def _new_stats() -> dict[str, Any]:
    """创建稳定、可记录也便于测试的迁移统计结构。"""
    actions = {
        "created": 0,
        "updated": 0,
        "skipped_owner": 0,
        "skipped_revision": 0,
        "failed": 0,
    }
    return {
        "manifest_found": False,
        "revision": None,
        **actions,
        "categories": {
            category: dict(actions)
            for category in ("employees", "team", "tools", "workflows")
        },
    }


def _record(stats: dict[str, Any], category: str, action: str) -> None:
    """同时累计总数和分类统计。"""
    stats[action] += 1
    stats["categories"][category][action] += 1


def _owner_user_id(entity: BaseModel) -> str:
    """读取强类型字段或 extra 中的 ownerUserId。"""
    owner = getattr(entity, "owner_user_id", None)
    if owner:
        return str(owner).strip()
    extra = entity.model_extra or {}
    return str(
        extra.get("ownerUserId")
        or extra.get("owner_user_id")
        or ""
    ).strip()


def _managed_revision(entity: BaseModel) -> int:
    """读取 extra managedRevision；缺失或非法按 0 处理。"""
    extra = entity.model_extra or {}
    raw = extra.get("managedRevision", extra.get("managed_revision", 0))
    if isinstance(raw, bool):
        return 0
    try:
        return max(int(raw), 0)
    except (TypeError, ValueError):
        return 0


def migrate_builtin_comic_registry(
    manifest_path: Path | None = None,
    *,
    targets: Mapping[str, RegistryTarget] | None = None,
) -> dict[str, Any]:
    """按 manifest revision 导入内置漫剧员工、团队、工具和工作流。

    只处理 manifest 明确列出的 key。已有用户归属（ownerUserId 非空）的实体永不
    覆盖；无用户归属的实体仅在 managedRevision 低于 manifest revision 时升级。
    每条记录独立失败，任何单条脏数据都不会阻断其余迁移或应用启动。
    """
    stats = _new_stats()
    path = Path(manifest_path) if manifest_path is not None else MANIFEST_PATH

    try:
        raw_manifest = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        logger.warning("内置漫剧配置清单不存在，跳过迁移: %s", path)
        return stats
    except Exception:
        logger.warning("读取内置漫剧配置清单失败，跳过迁移: %s", path, exc_info=True)
        stats["failed"] += 1
        return stats

    stats["manifest_found"] = True
    try:
        manifest = json.loads(raw_manifest)
    except Exception:
        logger.warning("解析内置漫剧配置清单失败，跳过迁移: %s", path, exc_info=True)
        stats["failed"] += 1
        return stats

    revision = manifest.get("revision") if isinstance(manifest, dict) else None
    if isinstance(revision, bool) or not isinstance(revision, int) or revision <= 0:
        logger.warning("内置漫剧配置清单 revision 必须是正整数: %s", path)
        stats["failed"] += 1
        return stats
    stats["revision"] = revision

    resolved_targets = dict(targets) if targets is not None else _default_targets()
    for category in ("employees", "team", "tools", "workflows"):
        target = resolved_targets.get(category)
        records = manifest.get(category, [])
        if target is None:
            logger.warning("内置漫剧配置缺少注册表目标: %s", category)
            _record(stats, category, "failed")
            continue
        if not isinstance(records, list):
            logger.warning("内置漫剧配置字段必须是数组: %s", category)
            _record(stats, category, "failed")
            continue

        for index, raw_record in enumerate(records):
            try:
                if not isinstance(raw_record, dict):
                    raise TypeError("配置项必须是对象")
                payload = dict(raw_record)
                payload["managedRevision"] = revision
                desired = target.model_cls.model_validate(payload)
                key = desired.get_key()
                if not key:
                    raise ValueError("配置项主键不能为空")

                current = target.registry.get(key)
                if current is not None:
                    if _owner_user_id(current):
                        _record(stats, category, "skipped_owner")
                        continue
                    if _managed_revision(current) >= revision:
                        _record(stats, category, "skipped_revision")
                        continue
                    action = "updated"
                else:
                    action = "created"

                target.registry.save(desired)
                _record(stats, category, action)
            except Exception:
                _record(stats, category, "failed")
                logger.warning(
                    "内置漫剧配置单条迁移失败 category=%s index=%d",
                    category,
                    index,
                    exc_info=True,
                )

    logger.info(
        "内置漫剧配置迁移完成 revision=%s created=%d updated=%d "
        "skipped_owner=%d skipped_revision=%d failed=%d",
        revision,
        stats["created"],
        stats["updated"],
        stats["skipped_owner"],
        stats["skipped_revision"],
        stats["failed"],
    )
    return stats
