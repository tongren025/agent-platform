"""Production pipeline models — from idea to final cut."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import AliasChoices, BaseModel, Field

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
ProductionGoal = Literal["storyboard", "images", "final"]

# 各阶段的 AI 生成指令模板——看板逐阶段生成与画布 AI 派生共用,
# 输出约定:条目用 --- 分隔,首行标题,其余为内容。
# 剧本/分镜/提示词模板遵循可生产的竖屏漫剧方法论：项目时长和画幅由项目配置注入，
# G 是看板组织单元；默认使用短原子镜头，连续表演镜头按模型能力可扩展到 15 秒。
STAGE_INSTRUCTIONS: dict[str, str] = {
    "script": (
        "根据上面的创意/原著内容，按项目配置写**成片级镜头拆分表 + G 生成单元剧本**。\n"
        "整集硬性要求：前 3 秒强视觉/强情绪钩子；按剧情组织 G 单元；默认连续生成段 2~6 秒；"
        "只有单一空间内的连续对白、连续表演或明确摄影机调度可以写成 7~15 秒，且必须附逐秒时间轴和表演/声音/运镜参考需求；"
        "其它 G 超过 6 秒时仍拆成 G1-A/G1-B/G1-C；"
        "至少 1 处「以为A其实B」反转，至少 1 句能截图传播的嘴替台词，结尾留未解悬念钩子。\n"
        "第一段必须是一集级总表，标题写「镜头拆分表 成片级」，用表格列出：G单元、生成子段、时间码、景别机位、可见动作、台词/旁白、情绪、运镜、音效、光影。\n"
        "后续每段对应一个 G 生成单元，标题格式必须为「G1 单元名 剧本 [00:00-00:15]」。"
        "G 单元正文也用表格列出单元内剪辑段：时间码、景别机位、动作、台词/旁白、情绪、运镜、音效、光影。\n"
        "输出格式：每段用 --- 分隔，首行标题，其余为内容；不要输出泛泛分场大纲。"
    ),
    "setting": (
        "根据剧本和当前项目 Bible，完成本次明确要求的角色设定或场景设定；"
        "角色与场景必须拆成两次岗位调用，不能让一个岗位同时代做。\n"
        "角色：每个角色使用稳定 character_id，写清不可变身份特征、当前造型版本、"
        "可变项、适用集数和已有母版 URL；不得引入其他项目人物。\n"
        "场景：每个场景使用稳定 scene_id，写清空间布局、入口出口、前中后景、"
        "地标、可行动区、遮挡、材质、主辅光、色彩和连续性锚点。\n"
        "所有风格、配色和时代信息必须从本项目输入继承；缺失时列入 blockers，"
        "不得套用固定人物、固定世界观或固定画风。\n"
        "输出 JSON cards；一张卡只对应一个角色版本或一个场景版本，metadata "
        "必须包含 asset_type、asset_id、version 和 reference_urls。"
    ),
    "design": (
        "根据当前调用岗位完成单一视觉设计任务，不跨岗位代做。\n"
        "角色图任务继承已审核 character_id/version，完整保留不可变身份特征；"
        "场景图任务继承 scene_id/version，保持布局、材质、光源和地标；"
        "动作特效任务逐 shot_id 写清动作路径、受力因果、特效分层和连续性。\n"
        "风格锚点、配色、画幅和禁止项全部来自项目 Bible 与本次输入，不得硬编码某种题材。"
        "缺少资产版本或参考 URL 时返回 blocked。\n"
        "输出 JSON cards；metadata 必须包含 asset_type、asset_id、version、"
        "reference_urls 和 responsible_employee_key。需要图片提示时写入 prompts[0]，"
        "但没有真实生成工具证据时不得声称图片已生成。"
    ),
    # ── 分镜 v2：去掉通用电影学模板，只留这一镜独有的可绘制信息 ──
    "storyboard": (
        "根据剧本、角色场景设定和视觉设计，为每个 G 输出**模型可读的逐镜分镜**。\n\n"
        "每个镜头只写六项（缺一不可，多余通用理论不写）：\n"
        "1. **画面内容**：谁+在哪+做什么，使用本项目中的可见名词和动词，"
        "不用“氛围变化”等不可绘制措辞\n"
        "2. **角色动作**：身体部位级——✗「表达悲伤」✓「低头，右手攥紧碎片，肩膀微颤」\n"
        "3. **景别 + 唯一运镜**：如「近景，缓慢推进(dolly in)」\n"
        "4. **光影**：写清主光方向、色温与来源，并继承 scene_id 对应版本\n"
        "5. **时长**：默认 2~6 秒；连续对白/表演/摄影机调度可为 7~15 秒，但必须附逐秒时间轴\n"
        "6. **承接**：结束姿态描述（供下一镜起始参考）\n"
        "7. **控制素材**：人物身份/表情、场景、表演视频、动作或运镜预演、对白音频中本镜需要的项目\n\n"
        "禁止：不可绘制措辞（环境主导/欲言又止/神情落在/氛围渐浓/悄然变化）；"
        "每个镜头重复通用电影学规则（轴线/三分构图/景深原理）——只写这一镜独有的内容；"
        "无时间轴的单镜超 6 秒——非连续对白/表演/摄影机调度仍必须拆成多个子段。\n\n"
        "输出 JSON cards，**一张卡只对应一个可独立生成的镜头**，禁止把整个 G 的镜头列表塞进一张卡。"
        "标题格式「G1-S1 单元名 故事板」，content 写上述六项，metadata 必须包含 "
        "unit_number、subshot（如 G1-S1）、duration_seconds（2~15）、shot_type、generation_mode、"
        "reference_roles 和 reference_assets。"
        "同一 G 有 8 个镜头就必须输出 8 张 storyboard 卡，后续每张卡都要能单独生成故事板图。"
    ),
    # ── 图片提示词 v2：七要素合成一段连贯描述，不用标号 ──
    "img_prompt": (
        "根据分镜，为每个可独立生成的镜头生成**一条可直接送入图片模型的首帧提示词**。\n\n"
        "写法：把七要素（风格→主体→动作→构图→光影→情绪→画质）合成一段连贯中文，不加 ①②③ 标号。\n"
        "提示词必须按项目风格 → 已锁定主体版本 → 可见动作 → 构图 → "
        "场景版本与光影 → 情绪 → 画质组成连贯描述。\n\n"
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
    # ── 视频提示词 v3：默认短镜头，连续表演可按模型能力扩展到 15 秒 ──
    "vid_prompt": (
        "根据分镜和图片提示词，为每个可独立生成的镜头生成**一条可直接送入视频模型的提示词**。\n"
        "⚠️ 一张卡 = 一次提交给视频模型的完整提示词，不是整个 G 的镜头列表。\n\n"
        "先选择生成模式：普通构图与动作采用 keyframe 首尾帧；需要人物母版、表演视频、动作/运镜预演或对白音频时采用 reference 多模态参考。\n"
        "单条提示词结构：素材用途 → 时间轴/故事板 → 角色可见动作 → 唯一运镜与空间调度 → 光影 → 表演/对白/声音 → 连续性。\n"
        "稳定的人脸、服装、场景与画风交给图片参考；变化的动作、镜头和声音写入提示词并绑定视频/音频参考。\n\n"
        "致命规则（违反即重写）：\n"
        "- 默认一张卡只对应一个 2~6 秒连续动作；非连续镜头必须拆成 G1-A / G1-B / G1-C\n"
        "- 连续对白、连续表演或复杂摄影机调度可为 7~15 秒，但提示词必须包含【时间轴】并逐段写清动作、机位和声音\n"
        "- 不写负向提示词（不要/无/避免）\n"
        "- 禁用「快速/fast」\n"
        "- 纯中文（运镜术语中英双写除外）\n"
        "- 运镜和角色动作分开描述，不混写\n"
        "- 角色描述每张卡完整重复，不依赖上一张\n\n"
        "输出 JSON cards：每个子段一张卡，prompts[0] = 完整视频提示词，negative_prompts 空，"
        "metadata 含 unit_number、subsegment、duration_seconds（2~15）、shot_type、generation_mode、"
        "reference_assets、camera_plan、performance_plan、audio_plan、continuity_plan 和 flf。"
    ),
}

# ── GC 概念宣传片：精简流程，专注 30 秒吸引力 ──

GC_STAGES = [
    {"key": "idea", "name": "概念/钩子", "order": 0, "auto": False},
    {"key": "script", "name": "高光剧本", "order": 1, "auto": True},
    {"key": "setting", "name": "场景/人物锁定", "order": 2, "auto": True},
    {"key": "design", "name": "视觉设计", "order": 3, "auto": True},
    {"key": "storyboard", "name": "分镜", "order": 4, "auto": True},
    {"key": "img_prompt", "name": "图片提示词", "order": 5, "auto": True},
    {"key": "vid_prompt", "name": "视频提示词", "order": 6, "auto": True},
    {"key": "img_gen", "name": "生图", "order": 7, "auto": False},
    {"key": "vid_gen", "name": "生视频", "order": 8, "auto": False},
    {"key": "final", "name": "成片", "order": 9, "auto": False},
]

GC_STAGE_KEYS = [s["key"] for s in GC_STAGES]

GC_STAGE_INSTRUCTIONS: dict[str, str] = {
    "script": (
        "你正在制作一条 15~30 秒的**概念宣传片（GC）**，目标是让观众在前 3 秒被画面钩住，30 秒内决定追剧。\n\n"
        "先读取项目视觉风格、Art Bible 与已有角色/生物/场景母版；不得重新发明人物造型或另起画风。\n"
        "从创意/原著中挑选 3~5 个高光段，并拆成 8~12 个可剪辑镜头；单镜 1.5~4 秒，"
        "只有需要连续表演的镜头可到 6 秒。GC 必须靠镜头切换建立节奏，禁止用 5 个一镜到底镜头填满全片。\n"
        "选择标准：①画面冲击力（大场面/特效/极端情绪）②信息密度（一眼看出世界观类型）③悬念钩子。\n\n"
        "第一段标题「GC 高光表」，用表格列出：序号、瞬间名称、时长、景别、核心画面、情绪关键词。\n"
        "后续每段对应一个瞬间，标题「G1 瞬间名称 [时长]」，写出：画面里有什么、主角在做什么、情绪。\n"
        "最后一个瞬间必须是**悬念钩子**——看完想知道后面发生什么。\n\n"
        "输出格式：每段用 --- 分隔，首行标题。"
    ),
    "setting": (
        "根据 GC 高光剧本与已锁定 Art Bible，输出本片实际使用的角色版本、核心场景、关键道具、"
        "光影色彩和声音母题。只允许引用正片已有设定；如素材不足，明确标记待确认，不得临时发明。\n"
        "每个场景必须包含：scene_id、叙事功能、空间锚点、前中后景、主辅光、色彩、动态元素、"
        "连续性锚点、对应镜头、可直接用于场景母版图的纯场景提示词。\n"
        "角色不可变特征与当前造型版本必须完整引用；场景光影和配色必须来自项目 Bible，"
        "缺失时标记待确认。\n"
        "输出 JSON cards，一张卡对应一个角色版本、场景或关键道具。"
    ),
    "design": (
        "把 GC 场景/人物锁定结果整理为可复用的视觉参考清单。必须优先引用 Art Bible 已有图片 URL，"
        "不得重画已存在且已审核的角色、生物、道具或场景母版。\n"
        "每张卡写明 reference_role、适用镜头、不可变特征和 reference_assets；"
        "只有确实缺失的资产才输出待生成设计提示词。\n\n"
        "生成设计提示词时，风格锚点、角色不可变特征、配色权重、画幅和质量约束"
        "必须逐项继承当前 Art Bible；不得从其他项目复制固定风格句或人物特征。"
    ),
    "storyboard": (
        "根据 GC 高光剧本输出 8~12 张**逐镜故事板卡**，一张卡只对应一个剪辑镜头。\n\n"
        "镜头之间必须形成：视觉钩子 → 升级 → 世界观奇观 → 异常反转 → 人物悬念钩子。"
        "同一高光段可拆为远景建立、主体动作、细节反应等多个镜头，但不得重复同一信息。每个镜头只写：\n"
        "1. **画面内容**：谁+在哪+做什么（具体名词动词）\n"
        "2. **角色动作**：身体部位级\n"
        "3. **景别 + 运镜**：优先选冲击力最强的（大远景航拍/特写推进/俯冲）\n"
        "4. **光影**：主光+色温\n"
        "5. **时长**：通常1.5~4秒，最长6秒\n"
        "6. **母版引用**：列出本镜必须继承的角色、服装、生物或场景母版\n"
        "7. **承接/剪辑点**：明确用动作、视线、光效或构图匹配切到下一镜\n\n"
        "输出 JSON cards；标题格式「G1-S1 瞬间名称 故事板」，metadata 必须包含 "
        "unit_number、subshot、duration_seconds、reference_roles、reference_assets。"
    ),
    "img_prompt": (
        STAGE_INSTRUCTIONS["img_prompt"]
        + "\n\nGC 追加硬规则：提示词第一句必须逐字继承项目视觉风格，不得只写含糊的“电影质感”；"
        "必须写明所用母版引用与风格参考图；角色和生物外形以母版为准，不得凭文字重设计。"
        "风格约束必须区分：高精度数字绘景式漫剧关键帧，不是真人摄影，不是欧美游戏设定稿，不是白底概念图。"
    ),
    "vid_prompt": (
        STAGE_INSTRUCTIONS["vid_prompt"]
        + "\n\nGC 追加硬规则：视频提示词不再重新描述或发明画风、脸和服装；"
        "稳定身份与画风全部交给首帧和母版参考图，文字只描述本镜可见动作、唯一运镜、环境变化、光效节奏和声音。"
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
    """制作项目：十阶段流水线容器；记录交付目标、首页置顶状态及负责员工/团队。"""
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
    production_goal: ProductionGoal = Field(
        default="final",
        validation_alias=AliasChoices("production_goal", "productionGoal"),
    )
    pinned: bool = False
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
