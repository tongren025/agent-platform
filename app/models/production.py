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
# 剧本/分镜/提示词模板遵循高节奏竖屏漫剧方法论：90s 成片、
# G 生成单元(约 8~15s)与单元内剪辑段(0.5~2s)分离。
STAGE_INSTRUCTIONS: dict[str, str] = {
    "script": (
        "根据上面的创意/原著内容，写 90 秒竖屏漫剧的**成片级镜头拆分表 + G 生成单元剧本**。\n"
        "整集硬性要求：前 3 秒强视觉/强情绪钩子；全片 6~8 个 G 生成单元，每个 G 约 8~15 秒；"
        "每个 G 内含 6~13 个剪辑段，普通剪辑段 1~2 秒，战斗/冲击段可 0.5~1 秒；"
        "至少 1 处「以为A其实B」反转，至少 1 句能截图传播的嘴替台词，结尾留未解悬念钩子。\n"
        "第一段必须是一集级总表，标题写「镜头拆分表 成片级 90s/xx段」，用表格列出：G单元、时间码、景别机位、动作、台词/旁白、情绪、运镜、音效、光影。\n"
        "后续每段对应一个 G 生成单元，标题格式必须为「G1 单元名 剧本 [00:00-00:15]」。"
        "G 单元正文也用表格列出单元内剪辑段：时间码、景别机位、动作、台词/旁白、情绪、运镜、音效、光影。\n"
        "输出格式：每段用 --- 分隔，首行标题，其余为内容；不要输出泛泛分场大纲。"
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
        "根据成片级剧本、角色场景设定和视觉设计，按 G 生成单元输出分镜。\n"
        "必须区分两层：G 生成单元约 8~15 秒，是看板分组和首帧/视频提示词的主键；"
        "G 内部剪辑段 0.5~2 秒，是成片节奏和字幕/音效的切点。\n"
        "每个 G 分镜包含：G编号、覆盖时间码、首帧文件名建议、末帧锁需求(如需要)、生成时长、强度、"
        "单元内「镜头N」剪辑段列表。每个剪辑段写：时间码、景别、运镜（每段只一个，中英双写）、"
        "构图层次、角色动作（身体部位级）、台词/旁白、音效、光影。\n"
        "输出格式：每个 G 用 --- 分隔，第一行标题必须为「G1 单元名 分镜」。"
    ),
    "img_prompt": (
        "根据分镜和视觉设计，为每个 G 生成单元生成首帧图片提示词；如该 G 需要 FLF，另生成一条末帧锁提示词。\n"
        "严格按七要素顺序组装：①风格/画风（用 Art Bible 风格锚点句）②主体描述（角色视觉 DNA 固定词"
        "每次完整重复，含标志性特征）③动作/表情（身体部位级）④景别与构图（含机位角度，竖屏 9:16）"
        "⑤光影（光源类型+方向+色温）⑥情绪氛围（情绪词+氛围元素如雨/烟尘/体积光）"
        "⑦画质后缀（清晰主体/保持面部一致/无变形/角色一致性）。\n"
        "检查清单（逐条自查，违规即重写）：七要素是否齐全；角色固定词是否完整（不许用「他/她/同上」指代）；"
        "是否 9:16 竖屏；是否只用正向约束词（不写任何负向词）；是否避开「快速/fast」类词。\n"
        "输出格式：每条提示词用 --- 分隔，第一行标题必须带 G 编号（如：G1 首帧图提示词(七要素) 或 G1末帧锁(FLF·七要素)），第二行起是提示词。"
    ),
    "vid_prompt": (
        "根据 G 分镜和图片提示词，为每个 G 生成单元生成一条 Seedance 2.0 视频提示词。\n"
        "按八层结构组装：①素材声明（@图片N 引用首帧/角色母版图，R 编号锁定角色）"
        "②镜头标签（「镜头1」分段，每段≤6秒）③景别与主体（2~3 个静态特征名词）"
        "④动作（身体部位级+幅度+速度，优先慢速连续小动作）⑤运镜（每镜只一个，中英双写）"
        "⑥场景与光影（光源方向/色温+氛围元素，质量 ROI 最高）⑦音频（对话/音效/环境音）"
        "⑧全局收尾（风格锚点+正向约束词）。\n"
        "致命规则（违反任意一条即重写）：不写负向提示词；禁用「快速/fast」；纯中文（运镜术语中英双写除外）；"
        "单段≤6秒；镜头运动与角色动作分开描述；角色描述每次完整重复，不依赖上一镜。\n"
        "每条末尾标注：G 生成时长、成片保留时长、单元内剪辑段切点、是否 FLF 首末帧锁。\n"
        "输出格式：每个 G 用 --- 分隔，第一行标题必须带 G 编号（如：G1 单元名 视频提示词(八层)），第二行起是视频提示词。"
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
    """制作看板卡片：一个 G 生成单元或一集级概览在某阶段的内容（提示词/图/视频与状态）。

    shot_number 为历史兼容字段，业务语义是 generation unit number；0 表示一集级总表/头部/质检。
    """
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
