"""把五季旧式概述分镜升级为可独立生成、可检查连续性的详细分镜。"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PRODUCTION_ROOT = ROOT / "data" / "production"
SHOT_START_RE = re.compile(r"(?=^镜头\d+\s*｜)", re.MULTILINE)
SHOT_HEADER_RE = re.compile(
    r"^镜头(?P<number>\d+)\s*｜(?P<start>\d{2}:\d{2})-(?P<end>\d{2}:\d{2})｜(?P<duration>\d+)s$"
)


def _line(block: str, label: str) -> str:
    """读取旧分镜块中的单行字段；字段不存在返回空。"""
    match = re.search(rf"^{re.escape(label)}：(.*)$", block, re.MULTILINE)
    return match.group(1).strip() if match else ""


def _clean_dialogue(dialogue: str) -> str:
    """清理脚本表格中的包裹符号和句末标点，避免拼装后出现重复句号。"""
    cleaned = dialogue.strip().strip("「」『』\"'")
    return cleaned.rstrip("。！？!?；; ")


def _subject(action: str, staging: str) -> str:
    """从动作与旧调度中选择当前镜头最明确的可见主体。"""
    text = f"{action}|{staging}"
    people = ("苍霖", "艾拉", "锦洛", "青鸾", "沧澜", "老矿工", "执行官", "曜", "凛", "少年")
    for name in people:
        if name in text:
            return name
    if any(word in text for word in ("众人", "来客", "守炉人", "法师团", "龙血族", "义体客", "团队")):
        return "来客群体"
    subjects = (
        "巨龙", "幼龙", "舰队", "主舰", "浪墙", "海水", "虫墙", "虫群", "蚀虫", "龙",
        "世界树", "光丝", "碎片", "火箭炮塔", "扫描光网", "光路", "时钟", "众人", "少年",
    )
    for name in subjects:
        if name in text:
            return name
    if action.startswith("他") or any(word in action for word in ("左眼", "嘴角", "手指", "掌心", "披风", "眉头")):
        return "苍霖"
    if action.startswith("她"):
        return "当前出镜女性角色"
    if action.startswith("它"):
        return "当前动作所指的装置或生物"
    if action.startswith("回放"):
        return "回放画面"
    if action.startswith("闪回"):
        return "闪回画面"
    if action.startswith("镜头"):
        return "镜头运动所揭示的场景主体"
    clause = re.split(r"[·，,:：；;（(]", action, maxsplit=1)[0].strip()
    verbs = (
        "缓缓", "开始", "突然", "骤然", "正在", "被", "向", "从", "在", "亮起", "熄灭", "崩碎",
        "崩塌", "裂开", "打开", "升起", "落下", "冲出", "飞向", "掠过", "吞没", "覆盖", "显现",
        "出现", "退去", "停下", "转身", "转向", "抬起", "伸出", "铺展", "交织", "逼近", "锁定", "轰下",
    )
    cut = min((clause.find(verb) for verb in verbs if clause.find(verb) >= 2), default=len(clause))
    inferred = clause[:cut].strip("的地 ")
    if len(inferred) >= 2:
        return inferred[:24]
    return f"“{action[:20]}”中的核心可见对象"


def _screen_direction(staging: str, action: str, previous_direction: str) -> str:
    """提取屏幕运动/面向方向，并在无显式方向时维持上一镜轴线。"""
    match = re.search(r"画面(左→右|右→左|上方?→下方?|下方?→上方?)", staging)
    if match:
        return match.group(1)
    side = re.search(r"面向(左侧|右侧|镜头|前方)", staging)
    if side:
        return f"面向{side.group(1)}，位移方向不变"
    if "俯冲" in action or "坠" in action or "砸下" in action:
        return "上→下"
    if any(word in action for word in ("升起", "冲天", "抬起", "昂首")):
        return "下→上"
    return previous_direction or "保持本 G 已建立轴线，主体不跨轴"


def _position(shot_size: str, staging: str, direction: str) -> str:
    """给出竖屏中的主体占位，避免只写“同框/大场面”。"""
    if "左→右" in direction:
        return "起始位于左侧三分线，向右侧三分线移动，前方保留运动空间"
    if "右→左" in direction:
        return "起始位于右侧三分线，向左侧三分线移动，前方保留运动空间"
    if "上→下" in direction:
        return "主体从画面上1/3进入，落点锁在下1/3，垂直动线贯穿中央安全区"
    if "下→上" in direction:
        return "主体从下1/3起势，终点进入上1/3，中心轴保留完整上升动线"
    if any(word in shot_size for word in ("特写", "近景")):
        return "关键五官或手部落在上方三分交点，动作方向一侧保留约1/4画幅"
    if any(word in shot_size for word in ("极大远景", "大远景", "远景", "广")):
        return "主体落在中下三分区，环境尺度占画幅约2/3，地平线避开画面正中"
    if "居中" in staging:
        return "主体锁定竖屏中心轴，头顶与脚下均保留环境关系"
    return "主体落在竖屏三分交点，头顶、视线和动作方向保留安全空间"


def _layers(action: str, visual: str, shot_size: str) -> tuple[str, str, str]:
    """把旧画面说明重组为明确的前景、中景、背景三层。"""
    filler_words = (
        "神情落在", "环境主导", "自行演进", "大场面容进广角", "全身入画", "动作与场地关系清晰",
        "局部细节占满画幅", "材质与光的质感层次", "画幅中段取景", "环境细节层次清楚",
        "主体与周遭同框", "主体极小", "环境铺满画幅", "脸/手/物细节占满画幅",
        "伏笔", "回收", "题眼", "哲学", "定调", "价值排序", "历史一帧", "格局定妆",
        "系统的忏悔", "关系一句点破", "新战争形态", "角色再就业",
        "膝上取景", "肢体互动清楚", "直视目标", "口型清晰", "瞳孔", "肌肉", "下颌", "眉眼", "眼底",
    )
    parts = [
        part.strip() for part in visual.split("|")
        if part.strip() and not any(word in part for word in filler_words)
    ]
    foreground = next((p.removeprefix("前景") for p in parts if p.startswith("前景")), "")
    middle = next((p.removeprefix("中景") for p in parts if p.startswith("中景")), "")
    background = next((p.removeprefix("背景") for p in parts if p.startswith("背景")), "")
    if any(word in foreground for word in ("中景主体", "背景大场面", "三层")):
        foreground = ""
    if not middle:
        middle = parts[0] if parts else action
    if not background:
        background = next((p for p in reversed(parts[1:]) if "构图" not in p and "画幅" not in p), "")
    abstract_background_words = (
        "第一天", "开始烧", "第一次", "绝对秩序", "活物的体温", "命题", "选择", "答案", "代价",
        "希望", "真相", "身份", "证明", "意义", "尊严", "命运", "意志", "关系", "哲学", "题眼",
        "伏笔", "回收", "定调", "遇上", "一句点破", "系统的忏悔",
    )
    if background:
        concrete_segments = [
            segment.strip() for segment in background.split("·")
            if segment.strip() and not any(word in segment for word in abstract_background_words)
        ]
        background = "·".join(concrete_segments)
    if any(word in background for word in (
        "嘴角", "眼神", "神情", "情绪", "态度", "关系", "定格", "伏笔", "题眼", "哲学",
    )):
        background = ""
    if not foreground:
        if any(word in shot_size for word in ("特写", "近景")):
            foreground = "主体局部进入焦平面，画框边缘保持干净，不添加装饰性粒子"
        else:
            foreground = "用场景最近地标建立尺度，面积不超过画面下方1/4，不遮挡主体动线"
    if not background:
        background = "延续上一镜永久地标与光源方向，降低纹理密度以分离主体"
    return foreground.strip("·： "), middle.strip("·： "), background.strip("·： ")


def _purpose(action: str, next_action: str) -> str:
    """根据可见动作推导镜头承担的叙事任务。"""
    if any(word in action for word in ("嘴", "台词", "宣告", "吐", "说")):
        return "完成台词信息落点，同时用口型前后的停顿固定角色态度"
    if any(word in action for word in ("眼", "目光", "眉", "神色", "表情")):
        return "让观众看清情绪发生的可见变化，并为下一动作建立动机"
    if any(word in action for word in ("出现", "铺展", "俯瞰", "全貌", "远方", "天际")):
        return "建立空间、尺度与威胁方向，保证下一镜能沿同一轴线进入"
    if any(word in action for word in ("反转", "亮起", "熄灭", "扫描", "锁定", "裂", "碎")):
        return "呈现信息或状态的明确变化点，让变化结果成为下一镜起因"
    if any(word in action for word in ("冲", "飞", "扑", "落", "砸", "涌", "卷", "抬", "伸")):
        return "完整交代动作的起势、运动路径与落点，保持屏幕方向连续"
    return f"把“{action[:36]}”落实成单一可见事件，并把结束状态交给下一镜“{next_action[:24] or '后续动作'}”"


def _body_beats(action: str, subject: str, duration: int) -> tuple[str, str, str, str]:
    """按动作类型生成起始、启动、发展、结束四个可见状态。"""
    has_dialogue = any(word in action for word in ("嘴角", "吐两字", "台词", "宣告", "说", "轻语"))
    has_hand_action = any(word in action for word in (
        "手指", "抬手", "伸手", "触碰", "碰触", "接触", "掌心", "握", "敲", "叩", "手腕", "手掌",
    ))
    if has_dialogue and any(word in subject for word in ("女声", "广播", "神言", "系统语音", "机械音")):
        return (
            f"{subject}尚未播报，承载声音的全息界面或扬声器指示灯保持基准亮度",
            "提示灯先亮一次，界面声纹随后出现；声音从场景内固定方位进入，不生成无来源人物口型",
            f"声纹按句子节奏起伏并完成“{action}”，背景装置只保留一次同步亮度脉冲",
            "最后一字结束后声纹归零，提示灯回到稳定亮度，界面文字或符号停留供下一镜读取",
        )
    if has_dialogue and has_hand_action:
        return (
            f"{subject}嘴唇闭合，肩部稳定，手腕与指尖停在目标物旁但尚未接触",
            "指尖先接触目标并开始移动，随后吸气开口；手部启动早于第一字，避免嘴和手同时机械启动",
            f"说话过程中指尖沿目标表面完成一次连续动作，落实“{action}”；头部、肩线与道具位置保持稳定",
            "最后一字落下时指尖同时停在明确落点，嘴唇闭合，手与目标的接触关系保留约0.2秒",
        )
    if has_dialogue:
        return (
            f"{subject}下颌放松、嘴唇闭合，目光先锁住对手或目标",
            "吸气后下唇先动，嘴角产生不对称变化；头部与肩线保持稳定",
            f"按原台词完成一次连续口型，句中不切换表情；可见事件为“{action}”",
            "台词结束后嘴唇重新闭合，目光保持原方向并留出约0.2秒静止尾帧",
        )
    if any(word in action for word in ("眼", "目光", "眉", "神色", "凝视", "打量")):
        return (
            f"{subject}头部角度固定，眼睑和眉线处于变化前状态",
            "眼睑先发生小幅变化，随后瞳孔移动到目标方向，避免整头同步转动",
            f"眉线、眼睑、瞳孔依次完成“{action}”，变化幅度控制在面部可读范围",
            "视线锁定目标，眉线停在新位置，末帧保持面部清楚且无二次动作",
        )
    if has_hand_action:
        return (
            f"{subject}肩部不动，肘腕和手指停在动作起点，目标物保持清楚",
            "动作从肩到肘、再到腕和指尖依次传递，手指关节保持自然弯曲",
            f"指尖与目标发生一次明确接触或停顿，完成“{action}”；接触处只保留局部光影反馈",
            "手停在动作落点，指节、掌心与道具关系清楚，末帧可直接承接下一镜",
        )
    if subject in ("苍霖", "艾拉", "锦洛", "青鸾", "沧澜", "老矿工", "曜", "凛", "少年") and any(
        word in action for word in ("半躺", "闭目", "坐", "站", "蹲", "靠", "趴")
    ):
        return (
            f"{subject}骨盆与支撑面稳定接触，脊柱、肩线和四肢保持动作前姿态",
            "先用呼吸带动胸腔和衣料产生小幅变化，头部不漂移，支撑点不滑动",
            f"在原支撑关系内完成“{action}”，只让眼睑、手指或衣摆出现一次可读微动作",
            "身体重心与支撑点保持不变，四肢轮廓清楚，末帧锁定该姿态供特写承接",
        )
    if subject in ("巨龙", "幼龙", "龙") and any(word in action for word in ("爪", "走", "踏", "落街")):
        return (
            f"{subject}重心由其余三肢承担，目标爪悬在落点上方，趾爪自然收拢",
            "肩胛先下沉，肘腕依次降低，爪尖最后接近地面，躯干不整体滑移",
            f"爪垫先接触、趾爪后放松，完成“{action}”，接触面只产生一次轻微压痕或反光",
            "四肢重新均匀承重，目标爪完整落稳，尾部和头部保持平衡姿态",
        )
    is_group = subject == "来客群体" or any(word in action for word in ("人群", "来客", "众人", "队伍"))
    if is_group and any(word in action for word in ("走", "跑", "冲", "进入", "涌入", "脚步", "前进", "撤离")):
        return (
            "前排人物停在入口或街道起点，后排沿同一透视线错位站立，人物之间保留可读间距",
            "领头者先迈出一步，第二排晚半拍跟进；队列沿既定屏幕方向进入，不横向穿插",
            f"前后排按同一节奏完成“{action}”，每个人只保留走路、观察或停步中的一种主动作",
            "领头者停在中景落点，后排依次收步并保留入口或来路，群体轮廓不互相粘连",
        )
    if is_group:
        return (
            "前排与后排人物按透视线错位站立，每个人的头肩轮廓分开，群体先保持动作前状态",
            "最接近事件中心的人先产生反应，其余人物按由近到远的顺序晚半拍响应",
            f"群体共同完成“{action}”，前排负责主要动作，后排只保留转头、停步或防御姿态",
            "全体停在同一个结果状态，仍能分辨前后排、领头者和事件中心，不形成肢体粘连",
        )
    if "骑龙" in action or "一人一龙" in action:
        return (
            f"{subject}与巨龙保持骑乘锁定：腿部夹住龙背，躯干顺飞行方向前倾，龙翼位于拍翼起点",
            "巨龙翼根启动并改变航向，骑乘者骨盆跟随龙背，肩线与视线晚半拍转向",
            f"一人一龙沿同一动线完成“{action}”，披风、发梢和尾部只做一次滞后响应",
            "巨龙稳定在构图落点，骑乘者重心回正、视线锁定前方，末帧不继续出画",
        )
    if subject in ("巨龙", "幼龙", "龙") or any(word in action for word in ("俯冲", "腾空", "翼振", "悬停")):
        return (
            f"{subject}躯干与飞行方向对齐，双翼处于当前拍翼周期的展开或收拢起点",
            "胸腔先压低，翼根带动翼膜改变角度，尾部反向微摆修正航向",
            f"沿既定屏幕方向完成“{action}”，主体尺度连续变化，骑乘者重心随龙背同步",
            "翼膜和尾部回到可稳定承接的姿态，主体停在构图落点，不在尾帧继续出画",
        )
    if any(word in action for word in ("浪", "海水", "涌", "光丝", "光路", "火", "数据", "虫", "墙", "舰队")):
        return (
            f"{subject}边界、亮度或队形处于变化前基准状态，画面先保留一拍供观众识别",
            "变化从一个明确起点开始，沿单一方向扩散；前缘与未变化区域保持清晰分界",
            f"扩散前缘完成“{action}”，只让邻近地标产生一次可见响应，避免全画面同时躁动",
            "变化停在清楚的新边界或队形，亮度和位置稳定，末帧呈现结果而非过程模糊",
        )
    if any(word in action for word in ("走", "跑", "冲", "扑", "倒", "站", "坐", "蹲", "转", "抬")):
        return (
            f"{subject}重心落在支撑脚或支撑点，四肢处于动作前姿态",
            "先移动重心，再由髋、肩和四肢依次启动，避免身体整体平移",
            f"沿既定动线完成“{action}”，衣摆与头发只做一次滞后响应",
            "重心落到新的支撑点，四肢停在可识别轮廓，末帧不追加第二动作",
        )
    return (
        f"{subject}处于“{action}”发生前的稳定状态，主体轮廓和目标物均可辨认",
        "先改变一个最关键的可见部位或环境边界，其余元素保持稳定",
        f"完成单一事件“{action}”，只保留与该事件直接相关的环境反馈",
        "动作结果停稳，主体位置、朝向和关键道具状态锁定供下一镜承接",
    )


def _correct_shot_size(shot_size: str, action: str) -> tuple[str, str]:
    """修正无法看清关键动作的景别，并返回修正说明。"""
    original = shot_size
    angle = shot_size.split("/", 1)[1].strip() if "/" in shot_size else "正面平视"
    if any(word in action for word in ("左眼", "右眼", "瞳孔", "眼睑")):
        corrected = f"极近特写 / {angle}"
    elif any(word in action for word in ("半张脸", "嘴角", "轻声", "台词", "眉头", "神色")):
        corrected = f"近景 / {angle}"
    elif any(word in action for word in ("手指", "掌心", "刻字", "碎片")) and any(
        word in shot_size for word in ("广", "远景", "全景")
    ):
        corrected = f"特写 / {angle}"
    else:
        corrected = original
    note = f"由原景别“{original}”修正，以保证关键动作可读" if corrected != original else "沿用原景别"
    return corrected, note


def _correct_lighting(action: str, lighting: str) -> str:
    """修正冷蓝主体却被标成暖色主光等明显色温冲突。"""
    if "冷蓝" in action and "暖冷" in lighting:
        return f"{lighting}·冷蓝高色温为主光，暖赤低色温仅作环境辅光"
    if "冷蓝" in action and "暖色低色温" in lighting and "暖" not in action:
        return lighting.replace("暖色低色温", "冷色高色温")
    return lighting


def _script_shot_overrides(content: str) -> dict[str, dict[str, str]]:
    """从同 G 剧本表提取比旧分镜更可靠的动作、台词与情绪。"""
    overrides: dict[str, dict[str, str]] = {}
    for line in content.splitlines():
        if not re.match(r"^\|\s*\d{2}:\d{2}-\d{2}:\d{2}\s*\|", line):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 8:
            continue
        overrides[cells[0]] = {
            "action": cells[2], "dialogue": cells[3], "emotion": cells[4],
            "camera": cells[5], "audio": cells[6], "lighting": cells[7],
        }
    return overrides


def _time_points(duration: int) -> tuple[str, str, str, str]:
    """按镜头时长生成四个相对时刻标签。"""
    first = max(0.2, duration * 0.30)
    second = max(first + 0.2, duration * 0.70)
    return "0.0s", f"{first:.1f}s", f"{second:.1f}s", f"{duration:.1f}s"


def _parse_shots(content: str) -> tuple[str, list[dict]]:
    """解析一张 G 分镜卡，返回头部与逐镜结构。"""
    match = re.search(r"^镜头\d+\s*｜", content, re.MULTILINE)
    if not match:
        return content, []
    header = content[:match.start()].strip()
    shots: list[dict] = []
    for block in SHOT_START_RE.split(content[match.start():]):
        block = block.strip()
        if not block:
            continue
        first_line = block.splitlines()[0].strip()
        parsed = SHOT_HEADER_RE.match(first_line)
        if not parsed:
            continue
        audio_transition = _line(block, "音效")
        if "｜转场：" in audio_transition:
            audio, transition = audio_transition.split("｜转场：", 1)
        else:
            audio, transition = audio_transition, ""
        shots.append({
            **parsed.groupdict(),
            "shot_size": _line(block, "景别·机位"),
            "visual": _line(block, "画面"),
            "staging": _line(block, "调度"),
            "camera": _line(block, "运镜"),
            "lighting": _line(block, "光影"),
            "audio": audio.strip(),
            "transition": transition.strip(),
        })
    return header, shots


def rewrite_storyboard_content(
    content: str, action_overrides: dict[str, dict[str, str]] | None = None
) -> tuple[str, int]:
    """把单张旧分镜正文改写为 V2 详细执行格式。"""
    header, shots = _parse_shots(content)
    if not shots:
        return content, 0
    first_header = header.splitlines()[0] if header else "G 分镜"
    unit_match = re.match(r"(G\d+\s+.*?)\s*\|\s*生成(\d+)s", first_header)
    unit_name = unit_match.group(1) if unit_match else first_header.split("|")[0].strip()
    unit_duration = int(unit_match.group(2)) if unit_match else sum(int(s["duration"]) for s in shots)
    asset_line = next((line for line in header.splitlines() if line.startswith("首帧：")), "首帧：按本 G 资产命名")
    durations = "+".join(f"{shot['duration']}s" for shot in shots)
    out = [
        f"{unit_name} | 成片时长{unit_duration}s | {len(shots)}个剪辑镜头",
        f"生成策略：拆为{len(shots)}条独立子片段（{durations}），逐镜生成、逐镜验收，再剪辑为 G 成片；禁止把整个 G 当作一次生成。",
        asset_line.replace("→", "；G成片输出："),
        "连续性基准：同一场景永久地标、主光方向、角色服装版本和屏幕轴线在本 G 内锁定；只有分镜明确写出的变量允许变化。",
        "",
    ]
    previous_end = "承接上一 G 已验收末帧"
    previous_direction = ""
    for index, shot in enumerate(shots):
        source = (action_overrides or {}).get(f"{shot['start']}-{shot['end']}", {})
        action = source.get("action") or shot["visual"].split("|")[0].strip() or "主体状态发生变化"
        dialogue = _clean_dialogue(source.get("dialogue", ""))
        next_action = ""
        if index + 1 < len(shots):
            next_shot = shots[index + 1]
            next_source = (action_overrides or {}).get(f"{next_shot['start']}-{next_shot['end']}", {})
            next_action = next_source.get("action") or next_shot["visual"].split("|")[0].strip()
        subject = _subject(action, shot["staging"])
        direction = _screen_direction(shot["staging"], action, previous_direction)
        foreground, middle, background = _layers(action, shot["visual"], shot["shot_size"])
        middle = action
        duration = int(shot["duration"])
        times = _time_points(duration)
        beat_action = f"{action}；台词：{dialogue}" if dialogue and dialogue != "（无）" else action
        beats = _body_beats(beat_action, subject, duration)
        corrected_size, size_note = _correct_shot_size(shot["shot_size"], beat_action)
        position = _position(corrected_size, shot["staging"], direction)
        lighting = _correct_lighting(action, source.get("lighting") or shot["lighting"])
        audio = (source.get("audio") or shot["audio"] or "保留现场环境音，不新增无来源音效").rstrip("。；; ")
        next_label = f"镜头{shots[index + 1]['number']}“{next_action}”" if next_action else "下一 G 首镜"
        out.extend([
            f"### 镜头{shot['number']}｜{shot['start']}-{shot['end']}｜独立生成{duration}s",
            f"镜头目的：{_purpose(action, next_action)}",
            f"景别·机位：{corrected_size}（{size_note}）｜唯一运镜：{source.get('camera') or shot['camera']}",
            f"主体与焦点：{subject}；焦点锁定“{action}”中的变化部位或变化边界，不让背景抢焦。",
            f"画面位置：{position}。",
            "空间分层：",
            f"- 前景：{foreground}。",
            f"- 中景：{middle}。",
            f"- 背景：{background}。",
            f"屏幕方向与轴线：{direction}；相邻镜头保持同侧机位，若需越轴必须先给中性轴镜头。",
            f"起始姿态：{beats[0]}；承接状态：{previous_end}。",
            "分时动作：",
            f"- {times[0]}：{beats[0]}。",
            f"- {times[1]}：{beats[1]}。",
            f"- {times[2]}：{beats[2]}。",
            f"- {times[3]}：{beats[3]}。",
            f"结束姿态：{beats[3]}。",
            f"光影：{lighting}；光源方向在镜头内不跳变，特效光只影响邻近表面。",
            f"声音：{audio}"
            + (f"；台词：{dialogue}。" if dialogue and dialogue != "（无）" else "。"),
            f"剪辑与承接：本镜以“{beats[3]}”作为可验收末帧；随后切到{next_label}。原转场意图：{shot['transition'] or '动作结果切入下一镜'}。",
            f"生成验收：首帧先确认主体位置、轴线和角色版本；末帧必须停在上述结束姿态。只返工本镜，不连带重跑整个 {unit_name.split()[0]}。",
            "",
        ])
        previous_end = beats[3]
        previous_direction = direction
    out.extend([
        "G 单元验收：所有独立子片段通过后再组接；任一镜失败只按 One-Variable Rule 修改该镜。",
        "禁止目标：不承诺“零丢弃”，不让模型在一条长视频中自行完成多次切镜。",
    ])
    return "\n".join(out).strip(), len(shots)


def rewrite_all_storyboards(*, check: bool = False, source_head: bool = False) -> dict:
    """重写 data/production 下全部分镜卡；check 模式只统计、不落盘。"""
    summary = {"files": 0, "cards": 0, "shots": 0, "unchanged": 0}
    for path in sorted(PRODUCTION_ROOT.glob("jiulu-s*/cards.json")):
        if source_head:
            relative_path = path.relative_to(ROOT).as_posix()
            raw = subprocess.check_output(["git", "show", f"HEAD:{relative_path}"])
            cards = json.loads(raw)
        else:
            cards = json.loads(path.read_text("utf-8"))
        script_maps = {
            (card.get("episode"), card.get("shot_number")): _script_shot_overrides(card.get("content", ""))
            for card in cards if card.get("stage") == "script"
        }
        changed = False
        for card in cards:
            if card.get("stage") != "storyboard" or card.get("episode") is None:
                continue
            overrides = script_maps.get((card.get("episode"), card.get("shot_number")), {})
            new_content, shot_count = rewrite_storyboard_content(card.get("content", ""), overrides)
            if not shot_count:
                summary["unchanged"] += 1
                continue
            if new_content != card.get("content"):
                card["content"] = new_content
                metadata = dict(card.get("metadata") or {})
                metadata.update({
                    "storyboard_schema_version": "2.0-detailed",
                    "subshot_count": shot_count,
                    "generation_strategy": "independent_subshots_then_edit",
                })
                card["metadata"] = metadata
                changed = True
                summary["cards"] += 1
                summary["shots"] += shot_count
        if changed:
            summary["files"] += 1
            if not check:
                path.write_text(json.dumps(cards, ensure_ascii=False, indent=2) + "\n", "utf-8")
    return summary


def main() -> None:
    """命令行入口：默认落盘，--check 仅输出可迁移数量。"""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="只统计，不写入 cards.json")
    parser.add_argument("--source-head", action="store_true", help="从 Git HEAD 原始卡片重新迁移")
    args = parser.parse_args()
    print(json.dumps(rewrite_all_storyboards(check=args.check, source_head=args.source_head), ensure_ascii=False))


if __name__ == "__main__":
    main()
