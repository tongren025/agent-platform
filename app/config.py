"""业务配置装载（appsettings.json 体系）。

从仓库根目录的 appsettings.json + appsettings.Development.json 深合并读出
Agent / Workflow / AI 模型 / 价目 / 配额等业务配置（沿用 C# 版的 PascalCase 键名）。
与 app/core/settings.py（.env 驱动的基础设施配置）互补：本文件管业务参数，
core 管数据库 / 开关 / 密钥。模块加载时即构造全局单例 `settings`。
"""
from __future__ import annotations
import json
import os
from pathlib import Path
from dataclasses import dataclass, field

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


@dataclass
class AiModelConfig:
    """一个 AI 供应商接入点（endpoint + key + 模型列表 + 调用协议策略）。"""
    name: str
    endpoint: str
    api_key: str
    enabled: bool
    models: list[dict]
    # responses：默认统一使用 Responses；auto：优先 Responses，仅协议不兼容时降级；
    # chat：显式固定使用旧 Chat Completions 接口。
    api_mode: str = "responses"


@dataclass
class AgentConfig:
    """Agent 子系统配置：各类 JSON 数据目录、运行超时、shell/委派/知识库开关与限额。"""
    data_dir: str = "data/employees"
    session_dir: str = "data/sessions"
    skill_dir: str = "data/skills"
    tool_dir: str = "data/tools"
    mcp_server_dir: str = "data/mcp-servers"
    team_dir: str = "data/teams"
    role_template_dir: str = "data/role-templates"
    knowledge_dir: str = "data/knowledge"
    run_record_dir: str = "data/agent-runs"
    admin_api_base_url: str = "http://localhost:5040"
    run_timeout_seconds: int = 180
    # 系统管家专用模型引用（provider:model）；留空时才回退到第一个可用模型。
    system_manager_model: str = ""
    shell_execute_enabled: bool = False
    shell_allowed_commands: list[str] = field(default_factory=lambda: [
        "echo", "date", "ls", "dir", "cat", "type", "find",
        "grep", "wc", "head", "tail", "sort", "pwd", "dotnet", "node",
    ])
    shell_timeout_seconds: int = 30
    shell_max_output_chars: int = 10000
    delegation_enabled: bool = True
    delegation_max_depth: int = 3
    delegation_timeout_seconds: int = 60
    knowledge_enabled: bool = True
    knowledge_max_file_size_mb: int = 10
    knowledge_max_total_size_per_employee_mb: int = 100
    knowledge_supported_extensions: list[str] = field(default_factory=lambda: [".txt", ".md"])


@dataclass
class WorkflowConfig:
    """工作流编排引擎配置：定义/运行记录目录与全局、节点两级超时及步数上限。"""
    workflow_dir: str = "data/workflows"
    run_dir: str = "data/workflow-runs"
    # 整条工作流的全局超时（秒）——多节点运行比单 agent 长，故与 agent.run_timeout 分开
    run_timeout_seconds: int = 600
    # 单个节点执行超时（秒）
    node_timeout_seconds: int = 180
    # 执行节点数上限（防环 / 防失控的兜底）
    max_steps: int = 50


@dataclass
class Settings:
    """业务配置聚合根——load_settings() 的产物，全局单例 `settings` 即此类型。"""
    port: int = 5311
    agent: AgentConfig = field(default_factory=AgentConfig)
    workflow: WorkflowConfig = field(default_factory=WorkflowConfig)
    ai_models: list[AiModelConfig] = field(default_factory=list)
    # 模型价目：model_id -> {"promptPer1k": x, "completionPer1k": y}（USD）。
    # 默认空——价格会漂，不硬编码；用户按需在 appsettings.json 的 "modelPrices" 段填。
    model_prices: dict = field(default_factory=dict)
    # 员工 token 配额：default_monthly_tokens(0=不限)、overrides 按员工覆盖。
    quotas: dict = field(default_factory=dict)


def _load_json(path: Path) -> dict:
    """读取 JSON 配置文件；文件不存在时返回空 dict（Development 覆盖文件可缺省）。"""
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def resolve_secret(value: str) -> str:
    """解析配置里的密钥占位符：${ENV_NAME} 从环境变量读取，其他值原样返回。"""
    if value.startswith("${") and value.endswith("}"):
        return os.getenv(value[2:-1], "")
    return value


def load_settings() -> Settings:
    """装载并解析业务配置：base 与 Development 深合并后映射为强类型 Settings。"""
    base = _load_json(BASE_DIR / "appsettings.json")
    env = _load_json(BASE_DIR / "appsettings.Development.json")

    def _merge(a: dict, b: dict) -> dict:
        """递归深合并两个 dict，b 的键覆盖 a（嵌套 dict 逐层合并而非整体替换）。"""
        out = {**a}
        for k, v in b.items():
            if k in out and isinstance(out[k], dict) and isinstance(v, dict):
                out[k] = _merge(out[k], v)
            else:
                out[k] = v
        return out

    cfg = _merge(base, env)

    agent_raw = cfg.get("Agent", {})
    shell_raw = agent_raw.get("ShellExecute", {})
    deleg_raw = agent_raw.get("Delegation", {})
    know_raw = agent_raw.get("Knowledge", {})

    agent = AgentConfig(
        data_dir=agent_raw.get("DataDir", "data/employees"),
        session_dir=agent_raw.get("SessionDir", "data/sessions"),
        skill_dir=agent_raw.get("SkillDir", "data/skills"),
        tool_dir=agent_raw.get("ToolDir", "data/tools"),
        mcp_server_dir=agent_raw.get("McpServerDir", "data/mcp-servers"),
        team_dir=agent_raw.get("TeamDir", "data/teams"),
        role_template_dir=agent_raw.get("RoleTemplateDir", "data/role-templates"),
        knowledge_dir=agent_raw.get("KnowledgeDir", "data/knowledge"),
        run_record_dir=agent_raw.get("RunRecordDir", "data/agent-runs"),
        admin_api_base_url=agent_raw.get("AdminApiBaseUrl", "http://localhost:5040"),
        run_timeout_seconds=int(agent_raw.get("RunTimeoutSeconds", 180)),
        system_manager_model=str(agent_raw.get("SystemManagerModel", "") or "").strip(),
        shell_execute_enabled=shell_raw.get("Enabled", False),
        shell_allowed_commands=shell_raw.get("AllowedCommands", [
            "echo", "date", "ls", "dir", "cat", "type", "find",
            "grep", "wc", "head", "tail", "sort", "pwd", "dotnet", "node",
        ]),
        shell_timeout_seconds=int(shell_raw.get("TimeoutSeconds", 30)),
        shell_max_output_chars=int(shell_raw.get("MaxOutputChars", 10000)),
        delegation_enabled=deleg_raw.get("Enabled", True),
        delegation_max_depth=int(deleg_raw.get("MaxDepth", 3)),
        delegation_timeout_seconds=int(deleg_raw.get("TimeoutSeconds", 60)),
        knowledge_enabled=know_raw.get("Enabled", True),
        knowledge_max_file_size_mb=int(know_raw.get("MaxFileSizeMB", 10)),
        knowledge_max_total_size_per_employee_mb=int(know_raw.get("MaxTotalSizePerEmployeeMB", 100)),
        knowledge_supported_extensions=know_raw.get("SupportedExtensions", [".txt", ".md"]),
    )

    wf_raw = cfg.get("Workflow", {})
    workflow = WorkflowConfig(
        workflow_dir=wf_raw.get("WorkflowDir", "data/workflows"),
        run_dir=wf_raw.get("RunDir", "data/workflow-runs"),
        run_timeout_seconds=int(wf_raw.get("RunTimeoutSeconds", 600)),
        node_timeout_seconds=int(wf_raw.get("NodeTimeoutSeconds", 180)),
        max_steps=int(wf_raw.get("MaxSteps", 50)),
    )

    ai_models = []
    for m in cfg.get("aiModels", []):
        ai_models.append(AiModelConfig(
            name=m["name"],
            endpoint=m["endpoint"],
            api_key=resolve_secret(m["apiKey"]),
            enabled=str(m.get("enabled", "true")).lower() == "true",
            models=m.get("models", []),
            api_mode=str(m.get("apiMode", "responses") or "responses").lower(),
        ))

    return Settings(
        port=int(cfg.get("Port", 5311)),
        agent=agent,
        workflow=workflow,
        ai_models=ai_models,
        model_prices=cfg.get("modelPrices", {}),
        quotas=cfg.get("quotas", {}),
    )


settings = load_settings()
