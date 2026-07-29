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
