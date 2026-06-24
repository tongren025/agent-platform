from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Generic, TypeVar

from app.config import BASE_DIR, settings
from app.models.registry import (
    EmployeeDefinition,
    McpServerDefinition,
    RegistryEntity,
    RoleTemplateDefinition,
    SkillDefinition,
    TeamDefinition,
    ToolDefinition,
)
from app.models.workflow import WorkflowDefinition

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=RegistryEntity)

_BAD_KEY_RE = re.compile(r"[/\\]|\.\.")


def _normalize_keys(data: dict) -> dict:
    out = {}
    for k, v in data.items():
        camel = k[0].lower() + k[1:] if k else k
        if isinstance(v, dict):
            v = _normalize_keys(v)
        elif isinstance(v, list):
            v = [_normalize_keys(i) if isinstance(i, dict) else i for i in v]
        out[camel] = v
    return out


class FileJsonRegistry(Generic[T]):

    def __init__(self, model_cls: type[T], data_dir: str) -> None:
        self._model_cls = model_cls
        self._dir = BASE_DIR / data_dir
        self._dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _sanitize_key(key: str) -> str:
        if not key or _BAD_KEY_RE.search(key):
            raise ValueError(f"Invalid registry key: {key!r}")
        return key

    def _path_for(self, key: str) -> Path:
        return self._dir / f"{self._sanitize_key(key)}.json"

    def list_all(self) -> list[T]:
        items: list[T] = []
        if not self._dir.exists():
            return items
        for fp in self._dir.glob("*.json"):
            try:
                data = _normalize_keys(json.loads(fp.read_text(encoding="utf-8")))
                items.append(self._model_cls.model_validate(data))
            except Exception:
                logger.warning("Failed to load registry file %s", fp, exc_info=True)
        items.sort(key=lambda e: (e.sort_order, getattr(e, "name", "")))
        return items

    def get(self, key: str) -> T | None:
        fp = self._path_for(key)
        if not fp.exists():
            return None
        try:
            data = _normalize_keys(json.loads(fp.read_text(encoding="utf-8")))
            return self._model_cls.model_validate(data)
        except Exception:
            logger.warning("Failed to load registry file %s", fp, exc_info=True)
            return None

    def exists(self, key: str) -> bool:
        return self._path_for(key).exists()

    def save(self, item: T) -> T:
        key = item.get_key()
        fp = self._path_for(key)
        now = datetime.now(timezone.utc)

        if fp.exists():
            try:
                existing = _normalize_keys(json.loads(fp.read_text(encoding="utf-8")))
                existing_item = self._model_cls.model_validate(existing)
                item.created_at = existing_item.created_at
            except Exception:
                pass
        else:
            item.created_at = now

        item.updated_at = now
        data = item.model_dump(by_alias=True, mode="json")
        self._dir.mkdir(parents=True, exist_ok=True)
        fp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return item

    def delete(self, key: str) -> bool:
        fp = self._path_for(key)
        if fp.exists():
            fp.unlink()
            return True
        return False


class SkillRegistryService(FileJsonRegistry[SkillDefinition]):
    def __init__(self) -> None:
        super().__init__(SkillDefinition, settings.agent.skill_dir)


class McpServerRegistryService(FileJsonRegistry[McpServerDefinition]):
    def __init__(self) -> None:
        super().__init__(McpServerDefinition, settings.agent.mcp_server_dir)


class ToolRegistryService(FileJsonRegistry[ToolDefinition]):
    def __init__(self) -> None:
        super().__init__(ToolDefinition, settings.agent.tool_dir)


class EmployeeRegistryService(FileJsonRegistry[EmployeeDefinition]):
    def __init__(self) -> None:
        super().__init__(EmployeeDefinition, settings.agent.data_dir)


class TeamRegistryService(FileJsonRegistry[TeamDefinition]):
    def __init__(self) -> None:
        super().__init__(TeamDefinition, settings.agent.team_dir)


class WorkflowRegistryService(FileJsonRegistry[WorkflowDefinition]):
    def __init__(self) -> None:
        super().__init__(WorkflowDefinition, settings.workflow.workflow_dir)


class RoleTemplateRegistryService(FileJsonRegistry[RoleTemplateDefinition]):
    def __init__(self) -> None:
        super().__init__(RoleTemplateDefinition, settings.agent.role_template_dir)

    def apply_to_new_employee(
        self,
        template_code: str,
        new_key: str,
        new_name: str,
    ) -> EmployeeDefinition | None:
        tpl = self.get(template_code)
        if tpl is None:
            return None

        emp = EmployeeDefinition(
            employee_key=new_key,
            name=new_name,
            role_profile=tpl.role_profile,
            deep_agent=tpl.deep_agent,
            default_model_policy=dict(tpl.default_model_policy),
            skill_refs=list(tpl.suggested_skill_codes) if tpl.suggested_skill_codes else None,
            tool_refs=list(tpl.suggested_tool_codes) if tpl.suggested_tool_codes else None,
            mcp_server_refs=(
                list(tpl.suggested_mcp_server_codes) if tpl.suggested_mcp_server_codes else None
            ),
            template_code=template_code,
            tags=list(tpl.tags),
            source="template",
        )

        from app.dependencies import employee_registry
        return employee_registry.save(emp)
