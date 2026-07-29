"""验收《铁心恋人》第一季本地媒体文件，并输出机器可读报告。"""

from __future__ import annotations

import json
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from PIL import Image

from prepare_tiexin_media import (
    CHARACTER_ASSETS,
    CHARACTER_TURNAROUND_IDENTITY_DETAILS,
    CHARACTER_TURNAROUNDS,
    QA_DIR,
    SCENE_ASSETS,
    SCENE_REQUIRED_VIEWS,
    file_sha256,
    load_preproduction_approvals,
    safe_character_identity_detail_paths,
    safe_scene_candidate_paths,
    write_manifest_and_status,
)


REPORT_PATH = QA_DIR / "validation.json"
PORTRAIT_ASPECT_RATIO = 9 / 16
PORTRAIT_ASPECT_TOLERANCE = 0.01
MIN_STATIC_DIMENSION = 720
MIN_PORTRAIT_HEIGHT = 1280

FINAL_APPROVAL_REQUIREMENTS = {
    "character_turnarounds": 6,
    "scene_packages": 8,
    "storyboards": 216,
    "frames": 72,
    "video_segments": 216,
    "episodes": 12,
}


def probe(path: Path) -> dict[str, Any]:
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        raise RuntimeError("本机未安装 ffprobe")
    completed = subprocess.run(
        [
            ffprobe,
            "-v",
            "error",
            "-show_streams",
            "-show_format",
            "-of",
            "json",
            str(path),
        ],
        capture_output=True,
        text=True,
        timeout=60,
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr[-800:].strip() or "ffprobe 失败")
    return json.loads(completed.stdout)


def media_facts(path: Path) -> dict[str, Any]:
    data = probe(path)
    streams = data.get("streams") or []
    video = next(
        (item for item in streams if item.get("codec_type") == "video"),
        {},
    )
    duration = data.get("format", {}).get("duration")
    return {
        "path": str(path),
        "size_bytes": path.stat().st_size,
        "width": int(video.get("width") or 0),
        "height": int(video.get("height") or 0),
        "duration_seconds": round(float(duration), 3) if duration else None,
        "has_audio": any(
            item.get("codec_type") == "audio" for item in streams
        ),
    }


def image_facts(path: Path) -> dict[str, Any]:
    """用 Pillow 校验静态图片，避免把 ffprobe 作为图片验收前置条件。"""
    with Image.open(path) as image:
        width, height = image.size
        image_format = image.format
        image_mode = image.mode
        frame_count = int(getattr(image, "n_frames", 1))
        is_animated = bool(getattr(image, "is_animated", False))
        image.seek(0)
        image.load()
    return {
        "path": str(path),
        "size_bytes": path.stat().st_size,
        "width": int(width),
        "height": int(height),
        "format": image_format,
        "mode": image_mode,
        "frame_count": frame_count,
        "is_animated": is_animated,
        "duration_seconds": None,
        "has_audio": False,
    }


def check_image(path: Path, *, require_portrait: bool) -> dict[str, Any]:
    facts = image_facts(path)
    errors = []
    if facts["width"] <= 0 or facts["height"] <= 0:
        errors.append("无法读取图片尺寸")
    if facts["format"] != "PNG":
        errors.append(
            f"静态资产必须为真实 PNG，而不是 {facts['format'] or '未知格式'}"
        )
    if facts["is_animated"] or facts["frame_count"] != 1:
        errors.append("静态资产不能是动画图片")
    if min(facts["width"], facts["height"]) < MIN_STATIC_DIMENSION:
        errors.append(
            f"静态资产短边低于 {MIN_STATIC_DIMENSION}px"
        )
    if require_portrait and facts["width"] >= facts["height"]:
        errors.append("首帧不是竖屏")
    if require_portrait:
        aspect_ratio = facts["width"] / facts["height"]
        if abs(aspect_ratio - PORTRAIT_ASPECT_RATIO) > (
            PORTRAIT_ASPECT_TOLERANCE
        ):
            errors.append("竖屏图片画幅不是 9:16")
        if facts["height"] < MIN_PORTRAIT_HEIGHT:
            errors.append(
                f"竖屏图片高度低于 {MIN_PORTRAIT_HEIGHT}px"
            )
    return {**facts, "valid": not errors, "errors": errors}


def check_turnaround_image(path: Path) -> dict[str, Any]:
    """检查三视图设定板的基础技术形态；语义一致性仍须人工审核。"""
    result = check_image(path, require_portrait=False)
    errors = list(result["errors"])
    if result["width"] <= result["height"]:
        errors.append("角色三视图设定板必须为横向画布")
    return {**result, "valid": not errors, "errors": errors}


def check_video(
    path: Path,
    *,
    min_duration: float,
    max_duration: float,
    require_audio: bool,
) -> dict[str, Any]:
    facts = media_facts(path)
    errors = []
    duration = facts["duration_seconds"]
    if facts["width"] != 720 or facts["height"] != 1280:
        errors.append(
            f"分辨率不是 720×1280，而是 {facts['width']}×{facts['height']}"
        )
    if duration is None or not min_duration <= duration <= max_duration:
        errors.append(f"时长不在 {min_duration}–{max_duration} 秒")
    if require_audio and not facts["has_audio"]:
        errors.append("缺少音轨")
    return {**facts, "valid": not errors, "errors": errors}


def validate_group(
    paths: list[Path],
    checker,
) -> dict[str, Any]:
    results = []
    missing = []
    for path in paths:
        if not path.exists():
            missing.append(str(path))
            continue
        try:
            results.append(checker(path))
        except Exception as exc:
            results.append({
                "path": str(path),
                "valid": False,
                "errors": [str(exc)],
            })
    return {
        "expected": len(paths),
        "present": len(results),
        "valid": sum(item["valid"] for item in results),
        "missing": missing,
        "invalid": [item for item in results if not item["valid"]],
        "files": results,
    }


def validate_scene_package_views(
    approvals: dict[str, Any],
) -> dict[str, Any]:
    """逐文件验证所有场景包视图，并拒绝缺图、越界路径和重复视图。"""
    results: list[dict[str, Any]] = []
    missing: list[str] = []
    invalid: list[dict[str, Any]] = []
    packages: dict[str, Any] = {}
    expected_count = 0

    for scene_id, required_views in SCENE_REQUIRED_VIEWS.items():
        expected_count += len(required_views)
        record = (
            approvals.get("scene_packages", {}).get(scene_id, {})
        )
        package_errors: list[str] = []
        if tuple(record.get("required_views") or ()) != required_views:
            package_errors.append("required_views 与正式规格不一致")
        if set(record.get("candidate_views") or {}) != set(required_views):
            package_errors.append("candidate_views 与正式规格不一致")
        if not any("PLAN" in view for view in required_views):
            package_errors.append("正式规格缺少 PLAN/路线俯视图")

        safe_paths, path_issues = safe_scene_candidate_paths(record)
        package_errors.extend(path_issues)
        file_hashes: dict[str, str] = {}
        package_results: list[dict[str, Any]] = []

        for view_key in required_views:
            path = safe_paths.get(view_key)
            if path is None:
                missing.append(f"{scene_id}:{view_key}:path_missing")
                continue
            if not path.exists() or not path.is_file():
                missing.append(str(path))
                continue
            try:
                checked = {
                    **check_image(path, require_portrait=False),
                    "scene_id": scene_id,
                    "view": view_key,
                }
            except Exception as exc:
                checked = {
                    "path": str(path),
                    "scene_id": scene_id,
                    "view": view_key,
                    "valid": False,
                    "errors": [str(exc)],
                }
            results.append(checked)
            package_results.append(checked)
            if not checked["valid"]:
                invalid.append(checked)
            file_hashes[view_key] = file_sha256(path)

        views_by_hash: dict[str, list[str]] = {}
        for view_key, digest in file_hashes.items():
            views_by_hash.setdefault(digest, []).append(view_key)
        duplicate_groups = [
            views
            for views in views_by_hash.values()
            if len(views) > 1
        ]
        if duplicate_groups:
            package_errors.extend(
                f"不同视图使用了同一文件内容：{', '.join(views)}"
                for views in duplicate_groups
            )

        if package_errors:
            invalid.append({
                "path": scene_id,
                "scene_id": scene_id,
                "valid": False,
                "errors": package_errors,
            })
        packages[scene_id] = {
            "expected_views": list(required_views),
            "present": len(package_results),
            "valid_files": sum(
                bool(item["valid"]) for item in package_results
            ),
            "duplicate_view_groups": duplicate_groups,
            "errors": package_errors,
        }

    return {
        "expected": expected_count,
        "present": len(results),
        "valid": sum(bool(item["valid"]) for item in results),
        "missing": missing,
        "invalid": invalid,
        "files": results,
        "packages": packages,
    }


def validate_character_identity_details(
    approvals: dict[str, Any],
) -> dict[str, Any]:
    """逐角色服装包验证身份细节锚；跨服装包共享同一身份锚是合法的。"""
    results: list[dict[str, Any]] = []
    missing: list[str] = []
    invalid: list[dict[str, Any]] = []
    packages: dict[str, Any] = {}
    expected_count = 0

    turnaround_keys = [
        f"{character_id}_{outfit_key}"
        for character_id, outfits in CHARACTER_TURNAROUNDS.items()
        for outfit_key in outfits
    ]
    for turnaround_key in turnaround_keys:
        expected_details = CHARACTER_TURNAROUND_IDENTITY_DETAILS.get(
            turnaround_key,
            {},
        )
        expected_count += len(expected_details)
        record = (
            approvals.get("character_turnarounds", {})
            .get(turnaround_key, {})
        )
        package_errors: list[str] = []
        raw_details = record.get("identity_detail_paths", {})
        if raw_details is None:
            raw_details = {}
        if not isinstance(raw_details, dict):
            package_errors.append("identity_detail_paths 必须是角色到路径的映射")
            raw_details = {}
        if set(raw_details) != set(expected_details):
            package_errors.append("身份细节角色集合与正式规格不一致")

        safe_paths, path_issues = safe_character_identity_detail_paths(record)
        package_errors.extend(path_issues)
        file_hashes: dict[str, str] = {}
        package_results: list[dict[str, Any]] = []

        for role, expected_path in expected_details.items():
            path = safe_paths.get(role)
            if path is None:
                missing.append(
                    f"{turnaround_key}:{role}:path_missing"
                )
                continue
            if path != expected_path.resolve():
                package_errors.append(
                    f"{role} 路径与正式规格不一致"
                )
            if not path.exists() or not path.is_file():
                missing.append(str(path))
                continue
            try:
                checked = {
                    **check_image(path, require_portrait=True),
                    "turnaround_key": turnaround_key,
                    "role": role,
                }
            except Exception as exc:
                checked = {
                    "path": str(path),
                    "turnaround_key": turnaround_key,
                    "role": role,
                    "valid": False,
                    "errors": [str(exc)],
                }
            results.append(checked)
            package_results.append(checked)
            if not checked["valid"]:
                invalid.append(checked)
            file_hashes[role] = file_sha256(path)

        roles_by_hash: dict[str, list[str]] = {}
        for role, digest in file_hashes.items():
            roles_by_hash.setdefault(digest, []).append(role)
        duplicate_groups = [
            roles
            for roles in roles_by_hash.values()
            if len(roles) > 1
        ]
        if duplicate_groups:
            package_errors.extend(
                "同一角色包的不同身份细节角色使用了同一文件内容："
                + ", ".join(roles)
                for roles in duplicate_groups
            )

        if package_errors:
            invalid.append({
                "path": turnaround_key,
                "turnaround_key": turnaround_key,
                "valid": False,
                "errors": package_errors,
            })
        packages[turnaround_key] = {
            "expected_roles": list(expected_details),
            "present": len(package_results),
            "valid_files": sum(
                bool(item["valid"]) for item in package_results
            ),
            "duplicate_role_groups": duplicate_groups,
            "errors": package_errors,
        }

    return {
        "expected": expected_count,
        "present": len(results),
        "valid": sum(bool(item["valid"]) for item in results),
        "missing": missing,
        "invalid": invalid,
        "files": results,
        "packages": packages,
    }


def build_approval_gate_summary(
    manifest: dict[str, Any],
    media_status: dict[str, Any],
) -> dict[str, Any]:
    """汇总最终交付硬门禁；依赖诊断不重复计入审批缺口。"""
    storyboard_jobs = manifest.get("storyboard_jobs") or []
    frame_jobs = manifest.get("frame_jobs") or []
    video_jobs = manifest.get("video_jobs") or []
    episode_jobs = manifest.get("episode_jobs") or []

    inventories = {
        "character_turnarounds": int(
            media_status.get("character_turnarounds", {}).get(
                "expected", 0
            )
        ),
        "scene_packages": int(
            media_status.get("scene_packages", {}).get("expected", 0)
        ),
        "storyboards": len(storyboard_jobs),
        "frames": len(frame_jobs),
        "video_segments": len(video_jobs),
        "episodes": len(episode_jobs),
    }
    approved = {
        "character_turnarounds": int(
            media_status.get("character_turnarounds", {}).get(
                "approved", 0
            )
        ),
        "scene_packages": int(
            media_status.get("scene_packages", {}).get("approved", 0)
        ),
        "storyboards": sum(
            bool(job.get("approved")) for job in storyboard_jobs
        ),
        "frames": sum(
            bool(job.get("approved")) for job in frame_jobs
        ),
        "video_segments": sum(
            bool(job.get("current_version"))
            and bool(job.get("approved"))
            for job in video_jobs
        ),
        "episodes": sum(
            bool(job.get("current_version"))
            and bool(job.get("approved"))
            for job in episode_jobs
        ),
    }

    gates = {}
    for key, expected in FINAL_APPROVAL_REQUIREMENTS.items():
        actual = approved[key]
        inventory = inventories[key]
        gates[key] = {
            "expected": expected,
            "inventory": inventory,
            "approved_current": actual,
            "approval_gap": max(0, expected - actual),
            "approval_excess": max(0, actual - expected),
            "inventory_gap": max(0, expected - inventory),
            "inventory_excess": max(0, inventory - expected),
            "satisfied": actual == expected and inventory == expected,
        }

    dependency_diagnostics = {
        "storyboard_jobs_blocked": sum(
            bool(job.get("blocked_dependencies"))
            for job in storyboard_jobs
        ),
        "frame_jobs_blocked": sum(
            bool(job.get("blocked_dependencies"))
            for job in frame_jobs
        ),
        "video_jobs_blocked": sum(
            bool(job.get("blocked_dependencies"))
            for job in video_jobs
        ),
        "episode_jobs_blocked": sum(
            bool(job.get("blocked_dependencies"))
            for job in episode_jobs
        ),
        "video_dependency_references": sum(
            len(job.get("blocked_dependencies") or [])
            for job in video_jobs
        ),
    }
    dependency_issue_count = sum(
        count
        for key, count in dependency_diagnostics.items()
        if key.endswith("_jobs_blocked")
    )
    approval_gaps = {
        key: gate["approval_gap"] for key, gate in gates.items()
    }
    approval_excesses = {
        key: gate["approval_excess"] for key, gate in gates.items()
    }
    inventory_mismatches = {
        key: gate["inventory_gap"] + gate["inventory_excess"]
        for key, gate in gates.items()
    }
    return {
        "satisfied": (
            all(gate["satisfied"] for gate in gates.values())
            and dependency_issue_count == 0
        ),
        "gates": gates,
        "approval_gaps": approval_gaps,
        "approval_gap_count": sum(approval_gaps.values()),
        "approval_excesses": approval_excesses,
        "approval_excess_count": sum(approval_excesses.values()),
        "inventory_mismatches": inventory_mismatches,
        "inventory_mismatch_count": sum(inventory_mismatches.values()),
        "dependency_diagnostics": dependency_diagnostics,
        "dependency_issue_count": dependency_issue_count,
    }


def main() -> None:
    manifest, media_status = write_manifest_and_status()
    preproduction_approvals = load_preproduction_approvals()
    character_paths = [
        value
        for assets in CHARACTER_ASSETS.values()
        for key, value in assets.items()
        if key != "title" and isinstance(value, Path)
    ]
    scene_paths = list(SCENE_ASSETS.values())
    turnaround_paths = [
        path
        for assets in CHARACTER_TURNAROUNDS.values()
        for path in assets.values()
    ]
    storyboard_paths = [
        Path(job["output_path"])
        for job in manifest["storyboard_jobs"]
    ]
    frame_paths = [Path(job["output_path"]) for job in manifest["frame_jobs"]]
    video_paths = [Path(job["output_path"]) for job in manifest["video_jobs"]]
    episode_paths = [
        Path(job["output_path"]) for job in manifest["episode_jobs"]
    ]

    groups = {
        "characters": validate_group(
            character_paths,
            lambda path: check_image(path, require_portrait=False),
        ),
        "character_turnarounds": validate_group(
            turnaround_paths,
            check_turnaround_image,
        ),
        "character_identity_details": validate_character_identity_details(
            preproduction_approvals
        ),
        "scenes": validate_group(
            scene_paths,
            lambda path: check_image(path, require_portrait=True),
        ),
        "scene_package_views": validate_scene_package_views(
            preproduction_approvals
        ),
        "storyboards": validate_group(
            storyboard_paths,
            lambda path: check_image(path, require_portrait=True),
        ),
        "frames": validate_group(
            frame_paths,
            lambda path: check_image(path, require_portrait=True),
        ),
        "video_segments": validate_group(
            video_paths,
            lambda path: check_video(
                path,
                min_duration=4.0,
                max_duration=6.5,
                require_audio=True,
            ),
        ),
        "episodes": validate_group(
            episode_paths,
            lambda path: check_video(
                path,
                min_duration=85.0,
                max_duration=95.5,
                require_audio=True,
            ),
        ),
    }
    invalid_count = sum(
        len(group["invalid"]) for group in groups.values()
    )
    missing_count = sum(
        len(group["missing"]) for group in groups.values()
    )
    approval_gate = build_approval_gate_summary(manifest, media_status)
    approval_gaps = approval_gate["approval_gaps"]
    approval_gap_count = approval_gate["approval_gap_count"]
    hard_gate_error = bool(
        approval_gate["approval_excess_count"]
        or approval_gate["inventory_mismatch_count"]
    )
    report = {
        "project_id": "tiexin-s1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "result": (
            "fail"
            if invalid_count or hard_gate_error
            else (
                "partial"
                if (
                    missing_count
                    or not approval_gate["satisfied"]
                )
                else "pass"
            )
        ),
        "invalid_count": invalid_count,
        "missing_count": missing_count,
        "approval_gap_count": approval_gap_count,
        "approval_gaps": approval_gaps,
        "approval_gate": approval_gate,
        "media_status": media_status,
        "groups": groups,
        "review_checklist": [
            "每套角色服装必须有正面、严格90度侧面和背面三视图并批准当前版本",
            "每个场景包必须证明正反打、180度轴线、出入口和主光方向",
            "216张逐镜分镜当前版本逐张通过后，才允许生成首帧",
            "角色脸、发型、服装和固定面部标记跨镜一致",
            "A→B→C 的空间方向、持物、伤势与主光连续",
            "口型与中文对白同步，环境音不过载",
            "无水印、乱码、无关人物、重复肢体和明显穿模",
            "沈曜保持行动权，凌昊的情绪递进符合剧本弧线",
        ],
        "review_policy": (
            "检查清单文字不构成交付批准；只有上方六项硬门禁的"
            "当前文件哈希与规格指纹审批全部精确满足，才可通过。"
        ),
    }
    QA_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({
        "result": report["result"],
        "invalid_count": invalid_count,
        "missing_count": missing_count,
        "approval_gap_count": approval_gap_count,
        "report": str(REPORT_PATH),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
