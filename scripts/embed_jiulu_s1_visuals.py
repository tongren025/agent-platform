"""把《九陆纪元》第一季现有视觉资产嵌入剧本 HTML，并可重新导出 PDF。

数据来源：
- ``data/production/jiulu-s1/cards.json`` 中已经绑定图片的 design/storyboard 卡；
- ``data/uploads/canvas`` 与 ``resouce/漫剧`` 中的原始图片。

脚本只生成文档用 JPEG 缩略图，不修改原图，也不会用占位图冒充尚未生成的分镜。
重复运行是幂等的：已有的视觉区块和样式会被替换，图片文件名保持稳定。
"""

from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
import tempfile
from dataclasses import asdict, dataclass
from pathlib import Path
from urllib.parse import unquote

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
CARDS_PATH = ROOT / "data" / "production" / "jiulu-s1" / "cards.json"
ASSET_DIR = ROOT / "script-assets" / "jiulu-s1"
S1_HTML = ROOT / "jiulu-s1-script.html"
FULL_HTML = ROOT / "jiulu-full-script.html"
S1_PDF = ROOT / "jiulu-s1-script.pdf"
FULL_PDF = ROOT / "jiulu-full-script.pdf"

CSS_START = "/* S1_VISUALS_CSS_START */"
CSS_END = "/* S1_VISUALS_CSS_END */"
BLOCK_RE = re.compile(
    r"\s*<!-- S1_VISUAL_BLOCK_START:[^>]+ -->.*?"
    r"<!-- S1_VISUAL_BLOCK_END:[^>]+ -->\s*",
    re.DOTALL,
)

VISUAL_CSS = f"""
{CSS_START}
.visual-section{{margin:.8rem 0 1.4rem}}
.visual-section h4{{font-size:.92rem;color:#7A3E14;margin:.65rem 0 .25rem;padding-left:.45rem;border-left:3px solid #D97706}}
.visual-note{{font-size:.72rem;color:#6B7280;margin:0 0 .45rem}}
.visual-gallery{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.45rem;align-items:start}}
.visual-card{{margin:0;background:#111827;border:1px solid #D1D5DB;border-radius:4px;overflow:hidden;break-inside:avoid;page-break-inside:avoid}}
.visual-card img{{display:block;width:100%;height:230px;object-fit:contain;background:#0B0F19}}
.visual-caption{{min-height:2.7em;padding:.25rem .35rem;background:#fff;color:#374151;font-size:.66rem;line-height:1.35}}
.visual-caption small{{display:block;color:#9CA3AF;font-size:.58rem;margin-top:.12rem}}
@media print{{
  .visual-section{{margin:.5rem 0 1rem}}
  .visual-gallery{{grid-template-columns:repeat(4,minmax(0,1fr));gap:3mm}}
  .visual-card img{{height:54mm}}
  .visual-caption{{font-size:7.2pt}}
}}
{CSS_END}
""".strip()


@dataclass(frozen=True)
class VisualEntry:
    card_id: str
    stage: str
    episode: int | None
    shot_number: int
    title: str
    source_url: str
    source_path: str
    output_file: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", action="store_true", help="同时用本机 Chrome/Edge 重新导出 PDF")
    parser.add_argument("--thumbnail-edge", type=int, default=720, help="文档缩略图最长边，默认 720")
    parser.add_argument("--jpeg-quality", type=int, default=84, help="文档缩略图 JPEG 质量，默认 84")
    parser.add_argument("--browser", type=Path, help="可选：指定 Chrome/Edge 可执行文件")
    return parser.parse_args()


def resolve_source(source_url: str) -> Path:
    if source_url.startswith("/uploads/"):
        return ROOT / "data" / Path(unquote(source_url.lstrip("/")))

    prefix = "/api/v1/agentapp/production/resource/"
    if source_url.startswith(prefix):
        relative = Path(unquote(source_url[len(prefix) :]))
        return ROOT / "resouce" / relative

    raise ValueError(f"不支持的图片 URL：{source_url}")


def safe_filename(card_id: str, index: int) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9_-]+", "-", card_id).strip("-").lower()
    return f"{normalized}-{index:02d}.jpg"


def load_visual_entries() -> tuple[list[VisualEntry], dict[int, list[VisualEntry]]]:
    cards = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    global_entries: list[VisualEntry] = []
    episode_entries: dict[int, list[VisualEntry]] = {}
    seen_urls: set[str] = set()

    for card in cards:
        images = [value for value in card.get("images", []) if value]
        if not images:
            continue

        stage = card.get("stage", "")
        episode_value = card.get("episode")
        is_global = stage == "design" or (stage == "storyboard" and not episode_value)
        is_episode_storyboard = stage == "storyboard" and episode_value
        if not is_global and not is_episode_storyboard:
            continue

        episode = int(episode_value) if episode_value else None
        for index, source_url in enumerate(images, start=1):
            if source_url in seen_urls:
                continue
            seen_urls.add(source_url)
            source_path = resolve_source(source_url)
            if not source_path.is_file():
                raise FileNotFoundError(f"卡片 {card['card_id']} 的图片不存在：{source_path}")

            entry = VisualEntry(
                card_id=card["card_id"],
                stage=stage,
                episode=episode,
                shot_number=int(card.get("shot_number") or 0),
                title=card.get("title") or card["card_id"],
                source_url=source_url,
                source_path=str(source_path),
                output_file=safe_filename(card["card_id"], index),
            )
            if is_global:
                global_entries.append(entry)
            else:
                episode_entries.setdefault(episode, []).append(entry)

    global_entries.sort(key=lambda item: (item.stage, item.shot_number, item.card_id, item.output_file))
    for entries in episode_entries.values():
        entries.sort(key=lambda item: (item.shot_number, item.card_id, item.output_file))
    return global_entries, dict(sorted(episode_entries.items()))


def make_thumbnail(entry: VisualEntry, edge: int, quality: int) -> None:
    output_path = ASSET_DIR / entry.output_file
    with Image.open(entry.source_path) as source:
        image = ImageOps.exif_transpose(source)
        image.thumbnail((edge, edge), Image.Resampling.LANCZOS)
        if image.mode in {"RGBA", "LA"} or (image.mode == "P" and "transparency" in image.info):
            rgba = image.convert("RGBA")
            rgb = Image.new("RGB", rgba.size, "white")
            rgb.paste(rgba, mask=rgba.getchannel("A"))
            image = rgb
        else:
            image = image.convert("RGB")
        image.save(output_path, "JPEG", quality=quality, optimize=True, progressive=True)


def render_card(entry: VisualEntry) -> str:
    relative_path = (Path("script-assets") / "jiulu-s1" / entry.output_file).as_posix()
    caption = html.escape(entry.title)
    card_id = html.escape(entry.card_id)
    alt = html.escape(f"{entry.title}（{entry.card_id}）", quote=True)
    return (
        '<figure class="visual-card">'
        f'<img src="{relative_path}" alt="{alt}">'
        f'<figcaption class="visual-caption">{caption}<small>{card_id}</small></figcaption>'
        "</figure>"
    )


def render_block(key: str, title: str, note: str, entries: list[VisualEntry]) -> str:
    cards = "\n".join(render_card(entry) for entry in entries)
    return (
        f"<!-- S1_VISUAL_BLOCK_START:{key} -->\n"
        '<section class="visual-section">\n'
        f"<h4>{html.escape(title)}</h4>\n"
        f'<p class="visual-note">{html.escape(note)}</p>\n'
        f'<div class="visual-gallery">\n{cards}\n</div>\n'
        "</section>\n"
        f"<!-- S1_VISUAL_BLOCK_END:{key} -->"
    )


def clean_html(document: str) -> str:
    document = BLOCK_RE.sub("\n", document)
    document = re.sub(
        r"\s*" + re.escape(CSS_START) + r".*?" + re.escape(CSS_END) + r"\s*",
        "\n",
        document,
        flags=re.DOTALL,
    )
    return document


def add_css(document: str) -> str:
    if "</style>" not in document:
        raise ValueError("HTML 中没有 </style>，无法加入视觉区块样式")
    return document.replace("</style>", f"\n{VISUAL_CSS}\n</style>", 1)


def insert_after_first(document: str, pattern: str, block: str) -> str:
    match = re.search(pattern, document, flags=re.DOTALL)
    if not match:
        raise ValueError(f"找不到 HTML 插入点：{pattern}")
    return document[: match.end()] + "\n" + block + document[match.end() :]


def insert_after_episode_table(
    document: str,
    heading: str,
    block: str,
    *,
    search_start: int = 0,
    search_end: int | None = None,
) -> str:
    end = len(document) if search_end is None else search_end
    heading_pos = document.find(heading, search_start, end)
    if heading_pos < 0:
        raise ValueError(f"找不到分集标题：{heading}")
    table_end = document.find("</table>", heading_pos, end)
    if table_end < 0:
        raise ValueError(f"找不到 {heading} 对应的 </table>")
    table_end += len("</table>")
    return document[:table_end] + "\n" + block + document[table_end:]


def enrich_s1_html(
    document: str,
    global_entries: list[VisualEntry],
    episode_entries: dict[int, list[VisualEntry]],
) -> str:
    document = add_css(clean_html(document))
    global_block = render_block(
        "global",
        f"第一季视觉设定与总分镜（{len(global_entries)} 幅）",
        "角色、场景、道具、九大陆设定及 48 镜头总分镜；均来自第一季已绑定资产。",
        global_entries,
    )
    document = insert_after_first(document, r'<div class="sub">.*?</div>', global_block)

    for episode, entries in episode_entries.items():
        block = render_block(
            f"episode-{episode:02d}",
            f"EP{episode} 视觉关键帧（{len(entries)} 幅）",
            "按 G 单元顺序对应上方镜头拆分表。",
            entries,
        )
        document = insert_after_episode_table(document, f"<h2>EP{episode} ", block)
    return document


def enrich_full_html(
    document: str,
    global_entries: list[VisualEntry],
    episode_entries: dict[int, list[VisualEntry]],
) -> str:
    document = add_css(clean_html(document))
    season_one_heading = "<h2>第一季《烬龙陆·拒绝删除》</h2>"
    season_two_heading = "<h2>第二季《青霄陆·星圣陆·看清系统》</h2>"
    global_block = render_block(
        "global",
        f"第一季视觉设定与总分镜（{len(global_entries)} 幅）",
        "角色、场景、道具、九大陆设定及 48 镜头总分镜；均来自第一季已绑定资产。",
        global_entries,
    )
    document = insert_after_first(document, re.escape(season_one_heading), global_block)

    for episode, entries in episode_entries.items():
        season_start = document.find(season_one_heading)
        season_end = document.find(season_two_heading, season_start)
        if season_start < 0 or season_end < 0:
            raise ValueError("无法定位完整剧本中的第一季边界")
        block = render_block(
            f"episode-{episode:02d}",
            f"第一季 EP{episode} 视觉关键帧（{len(entries)} 幅）",
            "按 G 单元顺序对应上方镜头拆分表。",
            entries,
        )
        document = insert_after_episode_table(
            document,
            f"<h3>第{episode}集</h3>",
            block,
            search_start=season_start,
            search_end=season_end,
        )
    return document


def find_browser(explicit: Path | None) -> Path:
    if explicit:
        candidate = explicit.resolve()
        if not candidate.is_file():
            raise FileNotFoundError(f"浏览器不存在：{candidate}")
        return candidate

    candidates = [
        Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
        Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
        Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    raise FileNotFoundError("未找到 Chrome/Edge；可用 --browser 指定可执行文件")


def export_pdf(browser: Path, source_html: Path, destination_pdf: Path) -> None:
    temporary_pdf = destination_pdf.with_name(destination_pdf.stem + ".tmp.pdf")
    if temporary_pdf.exists():
        temporary_pdf.unlink()

    with tempfile.TemporaryDirectory(prefix="jiulu-script-pdf-") as profile_dir:
        command = [
            str(browser),
            "--headless=new",
            "--disable-gpu",
            "--disable-extensions",
            "--allow-file-access-from-files",
            "--no-pdf-header-footer",
            "--print-to-pdf-no-header",
            f"--user-data-dir={profile_dir}",
            f"--print-to-pdf={temporary_pdf}",
            source_html.resolve().as_uri(),
        ]
        result = subprocess.run(command, capture_output=True, text=True, timeout=300, check=False)
        if result.returncode != 0 or not temporary_pdf.is_file():
            details = (result.stderr or result.stdout).strip()
            raise RuntimeError(f"PDF 导出失败（{source_html.name}）：{details}")

    temporary_pdf.replace(destination_pdf)


def main() -> None:
    args = parse_args()
    if args.thumbnail_edge < 320:
        raise ValueError("--thumbnail-edge 不能小于 320")
    if not 50 <= args.jpeg_quality <= 95:
        raise ValueError("--jpeg-quality 必须在 50 到 95 之间")
    for required in (CARDS_PATH, S1_HTML, FULL_HTML):
        if not required.is_file():
            raise FileNotFoundError(f"缺少输入文件：{required}")

    global_entries, episode_entries = load_visual_entries()
    all_entries = global_entries + [entry for entries in episode_entries.values() for entry in entries]
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    expected_files = {entry.output_file for entry in all_entries}
    for stale_thumbnail in ASSET_DIR.glob("*.jpg"):
        if stale_thumbnail.name not in expected_files:
            stale_thumbnail.unlink()
    for entry in all_entries:
        make_thumbnail(entry, args.thumbnail_edge, args.jpeg_quality)

    manifest = {
        "summary": {
            "total": len(all_entries),
            "global": len(global_entries),
            "episode_keyframes": sum(len(entries) for entries in episode_entries.values()),
            "episodes_with_keyframes": sorted(episode_entries),
        },
        "entries": [asdict(entry) for entry in all_entries],
    }
    (ASSET_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    s1_document = enrich_s1_html(S1_HTML.read_text(encoding="utf-8"), global_entries, episode_entries)
    full_document = enrich_full_html(FULL_HTML.read_text(encoding="utf-8"), global_entries, episode_entries)
    S1_HTML.write_text(s1_document, encoding="utf-8", newline="\n")
    FULL_HTML.write_text(full_document, encoding="utf-8", newline="\n")

    if args.pdf:
        browser = find_browser(args.browser)
        export_pdf(browser, S1_HTML, S1_PDF)
        export_pdf(browser, FULL_HTML, FULL_PDF)

    episodes = ", ".join(f"EP{episode}" for episode in episode_entries)
    print(f"已嵌入 {len(all_entries)} 幅第一季视觉资产：全局 {len(global_entries)}，分集关键帧 {len(all_entries) - len(global_entries)}")
    print(f"已有关键帧的分集：{episodes}")
    if args.pdf:
        print(f"已更新 PDF：{S1_PDF.name}、{FULL_PDF.name}")


if __name__ == "__main__":
    main()
