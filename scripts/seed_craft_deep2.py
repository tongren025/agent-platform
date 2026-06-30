"""
第三轮深度学习：专攻最薄工种(角色/布景/分镜)+ 实战短剧。
来源 WebSearch 检索的专业站(TheDrawingSource/AnimeOutline/CreativeBloq/Vitrina/
Real Reel/Studiovity/FlowHunt)。带参数/可执行规则，带出处。

幂等：sourceSession=pro_craft_deep2_20260630
"""
import json, os, sys, hashlib
from datetime import datetime, timezone
from pathlib import Path

os.environ["PYTHONUTF8"] = "1"
sys.stdout.reconfigure(encoding="utf-8")

MEM_ROOT = Path("D:/P/agent/data/memory")
KN_ROOT = Path("D:/P/agent/data/knowledge")
SESS = "pro_craft_deep2_20260630"
NOW = datetime.now(timezone.utc).isoformat()

# (条目, 来源, md, [(content, category, importance)...])
CRAFT = {
"anatomy": ("人体比例", "TheDrawingSource/AnatomyMasterclass",
"""# 人体比例（角色绘制手艺）

> 来源：TheDrawingSource《Figure Drawing Proportions》/Anatomy Masterclass

## 头身比（以头为测量单位）
- 成人约7.5-8个头高；女性约7.5个头高；婴幼儿头相对更大(身体长高、头不怎么长)
- 肩宽：男约2-2.5个头，女约2个头
- 髋宽：男约1.5个头，女约2个头(可能宽于肩)

## 关键对位点
- 手臂自然下垂：肘部对齐肚脐/腰，腕部对齐裆部
- 腰线在从头顶往下约3个头(3/8处)

## 风格化原则
理想比例只是基准；艺术家会故意偏离来强化角色特征或风格(如Q版大头、英雄8.5头)。先懂标准再有依据地破。

## 迁移到九陆
苍霖16岁少年偏写实7.5-8头；龙的体型按阶段(幼龙/少龙/巨龙)定。比例先对，再按性格风格化。
""",
 [("成人约7.5-8头高(女7.5)，肩宽男2-2.5头/女2头；自然下垂时肘对腰、腕对裆——画人先用头作单位量这几个对位点。（来源:TheDrawingSource人体比例）","craft",0.86),
  ("理想比例只是基准，故意偏离才出风格(Q版大头/英雄8.5头)——但要先懂标准再有依据地破，不是瞎画。（来源:Anatomy Masterclass）","craft",0.85)]),

"expression": ("面部表情", "AnimeOutline/ClipStudio",
"""# 面部表情（情绪绘制手艺）

> 来源：AnimeOutline《12 Facial Expressions》/Clip Studio《Expressive Faces》

## 三大件做活表情
眉、眼、嘴承担最大情绪表达。画法：先定眉/眼/嘴，再加细节——抬降眉、改眼睑形、调嘴角。

## 六大基本情绪(普世)
- 喜：嘴角上扬、眼弯
- 悲：眉内端上提、嘴角下垂
- 惧：睁大眼、扬眉、嘴微张
- 怒：眉紧锁下压、嘴唇紧抿
- 惊：扬眉、瞪眼、嘴张开
- 厌：皱鼻、上唇上提

## 可读性铁律
动画里一张画只显示1/12~1/30秒，表情必须一眼可读，不能含糊。

## 迁移到九陆
苍霖EP02"也是"=苦笑(嘴角微扬但眉悲)；EP07恐惧=睁眼扬眉；情绪点用清晰的眉眼嘴组合，特写时尤其要可读。
""",
 [("眉/眼/嘴三大件承担最大情绪表达，画表情先定这三个再加细节(抬降眉/改眼睑/调嘴角)。（来源:AnimeOutline表情教程）","craft",0.87),
  ("六大普世情绪有固定特征组合：怒=眉锁下压+抿唇，惧=睁眼扬眉微张嘴，惊=扬眉瞪眼张嘴。表情必须一眼可读(一张画只显示1/12秒)。（来源:Clip Studio表情）","craft",0.87)]),

"env_layer": ("环境景深分层", "CreativeBloq/Evenant",
"""# 环境景深分层（场景美术手艺）

> 来源：CreativeBloq《Environment Art》/Evenant《Painting Environment Concepts》

## 三层结构造纵深
场景分前景/中景/背景三个平面，是组织环境元素、造空间纵深的基本骨架。概念图尤其要画足三层以交代世界设定。

## 控制明暗值 Value
- 值要尽量拉开层次：前景留最深的暗，主焦点用最亮
- 背景元素更少细节、更柔的颜色、更低对比，制造距离感(空气透视)

## 分离技巧
用对比/边缘清晰度/大气透视清楚区分三层。一个画面定一个"压过一切的注意元素"(靠形状/颜色/光)。

## 迁移到九陆
scene02矿坑：前景碎石(暗)+中景苍霖+背景竖井蓝光(亮焦点)。每张场景图先分三层、定一个最亮焦点、背景压对比。
""",
 [("环境分前景/中景/背景三层造纵深：前景留最深的暗、主焦点用最亮、背景少细节低对比柔色(空气透视)，用对比和边缘清晰度分离三层。（来源:Evenant环境概念）","craft",0.87),
  ("每个画面只定一个'压过一切的注意元素'(靠形状/颜色/光)——没有明确焦点观众视线就散。（来源:CreativeBloq环境艺术）","craft",0.86)]),

"costume": ("服装叙事", "Studiovity/Filmustage·Costume Design",
"""# 服装设计叙事（角色手艺）

> 来源：Studiovity《Costume Design Reveals Character》/Vaia/AMPAS

## 服装=开口前的角色名片
颜色/面料/合身度/破损度/重复，在角色说话前就快速传达身份、出身、处境。颜色常在台词之前先泄露情绪。

## 剪影渐变 Silhouette Progression
用轮廓变化追踪角色弧光：懦弱主角起始圆肩塌肩，获得权力后西装变挺括有力的方肩。靠宽度/高度的刻意变化让观众本能感到权力转移。

## 三阶段造型法
- 初始Look：角色舒适区与起始世界观
- 冲突Look：衣服破损/错搭/改变，映射内心挣扎
- 结局Look：最终进化的剪影，证明蜕变

## 迁移到九陆（直接命中）
苍霖三阶段服装正是这个：早期破烂麻布赤脚(初始/弱)→中期加旧毯子披风(冲突/挣扎)→后期龙翼披风有靴(结局/蜕变)。剪影从塌到挺，服装讲完整弧光。
""",
 [("服装是角色开口前的名片：颜色/面料/破损/合身在第一眼就传达身份与处境，颜色常先于台词泄露情绪。（来源:Studiovity服装设计）","craft",0.88),
  ("剪影渐变追踪弧光：弱角色起始圆肩塌肩、得权后变挺括方肩。三阶段造型=初始look/冲突look(破损错搭)/结局look(进化剪影)。苍霖早中后期服装正是此法。（来源:Studiovity/AMPAS服装叙事）","craft",0.89)]),

"microdrama": ("竖屏微短剧结构", "Vitrina/Real Reel/Filmustage·Micro Drama 2026",
"""# 竖屏微短剧结构（2026行业实战标准）

> 来源：Vitrina《Micro-Dramas Vertical-first》/Real Reel《Hooked by Ten》/Filmustage

## 格式
单集60-90秒，竖屏，一切(集结构/场景长度/对白节奏/视觉语法)服从一个目标：靠悬念把观众锁住。

## Beat Engine 四段结构
- Hook 钩子(0-15秒)：中国制作人叫"爆点"，有的把全季最电影感的一拍放进这15秒当自带预告
- Friction 摩擦(15-60秒)：张力必须可拍——靠真实的肢体或言语冲突，不是内心戏
- 0-5秒先用冲突/张力抓人，5-20秒introduce主角与设定，20-60秒堆情绪升张力

## 留存工程
平台按集间留存(基于悬念)算分。工程团队发现：定格钩子落在60秒集的第55-58秒时，留存出现尖峰。下一集前10秒解上集悬念、最后5秒再抛新钩子。

## 迁移到九陆
每集前3-5秒爆点(不解释设定)，冲突要可拍(打斗/对峙/台词)，第55-58秒定格留钩。情绪过山车要可视化为物理动作而非旁白。
""",
 [("微短剧Beat Engine：Hook(0-15秒爆点,可放全季最强一拍当预告)→Friction(15-60秒张力必须可拍=真实肢体/言语冲突不是内心戏)。前3-5秒就要用冲突抓人。（来源:Real Reel/Vitrina微短剧2026）","story",0.92),
  ("留存工程：定格钩子落在60秒集的第55-58秒时集间留存出尖峰；下一集前10秒解悬念、最后5秒抛新钩。悬念是留存的唯一杠杆。（来源:Real Reel留存研究）","story",0.91),
  ("单集60-90秒竖屏，一切(场景长度/对白节奏/视觉语法)都服从'把观众锁到下一集'这一个目标。（来源:Vitrina竖屏叙事）","story",0.90)]),

"diffusion_prompt": ("扩散模型提示词工程", "FlowHunt/Portkey·Stable Diffusion Prompting",
"""# 扩散模型提示词工程（通用，注意与Seedance差异）

> 来源：FlowHunt《Mastering Prompting in Stable Diffusion》/Portkey

## 通用提示词结构
[画幅frame][主体subject][风格style][修饰modifiers]，可选seed。四要素：主体(核心figure)、媒介(水彩/数字绘画)、风格(写实↔抽象)、分辨率(细节级别)。

## 描述性关键词
别只写"lion"，写"majestic lion with flowing golden mane, hyperrealistic, 8K"。具体descriptive关键词是质量地基。

## 加权与组合（⚠️SD专用语法）
SD用 ()加强、[]减弱来控制关键词焦点；组合反差词("robotic nature")激发创意。

## ⚠️ Seedance/即梦的关键差异（本项目必须遵守）
- Seedance 2.0 **不读负向提示词**，不支持()[]加权语法——SD那套在这里无效
- 强调靠：把重要词前置、完整复述、@图片锚定，而非括号加权
- 质量词用正向表述堆叠(干净/清晰/电影质感)，不是trending on artstation那种标签

## 迁移
通用结构(主体+风格+修饰+画质)适用；但加权/负向是SD专属，Seedance用正向约束+前置+@引用替代。
""",
 [("扩散提示词通用结构=[画幅][主体][风格][修饰]+可选seed；关键词要具体('金鬃雄狮,超写实,8K'而非'狮子')，具体descriptive词是质量地基。（来源:FlowHunt/Portkey SD提示词）","craft",0.85),
  ("⚠️关键差异：SD的()加强[]减弱加权语法和负向提示词，Seedance/即梦都不吃；本项目靠正向约束+重要词前置+完整复述+@图片锚定来替代加权。（来源:FlowHunt SD提示词,对比本项目Seedance规则）","craft",0.9)]),
}

ASSIGN = {
    "comic-character-designer": ["anatomy", "expression", "costume"],
    "comic-character-artist":   ["anatomy", "expression", "costume"],
    "comic-keyframe-artist":    ["expression", "env_layer"],
    "comic-scene-designer":     ["env_layer"],
    "comic-scene-artist":       ["env_layer"],
    "comic-screenwriter":       ["microdrama"],
    "comic-director":           ["microdrama"],
    "comic-storyboard":         ["microdrama"],
    "comic-prompt-engineer":    ["diffusion_prompt", "microdrama"],
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
        for j, (content, cat, imp) in enumerate(mems, 1):
            n += 1
            sems.append({"memoryId": f"{SESS}_{emp}_{tk}_{j:02d}", "employeeKey": emp,
                "content": content, "category": cat, "importance": imp,
                "sourceSession": SESS, "accessCount": 0, "createdAt": NOW,
                "lastAccessed": None, "updatedAt": NOW})
    sems.sort(key=lambda m: m["importance"], reverse=True)
    write(sp, sems); mem_total += n

    kd = KN_ROOT / emp; ip = kd / "index.json"; idx = load(ip); da = 0
    for tk in topics:
        name, src, body, _ = CRAFT[tk]
        fname = f"craft2-{tk}.md"
        for e in [e for e in idx if e.get("fileName") == fname]:
            op = kd / f"{e['docId']}{e.get('extension','.md')}"
            if op.exists(): op.unlink()
        idx = [e for e in idx if e.get("fileName") != fname]
        did = hashlib.sha1(f"{emp}/{fname}/craft2".encode()).hexdigest()[:16]
        b = body.encode("utf-8"); kd.mkdir(parents=True, exist_ok=True)
        (kd / f"{did}.md").write_bytes(b)
        idx.append({"docId": did, "fileName": fname, "extension": ".md",
            "sizeBytes": len(b), "uploadedAt": NOW, "tags": ["手艺正典", src, name]})
        da += 1
    write(ip, idx); doc_total += da
    print(f"OK {emp:26s} | 记忆+{n:2d} 文档+{da} | {','.join(topics)}")

print(f"\n第三轮：手艺记忆={mem_total} 文档={doc_total}，专攻薄工种+实战短剧")
