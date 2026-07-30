"""
种子工作流：把漫剧一人团队的「一句话→成片」专业流水线编码成 WorkflowDefinition，
同时给 comic-drama-team 补上真实 roles（阶段）与 default_workflow_key。

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
    ("comic-director", "01 故事策划", 0),
    ("comic-screenwriter", "02 剧本", 0),
    ("comic-vfx-designer", "03 视觉风格", 0),
    ("comic-character-designer", "04 人物资产", 0),
    ("comic-character-artist", "04 人物资产", 1),
    ("comic-scene-designer", "05 场景资产", 0),
    ("comic-scene-artist", "05 场景资产", 1),
    ("comic-storyboard", "06 逐镜分镜", 0),
    ("comic-trajectory-artist", "07 镜头动态设计", 0),
    ("comic-prompt-engineer", "08 关键帧准备", 0),
    ("comic-keyframe-artist", "08 关键帧准备", 1),
    ("comic-video-artist", "09 视频生成", 0),
    ("comic-qa-inspector", "10 审片成片", 0),
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
    """构建面向零基础用户的漫剧单线工作流，每一节点只消费已验收的上一步资产。"""
    nodes = [
        WorkflowNode(node_key="start", type="start", name="一句话创意",
                     position={"x": 40, "y": 300},
                     config={"inputs": [{"name": "theme", "label": "用一句话说出你想看的故事"}]}),
        _agent("director", "第1步·故事创作简报", "comic-director",
               "把用户的一句话整理成创作简报，只交付类型、受众、故事背景、核心冲突、情绪承诺、画幅/时长建议和结尾钩子；最后只给“生成剧本”这一个下一步：\n{{start.theme}}",
               260, 300),
        _agent("writer", "第2步·剧本", "comic-screenwriter",
               "根据创作简报先交付故事设定（世界观、时代地点、人物关系、剧情脉络、核心冲突），再写可生产短剧剧本（场次、逐镜 2-6 秒可见动作、对白/旁白、情绪、声音和结尾钩子）。只交付故事设定、剧本与资产需求，不写生图提示词：\n{{director.output}}",
               480, 300),
        _agent("visual_bible", "第3步·视觉风格母版", "comic-vfx-designer",
               "根据剧本建立全项目视觉风格母版：画风/媒介、画幅、线条材质、色彩系统、主辅光、镜头质感、特效语法，以及一条无具体剧情的风格样张生图提示词。不得提前做人物和场景：\n{{writer.output}}",
               700, 300),
        _agent("char_design", "第4步·人物版本", "comic-character-designer",
               "只根据剧本和视觉母版建立 R 编号、角色版本、适用集数、身份 DNA、表情需求和服装变体清单：\n【剧本】\n{{writer.output}}\n\n【视觉母版】\n{{visual_bible.output}}",
               920, 300),
        _agent("char_art", "第4步·人物三视图", "comic-character-artist",
               "把已批准角色版本转成角色设定板提示词：正面/侧面/背面三视图、至少 6 种表情、基础服装与剧情服装变体，纯净背景，继承视觉母版：\n【视觉母版】\n{{visual_bible.output}}\n\n【角色版本】\n{{char_design.output}}",
               1140, 300),
        _agent("scene_design", "第5步·场景与道具", "comic-scene-designer",
               "根据剧本、视觉母版和人物资产建立 SCENE 卡：入口出口、前中后景、永久地标、行动区、轴线、主辅光和关键道具：\n【剧本】\n{{writer.output}}\n\n【视觉母版】\n{{visual_bible.output}}\n\n【人物资产】\n{{char_art.output}}",
               1360, 300),
        _agent("scene_art", "第5步·场景母版图", "comic-scene-artist",
               "把场景卡转成无人物空间母版、分镜可复用角度和关键道具的干净生图提示词，继承视觉母版：\n【视觉母版】\n{{visual_bible.output}}\n\n【场景卡】\n{{scene_design.output}}",
               1580, 300),
        _agent("storyboard", "第6步·逐镜分镜", "comic-storyboard",
               "用已批准剧本、人物三视图和场景母版制作逐镜分镜；每镜写时间、目的、景别机位、前中后景、画面位置、起止姿态、光线声音和连续性：\n"
               "【剧本】\n{{writer.output}}\n\n【人物】\n{{char_art.output}}\n\n【场景】\n{{scene_art.output}}",
               1800, 300),
        _agent("motion", "第7步·镜头动态设计", "comic-trajectory-artist",
               "每一个分镜都必须有对应镜头动态设计（固定镜头也不能跳过）：写清时长、人物起止位置、身体动作、物体运动、屏幕方向、摄影机起止机位、焦距/焦点、唯一运镜、速度节奏、剪辑点和相邻镜姿态承接；标出需要 3D 站位/相机轨迹参考的复杂镜头：\n{{storyboard.output}}",
               2020, 300),
        _agent("prompt_eng", "第8步·关键帧提示词", "comic-prompt-engineer",
               "把视觉母版、人物/场景资产、分镜和运动设计转成逐镜首帧/可选尾帧与视频提示词；正负字段分离，每段 2-6 秒：\n"
               "【视觉母版】\n{{visual_bible.output}}\n\n【人物】\n{{char_art.output}}\n\n【场景】\n{{scene_art.output}}\n\n【分镜】\n{{storyboard.output}}\n\n【运动】\n{{motion.output}}",
               2240, 300),
        _agent("keyframe_art", "第8步·首尾关键帧", "comic-keyframe-artist",
               "按运动幅度为每镜选择 1 张首帧，确有大幅位移/变装/连续性风险时再加尾帧；不默认九宫格：\n{{prompt_eng.output}}",
               2460, 300),
        _agent("video", "第9步·逐镜视频", "comic-video-artist",
               "根据已批准的视频提示词、运动设计和首尾关键帧建立逐镜 2-6 秒视频任务。只有输入明确包含用户额度确认时才调用真实生成，否则只返回待确认任务清单：\n"
               "【视频提示词】\n{{prompt_eng.output}}\n\n【运动设计】\n{{motion.output}}\n\n【关键帧】\n{{keyframe_art.output}}",
               2680, 300),
        _agent("qa", "第10步·审片剪辑声音", "comic-qa-inspector",
               "检查文本、图片、视频和时间轴证据；输出镜头连续性、节奏、转场、对白/旁白、环境音、音效、BGM、字幕安全区和导出规格的返工单。缺视频或时间轴时必须写未检：\n"
               "【剧本】\n{{writer.output}}\n\n【视觉母版】\n{{visual_bible.output}}\n\n【视频任务/结果】\n{{video.output}}",
               2900, 300),
        WorkflowNode(node_key="end", type="end", name="成片交付",
                     position={"x": 3120, "y": 300},
                     config={"outputTemplate": "{{qa.output}}"}),
    ]

    def edge(s: str, t: str) -> WorkflowEdge:
        """简写工厂：按 source->target 命名规则构造一条普通边。"""
        return WorkflowEdge(edge_id=f"{s}->{t}", source=s, target=t, source_handle=None)

    edges = [
        edge("start", "director"), edge("director", "writer"),
        edge("writer", "visual_bible"), edge("visual_bible", "char_design"),
        edge("char_design", "char_art"), edge("char_art", "scene_design"),
        edge("scene_design", "scene_art"), edge("scene_art", "storyboard"),
        edge("storyboard", "motion"), edge("motion", "prompt_eng"),
        edge("prompt_eng", "keyframe_art"), edge("keyframe_art", "video"),
        edge("video", "qa"), edge("qa", "end"),
    ]

    return WorkflowDefinition(
        workflow_key=COMIC_WORKFLOW_KEY,
        name="漫剧一句话到成片",
        description="一句创意 → 故事设定/剧本 → 视觉风格母版 → 人物三视图/表情/服装 → 场景/道具 → 逐镜分镜 → 镜头动态设计 → 首尾关键帧 → 逐镜视频 → 审片/剪辑/声音/成片",
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
