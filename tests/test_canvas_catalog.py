"""画布模型目录必须只使用平台已配置模型，并保留数字员工入口。"""

from types import SimpleNamespace

from app.services import canvas_catalog


def _provider(name, models, *, enabled=True, api_key="key"):
    return SimpleNamespace(
        name=name,
        endpoint=f"https://{name}.example/v1",
        api_key=api_key,
        enabled=enabled,
        models=models,
    )


def _employee(
    key,
    name,
    *,
    modalities=None,
    policy=None,
    enabled=True,
):
    return SimpleNamespace(
        employee_key=key,
        name=name,
        role_profile=f"{name}职责",
        output_modalities=modalities or ["text"],
        default_model_policy=policy or {},
        enabled=enabled,
    )


def test_catalog_lists_configured_models_by_capability(monkeypatch):
    providers = [
        _provider("aitag", [
            {"modelId": "Gemma-4-31B", "modelName": "Gemma"},
            {"modelId": "gpt-image-2", "modelName": "GPT Image 2"},
        ]),
        _provider("openrouter", [
            {"modelId": "openrouter/free", "modelName": "OpenRouter Free"},
        ]),
    ]
    employees = [
        _employee("screenwriter", "编剧"),
        _employee(
            "video-artist",
            "视频生成师",
            modalities=["text", "video"],
            policy={"video_model_id": "openrouter:bytedance/seedance-2.0"},
        ),
    ]
    monkeypatch.setattr(canvas_catalog.ai_service, "list_all_providers", lambda: providers)
    monkeypatch.setattr(canvas_catalog.employee_registry, "list_all", lambda: employees)

    text_rows = canvas_catalog.list_canvas_models("text")
    image_rows = canvas_catalog.list_canvas_models("image")
    video_rows = canvas_catalog.list_canvas_models("video")

    assert {(row["vendorKey"], row["modelKey"]) for row in text_rows} == {
        ("platform-employee", "screenwriter"),
        ("platform-employee", "video-artist"),
        ("aitag", "Gemma-4-31B"),
        ("openrouter", "openrouter/free"),
    }
    assert [(row["vendorKey"], row["modelKey"]) for row in image_rows] == [
        ("aitag", "gpt-image-2"),
    ]
    assert [(row["vendorKey"], row["modelKey"]) for row in video_rows] == [
        ("openrouter", "bytedance/seedance-2.0"),
    ]


def test_catalog_does_not_invent_unconfigured_public_models(monkeypatch):
    monkeypatch.setattr(
        canvas_catalog.ai_service,
        "list_all_providers",
        lambda: [_provider("openrouter", [{"modelId": "openrouter/free"}])],
    )
    monkeypatch.setattr(canvas_catalog.employee_registry, "list_all", lambda: [])

    assert canvas_catalog.list_canvas_models("image") == []
    assert canvas_catalog.find_canvas_model(
        "openrouter",
        "openai/gpt-image-2",
        "image",
    ) is None


def test_catalog_lists_real_media_models_from_connected_openrouter(monkeypatch):
    provider = _provider("openrouter", [{"modelId": "openrouter/free"}])
    provider.endpoint = "https://openrouter.ai/api/v1"
    monkeypatch.setattr(canvas_catalog.ai_service, "list_all_providers", lambda: [provider])
    monkeypatch.setattr(canvas_catalog.employee_registry, "list_all", lambda: [])
    monkeypatch.setattr(
        canvas_catalog.openrouter_media,
        "list_media_models",
        lambda kind: [{
            "id": "openai/gpt-image-2",
            "name": "OpenAI: GPT Image 2",
            "kind": kind,
            "inputModalities": ["text", "image"],
            "outputModalities": ["image"],
            "recommended": False,
        }],
    )
    canvas_catalog._media_catalog_cache.clear()

    rows = canvas_catalog.list_canvas_models("image")

    assert [(row["vendorKey"], row["modelKey"]) for row in rows] == [
        ("openrouter", "openai/gpt-image-2"),
    ]
    assert rows[0]["meta"]["source"] == "connected-provider-catalog"
