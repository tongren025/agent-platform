from __future__ import annotations

import asyncio
import json
import logging

from app.config import settings
from app.dependencies import employee_registry, team_registry
from app.tools.base import ToolContext, register_handler

logger = logging.getLogger(__name__)


class DelegateHandler:
    tool_code = "delegate_to_employee"

    async def handle(self, ctx: ToolContext) -> str:
        # 委派总开关：关闭时直接拒绝（此前从未真正校验，P0 修复让工具真正执行后这点尤为重要）
        if not settings.agent.delegation_enabled:
            return self._error("DELEGATION_DISABLED", "Delegation is disabled.")

        args = ctx.parse_args()
        target_key = args.get("employee_key", "").strip()
        message = args.get("message", "").strip()

        if not target_key:
            return self._error("DELEGATION_MISSING_ARGS", "employee_key is required")
        if not message:
            return self._error("DELEGATION_MISSING_ARGS", "message is required")

        if target_key == ctx.employee_key:
            return self._error(
                "DELEGATION_SELF",
                "Cannot delegate to yourself.",
            )

        extra = ctx.parse_extra_context()
        stack: list[str] = list(extra.get("__delegation_stack", []))

        max_depth = settings.agent.delegation_max_depth
        if len(stack) >= max_depth:
            return self._error(
                "DELEGATION_DEPTH_EXCEEDED",
                f"Delegation depth limit ({max_depth}) reached. "
                f"Current stack: {' -> '.join(stack)}",
            )

        if target_key in stack:
            return self._error(
                "DELEGATION_CYCLE_DETECTED",
                f"Cycle detected: {target_key!r} is already in the "
                f"delegation stack [{' -> '.join(stack)}].",
            )

        caller_emp = employee_registry.get(ctx.employee_key)
        if caller_emp is None:
            return self._error("DELEGATION_FORBIDDEN", "Caller employee not found.")

        caller_team_code = caller_emp.team_code
        if not caller_team_code:
            return self._error(
                "DELEGATION_FORBIDDEN",
                "Caller does not belong to any team — delegation not allowed.",
            )

        team = team_registry.get(caller_team_code)
        if team is None:
            return self._error("DELEGATION_FORBIDDEN", "Caller's team not found.")

        if target_key not in team.member_employee_keys:
            return self._error(
                "DELEGATION_FORBIDDEN",
                f"Target {target_key!r} is not a member of team "
                f"{caller_team_code!r}.",
            )

        target_emp = employee_registry.get(target_key)
        if target_emp is None:
            return self._error("DELEGATION_FORBIDDEN", f"Target employee {target_key!r} not found.")
        if not target_emp.enabled:
            return self._error("DELEGATION_FORBIDDEN", f"Target employee {target_key!r} is disabled.")

        new_stack = stack + [ctx.employee_key]
        nested_extra = {
            "__delegation_stack": new_stack,
        }
        for k, v in extra.items():
            if k != "__delegation_stack":
                nested_extra[k] = v

        timeout = settings.agent.delegation_timeout_seconds

        try:
            from app.services.invocation import run_invocation
            from app.models.conversation import AgentRunRequest

            request = AgentRunRequest(
                employee_key=target_key,
                user_input=message,
                extra_context=json.dumps(nested_extra, ensure_ascii=False),
            )

            response = await asyncio.wait_for(
                run_invocation(request),
                timeout=timeout,
            )

            return json.dumps(
                {
                    "status": "ok",
                    "assistantMessage": response.assistant_message,
                },
                ensure_ascii=False,
            )

        except asyncio.TimeoutError:
            return self._error(
                "DELEGATION_TIMEOUT",
                f"Delegation to {target_key!r} timed out after {timeout}s.",
            )
        except Exception as exc:
            logger.exception("Delegation to %r failed", target_key)
            return self._error(
                "DELEGATION_CHILD_FAILED",
                f"Delegation to {target_key!r} failed: {exc}",
            )

    @staticmethod
    def _error(code: str, message: str) -> str:
        return json.dumps(
            {"status": "error", "errorCode": code, "message": message},
            ensure_ascii=False,
        )


register_handler(DelegateHandler())
