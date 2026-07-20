"""导出《九陆纪元》S1 24 集正式剧本 v2 图文完整版。

每集强制匹配一张关键参考图和一张四格分镜图；EP01 另附已有的逐镜头分镜。
导出过程不修改原剧本或原图，只在 ``script-assets/jiulu-s1-v2`` 生成文档副本，
并输出根目录 HTML/PDF。若任一集素材缺失或重复，立即失败，防止静默漏图。
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import subprocess
import tempfile
from dataclasses import asdict, dataclass
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
RESOURCE_ROOT = ROOT / "resouce" / "漫剧"
SOURCE_SCRIPT = RESOURCE_ROOT / "九陆纪元_S1烬龙陆篇_24集正式剧本_v2.md"
KEY_ROOT = RESOURCE_ROOT / "九陆纪元_S1烬龙陆篇_v2_补图" / "EP关键参考图"
KEY_OVERVIEW = (
    RESOURCE_ROOT
    / "九陆纪元_S1烬龙陆篇_v2_补图"
    / "清单与提示词"
    / "九陆纪元_S1烬龙陆篇_v2_EP01-EP24_补图总览.png"
)
SCENE_SUPPLEMENT = (
    RESOURCE_ROOT
    / "九陆纪元_S1烬龙陆篇_v2_补图"
    / "场景补充"
    / "scene04_矿洞场景母版.png"
)
STORYBOARD_ROOT = RESOURCE_ROOT / "九陆纪元_S1烬龙陆篇_v2_分镜图" / "EP分镜图"
STORYBOARD_OVERVIEW = (
    RESOURCE_ROOT
    / "九陆纪元_S1烬龙陆篇_v2_分镜图"
    / "总览与清单"
    / "九陆纪元_S1烬龙陆篇_v2_EP01-EP24_分镜总览.png"
)
SHOT_ROOT = RESOURCE_ROOT / "九陆纪元_S1烬龙陆篇_v2_逐镜头分镜图" / "EP01_泥里的人"

ASSET_DIR = ROOT / "script-assets" / "jiulu-s1-v2"
OUTPUT_HTML = ROOT / "jiulu-s1-v2-illustrated.html"
OUTPUT_PDF = ROOT / "jiulu-s1-v2-illustrated.pdf"

EPISODE_RE = re.compile(r"^## EP(?P<number>\d{2})《(?P<title>[^》]+)》\s*$", re.MULTILINE)
POSTLUDE_RE = re.compile(r"^## 第一季情绪闭环\s*$", re.MULTILINE)


@dataclass(frozen=True)
class AssetRecord:
    kind: str
    episode: int | None
    source: str
    output: str
    source_sha256: str
    source_size: list[int]
    output_size: list[int]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html-only", action="store_true", help="只更新 HTML 与文档素材，不重导 PDF")
    parser.add_argument("--browser", type=Path, help="可选：指定 Chrome/Edge 可执行文件")
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def require_single(pattern: str, directory: Path) -> Path:
    matches = sorted(directory.glob(pattern))
    if len(matches) != 1:
        raise ValueError(f"{directory} 中 {pattern} 应匹配 1 个文件，实际 {len(matches)} 个")
    return matches[0]


def inline_markdown(value: str) -> str:
    escaped = html.escape(value.strip())
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    return escaped


def render_markdown(markdown_text: str, *, heading_shift: int = 0) -> str:
    lines = markdown_text.strip().splitlines()
    output: list[str] = []
    paragraph: list[str] = []
    list_items: list[str] = []
    list_type: str | None = None

    def flush_paragraph() -> None:
        if paragraph:
            output.append("<p>" + "<br>".join(inline_markdown(line) for line in paragraph) + "</p>")
            paragraph.clear()

    def flush_list() -> None:
        nonlocal list_type
        if list_items and list_type:
            output.append(f"<{list_type}>" + "".join(f"<li>{item}</li>" for item in list_items) + f"</{list_type}>")
        list_items.clear()
        list_type = None

    for raw_line in lines:
        line = raw_line.rstrip()
        if not line.strip():
            flush_paragraph()
            flush_list()
            continue
        if line.strip() == "---":
            flush_paragraph()
            flush_list()
            output.append("<hr>")
            continue
        heading = re.match(r"^(#{1,6})\s+(.+)$", line)
        if heading:
            flush_paragraph()
            flush_list()
            level = min(6, len(heading.group(1)) + heading_shift)
            output.append(f"<h{level}>{inline_markdown(heading.group(2))}</h{level}>")
            continue
        numbered = re.match(r"^\d+\.\s+(.+)$", line)
        bullet = re.match(r"^[-*]\s+(.+)$", line)
        if numbered or bullet:
            flush_paragraph()
            desired_type = "ol" if numbered else "ul"
            if list_type and list_type != desired_type:
                flush_list()
            list_type = desired_type
            list_items.append(inline_markdown((numbered or bullet).group(1)))
            continue
        flush_list()
        paragraph.append(line.strip())

    flush_paragraph()
    flush_list()
    return "\n".join(output)


def split_script(markdown_text: str) -> tuple[str, list[tuple[int, str, str]], str]:
    matches = list(EPISODE_RE.finditer(markdown_text))
    if len(matches) != 24:
        raise ValueError(f"正式剧本应有 24 集，实际匹配 {len(matches)} 集")
    numbers = [int(match.group("number")) for match in matches]
    if numbers != list(range(1, 25)):
        raise ValueError(f"集号不连续：{numbers}")

    preface = markdown_text[: matches[0].start()]
    first_line_end = preface.find("\n")
    if first_line_end >= 0:
        preface = preface[first_line_end + 1 :]

    postlude_match = POSTLUDE_RE.search(markdown_text, matches[-1].end())
    if not postlude_match:
        raise ValueError("找不到“第一季情绪闭环”后记")

    episodes: list[tuple[int, str, str]] = []
    for index, match in enumerate(matches):
        content_start = match.end()
        if index + 1 < len(matches):
            content_end = matches[index + 1].start()
        else:
            content_end = postlude_match.start()
        episodes.append((int(match.group("number")), match.group("title"), markdown_text[content_start:content_end]))
    postlude = markdown_text[postlude_match.start() :]
    return preface, episodes, postlude


def convert_image(source: Path, output_name: str, max_size: tuple[int, int], quality: int, kind: str, episode: int | None) -> AssetRecord:
    destination = ASSET_DIR / output_name
    with Image.open(source) as opened:
        source_size = list(opened.size)
        image = ImageOps.exif_transpose(opened).convert("RGB")
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        output_size = list(image.size)
        image.save(destination, "JPEG", quality=quality, optimize=True, progressive=True)
    return AssetRecord(
        kind=kind,
        episode=episode,
        source=str(source),
        output=str(destination),
        source_sha256=sha256(source),
        source_size=source_size,
        output_size=output_size,
    )


def figure(src: str, caption: str, css_class: str = "") -> str:
    class_attribute = f' class="{css_class}"' if css_class else ""
    return (
        f"<figure{class_attribute}>"
        f'<img src="script-assets/jiulu-s1-v2/{html.escape(src, quote=True)}" alt="{html.escape(caption, quote=True)}">'
        f"<figcaption>{html.escape(caption)}</figcaption>"
        "</figure>"
    )


def find_browser(explicit: Path | None) -> Path:
    if explicit:
        browser = explicit.resolve()
        if not browser.is_file():
            raise FileNotFoundError(f"浏览器不存在：{browser}")
        return browser
    candidates = [
        Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
        Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
        Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    raise FileNotFoundError("未找到 Chrome/Edge；可用 --browser 指定")


def export_pdf(browser: Path) -> None:
    temporary_pdf = OUTPUT_PDF.with_name(OUTPUT_PDF.stem + ".tmp.pdf")
    if temporary_pdf.exists():
        temporary_pdf.unlink()
    with tempfile.TemporaryDirectory(prefix="jiulu-s1-v2-pdf-") as profile_dir:
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
            OUTPUT_HTML.resolve().as_uri(),
        ]
        result = subprocess.run(command, capture_output=True, text=True, timeout=300, check=False)
        if result.returncode != 0 or not temporary_pdf.is_file():
            details = (result.stderr or result.stdout).strip()
            raise RuntimeError(f"PDF 导出失败：{details}")
    temporary_pdf.replace(OUTPUT_PDF)


def main() -> None:
    args = parse_args()
    required = [SOURCE_SCRIPT, KEY_OVERVIEW, STORYBOARD_OVERVIEW, SCENE_SUPPLEMENT]
    for path in required:
        if not path.is_file():
            raise FileNotFoundError(f"缺少正式剧本素材：{path}")

    markdown_text = SOURCE_SCRIPT.read_text(encoding="utf-8")
    preface, episodes, postlude = split_script(markdown_text)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)

    records: list[AssetRecord] = []
    records.append(convert_image(KEY_OVERVIEW, "season-key-overview.jpg", (1920, 1080), 90, "key_overview", None))
    records.append(convert_image(STORYBOARD_OVERVIEW, "season-storyboard-overview.jpg", (1920, 1080), 92, "storyboard_overview", None))
    records.append(convert_image(SCENE_SUPPLEMENT, "scene04-mining-cave.jpg", (1200, 1800), 88, "scene_supplement", None))

    episode_assets: dict[int, dict[str, str]] = {}
    for episode, title, _ in episodes:
        key_source = require_single(f"EP{episode:02d}_*.png", KEY_ROOT)
        storyboard_source = require_single(f"EP{episode:02d}_*_分镜图.png", STORYBOARD_ROOT)
        expected_title = re.sub(r"^EP\d{2}_", "", key_source.stem)
        if expected_title != title:
            raise ValueError(f"EP{episode:02d} 标题不一致：剧本《{title}》/ 图片《{expected_title}》")
        key_name = f"ep{episode:02d}-key.jpg"
        storyboard_name = f"ep{episode:02d}-storyboard.jpg"
        records.append(convert_image(key_source, key_name, (1600, 1000), 88, "episode_key", episode))
        records.append(convert_image(storyboard_source, storyboard_name, (1920, 1080), 92, "episode_storyboard", episode))
        episode_assets[episode] = {"key": key_name, "storyboard": storyboard_name}

    detailed_shots = sorted(SHOT_ROOT.glob("EP01_S*.png"))
    if len(detailed_shots) != 5:
        raise ValueError(f"EP01 逐镜头分镜应为 5 张，实际 {len(detailed_shots)} 张")
    detail_assets: list[tuple[str, str]] = []
    for shot in detailed_shots:
        shot_match = re.match(r"EP01_S(\d{3})_(.+)", shot.stem)
        if not shot_match:
            raise ValueError(f"逐镜头分镜命名不合规：{shot.name}")
        output_name = f"ep01-shot-{shot_match.group(1)}.jpg"
        records.append(convert_image(shot, output_name, (1200, 1800), 88, "detailed_storyboard", 1))
        detail_assets.append((output_name, f"S{shot_match.group(1)} {shot_match.group(2)}"))

    expected_outputs = {Path(record.output).name for record in records}
    for stale in ASSET_DIR.glob("*.jpg"):
        if stale.name not in expected_outputs:
            stale.unlink()

    toc = "".join(
        f'<a href="#ep{episode:02d}">EP{episode:02d}《{html.escape(title)}》</a>'
        for episode, title, _ in episodes
    )
    sections: list[str] = []
    for episode, title, body in episodes:
        visuals = episode_assets[episode]
        detail_block = ""
        if episode == 1:
            detail_block = (
                '<section class="detail-block"><h3>EP01 已完成逐镜头分镜（5 张）</h3>'
                '<div class="detail-grid">'
                + "".join(figure(filename, caption, "detail-figure") for filename, caption in detail_assets)
                + "</div></section>"
            )
        sections.append(
            f'<article class="episode" id="ep{episode:02d}">'
            f"<h2>EP{episode:02d}《{html.escape(title)}》</h2>"
            '<div class="episode-visuals">'
            + figure(visuals["key"], f"EP{episode:02d}《{title}》关键参考图", "key-figure")
            + figure(visuals["storyboard"], f"EP{episode:02d}《{title}》四格分镜图", "storyboard-figure")
            + "</div>"
            + detail_block
            + '<section class="episode-script">'
            + render_markdown(body)
            + "</section></article>"
        )

    css = """
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#ece8df;color:#181a20;font-family:system-ui,"PingFang SC","Microsoft YaHei",sans-serif;line-height:1.75}
.document{max-width:1040px;margin:0 auto;background:#fff;padding:38px 54px 64px;box-shadow:0 8px 32px #0002}.cover{text-align:center;padding:36px 0 28px;border-bottom:2px solid #8f3f24}.cover h1{font-family:Georgia,"Songti SC",serif;font-size:2rem;margin:0 0 12px}.cover .sub{color:#6b625b}.badges{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}.badge{padding:4px 10px;border:1px solid #bb7a55;border-radius:999px;color:#7b3b22;background:#fff8f1;font-size:.82rem}
h2{font-family:Georgia,"Songti SC",serif;color:#7b2f20;border-bottom:2px solid #b76a46;padding-bottom:8px}h3{color:#75503f}p{margin:.7em 0}strong{color:#42251b}code{background:#f2eee8;padding:1px 4px;border-radius:3px}.preface,.postlude{margin:28px 0}.toc{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:20px 0 34px}.toc a{color:#305f66;text-decoration:none;padding:6px 8px;background:#edf5f5;border-radius:4px;font-size:.82rem}
.overview{margin:26px 0}.overview figure,.episode figure{margin:0 0 18px;border:1px solid #d8d0c5;border-radius:7px;overflow:hidden;background:#111}.overview img,.episode img{display:block;width:100%;height:auto}.overview figcaption,.episode figcaption{background:#fff;padding:7px 10px;color:#5c5148;font-size:.78rem}.scene-figure{max-width:430px;margin-left:auto!important;margin-right:auto!important}.episode{page-break-before:always;margin-top:28px}.episode h2{margin-top:0}.key-figure img{max-height:520px;object-fit:contain}.storyboard-figure img{object-fit:contain}.episode-script{font-size:1rem}.detail-block{margin:22px 0}.detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.detail-figure img{height:420px!important;object-fit:contain}.postlude{page-break-before:always}hr{border:0;border-top:1px solid #d6cec4;margin:24px 0}ol,ul{padding-left:1.6em}
@page{size:A4 portrait;margin:12mm 13mm 14mm}@media print{body{background:#fff}.document{max-width:none;margin:0;padding:0;box-shadow:none}.cover{padding-top:0}.toc{grid-template-columns:repeat(3,1fr)}.episode{break-before:page}.episode figure{break-inside:avoid;page-break-inside:avoid}.key-figure img{max-height:96mm}.storyboard-figure img{max-height:102mm}.detail-figure img{height:105mm!important}.postlude{break-before:page}}
"""
    document = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>九陆纪元 S1 烬龙陆篇 24集正式剧本 v2 图文完整版</title><style>{css}</style></head><body><main class="document">
<header class="cover"><h1>《九陆纪元》S1《烬龙陆篇》</h1><div class="sub">24集正式剧本 v2 · 图文完整版</div>
<div class="badges"><span class="badge">24 集正文</span><span class="badge">24 张关键参考图</span><span class="badge">24 张四格分镜</span><span class="badge">EP01 逐镜头分镜 5 张</span></div></header>
<section class="preface">{render_markdown(preface, heading_shift=1)}</section>
<section class="overview"><h2>第一季视觉总览</h2>
{figure('season-key-overview.jpg','EP01–EP24 关键参考图总览')}
{figure('season-storyboard-overview.jpg','EP01–EP24 四格分镜总览')}
{figure('scene04-mining-cave.jpg','补充场景母版：矿洞暖橙矿灯与冷蓝世界树根','scene-figure')}
</section><nav class="toc">{toc}</nav>
{''.join(sections)}
<section class="postlude">{render_markdown(postlude)}</section>
</main></body></html>"""
    OUTPUT_HTML.write_text(document, encoding="utf-8", newline="\n")

    manifest = {
        "source_script": str(SOURCE_SCRIPT),
        "summary": {
            "episodes": 24,
            "episode_key_images": 24,
            "episode_storyboards": 24,
            "detailed_storyboards": len(detail_assets),
            "season_overviews": 2,
            "scene_supplements": 1,
            "total_images": len(records),
        },
        "assets": [asdict(record) for record in records],
    }
    (ASSET_DIR / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if not args.html_only:
        export_pdf(find_browser(args.browser))
    print(json.dumps(manifest["summary"], ensure_ascii=False))
    print(f"HTML: {OUTPUT_HTML}")
    if not args.html_only:
        print(f"PDF: {OUTPUT_PDF}")


if __name__ == "__main__":
    main()
