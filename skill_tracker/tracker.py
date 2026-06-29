"""拉取 GitHub 上"星最多"和"最新增长最快"的 skill 仓库。

用法示例：
    python -m skill_tracker.tracker                      # 默认搜 skill
    python -m skill_tracker.tracker -q "topic:mcp" -n 20
    python -m skill_tracker.tracker -q "claude skill" --recent-days 90
    python -m skill_tracker.tracker --json               # 输出 JSON 到 output/

直接当脚本跑也行：
    python skill_tracker/tracker.py
"""
from __future__ import annotations

import argparse
import io
import json
import sys

# Windows 控制台默认 GBK，强制 UTF-8 才能打印 ⭐ 等字符
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except (ValueError, io.UnsupportedOperation):
        pass
from dataclasses import asdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

# 同时支持「包方式 -m」和「脚本方式直接跑」两种导入
try:
    from .github_client import GitHubClient, Repo
    from . import snapshots
except ImportError:  # 直接 python skill_tracker/tracker.py
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from skill_tracker.github_client import GitHubClient, Repo
    from skill_tracker import snapshots

OUTPUT_DIR = Path(__file__).resolve().parent / "output"


def top_starred(client: GitHubClient, query: str, limit: int) -> list[Repo]:
    """星最多：直接按 stars 倒序。"""
    return client.search(query, sort="stars", order="desc", limit=limit)


def fastest_growing(
    client: GitHubClient, query: str, limit: int, recent_days: int
) -> list[Repo]:
    """最新增长最快：只看近期创建的仓库，按"星/天"排序。

    GitHub 没有官方 trending API，这里用"近 N 天内新建 + 星/天最高"
    作为新晋高增长仓库的代理。
    """
    cutoff = (datetime.now(timezone.utc) - timedelta(days=recent_days)).strftime(
        "%Y-%m-%d"
    )
    # 多取一些候选（API 上限附近），再用本地 star velocity 重排
    candidates = client.search(
        f"{query} created:>{cutoff}",
        sort="stars",
        order="desc",
        limit=max(limit * 3, 50),
    )
    candidates.sort(key=lambda r: r.stars_per_day, reverse=True)
    return candidates[:limit]


def _fmt_table(title: str, repos: list[Repo], show_velocity: bool) -> str:
    lines = [f"\n=== {title} ===", ""]
    if not repos:
        lines.append("  （无结果）")
        return "\n".join(lines)
    for i, r in enumerate(repos, 1):
        metric = (
            f"{r.stars_per_day:6.1f} ⭐/天 (共{r.stars}⭐)"
            if show_velocity
            else f"{r.stars:>6} ⭐"
        )
        lang = f" [{r.language}]" if r.language else ""
        lines.append(f"{i:>2}. {metric}  {r.full_name}{lang}")
        if r.description:
            desc = r.description[:90] + ("…" if len(r.description) > 90 else "")
            lines.append(f"     {desc}")
        lines.append(f"     {r.html_url}")
    return "\n".join(lines)


def _fmt_growth_table(title: str, growths: list, elapsed_days: float) -> str:
    lines = [f"\n=== {title} ===", f"（对比 {elapsed_days:.1f} 天前的快照）", ""]
    if not growths:
        lines.append("  （无可对比的仓库）")
        return "\n".join(lines)
    for i, g in enumerate(growths, 1):
        r = g.repo
        sign = "+" if g.delta >= 0 else ""
        lang = f" [{r.language}]" if r.language else ""
        lines.append(
            f"{i:>2}. {sign}{g.delta:>5} ⭐ ({g.delta_per_day:+.1f}/天)  "
            f"{r.full_name}{lang}  共{r.stars}⭐"
        )
        lines.append(f"     {r.html_url}")
    return "\n".join(lines)


def _serialize(repo: Repo) -> dict:
    d = asdict(repo)
    d["created_at"] = repo.created_at.isoformat()
    d["pushed_at"] = repo.pushed_at.isoformat()
    d["stars_per_day"] = round(repo.stars_per_day, 3)
    d["age_days"] = round(repo.age_days, 1)
    return d


def run(
    query: str,
    limit: int,
    recent_days: int,
    as_json: bool,
) -> dict:
    now = datetime.now(timezone.utc)
    with GitHubClient() as client:
        starred = top_starred(client, query, limit)
        growing = fastest_growing(client, query, limit, recent_days)

    # 本次抓到的全部仓库（去重）—— 用作快照与真实增长对比的基础
    union: dict[str, Repo] = {}
    for r in (*starred, *growing):
        union[r.full_name] = r
    all_repos = list(union.values())

    # 对比上一份历史快照，算真实涨星
    prev = snapshots.load_latest_snapshot(query, before=now)
    real_growth = snapshots.compute_growth(all_repos, prev) if prev else []
    # 本次结果存档，供下次对比
    snap_path = snapshots.save_snapshot(query, all_repos, taken_at=now)

    result = {
        "query": query,
        "generated_at": now.isoformat(),
        "top_starred": [_serialize(r) for r in starred],
        "fastest_growing": [_serialize(r) for r in growing],
    }

    print(_fmt_table(f"星最多的 skill（query: {query}）", starred, show_velocity=False))
    print(
        _fmt_table(
            f"近 {recent_days} 天最新增长最快（按 ⭐/天 估算）",
            growing,
            show_velocity=True,
        )
    )

    if prev:
        elapsed = max((now - prev.taken_at).total_seconds() / 86400, 1e-9)
        print(
            _fmt_growth_table(
                "真实近期增长（按对比快照实际涨星）",
                real_growth[:limit],
                elapsed,
            )
        )
        result["real_growth"] = [
            {**_serialize(g.repo), "delta": g.delta, "prev_stars": g.prev_stars,
             "delta_per_day": round(g.delta_per_day, 3)}
            for g in real_growth[:limit]
        ]
    else:
        print(
            "\n=== 真实近期增长 ===\n"
            "  首次运行该 query，已建立基线快照。下次运行即可看到真实涨星对比。"
        )

    print(f"\n快照已存档: {snap_path}")

    if as_json:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        out = OUTPUT_DIR / f"skills_{stamp}.json"
        out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\nJSON 已写入: {out}")

    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="拉取 GitHub 上星最多 / 最新增长最快的 skill 仓库"
    )
    parser.add_argument(
        "-q", "--query", default="skill",
        help="GitHub 搜索关键词/语法，默认 'skill'。例: 'topic:mcp'、'claude skill'",
    )
    parser.add_argument(
        "-n", "--limit", type=int, default=15, help="每个榜单返回条数（默认 15）"
    )
    parser.add_argument(
        "--recent-days", type=int, default=180,
        help="'增长最快'榜只统计近 N 天内新建的仓库（默认 180）",
    )
    parser.add_argument("--json", action="store_true", help="同时把结果写成 JSON")
    args = parser.parse_args(argv)

    try:
        run(args.query, args.limit, args.recent_days, args.json)
    except Exception as e:  # noqa: BLE001  顶层兜底，给出友好提示
        print(f"出错: {e}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
