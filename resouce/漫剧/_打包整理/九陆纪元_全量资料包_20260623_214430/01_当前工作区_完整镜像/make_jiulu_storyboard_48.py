from pathlib import Path
import math
import textwrap

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "output" / "storyboard"
OUT_DIR.mkdir(parents=True, exist_ok=True)

TITLE = "《九陆纪元》开场 48 宫格分镜故事板"
SUBTITLE = "巨龙假史诗 -> 废土肉搏 -> 世界树崩塌 -> 龙骨深渊破壳"

FONT_REGULAR = Path(r"C:\Windows\Fonts\msyh.ttc")
FONT_BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")
if not FONT_REGULAR.exists():
    FONT_REGULAR = Path(r"C:\Windows\Fonts\NotoSansSC-VF.ttf")
if not FONT_BOLD.exists():
    FONT_BOLD = FONT_REGULAR


def font(size, bold=False):
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


F_TITLE = font(64, True)
F_SUB = font(30)
F_HEAD = font(26, True)
F_BODY = font(23)
F_SMALL = font(18)


PANELS = [
    ("P01", "0:00", "SPLASH", "超远景", "黄昏竞技场，巨龙翼影压满天空"),
    ("P02", "0:03", "艾拉登场", "中景", "断柱顶逆风站立，指尖蓝色光流"),
    ("P03", "0:06", "苍霖入画", "中全景", "站姿松散，看龙又看艾拉，手伸进口袋"),
    ("P04", "0:09", "反转点", "全景", "掏苹果咬一口，转身朝巨龙挥手"),
    ("P05", "0:11", "龙的反应", "特写", "威严龙瞳变成看零食的眼神"),
    ("P06", "0:13", "投喂", "动势全景", "苹果飞出，巨龙扑咬后蹲坐小口啃"),
    ("P07", "0:15", "吐槽", "双人中景", "艾拉落地抱胸：这小饭桶越来越能吃了"),
    ("P08", "0:18", "没了", "中景", "巨龙眼巴巴盯着，苍霖摊手"),
    ("P09", "0:20", "硬切转场", "快速倒退", "竞技场消失，暴雨废土巷弄高速掠过"),
    ("P10", "0:22", "逼到墙角", "中景", "苍霖背墙喘息，额角流血，眼神安静"),
    ("P11", "0:24", "敌人压近", "中远景", "三暴徒雨幕走出，暴徒甲三步跨近"),
    ("P12", "0:25", "第一秒", "动作近景", "钢筋劈墙，苍霖侧身抓腕"),
    ("P13", "0:26", "借力头槌", "近景", "放弃角力，额头撞鼻梁，血溅开"),
    ("P14", "0:27", "泥玻璃反击", "近景", "泥与碎玻璃按脸，夺钢筋砸膝"),
    ("P15", "0:28", "两面夹击", "乱战中景", "暴徒乙丙同时扑上，雨幕黑影重叠"),
    ("P16", "0:29", "滑倒扫腿", "低机位", "踩水坑滑半秒，借势踢脚踝"),
    ("P17", "0:30", "撞墙", "动势中景", "暴徒丙拦腰抱撞，苍霖咳血"),
    ("P18", "0:31", "地面缠斗", "俯拍", "半空锁颈，落地后连续头槌"),
    ("P19", "0:33", "三人倒地", "全景", "苍霖喘息站起，雨血混流"),
    ("P20", "0:34", "搜干粮", "近景", "手指发抖破皮，搜出半块干粮"),
    ("P21", "0:36", "天穹裂开", "仰拍", "暗金裂隙撕开夜空，光丝涌出"),
    ("P22", "0:38", "世界树崩塌", "超大全景", "发光网络被撕碎，倒流流星雨"),
    ("P23", "0:40", "光丝坠落", "特写", "一根丝线慢慢落到苍霖指尖前"),
    ("P24", "0:41", "一厘米", "静止特写", "雨声远去，手指与丝线只差一厘米"),
    ("P25", "0:42", "套路粉碎", "突入近景", "暴徒甲粗暴掐灭丝线：你以为你是天选之人？"),
    ("P26", "0:43", "没有觉醒", "中景", "一拳打退，周围水洼光丝逐盏熄灭"),
    ("P27", "0:45", "钢筋刺喉", "危机近景", "断腿暴徒提衣领，钢筋尖对准喉咙"),
    ("P28", "0:46", "物理救场", "横扫动势", "铁管从左横抽太阳穴，暴徒断电倒下"),
    ("P29", "0:47", "艾拉现身", "中景", "雨中握铁管，冷淡像做完家务"),
    ("P30", "0:48", "冷处理", "动作近景", "反手铁管顶喉，暴徒乙跪倒：走"),
    ("P31", "0:50", "撤离", "背影中景", "艾拉半拖半架苍霖，回望裂隙"),
    ("P32", "0:52", "下入地裂", "远景", "巨大肋骨覆盖地裂，二人滑入阴影"),
    ("P33", "0:55", "纯黑呼吸", "黑场", "三秒黑暗，只剩回音与呼吸"),
    ("P34", "0:58", "视线适应", "中景", "洞穴冷光浮现，苍霖靠岩喘气"),
    ("P35", "1:00", "艾拉警戒", "中景", "她盯着洞穴深处，铁管未放下"),
    ("P36", "1:02", "鳞片扫光", "局部特写", "冷光扫过暗蓝曲面，原来不是岩壁"),
    ("P37", "1:04", "母龙尸体", "REVEAL全景", "尸体占半个洞穴，机械鱼叉贯穿"),
    ("P38", "1:08", "龙蛋", "中景", "母龙尾腹之间，半人高裂纹龙蛋"),
    ("P39", "1:10", "沉默凝视", "静止近景", "苍霖蹲下不触碰，只看着蛋"),
    ("P40", "1:12", "冷静判断", "黑暗声源", "艾拉：母龙死了至少半个月了"),
    ("P41", "1:14", "咔", "极近特写", "壳内有什么轻轻敲了一下"),
    ("P42", "1:16", "共同沉默", "双人中景", "苍霖和艾拉同时看向龙蛋"),
    ("P43", "1:18", "新裂纹", "特写", "第二声咔，裂纹泛出暗金微光"),
    ("P44", "1:20", "生命温度", "指尖特写", "苍霖指尖停在裂纹一厘米外"),
    ("P45", "1:22", "破壳", "黑场微光", "咔嚓，小爪子从蛋壳缝里伸出"),
    ("P46", "1:25", "黑底静默", "LOGO前奏", "全屏黑底五秒静默，蓄冲击"),
    ("P47", "1:27", "标题砸入", "LOGO SPLASH", "重工业铆接金属字体砸入：【九陆纪元】"),
    ("P48", "1:30", "定格", "LOGO尾帧", "火星、冲击波、暗金粒子流线缓缓熄灭"),
]


def wrap_cn(text, max_chars):
    lines = []
    for part in text.split("\n"):
        if len(part) <= max_chars:
            lines.append(part)
        else:
            lines.extend(textwrap.wrap(part, max_chars, break_long_words=True, replace_whitespace=False))
    return lines


def draw_silhouette(draw, box, index):
    x1, y1, x2, y2 = box
    w, h = x2 - x1, y2 - y1
    palette = {
        "sky": (44, 49, 61),
        "orange": (179, 83, 45),
        "rain": (42, 65, 78),
        "gold": (215, 165, 75),
        "blue": (74, 143, 211),
        "dark": (13, 14, 18),
        "bone": (151, 136, 112),
    }
    draw.rectangle(box, fill=palette["dark"])

    scene = "arena" if index <= 8 else "rain" if index <= 32 else "cave" if index <= 45 else "logo"

    if scene == "arena":
        draw.rectangle(box, fill=(53, 38, 43))
        for i in range(10):
            yy = y1 + int(h * i / 10)
            col = (60 + i * 9, 45 + i * 4, 50)
            draw.rectangle((x1, yy, x2, yy + h // 10 + 1), fill=col)
        draw.polygon([(x1, y2), (x1 + w * 0.28, y1 + h * 0.58), (x1 + w * 0.44, y2)], fill=(24, 22, 24))
        draw.polygon([(x2, y2), (x1 + w * 0.70, y1 + h * 0.56), (x1 + w * 0.54, y2)], fill=(25, 23, 24))
        draw.ellipse((x1 + w * 0.34, y1 + h * 0.16, x1 + w * 0.69, y1 + h * 0.42), fill=(21, 21, 24))
        draw.polygon([(x1 + w * 0.48, y1 + h * 0.18), (x1 + w * 0.08, y1 + h * 0.08), (x1 + w * 0.34, y1 + h * 0.45)], fill=(17, 18, 21))
        draw.polygon([(x1 + w * 0.56, y1 + h * 0.18), (x2 - w * 0.05, y1 + h * 0.08), (x1 + w * 0.68, y1 + h * 0.45)], fill=(17, 18, 21))
        draw.ellipse((x1 + w * 0.52, y1 + h * 0.36, x1 + w * 0.72, y1 + h * 0.50), fill=(23, 22, 24))
        if index in {2, 7}:
            draw.line((x1 + w * 0.28, y1 + h * 0.50, x1 + w * 0.34, y2 - 18), fill=(36, 36, 38), width=12)
            draw.ellipse((x1 + w * 0.27, y1 + h * 0.38, x1 + w * 0.38, y1 + h * 0.52), fill=(8, 8, 10))
            draw.line((x1 + w * 0.32, y1 + h * 0.52, x1 + w * 0.32, y1 + h * 0.78), fill=(8, 8, 10), width=8)
            draw.arc((x1 + w * 0.35, y1 + h * 0.46, x1 + w * 0.52, y1 + h * 0.66), 230, 330, fill=palette["blue"], width=5)
        if index in {4, 5, 6, 8}:
            draw.ellipse((x1 + w * 0.43, y1 + h * 0.63, x1 + w * 0.48, y1 + h * 0.70), fill=(230, 45, 36))
            draw.ellipse((x1 + w * 0.44, y1 + h * 0.64, x1 + w * 0.47, y1 + h * 0.69), fill=(246, 216, 112))

    elif scene == "rain":
        draw.rectangle(box, fill=(24, 36, 43))
        for i in range(34):
            sx = x1 + (i * 43 + index * 17) % w
            sy = y1 + (i * 71 + index * 13) % h
            draw.line((sx, sy, sx - 18, sy + 36), fill=(92, 126, 143), width=2)
        draw.rectangle((x1, y2 - h * 0.22, x2, y2), fill=(28, 27, 28))
        draw.line((x1 + w * 0.10, y2 - h * 0.18, x2 - w * 0.08, y2 - h * 0.10), fill=(72, 79, 82), width=5)
        if 21 <= index <= 26:
            draw.line((x1 + w * 0.15, y1 + h * 0.07, x1 + w * 0.48, y1 + h * 0.26, x1 + w * 0.85, y1 + h * 0.08), fill=palette["gold"], width=6)
            for i in range(12):
                sx = x1 + w * (0.2 + 0.055 * i)
                draw.line((sx, y1 + h * 0.18, sx + 10 * math.sin(i), y1 + h * (0.55 + 0.02 * (i % 3))), fill=(230, 190, 95), width=2)
        if 25 <= index <= 30:
            draw.line((x1 + w * 0.25, y1 + h * 0.62, x1 + w * 0.75, y1 + h * 0.48), fill=(120, 93, 68), width=12)
        # figures
        cx = x1 + w * 0.48
        cy = y1 + h * 0.60
        draw.ellipse((cx - 18, cy - 72, cx + 18, cy - 36), fill=(11, 12, 15))
        draw.line((cx, cy - 36, cx - 5, cy + 40), fill=(10, 11, 14), width=12)
        draw.line((cx - 6, cy + 38, cx - 35, cy + 88), fill=(10, 11, 14), width=9)
        draw.line((cx - 4, cy + 38, cx + 30, cy + 88), fill=(10, 11, 14), width=9)
        if index in {11, 12, 13, 14, 15, 16, 17, 18, 19, 25, 26, 27, 28, 30}:
            ex = x1 + w * 0.67
            draw.ellipse((ex - 18, cy - 62, ex + 18, cy - 26), fill=(28, 18, 18))
            draw.line((ex, cy - 26, ex, cy + 42), fill=(28, 18, 18), width=13)
            draw.line((ex - 16, cy - 14, ex - 54, cy - 48), fill=(28, 18, 18), width=8)
            draw.line((ex + 10, cy - 8, ex + 62, cy - 36), fill=(95, 83, 71), width=8)
        if index in {29, 30, 31, 32}:
            ax = x1 + w * 0.31
            draw.ellipse((ax - 14, cy - 80, ax + 14, cy - 48), fill=(7, 8, 10))
            draw.line((ax, cy - 48, ax - 5, cy + 34), fill=(7, 8, 10), width=10)
            draw.line((ax + 8, cy - 32, ax + 74, cy - 45), fill=(120, 112, 98), width=8)

    elif scene == "cave":
        draw.rectangle(box, fill=(12, 15, 20))
        draw.polygon([(x1, y2), (x1 + w * 0.15, y1 + h * 0.46), (x1 + w * 0.35, y2)], fill=(30, 34, 39))
        draw.polygon([(x2, y2), (x1 + w * 0.78, y1 + h * 0.35), (x1 + w * 0.60, y2)], fill=(26, 31, 37))
        draw.line((x1 + w * 0.08, y1 + h * 0.02, x1 + w * 0.55, y2), fill=(57, 82, 99), width=18)
        if 36 <= index <= 45:
            draw.ellipse((x1 + w * 0.25, y1 + h * 0.28, x1 + w * 0.88, y1 + h * 0.72), fill=(26, 39, 55), outline=(70, 92, 111), width=5)
            for i in range(4):
                draw.line((x1 + w * (0.28 + i * 0.11), y1 + h * 0.31, x1 + w * (0.40 + i * 0.11), y1 + h * 0.68), fill=(49, 63, 79), width=3)
            draw.line((x1 + w * 0.37, y1 + h * 0.28, x1 + w * 0.24, y1 + h * 0.10), fill=(116, 103, 93), width=12)
            draw.line((x1 + w * 0.50, y1 + h * 0.28, x1 + w * 0.52, y1 + h * 0.05), fill=(116, 103, 93), width=12)
            draw.ellipse((x1 + w * 0.44, y1 + h * 0.57, x1 + w * 0.62, y1 + h * 0.83), fill=(98, 92, 84), outline=palette["gold"], width=3)
        if 41 <= index <= 45:
            ex1 = x1 + w * 0.45
            ey1 = y1 + h * 0.58
            draw.line((ex1, ey1, ex1 + 62, ey1 + 88), fill=palette["gold"], width=5)
            draw.line((ex1 + 34, ey1 + 38, ex1 + 80, ey1 + 30), fill=palette["gold"], width=4)
        if index == 33:
            draw.rectangle(box, fill=(0, 0, 0))

    else:
        draw.rectangle(box, fill=(0, 0, 0))
        if index >= 47:
            text = "九陆纪元"
            f = font(72, True)
            bbox = draw.textbbox((0, 0), text, font=f)
            tx = x1 + (w - (bbox[2] - bbox[0])) / 2
            ty = y1 + (h - (bbox[3] - bbox[1])) / 2 - 8
            draw.text((tx + 4, ty + 4), text, fill=(84, 32, 22), font=f)
            draw.text((tx, ty), text, fill=(214, 188, 135), font=f)
            for i in range(18):
                sx = x1 + w * 0.50
                sy = y1 + h * 0.52
                ex = x1 + (i / 17) * w
                ey = y1 + (0.24 + 0.50 * ((i * 7) % 17) / 17) * h
                draw.line((sx, sy, ex, ey), fill=(160, 106, 49), width=2)


def draw_panel(draw, panel, box, index):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=14, fill=(34, 34, 36), outline=(92, 92, 96), width=2)
    pad = 14
    thumb = (x1 + pad, y1 + pad, x2 - pad, y1 + 410)
    draw_silhouette(draw, thumb, index)
    draw.rectangle((thumb[0], thumb[3] - 34, thumb[2], thumb[3]), fill=(0, 0, 0, 160))
    draw.text((thumb[0] + 10, thumb[3] - 30), f"{panel[0]}  {panel[1]}", fill=(255, 235, 170), font=F_HEAD)
    draw.text((x1 + pad, y1 + 430), f"{panel[2]} / {panel[3]}", fill=(245, 245, 245), font=F_HEAD)
    yy = y1 + 467
    for line in wrap_cn(panel[4], 18)[:3]:
        draw.text((x1 + pad, yy), line, fill=(210, 213, 216), font=F_BODY)
        yy += 30


def main():
    cols, rows = 8, 6
    cell_w, cell_h = 690, 610
    margin_x, margin_y = 70, 170
    gap = 22
    width = margin_x * 2 + cols * cell_w + (cols - 1) * gap
    height = margin_y + rows * cell_h + (rows - 1) * gap + 70

    img = Image.new("RGB", (width, height), (19, 20, 23))
    draw = ImageDraw.Draw(img, "RGBA")

    draw.rectangle((0, 0, width, 128), fill=(12, 13, 16))
    draw.text((70, 34), TITLE, fill=(245, 242, 232), font=F_TITLE)
    draw.text((70, 104), SUBTITLE, fill=(188, 192, 198), font=F_SUB)
    draw.text((width - 510, 104), "48 格 / 约 90 秒 / 动画预演板", fill=(224, 176, 94), font=F_SUB)

    for i, panel in enumerate(PANELS, start=1):
        col = (i - 1) % cols
        row = (i - 1) // cols
        x = margin_x + col * (cell_w + gap)
        y = margin_y + row * (cell_h + gap)
        draw_panel(draw, panel, (x, y, x + cell_w, y + cell_h), i)

    png_path = OUT_DIR / "九陆纪元_开场48宫格分镜故事板.png"
    pdf_path = OUT_DIR / "九陆纪元_开场48宫格分镜故事板.pdf"
    img.save(png_path, quality=96)
    img.save(pdf_path, "PDF", resolution=180.0)
    print(png_path)
    print(pdf_path)


if __name__ == "__main__":
    main()
