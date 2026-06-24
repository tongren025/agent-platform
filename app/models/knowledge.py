from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


class KnowledgeDocument(BaseModel):
    doc_id: str = Field("", alias="docId")
    file_name: str = Field("", alias="fileName")
    extension: str = ""
    size_bytes: int = Field(0, alias="sizeBytes")
    uploaded_at: datetime = Field(default_factory=_now, alias="uploadedAt")
    tags: Optional[list[str]] = None

    model_config = {"populate_by_name": True}


class KnowledgeSnippet(BaseModel):
    doc_id: str = Field("", alias="docId")
    file_name: str = Field("", alias="fileName")
    excerpt: str = ""
    score: float = 0.0

    model_config = {"populate_by_name": True}
