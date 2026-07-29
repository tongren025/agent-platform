# 《铁心恋人》S1 前期候选图生成记录

> 日期：2026-07-28  
> 工具模式：Codex 内置 `imagegen`，参考图约束下的生成/局部重做。  
> 性质：记录本轮活动候选的最终提示词约束，便于复现；不构成人工批准。

## 通用硬约束

- 真人商业竖屏漫剧质感，真实中国都市，克制近未来科技；禁止动漫化、文字、水印和无关人物。
- 角色板必须是同一人物、同一服装、同一尺度的完整正面 / 人物解剖学右侧
  90°侧面 / 背面三联横板；右侧面鼻尖朝画布左，中性站姿，不能裁脚。
- 场景返工只允许修正指定的方向或空间矛盾；未点名的建筑锚点、道具数量、材质、光向和机位功能保持不变。
- 所有产物先标记为 `candidate`，技术预检不能替代导演审批。

## 最终选入活动候选的提示词约束

### R1 沈曜联合角色资产包

沈曜的正式候选不是单张头像，而是每套服装的完整全身三视图主板与三张高清
身份细节锚联合组成。下列提示词为本轮内置 `imagegen` 的规范化最终约束：

**严格正面身份锚 v5**：参考沈曜既有身份，保持同一张明艳锋利的中国女性面孔、
黑色高马尾、自然真实皮肤和中性棚拍光。头部与双耳严格正对镜头，无偏头、无
三分之四角。人物自己的右眉尾有一条短旧伤，正面画面中位于画布左侧；人物自己
的右耳只有一枚小银色耳钉，正面画面中同样位于画布左侧。人物左眉和左耳无标记。
无文字、首饰增殖、纹身、网状皮肤或戏剧环境。

活动文件：
`assets/characters/details/R1_shenyao_face_front_candidate_v5.png`

**人物右侧标记近照 v5**：保持与正面 v5 完全同一身份、发型和真实皮肤。人物
解剖学右侧面对镜头，鼻尖朝画布左；清楚保留右眉尾短旧伤和右耳唯一银色耳钉。
这是高分辨率固定标记近照，不冒充全身三视图中的严格正交侧面。无左耳耳钉、
无额外疤痕、无文字、无皮肤纹路伪影。

活动文件：
`assets/characters/details/R1_shenyao_face_right_profile_candidate_v5.png`

**人物左侧无标记反证 v5**：保持同一身份。人物解剖学左侧面对镜头，鼻尖朝
画布右；左眉、左耳必须没有旧伤和耳钉，用于证明固定标记不能被镜像到左侧。
自然皮肤、无文字、无额外首饰。

活动文件：
`assets/characters/details/R1_shenyao_face_left_profile_negative_candidate_v5.png`

**全身主三视图**：沿用已独立复核通过的日常装 v1 与战术装 v1。两张均且仅有
完整等比例全身正面、人物右侧 90°侧面（鼻尖朝画布左）、背面；主板负责体型、
服装和主要配件，三张细节锚只负责微小身份标记，二者不能相互替代。

活动文件：

- `assets/characters/turnarounds/R1_shenyao_daily_turnaround_candidate_v1.png`
- `assets/characters/turnarounds/R1_shenyao_tactical_turnaround_candidate_v1.png`

### R2 凌昊居家三视图 v5

参考身份母版、已通过预检的西装/战术三视图，保持同一张脸、银灰短发、身高体型和冷静表情。生成横向角色三视图：正面、人物解剖右侧的严格 90° 侧面、背面；白色圆领 T 恤收进裤腰，外露抽绳，纯深灰细织物束脚裤、黑袜，禁止任何重复暗纹、腰带、外套和饰品。人物解剖右耳后的银色接口必须在右侧面及背面可核验，且不能变成耳环或上臂装置。

活动文件：`assets/characters/turnarounds/R2_linghao_home_turnaround_candidate_v5.png`

### ROOFTOP 屋顶 C_RIGHT v2

以屋顶 A/B、C_LEFT 和 PLAN 为连续性参考，仅重做 C_RIGHT。保留同一门屋、两把折叠椅、灯串、栏杆、盆栽、湿地面和夜雨光向；镜头必须朝 C_LEFT 的物理相反方向，远景改为低中层城区与远山，禁止再次出现 C_LEFT 的针状高楼天际线。无人、无字、无水印。

活动文件：`assets/scenes/packages/ROOFTOP/ROOFTOP_C_RIGHT_candidate_v2.png`

### APARTMENT 地下车库 PLAN v2

严格正交俯视的无文字空间图。保持同一固定车位、柱网、防火门、消防箱、唯一出口坡道和哑光深灰紧凑 SUV。SUV 车头必须朝防火门、车尾朝坡道；黄色路线从防火门到左舵驾驶门，青色路线表示车辆倒车驶向坡道。禁止额外车辆、第二坡道和车辆掉头。

活动文件：`assets/scenes/packages/APARTMENT/APARTMENT_GARAGE_PLAN_candidate_v2.png`

### HANYU_LAB 核心实验室 PLAN v2

严格正交俯视、无文字。以中央透明核心为轴，锁定四台机械臂；唯一方舱位于物理东北象限，唯一楼梯位于南侧，玻璃控制室位于北侧。保留环形通道与行动路线，禁止新增第二核心、方舱、楼梯或控制室。

活动文件：`assets/scenes/packages/HANYU_LAB/HANYU_LAB_PLAN_candidate_v2.png`

### HANYU_LAB 核心实验室 C 侧视 v2

从实验室东侧拍摄的严格 90° 功能侧视，必须与 A/B/PLAN 同一空间。中央透明核心、四台机械臂不变；唯一方舱位于画面右后方/物理北侧，南楼梯位于画面左侧，北侧二层玻璃控制室保持可追踪。无人、无字、无水印，不得镜像或增加重复设施。

活动文件：`assets/scenes/packages/HANYU_LAB/HANYU_LAB_C_side_candidate_v2.png`

## 退稿记录

- `R1_shenyao_daily_turnaround_candidate_v2.png`、`R1_shenyao_tactical_turnaround_candidate_v2.png`：人物解剖右眉尾旧伤与右耳单耳钉仍不能稳定核验。
- `R1_shenyao_identity_markers_candidate_v1.png`：正面旧伤落在人物解剖左侧，违反侧别规格。
- `R1_shenyao_daily_turnaround_candidate_v3.png`、`v4.png`：中间人物鼻尖朝画布右，
  实际展示人物解剖学左侧，不是右侧；正面旧伤仍落错侧或不可辨，继续退稿。
- `R1_shenyao_tactical_turnaround_candidate_v3.png`：右侧面与右耳钉成立，但正面右眉尾旧伤不可辨，人物左耳出现疑似银点。
- `R1_shenyao_tactical_turnaround_candidate_v4.png`：清除了人物左耳银点，却仍未形成可辨的画布左眉尾旧伤，并在局部编辑中丢失右侧面耳钉，继续退稿。
- `R1_shenyao_face_candidate_v4.png`：试图镜像旧面部母版以改正侧别；固定标记
  虽换到正确侧，但模型重新渲染了脸和光线，并产生网状皮肤伪影。
- `R1_shenyao_face_right_profile_candidate_v6.png`：严格人物右侧方向与标记成立，
  但出现明显网状皮肤伪影；随后同约束 v7 仍有伪影，未复制到项目活动目录。
- `R1_shenyao_daily_turnaround_candidate_v5.png`：全身正/右/背结构成立，但正面和
  侧面眉疤缺失、双耳疑似都有耳钉，黑色手表跨视图漂移，退稿。
- `R2_linghao_home_turnaround_candidate_v3.png`、`v4.png`：裤装出现重复暗纹；v4 还丢失清晰耳后接口。

以上退稿文件仅保留用于审计，不在活动生产引用中。
