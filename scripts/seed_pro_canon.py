"""
把从维基百科抓取的'职业正典'权威知识，写进每个员工的知识库(md)+长期记忆。
内容来源真实外部权威源(WebFetch 抓取)，每条记忆带「来源:维基百科·<条目>」可追溯，
解决'凭什么对'——不是我的个人断言，是有外部出处的学科标准。

幂等：
- 记忆 sourceSession=pro_canon_wiki_20260630，先清旧再写
- 知识库按 fileName 去重重写
"""
import json, os, sys, hashlib
from datetime import datetime, timezone
from pathlib import Path

os.environ["PYTHONUTF8"] = "1"
sys.stdout.reconfigure(encoding="utf-8")

MEM_ROOT = Path("D:/P/agent/data/memory")
KN_ROOT = Path("D:/P/agent/data/knowledge")
SESS = "pro_canon_wiki_20260630"
NOW = datetime.now(timezone.utc).isoformat()

# ══════════════════════════════════════════════════════════════
# 正典内容（WebFetch 从维基百科抓取的真实权威内容）
# 每个: (条目名, 源URL, 知识库正文md, [蒸馏记忆...])
# ══════════════════════════════════════════════════════════════

CANON = {
"montage": ("蒙太奇", "https://zh.wikipedia.org/wiki/蒙太奇",
"""# 蒙太奇 Montage（影视剪辑/镜头语言）

> 来源：维基百科·蒙太奇 https://zh.wikipedia.org/wiki/蒙太奇

## 定义
源自法语建筑术语"构成、装配"。是电影剪辑技术，电影创作的主要叙述与表现手段，通过组合不同地点/距离/角度的镜头，创造电影的时空自由度。

## 核心特性
- 突破长镜头局限
- 产生演员与摄影机动作之外的"第三种动作"
- 影响影片节奏与叙事
- 创造与现实不同的电影时间和空间

## 分镜师必握原则
- 库里肖夫效应：镜头并列产生心理影响（A镜+B镜=观众脑补出第三层含义）
- 创造性地理：通过剪辑创造虚拟空间关联
- 交叉剪辑：呈现同步发生的多线索情节
- 光学特效：褪色、溶解、分割画面、多重曝光

## 类型
新闻汇辑蒙太奇、铁路蒙太奇（引擎/车轮/飞驰）、音响蒙太奇
""",
 ["蒙太奇通过组合不同地点/角度/距离的镜头产生'第三种动作'——并列本身就生成新含义（库里肖夫效应），分镜的意义不在单镜而在镜与镜的关系。（来源:维基百科·蒙太奇）",
  "交叉剪辑用于呈现同步发生的多线索情节；创造性地理用剪辑拼出现实中不存在的空间关联。（来源:维基百科·蒙太奇）",
  "镜头并列直接决定影片节奏与叙事时空，剪辑是创造电影时间/空间的主要手段而非记录。（来源:维基百科·蒙太奇）"]),

"composition": ("構圖", "https://zh.wikipedia.org/wiki/構圖",
"""# 构图 Composition（视觉艺术）

> 来源：维基百科·構圖 https://zh.wikipedia.org/wiki/構圖

## 定义
通过巧妙安排画面元素，将平凡变得突出，强化主题。

## 主要法则
- 三分法：画面分九等份，重要元素置于分割线交点（最基础原则）
- 对比与分层：主体/客体、前景/背景分离，创造视觉层次
- 线条运用：三角轴或斜线排列协调物体，引导观者视线流动
- 光影组合：把光与影变成有情感的组合，增强表现力
- 透视变化：用不同透视点安排物体形成风格

## 原则
好构图强化主题，不当构图削弱视觉效果；构图本质是"安排与组合的经验手法"。
""",
 ["构图三分法：画面分九等份，主体放在分割线交点而非正中，是最基础的构图原则。（来源:维基百科·構圖）",
  "构图靠主体/客体、前景/背景的对比分层制造视觉层次，再用三角轴或斜线引导视线流动。（来源:维基百科·構圖）",
  "光与影本身是构图元素——要组织成'有情感的光影组合'来强化主题，不是平均打亮。（来源:维基百科·構圖）"]),

"color": ("色彩理論", "https://zh.wikipedia.org/wiki/色彩理論",
"""# 色彩理论 Color Theory

> 来源：维基百科·色彩理論 https://zh.wikipedia.org/wiki/色彩理論

## 色彩三属性
- 色相 Hue：色轮上的颜色身份（红/蓝/绿…）
- 明度 Value：颜色的明暗
- 饱和度 Saturation：颜色的纯度/强度

## 色轮与关系
原色→二次色→三次色。
- 互补色：色轮上相对，最大对比
- 类似色：色轮上相邻，自然和谐

## 冷暖与情绪
暖色（红橙黄）/冷色（蓝绿紫），各自引发不同心理与情绪联想。

## 和谐原理
色彩调和原理指导配色的视觉平衡与美感。
""",
 ["色彩三属性=色相/明度/饱和度；改一个不动其它，是控制画面的基本维度。（来源:维基百科·色彩理論）",
  "互补色（色轮相对）制造最大对比张力，类似色（色轮相邻）自然和谐——冲突场景用互补，统一氛围用类似。（来源:维基百科·色彩理論）",
  "暖色/冷色各自触发不同心理联想，配色是情绪工具不只是好看。（来源:维基百科·色彩理論）"]),

"perspective": ("透視", "https://zh.wikipedia.org/wiki/透視",
"""# 透视 Perspective（绘画透视法）

> 来源：维基百科·透視 https://zh.wikipedia.org/wiki/透視

## 类型
- 线性透视（一点透视）：与画面平行的线保持平行，不平行的线向灭点消失
- 散点透视：中国画传统，单画面多焦点，可绘极长卷轴

## 灭点系统
- 焦点：观看者主视点，与画面垂直的线向其消失
- 天点/地点：与地面不平行的线向其集中
- 余点：与画面不垂直但平行地面的线向其消失
- 视平线：平视时焦点与余点在地平线上；仰视焦点近天点；俯视焦点近地点

## 大气/空气透视
近处色彩鲜明，越远越失原色；隐没透视="远山无皴，远水无波，远树无枝，远人无目"。
""",
 ["透视灭点决定空间纵深：一点透视所有纵深线汇于焦点；视平线高低=仰视/俯视，直接定观众视角。（来源:维基百科·透視）",
  "大气/空气透视：近处色彩鲜明、越远越失原色越淡，是表现景深的关键手段（远山无皴远水无波）。（来源:维基百科·透視）"]),

"concept_art": ("概念藝術", "https://zh.wikipedia.org/wiki/概念藝術",
"""# 概念艺术 Concept Art

> 来源：维基百科·概念藝術 https://zh.wikipedia.org/wiki/概念藝術

## 定义
以插画形式表达想法的设计方式，用于电影/游戏/动画/漫画制作。

## 流程位置
概念设计在3D建模阶段之前，为后续制作提供参考与灵感。迪士尼1930年动画最早有记录使用。

## 工具
传统：油彩、丙烯、麦克笔、铅笔；现代：数码图像软件提效。

## 关联环节
分镜、接景（matte painting）。主要用于科幻/奇幻主题的视觉开发。
""",
 ["概念艺术=用插画把想法视觉化，位于3D/正式制作之前，作用是给后续所有环节提供统一的视觉参考与灵感。（来源:维基百科·概念藝術）",
  "概念设计直接关联分镜与接景，是视觉开发(visual development)的源头，先定调再量产。（来源:维基百科·概念藝術）"]),

"vfx": ("視覺效果", "https://zh.wikipedia.org/wiki/視覺效果",
"""# 视觉效果 VFX

> 来源：维基百科·視覺效果 https://zh.wikipedia.org/wiki/視覺效果

## 定义
在实拍画面之外创建或操纵图像，用数字合成与CGI实现危险/昂贵/不可能的画面。

## 流程三阶段
- 前期：设计与规划
- 制作：现场考量（拍摄时为特效预留）
- 后期：主要执行（软件）

## 主要类别
接景与背景、数字效果、合成（分层混合视觉元素）。

## 关键技术
运动追踪、抠像（chroma key）、3D动画、粒子特效、物理引擎。
""",
 ["VFX的核心是合成——把实拍/CGI/接景分层混合；后期是主战场但前期就要设计、现场要为特效预留。（来源:维基百科·視覺效果）",
  "关键技术栈：运动追踪、抠像、粒子特效、物理引擎；特效服务于'创建实拍做不到的画面'。（来源:维基百科·視覺效果）"]),

"qa": ("軟體測試", "https://zh.wikipedia.org/wiki/軟體測試",
"""# 质量保证 QA / 软件测试（可迁移到内容质检）

> 来源：维基百科·軟體測試 https://zh.wikipedia.org/wiki/軟體測試

## QA vs QC
QA 关注流程与系统设计（防错），QC 针对具体产品缺陷检测（挑错）。互补但职能不同。

## 验收标准
功能完整性、性能指标达成、真实环境可用。

## 方法
- 黑盒测试：有效输入+无效输入，依规格设计用例
- 覆盖率：行覆盖/路径覆盖追踪完整度
- 回归测试：检测改动引入的新错误，维护基线对比

## 可迁移内容质检通用原则
1. 分层验证：单元→整体（微观镜头→宏观成片）
2. 环境一致性：测试需贴近真实生产场景
3. 覆盖率量化：所有功能/镜头都被检查到
4. 缺陷可追溯：发现→验证→修复全周期记录
""",
 ["QA管流程防错、QC挑产品缺陷，二者不同：质检既要按清单挑错(QC)，也要反推流程哪一步该补防错(QA)。（来源:维基百科·軟體測試）",
  "黑盒测试要同时喂有效输入和无效输入；质检要量化覆盖率，确保每个镜头/字段都被检查到不漏项。（来源:维基百科·軟體測試）",
  "回归原则：任何改动都可能引入新错，需维护改前/改后基线对比，缺陷要全周期可追溯（发现→验证→修复）。（来源:维基百科·軟體測試）"]),

"production": ("電影製作", "https://zh.wikipedia.org/wiki/電影製作",
"""# 电影制作流程 Filmmaking

> 来源：维基百科·電影製作 https://zh.wikipedia.org/wiki/電影製作

## 三大阶段
- 前期：设计视觉呈现、分镜表、预算估算、招募主创团队
- 制作：执行拍摄、导演指导表演与创意、副导协调现场后勤
- 后期：整合所有要素、剪辑影像与音效、视觉特效与配乐

## 导演协作工种
摄影指导(DOP，视觉美学)、美术指导(场景与视觉风格)、音效导演(声音设计)、副导演(时程与现场)。

## 制片管理
制片经理监控预算执行与制作进度并向上汇报。
""",
 ["电影制作三阶段：前期(分镜+预算+主创)→制作(拍摄+导演指导)→后期(剪辑+音效+特效+配乐)，每阶段任务边界清晰。（来源:维基百科·電影製作）",
  "导演不是单干，是协调摄影指导/美术指导/音效/副导的中枢；总导演的核心能力是工种协作与质量把关。（来源:维基百科·電影製作）"]),
}

# ══════════════════════════════════════════════════════════════
# 工种 → 正典分发
# ══════════════════════════════════════════════════════════════

ASSIGN = {
    "comic-director":          ["production", "montage"],
    "comic-storyboard":        ["montage", "composition"],
    "comic-trajectory-artist": ["montage"],
    "comic-keyframe-artist":   ["composition", "montage"],
    "comic-scene-designer":    ["composition", "perspective", "color", "concept_art"],
    "comic-scene-artist":      ["composition", "perspective", "color"],
    "comic-character-designer":["concept_art", "color"],
    "comic-character-artist":  ["concept_art", "color"],
    "comic-vfx-designer":      ["vfx", "color"],
    "comic-qa-inspector":      ["qa"],
    "comic-prompt-engineer":   ["composition", "color", "montage"],
    # comic-screenwriter 已有真实抓取的好莱坞三幕剧权威源，不重复
}

# ── 写入记忆 ───────────────────────────────────────────────

def load(fp):
    if fp.exists():
        try: return json.loads(fp.read_text("utf-8"))
        except Exception: return []
    return []

def write(fp, data):
    fp.parent.mkdir(parents=True, exist_ok=True)
    fp.write_text(json.dumps(data, ensure_ascii=False, indent=2), "utf-8")

mem_total = 0; doc_total = 0
for emp, topics in ASSIGN.items():
    # ── 语义记忆 ──
    sp = MEM_ROOT / emp / "semantic.json"
    sems = [x for x in load(sp) if x.get("sourceSession") != SESS]
    n = 0
    for tk in topics:
        _, url, _, mems = CANON[tk]
        for j, content in enumerate(mems, 1):
            n += 1
            sems.append({
                "memoryId": f"{SESS}_{emp}_{tk}_{j:02d}",
                "employeeKey": emp, "content": content,
                "category": "knowledge", "importance": 0.85,
                "sourceSession": SESS, "accessCount": 0,
                "createdAt": NOW, "lastAccessed": None, "updatedAt": NOW,
            })
    sems.sort(key=lambda m: m["importance"], reverse=True)
    write(sp, sems)
    mem_total += n

    # ── 知识库文档（每个正典一篇）──
    kd = KN_ROOT / emp
    ip = kd / "index.json"
    idx = load(ip)
    docs_added = 0
    for tk in topics:
        name, url, body, _ = CANON[tk]
        fname = f"canon-{tk}.md"
        # 去重旧
        for e in [e for e in idx if e.get("fileName") == fname]:
            op = kd / f"{e['docId']}{e.get('extension','.md')}"
            if op.exists(): op.unlink()
        idx = [e for e in idx if e.get("fileName") != fname]
        did = hashlib.sha1(f"{emp}/{fname}/canon".encode()).hexdigest()[:16]
        b = body.encode("utf-8")
        kd.mkdir(parents=True, exist_ok=True)
        (kd / f"{did}.md").write_bytes(b)
        idx.append({"docId": did, "fileName": fname, "extension": ".md",
                    "sizeBytes": len(b), "uploadedAt": NOW,
                    "tags": ["职业正典", "维基百科", name]})
        docs_added += 1
    write(ip, idx)
    doc_total += docs_added

    print(f"OK {emp:26s} | 正典记忆+{n:2d} 知识文档+{docs_added} | 正典:{','.join(topics)}")

print(f"\n共写入 权威记忆={mem_total} 知识文档={doc_total}，全部带维基百科出处")
