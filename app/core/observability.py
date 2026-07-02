"""可观测性 —— 挂载 Prometheus /metrics 端点。

M0 先把标准的请求量 / 延迟 / 状态码指标暴露出来;
M6 再在此基础上加自定义指标(LLM 调用、token 成本、队列积压)。
"""
from __future__ import annotations

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator


def setup_metrics(app: FastAPI) -> None:
    Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=True,
        excluded_handlers=["/metrics", "/healthcheck"],
    ).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
