"""Inject accumulated knowledge into each comic employee's roleProfile."""
import json, os, sys
from pathlib import Path

os.environ["PYTHONUTF8"] = "1"
sys.stdout.reconfigure(encoding="utf-8")

EMP_DIR = Path("D:/P/agent/data/employees")

# ══════════════════════════════════════════════════════════════
# Knowledge blocks
# ══════════════════════════════════════════════════════════════

ART_BIBLE_CORE = """
## Art Bible 风格锁定（必须掌握）

### 风格锚点句（所有提示词必带）
干净半写实东方幻想漫剧插画，电影级高特效动作关键帧，柔和漫射光，清晰主体，低描边，蓝白魔法阵与赤金龙焰对撞

### 正向约束词（画质后缀，每条提示词结尾必带）
画面干净无描边，无墨线，无裂纹，无草稿线，无脏黑边，无死黑阴影，无文字水印，保持角色一致性，服装不漂移。保持面部一致，无变形，无拉伸，避免抖动运动和弯曲肢体，面部清晰，人体结构正常，动作自然流畅，画面稳定，竖屏9:16，电影质感

### 禁止清单
黑色粗描边/墨线、宫格分镜、死黑阴影、裂纹划痕纹理、文字水印签名、草稿线辅助线、负向提示词（Seedance不读）、"快速"/"fast"（运动模糊）、多运镜叠加（每镜只一个）、超6秒单段（角色变形）

### 色彩体系
- 龙骨碎片：蓝白脉动光（苍霖核心符号）
- 龙焰：赤金/白热
- 星环/治疗阵：蓝白+数据流（艾拉魔法）
- 世界树：金绿色光脉（生命/衰败）
- 矿洞：幽暗+碎片微光
- 废巷：暖色午后光
- 云海/飞行：金色阳光+体积光

### @ 引用规范
@图片1=R3苍霖母版（所有镜头必引） @视频1=风格锁定视频（最强锚） 总计≤12素材 最优4-5个
"""

CHAR_DNA = """
## 角色视觉DNA（每次提示词必须完整重复）

### R3 苍霖（全季主角）
- EP01-03（早期）：16岁少年，黑色短碎发凌乱，左脸颊竖向旧伤疤，偏瘦有韧劲，深褐近黑瞳孔，破烂灰褐麻布短衣，赤脚，胸口布条绑龙骨碎片
- EP04-08（中期）：+旧毯子当披风，其余同上
- EP09-10（后期）：深灰龙翼披风龙鳞纹，粗绳项链挂龙骨碎片，不再赤脚

### R1 艾拉（EP03起）
成年年轻女性，修长，黑长发银蓝高光，蓝瞳，偏白肤，黑蓝露肩星环法师战斗装，透明纱质外摆，大腿绑带，膝上长靴，暗金属法杖

### R2 龙（三阶段）
- EP04 幼龙：巴掌大，鳞片稀疏湿润，锋利小角冠，半透明翼膜薄如蝉翼，熔金龙瞳圆润，爪尖细小
- EP05-07 少龙：猫大，鳞片渐密深灰，角冠初成型，翼展约一米半透明翼膜，熔金龙瞳，尾巴灵活，爪尖火星
- EP09-10 巨龙：马大可骑乘，宽阔翼展，半透明翼膜血管可见，锋利角冠，长吻，颈部鳞片密集，胸腔白热龙焰，熔金龙瞳

### 老矿工（EP08）
老年男性，白发稀疏，满脸矿灰深刻皱纹，破旧深灰褐矿工服，手里转旧矿石
"""

SCENES = """
## 核心场景设定

| ID | 场景 | 光影特征 |
|----|------|---------|
| scene01 | 废巷 | 暖色午后散射光，石墙破桶碎石，日常感 |
| scene02 | 废矿坑 | 30米深，碎片蓝光+裂缝金绿光丝，幽暗冷调 |
| scene03 | 矿洞口 | 半明半暗过渡光线，冷暖交界 |
| scene04 | 矿洞深处 | 完全黑暗只有碎片光，壁面微弱发光矿石 |
| scene05 | 世界树遗迹 | 枯根迷宫，金绿残留光脉，体积光从裂缝穿入 |
| scene06 | 悬崖 | 断崖绝壁云海翻涌，日落暖橙侧光 |
| cloud | 云海上方 | 金色云海无边际，阳光穿云体积光 |
"""

SEEDANCE_RULES = """
## Seedance 2.0 生产规则

### 八层视频结构
1. 素材角色声明：@图片/@视频/@音频引用 + R1/R2编号锁角色
2. 镜头标签：「镜头1」「镜头2」分段，每段≤6秒
3. 景别与主体：景别 + 2-3个静态特征（具体名词）
4. 动作：身体部位级 + 幅度 + 速度，优先慢速连续小动作
5. 运镜：每镜只一个运镜，中英双写如「缓慢推进(dolly in)」
6. 场景与光影：环境 + 光源方向/色温 + 氛围元素（质量ROI最高）
7. 音频：对话/音效/环境音
8. 全局收尾：风格锚点 + 正向约束词 + 质量后缀

### 七要素图片公式
风格/画风 + 主体描述 + 动作/表情 + 景别与构图 + 光影与质感 + 情绪氛围 + 画质后缀

### 致命规则
- Seedance 2.0 不读负向提示词！只用正向约束
- "快速"/"fast"是禁止词 → 运动模糊
- 纯中文效果最稳（运镜术语中英双写除外）
- 每段≤6秒 → 超过角色变形
- 镜头运动和角色动作分开描述
- 每镜只一个运镜动作
- 角色描述每次完整重复
"""

CAMERA_TABLE = """
## 运镜速查

### 七大景别×情绪
| 景别 | 情绪用途 | 典型搭配 |
|------|---------|---------|
| 大远景 | 渺小/孤独/命运感 | crane down |
| 远景 | 空间感/格局 | tracking |
| 全景 | 客观叙事/建立场景 | static |
| 中景 | 对话/互动/日常 | dolly in |
| 近景 | 情绪/表情变化 | dolly in |
| 特写 | 强调细节/高情绪 | static+震动 |
| 微距 | 极致聚焦/奇观 | dolly in |

### 常用20运镜
推拉: dolly in / dolly out / zoom in / zoom out
横移: tracking / truck left/right / arc shot
升降: crane up / crane down / boom up / boom down
旋转: pan left/right / tilt up/down / dutch angle / 360 orbit
特殊: static / handheld / whip pan / bird's eye / low angle

### 运镜情绪组合拳
- dolly in + 浅景深 → "世界只剩这个东西"
- crane down + 雨 → "命运降临"
- static + 完全寂静 → "最痛是没声音"
- tracking + 背影 → "你跟不上"
- whip pan → "时空转换"
"""

LIGHT_TABLE = """
## 光影速查表

| 光型 | 情绪 | 典型场景 |
|------|------|---------|
| 伦勃朗光 | 压迫/戏剧 | 反派登场/审讯 |
| 逆光/轮廓光 | 神秘/孤独 | 剪影/告别/觉醒 |
| 底光 | 恐怖/不安 | 怪物/阴谋 |
| 顶光 | 审判/神圣 | 天降/神谕 |
| 双色温 | 冲突/对峙 | 冷暖两侧分别打光 |
| 体积光 | 史诗/希望 | 光柱穿云 |
| 环境光/柔光 | 日常/温柔 | 回忆/治愈 |
"""

SCREENPLAY_METHOD = """
## 爆款编剧方法论

核心问题：屏幕前刷手机的这个人，心里堵着什么？我怎么替他说出来？

### 每集必须有
1. **嘴替台词**：至少1句能截图传播的话（如"也是。"/"你的血流到样本上了。"）
2. **前3秒钩子**：强视觉/强情绪，不解释设定
3. **反转**：至少1个"以为A其实B"
4. **结尾钩子**：未解悬念，让人必须点下一集
5. **情绪过山车**：落差而非恒定，按秒标注情绪走向
6. **按秒拆解**：每个镜头标注动作+台词+情绪+音效+运镜

### "也是"贯穿线
EP02 苍霖被光拒绝后"也是"（自嘲接受）→ EP08 老矿工笑着"也是"（释然共鸣）。同样的词，六集成长后完全不同的重量。
"""

EMOTION_CURVE = """
## 第一季情绪曲线

EP01 暗→更暗→微光（碎片激活）
EP02 暗→炸亮→崩塌→更暗（假觉醒被拒"也是"）
EP03 暗→冷→转折→暖（艾拉救场→龙蛋双心跳）
EP04 暗→暖→温暖峰值（幼龙拱入怀）
EP05 暖→欢乐→暗线（苹果喜剧→第一次笑→世界树暗了）
EP06 安宁→惊醒→悬疑（全息求救→跨陆钩子）
EP07 敬畏→恐惧→自欺（九大陆闪回→"它在死"→"不是我们的事"）
EP08 不舍→对话→决然（老矿工"也是"→背影不回头）
EP09 紧张→恐惧→自由峰值（坠落→展翅→飞）
EP10 好奇→敬畏→渺小→安静（九陆→"好大"→渐黑）

EP02/EP07两个最低谷 EP04/EP09两个最高点 EP05唯一纯喜剧 EP10安静收尾不是高潮收尾
"""

SFX_SPEC = """
## 音效设计要点

### 环境音
废巷=风声+远处低频嗡鸣 | 矿洞=滴水回声+碎片脉动 | 遗迹=风吹枯根呜鸣 | 云海=风声+翼膜振动

### 角色音
苍霖=喘息/脚步/心跳 | 幼龙=细弱叫声/咕噜声 | 少龙=低吼/翅膀扑腾 | 巨龙=低沉呼吸/龙鸣 | 艾拉=靴子踩碎石/星环嗡鸣

### 情绪工具
- 寂静=最强情绪工具（EP02"也是"、EP08老矿工笑了都是完全寂静只有台词）
- 音乐骤停=EP02假觉醒管弦乐最高点断裂→彻底寂静
- 龙鸣=极远处，只在关键转折点出现一声（EP03/EP08/EP09）
"""

# ══════════════════════════════════════════════════════════════
# Per-employee knowledge injection mapping
# ══════════════════════════════════════════════════════════════

INJECTION = {
    "comic-director": ART_BIBLE_CORE + CHAR_DNA + EMOTION_CURVE + SCENES,
    "comic-screenwriter": SCREENPLAY_METHOD + CHAR_DNA + EMOTION_CURVE + SFX_SPEC,
    "comic-character-designer": CHAR_DNA + ART_BIBLE_CORE,
    "comic-scene-designer": SCENES + ART_BIBLE_CORE + LIGHT_TABLE,
    "comic-vfx-designer": ART_BIBLE_CORE + LIGHT_TABLE,
    "comic-trajectory-artist": CAMERA_TABLE + SEEDANCE_RULES,
    "comic-storyboard": CAMERA_TABLE + CHAR_DNA + SCENES,
    "comic-prompt-engineer": SEEDANCE_RULES + CAMERA_TABLE + LIGHT_TABLE + CHAR_DNA + SCENES + ART_BIBLE_CORE,
    "comic-qa-inspector": ART_BIBLE_CORE + SEEDANCE_RULES + CHAR_DNA,
    "comic-character-artist": CHAR_DNA + ART_BIBLE_CORE,
    "comic-scene-artist": SCENES + ART_BIBLE_CORE + LIGHT_TABLE,
    "comic-keyframe-artist": CHAR_DNA + SCENES + CAMERA_TABLE,
}

SEPARATOR = "\n\n---\n\n# 以下是已锁定的项目知识库（自动注入，请严格遵循）\n\n"

updated = 0
for emp_key, knowledge in INJECTION.items():
    fpath = EMP_DIR / f"{emp_key}.json"
    if not fpath.exists():
        print(f"SKIP {emp_key}: file not found")
        continue

    data = json.loads(fpath.read_text("utf-8"))
    rp = data.get("roleProfile", "")

    # Remove old injection if re-running
    if SEPARATOR.strip() in rp:
        rp = rp.split(SEPARATOR.strip())[0].rstrip()

    # Append knowledge
    new_rp = rp + SEPARATOR + knowledge.strip()
    data["roleProfile"] = new_rp

    # Update tag
    tags = data.get("tags", [])
    if "知识库已注入" not in tags:
        tags.append("知识库已注入")
        data["tags"] = tags

    data["updatedAt"] = "2026-06-30T18:55:00Z"

    fpath.write_text(json.dumps(data, ensure_ascii=False, indent=2), "utf-8")

    old_len = len(rp)
    new_len = len(new_rp)
    print(f"OK {emp_key:30s} | {old_len:5d} -> {new_len:5d} (+{new_len-old_len:5d}) | {data['name']}")
    updated += 1

print(f"\nUpdated {updated}/12 employees")
