"""
第二轮深度学习：手艺级职业正典（来自 StudioBinder/Adobe/NoFilmSchool 等专业站，
经 WebSearch 检索）。比维基定义级更深——带具体参数/比例/可执行规则。
每条记忆带专业来源，category=craft，importance=0.88。

幂等：sourceSession=pro_craft_deep_20260630
"""
import json, os, sys, hashlib
from datetime import datetime, timezone
from pathlib import Path

os.environ["PYTHONUTF8"] = "1"
sys.stdout.reconfigure(encoding="utf-8")

MEM_ROOT = Path("D:/P/agent/data/memory")
KN_ROOT = Path("D:/P/agent/data/knowledge")
SESS = "pro_craft_deep_20260630"
NOW = datetime.now(timezone.utc).isoformat()

# (条目, 来源标注, 知识库md, [记忆...])
CRAFT = {
"lighting": ("三点布光与伦勃朗光", "StudioBinder/film lighting",
"""# 三点布光 + 伦勃朗光（电影布光手艺）

> 来源：StudioBinder《Film Lighting Techniques》《Rembrandt Lighting》

## 三点布光
- 主光 Key：最亮最直接，置于主体侧面30-45°、略高于眼平线，制造塑形阴影
- 辅光 Fill：放主光对侧，柔化硬阴影，强度约主光的50-75%
- 轮廓光 Backlight：置于主体后上方，打出边缘光，把主体从背景分离

## 伦勃朗光（戏剧性人像）
- 一主光高位侧前 + 一辅光/反光板半高对侧，辅光约主光一半功率
- 标志：暗侧脸颊下方出现一个"伦勃朗三角"——宽不过眼、长不过鼻
- 用途：film noir、戏剧独白、角色驱动场景（《教父》《老爷车》）

## 迁移到漫剧提示词
要写清光源位置/高度/强度比，而不是只说"打光"。戏剧脸用伦勃朗三角，分离主体用轮廓光。
""",
 ["三点布光参数：主光在侧面30-45°且略高于眼平线，辅光在对侧、强度是主光的50-75%，轮廓光在后上方做边缘分离。（来源:StudioBinder布光指南）",
  "伦勃朗光的判定标志=暗侧脸颊下方一个三角光斑，宽不过眼、长不过鼻；辅光约主光一半功率。压迫/戏剧场景首选。（来源:StudioBinder Rembrandt Lighting）",
  "提示词写光要给'位置+高度+强度比'三要素，而不是笼统'打光'——光的方向决定脸的塑形和情绪。（来源:StudioBinder布光指南）"]),

"animation12": ("动画12原则", "Adobe/Wikipedia·Twelve basic principles of animation",
"""# 迪士尼动画12原则（运动手艺）

> 来源：Adobe《Principles of Animation》/维基·Twelve basic principles of animation（《The Illusion of Life》1981）

## 最核心两条
- 挤压与拉伸 Squash & Stretch：给物体重量与弹性。**关键铁律：体积不变**——变宽就要变矮，变高就要变瘦。球落地挤压、上升拉伸
- 时间控制 Timing：两个姿势之间的帧数=动作速度。动作越慢需要的帧/张数越多

## 其它常用
预备动作(Anticipation)、缓入缓出(Ease in/out)、跟随与重叠(Follow through)、弧线(Arcs)、夸张(Exaggeration)、次要动作(Secondary action)

## 迁移到AI视频
动作要符合物理重量感；慢动作连续小帧更稳。运动走弧线不走直线。重心转移要有预备。
""",
 ["挤压拉伸的铁律=体积守恒：变宽必变矮、变高必变瘦，否则动作假。给物体重量和弹性靠这个。（来源:Adobe/维基·动画12原则）",
  "Timing=两姿势间的帧数=速度；动作越慢需要越多中间帧。AI视频里慢速连续小动作更稳不变形。（来源:Adobe/维基·动画12原则）",
  "自然运动走弧线不走直线，且要有预备动作(Anticipation)和缓入缓出——直来直去的动作看着像机器人。（来源:Adobe/维基·动画12原则）"]),

"shape_language": ("角色形状语言", "CharacterBazaar/vsquad·Shape Language",
"""# 形状语言（角色设计手艺）

> 来源：CharacterBazaar/vsquad/CGWire《Shape Language in Character Design》

## 三大基本形状=性格速读
- 圆 Circle：友善、柔软、安全、天真（米老鼠圆耳、Up的Dug）
- 方 Square：稳定、可靠、力量、保护者/战士/导师，方脸更严肃可信
- 三角 Triangle：动感、攻击性、危险——最常用于反派

## 剪影测试（行业验收法）
把角色只留剪影给别人看，若能猜对角色性格/身份，设计就成立。形状影响剪影、比例、服装、五官、画风。

## 迁移到九陆
苍霖(成长中少年)偏圆+三角混合(韧劲)；反派/危险元素用三角；可靠角色用方。每个角色先确定主导形状。
""",
 ["形状语言：圆=友善柔软安全，方=稳定可靠/英雄导师，三角=动感攻击/反派。角色的主导形状一眼传达性格。（来源:CharacterBazaar形状理论）",
  "剪影测试是角色设计的行业验收法：只给剪影别人能猜对身份性格才算成立。形状决定剪影、比例、服装、五官。（来源:vsquad形状语言）"]),

"film_color": ("电影色彩叙事", "StudioBinder/NoFilmSchool·Color in Film",
"""# 电影色彩叙事（配色手艺）

> 来源：StudioBinder《How to Use Color in Film》/No Film School《Color Psychology》

## 色彩是叙事决策不是装饰
每个颜色三要素：色相 Hue / 饱和度 Saturation / 明度 Value。配色要对齐叙事、角色、主题。

## 色彩脚本 Color Script
整片预先规划色彩走向：剧本分析→情绪板→每场色调，让色彩随情绪/时间/角色发展变化（色彩转场）。

## 心理
暖色(红黄)=温暖舒适↔愤怒敌意；冷色(蓝绿)=平静↔悲伤孤独。同一颜色在不同语境含义相反，靠饱和度/明度区分。

## 迁移到九陆
碎片蓝=希望/觉醒，龙焰赤金=力量爆发，世界树金绿=生命/衰败。整季做一张color script，情绪曲线对应色调曲线。
""",
 ["色彩是叙事决策不是装饰：配色必须对齐角色/主题/情绪，整片应先做color script规划色调随情绪走向变化。（来源:StudioBinder电影色彩）",
  "暖冷色心理是双面的：暖色既是温暖也是愤怒，冷色既是平静也是悲伤孤独——靠饱和度和明度+语境定具体含义。（来源:No Film School色彩心理）"]),

"ai_consistency": ("AI视频角色一致性工作流", "neolemon/Artlist/Vidu·AI Character Consistency",
"""# AI视频角色一致性工作流（本项目命脉手艺）

> 来源：neolemon/Artlist/Vidu/Kittl《AI Video Character Consistency 2026》

## 为什么会漂
AI每个clip独立生成，同样的文字描述每次解读略有不同，40-60个clip拼成长视频时微小差异累积成明显穿帮。这是AI视频2026最核心的生产难题。

## 解法=给模型更硬的锚
1. **强参考图**：上传1张高清角色图作锚点。备齐3-5张：1正面、1张3/4侧、1张展示全套服装的远景、签名道具单独1张
2. **转面图(turnaround)**：正/侧/3-4/背四视图，每个角度同样的发型/服装/特征
3. **提示词只写动作和环境，不再重复描述角色外貌**——参考图负责长相，提示词负责"发生什么"
4. **锁风格 + 锁首帧/尾帧**：first frame & end frame 控制运动起止
5. 稳定布光、可控运动

## 迁移到九陆（直接可用）
@图片1=苍霖转面母版(正/侧/3-4/背)。每镜提示词写"参考@图片1，他做X动作"，而不是重抄"黑发左脸疤..."。先锁母版再批量，这是省返工的唯一办法。
""",
 ["AI角色漂移的根因：每个clip独立生成、对同样描述每次解读不同，几十个clip累积成穿帮——这是AI视频最核心生产难题。（来源:AI Magicx一致性指南）",
  "保一致性的硬解法：先备3-5张参考图(正面+3/4侧+全身服装+道具单独)做成转面母版，提示词只写动作和环境、不再重抄角色外貌——参考图负责长相。（来源:neolemon/Artlist一致性工作流）",
  "锁首帧+尾帧(first/end frame)控制运动起止，配合锁定风格和稳定布光，是跨镜一致性的关键操作。（来源:Kittl AI视频一致性）"]),

"storyboard_craft": ("分镜制作法", "StudioBinder/Videomaker·Storyboarding",
"""# 分镜制作法（分镜手艺）

> 来源：StudioBinder《Storyboard Rules》/Videomaker《Storyboarding Techniques》

## 流程
先画缩略草图(thumbnail)快速试构图/角度/节奏，不抠细节。用箭头在静帧上标运动（角色或镜头）。涵盖构图、机位角度、镜头类型、道具、角色、特效。

## 核心规则
- 构图控制注意力：三分法/引导线/景深引导视线。画面没有明确焦点，观众注意力就散
- **情绪距离规则**：镜头越近情绪越深。远=角色孤立于世界，近=逼观众共情
- **180度轴线规则**：机位保持在动作轴线同一侧，保证视觉连贯，避免观众方向混乱

## 迁移
每镜缩略图先定构图焦点+景别+箭头标运镜。高情绪推近，孤独感拉远。跨镜守轴线。
""",
 ["分镜先画缩略草图试构图/角度/节奏不抠细节，用箭头标镜头和角色运动；画面必须有明确焦点否则注意力散。（来源:StudioBinder/Videomaker分镜法）",
  "情绪距离规则：镜头越近情绪越深——远景让角色孤立于世界，近景逼观众共情。选景别本质是选情绪距离。（来源:StudioBinder分镜规则）",
  "180度轴线规则：机位要保持在动作轴线同一侧，否则跨镜观众会方向错乱。这是连贯性铁律。（来源:StudioBinder分镜规则）"]),

"camera_emotion": ("运镜情绪语义", "StudioBinder/NoFilmSchool·Camera Movement",
"""# 运镜情绪语义（运镜手艺）

> 来源：StudioBinder《Types of Camera Movements》/No Film School《Dolly Shot》

## 推 Dolly in / Push in
镜头逼近主体放大情绪、聚焦注意力，让观众感到角色的顿悟/恐惧/喜悦/决心。制造亲密与张力。

## 拉 Dolly out / Pull out
拉远制造语境与距离，可揭示环境或强调角色的孤立渺小。

## 视差与纵深
dolly物理移动产生视差——前景与背景以不同速度移动，造出三维纵深（zoom变焦没有这个）。

## 移/跟 Tracking
平行跟随移动的主体，把观众拉进旅程，制造沉浸"与角色同行"感。

## 迁移
顿悟/情绪峰值=slow push in；孤独/收尾=pull out；带观众走=tracking。dolly和zoom不同：dolly有纵深、zoom是压缩。
""",
 ["推镜(dolly/push in)放大情绪制造亲密与张力，用于角色顿悟/恐惧/决心的瞬间；拉镜(pull out)给语境、强调孤立渺小。（来源:StudioBinder/No Film School运镜）",
  "dolly(物理移动)产生视差纵深、zoom(变焦)是空间压缩，两者情绪完全不同不可混用；tracking平行跟随制造'与角色同行'的沉浸感。（来源:No Film School Dolly Shot）"]),

"shot_size_emotion": ("景别情绪强度", "StudioBinder/Adobe·Shot Sizes",
"""# 景别与情绪强度（景别手艺）

> 来源：StudioBinder《Camera Shots Sizes》/Adobe《Types of Shots》

## 景别=情绪距离
- 特写 Close-up：填满画面、剥离环境干扰，直接拉进角色情绪状态，强化戏剧
- 全/远景 Wide/Long：让人显得渺小、孤独、微不足道，强调地点与处境
- 中景 Medium：兼顾表情与身体语言，适合对话和姿态
- 中近景 Medium close-up：捕捉面部+轻微手势

## 情绪递进手法
情绪戏从较松的中景开始，逐步用越来越大的特写堆叠强度。

## 迁移
高情绪点用特写剥离环境；渺小/孤独/收尾用大远景；情绪戏做'中景→近景→特写'递进堆强度。
""",
 ["景别即情绪距离：特写剥离环境直推角色内心、强化戏剧；大远景让人渺小孤独；中景兼顾表情与身体语言。（来源:StudioBinder景别指南）",
  "情绪递进手法：从较松的中景起步，逐步换成越来越大的特写来堆叠情绪强度，而不是一上来就怼脸。（来源:StudioBinder/Adobe景别）"]),
}

ASSIGN = {
    "comic-director":          ["ai_consistency", "storyboard_craft"],
    "comic-storyboard":        ["storyboard_craft", "shot_size_emotion", "camera_emotion"],
    "comic-trajectory-artist": ["camera_emotion", "animation12", "shot_size_emotion"],
    "comic-keyframe-artist":   ["lighting", "shot_size_emotion", "ai_consistency", "animation12"],
    "comic-scene-designer":    ["lighting", "film_color"],
    "comic-scene-artist":      ["lighting", "film_color"],
    "comic-character-designer":["shape_language", "film_color"],
    "comic-character-artist":  ["shape_language", "ai_consistency"],
    "comic-vfx-designer":      ["lighting", "film_color"],
    "comic-prompt-engineer":   ["ai_consistency", "film_color", "camera_emotion"],
    "comic-qa-inspector":      ["ai_consistency"],
    "comic-screenwriter":      ["shot_size_emotion"],
}

def load(fp):
    if fp.exists():
        try: return json.loads(fp.read_text("utf-8"))
        except Exception: return []
    return []
def write(fp, data):
    fp.parent.mkdir(parents=True, exist_ok=True)
    fp.write_text(json.dumps(data, ensure_ascii=False, indent=2), "utf-8")

mem_total = doc_total = 0
for emp, topics in ASSIGN.items():
    sp = MEM_ROOT / emp / "semantic.json"
    sems = [x for x in load(sp) if x.get("sourceSession") != SESS]
    n = 0
    for tk in topics:
        _, _, _, mems = CRAFT[tk]
        for j, content in enumerate(mems, 1):
            n += 1
            sems.append({"memoryId": f"{SESS}_{emp}_{tk}_{j:02d}", "employeeKey": emp,
                "content": content, "category": "craft", "importance": 0.88,
                "sourceSession": SESS, "accessCount": 0, "createdAt": NOW,
                "lastAccessed": None, "updatedAt": NOW})
    sems.sort(key=lambda m: m["importance"], reverse=True)
    write(sp, sems); mem_total += n

    kd = KN_ROOT / emp
    ip = kd / "index.json"; idx = load(ip); da = 0
    for tk in topics:
        name, src, body, _ = CRAFT[tk]
        fname = f"craft-{tk}.md"
        for e in [e for e in idx if e.get("fileName") == fname]:
            op = kd / f"{e['docId']}{e.get('extension','.md')}"
            if op.exists(): op.unlink()
        idx = [e for e in idx if e.get("fileName") != fname]
        did = hashlib.sha1(f"{emp}/{fname}/craft".encode()).hexdigest()[:16]
        b = body.encode("utf-8"); kd.mkdir(parents=True, exist_ok=True)
        (kd / f"{did}.md").write_bytes(b)
        idx.append({"docId": did, "fileName": fname, "extension": ".md",
            "sizeBytes": len(b), "uploadedAt": NOW, "tags": ["手艺正典", src, name]})
        da += 1
    write(ip, idx); doc_total += da
    print(f"OK {emp:26s} | 手艺记忆+{n:2d} 文档+{da} | {','.join(topics)}")

print(f"\n第二轮深度：手艺记忆={mem_total} 文档={doc_total}，全部带专业站出处")
