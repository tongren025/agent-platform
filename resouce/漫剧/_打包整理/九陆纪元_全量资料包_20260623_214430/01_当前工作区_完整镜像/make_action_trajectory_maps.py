from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "output" / "trajectory"
OUT.mkdir(parents=True, exist_ok=True)

FONT = Path(r"C:\Windows\Fonts\msyh.ttc")
BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")
if not FONT.exists():
    FONT = Path(r"C:\Windows\Fonts\simhei.ttf")
if not BOLD.exists():
    BOLD = FONT


def f(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)


def arrow(draw, p1, p2, color, width=8, label=None, label_offset=(0, 0)):
    draw.line([p1, p2], fill=color, width=width)
    ang = math.atan2(p2[1] - p1[1], p2[0] - p1[0])
    size = width * 3
    pts = [
        p2,
        (p2[0] - size * math.cos(ang - 0.45), p2[1] - size * math.sin(ang - 0.45)),
        (p2[0] - size * math.cos(ang + 0.45), p2[1] - size * math.sin(ang + 0.45)),
    ]
    draw.polygon(pts, fill=color)
    if label:
        draw.text((p2[0] + label_offset[0], p2[1] + label_offset[1]), label, fill=color, font=f(28, True))


def title(draw, text, subtitle):
    draw.text((54, 36), text, fill=(245, 245, 245), font=f(46, True))
    draw.text((56, 94), subtitle, fill=(180, 190, 205), font=f(24))


def grid_bg(draw, w, h):
    draw.rectangle((0, 0, w, h), fill=(14, 18, 25))
    for x in range(0, w, 80):
        draw.line((x, 0, x, h), fill=(26, 35, 48), width=1)
    for y in range(0, h, 80):
        draw.line((0, y, w, y), fill=(26, 35, 48), width=1)
    draw.rectangle((38, 28, w - 38, h - 38), outline=(75, 96, 125), width=2)


def legend(draw, items, x, y):
    for i, (name, color) in enumerate(items):
        yy = y + i * 42
        draw.rounded_rectangle((x, yy, x + 32, yy + 20), radius=8, fill=color)
        draw.text((x + 46, yy - 7), name, fill=(225, 230, 235), font=f(22))


def map_01():
    w, h = 1600, 900
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    grid_bg(d, w, h)
    title(d, "轨迹图 01：前10秒巨龙开场与艾拉战斗", "镜头 01-08 / 竞技场空间关系 / 不用于成片，只用于动作调度")

    # arena ellipse
    d.ellipse((250, 180, 1350, 780), outline=(110, 100, 88), width=5)
    d.ellipse((460, 300, 1140, 660), outline=(75, 70, 68), width=3)
    d.text((735, 462), "竞技场中心", fill=(130, 140, 150), font=f(28))

    # dragon path
    d.arc((420, 90, 1460, 650), 190, 355, fill=(235, 116, 56), width=10)
    arrow(d, (1260, 295), (1000, 330), (235, 116, 56), 9, "巨龙低空压场", (-70, -58))
    d.polygon([(1070, 240), (1195, 270), (1120, 335), (955, 320)], fill=(70, 45, 36), outline=(230, 130, 72))
    d.text((1110, 210), "龙头/龙焰方向", fill=(255, 188, 118), font=f(24, True))

    # Aila movement
    d.rectangle((420, 570, 455, 650), fill=(120, 120, 130))
    d.text((385, 660), "断柱起手", fill=(210, 220, 235), font=f(22))
    arrow(d, (450, 570), (610, 390), (79, 178, 255), 8, "跃起闪避", (10, -45))
    arrow(d, (610, 390), (790, 470), (79, 178, 255), 8, "落地撑盾", (18, 4))
    arrow(d, (790, 470), (920, 345), (79, 178, 255), 8, "反击", (12, -40))

    # magic rings
    for cx, cy, r in [(610, 390, 48), (790, 470, 72), (920, 345, 56), (1020, 328, 44)]:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(94, 205, 255), width=4)
        d.ellipse((cx - r // 2, cy - r // 2, cx + r // 2, cy + r // 2), outline=(168, 230, 255), width=2)

    legend(d, [("蓝色：艾拉移动/星环法术", (79, 178, 255)), ("橙色：巨龙飞行/龙焰压力", (235, 116, 56)), ("灰色：竞技场结构", (110, 100, 88))], 70, 720)
    img.save(OUT / "轨迹图01_前10秒_巨龙与艾拉战斗路线.png")


def map_02():
    w, h = 1600, 900
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    grid_bg(d, w, h)
    title(d, "轨迹图 02：艾拉星环法术分层", "前10秒特效调度 / 蓝白星环对赤金龙焰")

    center = (800, 470)
    d.ellipse((center[0] - 105, center[1] - 105, center[0] + 105, center[1] + 105), outline=(90, 205, 255), width=6)
    d.ellipse((center[0] - 65, center[1] - 65, center[0] + 65, center[1] + 65), outline=(160, 230, 255), width=3)
    d.text((742, 454), "艾拉", fill=(245, 245, 255), font=f(34, True))

    rings = [
        ((540, 335), "A 起手阵", 58),
        ((685, 255), "B 空中闪避阵", 70),
        ((1020, 310), "C 螺旋攻击阵", 78),
        ((910, 590), "D 护盾阵", 92),
        ((640, 625), "E 托举落点阵", 54),
    ]
    for (cx, cy), lab, r in rings:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(80, 185, 255), width=5)
        d.ellipse((cx - r * 0.58, cy - r * 0.58, cx + r * 0.58, cy + r * 0.58), outline=(190, 240, 255), width=2)
        d.text((cx - 74, cy + r + 12), lab, fill=(205, 235, 255), font=f(24, True))
        arrow(d, center, (cx, cy), (80, 185, 255), 5)

    arrow(d, (1100, 350), (1285, 420), (245, 132, 62), 12, "龙焰压力", (-80, -58))
    for i in range(7):
        x = 1110 + i * 30
        d.line((x, 320 + i * 10, x + 130, 410 + i * 4), fill=(255, 170, 80), width=3)

    legend(d, [("A-E：艾拉法阵触发顺序", (80, 185, 255)), ("橙色：龙焰压迫方向", (245, 132, 62)), ("中心：艾拉身体/法杖轴心", (245, 245, 255))], 70, 720)
    img.save(OUT / "轨迹图02_前10秒_艾拉星环法术分层.png")


def map_03():
    w, h = 1600, 900
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    grid_bg(d, w, h)
    title(d, "轨迹图 03：雨巷围杀空间调度", "三个月前 / 三名暴徒三角围猎 / 苍霖濒死点")

    # alley
    d.polygon([(360, 160), (1240, 160), (1420, 790), (180, 790)], outline=(85, 105, 128), fill=(26, 35, 45))
    d.line((560, 160, 410, 790), fill=(60, 75, 95), width=4)
    d.line((1040, 160, 1190, 790), fill=(60, 75, 95), width=4)
    d.rectangle((1060, 500, 1320, 690), outline=(110, 95, 82), width=5)
    d.text((1112, 706), "锈车残骸", fill=(180, 165, 150), font=f(24))

    # Canglin
    d.ellipse((1175, 455, 1235, 515), fill=(80, 145, 210))
    d.text((1150, 420), "苍霖濒死点", fill=(135, 205, 255), font=f(26, True))

    # attackers
    attackers = [((840, 430), "暴徒甲/钢筋", (230, 95, 65)), ((520, 535), "暴徒乙/短刀", (220, 165, 65)), ((760, 650), "暴徒丙/铁链", (190, 90, 210))]
    for pos, lab, col in attackers:
        x, y = pos
        d.ellipse((x - 34, y - 34, x + 34, y + 34), fill=col)
        d.text((x - 70, y + 48), lab, fill=col, font=f(24, True))
        arrow(d, pos, (1200, 485), col, 7)

    d.line((840, 430, 1190, 485), fill=(240, 105, 80), width=5)
    d.text((900, 386), "钢筋抵喉主压力线", fill=(240, 105, 80), font=f(24, True))
    legend(d, [("蓝色：苍霖位置", (80, 145, 210)), ("红色：主攻击线", (230, 95, 65)), ("黄色/紫色：侧翼封锁", (220, 165, 65))], 70, 720)
    img.save(OUT / "轨迹图03_雨巷围杀空间调度.png")


def map_04():
    w, h = 1600, 900
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    grid_bg(d, w, h)
    title(d, "轨迹图 04：艾拉雨水魔法救场", "水洼开阵 -> 水镜偏移 -> 雨滴符针 -> 近身收束")

    # alley base
    d.rectangle((220, 190, 1380, 730), outline=(70, 85, 105), width=4, fill=(22, 30, 40))
    d.text((250, 205), "雨巷地面俯视", fill=(150, 165, 185), font=f(24))

    # puddles/circles
    puddles = [(520, 540, "1 水洼开阵"), (820, 460, "2 水镜竖起"), (1040, 560, "3 符针锁敌")]
    for cx, cy, lab in puddles:
        d.ellipse((cx - 92, cy - 38, cx + 92, cy + 38), outline=(80, 205, 255), width=5)
        d.ellipse((cx - 58, cy - 24, cx + 58, cy + 24), outline=(180, 240, 255), width=2)
        d.text((cx - 88, cy + 52), lab, fill=(150, 225, 255), font=f(24, True))

    # characters
    d.ellipse((1185, 410, 1245, 470), fill=(80, 145, 210))
    d.text((1154, 372), "苍霖", fill=(150, 215, 255), font=f(25, True))
    d.ellipse((380, 380, 440, 440), fill=(80, 205, 255))
    d.text((352, 342), "艾拉入场", fill=(150, 235, 255), font=f(25, True))
    d.ellipse((945, 410, 1010, 475), fill=(230, 95, 65))
    d.text((920, 377), "暴徒甲", fill=(245, 130, 100), font=f(25, True))
    d.ellipse((1040, 610, 1095, 665), fill=(210, 155, 65))
    d.ellipse((725, 625, 780, 680), fill=(190, 90, 210))

    arrow(d, (410, 410), (520, 540), (80, 205, 255), 8)
    arrow(d, (520, 540), (820, 460), (80, 205, 255), 8)
    arrow(d, (820, 460), (960, 440), (80, 205, 255), 8, "偏移钢筋", (12, -48))
    arrow(d, (1040, 560), (1070, 630), (80, 205, 255), 6)
    arrow(d, (1040, 560), (755, 650), (80, 205, 255), 6)
    arrow(d, (410, 410), (1210, 440), (160, 230, 255), 4, "倒影跨步到苍霖身边", (-230, -70))

    legend(d, [("蓝色：艾拉魔法/位移", (80, 205, 255)), ("红色：处刑威胁", (230, 95, 65)), ("黄紫：被控敌人", (210, 155, 65))], 70, 720)
    img.save(OUT / "轨迹图04_艾拉雨水魔法救场.png")


if __name__ == "__main__":
    map_01()
    map_02()
    map_03()
    map_04()
    print(OUT)
