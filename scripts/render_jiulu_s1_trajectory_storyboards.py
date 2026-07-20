"""渲染《九陆纪元》第一季 G 单元动作轨迹故事板。

每张故事板对应一张 ``storyboard`` 生产卡，把卡片正文里的 5–12 个
独立子镜头渲染到同一张大图中。画面以现有首帧或该集关键参考图为视觉锚点，
橙色箭头表示主体动作，蓝色标记表示镜头运动；原始图片不会被修改。

接入点：
- 输入：``data/production/jiulu-s1/cards.json``
- 输出：``resouce/漫剧/九陆纪元_S1烬龙陆篇_v2_动作轨迹故事板``
- 使用 ``--write-cards`` 时，把故事板 URL 置于对应卡片 ``images`` 的首位，
  原有关键帧继续保留在后面。
"""

from __future__ import annotations

import argparse
import json
import math
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import unquote

from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
CARDS_PATH = ROOT / "data" / "production" / "jiulu-s1" / "cards.json"
RESOURCE_ROOT = ROOT / "resouce" / "漫剧"
OUTPUT_ROOT = RESOURCE_ROOT / "九陆纪元_S1烬龙陆篇_v2_动作轨迹故事板"
EPISODE_REFERENCE_ROOT = (
    RESOURCE_ROOT / "九陆纪元_S1烬龙陆篇_v2_补图" / "EP关键参考图"
)
RESOURCE_URL_PREFIX = "/api/v1/agentapp/production/resource/"
OUTPUT_URL_PREFIX = RESOURCE_URL_PREFIX + "漫剧/九陆纪元_S1烬龙陆篇_v2_动作轨迹故事板/"
RENDERER_VERSION = 1

FONT_REGULAR_CANDIDATES = (
    Path(r"C:\Windows\Fonts\msyh.ttc"),
    Path(r"C:\Windows\Fonts\simhei.ttf"),
    Path(r"C:\Windows\Fonts\arial.ttf"),
)
FONT_BOLD_CANDIDATES = (
    Path(r"C:\Windows\Fonts\msyhbd.ttc"),
    Path(r"C:\Windows\Fonts\simhei.ttf"),
    Path(r"C:\Windows\Fonts\arialbd.ttf"),
)

SHOT_RE = re.compile(
    r"^### 镜头(?P<number>\d+)｜(?P<timecode>[^｜\n]+)｜(?P<duration>[^\n]+)\n"
    r"(?P<body>.*?)(?=^### 镜头\d+｜|^G 单元验收：|\Z)",
    re.MULTILINE | re.DOTALL,
)


@dataclass(frozen=True)
class Subshot:
    """一个 G 单元中的独立子镜头。"""

    number: int
    timecode: str
    duration: str
    purpose: str
    framing: str
    camera: str
    subject: str
    direction: str
    start_pose: str
    end_pose: str
    lighting: str
    sound: str
    actions: tuple[str, ...]


@dataclass(frozen=True)
class BoardRecord:
    """一张已生成轨迹故事板的清单记录。"""

    card_id: str
    episode: int
    shot_number: int
    title: str
    subshot_count: int
    source_image: str
    output_file: str
    resource_url: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write-cards", action="store_true", help="把故事板 URL 回写 cards.json")
    parser.add_argument("--episode", type=int, action="append", help="仅渲染指定集，可重复传入")
    parser.add_argument("--card", action="append", help="仅渲染指定 card_id，可重复传入")
    parser.add_argument("--jpeg-quality", type=int, default=88, help="JPEG 质量，默认 88")
    parser.add_argument("--skip-overviews", action="store_true", help="不生成每集和全季总览")
    return parser.parse_args()


def _font_path(candidates: Iterable[Path]) -> Path | None:
    return next((path for path in candidates if path.is_file()), None)


def make_font(size: int, *, bold: bool = False) -> ImageFont.ImageFont:
    candidates = FONT_BOLD_CANDIDATES if bold else FONT_REGULAR_CANDIDATES
    path = _font_path(candidates)
    if path is None:
        return ImageFont.load_default()
    return ImageFont.truetype(str(path), size)


def _field(body: str, label: str) -> str:
    match = re.search(rf"(?m)^{re.escape(label)}：([^\n]+)", body)
    return match.group(1).strip() if match else ""


def _shorten(text: str, limit: int) -> str:
    normalized = re.sub(r"\s+", " ", text).strip()
    if len(normalized) <= limit:
        return normalized
    return normalized[: max(1, limit - 1)].rstrip("，。；：") + "…"


def parse_subshots(content: str) -> list[Subshot]:
    """从 storyboard 卡片正文解析全部独立子镜头。"""

    subshots: list[Subshot] = []
    for match in SHOT_RE.finditer(content):
        body = match.group("body")
        framing_line = _field(body, "景别·机位")
        if "｜唯一运镜：" in framing_line:
            framing, camera = framing_line.split("｜唯一运镜：", 1)
        else:
            framing, camera = framing_line, ""
        actions = tuple(
            action.strip()
            for action in re.findall(r"(?m)^\s*-\s*\d+(?:\.\d+)?s：([^\n]+)", body)
        )
        subshots.append(
            Subshot(
                number=int(match.group("number")),
                timecode=match.group("timecode").strip(),
                duration=match.group("duration").strip(),
                purpose=_field(body, "镜头目的"),
                framing=framing.strip(),
                camera=camera.strip(),
                subject=_field(body, "主体与焦点").split("；", 1)[0],
                direction=_field(body, "屏幕方向与轴线").split("；", 1)[0],
                start_pose=_field(body, "起始姿态").split("；承接状态：", 1)[0],
                end_pose=_field(body, "结束姿态"),
                lighting=_field(body, "光影").split("；", 1)[0],
                sound=_field(body, "声音").split("；", 1)[0],
                actions=actions,
            )
        )
    return subshots


def resolve_image_url(url: str) -> Path | None:
    if url.startswith("/uploads/"):
        path = ROOT / "data" / Path(unquote(url.lstrip("/")))
        return path if path.is_file() else None
    if url.startswith(RESOURCE_URL_PREFIX):
        path = ROOT / "resouce" / Path(unquote(url[len(RESOURCE_URL_PREFIX) :]))
        return path if path.is_file() else None
    return None


def episode_reference(episode: int) -> Path:
    matches = sorted(EPISODE_REFERENCE_ROOT.glob(f"EP{episode:02d}_*.png"))
    if not matches:
        raise FileNotFoundError(f"找不到 EP{episode:02d} 关键参考图")
    return matches[0]


def select_source_image(card: dict) -> Path:
    """优先使用卡片现有首帧，否则使用该集关键参考图。"""

    for url in card.get("images", []):
        if url.startswith(OUTPUT_URL_PREFIX):
            continue
        source = resolve_image_url(url)
        if source is not None:
            return source
    return episode_reference(int(card["episode"]))


def safe_name(value: str) -> str:
    value = re.sub(r"[<>:\"/\\|?*\x00-\x1f]+", "_", value)
    value = re.sub(r"\s+", "", value).strip("._")
    return value[:72] or "未命名"


def board_filename(card: dict) -> str:
    episode = int(card["episode"])
    shot_number = int(card.get("shot_number") or 0)
    title = re.sub(r"^G\d+\s*", "", card.get("title", ""))
    title = re.sub(r"\s*分镜$", "", title)
    return f"EP{episode:02d}_G{shot_number:02d}_{safe_name(title)}_动作轨迹故事板.jpg"


def board_relative_path(card: dict) -> Path:
    return Path(f"EP{int(card['episode']):02d}") / board_filename(card)


def board_resource_url(card: dict) -> str:
    return OUTPUT_URL_PREFIX + board_relative_path(card).as_posix()


def _text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> int:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0]


def wrap_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.ImageFont,
    max_width: int,
    max_lines: int,
) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return ["—"]
    lines: list[str] = []
    current = ""
    for char in text:
        candidate = current + char
        if current and _text_width(draw, candidate, font) > max_width:
            lines.append(current)
            current = char
            if len(lines) == max_lines:
                break
        else:
            current = candidate
    if len(lines) < max_lines and current:
        lines.append(current)
    consumed = "".join(lines)
    if len(consumed) < len(text) and lines:
        ellipsis = "…"
        while lines[-1] and _text_width(draw, lines[-1] + ellipsis, font) > max_width:
            lines[-1] = lines[-1][:-1]
        lines[-1] += ellipsis
    return lines


def draw_arrow(
    draw: ImageDraw.ImageDraw,
    start: tuple[int, int],
    end: tuple[int, int],
    color: tuple[int, int, int, int] | tuple[int, int, int],
    width: int = 8,
) -> None:
    draw.line((start, end), fill=color, width=width)
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    size = width * 3
    left = (
        end[0] - size * math.cos(angle - 0.52),
        end[1] - size * math.sin(angle - 0.52),
    )
    right = (
        end[0] - size * math.cos(angle + 0.52),
        end[1] - size * math.sin(angle + 0.52),
    )
    draw.polygon((end, left, right), fill=color)


def _draw_arc_arrow(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    start_angle: int,
    end_angle: int,
    color: tuple[int, int, int],
    width: int,
) -> None:
    draw.arc(box, start=start_angle, end=end_angle, fill=color, width=width)
    cx = (box[0] + box[2]) / 2
    cy = (box[1] + box[3]) / 2
    rx = (box[2] - box[0]) / 2
    ry = (box[3] - box[1]) / 2
    angle = math.radians(end_angle)
    tip = (int(cx + rx * math.cos(angle)), int(cy + ry * math.sin(angle)))
    tangent = angle + math.pi / 2
    tail = (int(tip[0] - 24 * math.cos(tangent)), int(tip[1] - 24 * math.sin(tangent)))
    draw_arrow(draw, tail, tip, color, max(4, width - 2))


def draw_motion_overlay(
    draw: ImageDraw.ImageDraw,
    rect: tuple[int, int, int, int],
    subshot: Subshot,
) -> None:
    """在视觉帧上绘制主体动作线和唯一运镜。"""

    x1, y1, x2, y2 = rect
    width, height = x2 - x1, y2 - y1
    orange = (255, 145, 45)
    cyan = (64, 202, 255)
    direction = subshot.direction + " " + subshot.purpose + " " + " ".join(subshot.actions)
    if any(word in direction for word in ("环绕", "旋转", "弧线", "盘旋")):
        _draw_arc_arrow(
            draw,
            (x1 + width // 4, y1 + height // 5, x2 - width // 4, y2 - height // 5),
            200,
            520,
            orange,
            9,
        )
    elif any(word in direction for word in ("右→左", "右向左")):
        draw_arrow(draw, (x2 - 60, y1 + height * 2 // 3), (x1 + 60, y1 + height // 3), orange, 9)
    elif any(word in direction for word in ("左→右", "左向右")):
        draw_arrow(draw, (x1 + 60, y1 + height * 2 // 3), (x2 - 60, y1 + height // 3), orange, 9)
    elif any(word in direction for word in ("下坠", "坠落", "向下", "落下", "下砸")):
        draw_arrow(draw, (x1 + width // 2, y1 + 48), (x1 + width // 2, y2 - 48), orange, 9)
    elif any(word in direction for word in ("上升", "升空", "向上", "跃起", "抬起")):
        draw_arrow(draw, (x1 + width // 2, y2 - 48), (x1 + width // 2, y1 + 48), orange, 9)
    else:
        draw_arrow(draw, (x1 + 65, y2 - 55), (x2 - 65, y1 + 62), orange, 9)

    camera = subshot.camera.lower()
    if any(word in camera for word in ("环绕", "orbit", "arc")):
        _draw_arc_arrow(draw, (x1 + 30, y1 + 28, x1 + 150, y1 + 148), 40, 310, cyan, 6)
    elif any(word in camera for word in ("推近", "dolly in", "zoom in")):
        draw.rectangle((x2 - 155, y1 + 32, x2 - 42, y1 + 108), outline=cyan, width=5)
        draw.rectangle((x2 - 132, y1 + 47, x2 - 65, y1 + 93), outline=cyan, width=4)
        draw_arrow(draw, (x2 - 145, y1 + 118), (x2 - 96, y1 + 79), cyan, 5)
    elif any(word in camera for word in ("拉远", "dolly out", "zoom out")):
        draw.rectangle((x2 - 155, y1 + 32, x2 - 42, y1 + 108), outline=cyan, width=5)
        draw.rectangle((x2 - 132, y1 + 47, x2 - 65, y1 + 93), outline=cyan, width=4)
        draw_arrow(draw, (x2 - 96, y1 + 79), (x2 - 145, y1 + 118), cyan, 5)
    elif any(word in camera for word in ("固定", "static")):
        cx, cy = x2 - 88, y1 + 72
        draw.ellipse((cx - 28, cy - 28, cx + 28, cy + 28), outline=cyan, width=5)
        draw.line((cx - 40, cy, cx + 40, cy), fill=cyan, width=3)
        draw.line((cx, cy - 40, cx, cy + 40), fill=cyan, width=3)
    elif any(word in camera for word in ("摇", "pan", "横移", "tracking", "跟随", "follow")):
        draw_arrow(draw, (x1 + 45, y1 + 42), (x1 + 170, y1 + 42), cyan, 6)
    elif any(word in camera for word in ("俯仰", "tilt")):
        draw_arrow(draw, (x1 + 55, y2 - 35), (x1 + 55, y1 + 40), cyan, 6)
    else:
        draw_arrow(draw, (x1 + 45, y1 + 42), (x1 + 145, y1 + 42), cyan, 6)


def _crop_center_for(index: int) -> tuple[float, float]:
    centers = ((0.35, 0.45), (0.5, 0.5), (0.65, 0.45), (0.45, 0.62), (0.58, 0.38))
    return centers[index % len(centers)]


def prepared_visual(source: Image.Image, size: tuple[int, int], index: int) -> Image.Image:
    image = ImageOps.exif_transpose(source).convert("RGB")
    image = ImageOps.fit(
        image,
        size,
        method=Image.Resampling.LANCZOS,
        centering=_crop_center_for(index),
    )
    image = ImageEnhance.Contrast(image).enhance(0.92)
    image = ImageEnhance.Brightness(image).enhance(0.72)
    return image


def _draw_labeled_text(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    label: str,
    value: str,
    *,
    font: ImageFont.ImageFont,
    label_font: ImageFont.ImageFont,
    width: int,
    max_lines: int = 1,
    color: tuple[int, int, int] = (220, 228, 238),
) -> int:
    label_width = _text_width(draw, label, label_font)
    draw.text((x, y), label, fill=(104, 205, 255), font=label_font)
    lines = wrap_text(draw, value, font, width - label_width, max_lines)
    line_height = font.size + 7 if hasattr(font, "size") else 28
    for line_index, line in enumerate(lines):
        draw.text((x + label_width, y + line_index * line_height), line, fill=color, font=font)
    return y + max(1, len(lines)) * line_height


def render_board(
    card: dict,
    subshots: list[Subshot],
    source_path: Path,
    output_path: Path,
    *,
    jpeg_quality: int = 88,
) -> None:
    if not subshots:
        raise ValueError(f"卡片 {card['card_id']} 没有可解析的子镜头")

    columns = 4
    rows = math.ceil(len(subshots) / columns)
    canvas_width = 2600
    margin_x = 54
    gap_x = 24
    header_height = 170
    footer_height = 48
    panel_width = (canvas_width - margin_x * 2 - gap_x * (columns - 1)) // columns
    panel_height = 690
    gap_y = 26
    canvas_height = header_height + rows * panel_height + (rows - 1) * gap_y + footer_height

    image = Image.new("RGB", (canvas_width, canvas_height), (8, 12, 18))
    draw = ImageDraw.Draw(image)
    title_font = make_font(50, bold=True)
    subtitle_font = make_font(24)
    panel_title_font = make_font(28, bold=True)
    body_font = make_font(21)
    body_bold_font = make_font(21, bold=True)
    small_font = make_font(18)

    episode = int(card["episode"])
    shot_number = int(card.get("shot_number") or 0)
    title = card.get("title", card["card_id"])
    display_title = re.sub(r"^G\d+\s*", "", title)
    duration_match = re.search(r"成片时长([^|\n]+)", card.get("content", ""))
    duration = duration_match.group(1).strip() if duration_match else ""
    draw.text(
        (margin_x, 34),
        f"EP{episode:02d} · G{shot_number} · {display_title}",
        fill=(246, 248, 252),
        font=title_font,
    )
    draw.text(
        (margin_x, 104),
        f"动作轨迹故事板｜{len(subshots)} 个独立子镜头｜成片 {duration or '按时间码'}｜橙色=主体动作  蓝色=镜头运动",
        fill=(159, 177, 198),
        font=subtitle_font,
    )
    draw.line((margin_x, 148, canvas_width - margin_x, 148), fill=(67, 88, 112), width=2)

    with Image.open(source_path) as source:
        for index, subshot in enumerate(subshots):
            row, col = divmod(index, columns)
            x = margin_x + col * (panel_width + gap_x)
            y = header_height + row * (panel_height + gap_y)
            draw.rounded_rectangle(
                (x, y, x + panel_width, y + panel_height),
                radius=14,
                fill=(15, 21, 30),
                outline=(67, 92, 120),
                width=3,
            )
            visual_rect = (x + 12, y + 12, x + panel_width - 12, y + 350)
            visual_size = (visual_rect[2] - visual_rect[0], visual_rect[3] - visual_rect[1])
            visual = prepared_visual(source, visual_size, index)
            image.paste(visual, (visual_rect[0], visual_rect[1]))

            overlay = Image.new("RGBA", visual_size, (0, 0, 0, 0))
            overlay_draw = ImageDraw.Draw(overlay)
            overlay_draw.rectangle((0, 0, visual_size[0], 52), fill=(5, 9, 14, 205))
            overlay_draw.rectangle((0, visual_size[1] - 52, visual_size[0], visual_size[1]), fill=(5, 9, 14, 185))
            image.paste(overlay, (visual_rect[0], visual_rect[1]), overlay)
            draw = ImageDraw.Draw(image)
            draw_motion_overlay(draw, visual_rect, subshot)

            time_label = f"{subshot.number:02d}  {subshot.timecode}  {subshot.duration}"
            draw.text((visual_rect[0] + 14, visual_rect[1] + 10), time_label, fill=(255, 255, 255), font=panel_title_font)
            draw.text(
                (visual_rect[0] + 14, visual_rect[3] - 42),
                _shorten(subshot.direction or "轴线按前后镜连续", 32),
                fill=(242, 206, 132),
                font=small_font,
            )

            text_x = x + 20
            text_y = y + 370
            text_width = panel_width - 40
            text_y = _draw_labeled_text(
                draw, text_x, text_y, "景别：", subshot.framing,
                font=body_font, label_font=body_bold_font, width=text_width,
            )
            text_y = _draw_labeled_text(
                draw, text_x, text_y + 3, "运镜：", subshot.camera,
                font=body_font, label_font=body_bold_font, width=text_width,
            )
            text_y = _draw_labeled_text(
                draw, text_x, text_y + 3, "主体：", subshot.subject,
                font=body_font, label_font=body_bold_font, width=text_width,
            )
            action_text = subshot.purpose or (
                subshot.actions[min(1, len(subshot.actions) - 1)] if subshot.actions else ""
            )
            text_y = _draw_labeled_text(
                draw, text_x, text_y + 3, "动作：", action_text,
                font=body_font, label_font=body_bold_font, width=text_width, max_lines=2,
                color=(242, 222, 190),
            )
            text_y = _draw_labeled_text(
                draw, text_x, text_y + 3, "落点：", subshot.end_pose,
                font=small_font, label_font=body_bold_font, width=text_width, max_lines=2,
                color=(186, 201, 218),
            )
            draw.text(
                (text_x, min(y + panel_height - 36, text_y + 6)),
                _shorten(f"光影：{subshot.lighting}｜声音：{subshot.sound}", 48),
                fill=(127, 148, 171),
                font=small_font,
            )

    draw = ImageDraw.Draw(image)
    draw.text(
        (margin_x, canvas_height - 35),
        f"{card['card_id']}｜renderer v{RENDERER_VERSION}｜视觉锚点：{source_path.name}｜仅表达镜头调度，不替代最终成片",
        fill=(104, 121, 142),
        font=small_font,
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, "JPEG", quality=jpeg_quality, optimize=True, progressive=True)


def _thumbnail(path: Path, size: tuple[int, int]) -> Image.Image:
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        return ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.12))


def render_episode_overview(episode: int, records: list[BoardRecord]) -> Path:
    columns = 3
    rows = math.ceil(len(records) / columns)
    width = 2400
    margin = 50
    gap = 24
    header = 120
    cell_width = (width - margin * 2 - gap * (columns - 1)) // columns
    cell_height = 480
    height = header + rows * cell_height + (rows - 1) * gap + 45
    canvas = Image.new("RGB", (width, height), (8, 12, 18))
    draw = ImageDraw.Draw(canvas)
    draw.text((margin, 28), f"EP{episode:02d} 动作轨迹故事板总览", fill="white", font=make_font(44, bold=True))
    draw.text((width - 500, 42), f"{len(records)} 个 G 单元", fill=(132, 199, 244), font=make_font(26))
    for index, record in enumerate(records):
        row, col = divmod(index, columns)
        x = margin + col * (cell_width + gap)
        y = header + row * (cell_height + gap)
        thumb = _thumbnail(Path(record.output_file), (cell_width, cell_height - 72))
        canvas.paste(thumb, (x, y + 54))
        draw.rectangle((x, y, x + cell_width, y + 54), fill=(18, 27, 39))
        draw.text(
            (x + 14, y + 10),
            f"G{record.shot_number} {record.title}｜{record.subshot_count} 镜",
            fill=(242, 246, 250),
            font=make_font(24, bold=True),
        )
    path = OUTPUT_ROOT / "总览" / f"EP{episode:02d}_动作轨迹故事板总览.jpg"
    path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(path, "JPEG", quality=84, optimize=True, progressive=True)
    return path


def render_season_overview(episode_overviews: list[tuple[int, Path]]) -> Path:
    columns = 4
    rows = math.ceil(len(episode_overviews) / columns)
    width = 2600
    margin = 48
    gap = 20
    header = 125
    cell_width = (width - margin * 2 - gap * (columns - 1)) // columns
    cell_height = 390
    height = header + rows * cell_height + (rows - 1) * gap + 46
    canvas = Image.new("RGB", (width, height), (7, 10, 15))
    draw = ImageDraw.Draw(canvas)
    draw.text((margin, 26), "《九陆纪元》S1 EP01–EP24 动作轨迹故事板总览", fill="white", font=make_font(46, bold=True))
    for index, (episode, path) in enumerate(episode_overviews):
        row, col = divmod(index, columns)
        x = margin + col * (cell_width + gap)
        y = header + row * (cell_height + gap)
        thumb = _thumbnail(path, (cell_width, cell_height - 54))
        canvas.paste(thumb, (x, y + 54))
        draw.rectangle((x, y, x + cell_width, y + 54), fill=(18, 27, 39))
        draw.text((x + 14, y + 9), f"EP{episode:02d}", fill=(242, 246, 250), font=make_font(26, bold=True))
    path = OUTPUT_ROOT / "总览" / "九陆纪元_S1_EP01-EP24_动作轨迹故事板总览.jpg"
    canvas.save(path, "JPEG", quality=84, optimize=True, progressive=True)
    return path


def write_manifest(records: list[BoardRecord], season_overview: Path | None) -> None:
    payload = {
        "renderer_version": RENDERER_VERSION,
        "summary": {
            "episodes": len({record.episode for record in records}),
            "boards": len(records),
            "subshots": sum(record.subshot_count for record in records),
            "season_overview": str(season_overview) if season_overview else None,
        },
        "boards": [asdict(record) for record in records],
    }
    (OUTPUT_ROOT / "manifest.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    lines = [
        "# 《九陆纪元》S1 动作轨迹故事板交付清单",
        "",
        f"- 集数：{payload['summary']['episodes']}",
        f"- G 单元故事板：{payload['summary']['boards']} 张",
        f"- 独立子镜头：{payload['summary']['subshots']} 格",
        "- 图例：橙色为主体动作轨迹，蓝色为唯一运镜；每张大图对应一张 storyboard 卡。",
        "",
        "| 集 | G 单元 | 子镜头 | 卡片 | 文件 |",
        "|---|---:|---:|---|---|",
    ]
    for record in records:
        relative = Path(record.output_file).relative_to(OUTPUT_ROOT).as_posix()
        lines.append(
            f"| EP{record.episode:02d} | G{record.shot_number} {record.title} | "
            f"{record.subshot_count} | `{record.card_id}` | `{relative}` |"
        )
    (OUTPUT_ROOT / "交付清单.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def update_storyboard_cards(cards: list[dict], records: list[BoardRecord]) -> None:
    by_card = {record.card_id: record for record in records}
    for card in cards:
        record = by_card.get(card.get("card_id"))
        if record is None:
            continue
        existing = [url for url in card.get("images", []) if not url.startswith(OUTPUT_URL_PREFIX)]
        card["images"] = [record.resource_url, *existing]
        metadata = card.setdefault("metadata", {})
        metadata["trajectory_storyboard"] = {
            "url": record.resource_url,
            "subshot_count": record.subshot_count,
            "renderer_version": RENDERER_VERSION,
        }


def main() -> None:
    args = parse_args()
    if not 60 <= args.jpeg_quality <= 95:
        raise ValueError("--jpeg-quality 必须在 60 到 95 之间")
    cards = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    selected_episodes = set(args.episode or [])
    selected_cards = set(args.card or [])
    storyboard_cards = [
        card
        for card in cards
        if card.get("stage") == "storyboard"
        and card.get("episode") is not None
        and (not selected_episodes or int(card["episode"]) in selected_episodes)
        and (not selected_cards or card["card_id"] in selected_cards)
    ]
    storyboard_cards.sort(key=lambda card: (int(card["episode"]), int(card.get("shot_number") or 0)))
    if not storyboard_cards:
        raise ValueError("没有符合条件的 storyboard 卡")

    records: list[BoardRecord] = []
    for index, card in enumerate(storyboard_cards, start=1):
        subshots = parse_subshots(card.get("content", ""))
        source = select_source_image(card)
        relative_path = board_relative_path(card)
        output_path = OUTPUT_ROOT / relative_path
        render_board(card, subshots, source, output_path, jpeg_quality=args.jpeg_quality)
        record = BoardRecord(
            card_id=card["card_id"],
            episode=int(card["episode"]),
            shot_number=int(card.get("shot_number") or 0),
            title=card.get("title", card["card_id"]),
            subshot_count=len(subshots),
            source_image=str(source),
            output_file=str(output_path),
            resource_url=board_resource_url(card),
        )
        records.append(record)
        print(f"[{index:03d}/{len(storyboard_cards):03d}] {card['card_id']} -> {output_path.name}")

    season_overview: Path | None = None
    if not args.skip_overviews:
        grouped: dict[int, list[BoardRecord]] = {}
        for record in records:
            grouped.setdefault(record.episode, []).append(record)
        episode_overviews = [
            (episode, render_episode_overview(episode, episode_records))
            for episode, episode_records in sorted(grouped.items())
        ]
        season_overview = render_season_overview(episode_overviews)

    write_manifest(records, season_overview)
    if args.write_cards:
        update_storyboard_cards(cards, records)
        CARDS_PATH.write_text(
            json.dumps(cards, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    print(
        f"完成：{len(records)} 张 G 单元轨迹板，"
        f"{sum(record.subshot_count for record in records)} 个独立子镜头；"
        f"cards.json {'已回写' if args.write_cards else '未回写'}。"
    )


if __name__ == "__main__":
    main()
