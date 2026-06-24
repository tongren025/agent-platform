"""
Platform infrastructure tool definitions injected into every agent run.

Port of C# PlatformInfraToolRegistry.
"""
from __future__ import annotations

import json

from app.models import EmployeeRuntimeSnapshot, RuntimeTool


def get_platform_infra_tools(
    snapshot: EmployeeRuntimeSnapshot,
    include_skill_detail: bool = True,
    include_deep_agent: bool = True,
) -> list[RuntimeTool]:
    """Return the platform-injected RuntimeTool list based on snapshot capabilities."""

    tools: list[RuntimeTool] = []

    # ── get_skill_detail ─────────────────────────────────────────
    has_skills = any(snapshot.skills_by_scope.values())
    if include_skill_detail and has_skills:
        tools.append(RuntimeTool(
            tool_code="get_skill_detail",
            name="获取技能详情",
            description="根据技能代码获取技能的完整描述和使用说明",
            input_schema=json.dumps({
                "type": "object",
                "properties": {
                    "skill_code": {"type": "string", "description": "技能代码"},
                },
                "required": ["skill_code"],
            }, ensure_ascii=False),
        ))

    # ── delegate_to_employee ─────────────────────────────────────
    if snapshot.team_code and snapshot.team_members:
        # Only expose delegation when there are other team members
        if len(snapshot.team_members) > 1:
            tools.append(RuntimeTool(
                tool_code="delegate_to_employee",
                name="委派给员工",
                description="将任务或消息委派给团队中的其他数字员工处理",
                input_schema=json.dumps({
                    "type": "object",
                    "properties": {
                        "employee_key": {
                            "type": "string",
                            "description": "目标员工 key",
                        },
                        "message": {
                            "type": "string",
                            "description": "发送给目标员工的消息",
                        },
                    },
                    "required": ["employee_key", "message"],
                }, ensure_ascii=False),
            ))

    # ── query_knowledge_base ─────────────────────────────────────
    if snapshot.has_knowledge_base:
        tools.append(RuntimeTool(
            tool_code="query_knowledge_base",
            name="查询知识库",
            description="从该员工的专属知识库中搜索相关文档片段",
            input_schema=json.dumps({
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "搜索查询关键词",
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "返回结果数量，默认5",
                        "default": 5,
                    },
                },
                "required": ["query"],
            }, ensure_ascii=False),
        ))

    # ── deep agent tools ─────────────────────────────────────────
    if include_deep_agent and snapshot.deep_agent:
        tools.extend(_deep_agent_tools())

    return tools


def _deep_agent_tools() -> list[RuntimeTool]:
    """Return the suite of tools available only in deep-agent mode."""
    return [
        RuntimeTool(
            tool_code="write_todos",
            name="写入待办事项",
            description="规划和记录任务步骤，跟踪执行状态",
            input_schema=json.dumps({
                "type": "object",
                "properties": {
                    "todos": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "content": {"type": "string"},
                                "status": {
                                    "type": "string",
                                    "enum": ["pending", "in_progress", "completed"],
                                },
                            },
                            "required": ["content", "status"],
                        },
                    },
                },
                "required": ["todos"],
            }, ensure_ascii=False),
        ),
        RuntimeTool(
            tool_code="ls",
            name="列出文件",
            description="列出虚拟文件系统中的文件和目录",
            input_schema=json.dumps({
                "type": "object",
                "properties": {},
            }, ensure_ascii=False),
        ),
        RuntimeTool(
            tool_code="read_file",
            name="读取文件",
            description="读取虚拟文件系统中的文件内容，支持偏移和行数限制",
            input_schema=json.dumps({
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "offset": {"type": "integer"},
                    "limit": {"type": "integer"},
                },
                "required": ["path"],
            }, ensure_ascii=False),
        ),
        RuntimeTool(
            tool_code="write_file",
            name="写入文件",
            description="在虚拟文件系统中创建或覆写文件",
            input_schema=json.dumps({
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                },
                "required": ["path", "content"],
            }, ensure_ascii=False),
        ),
        RuntimeTool(
            tool_code="edit_file",
            name="编辑文件",
            description="对虚拟文件系统中的文件执行字符串替换编辑",
            input_schema=json.dumps({
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "old_string": {"type": "string"},
                    "new_string": {"type": "string"},
                },
                "required": ["path", "old_string", "new_string"],
            }, ensure_ascii=False),
        ),
        RuntimeTool(
            tool_code="task",
            name="委托子任务",
            description="将子任务委托给指定类型的子代理执行",
            input_schema=json.dumps({
                "type": "object",
                "properties": {
                    "subagent_type": {
                        "type": "string",
                        "description": "子代理类型",
                    },
                    "instruction": {
                        "type": "string",
                        "description": "任务指令",
                    },
                },
                "required": ["subagent_type", "instruction"],
            }, ensure_ascii=False),
        ),
        RuntimeTool(
            tool_code="require_approval",
            name="请求人工审批",
            description="在执行需要人工确认的操作前暂停并请求审批",
            input_schema=json.dumps({
                "type": "object",
                "properties": {
                    "description": {"type": "string"},
                    "action_type": {"type": "string"},
                },
                "required": ["description", "action_type"],
            }, ensure_ascii=False),
        ),
        RuntimeTool(
            tool_code="execute",
            name="执行命令",
            description="在受限沙箱环境中执行 shell 命令",
            input_schema=json.dumps({
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "要执行的命令",
                    },
                },
                "required": ["command"],
            }, ensure_ascii=False),
        ),
    ]
