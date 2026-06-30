from __future__ import annotations

import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(60.0, connect=10.0)


class AdminApiClient:

    def __init__(self) -> None:
        self.base_url = settings.agent.admin_api_base_url.rstrip("/")
        self.prefix = "/api/v1/novelmanage/RechargeStrategyAssistant"
        self._http = httpx.AsyncClient(timeout=_TIMEOUT)

    def _url(self, path: str) -> str:
        return f"{self.base_url}{self.prefix}{path}"

    async def upload_parse(self, file_bytes: bytes, filename: str) -> dict:
        files = {"file": (filename, file_bytes, "application/octet-stream")}
        resp = await self._http.post(self._url("/upload-parse"), files=files)
        resp.raise_for_status()
        return resp.json()

    async def get_parse_result(self, snapshot_id: str) -> dict:
        resp = await self._http.get(
            self._url("/parse-result"),
            params={"snapshotId": snapshot_id},
        )
        resp.raise_for_status()
        return resp.json()

    async def precheck(self, snapshot_id: str) -> dict:
        resp = await self._http.post(
            self._url("/precheck"),
            json={"snapshotId": snapshot_id},
        )
        resp.raise_for_status()
        return resp.json()

    async def batch_create(self, snapshot_id: str, configs: list) -> dict:
        resp = await self._http.post(
            self._url("/batch-create"),
            json={"snapshotId": snapshot_id, "configs": configs},
        )
        resp.raise_for_status()
        return resp.json()

    async def rollback(self, snapshot_id: str) -> dict:
        resp = await self._http.post(
            self._url("/rollback"),
            json={"snapshotId": snapshot_id},
        )
        resp.raise_for_status()
        return resp.json()


admin_client = AdminApiClient()
