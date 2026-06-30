from __future__ import annotations

import logging

import httpx
from fastapi import APIRouter, HTTPException, Query, UploadFile, File

from app.config import settings

router = APIRouter(prefix="/api/v1/agentapp/strategyproxy")

logger = logging.getLogger(__name__)

_http = httpx.AsyncClient(timeout=60.0)


def _admin_base_url() -> str:
    return settings.agent.admin_api_base_url.rstrip("/")


@router.post("/upload")
async def upload_strategy_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    content = await file.read()
    url = f"{_admin_base_url()}/api/v1/strategy/upload-parse"

    try:
        resp = await _http.post(
            url,
            files={"file": (file.filename, content, file.content_type or "application/octet-stream")},
        )
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as exc:
        logger.error("Admin API upload failed: %s %s", exc.response.status_code, exc.response.text)
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Admin API error: {exc.response.text}",
        )
    except httpx.RequestError as exc:
        logger.error("Admin API unreachable: %s", exc)
        raise HTTPException(status_code=502, detail=f"Admin API unreachable: {exc}")


@router.get("/parsestatus")
async def get_parse_status(snapshotId: str = Query(..., alias="snapshotId")):
    url = f"{_admin_base_url()}/api/v1/strategy/parse-result"

    try:
        resp = await _http.get(url, params={"snapshotId": snapshotId})
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as exc:
        logger.error("Admin API parse-status failed: %s %s", exc.response.status_code, exc.response.text)
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Admin API error: {exc.response.text}",
        )
    except httpx.RequestError as exc:
        logger.error("Admin API unreachable: %s", exc)
        raise HTTPException(status_code=502, detail=f"Admin API unreachable: {exc}")
