from __future__ import annotations

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from typing import Awaitable, Callable, Optional

import openai

from app.models.conversation import AgentInvocationTrace, PendingApprovalDetail

SyncOrAsyncClient = openai.OpenAI | openai.AsyncOpenAI

logger = logging.getLogger(__name__)

_PENDING_PREFIX = "##PENDING_APPROVAL##"


@dataclass
class ToolHandler:
    name: str
    description: str
    input_schema: dict
    handler: Callable[[str], Awaitable[str]]


@dataclass
class AgentLoopOptions:
    existing_messages: Optional[list[dict]] = None
    max_iterations: int = 5
    temperature: float = 0.7
    max_tokens: int = 4096
    model: str = "gpt-4o"


@dataclass
class AgentLoopResult:
    final_text: str = ""
    success: bool = True
    iterations: int = 0
    traces: list[AgentInvocationTrace] = field(default_factory=list)
    messages: list[dict] = field(default_factory=list)
    pending_approval: Optional[PendingApprovalDetail] = None
    prompt_tokens: int = 0
    completion_tokens: int = 0


def _build_openai_tools(handlers: list[ToolHandler]) -> list[dict]:
    tools: list[dict] = []
    for h in handlers:
        tools.append({
            "type": "function",
            "function": {
                "name": h.name,
                "description": h.description,
                "parameters": h.input_schema,
            },
        })
    return tools


def _parse_pending_approval(raw: str) -> PendingApprovalDetail | None:
    try:
        body = raw[len(_PENDING_PREFIX):].strip()
        data = json.loads(body)
        return PendingApprovalDetail(
            description=data.get("description", ""),
            action_type=data.get("action_type", ""),
        )
    except Exception:
        return PendingApprovalDetail(description=raw, action_type="unknown")


async def run_agent_loop(
    client: SyncOrAsyncClient,
    options: AgentLoopOptions,
    system_prompt: str,
    user_message: str,
    tools: list[ToolHandler],
) -> AgentLoopResult:
    result = AgentLoopResult()

    messages: list[dict] = [{"role": "system", "content": system_prompt}]

    if options.existing_messages:
        messages.extend(options.existing_messages)

    messages.append({"role": "user", "content": user_message})

    openai_tools = _build_openai_tools(tools) if tools else []
    handler_map: dict[str, ToolHandler] = {h.name: h for h in tools}

    is_async = isinstance(client, openai.AsyncOpenAI)

    for iteration in range(1, options.max_iterations + 1):
        result.iterations = iteration

        try:
            create_kwargs: dict = dict(
                model=options.model,
                messages=messages,
                temperature=options.temperature,
                max_tokens=options.max_tokens,
            )
            if openai_tools:
                create_kwargs["tools"] = openai_tools

            if is_async:
                response = await client.chat.completions.create(**create_kwargs)
            else:
                response = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: client.chat.completions.create(**create_kwargs)
                )
        except Exception as exc:
            logger.error("OpenAI API call failed (iteration=%d): %s", iteration, exc)
            result.success = False
            result.final_text = f"LLM 调用失败: {exc}"
            break

        if response.usage:
            result.prompt_tokens += response.usage.prompt_tokens or 0
            result.completion_tokens += response.usage.completion_tokens or 0

        choice = response.choices[0]
        assistant_msg = choice.message

        msg_dict: dict = {"role": "assistant", "content": assistant_msg.content or ""}
        if assistant_msg.tool_calls:
            msg_dict["tool_calls"] = [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in assistant_msg.tool_calls
            ]
        messages.append(msg_dict)

        if choice.finish_reason == "stop" or not assistant_msg.tool_calls:
            result.final_text = assistant_msg.content or ""
            break

        should_break = False
        for tc in assistant_msg.tool_calls:
            fn_name = tc.function.name
            fn_args = tc.function.arguments

            handler = handler_map.get(fn_name)
            if handler is None:
                tool_result = f"错误: 未知工具 '{fn_name}'"
                logger.warning("Unknown tool called: %s", fn_name)
                trace = AgentInvocationTrace(
                    iteration=iteration,
                    tool_name=fn_name,
                    arguments=fn_args,
                    result=tool_result,
                    success=False,
                    elapsed_milliseconds=0,
                )
                result.traces.append(trace)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": tool_result,
                })
                continue

            start_ms = time.monotonic()
            try:
                tool_result = await handler.handler(fn_args)
                success = True
            except Exception as exc:
                logger.error("Tool handler error (%s): %s", fn_name, exc)
                tool_result = f"工具执行失败: {exc}"
                success = False

            elapsed = int((time.monotonic() - start_ms) * 1000)

            trace = AgentInvocationTrace(
                iteration=iteration,
                tool_name=fn_name,
                arguments=fn_args,
                result=tool_result[:2000] if tool_result else None,
                success=success,
                elapsed_milliseconds=elapsed,
            )
            result.traces.append(trace)

            if tool_result and tool_result.startswith(_PENDING_PREFIX):
                result.pending_approval = _parse_pending_approval(tool_result)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": "操作已暂停，等待人工审批。",
                })
                should_break = True
                break

            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": tool_result or "",
            })

        if should_break:
            result.final_text = assistant_msg.content or "操作已暂停，等待人工审批。"
            break
    else:
        result.final_text = (
            result.final_text
            or messages[-1].get("content", "")
            or "已达到最大迭代次数。"
        )

    result.messages = messages
    return result
