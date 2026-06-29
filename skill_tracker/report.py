"""把 output/ 里的 JSON 结果生成一个独立 HTML 看板。

    python -m skill_tracker.report          # 生成 output/report.html
    python -m skill_tracker.report --open    # 生成并用默认浏览器打开

完全自包含：内联 CSS + 手绘 SVG 柱状图，不依赖网络/服务器，双击 HTML 即可看。
读取每个 query 最新的一份 skills_*.json，渲染三个榜单 + star 柱状图。
"""
from __future__ import annotations

import argparse
import html
import json
import sys
import webbrowser
from datetime import datetime
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent / "output"
REPORT_PATH = OUTPUT_DIR / "report.html"

BAR_COLOR = "#2a78d6"
GROW_COLOR = "#1baf7a"


def _load_latest_per_query() -> dict[str, dict]:
    """每个 query 取 generated_at 最新的一份 JSON。"""
    latest: dict[str, dict] = {}
    for f in OUTPUT_DIR.glob("skills_*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        q = data.get("query", "?")
        if q not in latest or data.get("generated_at", "") > latest[q].get(
            "generated_at", ""
        ):
            latest[q] = data
    return latest


def _bar(value: float, vmax: float, color: str) -> str:
    pct = 0 if vmax <= 0 else max(value / vmax * 100, 1.5)
    return (
        f'<div class="bar-wrap"><div class="bar" '
        f'style="width:{pct:.1f}%;background:{color}"></div></div>'
    )


def _esc(s: str) -> str:
    return html.escape(s or "")


def _repo_rows(repos: list[dict], metric_key: str, color: str, is_growth: bool) -> str:
    if not repos:
        return '<tr><td colspan="3" class="empty">（无数据）</td></tr>'
    vmax = max((abs(r.get(metric_key, 0)) for r in repos), default=0)
    rows = []
    for i, r in enumerate(repos, 1):
        val = r.get(metric_key, 0)
        if is_growth:
            sign = "+" if val >= 0 else ""
            per_day = r.get("delta_per_day", 0)
            metric_txt = f"{sign}{val} ⭐ <span class='sub'>({per_day:+.1f}/天)</span>"
        elif metric_key == "stars_per_day":
            metric_txt = f"{val:.0f} <span class='sub'>⭐/天</span>"
        else:
            metric_txt = f"{val:,} <span class='sub'>⭐</span>"
        lang = (
            f"<span class='lang'>{_esc(r.get('language',''))}</span>"
            if r.get("language")
            else ""
        )
        desc = _esc((r.get("description") or "")[:120])
        rows.append(
            f"<tr><td class='rank'>{i}</td>"
            f"<td class='metric'>{metric_txt}{_bar(abs(val), vmax, color)}</td>"
            f"<td class='repo'><a href='{_esc(r['html_url'])}' target='_blank'>"
            f"{_esc(r['full_name'])}</a> {lang}"
            f"<div class='desc'>{desc}</div></td></tr>"
        )
    return "\n".join(rows)


def _section(data: dict) -> str:
    q = _esc(data.get("query", "?"))
    gen = data.get("generated_at", "")[:19].replace("T", " ")
    parts = [f"<section><h2>query: {q} <span class='gen'>· {gen}</span></h2>"]

    parts.append("<h3>⭐ 星最多</h3><table>")
    parts.append(_repo_rows(data.get("top_starred", []), "stars", BAR_COLOR, False))
    parts.append("</table>")

    parts.append("<h3>📈 增长最快（⭐/天 估算）</h3><table>")
    parts.append(
        _repo_rows(data.get("fastest_growing", []), "stars_per_day", BAR_COLOR, False)
    )
    parts.append("</table>")

    if data.get("real_growth"):
        parts.append("<h3>🔥 真实近期增长（快照对比）</h3><table>")
        parts.append(_repo_rows(data["real_growth"], "delta", GROW_COLOR, True))
        parts.append("</table>")

    parts.append("</section>")
    return "\n".join(parts)


CSS = """
*{box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  max-width:1000px;margin:0 auto;padding:24px;color:#1a1a1a;background:#fafafa}
h1{font-size:24px;font-weight:600}
.meta{color:#888;font-size:13px;margin-bottom:24px}
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.tab{padding:6px 14px;border:1px solid #ddd;border-radius:8px;cursor:pointer;
  background:#fff;font-size:14px}
.tab.active{background:#2a78d6;color:#fff;border-color:#2a78d6}
section{display:none;background:#fff;border:1px solid #eee;border-radius:12px;
  padding:20px;margin-bottom:20px}
section.active{display:block}
h2{font-size:17px;font-weight:600;margin:0 0 4px}
.gen{color:#aaa;font-size:13px;font-weight:400}
h3{font-size:14px;font-weight:600;margin:20px 0 8px;color:#444}
table{width:100%;border-collapse:collapse}
tr{border-bottom:1px solid #f0f0f0}
td{padding:8px 6px;vertical-align:top;font-size:14px}
.rank{color:#bbb;width:28px;text-align:right;font-variant-numeric:tabular-nums}
.metric{width:180px;font-weight:600;font-variant-numeric:tabular-nums}
.sub{color:#999;font-weight:400;font-size:12px}
.bar-wrap{background:#f0f0f0;border-radius:3px;height:5px;margin-top:5px;width:150px}
.bar{height:5px;border-radius:3px}
.repo a{color:#2a78d6;text-decoration:none;font-weight:500}
.repo a:hover{text-decoration:underline}
.lang{font-size:11px;color:#888;background:#f3f3f3;padding:1px 6px;border-radius:4px;
  margin-left:6px}
.desc{color:#888;font-size:12px;margin-top:2px;line-height:1.4}
.empty{color:#bbb;text-align:center;padding:16px}
"""

JS = """
const tabs=document.querySelectorAll('.tab');
const secs=document.querySelectorAll('section');
tabs.forEach((t,i)=>t.onclick=()=>{
  tabs.forEach(x=>x.classList.remove('active'));
  secs.forEach(x=>x.classList.remove('active'));
  t.classList.add('active');secs[i].classList.add('active');
});
"""


def build(open_browser: bool = False) -> Path:
    latest = _load_latest_per_query()
    if not latest:
        raise RuntimeError("output/ 下没有 skills_*.json，先跑一次 tracker 或 daily_run。")

    queries = sorted(latest.keys())
    tabs = "".join(
        f"<div class='tab{' active' if i==0 else ''}'>{_esc(q)}</div>"
        for i, q in enumerate(queries)
    )
    sections = []
    for i, q in enumerate(queries):
        sec = _section(latest[q])
        if i == 0:
            sec = sec.replace("<section>", "<section class='active'>", 1)
        sections.append(sec)

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    doc = f"""<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Skill Tracker 看板</title><style>{CSS}</style></head><body>
<h1>GitHub Skill 榜单</h1>
<div class="meta">生成于 {now} · 共 {len(queries)} 个 query · 数据来自 output/snapshots</div>
<div class="tabs">{tabs}</div>
{''.join(sections)}
<script>{JS}</script></body></html>"""

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(doc, encoding="utf-8")
    if open_browser:
        webbrowser.open(REPORT_PATH.resolve().as_uri())
    return REPORT_PATH


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="生成 skill_tracker HTML 看板")
    parser.add_argument("--open", action="store_true", help="生成后用浏览器打开")
    args = parser.parse_args(argv)
    try:
        path = build(open_browser=args.open)
    except Exception as e:  # noqa: BLE001
        print(f"出错: {e}", file=sys.stderr)
        return 1
    print(f"看板已生成: {path}")
    print("用浏览器打开它即可查看（或加 --open 自动打开）。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
