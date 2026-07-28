"""《铁心恋人》前期视觉资产和媒体闸门回归测试。"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = ROOT / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from complete_tiexin_s1 import PROJECT_DIR  # noqa: E402
import prepare_tiexin_media as media_prep  # noqa: E402
import validate_tiexin_media as media_validator  # noqa: E402
from prepare_tiexin_media import (  # noqa: E402
    build_manifest,
    file_sha256,
    latest_image_review_passed,
)
from validate_tiexin_media import (  # noqa: E402
    build_approval_gate_summary,
)


def test_storyboards_are_one_shot_per_card() -> None:
    cards = json.loads(
        (PROJECT_DIR / "cards.json").read_text(encoding="utf-8")
    )
    storyboards = [
        card for card in cards if card.get("stage") == "storyboard"
    ]

    assert len(storyboards) == 216
    assert {
        card["metadata"]["segment"] for card in storyboards
    } == {"A", "B", "C"}
    assert all(
        card["metadata"]["shot_count"] == 1
        and card["metadata"]["duration_seconds"] == 5
        and card["metadata"]["storyboard_schema_version"]
        == "3.0-one-shot-per-card"
        for card in storyboards
    )
    assert len({
        (
            card["episode"],
            card["metadata"]["unit_number"],
            card["metadata"]["segment"],
        )
        for card in storyboards
    }) == 216


def test_manifest_has_exact_media_job_inventory() -> None:
    manifest = build_manifest()

    assert len(manifest["storyboard_jobs"]) == 216
    assert len(manifest["frame_jobs"]) == 72
    assert len(manifest["video_jobs"]) == 216
    assert len(manifest["episode_jobs"]) == 12
    assert all(
        len(job["storyboard_dependencies"]) == 3
        for job in manifest["frame_jobs"]
    )


def test_storyboard_scene_references_use_functional_view_and_plan() -> None:
    approvals = media_prep.load_preproduction_approvals()
    unit = {
        "mood": "雨夜撤离",
        "shots": [
            "SUV停在地下车库，沈曜打开驾驶门",
            "凌昊从副驾驶位扫描车厢",
            "车辆驶向出口坡道",
        ],
    }

    selected = media_prep.scene_view_reference_paths(
        approvals,
        scene_id="APARTMENT",
        unit=unit,
        segment_index=0,
    )

    assert [key for key, _ in selected] == [
        "SUV_INTERIOR",
        "GARAGE_A",
        "GARAGE_PLAN",
    ]


def test_storyboard_scene_blueprint_is_bound_per_segment() -> None:
    manifest = build_manifest()

    tower_break_in = {
        job["segment"]: job
        for job in manifest["storyboard_jobs"]
        if job["episode"] == 11 and job["g_unit"] == "G1"
    }
    assert tower_break_in["A"]["required_scene_views"] == [
        "EXTERIOR",
        "VERTICAL_ROUTE_PLAN",
    ]
    assert tower_break_in["B"]["required_scene_views"] == [
        "EXTERIOR",
        "LOBBY_A",
        "VERTICAL_ROUTE_PLAN",
    ]
    assert tower_break_in["C"]["required_scene_views"] == [
        "LOBBY_A",
        "ELEVATOR_SHAFT",
        "VERTICAL_ROUTE_PLAN",
    ]

    overpass_continuation = [
        job
        for job in manifest["storyboard_jobs"]
        if job["episode"] == 7 and job["g_unit"] == "G2"
    ]
    assert all(
        any(view.startswith("OVERPASS_") for view in job["required_scene_views"])
        for job in overpass_continuation
    )
    assert all(
        not any(view.startswith("STREET_") for view in job["required_scene_views"])
        for job in overpass_continuation
    )


def test_cross_scene_cut_has_own_scene_characters_and_video_input() -> None:
    manifest = build_manifest()
    storyboards = {
        job["job_id"]: job for job in manifest["storyboard_jobs"]
    }
    videos = {job["job_id"]: job for job in manifest["video_jobs"]}

    apartment_a = storyboards["EP04_G06_A_STORYBOARD"]
    tower_c = storyboards["EP04_G06_C_STORYBOARD"]
    assert apartment_a["scene_id"] == "APARTMENT"
    assert apartment_a["character_ids"] == ["R2"]
    assert tower_c["scene_id"] == "HANYU_TOWER"
    assert tower_c["character_ids"] == ["R3"]
    assert tower_c["required_scene_views"] == [
        "CONTROL_ROOM",
        "VERTICAL_ROUTE_PLAN",
    ]

    video_c = videos["EP04_G06_C"]
    assert video_c["scene_id"] == "HANYU_TOWER"
    assert video_c["character_ids"] == ["R3"]
    assert video_c["input_strategy"] == "approved_segment_storyboard_cut"
    assert video_c["input_path"] == tower_c["output_path"]


def test_video_model_is_part_of_job_and_episode_version() -> None:
    default_manifest = build_manifest(video_model="model-a")
    changed_manifest = build_manifest(video_model="model-b")

    default_video = default_manifest["video_jobs"][0]
    changed_video = changed_manifest["video_jobs"][0]
    assert default_video["job_version_payload"]["video_model"] == "model-a"
    assert changed_video["job_version_payload"]["video_model"] == "model-b"
    assert (
        default_video["job_version_fingerprint"]
        != changed_video["job_version_fingerprint"]
    )
    assert (
        default_manifest["episode_jobs"][0]["dependency_fingerprint"]
        != changed_manifest["episode_jobs"][0]["dependency_fingerprint"]
    )
    assert all(
        {"current_version", "approved"} <= set(dependency)
        for dependency in default_manifest["episode_jobs"][0][
            "dependency_payload"
        ]
    )


def test_video_delivery_approval_cannot_override_upstream_blocker(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(media_prep, "PROJECT_DIR", tmp_path)
    monkeypatch.setattr(media_prep, "FRAME_DIR", tmp_path / "assets" / "frames")
    monkeypatch.setattr(media_prep, "VIDEO_DIR", tmp_path / "assets" / "videos")
    monkeypatch.setattr(
        media_prep,
        "VIDEO_END_DIR",
        tmp_path / "assets" / "video_ends",
    )
    media_prep.FRAME_DIR.mkdir(parents=True)
    media_prep.VIDEO_DIR.mkdir(parents=True)
    frame_path = media_prep.FRAME_DIR / "EP01_G01.png"
    frame_path.write_bytes(b"approved-frame-bytes")
    output_path = media_prep.VIDEO_DIR / "EP01_G01_A.mp4"
    output_path.write_bytes(b"current-video-bytes")
    storyboard_jobs = [
        {
            "segment": segment,
            "job_id": f"EP01_G01_{segment}",
            "output_path": str(
                tmp_path
                / "assets"
                / "storyboards"
                / f"EP01_G01_{segment}.png"
            ),
            "approved": True,
            "spec_fingerprint": f"storyboard-{segment}",
            "file_sha256": f"hash-{segment}",
        }
        for segment in ("A", "B", "C")
    ]
    frame_job = {
        "approved": False,
        "spec_fingerprint": "frame-spec",
        "file_sha256": media_prep.file_sha256(frame_path),
    }
    unit = {
        "scene": "LAB",
        "characters": ["R1"],
        "battle": False,
        "dialogue": ["", "", ""],
        "camera": ["中景固定", "中景固定", "中景固定"],
        "shots": ["动作A", "动作B", "动作C"],
        "sound": "环境音",
    }
    first = media_prep.build_video_job(
        1,
        1,
        0,
        unit,
        storyboard_jobs=storyboard_jobs,
        frame_job=frame_job,
        video_card={},
        delivery_approvals={},
        video_state={},
    )
    video_card = {
        "metadata": {
            "video_review_status": "approved",
            "video_review_fingerprints": {
                "A": first["prompt_fingerprint"],
            },
        },
    }
    output_sha256 = media_prep.file_sha256(output_path)
    video_state = {
        "jobs": {
            first["job_id"]: {
                "job_version_fingerprint": first[
                    "job_version_fingerprint"
                ],
                "output_file_sha256": output_sha256,
            },
        },
    }
    delivery_approvals = {
        "video_segments": {
            first["job_id"]: {
                "status": "approved",
                "path": media_prep.project_relative(output_path),
                "file_sha256": output_sha256,
                "job_version_fingerprint": first[
                    "job_version_fingerprint"
                ],
            },
        },
    }

    job = media_prep.build_video_job(
        1,
        1,
        0,
        unit,
        storyboard_jobs=storyboard_jobs,
        frame_job=frame_job,
        video_card=video_card,
        delivery_approvals=delivery_approvals,
        video_state=video_state,
    )

    assert job["current_version"]
    assert job["blocked_dependencies"] == ["first_frame:not_approved"]
    assert not job["approved"]


def test_scene_package_approval_requires_every_declared_view(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(media_prep, "PROJECT_DIR", tmp_path)
    monkeypatch.setattr(
        media_prep,
        "SCENE_REQUIRED_VIEWS",
        {"TEST_SCENE": ("A", "B")},
    )
    (tmp_path / "PREPRODUCTION_ASSET_SPEC.md").write_text(
        "test spec",
        encoding="utf-8",
    )
    a_path = tmp_path / "assets" / "scenes" / "a.png"
    b_path = tmp_path / "assets" / "scenes" / "b.png"
    a_path.parent.mkdir(parents=True)
    a_path.write_bytes(b"a")
    b_path.write_bytes(b"b")

    record = {
        "path": "assets/scenes/a.png",
        "status": "approved",
        "required_views": ["A", "B"],
        "candidate_views": {"A": "assets/scenes/a.png"},
        "file_sha256": media_prep.file_sha256(a_path),
    }
    approvals = {"scene_packages": {"TEST_SCENE": record}}
    assert not media_prep.approval_record_matches(
        approvals,
        group="scene_packages",
        key="TEST_SCENE",
        path=a_path,
    )

    record["candidate_views"]["B"] = "assets/scenes/b.png"
    candidate_paths = [a_path, b_path]
    record["content_fingerprint"] = media_prep.stable_fingerprint([
        {
            "path": media_prep.project_relative(path),
            "file_sha256": media_prep.file_sha256(path),
        }
        for path in candidate_paths
    ])
    record["spec_fingerprint"] = media_prep.preproduction_spec_fingerprint(
        "scene_packages",
        "TEST_SCENE",
    )
    assert media_prep.approval_record_matches(
        approvals,
        group="scene_packages",
        key="TEST_SCENE",
        path=a_path,
    )

    b_path.unlink()
    assert not media_prep.approval_record_matches(
        approvals,
        group="scene_packages",
        key="TEST_SCENE",
        path=a_path,
    )


def test_scene_candidate_path_cannot_escape_project(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(media_prep, "PROJECT_DIR", tmp_path)
    outside = tmp_path.parent / "outside-scene.png"
    outside.write_bytes(b"outside")
    record = {
        "candidate_views": {
            "A": "../outside-scene.png",
        },
    }

    safe_paths, issues = media_prep.safe_scene_candidate_paths(record)

    assert safe_paths == {}
    assert issues == ["scene_view:A:path_outside_project"]


def test_scene_package_view_validation_rejects_duplicate_content(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(media_prep, "PROJECT_DIR", tmp_path)
    monkeypatch.setattr(
        media_validator,
        "SCENE_REQUIRED_VIEWS",
        {"TEST_SCENE": ("A", "B", "PLAN")},
    )
    monkeypatch.setattr(
        media_validator,
        "check_image",
        lambda path, *, require_portrait: {
            "path": str(path),
            "size_bytes": path.stat().st_size,
            "width": 1024,
            "height": 1536,
            "valid": True,
            "errors": [],
        },
    )
    scene_dir = tmp_path / "assets" / "scenes"
    scene_dir.mkdir(parents=True)
    a_path = scene_dir / "a.png"
    b_path = scene_dir / "b.png"
    plan_path = scene_dir / "plan.png"
    a_path.write_bytes(b"same-view")
    b_path.write_bytes(b"same-view")
    plan_path.write_bytes(b"distinct-plan")
    approvals = {
        "scene_packages": {
            "TEST_SCENE": {
                "required_views": ["A", "B", "PLAN"],
                "candidate_views": {
                    "A": "assets/scenes/a.png",
                    "B": "assets/scenes/b.png",
                    "PLAN": "assets/scenes/plan.png",
                },
            },
        },
    }

    result = media_validator.validate_scene_package_views(approvals)

    assert result["expected"] == 3
    assert result["present"] == 3
    assert result["missing"] == []
    assert result["packages"]["TEST_SCENE"][
        "duplicate_view_groups"
    ] == [["A", "B"]]
    assert any(
        "不同视图使用了同一文件内容" in error
        for item in result["invalid"]
        for error in item["errors"]
    )


def test_turnaround_technical_check_requires_landscape(
    tmp_path: Path,
    monkeypatch,
) -> None:
    image_path = tmp_path / "turnaround.png"
    image_path.write_bytes(b"test")
    monkeypatch.setattr(
        media_validator,
        "check_image",
        lambda path, *, require_portrait: {
            "path": str(path),
            "size_bytes": path.stat().st_size,
            "width": 800,
            "height": 1200,
            "valid": True,
            "errors": [],
        },
    )

    result = media_validator.check_turnaround_image(image_path)

    assert not result["valid"]
    assert result["errors"] == ["角色三视图设定板必须为横向画布"]


def test_image_check_uses_pillow_without_ffprobe(
    tmp_path: Path,
    monkeypatch,
) -> None:
    image_path = tmp_path / "turnaround.png"
    Image.new("RGB", (1600, 900), color=(20, 30, 40)).save(image_path)
    monkeypatch.setattr(
        media_validator,
        "probe",
        lambda path: (_ for _ in ()).throw(
            AssertionError("静态图片不应调用 ffprobe")
        ),
    )

    result = media_validator.check_image(
        image_path,
        require_portrait=False,
    )

    assert result["valid"]
    assert result["width"] == 1600
    assert result["height"] == 900


def test_image_check_rejects_truncated_png(tmp_path: Path) -> None:
    image_path = tmp_path / "truncated.png"
    Image.new("RGB", (1600, 900), color=(20, 30, 40)).save(image_path)
    payload = image_path.read_bytes()
    image_path.write_bytes(payload[: len(payload) // 2])

    try:
        media_validator.check_image(
            image_path,
            require_portrait=False,
        )
    except OSError:
        pass
    else:
        raise AssertionError("截断 PNG 不得通过完整像素解码")


def test_image_check_rejects_wrong_portrait_ratio_and_resolution(
    tmp_path: Path,
) -> None:
    image_path = tmp_path / "portrait.png"
    Image.new("RGB", (800, 1000), color=(20, 30, 40)).save(image_path)

    result = media_validator.check_image(
        image_path,
        require_portrait=True,
    )

    assert not result["valid"]
    assert "竖屏图片画幅不是 9:16" in result["errors"]
    assert "竖屏图片高度低于 1280px" in result["errors"]


def test_image_check_rejects_short_edge_below_minimum(
    tmp_path: Path,
) -> None:
    image_path = tmp_path / "too-narrow.png"
    Image.new("RGB", (719, 1280), color=(20, 30, 40)).save(image_path)

    result = media_validator.check_image(
        image_path,
        require_portrait=True,
    )

    assert not result["valid"]
    assert "静态资产短边低于 720px" in result["errors"]


def test_image_check_rejects_disguised_animation(tmp_path: Path) -> None:
    image_path = tmp_path / "disguised.png"
    frames = [
        Image.new("RGB", (1600, 900), color=color)
        for color in ((20, 30, 40), (40, 30, 20))
    ]
    frames[0].save(
        image_path,
        format="GIF",
        save_all=True,
        append_images=frames[1:],
    )

    result = media_validator.check_image(
        image_path,
        require_portrait=False,
    )

    assert not result["valid"]
    assert any("真实 PNG" in error for error in result["errors"])
    assert "静态资产不能是动画图片" in result["errors"]


def test_partial_candidate_scene_package_blocks_only_affected_shot() -> None:
    approvals = media_prep.load_preproduction_approvals()
    approvals = json.loads(json.dumps(approvals))
    tower_record = approvals["scene_packages"]["HANYU_TOWER"]
    tower_record["status"] = "candidate"
    tower_record["candidate_views"] = {
        "EXTERIOR": tower_record["candidate_views"]["EXTERIOR"],
    }
    unit = media_prep.EPISODES[11]["beats"][0]

    job = media_prep.build_storyboard_job(
        11,
        1,
        0,
        unit,
        card={},
        approvals=approvals,
    )

    assert job["required_scene_views"] == ["EXTERIOR"]
    assert (
        "scene_package:HANYU_TOWER:view:VERTICAL_ROUTE_PLAN:missing"
        in job["blocked_dependencies"]
    )
    assert not job["ready_for_generation"]


def _approved_manifest() -> dict:
    return {
        "storyboard_jobs": [
            {"approved": True, "blocked_dependencies": []}
            for _ in range(216)
        ],
        "frame_jobs": [
            {"approved": True, "blocked_dependencies": []}
            for _ in range(72)
        ],
        "video_jobs": [
            {
                "approved": True,
                "current_version": True,
                "blocked_dependencies": [],
            }
            for _ in range(216)
        ],
        "episode_jobs": [
            {
                "approved": True,
                "current_version": True,
                "blocked_dependencies": [],
            }
            for _ in range(12)
        ],
    }


def _approved_media_status() -> dict:
    return {
        "character_turnarounds": {
            "expected": 6,
            "approved": 6,
        },
        "scene_packages": {
            "expected": 8,
            "approved": 8,
        },
    }


def test_final_approval_gate_accepts_only_all_exact_current_approvals() -> None:
    summary = build_approval_gate_summary(
        _approved_manifest(),
        _approved_media_status(),
    )

    assert summary["satisfied"]
    assert summary["approval_gap_count"] == 0
    assert summary["approval_excess_count"] == 0
    assert summary["inventory_mismatch_count"] == 0
    assert summary["dependency_issue_count"] == 0
    assert all(
        gate["approved_current"] == gate["expected"]
        for gate in summary["gates"].values()
    )


def test_final_approval_gate_rejects_stale_or_unapproved_delivery() -> None:
    manifest = _approved_manifest()
    manifest["video_jobs"][0]["current_version"] = False
    manifest["episode_jobs"][0]["approved"] = False

    summary = build_approval_gate_summary(
        manifest,
        _approved_media_status(),
    )

    assert not summary["satisfied"]
    assert summary["approval_gaps"]["video_segments"] == 1
    assert summary["approval_gaps"]["episodes"] == 1
    assert summary["approval_gap_count"] == 2


def test_approval_gap_never_becomes_negative_and_dependencies_are_separate() -> None:
    manifest = _approved_manifest()
    manifest["video_jobs"][0]["blocked_dependencies"] = [
        "frame:EP01-G01"
    ]
    media_status = _approved_media_status()
    media_status["character_turnarounds"]["approved"] = 7

    summary = build_approval_gate_summary(manifest, media_status)

    assert not summary["satisfied"]
    assert summary["approval_gaps"]["character_turnarounds"] == 0
    assert summary["approval_excesses"]["character_turnarounds"] == 1
    assert summary["approval_gap_count"] == 0
    assert "video_dependencies" not in summary["approval_gaps"]
    assert summary["dependency_diagnostics"]["video_jobs_blocked"] == 1
    assert summary["dependency_diagnostics"][
        "video_dependency_references"
    ] == 1
    assert summary["dependency_issue_count"] == 1


def test_latest_review_must_match_current_active_image(
    tmp_path: Path,
) -> None:
    image_path = tmp_path / "current.png"
    image_path.write_bytes(b"current-image")
    spec_fingerprint = "spec-v1"
    card = {
        "images": ["/new.png"],
        "metadata": {
            "active_image": "/new.png",
            "image_reviews": [
                {
                    "image": "/old.png",
                    "verdict": "pass",
                    "file_sha256": file_sha256(image_path),
                    "spec_fingerprint": spec_fingerprint,
                },
                {
                    "image": "/new.png",
                    "verdict": "reject",
                },
            ],
        },
    }

    assert not latest_image_review_passed(
        card,
        "/new.png",
        image_path=image_path,
        spec_fingerprint=spec_fingerprint,
    )
    card["metadata"]["image_reviews"].append({
        "image": "/new.png",
        "verdict": "pass",
        "file_sha256": file_sha256(image_path),
        "spec_fingerprint": spec_fingerprint,
    })
    assert latest_image_review_passed(
        card,
        "/new.png",
        image_path=image_path,
        spec_fingerprint=spec_fingerprint,
    )
    assert not latest_image_review_passed(
        card,
        "/old.png",
        image_path=image_path,
        spec_fingerprint=spec_fingerprint,
    )


def test_latest_review_rejects_replaced_file_hash(
    tmp_path: Path,
) -> None:
    image_path = tmp_path / "same-path.png"
    image_path.write_bytes(b"approved-version")
    card = {
        "images": ["/same-path.png"],
        "metadata": {
            "active_image": "/same-path.png",
            "image_reviews": [{
                "image": "/same-path.png",
                "verdict": "pass",
                "file_sha256": file_sha256(image_path),
                "spec_fingerprint": "spec-v1",
            }],
        },
    }

    assert latest_image_review_passed(
        card,
        "/same-path.png",
        image_path=image_path,
        spec_fingerprint="spec-v1",
    )
    image_path.write_bytes(b"silently-replaced-version")
    assert not latest_image_review_passed(
        card,
        "/same-path.png",
        image_path=image_path,
        spec_fingerprint="spec-v1",
    )


def test_latest_review_rejects_changed_spec_fingerprint(
    tmp_path: Path,
) -> None:
    image_path = tmp_path / "approved.png"
    image_path.write_bytes(b"approved-version")
    card = {
        "images": ["/approved.png"],
        "metadata": {
            "active_image": "/approved.png",
            "image_reviews": [{
                "image": "/approved.png",
                "verdict": "pass",
                "file_sha256": file_sha256(image_path),
                "spec_fingerprint": "spec-v1",
            }],
        },
    }

    assert latest_image_review_passed(
        card,
        "/approved.png",
        image_path=image_path,
        spec_fingerprint="spec-v1",
    )
    assert not latest_image_review_passed(
        card,
        "/approved.png",
        image_path=image_path,
        spec_fingerprint="spec-v2",
    )
