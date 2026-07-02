"""LLM 运行的自定义 Prometheus 指标 —— M6 在 HTTP 指标之外补 LLM 维度。

注册在 prometheus_client 默认注册表，随既有 /metrics 端点一起暴露，Grafana 可直接取。
指标名（Counter 由客户端自动补 _total 后缀）：
  - agent_runs_total{employee,success}     —— 运行次数
  - agent_prompt_tokens_total{employee}    —— prompt token 累计
  - agent_completion_tokens_total{employee}—— completion token 累计
  - agent_cost_usd_total{employee}         —— LLM 成本累计（USD，需配 modelPrices 才 > 0）
"""
from __future__ import annotations

import logging

from prometheus_client import Counter

logger = logging.getLogger(__name__)

_RUNS = Counter("agent_runs", "Agent 运行次数", ["employee", "success"])
_PROMPT_TOKENS = Counter("agent_prompt_tokens", "prompt token 累计", ["employee"])
_COMPLETION_TOKENS = Counter("agent_completion_tokens", "completion token 累计", ["employee"])
_COST_USD = Counter("agent_cost_usd", "LLM 成本累计（USD）", ["employee"])


def record_run_metrics(
    employee_key: str,
    success: bool,
    prompt_tokens: int,
    completion_tokens: int,
    cost_usd: float | None,
) -> None:
    """一次 run 结束后累加指标；失败绝不影响主流程。"""
    try:
        emp = employee_key or "unknown"
        _RUNS.labels(employee=emp, success=str(bool(success)).lower()).inc()
        if prompt_tokens:
            _PROMPT_TOKENS.labels(employee=emp).inc(prompt_tokens)
        if completion_tokens:
            _COMPLETION_TOKENS.labels(employee=emp).inc(completion_tokens)
        if cost_usd:
            _COST_USD.labels(employee=emp).inc(cost_usd)
    except Exception:
        logger.debug("指标记录失败（不影响主流程）", exc_info=True)
