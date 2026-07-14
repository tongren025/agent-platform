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
# 剧本/分镜/提示词模板遵循可生产的竖屏漫剧方法论：项目时长和画幅由项目配置注入，
# G 是看板组织单元；真正送入视频模型的连续生成段始终不超过 6 秒。
STAGE_INSTRUCTIONS: dict[str, str] = {
    "script": (
        "根据上面的创意/原著内容，按项目配置写**成片级镜头拆分表 + G 生成单元剧本**。\n"
        "整集硬性要求：前 3 秒强视觉/强情绪钩子；按剧情组织 G 单元；每个可送入视频模型的连续生成段 2~6 秒，"
        "G 超过 6 秒时必须明确拆成 G1-A/G1-B/G1-C，不能把 10~18 秒写成一次生成；"
        "至少 1 处「以为A其实B」反转，至少 1 句能截图传播的嘴替台词，结尾留未解悬念钩子。\n"
        "第一段必须是一集级总表，标题写「镜头拆分表 成片级」，用表格列出：G单元、生成子段、时间码、景别机位、可见动作、台词/旁白、情绪、运镜、音效、光影。\n"
        "后续每段对应一个 G 生成单元，标题格式必须为「G1 单元名 剧本 [00:00-00:15]」。"
        "G 单元正文也用表格列出单元内剪辑段：时间码、景别机位、动作、台词/旁白、情绪、运镜、音效、光影。\n"
        "输出格式：每段用 --- 分隔，首行标题，其余为内容；不要输出泛泛分场大纲。"
    ),
    "setting": (
        "根据剧本内容，输出可锁定版本的角色设定和可行动的场景设定。\n"
        "角色设定：每个角色必须有 R 编号、适用集数/时期、身份层、装备层、可变层、母版引用；同一集只能选择一个时期版本。\n"
        "场景设定：每个场景必须有 scene ID、入口出口、前中后景、地标、可行动区、遮挡区、主辅光方向和连续性锚点。\n"
        "输出格式：先角色后场景，每个用 --- 分隔，第一行标题（如：角色: 苍霖 或 场景: 废墟巷道）。"
    ),
    "design": (
        "根据角色·场景设定的文字描述，输出视觉设计参考。\n"
        "角色：正面全身定妆照描述、三视图要求、关键特征提示词。\n"
        "场景：场景概念图描述、关键光影和色彩提示词。\n"
        "道具：关键道具的外观描述和特效层。\n"
        "输出格式：每个用 --- 分隔，第一行标题（如：角色设计: 苍霖 或 场景设计: 废墟巷道）。"
    ),
    # ── 分镜 v2：去掉通用电影学模板，只留这一镜独有的可绘制信息 ──
    "storyboard": (
        "根据剧本、角色场景设定和视觉设计，为每个 G 输出**模型可读的逐镜分镜**。\n\n"
        "每个镜头只写六项（缺一不可，多余通用理论不写）：\n"
        "1. **画面内容**：谁+在哪+做什么，用可见名词和动词——"
        "✗「场景自行演进」✓「熔浆从山脊溢出流向谷底」\n"
        "2. **角色动作**：身体部位级——✗「表达悲伤」✓「低头，右手攥紧碎片，肩膀微颤」\n"
        "3. **景别 + 唯一运镜**：如「近景，缓慢推进(dolly in)」\n"
        "4. **光影**：主光方向+色温，如「左侧45°暖赤金侧光」\n"
        "5. **时长**：该镜头秒数（≤6秒）\n"
        "6. **承接**：结束姿态描述（供下一镜起始参考）\n\n"
        "禁止：不可绘制措辞（环境主导/欲言又止/神情落在/氛围渐浓/悄然变化）；"
        "每个镜头重复通用电影学规则（轴线/三分构图/景深原理）——只写这一镜独有的内容；"
        "单镜超 6 秒——G 超 6 秒必须拆成多个子段。\n\n"
        "输出格式：每个 G 用 --- 分隔，标题「G1 单元名 分镜」。G 内每个镜头用 ### 镜头N｜Xs。"
    ),
    # ── 图片提示词 v2：七要素合成一段连贯描述，不用标号 ──
    "img_prompt": (
        "根据分镜，为每个 ≤6秒子段生成**一条可直接送入图片模型的首帧提示词**。\n\n"
        "写法：把七要素（风格→主体→动作→构图→光影→情绪→画质）合成一段连贯中文，不加 ①②③ 标号。\n"
        "示例：\n"
        "「干净半写实东方幻想漫剧插画，电影质感。少年苍霖，黑色短碎发凌乱，左脸竖向旧伤疤，"
        "深灰龙翼披风，站在废墟崖边俯瞰熔浆河谷，右手攥紧胸口龙骨碎片。近景，低机位仰拍15°，"
        "竖屏9:16。左侧45°暖赤金侧光，碎片泛蓝白微光。孤独而坚定。"
        "画面清晰稳定，面部结构正常，主体边缘干净。」\n\n"
        "硬规则：\n"
        "- 角色视觉 DNA 每条完整重复（发型+瞳色+伤疤+服装+道具），不依赖上下文\n"
        "- 画面里只有 1 个主体，道具最多 3 个，特效最多 1 种\n"
        "- 只写想要出现的内容，禁止「无/不要/避免」等负向措辞\n"
        "- 用当前集对应的角色版本，不混用后期服装\n\n"
        "输出 JSON：{\"cards\":[{\"title\":\"G1 首帧\",\"content\":\"完整提示词\","
        "\"prompts\":[\"同content\"],\"negative_prompts\":[],"
        "\"metadata\":{\"unit_number\":1,\"time_range\":\"00:00-00:06\"}}]}\n"
        "需要 FLF 末帧锁时，同一 G 多输出一张末帧卡。"
    ),
    # ── 视频提示词 v2：一张卡=一次 ≤6s 送模型，不是 shot list ──
    "vid_prompt": (
        "根据分镜和图片提示词，为每个 ≤6秒子段生成**一条可直接送入视频模型的提示词**。\n"
        "⚠️ 一张卡 = 一次提交给视频模型的完整提示词，不是整个 G 的镜头列表。\n\n"
        "单条提示词结构（连贯自然语言，不用「镜头N」分段）：\n"
        "  素材引用 → 风格句 → 角色描述 → 场景 → 动作 → 运镜 → 光影 → 画质收尾\n\n"
        "示例（一张完整的卡）：\n"
        "「@图片1(R3母版) @图片2(首帧)\n"
        "干净半写实东方幻想漫剧插画。\n"
        "少年苍霖，黑色短碎发凌乱，左脸竖向旧伤疤，深灰龙翼披风，粗绳项链挂龙骨碎片。\n"
        "废墟崖边，脚下熔浆河谷。\n"
        "苍霖缓缓抬起右手，掌心龙骨碎片泛起蓝白微光，光芒逐渐变强映亮半张脸。\n"
        "缓慢推进(dolly in)。\n"
        "右侧45°暖赤金侧光，碎片自发蓝白光。\n"
        "画面清晰稳定，面部结构正常，竖屏9:16，电影质感。」\n\n"
        "致命规则（违反即重写）：\n"
        "- 一张卡只对应一个连续动作且 ≤6秒，绝不把多个镜头塞进一张卡\n"
        "- G 时长超 6 秒时，必须输出多张子段卡（G1-A / G1-B / G1-C）\n"
        "- 不写负向提示词（不要/无/避免）\n"
        "- 禁用「快速/fast」\n"
        "- 纯中文（运镜术语中英双写除外）\n"
        "- 运镜和角色动作分开描述，不混写\n"
        "- 角色描述每张卡完整重复，不依赖上一张\n\n"
        "输出 JSON cards：每个子段一张卡，prompts[0] = 完整视频提示词，negative_prompts 空，"
        "metadata 含 unit_number、subsegment（如\"G1-A\"）、duration_seconds（≤6）和 flf（是否首末帧锁）。"
    ),
}

# ── GC 概念宣传片：精简流程，专注 30 秒吸引力 ──

GC_STAGES = [
    {"key": "idea", "name": "概念/钩子", "order": 0, "auto": False},
    {"key": "script", "name": "高光剧本", "order": 1, "auto": True},
    {"key": "storyboard", "name": "分镜", "order": 2, "auto": True},
    {"key": "img_prompt", "name": "图片提示词", "order": 3, "auto": True},
    {"key": "vid_prompt", "name": "视频提示词", "order": 4, "auto": True},
    {"key": "img_gen", "name": "生图", "order": 5, "auto": False},
    {"key": "vid_gen", "name": "生视频", "order": 6, "auto": False},
    {"key": "final", "name": "成片", "order": 7, "auto": False},
]

GC_STAGE_KEYS = [s["key"] for s in GC_STAGES]

GC_STAGE_INSTRUCTIONS: dict[str, str] = {
    "script": (
        "你正在制作一条 15~30 秒的**概念宣传片（GC）**，目标是让观众在前 3 秒被画面钩住，30 秒内决定追剧。\n\n"
        "从创意/原著中挑选 3~5 个**最炸的视觉瞬间**（不用讲完整剧情），每个瞬间 3~6 秒。\n"
        "选择标准：①画面冲击力（大场面/特效/极端情绪）②信息密度（一眼看出世界观类型）③悬念钩子。\n\n"
        "第一段标题「GC 高光表」，用表格列出：序号、瞬间名称、时长、景别、核心画面、情绪关键词。\n"
        "后续每段对应一个瞬间，标题「G1 瞬间名称 [时长]」，写出：画面里有什么、主角在做什么、情绪。\n"
        "最后一个瞬间必须是**悬念钩子**——看完想知道后面发生什么。\n\n"
        "输出格式：每段用 --- 分隔，首行标题。"
    ),
    "storyboard": (
        "根据 GC 高光剧本，为每个视觉瞬间输出**一镜到底的分镜**（每个瞬间 = 一条独立生成）。\n\n"
        "GC 分镜不需要集间连续性，每个瞬间独立成立。每个镜头只写：\n"
        "1. **画面内容**：谁+在哪+做什么（具体名词动词）\n"
        "2. **角色动作**：身体部位级\n"
        "3. **景别 + 运镜**：优先选冲击力最强的（大远景航拍/特写推进/俯冲）\n"
        "4. **光影**：主光+色温\n"
        "5. **时长**：3~6秒\n\n"
        "输出格式：每个瞬间用 --- 分隔，标题「G1 瞬间名称 分镜」。"
    ),
    "img_prompt": STAGE_INSTRUCTIONS["img_prompt"],
    "vid_prompt": STAGE_INSTRUCTIONS["vid_prompt"],
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
    negative_prompts: list[str] = Field(default_factory=list)
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
    episode_count: int = 0
    episode_duration_seconds: int = 90
    aspect_ratio: str = "9:16"
    visual_style: str = ""
    budget: float = 0
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
