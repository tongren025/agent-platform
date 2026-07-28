"""《铁心恋人》视频生成的断点恢复、并发发布与实时闸门测试。"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = ROOT / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import render_tiexin_videos as video_render  # noqa: E402


MODEL = "test/video-model"


def _valid_technical(path: Path) -> dict:
    return {
        "valid": True,
        "facts": {
            "path": str(path),
            "width": 720,
            "height": 1280,
            "duration_seconds": 5.0,
            "has_audio": True,
        },
        "errors": [],
        "infrastructure_error": False,
    }


def _job(
    tmp_path: Path,
    *,
    job_id: str,
    segment: str,
    input_path: Path,
    output_path: Path,
) -> dict:
    payload = {
        "schema": "test-video-v1",
        "job_id": job_id,
        "input_path": str(input_path),
        "input_file_sha256": video_render.file_sha256(input_path),
        "video_model": MODEL,
    }
    return {
        "job_id": job_id,
        "episode": 1,
        "g_unit": "G1",
        "segment": segment,
        "prompt": f"{segment} prompt",
        "job_version_payload": payload,
        "job_version_fingerprint": video_render.stable_fingerprint(
            payload
        ),
        "input_path": str(input_path),
        "output_path": str(output_path),
        "blocked_dependencies": [],
    }


def _patch_runtime_paths(
    monkeypatch,
    tmp_path: Path,
) -> None:
    qa_dir = tmp_path / "qa"
    monkeypatch.setattr(video_render, "QA_DIR", qa_dir)
    monkeypatch.setattr(
        video_render,
        "STATE_PATH",
        qa_dir / "video_jobs.json",
    )
    monkeypatch.setattr(
        video_render,
        "LOG_PATH",
        qa_dir / "media_generation_log.jsonl",
    )
    monkeypatch.setattr(
        video_render,
        "WORKSPACE_LOCK_DIR",
        qa_dir / "video_locks",
    )
    monkeypatch.setattr(
        video_render,
        "VIDEO_END_DIR",
        tmp_path / "video_ends",
    )
    monkeypatch.setattr(
        video_render,
        "COMPOSITION_STATE_PATH",
        qa_dir / "episode_compositions.json",
    )
    monkeypatch.setattr(
        video_render,
        "EPISODE_DIR",
        tmp_path / "episodes",
    )


def test_workspace_claim_prevents_duplicate_owner(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(
        video_render,
        "WORKSPACE_LOCK_DIR",
        tmp_path / "locks",
    )

    with video_render.workspace_claim("EP01_G01_A") as first:
        assert first
        with video_render.workspace_claim("EP01_G01_A") as second:
            assert not second

    with video_render.workspace_claim("EP01_G01_A") as recovered:
        assert recovered


def test_stale_lock_is_detected_when_pid_was_reused(
    tmp_path: Path,
    monkeypatch,
) -> None:
    lock_path = tmp_path / "job.lock"
    lock_path.mkdir()
    (lock_path / "owner.json").write_text(
        json.dumps({
            "pid": 1234,
            "process_identity": "old-process-start",
        }),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        video_render,
        "_process_is_alive",
        lambda pid: True,
    )
    monkeypatch.setattr(
        video_render,
        "_process_identity",
        lambda pid: "new-process-start",
    )

    assert not video_render._existing_lock_is_active(lock_path)


def test_lock_release_marker_survives_owner_unlink_failure(
    tmp_path: Path,
    monkeypatch,
) -> None:
    lock_root = tmp_path / "locks"
    monkeypatch.setattr(
        video_render,
        "WORKSPACE_LOCK_DIR",
        lock_root,
    )
    original_unlink = Path.unlink

    def keep_owner_locked(
        path: Path,
        *args,
        **kwargs,
    ) -> None:
        if path.name == "owner.json":
            raise PermissionError("模拟 Windows 持续占用")
        original_unlink(path, *args, **kwargs)

    monkeypatch.setattr(Path, "unlink", keep_owner_locked)
    with video_render.workspace_claim("state") as claimed:
        assert claimed

    lock_path = lock_root / "state.lock"
    assert lock_path.exists()
    assert (lock_path / "released.json").exists()
    assert not video_render._existing_lock_is_active(lock_path)


def test_exclusive_publish_never_overwrites_concurrent_product(
    tmp_path: Path,
) -> None:
    temporary = tmp_path / "candidate.mp4"
    output = tmp_path / "stable.mp4"
    temporary.write_bytes(b"candidate")
    output.write_bytes(b"concurrent")

    assert not video_render.publish_file_exclusive(temporary, output)
    assert output.read_bytes() == b"concurrent"
    assert temporary.read_bytes() == b"candidate"


def test_exclusive_publish_survives_temp_cleanup_failure(
    tmp_path: Path,
    monkeypatch,
) -> None:
    temporary = tmp_path / "candidate.mp4"
    output = tmp_path / "stable.mp4"
    temporary.write_bytes(b"candidate")
    original_unlink = Path.unlink

    def fail_candidate_unlink(
        path: Path,
        *args,
        **kwargs,
    ) -> None:
        if path == temporary:
            raise PermissionError("模拟 Windows 临时文件占用")
        original_unlink(path, *args, **kwargs)

    monkeypatch.setattr(Path, "unlink", fail_candidate_unlink)

    assert video_render.publish_file_exclusive(temporary, output)
    assert output.read_bytes() == b"candidate"
    assert temporary.exists()


def test_preserved_archives_are_unique_even_for_same_content(
    tmp_path: Path,
) -> None:
    output = tmp_path / "EP01.mp4"
    output.write_bytes(b"same-old-content")
    first = video_render.preserve_existing_file(
        output,
        category="archive",
        logical_stem="EP01",
    )
    output.write_bytes(b"same-old-content")
    second = video_render.preserve_existing_file(
        output,
        category="archive",
        logical_stem="EP01",
    )

    assert first is not None and second is not None
    assert first != second
    assert first.read_bytes() == b"same-old-content"
    assert second.read_bytes() == b"same-old-content"


def test_partial_g_unit_schedules_only_missing_segments_for_paid_work(
    tmp_path: Path,
    monkeypatch,
) -> None:
    frame = tmp_path / "frame.png"
    a_end = tmp_path / "A_end.png"
    b_end = tmp_path / "B_end.png"
    a_output = tmp_path / "A.mp4"
    frame.write_bytes(b"frame")
    a_output.write_bytes(b"already-generated-A")
    jobs = [
        _job(
            tmp_path,
            job_id="EP01_G01_A",
            segment="A",
            input_path=frame,
            output_path=a_output,
        ),
        _job(
            tmp_path,
            job_id="EP01_G01_B",
            segment="B",
            input_path=a_end,
            output_path=tmp_path / "B.mp4",
        ),
        _job(
            tmp_path,
            job_id="EP01_G01_C",
            segment="C",
            input_path=b_end,
            output_path=tmp_path / "C.mp4",
        ),
    ]
    a_version, _ = video_render.compute_runtime_job_version(
        jobs[0],
        model=MODEL,
    )
    state = {
        "jobs": {
            jobs[0]["job_id"]: {
                "job_version_fingerprint": a_version,
                "output_file_sha256": video_render.file_sha256(
                    a_output
                ),
                "model": MODEL,
            }
        }
    }
    monkeypatch.setattr(
        video_render,
        "video_technical_check",
        lambda path, *, duration_range: _valid_technical(path),
    )
    monkeypatch.setattr(
        video_render.shutil,
        "which",
        lambda name: name,
    )

    pending, blocked = video_render.select_pending_groups(
        {"video_jobs": jobs},
        state=state,
        model=MODEL,
        limit=1,
    )

    assert len(pending) == 1
    assert [job["segment"] for job in pending[0]] == ["A", "B", "C"]
    assert blocked == []
    assessments = [
        video_render.assess_video_job(
            job,
            state=state,
            model=MODEL,
        )
        for job in jobs
    ]
    assert [item["status"] for item in assessments] == [
        "current",
        "missing",
        "missing",
    ]


def test_partial_g_unit_submits_only_missing_b_and_c(
    tmp_path: Path,
    monkeypatch,
) -> None:
    _patch_runtime_paths(monkeypatch, tmp_path)
    frame = tmp_path / "frame.png"
    frame.write_bytes(b"frame")
    a_output = tmp_path / "A.mp4"
    a_output.write_bytes(b"existing-A")
    a_end = video_render.VIDEO_END_DIR / "EP01_G01_A_end.png"
    b_end = video_render.VIDEO_END_DIR / "EP01_G01_B_end.png"
    jobs = [
        _job(
            tmp_path,
            job_id="EP01_G01_A",
            segment="A",
            input_path=frame,
            output_path=a_output,
        ),
        _job(
            tmp_path,
            job_id="EP01_G01_B",
            segment="B",
            input_path=a_end,
            output_path=tmp_path / "B.mp4",
        ),
        _job(
            tmp_path,
            job_id="EP01_G01_C",
            segment="C",
            input_path=b_end,
            output_path=tmp_path / "C.mp4",
        ),
    ]
    a_version, _ = video_render.compute_runtime_job_version(
        jobs[0],
        model=MODEL,
    )
    video_render.save_state({
        "version": 2,
        "jobs": {
            jobs[0]["job_id"]: {
                "status": "generated",
                "model": MODEL,
                "job_version_fingerprint": a_version,
                "output_file_sha256": video_render.file_sha256(
                    a_output
                ),
            }
        },
    })
    remote_source = tmp_path / "remote.mp4"
    remote_source.write_bytes(b"generated-video")
    submitted_segments: list[str] = []

    def fake_submit(*args, **kwargs):
        segment = kwargs["prompt"].split()[0]
        submitted_segments.append(segment)
        return {
            "id": f"remote-{segment}",
            "status": "queued",
        }

    def write_end_frame(video_path: Path, end_path: Path) -> None:
        end_path.parent.mkdir(parents=True, exist_ok=True)
        end_path.write_bytes(
            f"end-{video_path.stem}".encode()
        )

    monkeypatch.setattr(video_render, "submit_video", fake_submit)
    monkeypatch.setattr(
        video_render,
        "wait_for_video",
        lambda remote_id, **kwargs: {
            "status": "completed",
            "url": f"local://{remote_id}",
            "usage": {},
        },
    )
    monkeypatch.setattr(
        video_render,
        "_local_upload_path",
        lambda url: remote_source,
    )
    monkeypatch.setattr(
        video_render,
        "video_technical_check",
        lambda path, *, duration_range: _valid_technical(path),
    )
    monkeypatch.setattr(
        video_render,
        "extract_last_frame",
        write_end_frame,
    )

    results = video_render.render_g_unit(
        jobs,
        state=video_render.load_state(),
        model=MODEL,
        poll_seconds=5,
        timeout_seconds=60,
    )

    assert submitted_segments == ["B", "C"]
    assert [item["status"] for item in results] == [
        "skipped",
        "generated",
        "generated",
    ]
    assert Path(jobs[1]["output_path"]).exists()
    assert Path(jobs[2]["output_path"]).exists()


def test_failed_remote_is_cleared_and_resubmitted(
    tmp_path: Path,
    monkeypatch,
) -> None:
    _patch_runtime_paths(monkeypatch, tmp_path)
    input_path = tmp_path / "frame.png"
    input_path.write_bytes(b"frame")
    job = _job(
        tmp_path,
        job_id="EP01_G01_A",
        segment="A",
        input_path=input_path,
        output_path=tmp_path / "A.mp4",
    )
    version, input_hash = video_render.compute_runtime_job_version(
        job,
        model=MODEL,
    )
    video_render.save_state({
        "version": 2,
        "jobs": {
            job["job_id"]: {
                "remote_id": "failed-remote",
                "status": "failed",
                "model": MODEL,
                "job_version_fingerprint": version,
                "input_file_sha256": input_hash,
            }
        },
    })
    submissions: list[str] = []

    def fake_submit(*args, **kwargs):
        submissions.append(kwargs["model"])
        return {"id": "replacement-remote", "status": "queued"}

    monkeypatch.setattr(video_render, "submit_video", fake_submit)
    monkeypatch.setattr(
        video_render,
        "wait_for_video",
        lambda *args, **kwargs: {
            "status": "pending_timeout",
            "usage": {},
        },
    )

    result = video_render.render_segment(
        job,
        state=video_render.load_state(),
        model=MODEL,
        poll_seconds=5,
        timeout_seconds=60,
    )

    assert result["status"] == "pending_timeout"
    assert submissions == [MODEL]
    record = video_render.load_state()["jobs"][job["job_id"]]
    assert record["remote_id"] == "replacement-remote"
    assert any(
        item["remote_id"] == "failed-remote"
        and item["reason"] == "remote_terminal_failed"
        for item in record["superseded"]
    )


def test_ambiguous_submission_is_never_automatically_retried(
    tmp_path: Path,
    monkeypatch,
) -> None:
    _patch_runtime_paths(monkeypatch, tmp_path)
    input_path = tmp_path / "frame.png"
    input_path.write_bytes(b"frame")
    job = _job(
        tmp_path,
        job_id="EP01_G01_A",
        segment="A",
        input_path=input_path,
        output_path=tmp_path / "A.mp4",
    )
    version, input_hash = video_render.compute_runtime_job_version(
        job,
        model=MODEL,
    )
    video_render.save_state({
        "version": 2,
        "jobs": {
            job["job_id"]: {
                "remote_id": "",
                "status": "submitting",
                "model": MODEL,
                "job_version_fingerprint": version,
                "input_file_sha256": input_hash,
                "submission_intent": {
                    "attempt_id": "ambiguous-attempt",
                    "resolved_remote_id": "",
                },
            }
        },
    })
    submit_called = False

    def reject_submit(*args, **kwargs):
        nonlocal submit_called
        submit_called = True
        raise AssertionError("不应重复提交")

    monkeypatch.setattr(video_render, "submit_video", reject_submit)

    result = video_render.render_segment(
        job,
        state=video_render.load_state(),
        model=MODEL,
        poll_seconds=5,
        timeout_seconds=60,
    )

    assert result["status"] == "submission_ambiguous"
    assert result["submission_attempt_id"] == "ambiguous-attempt"
    assert not submit_called


def test_published_candidate_is_adopted_after_state_write_crash(
    tmp_path: Path,
    monkeypatch,
) -> None:
    _patch_runtime_paths(monkeypatch, tmp_path)
    input_path = tmp_path / "frame.png"
    output_path = tmp_path / "A.mp4"
    candidate_path = tmp_path / ".A.crashed.download.mp4"
    input_path.write_bytes(b"frame")
    output_path.write_bytes(b"validated-candidate")
    candidate_path.write_bytes(b"validated-candidate")
    job = _job(
        tmp_path,
        job_id="EP01_G01_A",
        segment="A",
        input_path=input_path,
        output_path=output_path,
    )
    version, _ = video_render.compute_runtime_job_version(
        job,
        model=MODEL,
    )
    candidate_hash = video_render.file_sha256(output_path)
    video_render.save_state({
        "version": 2,
        "jobs": {
            job["job_id"]: {
                "remote_id": "completed-remote",
                "source_url": "local://completed",
                "status": "candidate_validated",
                "model": MODEL,
                "job_version_fingerprint": version,
                "candidate_temp_path": str(candidate_path),
                "candidate_file_sha256": candidate_hash,
                "output_file_sha256": "",
            }
        },
    })
    monkeypatch.setattr(
        video_render,
        "video_technical_check",
        lambda path, *, duration_range: _valid_technical(path),
    )
    monkeypatch.setattr(
        video_render,
        "submit_video",
        lambda *args, **kwargs: (_ for _ in ()).throw(
            AssertionError("不应重新提交付费任务")
        ),
    )

    def write_end_frame(video_path: Path, end_path: Path) -> None:
        end_path.parent.mkdir(parents=True, exist_ok=True)
        end_path.write_bytes(b"end-frame")

    monkeypatch.setattr(
        video_render,
        "extract_last_frame",
        write_end_frame,
    )
    original_unlink = Path.unlink

    def keep_candidate_locked(
        path: Path,
        *args,
        **kwargs,
    ) -> None:
        if path == candidate_path:
            raise PermissionError("模拟临时候选持续被占用")
        original_unlink(path, *args, **kwargs)

    monkeypatch.setattr(Path, "unlink", keep_candidate_locked)

    result = video_render.render_segment(
        job,
        state=video_render.load_state(),
        model=MODEL,
        poll_seconds=5,
        timeout_seconds=60,
    )

    assert result["status"] == "skipped"
    record = video_render.load_state()["jobs"][job["job_id"]]
    assert record["status"] == "generated"
    assert record["output_file_sha256"] == candidate_hash
    assert record["candidate_file_sha256"] == candidate_hash
    assert record["candidate_temp_path"] == str(candidate_path)
    assert record["candidate_cleanup_warning"]


def test_end_frame_failure_recovers_without_new_paid_submission(
    tmp_path: Path,
    monkeypatch,
) -> None:
    _patch_runtime_paths(monkeypatch, tmp_path)
    input_path = tmp_path / "frame.png"
    output_path = tmp_path / "A.mp4"
    input_path.write_bytes(b"frame")
    output_path.write_bytes(b"valid-video")
    job = _job(
        tmp_path,
        job_id="EP01_G01_A",
        segment="A",
        input_path=input_path,
        output_path=output_path,
    )
    version, _ = video_render.compute_runtime_job_version(
        job,
        model=MODEL,
    )
    video_render.save_state({
        "version": 2,
        "jobs": {
            job["job_id"]: {
                "remote_id": "completed-remote",
                "status": "generated",
                "model": MODEL,
                "job_version_fingerprint": version,
                "output_file_sha256": video_render.file_sha256(
                    output_path
                ),
            }
        },
    })
    monkeypatch.setattr(
        video_render,
        "video_technical_check",
        lambda path, *, duration_range: _valid_technical(path),
    )
    submit_called = False

    def reject_submit(*args, **kwargs):
        nonlocal submit_called
        submit_called = True
        raise AssertionError("不应重新提交付费任务")

    monkeypatch.setattr(video_render, "submit_video", reject_submit)
    monkeypatch.setattr(
        video_render,
        "extract_last_frame",
        lambda *args, **kwargs: (_ for _ in ()).throw(
            RuntimeError("模拟末帧失败")
        ),
    )
    first = video_render.render_segment(
        job,
        state=video_render.load_state(),
        model=MODEL,
        poll_seconds=5,
        timeout_seconds=60,
    )
    assert first["status"] == "end_frame_failed"

    def write_end_frame(video_path: Path, end_path: Path) -> None:
        end_path.parent.mkdir(parents=True, exist_ok=True)
        end_path.write_bytes(b"end-frame")

    monkeypatch.setattr(
        video_render,
        "extract_last_frame",
        write_end_frame,
    )
    second = video_render.render_segment(
        job,
        state=video_render.load_state(),
        model=MODEL,
        poll_seconds=5,
        timeout_seconds=60,
    )

    assert second["status"] == "skipped"
    assert not submit_called
    assert (
        video_render.VIDEO_END_DIR / f"{job['job_id']}_end.png"
    ).read_bytes() == b"end-frame"


def test_invalid_download_is_rejected_before_stable_publish(
    tmp_path: Path,
    monkeypatch,
) -> None:
    _patch_runtime_paths(monkeypatch, tmp_path)
    input_path = tmp_path / "frame.png"
    downloaded = tmp_path / "remote-result.mp4"
    output_path = tmp_path / "A.mp4"
    input_path.write_bytes(b"frame")
    downloaded.write_bytes(b"wrong-resolution-video")
    job = _job(
        tmp_path,
        job_id="EP01_G01_A",
        segment="A",
        input_path=input_path,
        output_path=output_path,
    )
    monkeypatch.setattr(
        video_render,
        "submit_video",
        lambda *args, **kwargs: {
            "id": "completed-but-invalid",
            "status": "queued",
        },
    )
    monkeypatch.setattr(
        video_render,
        "wait_for_video",
        lambda *args, **kwargs: {
            "status": "completed",
            "url": "local://invalid",
            "usage": {},
        },
    )
    monkeypatch.setattr(
        video_render,
        "_local_upload_path",
        lambda url: downloaded,
    )
    monkeypatch.setattr(
        video_render,
        "video_technical_check",
        lambda path, *, duration_range: {
            "valid": False,
            "facts": {
                "width": 640,
                "height": 1136,
                "duration_seconds": 5.0,
                "has_audio": True,
            },
            "errors": ["分辨率必须严格为 720x1280"],
            "infrastructure_error": False,
        },
    )

    result = video_render.render_segment(
        job,
        state={"version": 2, "jobs": {}},
        model=MODEL,
        poll_seconds=5,
        timeout_seconds=60,
    )

    assert result["status"] == "technical_failed"
    assert not output_path.exists()
    record = video_render.load_state()["jobs"][job["job_id"]]
    assert record["remote_id"] == ""
    assert Path(record["preserved_candidate_path"]).exists()


def test_live_episode_gate_rejects_disk_hash_changed_after_approval(
    tmp_path: Path,
    monkeypatch,
) -> None:
    _patch_runtime_paths(monkeypatch, tmp_path)
    monkeypatch.setattr(
        video_render,
        "video_technical_check",
        lambda path, *, duration_range: _valid_technical(path),
    )
    monkeypatch.setattr(
        video_render,
        "project_relative",
        lambda path: path.name,
    )
    jobs = []
    state = {"version": 2, "jobs": {}}
    approvals = {"video_segments": {}, "episodes": {}}
    input_path = tmp_path / "source.png"
    input_path.write_bytes(b"source")
    for index in range(18):
        output = tmp_path / f"segment-{index:02d}.mp4"
        output.write_bytes(f"segment-{index}".encode())
        job = _job(
            tmp_path,
            job_id=f"EP01_G{index // 3 + 1:02d}_"
            f"{'ABC'[index % 3]}",
            segment="ABC"[index % 3],
            input_path=input_path,
            output_path=output,
        )
        version, _ = video_render.compute_runtime_job_version(
            job,
            model=MODEL,
        )
        output_hash = video_render.file_sha256(output)
        state["jobs"][job["job_id"]] = {
            "job_version_fingerprint": version,
            "output_file_sha256": output_hash,
            "model": MODEL,
        }
        approvals["video_segments"][job["job_id"]] = {
            "status": "approved",
            "path": output.name,
            "file_sha256": output_hash,
            "job_version_fingerprint": version,
        }
        jobs.append(job)
    video_render.save_state(state)
    monkeypatch.setattr(
        video_render,
        "load_delivery_approvals",
        lambda: approvals,
    )

    _, initial_errors = video_render.validate_episode_sources(
        jobs,
        model=MODEL,
    )
    assert initial_errors == []

    Path(jobs[0]["output_path"]).write_bytes(b"silently-replaced")
    _, changed_errors = video_render.validate_episode_sources(
        jobs,
        model=MODEL,
    )
    assert any("状态哈希与磁盘不一致" in item for item in changed_errors)
    assert any("交付审批哈希已陈旧" in item for item in changed_errors)


def test_live_episode_gate_rejects_revoked_upstream_approval(
    tmp_path: Path,
    monkeypatch,
) -> None:
    _patch_runtime_paths(monkeypatch, tmp_path)
    monkeypatch.setattr(
        video_render,
        "video_technical_check",
        lambda path, *, duration_range: _valid_technical(path),
    )
    monkeypatch.setattr(
        video_render,
        "project_relative",
        lambda path: path.name,
    )
    jobs = []
    state = {"version": 2, "jobs": {}}
    approvals = {"video_segments": {}, "episodes": {}}
    input_path = tmp_path / "source.png"
    input_path.write_bytes(b"source")
    for index in range(18):
        output = tmp_path / f"segment-{index:02d}.mp4"
        output.write_bytes(f"segment-{index}".encode())
        job = _job(
            tmp_path,
            job_id=f"EP01_G{index // 3 + 1:02d}_"
            f"{'ABC'[index % 3]}",
            segment="ABC"[index % 3],
            input_path=input_path,
            output_path=output,
        )
        version, _ = video_render.compute_runtime_job_version(
            job,
            model=MODEL,
        )
        output_hash = video_render.file_sha256(output)
        state["jobs"][job["job_id"]] = {
            "job_version_fingerprint": version,
            "output_file_sha256": output_hash,
            "model": MODEL,
        }
        approvals["video_segments"][job["job_id"]] = {
            "status": "approved",
            "path": output.name,
            "file_sha256": output_hash,
            "job_version_fingerprint": version,
        }
        jobs.append(job)
    jobs[0]["blocked_dependencies"] = [
        "first_frame:not_approved",
    ]
    video_render.save_state(state)
    monkeypatch.setattr(
        video_render,
        "load_delivery_approvals",
        lambda: approvals,
    )

    _, errors = video_render.validate_episode_sources(
        jobs,
        model=MODEL,
    )

    assert any(
        "上游审核阻塞" in item
        and "first_frame:not_approved" in item
        for item in errors
    )


@pytest.mark.parametrize(
    ("phase", "candidate_recorded"),
    [
        ("candidate_validated", True),
        ("published_pending_final_check", False),
    ],
)
def test_episode_candidate_published_before_state_crash_is_adopted(
    tmp_path: Path,
    monkeypatch,
    phase: str,
    candidate_recorded: bool,
) -> None:
    _patch_runtime_paths(monkeypatch, tmp_path)
    monkeypatch.setattr(
        video_render,
        "video_technical_check",
        lambda path, *, duration_range: _valid_technical(path),
    )
    monkeypatch.setattr(
        video_render,
        "project_relative",
        lambda path: path.name,
    )
    monkeypatch.setattr(
        video_render.shutil,
        "which",
        lambda name: None if name == "ffmpeg" else name,
    )
    monkeypatch.setattr(
        video_render.subprocess,
        "run",
        lambda *args, **kwargs: (_ for _ in ()).throw(
            AssertionError("已发布候选不应重新运行 FFmpeg")
        ),
    )
    input_path = tmp_path / "source.png"
    input_path.write_bytes(b"source")
    jobs = []
    state = {"version": 2, "jobs": {}}
    approvals = {"video_segments": {}, "episodes": {}}
    for index in range(18):
        output = tmp_path / f"segment-{index:02d}.mp4"
        output.write_bytes(f"segment-{index}".encode())
        job = _job(
            tmp_path,
            job_id=f"EP01_G{index // 3 + 1:02d}_"
            f"{'ABC'[index % 3]}",
            segment="ABC"[index % 3],
            input_path=input_path,
            output_path=output,
        )
        version, _ = video_render.compute_runtime_job_version(
            job,
            model=MODEL,
        )
        output_hash = video_render.file_sha256(output)
        state["jobs"][job["job_id"]] = {
            "job_version_fingerprint": version,
            "output_file_sha256": output_hash,
            "model": MODEL,
        }
        approvals["video_segments"][job["job_id"]] = {
            "status": "approved",
            "path": output.name,
            "file_sha256": output_hash,
            "job_version_fingerprint": version,
        }
        jobs.append(job)
    video_render.save_state(state)
    monkeypatch.setattr(
        video_render,
        "load_delivery_approvals",
        lambda: approvals,
    )
    source_snapshot, errors = video_render.validate_episode_sources(
        jobs,
        model=MODEL,
    )
    assert errors == []
    dependency_fingerprint = video_render.stable_fingerprint([
        {
            "job_id": item["job_id"],
            "job_version_fingerprint": item[
                "job_version_fingerprint"
            ],
            "file_sha256": item["file_sha256"],
            "current_version": True,
            "approved": True,
        }
        for item in source_snapshot
    ])
    episode_output = video_render.EPISODE_DIR / "EP01.mp4"
    episode_output.parent.mkdir(parents=True)
    episode_output.write_bytes(b"already-published-candidate")
    episode_hash = video_render.file_sha256(episode_output)
    video_render.save_composition_state({
        "version": 1,
        "episodes": {
            "EP01": {
                "status": phase,
                "dependency_fingerprint": dependency_fingerprint,
                "candidate_temp_path": str(
                    episode_output.parent / ".EP01.crashed.compose.mp4"
                ) if candidate_recorded else "",
                "candidate_file_sha256": (
                    episode_hash if candidate_recorded else ""
                ),
                "output_file_sha256": (
                    "" if candidate_recorded else episode_hash
                ),
            }
        },
    })

    recovered = video_render.compose_episode(
        1,
        jobs,
        model=MODEL,
        source_snapshot=source_snapshot,
        dependency_fingerprint=dependency_fingerprint,
    )

    assert recovered == episode_output
    record = video_render.load_composition_state()["episodes"]["EP01"]
    assert record["status"] == "composed"
    assert record["output_file_sha256"] == episode_hash


def test_episode_rechecks_approval_after_candidate_wal_before_publish(
    tmp_path: Path,
    monkeypatch,
) -> None:
    _patch_runtime_paths(monkeypatch, tmp_path)
    jobs = []
    for index in range(18):
        path = tmp_path / f"segment-{index:02d}.mp4"
        path.write_bytes(f"segment-{index}".encode())
        jobs.append({
            "job_id": f"EP01_SEG_{index:02d}",
            "output_path": str(path),
        })
    source_snapshot = [
        {
            "job_id": job["job_id"],
            "file_sha256": video_render.file_sha256(
                Path(job["output_path"])
            ),
        }
        for job in jobs
    ]
    approval_revoked = False
    events: list[str] = []

    def fake_validate(*args, **kwargs):
        events.append("validate")
        if approval_revoked:
            return source_snapshot, ["EP01_SEG_00: 交付审批未通过"]
        return source_snapshot, []

    def fake_update(episode_key: str, values: dict):
        nonlocal approval_revoked
        events.append(f"state:{values['status']}")
        if values["status"] == "candidate_validated":
            approval_revoked = True
        return values

    def fake_ffmpeg(command, **kwargs):
        Path(command[-1]).write_bytes(b"ninety-second-candidate")
        return SimpleNamespace(returncode=0, stdout="", stderr="")

    monkeypatch.setattr(
        video_render,
        "validate_episode_sources",
        fake_validate,
    )
    monkeypatch.setattr(
        video_render,
        "update_composition_record",
        fake_update,
    )
    monkeypatch.setattr(
        video_render,
        "load_composition_state",
        lambda: {"version": 1, "episodes": {}},
    )
    monkeypatch.setattr(
        video_render,
        "video_technical_check",
        lambda path, *, duration_range: _valid_technical(path),
    )
    monkeypatch.setattr(
        video_render.shutil,
        "which",
        lambda name: name,
    )
    monkeypatch.setattr(video_render.subprocess, "run", fake_ffmpeg)

    with pytest.raises(RuntimeError, match="来源复核失败"):
        video_render.compose_episode(
            1,
            jobs,
            model=MODEL,
            source_snapshot=source_snapshot,
            dependency_fingerprint="dependency",
        )

    assert events[:3] == [
        "validate",
        "state:candidate_validated",
        "validate",
    ]
    assert not (video_render.EPISODE_DIR / "EP01.mp4").exists()


def test_episode_candidate_probe_outage_blocks_without_recomposition(
    tmp_path: Path,
    monkeypatch,
) -> None:
    _patch_runtime_paths(monkeypatch, tmp_path)
    jobs = []
    for index in range(18):
        path = tmp_path / f"segment-{index:02d}.mp4"
        path.write_bytes(b"segment")
        jobs.append({
            "job_id": f"EP01_SEG_{index:02d}",
            "output_path": str(path),
        })
    snapshot = [{"job_id": job["job_id"]} for job in jobs]
    candidate = video_render.EPISODE_DIR / ".EP01.recover.compose.mp4"
    candidate.parent.mkdir(parents=True)
    candidate.write_bytes(b"candidate")
    monkeypatch.setattr(
        video_render,
        "validate_episode_sources",
        lambda *args, **kwargs: (snapshot, []),
    )
    monkeypatch.setattr(
        video_render,
        "load_composition_state",
        lambda: {
            "version": 1,
            "episodes": {
                "EP01": {
                    "status": "candidate_validated",
                    "dependency_fingerprint": "dependency",
                    "candidate_temp_path": str(candidate),
                    "candidate_file_sha256": (
                        video_render.file_sha256(candidate)
                    ),
                }
            },
        },
    )
    monkeypatch.setattr(
        video_render,
        "video_technical_check",
        lambda path, *, duration_range: {
            "valid": False,
            "facts": {},
            "errors": ["ffprobe 暂时不可用"],
            "infrastructure_error": True,
        },
    )
    monkeypatch.setattr(
        video_render.subprocess,
        "run",
        lambda *args, **kwargs: (_ for _ in ()).throw(
            AssertionError("不得重新合成")
        ),
    )

    with pytest.raises(RuntimeError, match="无法复核待恢复候选"):
        video_render.compose_episode(
            1,
            jobs,
            model=MODEL,
            source_snapshot=snapshot,
            dependency_fingerprint="dependency",
        )

    assert candidate.exists()
    assert not (video_render.EPISODE_DIR / "EP01.mp4").exists()


def test_episode_duration_must_be_near_ninety_seconds(
    tmp_path: Path,
    monkeypatch,
) -> None:
    path = tmp_path / "EP01.mp4"
    path.write_bytes(b"video")
    monkeypatch.setattr(
        video_render.shutil,
        "which",
        lambda name: "ffprobe",
    )
    probe_payload = {
        "streams": [
            {
                "codec_type": "video",
                "width": 720,
                "height": 1280,
            },
            {"codec_type": "audio"},
        ],
        "format": {"duration": "88.750"},
    }
    monkeypatch.setattr(
        video_render.subprocess,
        "run",
        lambda *args, **kwargs: SimpleNamespace(
            returncode=0,
            stdout=json.dumps(probe_payload),
            stderr="",
        ),
    )

    rejected = video_render.video_technical_check(
        path,
        duration_range=video_render.EPISODE_DURATION_RANGE,
    )
    assert not rejected["valid"]
    assert any("89.0–91.0" in item for item in rejected["errors"])

    probe_payload["format"]["duration"] = "90.000"
    accepted = video_render.video_technical_check(
        path,
        duration_range=video_render.EPISODE_DURATION_RANGE,
    )
    assert accepted["valid"]


def test_ffprobe_abnormal_dimensions_become_diagnostic_error(
    tmp_path: Path,
    monkeypatch,
) -> None:
    path = tmp_path / "bad-metadata.mp4"
    path.write_bytes(b"video")
    monkeypatch.setattr(
        video_render.shutil,
        "which",
        lambda name: "ffprobe",
    )
    monkeypatch.setattr(
        video_render.subprocess,
        "run",
        lambda *args, **kwargs: SimpleNamespace(
            returncode=0,
            stdout=json.dumps({
                "streams": [
                    {
                        "codec_type": "video",
                        "width": "N/A",
                        "height": None,
                    },
                    {"codec_type": "audio"},
                ],
                "format": {"duration": "5.0"},
            }),
            stderr="",
        ),
    )

    result = video_render.video_technical_check(
        path,
        duration_range=video_render.SEGMENT_DURATION_RANGE,
    )

    assert not result["valid"]
    assert result["facts"]["width"] == 0
    assert any("分辨率必须严格" in item for item in result["errors"])
