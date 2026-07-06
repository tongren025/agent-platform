"""知识库数据模型：文档元信息与检索片段（存储与检索见 app/services/knowledge.py）。"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


def _now() -> datetime:
    """UTC 当前时间工厂（默认值用）。"""
    return datetime.now(timezone.utc)


class KnowledgeDocument(BaseModel):
    """知识库文档元信息（文件名/扩展名/大小），正文以文件形式存 data/knowledge/<员工>/ 下。"""
    doc_id: str = Field("", alias="docId")
    file_name: str = Field("", alias="fileName")
    extension: str = ""
    size_bytes: int = Field(0, alias="sizeBytes")
    uploaded_at: datetime = Field(default_factory=_now, alias="uploadedAt")
    tags: Optional[list[str]] = None

    model_config = {"populate_by_name": True}


class KnowledgeSnippet(BaseModel):
    """一条检索命中片段：来源文档 + 摘录 + 相关性得分，注入 agent 提示词或返回前端。"""
    doc_id: str = Field("", alias="docId")
    file_name: str = Field("", alias="fileName")
    excerpt: str = ""
    score: float = 0.0

    model_config = {"populate_by_name": True}
