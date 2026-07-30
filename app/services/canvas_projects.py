"""把现有漫剧生产项目无损映射为可继续创作的画布工作区。

生产项目仍以 ``data/production/<project_id>`` 为业务真相；画布首次打开时生成同 ID
的工作区快照，后续画布编辑写入 ``data/canvas/workbench``，不改写或删除原生产项目。
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.api.common import validate_key

STAGE_ORDER = {
    "idea": 0,
    "script": 1,
    "setting": 2,
    "design": 3,
    "storyboard": 4,
    "img_prompt": 5,
    "vid_prompt": 6,
    "img_gen": 7,
    "vid_gen": 8,
    "final": 9,
}

BUILTIN_CATEGORIES = [
    {
        "id": "shots", "name": "分镜", "icon": "🎬", "iconName": "IconLayoutRows",
        "defaultNodeRenderKind": "shot-frame", "order": 1, "isBuiltin": True,
    },
    {
        "id": "cast", "name": "角色", "icon": "👥", "iconName": "IconUser",
        "defaultNodeRenderKind": "character-card", "order": 2, "isBuiltin": True,
    },
    {
        "id": "scene", "name": "场景", "icon": "🌍", "iconName": "IconPhoto",
        "defaultNodeRenderKind": "scene-card", "order": 3, "isBuiltin": True,
    },
    {
        "id": "prop", "name": "道具", "icon": "🧰", "iconName": "IconBox",
        "defaultNodeRenderKind": "prop-card", "order": 4, "isBuiltin": True,
    },
    {
        "id": "audio", "name": "声音", "icon": "🎵", "iconName": "IconChartBar",
        "defaultNodeRenderKind": "audio-strip", "order": 5, "isBuiltin": True,
    },
]


def _read_json(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text("utf-8"))
    except (OSError, json.JSONDecodeError):
        return default


def _epoch_ms(value: Any, fallback_path: Path | None = None) -> int:
    if isinstance(value, (int, float)):
        return int(value if value > 10_000_000_000 else value * 1000)
    clean = str(value or "").strip()
    if clean:
        try:
            return int(datetime.fromisoformat(clean.replace("Z", "+00:00")).timestamp() * 1000)
        except ValueError:
            pass
    if fallback_path is not None:
        try:
            return int(fallback_path.stat().st_mtime * 1000)
        except OSError:
            pass
    return int(datetime.now(timezone.utc).timestamp() * 1000)


def _production_paths(production_dir: Path, project_id: str) -> tuple[Path, Path]:
    validate_key(project_id, label="project_id")
    root = production_dir / project_id
    return root / "project.json", root / "cards.json"


def load_production_project(production_dir: Path, project_id: str) -> tuple[dict[str, Any], list[dict[str, Any]]] | None:
    project_path, cards_path = _production_paths(production_dir, project_id)
    if not project_path.is_file():
        return None
    project = _read_json(project_path, {})
    cards = _read_json(cards_path, [])
    if not isinstance(project, dict):
        return None
    return project, [card for card in cards if isinstance(card, dict)] if isinstance(cards, list) else []


def _thumbnail_urls(cards: list[dict[str, Any]], limit: int = 4) -> list[str]:
    urls: list[str] = []
    for card in cards:
        for url in card.get("images") or []:
            clean = str(url or "").strip()
            if clean and clean not in urls:
                urls.append(clean)
                if len(urls) >= limit:
                    return urls
    return urls


def production_project_summary(project_path: Path) -> dict[str, Any] | None:
    project = _read_json(project_path, {})
    if not isinstance(project, dict):
        return None
    project_id = str(project.get("project_id") or project_path.parent.name).strip()
    if not project_id:
        return None
    cards = _read_json(project_path.parent / "cards.json", [])
    cards = [card for card in cards if isinstance(card, dict)] if isinstance(cards, list) else []
    created_at = _epoch_ms(project.get("created_at"), project_path)
    updated_at = _epoch_ms(project.get("updated_at"), project_path)
    thumbnails = _thumbnail_urls(cards)
    return {
        "id": project_id,
        "name": str(project.get("name") or project_id),
        "createdAt": created_at,
        "updatedAt": updated_at,
        "revision": 0,
        "savedAt": updated_at,
        "source": "native",
        **({"thumbnail": thumbnails[0], "thumbnailUrls": thumbnails} if thumbnails else {}),
    }


def list_project_summaries(workbench_dir: Path, production_dir: Path) -> list[dict[str, Any]]:
    """合并画布项目与生产项目；同 ID 的画布记录优先保留其最新编辑信息。"""
    by_id: dict[str, dict[str, Any]] = {}
    for path in workbench_dir.glob("*.json"):
        record = _read_json(path, {})
        if not isinstance(record, dict):
            continue
        summary = {
            key: record.get(key)
            for key in (
                "id", "name", "createdAt", "updatedAt", "revision", "savedAt",
                "thumbStyle", "thumbnail", "thumbnailUrls", "seedKey", "source",
                "rootPath", "missing", "draft",
            )
            if key in record
        }
        if summary.get("id"):
            by_id[str(summary["id"])] = summary

    if production_dir.exists():
        for project_path in production_dir.glob("*/project.json"):
            summary = production_project_summary(project_path)
            if summary and summary["id"] not in by_id:
                by_id[summary["id"]] = summary

    projects = list(by_id.values())
    projects.sort(key=lambda item: int(item.get("updatedAt") or 0), reverse=True)
    return projects


def _tiptap_doc(text: str) -> dict[str, Any]:
    content = []
    for line in str(text or "").splitlines():
        if line:
            content.append({"type": "paragraph", "content": [{"type": "text", "text": line}]})
        else:
            content.append({"type": "paragraph"})
    return {"type": "doc", "content": content}


def _card_category(card: dict[str, Any]) -> tuple[str, str]:
    title = str(card.get("title") or "")
    stage = str(card.get("stage") or "")
    lowered = title.lower()
    if stage in {"setting", "design"} and any(token in lowered for token in ("角色", "人物", "character")):
        return "cast", "character-card"
    if stage in {"setting", "design"} and any(token in lowered for token in ("场景", "scene")):
        return "scene", "scene-card"
    if any(token in lowered for token in ("道具", "prop")):
        return "prop", "prop-card"
    return "shots", "shot-frame"


def _result(
    *,
    card_id: str,
    media_type: str,
    url: str,
    created_at: int,
    index: int,
) -> dict[str, Any]:
    return {
        "id": f"production-{card_id}-{media_type}-{index}",
        "type": media_type,
        "url": url,
        "createdAt": created_at,
    }


def _card_node(card: dict[str, Any], stage_row: int) -> dict[str, Any]:
    card_id = str(card.get("card_id") or f"card-{stage_row}")
    stage = str(card.get("stage") or "idea")
    stage_index = STAGE_ORDER.get(stage, 0)
    created_at = _epoch_ms(card.get("updated_at") or card.get("created_at"))
    images = [str(url).strip() for url in card.get("images") or [] if str(url).strip()]
    videos = [str(url).strip() for url in card.get("videos") or [] if str(url).strip()]
    category_id, render_kind = _card_category(card)
    prompt = str((card.get("prompts") or [""])[0] or card.get("content") or "")
    media_results: list[dict[str, Any]] = []
    if videos:
        media_results = [
            _result(card_id=card_id, media_type="video", url=url, created_at=created_at, index=index)
            for index, url in enumerate(videos)
        ]
        kind = "video"
        size = {"width": 420, "height": 340}
    elif images:
        media_results = [
            _result(card_id=card_id, media_type="image", url=url, created_at=created_at, index=index)
            for index, url in enumerate(images)
        ]
        kind = "image"
        size = {"width": 340, "height": 280}
    else:
        kind = "text"
        size = {"width": 280, "height": 200}

    node: dict[str, Any] = {
        "id": f"production-{card_id}",
        "kind": kind,
        "title": str(card.get("title") or card_id),
        "position": {"x": 120 + stage_index * 420, "y": 120 + stage_row * 360},
        "size": size,
        "prompt": prompt,
        "references": [],
        "history": media_results[1:],
        "status": "success" if media_results else "idle",
        "meta": {
            "productionCardId": card_id,
            "productionStage": stage,
            "episode": card.get("episode"),
            "shotNumber": card.get("shot_number"),
            "assignee": card.get("assignee"),
        },
        "categoryId": category_id,
        "renderKind": render_kind,
    }
    if kind == "text":
        node["contentJson"] = _tiptap_doc(str(card.get("content") or ""))
    if media_results:
        node["result"] = media_results[0]
    return node


def _timeline(nodes: list[dict[str, Any]]) -> dict[str, Any]:
    tracks = {
        "image": {"id": "imageTrack", "type": "image", "label": "图片轨", "clips": []},
        "video": {"id": "videoTrack", "type": "video", "label": "视频轨", "clips": []},
        "audio": {"id": "audioTrack", "type": "audio", "label": "音频轨", "clips": []},
    }
    cursor = 0
    for node in nodes:
        result = node.get("result") or {}
        media_type = result.get("type")
        if media_type not in {"image", "video"} or not result.get("url"):
            continue
        duration = 150 if media_type == "video" else 90
        clip = {
            "id": f"clip-{node['id']}",
            "type": media_type,
            "sourceNodeId": node["id"],
            "label": node["title"],
            "startFrame": cursor,
            "endFrame": cursor + duration,
            "frameCount": duration,
            "offsetStartFrame": 0,
            "offsetEndFrame": 0,
            "url": result["url"],
        }
        tracks[media_type]["clips"].append(clip)
        cursor += duration
    return {
        "version": 1,
        "fps": 30,
        "scale": 1,
        "playheadFrame": 0,
        "tracks": [tracks["image"], tracks["video"], tracks["audio"]],
        "textClips": [],
    }


def build_workbench_record(project: dict[str, Any], cards: list[dict[str, Any]]) -> dict[str, Any]:
    """把生产项目和卡片转换成 Nomi 工作台可直接 hydrate 的 v1 记录。"""
    project_id = str(project.get("project_id") or "").strip()
    validate_key(project_id, label="project_id")
    created_at = _epoch_ms(project.get("created_at"))
    updated_at = _epoch_ms(project.get("updated_at"))
    rows_by_stage: dict[str, int] = {}
    nodes: list[dict[str, Any]] = []
    node_by_card_id: dict[str, str] = {}
    card_by_node_id: dict[str, dict[str, Any]] = {}
    for card in cards:
        stage = str(card.get("stage") or "idea")
        row = rows_by_stage.get(stage, 0)
        rows_by_stage[stage] = row + 1
        node = _card_node(card, row)
        nodes.append(node)
        card_id = str(card.get("card_id") or "")
        if card_id:
            node_by_card_id[card_id] = node["id"]
            card_by_node_id[node["id"]] = card

    edge_candidates: dict[tuple[Any, Any], list[tuple[int, str]]] = {}
    for node_id, card in card_by_node_id.items():
        key = (card.get("episode"), card.get("shot_number"))
        if key == (None, None):
            continue
        edge_candidates.setdefault(key, []).append((
            STAGE_ORDER.get(str(card.get("stage") or ""), 0),
            node_id,
        ))
    edges: list[dict[str, Any]] = []
    for candidates in edge_candidates.values():
        ordered = [node_id for _, node_id in sorted(candidates)]
        for index, (source, target) in enumerate(zip(ordered, ordered[1:])):
            edges.append({
                "id": f"edge-{source}-{target}",
                "source": source,
                "target": target,
                "mode": "reference",
                "order": index,
            })

    source_text = "\n\n".join(
        part for part in (
            str(project.get("description") or "").strip(),
            str(project.get("source_content") or "").strip(),
        )
        if part
    )
    thumbnails = _thumbnail_urls(cards)
    return {
        "id": project_id,
        "name": str(project.get("name") or project_id),
        "createdAt": created_at,
        "updatedAt": updated_at,
        "revision": 0,
        "savedAt": updated_at,
        "source": "native",
        **({"thumbnail": thumbnails[0], "thumbnailUrls": thumbnails} if thumbnails else {}),
        "version": 1,
        "payload": {
            "workbenchDocument": {
                "version": 1,
                "title": str(project.get("name") or project_id),
                "contentJson": _tiptap_doc(source_text),
                "updatedAt": updated_at,
            },
            "timeline": _timeline(nodes),
            "generationCanvas": {
                "nodes": nodes,
                "edges": edges,
                "selectedNodeIds": [],
                "groups": [],
            },
            "categories": BUILTIN_CATEGORIES,
            "storyboardPlan": None,
            "storyboardPlanCommitted": False,
        },
    }


def read_or_import_project(
    project_id: str,
    workbench_dir: Path,
    production_dir: Path,
) -> dict[str, Any] | None:
    """优先读已保存画布；不存在时从同 ID 生产项目导入并立即持久化。"""
    validate_key(project_id, label="project_id")
    workbench_path = workbench_dir / f"{project_id}.json"
    record = _read_json(workbench_path, None)
    if isinstance(record, dict):
        return record
    loaded = load_production_project(production_dir, project_id)
    if loaded is None:
        return None
    project, cards = loaded
    record = build_workbench_record(project, cards)
    workbench_dir.mkdir(parents=True, exist_ok=True)
    workbench_path.write_text(json.dumps(record, ensure_ascii=False, indent=2), "utf-8")
    return record


def production_assets(production_dir: Path, project_id: str) -> list[dict[str, Any]]:
    """把生产卡片已有图片/视频映射为画布素材库条目。"""
    loaded = load_production_project(production_dir, project_id)
    if loaded is None:
        return []
    _, cards = loaded
    items: list[dict[str, Any]] = []
    for card in cards:
        card_id = str(card.get("card_id") or "card")
        updated_at = str(card.get("updated_at") or card.get("created_at") or "")
        for media_type, urls in (("image", card.get("images") or []), ("video", card.get("videos") or [])):
            for index, url in enumerate(urls):
                clean = str(url or "").strip()
                if not clean:
                    continue
                items.append({
                    "id": f"production-{card_id}-{media_type}-{index}",
                    "name": str(card.get("title") or card_id),
                    "data": {
                        "url": clean,
                        "kind": "production",
                        "contentType": f"{media_type}/*",
                        "productionCardId": card_id,
                    },
                    "createdAt": updated_at,
                    "updatedAt": updated_at,
                    "userId": "agent-studio",
                    "projectId": project_id,
                })
    return items
