"""把当前内置漫剧 JSON 打包到镜像内资源，供数据卷启动迁移使用。"""
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REVISION = 3
EMPLOYEE_KEYS = (
    "comic-director",
    "comic-screenwriter",
    "comic-storyboard",
    "comic-character-designer",
    "comic-scene-designer",
    "comic-vfx-designer",
    "comic-prompt-engineer",
    "comic-character-artist",
    "comic-scene-artist",
    "comic-keyframe-artist",
    "comic-video-artist",
    "comic-qa-inspector",
    "comic-trajectory-artist",
)
TOOL_KEYS = (
    "generate_image",
    "generate_video",
    "check_video_generation",
    "inspect_media",
)
WORKFLOW_KEYS = ("comic-drama", "comic-drama-10s")


def _read(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def build_manifest() -> Path:
    manifest = {
        "revision": REVISION,
        "employees": [
            _read(ROOT / "data" / "employees" / f"{key}.json")
            for key in EMPLOYEE_KEYS
        ],
        "team": [
            _read(ROOT / "data" / "teams" / "comic-drama-team.json")
        ],
        "tools": [
            _read(ROOT / "data" / "tools" / f"{key}.json")
            for key in TOOL_KEYS
        ],
        "workflows": [
            _read(ROOT / "data" / "workflows" / f"{key}.json")
            for key in WORKFLOW_KEYS
        ],
    }
    output = ROOT / "app" / "resources" / "comic_team_manifest.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return output


if __name__ == "__main__":
    print(build_manifest())
