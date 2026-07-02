"""pytest 公共夹具。

分两层：
1. TestClient —— 用户端 / 管理端整机契约测试用。
2. 土台隔离 —— 让单元测试指向 tmp，杜绝污染真实 data/；LLM 桩杜绝真实网络调用。

关键约束（读代码得出）：
- FileJsonRegistry 在 __init__ 里把 `BASE_DIR / data_dir` 绑成绝对路径，且
  app.dependencies 在 import 时就实例化了所有单例，事后改 BASE_DIR 无效。
  但 `Path(BASE_DIR) / <绝对路径>` 会被绝对路径「替换」（Windows/POSIX 同理），
  因此单元层直接用绝对 tmp 路径新建 store 即可隔离，无需 monkeypatch 全局。
- AiProviderStore 的目录是模块级常量 `_PROVIDER_DIR`，需在实例化前改指 tmp。
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


# ── 整机 TestClient ────────────────────────────────────────────────

@pytest.fixture(scope="session")
def app_client() -> TestClient:
    from app.main import app
    return TestClient(app)


@pytest.fixture(scope="session")
def admin_client() -> TestClient:
    from admin.main import app
    return TestClient(app)


# ── 土台：文件存储隔离 ─────────────────────────────────────────────

@pytest.fixture
def make_registry(tmp_path):
    """工厂：make_registry(ModelCls, "subdir") → 指向 tmp 的隔离 FileJsonRegistry。"""
    from app.services.registry import FileJsonRegistry

    def _make(model_cls, subdir: str = "reg"):
        return FileJsonRegistry(model_cls, str(tmp_path / subdir))

    return _make


@pytest.fixture
def provider_store(tmp_path, monkeypatch):
    """AiProviderStore 用模块级 _PROVIDER_DIR；改指 tmp 后再实例化，避免碰真实 data/。"""
    import app.services.ai as ai_mod

    monkeypatch.setattr(ai_mod, "_PROVIDER_DIR", tmp_path / "ai-providers")
    return ai_mod.AiProviderStore()


# ── 土台：LLM 桩 ───────────────────────────────────────────────────
# 真实调用路径统一是 `client.chat.completions.create(...)`，同步与异步两种客户端都用。
# 这里给出与 openai SDK 同构的假客户端，通过替换单例 ai_service 的取客户端方法注入。

class _FakeMessage:
    def __init__(self, content: str) -> None:
        self.content = content
        self.tool_calls = None
        self.role = "assistant"


class _FakeChoice:
    def __init__(self, content: str) -> None:
        self.message = _FakeMessage(content)
        self.finish_reason = "stop"


class _FakeCompletion:
    def __init__(self, content: str) -> None:
        self.choices = [_FakeChoice(content)]
        self.usage = None


class _FakeCompletions:
    def __init__(self, content: str, is_async: bool) -> None:
        self._content = content
        self._is_async = is_async

    def create(self, **kwargs):
        if self._is_async:
            async def _coro():
                return _FakeCompletion(self._content)
            return _coro()
        return _FakeCompletion(self._content)


class _FakeChat:
    def __init__(self, content: str, is_async: bool) -> None:
        self.completions = _FakeCompletions(content, is_async)


class _FakeClient:
    def __init__(self, content: str = "stubbed", is_async: bool = False) -> None:
        self.chat = _FakeChat(content, is_async)


@pytest.fixture
def stub_llm(monkeypatch):
    """把 ai_service 的取客户端方法换成决定性假实现。

    返回一个可变 dict：测试里 `stub_llm["content"] = "..."` 即可改桩回复。
    这是「特定功能 1 本 E2E」层的接缝——本回归网未直接用，但作为土台预置。
    """
    from app.dependencies import ai_service

    state = {"content": "stubbed-response"}

    def _get_client(model_id, *, async_client: bool = False):
        return _FakeClient(state["content"], is_async=async_client), "stub-model"

    def _get_default_client():
        return _FakeClient(state["content"], is_async=False), "stub-model"

    monkeypatch.setattr(ai_service, "get_client", _get_client)
    monkeypatch.setattr(ai_service, "get_default_client", _get_default_client)
    return state
