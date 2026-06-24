from __future__ import annotations
import json
from pathlib import Path
from dataclasses import dataclass, field

BASE_DIR = Path(__file__).resolve().parent.parent


@dataclass
class AiModelConfig:
    name: str
    endpoint: str
    api_key: str
    enabled: bool
    models: list[dict]


@dataclass
class AgentConfig:
    data_dir: str = "data/employees"
    session_dir: str = "data/sessions"
    skill_dir: str = "data/skills"
    tool_dir: str = "data/tools"
    mcp_server_dir: str = "data/mcp-servers"
    team_dir: str = "data/teams"
    role_template_dir: str = "data/role-templates"
    knowledge_dir: str = "data/knowledge"
    admin_api_base_url: str = "http://localhost:5040"
    run_timeout_seconds: int = 180
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
    port: int = 5311
    agent: AgentConfig = field(default_factory=AgentConfig)
    workflow: WorkflowConfig = field(default_factory=WorkflowConfig)
    ai_models: list[AiModelConfig] = field(default_factory=list)


def _load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def load_settings() -> Settings:
    base = _load_json(BASE_DIR / "appsettings.json")
    env = _load_json(BASE_DIR / "appsettings.Development.json")

    def _merge(a: dict, b: dict) -> dict:
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
        admin_api_base_url=agent_raw.get("AdminApiBaseUrl", "http://localhost:5040"),
        run_timeout_seconds=int(agent_raw.get("RunTimeoutSeconds", 180)),
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
            api_key=m["apiKey"],
            enabled=str(m.get("enabled", "true")).lower() == "true",
            models=m.get("models", []),
        ))

    return Settings(
        port=int(cfg.get("Port", 5311)),
        agent=agent,
        workflow=workflow,
        ai_models=ai_models,
    )


settings = load_settings()
