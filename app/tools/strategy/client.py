"""充值策略 admin API 的异步 HTTP 客户端（httpx），基址来自 settings.agent.admin_api_base_url。模块级单例 admin_client。"""
from __future__ import annotations

import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(60.0, connect=10.0)


class AdminApiClient:

    """RechargeStrategyAssistant 接口的薄封装：上传解析/查结果/预检/批量创建/回滚。"""
    def __init__(self) -> None:
        self.base_url = settings.agent.admin_api_base_url.rstrip("/")
        self.prefix = "/api/v1/novelmanage/RechargeStrategyAssistant"
        self._http = httpx.AsyncClient(timeout=_TIMEOUT)

    def _url(self, path: str) -> str:
        """拼接完整接口 URL（基址 + 固定前缀 + 路径）。"""
        return f"{self.base_url}{self.prefix}{path}"

    async def upload_parse(self, file_bytes: bytes, filename: str) -> dict:
        """上传策略文件并触发解析，返回含 snapshotId 的解析回执。"""
        files = {"file": (filename, file_bytes, "application/octet-stream")}
        resp = await self._http.post(self._url("/upload-parse"), files=files)
        resp.raise_for_status()
        return resp.json()

    async def get_parse_result(self, snapshot_id: str) -> dict:
        """按 snapshotId 查询解析结果。"""
        resp = await self._http.get(
            self._url("/parse-result"),
            params={"snapshotId": snapshot_id},
        )
        resp.raise_for_status()
        return resp.json()

    async def precheck(self, snapshot_id: str) -> dict:
        """对解析出的策略配置做创建前预检。"""
        resp = await self._http.post(
            self._url("/precheck"),
            json={"snapshotId": snapshot_id},
        )
        resp.raise_for_status()
        return resp.json()

    async def batch_create(self, snapshot_id: str, configs: list) -> dict:
        """按解析出的 configs 批量创建策略。"""
        resp = await self._http.post(
            self._url("/batch-create"),
            json={"snapshotId": snapshot_id, "configs": configs},
        )
        resp.raise_for_status()
        return resp.json()

    async def rollback(self, snapshot_id: str) -> dict:
        """回滚某次快照创建的全部策略。"""
        resp = await self._http.post(
            self._url("/rollback"),
            json={"snapshotId": snapshot_id},
        )
        resp.raise_for_status()
        return resp.json()


admin_client = AdminApiClient()
