"""充值策略工具 handler：get_parse_result / precheck_strategy / create_strategy / rollback_strategy 四个工具，包装 admin_client 并注册到全局工具 registry。"""
from __future__ import annotations

import json
import logging

from app.tools.base import ToolContext, register_handler
from app.tools.strategy.client import admin_client

logger = logging.getLogger(__name__)


def _extract_snapshot_id(ctx: ToolContext) -> str | None:
    """取 snapshot_id：工具参数优先，其次从 extra_context 里找（会话上下文携带）。"""
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
    """调用 admin API 的统一护栏：异常吞掉并转成 {error} dict，不让工具调用崩掉主循环。"""
    try:
        return await coro
    except Exception as exc:
        logger.exception("%s failed", error_label)
        return {"error": f"{error_label} failed: {exc}"}


class GetParseResultHandler:
    """get_parse_result 工具：查询策略文件的解析结果。"""
    tool_code = "get_parse_result"

    async def handle(self, ctx: ToolContext) -> str:
        """校验 snapshot_id 后查询解析结果。"""
        snapshot_id = _extract_snapshot_id(ctx)
        if not snapshot_id:
            return json.dumps({"error": "snapshot_id is required"})

        result = await _safe_call(
            admin_client.get_parse_result(snapshot_id),
            "get_parse_result",
        )
        return json.dumps(result, ensure_ascii=False, default=str)


class PrecheckStrategyHandler:
    """precheck_strategy 工具：先确认解析结果存在，再执行创建前预检。"""
    tool_code = "precheck_strategy"

    async def handle(self, ctx: ToolContext) -> str:
        """先查解析结果（失败即返回错误），再调预检接口。"""
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
    """create_strategy 工具：从解析结果提取 configs 并批量创建策略。"""
    tool_code = "create_strategy"

    async def handle(self, ctx: ToolContext) -> str:
        """查解析结果 → 提取 configs（为空报错）→ 批量创建。"""
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
    """rollback_strategy 工具：回滚某快照创建的全部策略。"""
    tool_code = "rollback_strategy"

    async def handle(self, ctx: ToolContext) -> str:
        """校验 snapshot_id 后调用回滚接口。"""
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
