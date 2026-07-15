from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "EP01_01_0-10秒_制作包" / "04_分镜轨迹图"
OUT.mkdir(parents=True, exist_ok=True)

FONT = Path(r"C:\Windows\Fonts\msyh.ttc")
BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")
if not FONT.exists():
    FONT = Path(r"C:\Windows\Fonts\simhei.ttf")
if not BOLD.exists():
    BOLD = FONT


def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)


shots = [
    ("01", "巨龙压场", "低机位上仰，巨龙从云层压下。", "龙：天空左后->竞技场上空；镜头：碎石前景上仰。", "dragon"),
    ("02", "艾拉起阵", "绕断柱半圈推近，蓝白星环展开。", "艾拉定点；法阵：掌心向外三层扩张。", "magic"),
    ("03", "龙焰蓄力", "龙头特写切艾拉眼睛。", "龙焰：龙喉->艾拉；艾拉护盾压缩成面。", "duel"),
    ("04", "跃起闪避", "跟随艾拉跃出断柱。", "艾拉：断柱->空中左弧线；龙焰：右->左横扫。", "fight"),
    ("05", "星环反击", "跟随蓝色射线冲向龙翼。", "魔法：艾拉->龙翼根；碎石向外爆散。", "fight"),
    ("06", "护盾承压", "低机位跟巨爪砸地。", "巨爪：上->下；艾拉：中心->后滑，撑盾。", "fight"),
    ("07", "法阵包围", "鸟瞰环绕，多个法阵升空。", "星环：地面/碎石->空中；围绕龙颈和翼骨。", "magic"),
    ("08", "龙翼破阵", "快速推近巨龙，甩回艾拉正面。", "龙翼震开星环；艾拉后退稳住，准备下一轮。", "duel"),
]


colors = {
    "dragon": (238, 118, 58),
    "magic": (82, 202, 255),
    "duel": (245, 170, 80),
    "fight": (82, 202, 255),
}


def arrow(draw, p1, p2, color, width=7):
    draw.line((p1, p2), fill=color, width=width)
    ang = math.atan2(p2[1] - p1[1], p2[0] - p1[0])
    size = width * 3
    pts = [
        p2,
        (p2[0] - size * math.cos(ang - 0.48), p2[1] - size * math.sin(ang - 0.48)),
        (p2[0] - size * math.cos(ang + 0.48), p2[1] - size * math.sin(ang + 0.48)),
    ]
    draw.polygon(pts, fill=color)


def wrap(text, n):
    out, cur = [], ""
    for ch in text:
        cur += ch
        if len(cur) >= n:
            out.append(cur)
            cur = ""
    if cur:
        out.append(cur)
    return out


def draw_panel(draw, box, shot):
    x1, y1, x2, y2 = box
    pid, title, camera, action, typ = shot
    c = colors[typ]
    draw.rounded_rectangle(box, radius=12, fill=(18, 24, 32), outline=(82, 105, 132), width=2)
    draw.rectangle((x1, y1, x2, y1 + 44), fill=(10, 14, 20))
    draw.text((x1 + 14, y1 + 9), f"{pid} {title}", fill=(245, 245, 245), font=font(25, True))
    ax1, ay1, ax2, ay2 = x1 + 18, y1 + 58, x2 - 18, y1 + 224
    draw.rounded_rectangle((ax1, ay1, ax2, ay2), radius=8, fill=(25, 34, 45), outline=(54, 70, 92), width=1)
    cx, cy = (ax1 + ax2) // 2, (ay1 + ay2) // 2
    draw.ellipse((ax1 + 34, ay1 + 34, ax2 - 34, ay2 - 28), outline=(96, 84, 68), width=3)
    if typ == "dragon":
        draw.arc((ax1 + 55, ay1 + 5, ax2 - 30, ay2 - 15), 195, 350, fill=c, width=8)
        arrow(draw, (ax2 - 70, ay1 + 80), (cx + 20, cy), c, 7)
    elif typ == "magic":
        draw.rectangle((ax1 + 55, ay2 - 75, ax1 + 82, ay2 - 25), fill=(130, 130, 145))
        for r in [32, 58, 86]:
            draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=c, width=4)
        arrow(draw, (ax1 + 75, ay2 - 70), (cx, cy), c, 6)
    elif typ == "duel":
        arrow(draw, (ax2 - 70, ay1 + 58), (cx + 10, cy), (238, 118, 58), 8)
        for r in [44, 70]:
            draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(82, 202, 255), width=4)
        arrow(draw, (cx, cy), (ax2 - 72, ay1 + 80), c, 5)
    else:
        arrow(draw, (ax1 + 72, ay2 - 42), (cx - 35, ay1 + 54), (82, 202, 255), 7)
        arrow(draw, (cx - 35, ay1 + 54), (cx + 95, cy + 10), (82, 202, 255), 7)
        arrow(draw, (ax2 - 65, ay1 + 48), (cx + 25, cy), (238, 118, 58), 8)
        draw.ellipse((cx - 52, cy - 52, cx + 52, cy + 52), outline=(82, 202, 255), width=4)
    ty = y1 + 236
    draw.text((x1 + 16, ty), "镜头:", fill=(140, 215, 255), font=font(16, True))
    for line in wrap(camera, 22):
        draw.text((x1 + 66, ty), line, fill=(220, 230, 238), font=font(16))
        ty += 22
    draw.text((x1 + 16, ty), "轨迹:", fill=(255, 190, 105), font=font(16, True))
    for line in wrap(action, 22):
        draw.text((x1 + 66, ty), line, fill=(220, 230, 238), font=font(16))
        ty += 22


def main():
    w, h = 1600, 1000
    img = Image.new("RGB", (w, h), (10, 13, 18))
    draw = ImageDraw.Draw(img)
    draw.text((44, 30), "EP01 0-10秒 分镜轨迹图：巨龙开场与艾拉战斗", fill=(245, 245, 245), font=font(40, True))
    draw.text((46, 82), "每格对应一个镜头：蓝色为艾拉/法阵，橙色为巨龙/龙焰。", fill=(175, 190, 210), font=font(22))
    cols, rows = 4, 2
    margin_x, margin_y = 40, 135
    gap = 22
    cell_w, cell_h = 365, 395
    for i, shot in enumerate(shots):
        col, row = i % cols, i // cols
        x = margin_x + col * (cell_w + gap)
        y = margin_y + row * (cell_h + gap)
        draw_panel(draw, (x, y, x + cell_w, y + cell_h), shot)
    img.save(OUT / "EP01_0-10秒_8镜头分镜轨迹图.png")
    print(OUT / "EP01_0-10秒_8镜头分镜轨迹图.png")


if __name__ == "__main__":
    main()
