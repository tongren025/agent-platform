"""
自动学习 / 提示词采集相关的数据模型。

- ScrapeSource：一个采集源（平台 + 目标员工 + 定时配置 + 运行状态）
- CollectedPrompt：采集到的单条提示词记录
- ScrapeRunResult：一次采集运行的结果
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


class ScrapeSource(BaseModel):
    source_code: str = Field("", alias="sourceCode")
    name: str = ""
    platform: str = "jimeng"  # jimeng | xyq
    url: str = ""
    target_employee_key: str = Field("", alias="targetEmployeeKey")
    schedule_time: str = Field("09:00", alias="scheduleTime")  # 本地时间 HH:MM
    max_items: int = Field(40, alias="maxItems")
    enabled: bool = True

    # ── 运行时状态（由采集器回写）──────────────────────────────
    last_run_at: Optional[datetime] = Field(None, alias="lastRunAt")
    last_status: str = Field("", alias="lastStatus")  # success | failed | needs_login
    last_message: str = Field("", alias="lastMessage")
    last_new_count: int = Field(0, alias="lastNewCount")
    total_collected: int = Field(0, alias="totalCollected")

    created_at: datetime = Field(default_factory=_now, alias="createdAt")
    updated_at: datetime = Field(default_factory=_now, alias="updatedAt")

    model_config = {"populate_by_name": True, "extra": "ignore"}

    def get_key(self) -> str:
        return self.source_code


class CollectedPrompt(BaseModel):
    external_id: str = Field("", alias="externalId")
    source_code: str = Field("", alias="sourceCode")
    platform: str = "jimeng"
    prompt: str = ""
    title: str = ""
    author: str = ""
    item_type: str = Field("image", alias="itemType")  # image | video
    favorite_num: int = Field(0, alias="favoriteNum")
    usage_num: int = Field(0, alias="usageNum")
    image_url: str = Field("", alias="imageUrl")
    create_time: int = Field(0, alias="createTime")
    collected_at: datetime = Field(default_factory=_now, alias="collectedAt")

    model_config = {"populate_by_name": True, "extra": "allow"}


class ScrapeRunResult(BaseModel):
    source_code: str = Field("", alias="sourceCode")
    status: str = "success"  # success | failed | needs_login
    fetched_count: int = Field(0, alias="fetchedCount")
    new_count: int = Field(0, alias="newCount")
    total_count: int = Field(0, alias="totalCount")
    message: str = ""
    started_at: datetime = Field(default_factory=_now, alias="startedAt")
    finished_at: Optional[datetime] = Field(None, alias="finishedAt")

    model_config = {"populate_by_name": True, "extra": "allow"}
