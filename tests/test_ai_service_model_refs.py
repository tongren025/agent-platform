"""AIService 模型引用解析回归：供应商前缀与模型自身冒号不得混淆。"""
from __future__ import annotations

from app.config import AiModelConfig
from app.services.ai import AIService, AiProviderStore


def _service(tmp_path):
    provider = AiModelConfig(
        name="openrouter",
        endpoint="https://example.invalid/v1",
        api_key="test-key",
        enabled=True,
        models=[{
            "modelName": "Hy3 Free",
            "modelId": "tencent/hy3:free",
        }],
    )
    return AIService(
        [provider],
        AiProviderStore(provider_dir=tmp_path / "providers"),
    )


def test_bare_model_id_with_colon_is_not_treated_as_provider(tmp_path):
    _, model_id = _service(tmp_path).get_client("tencent/hy3:free")

    assert model_id == "tencent/hy3:free"


def test_provider_qualified_model_with_colon_keeps_full_model_id(tmp_path):
    _, model_id = _service(tmp_path).get_client(
        "openrouter:tencent/hy3:free"
    )

    assert model_id == "tencent/hy3:free"


def test_clients_are_reused_for_same_provider_and_mode(tmp_path):
    service = _service(tmp_path)

    first_sync, _ = service.get_client("tencent/hy3:free")
    second_sync, _ = service.get_client("tencent/hy3:free")
    first_async, _ = service.get_client("tencent/hy3:free", async_client=True)
    second_async, _ = service.get_client("tencent/hy3:free", async_client=True)

    assert first_sync is second_sync
    assert first_async is second_async
    assert first_sync is not first_async


def test_provider_without_api_key_is_rejected_before_network_call(tmp_path):
    provider = AiModelConfig(
        name="missing-key",
        endpoint="https://example.invalid/v1",
        api_key="",
        enabled=True,
        models=[{"modelName": "Model", "modelId": "model-1"}],
    )
    service = AIService(
        [provider],
        AiProviderStore(provider_dir=tmp_path / "providers"),
    )

    try:
        service.get_client("model-1")
    except ValueError as exc:
        assert "missing API key" in str(exc)
    else:
        raise AssertionError("缺少 API key 的供应商不应创建客户端")


def test_default_client_skips_enabled_provider_without_credentials(tmp_path):
    missing = AiModelConfig(
        name="missing-key",
        endpoint="https://missing.invalid/v1",
        api_key="",
        enabled=True,
        models=[{"modelName": "Missing", "modelId": "missing-model"}],
    )
    ready = AiModelConfig(
        name="ready",
        endpoint="https://ready.invalid/v1",
        api_key="test-key",
        enabled=True,
        models=[{"modelName": "Ready", "modelId": "ready-model"}],
    )
    service = AIService(
        [missing, ready],
        AiProviderStore(provider_dir=tmp_path / "providers"),
    )

    _, model_id = service.get_default_client()

    assert model_id == "ready-model"
