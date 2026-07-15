from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "output" / "trajectory_storyboard"
OUT.mkdir(parents=True, exist_ok=True)

FONT = Path(r"C:\Windows\Fonts\msyh.ttc")
BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")
if not FONT.exists():
    FONT = Path(r"C:\Windows\Fonts\simhei.ttf")
if not BOLD.exists():
    BOLD = FONT


def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)


F_TITLE = font(38, True)
F_HEAD = font(24, True)
F_BODY = font(17)
F_SMALL = font(14)


SHOTS = [
    ("P01", "巨龙压场", "镜头低位上仰；巨龙从上方掠过竞技场。", "龙：天空左后->右前盘旋；镜头：碎石前景上仰。", "arena"),
    ("P02", "艾拉起阵", "镜头绕断柱半圈推近；艾拉不动，法阵展开。", "艾拉：断柱定点；星环：掌心向外三层扩张。", "magic"),
    ("P03", "龙焰蓄力", "龙头特写切艾拉眼睛；压力线对准艾拉。", "龙焰：龙喉->艾拉；艾拉护盾：由点压缩成面。", "duel"),
    ("P04", "跃起闪避", "镜头跟随艾拉飞跃，避开横扫龙焰。", "艾拉：断柱->空中左弧线；龙焰：右->左横扫。", "fight"),
    ("P05", "星环反击", "镜头跟随蓝色射线冲向翼根。", "魔法：艾拉->龙翼根；碎石：向外爆散。", "fight"),
    ("P06", "护盾承压", "低机位跟巨爪落下，艾拉滑退撑盾。", "巨爪：上->下砸；艾拉：中心->后滑半米。", "fight"),
    ("P07", "苍霖远现", "拱门框景，镜头轻推；苍霖作为远处剪影。", "苍霖：入口定点；视线：苍霖->战场中心。", "entry"),
    ("P08", "苍霖走近", "正面跟拍苍霖穿过废墟。", "苍霖：拱门->竞技场中线；镜头后退跟随。", "entry"),
    ("P09", "艾拉分神", "前景艾拉，后景苍霖虚焦；拉焦。", "视线：艾拉->苍霖；法阵边缘短暂抖动。", "magic"),
    ("P10", "摸口袋", "中景定住，战场动势突然慢下来。", "苍霖手：腰侧->口袋；龙/艾拉动势减速。", "pause"),
    ("P11", "掏苹果", "静止镜头，龙焰和法阵同时熄灭。", "苹果：口袋->手心；龙焰粒子倒吸回龙喉。", "pause"),
    ("P12", "咬苹果", "近景，苹果咬声做节奏点。", "苍霖手：上抬->嘴边；另一手：向龙轻挥。", "pause"),
    ("P13", "龙眼变蠢", "龙眼大特写，瞳孔放大追苹果。", "视线：龙眼->苹果；威压线断开。", "reaction"),
    ("P14", "抛苹果", "苹果做前景弧线，龙头跟随转动。", "苹果：苍霖手->竞技场右侧；龙头同步转向。", "arc"),
    ("P15", "巨龙扑食", "横向跟拍龙扑向苹果。", "龙：中心->右侧低扑；尘浪：尾随扩散。", "arc"),
    ("P16", "小口啃", "中景定镜，巨龙坐下形成反差。", "龙：扑击->蹲坐；爪：捧苹果到嘴边。", "reaction"),
    ("P17", "艾拉吐槽", "双人中景，龙在后景趴下。", "艾拉：落到苍霖左侧；龙下巴：上->地面。", "dialog"),
    ("P18", "硬切雨夜", "碎片穿越转场，从竞技场切入雨巷。", "镜头：玻璃碎片间穿越；场景：暖色->冷蓝。", "transition"),
    ("P19", "弱小苍霖", "高角度压迫，苍霖靠墙喘息。", "苍霖：墙角定点；手：肋下伤口->墙面支撑。", "alley"),
    ("P20", "三人逼近", "群像中远景，三角围猎构图。", "暴徒甲：正前压近；乙左翼；丙右翼。", "alley"),
    ("P21", "钢筋擦耳", "手持近景，钢筋砸墙。", "甲钢筋：右上->左下砸墙；苍霖头：侧闪；手抓腕。", "melee"),
    ("P22", "头槌鼻梁", "极近，头槌撞击后双方短暂失衡。", "苍霖头：后缩->前撞；甲头：后仰。", "melee"),
    ("P23", "泥玻璃糊脸", "俯拍近景，弱者脏招。", "苍霖手：地面->甲脸；钢筋：甲手->苍霖手。", "melee"),
    ("P24", "再度包围", "全景，乙丙从两翼压上。", "乙：左前->中心；丙：右后->中心；苍霖后退。", "melee"),
    ("P25", "滑倒躲拳", "低机位，水花遮挡拳线。", "苍霖：后滑下坠；乙拳：头顶掠过；碎板砸墙。", "melee"),
    ("P26", "借势扫腿", "低机位侧拍，水花爆开。", "苍霖腿：地面弧扫->乙脚踝；乙重心前倒。", "melee"),
    ("P27", "丙撞墙", "倾斜镜头，侧面冲击。", "丙：右侧冲撞->墙；苍霖：被夹在丙与墙之间。", "melee"),
    ("P28", "被举起", "低角度，苍霖悬空。", "丙手臂：上提；苍霖肘：绕丙脖颈尝试卡住。", "melee"),
    ("P29", "泥地缠斗", "俯拍，二人摔进泥水。", "两人：墙边->地面；苍霖头槌：短距离连续下砸。", "melee"),
    ("P30", "三人围上", "高角度，三角压迫重新形成。", "甲乙丙：三点向内收；苍霖跪地中心。", "melee"),
    ("P31", "钢筋抵喉", "近景，甲把苍霖按车上。", "甲手：抓喉压车；钢筋：外侧->喉前。", "execute"),
    ("P32", "死前一厘米", "大特写，钢筋尖和喉结同框。", "钢筋尖：停在喉前；雨滴：尖端->下落。", "execute"),
    ("P33", "天穹裂开", "仰拍超远景，世界树露出。", "裂隙：天空中心向四周扩张；光根向下蔓延。", "worldtree"),
    ("P34", "世界体系", "宇宙级远景，浮空大陆显形。", "大陆碎片：缓慢错位；光丝：大陆间连接。", "worldtree"),
    ("P35", "光丝坠落", "远景深焦，暗金雨落向城市。", "光丝：天空->地面；城市水面映出星光。", "worldtree"),
    ("P36", "巷中停顿", "中远景，所有人冻结一秒。", "光丝落入三人之间；暴徒动作停顿；苍霖抬头。", "worldtree"),
    ("P37", "眼中倒影", "眼部大特写。", "倒影：世界树在瞳孔内扩张；眼睫微颤。", "worldtree"),
    ("P38", "指尖光丝", "微距，雨滴悬停。", "苍霖指尖：向上伸；光丝：下落停在一厘米外。", "worldtree"),
    ("P39", "掐灭天命", "近景，甲拳头切入画面。", "甲手：画外->抓住光丝；光粒：指缝外散后熄灭。", "execute"),
    ("P40", "没有觉醒", "手持冲击，苍霖撞车。", "甲拳：左->右击脸；苍霖：车门方向后撞滑落。", "execute"),
    ("P41", "最后一刺", "低角度，处刑线再次形成。", "甲钢筋：上举->下刺预备；蓝光在脚下水洼亮起。", "rescue"),
    ("P42", "水洼开阵", "极近，脚下法阵出现。", "水纹：脚底向外扩圆；雨滴：下落->悬停。", "rescue"),
    ("P43", "艾拉登场", "巷口逆光，镜头轻推。", "艾拉：巷口定点；铁管/法杖：垂下->抬起。", "rescue"),
    ("P44", "水镜偏移", "动作中景，水镜竖起。", "水镜：地面->竖直；甲手臂/钢筋：被拉偏。", "rescue"),
    ("P45", "雨滴成锁", "全景，符针锁住乙丙。", "雨滴：空中点阵->关节锁点；乙丙动作停在半空。", "rescue"),
    ("P46", "倒影近身", "中近景，艾拉跨水面出现。", "艾拉：巷口->苍霖身边瞬移；铁管：点太阳穴。", "rescue"),
    ("P47", "撤向地裂", "背影远景，扶行撤离。", "艾拉扶苍霖：雨巷->龙骨地裂；世界树余光在后。", "exit"),
    ("P48", "龙蛋破壳", "超远景转中景，洞穴揭示。", "视线：二人剪影->母龙尸体->龙蛋小爪。", "cave"),
]


COLORS = {
    "arena": ((235, 125, 65), (95, 70, 55)),
    "magic": ((80, 200, 255), (45, 85, 125)),
    "duel": ((245, 130, 60), (80, 200, 255)),
    "fight": ((80, 200, 255), (235, 110, 55)),
    "entry": ((225, 190, 115), (70, 90, 110)),
    "pause": ((245, 210, 115), (80, 90, 105)),
    "reaction": ((245, 185, 80), (75, 95, 110)),
    "arc": ((245, 170, 60), (235, 110, 55)),
    "dialog": ((210, 220, 230), (80, 200, 255)),
    "transition": ((170, 190, 220), (70, 130, 185)),
    "alley": ((105, 170, 225), (80, 95, 115)),
    "melee": ((235, 85, 65), (105, 170, 225)),
    "execute": ((245, 70, 55), (220, 170, 75)),
    "worldtree": ((235, 180, 75), (95, 125, 170)),
    "rescue": ((80, 205, 255), (165, 235, 255)),
    "exit": ((140, 180, 205), (225, 180, 80)),
    "cave": ((225, 180, 80), (85, 120, 155)),
}


def wrap_text(text, max_chars):
    lines = []
    current = ""
    for ch in text:
        current += ch
        if len(current) >= max_chars:
            lines.append(current)
            current = ""
    if current:
        lines.append(current)
    return lines


def arrow(draw, p1, p2, color, width=5):
    draw.line((p1, p2), fill=color, width=width)
    angle = math.atan2(p2[1] - p1[1], p2[0] - p1[0])
    size = width * 3.2
    pts = [
        p2,
        (p2[0] - size * math.cos(angle - 0.5), p2[1] - size * math.sin(angle - 0.5)),
        (p2[0] - size * math.cos(angle + 0.5), p2[1] - size * math.sin(angle + 0.5)),
    ]
    draw.polygon(pts, fill=color)


def draw_panel(draw, x, y, w, h, shot, idx):
    pid, title, camera, action, typ = shot
    c1, c2 = COLORS[typ]
    draw.rounded_rectangle((x, y, x + w, y + h), radius=10, fill=(18, 23, 31), outline=(78, 100, 125), width=2)
    draw.rectangle((x, y, x + w, y + 40), fill=(10, 14, 20))
    draw.text((x + 12, y + 8), f"{pid} {title}", fill=(245, 245, 245), font=F_HEAD)
    area = (x + 16, y + 54, x + w - 16, y + 210)
    draw.rounded_rectangle(area, radius=8, fill=(24, 31, 42), outline=(52, 68, 88), width=1)

    ax1, ay1, ax2, ay2 = area
    cx, cy = (ax1 + ax2) // 2, (ay1 + ay2) // 2

    # base space
    if typ in {"arena", "magic", "duel", "fight", "entry", "pause", "reaction", "arc", "dialog"}:
        draw.ellipse((ax1 + 28, ay1 + 28, ax2 - 28, ay2 - 24), outline=(93, 86, 75), width=3)
        draw.line((ax1 + 40, ay2 - 38, ax2 - 40, ay2 - 38), fill=(70, 62, 56), width=2)
    elif typ in {"alley", "melee", "execute", "rescue", "exit"}:
        draw.polygon([(ax1 + 35, ay1 + 20), (ax2 - 35, ay1 + 20), (ax2 - 10, ay2 - 20), (ax1 + 10, ay2 - 20)], outline=(66, 82, 102), fill=(22, 30, 40))
        draw.rectangle((ax2 - 90, ay2 - 55, ax2 - 28, ay2 - 20), outline=(120, 90, 75), width=2)
    elif typ == "worldtree":
        draw.ellipse((cx - 65, cy - 65, cx + 65, cy + 65), outline=c1, width=3)
        for a in range(0, 360, 45):
            r = math.radians(a)
            arrow(draw, (cx, cy), (cx + int(88 * math.cos(r)), cy + int(60 * math.sin(r))), c1, 2)
    else:
        draw.polygon([(ax1 + 40, ay2 - 20), (cx, ay1 + 35), (ax2 - 40, ay2 - 20)], outline=(84, 110, 135), fill=(24, 34, 44))
        draw.ellipse((cx - 30, cy + 10, cx + 30, cy + 70), outline=c1, width=3)

    # motion diagram variants
    if typ in {"fight", "duel"}:
        arrow(draw, (ax1 + 72, ay2 - 38), (cx, ay1 + 50), c1, 5)
        arrow(draw, (ax2 - 75, ay1 + 42), (cx + 10, cy), c2, 7)
        draw.ellipse((cx - 32, cy - 32, cx + 32, cy + 32), outline=c1, width=3)
    elif typ == "melee":
        draw.ellipse((cx + 35, cy - 8, cx + 68, cy + 25), fill=(85, 155, 215))
        for p in [(ax1 + 70, ay1 + 55), (cx - 10, ay2 - 45), (ax2 - 65, ay1 + 66)]:
            draw.ellipse((p[0] - 17, p[1] - 17, p[0] + 17, p[1] + 17), fill=c1)
            arrow(draw, p, (cx + 52, cy + 8), c1, 4)
    elif typ == "rescue":
        draw.ellipse((ax1 + 62, cy - 20, ax1 + 130, cy + 20), outline=c1, width=4)
        draw.ellipse((cx - 40, cy - 20, cx + 40, cy + 20), outline=c1, width=4)
        arrow(draw, (ax1 + 96, cy), (cx, cy), c1, 5)
        arrow(draw, (cx, cy), (ax2 - 85, cy - 24), c1, 4)
    elif typ == "execute":
        draw.ellipse((ax2 - 84, cy - 22, ax2 - 48, cy + 14), fill=(85, 155, 215))
        arrow(draw, (ax1 + 70, cy - 10), (ax2 - 70, cy - 4), c1, 7)
    elif typ == "arc":
        draw.arc((ax1 + 55, ay1 + 30, ax2 - 55, ay2 - 25), 185, 340, fill=c1, width=5)
        arrow(draw, (cx - 20, cy - 55), (ax2 - 76, cy - 10), c1, 5)
    elif typ in {"entry", "alley", "exit"}:
        arrow(draw, (ax1 + 60, cy + 25), (ax2 - 65, cy + 12), c1, 5)
    elif typ == "pause":
        draw.ellipse((cx - 16, cy - 16, cx + 16, cy + 16), fill=c1)
        draw.line((cx - 55, cy, cx + 55, cy), fill=(95, 105, 120), width=3)
    elif typ == "reaction":
        draw.ellipse((cx - 50, cy - 35, cx + 50, cy + 35), outline=c1, width=5)
        draw.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=c1)
    elif typ == "transition":
        for i in range(9):
            px = ax1 + 45 + i * 43
            draw.polygon([(px, ay1 + 35), (px + 25, ay1 + 70), (px - 10, ay1 + 95)], outline=c1, fill=(35, 45, 60))
        arrow(draw, (ax1 + 60, cy), (ax2 - 70, cy), c1, 5)
    elif typ == "worldtree":
        pass
    elif typ == "cave":
        arrow(draw, (ax1 + 55, ay2 - 35), (cx, cy + 35), c2, 4)
        arrow(draw, (cx, cy + 35), (ax2 - 75, cy + 15), c1, 5)
    else:
        arrow(draw, (ax1 + 60, cy), (ax2 - 70, cy), c1, 5)

    tx = x + 14
    ty = y + 222
    draw.text((tx, ty), "镜头:", fill=(150, 210, 255), font=F_SMALL)
    for line in wrap_text(camera, 19)[:2]:
        draw.text((tx + 46, ty), line, fill=(220, 230, 238), font=F_SMALL)
        ty += 21
    ty += 2
    draw.text((tx, ty), "轨迹:", fill=(255, 190, 110), font=F_SMALL)
    for line in wrap_text(action, 19)[:3]:
        draw.text((tx + 46, ty), line, fill=(220, 230, 238), font=F_SMALL)
        ty += 21


def render_sheets():
    cols, rows = 4, 3
    cell_w, cell_h = 390, 330
    pad_x, pad_y = 36, 105
    gap = 18
    width = pad_x * 2 + cols * cell_w + (cols - 1) * gap
    height = pad_y + rows * cell_h + (rows - 1) * gap + 40
    for page in range(4):
        img = Image.new("RGB", (width, height), (10, 13, 18))
        draw = ImageDraw.Draw(img)
        draw.text((36, 30), f"《九陆纪元》48镜头轨迹故事版 - 第 {page + 1}/4 页", fill=(245, 245, 245), font=F_TITLE)
        draw.text((38, 73), "蓝/橙/红箭头表示人物、攻击、魔法与镜头方向；每格对应一个镜头。", fill=(170, 185, 205), font=F_BODY)
        for i in range(12):
            idx = page * 12 + i
            col, row = i % cols, i // cols
            x = pad_x + col * (cell_w + gap)
            y = pad_y + row * (cell_h + gap)
            draw_panel(draw, x, y, cell_w, cell_h, SHOTS[idx], idx)
        img.save(OUT / f"九陆纪元_48镜头轨迹故事版_Page{page + 1:02d}.png")


def write_markdown():
    md = [
        "# 《九陆纪元》48镜头轨迹故事版",
        "",
        "用途：给分镜、AI 视频和动作图生成使用。每个镜头都写清楚镜头运动、角色动作路线和视觉重点。打斗镜头重点标明攻击线、闪避线、压制线和救场线。",
        "",
        "| 镜头 | 标题 | 镜头运动 | 动作/轨迹 | 类型 |",
        "|---|---|---|---|---|",
    ]
    for pid, title, camera, action, typ in SHOTS:
        md.append(f"| {pid} | {title} | {camera} | {action} | {typ} |")
    path = OUT / "九陆纪元_48镜头轨迹故事版.md"
    path.write_text("\n".join(md), encoding="utf-8")


if __name__ == "__main__":
    render_sheets()
    write_markdown()
    print(OUT)
