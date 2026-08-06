"""内置漫剧生产工作流。

这条 DAG 使用现有工作流引擎支持的节点类型，把策划、剧本、视觉设计、分镜、
动作/特效、三类图片生成、视频生成和三道质量门禁串成真实生产链。媒体节点绑定
对应数字员工，由员工调用其已授权的 ``generate_image`` / ``generate_video`` 工具。

内置定义带修订号：启动时只升级未被用户认领的旧版内置工作流，不覆盖用户创建的
同名工作流。
"""
from __future__ import annotations

import json
import logging

from app.models.registry import TeamRole
from app.models.workflow import WorkflowDefinition, WorkflowEdge, WorkflowNode

logger = logging.getLogger(__name__)

COMIC_WORKFLOW_KEY = "comic-drama"
COMIC_LEGACY_WORKFLOW_KEY = "comic-drama-10s"
COMIC_TEAM_CODE = "comic-drama-team"
COMIC_WORKFLOW_REVISION = 7

# 员工 -> (阶段, 阶段内排序)，作为团队 roles 的真实来源（替代前端 tag 猜测）。
COMIC_ROLES: list[tuple[str, str, int]] = [
    ("comic-director", "统筹", 0),
    ("comic-screenwriter", "剧本", 0),
    ("comic-character-designer", "视觉设定", 0),
    ("comic-scene-designer", "视觉设定", 1),
    ("comic-storyboard", "分镜", 0),
    ("comic-vfx-designer", "动作设计", 0),
    ("comic-character-artist", "图片生成", 0),
    ("comic-scene-artist", "图片生成", 1),
    ("comic-keyframe-artist", "图片生成", 2),
    ("comic-prompt-engineer", "视频制作", 0),
    ("comic-video-artist", "视频制作", 1),
    ("comic-qa-inspector", "质量门禁", 0),
]


def _schema(value: dict) -> str:
    """把 JSON Schema 压成稳定字符串，供 agent 节点的输出契约使用。"""
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


DIRECTOR_SCHEMA = _schema({
    "type": "object",
    "required": [
        "production_brief", "tasks", "asset_status",
        "quality_gates", "next_action",
    ],
    "properties": {
        "production_brief": {
            "type": "object",
            "required": [
                "project_id", "episode_id", "goal", "delivery_spec",
                "assumptions", "blockers",
            ],
            "properties": {
                "project_id": {"type": "string"},
                "episode_id": {"type": "string"},
                "goal": {"type": "string"},
                "delivery_spec": {"type": "object"},
                "assumptions": {"type": "array"},
                "blockers": {"type": "array"},
            },
        },
        "tasks": {"type": "array", "items": {"type": "object"}},
        "asset_status": {"type": "array", "items": {"type": "object"}},
        "quality_gates": {"type": "array", "items": {"type": "object"}},
        "next_action": {"type": "string"},
    },
})

WRITER_SCHEMA = _schema({
    "type": "object",
    "required": ["script_package"],
    "properties": {
        "script_package": {
            "type": "object",
            "required": [
                "project_id", "episode_id", "logline", "theme",
                "target_duration_sec", "assumptions", "blockers",
                "scenes", "continuity_constraints", "handoff_notes",
            ],
            "properties": {
                "project_id": {"type": "string"},
                "episode_id": {"type": "string"},
                "logline": {"type": "string"},
                "theme": {"type": "string"},
                "target_duration_sec": {"type": "number", "exclusiveMinimum": 0},
                "assumptions": {"type": "array"},
                "blockers": {"type": "array"},
                "scenes": {"type": "array", "items": {"type": "object"}},
                "continuity_constraints": {"type": "array"},
                "handoff_notes": {"type": "array"},
            },
        },
    },
})

CHARACTER_SCHEMA = _schema({
    "type": "object",
    "required": ["character_bible"],
    "properties": {
        "character_bible": {
            "type": "object",
            "required": ["project_id", "characters", "handoff_notes"],
            "properties": {
                "project_id": {"type": "string"},
                "characters": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "character_id", "name", "version", "story_function",
                            "identity_invariants", "variants", "expression_range",
                            "pose_constraints", "continuity_rules",
                            "generation_description", "open_questions",
                        ],
                        "properties": {
                            "character_id": {"type": "string"},
                            "name": {"type": "string"},
                            "version": {"type": "string"},
                            "story_function": {"type": "string"},
                            "identity_invariants": {"type": "object"},
                            "variants": {"type": "array", "items": {"type": "object"}},
                            "expression_range": {"type": "array"},
                            "pose_constraints": {"type": "array"},
                            "continuity_rules": {"type": "array"},
                            "generation_description": {"type": "string"},
                            "open_questions": {"type": "array"},
                        },
                    },
                },
                "handoff_notes": {"type": "array"},
            },
        },
    },
})

SCENE_SCHEMA = _schema({
    "type": "object",
    "required": ["scene_bible"],
    "properties": {
        "scene_bible": {
            "type": "object",
            "required": ["project_id", "scenes", "handoff_notes"],
            "properties": {
                "project_id": {"type": "string"},
                "scenes": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "scene_id", "name", "version", "story_usage",
                            "layout", "materials", "palette", "lighting",
                            "time_variants", "camera_positions",
                            "continuity_rules", "generation_description",
                            "open_questions",
                        ],
                        "properties": {
                            "scene_id": {"type": "string"},
                            "name": {"type": "string"},
                            "version": {"type": "string"},
                            "story_usage": {"type": "array"},
                            "layout": {"type": "object"},
                            "materials": {"type": "array"},
                            "palette": {"type": "array"},
                            "lighting": {"type": "object"},
                            "time_variants": {"type": "array"},
                            "camera_positions": {"type": "array"},
                            "continuity_rules": {"type": "array"},
                            "generation_description": {"type": "string"},
                            "open_questions": {"type": "array"},
                        },
                    },
                },
                "handoff_notes": {"type": "array"},
            },
        },
    },
})

STORYBOARD_SCHEMA = _schema({
    "type": "object",
    "required": ["storyboard"],
    "properties": {
        "storyboard": {
            "type": "object",
            "required": [
                "project_id", "episode_id", "aspect_ratio",
                "total_duration_sec", "shots", "duration_check", "handoff_notes",
            ],
            "properties": {
                "project_id": {"type": "string"},
                "episode_id": {"type": "string"},
                "aspect_ratio": {"type": "string"},
                "total_duration_sec": {"type": "number", "exclusiveMinimum": 0},
                "shots": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "type": "object",
                        "required": [
                            "shot_id", "scene_id", "beat_id", "duration_sec",
                            "narrative_intent", "information_change",
                            "emotion_target", "shot_size", "camera_angle",
                            "composition", "subject_action", "camera_motion",
                            "start_state", "end_state", "character_refs",
                            "scene_ref", "prop_refs", "dialogue", "audio",
                            "transition", "continuity_checks", "generation_risks",
                        ],
                        "properties": {
                            "shot_id": {"type": "string"},
                            "scene_id": {"type": "string"},
                            "beat_id": {"type": "string"},
                            "narrative_intent": {"type": "string"},
                            "information_change": {"type": "string"},
                            "emotion_target": {"type": "string"},
                            "duration_sec": {
                                "type": "number",
                                "exclusiveMinimum": 0,
                                "maximum": 6,
                            },
                            "shot_size": {"type": "string"},
                            "camera_angle": {"type": "string"},
                            "composition": {"type": "string"},
                            "subject_action": {"type": "string"},
                            "camera_motion": {"type": "string"},
                            "start_state": {"type": "object"},
                            "end_state": {"type": "object"},
                            "character_refs": {"type": "array"},
                            "scene_ref": {"type": "string"},
                            "prop_refs": {"type": "array"},
                            "dialogue": {"type": "string"},
                            "audio": {"type": "string"},
                            "transition": {"type": "string"},
                            "continuity_checks": {"type": "array"},
                            "generation_risks": {"type": "array"},
                        },
                    },
                },
                "duration_check": {"type": "object"},
                "handoff_notes": {"type": "array"},
            },
        },
    },
})

SHOT_EFFECT_SCHEMA = _schema({
    "type": "object",
    "required": ["action_vfx_package"],
    "properties": {
        "action_vfx_package": {
            "type": "object",
            "required": ["project_id", "episode_id", "shots", "handoff_notes"],
            "properties": {
                "project_id": {"type": "string"},
                "episode_id": {"type": "string"},
                "shots": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "shot_id", "action", "vfx_layers",
                            "continuity_in", "continuity_out",
                            "generation_risks", "split_recommendation",
                        ],
                        "properties": {
                            "shot_id": {"type": "string"},
                            "action": {"type": "object"},
                            "vfx_layers": {"type": "array", "items": {"type": "object"}},
                            "continuity_in": {"type": "object"},
                            "continuity_out": {"type": "object"},
                            "generation_risks": {"type": "array"},
                            "split_recommendation": {"type": "string"},
                        },
                    },
                },
                "handoff_notes": {"type": "array"},
            },
        },
    },
})

def _qa_schema(phase: str) -> str:
    """三道 QA 共用的报告合同；顶层 gate 供条件节点直接读取。"""
    return _schema({
        "type": "object",
        "required": ["phase", "gate", "qa_report"],
        "properties": {
            "phase": {"type": "string", "const": phase},
            "gate": {"type": "string", "enum": ["PASS", "FAIL"]},
            "qa_report": {
                "type": "object",
                "required": [
                    "scope", "evidence", "checks", "verdict",
                    "blockers", "rework_tasks", "summary",
                ],
                "properties": {
                    "scope": {"type": "string", "enum": ["text", "image", "video", "mixed"]},
                    "evidence": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": [
                                "evidence_id", "type", "accessible",
                                "asset_id", "shot_id",
                            ],
                            "properties": {
                                "evidence_id": {"type": "string"},
                                "type": {"type": "string"},
                                "accessible": {"type": "boolean"},
                                "asset_id": {"type": "string"},
                                "shot_id": {"type": "string"},
                            },
                        },
                    },
                    "checks": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": [
                                "check_id", "result", "severity", "evidence_id",
                                "observation", "expected", "owner_employee_key",
                                "rework",
                            ],
                            "properties": {
                                "check_id": {"type": "string"},
                                "result": {
                                    "type": "string",
                                    "enum": ["pass", "fail", "blocked"],
                                },
                                "severity": {
                                    "type": "string",
                                    "enum": ["critical", "major", "minor", "info"],
                                },
                                "evidence_id": {"type": "string"},
                                "observation": {"type": "string"},
                                "expected": {"type": "string"},
                                "owner_employee_key": {"type": "string"},
                                "rework": {"type": "string"},
                            },
                        },
                    },
                    "verdict": {"type": "string", "enum": ["pass", "fail", "blocked"]},
                    "passed_items": {"type": "array", "items": {"type": "string"}},
                    "blockers": {"type": "array", "items": {"type": "string"}},
                    "rework_tasks": {"type": "array", "items": {"type": "object"}},
                    "summary": {"type": "string"},
                },
            },
        },
    })


IMAGE_PROMPT_SCHEMA = _schema({
    "type": "object",
    "required": ["image_prompt_package"],
    "properties": {
        "image_prompt_package": {
            "type": "object",
            "required": [
                "project_id", "episode_id", "character_assets",
                "scene_assets", "keyframe_assets", "validation",
            ],
            "properties": {
                "project_id": {"type": "string"},
                "episode_id": {"type": "string"},
                "character_assets": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "asset_id", "character_id", "version", "variant_id",
                            "prompt", "reference_map", "negative_prompt",
                            "size", "quality", "validation",
                        ],
                        "properties": {
                            "asset_id": {"type": "string"},
                            "character_id": {"type": "string"},
                            "version": {"type": "string"},
                            "variant_id": {"type": "string"},
                            "prompt": {"type": "string"},
                            "reference_map": {"type": "array"},
                            "negative_prompt": {"type": "string"},
                            "size": {"type": "string"},
                            "quality": {"type": "string"},
                            "validation": {"type": "object"},
                        },
                    },
                },
                "scene_assets": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "asset_id", "scene_id", "version", "view_id",
                            "prompt", "reference_map", "negative_prompt",
                            "size", "quality", "validation",
                        ],
                        "properties": {
                            "asset_id": {"type": "string"},
                            "scene_id": {"type": "string"},
                            "version": {"type": "string"},
                            "view_id": {"type": "string"},
                            "prompt": {"type": "string"},
                            "reference_map": {"type": "array"},
                            "negative_prompt": {"type": "string"},
                            "size": {"type": "string"},
                            "quality": {"type": "string"},
                            "validation": {"type": "object"},
                        },
                    },
                },
                "keyframe_assets": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "asset_id", "shot_id", "frame_role",
                            "character_versions", "scene_version",
                            "prompt", "reference_map", "negative_prompt",
                            "size", "quality", "validation",
                        ],
                        "properties": {
                            "asset_id": {"type": "string"},
                            "shot_id": {"type": "string"},
                            "frame_role": {
                                "type": "string",
                                "enum": ["start", "end", "action"],
                            },
                            "character_versions": {"type": "array"},
                            "scene_version": {"type": "string"},
                            "prompt": {"type": "string"},
                            "reference_map": {"type": "array"},
                            "negative_prompt": {"type": "string"},
                            "size": {"type": "string"},
                            "quality": {"type": "string"},
                            "validation": {"type": "object"},
                        },
                    },
                },
                "validation": {"type": "object"},
            },
        },
    },
})


VIDEO_PROMPT_SCHEMA = _schema({
    "type": "object",
    "required": ["video_prompt_package"],
    "properties": {
        "video_prompt_package": {
            "type": "object",
            "required": ["project_id", "episode_id", "shots", "global_notes"],
            "properties": {
                "project_id": {"type": "string"},
                "episode_id": {"type": "string"},
                "shots": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "type": "object",
                        "required": [
                            "shot_id", "target_model_id", "generation_mode", "prompt",
                            "reference_map", "parameters", "continuity_in",
                            "continuity_out", "validation",
                        ],
                        "properties": {
                            "shot_id": {"type": "string"},
                            "target_model_id": {"type": "string"},
                            "generation_mode": {
                                "type": "string",
                                "enum": ["keyframe", "reference"],
                            },
                            "prompt": {"type": "string"},
                            "reference_map": {"type": "array"},
                            "parameters": {
                                "type": "object",
                                "required": [
                                    "duration", "resolution", "aspect_ratio",
                                    "image_url", "last_frame_url",
                                    "reference_urls", "generate_audio",
                                ],
                                "properties": {
                                    "duration": {
                                        "type": "number",
                                        "exclusiveMinimum": 0,
                                        "maximum": 6,
                                    },
                                    "resolution": {"type": "string"},
                                    "aspect_ratio": {"type": "string"},
                                    "image_url": {"type": "string"},
                                    "last_frame_url": {"type": "string"},
                                    "reference_urls": {"type": "array"},
                                    "generate_audio": {"type": "boolean"},
                                },
                            },
                            "continuity_in": {"type": "object"},
                            "continuity_out": {"type": "object"},
                            "validation": {"type": "object"},
                        },
                    },
                },
                "global_notes": {"type": "array"},
            },
        },
    },
})


def _agent(
    node_key: str,
    name: str,
    employee_key: str,
    user_input_template: str,
    x: int,
    y: int,
    *,
    schema: str | None = None,
) -> WorkflowNode:
    """构造关键 agent 节点；失败立即停止，避免残缺资产继续流入付费媒体环节。"""
    config = {
        "employeeKey": employee_key,
        "userInputTemplate": user_input_template,
        "onError": "stop",
    }
    if schema:
        config["structuredSchemaJson"] = schema
    return WorkflowNode(
        node_key=node_key,
        type="agent",
        name=name,
        position={"x": x, "y": y},
        config=config,
    )


def _template(node_key: str, name: str, template: str, x: int, y: int) -> WorkflowNode:
    """构造不调用模型的汇总节点。"""
    return WorkflowNode(
        node_key=node_key,
        type="template",
        name=name,
        position={"x": x, "y": y},
        config={"template": template},
    )


def _code(
    node_key: str,
    name: str,
    expression: str,
    inputs: dict,
    x: int,
    y: int,
) -> WorkflowNode:
    """用引擎内置安全表达式把岗位嵌套合同转换为可迭代任务数组。"""
    return WorkflowNode(
        node_key=node_key,
        type="code",
        name=name,
        position={"x": x, "y": y},
        config={
            "expression": expression,
            "inputs": inputs,
            "onError": "stop",
        },
    )


def _iteration(
    node_key: str,
    name: str,
    employee_key: str,
    array_template: str,
    user_input_template: str,
    x: int,
    y: int,
    *,
    max_parallel: int = 1,
) -> WorkflowNode:
    """逐资产调用对应媒体员工，避免单员工固定合同与批量输出相互冲突。"""
    return WorkflowNode(
        node_key=node_key,
        type="iteration",
        name=name,
        position={"x": x, "y": y},
        config={
            "employeeKey": employee_key,
            "arrayTemplate": array_template,
            "userInputTemplate": user_input_template,
            "maxParallel": max_parallel,
            "onError": "stop",
        },
    )


def _gate(node_key: str, name: str, qa_node: str, x: int, y: int) -> WorkflowNode:
    """把 QA 的 PASS/FAIL 字符串转换成条件分支；缺失、格式错误一律 FAIL。"""
    return WorkflowNode(
        node_key=node_key,
        type="condition",
        name=name,
        position={"x": x, "y": y},
        config={
            "cases": [{
                "label": "PASS",
                "var": f"{{{{{qa_node}.gate}}}}",
                "op": "eq",
                "value": "PASS",
            }],
            "elseLabel": "FAIL",
        },
    )


def _edge(source: str, target: str, source_handle: str | None = None) -> WorkflowEdge:
    """构造普通边或条件分支边。"""
    suffix = f":{source_handle}" if source_handle else ""
    return WorkflowEdge(
        edge_id=f"{source}->{target}{suffix}",
        source=source,
        target=target,
        source_handle=source_handle,
    )


def build_comic_drama_workflow(
    workflow_key: str = COMIC_WORKFLOW_KEY,
    *,
    legacy_entry: bool = False,
) -> WorkflowDefinition:
    """构建可执行的完整漫剧 DAG；总时长可变，每个生成单元不超过 6 秒。"""
    if legacy_entry:
        return _build_legacy_entry(workflow_key)

    nodes = [
        WorkflowNode(
            node_key="start",
            type="start",
            name="生产需求",
            position={"x": 40, "y": 400},
            config={"inputs": [
                {"name": "projectBrief", "label": "项目设定 / Art Bible", "required": True},
                {"name": "episodeBrief", "label": "本集剧情 / 制作需求", "required": True},
                {"name": "durationSeconds", "label": "目标总时长（秒）", "required": True},
                {"name": "aspectRatio", "label": "画幅（默认 9:16）"},
                {"name": "requirements", "label": "额外要求"},
            ]},
        ),
        _agent(
            "director", "总导演·创作简报", "comic-director",
            "输出本集唯一生产简报与岗位任务。先按‘目标—阻碍—有代价的选择—变化’"
            "明确戏剧主线，再设计观众信息路径、情绪曲线、转折和视觉策略，并写入 "
            "production_brief.delivery_spec.directorial_intent。给编剧任务设置因果升级、"
            "场景目标/冲突/转折/退出状态、行动塑造人物、潜台词和伏笔回收门禁；给分镜"
            "任务设置一镜一意图、景别/机位服务信息与情绪、可见可听描述、起止状态与"
            "时空连续性、静音/删镜检查门禁。总时长可以大于 6 秒；在交付规格中明确"
            "下游单镜默认不超过 6 秒且只做一个核心动作，但不要把计划写成已生成成品。\n"
            "【项目设定】\n{{start.projectBrief}}\n"
            "【本集需求】\n{{start.episodeBrief}}\n"
            "【总时长】{{start.durationSeconds}} 秒\n"
            "【画幅】{{start.aspectRatio}}\n"
            "【额外要求】{{start.requirements}}",
            260, 400, schema=DIRECTOR_SCHEMA,
        ),
        _agent(
            "writer", "编剧·剧本包", "comic-screenwriter",
            "读取导演简报中的 directorial_intent，把主角目标、中心阻碍、风险和有代价"
            "的选择写成由‘但是/因此’推进的纯剧本包，总时长与简报一致。每场明确进入"
            "状态、场景目标、对抗力量、失败代价、人物策略、转折和退出状态；每个节拍"
            "写可观察行动、台词/潜台词、声音与后果。关键转折必须来自人物主动选择，"
            "反转必须有前置线索，删除无状态变化且无铺垫/回收功能的场景。保持人物声音"
            "和连续性，不用旁白重复画面，不规定景别、运镜或模型提示词。\n"
            "【导演简报】\n{{director.output}}",
            500, 400, schema=WRITER_SCHEMA,
        ),
        _agent(
            "char_design", "人物设定", "comic-character-designer",
            "只建立本集实际出场角色的视觉身份与版本系统。把故事功能转换成剪影、比例、"
            "脸部识别点、发型、服装层级、材质、配色、道具和表演边界；明确不可变身份、"
            "阶段 variant、逐镜状态、适用范围与禁继承项。多人必须可从剪影/配色区分，"
            "设计复杂度必须支持跨视角稳定生成。不得引入其他项目角色或调用图片工具。\n"
            "【项目设定】\n{{start.projectBrief}}\n【剧本】\n{{writer.output}}",
            740, 220, schema=CHARACTER_SCHEMA,
        ),
        _agent(
            "scene_design", "场景设定", "comic-scene-designer",
            "只建立本集实际场景的空间母版与状态版本。根据剧情功能写清区域、出入口、"
            "高低关系、永久地标、尺度、行动/遮挡/危险区、主轴线、可用机位、材质和"
            "物理光源；场景必须支持剧本动作并能跨机位辨认。场景母版保持无人，不得"
            "混入其他项目地点或调用图片工具。\n"
            "【项目设定】\n{{start.projectBrief}}\n【剧本】\n{{writer.output}}",
            740, 580, schema=SCENE_SCHEMA,
        ),
        _agent(
            "storyboard", "独立分镜", "comic-storyboard",
            "把导演意图和剧本状态变化转换为镜头因果。先拆节拍；每镜写清唯一叙事意图、"
            "观众信息变化、目标情绪，并说明景别、机位、构图和运镜如何服务它。每镜绑定 "
            "beat_id、角色版本、场景与道具 ID，分别描述可见主体动作和摄影机运动，明确"
            "声音、转场、生成风险及起止状态；守住轴线、视线、画面方向、人物/道具位置"
            "和动作连续性。执行静音、删镜、连续性、生成性与总时长检查。当前视频生成链"
            "默认单镜不超过 6 秒且只做一个核心动作，超出时拆镜并保持总时长；不得改写"
            "核心剧情和对白。\n"
            "【剧本】\n{{writer.output}}\n"
            "【人物设定】\n{{char_design.output}}\n"
            "【场景设定】\n{{scene_design.output}}",
            980, 400, schema=STORYBOARD_SCHEMA,
        ),
        _agent(
            "vfx_action", "动作与特效设计", "comic-vfx-designer",
            "逐镜把动作拆成预备/重心转移、发力、路径、接触或转折、受力反馈、结果和"
            "恢复，分开记录人物、道具、环境与摄影机轨迹，并让 continuity_in/out 对应"
            "分镜起止状态。特效仅在有剧情来源时按 source/interaction/environment/"
            "residual 分层，写清时序、遮挡和消散；普通镜头允许为空。指出具体生成风险"
            "与拆镜建议，不改剧情、shot_id 或强加战斗光效。\n【分镜】\n{{storyboard.output}}",
            1220, 400, schema=SHOT_EFFECT_SCHEMA,
        ),
        _template(
            "spec_package", "规格包汇总",
            "【导演简报】\n{{director.output}}\n\n"
            "【剧本】\n{{writer.output}}\n\n"
            "【人物设定】\n{{char_design.output}}\n\n"
            "【场景设定】\n{{scene_design.output}}\n\n"
            "【分镜】\n{{storyboard.output}}\n\n"
            "【动作与特效】\n{{vfx_action.output}}",
            1460, 400,
        ),
        WorkflowNode(
            node_key="spec_audit",
            type="comic-contract-audit",
            name="规格合同审计",
            position={"x": 1680, "y": 400},
            config={
                "inputs": {
                    "director": "{{director.production_brief}}",
                    "script": "{{writer.script_package}}",
                    "characters": "{{char_design.character_bible}}",
                    "scenes": "{{scene_design.scene_bible}}",
                    "storyboard": "{{storyboard.storyboard}}",
                    "action_vfx": "{{vfx_action.action_vfx_package}}",
                },
                "onError": "stop",
            },
        ),
        _gate("spec_contract_gate", "合同门禁", "spec_audit", 1900, 400),
        _agent(
            "spec_qa", "规格 QA", "comic-qa-inspector",
            "对规格包做生产前证据门禁：检查导演意图承接、剧本因果与人物主动选择、"
            "人物/场景版本、镜头叙事字段、ID 引用、时长求和、起止连续性、动作/VFX"
            "可执行性和提示词前置条件。每个问题绑定观察事实、expected、severity、责任"
            "岗位与最小返工。任何阻断项都必须 gate=FAIL；只有证据完整且 blockers 为空"
            "且 qa_report.verdict=pass 才能 gate=PASS。确定性合同审计只要出现 FAIL 或 errors，"
            "本节点不得覆盖或降级其结论。"
            "顶层 gate 必须与 qa_report.verdict 一致。\n"
            "【确定性合同审计】\n{{spec_audit.output}}\n"
            "【规格包】\n{{spec_package.output}}",
            2120, 400, schema=_qa_schema("SPEC"),
        ),
        _gate("spec_gate", "规格门禁", "spec_qa", 2340, 400),
        _agent(
            "image_prompt", "图片提示词规格", "comic-prompt-engineer",
            "以 IMAGE 模式把已通过门禁的人物、场景、分镜和动作包编译成角色、场景、"
            "关键帧三类任务。逐项建立来源/参考映射，绑定稳定资产 ID 与版本；正向 prompt"
            "只写可见目标，negative_prompt 独立；关键帧只描述一个冻结时刻。每项执行"
            "语义、版本、引用真实性、模型参数和可提交性 validation；错误非空即 blocked。"
            "只输出规格，不调用图片工具或把提示词称为成品。\n"
            "【规格包】\n{{spec_package.output}}\n"
            "【规格 QA】\n{{spec_qa.output}}",
            2560, 400, schema=IMAGE_PROMPT_SCHEMA,
        ),
        _code(
            "character_tasks", "角色图片任务",
            'package.get("character_assets",[])',
            {"package": "{{image_prompt.image_prompt_package}}"},
            2780, 100,
        ),
        _code(
            "scene_tasks", "场景图片任务",
            'package.get("scene_assets",[])',
            {"package": "{{image_prompt.image_prompt_package}}"},
            2780, 400,
        ),
        _code(
            "keyframe_tasks", "关键帧任务",
            'package.get("keyframe_assets",[])',
            {"package": "{{image_prompt.image_prompt_package}}"},
            2780, 700,
        ),
        _iteration(
            "char_art", "角色母版生成", "comic-character-artist",
            "{{character_tasks.items}}",
            "执行最终角色母版任务。先核对 asset/character/version/variant、视图、prompt、"
            "size、quality 和 validation=ready，再原样调用 generate_image；不得重新设计、"
            "润色 prompt 或处理其他角色。避免重复提交，工具证据原样写入固定 JSON。\n"
            "【单项任务】\n{{__item__}}",
            3000, 100, max_parallel=2,
        ),
        _iteration(
            "scene_art", "场景母版生成", "comic-scene-artist",
            "{{scene_tasks.items}}",
            "执行最终纯场景母版任务。先核对 asset/scene/version/view、prompt、size、quality"
            "和 validation=ready，再原样调用 generate_image；不得重设计或润色 prompt，"
            "不得加入主要人物。避免重复提交，工具证据原样写入固定 JSON。\n"
            "【单项任务】\n{{__item__}}",
            3000, 400, max_parallel=2,
        ),
        _iteration(
            "keyframe_art", "关键帧生成", "comic-keyframe-artist",
            "{{keyframe_tasks.items}}",
            "执行最终关键帧任务。先核对 asset/shot/frame_role、单一时间点、人物/场景版本、"
            "prompt、size、quality 和 validation=ready，再原样调用 generate_image；不得设计/"
            "改写提示词，不得改 shot_id、版本、构图或动作结果。避免重复提交，工具证据原样写入固定 JSON。\n"
            "【单项任务】\n{{__item__}}\n"
            "【动作与特效包】\n{{vfx_action.output}}",
            3000, 700, max_parallel=2,
        ),
        _template(
            "image_package", "图片资产汇总",
            "【角色母版】\n{{char_art.output}}\n\n"
            "【场景母版】\n{{scene_art.output}}\n\n"
            "【关键帧】\n{{keyframe_art.output}}\n\n"
            "【预期分镜】\n{{storyboard.output}}",
            3240, 400,
        ),
        _agent(
            "image_qa", "图片 QA", "comic-qa-inspector",
            "执行图片资产门禁：先核对预期 ID、工具调用证据、READY 状态、真实 URL、模型"
            "和缺失项，再提取全部 READY 图片 URL，必须实际调用 inspect_media，"
            "inspection_type=image，criteria 使用逐资产规格，检查身份/版本、人数、解剖手部、"
            "服装道具、空间地标/光源、构图时刻、水印与生成瑕疵。将工具视觉证据合并进"
            "qa_report，并给出 severity、责任岗位和最小返工。inspect_media 未调用/失败/"
            "blocked、URL 缺失或预期资产缺失"
            "都必须 gate=FAIL；仅 qa_report.verdict=pass 时 gate=PASS。\n"
            "【规格包】\n{{spec_package.output}}\n"
            "【图片资产包】\n{{image_package.output}}",
            3460, 400, schema=_qa_schema("IMAGE"),
        ),
        _gate("image_gate", "图片门禁", "image_qa", 3680, 400),
        _agent(
            "video_prompt", "视频提示词编译", "comic-prompt-engineer",
            "把通过门禁的分镜、动作特效包和真实图片 URL 编译成逐镜视频生成包。按"
            "起始状态→主体动作/受力→环境响应→结束状态组织 prompt，单独写唯一运镜和音频。"
            "每条 duration 为 1-6 秒，绑定 shot_id、目标模型、generation_mode 和真实引用；"
            "keyframe 与 reference 模式互斥，执行语义、版本、引用、参数和连续性 validation。"
            "不得输出整集一次生成的合并提示词，也不得声称视频已生成。\n"
            "【规格包】\n{{spec_package.output}}\n"
            "【图片资产】\n{{image_package.output}}\n"
            "【图片 QA】\n{{image_qa.output}}",
            3900, 400, schema=VIDEO_PROMPT_SCHEMA,
        ),
        _code(
            "video_tasks", "视频任务拆分",
            'package.get("shots",[])',
            {"package": "{{video_prompt.video_prompt_package}}"},
            4120, 400,
        ),
        _iteration(
            "video_generation", "视频生成", "comic-video-artist",
            "{{video_tasks.items}}",
            "执行这个 shot_id 的最终视频任务。先核对 validation=ready、模型、1-6 秒参数、"
            "连续性与 keyframe/reference 模式互斥，再按单项参数原样调用 generate_video；"
            "以 shot_id/输入指纹避免重复提交。流程已进入轮询阶段：提交成功后调用"
            " check_video_generation 一次并如实保留 pending/completed/failed 状态。"
            "不得编造 URL 或完成状态。\n【单项视频任务】\n{{__item__}}",
            4340, 400,
        ),
        _agent(
            "video_qa", "视频 QA", "comic-qa-inspector",
            "执行视频交付门禁：逐生成单元核对真实 jobId、状态、URL、时长和顺序。"
            "只有全部任务 completed 且有平台 /uploads/ URL 才可继续；然后必须实际调用"
            " inspect_media，inspection_type=video，criteria 使用镜头语义、起止状态、身份/"
            "服装、时空连续、动作受力、物体穿插、闪烁融化、运镜、时长顺序和音画标准。"
            "将抽帧证据及 severity/责任岗位/最小返工合并进 qa_report。pending/failed/缺失、"
            "inspect_media 未调用/失败/"
            "blocked 都必须 gate=FAIL；仅 qa_report.verdict=pass 时 gate=PASS。\n"
            "【分镜】\n{{storyboard.output}}\n"
            "【视频任务】\n{{video_generation.output}}",
            4560, 400, schema=_qa_schema("VIDEO"),
        ),
        _gate("video_gate", "视频门禁", "video_qa", 4780, 400),
        WorkflowNode(
            node_key="end",
            type="end",
            name="生产交付",
            position={"x": 5020, "y": 400},
            config={"outputTemplate":
                "# 漫剧生产结果\n\n"
                "## 确定性合同审计\n{{spec_audit.output}}\n\n"
                "## 规格门禁\n{{spec_qa.output}}\n\n"
                "## 图片门禁\n{{image_qa.output}}\n\n"
                "## 视频门禁\n{{video_qa.output}}\n\n"
                "## 图片资产\n{{image_package.output}}\n\n"
                "## 视频资产\n{{video_generation.output}}"
            },
        ),
    ]

    edges = [
        _edge("start", "director"),
        _edge("director", "writer"),
        _edge("writer", "char_design"),
        _edge("writer", "scene_design"),
        _edge("char_design", "storyboard"),
        _edge("scene_design", "storyboard"),
        _edge("storyboard", "vfx_action"),
        _edge("vfx_action", "spec_package"),
        _edge("spec_package", "spec_audit"),
        _edge("spec_audit", "spec_contract_gate"),
        _edge("spec_contract_gate", "spec_qa", "PASS"),
        _edge("spec_contract_gate", "end", "FAIL"),
        _edge("spec_qa", "spec_gate"),
        _edge("spec_gate", "image_prompt", "PASS"),
        _edge("spec_gate", "end", "FAIL"),
        _edge("image_prompt", "character_tasks"),
        _edge("image_prompt", "scene_tasks"),
        _edge("image_prompt", "keyframe_tasks"),
        _edge("character_tasks", "char_art"),
        _edge("scene_tasks", "scene_art"),
        _edge("keyframe_tasks", "keyframe_art"),
        _edge("char_art", "image_package"),
        _edge("scene_art", "image_package"),
        _edge("keyframe_art", "image_package"),
        _edge("image_package", "image_qa"),
        _edge("image_qa", "image_gate"),
        _edge("image_gate", "video_prompt", "PASS"),
        _edge("image_gate", "end", "FAIL"),
        _edge("video_prompt", "video_tasks"),
        _edge("video_tasks", "video_generation"),
        _edge("video_generation", "video_qa"),
        _edge("video_qa", "video_gate"),
        _edge("video_gate", "end", "PASS"),
        _edge("video_gate", "end", "FAIL"),
    ]

    description = (
        "总导演 → 编剧 → 人物/场景设计 → 独立分镜 → 特效/动作 → 确定性合同审计 → 规格 QA → "
        "角色/场景/关键帧生成 → 图片 QA → 视频提示词 → 视频生成 → 视频 QA → 交付"
    )

    return WorkflowDefinition(
        workflow_key=workflow_key,
        name="漫剧生产流水线",
        description=description,
        team_code=COMIC_TEAM_CODE,
        nodes=nodes,
        edges=edges,
        enabled=True,
        builtinRevision=COMIC_WORKFLOW_REVISION,
    )


def _build_legacy_entry(workflow_key: str) -> WorkflowDefinition:
    """旧 key 仅做代理，避免维护两份会漂移的生产 DAG。"""
    nodes = [
        WorkflowNode(
            node_key="start",
            type="start",
            name="生产需求",
            position={"x": 40, "y": 240},
            config={"inputs": [
                {"name": "projectBrief", "label": "项目设定 / Art Bible", "required": True},
                {"name": "episodeBrief", "label": "本集剧情 / 制作需求", "required": True},
                {"name": "durationSeconds", "label": "目标总时长（秒）", "required": True},
                {"name": "aspectRatio", "label": "画幅（默认 9:16）"},
                {"name": "requirements", "label": "额外要求"},
            ]},
        ),
        WorkflowNode(
            node_key="production",
            type="sub-workflow",
            name="调用标准漫剧生产流水线",
            position={"x": 300, "y": 240},
            config={
                "workflowKey": COMIC_WORKFLOW_KEY,
                "inputsTemplate": {
                    "projectBrief": "{{start.projectBrief}}",
                    "episodeBrief": "{{start.episodeBrief}}",
                    "durationSeconds": "{{start.durationSeconds}}",
                    "aspectRatio": "{{start.aspectRatio}}",
                    "requirements": "{{start.requirements}}",
                },
                "onError": "stop",
            },
        ),
        WorkflowNode(
            node_key="end",
            type="end",
            name="生产交付",
            position={"x": 560, "y": 240},
            config={"outputTemplate": "{{production.output}}"},
        ),
    ]
    return WorkflowDefinition(
        workflow_key=workflow_key,
        name="漫剧生产流水线（兼容旧入口）",
        description="旧工作流键的兼容入口；所有任务转交标准漫剧生产流水线执行。",
        team_code=COMIC_TEAM_CODE,
        nodes=nodes,
        edges=[
            _edge("start", "production"),
            _edge("production", "end"),
        ],
        enabled=True,
        builtinRevision=COMIC_WORKFLOW_REVISION,
    )


def _needs_builtin_upgrade(existing: WorkflowDefinition | None) -> bool:
    """仅升级系统内置且修订号落后的定义；用户拥有的同名定义保持不动。"""
    if existing is None:
        return True
    if existing.owner_user_id is not None:
        return False
    try:
        revision = int(getattr(existing, "builtinRevision", 0) or 0)
    except (TypeError, ValueError):
        revision = 0
    return revision < COMIC_WORKFLOW_REVISION


def seed_comic_drama() -> None:
    """幂等种入/升级两条内置入口，并补齐团队岗位与默认工作流。"""
    from app.dependencies import team_registry, workflow_registry

    definitions = [
        build_comic_drama_workflow(),
        build_comic_drama_workflow(
            COMIC_LEGACY_WORKFLOW_KEY,
            legacy_entry=True,
        ),
    ]
    for definition in definitions:
        existing = workflow_registry.get(definition.workflow_key)
        if _needs_builtin_upgrade(existing):
            workflow_registry.save(definition)
            logger.info(
                "已种入/升级漫剧工作流：%s（revision=%d）",
                definition.workflow_key,
                COMIC_WORKFLOW_REVISION,
            )

    team = team_registry.get(COMIC_TEAM_CODE)
    if team is not None:
        team_changed = False
        desired_roles = [
            TeamRole(employee_key=key, stage=stage, order=order)
            for (key, stage, order) in COMIC_ROLES
            if key in team.member_employee_keys
        ]
        roles_changed = [
            (role.employee_key, role.stage, role.order)
            for role in (team.roles or [])
        ] != [
            (role.employee_key, role.stage, role.order)
            for role in desired_roles
        ]
        if roles_changed:
            team.roles = desired_roles
            team_changed = True
        if not team.leader_employee_key:
            team.leader_employee_key = "comic-director"
            team_changed = True
        if team.default_workflow_key != COMIC_WORKFLOW_KEY:
            team.default_workflow_key = COMIC_WORKFLOW_KEY
            team_changed = True
        if team_changed:
            team_registry.save(team)
            logger.info("已补全团队结构：%s（roles=%d）", COMIC_TEAM_CODE, len(team.roles))
