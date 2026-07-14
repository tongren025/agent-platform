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
    """构造一个 agent 节点：绑定员工 + 用户输入模板，出错时继续（onError=continue）。"""
    return WorkflowNode(
        node_key=node_key, type="agent", name=name,
        position={"x": x, "y": y},
        config={"employeeKey": emp, "userInputTemplate": tmpl, "onError": "continue"},
    )


def _tmpl(node_key: str, name: str, tmpl: str, x: int, y: int) -> WorkflowNode:
    """构造一个 template 节点：纯文本拼接上游产出，不调用 LLM。"""
    return WorkflowNode(node_key=node_key, type="template", name=name,
                        position={"x": x, "y": y}, config={"template": tmpl})


def build_comic_drama_workflow() -> WorkflowDefinition:
    """构建漫剧创作流水线的完整工作流定义：统筹→编剧→设计(并行)→提示词→生成(并行)→成片。"""
    nodes = [
        WorkflowNode(node_key="start", type="start", name="题材输入",
                     position={"x": 40, "y": 300},
                     config={"inputs": [{"name": "theme", "label": "漫剧题材 / 梗概"}]}),
        _agent("director", "导演·统筹", "comic-director",
               "你是导演。把下面的题材拆成一份创作简报（题材定位、目标受众、核心看点、分集数量建议）：\n{{start.theme}}",
               260, 300),
        _agent("writer", "编剧·剧本", "comic-screenwriter",
               "根据创作简报写成可生产的逐镜剧本：G 单元拆为 2-6 秒生成子段，写清可见动作因果、台词、音效和资产需求：\n{{director.output}}",
               480, 300),
        _agent("char_design", "角色设计", "comic-character-designer",
               "根据剧本建立 R 编号、角色版本 ID、适用集数、母版引用和本集版本清单：\n{{writer.output}}", 720, 120),
        _agent("scene_design", "场景设计", "comic-scene-designer",
               "根据剧本建立可行动的 SCENE 资产卡，写清入口出口、前中后景、地标、行动区、轴线和光源：\n{{writer.output}}", 720, 300),
        _agent("storyboard", "分镜", "comic-storyboard",
               "根据剧本、角色版本和场景资产制作逐镜分镜；每镜完整写起止姿态、画面位置、前中后景、视线/运动方向和连续性：\n"
               "【剧本】\n{{writer.output}}\n\n【角色版本】\n{{char_design.output}}\n\n【场景资产】\n{{scene_design.output}}", 980, 480),
        _tmpl("compose_design", "设定汇总",
              "【角色设定】\n{{char_design.output}}\n\n【场景设定】\n{{scene_design.output}}\n\n【分镜】\n{{storyboard.output}}",
              1220, 300),
        _agent("prompt_eng", "提示词工程", "comic-prompt-engineer",
               "把已通过的设定和逐镜分镜转成结构化图片/视频提示词；正向与负向字段分离，按 2-6 秒子段输出并执行视觉降噪预算：\n{{compose_design.output}}",
               1460, 300),
        _agent("char_art", "角色原画", "comic-character-artist",
               "根据角色资产提示词产出干净角色母版说明，不加入战斗场景特效：\n{{prompt_eng.output}}", 1700, 120),
        _agent("scene_art", "场景原画", "comic-scene-artist",
               "根据 SCENE 资产提示词产出低噪点场景母版和分镜角度图：\n{{prompt_eng.output}}", 1700, 300),
        _agent("keyframe_art", "关键帧", "comic-keyframe-artist",
               "按镜头运动幅度选择 1 张首帧或 2 张 FLF 代表帧，不默认九宫格：\n{{prompt_eng.output}}", 1700, 480),
        _tmpl("compose_final", "成片汇总",
              "【角色原画】\n{{char_art.output}}\n\n【场景原画】\n{{scene_art.output}}\n\n【关键帧】\n{{keyframe_art.output}}",
              1940, 300),
        WorkflowNode(node_key="end", type="end", name="交付",
                     position={"x": 2180, "y": 300},
                     config={"outputTemplate": "{{compose_final.output}}"}),
    ]

    def edge(s: str, t: str) -> WorkflowEdge:
        """简写工厂：按 source->target 命名规则构造一条普通边。"""
        return WorkflowEdge(edge_id=f"{s}->{t}", source=s, target=t, source_handle=None)

    edges = [
        edge("start", "director"), edge("director", "writer"),
        edge("writer", "char_design"), edge("writer", "scene_design"),
        edge("char_design", "storyboard"), edge("scene_design", "storyboard"),
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
