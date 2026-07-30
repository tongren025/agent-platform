"""画布专业提示词资产、结构化 Agent 契约与采用后学习。

人物定妆、场景定景和剧本拆镜的方法论参考仓库内 Apache-2.0 第三方源码，
在这里改写为 Agent Studio 自有运行时文案与稳定 JSON 契约。界面不暴露第三方
品牌；来源与许可证继续由 third_party/nomi/NOTICE 和项目文档保留。

学习遵循“用户确认后才入库”：模型提出但未采用的提示词不写长期记忆，防止失败
结果污染员工。被采用的完整案例进入 episodic memory，通用方法进入 procedural
memory，后续员工运行时会由现有 prompt compiler 自动注入。
"""
from __future__ import annotations

import json
import os
import re
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.config import BASE_DIR
from app.models.memory_types import EpisodicMemory, ProceduralMemory

LEARNING_PATH = BASE_DIR / "data" / "canvas" / "prompt-learning.json"
_LOCK = threading.RLock()

_CHARACTER_BOARD = """你是顶尖游戏/动漫概念美术大师，擅长详尽的角色身份板。
【主体】角色名｜身份｜核心外形｜标志物
【任务】制作一张 16:9 角色身份板。柔和米白纸质背景，电影感艺术书式不对称布局，绝不用网格；英雄全身立绘略偏中心作视觉锚点，周围留白环绕各区块，细灰引导线连接，互不堆叠、不裁切。
【强制中文标注】“三视图”：正面/侧面/背面；“表情研究”：按剧本逐字列出真实情绪；“服装变体”：按剧情场合逐字列出；“道具与材质”：逐件列出并用引出线连接；“色板”：主色/辅色/点缀色，写 hex 与用途；“ID 信息”：姓名/代号/身份/年龄/性格/标志。
【身份锁定】所有视角保持相同面部、面部比例、发型、服装版型、身体比例、姿势语言和视觉个性，明确是同一个人。
【风格】干净的电影感艺术书插画，35mm 柔光，真实布料、金属和磨损材质，中文标注清晰。
【负向】不合并视角、不堆叠、不裁切肢体、不用网格，除标注外无文字、无水印。"""

_SCENE_BOARD = """你是顶尖影视概念美术大师，擅长详尽的场景设定板。
【主体】场景名｜空间用途｜核心结构｜剧情标志物
【任务】制作一张 16:9 场景设定板。柔和米白纸质背景，电影感艺术书式不对称布局，环境广角主图略偏中心作锚点，周围以干净留白展示时段、机位、材质和色板。
【强制中文标注】“空间结构”：入口/动线/关键区域；“时段”：只列剧本真实出现的白天/夜晚/黄昏/天气；“机位”：广角/俯视/过肩等剧情需要的机位；“材质”：墙面/地面/家具/标志物；“色板”：主色/辅色/点缀色，写 hex 与用途；“ID 信息”：名称/地点/年代/氛围/剧情功能。
【结构锁定】所有视图保持相同建筑结构、布局、材质与视觉风格；时段变化只改变光照和天气，机位变化不改变空间事实。
【风格】干净的电影感场景设定集，35mm 柔光，真实材质和空间尺度，中文标注清晰。
【负向】不合并视图、不堆叠、不用网格、不发明剧本没有的陈设或天气，无水印。"""

_IMAGE_SHOT = """单张静态分镜提示词结构：
1. 镜头主体：本镜真正发生的剧情事实；
2. 景别与构图：远景/全景/中景/近景/特写、主体位置、前中后景关系；
3. 人物状态：姿态、视线、表情、与道具或他人的空间关系；
4. 场景与光线：只使用剧本明确给出的时间、天气、环境和光线；
5. 连续性：角色身份、服装、道具、场景结构与前后镜一致；
6. 画面风格：统一媒介、色调、镜头语言和画幅。
禁止写运镜、动作演进、转场、时长、台词、字幕和声音；不要发明剧情中不存在的视觉事实。"""

_VIDEO_SHOT = """视频分镜提示词结构：
1. 首帧状态：人物与场景起始位置、景别和构图；
2. 动作演进：按时间顺序写清谁先做什么、状态如何变化；
3. 摄影机：推/拉/摇/移/跟/环绕或锁定机位，方向和速度明确；
4. 节奏与时长：镜头重点、停顿和结束落点；
5. 连续性：身份、服装、道具、运动方向、视线和时空不跳变；
6. 视听限制：画面中不生成字幕或水印；台词和声音仅在模型确实支持时写。
忠于剧本，不添加未出现的天气、服装、环境或剧情动作。"""

_IMAGE_VIDEO_SHOT = """图片+视频分镜采用“一镜一条 video shot + 首帧 keyframe”：
【首帧图】只写静态构图、景别、光线、人物姿态表情和环境；禁止运镜、动作演进、转场、时长、台词、字幕和声音。
【视频段】从首帧既有状态继续，写动作演进、运镜、节奏、时长感与结束落点；不要重复角色静态外貌。
角色/场景/道具只引用统一锚点，保持身份、服装、空间结构、运动方向和时空连续；一个逻辑镜头不要拆成两条镜头。"""


def list_prompt_catalog() -> list[dict[str, Any]]:
    """返回画布提示词库的内置只读资产。"""
    source = "Agent Studio 内置创作方法论"
    common = {
        "mediaUrl": "",
        "tags": ["画布", "漫剧", "专业方法论"],
        "source": source,
        "sourceId": "agent-studio-canvas",
        "sourceUrl": "",
        "origin": "public",
    }
    return [
        {
            **common,
            "id": "canvas-character-identity-board",
            "title": "角色身份板 · 七重身份锁定",
            "prompt": _CHARACTER_BOARD,
            "mediaType": "image",
            "promptType": "image",
            "tags": [*common["tags"], "人物", "定妆"],
        },
        {
            **common,
            "id": "canvas-scene-design-board",
            "title": "场景设定板 · 结构与时段锁定",
            "prompt": _SCENE_BOARD,
            "mediaType": "image",
            "promptType": "image",
            "tags": [*common["tags"], "场景", "定景"],
        },
        {
            **common,
            "id": "canvas-image-storyboard-shot",
            "title": "图片分镜 · 静态画面骨架",
            "prompt": _IMAGE_SHOT,
            "mediaType": "image",
            "promptType": "image",
            "tags": [*common["tags"], "分镜", "静态"],
        },
        {
            **common,
            "id": "canvas-video-storyboard-shot",
            "title": "视频分镜 · 动作与运镜骨架",
            "prompt": _VIDEO_SHOT,
            "mediaType": "video",
            "promptType": "video",
            "tags": [*common["tags"], "分镜", "视频", "运镜"],
        },
        {
            **common,
            "id": "canvas-image-video-storyboard-shot",
            "title": "图片+视频分镜 · 首帧接力骨架",
            "prompt": _IMAGE_VIDEO_SHOT,
            "mediaType": "video",
            "promptType": "video",
            "tags": [*common["tags"], "分镜", "首帧", "图生视频"],
        },
    ]


_STORYBOARD_SYSTEM = """你是 Agent Studio 的故事板规划师。把故事变成用户可审阅的结构化分镜方案；规划阶段不写画布、不触发图片或视频生成。

方法：
1. 按开场、发展、转折、高潮、收尾逐段拆镜。短故事/单场景通常 6–10 镜；长故事/多场景 18–24 镜，上限 24。每个剧情段落至少一镜，绝不丢结尾。
2. 归并角色别名。角色、场景、道具在两镜以上出现才建锚；只有重大外观变化才拆锚；禁止发明剧本没有的角色、场景、天气、服装或道具。
3. character/scene/prop 默认 visual 锚；能用文字稳定表达的统一风格与色调用 text 锚。视觉锚描述必须中性，可直接用于定妆/定景，不带单镜剧情动作。
4. 图片镜头 durationSec=0，prompt 只写静态构图、景别、光线、姿态、表情和环境，禁止运镜、动作演进、转场、时长、字幕和声音。
5. 视频镜头写起始状态、动作演进、运镜、节奏、时长和结束落点。图片+视频模式仍是一条 video shot，并增加 keyframe.enabled=true；keyframe.prompt 只写静态首帧。
6. 守住人物身份、服装、道具、场景、运动方向和时空连续性，尤其不要把闪回身份带到现在。
7. 所有面向用户的 title/name/description/prompt 必须中文。modelKey 只能从可用模型清单选择，不确定就省略。

你的唯一结构化动作是 propose_storyboard_plan。"""

_FIXATION_SYSTEM = f"""你是 Agent Studio 的人物定妆与场景定景规划师。通读剧本，识别反复出现或推动剧情的主要角色（通常不超过 5 个）和多场戏使用的关键场景（通常 3–6 个）。归并同一角色的本名、职称和代称，只创建缺少的卡片，不触发生成。

每个角色必须从剧本反推真实情绪、剧情服装、标志道具、身份与配色，不使用“平静/微笑/愤怒”一类与剧本无关的通用四件套。每个场景必须从剧本反推真实时段、天气、机位、空间结构和剧情标志物，不得发明。

角色卡 prompt 必须套用并具体化以下身份板方法：
{_CHARACTER_BOARD}

场景卡 prompt 必须套用并具体化以下场景板方法：
{_SCENE_BOARD}

你的唯一结构化动作是 create_canvas_nodes。一次返回全部新卡；summary 用中文概括，nodes 中角色 kind=character、场景 kind=scene，clientId 分别用 c1/c2…和 s1/s2…，title 为中文短名，prompt 必须是已经结合本剧本写好的完整提示词。不要返回空 prompt，不要触发生成。"""

_CREATION_SYSTEM = """你在 Agent Studio 创作区协助用户从创意推进到大纲、剧本和分镜。优先读取当前文档再修改；用户要求写入时使用编辑工具，不要只在聊天里另写一份。
可用结构化动作：
- read_full_text: args={}
- read_selection: args={}
- insert_at_cursor: args={"text":"..."}
- replace_selection: args={"text":"..."}
- replace_full_text: args={"text":"..."}
若只是问答可以不调用工具。"""

_GENERATION_SYSTEM = """你在 Agent Studio 生成画布工作。用户要求创建人物、场景、图片或视频节点时，使用 create_canvas_nodes，一次提交 nodes 与 edges；每个节点必须有 clientId、kind、title 和非空的专业 prompt。用户只问问题时可以不调用工具。
可用结构化动作包括 read_canvas_state、create_canvas_nodes、connect_canvas_edges、set_node_prompt、delete_canvas_nodes、run_generation_batch。真实写入、删除和生成仍由界面要求用户确认。"""

_ALLOWED_TOOLS = {
    "storyboard": {"propose_storyboard_plan"},
    "fixation": {"create_canvas_nodes"},
    "creation": {
        "read_full_text",
        "read_selection",
        "insert_at_cursor",
        "replace_selection",
        "replace_full_text",
        "author_skill",
    },
    "generation": {
        "read_canvas_state",
        "create_canvas_nodes",
        "connect_canvas_edges",
        "set_node_prompt",
        "delete_canvas_nodes",
        "run_generation_batch",
        "create_staging_reference",
        "create_camera_move",
    },
}


def skill_family(skill_key: str) -> str:
    """把前端技能键归一化为平台画布的四类稳定契约。"""
    if skill_key == "workbench.storyboard.planner":
        return "storyboard"
    if skill_key == "workbench.fixation.planner":
        return "fixation"
    if skill_key.startswith("workbench.creation."):
        return "creation"
    return "generation"


def build_agent_system_prompt(
    skill_key: str,
    *,
    frontend_system_prompt: str = "",
    model_catalog: str = "",
) -> str:
    """构造 Web 画布 Agent 的完整系统提示词和统一 JSON 工具契约。"""
    family = skill_family(skill_key)
    methodology = {
        "storyboard": _STORYBOARD_SYSTEM,
        "fixation": _FIXATION_SYSTEM,
        "creation": _CREATION_SYSTEM,
        "generation": _GENERATION_SYSTEM,
    }[family]
    contract = """你必须只输出一个 JSON 对象，不要使用 Markdown 代码块：
{"assistantMessage":"给用户看的简短中文说明","toolCalls":[{"toolName":"动作名","args":{}}]}
toolCalls 必须是数组；无需动作时返回空数组。args 必须是 JSON 对象，数组必须是真数组，禁止把对象或数组序列化成字符串。"""
    if family == "storyboard":
        contract += """
propose_storyboard_plan 的 args 必须为：
{"title":"方案名","anchors":[{"id":"anchor-1","kind":"character|scene|prop|style","name":"名称","description":"稳定描述","carrier":"visual|text","scope":"all|selective"}],"shots":[{"index":1,"shotKind":"image|video","durationSec":0,"anchorIds":["anchor-1"],"prompt":"可直接生成的中文提示词"}]}"""
    elif family == "fixation":
        contract += """
create_canvas_nodes 的 args 必须为：
{"summary":"中文总结","nodes":[{"clientId":"c1","kind":"character|scene","title":"名称","prompt":"完整专业提示词"}],"edges":[]}"""
    parts = [methodology]
    if frontend_system_prompt.strip():
        parts.append(frontend_system_prompt.strip())
    if model_catalog.strip():
        parts.append(f"当前平台可用模型（只能从中选择，拿不准可省略）：\n{model_catalog.strip()}")
    parts.append(contract)
    return "\n\n".join(parts)


def _extract_json(text: str) -> Any:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.I)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        decoder = json.JSONDecoder()
        for index, character in enumerate(cleaned):
            if character != "{":
                continue
            try:
                value, _ = decoder.raw_decode(cleaned[index:])
                return value
            except json.JSONDecodeError:
                continue
    raise ValueError("模型没有返回可解析的结构化 JSON")


def _normalize_storyboard(args: Any) -> dict[str, Any]:
    if not isinstance(args, dict):
        raise ValueError("分镜方案参数必须是对象")
    anchors = args.get("anchors")
    shots = args.get("shots")
    if isinstance(anchors, str):
        try:
            anchors = json.loads(anchors)
        except json.JSONDecodeError as exc:
            raise ValueError("分镜 anchors 必须是数组") from exc
    if isinstance(shots, str):
        try:
            shots = json.loads(shots)
        except json.JSONDecodeError as exc:
            raise ValueError("分镜 shots 必须是数组") from exc
    if not isinstance(anchors, list) or not isinstance(shots, list) or not shots:
        raise ValueError("分镜方案必须包含 anchors 数组和非空 shots 数组")
    if len(shots) > 24:
        shots = shots[:24]
    anchor_ids: set[str] = set()
    normalized_anchors: list[dict[str, Any]] = []
    for index, item in enumerate(anchors[:24], 1):
        if not isinstance(item, dict):
            continue
        anchor_id = str(item.get("id") or f"anchor-{index}").strip()
        kind = str(item.get("kind") or "prop").strip()
        if kind not in {"character", "scene", "prop", "style"}:
            kind = "prop"
        carrier = str(item.get("carrier") or ("text" if kind == "style" else "visual"))
        if carrier not in {"visual", "text"}:
            carrier = "text" if kind == "style" else "visual"
        name = str(item.get("name") or "").strip()
        if not anchor_id or not name:
            continue
        anchor_ids.add(anchor_id)
        normalized = {
            "id": anchor_id,
            "kind": kind,
            "name": name,
            "description": str(item.get("description") or "").strip(),
            "carrier": carrier,
            "scope": str(item.get("scope") or ("all" if kind == "style" else "selective")),
        }
        if isinstance(item.get("variants"), list):
            normalized["variants"] = [str(value) for value in item["variants"] if str(value).strip()]
        normalized_anchors.append(normalized)
    normalized_shots: list[dict[str, Any]] = []
    for index, item in enumerate(shots, 1):
        if not isinstance(item, dict):
            continue
        prompt = str(item.get("prompt") or "").strip()
        if not prompt:
            raise ValueError(f"第 {index} 镜提示词为空")
        shot_kind = str(item.get("shotKind") or "image")
        if shot_kind not in {"image", "video"}:
            shot_kind = "image"
        normalized = {
            "index": index,
            "shotKind": shot_kind,
            "durationSec": 0 if shot_kind == "image" else max(1, min(int(item.get("durationSec") or 5), 30)),
            "anchorIds": [
                str(value) for value in (item.get("anchorIds") or [])
                if str(value) in anchor_ids
            ],
            "prompt": prompt,
        }
        for optional in ("modelKey", "modeId", "params", "keyframe"):
            if item.get(optional) is not None:
                normalized[optional] = item[optional]
        normalized_shots.append(normalized)
    if not normalized_shots:
        raise ValueError("分镜方案没有有效镜头")
    return {
        "title": str(args.get("title") or f"分镜方案 · {len(normalized_shots)} 镜").strip(),
        "anchors": normalized_anchors,
        "shots": normalized_shots,
    }


def _normalize_fixation(args: Any) -> dict[str, Any]:
    if not isinstance(args, dict) or not isinstance(args.get("nodes"), list):
        raise ValueError("定妆/定景结果必须包含 nodes 数组")
    nodes = []
    char_index = 0
    scene_index = 0
    for item in args["nodes"][:12]:
        if not isinstance(item, dict):
            continue
        kind = str(item.get("kind") or "")
        if kind not in {"character", "scene"}:
            continue
        title = str(item.get("title") or "").strip()
        prompt = str(item.get("prompt") or "").strip()
        if not title or not prompt:
            raise ValueError("人物/场景卡的标题和提示词不能为空")
        if kind == "character":
            char_index += 1
            default_id = f"c{char_index}"
        else:
            scene_index += 1
            default_id = f"s{scene_index}"
        nodes.append({
            **item,
            "clientId": str(item.get("clientId") or default_id),
            "kind": kind,
            "title": title,
            "prompt": prompt,
        })
    if not nodes:
        raise ValueError("没有识别出有效的人物或场景卡")
    return {
        "summary": str(args.get("summary") or f"创建 {len(nodes)} 张人物/场景设定卡"),
        "nodes": nodes,
        "edges": args.get("edges") if isinstance(args.get("edges"), list) else [],
    }


def parse_agent_response(skill_key: str, text: str) -> dict[str, Any]:
    """解析并校验模型的 JSON 工具调用，返回 Web 流适配器需要的稳定结构。"""
    family = skill_family(skill_key)
    payload = _extract_json(text)
    if not isinstance(payload, dict):
        raise ValueError("模型结构化结果必须是对象")

    if family == "storyboard" and isinstance(payload.get("shots"), list):
        payload = {"assistantMessage": "分镜方案已经生成，请在创作区逐镜检查后确认落画布。", "toolCalls": [
            {"toolName": "propose_storyboard_plan", "args": payload}
        ]}
    elif family == "fixation" and isinstance(payload.get("nodes"), list):
        payload = {"assistantMessage": "人物和场景设定卡已经规划完成，请确认后落到画布。", "toolCalls": [
            {"toolName": "create_canvas_nodes", "args": payload}
        ]}

    raw_calls = payload.get("toolCalls", payload.get("tool_calls", []))
    if not isinstance(raw_calls, list):
        raise ValueError("toolCalls 必须是数组")
    allowed = _ALLOWED_TOOLS[family]
    calls: list[dict[str, Any]] = []
    for raw in raw_calls[:12]:
        if not isinstance(raw, dict):
            continue
        name = str(raw.get("toolName") or raw.get("name") or "").strip()
        if name not in allowed:
            continue
        args = raw.get("args", raw.get("arguments", {}))
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError:
                continue
        if name == "propose_storyboard_plan":
            args = _normalize_storyboard(args)
        elif family == "fixation" and name == "create_canvas_nodes":
            args = _normalize_fixation(args)
        elif not isinstance(args, dict):
            continue
        calls.append({"toolName": name, "args": args})

    if family in {"storyboard", "fixation"} and not calls:
        raise ValueError("模型没有返回画布需要的结构化动作")
    return {
        "assistantMessage": str(
            payload.get("assistantMessage")
            or payload.get("assistant_message")
            or payload.get("message")
            or ""
        ).strip(),
        "toolCalls": calls,
    }


def _load_learning_records() -> list[dict[str, Any]]:
    if not LEARNING_PATH.exists():
        return []
    try:
        payload = json.loads(LEARNING_PATH.read_text("utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    return [item for item in payload if isinstance(item, dict)] if isinstance(payload, list) else []


def _save_learning_records(records: list[dict[str, Any]]) -> None:
    LEARNING_PATH.parent.mkdir(parents=True, exist_ok=True)
    temp = LEARNING_PATH.with_suffix(f".json.tmp{os.getpid()}")
    temp.write_text(json.dumps(records[:500], ensure_ascii=False, indent=2), "utf-8")
    os.replace(temp, LEARNING_PATH)


_PROCEDURAL_RULES = {
    "character": "制作角色定妆时，必须从剧本反推真实情绪、服装、道具和配色，并用三视图、逐字中文标注与七重身份锁定保持同一角色。",
    "scene": "制作场景定景时，必须忠于剧本的空间、时段和天气，用多机位与结构锁定保证建筑布局和材质一致。",
    "storyboard": "剧本拆镜必须覆盖开场、发展、转折、高潮与收尾，建立跨镜头锚点并守住人物身份、服装、道具、场景和时空连续性。",
    "image_prompt": "图片分镜提示词只写静态构图、景别、光线、姿态、表情和环境，不混入运镜、动作演进、时长、字幕或声音。",
    "video_prompt": "视频分镜提示词按首帧状态、动作演进、摄影机运动、节奏时长和结束落点组织，并保持跨镜连续性。",
    "prompt_refine": "优化生成提示词时保留用户原意和剧情事实，补齐主体、构图、光线、动作或运镜、连续性与负向约束，不擅自新增剧情。",
}


def record_accepted_prompts(
    *,
    project_id: str,
    employee_key: str,
    items: list[dict[str, Any]],
) -> dict[str, Any]:
    """记录用户已采用的提示词，并写入对应员工长期记忆。"""
    now = datetime.now(timezone.utc).isoformat()
    accepted: list[dict[str, Any]] = []
    with _LOCK:
        records = _load_learning_records()
        for item in items[:50]:
            prompt = str(item.get("prompt") or "").strip()[:12000]
            if not prompt:
                continue
            kind = str(item.get("kind") or "image_prompt")
            if kind not in _PROCEDURAL_RULES:
                kind = "image_prompt"
            record = {
                "id": f"cpl_{uuid.uuid4().hex[:12]}",
                "projectId": str(project_id or "").strip()[:120],
                "employeeKey": str(employee_key or "").strip()[:120],
                "kind": kind,
                "title": str(item.get("title") or "").strip()[:240],
                "prompt": prompt,
                "acceptedAt": now,
            }
            records.insert(0, record)
            accepted.append(record)
        _save_learning_records(records)

    memory_count = 0
    clean_employee_key = str(employee_key or "").strip()
    if clean_employee_key and accepted:
        try:
            from app.dependencies import employee_registry, long_term_memory

            if employee_registry.get(clean_employee_key) is not None:
                kinds = sorted({record["kind"] for record in accepted})
                for kind in kinds:
                    long_term_memory.add_procedural(
                        clean_employee_key,
                        ProceduralMemory(
                            employee_key=clean_employee_key,
                            rule=_PROCEDURAL_RULES[kind],
                            rationale="用户在画布中确认采用了符合该方法的提示词。",
                            confidence=0.8,
                            source_session=f"canvas:{project_id or 'default'}",
                        ),
                    )
                    memory_count += 1
                for record in accepted[:10]:
                    long_term_memory.add_episodic(
                        clean_employee_key,
                        EpisodicMemory(
                            employee_key=clean_employee_key,
                            observation=f"画布项目 {project_id or 'default'} 的 {record['kind']} 创作",
                            action=record["prompt"],
                            result=f"用户确认采用：{record['title'] or '未命名提示词'}",
                            success_score=1.0,
                            source_session=f"canvas:{project_id or 'default'}",
                        ),
                    )
                    memory_count += 1
        except Exception:
            # 学习失败不能影响用户已经完成的画布确认；记录仍保存在专用学习库。
            memory_count = 0
    return {"acceptedCount": len(accepted), "memoryCount": memory_count}


def prompt_learning_overview(limit: int = 100) -> dict[str, Any]:
    """返回自我学习页需要的内置方法和最近采用案例。"""
    with _LOCK:
        records = _load_learning_records()
    by_kind: dict[str, int] = {}
    employees: set[str] = set()
    for record in records:
        kind = str(record.get("kind") or "")
        by_kind[kind] = by_kind.get(kind, 0) + 1
        if record.get("employeeKey"):
            employees.add(str(record["employeeKey"]))
    return {
        "catalog": list_prompt_catalog(),
        "records": records[: max(1, min(limit, 300))],
        "stats": {
            "builtinCount": len(list_prompt_catalog()),
            "acceptedCount": len(records),
            "employeeCount": len(employees),
            "byKind": by_kind,
        },
    }
