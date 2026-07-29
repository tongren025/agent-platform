"""通用文件型注册表（Registry）。

FileJsonRegistry 是一个泛型基类：把任意 RegistryEntity 以 <data_dir>/<key>.json
形式落盘，提供统一的 增删改查 + 排序 + 时间戳维护。员工/工具/技能/团队/工作流/
角色模板/MCP 服务等各类实体都通过它的子类共用同一套存储逻辑。
"""
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
    """递归把 dict 的键首字母转小写（PascalCase/camelCase 统一成 camelCase）。

    历史数据可能是 C# 风格的 PascalCase，这里归一化后再喂给 pydantic 校验，
    保证新旧落盘格式都能正确回读。
    """
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
    """泛型文件注册表：一实体一 json 文件，统一 增删改查。子类只需绑定实体类型与目录。"""

    def __init__(self, model_cls: type[T], data_dir: str) -> None:
        self._model_cls = model_cls
        self._dir = BASE_DIR / data_dir
        self._dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _sanitize_key(key: str) -> str:
        """校验实体 key 合法（非空、无斜杠/..），防止写文件时路径穿越。"""
        if not key or _BAD_KEY_RE.search(key):
            raise ValueError(f"Invalid registry key: {key!r}")
        return key

    def _path_for(self, key: str) -> Path:
        """实体 key → json 文件路径。"""
        return self._dir / f"{self._sanitize_key(key)}.json"

    def list_all(self) -> list[T]:
        """读出目录下全部实体，按 (sort_order, name) 排序；损坏文件告警跳过。"""
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
        """按 key 读取单个实体；缺失或损坏返回 None。"""
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
        """判断某 key 的实体文件是否存在。"""
        return self._path_for(key).exists()

    def save(self, item: T) -> T:
        """写入实体并维护时间戳：新建填 created_at，更新则保留原 created_at、刷新 updated_at。"""
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
        """删除实体文件，成功 True，本不存在 False。"""
        fp = self._path_for(key)
        if fp.exists():
            fp.unlink()
            return True
        return False


# ── 以下为各实体的具体注册表：只把泛型基类绑定到对应实体类型与存储目录 ──

class SkillRegistryService(FileJsonRegistry[SkillDefinition]):
    """技能定义注册表。"""
    def __init__(self) -> None:
        super().__init__(SkillDefinition, settings.agent.skill_dir)


class McpServerRegistryService(FileJsonRegistry[McpServerDefinition]):
    """MCP 服务定义注册表。"""
    def __init__(self) -> None:
        super().__init__(McpServerDefinition, settings.agent.mcp_server_dir)


class ToolRegistryService(FileJsonRegistry[ToolDefinition]):
    """工具定义注册表。"""
    def __init__(self) -> None:
        super().__init__(ToolDefinition, settings.agent.tool_dir)


class EmployeeRegistryService(FileJsonRegistry[EmployeeDefinition]):
    """数字员工定义注册表。"""
    def __init__(self) -> None:
        super().__init__(EmployeeDefinition, settings.agent.data_dir)


class TeamRegistryService(FileJsonRegistry[TeamDefinition]):
    """团队定义注册表。"""
    def __init__(self) -> None:
        super().__init__(TeamDefinition, settings.agent.team_dir)


class WorkflowRegistryService(FileJsonRegistry[WorkflowDefinition]):
    """工作流定义注册表。"""
    def __init__(self) -> None:
        super().__init__(WorkflowDefinition, settings.workflow.workflow_dir)


class RoleTemplateRegistryService(FileJsonRegistry[RoleTemplateDefinition]):
    """角色模板注册表，额外支持「按模板派生新员工」。"""
    def __init__(self) -> None:
        super().__init__(RoleTemplateDefinition, settings.agent.role_template_dir)

    def apply_to_new_employee(
        self,
        template_code: str,
        new_key: str,
        new_name: str,
        *,
        persist: bool = True,
    ) -> EmployeeDefinition | None:
        """以角色模板为蓝本构造新员工；默认保存，persist=False 时交由 API 校验后保存。

        复制模板的角色画像/模型策略/建议的技能·工具·MCP 绑定，标记 source=template。
        """
        tpl = self.get(template_code)
        if tpl is None:
            return None

        emp = EmployeeDefinition(
            employee_key=new_key,
            name=new_name,
            role_profile=tpl.role_profile,
            deep_agent=tpl.deep_agent,
            default_model_policy=dict(tpl.default_model_policy),
            output_modalities=list(tpl.output_modalities or ["text"]),
            skill_refs=list(tpl.suggested_skill_codes) if tpl.suggested_skill_codes else None,
            tool_refs=list(tpl.suggested_tool_codes) if tpl.suggested_tool_codes else None,
            mcp_server_refs=(
                list(tpl.suggested_mcp_server_codes) if tpl.suggested_mcp_server_codes else None
            ),
            template_code=template_code,
            tags=list(tpl.tags),
            source="template",
        )

        if not persist:
            return emp

        from app.dependencies import employee_registry
        return employee_registry.save(emp)
