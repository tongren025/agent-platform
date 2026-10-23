"""山海经原典版本与角色出处，只读加载独立JSON，避免角色编辑丢失考据。

入口为 app.api.shanhaijing 的 editions 和 characters/{id}/citations。
扫描资源由现有 /uploads 提供；离线导入脚本负责生成原件、书影和就绪标记。
"""

from __future__ import annotations

import json
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl, model_validator

from app.config import BASE_DIR

SOURCE_DIR = BASE_DIR / "data" / "shanhaijing"
ASSET_DIR = BASE_DIR / "data" / "uploads" / "shanhaijing" / "editions"


class EditionChapter(BaseModel):
    """目录采用从1开始的PDF扫描页码，不与原书叶码混用。"""

    number: int = Field(ge=1)
    title: str
    start_pdf_page: int = Field(ge=1)


class ShanhaiEdition(BaseModel):
    """原典版本及已下载资源元数据，不接受客户端文件路径。"""

    id: str = Field(pattern=r"^[a-z0-9][a-z0-9-]{0,63}$")
    asset_key: str = Field(pattern=r"^[a-z0-9][a-z0-9-]{0,63}$")
    title: str
    year: int
    annotator: str
    editor: str
    holding_institution: str
    shelfmark: str
    page_count: int = Field(ge=1)
    file_bytes: int = Field(gt=0)
    sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    source_url: str
    notes: str
    chapters: list[EditionChapter]

    @model_validator(mode="after")
    def validate_chapters(self):
        """防止目录重复、乱序或跳转至不存在的扫描页。"""
        numbers = [chapter.number for chapter in self.chapters]
        pages = [chapter.start_pdf_page for chapter in self.chapters]
        if numbers != list(range(1, len(numbers) + 1)) or not numbers:
            raise ValueError("卷次必须连续且唯一")
        if pages != sorted(pages) or any(page > self.page_count for page in pages):
            raise ValueError("目录页码无效")
        return self


class CharacterCitation(BaseModel):
    """定位仅认证本条摘录；不自动认证旧角色档案中的整段引文。"""

    id: str
    character_id: str
    source_title: str
    source_url: HttpUrl | None = None
    edition_id: str | None = None
    chapter_number: int | None = Field(default=None, ge=1)
    pdf_page: int | None = Field(default=None, ge=1)
    scan_side: Literal["left", "right", "both"] | None = None
    review_status: Literal["located", "pending", "external"]
    excerpt: str = ""
    note: str = ""

    @model_validator(mode="after")
    def validate_review(self):
        """已定位出处必须有原页与摘录，外部典籍不能挂靠宋本。"""
        if self.review_status == "located" and not (
            self.edition_id and self.chapter_number and self.pdf_page and self.excerpt
        ):
            raise ValueError("已定位引用缺少版本、卷次、页码或摘录")
        if self.review_status == "external" and (
            self.edition_id or self.chapter_number or self.pdf_page
        ):
            raise ValueError("外部典籍不能标成宋本页码")
        if self.review_status == "pending" and self.pdf_page is not None:
            raise ValueError("待校出处不能赋予已核对页码")
        if not self.edition_id and (self.chapter_number or self.pdf_page or self.scan_side):
            raise ValueError("经卷和页码必须关联版本")
        return self


def _read_models(filename: str, model: type[BaseModel]) -> list:
    try:
        raw = json.loads((SOURCE_DIR / filename).read_text(encoding="utf-8"))
        if not isinstance(raw, list):
            raise ValueError("资料必须为列表")
        return [model.model_validate(item) for item in raw]
    except (OSError, ValueError) as exc:
        raise ValueError("原典资料暂不可用，请检查版本与出处文件") from exc


def _load_editions() -> list[ShanhaiEdition]:
    editions = _read_models("editions.json", ShanhaiEdition)
    if len({item.id for item in editions}) != len(editions):
        raise ValueError("版本ID重复")
    return editions


def _public_edition(edition: ShanhaiEdition) -> dict:
    folder = ASSET_DIR / edition.asset_key
    pdf = folder / f"{edition.asset_key}-color.pdf"
    base_url = f"/uploads/shanhaijing/editions/{edition.asset_key}"
    ready = False
    try:
        marker = json.loads((folder / "ready.json").read_text(encoding="utf-8"))
        ready = (
            isinstance(marker, dict)
            and marker.get("source_sha256") == edition.sha256
            and marker.get("page_count") == edition.page_count
            and all(
                (folder / "pages" / f"{page:03d}.webp").is_file()
                for page in range(1, edition.page_count + 1)
            )
        )
    except (OSError, ValueError):
        pass
    data = edition.model_dump(exclude={"asset_key"})
    data.update(
        pdf_url=f"{base_url}/{edition.asset_key}-color.pdf",
        page_image_base_url=f"{base_url}/pages",
        pdf_available=pdf.is_file() and pdf.stat().st_size == edition.file_bytes,
        preview_available=ready,
    )
    return data


def list_editions() -> list[dict]:
    """查询版本目录及当前资源就绪状态；不暴露本机绝对路径。"""
    return [_public_edition(edition) for edition in _load_editions()]


def get_edition(edition_id: str) -> dict | None:
    """按清单ID查版本，任意未知ID只返回不存在，不拼接输入路径。"""
    edition = next((item for item in _load_editions() if item.id == edition_id), None)
    return _public_edition(edition) if edition else None


def get_character_citations(character_id: str) -> list[dict]:
    """读取角色出处，并验证经卷和页码；普通角色编辑不写入此文件。"""
    editions = {item.id: item for item in _load_editions()}
    citations = _read_models("citations.json", CharacterCitation)
    if len({item.id for item in citations}) != len(citations):
        raise ValueError("出处ID重复")
    result = []
    for item in citations:
        if item.character_id != character_id:
            continue
        data = item.model_dump(mode="json")
        data.update(edition_title=None, chapter_title=None, chapter_start_pdf_page=None)
        if item.edition_id:
            edition = editions.get(item.edition_id)
            if edition is None:
                raise ValueError("出处引用了未登记版本")
            chapter = next(
                (chapter for chapter in edition.chapters if chapter.number == item.chapter_number),
                None,
            )
            if item.chapter_number and chapter is None:
                raise ValueError("出处引用了不存在的经卷")
            if item.pdf_page and item.pdf_page > edition.page_count:
                raise ValueError("出处页码超出原书")
            if chapter:
                next_chapter = next(
                    (c for c in edition.chapters if c.number == chapter.number + 1), None
                )
                # 相邻卷可共处同一张双页扫描，边界页允许共享。
                end_page = next_chapter.start_pdf_page if next_chapter else edition.page_count
                if item.pdf_page and not chapter.start_pdf_page <= item.pdf_page <= end_page:
                    raise ValueError("出处页码不在所标经卷范围内")
                data.update(
                    chapter_title=chapter.title,
                    chapter_start_pdf_page=chapter.start_pdf_page,
                )
            data["edition_title"] = edition.title
        result.append(data)
    return result
