"""断点续跑《铁心恋人》视频段，并在素材齐全时合成单集。

每个 G 单元严格按 A → B → C 顺序生产：A 使用批准首帧，B/C 使用上一段
末帧。不同 G 单元可以并行。脚本把 OpenRouter 任务号持久化，因此中断后
再次运行只会同步已有任务，不会重复提交付费请求。

示例：
    python scripts/render_tiexin_videos.py --g-units 1 --concurrency 1 \
        --confirm-external-upload
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from contextlib import ExitStack, contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.openrouter_media import (  # noqa: E402
    _local_upload_path,
    submit_video,
    sync_video,
)
from prepare_tiexin_media import (  # noqa: E402
    DEFAULT_VIDEO_MODEL,
    EPISODE_DIR,
    QA_DIR,
    VIDEO_END_DIR,
    build_manifest,
    file_sha256,
    load_delivery_approvals,
    project_relative,
    stable_fingerprint,
    write_manifest_and_status,
)


STATE_PATH = QA_DIR / "video_jobs.json"
COMPOSITION_STATE_PATH = QA_DIR / "episode_compositions.json"
LOG_PATH = QA_DIR / "media_generation_log.jsonl"
WORKSPACE_LOCK_DIR = QA_DIR / "video_locks"
STATE_LOCK = threading.Lock()
LOG_LOCK = threading.Lock()
RETRYABLE_TERMINAL_STATUSES = {"failed", "cancelled", "expired"}
AMBIGUOUS_SUBMISSION_STATUSES = {"submitting", "submission_unknown"}
SEGMENT_DURATION_RANGE = (4.5, 5.5)
EPISODE_DURATION_RANGE = (89.0, 91.0)
LOCK_INITIALIZATION_GRACE_SECONDS = 10.0


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_lock_name(name: str) -> str:
    return "".join(
        character if character.isalnum() or character in "-_." else "_"
        for character in name
    )


def _process_identity(pid: int) -> str:
    """返回可区分 PID 复用的进程创建标识；不可读取时返回空串。"""
    if pid <= 0:
        return ""
    if os.name == "nt":
        import ctypes
        from ctypes import wintypes

        class FileTime(ctypes.Structure):
            _fields_ = [
                ("low", wintypes.DWORD),
                ("high", wintypes.DWORD),
            ]

        query_limited_information = 0x00001000
        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        kernel32.OpenProcess.argtypes = [
            wintypes.DWORD,
            wintypes.BOOL,
            wintypes.DWORD,
        ]
        kernel32.OpenProcess.restype = wintypes.HANDLE
        kernel32.GetProcessTimes.argtypes = [
            wintypes.HANDLE,
            ctypes.POINTER(FileTime),
            ctypes.POINTER(FileTime),
            ctypes.POINTER(FileTime),
            ctypes.POINTER(FileTime),
        ]
        kernel32.GetProcessTimes.restype = wintypes.BOOL
        kernel32.CloseHandle.argtypes = [wintypes.HANDLE]
        kernel32.CloseHandle.restype = wintypes.BOOL
        handle = kernel32.OpenProcess(
            query_limited_information,
            False,
            pid,
        )
        if not handle:
            return ""
        try:
            creation = FileTime()
            exit_time = FileTime()
            kernel_time = FileTime()
            user_time = FileTime()
            if not kernel32.GetProcessTimes(
                handle,
                ctypes.byref(creation),
                ctypes.byref(exit_time),
                ctypes.byref(kernel_time),
                ctypes.byref(user_time),
            ):
                return ""
            return str((creation.high << 32) | creation.low)
        finally:
            kernel32.CloseHandle(handle)
    stat_path = Path(f"/proc/{pid}/stat")
    try:
        raw = stat_path.read_text(encoding="utf-8")
        fields_after_name = raw[raw.rfind(")") + 2 :].split()
        return fields_after_name[19]
    except (FileNotFoundError, IndexError, OSError):
        return ""


def _process_is_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    if pid == os.getpid():
        return True
    if os.name == "nt":
        import ctypes
        from ctypes import wintypes

        synchronize = 0x00100000
        error_invalid_parameter = 87
        wait_object_0 = 0x00000000
        wait_timeout = 0x00000102
        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        kernel32.OpenProcess.argtypes = [
            wintypes.DWORD,
            wintypes.BOOL,
            wintypes.DWORD,
        ]
        kernel32.OpenProcess.restype = wintypes.HANDLE
        kernel32.WaitForSingleObject.argtypes = [
            wintypes.HANDLE,
            wintypes.DWORD,
        ]
        kernel32.WaitForSingleObject.restype = wintypes.DWORD
        kernel32.CloseHandle.argtypes = [wintypes.HANDLE]
        kernel32.CloseHandle.restype = wintypes.BOOL
        handle = kernel32.OpenProcess(synchronize, False, pid)
        if not handle:
            # 只有 PID 明确不存在才判死；拒绝访问或未知错误必须保守判活。
            return ctypes.get_last_error() != error_invalid_parameter
        try:
            wait_result = kernel32.WaitForSingleObject(handle, 0)
            if wait_result == wait_object_0:
                return False
            if wait_result == wait_timeout:
                return True
            return True
        finally:
            kernel32.CloseHandle(handle)
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except OSError:
        return False
    return True


def _existing_lock_is_active(lock_path: Path) -> bool:
    owner_path = lock_path / "owner.json"
    try:
        owner = json.loads(owner_path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        try:
            age = time.time() - lock_path.stat().st_mtime
        except FileNotFoundError:
            return False
        return age < LOCK_INITIALIZATION_GRACE_SECONDS
    try:
        pid = int(owner.get("pid") or 0)
    except (TypeError, ValueError):
        return False
    released_path = lock_path / "released.json"
    try:
        released = json.loads(
            released_path.read_text(encoding="utf-8")
        )
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        released = {}
    if (
        released.get("token")
        and released.get("token") == owner.get("token")
    ):
        return False
    if not _process_is_alive(pid):
        return False
    recorded_identity = str(owner.get("process_identity") or "")
    if recorded_identity:
        current_identity = _process_identity(pid)
        if current_identity and current_identity != recorded_identity:
            return False
    return True


def _quarantine_stale_lock(lock_path: Path) -> bool:
    stale_path = lock_path.with_name(
        f"{lock_path.name}.stale.{uuid.uuid4().hex}"
    )
    try:
        lock_path.replace(stale_path)
    except FileNotFoundError:
        return True
    except OSError:
        return False
    return True


@contextmanager
def workspace_claim(
    name: str,
    *,
    wait_seconds: float = 0.0,
) -> Iterator[bool]:
    """用工作区内原子目录实现跨进程领取；崩溃进程的锁会被保留归档。"""
    WORKSPACE_LOCK_DIR.mkdir(parents=True, exist_ok=True)
    lock_path = WORKSPACE_LOCK_DIR / f"{_safe_lock_name(name)}.lock"
    deadline = time.monotonic() + max(0.0, wait_seconds)
    token = uuid.uuid4().hex
    acquired = False
    while True:
        try:
            lock_path.mkdir()
            acquired = True
        except FileExistsError:
            if not _existing_lock_is_active(lock_path):
                if _quarantine_stale_lock(lock_path):
                    continue
            if time.monotonic() >= deadline:
                break
            time.sleep(0.1)
            continue
        owner_path = lock_path / "owner.json"
        try:
            owner_path.write_text(
                json.dumps(
                    {
                        "pid": os.getpid(),
                        "process_identity": _process_identity(
                            os.getpid()
                        ),
                        "token": token,
                        "claimed_at": utc_now(),
                    },
                    ensure_ascii=False,
                )
                + "\n",
                encoding="utf-8",
            )
        except Exception:
            owner_path.unlink(missing_ok=True)
            try:
                lock_path.rmdir()
            except OSError:
                pass
            raise
        break

    try:
        yield acquired
    finally:
        if acquired:
            owner_path = lock_path / "owner.json"
            try:
                owner = json.loads(owner_path.read_text(encoding="utf-8"))
            except (FileNotFoundError, json.JSONDecodeError, OSError):
                owner = {}
            if owner.get("token") == token:
                released_path = lock_path / "released.json"
                try:
                    released_path.write_text(
                        json.dumps({
                            "token": token,
                            "released_at": utc_now(),
                        }),
                        encoding="utf-8",
                    )
                except OSError:
                    pass
                owner_removed = False
                for attempt in range(10):
                    try:
                        owner_path.unlink(missing_ok=True)
                        owner_removed = True
                        break
                    except OSError:
                        if attempt < 9:
                            time.sleep(0.05)
                if owner_removed:
                    try:
                        released_path.unlink(missing_ok=True)
                    except OSError:
                        pass
                    try:
                        lock_path.rmdir()
                    except OSError:
                        pass


@contextmanager
def workspace_claim_many(
    names: list[str],
) -> Iterator[tuple[bool, str]]:
    """按固定顺序一次领取多个锁；任一失败时自动释放已领取部分。"""
    ordered_names = sorted(set(names))
    with ExitStack() as stack:
        for name in ordered_names:
            claimed = stack.enter_context(workspace_claim(name))
            if not claimed:
                yield False, name
                return
        yield True, ""


def load_state() -> dict[str, Any]:
    if not STATE_PATH.exists():
        return {"version": 2, "jobs": {}}
    state = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    state["version"] = 2
    state.setdefault("jobs", {})
    return state


def save_state(state: dict[str, Any]) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary = STATE_PATH.with_name(
        f"{STATE_PATH.name}.{uuid.uuid4().hex}.tmp"
    )
    temporary.write_text(
        json.dumps(state, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary.replace(STATE_PATH)


def append_log(entry: dict[str, Any]) -> None:
    payload = {"timestamp": utc_now(), **entry}
    QA_DIR.mkdir(parents=True, exist_ok=True)
    with LOG_LOCK:
        with LOG_PATH.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload, ensure_ascii=False) + "\n")


def update_job_state(
    state: dict[str, Any],
    job_id: str,
    values: dict[str, Any],
) -> dict[str, Any]:
    with STATE_LOCK:
        with workspace_claim("video-state", wait_seconds=30.0) as claimed:
            if not claimed:
                raise RuntimeError("无法取得视频状态文件跨进程锁")
            disk_state = load_state()
            current = dict(disk_state["jobs"].get(job_id) or {})
            current.update(values)
            current["updated_at"] = utc_now()
            disk_state["jobs"][job_id] = current
            save_state(disk_state)
            state.clear()
            state.update(disk_state)
            return dict(current)


def refresh_job_state(
    state: dict[str, Any],
    job_id: str,
) -> dict[str, Any]:
    with STATE_LOCK:
        with workspace_claim("video-state", wait_seconds=30.0) as claimed:
            if not claimed:
                raise RuntimeError("无法取得视频状态文件跨进程锁")
            disk_state = load_state()
            state.clear()
            state.update(disk_state)
            return dict(disk_state["jobs"].get(job_id) or {})


def extract_last_frame(video_path: Path, output_path: Path) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("本机未安装 FFmpeg，无法提取视频末帧")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = output_path.with_name(
        f".{output_path.stem}.{uuid.uuid4().hex}.tmp.png"
    )
    command = [
        ffmpeg,
        "-y",
        "-sseof",
        "-0.08",
        "-i",
        str(video_path),
        "-frames:v",
        "1",
        "-compression_level",
        "3",
        str(temporary),
    ]
    completed = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=120,
        check=False,
    )
    if completed.returncode != 0 or not temporary.exists():
        temporary.unlink(missing_ok=True)
        detail = completed.stderr[-1200:].strip()
        raise RuntimeError(f"末帧提取失败: {detail}")
    temporary.replace(output_path)


def wait_for_video(
    remote_id: str,
    *,
    poll_seconds: int,
    timeout_seconds: int,
) -> dict[str, Any]:
    deadline = time.monotonic() + timeout_seconds
    while True:
        result = sync_video("tiexin-s1", remote_id)
        if result["status"] in {"completed", "failed", "cancelled", "expired"}:
            return result
        if time.monotonic() >= deadline:
            return {**result, "status": "pending_timeout"}
        time.sleep(poll_seconds)


def preserve_existing_file(
    path: Path,
    *,
    category: str,
    logical_stem: str | None = None,
) -> Path | None:
    """把旧文件移动到唯一保留路径，永不覆盖历史版本。"""
    if not path.exists():
        return None
    preserved_dir = path.parent / category
    preserved_dir.mkdir(parents=True, exist_ok=True)
    content_hash = file_sha256(path)[:12] or "unknown"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    stem = logical_stem or path.stem
    target = preserved_dir / (
        f"{stem}_{content_hash}_{timestamp}_{uuid.uuid4().hex[:8]}"
        f"{path.suffix}"
    )
    path.replace(target)
    return target


def publish_file_exclusive(temporary: Path, output_path: Path) -> bool:
    """以同卷硬链接原子发布；目标已出现时拒绝覆盖。"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        os.link(temporary, output_path)
    except FileExistsError:
        return False
    try:
        temporary.unlink()
    except OSError:
        # 硬链接已经原子发布成功，清理失败不能伪装成发布失败。
        pass
    return True


def _superseded_remote_record(
    job_state: dict[str, Any],
    *,
    reason: str,
) -> dict[str, Any]:
    return {
        "remote_id": str(job_state.get("remote_id") or ""),
        "job_version_fingerprint": job_state.get(
            "job_version_fingerprint",
            "",
        ),
        "model": job_state.get("model", ""),
        "status": job_state.get("status", ""),
        "reason": reason,
        "superseded_at": utc_now(),
    }


def compute_runtime_job_version(
    job: dict[str, Any],
    *,
    model: str,
) -> tuple[str, str]:
    input_path = Path(job["input_path"])
    input_sha256 = file_sha256(input_path)
    version_payload = dict(job["job_version_payload"])
    version_payload["input_file_sha256"] = input_sha256
    version_payload["video_model"] = model
    return stable_fingerprint(version_payload), input_sha256


def _candidate_path_from_state(
    job_state: dict[str, Any],
    *,
    output_path: Path,
) -> Path | None:
    raw_path = str(job_state.get("candidate_temp_path") or "")
    if not raw_path:
        return None
    candidate = Path(raw_path)
    try:
        if (
            candidate.resolve().parent != output_path.resolve().parent
            or candidate.resolve() == output_path.resolve()
        ):
            return None
    except OSError:
        return None
    return candidate


def _cleanup_matching_candidate(
    job_state: dict[str, Any],
    *,
    output_path: Path,
    expected_sha256: str,
) -> str:
    candidate = _candidate_path_from_state(
        job_state,
        output_path=output_path,
    )
    if (
        candidate is not None
        and candidate.exists()
        and file_sha256(candidate) == expected_sha256
    ):
        try:
            candidate.unlink(missing_ok=True)
        except OSError:
            return str(candidate)
    return ""


def _finish_published_segment(
    job: dict[str, Any],
    *,
    state: dict[str, Any],
    job_state: dict[str, Any],
    model: str,
    remote_id: str,
    source_url: str,
    runtime_job_version: str,
    output_path: Path,
    end_path: Path,
    technical: dict[str, Any],
    success_status: str,
) -> dict[str, Any]:
    output_sha256 = file_sha256(output_path)
    common_values = {
        "model": model,
        "remote_id": remote_id,
        "source_url": source_url,
        "job_version_fingerprint": runtime_job_version,
        "output_file_sha256": output_sha256,
        "technical_facts": technical["facts"],
        "technical_errors": [],
    }
    update_job_state(
        state,
        job["job_id"],
        {
            **common_values,
            "status": "published_pending_end_frame",
            "error": "",
        },
    )
    orphan_candidate_path = _cleanup_matching_candidate(
        job_state,
        output_path=output_path,
        expected_sha256=output_sha256,
    )
    candidate_values = {
        "candidate_temp_path": orphan_candidate_path,
        "candidate_file_sha256": (
            output_sha256 if orphan_candidate_path else ""
        ),
        "candidate_cleanup_warning": (
            "临时候选仍被占用，稳定输出已安全发布"
            if orphan_candidate_path
            else ""
        ),
    }
    try:
        extract_last_frame(output_path, end_path)
    except Exception as exc:
        update_job_state(
            state,
            job["job_id"],
            {
                **common_values,
                **candidate_values,
                "status": "end_frame_failed",
                "error": str(exc),
            },
        )
        return {
            "job_id": job["job_id"],
            "status": "end_frame_failed",
            "error": str(exc),
        }

    record = {
        "job_id": job["job_id"],
        "status": success_status,
        "model": model,
        "remote_id": remote_id,
        "output_path": str(output_path),
        "end_frame_path": str(end_path),
        "source_url": source_url,
    }
    update_job_state(
        state,
        job["job_id"],
        {
            **common_values,
            **candidate_values,
            "status": "generated",
            "end_frame_path": str(end_path),
            "error": "",
        },
    )
    append_log(record)
    return record


def render_segment(
    job: dict[str, Any],
    *,
    state: dict[str, Any],
    model: str,
    poll_seconds: int,
    timeout_seconds: int,
) -> dict[str, Any]:
    with workspace_claim(f"video-job-{job['job_id']}") as claimed:
        if not claimed:
            return {
                "job_id": job["job_id"],
                "status": "claimed_elsewhere",
                "error": "该视频段已被另一个工作区进程领取",
            }
        return _render_segment_claimed(
            job,
            state=state,
            model=model,
            poll_seconds=poll_seconds,
            timeout_seconds=timeout_seconds,
        )


def _render_segment_claimed(
    job: dict[str, Any],
    *,
    state: dict[str, Any],
    model: str,
    poll_seconds: int,
    timeout_seconds: int,
) -> dict[str, Any]:
    output_path = Path(job["output_path"])
    input_path = Path(job["input_path"])
    end_path = VIDEO_END_DIR / f"{job['job_id']}_end.png"
    if not input_path.exists():
        raise RuntimeError(f"承接首帧不存在: {input_path}")
    runtime_job_version, input_sha256 = compute_runtime_job_version(
        job,
        model=model,
    )

    job_state = refresh_job_state(state, job["job_id"])
    if output_path.exists():
        output_sha256 = file_sha256(output_path)
        technical = video_technical_check(
            output_path,
            duration_range=SEGMENT_DURATION_RANGE,
        )
        version_matches = bool(
            job_state.get("job_version_fingerprint")
            == runtime_job_version
            and job_state.get("output_file_sha256") == output_sha256
            and job_state.get("model") == model
        )
        validated_candidate_matches = bool(
            job_state.get("job_version_fingerprint")
            == runtime_job_version
            and job_state.get("candidate_file_sha256")
            == output_sha256
            and job_state.get("model") == model
        )
        if (
            (version_matches or validated_candidate_matches)
            and technical["valid"]
        ):
            return _finish_published_segment(
                job,
                state=state,
                job_state=job_state,
                model=model,
                remote_id=str(job_state.get("remote_id") or ""),
                source_url=str(job_state.get("source_url") or ""),
                runtime_job_version=runtime_job_version,
                output_path=output_path,
                end_path=end_path,
                technical=technical,
                success_status="skipped",
            )

        if technical["infrastructure_error"]:
            return {
                "job_id": job["job_id"],
                "status": "validation_blocked",
                "error": "; ".join(technical["errors"]),
            }
        archive_category = "stale" if not version_matches else "rejected"
        archived_output = preserve_existing_file(
            output_path,
            category=archive_category,
            logical_stem=job["job_id"],
        )
        archived_end = preserve_existing_file(
            end_path,
            category=archive_category,
            logical_stem=f"{job['job_id']}_end",
        )
        superseded = list(job_state.get("superseded") or [])
        if job_state.get("remote_id"):
            superseded.append(
                _superseded_remote_record(
                    job_state,
                    reason=(
                        "output_version_stale"
                        if not version_matches
                        else "output_technical_invalid"
                    ),
                )
            )
        job_state = update_job_state(
            state,
            job["job_id"],
            {
                "remote_id": "",
                "status": "stale_output_archived",
                "superseded": superseded,
                "archived_output_path": (
                    str(archived_output) if archived_output else ""
                ),
                "archived_end_frame_path": (
                    str(archived_end) if archived_end else ""
                ),
                "technical_errors": technical["errors"],
                "output_file_sha256": "",
                "candidate_temp_path": "",
                "candidate_file_sha256": "",
                "job_version_fingerprint": runtime_job_version,
                "model": model,
            },
        )

    elif end_path.exists():
        preserve_existing_file(
            end_path,
            category="stale",
            logical_stem=f"{job['job_id']}_end",
        )

    candidate_path = _candidate_path_from_state(
        job_state,
        output_path=output_path,
    )
    candidate_matches_version = bool(
        job_state.get("job_version_fingerprint")
        == runtime_job_version
        and job_state.get("model") == model
        and job_state.get("candidate_file_sha256")
    )
    if (
        not output_path.exists()
        and candidate_matches_version
        and candidate_path is not None
        and candidate_path.exists()
    ):
        candidate_sha256 = file_sha256(candidate_path)
        candidate_technical = video_technical_check(
            candidate_path,
            duration_range=SEGMENT_DURATION_RANGE,
        )
        if candidate_technical["infrastructure_error"]:
            return {
                "job_id": job["job_id"],
                "status": "validation_blocked",
                "error": "; ".join(candidate_technical["errors"]),
            }
        if (
            candidate_sha256
            == job_state.get("candidate_file_sha256")
            and candidate_technical["valid"]
        ):
            if publish_file_exclusive(candidate_path, output_path):
                return _finish_published_segment(
                    job,
                    state=state,
                    job_state=job_state,
                    model=model,
                    remote_id=str(
                        job_state.get("remote_id") or ""
                    ),
                    source_url=str(
                        job_state.get("source_url") or ""
                    ),
                    runtime_job_version=runtime_job_version,
                    output_path=output_path,
                    end_path=end_path,
                    technical=candidate_technical,
                    success_status="generated",
                )
            if (
                output_path.exists()
                and file_sha256(output_path) == candidate_sha256
            ):
                return _finish_published_segment(
                    job,
                    state=state,
                    job_state=job_state,
                    model=model,
                    remote_id=str(
                        job_state.get("remote_id") or ""
                    ),
                    source_url=str(
                        job_state.get("source_url") or ""
                    ),
                    runtime_job_version=runtime_job_version,
                    output_path=output_path,
                    end_path=end_path,
                    technical=candidate_technical,
                    success_status="skipped",
                )
            preserved_candidate = preserve_existing_file(
                candidate_path,
                category="publish_conflicts",
                logical_stem=job["job_id"],
            )
            update_job_state(
                state,
                job["job_id"],
                {
                    "status": "publish_conflict",
                    "candidate_temp_path": "",
                    "candidate_file_sha256": "",
                    "preserved_candidate_path": (
                        str(preserved_candidate)
                        if preserved_candidate
                        else ""
                    ),
                    "error": (
                        "恢复已验证候选时稳定输出路径被占用，未覆盖"
                    ),
                },
            )
            return {
                "job_id": job["job_id"],
                "status": "publish_conflict",
                "error": "恢复已验证候选时稳定输出路径被占用，未覆盖",
            }
        preserved_candidate = preserve_existing_file(
            candidate_path,
            category="rejected",
            logical_stem=job["job_id"],
        )
        job_state = update_job_state(
            state,
            job["job_id"],
            {
                "status": "candidate_recovery_failed",
                "candidate_temp_path": "",
                "candidate_file_sha256": "",
                "preserved_candidate_path": (
                    str(preserved_candidate)
                    if preserved_candidate
                    else ""
                ),
                "technical_errors": candidate_technical["errors"],
            },
        )

    remote_id = str(job_state.get("remote_id") or "")
    if remote_id and (
        job_state.get("job_version_fingerprint")
        != runtime_job_version
        or job_state.get("model") != model
        or job_state.get("status") in RETRYABLE_TERMINAL_STATUSES
    ):
        superseded = list(job_state.get("superseded") or [])
        reason = (
            f"remote_terminal_{job_state.get('status')}"
            if job_state.get("status") in RETRYABLE_TERMINAL_STATUSES
            else "remote_version_or_model_stale"
        )
        superseded.append(
            _superseded_remote_record(job_state, reason=reason)
        )
        job_state = update_job_state(
            state,
            job["job_id"],
            {
                "remote_id": "",
                "status": "stale_remote_task",
                "superseded": superseded,
                "job_version_fingerprint": runtime_job_version,
                "model": model,
                "error": "",
            },
        )
        remote_id = ""
    if not remote_id:
        submission_intent = dict(
            job_state.get("submission_intent") or {}
        )
        if (
            job_state.get("status") in AMBIGUOUS_SUBMISSION_STATUSES
            and submission_intent
            and not submission_intent.get("resolved_remote_id")
        ):
            return {
                "job_id": job["job_id"],
                "status": "submission_ambiguous",
                "error": (
                    "上次付费提交可能已被服务商接收，但本地没有任务号；"
                    "为避免重复扣费，禁止自动重提，需人工核对"
                ),
                "submission_attempt_id": submission_intent.get(
                    "attempt_id",
                    "",
                ),
            }
        submission_intent = {
            "attempt_id": uuid.uuid4().hex,
            "job_version_fingerprint": runtime_job_version,
            "model": model,
            "input_file_sha256": input_sha256,
            "started_at": utc_now(),
            "resolved_remote_id": "",
        }
        job_state = update_job_state(
            state,
            job["job_id"],
            {
                "remote_id": "",
                "status": "submitting",
                "model": model,
                "job_version_fingerprint": runtime_job_version,
                "input_file_sha256": input_sha256,
                "input_path": str(input_path),
                "output_path": str(output_path),
                "submission_intent": submission_intent,
                "error": "",
            },
        )
        try:
            submitted = submit_video(
                "tiexin-s1",
                model=model,
                prompt=job["prompt"],
                duration=5,
                resolution="720p",
                aspect_ratio="9:16",
                image_path=input_path,
                generate_audio=True,
            )
            remote_id = str(submitted["id"])
            if not remote_id:
                raise RuntimeError("服务商未返回视频任务号")
        except Exception as exc:
            update_job_state(
                state,
                job["job_id"],
                {
                    "status": "submission_unknown",
                    "error": str(exc),
                    "submission_intent": submission_intent,
                },
            )
            append_log({
                "job_id": job["job_id"],
                "status": "submission_unknown",
                "model": model,
                "submission_attempt_id": submission_intent[
                    "attempt_id"
                ],
                "error": str(exc),
            })
            return {
                "job_id": job["job_id"],
                "status": "submission_ambiguous",
                "error": (
                    "付费提交结果不确定，已阻止自动重试: "
                    f"{exc}"
                ),
                "submission_attempt_id": submission_intent[
                    "attempt_id"
                ],
            }
        submission_intent["resolved_remote_id"] = remote_id
        submission_intent["resolved_at"] = utc_now()
        job_state = update_job_state(
            state,
            job["job_id"],
            {
                "remote_id": remote_id,
                "status": submitted["status"],
                "model": model,
                "job_version_fingerprint": runtime_job_version,
                "input_file_sha256": input_sha256,
                "input_path": str(input_path),
                "output_path": str(output_path),
                "submission_intent": submission_intent,
                "submitted_at": utc_now(),
            },
        )
        append_log({
            "job_id": job["job_id"],
            "status": "submitted",
            "model": model,
            "remote_id": remote_id,
        })

    result = wait_for_video(
        remote_id,
        poll_seconds=poll_seconds,
        timeout_seconds=timeout_seconds,
    )
    job_state = update_job_state(
        state,
        job["job_id"],
        {
            "status": result["status"],
            "usage": result.get("usage") or {},
            "error": result.get("error") or "",
        },
    )
    if result["status"] != "completed":
        if result["status"] in RETRYABLE_TERMINAL_STATUSES:
            superseded = list(job_state.get("superseded") or [])
            superseded.append(
                _superseded_remote_record(
                    job_state,
                    reason=f"remote_terminal_{result['status']}",
                )
            )
            job_state = update_job_state(
                state,
                job["job_id"],
                {
                    "remote_id": "",
                    "last_remote_id": remote_id,
                    "status": result["status"],
                    "superseded": superseded,
                },
            )
        append_log({
            "job_id": job["job_id"],
            "status": result["status"],
            "remote_id": remote_id,
            "error": result.get("error") or "",
        })
        return {
            "job_id": job["job_id"],
            "status": result["status"],
            "remote_id": remote_id,
            "usage": result.get("usage") or {},
        }

    source_path = _local_upload_path(result["url"])
    if source_path is None:
        raise RuntimeError(f"无法映射生成视频: {result['url']}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = output_path.with_name(
        f".{output_path.stem}.{uuid.uuid4().hex}.download.mp4"
    )
    try:
        shutil.copy2(source_path, temporary)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise
    technical = video_technical_check(
        temporary,
        duration_range=SEGMENT_DURATION_RANGE,
    )
    if not technical["valid"]:
        category = (
            "pending_validation"
            if technical["infrastructure_error"]
            else "rejected"
        )
        preserved = preserve_existing_file(
            temporary,
            category=category,
            logical_stem=job["job_id"],
        )
        values: dict[str, Any] = {
            "status": (
                "validation_blocked"
                if technical["infrastructure_error"]
                else "technical_failed"
            ),
            "technical_errors": technical["errors"],
            "preserved_candidate_path": (
                str(preserved) if preserved else ""
            ),
        }
        if not technical["infrastructure_error"]:
            current = refresh_job_state(state, job["job_id"])
            superseded = list(current.get("superseded") or [])
            superseded.append(
                _superseded_remote_record(
                    current,
                    reason="remote_output_technical_invalid",
                )
            )
            values.update({
                "remote_id": "",
                "last_remote_id": remote_id,
                "superseded": superseded,
            })
        update_job_state(state, job["job_id"], values)
        return {
            "job_id": job["job_id"],
            "status": values["status"],
            "error": "; ".join(technical["errors"]),
            "preserved_candidate_path": (
                str(preserved) if preserved else ""
            ),
        }

    candidate_sha256 = file_sha256(temporary)
    job_state = update_job_state(
        state,
        job["job_id"],
        {
            "status": "candidate_validated",
            "model": model,
            "remote_id": remote_id,
            "source_url": result["url"],
            "job_version_fingerprint": runtime_job_version,
            "candidate_temp_path": str(temporary),
            "candidate_file_sha256": candidate_sha256,
            "technical_facts": technical["facts"],
            "technical_errors": [],
            "error": "",
        },
    )
    if not publish_file_exclusive(temporary, output_path):
        preserved = preserve_existing_file(
            temporary,
            category="publish_conflicts",
            logical_stem=job["job_id"],
        )
        update_job_state(
            state,
            job["job_id"],
            {
                "status": "publish_conflict",
                "candidate_temp_path": "",
                "candidate_file_sha256": "",
                "error": "发布时稳定输出路径已被其他进程占用，未覆盖",
                "preserved_candidate_path": (
                    str(preserved) if preserved else ""
                ),
            },
        )
        return {
            "job_id": job["job_id"],
            "status": "publish_conflict",
            "error": "发布时稳定输出路径已被其他进程占用，未覆盖",
        }

    record = _finish_published_segment(
        job,
        state=state,
        job_state=job_state,
        model=model,
        remote_id=remote_id,
        source_url=result["url"],
        runtime_job_version=runtime_job_version,
        output_path=output_path,
        end_path=end_path,
        technical=technical,
        success_status="generated",
    )
    if record["status"] == "generated":
        record["usage"] = result.get("usage") or {}
    return record


def render_g_unit(
    jobs: list[dict[str, Any]],
    *,
    state: dict[str, Any],
    model: str,
    poll_seconds: int,
    timeout_seconds: int,
) -> list[dict[str, Any]]:
    results = []
    for job in sorted(jobs, key=lambda item: item["segment"]):
        result = render_segment(
            job,
            state=state,
            model=model,
            poll_seconds=poll_seconds,
            timeout_seconds=timeout_seconds,
        )
        results.append(result)
        if result["status"] not in {"generated", "skipped"}:
            break
    return results


def has_audio_stream(path: Path) -> bool:
    return bool(
        video_technical_check(
            path,
            duration_range=None,
        )["facts"].get("has_audio")
    )


def video_technical_check(
    path: Path,
    *,
    duration_range: tuple[float, float] | None,
) -> dict[str, Any]:
    """返回可诊断的媒体检查结果，区分素材失败与本机工具缺失。"""
    facts: dict[str, Any] = {
        "path": str(path),
        "width": 0,
        "height": 0,
        "duration_seconds": 0.0,
        "has_audio": False,
    }
    errors: list[str] = []
    if not path.exists():
        return {
            "valid": False,
            "facts": facts,
            "errors": [f"文件不存在: {path}"],
            "infrastructure_error": False,
        }
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        return {
            "valid": False,
            "facts": facts,
            "errors": ["本机未安装 ffprobe，无法验证视频技术规格"],
            "infrastructure_error": True,
        }
    try:
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
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {
            "valid": False,
            "facts": facts,
            "errors": [f"ffprobe 执行失败: {exc}"],
            "infrastructure_error": True,
        }
    if completed.returncode != 0:
        detail = completed.stderr[-1200:].strip()
        return {
            "valid": False,
            "facts": facts,
            "errors": [f"ffprobe 无法读取视频: {detail}"],
            "infrastructure_error": False,
        }
    try:
        data = json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        return {
            "valid": False,
            "facts": facts,
            "errors": [f"ffprobe 输出不是有效 JSON: {exc}"],
            "infrastructure_error": True,
        }
    if not isinstance(data, dict):
        return {
            "valid": False,
            "facts": facts,
            "errors": ["ffprobe JSON 顶层结构异常"],
            "infrastructure_error": True,
        }
    streams_raw = data.get("streams") or []
    streams = (
        [item for item in streams_raw if isinstance(item, dict)]
        if isinstance(streams_raw, list)
        else []
    )
    video = next(
        (
            item
            for item in streams
            if item.get("codec_type") == "video"
        ),
        {},
    )
    format_data = data.get("format") or {}
    if not isinstance(format_data, dict):
        format_data = {}
    duration_raw = format_data.get("duration")
    try:
        duration = float(duration_raw) if duration_raw else 0.0
    except (TypeError, ValueError):
        duration = 0.0
    try:
        width = int(video.get("width") or 0)
    except (TypeError, ValueError):
        width = 0
    try:
        height = int(video.get("height") or 0)
    except (TypeError, ValueError):
        height = 0
    facts.update({
        "width": width,
        "height": height,
        "duration_seconds": duration,
        "has_audio": any(
            item.get("codec_type") == "audio" for item in streams
        ),
    })
    if facts["width"] != 720 or facts["height"] != 1280:
        errors.append(
            "分辨率必须严格为 720x1280，"
            f"实际为 {facts['width']}x{facts['height']}"
        )
    if duration_range is not None:
        minimum, maximum = duration_range
        if not minimum <= duration <= maximum:
            errors.append(
                f"时长必须在 {minimum:.1f}–{maximum:.1f} 秒，"
                f"实际为 {duration:.3f} 秒"
            )
    if not facts["has_audio"]:
        errors.append("缺少音频流")
    return {
        "valid": not errors,
        "facts": facts,
        "errors": errors,
        "infrastructure_error": False,
    }


def video_technical_valid(path: Path) -> bool:
    return bool(
        video_technical_check(
            path,
            duration_range=SEGMENT_DURATION_RANGE,
        )["valid"]
    )


def assess_video_job(
    job: dict[str, Any],
    *,
    state: dict[str, Any],
    model: str,
) -> dict[str, Any]:
    """基于磁盘现状判断某段是否可复用，不能信任旧 manifest 快照。"""
    output_path = Path(job["output_path"])
    record = state.get("jobs", {}).get(job["job_id"], {})
    runtime_version, input_sha256 = compute_runtime_job_version(
        job,
        model=model,
    )
    assessment: dict[str, Any] = {
        "job_id": job["job_id"],
        "status": "missing",
        "needs_render": True,
        "runtime_job_version": runtime_version,
        "input_file_sha256": input_sha256,
        "output_file_sha256": "",
        "technical": None,
        "reasons": [],
    }
    if not output_path.exists():
        assessment["reasons"].append("稳定输出文件缺失")
        return assessment

    output_sha256 = file_sha256(output_path)
    technical = video_technical_check(
        output_path,
        duration_range=SEGMENT_DURATION_RANGE,
    )
    assessment["output_file_sha256"] = output_sha256
    assessment["technical"] = technical
    if technical["infrastructure_error"]:
        assessment.update({
            "status": "validation_blocked",
            "needs_render": False,
            "reasons": list(technical["errors"]),
        })
        return assessment
    if not technical["valid"]:
        assessment.update({
            "status": "technical_invalid",
            "reasons": list(technical["errors"]),
        })
        return assessment

    mismatch_reasons = []
    if record.get("job_version_fingerprint") != runtime_version:
        mismatch_reasons.append("任务版本指纹陈旧")
    if record.get("output_file_sha256") != output_sha256:
        mismatch_reasons.append("状态中的输出哈希与磁盘不一致")
    if record.get("model") != model:
        mismatch_reasons.append("生成模型与本次请求不一致")
    if mismatch_reasons:
        assessment.update({
            "status": "stale",
            "reasons": mismatch_reasons,
        })
        return assessment

    assessment.update({
        "status": "current",
        "needs_render": False,
        "reasons": [],
    })
    return assessment


def select_pending_groups(
    manifest: dict[str, Any],
    *,
    state: dict[str, Any],
    model: str,
    limit: int,
) -> tuple[
    list[list[dict[str, Any]]],
    list[dict[str, Any]],
]:
    """挑选存在缺失/陈旧段的 G 单元，并为未入队单元给出明确阻塞。"""
    grouped: dict[str, list[dict[str, Any]]] = {}
    for job in manifest["video_jobs"]:
        grouped.setdefault(
            f"EP{job['episode']:02d}_{job['g_unit']}",
            [],
        ).append(job)

    pending: list[list[dict[str, Any]]] = []
    blocked: list[dict[str, Any]] = []
    ffprobe_available = bool(shutil.which("ffprobe"))
    ffmpeg_available = bool(shutil.which("ffmpeg"))
    for group_key, jobs in grouped.items():
        jobs.sort(key=lambda item: item["segment"])
        assessments = [
            assess_video_job(job, state=state, model=model)
            for job in jobs
        ]
        work_items = [
            (job, assessment)
            for job, assessment in zip(jobs, assessments)
            if assessment["status"] != "current"
        ]
        if not work_items:
            continue

        reasons: list[str] = []
        dependencies = sorted({
            dependency
            for job, assessment in work_items
            if assessment["needs_render"]
            for dependency in job.get("blocked_dependencies") or []
        })
        reasons.extend(dependencies)
        if not Path(jobs[0]["input_path"]).exists():
            reasons.append(
                f"起始首帧缺失: {jobs[0]['input_path']}"
            )
        validation_blocks = [
            reason
            for _, assessment in work_items
            if assessment["status"] == "validation_blocked"
            for reason in assessment["reasons"]
        ]
        reasons.extend(validation_blocks)
        if not ffprobe_available:
            reasons.append("本机未安装 ffprobe，拒绝启动付费生成")
        if not ffmpeg_available:
            reasons.append("本机未安装 FFmpeg，无法提取视频末帧")
        if reasons:
            blocked.append({
                "g_unit": group_key,
                "blocked_dependencies": sorted(set(reasons)),
                "segment_statuses": {
                    assessment["job_id"]: assessment["status"]
                    for assessment in assessments
                },
            })
            continue
        if len(pending) < limit:
            pending.append(jobs)

    return pending, blocked


def load_composition_state() -> dict[str, Any]:
    if not COMPOSITION_STATE_PATH.exists():
        return {"version": 1, "episodes": {}}
    state = json.loads(
        COMPOSITION_STATE_PATH.read_text(encoding="utf-8")
    )
    state.setdefault("episodes", {})
    return state


def save_composition_state(state: dict[str, Any]) -> None:
    COMPOSITION_STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary = COMPOSITION_STATE_PATH.with_name(
        f"{COMPOSITION_STATE_PATH.name}.{uuid.uuid4().hex}.tmp"
    )
    temporary.write_text(
        json.dumps(state, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary.replace(COMPOSITION_STATE_PATH)


def update_composition_record(
    episode_key: str,
    values: dict[str, Any],
) -> dict[str, Any]:
    with workspace_claim(
        "composition-state",
        wait_seconds=30.0,
    ) as claimed:
        if not claimed:
            raise RuntimeError("无法取得成片状态文件跨进程锁")
        state = load_composition_state()
        current = dict(state["episodes"].get(episode_key) or {})
        current.update(values)
        current["updated_at"] = utc_now()
        state["episodes"][episode_key] = current
        save_composition_state(state)
        return current


def validate_episode_sources(
    jobs: list[dict[str, Any]],
    *,
    model: str,
    expected_snapshot: list[dict[str, Any]] | None = None,
) -> tuple[list[dict[str, Any]], list[str]]:
    """重新读取状态、审批和磁盘，生成可用于抗 TOCTOU 的来源快照。"""
    if len(jobs) != 18:
        return [], [f"视频段数量必须为 18，实际为 {len(jobs)}"]
    try:
        state = load_state()
    except (OSError, json.JSONDecodeError) as exc:
        return [], [f"无法读取视频状态: {exc}"]
    try:
        approvals = load_delivery_approvals()
    except (OSError, json.JSONDecodeError) as exc:
        return [], [f"无法读取交付审批: {exc}"]

    snapshot: list[dict[str, Any]] = []
    errors: list[str] = []
    for job in jobs:
        job_id = job["job_id"]
        for dependency in job.get("blocked_dependencies") or []:
            errors.append(f"{job_id}: 上游审核阻塞：{dependency}")
        path = Path(job["output_path"])
        if not path.exists():
            errors.append(f"{job_id}: 稳定输出文件缺失")
            continue
        output_sha256 = file_sha256(path)
        runtime_version, input_sha256 = compute_runtime_job_version(
            job,
            model=model,
        )
        record = state.get("jobs", {}).get(job_id, {})
        if record.get("job_version_fingerprint") != runtime_version:
            errors.append(f"{job_id}: 视频状态的任务版本已陈旧")
        if record.get("output_file_sha256") != output_sha256:
            errors.append(f"{job_id}: 视频状态哈希与磁盘不一致")
        if record.get("model") != model:
            errors.append(f"{job_id}: 视频状态中的生成模型不一致")

        technical = video_technical_check(
            path,
            duration_range=SEGMENT_DURATION_RANGE,
        )
        for detail in technical["errors"]:
            errors.append(f"{job_id}: {detail}")

        approval = (
            approvals.get("video_segments", {}).get(job_id, {})
        )
        try:
            relative_path = project_relative(path)
        except ValueError:
            relative_path = ""
        if approval.get("status") != "approved":
            errors.append(f"{job_id}: 交付审批未通过")
        if approval.get("path") != relative_path:
            errors.append(f"{job_id}: 交付审批路径不匹配")
        if approval.get("file_sha256") != output_sha256:
            errors.append(f"{job_id}: 交付审批哈希已陈旧")
        if (
            approval.get("job_version_fingerprint")
            != runtime_version
        ):
            errors.append(f"{job_id}: 交付审批任务版本已陈旧")

        snapshot.append({
            "job_id": job_id,
            "path": str(path),
            "input_file_sha256": input_sha256,
            "file_sha256": output_sha256,
            "job_version_fingerprint": runtime_version,
            "model": model,
            "approval": {
                "status": approval.get("status", ""),
                "path": approval.get("path", ""),
                "file_sha256": approval.get("file_sha256", ""),
                "job_version_fingerprint": approval.get(
                    "job_version_fingerprint",
                    "",
                ),
            },
            "technical_facts": technical["facts"],
        })

    if errors:
        return snapshot, errors
    if expected_snapshot is not None and (
        stable_fingerprint(snapshot)
        != stable_fingerprint(expected_snapshot)
    ):
        return snapshot, [
            "合成期间视频段、状态或交付审批发生变化，拒绝发布成片"
        ]
    return snapshot, []


def compose_episode(
    episode: int,
    jobs: list[dict[str, Any]],
    *,
    model: str,
    source_snapshot: list[dict[str, Any]],
    dependency_fingerprint: str,
) -> Path:
    episode_key = f"EP{episode:02d}"
    claim_names = [
        f"episode-{episode_key}",
        *[f"video-job-{job['job_id']}" for job in jobs],
    ]
    with workspace_claim_many(claim_names) as (
        claimed,
        failed_claim,
    ):
        if not claimed:
            raise RuntimeError(
                f"{episode_key} 合成所需锁已被其他进程占用: "
                f"{failed_claim}"
            )
        paths = [Path(job["output_path"]) for job in jobs]
        if len(paths) != 18 or not all(path.exists() for path in paths):
            raise RuntimeError(f"{episode_key} 不是完整的 18 段")

        confirmed_snapshot, snapshot_errors = validate_episode_sources(
            jobs,
            model=model,
            expected_snapshot=source_snapshot,
        )
        if snapshot_errors:
            raise RuntimeError(
                f"{episode_key} 合成前复核失败: "
                + "; ".join(snapshot_errors)
            )
        if (
            stable_fingerprint(confirmed_snapshot)
            != stable_fingerprint(source_snapshot)
        ):
            raise RuntimeError(
                f"{episode_key} 合成前来源快照发生变化"
            )

        output_path = EPISODE_DIR / f"{episode_key}.mp4"
        composition_state = load_composition_state()
        record = composition_state["episodes"].get(episode_key, {})
        existing_hash = (
            file_sha256(output_path) if output_path.exists() else ""
        )
        recorded_output_matches = bool(
            existing_hash
            and record.get("dependency_fingerprint")
            == dependency_fingerprint
            and record.get("output_file_sha256") == existing_hash
        )
        validated_candidate_matches = bool(
            existing_hash
            and record.get("dependency_fingerprint")
            == dependency_fingerprint
            and record.get("candidate_file_sha256") == existing_hash
        )
        if recorded_output_matches or validated_candidate_matches:
            current_check = video_technical_check(
                output_path,
                duration_range=EPISODE_DURATION_RANGE,
            )
            if current_check["valid"]:
                orphan_candidate_path = ""
                if validated_candidate_matches:
                    orphan_candidate_path = _cleanup_matching_candidate(
                        record,
                        output_path=output_path,
                        expected_sha256=existing_hash,
                    )
                if (
                    record.get("status") != "composed"
                    or validated_candidate_matches
                ):
                    update_composition_record(
                        episode_key,
                        {
                            "status": "composed",
                            "dependency_fingerprint": (
                                dependency_fingerprint
                            ),
                            "output_path": str(output_path),
                            "output_file_sha256": existing_hash,
                            "candidate_temp_path": (
                                orphan_candidate_path
                            ),
                            "candidate_file_sha256": (
                                existing_hash
                                if orphan_candidate_path
                                else ""
                            ),
                            "candidate_cleanup_warning": (
                                "成片临时候选仍被占用"
                                if orphan_candidate_path
                                else ""
                            ),
                            "segment_files": source_snapshot,
                            "technical_facts": current_check["facts"],
                            "recovered_at": utc_now(),
                        },
                    )
                return output_path
            if current_check["infrastructure_error"]:
                raise RuntimeError(
                    f"{episode_key} 无法复核现有成片: "
                    + "; ".join(current_check["errors"])
                )

        composition_candidate = _candidate_path_from_state(
            record,
            output_path=output_path,
        )
        if (
            not output_path.exists()
            and record.get("dependency_fingerprint")
            == dependency_fingerprint
            and record.get("candidate_file_sha256")
            and composition_candidate is not None
            and composition_candidate.exists()
        ):
            candidate_hash = file_sha256(composition_candidate)
            candidate_check = video_technical_check(
                composition_candidate,
                duration_range=EPISODE_DURATION_RANGE,
            )
            if candidate_check["infrastructure_error"]:
                raise RuntimeError(
                    f"{episode_key} 无法复核待恢复候选: "
                    + "; ".join(candidate_check["errors"])
                )
            if (
                candidate_hash
                == record.get("candidate_file_sha256")
                and candidate_check["valid"]
            ):
                _, recovery_errors = validate_episode_sources(
                    jobs,
                    model=model,
                    expected_snapshot=source_snapshot,
                )
                if recovery_errors:
                    raise RuntimeError(
                        f"{episode_key} 恢复候选前来源复核失败: "
                        + "; ".join(recovery_errors)
                    )
                if not publish_file_exclusive(
                    composition_candidate,
                    output_path,
                ):
                    raise RuntimeError(
                        f"{episode_key} 恢复候选时目标被占用，拒绝覆盖"
                    )
                output_sha256 = file_sha256(output_path)
                orphan_candidate_path = (
                    str(composition_candidate)
                    if composition_candidate.exists()
                    else ""
                )
                update_composition_record(
                    episode_key,
                    {
                        "status": "composed",
                        "dependency_fingerprint": (
                            dependency_fingerprint
                        ),
                        "output_path": str(output_path),
                        "output_file_sha256": output_sha256,
                        "candidate_temp_path": (
                            orphan_candidate_path
                        ),
                        "candidate_file_sha256": (
                            output_sha256
                            if orphan_candidate_path
                            else ""
                        ),
                        "candidate_cleanup_warning": (
                            "成片临时候选仍被占用"
                            if orphan_candidate_path
                            else ""
                        ),
                        "segment_files": source_snapshot,
                        "technical_facts": candidate_check["facts"],
                        "recovered_at": utc_now(),
                    },
                )
                append_log({
                    "job_id": episode_key,
                    "status": "composition_candidate_recovered",
                    "output_path": str(output_path),
                    "clip_count": len(paths),
                    "audio_preserved": True,
                })
                return output_path
            preserved_candidate = preserve_existing_file(
                composition_candidate,
                category="rejected",
                logical_stem=episode_key,
            )
            update_composition_record(
                episode_key,
                {
                    "status": "candidate_recovery_failed",
                    "candidate_temp_path": "",
                    "candidate_file_sha256": "",
                    "preserved_candidate_path": (
                        str(preserved_candidate)
                        if preserved_candidate
                        else ""
                    ),
                    "technical_errors": candidate_check["errors"],
                },
            )

        ffmpeg = shutil.which("ffmpeg")
        if not ffmpeg:
            raise RuntimeError("本机未安装 FFmpeg，无法合成单集")
        EPISODE_DIR.mkdir(parents=True, exist_ok=True)
        temporary = output_path.with_name(
            f".{output_path.stem}.{uuid.uuid4().hex}.compose.mp4"
        )
        command = [ffmpeg, "-y"]
        for path in paths:
            command.extend(["-i", str(path)])
        filters = [
            f"[{index}:v]scale=720:1280:"
            "force_original_aspect_ratio=decrease,"
            "pad=720:1280:(ow-iw)/2:(oh-ih)/2:black,"
            "fps=30,setsar=1,setpts=PTS-STARTPTS"
            f"[v{index}]"
            for index in range(len(paths))
        ]
        filters.extend(
            f"[{index}:a]aresample=48000,"
            f"asetpts=PTS-STARTPTS[a{index}]"
            for index in range(len(paths))
        )
        inputs = "".join(
            f"[v{index}][a{index}]"
            for index in range(len(paths))
        )
        filters.append(
            inputs + f"concat=n={len(paths)}:v=1:a=1[outv][outa]"
        )
        command.extend([
            "-filter_complex",
            ";".join(filters),
            "-map",
            "[outv]",
            "-map",
            "[outa]",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "20",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(temporary),
        ])
        completed = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=1800,
            check=False,
        )
        if completed.returncode != 0 or not temporary.exists():
            temporary.unlink(missing_ok=True)
            detail = completed.stderr[-1600:].strip()
            raise RuntimeError(f"{episode_key} 合成失败: {detail}")

        final_check = video_technical_check(
            temporary,
            duration_range=EPISODE_DURATION_RANGE,
        )
        if not final_check["valid"]:
            preserved = preserve_existing_file(
                temporary,
                category="rejected",
                logical_stem=episode_key,
            )
            raise RuntimeError(
                f"{episode_key} 成片技术验收失败: "
                + "; ".join(final_check["errors"])
                + (
                    f"；候选保留于 {preserved}"
                    if preserved
                    else ""
                )
            )

        candidate_sha256 = file_sha256(temporary)
        update_composition_record(
            episode_key,
            {
                "status": "candidate_validated",
                "dependency_fingerprint": dependency_fingerprint,
                "candidate_temp_path": str(temporary),
                "candidate_file_sha256": candidate_sha256,
                "segment_files": source_snapshot,
                "technical_facts": final_check["facts"],
                "error": "",
            },
        )
        _, post_errors = validate_episode_sources(
            jobs,
            model=model,
            expected_snapshot=source_snapshot,
        )
        if post_errors:
            preserved = preserve_existing_file(
                temporary,
                category="source_changed",
                logical_stem=episode_key,
            )
            update_composition_record(
                episode_key,
                {
                    "status": "source_changed",
                    "candidate_temp_path": "",
                    "candidate_file_sha256": "",
                    "preserved_candidate_path": (
                        str(preserved) if preserved else ""
                    ),
                    "error": "; ".join(post_errors),
                },
            )
            raise RuntimeError(
                f"{episode_key} 合成完成后来源复核失败: "
                + "; ".join(post_errors)
                + (
                    f"；候选保留于 {preserved}"
                    if preserved
                    else ""
                )
            )
        if output_path.exists():
            current_disk_hash = file_sha256(output_path)
            if not existing_hash or current_disk_hash != existing_hash:
                preserved = preserve_existing_file(
                    temporary,
                    category="publish_conflicts",
                    logical_stem=episode_key,
                )
                update_composition_record(
                    episode_key,
                    {
                        "status": "publish_conflict",
                        "candidate_temp_path": "",
                        "candidate_file_sha256": "",
                        "preserved_candidate_path": (
                            str(preserved) if preserved else ""
                        ),
                        "error": (
                            "发布前稳定输出被并发修改，拒绝覆盖"
                        ),
                    },
                )
                raise RuntimeError(
                    f"{episode_key} 发布前稳定输出被并发修改，拒绝覆盖"
                    + (
                        f"；候选保留于 {preserved}"
                        if preserved
                        else ""
                    )
                )
            preserve_existing_file(
                output_path,
                category="archive",
                logical_stem=episode_key,
            )
        if not publish_file_exclusive(temporary, output_path):
            preserved = preserve_existing_file(
                temporary,
                category="publish_conflicts",
                logical_stem=episode_key,
            )
            update_composition_record(
                episode_key,
                {
                    "status": "publish_conflict",
                    "candidate_temp_path": "",
                    "candidate_file_sha256": "",
                    "preserved_candidate_path": (
                        str(preserved) if preserved else ""
                    ),
                    "error": "发布时目标被占用，拒绝覆盖",
                },
            )
            raise RuntimeError(
                f"{episode_key} 发布时目标被占用，拒绝覆盖"
                + (
                    f"；候选保留于 {preserved}"
                    if preserved
                    else ""
                )
            )

        output_sha256 = file_sha256(output_path)
        orphan_candidate_path = (
            str(temporary) if temporary.exists() else ""
        )
        update_composition_record(
            episode_key,
            {
                "status": "published_pending_final_check",
                "dependency_fingerprint": dependency_fingerprint,
                "output_path": str(output_path),
                "output_file_sha256": output_sha256,
                "candidate_temp_path": orphan_candidate_path,
                "candidate_file_sha256": (
                    output_sha256 if orphan_candidate_path else ""
                ),
                "candidate_cleanup_warning": (
                    "成片临时候选仍被占用"
                    if orphan_candidate_path
                    else ""
                ),
                "segment_files": source_snapshot,
                "technical_facts": final_check["facts"],
                "error": "",
            },
        )
        published_check = video_technical_check(
            output_path,
            duration_range=EPISODE_DURATION_RANGE,
        )
        if not published_check["valid"]:
            raise RuntimeError(
                f"{episode_key} 发布后技术复核失败: "
                + "; ".join(published_check["errors"])
            )
        update_composition_record(
            episode_key,
            {
                "status": "composed",
                "dependency_fingerprint": dependency_fingerprint,
                "output_path": str(output_path),
                "output_file_sha256": output_sha256,
                "segment_files": source_snapshot,
                "technical_facts": published_check["facts"],
                "composed_at": utc_now(),
            },
        )
        append_log({
            "job_id": episode_key,
            "status": "composed",
            "output_path": str(output_path),
            "clip_count": len(paths),
            "audio_preserved": True,
        })
        return output_path


def compose_ready_episodes(
    manifest: dict[str, Any],
    *,
    model: str,
    blockers: list[dict[str, Any]] | None = None,
) -> list[str]:
    composed: list[str] = []
    blocker_records = blockers if blockers is not None else []
    for episode in range(1, 13):
        jobs = [
            job
            for job in manifest["video_jobs"]
            if job["episode"] == episode
        ]
        jobs.sort(
            key=lambda job: (
                int(job["g_unit"][1:]),
                job["segment"],
            )
        )
        source_snapshot, source_errors = validate_episode_sources(
            jobs,
            model=model,
        )
        if source_errors:
            blocker_records.append({
                "episode": f"EP{episode:02d}",
                "reason_count": len(source_errors),
                "reasons": source_errors,
            })
            continue
        dependency_fingerprint = stable_fingerprint([
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
        try:
            output = compose_episode(
                episode,
                jobs,
                model=model,
                source_snapshot=source_snapshot,
                dependency_fingerprint=dependency_fingerprint,
            )
        except Exception as exc:
            blocker_records.append({
                "episode": f"EP{episode:02d}",
                "reason_count": 1,
                "reasons": [str(exc)],
            })
            continue
        composed.append(str(output))
    return composed


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--g-units",
        type=int,
        required=True,
        help="本次最多生产多少个待完成 G 单元",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=1,
        choices=range(1, 5),
        metavar="1-4",
    )
    parser.add_argument("--video-model", default=DEFAULT_VIDEO_MODEL)
    parser.add_argument("--poll-seconds", type=int, default=15)
    parser.add_argument("--timeout-seconds", type=int, default=1800)
    parser.add_argument(
        "--confirm-external-upload",
        action="store_true",
        help="明确同意把本地首帧和提示词发送给 OpenRouter，并产生模型费用",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.g_units < 1:
        raise SystemExit("--g-units 必须大于 0")
    if not args.confirm_external_upload:
        raise SystemExit(
            "未提交任何任务：必须显式传入 --confirm-external-upload，"
            "以确认素材外传和付费生成。"
        )

    manifest = build_manifest(video_model=args.video_model)
    state = load_state()
    pending_groups, blocked_groups = select_pending_groups(
        manifest,
        state=state,
        model=args.video_model,
        limit=args.g_units,
    )
    results: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        futures = {
            executor.submit(
                render_g_unit,
                jobs,
                state=state,
                model=args.video_model,
                poll_seconds=max(5, args.poll_seconds),
                timeout_seconds=max(60, args.timeout_seconds),
            ): jobs
            for jobs in pending_groups
        }
        for future in as_completed(futures):
            try:
                unit_results = future.result()
            except Exception as exc:
                unit_results = [{
                    "job_id": futures[future][0]["job_id"].rsplit("_", 1)[0],
                    "status": "failed",
                    "error": str(exc),
                }]
            results.extend(unit_results)
            print(json.dumps(unit_results, ensure_ascii=False), flush=True)

    refreshed_manifest, status = write_manifest_and_status(
        video_model=args.video_model,
    )
    composition_blockers: list[dict[str, Any]] = []
    composed = compose_ready_episodes(
        refreshed_manifest,
        model=args.video_model,
        blockers=composition_blockers,
    )
    if composed:
        _, status = write_manifest_and_status(
            video_model=args.video_model,
        )
    result_status_counts: dict[str, int] = {}
    for item in results:
        item_status = str(item.get("status") or "unknown")
        result_status_counts[item_status] = (
            result_status_counts.get(item_status, 0) + 1
        )
    generation_blockers = [
        {
            key: item[key]
            for key in (
                "job_id",
                "status",
                "error",
                "remote_id",
                "submission_attempt_id",
            )
            if key in item
        }
        for item in results
        if item.get("status") not in {"generated", "skipped"}
    ]
    print(json.dumps({
        "batch": {
            "g_units_requested": len(pending_groups),
            "segments_generated": sum(
                item["status"] == "generated" for item in results
            ),
            "segments_failed": sum(
                item["status"] in {"failed", "cancelled", "expired"}
                for item in results
            ),
            "segments_incomplete": len(generation_blockers),
            "segment_status_counts": result_status_counts,
            "episodes_composed": composed,
        },
        "blocked": blocked_groups,
        "generation_blocked": generation_blockers,
        "composition_blocked": composition_blockers,
        "status": status,
    }, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
