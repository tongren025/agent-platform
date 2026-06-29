"""快照存档与对比。

每次运行把抓到的仓库 stars 存成一份带时间戳的快照（按 query 分目录）。
下次同 query 运行时，和最近一份历史快照对比，算出**真实**的近期涨星数，
而不是用 stars/天 估算。
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

SNAPSHOT_DIR = Path(__file__).resolve().parent / "output" / "snapshots"


def _slug(query: str) -> str:
    """把 query 转成安全的目录名。"""
    s = re.sub(r"[^a-zA-Z0-9]+", "_", query.strip().lower()).strip("_")
    return s or "default"


@dataclass
class Snapshot:
    taken_at: datetime
    stars: dict[str, int]  # full_name -> stars
    path: Path


def save_snapshot(query: str, repos: list, taken_at: datetime | None = None) -> Path:
    """把当前一批仓库的 stars 存档。repos 为 Repo 列表。"""
    taken_at = taken_at or datetime.now(timezone.utc)
    target_dir = SNAPSHOT_DIR / _slug(query)
    target_dir.mkdir(parents=True, exist_ok=True)
    payload = {
        "query": query,
        "taken_at": taken_at.isoformat(),
        "stars": {r.full_name: r.stars for r in repos},
    }
    out = target_dir / f"{taken_at.strftime('%Y%m%d_%H%M%S')}.json"
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return out


def load_latest_snapshot(query: str, before: datetime | None = None) -> Snapshot | None:
    """读取该 query 最近一份历史快照。

    before: 只取该时刻之前的快照（默认排除本次刚写的，取上一份）。
    """
    target_dir = SNAPSHOT_DIR / _slug(query)
    if not target_dir.exists():
        return None
    snaps: list[Snapshot] = []
    for f in target_dir.glob("*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            taken_at = datetime.fromisoformat(data["taken_at"])
        except (json.JSONDecodeError, KeyError, ValueError):
            continue
        if before and taken_at >= before:
            continue
        snaps.append(Snapshot(taken_at=taken_at, stars=data.get("stars", {}), path=f))
    if not snaps:
        return None
    return max(snaps, key=lambda s: s.taken_at)


@dataclass
class Growth:
    repo: object  # Repo
    delta: int  # 自上次快照以来涨的星数
    elapsed_days: float
    prev_stars: int

    @property
    def delta_per_day(self) -> float:
        return self.delta / max(self.elapsed_days, 1e-9)


def compute_growth(repos: list, prev: Snapshot) -> list[Growth]:
    """对比本次仓库与历史快照，算出真实涨星。只保留两次都出现的仓库。"""
    now = datetime.now(timezone.utc)
    elapsed = max((now - prev.taken_at).total_seconds() / 86400, 1e-9)
    out: list[Growth] = []
    for r in repos:
        if r.full_name in prev.stars:
            prev_stars = prev.stars[r.full_name]
            out.append(
                Growth(
                    repo=r,
                    delta=r.stars - prev_stars,
                    elapsed_days=elapsed,
                    prev_stars=prev_stars,
                )
            )
    out.sort(key=lambda g: g.delta, reverse=True)
    return out
