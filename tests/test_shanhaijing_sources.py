"""原典资料与API回归：临时目录隔离，禁止改写真实角色或调用搜图。"""

import copy
import json
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.testclient import TestClient

from app.api import shanhaijing as api
from app.services import shanhaijing_sources as sources

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "/api/v1/agentapp/shanhaijing"


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False), encoding="utf-8")


@pytest.fixture
def isolated(tmp_path, monkeypatch):
    """复制小型清单，并用微型PDF模拟资源状态，不复制609MiB原件。"""
    source = tmp_path / "sources"
    source.mkdir()
    for name in ("editions.json", "citations.json"):
        (source / name).write_bytes((ROOT / "data/shanhaijing" / name).read_bytes())
    characters = [{"id": "zhulong", "name": "烛龙", "classic_quote": "档案旧文"}]
    write_json(source / "characters.json", characters)
    assets = tmp_path / "assets"
    assets.mkdir()
    monkeypatch.setattr(sources, "SOURCE_DIR", source)
    monkeypatch.setattr(sources, "ASSET_DIR", assets)
    monkeypatch.setattr(api, "DATA_DIR", source)
    monkeypatch.setattr(api, "CHARACTERS_FILE", source / "characters.json")
    monkeypatch.setattr(api, "CACHE_DIR", source / "cache")
    app = FastAPI()
    app.include_router(api.router)
    app.mount("/uploads/shanhaijing/editions", StaticFiles(directory=assets))
    with TestClient(app) as client:
        yield source, assets, client


def test_edition_directory_and_missing_resources(isolated):
    _, _, client = isolated
    response = client.get(f"{PREFIX}/editions")
    assert response.status_code == 200
    edition = response.json()["data"][0]
    assert [c["number"] for c in edition["chapters"]] == list(range(1, 19))
    assert [c["start_pdf_page"] for c in edition["chapters"]] == [
        9,
        16,
        34,
        54,
        61,
        90,
        93,
        101,
        104,
        107,
        109,
        112,
        115,
        119,
        123,
        127,
        132,
        136,
    ]
    assert edition["page_count"] == 144
    assert not edition["pdf_available"] and not edition["preview_available"]
    assert "asset_key" not in edition
    assert client.get(f"{PREFIX}/editions/unknown").status_code == 404
    assert client.get(f"{PREFIX}/characters/unknown/citations").status_code == 404


def test_resources_and_http_range(isolated):
    source, assets, client = isolated
    editions = json.loads((source / "editions.json").read_text(encoding="utf-8"))
    payload = b"%PDF-1.7\nsmall-test-document\n%%EOF"
    editions[0]["file_bytes"] = len(payload)
    write_json(source / "editions.json", editions)
    folder = assets / "song-1180"
    (folder / "pages").mkdir(parents=True)
    (folder / "song-1180-color.pdf").write_bytes(payload)
    for page in range(1, 145):
        (folder / "pages" / f"{page:03d}.webp").write_bytes(b"test-image")
    write_json(folder / "ready.json", {"source_sha256": editions[0]["sha256"], "page_count": 144})
    edition = client.get(f"{PREFIX}/editions/song-1180-chiyang").json()["data"]
    assert edition["pdf_available"] and edition["preview_available"]
    response = client.get(edition["pdf_url"], headers={"Range": "bytes=0-7"})
    assert response.status_code == 206
    assert response.content == payload[:8]
    assert response.headers["content-range"] == f"bytes 0-7/{len(payload)}"
    (folder / "pages/144.webp").unlink()
    assert not sources.list_editions()[0]["preview_available"]


@pytest.mark.parametrize("marker", [[], {}, {"source_sha256": "wrong", "page_count": 144}])
def test_bad_ready_marker_is_unavailable_not_server_error(isolated, marker):
    _, assets, client = isolated
    (assets / "song-1180").mkdir()
    write_json(assets / "song-1180/ready.json", marker)
    response = client.get(f"{PREFIX}/editions")
    assert response.status_code == 200
    assert not response.json()["data"][0]["preview_available"]


def test_character_edit_keeps_independent_citations(isolated):
    source, _, client = isolated
    before = (source / "citations.json").read_bytes()
    result = client.put(f"{PREFIX}/characters/zhulong", json={"title": "编辑后的档案"})
    assert result.status_code == 200
    assert result.json()["data"]["title"] == "编辑后的档案"
    assert (source / "citations.json").read_bytes() == before
    citation = client.get(f"{PREFIX}/characters/zhulong/citations").json()["data"][0]
    assert citation["pdf_page"] == 101
    assert citation["chapter_title"] == "海外北经"
    assert citation["review_status"] == "located"


@pytest.mark.parametrize(
    "change",
    [
        {"edition_id": "unknown"},
        {"chapter_number": 19},
        {"pdf_page": 145},
        {"pdf_page": 1},
        {"review_status": "external"},
        {"review_status": "pending"},
        {"excerpt": ""},
        {"edition_id": None},
        {"source_url": "javascript:alert(1)"},
    ],
)
def test_invalid_citation_rejected_as_unavailable(isolated, change):
    source, _, client = isolated
    citations = json.loads((source / "citations.json").read_text(encoding="utf-8"))
    citations[0].update(change)
    write_json(source / "citations.json", citations)
    response = client.get(f"{PREFIX}/characters/zhulong/citations")
    assert response.status_code == 503


@pytest.mark.parametrize("broken", ["not-json", "{}", "[]"])
def test_invalid_catalog(isolated, broken):
    source, _, client = isolated
    if broken == "[]":
        editions = json.loads((source / "editions.json").read_text(encoding="utf-8"))
        editions[0]["chapters"] = []
        write_json(source / "editions.json", editions)
    else:
        (source / "editions.json").write_text(broken, encoding="utf-8")
    assert client.get(f"{PREFIX}/editions").status_code == 503


def test_shipped_citations_and_shared_boundary_pages():
    """真实小型资料只读验证：边界页可跨两卷，外典和待考不伪造宋本页码。"""
    records = json.loads((ROOT / "data/shanhaijing/citations.json").read_text(encoding="utf-8"))
    assert len(records) == 27
    assert len({item["character_id"] for item in records}) == 26
    for character_id in {item["character_id"] for item in records}:
        assert sources.get_character_citations(character_id)
    assert sources.get_character_citations("bashe")[0]["pdf_page"] == 109
    assert sources.get_character_citations("kuiniu")[0]["pdf_page"] == 123
    assert len(sources.get_character_citations("luwu")) == 2
    for character_id in ("kunpeng", "hundun", "taowu", "baize"):
        citation = sources.get_character_citations(character_id)[0]
        assert citation["review_status"] == "external"
        assert citation["pdf_page"] is None and citation["edition_id"] is None
    baize = sources.get_character_citations("baize")[0]
    assert baize["source_url"] == "https://www.shidianguji.com/book/SK2186/chapter/1m1emsn56yjae"
    assert "白泽神兽，能言，达于万物之情" in baize["excerpt"]
    bad = copy.deepcopy(records[0])
    bad.update(review_status="pending", pdf_page=None, edition_id=None)
    with pytest.raises(ValueError):
        sources.CharacterCitation.model_validate(bad)
