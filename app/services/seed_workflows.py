"""
种子工作流：把 9 人漫剧团队的真实「编剧→设计→生成」流水线编码成一张 WorkflowDefinition，
作为 DIFY 式编排的范例，同时给 comic-drama-team 补上真实的 roles（阶段）与 default_workflow_key。

幂等：只在工作流不存在 / 团队 roles 未设置时种入，不覆盖用户已改的数据。
"""
from __future__ import annotations

import logging

from app.models.registry import TeamRole
from app.models.workflow import WorkflowDefinition, WorkflowEdge, WorkflowNode

logger = logging.getLogger(__name__)

COMIC_WORKFLOW_KEY = "comic-drama"
COMIC_TEAM_CODE = "comic-drama-team"

# 员工 -> (阶段, 阶段内排序)，作为团队 roles 的真实来源（替代前端 tag 猜测）
COMIC_ROLES: list[tuple[str, str, int]] = [
    ("comic-director", "统筹", 0),
    ("comic-screenwriter", "创作", 0),
    ("comic-character-designer", "设计", 0),
    ("comic-scene-designer", "设计", 1),
    ("comic-storyboard", "设计", 2),
    ("comic-prompt-engineer", "生成", 0),
    ("comic-character-artist", "生成", 1),
    ("comic-scene-artist", "生成", 2),
    ("comic-keyframe-artist", "生成", 3),
]


def _agent(node_key: str, name: str, emp: str, tmpl: str, x: int, y: int) -> WorkflowNode:
    return WorkflowNode(
        node_key=node_key, type="agent", name=name,
        position={"x": x, "y": y},
        config={"employeeKey": emp, "userInputTemplate": tmpl, "onError": "continue"},
    )


def _tmpl(node_key: str, name: str, tmpl: str, x: int, y: int) -> WorkflowNode:
    return WorkflowNode(node_key=node_key, type="template", name=name,
                        position={"x": x, "y": y}, config={"template": tmpl})


def build_comic_drama_workflow() -> WorkflowDefinition:
    nodes = [
        WorkflowNode(node_key="start", type="start", name="题材输入",
                     position={"x": 40, "y": 300},
                     config={"inputs": [{"name": "theme", "label": "漫剧题材 / 梗概"}]}),
        _agent("director", "导演·统筹", "comic-director",
               "你是导演。把下面的题材拆成一份创作简报（题材定位、目标受众、核心看点、分集数量建议）：\n{{start.theme}}",
               260, 300),
        _agent("writer", "编剧·剧本", "comic-screenwriter",
               "你是编剧。根据创作简报写出分集剧本大纲（每集梗概 + 关键台词）：\n{{director.output}}",
               480, 300),
        _agent("char_design", "角色设计", "comic-character-designer",
               "根据剧本设计主要角色（外形、性格、服装）：\n{{writer.output}}", 720, 120),
        _agent("scene_design", "场景设计", "comic-scene-designer",
               "根据剧本设计主要场景（环境、氛围、关键道具）：\n{{writer.output}}", 720, 300),
        _agent("storyboard", "分镜", "comic-storyboard",
               "根据剧本制作关键分镜（镜头、构图、节奏）：\n{{writer.output}}", 720, 480),
        _tmpl("compose_design", "设定汇总",
              "【角色设定】\n{{char_design.output}}\n\n【场景设定】\n{{scene_design.output}}\n\n【分镜】\n{{storyboard.output}}",
              980, 300),
        _agent("prompt_eng", "提示词工程", "comic-prompt-engineer",
               "把以下设定转化为可直接出图的中文绘图提示词（分角色/场景/关键帧三组）：\n{{compose_design.output}}",
               1220, 300),
        _agent("char_art", "角色原画", "comic-character-artist",
               "根据提示词产出角色原画说明：\n{{prompt_eng.output}}", 1460, 120),
        _agent("scene_art", "场景原画", "comic-scene-artist",
               "根据提示词产出场景原画说明：\n{{prompt_eng.output}}", 1460, 300),
        _agent("keyframe_art", "关键帧", "comic-keyframe-artist",
               "根据提示词产出关键帧画面说明：\n{{prompt_eng.output}}", 1460, 480),
        _tmpl("compose_final", "成片汇总",
              "【角色原画】\n{{char_art.output}}\n\n【场景原画】\n{{scene_art.output}}\n\n【关键帧】\n{{keyframe_art.output}}",
              1720, 300),
        WorkflowNode(node_key="end", type="end", name="交付",
                     position={"x": 1960, "y": 300},
                     config={"outputTemplate": "{{compose_final.output}}"}),
    ]

    def edge(s: str, t: str) -> WorkflowEdge:
        return WorkflowEdge(edge_id=f"{s}->{t}", source=s, target=t, source_handle=None)

    edges = [
        edge("start", "director"), edge("director", "writer"),
        edge("writer", "char_design"), edge("writer", "scene_design"), edge("writer", "storyboard"),
        edge("char_design", "compose_design"), edge("scene_design", "compose_design"), edge("storyboard", "compose_design"),
        edge("compose_design", "prompt_eng"),
        edge("prompt_eng", "char_art"), edge("prompt_eng", "scene_art"), edge("prompt_eng", "keyframe_art"),
        edge("char_art", "compose_final"), edge("scene_art", "compose_final"), edge("keyframe_art", "compose_final"),
        edge("compose_final", "end"),
    ]

    return WorkflowDefinition(
        workflow_key=COMIC_WORKFLOW_KEY,
        name="漫剧创作流水线",
        description="导演统筹 → 编剧 → 角色/场景/分镜设计（并行）→ 提示词工程 → 角色/场景/关键帧生成（并行）→ 成片",
        team_code=COMIC_TEAM_CODE,
        nodes=nodes,
        edges=edges,
        enabled=True,
    )


def seed_comic_drama() -> None:
    """幂等种入：漫剧工作流 + 团队 roles/leader/default_workflow_key。"""
    from app.dependencies import team_registry, workflow_registry

    if not workflow_registry.exists(COMIC_WORKFLOW_KEY):
        workflow_registry.save(build_comic_drama_workflow())
        logger.info("已种入漫剧工作流：%s", COMIC_WORKFLOW_KEY)

    team = team_registry.get(COMIC_TEAM_CODE)
    if team is not None and not team.roles:
        team.roles = [
            TeamRole(employee_key=k, stage=stage, order=order)
            for (k, stage, order) in COMIC_ROLES
            if k in team.member_employee_keys
        ]
        if not team.leader_employee_key:
            team.leader_employee_key = "comic-director"
        if not team.default_workflow_key:
            team.default_workflow_key = COMIC_WORKFLOW_KEY
        team_registry.save(team)
        logger.info("已补全团队结构：%s（roles=%d）", COMIC_TEAM_CODE, len(team.roles))
