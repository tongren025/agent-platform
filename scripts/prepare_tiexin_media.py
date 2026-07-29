"""为《铁心恋人》第一季建立媒体生产清单，并把已落盘资产回写卡片。

本脚本不调用任何外部生成服务。它只负责：
1. 从 complete_tiexin_s1.py 的唯一剧情源生成 216 个逐镜分镜、72 个首帧和
   216 个视频任务；
2. 按已存在的本地文件计算生产进度；
3. 将三视图、场景、分镜、首帧、视频和集成片 URL 幂等回写 cards.json；
4. 只有前置资产和当前版本审核通过后，才向执行器暴露可生产任务。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import threading
from pathlib import Path
from typing import Any

from complete_tiexin_s1 import (
    EPISODES,
    PROJECT_DIR,
    SCENE_ANCHORS,
    characters_for_segment,
    scene_for_segment,
)


ROOT = Path(__file__).resolve().parents[1]
CARDS_PATH = PROJECT_DIR / "cards.json"
ASSET_DIR = PROJECT_DIR / "assets"
CHARACTER_DIR = ASSET_DIR / "characters"
TURNAROUND_DIR = CHARACTER_DIR / "turnarounds"
SCENE_DIR = ASSET_DIR / "scenes"
STORYBOARD_DIR = ASSET_DIR / "storyboards"
FRAME_DIR = ASSET_DIR / "frames"
VIDEO_DIR = ASSET_DIR / "videos"
VIDEO_END_DIR = ASSET_DIR / "video_ends"
EPISODE_DIR = ASSET_DIR / "episodes"
QA_DIR = PROJECT_DIR / "qa"
MANIFEST_PATH = PROJECT_DIR / "media_manifest.json"
STATUS_PATH = QA_DIR / "media_status.json"
PREPRODUCTION_APPROVALS_PATH = QA_DIR / "preproduction_approvals.json"
DELIVERY_APPROVALS_PATH = QA_DIR / "delivery_approvals.json"
VIDEO_STATE_PATH = QA_DIR / "video_jobs.json"
COMPOSITION_STATE_PATH = QA_DIR / "episode_compositions.json"

RESOURCE_PREFIX = (
    "/api/v1/agentapp/production/resource/production/tiexin-s1"
)

CHARACTER_ASSETS = {
    "R1": {
        "title": "R1 沈曜",
        "face": (
            CHARACTER_DIR
            / "details"
            / "R1_shenyao_face_front_candidate_v5.png"
        ),
    },
    "R2": {
        "title": "R2 零号/凌昊",
        "face": CHARACTER_DIR / "R2_linghao_face_v3.png",
    },
    "R3": {
        "title": "R3 韩少卿",
        "face": CHARACTER_DIR / "R3_hanshaoqing_face_v3.png",
    },
}

# 三视图候选与旧的单角度肖像分开登记。只有
# qa/preproduction_approvals.json 明确标为 approved 的版本才可进入分镜生产。
CHARACTER_TURNAROUNDS = {
    "R1": {
        "daily": TURNAROUND_DIR
        / "R1_shenyao_daily_turnaround_candidate_v1.png",
        "tactical": TURNAROUND_DIR
        / "R1_shenyao_tactical_turnaround_candidate_v1.png",
    },
    "R2": {
        "suit": TURNAROUND_DIR
        / "R2_linghao_suit_turnaround_candidate_v2.png",
        "tactical": TURNAROUND_DIR
        / "R2_linghao_tactical_turnaround_candidate_v2.png",
        "home": TURNAROUND_DIR
        / "R2_linghao_home_turnaround_candidate_v5.png",
    },
    "R3": {
        "suit": TURNAROUND_DIR
        / "R3_hanshaoqing_suit_turnaround_candidate_v1.png",
    },
}

# 微小面部固定标记由高分辨率身份锚验收；身份锚不能替代全身三视图，
# 但与三视图共同组成角色服装包，并共同参与审批内容指纹。
R1_IDENTITY_DETAIL_PATHS = {
    "front_identity": (
        CHARACTER_DIR
        / "details"
        / "R1_shenyao_face_front_candidate_v5.png"
    ),
    "right_marker_closeup": (
        CHARACTER_DIR
        / "details"
        / "R1_shenyao_face_right_profile_candidate_v5.png"
    ),
    "left_marker_negative": (
        CHARACTER_DIR
        / "details"
        / "R1_shenyao_face_left_profile_negative_candidate_v5.png"
    ),
}
CHARACTER_TURNAROUND_IDENTITY_DETAILS = {
    "R1_daily": R1_IDENTITY_DETAIL_PATHS,
    "R1_tactical": R1_IDENTITY_DETAIL_PATHS,
}
CHARACTER_STORYBOARD_IDENTITY_ROLES = (
    "front_identity",
    "right_marker_closeup",
)

SCENE_ASSETS = {
    scene_id: SCENE_DIR / f"{scene_id}.png"
    for scene_id in SCENE_ANCHORS
}

SCENE_REQUIRED_VIEWS = {
    "LAB": ("A", "B", "C", "D", "PLAN"),
    "OFFICE": ("A", "B", "C", "MEETING", "MEDICAL", "PLAN"),
    "ROOFTOP": ("A", "B", "C_LEFT", "C_RIGHT", "PLAN"),
    "APARTMENT": (
        "INTERIOR_A",
        "INTERIOR_B",
        "INTERIOR_PLAN",
        "GARAGE_A",
        "GARAGE_B",
        "GARAGE_PLAN",
        "SUV_INTERIOR",
    ),
    "WAREHOUSE": ("A", "B", "C", "UPPER_EAST", "PLAN"),
    "CITY_ROAD": (
        "STREET_A",
        "STREET_B",
        "OVERPASS_A",
        "OVERPASS_B",
        "TUNNEL_A",
        "TUNNEL_B",
        "DAWN_ROAD_A",
        "DAWN_ROAD_B",
        "ROUTE_PLAN",
    ),
    "HANYU_TOWER": (
        "EXTERIOR",
        "LOBBY_A",
        "LOBBY_B",
        "CONTROL_ROOM",
        "ELEVATOR_SHAFT",
        "ROOFTOP",
        "VERTICAL_ROUTE_PLAN",
    ),
    "HANYU_LAB": ("A", "B", "C", "CONTROL", "PLAN"),
}

CHARACTER_NAMES = {
    "R1": "沈曜",
    "R2": "凌昊",
    "R3": "韩少卿",
}

SEGMENTS = ("A", "B", "C")
DEFAULT_VIDEO_MODEL = "bytedance/seedance-2.0"
_FILE_HASH_CACHE: dict[
    str,
    tuple[tuple[int, int, int, int, int], str],
] = {}
_FILE_HASH_CACHE_LOCK = threading.Lock()


AXIS_GARAGE = (
    ("GARAGE_A",),
    ("GARAGE_B",),
    ("GARAGE_A", "GARAGE_B"),
)
AXIS_INTERIOR = (
    ("INTERIOR_A",),
    ("INTERIOR_B",),
    ("INTERIOR_A", "INTERIOR_B"),
)
AXIS_STREET = (
    ("STREET_A",),
    ("STREET_B",),
    ("STREET_A", "STREET_B"),
)
AXIS_OVERPASS = (
    ("OVERPASS_A",),
    ("OVERPASS_B",),
    ("OVERPASS_A", "OVERPASS_B"),
)
AXIS_TUNNEL = (
    ("TUNNEL_A",),
    ("TUNNEL_B",),
    ("TUNNEL_A", "TUNNEL_B"),
)
AXIS_DAWN_ROAD = (
    ("DAWN_ROAD_A",),
    ("DAWN_ROAD_B",),
    ("DAWN_ROAD_A", "DAWN_ROAD_B"),
)
AXIS_LOBBY = (
    ("LOBBY_A",),
    ("LOBBY_B",),
    ("LOBBY_A", "LOBBY_B"),
)
AXIS_MEDICAL = (
    ("MEDICAL", "A"),
    ("MEDICAL", "B"),
    ("MEDICAL", "C"),
)
AXIS_MEETING = (
    ("MEETING", "A"),
    ("MEETING", "B"),
    ("MEETING", "C"),
)
AXIS_CONTROL_LAB = (
    ("CONTROL", "A"),
    ("CONTROL", "B"),
    ("CONTROL", "C"),
)

# 多区域场景不靠关键词猜测。每个 G 的 A/B/C 都显式绑定导演需参考的
# 功能视图；PLAN 由 scene_view_reference_paths 自动补齐。
SCENE_VIEW_BLUEPRINTS: dict[
    tuple[int, int],
    tuple[tuple[str, ...], tuple[str, ...], tuple[str, ...]],
] = {
    (1, 5): (
        ("SUV_INTERIOR", "GARAGE_A"),
        ("SUV_INTERIOR", "GARAGE_B"),
        ("SUV_INTERIOR", "GARAGE_A", "GARAGE_B"),
    ),
    (1, 6): (
        ("SUV_INTERIOR", "GARAGE_A"),
        ("GARAGE_B",),
        ("GARAGE_A", "GARAGE_B"),
    ),
    (2, 1): AXIS_GARAGE,
    (2, 2): AXIS_GARAGE,
    (2, 3): AXIS_GARAGE,
    (3, 2): (
        ("A",),
        ("UPPER_EAST", "B"),
        ("C",),
    ),
    (3, 4): (
        ("UPPER_EAST", "A"),
        ("UPPER_EAST", "B"),
        ("C",),
    ),
    (4, 1): AXIS_MEDICAL,
    (4, 4): AXIS_INTERIOR,
    (4, 5): AXIS_INTERIOR,
    (4, 6): (
        ("INTERIOR_A",),
        ("INTERIOR_B",),
        ("CONTROL_ROOM",),
    ),
    (5, 5): AXIS_STREET,
    (5, 6): (
        ("CONTROL_ROOM",),
        ("CONTROL_ROOM",),
        ("CONTROL_ROOM",),
    ),
    (6, 2): AXIS_MEETING,
    (7, 1): AXIS_OVERPASS,
    (7, 2): AXIS_OVERPASS,
    (7, 3): AXIS_OVERPASS,
    (7, 4): AXIS_MEDICAL,
    (8, 2): AXIS_MEETING,
    (8, 3): AXIS_MEETING,
    (8, 5): AXIS_MEETING,
    (8, 6): (
        ("MEETING", "A"),
        ("MEETING", "B"),
        ("CONTROL_ROOM",),
    ),
    (9, 4): AXIS_TUNNEL,
    (9, 5): AXIS_OVERPASS,
    (9, 6): AXIS_TUNNEL,
    (10, 3): AXIS_INTERIOR,
    (10, 4): AXIS_INTERIOR,
    (10, 5): AXIS_LOBBY,
    (10, 6): AXIS_INTERIOR,
    (11, 1): (
        ("EXTERIOR",),
        ("EXTERIOR", "LOBBY_A"),
        ("LOBBY_A", "ELEVATOR_SHAFT"),
    ),
    (11, 2): (
        ("ELEVATOR_SHAFT",),
        ("ELEVATOR_SHAFT",),
        ("ELEVATOR_SHAFT",),
    ),
    (11, 3): (
        ("A",),
        ("B",),
        ("CONTROL", "C"),
    ),
    (11, 4): AXIS_CONTROL_LAB,
    (11, 6): AXIS_CONTROL_LAB,
    (12, 1): AXIS_CONTROL_LAB,
    (12, 2): AXIS_CONTROL_LAB,
    (12, 5): (
        ("ROOFTOP",),
        ("ROOFTOP",),
        ("ROOFTOP",),
    ),
    (12, 6): AXIS_DAWN_ROAD,
}


def stable_fingerprint(payload: Any) -> str:
    encoded = json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def file_sha256(path: Path) -> str:
    if not path.exists() or not path.is_file():
        return ""
    cache_key = str(path.resolve())
    for _ in range(2):
        before = path.stat()
        identity = (
            before.st_dev,
            before.st_ino,
            before.st_size,
            before.st_mtime_ns,
            before.st_ctime_ns,
        )
        with _FILE_HASH_CACHE_LOCK:
            cached = _FILE_HASH_CACHE.get(cache_key)
        if cached and cached[0] == identity:
            return cached[1]

        digest = hashlib.sha256()
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                digest.update(chunk)
        after = path.stat()
        after_identity = (
            after.st_dev,
            after.st_ino,
            after.st_size,
            after.st_mtime_ns,
            after.st_ctime_ns,
        )
        if after_identity == identity:
            value = digest.hexdigest()
            with _FILE_HASH_CACHE_LOCK:
                _FILE_HASH_CACHE[cache_key] = (identity, value)
            return value
    raise RuntimeError(f"计算哈希期间文件发生变化：{path}")


def preproduction_spec_fingerprint(group: str, key: str) -> str:
    spec_path = PROJECT_DIR / "PREPRODUCTION_ASSET_SPEC.md"
    return stable_fingerprint({
        "group": group,
        "key": key,
        "spec_sha256": file_sha256(spec_path),
    })


def load_preproduction_approvals() -> dict[str, Any]:
    if not PREPRODUCTION_APPROVALS_PATH.exists():
        return {
            "character_turnarounds": {},
            "scene_packages": {},
        }
    return json.loads(
        PREPRODUCTION_APPROVALS_PATH.read_text(encoding="utf-8")
    )


def load_delivery_approvals() -> dict[str, Any]:
    if not DELIVERY_APPROVALS_PATH.exists():
        return {"video_segments": {}, "episodes": {}}
    return json.loads(DELIVERY_APPROVALS_PATH.read_text(encoding="utf-8"))


def load_video_state() -> dict[str, Any]:
    if not VIDEO_STATE_PATH.exists():
        return {"jobs": {}}
    return json.loads(VIDEO_STATE_PATH.read_text(encoding="utf-8"))


def load_composition_state() -> dict[str, Any]:
    if not COMPOSITION_STATE_PATH.exists():
        return {"episodes": {}}
    return json.loads(
        COMPOSITION_STATE_PATH.read_text(encoding="utf-8")
    )


def resolve_project_path(
    raw_path: str | Path,
    *,
    allowed_root: Path | None = None,
) -> Path:
    """解析项目内路径，并拒绝 ``..``、绝对路径和符号链接逃逸。"""
    candidate = Path(raw_path)
    if not candidate.is_absolute():
        candidate = PROJECT_DIR / candidate
    resolved = candidate.resolve()
    project_root = PROJECT_DIR.resolve()
    try:
        resolved.relative_to(project_root)
    except ValueError as exc:
        raise ValueError(f"路径逃出项目目录：{raw_path}") from exc
    if allowed_root is not None:
        resolved_allowed_root = allowed_root.resolve()
        try:
            resolved.relative_to(resolved_allowed_root)
        except ValueError as exc:
            raise ValueError(
                f"路径不在允许的资产目录：{raw_path}"
            ) from exc
    return resolved


def project_relative(path: Path) -> str:
    resolved = resolve_project_path(path)
    return resolved.relative_to(PROJECT_DIR.resolve()).as_posix()


def safe_scene_candidate_paths(
    record: dict[str, Any],
) -> tuple[dict[str, Path], list[str]]:
    """返回场景包内的安全路径；非法项作为任务 blocker，而不是被上传。"""
    safe_paths: dict[str, Path] = {}
    issues: list[str] = []
    allowed_root = PROJECT_DIR / "assets" / "scenes"
    for view_key, raw_path in (record.get("candidate_views") or {}).items():
        if not isinstance(raw_path, str) or not raw_path.strip():
            issues.append(f"scene_view:{view_key}:path_missing")
            continue
        try:
            safe_paths[view_key] = resolve_project_path(
                raw_path,
                allowed_root=allowed_root,
            )
        except ValueError:
            issues.append(f"scene_view:{view_key}:path_outside_project")
    return safe_paths, issues


def safe_character_identity_detail_paths(
    record: dict[str, Any],
) -> tuple[dict[str, Path], list[str]]:
    """解析角色包身份细节锚，并拒绝越出角色资产目录的路径。"""
    raw_paths = record.get("identity_detail_paths", {})
    if raw_paths is None:
        raw_paths = {}
    if not isinstance(raw_paths, dict):
        return {}, ["identity_details:not_a_mapping"]
    safe_paths: dict[str, Path] = {}
    seen_paths: set[Path] = set()
    issues: list[str] = []
    allowed_root = PROJECT_DIR / "assets" / "characters"
    for role, raw_path in raw_paths.items():
        if (
            not isinstance(role, str)
            or not role.strip()
            or not isinstance(raw_path, str)
            or not raw_path.strip()
        ):
            issues.append("identity_detail:invalid_entry")
            continue
        try:
            resolved = resolve_project_path(
                raw_path,
                allowed_root=allowed_root,
            )
        except ValueError:
            issues.append(
                f"identity_detail:{role}:path_outside_characters"
            )
            continue
        if resolved in seen_paths:
            issues.append(f"identity_detail:{role}:duplicate_path")
            continue
        safe_paths[role] = resolved
        seen_paths.add(resolved)
    return safe_paths, issues


def latest_image_review_passed(
    card: dict[str, Any] | None,
    image_url: str,
    *,
    image_path: Path,
    spec_fingerprint: str,
) -> bool:
    """只接受当前文件哈希和生成规格对应的最后一次 pass。"""
    if not card:
        return False
    metadata = card.get("metadata", {})
    active_image = str(
        metadata.get("active_image")
        or ((card.get("images") or [""])[-1])
    )
    if not active_image or active_image != image_url:
        return False
    matching_reviews = [
        review
        for review in metadata.get("image_reviews") or []
        if review.get("image") == active_image
    ]
    if not matching_reviews:
        return False
    latest = matching_reviews[-1]
    return bool(
        latest.get("verdict") == "pass"
        and latest.get("file_sha256") == file_sha256(image_path)
        and latest.get("spec_fingerprint") == spec_fingerprint
    )


def approval_record_matches(
    approvals: dict[str, Any],
    *,
    group: str,
    key: str,
    path: Path,
) -> bool:
    record = approvals.get(group, {}).get(key, {})
    candidate_paths = [path]
    bundle_complete = path.exists()
    if group == "scene_packages":
        candidate_views = record.get("candidate_views") or {}
        expected_views = set(SCENE_REQUIRED_VIEWS.get(key, ()))
        if (
            not expected_views
            or set(candidate_views) != expected_views
            or set(record.get("required_views") or ()) != expected_views
        ):
            return False
        safe_paths, path_issues = safe_scene_candidate_paths(record)
        if path_issues or set(safe_paths) != expected_views:
            return False
        candidate_paths = [
            safe_paths[view_key]
            for view_key in SCENE_REQUIRED_VIEWS[key]
        ]
        bundle_complete = all(
            candidate_path.exists() and candidate_path.is_file()
            for candidate_path in candidate_paths
        )
    elif group == "character_turnarounds":
        expected_details = CHARACTER_TURNAROUND_IDENTITY_DETAILS.get(
            key,
            {},
        )
        safe_details, path_issues = (
            safe_character_identity_detail_paths(record)
        )
        if path_issues or set(safe_details) != set(expected_details):
            return False
        for role, expected_path in expected_details.items():
            if safe_details[role] != expected_path.resolve():
                return False
        candidate_paths.extend(
            safe_details[role] for role in expected_details
        )
        bundle_complete = all(
            candidate_path.exists() and candidate_path.is_file()
            for candidate_path in candidate_paths
        )
    if not bundle_complete:
        return False
    content_fingerprint = stable_fingerprint([
        {
            "path": project_relative(candidate_path),
            "file_sha256": file_sha256(candidate_path),
        }
        for candidate_path in candidate_paths
    ])
    return bool(
        record.get("status") == "approved"
        and record.get("path") == project_relative(path)
        and bundle_complete
        and record.get("file_sha256") == file_sha256(path)
        and record.get("content_fingerprint")
        == content_fingerprint
        and record.get("spec_fingerprint")
        == preproduction_spec_fingerprint(group, key)
    )


def character_outfit_key(
    character_id: str,
    *,
    scene_id: str,
    battle: bool,
) -> str:
    if battle and "tactical" in CHARACTER_TURNAROUNDS[character_id]:
        return "tactical"
    if character_id == "R2" and scene_id == "APARTMENT":
        return "home"
    if character_id == "R1":
        return "daily"
    return "suit"


def character_turnaround_key(
    character_id: str,
    outfit_key: str,
) -> str:
    return f"{character_id}_{outfit_key}"


def resource_url(path: Path) -> str:
    relative = path.relative_to(PROJECT_DIR).as_posix()
    return f"{RESOURCE_PREFIX}/{relative}"


def existing_urls(paths: list[Path]) -> list[str]:
    return [resource_url(path) for path in paths if path.exists()]


def character_reference_paths(
    character_id: str,
    *,
    scene_id: str,
    battle: bool,
) -> list[Path]:
    outfit_key = character_outfit_key(
        character_id,
        scene_id=scene_id,
        battle=battle,
    )
    turnaround_key = character_turnaround_key(
        character_id,
        outfit_key,
    )
    identity_details = CHARACTER_TURNAROUND_IDENTITY_DETAILS.get(
        turnaround_key,
        {},
    )
    paths = [
        identity_details[role]
        for role in CHARACTER_STORYBOARD_IDENTITY_ROLES
        if role in identity_details
    ]
    if not paths:
        paths.append(CHARACTER_ASSETS[character_id]["face"])
    paths.append(CHARACTER_TURNAROUNDS[character_id][outfit_key])
    return paths


def required_preproduction_assets(
    episode: int,
    g_index: int,
    segment_index: int,
    unit: dict[str, Any],
) -> tuple[list[tuple[str, Path]], tuple[str, Path]]:
    turnarounds: list[tuple[str, Path]] = []
    scene_id = scene_for_segment(
        episode,
        g_index,
        segment_index,
        unit,
    )
    for character_id in characters_for_segment(
        episode,
        g_index,
        segment_index,
        unit,
    ):
        outfit_key = character_outfit_key(
            character_id,
            scene_id=scene_id,
            battle=unit["battle"],
        )
        key = character_turnaround_key(character_id, outfit_key)
        turnarounds.append(
            (key, CHARACTER_TURNAROUNDS[character_id][outfit_key])
        )
    scene = (scene_id, SCENE_ASSETS[scene_id])
    return turnarounds, scene


def scene_plan_view_key(
    scene_id: str,
    selected_views: tuple[str, ...] | list[str],
) -> str:
    if scene_id == "APARTMENT":
        if any(
            key.startswith("GARAGE") or key == "SUV_INTERIOR"
            for key in selected_views
        ):
            return "GARAGE_PLAN"
        return "INTERIOR_PLAN"
    if scene_id == "CITY_ROAD":
        return "ROUTE_PLAN"
    if scene_id == "HANYU_TOWER":
        return "VERTICAL_ROUTE_PLAN"
    return "PLAN"


def scene_view_reference_paths(
    approvals: dict[str, Any],
    *,
    scene_id: str,
    unit: dict[str, Any],
    segment_index: int,
    episode: int | None = None,
    g_index: int | None = None,
) -> list[tuple[str, Path]]:
    """为当前镜头选择场景包视图；最多四张，始终包含对应 PLAN。"""
    record = approvals.get("scene_packages", {}).get(scene_id, {})
    candidate_paths, _ = safe_scene_candidate_paths(record)
    if not candidate_paths:
        return [("A", SCENE_ASSETS[scene_id])]

    segment = SEGMENTS[segment_index]
    shots = unit.get("shots") or []
    context = (
        str(shots[segment_index])
        if segment_index < len(shots)
        else ""
    )
    selected: list[str] = []

    def add(key: str) -> None:
        if key in candidate_paths and key not in selected:
            selected.append(key)

    def add_axis(prefix: str) -> None:
        if segment == "A":
            add(f"{prefix}_A")
        elif segment == "B":
            add(f"{prefix}_B")
        else:
            add(f"{prefix}_A")
            add(f"{prefix}_B")

    def add_plan() -> None:
        add(scene_plan_view_key(scene_id, selected))

    blueprint = (
        SCENE_VIEW_BLUEPRINTS.get((episode, g_index))
        if episode is not None and g_index is not None
        else None
    )
    if blueprint is not None:
        requested_views = blueprint[segment_index]
        for key in requested_views:
            add(key)
        add_plan()
        return [
            (view_key, candidate_paths[view_key])
            for view_key in selected[:4]
        ]

    if scene_id == "LAB":
        add(segment)
        if unit.get("battle") and segment == "C":
            add("D")
        add("PLAN")
    elif scene_id == "OFFICE":
        if any(
            keyword in context
            for keyword in ("医疗", "治疗", "止血", "修复", "伤口")
        ):
            add("MEDICAL")
        elif any(
            keyword in context
            for keyword in ("会议", "合同", "法务", "签字", "董事", "协议")
        ):
            add("MEETING")
        add(segment)
        add("PLAN")
    elif scene_id == "ROOFTOP":
        if segment == "A":
            add("A")
        elif segment == "B":
            add("B")
        else:
            add("C_LEFT")
            add("C_RIGHT")
        add("PLAN")
    elif scene_id == "APARTMENT":
        if any(
            keyword in context
            for keyword in ("SUV", "车厢", "驾驶", "副驾驶", "车内")
        ):
            add("SUV_INTERIOR")
            add_axis("GARAGE")
            add("GARAGE_PLAN")
        elif any(
            keyword in context
            for keyword in ("车库", "车位", "停车", "袭击者", "坡道")
        ):
            add_axis("GARAGE")
            add("GARAGE_PLAN")
        else:
            add_axis("INTERIOR")
            add("INTERIOR_PLAN")
    elif scene_id == "WAREHOUSE":
        if any(
            keyword in context
            for keyword in ("楼梯", "高处", "上层", "货架顶", "平台")
        ):
            add("UPPER_EAST")
        add(segment)
        add("PLAN")
    elif scene_id == "CITY_ROAD":
        if any(
            keyword in context
            for keyword in ("隧道", "服务通道", "维护通道", "防火门")
        ):
            route_prefix = "TUNNEL"
        elif any(
            keyword in context
            for keyword in ("黎明", "清晨", "日出", "离城", "驶远")
        ):
            route_prefix = "DAWN_ROAD"
        elif any(
            keyword in context
            for keyword in ("高架", "追车", "SUV", "护栏")
        ):
            route_prefix = "OVERPASS"
        else:
            route_prefix = "STREET"
        add_axis(route_prefix)
        add("ROUTE_PLAN")
    elif scene_id == "HANYU_TOWER":
        if any(
            keyword in context
            for keyword in ("电梯井", "竖井", "维修梯", "攀爬")
        ):
            add("ELEVATOR_SHAFT")
        elif any(
            keyword in context
            for keyword in ("控制室", "总控", "断电", "服务器")
        ):
            add("CONTROL_ROOM")
        elif any(
            keyword in context
            for keyword in ("屋顶", "楼顶", "外墙", "救援")
        ):
            add("ROOFTOP")
        elif any(
            keyword in context
            for keyword in ("台阶", "楼前", "大门", "摩托", "外立面")
        ):
            add("EXTERIOR")
        else:
            add("LOBBY_A" if segment != "B" else "LOBBY_B")
        add("VERTICAL_ROUTE_PLAN")
    elif scene_id == "HANYU_LAB":
        if any(
            keyword in context
            for keyword in ("控制", "终端", "上传", "屏幕", "服务器")
        ):
            add("CONTROL")
        add(segment)
        add("PLAN")

    if not selected:
        add(next(iter(candidate_paths)))
    if not any(
        key.endswith("PLAN") or key == "PLAN"
        for key in selected
    ):
        add_plan()
    return [
        (view_key, candidate_paths[view_key])
        for view_key in selected[:4]
    ]


def build_storyboard_job(
    episode: int,
    g_index: int,
    segment_index: int,
    unit: dict[str, Any],
    *,
    card: dict[str, Any] | None,
    approvals: dict[str, Any],
) -> dict[str, Any]:
    segment = SEGMENTS[segment_index]
    output_path = (
        STORYBOARD_DIR
        / f"EP{episode:02d}_G{g_index:02d}_{segment}.png"
    )
    output_url = resource_url(output_path)
    references: list[Path] = []
    roles: list[str] = []
    turnarounds, (scene_id, scene_path) = required_preproduction_assets(
        episode,
        g_index,
        segment_index,
        unit,
    )
    character_ids = characters_for_segment(
        episode,
        g_index,
        segment_index,
        unit,
    )
    image_index = 1
    blocked_dependencies: list[str] = []
    for character_id in character_ids:
        outfit_key = character_outfit_key(
            character_id,
            scene_id=scene_id,
            battle=unit["battle"],
        )
        turnaround_path = CHARACTER_TURNAROUNDS[character_id][outfit_key]
        turnaround_key = character_turnaround_key(
            character_id,
            outfit_key,
        )
        identity_details = CHARACTER_TURNAROUND_IDENTITY_DETAILS.get(
            turnaround_key,
            {},
        )
        reference_specs: list[tuple[Path, str]] = []
        if identity_details:
            role_labels = {
                "front_identity": "严格正面身份与固定标记",
                "right_marker_closeup": "解剖右侧身份与固定标记",
            }
            reference_specs.extend(
                (
                    identity_details[role],
                    role_labels[role],
                )
                for role in CHARACTER_STORYBOARD_IDENTITY_ROLES
                if role in identity_details
            )
        else:
            reference_specs.append(
                (
                    CHARACTER_ASSETS[character_id]["face"],
                    "面部身份",
                )
            )
        reference_specs.append(
            (turnaround_path, f"{outfit_key}服装三视图")
        )
        for path, role in reference_specs:
            if path not in references:
                references.append(path)
                roles.append(
                    f"Image {image_index}："
                    f"{CHARACTER_NAMES[character_id]}批准的{role}"
                )
                image_index += 1
        if not approval_record_matches(
            approvals,
            group="character_turnarounds",
            key=turnaround_key,
            path=turnaround_path,
        ):
            blocked_dependencies.append(
                f"character_turnaround:{turnaround_key}:not_approved"
            )
    scene_record = approvals.get("scene_packages", {}).get(scene_id, {})
    safe_scene_paths, scene_path_issues = safe_scene_candidate_paths(
        scene_record
    )
    blocked_dependencies.extend(
        f"scene_package:{scene_id}:{issue}"
        for issue in scene_path_issues
    )
    scene_blueprint = SCENE_VIEW_BLUEPRINTS.get((episode, g_index))
    if scene_blueprint is not None:
        expected_views = list(scene_blueprint[segment_index])
        expected_views.append(
            scene_plan_view_key(scene_id, expected_views)
        )
        blocked_dependencies.extend(
            f"scene_package:{scene_id}:view:{view_key}:missing"
            for view_key in expected_views
            if view_key not in safe_scene_paths
        )
    scene_references = scene_view_reference_paths(
        approvals,
        scene_id=scene_id,
        unit=unit,
        segment_index=segment_index,
        episode=episode,
        g_index=g_index,
    )
    for view_key, reference_path in scene_references:
        if reference_path in references:
            continue
        references.append(reference_path)
        roles.append(
            f"Image {image_index}：批准的{scene_id}场景包"
            f"{view_key}视图"
        )
        image_index += 1
    if not approval_record_matches(
        approvals,
        group="scene_packages",
        key=scene_id,
        path=scene_path,
    ):
        blocked_dependencies.append(
            f"scene_package:{scene_id}:not_approved"
        )
    if card is None:
        blocked_dependencies.append("storyboard_card:missing")

    dialogue = unit["dialogue"][segment_index] or "无台词"
    prompt = (
        "Use case: identity-preserve\n"
        "Asset type: 《铁心恋人》真人竖屏漫剧逐镜导演分镜定稿图\n"
        f"Input images: {'；'.join(roles)}。\n"
        f"Primary request: {unit['shots'][segment_index]}。\n"
        f"Characters: 本镜角色为"
        f"{'、'.join(CHARACTER_NAMES[item] for item in character_ids)}；"
        "严格锁定批准面部身份、三视图中的头身比、发型与本场服装。\n"
        f"Scene/backdrop: {SCENE_ANCHORS[scene_id]}；必须服从批准场景包的"
        "空间结构、出入口、180度轴线和主光方向。\n"
        f"Composition/framing: {unit['camera'][segment_index]}；"
        "单张9:16画面只表达一个清楚的镜头动作，站位、视线、前中后景和"
        "动作方向必须可供后续首帧与5秒视频复现。\n"
        f"Lighting/mood: {unit['mood']}；一个明确环境主光，剧情异色克制。\n"
        "Style/medium: 电影级真人预演分镜帧，真实中国都市、真实皮肤和材质，"
        "不是草图、漫画格或概念拼贴。\n"
        f"Dialogue intent: {dialogue}。\n"
        "Constraints: 不新增角色或道具；脸、发型、服装、身高关系、左右站位、"
        "伤势、手持物、出入口与相邻镜头连续；手指和人体结构正确；"
        "无文字、字幕、标志、水印。\n"
        "Avoid: 三宫格、同图多镜、动漫、插画、塑料磨皮、无来源霓虹、"
        "悬浮界面、服装漂移、空间轴线翻转、重复肢体。"
    )
    spec_fingerprint = stable_fingerprint({
        "schema": "tiexin-storyboard-v1",
        "episode": episode,
        "g_index": g_index,
        "segment": segment,
        "prompt": prompt,
        "references": [
            {
                "path": project_relative(path),
                "file_sha256": file_sha256(path),
            }
            for path in references
        ],
        "required_turnarounds": [key for key, _ in turnarounds],
        "required_scene_package": scene_id,
        "required_scene_views": [
            view_key for view_key, _ in scene_references
        ],
    })
    review_passed = latest_image_review_passed(
        card,
        output_url,
        image_path=output_path,
        spec_fingerprint=spec_fingerprint,
    )
    approved = bool(
        output_path.exists()
        and not blocked_dependencies
        and review_passed
    )
    return {
        "job_id": (
            f"EP{episode:02d}_G{g_index:02d}_{segment}_STORYBOARD"
        ),
        "episode": episode,
        "g_unit": f"G{g_index}",
        "segment": segment,
        "subshot": f"G{g_index}-S{segment_index + 1}",
        "scene_id": scene_id,
        "character_ids": character_ids,
        "storyboard_card_id": card.get("card_id") if card else None,
        "prompt": prompt,
        "reference_paths": [str(path) for path in references],
        "scene_reference_paths": [
            str(path) for _, path in scene_references
        ],
        "output_path": str(output_path),
        "resource_url": output_url,
        "status": "present" if output_path.exists() else "pending",
        "present": output_path.exists(),
        "file_sha256": file_sha256(output_path),
        "spec_fingerprint": spec_fingerprint,
        "approved": approved,
        "ready_for_generation": (
            not output_path.exists() and not blocked_dependencies
        ),
        "blocked_dependencies": blocked_dependencies,
        "required_turnarounds": [key for key, _ in turnarounds],
        "required_scene_package": scene_id,
        "required_scene_views": [
            view_key for view_key, _ in scene_references
        ],
    }


def build_frame_job(
    episode: int,
    g_index: int,
    unit: dict[str, Any],
    *,
    storyboard_jobs: list[dict[str, Any]],
    card: dict[str, Any] | None,
) -> dict[str, Any]:
    scene_id = scene_for_segment(episode, g_index, 0, unit)
    character_ids = characters_for_segment(
        episode,
        g_index,
        0,
        unit,
    )
    references: list[Path] = []
    roles: list[str] = []
    image_index = 1
    for character_id in character_ids:
        for path in character_reference_paths(
            character_id,
            scene_id=scene_id,
            battle=unit["battle"],
        ):
            if path not in references:
                references.append(path)
                kind = (
                    "面部身份"
                    if "_face" in path.stem
                    else "批准服装三视图"
                )
                roles.append(
                    f"Image {image_index}：{CHARACTER_NAMES[character_id]}的批准{kind}母版"
                )
                image_index += 1
    storyboard_a = next(
        job for job in storyboard_jobs if job["segment"] == "A"
    )
    for view_key, raw_path in zip(
        storyboard_a["required_scene_views"],
        storyboard_a["scene_reference_paths"],
        strict=True,
    ):
        scene_reference_path = Path(raw_path)
        if scene_reference_path in references:
            continue
        references.append(scene_reference_path)
        roles.append(
            f"Image {image_index}：批准的{scene_id}场景包"
            f"{view_key}视图"
        )
        image_index += 1
    storyboard_a_path = Path(storyboard_a["output_path"])
    references.append(storyboard_a_path)
    roles.append(
        f"Image {image_index}：批准的"
        f"EP{episode:02d} G{g_index}-S1逐镜分镜图"
    )

    output_path = FRAME_DIR / f"EP{episode:02d}_G{g_index:02d}.png"
    character_names = "、".join(
        CHARACTER_NAMES[character_id] for character_id in character_ids
    )
    person_count = len(character_ids)
    style = (
        "电影级真人竖屏短剧，神颜级商业主演选角，现代都市动作爱情与克制近未来科技，"
        "高识别度精致骨相、自然皮肤和真实材质，实景光源，画面干净通透"
    )
    prompt = (
        "Use case: identity-preserve\n"
        "Asset type: 《铁心恋人》竖屏9:16真人短剧G单元首帧\n"
        f"Input images: {'；'.join(roles)}。\n"
        f"Primary request: {unit['shots'][0]}。\n"
        f"Characters: 本镜主要角色为{character_names}；严格沿用参考图的人脸、发型、"
        "身材比例和本场服装，不重新设计人物。\n"
        f"Scene/backdrop: {SCENE_ANCHORS[scene_id]}；空间结构沿用场景参考。\n"
        f"Composition/framing: {unit['camera'][0]}；先保证动作意图、人物轮廓、"
        "视线和空间方向清楚，前中后景有层次。\n"
        f"Lighting/mood: {unit['mood']}；一个明确主光源，冷蓝或警报红只在剧情需要时出现。\n"
        f"Style/medium: {style}，35mm电影摄影，自然景深，清晰五官和肢体结构。\n"
        f"Constraints: 画面中批准主角数量不超过{person_count}人；若动作提到画外敌人，"
        "仅用枪口、影子或环境反应表达；角色身份稳定，手指和关节正确，"
        "不添加无关角色、文字、标志或水印。\n"
        "Avoid: 动漫、插画、游戏渲染、塑料磨皮、无来源霓虹、悬浮界面、"
        "死黑阴影、重复肢体、夸张盔甲。"
    )
    blocked_dependencies: list[str] = []
    for job in storyboard_jobs:
        if not job["present"]:
            blocked_dependencies.append(
                f"storyboard:{job['segment']}:missing"
            )
        elif not job["approved"]:
            blocked_dependencies.append(
                f"storyboard:{job['segment']}:not_approved"
            )
        blocked_dependencies.extend(
            f"storyboard:{job['segment']}:{dependency}"
            for dependency in job["blocked_dependencies"]
        )
    if card is None:
        blocked_dependencies.append("first_frame_card:missing")
    output_url = resource_url(output_path)
    spec_fingerprint = stable_fingerprint({
        "schema": "tiexin-first-frame-v1",
        "episode": episode,
        "g_index": g_index,
        "prompt": prompt,
        "references": [
            {
                "path": project_relative(path),
                "file_sha256": file_sha256(path),
            }
            for path in references
        ],
        "storyboard_specs": [
            job["spec_fingerprint"] for job in storyboard_jobs
        ],
    })
    review_passed = latest_image_review_passed(
        card,
        output_url,
        image_path=output_path,
        spec_fingerprint=spec_fingerprint,
    )
    approved = bool(
        output_path.exists()
        and not blocked_dependencies
        and review_passed
    )
    return {
        "job_id": f"EP{episode:02d}_G{g_index:02d}",
        "episode": episode,
        "g_unit": f"G{g_index}",
        "scene_id": scene_id,
        "character_ids": character_ids,
        "prompt": prompt,
        "reference_paths": [str(path) for path in references],
        "output_path": str(output_path),
        "resource_url": output_url,
        "status": "present" if output_path.exists() else "pending",
        "present": output_path.exists(),
        "file_sha256": file_sha256(output_path),
        "spec_fingerprint": spec_fingerprint,
        "approved": approved,
        "ready_for_generation": (
            not output_path.exists() and not blocked_dependencies
        ),
        "blocked_dependencies": blocked_dependencies,
        "storyboard_dependencies": [
            job["job_id"] for job in storyboard_jobs
        ],
    }


def build_video_job(
    episode: int,
    g_index: int,
    segment_index: int,
    unit: dict[str, Any],
    *,
    storyboard_jobs: list[dict[str, Any]],
    frame_job: dict[str, Any],
    video_card: dict[str, Any] | None,
    delivery_approvals: dict[str, Any],
    video_state: dict[str, Any],
    video_model: str = DEFAULT_VIDEO_MODEL,
) -> dict[str, Any]:
    segment = SEGMENTS[segment_index]
    scene_id = scene_for_segment(
        episode,
        g_index,
        segment_index,
        unit,
    )
    character_ids = characters_for_segment(
        episode,
        g_index,
        segment_index,
        unit,
    )
    storyboard_job = next(
        job for job in storyboard_jobs if job["segment"] == segment
    )
    output_path = VIDEO_DIR / f"EP{episode:02d}_G{g_index:02d}_{segment}.mp4"
    frame_path = FRAME_DIR / f"EP{episode:02d}_G{g_index:02d}.png"
    if segment_index == 0:
        input_path = frame_path
        input_strategy = "g_unit_first_frame"
    else:
        previous_index = segment_index - 1
        previous_scene_id = scene_for_segment(
            episode,
            g_index,
            previous_index,
            unit,
        )
        previous_character_ids = characters_for_segment(
            episode,
            g_index,
            previous_index,
            unit,
        )
        if (
            scene_id != previous_scene_id
            or character_ids != previous_character_ids
        ):
            input_path = Path(storyboard_job["output_path"])
            input_strategy = "approved_segment_storyboard_cut"
        else:
            previous = SEGMENTS[previous_index]
            input_path = VIDEO_END_DIR / (
                f"EP{episode:02d}_G{g_index:02d}_{previous}_end.png"
            )
            input_strategy = "previous_segment_last_frame"

    dialogue = unit["dialogue"][segment_index]
    speech = (
        f"人物自然说出：“{dialogue.split('：', 1)[-1]}”，语气克制，口型同步。"
        if dialogue
        else "本段无对白，以环境音和动作音推进。"
    )
    prompt = (
        f"竖屏9:16真人短剧，5秒单镜头。{unit['camera'][segment_index]}。"
        f"{unit['shots'][segment_index]}。{speech}"
        f"本段角色：{'、'.join(CHARACTER_NAMES[item] for item in character_ids)}；"
        f"场景：{SCENE_ANCHORS[scene_id]}。"
        f"声音：{unit['sound']}。"
        "沿用输入首帧中的人物身份、发型、服装、伤势、手持物、空间方向和主光；"
        "动作从首帧自然连续发生，幅度克制，身体部位运动链清楚；"
        "镜头运动平稳且只有一种；真人皮肤与真实材质，五官清楚，"
        "人体比例自然，画面稳定干净，末帧停在动作完成后的稳定姿态。"
    )
    prompt_fingerprint = hashlib.sha256(
        prompt.encode("utf-8")
    ).hexdigest()
    blocked_dependencies = [
        f"storyboard:{job['segment']}:not_approved"
        for job in storyboard_jobs
        if not job["approved"]
    ]
    if not frame_job["approved"]:
        blocked_dependencies.append("first_frame:not_approved")
    video_metadata = (
        video_card.get("metadata", {}) if video_card else {}
    )
    if video_metadata.get("video_review_status") != "approved":
        blocked_dependencies.append("video_prompt:not_approved")
    elif (
        (video_metadata.get("video_review_fingerprints") or {}).get(
            segment
        )
        != prompt_fingerprint
    ):
        blocked_dependencies.append("video_prompt:approval_stale")
    job_id = f"EP{episode:02d}_G{g_index:02d}_{segment}"
    job_version_payload = {
        "schema": "tiexin-video-segment-v1",
        "job_id": job_id,
        "video_model": video_model,
        "prompt_fingerprint": prompt_fingerprint,
        "input_path": project_relative(input_path),
        "input_file_sha256": file_sha256(input_path),
        "storyboard_spec_fingerprint": storyboard_job[
            "spec_fingerprint"
        ],
        "storyboard_file_sha256": storyboard_job["file_sha256"],
        "first_frame_spec_fingerprint": frame_job[
            "spec_fingerprint"
        ],
        "first_frame_file_sha256": frame_job["file_sha256"],
    }
    job_version_fingerprint = stable_fingerprint(job_version_payload)
    output_sha256 = file_sha256(output_path)
    state_record = (
        video_state.get("jobs", {}).get(job_id, {})
    )
    current_version = bool(
        output_path.exists()
        and state_record.get("job_version_fingerprint")
        == job_version_fingerprint
        and state_record.get("output_file_sha256")
        == output_sha256
    )
    approval_record = (
        delivery_approvals.get("video_segments", {}).get(job_id, {})
    )
    approved = bool(
        current_version
        and not blocked_dependencies
        and approval_record.get("status") == "approved"
        and approval_record.get("path") == project_relative(output_path)
        and approval_record.get("file_sha256") == output_sha256
        and approval_record.get("job_version_fingerprint")
        == job_version_fingerprint
    )
    return {
        "job_id": job_id,
        "episode": episode,
        "g_unit": f"G{g_index}",
        "segment": segment,
        "scene_id": scene_id,
        "character_ids": character_ids,
        "prompt": prompt,
        "prompt_fingerprint": prompt_fingerprint,
        "job_version_payload": job_version_payload,
        "job_version_fingerprint": job_version_fingerprint,
        "input_path": str(input_path),
        "input_strategy": input_strategy,
        "output_path": str(output_path),
        "resource_url": resource_url(output_path),
        "storyboard_path": storyboard_job["output_path"],
        "storyboard_job_id": storyboard_job["job_id"],
        "seedance_input": {
            "model": video_model,
            "prompt": prompt,
            "image": str(input_path),
            "duration": 5,
            "ratio": "9:16",
            "resolution": "720p",
            "generate_audio": True,
            "watermark": False,
            "safety_filter": True,
            "seed": -1,
        },
        "status": (
            "generated"
            if current_version
            else ("stale" if output_path.exists() else "pending")
        ),
        "present": output_path.exists(),
        "current_version": current_version,
        "file_sha256": output_sha256,
        "approved": approved,
        "ready_for_generation": (
            not current_version and not blocked_dependencies
        ),
        "blocked_dependencies": blocked_dependencies,
    }


def build_manifest(
    *,
    video_model: str = DEFAULT_VIDEO_MODEL,
) -> dict[str, Any]:
    if sorted(EPISODES) != list(range(1, 13)):
        raise RuntimeError("生产规格错误：集数必须严格为 EP01–EP12")
    if any(len(data.get("beats") or []) != 6 for data in EPISODES.values()):
        raise RuntimeError("生产规格错误：每集必须严格包含 6 个 G 单元")
    cards = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    approvals = load_preproduction_approvals()
    delivery_approvals = load_delivery_approvals()
    video_state = load_video_state()
    composition_state = load_composition_state()
    storyboard_cards = {
        (
            card.get("episode"),
            card.get("metadata", {}).get("unit_number"),
            card.get("metadata", {}).get("segment"),
        ): card
        for card in cards
        if card.get("stage") == "storyboard"
    }
    frame_cards = {
        (card.get("episode"), card.get("shot_number")): card
        for card in cards
        if card.get("stage") == "img_prompt"
    }
    video_cards = {
        (card.get("episode"), card.get("shot_number")): card
        for card in cards
        if card.get("stage") == "vid_prompt"
    }

    storyboard_jobs: list[dict[str, Any]] = []
    storyboards_by_g: dict[
        tuple[int, int],
        list[dict[str, Any]],
    ] = {}
    for episode, data in sorted(EPISODES.items()):
        for g_index, unit in enumerate(data["beats"], 1):
            jobs = []
            for segment_index, segment in enumerate(SEGMENTS):
                job = build_storyboard_job(
                    episode,
                    g_index,
                    segment_index,
                    unit,
                    card=storyboard_cards.get(
                        (episode, g_index, segment)
                    ),
                    approvals=approvals,
                )
                jobs.append(job)
                storyboard_jobs.append(job)
            storyboards_by_g[(episode, g_index)] = jobs

    frame_jobs: list[dict[str, Any]] = []
    video_jobs: list[dict[str, Any]] = []
    for episode, data in sorted(EPISODES.items()):
        for g_index, unit in enumerate(data["beats"], 1):
            storyboard_group = storyboards_by_g[(episode, g_index)]
            frame_job = build_frame_job(
                episode,
                g_index,
                unit,
                storyboard_jobs=storyboard_group,
                card=frame_cards.get((episode, g_index)),
            )
            frame_jobs.append(frame_job)
            for segment_index in range(3):
                video_jobs.append(
                    build_video_job(
                        episode,
                        g_index,
                        segment_index,
                        unit,
                        storyboard_jobs=storyboard_group,
                        frame_job=frame_job,
                        video_card=video_cards.get((episode, g_index)),
                        delivery_approvals=delivery_approvals,
                        video_state=video_state,
                        video_model=video_model,
                    )
                )

    if len(storyboard_jobs) != 216:
        raise RuntimeError(
            f"生产规格错误：逐镜分镜任务应为216，实际{len(storyboard_jobs)}"
        )
    if len(frame_jobs) != 72:
        raise RuntimeError(
            f"生产规格错误：首帧任务应为72，实际{len(frame_jobs)}"
        )
    if len(video_jobs) != 216:
        raise RuntimeError(
            f"生产规格错误：视频任务应为216，实际{len(video_jobs)}"
        )

    episode_jobs = []
    for episode in sorted(EPISODES):
        output_path = EPISODE_DIR / f"EP{episode:02d}.mp4"
        episode_video_jobs = [
            job
            for job in video_jobs
            if job["episode"] == episode
        ]
        episode_video_jobs.sort(
            key=lambda job: (
                int(job["g_unit"][1:]),
                job["segment"],
            )
        )
        if len(episode_video_jobs) != 18:
            raise RuntimeError(
                f"生产规格错误：EP{episode:02d} 应有18个视频段，"
                f"实际{len(episode_video_jobs)}"
            )
        dependency_payload = [
            {
                "job_id": job["job_id"],
                "job_version_fingerprint": job[
                    "job_version_fingerprint"
                ],
                "file_sha256": job["file_sha256"],
                "current_version": job["current_version"],
                "approved": job["approved"],
            }
            for job in episode_video_jobs
        ]
        dependency_fingerprint = stable_fingerprint(dependency_payload)
        output_sha256 = file_sha256(output_path)
        episode_key = f"EP{episode:02d}"
        composition_record = (
            composition_state.get("episodes", {}).get(episode_key, {})
        )
        present = output_path.exists()
        current_version = bool(
            present
            and composition_record.get("dependency_fingerprint")
            == dependency_fingerprint
            and composition_record.get("output_file_sha256")
            == output_sha256
        )
        approval_record = (
            delivery_approvals.get("episodes", {}).get(episode_key, {})
        )
        approved = bool(
            current_version
            and all(
                job["current_version"] and job["approved"]
                for job in episode_video_jobs
            )
            and approval_record.get("status") == "approved"
            and approval_record.get("path")
            == project_relative(output_path)
            and approval_record.get("file_sha256") == output_sha256
            and approval_record.get("dependency_fingerprint")
            == dependency_fingerprint
        )
        episode_jobs.append(
            {
                "episode": episode,
                "output_path": str(output_path),
                "resource_url": resource_url(output_path),
                "expected_duration_seconds": 90,
                "dependency_payload": dependency_payload,
                "dependency_fingerprint": dependency_fingerprint,
                "file_sha256": output_sha256,
                "present": present,
                "current_version": current_version,
                "approved": approved,
                "status": (
                    "approved"
                    if approved
                    else (
                        "generated"
                        if current_version
                        else ("stale" if present else "pending")
                    )
                ),
            }
        )

    return {
        "project_id": "tiexin-s1",
        "production_spec": {
            "aspect_ratio": "9:16",
            "episodes": 12,
            "episode_duration_seconds": 90,
            "g_units": 72,
            "character_turnarounds": 6,
            "scene_packages": 8,
            "storyboard_images": 216,
            "frame_images": 72,
            "video_segments": 216,
            "segment_duration_seconds": 5,
            "video_resolution": "720p",
            "video_model": video_model,
            "generate_audio": True,
        },
        "character_assets": {
            character_id: {
                key: str(value)
                for key, value in assets.items()
                if key != "title"
            }
            for character_id, assets in CHARACTER_ASSETS.items()
        },
        "character_turnarounds": {
            character_id: {
                key: str(path)
                for key, path in assets.items()
            }
            for character_id, assets in CHARACTER_TURNAROUNDS.items()
        },
        "scene_assets": {
            scene_id: str(path) for scene_id, path in SCENE_ASSETS.items()
        },
        "preproduction_approvals_path": str(
            PREPRODUCTION_APPROVALS_PATH
        ),
        "storyboard_jobs": storyboard_jobs,
        "frame_jobs": frame_jobs,
        "video_jobs": video_jobs,
        "episode_jobs": episode_jobs,
    }


def sync_cards(manifest: dict[str, Any]) -> int:
    cards = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    preproduction_approvals = load_preproduction_approvals()
    storyboard_by_key = {
        (
            job["episode"],
            int(job["g_unit"][1:]),
            job["segment"],
        ): job
        for job in manifest["storyboard_jobs"]
    }
    frame_by_key = {
        (job["episode"], int(job["g_unit"][1:])): job
        for job in manifest["frame_jobs"]
    }
    videos_by_key: dict[tuple[int, int], list[dict[str, Any]]] = {}
    for job in manifest["video_jobs"]:
        key = (job["episode"], int(job["g_unit"][1:]))
        videos_by_key.setdefault(key, []).append(job)
    episode_by_number = {
        job["episode"]: job for job in manifest["episode_jobs"]
    }

    changed = 0
    for card in cards:
        new_images = list(card.get("images", []))
        new_videos = list(card.get("videos", []))
        metadata = dict(card.get("metadata", {}))
        new_status = card.get("status", "pending")

        if card.get("stage") == "setting":
            r_id = metadata.get("r_id")
            scene_id = metadata.get("scene_id")
            if r_id in CHARACTER_ASSETS:
                paths = [
                    path
                    for key, path in CHARACTER_ASSETS[r_id].items()
                    if key != "title" and isinstance(path, Path)
                ]
                paths.extend(CHARACTER_TURNAROUNDS[r_id].values())
                new_images = existing_urls(paths)
                character_records = preproduction_approvals.get(
                    "character_turnarounds",
                    {},
                )
                character_statuses = [
                    character_records.get(
                        character_turnaround_key(r_id, outfit_key),
                        {},
                    ).get("status", "missing")
                    for outfit_key in CHARACTER_TURNAROUNDS[r_id]
                ]
                metadata["preproduction_status"] = (
                    "approved"
                    if character_statuses
                    and all(status == "approved" for status in character_statuses)
                    else "candidate"
                )
            elif scene_id in SCENE_ASSETS:
                scene_record = preproduction_approvals.get(
                    "scene_packages",
                    {},
                ).get(scene_id, {})
                candidate_views = scene_record.get("candidate_views", {})
                scene_paths = [
                    PROJECT_DIR / relative_path
                    for relative_path in candidate_views.values()
                    if relative_path
                ]
                new_images = existing_urls(
                    scene_paths or [SCENE_ASSETS[scene_id]]
                )
                metadata["preproduction_status"] = scene_record.get(
                    "status",
                    "incomplete",
                )

        episode = card.get("episode")
        shot_number = card.get("shot_number")
        if card.get("stage") == "storyboard" and episode:
            unit_number = metadata.get("unit_number")
            segment = metadata.get("segment")
            job = storyboard_by_key.get(
                (episode, unit_number, segment)
            )
            if job:
                storyboard_path = Path(job["output_path"])
                new_images = existing_urls([storyboard_path])
                metadata["generation_spec_fingerprint"] = job[
                    "spec_fingerprint"
                ]
                metadata["scene_id"] = job["scene_id"]
                metadata["characters"] = list(job["character_ids"])
                metadata["required_scene_views"] = list(
                    job["required_scene_views"]
                )
                metadata["media_status"] = (
                    "present"
                    if storyboard_path.exists()
                    else "pending"
                )
                if new_images:
                    metadata["active_image"] = new_images[-1]
                    new_status = (
                        "done" if job["approved"] else "review"
                    )
                else:
                    new_status = "pending"

        if card.get("stage") == "img_prompt" and episode and shot_number:
            frame_job = frame_by_key[(episode, shot_number)]
            frame_path = Path(frame_job["output_path"])
            new_images = existing_urls([frame_path])
            metadata["generation_spec_fingerprint"] = frame_job[
                "spec_fingerprint"
            ]
            metadata["scene_id"] = frame_job["scene_id"]
            metadata["characters"] = list(frame_job["character_ids"])
            metadata["media_status"] = (
                "present" if frame_path.exists() else "pending"
            )
            if new_images:
                metadata["active_image"] = new_images[-1]
                new_status = (
                    "done" if frame_job["approved"] else "review"
                )
            else:
                new_status = "pending"

        if card.get("stage") == "vid_prompt" and episode and shot_number:
            jobs = sorted(
                videos_by_key[(episode, shot_number)],
                key=lambda job: job["segment"],
            )
            new_videos = existing_urls(
                [
                    Path(job["output_path"])
                    for job in jobs
                    if job["current_version"]
                ]
            )
            current_segments = sum(
                job["current_version"] for job in jobs
            )
            metadata["media_status"] = (
                "generated"
                if current_segments == 3
                else f"pending_{3 - current_segments}"
            )
            metadata["generated_segments"] = current_segments
            metadata["video_model"] = manifest["production_spec"][
                "video_model"
            ]
            metadata["segment_scenes"] = [
                job["scene_id"] for job in jobs
            ]
            metadata["segment_characters"] = [
                list(job["character_ids"]) for job in jobs
            ]

        if card.get("stage") == "script" and episode:
            episode_job = episode_by_number[episode]
            episode_path = Path(episode_job["output_path"])
            new_videos = (
                existing_urls([episode_path])
                if episode_job["current_version"]
                else []
            )
            episode_media_status = (
                "approved"
                if episode_job["approved"]
                else (
                    "generated"
                    if episode_job["current_version"]
                    else (
                        "stale"
                        if episode_job["present"]
                        else "pending"
                    )
                )
            )
            metadata["media_status"] = episode_media_status
            metadata["episode_media_status"] = episode_media_status

        if (
            new_images != card.get("images", [])
            or new_videos != card.get("videos", [])
            or metadata != card.get("metadata", {})
            or new_status != card.get("status")
        ):
            card["images"] = new_images
            card["videos"] = new_videos
            card["metadata"] = metadata
            card["status"] = new_status
            changed += 1

    if changed:
        CARDS_PATH.write_text(
            json.dumps(cards, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return changed


def build_status(manifest: dict[str, Any], cards_changed: int) -> dict[str, Any]:
    character_files = [
        value
        for assets in CHARACTER_ASSETS.values()
        for key, value in assets.items()
        if key != "title" and isinstance(value, Path)
    ]
    scene_files = list(SCENE_ASSETS.values())
    approvals = load_preproduction_approvals()
    turnaround_files = [
        (character_turnaround_key(character_id, outfit_key), path)
        for character_id, assets in CHARACTER_TURNAROUNDS.items()
        for outfit_key, path in assets.items()
    ]
    status = {
        "project_id": "tiexin-s1",
        "characters": {
            "expected": len(character_files),
            "generated": sum(path.exists() for path in character_files),
        },
        "character_turnarounds": {
            "expected": len(turnaround_files),
            "generated": sum(
                path.exists() for _, path in turnaround_files
            ),
            "approved": sum(
                approval_record_matches(
                    approvals,
                    group="character_turnarounds",
                    key=key,
                    path=path,
                )
                for key, path in turnaround_files
            ),
        },
        "scenes": {
            "expected": len(scene_files),
            "generated": sum(path.exists() for path in scene_files),
        },
        "scene_packages": {
            "expected": len(scene_files),
            "approved": sum(
                approval_record_matches(
                    approvals,
                    group="scene_packages",
                    key=scene_id,
                    path=path,
                )
                for scene_id, path in SCENE_ASSETS.items()
            ),
        },
        "storyboards": {
            "expected": len(manifest["storyboard_jobs"]),
            "generated": sum(
                job["present"]
                for job in manifest["storyboard_jobs"]
            ),
            "approved": sum(
                job["approved"]
                for job in manifest["storyboard_jobs"]
            ),
            "ready_for_generation": sum(
                job["ready_for_generation"]
                for job in manifest["storyboard_jobs"]
            ),
        },
        "frames": {
            "expected": len(manifest["frame_jobs"]),
            "generated": sum(
                job["present"] for job in manifest["frame_jobs"]
            ),
            "approved": sum(
                job["approved"] for job in manifest["frame_jobs"]
            ),
            "ready_for_generation": sum(
                job["ready_for_generation"]
                for job in manifest["frame_jobs"]
            ),
        },
        "video_segments": {
            "expected": len(manifest["video_jobs"]),
            "generated": sum(
                job["current_version"] for job in manifest["video_jobs"]
            ),
            "present": sum(
                job["present"] for job in manifest["video_jobs"]
            ),
            "approved": sum(
                job["approved"] for job in manifest["video_jobs"]
            ),
            "ready_for_generation": sum(
                job["ready_for_generation"]
                for job in manifest["video_jobs"]
            ),
        },
        "episodes": {
            "expected": 12,
            "present": sum(
                job["present"] for job in manifest["episode_jobs"]
            ),
            "current": sum(
                job["current_version"] for job in manifest["episode_jobs"]
            ),
            "approved": sum(
                job["approved"] for job in manifest["episode_jobs"]
            ),
        },
        "cards_changed": cards_changed,
        "external_generation_gate": {
            "belt_balance_usd": 0.0,
            "provider": "openrouter",
            "material_upload": "requires_explicit_user_authorization",
            "billing": "requires_confirmed_available_credit",
        },
    }
    return status


def write_manifest_and_status(
    *,
    video_model: str = DEFAULT_VIDEO_MODEL,
) -> tuple[dict[str, Any], dict[str, Any]]:
    for directory in (
        CHARACTER_DIR,
        TURNAROUND_DIR,
        SCENE_DIR,
        STORYBOARD_DIR,
        FRAME_DIR,
        VIDEO_DIR,
        VIDEO_END_DIR,
        EPISODE_DIR,
        QA_DIR,
    ):
        directory.mkdir(parents=True, exist_ok=True)

    manifest = build_manifest(video_model=video_model)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    cards_changed = sync_cards(manifest)
    status = build_status(manifest, cards_changed)
    STATUS_PATH.write_text(
        json.dumps(status, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return manifest, status


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--emit-pending-storyboards",
        type=int,
        default=0,
        metavar="N",
        help="输出下一批前置资产已审核通过的逐镜分镜任务",
    )
    parser.add_argument(
        "--emit-pending-frames",
        type=int,
        default=0,
        metavar="N",
        help="输出下一批 N 个待生成首帧任务的紧凑 JSON",
    )
    parser.add_argument(
        "--emit-pending-videos",
        type=int,
        default=0,
        metavar="N",
        help="输出下一批输入已就绪的视频任务",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    manifest, status = write_manifest_and_status()

    if args.emit_pending_storyboards:
        jobs = [
            job
            for job in manifest["storyboard_jobs"]
            if job["status"] == "pending"
            and job["ready_for_generation"]
        ][: args.emit_pending_storyboards]
        print(json.dumps(jobs, ensure_ascii=False))
        return

    if args.emit_pending_frames:
        jobs = [
            job
            for job in manifest["frame_jobs"]
            if job["status"] == "pending"
            and job["ready_for_generation"]
        ][: args.emit_pending_frames]
        print(json.dumps(jobs, ensure_ascii=False))
        return

    if args.emit_pending_videos:
        jobs = [
            job
            for job in manifest["video_jobs"]
            if job["status"] == "pending"
            and job["ready_for_generation"]
            and Path(job["input_path"]).exists()
        ][: args.emit_pending_videos]
        print(json.dumps(jobs, ensure_ascii=False))
        return

    print(json.dumps(status, ensure_ascii=False))


if __name__ == "__main__":
    main()
