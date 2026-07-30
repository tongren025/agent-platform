"""DeepAgent 工具集：任务清单、虚拟文件、审批、受限 shell 与子代理。

运行中的工具共享 ``DeepAgentState``；其中 todos/files 可序列化为会话 checkpoint，
在同一会话的后续运行中恢复。待审批状态仍由会话原有审批字段单独管理。
"""
from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.config import settings
from app.models.conversation import PendingApprovalDetail
from app.services.chat_response import normalize_chat_completion
from app.services.model_transport import create_model_completion_sync
from app.tools.base import ToolContext, register_handler

logger = logging.getLogger(__name__)

_PENDING_SIGNAL = "##PENDING_APPROVAL##"
_VALID_STATUSES = {"pending", "in_progress", "completed"}
_CHECKPOINT_VERSION = 1
_MAX_CHECKPOINT_TODOS = 100
_BLOCKED_KEYWORDS = frozenset([
    "rm", "del", "rmdir", "rd", "sudo", "su",
    "format", "mkfs", "fdisk",
    "shutdown", "reboot", "halt",
    ">", ">>", "|", "&&", "||", ";", "`",
    "$(", "${",
])


def _now() -> datetime:
    """UTC 当前时间工厂。"""
    return datetime.now(timezone.utc)


@dataclass
class DeepAgentState:
    """DeepAgent 共享状态；todos/files 可跨同一会话恢复，审批状态不混入 checkpoint。"""
    todos: list[dict] = field(default_factory=list)
    files: dict[str, str] = field(default_factory=dict)
    pending_approval: PendingApprovalDetail | None = None

    @classmethod
    def from_checkpoint(cls, raw: object) -> DeepAgentState:
        """从不可信会话 metadata 恢复状态；格式或版本不支持时安全回到空状态。"""
        if not isinstance(raw, dict) or raw.get("version") != _CHECKPOINT_VERSION:
            return cls()

        todos: list[dict] = []
        raw_todos = raw.get("todos")
        if isinstance(raw_todos, list):
            for item in raw_todos[:_MAX_CHECKPOINT_TODOS]:
                if not isinstance(item, dict):
                    continue
                todos.append({
                    "content": str(item.get("content", "")),
                    "status": _normalise_status(str(item.get("status", "pending"))),
                })

        files: dict[str, str] = {}
        raw_files = raw.get("files")
        if isinstance(raw_files, dict):
            for path, content in raw_files.items():
                if isinstance(path, str) and isinstance(content, str):
                    files[path] = content

        return cls(todos=todos, files=files)

    def to_checkpoint(self) -> dict:
        """提取可恢复的公开工具状态；不保存隐藏推理或待审批对象。"""
        todos = [
            {
                "content": str(item.get("content", "")),
                "status": _normalise_status(str(item.get("status", "pending"))),
            }
            for item in self.todos[:_MAX_CHECKPOINT_TODOS]
            if isinstance(item, dict)
        ]
        files = {
            path: content
            for path, content in sorted(self.files.items())
            if isinstance(path, str) and isinstance(content, str)
        }
        return {
            "version": _CHECKPOINT_VERSION,
            "todos": todos,
            "files": files,
        }


def _ensure_deep_state(ctx: ToolContext) -> DeepAgentState:
    """惰性初始化 ctx 上的 DeepAgentState（首个深度工具调用时创建）。"""
    if ctx.deep_state is None:
        ctx.deep_state = DeepAgentState()
    return ctx.deep_state


def _normalise_status(raw: str) -> str:
    """把任务状态字符串规整到 pending/in_progress/completed，非法值落回 pending。"""
    low = raw.lower().strip().replace(" ", "_")
    return low if low in _VALID_STATUSES else "pending"


class WriteTodosHandler:
    """write_todos 工具：整表覆盖任务清单，agent 用它规划与更新执行步骤。"""
    tool_code = "write_todos"

    async def handle(self, ctx: ToolContext) -> str:
        """整表覆盖 todos：校验列表结构、规整状态后写入共享状态。"""
        state = _ensure_deep_state(ctx)
        args = ctx.parse_args()
        raw_todos = args.get("todos", [])

        if not isinstance(raw_todos, list):
            return json.dumps({"error": "todos must be a list"})

        normalised: list[dict] = []
        for item in raw_todos:
            if isinstance(item, dict):
                normalised.append({
                    "content": str(item.get("content", "")),
                    "status": _normalise_status(str(item.get("status", "pending"))),
                })
            elif isinstance(item, str):
                normalised.append({"content": item, "status": "pending"})

        state.todos = normalised
        return json.dumps({
            "ok": True,
            "count": len(normalised),
            "todos": normalised,
        }, ensure_ascii=False)


class LsHandler:
    """ls 工具：列出虚拟文件系统中的全部文件（路径 + 大小）。"""
    tool_code = "ls"

    async def handle(self, ctx: ToolContext) -> str:
        """列出虚拟文件（按路径排序）。"""
        state = _ensure_deep_state(ctx)
        listing = [
            {"path": path, "size": len(content)}
            for path, content in sorted(state.files.items())
        ]
        return json.dumps({
            "files": listing,
            "count": len(listing),
        }, ensure_ascii=False)


class ReadFileHandler:
    """read_file 工具：读虚拟文件内容，支持 offset/limit 分页读取行。"""
    tool_code = "read_file"

    async def handle(self, ctx: ToolContext) -> str:
        """读文件：校验路径存在，按 offset/limit 截取行返回。"""
        state = _ensure_deep_state(ctx)
        args = ctx.parse_args()
        path = args.get("path", "").strip()
        if not path:
            return json.dumps({"error": "path is required"})

        content = state.files.get(path)
        if content is None:
            return json.dumps({"error": f"File not found: {path}"})

        offset = max(int(args.get("offset", 0)), 0)
        limit = args.get("limit")

        lines = content.splitlines(keepends=True)
        total_lines = len(lines)

        if limit is not None:
            limit = max(int(limit), 1)
            selected = lines[offset: offset + limit]
        else:
            selected = lines[offset:]

        return json.dumps({
            "path": path,
            "total_lines": total_lines,
            "offset": offset,
            "returned_lines": len(selected),
            "content": "".join(selected),
        }, ensure_ascii=False)


class WriteFileHandler:
    """write_file 工具：创建或整体覆盖一个虚拟文件。"""
    tool_code = "write_file"

    async def handle(self, ctx: ToolContext) -> str:
        """写文件：整体覆盖内容，返回 created/overwritten 与大小。"""
        state = _ensure_deep_state(ctx)
        args = ctx.parse_args()
        path = args.get("path", "").strip()
        content = args.get("content", "")

        if not path:
            return json.dumps({"error": "path is required"})

        is_new = path not in state.files
        state.files[path] = content

        return json.dumps({
            "ok": True,
            "path": path,
            "action": "created" if is_new else "overwritten",
            "size": len(content),
        }, ensure_ascii=False)


class EditFileHandler:
    """edit_file 工具：按唯一 old_string 精确替换虚拟文件内容（不唯一时要求补充上下文）。"""
    tool_code = "edit_file"

    async def handle(self, ctx: ToolContext) -> str:
        """编辑文件：old_string 必须存在且唯一，只替换第一处。"""
        state = _ensure_deep_state(ctx)
        args = ctx.parse_args()
        path = args.get("path", "").strip()
        old_string = args.get("old_string", "")
        new_string = args.get("new_string", "")

        if not path:
            return json.dumps({"error": "path is required"})

        content = state.files.get(path)
        if content is None:
            return json.dumps({"error": f"File not found: {path}"})

        if not old_string:
            return json.dumps({"error": "old_string is required"})

        occurrences = content.count(old_string)
        if occurrences == 0:
            return json.dumps({"error": "old_string not found in file"})
        if occurrences > 1:
            return json.dumps({
                "error": f"old_string is not unique — found {occurrences} "
                         f"occurrences. Provide more context to disambiguate.",
            })

        state.files[path] = content.replace(old_string, new_string, 1)

        return json.dumps({
            "ok": True,
            "path": path,
            "size": len(state.files[path]),
        }, ensure_ascii=False)


class RequireApprovalHandler:
    """require_approval 工具：agent 在危险动作前挂起等人批。首次调用记录待审批并返回哨兵信号中断循环；带 __approval_decision 恢复时返回批准结果。"""
    tool_code = "require_approval"

    async def handle(self, ctx: ToolContext) -> str:
        """两种路径：extra_context 带审批决定则返回结果；否则登记待审批并返回 PENDING 哨兵。"""
        extra = ctx.parse_extra_context()

        decision = extra.get("__approval_decision")
        if decision is not None:
            return json.dumps({
                "approved": str(decision).lower() in ("approved", "yes", "true"),
                "decision": str(decision),
            }, ensure_ascii=False)

        args = ctx.parse_args()
        description = args.get("description", "Approval required")
        action_type = args.get("action_type", "general")

        state = _ensure_deep_state(ctx)
        state.pending_approval = PendingApprovalDetail(
            description=description,
            action_type=action_type,
            requested_at=_now(),
        )

        return (
            f"{_PENDING_SIGNAL} "
            f"Approval requested: [{action_type}] {description}"
        )


class ShellExecuteHandler:
    """execute 工具：受限 shell 执行——总开关 + 命令白名单 + 危险关键词黑名单 + 超时 + 输出截断，四层防护。"""
    tool_code = "execute"

    async def handle(self, ctx: ToolContext) -> str:
        """执行命令：逐层校验（开关/白名单/黑名单）后子进程执行，超时与输出长度受配置约束。"""
        if not settings.agent.shell_execute_enabled:
            return json.dumps({"error": "Shell execution is disabled."})

        args = ctx.parse_args()
        command = args.get("command", "").strip()
        if not command:
            return json.dumps({"error": "command is required"})

        first_token = command.split()[0].lower()
        allowed = [c.lower() for c in settings.agent.shell_allowed_commands]
        if first_token not in allowed:
            return json.dumps({
                "error": f"Command {first_token!r} is not in the allow-list. "
                         f"Allowed: {', '.join(settings.agent.shell_allowed_commands)}",
            })

        command_lower = command.lower()
        for kw in _BLOCKED_KEYWORDS:
            if kw in command_lower:
                return json.dumps({
                    "error": f"Command contains blocked keyword: {kw!r}",
                })

        timeout = settings.agent.shell_timeout_seconds
        max_chars = settings.agent.shell_max_output_chars

        try:
            proc = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                cwd=None,
            )
            stdout_bytes, _ = await asyncio.wait_for(
                proc.communicate(), timeout=timeout
            )
            output = stdout_bytes.decode("utf-8", errors="replace")
        except asyncio.TimeoutError:
            return json.dumps({
                "error": f"Command timed out after {timeout}s.",
            })
        except Exception as exc:
            return json.dumps({
                "error": f"Shell execution failed: {exc}",
            })

        truncated = len(output) > max_chars
        if truncated:
            output = output[:max_chars]

        return json.dumps({
            "exit_code": proc.returncode,
            "output": output,
            "truncated": truncated,
        }, ensure_ascii=False)


_SUBTASK_ALLOWED_TOOLS = frozenset([
    "write_todos", "ls", "read_file", "write_file", "edit_file",
])


class TaskHandler:
    """task 工具：把子任务委托给一个轻量子代理（独立 LLM 循环，只开放虚拟文件系统工具，最多 8 轮），与主 agent 共享 DeepAgentState。"""
    tool_code = "task"

    async def handle(self, ctx: ToolContext) -> str:
        """运行子代理循环：受限工具集 + 迭代上限，返回子代理的最终文本结论。"""
        args = ctx.parse_args()
        subagent_type = args.get("subagent_type", "worker")
        instruction = args.get("instruction", "").strip()

        if not instruction:
            return json.dumps({"error": "instruction is required"})

        state = _ensure_deep_state(ctx)

        from app.dependencies import ai_service
        from app.tools.base import get_handler

        sub_tools: list[dict] = []
        for code in _SUBTASK_ALLOWED_TOOLS:
            handler = get_handler(code)
            if handler is not None:
                sub_tools.append({"tool_code": code})

        extra = ctx.parse_extra_context()
        model_id = extra.get("__model_id", "gpt-4o")
        try:
            client, model_name = ai_service.get_client(model_id)
        except ValueError:
            providers = ai_service.list_providers()
            if not providers or not providers[0].models:
                return json.dumps({"error": "No AI provider available for sub-task."})
            first_model = providers[0].models[0]
            client, model_name = ai_service.get_client(
                first_model.get("modelId", first_model.get("modelName", ""))
            )

        max_iterations = 8
        messages: list[dict] = [
            {
                "role": "system",
                "content": (
                    f"You are a {subagent_type} sub-agent. "
                    "Complete the given task using the available virtual filesystem tools. "
                    "When done, reply with your final answer as plain text."
                ),
            },
            {"role": "user", "content": instruction},
        ]

        openai_tools = []
        for code in _SUBTASK_ALLOWED_TOOLS:
            openai_tools.append({
                "type": "function",
                "function": {
                    "name": code,
                    "description": f"Virtual filesystem tool: {code}",
                    "parameters": {"type": "object", "properties": {}},
                },
            })

        final_text = ""

        for iteration in range(max_iterations):
            try:
                response = create_model_completion_sync(client, {
                    "model": model_name,
                    "messages": messages,
                    "tools": openai_tools if openai_tools else None,
                    "temperature": 0.3,
                    "max_tokens": 2048,
                })
            except Exception as exc:
                logger.exception("Sub-agent LLM call failed at iteration %d", iteration)
                return json.dumps({
                    "error": f"Sub-agent LLM call failed: {exc}",
                })

            response = normalize_chat_completion(response)
            choice = response.choices[0]
            assistant_msg = choice.message

            if not assistant_msg.tool_calls:
                final_text = assistant_msg.content or ""
                break

            messages.append({
                "role": "assistant",
                "content": assistant_msg.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in assistant_msg.tool_calls
                ],
            })

            for tc in assistant_msg.tool_calls:
                fn_name = tc.function.name

                if fn_name not in _SUBTASK_ALLOWED_TOOLS:
                    tool_result = json.dumps({
                        "error": f"Tool {fn_name!r} is not available to sub-agents.",
                    })
                else:
                    handler = get_handler(fn_name)
                    if handler is None:
                        tool_result = json.dumps({"error": f"Tool {fn_name!r} not found."})
                    else:
                        sub_ctx = ToolContext(
                            tool_code=fn_name,
                            arguments_json=tc.function.arguments or "{}",
                            employee_key=ctx.employee_key,
                            deep_state=state,
                        )
                        try:
                            tool_result = await handler.handle(sub_ctx)
                        except Exception as exc:
                            tool_result = json.dumps({"error": str(exc)})

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": tool_result,
                })
        else:
            final_text = (
                "[Sub-agent reached maximum iterations without a final answer. "
                "Last tool results were returned above.]"
            )

        return json.dumps({
            "status": "ok",
            "subagent_type": subagent_type,
            "result": final_text,
        }, ensure_ascii=False)


register_handler(WriteTodosHandler())
register_handler(LsHandler())
register_handler(ReadFileHandler())
register_handler(WriteFileHandler())
register_handler(EditFileHandler())
register_handler(RequireApprovalHandler())
register_handler(ShellExecuteHandler())
register_handler(TaskHandler())
