"""按审核后的三视图与场景设定生成《铁心恋人》逐镜分镜图。

本执行器只处理 ``ready_for_generation=true`` 的任务。角色三视图或场景包
未批准时，即使传入外传确认开关，也不会向 OpenRouter 提交任何请求。

示例：
    python scripts/render_tiexin_storyboards.py --storyboards 6 \
        --concurrency 2 --confirm-external-upload
"""

from __future__ import annotations

import argparse
import json
import shutil
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.services.openrouter_media import _local_upload_path, generate_image
from prepare_tiexin_media import (
    QA_DIR,
    build_manifest,
    write_manifest_and_status,
)


DEFAULT_IMAGE_MODEL = "bytedance-seed/seedream-4.5"
LOG_PATH = QA_DIR / "storyboard_generation_log.jsonl"
LOG_LOCK = threading.Lock()


def append_log(entry: dict[str, Any]) -> None:
    QA_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **entry,
    }
    with LOG_LOCK:
        with LOG_PATH.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload, ensure_ascii=False) + "\n")


def render_storyboard(
    job: dict[str, Any],
    model: str,
) -> dict[str, Any]:
    output_path = Path(job["output_path"])
    if output_path.exists():
        return {"job_id": job["job_id"], "status": "skipped"}
    if not job["ready_for_generation"]:
        return {
            "job_id": job["job_id"],
            "status": "blocked",
            "blocked_dependencies": job["blocked_dependencies"],
        }
    try:
        result = generate_image(
            "tiexin-s1",
            model=model,
            prompt=job["prompt"],
            resolution="1K",
            aspect_ratio="9:16",
            reference_paths=[
                Path(path) for path in job["reference_paths"]
            ],
        )
        source_path = _local_upload_path(result["url"])
        if source_path is None:
            raise RuntimeError(f"无法映射生成图片: {result['url']}")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, output_path)
        record = {
            "job_id": job["job_id"],
            "status": "generated",
            "model": model,
            "output_path": str(output_path),
            "source_url": result["url"],
            "usage": result.get("usage") or {},
        }
        append_log(record)
        return record
    except Exception as exc:
        record = {
            "job_id": job["job_id"],
            "status": "failed",
            "model": model,
            "error": str(exc),
        }
        append_log(record)
        return record


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--storyboards",
        type=int,
        required=True,
        help="本次最多生成多少张待完成逐镜分镜图",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=2,
        choices=range(1, 5),
        metavar="1-4",
    )
    parser.add_argument("--image-model", default=DEFAULT_IMAGE_MODEL)
    parser.add_argument(
        "--confirm-external-upload",
        action="store_true",
        help="明确同意把本地角色/场景参考图和分镜提示词发送给 OpenRouter",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.storyboards < 1:
        raise SystemExit("--storyboards 必须大于 0")
    if not args.confirm_external_upload:
        raise SystemExit(
            "未生成分镜：必须显式传入 --confirm-external-upload，"
            "以确认素材外传和付费生成。"
        )

    manifest = build_manifest()
    pending = [
        job
        for job in manifest["storyboard_jobs"]
        if job["status"] == "pending"
    ]
    jobs = [
        job for job in pending if job["ready_for_generation"]
    ][: args.storyboards]
    if not jobs:
        _, status = write_manifest_and_status()
        blocked = [
            {
                "job_id": job["job_id"],
                "blocked_dependencies": job["blocked_dependencies"],
            }
            for job in pending[: args.storyboards]
        ]
        print(
            json.dumps(
                {
                    "results": [],
                    "blocked": blocked,
                    "status": status,
                },
                ensure_ascii=False,
            )
        )
        return

    results: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        futures = {
            executor.submit(
                render_storyboard,
                job,
                args.image_model,
            ): job
            for job in jobs
        }
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            print(json.dumps(result, ensure_ascii=False), flush=True)

    _, status = write_manifest_and_status()
    print(
        json.dumps(
            {
                "batch": {
                    "requested": len(jobs),
                    "generated": sum(
                        item["status"] == "generated"
                        for item in results
                    ),
                    "failed": sum(
                        item["status"] == "failed"
                        for item in results
                    ),
                },
                "status": status,
            },
            ensure_ascii=False,
        ),
        flush=True,
    )


if __name__ == "__main__":
    main()
