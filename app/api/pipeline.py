"""
CLI Pipeline REST API — 用本地 CLI 驱动漫剧创作流水线。
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.config import BASE_DIR
from app.runtime.cli_executor import check_available_clis
from app.runtime.cli_pipeline import (
    OUTPUT_DIR,
    DEFAULT_CLI_MAP,
    PIPELINE_STAGES,
    run_pipeline,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/pipeline", tags=["Pipeline"])


# ── Models ─────────────────────────────────────────────────────────


class PipelineRunRequest(BaseModel):
    theme: str = Field(..., description="漫剧题材/梗概")
    cli_overrides: Optional[dict[str, str]] = Field(
        None, description="按员工覆盖 CLI 类型，如 {\"comic-screenwriter\": \"gemini\"}"
    )
    skip_employees: Optional[list[str]] = Field(
        None, description="跳过某些员工（employeeKey 列表）"
    )


class StepInfo(BaseModel):
    employeeKey: str
    name: str
    cliType: str
    file: str
    success: bool
    error: Optional[str] = None
    elapsedSeconds: float
    outputLength: int


class PipelineRunResponse(BaseModel):
    runId: str
    theme: str
    outputDir: str
    finalFile: Optional[str] = None
    success: bool
    totalSeconds: float
    steps: list[StepInfo]


# ── Endpoints ──────────────────────────────────────────────────────


@router.get("/cli-status")
def get_cli_status():
    """检查本机可用的 CLI 工具。"""
    available = check_available_clis()
    return {
        "available": available,
        "defaultMapping": DEFAULT_CLI_MAP,
        "stages": [
            {
                "order": s["order"],
                "employeeKey": s["employee_key"],
                "name": s["name"],
                "defaultCli": DEFAULT_CLI_MAP.get(s["employee_key"], "claude"),
            }
            for s in PIPELINE_STAGES
        ],
    }


@router.post("/run", response_model=PipelineRunResponse)
async def start_pipeline(req: PipelineRunRequest):
    """启动 CLI 流水线（同步执行，等全部完成后返回）。"""
    available = check_available_clis()
    if not any(available.values()):
        raise HTTPException(
            status_code=503,
            detail="没有可用的 CLI 工具。请确保 claude 或 gemini CLI 已安装并认证。",
        )

    result = await run_pipeline(
        theme=req.theme,
        cli_overrides=req.cli_overrides,
        skip_employees=req.skip_employees,
    )

    return PipelineRunResponse(
        runId=result.run_id,
        theme=result.theme,
        outputDir=result.output_dir,
        finalFile=result.final_file,
        success=result.success,
        totalSeconds=result.total_seconds,
        steps=[
            StepInfo(
                employeeKey=s.employee_key,
                name=s.name,
                cliType=s.cli_type,
                file=s.output_file,
                success=s.success,
                error=s.error,
                elapsedSeconds=s.elapsed_seconds,
                outputLength=len(s.output_text),
            )
            for s in result.steps
        ],
    )


@router.get("/runs")
def list_runs():
    """列出所有流水线运行记录。"""
    if not OUTPUT_DIR.exists():
        return []

    runs = []
    for d in sorted(OUTPUT_DIR.iterdir(), reverse=True):
        if not d.is_dir():
            continue
        manifest = d / "manifest.json"
        if manifest.exists():
            try:
                data = json.loads(manifest.read_text(encoding="utf-8"))
                runs.append(data)
            except Exception:
                runs.append({"runId": d.name, "error": "manifest 读取失败"})
        else:
            runs.append({"runId": d.name, "theme": "(无 manifest)"})

    return runs


@router.get("/runs/{run_id}")
def get_run(run_id: str):
    """获取单次运行的详情。"""
    run_dir = OUTPUT_DIR / run_id
    if not run_dir.exists():
        raise HTTPException(404, f"运行记录 {run_id} 不存在")

    manifest = run_dir / "manifest.json"
    result: dict = {}
    if manifest.exists():
        result = json.loads(manifest.read_text(encoding="utf-8"))

    # 附带各步骤的实际输出
    files: dict[str, str] = {}
    for f in sorted(run_dir.glob("*.md")):
        files[f.name] = f.read_text(encoding="utf-8")

    result["files"] = files
    return result


@router.get("/runs/{run_id}/final")
def get_final_doc(run_id: str):
    """获取最终合并文档。"""
    final = OUTPUT_DIR / run_id / "99_final.md"
    if not final.exists():
        raise HTTPException(404, f"运行 {run_id} 的最终文档不存在")
    return {"content": final.read_text(encoding="utf-8")}
