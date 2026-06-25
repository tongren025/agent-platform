"""v3 final — episode-based + real resource images + system memories"""
import json

TS = "2026-06-25T09:00:00+00:00"
RES = "/api/v1/agentapp/production/resource"

STYLE = "干净半写实东方幻想漫剧插画，电影级高特效动作关键帧，柔和漫射光，清晰主体，低描边，蓝白魔法阵与赤金龙焰对撞"
POS = "画面干净无描边，无墨线，无裂纹，无草稿线，无脏黑边，无死黑阴影，无文字水印，保持角色一致性，服装不漂移"
QS = "保持面部一致，无变形，无拉伸，避免抖动运动和弯曲肢体，面部清晰，人体结构正常，动作自然流畅，画面稳定，竖屏9:16，电影质感"

AILA = "明确成年的年轻东方幻想女法师，黑长发银蓝高光，黑蓝露肩星环法师战斗装，透明纱质外摆，大腿绑带，膝上长靴，暗金属法杖"
AILA_VFX = "蓝白星环、淡金星轨、透明几何法阵、悬停雨滴、晶体粒子、细线星座网络"
DRAGON = "宽阔翼展、半透明翼膜、翼膜血管、锋利角冠、长吻、颈部鳞片、胸腔白热龙焰、熔金龙瞳、爪尖火星"
CANG = "16岁少年，黑色短碎发凌乱，左脸颊竖向旧伤疤，偏瘦有韧劲，深褐近黑瞳孔，破烂灰褐麻布短衣，赤脚，胸口布条绑龙骨碎片"

# Resource image paths (real files in resouce/)
IMG = {
    "canglin_early": f"{RES}/漫剧/output/characters/苍霖_三视图_三个月前赤脚伤痕弱小版.png",
    "canglin_mid": f"{RES}/漫剧/output/characters/苍霖_三视图_龙族荒地开胸狂暴版.png",
    "canglin_v3": f"{RES}/漫剧/output/characters/苍霖_三视图_v3_龙族废墟擦边性感版.png",
    "canglin_weak": f"{RES}/漫剧/九陆纪元_前期制作包/02_人物图/苍霖_三个月前赤脚伤痕弱小版.png",
    "aila": f"{RES}/漫剧/_打包整理/九陆纪元_全量资料包_20260623_214430/03_公共美术参考/人物图/04_艾拉_星圣陆法则学徒.png",
    "scene_jinlong": f"{RES}/漫剧/_打包整理/九陆纪元_全量资料包_20260623_214430/03_公共美术参考/九大陆场景图/01_烬龙陆_龙骨废墟.png",
    "scene_ep01_v2": f"{RES}/漫剧/_打包整理/九陆纪元_全量资料包_20260623_214430/03_公共美术参考/场景图/EP01_龙骨废墟_苍霖初现_v2.png",
    "prop_fragment": f"{RES}/漫剧/_打包整理/九陆纪元_全量资料包_20260623_214430/03_公共美术参考/道具细节图/03_别忘了我龙骨碎片.png",
    "prop_leaf": f"{RES}/漫剧/_打包整理/九陆纪元_全量资料包_20260623_214430/03_公共美术参考/道具细节图/01_苍霖掌心叶子.png",
    "prop_scale": f"{RES}/漫剧/_打包整理/九陆纪元_全量资料包_20260623_214430/03_公共美术参考/道具细节图/02_刻名龙鳞.png",
    "storyboard_48_p1": f"{RES}/漫剧/output/storyboard/九陆纪元_48镜头视觉分镜_v2_Page01_P01-P24.png",
    "storyboard_48_p2": f"{RES}/漫剧/output/storyboard/九陆纪元_48镜头视觉分镜_v2_Page02_P25-P48.png",
    "scene_concept": f"{RES}/漫剧/_打包整理/九陆纪元_全量资料包_20260623_214430/03_公共美术参考/场景图/EP01_场景概念图_四宫格_v1.png",
    "old_miner": f"{RES}/漫剧/_打包整理/九陆纪元_全量资料包_20260623_214430/03_公共美术参考/人物图/10_老矿工_烬龙陆.png",
    "dragon_knight": f"{RES}/漫剧/_打包整理/九陆纪元_全量资料包_20260623_214430/03_公共美术参考/人物图/11_龙骑士_烬龙陆.png",
}
# 九大陆
for i, name in enumerate(["烬龙陆_龙骨废墟","青霄陆_机械穹顶","星圣陆_碎星环浮空城","潮生陆_记忆之海","巨神陆_沉睡巨神","无昼陆_最后一盏灯","冰封陆_时间冰原","归墟陆_世界终坑","神国陆_光之神庙"], 1):
    IMG[f"land_{i:02d}"] = f"{RES}/漫剧/_打包整理/九陆纪元_全量资料包_20260623_214430/03_公共美术参考/九大陆场景图/{i:02d}_{name}.png"

def c(cid, stage, title, shot, content, episode=None, prompts=None, images=None, meta=None, status="done"):
    return {
        "card_id": cid, "project_id": "jiulu-s1", "stage": stage,
        "title": title, "episode": episode, "shot_number": shot, "status": status,
        "content": content, "prompts": prompts or [], "images": images or [], "videos": [],
        "metadata": meta or {}, "created_at": TS, "updated_at": TS,
    }

cards = []

# ═══════════════════════════════════════════════════════════════
# GLOBAL ASSETS (episode=None) — 跨集共享
# ═══════════════════════════════════════════════════════════════

# ── 项目总览 ──
cards.append(c("g-story", "idea", "S1 三幕结构 10集", 0,
    "苍霖线入口篇，核心命题：没有人选你，但你还是站起来了。\n\n"
    "第一幕 活着 EP01-03\nEP01 泥里的人 | EP02 假觉醒 | EP03 星蓝的手\n\n"
    "第二幕 成长 EP04-07\nEP04 龙蛋 | EP05 苹果 | EP06 数据残留 | EP07 世界树信号\n\n"
    "第三幕 出发 EP08-10\nEP08 选择 | EP09 第一次飞 | EP10 九陆\n\n"
    "R编号：R1=艾拉(EP03起) R2=巨龙(EP04起) R3=苍霖(全季)",
    episode=None))

cards.append(c("g-style", "idea", "风格定位+Seedance规则", 1,
    f"## 视觉核心\n{STYLE}\n\n"
    f"## 正向约束词\n{POS}\n\n"
    f"## 质量后缀\n{QS}\n\n"
    "## Seedance 2.0 硬规则\n"
    "1. 不读负向提示词，只用正向约束\n"
    "2. 每段不超过6秒\n"
    "3. 镜头运动和角色动作分开描述\n"
    "4. 每镜只一个运镜，中英双写\n"
    "5. 禁止词：夸张/高速/快速/fast/剧烈/激烈\n"
    "6. 八层框架：素材声明-镜头标签-景别主体-动作-运镜-光影-音频-全局收尾\n"
    "7. 光影描述是质量ROI最高元素\n"
    "8. 音效用「音效：」前缀标注\n\n"
    "## 平台选型\n即梦/Seedance 2.0：日常剧情批量 | 可灵/Kling 3.0：核心战斗序列(EP09)",
    episode=None))

# ── 角色资产（全局共享） ──
cards.append(c("g-r3", "design", "R3 苍霖 CHAR四层", 1,
    f"## R3 苍霖\n\n"
    f"### 身份层（不变）\n16岁少年 | 偏瘦有韧劲 | 窄长脸 | 黑色短碎发凌乱 | 深褐近黑瞳 | 左脸颊竖向旧疤\n\n"
    f"### 装备层（分阶段）\n"
    f"**EP01-03 前期**：破烂灰褐麻布短衣多处破洞，赤脚，胸口脏布条绑龙骨碎片\n"
    f"**EP04-08 中期**：+旧毯子当披风\n"
    f"**EP09-10 后期**：深灰龙翼披风（龙鳞纹），碎片改粗绳项链\n\n"
    f"### 可变层\n隐忍：牙关咬紧眼眶泛红 | 空洞：瞳孔微放大嘴唇微张 | 微笑：极珍贵EP04\n\n"
    f"### 母版图\n下方图片为三视图（三个月前弱小版），可用作EP01-03的@图片锚定",
    episode=None,
    images=[IMG["canglin_early"], IMG["canglin_weak"]],
    prompts=[f"角色设定图，正面全身定妆照，白色简洁背景。{CANG}。左脸颊一道从颧骨到下颌的竖向旧伤疤。眼神有韧劲但疲惫。{STYLE}。{POS}。{QS}"],
    meta={"type": "character", "r_id": "R3"}))

cards.append(c("g-r1", "design", "R1 艾拉 CHAR四层", 2,
    f"## R1 艾拉 系统已有固定词\n\n"
    f"### 身份层\n成年年轻女性 | 修长 | 黑长发银蓝高光 | 蓝瞳 | 偏白肤\n\n"
    f"### 装备层（系统固定词逐字复制）\n{AILA}\n\n"
    f"### 魔法特效\n{AILA_VFX} 干净层次分明\n\n"
    f"### 可变层\n冷淡精确，不解释不安慰 | 出场：EP03",
    episode=None,
    images=[IMG["aila"]],
    prompts=[f"角色设定图，正面全身定妆照，白色简洁背景。{AILA}。表情冷淡锐利。{STYLE}。{POS}。{QS}"],
    meta={"type": "character", "r_id": "R1"}))

cards.append(c("g-r2", "design", "R2 巨龙 CHAR四层", 3,
    f"## R2 巨龙 系统已有固定词\n\n"
    f"### 外形固定词\n{DRAGON}\n\n"
    f"### 成长阶段\n幼龙EP04：巴掌大鳞片稀疏 | 少龙EP05-07：猫大 | 成龙EP09-10：马大可骑乘\n外凶内萌 | 出场EP04",
    episode=None,
    images=[IMG["dragon_knight"]],
    prompts=[f"角色设定图，东方幻想巨龙全身侧面图，白色简洁背景。{DRAGON}。张开双翼展示翼展。{STYLE}。{POS}。{QS}"],
    meta={"type": "character", "r_id": "R2"}))

cards.append(c("g-miner", "design", "老矿工（路人）", 4,
    "## 老矿工\nEP08出场，劝阻苍霖别离开\n路人角色，无固定词",
    episode=None,
    images=[IMG["old_miner"]],
    meta={"type": "character"}))

# ── 场景资产（全局共享） ──
cards.append(c("g-sc01", "design", "scene01 烬龙陆废巷", 5,
    "## scene01 烬龙陆废巷\n使用：EP01-02 EP05\n\n"
    "窄巷道碎石墙壁，远处龙骨化石如山，地面粗糙散落碎片和废矿轨\n"
    "光影：暗红天光穿缝隙体积光斑(主) + 微弱蓝色光粒子漂浮(补)\n"
    "色温：暖红主+冷蓝点缀",
    episode=None,
    images=[IMG["scene_jinlong"], IMG["scene_ep01_v2"]],
    prompts=[f"场景设定图，废墟巷道全景无人物。巨大龙骨化石如山矗立暗红色天空下，碎石墙壁两侧。暗红天光穿废墟缝隙形成长条体积光斑，微弱蓝色光粒子漂浮。{STYLE}。{POS}。{QS}"],
    meta={"type": "scene"}))

cards.append(c("g-sc04", "design", "scene04 矿洞", 6,
    "## scene04 矿洞\n使用：EP03-04 EP07\n\n"
    "狭窄岩洞，毯子铺地，墙挂矿灯，深处世界树根插入岩壁\n"
    "光影核心=双色温：暖橙矿灯(左) + 冷蓝世界树脉动光(深处)",
    episode=None,
    prompts=[f"场景设定图，地下矿洞内部无人物。狭窄岩壁，左侧墙挂暖橙色矿灯。洞穴深处巨大树根插入岩壁根表面脉动冷蓝色光。暖橙与冷蓝双色温交汇。{STYLE}。{POS}。{QS}"],
    meta={"type": "scene"}))

# 九大陆场景（EP10用）
cards.append(c("g-lands", "design", "九大陆场景图", 7,
    "## 九大陆场景\nEP10剪影序列用\n\n"
    "01烬龙陆 | 02青霄陆 | 03星圣陆 | 04潮生陆 | 05巨神陆 | 06无昼陆 | 07冰封陆 | 08归墟陆 | 09神国陆",
    episode=None,
    images=[IMG[f"land_{i:02d}"] for i in range(1, 10)],
    meta={"type": "scene"}))

# ── 道具资产（全局共享） ──
cards.append(c("g-prop-frag", "design", "龙骨碎片", 8,
    "## 龙骨碎片\nR3的标志物，全季出现\n拇指大，表面血管纹路，蓝白光脉动如心跳\n刻有符文",
    episode=None,
    images=[IMG["prop_fragment"]],
    meta={"type": "prop"}))

cards.append(c("g-prop-leaf", "design", "苍霖掌心叶子", 9,
    "苍霖的记忆物", episode=None,
    images=[IMG["prop_leaf"]], meta={"type": "prop"}))

cards.append(c("g-prop-scale", "design", "刻名龙鳞", 10,
    "龙的信物", episode=None,
    images=[IMG["prop_scale"]], meta={"type": "prop"}))

# ── 48镜头分镜参考（全局） ──
cards.append(c("g-sb48", "storyboard", "48镜头视觉分镜（参考）", 0,
    "之前版本的48镜头开场分镜板，可作为视觉风格参考\n巨龙vs艾拉战斗版本（非当前S1苍霖线剧本）",
    episode=None,
    images=[IMG["storyboard_48_p1"], IMG["storyboard_48_p2"]],
    meta={"type": "reference"}))


# ═══════════════════════════════════════════════════════════════
# EP01 泥里的人 (episode=1) — 完整制作包
# ═══════════════════════════════════════════════════════════════

cards.append(c("e01-brief", "idea", "导演Brief EP01", 0,
    "## EP01 泥里的人\n"
    "约24秒 6镜头\n\n"
    "核心冲突：R3苍霖护住龙骨碎片 vs 暴徒踩灭\n"
    "钩子：前3秒拳头砸画面（情绪炸点）| 结尾碎片指缝间最后一闪\n"
    "情绪曲线：压迫-微光-粉碎-孤独-一丝希望\n"
    "角色：R3苍霖（主）暴徒x3路人\n"
    "场景：scene01_废巷\n\n"
    "Step 0阻塞：@视频1风格锚待锁定 | 母版图待生成",
    episode=1, images=[IMG["scene_concept"]]))

# 分镜拆分表
cards.append(c("e01-shots", "script", "镜头拆分表", 0,
    "| Shot | 时间码 | 景别 | R编号 | 动作因果 | 特效 | 运镜 | 音效 |\n"
    "|------|--------|------|-------|----------|------|------|------|\n"
    "| 01 | [00:00-00:04] | 特写 | R3 | 拳头砸-R3护胸 | 无 | static | 拳击闷响 |\n"
    "| 02 | [00:04-00:08] | 远景 | R3+暴徒 | 被打-布包被踢飞 | 无 | crane down | 踢击+布包落地 |\n"
    "| 03 | [00:08-00:12] | 微距 | 碎片 | 布包飞-碎片滚出发光 | 蓝白脉动 | dolly in | 低频心跳 |\n"
    "| 04 | [00:12-00:16] | 中景仰 | R3+暴徒 | 碎片光-暴徒踩灭 | 光灭 | static | 碎裂+嘲笑 |\n"
    "| 05 | [00:16-00:20] | 远景 | R3 | 光灭-R3倒地 | 无 | tracking | 风声+脚步远 |\n"
    "| 06 | [00:20-00:24] | 特写 | R3手 | 倒地-伸手握碎片-最后一闪 | 蓝光闪 | dolly in | 极低嗡鸣 |",
    episode=1))

# 逐镜头
shot_specs = [
    (1, "Shot01 拳头落下 [00:00-00:04]",
     f"特写正面偏低\n暴徒拳头从上方缓慢砸入。R3苍霖（{CANG}）头部微偏，血从嘴角溢出，双臂护胸\n"
     f"表情：眉头紧皱牙关咬紧眼眶泛红\n运镜：固定(static)画面轻微震动\n音效：沉闷拳击声 R3压抑闷哼\n"
     f"镜头目的：前3秒情绪炸点\n下一镜因果：因为R3被打所以暴徒踢飞布包"),
    (2, "Shot02 废巷全景 [00:04-00:08]",
     f"远景俯拍45度\n三暴徒围住R3（{CANG}），一人踢飞布包，布包地面滚动。R3蜷缩肩膀发抖\n"
     f"运镜：缓慢下推(crane down)从龙骨化石顶部到巷道\n音效：靴子踢击 布包滑石面\n"
     f"镜头目的：建立空间\n下一镜因果：布包飞所以碎片滚出"),
    (3, "Shot03 碎片发光 [00:08-00:12]",
     f"微距特写\n拇指大龙骨碎片从布包滚出停下。血管纹路发蓝白光脉动两次如心跳\n"
     f"运镜：缓慢推进(dolly in)中景推到微距\n音效：低频嗡鸣随光脉动\n"
     f"特效：蓝白光脉动+石面淡蓝光圈\n下一镜因果：碎片发光所以暴徒踩灭"),
    (4, "Shot04 踩灭 [00:12-00:16]",
     f"中景低角度仰拍\n靴子踩发光碎片，蓝光被挤压闪烁两次后灭。切R3（{CANG}）眼睛极近特写瞳孔映光灭\n"
     f"表情：希望变空洞嘴唇微张\n运镜：固定(static)\n音效：碾压碎裂声 光灭消散音\n"
     f"台词：你以为你是龙骑士？\n口型与字幕：你以为你是龙骑士？\n下一镜因果：光灭嘲笑所以R3倒地"),
    (5, "Shot05 倒地 [00:16-00:20]",
     f"远景侧面平视\nR3（{CANG}）侧倒蜷缩，三暴徒背影远去带起灰尘。血蔓延石面\n"
     f"运镜：缓慢横移(tracking)从暴徒到R3\n音效：风吹废墟 脚步渐远 寂静\n"
     f"镜头目的：情绪最低点\n下一镜因果：暴徒走了所以R3伸手够碎片"),
    (6, "Shot06 碎片余光 [00:20-00:24]",
     f"特写到极近特写\nR3沾血颤抖的手伸向碎片。指触碎片瞬间指缝蓝光一闪不到一秒后暗下。手握紧碎片指节发白\n"
     f"运镜：缓慢推进(dolly in)手到指缝极近\n音效：极低嗡鸣然后完全寂静\n"
     f"光影：暖橙矿灯(左)+冷蓝碎片光(右)双色温\n结尾悬念：碎片还活着？"),
]
for sn, title, content in shot_specs:
    cards.append(c(f"e01-s{sn:02d}", "script", title, sn, content, episode=1,
        meta={"shot": sn}))

# 分镜板
sb_data = [
    (1, "S01 拳头落下", "特写正面偏低 | 4秒\n拳头砸入-R3头偏-血溢嘴角\n光影：暗红天光左上仅照半边脸"),
    (2, "S02 废巷全景", "远景俯拍 | 4秒\n三暴徒围R3踢飞布包\n龙骨化石暗红天空 体积光斑"),
    (3, "S03 碎片发光", "微距 | 4秒\n碎片滚入-血管纹蓝白脉动x2\n背景虚化蓝白光映石纹"),
    (4, "S04 踩灭", "中景仰-极近特写 | 4秒\n靴踩碎片-R3瞳孔映光灭\n台词：你以为你是龙骑士？"),
    (5, "S05 倒地", "远景侧面 | 4秒\nR3蜷缩暴徒远去血蔓延\n暗红天光龙骨化石剪影"),
    (6, "S06 碎片余光", "特写-极近 | 4秒\n手触碎片指缝蓝光一闪\n暖橙+冷蓝双色温 结尾悬念"),
]
for sn, title, content in sb_data:
    cards.append(c(f"e01-sb{sn:02d}", "storyboard", title, sn, content, episode=1))

# 特效分层
cards.append(c("e01-vfx", "design", "龙骨碎片光效分层", 0,
    "## 四层拆分\n\n"
    "主光效：蓝白脉动 #B0D4FF-#FFFFFF 2次/4秒如心跳\n"
    "强度：S03弱到中 S04中到灭 S06极弱一闪到灭\n\n"
    "辅助粒子：碎片周围石面反射光 半径3倍 随脉动同步\n\n"
    "环境响应：蓝白光映石面不规则反射 S04靴缝溢光后消散\n\n"
    "转场残留：S04瞳孔蓝色映射0.5秒 S06指缝蓝光消散留暖橙",
    episode=1, meta={"type": "vfx"}))

# 轨迹图
cards.append(c("e01-trj", "design", "动作轨迹+姿态衔接", 0,
    "S01 攻击线拳头上到面部(下) | R3站到头偏右护胸\n"
    "S02 踢线脚到布包(右) | R3结束蜷缩\n"
    "S03 碎片滚入左到停到发光无位移 | 镜头中景推微距\n"
    "S04 靴子上到碎片(下) | R3结束倒地侧卧\n"
    "S05 暴徒远去(右渐远) | R3倒地侧卧面朝碎片\n"
    "S06 R3手臂从身侧到碎片(右) | 握紧\n\n"
    "衔接验证全通过",
    episode=1, meta={"type": "trajectory"}))

# 图片提示词
img_p = {
    1: f"特写正面偏低角度。暴徒拳头从上方砸入。R3苍霖（{CANG}）头部微偏血从嘴角溢出双臂护胸。阴影从上方投下仅暗红光照亮半边脸伦勃朗光。{STYLE}。{POS}。{QS}",
    2: f"远景俯拍45度废墟巷道。龙骨化石暗红天空。三暴徒围住R3苍霖（{CANG}）一人踢飞布包。蓝色光粒子漂浮暗红天光体积光斑。{STYLE}。{POS}。{QS}",
    3: f"微距特写，拇指大龙骨碎片在粗糙石面，血管纹路发蓝白脉动光映石纹淡蓝光圈。背景虚化浅景深。{STYLE}。{POS}。{QS}",
    4: f"中景仰拍，靴子踩发光龙骨碎片蓝光被挤压将灭。R3苍霖（{CANG}）倒地瞳孔映蓝光最后闪烁。极暗仅蓝色闪光照亮。{STYLE}。{POS}。{QS}",
    5: f"远景侧面，R3苍霖（{CANG}）侧倒巷道蜷缩。暴徒背影远去。血蔓延石面反射暗红天空。远处龙骨化石剪影。{STYLE}。{POS}。{QS}",
    6: f"特写，沾血颤抖的手伸向暗淡龙骨碎片。指触碎片指缝微弱蓝光一闪。暖橙矿灯与冷蓝碎片光双色温。浅景深。{STYLE}。{POS}。{QS}",
}
for sn in range(1, 7):
    cards.append(c(f"e01-ip{sn:02d}", "img_prompt", f"S{sn:02d} Image Prompt", sn,
        f"file: images/scene{sn:02d}.png | @图片1(R3母版)\n\n{img_p[sn]}",
        episode=1, prompts=[img_p[sn]], meta={"shot": sn}))

# 视频提示词
cards.append(c("e01-vp-hdr", "vid_prompt", "全局头部", 0,
    f"【风格】{STYLE}\n【时长】约24秒 6镜x4秒\n"
    f"【角色】R3苍霖（{CANG}）/ 暴徒x3路人\n"
    f"【全局要求】竖屏9:16 | 对齐@视频1 | @图片1(R3母版)锚定 | 口型字幕一致 | 前3秒炸点 | 台词10字内\n"
    f"{POS}\n{QS}",
    episode=1))

vp_text = {
    1: f"@图片1(R3母版) @图片3(scene01首帧)\n[00:00-00:04]\n特写正面偏低。暴徒拳头从上方缓慢砸入。R3苍霖（{CANG}）头部微偏血从嘴角溢出双臂护胸手指攥紧布料。\n固定(static)画面轻微震动。\n暗红天光仅照半边脸伦勃朗光。\n音效：沉闷拳击声R3闷哼。\n画风对齐@视频1，{STYLE}，{POS}，{QS}",
    2: f"@图片1(R3母版) @图片2(scene01母版)\n[00:04-00:08]\n远景俯拍废墟巷道。三暴徒围R3苍霖（{CANG}）一人踢飞布包布包滚动。R3蜷缩肩抖。\n缓慢下推(crane down)龙骨化石到巷道。\n暗红天光体积光斑蓝色粒子漂浮。\n音效：踢击声布包滑石面。\n画风对齐@视频1，{STYLE}，{POS}，{QS}",
    3: f"@图片2(scene01母版)\n[00:08-00:12]\n微距特写龙骨碎片。碎片从左滚入停下血管纹路发蓝白光脉动两次如心跳映石纹淡蓝光圈。\n缓慢推进(dolly in)中景到微距。\n背景虚化蓝白光石面反射浅景深。\n音效：低频嗡鸣随脉动。\n画风对齐@视频1，{STYLE}，{POS}，{QS}",
    4: f"@图片1(R3母版)\n[00:12-00:16]\n中景仰拍靴子踩发光碎片蓝光被挤压闪烁两次后灭。切R3苍霖（{CANG}）眼睛瞳孔映光灭眼神变空洞。\n固定(static)。\n极暗仅蓝色闪光照亮。\n音效：碾压碎裂声光灭消散音。\n口型与字幕：你以为你是龙骑士？\n画风对齐@视频1，{STYLE}，{POS}，{QS}",
    5: f"@图片1(R3母版) @图片2(scene01母版)\n[00:16-00:20]\n远景侧面R3苍霖（{CANG}）侧倒蜷缩暴徒背影远去灰尘。血蔓延石面反射暗红天空。R3肩偶尔抽动。\n缓慢横移(tracking)暴徒到R3。\n暗红天光龙骨化石剪影轮廓光。\n音效：风吹废墟脚步渐远寂静。\n画风对齐@视频1，{STYLE}，{POS}，{QS}",
    6: f"@图片1(R3母版)\n[00:20-00:24]\n特写R3手沾血颤抖伸向碎片。指触碎片指缝蓝光一闪不到一秒后暗下手握紧指节发白。\n缓慢推进(dolly in)手到指缝极近。\n暖橙矿灯与冷蓝碎片光双色温蓝光消后只剩暖橙。\n音效：极低嗡鸣然后寂静。\n画风对齐@视频1，{STYLE}，{POS}，{QS}",
}
for sn in range(1, 7):
    sj = json.dumps({"image":f"images/scene{sn:02d}.png","clip":f"clips/clip{sn:02d}.mp4","lines":[{"type":"dialogue" if sn==4 else "narration","text":"你以为你是龙骑士？" if sn==4 else "","character":"暴徒" if sn==4 else ""}]}, ensure_ascii=False)
    cards.append(c(f"e01-vp{sn:02d}", "vid_prompt", f"S{sn:02d} 视频提示词", sn,
        f"{vp_text[sn]}\n\n---\nMotion: scene{sn:02d}.png->clip{sn:02d}.mp4 | 4秒 | {'低' if sn in (3,6) else '中'}\nScript: {sj}",
        episode=1, prompts=[vp_text[sn]], meta={"shot": sn}))

# 质检
cards.append(c("e01-qa", "vid_prompt", "质检报告", 7,
    "## EP01 质检 17项\n\n"
    "负向提示词PASS | R编号PASS | 每段4秒PASS | 口型字幕PASS(S04) | 禁止词PASS | 因果链PASS | 角色漂移PASS | 服装漂移PASS | 景别不连续3同PASS | 台词8字PASS | scene/clip映射PASS | 正向后缀PASS | @引用PASS | 运镜中英双写PASS | 运镜动作分开PASS | 宫格N/A | 姿态衔接PASS\n\n"
    "交付目录完整 00-07全有\n"
    "状态：可进入生成\n"
    "阻塞：@视频1待锁定 母版图待生成",
    episode=1, meta={"type": "qa"}))


# ═══════════════════════════════════════════════════════════════
# EP02-10 概要 (episode=2..10, pending)
# ═══════════════════════════════════════════════════════════════
ep_briefs = [
    (2, "EP02 假觉醒", "R3找世界树光丝假觉醒被掐灭\n专门粉碎天选之人套路\nscene02_废矿坑"),
    (3, "EP03 星蓝的手", "R3伤重R1艾拉冷淡救治发现龙蛋\nR1首次出场\nscene03_矿洞口"),
    (4, "EP04 龙蛋", "R3孵蛋蒙太奇蛋裂幼龙舔脸\nR2首次出场\nscene04_矿洞"),
    (5, "EP05 苹果", "教幼龙轻喜剧世界树暗了\nscene01_废巷"),
    (6, "EP06 数据残留", "天边青鸾数据残留跨陆钩子\nscene04_矿洞夜景"),
    (7, "EP07 世界树信号", "R3触碰树根九大陆信号树要死了\n特效：九大陆闪回x9"),
    (8, "EP08 选择", "老矿工劝阻R3决定出发"),
    (9, "EP09 第一次飞", "骑龙跳崖展翅解放\n仙侠三段式 可考虑可灵"),
    (10, "EP10 九陆", "九大陆剪影每陆一人抬头\n需额外场景母版图"),
]
for ep, title, content in ep_briefs:
    cards.append(c(f"e{ep:02d}-brief", "idea", title, 0, content, episode=ep, status="pending"))


# ── Write ──
with open("data/production/jiulu-s1/cards.json", "w", encoding="utf-8") as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)

from collections import Counter
ep_counts = Counter(x.get("episode") for x in cards)
stage_counts = Counter(x["stage"] for x in cards)
print(f"Total: {len(cards)} cards")
print(f"\nBy episode:")
for ep in sorted(ep_counts.keys(), key=lambda x: (x is not None, x or 0)):
    label = "Global" if ep is None else f"EP{ep:02d}"
    print(f"  {label}: {ep_counts[ep]}")
print(f"\nBy stage:")
for s in ["idea","script","storyboard","design","img_prompt","vid_prompt"]:
    print(f"  {s}: {stage_counts.get(s, 0)}")
