from __future__ import annotations

import json
import logging

from app.tools.base import ToolContext, register_handler
from app.tools.strategy.client import admin_client

logger = logging.getLogger(__name__)


def _extract_snapshot_id(ctx: ToolContext) -> str | None:
    args = ctx.parse_args()
    sid = args.get("snapshot_id", "").strip()
    if sid:
        return sid

    extra = ctx.parse_extra_context()
    sid = extra.get("snapshot_id", "")
    if isinstance(sid, str):
        sid = sid.strip()
    return sid or None


async def _safe_call(coro, error_label: str) -> dict | str:
    try:
        return await coro
    except Exception as exc:
        logger.exception("%s failed", error_label)
        return {"error": f"{error_label} failed: {exc}"}


class GetParseResultHandler:
    tool_code = "get_parse_result"

    async def handle(self, ctx: ToolContext) -> str:
        snapshot_id = _extract_snapshot_id(ctx)
        if not snapshot_id:
            return json.dumps({"error": "snapshot_id is required"})

        result = await _safe_call(
            admin_client.get_parse_result(snapshot_id),
            "get_parse_result",
        )
        return json.dumps(result, ensure_ascii=False, default=str)


class PrecheckStrategyHandler:
    tool_code = "precheck_strategy"

    async def handle(self, ctx: ToolContext) -> str:
        snapshot_id = _extract_snapshot_id(ctx)
        if not snapshot_id:
            return json.dumps({"error": "snapshot_id is required"})

        parse_result = await _safe_call(
            admin_client.get_parse_result(snapshot_id),
            "get_parse_result (precheck prep)",
        )
        if isinstance(parse_result, dict) and "error" in parse_result:
            return json.dumps(parse_result, ensure_ascii=False, default=str)

        result = await _safe_call(
            admin_client.precheck(snapshot_id),
            "precheck_strategy",
        )
        return json.dumps(result, ensure_ascii=False, default=str)


class CreateStrategyHandler:
    tool_code = "create_strategy"

    async def handle(self, ctx: ToolContext) -> str:
        snapshot_id = _extract_snapshot_id(ctx)
        if not snapshot_id:
            return json.dumps({"error": "snapshot_id is required"})

        parse_result = await _safe_call(
            admin_client.get_parse_result(snapshot_id),
            "get_parse_result (create prep)",
        )
        if isinstance(parse_result, dict) and "error" in parse_result:
            return json.dumps(parse_result, ensure_ascii=False, default=str)

        configs: list = []
        if isinstance(parse_result, dict):
            data = parse_result.get("data", parse_result)
            if isinstance(data, dict):
                configs = data.get("configs", [])
            elif isinstance(data, list):
                configs = data

        if not configs:
            return json.dumps({
                "error": "No strategy configs found in the parse result.",
            })

        result = await _safe_call(
            admin_client.batch_create(snapshot_id, configs),
            "create_strategy",
        )
        return json.dumps(result, ensure_ascii=False, default=str)


class RollbackStrategyHandler:
    tool_code = "rollback_strategy"

    async def handle(self, ctx: ToolContext) -> str:
        snapshot_id = _extract_snapshot_id(ctx)
        if not snapshot_id:
            return json.dumps({"error": "snapshot_id is required"})

        result = await _safe_call(
            admin_client.rollback(snapshot_id),
            "rollback_strategy",
        )
        return json.dumps(result, ensure_ascii=False, default=str)


register_handler(GetParseResultHandler())
register_handler(PrecheckStrategyHandler())
register_handler(CreateStrategyHandler())
register_handler(RollbackStrategyHandler())
