"""知识对象模型：兼容旧员工文档，并补充来源、权威性和索引状态元数据。"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


def _now() -> datetime:
    """UTC 当前时间工厂（默认值用）。"""
    return datetime.now(timezone.utc)


class KnowledgeDocument(BaseModel):
    """知识文档元信息；旧 index.json 缺少的新字段均有兼容默认值。"""
    doc_id: str = Field("", alias="docId")
    file_name: str = Field("", alias="fileName")
    extension: str = ""
    size_bytes: int = Field(0, alias="sizeBytes")
    uploaded_at: datetime = Field(default_factory=_now, alias="uploadedAt")
    tags: Optional[list[str]] = None
    space_type: str = Field("employee", alias="spaceType")
    space_key: str = Field("", alias="spaceKey")
    kind: str = "reference"
    status: str = "published"
    authority: str = "reviewed"
    source_type: str = Field("upload", alias="sourceType")
    content_hash: str = Field("", alias="contentHash")
    index_status: str = Field("degraded", alias="indexStatus")
    chunk_count: int = Field(0, alias="chunkCount")
    revision: int = 1

    model_config = {"populate_by_name": True}


class KnowledgeSnippet(BaseModel):
    """一条检索命中片段：来源文档 + 摘录 + 相关性得分，注入 agent 提示词或返回前端。"""
    doc_id: str = Field("", alias="docId")
    file_name: str = Field("", alias="fileName")
    excerpt: str = ""
    score: float = 0.0

    model_config = {"populate_by_name": True}
