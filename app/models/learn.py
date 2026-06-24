"""
定时文章学习相关的数据模型。

与「提示词采集（scrape）」并列的第二类自动学习：给定一批网页 URL，
每日定时抓取正文 → LLM 总结为专业知识 → 写入目标员工的知识库 + 长期记忆。
复用 app/services/scraper.py 的 scrape_and_summarize()。

- LearnSource：一个文章学习源（URL 列表 + 目标员工 + 定时配置 + 运行状态）
- LearnRunResult：一次学习运行的结果（含每篇文章的明细）
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


class LearnArticleResult(BaseModel):
    """单篇文章的学习结果。"""
    url: str = ""
    status: str = "ok"  # ok | failed
    title: str = ""
    char_count: int = Field(0, alias="charCount")
    memories_added: int = Field(0, alias="memoriesAdded")
    knowledge_doc_id: Optional[str] = Field(None, alias="knowledgeDocId")
    message: str = ""

    model_config = {"populate_by_name": True, "extra": "allow"}


class LearnSource(BaseModel):
    source_code: str = Field("", alias="sourceCode")
    name: str = ""
    target_employee_key: str = Field("", alias="targetEmployeeKey")
    urls: list[str] = Field(default_factory=list)
    role_hint: str = Field("", alias="roleHint")  # 留空则用目标员工名字
    schedule_time: str = Field("02:00", alias="scheduleTime")  # 本地时间 HH:MM
    max_articles: int = Field(10, ge=1, le=50, alias="maxArticles")  # 单次最多学习的文章数
    enabled: bool = True

    # ── 运行时状态（由运行器回写）──────────────────────────────
    last_run_at: Optional[datetime] = Field(None, alias="lastRunAt")
    last_status: str = Field("", alias="lastStatus")  # success | partial | failed
    last_message: str = Field("", alias="lastMessage")
    last_learned_count: int = Field(0, alias="lastLearnedCount")
    total_learned: int = Field(0, alias="totalLearned")

    created_at: datetime = Field(default_factory=_now, alias="createdAt")
    updated_at: datetime = Field(default_factory=_now, alias="updatedAt")

    model_config = {"populate_by_name": True, "extra": "ignore"}

    def get_key(self) -> str:
        return self.source_code


class LearnRunResult(BaseModel):
    source_code: str = Field("", alias="sourceCode")
    status: str = "success"  # success | partial | failed
    total_urls: int = Field(0, alias="totalUrls")
    learned_count: int = Field(0, alias="learnedCount")  # 成功学习的文章数
    failed_count: int = Field(0, alias="failedCount")
    message: str = ""
    articles: list[LearnArticleResult] = Field(default_factory=list)
    started_at: datetime = Field(default_factory=_now, alias="startedAt")
    finished_at: Optional[datetime] = Field(None, alias="finishedAt")

    model_config = {"populate_by_name": True, "extra": "allow"}
