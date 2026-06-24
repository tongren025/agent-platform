from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.config import settings
from app.models.conversation import PendingApprovalDetail
from app.tools.base import ToolContext, register_handler

logger = logging.getLogger(__name__)

_PENDING_SIGNAL = "##PENDING_APPROVAL##"
_VALID_STATUSES = {"pending", "in_progress", "completed"}
_BLOCKED_KEYWORDS = frozenset([
    "rm", "del", "rmdir", "rd", "sudo", "su",
    "format", "mkfs", "fdisk",
    "shutdown", "reboot", "halt",
    ">", ">>", "|", "&&", "||", ";", "`",
    "$(", "${",
])


def _now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class DeepAgentState:
    todos: list[dict] = field(default_factory=list)
    files: dict[str, str] = field(default_factory=dict)
    pending_approval: PendingApprovalDetail | None = None


def _ensure_deep_state(ctx: ToolContext) -> DeepAgentState:
    if ctx.deep_state is None:
        ctx.deep_state = DeepAgentState()
    return ctx.deep_state


def _normalise_status(raw: str) -> str:
    low = raw.lower().strip().replace(" ", "_")
    return low if low in _VALID_STATUSES else "pending"


class WriteTodosHandler:
    tool_code = "write_todos"

    async def handle(self, ctx: ToolContext) -> str:
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
    tool_code = "ls"

    async def handle(self, ctx: ToolContext) -> str:
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
    tool_code = "read_file"

    async def handle(self, ctx: ToolContext) -> str:
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
    tool_code = "write_file"

    async def handle(self, ctx: ToolContext) -> str:
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
    tool_code = "edit_file"

    async def handle(self, ctx: ToolContext) -> str:
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
    tool_code = "require_approval"

    async def handle(self, ctx: ToolContext) -> str:
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
    tool_code = "execute"

    async def handle(self, ctx: ToolContext) -> str:
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
    tool_code = "task"

    async def handle(self, ctx: ToolContext) -> str:
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
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    tools=openai_tools if openai_tools else None,
                    temperature=0.3,
                    max_tokens=2048,
                )
            except Exception as exc:
                logger.exception("Sub-agent LLM call failed at iteration %d", iteration)
                return json.dumps({
                    "error": f"Sub-agent LLM call failed: {exc}",
                })

            choice = response.choices[0]
            assistant_msg = choice.message

            if not assistant_msg.tool_calls:
                final_text = assistant_msg.content or ""
                break

            messages.append(assistant_msg.model_dump())

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
