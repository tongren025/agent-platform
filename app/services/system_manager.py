"""系统管家服务。

把产品说明、页面上下文、注册表状态和最近运行记录汇总成一个统一的帮助入口。
涉及 Skill/MCP 的写操作只生成短时提案，必须由用户再次确认后才会落盘。
"""
from __future__ import annotations

import hashlib
import ipaddress
import io
import json
import os
import re
import secrets
import shlex
import shutil
import tempfile
import time
import urllib.parse
import urllib.request
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.config import BASE_DIR, settings
from app.models.registry import McpServerDefinition
from app.services.skill_packages import load_skill_package
from app.services.model_transport import create_model_completion_sync


_GITHUB_RE = re.compile(
    r"https://github\.com/(?P<owner>[\w.-]+)/(?P<repo>[\w.-]+)"
    r"(?:/tree/(?P<ref>[^/\s]+)(?:/(?P<path>[^\s?#]+))?)?"
)
_JSON_RE = re.compile(r"\{[\s\S]*\}")
_MCP_ADD_WORDS = ("添加", "安装", "接入", "连接", "add")
_MCP_RENAME_WORDS = ("改名", "改个名称", "改名称", "改名字", "名称改", "名字改", "rename")
_PROPOSAL_TTL_SECONDS = 15 * 60
_MAX_ARCHIVE_BYTES = 10 * 1024 * 1024
_MAX_ARCHIVE_FILES = 500
# 功能大全与用户手册是产品能力问答的资料来源；新文档需显式加入此受控检索清单。
_KNOWLEDGE_FILES = (
    "docs/knowledge/FEATURES.md",
    "docs/USER_GUIDE.md",
    "README.md",
    "WORKFLOW_ENGINE.md",
    "docs/SYSTEM_MANAGER.md",
    "docs/RUNBOOK.md",
    "docs/CHANGELOG.md",
)


PAGE_GUIDES: dict[str, dict[str, Any]] = {
    "/dashboard": {
        "title": "今日工作",
        "summary": "查看当前待办、运行状态和最值得继续的项目。",
        "steps": ["先处理失败或阻塞任务。", "继续最近项目的唯一下一动作。", "完成后检查交付状态。"],
    },
    "/canvas": {
        "title": "画布中心",
        "summary": "用于把素材、提示词和生成结果放到可自由编排的视觉画布中。",
        "steps": [
            "先新建或打开一张画布。",
            "从左侧添加文本、图片或项目素材节点。",
            "选中节点后使用浮动工具栏继续生成、复制或连接。",
            "把需要保留的结果保存到项目，避免只停留在临时画布。",
        ],
    },
    "/studio": {
        "title": "快速制作",
        "summary": "从一个创作目标开始，由系统选择员工和生产步骤。",
        "steps": ["输入成片目标与约束。", "确认系统给出的制作计划。", "逐阶段检查产物并继续。"],
    },
    "/production": {
        "title": "我的项目",
        "summary": "集中管理剧本、分镜、视觉设计、图片和视频产物。",
        "steps": ["选择项目。", "查看缺漏检查。", "从最早缺失的阶段继续生成。", "完成后做全链路检查。"],
    },
    "/workbench": {
        "title": "数字员工工作台",
        "summary": "直接与数字员工或团队对话并查看运行过程。",
        "steps": ["选择合适的员工。", "描述目标和交付物。", "必要时上传参考文件。", "检查执行轨迹与最终结果。"],
    },
    "/employees": {
        "title": "数字员工",
        "summary": "配置岗位、模型、技能、工具、MCP 和知识库。",
        "steps": ["创建或选择员工。", "确认岗位说明与模型。", "绑定所需能力。", "先试运行再投入工作流。"],
    },
    "/advanced/tools": {
        "title": "工具与 MCP",
        "summary": "管理 Agent 可调用的本地或远程能力。",
        "steps": ["添加服务配置。", "完成密钥或网页登录。", "测试连接并查看工具列表。", "绑定给需要的员工。"],
    },
    "/workflows": {
        "title": "工作流",
        "summary": "把多个数字员工和工具按顺序连接成可重复执行的 SOP。",
        "steps": ["选择模板或新建工作流。", "配置每个节点的输入输出。", "检查连接与失败分支。", "用测试输入完整跑一次。"],
    },
    "/settings": {
        "title": "系统设置",
        "summary": "管理平台级偏好和连接配置。",
        "steps": ["选择要配置的能力。", "只在安全输入框中填写密钥。", "保存后立即进行连接测试。"],
    },
    "/templates": {
        "title": "员工模板",
        "summary": "用预设岗位快速创建数字员工。",
        "steps": ["选择最接近目标的岗位。", "创建后检查模型与能力绑定。", "用一个真实小任务试运行。"],
    },
    "/teams": {
        "title": "数字员工团队",
        "summary": "组织负责人、成员和默认工作流。",
        "steps": ["设置负责人。", "按阶段添加成员。", "选择默认工作流。", "发起一次团队测试。"],
    },
    "/learning": {
        "title": "学习中心",
        "summary": "沉淀提示词、文章与可复用经验。",
        "steps": ["选择学习来源。", "检查提取内容。", "确认写入目标员工知识或记忆。"],
    },
    "/memory": {
        "title": "长期记忆",
        "summary": "查看和治理数字员工积累的语义、情景与流程记忆。",
        "steps": ["选择员工。", "检查过期或错误记忆。", "保留能提高后续任务质量的内容。"],
    },
    "/runs": {
        "title": "运行记录",
        "summary": "审计模型调用、工具轨迹、耗时、Token 和错误。",
        "steps": ["先看失败运行。", "定位最后一个成功步骤。", "修复配置后重新执行。"],
    },
    "/tasks": {
        "title": "任务中心",
        "summary": "管理异步执行、重试与取消。",
        "steps": ["检查运行中任务。", "失败任务先查看原因。", "原因消除后再重试。"],
    },
    "/trends": {
        "title": "AI 趋势雷达",
        "summary": "跟踪新的模型、工具和 Skill 候选。",
        "steps": ["查看今日增量。", "打开相关候选详情。", "验证后再导入系统。"],
    },
    "/knowledge-graph": {
        "title": "知识图谱",
        "summary": "查看员工、Skill、工具和 MCP 之间的真实绑定关系。",
        "steps": ["选择目标节点。", "检查缺失或冗余依赖。", "通过系统管家调整绑定。"],
    },
    "/evolution": {
        "title": "自我进化",
        "summary": "根据历史表现提出员工与流程改进建议。",
        "steps": ["查看建议依据。", "只接受可验证的改动。", "对比改动前后表现。"],
    },
    "/models": {
        "title": "模型管理",
        "summary": "查看已接入模型及其可用状态。",
        "steps": ["选择供应商。", "完成 API 密钥配置。", "同步模型列表。", "测试后再设为员工默认模型。"],
    },
}


@dataclass
class _Proposal:
    """短时待确认操作；可加密持久化，敏感内容不以明文写入日志或磁盘。"""

    action: str
    payload: dict[str, Any]
    summary: str
    created_at: float
    owner: str = "local"


class SystemManagerService:
    """系统管家的知识检索、诊断和受控变更服务。"""

    def __init__(
        self,
        *,
        skill_registry: Any,
        mcp_registry: Any,
        tool_registry: Any,
        employee_registry: Any,
        run_store: Any,
        ai_service: Any | None = None,
        root_dir: str | Path | None = None,
    ) -> None:
        self._skills = skill_registry
        self._mcps = mcp_registry
        self._tools = tool_registry
        self._employees = employee_registry
        self._runs = run_store
        self._ai = ai_service
        self._proposals: dict[str, _Proposal] = {}
        self._root = Path(root_dir) if root_dir is not None else BASE_DIR / "data" / "system-manager"
        self._root.mkdir(parents=True, exist_ok=True)

    def _manager_client(self) -> tuple[Any, str, str]:
        """解析系统管家专用模型；返回客户端、真实模型 ID 和可展示引用。"""
        if self._ai is None:
            raise ValueError("系统管家尚未配置可用模型")
        configured = settings.agent.system_manager_model.strip()
        if configured:
            client, model = self._ai.get_client(configured)
            return client, model, configured
        client, model = self._ai.get_default_client()
        provider = str(getattr(client, "_agent_provider_name", "") or "")
        reference = f"{provider}:{model}" if provider else model
        return client, model, reference

    def _manager_info(self) -> dict[str, Any]:
        """返回不含密钥的管家运行信息，让用户知道谁在作答。"""
        configured = settings.agent.system_manager_model.strip()
        try:
            _client, model, reference = self._manager_client()
            return {
                "kind": "stateful-management-agent",
                "model": model,
                "modelReference": reference,
                "modelConfigured": bool(configured),
                "stateful": True,
                "confirmationRequired": True,
            }
        except Exception as exc:
            return {
                "kind": "stateful-management-agent",
                "model": "",
                "modelReference": configured,
                "modelConfigured": bool(configured),
                "stateful": True,
                "confirmationRequired": True,
                "error": str(exc),
            }

    @staticmethod
    def _guide_for_path(path: str) -> dict[str, Any]:
        """按最长路由前缀匹配页面说明。"""
        normalized = (path or "/").split("?", 1)[0]
        matches = [
            (prefix, guide)
            for prefix, guide in PAGE_GUIDES.items()
            if normalized == prefix or normalized.startswith(prefix + "/")
        ]
        if not matches:
            return {
                "title": "当前页面",
                "summary": "我可以解释页面功能、检查系统状态，并告诉你下一步。",
                "steps": ["告诉我你想完成什么，或直接问“下一步做什么”。"],
            }
        return max(matches, key=lambda item: len(item[0]))[1]

    def _mcp_status(
        self,
        item: McpServerDefinition,
        *,
        in_use: bool = False,
    ) -> dict[str, Any]:
        """生成不泄露密钥的 MCP 配置诊断。"""
        transport = (item.transport_type or "stdio").lower()
        missing: list[str] = []
        if transport == "stdio" and not item.command:
            missing.append("command")
        if transport in {"http", "streamable_http", "streamable-http", "sse"} and not item.url:
            missing.append("url")
        missing_env: list[str] = []
        for value in {**(item.env or {}), **(item.headers or {})}.values():
            match = re.fullmatch(r"\$\{([A-Z][A-Z0-9_]*)\}", str(value).strip())
            if match:
                if not os.getenv(match.group(1)):
                    missing_env.append(match.group(1))
        auth_status = "not_required"
        if (item.auth_type or "none").lower() == "oauth":
            from app.services.mcp_oauth import mcp_oauth_coordinator

            auth_status = mcp_oauth_coordinator.token_status(item.server_code)
        elif (item.auth_type or "none").lower() == "bearer":
            from app.services.mcp_oauth import EncryptedMcpTokenStorage

            has_header_reference = any(
                name.lower() == "authorization"
                for name in (item.headers or {})
            )
            has_encrypted_headers = EncryptedMcpTokenStorage(
                item.server_code,
                root_dir=self._root.parent / "mcp-auth",
            ).has_static_headers()
            auth_status = (
                "authorized"
                if (has_header_reference and not missing_env) or has_encrypted_headers
                else "login_required"
            )
        status = "incomplete" if missing else ("auth_required" if missing_env else "configured")
        if auth_status == "login_required" and not missing:
            status = "auth_required"
        health_path = self._root / "mcp-health" / f"{item.server_code}.json"
        last_check = None
        if health_path.is_file():
            try:
                last_check = json.loads(health_path.read_text(encoding="utf-8"))
            except Exception:
                last_check = None
        if (
            last_check
            and last_check.get("status") in {"error", "timeout"}
            and status == "configured"
        ):
            status = str(last_check["status"])
        return {
            "serverCode": item.server_code,
            "name": item.name,
            "transportType": transport,
            "inUse": in_use,
            "status": status,
            "missingFields": missing,
            "missingEnvironmentVariables": missing_env,
            "authType": item.auth_type,
            "authStatus": auth_status,
            "lastCheck": last_check,
        }

    def record_mcp_health(
        self,
        server_code: str,
        *,
        status: str,
        tool_names: list[str] | None = None,
        error: str = "",
    ) -> None:
        """持久化不含凭证的 MCP 最近验证结果。"""
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", server_code):
            return
        path = self._root / "mcp-health" / f"{server_code}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({
            "status": status,
            "checkedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "toolCount": len(tool_names or []),
            "tools": (tool_names or [])[:100],
            "error": error[:500],
        }, ensure_ascii=False, indent=2), encoding="utf-8")

    def _clear_mcp_runtime_state(self, server_code: str) -> None:
        """配置变更或删除后清除旧健康结果与工具缓存，避免继续展示历史故障。"""
        health_path = self._root / "mcp-health" / f"{server_code}.json"
        health_path.unlink(missing_ok=True)
        from app.runtime.mcp import clear_mcp_tools_cache

        clear_mcp_tools_cache(server_code)

    def context(self, page_path: str) -> dict[str, Any]:
        """返回当前页面指引、资源盘点、MCP 健康摘要与最近失败。"""
        mcps = self._mcps.list_all()
        employees = self._employees.list_all()
        skills = self._skills.list_all()
        skills_by_code = {
            str(getattr(item, "code", "") or ""): item
            for item in skills
        }
        active_mcp_refs: set[str] = set()
        for employee in employees:
            if getattr(employee, "enabled", True) is False:
                continue
            active_mcp_refs.update(
                str(ref) for ref in (getattr(employee, "mcp_server_refs", None) or [])
            )
            for skill_ref in getattr(employee, "skill_refs", None) or []:
                skill = skills_by_code.get(str(skill_ref))
                if skill is not None:
                    active_mcp_refs.update(
                        str(ref)
                        for ref in (getattr(skill, "mcp_dependencies", None) or [])
                    )
        statuses = [
            self._mcp_status(item, in_use=item.server_code in active_mcp_refs)
            for item in mcps
        ]
        recent_failures = []
        try:
            for run in self._runs.list_runs(success=False, limit=3):
                recent_failures.append({
                    "runId": run.run_id,
                    "employeeKey": run.employee_key,
                    "createdAt": run.created_at.isoformat(),
                    "error": str(run.error_message or "运行失败")[:300],
                })
        except Exception:
            # 数据库存储暂不可用时，帮助入口仍应能打开。
            recent_failures = []
        result = {
            "manager": self._manager_info(),
            "page": self._guide_for_path(page_path),
            "inventory": {
                "employees": len(employees),
                "skills": len(skills),
                "tools": len(self._tools.list_all()),
                "mcpServers": len(mcps),
            },
            "mcpStatus": statuses,
            "recentFailures": recent_failures,
            "recentChanges": self._read_audit(limit=5),
            "knowledgeSources": [
                relative_path
                for relative_path in _KNOWLEDGE_FILES
                if (BASE_DIR / relative_path).is_file()
            ],
        }
        project_match = re.search(r"/production/([A-Za-z0-9_-]+)", page_path)
        if project_match and project_match.group(1) != "matrix":
            project_context = self._project_context(project_match.group(1))
            if project_context is not None:
                result["projectContext"] = project_context
        return result

    @staticmethod
    def _project_context(project_id: str) -> dict[str, Any] | None:
        """读取当前项目并复用生产诊断服务，返回真实下一动作。"""
        project_dir = (BASE_DIR / "data" / "production" / project_id).resolve()
        production_root = (BASE_DIR / "data" / "production").resolve()
        if project_dir.parent != production_root:
            return None
        project_file = project_dir / "project.json"
        if not project_file.is_file():
            return None
        try:
            from app.models.production import ProductionCard, ProductionProject
            from app.services.project_diagnostics import diagnose_project

            project = ProductionProject.model_validate_json(project_file.read_text(encoding="utf-8"))
            cards_file = project_dir / "cards.json"
            raw_cards = json.loads(cards_file.read_text(encoding="utf-8")) if cards_file.is_file() else []
            cards = [ProductionCard.model_validate(item) for item in raw_cards]
            diagnosis = diagnose_project(project, cards)
            return {
                "projectId": project_id,
                "name": project.name,
                "state": diagnosis["state"],
                "score": diagnosis["score"],
                "summary": diagnosis["summary"],
                "nextAction": diagnosis["nextAction"],
                "blockerCount": diagnosis["blockerCount"],
                "warningCount": diagnosis["warningCount"],
            }
        except Exception:
            return None

    @staticmethod
    def _knowledge_tokens(text: str) -> set[str]:
        """生成适合中英文手册的轻量词元，中文补充二元字组。"""
        lowered = text.lower()
        tokens = set(re.findall(r"[a-z0-9_-]{2,}|[\u4e00-\u9fff]{2,}", lowered))
        chinese = "".join(re.findall(r"[\u4e00-\u9fff]", lowered))
        tokens.update(chinese[index:index + 2] for index in range(max(0, len(chinese) - 1)))
        return tokens

    def _search_knowledge(self, query: str, limit: int = 3) -> list[dict[str, str]]:
        """在受控产品文档中按章节检索，不扫描用户文件或源码。"""
        query_tokens = self._knowledge_tokens(query)
        if not query_tokens:
            return []
        results: list[tuple[float, dict[str, str]]] = []
        for relative_path in _KNOWLEDGE_FILES:
            path = BASE_DIR / relative_path
            if not path.is_file():
                continue
            try:
                content = path.read_text(encoding="utf-8")[:500_000]
            except Exception:
                continue
            sections = re.split(r"(?=^#{1,3}\s)", content, flags=re.MULTILINE)
            for section in sections:
                compact = section.strip()
                if not compact:
                    continue
                section_tokens = self._knowledge_tokens(compact)
                overlap = query_tokens & section_tokens
                if not overlap:
                    continue
                score = len(overlap) / max(1, len(query_tokens))
                if query.lower() in compact.lower():
                    score += 0.5
                title_match = re.match(r"^#{1,3}\s+(.+)", compact)
                title = title_match.group(1).strip() if title_match else path.name
                excerpt = re.sub(r"\s+", " ", compact)[:500]
                results.append((score, {
                    "title": title,
                    "path": relative_path,
                    "excerpt": excerpt,
                }))
        results.sort(key=lambda item: item[0], reverse=True)
        return [item for _, item in results[:limit]]

    def _model_answer(
        self,
        query: str,
        page_path: str,
        context: dict[str, Any],
        knowledge: list[dict[str, str]],
        *,
        conversation_history: list[dict[str, Any]] | None = None,
        session_state: dict[str, Any] | None = None,
    ) -> tuple[str | None, str | None]:
        """用专用模型结合历史解释复杂问题；模型不能直接执行系统变更。"""
        if self._ai is None:
            return None, None
        safe_context = {
            "page": context.get("page"),
            "inventory": context.get("inventory"),
            "mcpStatus": context.get("mcpStatus"),
            "recentFailures": context.get("recentFailures"),
            "projectContext": context.get("projectContext"),
            "manager": context.get("manager"),
        }
        references = [
            {"title": item["title"], "path": item["path"], "excerpt": item["excerpt"]}
            for item in knowledge
        ]
        try:
            client, model, model_reference = self._manager_client()
            completion = create_model_completion_sync(client, {
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "你是 Agent Studio 内置系统管家。只依据给定页面状态和产品文档回答，"
                            "先给结论，再给下一步。不得声称已经安装、删除、登录或修改任何资源；"
                            "涉及变更时只说明可以在管家中发起预览并由用户确认。不要编造按钮或运行结果。"
                            "你必须利用 conversationHistory 和 sessionState 理解“它、这个、刚才那个”等指代；"
                            "无法唯一定位时直接追问，不得假装知道。"
                        ),
                    },
                    {
                        "role": "user",
                        "content": json.dumps({
                            "question": query,
                            "pagePath": page_path,
                            "systemContext": safe_context,
                            "manualReferences": references,
                            "conversationHistory": (conversation_history or [])[-16:],
                            "sessionState": session_state or {},
                        }, ensure_ascii=False),
                    },
                ],
                "temperature": 0.2,
                "max_tokens": 1200,
            })
            from app.services.chat_response import extract_chat_content

            answer = extract_chat_content(completion)
            return (
                answer.strip() if answer and answer.strip() else None,
                model_reference,
            )
        except Exception:
            return None, None

    def _audit_path(self) -> Path:
        """系统管家审计日志路径。"""
        return self._root / "audit.jsonl"

    def _read_audit(self, limit: int = 20) -> list[dict[str, Any]]:
        """读取最近的系统管家变更，不返回提案内部配置。"""
        path = self._audit_path()
        if not path.exists():
            return []
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
            return [json.loads(line) for line in lines[-limit:] if line.strip()][::-1]
        except Exception:
            return []

    def _write_audit(
        self,
        proposal: _Proposal,
        status: str,
        message: str,
        *,
        change_id: str | None = None,
    ) -> None:
        """记录不含密钥的变更审计。"""
        path = self._audit_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        event = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "action": proposal.action,
            "summary": proposal.summary,
            "status": status,
            "message": message,
            "changeId": change_id,
            "ownerKey": self._owner_key(proposal.owner),
        }
        with path.open("a", encoding="utf-8") as stream:
            stream.write(json.dumps(event, ensure_ascii=False) + "\n")

    def _change_path(self, change_id: str) -> Path:
        """返回安全的变更快照路径。"""
        if not re.fullmatch(r"change_[A-Za-z0-9_-]{10,100}", change_id):
            raise ValueError("非法变更 ID")
        return self._root / "changes" / f"{change_id}.json"

    def _save_change(
        self,
        owner: str,
        action: str,
        resource_type: str,
        resource_code: str,
        before: dict[str, Any] | None,
    ) -> str:
        """保存可回滚变更快照；内容只含注册表配置或本地备份路径。"""
        change_id = "change_" + secrets.token_urlsafe(12)
        path = self._change_path(change_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({
            "changeId": change_id,
            "owner": owner,
            "action": action,
            "resourceType": resource_type,
            "resourceCode": resource_code,
            "before": before,
            "createdAt": time.time(),
            "rolledBackAt": None,
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        return change_id

    def propose_rollback(self, change_id: str, *, owner: str = "local") -> dict[str, Any]:
        """为当前用户自己的历史变更创建回滚确认提案。"""
        path = self._change_path(change_id)
        if not path.exists():
            raise ValueError("变更快照不存在")
        change = json.loads(path.read_text(encoding="utf-8"))
        if change.get("owner") != owner:
            raise ValueError("无权回滚其他用户的变更")
        if change.get("rolledBackAt"):
            raise ValueError("该变更已经回滚")
        return self._add_proposal(
            "rollback",
            {"changeId": change_id},
            f"回滚 {change['resourceType']}「{change['resourceCode']}」的变更 {change_id}",
            owner=owner,
        )

    def _rollback_change(self, change_id: str, owner: str) -> str:
        """按快照恢复 MCP、员工或 Skill，并标记快照已回滚。"""
        path = self._change_path(change_id)
        if not path.exists():
            raise ValueError("变更快照不存在")
        change = json.loads(path.read_text(encoding="utf-8"))
        if change.get("owner") != owner:
            raise ValueError("无权回滚其他用户的变更")
        if change.get("rolledBackAt"):
            raise ValueError("该变更已经回滚")
        resource_type = change["resourceType"]
        code = change["resourceCode"]
        before = change.get("before")
        if resource_type == "mcp":
            if before is None:
                self._mcps.delete(code)
            else:
                self._mcps.save(McpServerDefinition.model_validate(before))
        elif resource_type == "employee":
            from app.models.registry import EmployeeDefinition

            self._employees.save(EmployeeDefinition.model_validate(before))
        elif resource_type == "skill":
            skill_root = (BASE_DIR / settings.agent.skill_dir).resolve()
            destination = (skill_root / code).resolve()
            if not destination.is_relative_to(skill_root):
                raise ValueError("Skill 回滚目标越界")
            backup_raw = str((before or {}).get("backupPath") or "")
            backup_path = Path(backup_raw) if backup_raw else None
            if backup_path is not None and backup_path.exists():
                if destination.exists():
                    shutil.rmtree(destination)
                shutil.move(str(backup_path), str(destination))
            elif before and before.get("definition"):
                from app.models.registry import SkillDefinition

                self._skills.save(SkillDefinition.model_validate(before["definition"]))
            elif destination.exists():
                shutil.rmtree(destination)
            else:
                self._skills.delete(code)
        else:
            raise ValueError(f"不支持回滚的资源类型：{resource_type}")
        change["rolledBackAt"] = time.time()
        temp = path.with_suffix(".tmp")
        temp.write_text(json.dumps(change, ensure_ascii=False, indent=2), encoding="utf-8")
        temp.replace(path)
        return f"已回滚 {resource_type}「{code}」"

    def _proposal_path(self, proposal_id: str) -> Path:
        """返回安全的持久化提案路径。"""
        if not re.fullmatch(r"proposal_[A-Za-z0-9_-]{10,100}", proposal_id):
            raise ValueError("非法操作提案 ID")
        return self._root / "proposals" / f"{proposal_id}.json"

    def _add_proposal(
        self,
        action: str,
        payload: dict[str, Any],
        summary: str,
        *,
        owner: str = "local",
    ) -> dict[str, Any]:
        """创建持久化的一次性确认提案，服务重启后仍可在有效期内确认。"""
        now = time.time()
        self._cleanup_expired_proposals(now)
        self._proposals = {
            key: value
            for key, value in self._proposals.items()
            if now - value.created_at <= _PROPOSAL_TTL_SECONDS
        }
        proposal_id = "proposal_" + secrets.token_urlsafe(12)
        proposal = _Proposal(action, payload, summary, now, owner)
        self._proposals[proposal_id] = proposal
        path = self._proposal_path(proposal_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({
            "action": action,
            "payload": payload,
            "summary": summary,
            "createdAt": now,
            "owner": owner,
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        return {
            "proposalId": proposal_id,
            "action": action,
            "summary": summary,
            "expiresInSeconds": _PROPOSAL_TTL_SECONDS,
        }

    def _cleanup_expired_proposals(self, now: float | None = None) -> None:
        """清理过期提案及其未确认的上传 ZIP，避免临时文件长期堆积。"""
        current = now or time.time()
        proposals_dir = self._root / "proposals"
        if not proposals_dir.is_dir():
            return
        imports_root = (self._root / "imports").resolve()
        for path in proposals_dir.glob("proposal_*.json"):
            try:
                raw = json.loads(path.read_text(encoding="utf-8"))
                if current - float(raw.get("createdAt") or 0) <= _PROPOSAL_TTL_SECONDS:
                    continue
                archive_raw = str((raw.get("payload") or {}).get("archivePath") or "")
                if archive_raw:
                    archive_path = Path(archive_raw).resolve()
                    if archive_path.is_relative_to(imports_root):
                        archive_path.unlink(missing_ok=True)
                path.unlink(missing_ok=True)
            except Exception:
                # 损坏提案无法安全执行，直接移除提案本身但不追随未知路径。
                path.unlink(missing_ok=True)

    @staticmethod
    def _extract_mcp_config(message: str) -> dict[str, Any] | None:
        """从对话中的 JSON 对象提取 MCP 配置。"""
        match = _JSON_RE.search(message)
        if not match:
            return None
        try:
            payload = json.loads(match.group(0))
        except json.JSONDecodeError:
            return None
        if not isinstance(payload, dict):
            return None
        aliases = {
            "server_code": "serverCode",
            "transport_type": "transportType",
            "command_args": "commandArgs",
        }
        for old, new in aliases.items():
            if old in payload and new not in payload:
                payload[new] = payload.pop(old)
        if not payload.get("serverCode") or not payload.get("name"):
            return None
        return payload

    @staticmethod
    def _extract_requested_name(message: str) -> str | None:
        """从“名称改成 X / 叫 X / 命名为 X”中提取用户明确给出的显示名。"""
        patterns = (
            r"(?:名称|名字)\s*(?:改成|改为|叫做|叫|是|为|[:：])\s*[「『\"']?([^」』\"'\n，。；;]{1,80})",
            r"(?:改名为|命名为|改成|改为|rename\s+to)\s*[「『\"']?([^」』\"'\n，。；;]{1,80})",
        )
        for pattern in patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                name = match.group(1).strip(" `「」『』\"'")
                # 后续配置说明不属于名称。
                name = re.split(r"\s+(?:需要|使用|采用|通过|并且|然后)\b", name, maxsplit=1)[0].strip()
                if name:
                    return name[:80]
        return None

    @staticmethod
    def _friendly_mcp_name(raw: str) -> str:
        """把域名或 npm 包名转换为可读名称，去掉 mcp/server/api 等技术噪声。"""
        value = urllib.parse.unquote(raw).strip().strip("/")
        try:
            ipaddress.ip_address(value)
            return f"MCP {value}"[:80]
        except ValueError:
            pass
        if "/" in value:
            value = value.rsplit("/", 1)[-1]
        if value.startswith("@") and "-" not in value:
            value = value[1:]
        value = re.sub(r"^(?:mcp[-_.]?server|server[-_.]?mcp|mcp|server)[-_.]?", "", value, flags=re.IGNORECASE)
        value = re.sub(r"[-_.]?(?:mcp[-_.]?server|server[-_.]?mcp|mcp|server)$", "", value, flags=re.IGNORECASE)
        tokens = [
            token
            for token in re.split(r"[-_.]+", value)
            if token.lower() not in {"www", "api", "mcp", "server", "service", "com", "cn", "io", "ai", "app"}
        ]
        if not tokens:
            return "Remote MCP"
        return " ".join(
            token.upper() if len(token) <= 3 and token.isalpha() else token[:1].upper() + token[1:]
            for token in tokens
        )[:80]

    @classmethod
    def _infer_mcp_config(cls, message: str) -> dict[str, Any] | None:
        """从安装命令或服务 URL 推导 MCP 配置，免填 serverCode、名称和传输字段。"""
        lowered = message.lower()
        if "mcp" not in lowered or not any(word in lowered for word in _MCP_ADD_WORDS):
            return None
        explicit_name = cls._extract_requested_name(message)
        command_match = re.search(r"\b(npx|uvx|python|node)\s+([^\r\n，。]+)", message, re.IGNORECASE)
        if command_match:
            command = command_match.group(1).lower()
            try:
                args = shlex.split(command_match.group(2), posix=False)
            except ValueError:
                args = command_match.group(2).split()
            package = next((arg for arg in args if not arg.startswith("-")), command)
            raw_code = package.rsplit("/", 1)[-1].replace("mcp-server-", "").replace("-mcp", "")
            code = re.sub(r"[^a-z0-9-]+", "-", raw_code.lower()).strip("-") or "mcp-server"
            return {
                "serverCode": code[:64],
                "name": explicit_name or cls._friendly_mcp_name(package),
                "transportType": "stdio",
                "command": command,
                "commandArgs": args,
            }
        url_match = re.search(r"https?://[^\s，。]+", message)
        if url_match:
            url = url_match.group(0).rstrip(".,")
            parsed = urllib.parse.urlparse(url)
            host = parsed.hostname or "remote-mcp"
            code = re.sub(r"[^a-z0-9-]+", "-", host.lower()).strip("-")[:64]
            static_headers = cls._extract_static_bearer_headers(message)
            auth_type = (
                "bearer"
                if static_headers
                else "oauth" if any(word in lowered for word in ("oauth", "登录", "授权")) else "none"
            )
            payload = {
                "serverCode": code or "remote-mcp",
                "name": explicit_name or cls._friendly_mcp_name(host),
                "transportType": "streamable_http",
                "url": url,
                "authType": auth_type,
            }
            if static_headers:
                # 仅供当前请求转入加密提案；不会进入注册表、会话状态或 API 响应。
                payload["_staticHeaders"] = static_headers
            return payload
        return None

    @staticmethod
    def _extract_static_bearer_headers(message: str) -> dict[str, str] | None:
        """从自然语言的 token/API Key 行提取 Bearer 凭证，不回显其内容。"""
        match = re.search(
            r"(?im)(?<![\w?&-])(?:access[_ -]?token|token|api[_ -]?key|"
            r"authorization|访问令牌|鉴权令牌)\s*[:：=]\s*"
            r"(?:bearer\s+)?[\"'`]?([^\s，,；;\"'`]+)",
            message,
        )
        if not match:
            return None
        token = match.group(1).strip()
        if not token or token == "***" or len(token) > 4096:
            return None
        return {"Authorization": f"Bearer {token}"}

    def _mcp_credential_cipher(self):
        """使用数据卷中的公共主密钥加解密短时 MCP 提案凭证。"""
        from app.services.ai import LocalSecretCipher

        return LocalSecretCipher(
            self._root.parent / ".secrets" / "provider-encryption.key",
        )

    def _seal_mcp_headers(self, headers: dict[str, str]) -> dict[str, str]:
        """把静态请求头封装为可跨进程确认、但不含明文的提案字段。"""
        plaintext = json.dumps(headers, ensure_ascii=False, separators=(",", ":"))
        return {
            "kind": "static-headers-fernet-v1",
            "encrypted": self._mcp_credential_cipher().encrypt(plaintext),
        }

    def _unseal_mcp_headers(self, envelope: Any) -> dict[str, str]:
        """解开确认提案中的静态请求头并校验基本结构。"""
        if not isinstance(envelope, dict) or envelope.get("kind") != "static-headers-fernet-v1":
            raise ValueError("MCP 凭证提案格式无效")
        encrypted = str(envelope.get("encrypted") or "")
        raw = json.loads(self._mcp_credential_cipher().decrypt(encrypted))
        if not isinstance(raw, dict) or not raw:
            raise ValueError("MCP 凭证提案内容无效")
        return {str(name): str(value) for name, value in raw.items()}

    @staticmethod
    def _safe_mcp_summary(payload: dict[str, Any]) -> str:
        """展示 MCP 变更摘要，环境变量只显示变量名。"""
        transport = payload.get("transportType", "stdio")
        target = payload.get("command") if transport == "stdio" else payload.get("url")
        env_names = list((payload.get("env") or {}).keys())
        suffix = f"；需要环境变量：{', '.join(env_names)}" if env_names else ""
        if payload.get("authType") == "bearer":
            suffix += "；鉴权：Bearer（凭证已加密）"
        return f"添加 MCP「{payload.get('name')}」（{transport}，{target or '目标未填写'}）{suffix}"

    @staticmethod
    def _mentioned_item(message: str, items: list[Any], key_name: str) -> Any | None:
        """按 code/key 或显示名从自然语言中定位一个注册表实体。"""
        lowered = message.lower()
        matches = []
        for item in items:
            key = str(getattr(item, key_name, "") or "")
            name = str(getattr(item, "name", "") or "")
            if (key and key.lower() in lowered) or (name and name.lower() in lowered):
                matches.append(item)
        return max(matches, key=lambda item: len(str(getattr(item, key_name, ""))), default=None)

    def _dependency_report(self, skill: Any) -> dict[str, Any]:
        """检查 Skill 声明的 Skill/Tool/MCP 依赖是否已经安装。"""
        installed_skills = {item.code for item in self._skills.list_all()}
        installed_tools = {item.tool_code for item in self._tools.list_all()}
        installed_mcps = {item.server_code for item in self._mcps.list_all()}
        missing = {
            "skills": [code for code in skill.skill_dependencies if code not in installed_skills],
            "tools": [code for code in skill.tool_dependencies if code not in installed_tools],
            "mcpServers": [code for code in skill.mcp_dependencies if code not in installed_mcps],
        }
        return {
            "declared": {
                "skills": skill.skill_dependencies,
                "tools": skill.tool_dependencies,
                "mcpServers": skill.mcp_dependencies,
            },
            "missing": missing,
            "ready": not any(missing.values()),
        }

    @staticmethod
    def _owner_key(owner: str) -> str:
        """把用户名转换为不可反推的目录键。"""
        return hashlib.sha256(owner.encode("utf-8")).hexdigest()[:24]

    def _session_path(self, owner: str, session_id: str) -> Path:
        """返回用户隔离的系统管家会话路径。"""
        if not re.fullmatch(r"sm_[A-Za-z0-9_-]{8,100}", session_id):
            raise ValueError("非法系统管家会话 ID")
        return self._root / "sessions" / self._owner_key(owner) / f"{session_id}.json"

    def get_session(self, owner: str, session_id: str) -> dict[str, Any]:
        """读取当前用户自己的系统管家会话。"""
        path = self._session_path(owner, session_id)
        if not path.exists():
            raise ValueError("系统管家会话不存在")
        return json.loads(path.read_text(encoding="utf-8"))

    def _load_session_state(
        self,
        owner: str,
        session_id: str,
    ) -> tuple[list[dict[str, Any]], dict[str, Any]]:
        """读取最近对话和结构化焦点；新会话返回空状态。"""
        path = self._session_path(owner, session_id)
        if not path.exists():
            return [], {}
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            messages = data.get("messages") if isinstance(data.get("messages"), list) else []
            state = data.get("state") if isinstance(data.get("state"), dict) else {}
            return messages[-32:], state
        except Exception:
            return [], {}

    def _record_exchange(
        self,
        owner: str,
        session_id: str,
        message: str,
        response: dict[str, Any],
        page_path: str,
        state_update: dict[str, Any] | None = None,
    ) -> None:
        """原子追加一轮对话；不保存 OAuth code、token 或密钥明文。"""
        path = self._session_path(owner, session_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        if path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
        else:
            data = {
                "sessionId": session_id,
                "messages": [],
                "state": {},
                "createdAt": time.time(),
            }
        safe_message = re.sub(
            r'("(?:api[_-]?key|token|secret|password)"\s*:\s*")[^"]+(")',
            r'\1***\2',
            message,
            flags=re.IGNORECASE,
        )
        safe_message = re.sub(
            r"(?im)((?<![\w?&-])(?:access[_ -]?token|token|api[_ -]?key|"
            r"authorization|访问令牌|鉴权令牌)\s*[:：=]\s*(?:bearer\s+)?)"
            r"[\"'`]?[^\s，,；;\"'`]+",
            r"\1***",
            safe_message,
        )
        data["messages"].extend([
            {"role": "user", "content": safe_message, "pagePath": page_path, "createdAt": time.time()},
            {
                "role": "assistant",
                "content": response.get("answer", ""),
                "proposal": response.get("proposal"),
                "uiAction": response.get("uiAction"),
                "createdAt": time.time(),
            },
        ])
        data["messages"] = data["messages"][-200:]
        if not isinstance(data.get("state"), dict):
            data["state"] = {}
        if state_update:
            data["state"].update(state_update)
        data["updatedAt"] = time.time()
        temp = path.with_suffix(".tmp")
        temp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        temp.replace(path)

    def _discard_proposal(self, proposal_id: str | None, owner: str) -> None:
        """使旧草稿提案失效；只处理当前用户自己的提案。"""
        if not proposal_id:
            return
        proposal = self._proposals.get(proposal_id)
        if proposal is not None and proposal.owner == owner:
            self._proposals.pop(proposal_id, None)
        try:
            path = self._proposal_path(proposal_id)
            if not path.exists():
                return
            raw = json.loads(path.read_text(encoding="utf-8"))
            if raw.get("owner") == owner:
                path.unlink(missing_ok=True)
        except Exception:
            return

    def _pending_mcp_credential(self, proposal_id: str | None, owner: str) -> Any:
        """读取待改名提案的加密凭证封套，不解密也不向会话或响应暴露。"""
        if not proposal_id:
            return None
        proposal = self._proposals.get(proposal_id)
        if proposal is not None:
            return proposal.payload.get("credential") if proposal.owner == owner else None
        try:
            path = self._proposal_path(proposal_id)
            if not path.exists():
                return None
            raw = json.loads(path.read_text(encoding="utf-8"))
            if str(raw.get("owner") or "local") != owner:
                return None
            return (raw.get("payload") or {}).get("credential")
        except Exception:
            return None

    @staticmethod
    def _mcp_focus_state(
        definition: dict[str, Any],
        proposal_id: str | None = None,
    ) -> dict[str, Any]:
        """构造会话中的 MCP 当前焦点，供“它/刚才那个”指代。"""
        return {
            "focusedResource": {
                "type": "mcp",
                "code": definition.get("serverCode"),
                "name": definition.get("name"),
            },
            "pendingMcpDefinition": definition,
            "pendingProposalId": proposal_id,
        }

    def chat(
        self,
        message: str,
        page_path: str,
        *,
        owner: str = "local",
        session_id: str | None = None,
    ) -> dict[str, Any]:
        """处理帮助对话；写操作只返回待确认提案。"""
        text = message.strip()
        lower = text.lower()
        active_session_id = session_id or ("sm_" + secrets.token_urlsafe(12))
        conversation_history, session_state = self._load_session_state(
            owner,
            active_session_id,
        )
        guide = self._guide_for_path(page_path)
        manager_info = self._manager_info()
        response: dict[str, Any] = {
            "mode": "guide",
            "sources": [{"title": guide["title"], "type": "page"}],
            "suggestions": ["告诉我下一步", "检查系统状态", "解释最近失败"],
            "sessionId": active_session_id,
            "agent": {
                **manager_info,
                "decisionSource": "rules",
                "contextMessages": len(conversation_history),
            },
        }

        def finish(
            result: dict[str, Any],
            *,
            state_update: dict[str, Any] | None = None,
            decision_source: str = "rules",
        ) -> dict[str, Any]:
            result["agent"] = {
                **manager_info,
                "decisionSource": decision_source,
                "contextMessages": len(conversation_history),
            }
            self._record_exchange(
                owner,
                active_session_id,
                text,
                result,
                page_path,
                state_update=state_update,
            )
            return result

        asks_model = "模型" in text and any(
            word in text for word in ("什么", "哪个", "哪一个", "用的", "调用", "是谁")
        )
        if asks_model:
            model_reference = manager_info.get("modelReference") or "当前不可用"
            configuration_note = (
                "这是为系统管家单独配置的模型。"
                if manager_info.get("modelConfigured")
                else (
                    "当前没有配置系统管家专用模型，正在跟随平台默认模型；"
                    "可通过 Agent.SystemManagerModel 固定。"
                )
            )
            response.update({
                "mode": "diagnose",
                "answer": (
                    f"当前系统管家使用：**{model_reference}**。\n\n"
                    f"{configuration_note}\n\n"
                    "MCP 安装、改名等管理动作由本地规则解析并生成待确认提案；"
                    "复杂解释才会调用这个模型。"
                ),
                "suggestions": ["查看系统状态", "查看 MCP 列表", "告诉我下一步"],
            })
            return finish(response)

        github = _GITHUB_RE.search(text)
        if github and any(word in text.lower() for word in ("安装", "导入", "install", "import")):
            source = github.group(0).rstrip(".,，。")
            preview = self._inspect_github_skill(source)
            existing = self._skills.get(preview["skillCode"])
            action = "update_skill" if existing is not None else "install_skill"
            verb = "更新" if existing is not None else "安装"
            proposal = self._add_proposal(
                action,
                {"source": source, "expectedHash": preview["archiveHash"], "skillCode": preview["skillCode"]},
                f"从 GitHub {verb} Skill「{preview['name']}」（{preview['skillCode']}）",
                owner=owner,
            )
            risks = "；".join(preview["risks"]) if preview["risks"] else "未发现高风险文件"
            dependency_note = (
                "依赖已满足"
                if preview["dependencies"]["ready"]
                else f"仍缺依赖：{preview['dependencies']['missing']}"
            )
            response.update({
                "mode": "manage",
                "answer": (
                    f"我已检查这个 Skill：**{preview['name']}**。\n\n"
                    f"{preview['description']}\n\n风险检查：{risks}\n\n依赖检查：{dependency_note}\n\n"
                    "安装会写入系统技能目录；我不会运行其中的脚本。请确认后再安装。"
                ),
                "proposal": proposal,
            })
            return finish(response)

        if "skill" in lower and any(word in text for word in ("卸载", "删除", "移除")):
            skill = self._mentioned_item(text, self._skills.list_all(), "code")
            if skill is None:
                raise ValueError("没有找到要卸载的 Skill，请说出 Skill 名称或 code")
            bound_employees = [
                employee.name or employee.employee_key
                for employee in self._employees.list_all()
                if skill.code in (employee.skill_refs or [])
            ]
            proposal = self._add_proposal(
                "remove_skill",
                {"skillCode": skill.code},
                (
                    f"卸载 Skill「{skill.name}」（{skill.code}）"
                    + (f"；当前被这些员工使用：{', '.join(bound_employees)}" if bound_employees else "")
                ),
                owner=owner,
            )
            response.update({
                "mode": "manage",
                "answer": "我会先备份 Skill，再卸载并保留可回滚记录。已绑定员工不会被静默改写，请先确认影响。",
                "proposal": proposal,
            })
            return finish(response)

        rename_intent = (
            "mcp" in lower
            and any(word in lower for word in _MCP_RENAME_WORDS)
        ) or (
            any(word in lower for word in _MCP_RENAME_WORDS)
            and (session_state.get("focusedResource") or {}).get("type") == "mcp"
        )
        if rename_intent and not any(word in lower for word in _MCP_ADD_WORDS):
            focus = session_state.get("focusedResource") or {}
            item = self._mentioned_item(text, self._mcps.list_all(), "server_code")
            if item is None and focus.get("type") == "mcp" and focus.get("code"):
                item = self._mcps.get(str(focus["code"]))
            pending_definition = session_state.get("pendingMcpDefinition")
            if not isinstance(pending_definition, dict):
                pending_definition = None

            current_name = (
                getattr(item, "name", "")
                if item is not None
                else str((pending_definition or {}).get("name") or focus.get("name") or "")
            )
            requested_name = self._extract_requested_name(text)
            if not requested_name:
                response.update({
                    "mode": "manage",
                    "answer": (
                        f"可以。当前名称是「{current_name or '未命名 MCP'}」。"
                        "请直接告诉我新名称，例如：`名字改成 Notion 知识库`。"
                    ),
                })
                return finish(response)

            if item is None and pending_definition is not None:
                updated_definition = dict(pending_definition)
                updated_definition["name"] = requested_name
                pending_proposal_id = str(session_state.get("pendingProposalId") or "")
                credential = self._pending_mcp_credential(pending_proposal_id, owner)
                self._discard_proposal(
                    pending_proposal_id,
                    owner,
                )
                proposal_payload: dict[str, Any] = {"definition": updated_definition}
                if credential is not None:
                    proposal_payload["credential"] = credential
                proposal = self._add_proposal(
                    "add_mcp",
                    proposal_payload,
                    self._safe_mcp_summary(updated_definition),
                    owner=owner,
                )
                response.update({
                    "mode": "manage",
                    "answer": (
                        f"已把刚才那个 MCP 的名称从「{current_name}」改为"
                        f"「{requested_name}」。连接地址和登录方式没有变化，请确认新预览。"
                    ),
                    "proposal": proposal,
                })
                return finish(
                    response,
                    state_update=self._mcp_focus_state(
                        updated_definition,
                        proposal["proposalId"],
                    ),
                )

            if item is None:
                response.update({
                    "mode": "manage",
                    "answer": "我无法唯一确定你指的是哪个 MCP。请说出当前名称或 serverCode。",
                })
                return finish(response)

            proposal = self._add_proposal(
                "rename_mcp",
                {
                    "serverCode": item.server_code,
                    "newName": requested_name,
                },
                f"把 MCP「{item.name}」（{item.server_code}）重命名为「{requested_name}」",
                owner=owner,
            )
            response.update({
                "mode": "manage",
                "answer": (
                    f"已定位刚才的 MCP「{item.name}」。这次只修改显示名称，"
                    "serverCode、连接地址、登录和员工绑定都保持不变。"
                ),
                "proposal": proposal,
            })
            focused = item.model_dump(by_alias=True, mode="json")
            focused["name"] = requested_name
            return finish(
                response,
                state_update=self._mcp_focus_state(
                    focused,
                    proposal["proposalId"],
                ),
            )

        if "mcp" in lower and any(word in text for word in ("删除", "移除", "卸载")):
            item = self._mentioned_item(text, self._mcps.list_all(), "server_code")
            if item is None:
                raise ValueError("没有找到要删除的 MCP，请说出名称或 serverCode")
            proposal = self._add_proposal(
                "remove_mcp",
                {"serverCode": item.server_code},
                f"删除 MCP「{item.name}」（{item.server_code}）并清除本机 OAuth 登录",
                owner=owner,
            )
            response.update({
                "mode": "manage",
                "answer": "我已生成删除预览。配置会进入变更快照，可从审计记录回滚。",
                "proposal": proposal,
            })
            return finish(
                response,
                state_update={
                    "focusedResource": {
                        "type": "mcp",
                        "code": item.server_code,
                        "name": item.name,
                    },
                },
            )

        if (
            "mcp" in lower
            and any(word in text for word in ("登录", "授权", "oauth"))
            and not any(word in lower for word in ("添加", "安装", "接入", "连接", "add"))
        ):
            item = self._mentioned_item(text, self._mcps.list_all(), "server_code")
            if item is None:
                raise ValueError("没有找到要登录的 MCP，请说出名称或 serverCode")
            if (item.auth_type or "none").lower() != "oauth":
                raise ValueError("这个 MCP 没有配置 OAuth；如使用 API Key，请配置环境变量引用")
            response.update({
                "mode": "manage",
                "answer": f"可以。我会打开「{item.name}」的官方授权页，回调后自动交换加密令牌并真实验证连接。",
                "uiAction": {"kind": "mcp_oauth", "serverCode": item.server_code, "label": "开始登录"},
            })
            return finish(
                response,
                state_update={
                    "focusedResource": {
                        "type": "mcp",
                        "code": item.server_code,
                        "name": item.name,
                    },
                },
            )

        if "mcp" in lower and any(word in text for word in ("测试", "验证", "能不能用")):
            item = self._mentioned_item(text, self._mcps.list_all(), "server_code")
            if item is None:
                raise ValueError("没有找到要验证的 MCP，请说出名称或 serverCode")
            response.update({
                "mode": "diagnose",
                "answer": f"已定位 MCP「{item.name}」。点击后会建立真实会话并读取工具列表。",
                "uiAction": {"kind": "mcp_test", "serverCode": item.server_code, "label": "真实验证"},
            })
            return finish(
                response,
                state_update={
                    "focusedResource": {
                        "type": "mcp",
                        "code": item.server_code,
                        "name": item.name,
                    },
                },
            )

        change_match = re.search(r"change_[A-Za-z0-9_-]{10,100}", text)
        if change_match and "回滚" in text:
            proposal = self.propose_rollback(change_match.group(0), owner=owner)
            response.update({
                "mode": "manage",
                "answer": "已读取变更快照。确认后才会恢复原配置。",
                "proposal": proposal,
            })
            return finish(response)

        if any(word in text for word in ("绑定", "解绑")) and any(
            word in lower for word in ("skill", "mcp", "工具", "tool")
        ):
            employee = self._mentioned_item(text, self._employees.list_all(), "employee_key")
            resource_type = (
                "skill"
                if "skill" in lower
                else ("mcp" if "mcp" in lower else "tool")
            )
            resources = (
                self._skills.list_all()
                if resource_type == "skill"
                else (self._mcps.list_all() if resource_type == "mcp" else self._tools.list_all())
            )
            key_name = (
                "code"
                if resource_type == "skill"
                else ("server_code" if resource_type == "mcp" else "tool_code")
            )
            resource = self._mentioned_item(text, resources, key_name)
            if employee is None or resource is None:
                raise ValueError("请同时说出要操作的 Skill/MCP 和数字员工名称")
            resource_code = getattr(resource, key_name)
            binding_action = "unbind_resource" if "解绑" in text else "bind_resource"
            proposal = self._add_proposal(
                binding_action,
                {
                    "employeeKey": employee.employee_key,
                    "resourceType": resource_type,
                    "resourceCode": resource_code,
                },
                f"{'解绑' if binding_action == 'unbind_resource' else '绑定'} {resource_type.upper()}「{resource.name}」"
                f"{'与' if binding_action == 'unbind_resource' else '给'}员工「{employee.name}」",
                owner=owner,
            )
            response.update({
                "mode": "manage",
                "answer": "绑定关系已检查，确认后会更新员工配置并保留回滚快照。",
                "proposal": proposal,
            })
            return finish(response)

        mcp_payload = self._extract_mcp_config(text) or self._infer_mcp_config(text)
        if mcp_payload and "mcp" in text.lower():
            normalized_payload = dict(mcp_payload)
            static_headers = normalized_payload.pop("_staticHeaders", None)
            item = McpServerDefinition.model_validate(normalized_payload)
            if not item.server_code:
                raise ValueError("MCP 配置缺少 serverCode")
            for name, value in {**(item.env or {}), **(item.headers or {})}.items():
                sensitive = re.search(r"token|secret|password|api[_-]?key|authorization", name, re.IGNORECASE)
                if sensitive and not re.fullmatch(r"\$\{[A-Z][A-Z0-9_]*\}", str(value).strip()):
                    raise ValueError(
                        f"敏感字段 {name} 不能直接写入 MCP 配置，请使用 ${{ENV_VAR}} 引用 .env 环境变量"
                    )
            definition = item.model_dump(by_alias=True, mode="json")
            proposal_payload: dict[str, Any] = {"definition": definition}
            if static_headers:
                proposal_payload["credential"] = self._seal_mcp_headers(static_headers)
            proposal = self._add_proposal(
                "add_mcp",
                proposal_payload,
                self._safe_mcp_summary(definition),
                owner=owner,
            )
            response.update({
                "mode": "manage",
                "answer": (
                    f"我识别到这是 MCP「{item.name}」，编码为 `{item.server_code}`。"
                    + ("Token 已加密封装，确认后会安全保存；" if static_headers else "")
                    + "连接方式已经解析完成；名称或编码不合适可以直接说"
                    "“名字改成 …”，确认后才会保存。"
                ),
                "proposal": proposal,
            })
            return finish(
                response,
                state_update=self._mcp_focus_state(
                    definition,
                    proposal["proposalId"],
                ),
            )

        if "mcp" in lower and any(word in lower for word in ("添加", "安装", "接入", "连接")):
            response.update({
                "mode": "manage",
                "answer": (
                    "把 MCP 的官网/服务 URL 或官方安装命令直接发给我即可。"
                    "例如：`添加 MCP：https://example.com/mcp，需要 OAuth 登录`，"
                    "或者粘贴 `npx -y @scope/server`。名称、编码和传输方式由我推导。"
                ),
            })
            return finish(response)

        context = self.context(page_path)
        if any(word in lower for word in ("状态", "健康", "检查", "装了什么")):
            inventory = context["inventory"]
            bad = [
                item
                for item in context["mcpStatus"]
                if item.get("inUse") and item["status"] != "configured"
            ]
            response.update({
                "mode": "diagnose",
                "answer": (
                    f"当前有 {inventory['employees']} 个数字员工、{inventory['skills']} 个 Skill、"
                    f"{inventory['tools']} 个工具和 {inventory['mcpServers']} 个 MCP。"
                    + (
                        f"\n\n其中 {len(bad)} 个正在使用的 MCP 需要处理。"
                        if bad
                        else "\n\n正在使用的 MCP 未发现配置问题。"
                    )
                ),
                "diagnostics": context,
            })
            return finish(response)

        if any(word in text for word in ("失败", "报错", "日志", "一直生成", "卡住")):
            failures = context["recentFailures"]
            answer = "最近没有查到失败的 Agent 运行记录。"
            if failures:
                latest = failures[0]
                answer = (
                    f"最近一次失败来自 `{latest['employeeKey']}`，运行号 `{latest['runId']}`：\n\n"
                    f"{latest['error']}"
                )
            response.update({"mode": "diagnose", "answer": answer, "diagnostics": context})
            return finish(response)

        if any(word in text for word in ("下一步", "接下来", "继续做")) and context.get("projectContext"):
            project = context["projectContext"]
            action = project["nextAction"]
            response.update({
                "mode": "guide",
                "answer": (
                    f"项目「{project['name']}」当前健康分 {project['score']}，状态是 {project['state']}。\n\n"
                    f"{project['summary']}\n\n下一步：**{action.get('label', '继续处理首要问题')}**"
                ),
                "diagnostics": context,
            })
            return finish(response)

        if any(word in text for word in ("下一步", "接下来", "继续做")):
            steps = "\n".join(
                f"{index + 1}. {step}"
                for index, step in enumerate(guide["steps"])
            )
            response.update({
                "mode": "guide",
                "answer": (
                    f"你现在在 **{guide['title']}**。{guide['summary']}\n\n"
                    f"建议下一步：\n{steps}"
                ),
                "diagnostics": context,
            })
            return finish(response)

        knowledge = self._search_knowledge(text)
        model_answer, model_reference = self._model_answer(
            text,
            page_path,
            context,
            knowledge,
            conversation_history=conversation_history,
            session_state=session_state,
        )
        if model_answer:
            response.update({
                "mode": "guide",
                "answer": model_answer,
                "sources": [
                    {"title": item["title"], "type": "manual", "path": item["path"]}
                    for item in knowledge
                ],
            })
            if model_reference:
                response["agent"]["modelReference"] = model_reference
            return finish(response, decision_source="model")

        steps = "\n".join(f"{index + 1}. {step}" for index, step in enumerate(guide["steps"]))
        response["answer"] = (
            f"你现在在 **{guide['title']}**。{guide['summary']}\n\n"
            f"建议下一步：\n{steps}"
        )
        response["diagnostics"] = context
        return finish(response)

    def _consume_proposal(self, proposal_id: str, owner: str) -> _Proposal:
        """读取并删除属于当前用户的提案，保证跨进程重启后仍保持一次性。"""
        proposal = self._proposals.pop(proposal_id, None)
        path = self._proposal_path(proposal_id)
        if proposal is None and path.exists():
            raw = json.loads(path.read_text(encoding="utf-8"))
            proposal = _Proposal(
                action=raw["action"],
                payload=raw["payload"],
                summary=raw["summary"],
                created_at=float(raw["createdAt"]),
                owner=str(raw.get("owner") or "local"),
            )
        if proposal is None:
            raise ValueError("操作提案不存在、已经执行或已过期")
        if proposal.owner != owner:
            raise ValueError("无权执行其他用户的操作提案")
        if path.exists():
            path.unlink()
        return proposal

    def confirm(self, proposal_id: str, *, owner: str = "local") -> dict[str, Any]:
        """消费并执行待确认提案；一个提案只能执行一次。"""
        proposal = self._consume_proposal(proposal_id, owner)
        if time.time() - proposal.created_at > _PROPOSAL_TTL_SECONDS:
            raise ValueError("操作提案已过期，请重新发起")
        if proposal.action == "add_mcp":
            item = McpServerDefinition.model_validate(proposal.payload["definition"])
            previous = self._mcps.get(item.server_code)
            from app.services.mcp_oauth import EncryptedMcpTokenStorage

            credential_storage = EncryptedMcpTokenStorage(
                item.server_code,
                root_dir=self._root.parent / "mcp-auth",
            )
            credential = proposal.payload.get("credential")
            if credential is not None:
                credential_storage.set_static_headers(
                    self._unseal_mcp_headers(credential)
                )
            elif (item.auth_type or "none").lower() != "bearer":
                credential_storage.clear_static_headers()
            saved = self._mcps.save(item)
            self._clear_mcp_runtime_state(saved.server_code)
            message = f"MCP「{saved.name}」及其鉴权配置已安全保存。下一步将验证连接。"
            change_id = self._save_change(
                owner,
                proposal.action,
                "mcp",
                saved.server_code,
                previous.model_dump(by_alias=True, mode="json") if previous else None,
            )
            self._write_audit(proposal, "success", message, change_id=change_id)
            return {
                "action": proposal.action,
                "message": message,
                "resource": saved.model_dump(by_alias=True, mode="json"),
                "changeId": change_id,
            }
        if proposal.action == "rename_mcp":
            server_code = str(proposal.payload.get("serverCode") or "")
            new_name = str(proposal.payload.get("newName") or "").strip()
            item = self._mcps.get(server_code)
            if item is None:
                raise ValueError("要重命名的 MCP 已不存在")
            if not new_name:
                raise ValueError("MCP 新名称不能为空")
            before = item.model_dump(by_alias=True, mode="json")
            saved = self._mcps.save(item.model_copy(update={"name": new_name}))
            message = (
                f"MCP「{before.get('name') or server_code}」已重命名为"
                f"「{saved.name}」，serverCode 保持 `{server_code}`。"
            )
            change_id = self._save_change(
                owner,
                proposal.action,
                "mcp",
                server_code,
                before,
            )
            self._write_audit(proposal, "success", message, change_id=change_id)
            return {
                "action": proposal.action,
                "message": message,
                "resource": saved.model_dump(by_alias=True, mode="json"),
                "changeId": change_id,
            }
        if proposal.action == "install_skill":
            installed = self._install_github_skill(
                proposal.payload["source"],
                proposal.payload["expectedHash"],
                proposal.payload["skillCode"],
            )
            message = f"Skill「{installed.name}」安装完成，尚未绑定给任何员工。"
            change_id = self._save_change(owner, proposal.action, "skill", installed.code, None)
            self._write_audit(proposal, "success", message, change_id=change_id)
            return {
                "action": proposal.action,
                "message": message,
                "resource": installed.model_dump(by_alias=True, mode="json"),
                "changeId": change_id,
            }
        if proposal.action in {"install_skill_archive", "update_skill_archive"}:
            archive_path = Path(proposal.payload["archivePath"]).resolve()
            imports_root = (self._root / "imports").resolve()
            if not archive_path.is_relative_to(imports_root) or not archive_path.is_file():
                raise ValueError("上传的 Skill 临时文件不存在或路径无效")
            archive = archive_path.read_bytes()
            if hashlib.sha256(archive).hexdigest() != proposal.payload["expectedHash"]:
                raise ValueError("上传的 Skill 文件在确认前发生变化")
            skill_code = proposal.payload["skillCode"]
            if proposal.action == "install_skill_archive":
                installed = self._install_skill_archive(archive, None, skill_code)
                before = None
                message = f"Skill「{installed.name}」已从上传文件安装。"
            else:
                installed, backup = self._update_skill_archive(archive, None, skill_code)
                before = {"backupPath": str(backup)}
                message = f"Skill「{installed.name}」已从上传文件更新，原版本已备份。"
            archive_path.unlink(missing_ok=True)
            change_id = self._save_change(
                owner, proposal.action, "skill", installed.code, before
            )
            self._write_audit(proposal, "success", message, change_id=change_id)
            return {
                "action": proposal.action,
                "message": message,
                "resource": installed.model_dump(by_alias=True, mode="json"),
                "changeId": change_id,
            }
        if proposal.action == "update_skill":
            installed, backup = self._update_github_skill(
                proposal.payload["source"],
                proposal.payload["expectedHash"],
                proposal.payload["skillCode"],
            )
            message = f"Skill「{installed.name}」已更新，原版本已备份。"
            change_id = self._save_change(
                owner, proposal.action, "skill", installed.code, {"backupPath": str(backup)}
            )
            self._write_audit(proposal, "success", message, change_id=change_id)
            return {
                "action": proposal.action,
                "message": message,
                "resource": installed.model_dump(by_alias=True, mode="json"),
                "changeId": change_id,
            }
        if proposal.action == "remove_skill":
            skill_code = proposal.payload["skillCode"]
            skill = self._skills.get(skill_code)
            if skill is None:
                raise ValueError(f"Skill 不存在：{skill_code}")
            backup = self._remove_skill_with_backup(skill)
            message = f"Skill「{skill.name}」已卸载，备份可用于回滚。"
            change_id = self._save_change(
                owner, proposal.action, "skill", skill_code, backup
            )
            self._write_audit(proposal, "success", message, change_id=change_id)
            return {"action": proposal.action, "message": message, "changeId": change_id}
        if proposal.action == "remove_mcp":
            server_code = proposal.payload["serverCode"]
            item = self._mcps.get(server_code)
            if item is None:
                raise ValueError(f"MCP 不存在：{server_code}")
            before = item.model_dump(by_alias=True, mode="json")
            self._mcps.delete(server_code)
            from app.services.mcp_oauth import EncryptedMcpTokenStorage

            EncryptedMcpTokenStorage(
                server_code,
                root_dir=self._root.parent / "mcp-auth",
            ).clear()
            self._clear_mcp_runtime_state(server_code)
            message = f"MCP「{item.name}」已删除。"
            change_id = self._save_change(owner, proposal.action, "mcp", server_code, before)
            self._write_audit(proposal, "success", message, change_id=change_id)
            return {"action": proposal.action, "message": message, "changeId": change_id}
        if proposal.action in {"bind_resource", "unbind_resource"}:
            employee = self._employees.get(proposal.payload["employeeKey"])
            if employee is None:
                raise ValueError("数字员工不存在")
            before = employee.model_dump(by_alias=True, mode="json")
            attr = {
                "skill": "skill_refs",
                "mcp": "mcp_server_refs",
                "tool": "tool_refs",
            }[proposal.payload["resourceType"]]
            refs = list(getattr(employee, attr) or [])
            code = proposal.payload["resourceCode"]
            if proposal.action == "bind_resource" and code not in refs:
                refs.append(code)
            if proposal.action == "unbind_resource":
                refs = [ref for ref in refs if ref != code]
            setattr(employee, attr, refs)
            self._employees.save(employee)
            message = f"员工「{employee.name}」的能力绑定已更新。"
            change_id = self._save_change(
                owner, proposal.action, "employee", employee.employee_key, before
            )
            self._write_audit(proposal, "success", message, change_id=change_id)
            return {
                "action": proposal.action,
                "message": message,
                "resource": employee.model_dump(by_alias=True, mode="json"),
                "changeId": change_id,
            }
        if proposal.action == "rollback":
            message = self._rollback_change(proposal.payload["changeId"], owner)
            self._write_audit(proposal, "success", message)
            return {"action": proposal.action, "message": message}
        raise ValueError(f"不支持的系统管家操作：{proposal.action}")

    @staticmethod
    def _github_archive(source: str) -> tuple[bytes, str | None]:
        """下载 GitHub 仓库归档并返回目标子目录。"""
        match = _GITHUB_RE.fullmatch(source)
        if not match:
            raise ValueError("目前仅支持公开 GitHub 仓库或其中的 Skill 子目录")
        owner, repo = match.group("owner"), match.group("repo").removesuffix(".git")
        ref = match.group("ref") or "HEAD"
        target_path = match.group("path")
        archive_url = f"https://api.github.com/repos/{owner}/{repo}/zipball/{urllib.parse.quote(ref, safe='')}"
        headers = {
            "User-Agent": "Agent-Studio-System-Manager/1.0",
            "Accept": "application/vnd.github+json",
        }
        github_token = os.getenv("GITHUB_TOKEN", "").strip()
        if github_token:
            headers["Authorization"] = f"Bearer {github_token}"
        request = urllib.request.Request(
            archive_url,
            headers=headers,
        )
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = response.read(_MAX_ARCHIVE_BYTES + 1)
        if len(payload) > _MAX_ARCHIVE_BYTES:
            raise ValueError("Skill 仓库归档超过 10 MB，拒绝安装")
        return payload, target_path

    @staticmethod
    def _extract_skill(archive: bytes, target_path: str | None, destination: Path) -> Path:
        """安全解压归档并定位唯一的 SKILL.md 根目录。"""
        with zipfile.ZipFile(io.BytesIO(archive)) as bundle:
            entries = bundle.infolist()
            if len(entries) > _MAX_ARCHIVE_FILES:
                raise ValueError("Skill 仓库文件过多，拒绝安装")
            for entry in entries:
                normalized = Path(entry.filename.replace("\\", "/"))
                if normalized.is_absolute() or ".." in normalized.parts:
                    raise ValueError("Skill 归档包含不安全路径")
                if entry.is_dir():
                    continue
                output = destination.joinpath(*normalized.parts)
                output.parent.mkdir(parents=True, exist_ok=True)
                with bundle.open(entry) as source_file, output.open("wb") as output_file:
                    shutil.copyfileobj(source_file, output_file)

        candidates = list(destination.rglob("SKILL.md"))
        if target_path:
            normalized_target = target_path.strip("/")
            candidates = [
                path for path in candidates
                if path.parent.as_posix().endswith(normalized_target)
            ]
        if len(candidates) != 1:
            raise ValueError(
                "无法唯一确定 Skill 目录；请提供指向具体 Skill 子目录的 GitHub /tree/ 链接"
            )
        return candidates[0].parent

    def _inspect_github_skill(self, source: str) -> dict[str, Any]:
        """下载但不安装，校验 Skill 清单并生成确认预览。"""
        archive, target_path = self._github_archive(source)
        return self._inspect_skill_archive(archive, target_path)

    def _inspect_skill_archive(
        self,
        archive: bytes,
        target_path: str | None = None,
    ) -> dict[str, Any]:
        """统一检查 GitHub 或上传的 Skill ZIP。"""
        with tempfile.TemporaryDirectory(prefix="agent-studio-skill-preview-") as temp:
            skill_dir = self._extract_skill(archive, target_path, Path(temp))
            skill = load_skill_package(skill_dir)
            script_extensions = {".py", ".js", ".ts", ".sh", ".ps1", ".bat", ".cmd"}
            scripts = [
                path.relative_to(skill_dir).as_posix()
                for path in skill_dir.rglob("*")
                if path.is_file() and path.suffix.lower() in script_extensions
            ]
            risks: list[str] = []
            if scripts:
                risks.append(f"包含 {len(scripts)} 个可执行脚本（安装时不会运行）")
            allowed_tools = getattr(skill, "allowedTools", None) or []
            allowed_text = " ".join(allowed_tools) if isinstance(allowed_tools, list) else str(allowed_tools)
            if re.search(r"shell|bash|powershell|write|delete|exec", allowed_text, re.IGNORECASE):
                risks.append("声明了命令执行或文件写入类工具权限")
            dependencies = self._dependency_report(skill)
        return {
            "skillCode": skill.code,
            "name": skill.name,
            "description": skill.summary or "",
            "archiveHash": hashlib.sha256(archive).hexdigest(),
            "risks": risks,
            "dependencies": dependencies,
        }

    def preview_uploaded_skill(
        self,
        filename: str,
        archive: bytes,
        *,
        owner: str = "local",
    ) -> dict[str, Any]:
        """检查用户上传的 ZIP 并生成持久化安装/更新提案。"""
        if not filename.lower().endswith(".zip"):
            raise ValueError("Skill 导入文件必须是 .zip")
        if not archive or len(archive) > _MAX_ARCHIVE_BYTES:
            raise ValueError("Skill ZIP 为空或超过 10 MB")
        preview = self._inspect_skill_archive(archive)
        upload_id = secrets.token_urlsafe(12)
        archive_path = self._root / "imports" / f"{upload_id}.zip"
        archive_path.parent.mkdir(parents=True, exist_ok=True)
        archive_path.write_bytes(archive)
        existing = self._skills.get(preview["skillCode"])
        action = "update_skill_archive" if existing is not None else "install_skill_archive"
        verb = "更新" if existing is not None else "安装"
        proposal = self._add_proposal(
            action,
            {
                "archivePath": str(archive_path),
                "expectedHash": preview["archiveHash"],
                "skillCode": preview["skillCode"],
            },
            f"从上传文件 {verb} Skill「{preview['name']}」（{preview['skillCode']}）",
            owner=owner,
        )
        return {"preview": preview, "proposal": proposal}

    def _install_github_skill(self, source: str, expected_hash: str, skill_code: str):
        """二次下载并校验哈希后原子安装 Skill 包。"""
        archive, target_path = self._github_archive(source)
        if hashlib.sha256(archive).hexdigest() != expected_hash:
            raise ValueError("GitHub 内容在确认前发生变化，请重新检查后再安装")
        return self._install_skill_archive(archive, target_path, skill_code)

    def _install_skill_archive(
        self,
        archive: bytes,
        target_path: str | None,
        skill_code: str,
    ):
        """从已校验 ZIP 原子安装 Skill。"""
        skill_root = BASE_DIR / settings.agent.skill_dir
        destination = skill_root / skill_code
        if destination.exists():
            raise ValueError(f"Skill 已存在：{skill_code}")
        with tempfile.TemporaryDirectory(prefix="agent-studio-skill-install-") as temp:
            skill_dir = self._extract_skill(archive, target_path, Path(temp))
            skill = load_skill_package(skill_dir)
            if skill.code != skill_code:
                raise ValueError("Skill 标识在确认前发生变化")
            staging = skill_root / f".{skill_code}-{secrets.token_hex(4)}.tmp"
            shutil.copytree(skill_dir, staging)
            staging.replace(destination)
        return self._skills.get(skill_code)

    def _update_github_skill(
        self,
        source: str,
        expected_hash: str,
        skill_code: str,
    ) -> tuple[Any, Path]:
        """校验新版本后替换现有 SKILL.md 包，并保留目录级备份。"""
        archive, target_path = self._github_archive(source)
        if hashlib.sha256(archive).hexdigest() != expected_hash:
            raise ValueError("GitHub 内容在确认前发生变化，请重新检查后再更新")
        return self._update_skill_archive(archive, target_path, skill_code)

    def _update_skill_archive(
        self,
        archive: bytes,
        target_path: str | None,
        skill_code: str,
    ) -> tuple[Any, Path]:
        """从已校验 ZIP 更新 Skill，并保留原目录。"""
        skill_root = (BASE_DIR / settings.agent.skill_dir).resolve()
        destination = (skill_root / skill_code).resolve()
        if not destination.is_relative_to(skill_root) or not destination.is_dir():
            raise ValueError("只能更新已安装的 SKILL.md 包；同名 JSON 技能请先改名")
        backup = self._root / "backups" / f"{skill_code}-{secrets.token_hex(8)}"
        backup.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix="agent-studio-skill-update-") as temp:
            skill_dir = self._extract_skill(archive, target_path, Path(temp))
            skill = load_skill_package(skill_dir)
            if skill.code != skill_code:
                raise ValueError("新版本 Skill 标识与已安装版本不一致")
            staging = skill_root / f".{skill_code}-{secrets.token_hex(4)}.tmp"
            shutil.copytree(skill_dir, staging)
            shutil.move(str(destination), str(backup))
            try:
                staging.replace(destination)
            except Exception:
                shutil.move(str(backup), str(destination))
                raise
        return self._skills.get(skill_code), backup

    def _remove_skill_with_backup(self, skill: Any) -> dict[str, Any]:
        """卸载 Skill 包或 JSON 定义，并返回可回滚快照。"""
        if skill.source_type == "skill_md" and skill.skill_path:
            skill_root = (BASE_DIR / settings.agent.skill_dir).resolve()
            source = Path(skill.skill_path).parent.resolve()
            if not source.is_relative_to(skill_root) or source == skill_root:
                raise ValueError("Skill 目录不在受管技能根目录内，拒绝卸载")
            backup = self._root / "backups" / f"{skill.code}-{secrets.token_hex(8)}"
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(source), str(backup))
            return {"backupPath": str(backup)}
        definition = skill.model_dump(by_alias=True, mode="json")
        if not self._skills.delete(skill.code):
            raise ValueError(f"无法卸载 Skill：{skill.code}")
        return {"definition": definition}
