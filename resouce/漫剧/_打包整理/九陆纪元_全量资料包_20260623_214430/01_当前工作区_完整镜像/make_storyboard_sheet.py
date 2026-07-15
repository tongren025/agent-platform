from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

root = Path(r"D:\Kirito\世界重启\世界重启-0615")
out_dir = root / "产物" / "第1集"
out = out_dir / "第1集聚合故事图.png"
font_path = Path(r"C:\Windows\Fonts\msyh.ttc")
font_bold_path = Path(r"C:\Windows\Fonts\msyhbd.ttc")
font_title = ImageFont.truetype(str(font_bold_path if font_bold_path.exists() else font_path), 44)
font_panel = ImageFont.truetype(str(font_bold_path if font_bold_path.exists() else font_path), 26)
font_small = ImageFont.truetype(str(font_path), 21)

assets = {
    "龙骨入口": root / "场景图" / "第1集-烬龙陆场景设定" / "烬龙陆-龙骨营地入口.png",
    "短刃贴喉": root / "产物" / "第1集" / "镜头图" / "镜头01-短刃贴喉.png",
    "争抢霉粮": root / "产物" / "第1集" / "镜头图" / "镜头02-争抢霉粮.png",
    "废墟营地": root / "场景图" / "第1集-烬龙陆场景设定" / "烬龙陆-废墟营地全景-备用.png",
    "荒地成因": root / "场景图" / "第1集-烬龙陆场景设定" / "烬龙陆-荒地成因近景.png",
    "龙骨中景": root / "场景图" / "第1集-烬龙陆场景设定" / "烬龙陆-龙骨流民营地中景.png",
    "苍霖正视": root / "人物" / "角色图" / "第1集资产" / "苍霖-烬土兽民版-正视图.png",
    "苍霖特写": root / "人物" / "角色图" / "第1集资产" / "苍霖-烬土兽民版-半身特写.png",
    "新生儿": root / "人物" / "角色图" / "第1集资产" / "无魂新生儿-安全表现版.png",
    "流民群像": root / "人物" / "角色图" / "第1集资产" / "烬龙陆流民群像.png",
    "残片": root / "人物" / "角色图" / "第1集资产" / "远古残片-道具设定.png",
}

panels = [
    ("01 先给位置", "龙颚入口：观众知道人住在龙骨里", assets["龙骨入口"]),
    ("02 3秒钩子", "短刃贴喉：仁慈就是死罪", assets["短刃贴喉"]),
    ("03 规则实证", "争粮：活着本来就是抢出来的", assets["争抢霉粮"]),
    ("04 暴力常态", "营地全景：不是个案，是日常", assets["废墟营地"]),
    ("05 荒地原因", "焦土、盐灰、死根：这里为什么不长东西", assets["荒地成因"]),
    ("06 人的处境", "肋骨下的营地：人像寄生在龙尸里", assets["龙骨中景"]),
    ("07 主角入场", "苍霖全身：能活，但不肯同化", assets["苍霖正视"]),
    ("08 反差台词", "我不想抢人活命", assets["苍霖特写"]),
    ("09 世界病灶", "无魂新生儿：新生命不再被期待", assets["新生儿"]),
    ("10 众人离开", "流民群像：麻木比残忍更冷", assets["流民群像"]),
    ("11 火种出现", "远古残片：旧世真相入口", assets["残片"]),
    ("12 黑屏留钩", "错的不是人性，是崩坏天道", None),
]

W, H = 2200, 1700
canvas = Image.new("RGB", (W, H), (30, 30, 30))
draw = ImageDraw.Draw(canvas)
draw.text((70, 42), "第1集《烬土兽民》聚合故事图 / 视频路径板", fill=(245, 245, 245), font=font_title)
draw.text((70, 102), "从“龙骨地理”进入，再用3秒钩子抓人，最终落到苍霖的违和感与远古残片。", fill=(190, 190, 190), font=font_small)

cols = 4
margin_x, margin_y = 70, 160
cell_w, cell_h = 500, 465
gap_x, gap_y = 35, 38
img_h = 330

for idx, (title, desc, path) in enumerate(panels):
    col, row = idx % cols, idx // cols
    x = margin_x + col * (cell_w + gap_x)
    y = margin_y + row * (cell_h + gap_y)
    draw.rounded_rectangle((x, y, x + cell_w, y + cell_h), radius=12, fill=(48, 48, 48), outline=(95, 95, 95), width=2)
    img_box = (x + 18, y + 18, x + cell_w - 18, y + 18 + img_h)
    if path and path.exists():
        im = Image.open(path).convert("RGB")
        im = ImageOps.fit(im, (img_box[2] - img_box[0], img_box[3] - img_box[1]), method=Image.Resampling.LANCZOS, centering=(0.5, 0.45))
        canvas.paste(im, (img_box[0], img_box[1]))
    else:
        draw.rectangle(img_box, fill=(5, 5, 5))
        quote = "原来，错的从来不是人性\n是这崩坏的天道"
        for li, line in enumerate(quote.split("\n")):
            bbox = draw.textbbox((0, 0), line, font=font_panel)
            tx = img_box[0] + ((img_box[2] - img_box[0]) - (bbox[2] - bbox[0])) // 2
            ty = img_box[1] + 105 + li * 46
            draw.text((tx, ty), line, fill=(235, 235, 235), font=font_panel)
    draw.text((x + 20, y + 365), title, fill=(255, 230, 150), font=font_panel)
    draw.text((x + 20, y + 405), desc, fill=(230, 230, 230), font=font_small)
    if idx < len(panels) - 1:
        if col < cols - 1:
            ax1, ay1 = x + cell_w + 5, y + 225
            ax2, ay2 = x + cell_w + gap_x - 8, y + 225
            draw.line((ax1, ay1, ax2, ay2), fill=(180, 140, 80), width=4)
            draw.polygon([(ax2, ay2), (ax2 - 12, ay2 - 8), (ax2 - 12, ay2 + 8)], fill=(180, 140, 80))
        else:
            ax1, ay1 = x + cell_w // 2, y + cell_h + 6
            ax2, ay2 = x + cell_w // 2, y + cell_h + gap_y - 8
            draw.line((ax1, ay1, ax2, ay2), fill=(180, 140, 80), width=4)
            draw.polygon([(ax2, ay2), (ax2 - 8, ay2 - 12), (ax2 + 8, ay2 - 12)], fill=(180, 140, 80))

canvas.save(out)
print(out)
