"""多模态员工：能力迁移、专用媒体工具与聊天模型隔离测试。"""
from __future__ import annotations

import json
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.api.registry import _validate_employee_model_routes
from app.core.model_capabilities import is_video_generation_model_id
from app.models.registry import EmployeeDefinition, ToolDefinition
from app.models.runtime import EmployeeRuntimeSnapshot, PromptCompileResult
from app.runtime.runner import _append_generated_media, run_agent
from app.runtime.snapshot import load_snapshot
from app.tools.base import ToolContext
from app.tools.media import (
    CheckVideoGenerationHandler,
    GenerateImageHandler,
    GenerateVideoHandler,
)


def test_legacy_employee_defaults_to_text_output():
    employee = EmployeeDefinition.model_validate({
        "employeeKey": "legacy",
        "name": "旧员工",
        "defaultModelPolicy": {"model_id": "gpt-5.6-terra"},
    })

    assert employee.output_modalities == ["text"]
    assert employee.model_dump(by_alias=True)["outputModalities"] == ["text"]


def test_legacy_employee_with_media_thinking_model_remains_loadable():
    employee = EmployeeDefinition.model_validate({
        "employeeKey": "legacy-bad-route",
        "name": "旧员工错误路由",
        "defaultModelPolicy": {"model_id": "gpt-image-2"},
    })

    assert employee.default_model_policy["model_id"] == "gpt-image-2"


def test_new_employee_requires_explicit_thinking_model():
    employee = EmployeeDefinition(employee_key="missing-model", name="缺少模型")

    with pytest.raises(HTTPException) as exc_info:
        _validate_employee_model_routes(employee)

    assert exc_info.value.status_code == 400
    assert "显式配置 model_id" in str(exc_info.value.detail)


@pytest.mark.parametrize(
    "model_id",
    [
        "openrouter:alibaba/wan-2.7",
        "openrouter:alibaba/wan-2.6",
        "openrouter:x-ai/grok-imagine-video",
        "openrouter:alibaba/happyhorse-1.1",
        "openrouter:bytedance/seedance-2.0",
    ],
)
def test_openrouter_video_catalog_models_are_recognized(model_id):
    assert is_video_generation_model_id(model_id)


def test_snapshot_auto_injects_image_tool(monkeypatch):
    employee = EmployeeDefinition(
        employee_key="artist",
        name="原画师",
        output_modalities=["text", "image"],
        default_model_policy={
            "model_id": "gpt-5.6-terra",
            "image_model_id": "gpt-image-2",
        },
    )
    tool = ToolDefinition(
        tool_code="generate_image",
        name="生成图片",
        input_schema='{"type":"object"}',
    )
    monkeypatch.setattr(
        "app.runtime.snapshot.employee_registry.get",
        lambda _key: employee,
    )
    monkeypatch.setattr(
        "app.runtime.snapshot.tool_registry.get",
        lambda key: tool if key == "generate_image" else None,
    )

    snapshot = load_snapshot("artist", ["global"])

    assert snapshot is not None
    assert snapshot.output_modalities == ["text", "image"]
    assert [item.tool_code for item in snapshot.tools_by_scope["global"]] == [
        "generate_image"
    ]


@pytest.mark.asyncio
async def test_image_employee_uses_images_service(monkeypatch):
    employee = SimpleNamespace(default_model_policy={
        "model_id": "gpt-5.6-terra",
        "image_model_id": "gpt-image-2",
    })
    captured = {}
    monkeypatch.setattr(
        "app.tools.media.employee_registry.get",
        lambda _key: employee,
    )

    def fake_generate(prompt, model, size, quality):
        captured.update({
            "prompt": prompt,
            "model": model,
            "size": size,
            "quality": quality,
        })
        return {"url": "/uploads/canvas/generated.png", "model": model}

    monkeypatch.setattr("app.tools.media.generate_image_to_local", fake_generate)
    result = json.loads(await GenerateImageHandler().handle(ToolContext(
        "generate_image",
        json.dumps({"prompt": "角色立绘", "quality": "high"}),
        "artist",
    )))

    assert result["success"] is True
    assert result["mediaType"] == "image"
    assert result["markdown"] == "![生成图片](/uploads/canvas/generated.png)"
    assert captured["model"] == "gpt-image-2"
    assert captured["quality"] == "high"


@pytest.mark.asyncio
async def test_video_employee_submits_and_checks_job(monkeypatch):
    employee = SimpleNamespace(default_model_policy={
        "model_id": "gpt-5.6-terra",
        "video_model_id": "openrouter:bytedance/seedance-2.0",
    })
    monkeypatch.setattr(
        "app.tools.media.employee_registry.get",
        lambda _key: employee,
    )
    monkeypatch.setattr(
        "app.tools.media.openrouter_media.submit_video",
        lambda project_id, **kwargs: {
            "id": "job-42",
            "status": "queued",
            "model": kwargs["model"],
        },
    )
    monkeypatch.setattr(
        "app.tools.media.openrouter_media.sync_video",
        lambda project_id, job_id: {
            "id": job_id,
            "status": "completed",
            "url": f"/uploads/production/{project_id}/result.mp4",
        },
    )

    submitted = json.loads(await GenerateVideoHandler().handle(ToolContext(
        "generate_video",
        json.dumps({"prompt": "缓慢推进镜头"}),
        "video-artist",
    )))
    completed = json.loads(await CheckVideoGenerationHandler().handle(ToolContext(
        "check_video_generation",
        json.dumps({"job_id": submitted["jobId"]}),
        "video-artist",
    )))

    assert submitted["status"] == "queued"
    assert submitted["model"] == "openrouter:bytedance/seedance-2.0"
    assert completed["mediaType"] == "video"
    assert completed["markdown"].endswith(
        "(/uploads/production/employee-video-artist/result.mp4)"
    )


@pytest.mark.asyncio
async def test_video_employee_rejects_non_openrouter_route(monkeypatch):
    employee = SimpleNamespace(default_model_policy={
        "model_id": "gpt-5.6-terra",
        "video_model_id": "seedance-2.0",
    })
    monkeypatch.setattr(
        "app.tools.media.employee_registry.get",
        lambda _key: employee,
    )

    result = json.loads(await GenerateVideoHandler().handle(ToolContext(
        "generate_video",
        json.dumps({"prompt": "缓慢推进镜头"}),
        "video-artist",
    )))

    assert result["success"] is False
    assert "openrouter:" in result["error"]


@pytest.mark.asyncio
async def test_failed_video_status_is_not_reported_as_success(monkeypatch):
    monkeypatch.setattr(
        "app.tools.media.openrouter_media.sync_video",
        lambda project_id, job_id: {
            "id": job_id,
            "status": "failed",
            "error": "",
        },
    )

    result = json.loads(await CheckVideoGenerationHandler().handle(ToolContext(
        "check_video_generation",
        json.dumps({"job_id": "job-failed"}),
        "video-artist",
    )))

    assert result["success"] is False
    assert result["status"] == "failed"


@pytest.mark.asyncio
async def test_image_model_is_rejected_as_thinking_model():
    result = await run_agent(
        snapshot=EmployeeRuntimeSnapshot(
            employee_key="bad-artist",
            default_model_policy={"model_id": "gpt-image-2"},
        ),
        compiled_prompt=PromptCompileResult(),
        user_message="生成图片",
        visible_tools=[],
        visible_mcp_servers=[],
        employee_key="bad-artist",
    )

    assert result.success is False
    assert "不能作为员工思考模型" in (result.error_message or "")


def test_generated_media_is_appended_to_final_reply():
    traces = [
        SimpleNamespace(
            tool_name="generate_image",
            success=True,
            result=json.dumps({
                "success": True,
                "markdown": "![生成图片](/uploads/canvas/result.png)",
            }),
        )
    ]

    assert _append_generated_media("已经生成。", traces).endswith(
        "![生成图片](/uploads/canvas/result.png)"
    )


def test_pending_video_job_id_is_appended_to_final_reply():
    traces = [
        SimpleNamespace(
            tool_name="generate_video",
            success=True,
            result=json.dumps({
                "success": True,
                "mediaType": "video_job",
                "jobId": "job-42",
                "status": "queued",
            }),
        )
    ]

    assert _append_generated_media("任务已提交。", traces).endswith(
        "视频任务 `job-42` 当前状态：queued。"
    )
