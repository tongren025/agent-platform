"""Production pipeline models — from idea to final cut."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field

STAGES = [
    {"key": "idea", "name": "创意/原著", "order": 0, "auto": False},
    {"key": "script", "name": "剧本", "order": 1, "auto": True},
    {"key": "setting", "name": "角色·场景", "order": 2, "auto": True},
    {"key": "design", "name": "视觉设计", "order": 3, "auto": True},
    {"key": "storyboard", "name": "分镜", "order": 4, "auto": True},
    {"key": "img_prompt", "name": "图片提示词", "order": 5, "auto": True},
    {"key": "vid_prompt", "name": "视频提示词", "order": 6, "auto": True},
    {"key": "img_gen", "name": "生图", "order": 7, "auto": False},
    {"key": "vid_gen", "name": "生视频", "order": 8, "auto": False},
    {"key": "final", "name": "成片", "order": 9, "auto": False},
]

STAGE_KEYS = [s["key"] for s in STAGES]

ROLES = ["owner", "editor", "viewer"]

# 各阶段的 AI 生成指令模板——看板逐阶段生成与画布 AI 派生共用,
# 输出约定:条目用 --- 分隔,首行标题,其余为内容。
STAGE_INSTRUCTIONS: dict[str, str] = {
    "script": (
        "根据上面的创意/原著内容，写出完整的剧本。"
        "按场景拆分，每个场景包含：场景编号、场景描述、角色、台词、情绪/氛围。"
        "输出格式：每个场景用 --- 分隔，每个场景第一行是标题（如：场景1: xxx）。"
    ),
    "setting": (
        "根据剧本内容，输出角色设定和场景设定的文字描述。\n"
        "角色设定：每个角色的身份层（外貌、年龄、体型）、装备层（服装、武器、道具）、可变层（表情/情绪状态）。\n"
        "场景设定：每个场景的空间结构、光影设计（主光源+补光）、色温、氛围。\n"
        "输出格式：先角色后场景，每个用 --- 分隔，第一行标题（如：角色: 苍霖 或 场景: 废墟巷道）。"
    ),
    "design": (
        "根据角色·场景设定的文字描述，输出视觉设计参考。\n"
        "角色：正面全身定妆照描述、三视图要求、关键特征提示词。\n"
        "场景：场景概念图描述、关键光影和色彩提示词。\n"
        "道具：关键道具的外观描述和特效层。\n"
        "输出格式：每个用 --- 分隔，第一行标题（如：角色设计: 苍霖 或 场景设计: 废墟巷道）。"
    ),
    "storyboard": (
        "根据剧本、角色场景设定和视觉设计，拆分成分镜头脚本。\n"
        "每个镜头包含：镜头编号、画面描述（引用角色设定和场景设定的视觉关键词）、"
        "景别/角度、运镜方式（推/拉/摇/移/固定）、时长建议、角色动作、台词/旁白、音效。"
        "输出格式：每个镜头用 --- 分隔，第一行标题（如：镜头01: xxx）。"
    ),
    "img_prompt": (
        "根据分镜和视觉设计，为每个镜头生成一条图片生成提示词。\n"
        "提示词要求：包含画面主体、环境、光线、构图、风格、画质关键词。\n"
        "角色描述必须引用角色设定中的固定词，确保一致性。\n"
        "竖屏 9:16 比例。\n"
        "输出格式：每个镜头用 --- 分隔，第一行标题（如：镜头01），第二行起是提示词。"
    ),
    "vid_prompt": (
        "根据分镜和图片提示词，为每个镜头生成一条视频生成提示词。\n"
        "遵循 Seedance 2.0 格式：画面描述 + 动作 + 运镜 + 氛围。\n"
        "规则：无负向词、单段 ≤6 秒、运镜与动作分离、八层结构。\n"
        "输出格式：每个镜头用 --- 分隔，第一行标题（如：镜头01），第二行起是视频提示词。"
    ),
}


class ProjectMember(BaseModel):
    """制作项目成员：owner/editor/viewer 三种角色。"""
    user_id: str = ""
    name: str = ""
    role: str = "viewer"
    avatar: str = ""
    added_at: str = ""


class ProductionCard(BaseModel):
    """制作看板卡片：一个镜头/条目在某阶段的内容（提示词/图/视频与状态）。"""
    card_id: str = ""
    project_id: str = ""
    stage: str = "idea"
    title: str = ""
    content: str = ""
    episode: Optional[int] = None
    shot_number: int = 0
    prompts: list[str] = Field(default_factory=list)
    images: list[str] = Field(default_factory=list)
    videos: list[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)
    status: str = "pending"
    assignee: str = ""
    created_at: str = ""
    updated_at: str = ""

    model_config = {"populate_by_name": True, "extra": "allow"}


class ProductionProject(BaseModel):
    """制作项目：漫剧从创意到成片的十阶段流水线容器，绑定负责员工/团队。"""
    project_id: str = ""
    name: str = ""
    description: str = ""
    source_type: str = "idea"
    source_content: str = ""
    employee_key: str = ""
    team_code: str = ""
    members: list[ProjectMember] = Field(default_factory=list)
    settings: dict = Field(default_factory=lambda: {
        "visibility": "private",
        "allow_ai_generate": True,
        "default_status": "pending",
    })
    created_at: str = ""
    updated_at: str = ""

    model_config = {"populate_by_name": True, "extra": "allow"}


class ProjectWithCards(ProductionProject):
    """项目详情响应模型：项目 + 全部卡片 + 阶段定义 + 统计。"""
    cards: list[ProductionCard] = Field(default_factory=list)
    stages: list[dict] = Field(default_factory=lambda: list(STAGES))
    stats: dict = Field(default_factory=dict)
