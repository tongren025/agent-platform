"""agent loop 的可靠性回归网 —— 覆盖 LLM 调用的重试 / 降级 / 快速失败。

这是补 L3"敢放手"地基的第一块：以前 loop.py 里 LLM 调用一抛异常整个 run 就挂，
现在瞬时错误会指数退避重试、重试用尽后降级到 fallback 模型，鉴权类错误则立即上抛。
"""
from __future__ import annotations

from types import SimpleNamespace

import httpx
import openai
import pytest

from app.runtime.loop import AgentLoopOptions, _create_with_retry

_OK = object()  # 成功返回的哨兵；_create_with_retry 只透传不检查内容


def _timeout_error() -> openai.APITimeoutError:
    req = httpx.Request("POST", "https://api.openai.com/v1/chat/completions")
    return openai.APITimeoutError(request=req)


def _auth_error() -> openai.AuthenticationError:
    req = httpx.Request("POST", "https://api.openai.com/v1/chat/completions")
    resp = httpx.Response(401, request=req)
    return openai.AuthenticationError("unauthorized", response=resp, body=None)


class _FakeCreate:
    """按脚本逐次 raise / return，并记录每次调用用的 model。"""

    def __init__(self, behaviors: list):
        self._behaviors = list(behaviors)
        self.models: list[str] = []

    async def __call__(self, **kwargs):
        self.models.append(kwargs.get("model"))
        behavior = self._behaviors.pop(0)
        if isinstance(behavior, BaseException):
            raise behavior
        return behavior

    @property
    def call_count(self) -> int:
        return len(self.models)


def _fake_client(behaviors: list) -> tuple[object, _FakeCreate]:
    create = _FakeCreate(behaviors)
    client = SimpleNamespace(
        chat=SimpleNamespace(completions=SimpleNamespace(create=create))
    )
    return client, create


class _SyncFakeCreate:
    """同步版本——用于跨 provider 降级测试（备用 client 走线程池同步路径）。"""

    def __init__(self, behaviors: list):
        self._behaviors = list(behaviors)
        self.models: list[str] = []

    def __call__(self, **kwargs):
        self.models.append(kwargs.get("model"))
        behavior = self._behaviors.pop(0)
        if isinstance(behavior, BaseException):
            raise behavior
        return behavior


def _sync_client(behaviors: list) -> tuple[object, _SyncFakeCreate]:
    create = _SyncFakeCreate(behaviors)
    client = SimpleNamespace(
        chat=SimpleNamespace(completions=SimpleNamespace(create=create))
    )
    return client, create


def _opts(**kw) -> AgentLoopOptions:
    # 退避基准设 0，测试不真正 sleep
    base = dict(model="primary", max_retries=2, retry_base_delay=0.0)
    base.update(kw)
    return AgentLoopOptions(**base)


async def test_retries_transient_then_succeeds():
    client, create = _fake_client([_timeout_error(), _OK])
    result = await _create_with_retry(client, {}, True, _opts(), iteration=1)
    assert result is _OK
    assert create.call_count == 2  # 1 次失败 + 1 次成功


async def test_fatal_error_is_not_retried():
    client, create = _fake_client([_auth_error(), _OK])
    with pytest.raises(openai.AuthenticationError):
        await _create_with_retry(client, {}, True, _opts(), iteration=1)
    assert create.call_count == 1  # 鉴权错立即上抛，不消耗重试


async def test_exhausts_retries_then_raises():
    client, create = _fake_client([_timeout_error(), _timeout_error(), _timeout_error()])
    with pytest.raises(openai.APITimeoutError):
        await _create_with_retry(client, {}, True, _opts(max_retries=2), iteration=1)
    assert create.call_count == 3  # 首次 + 2 次重试


async def test_falls_back_to_secondary_model():
    client, create = _fake_client([_timeout_error(), _timeout_error(), _OK])
    opts = _opts(max_retries=1, fallback_models=["backup"])
    result = await _create_with_retry(client, {}, True, opts, iteration=1)
    assert result is _OK
    assert create.models == ["primary", "primary", "backup"]  # 主模型试满后降级


async def test_falls_back_to_cross_provider_client():
    # 主模型（primary provider）连续超时，降级到另一个 provider 的独立 client
    primary, p_create = _sync_client([_timeout_error(), _timeout_error()])
    backup, b_create = _sync_client([_OK])
    opts = _opts(max_retries=1, fallback_clients=[(backup, "backup-model")])
    result = await _create_with_retry(primary, {}, False, opts, iteration=1)
    assert result is _OK
    assert p_create.models == ["primary", "primary"]      # 主 client 试满
    assert b_create.models == ["backup-model"]            # 降级到备用 client
