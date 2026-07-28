# 《铁心恋人》S1 前期候选图生成记录

> 日期：2026-07-28  
> 工具模式：Codex 内置 `imagegen`，参考图约束下的生成/局部重做。  
> 性质：记录本轮活动候选的最终提示词约束，便于复现；不构成人工批准。

## 通用硬约束

- 真人商业竖屏漫剧质感，真实中国都市，克制近未来科技；禁止动漫化、文字、水印和无关人物。
- 角色板必须是同一人物、同一服装、同一尺度的完整正面 / 严格 90° 右侧面 / 背面三联横板；中性站姿，不能裁脚。
- 场景返工只允许修正指定的方向或空间矛盾；未点名的建筑锚点、道具数量、材质、光向和机位功能保持不变。
- 所有产物先标记为 `candidate`，技术预检不能替代导演审批。

## 最终选入活动候选的提示词约束

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
- `R1_shenyao_daily_turnaround_candidate_v3.png`、`v4.png`：已把中间人物改为鼻尖朝画布右侧的解剖右侧面，右耳钉成立；但两次局部返工都未能把正面旧伤从画布右侧可靠迁移到画布左眉尾，继续退稿。
- `R1_shenyao_tactical_turnaround_candidate_v3.png`：右侧面与右耳钉成立，但正面右眉尾旧伤不可辨，人物左耳出现疑似银点。
- `R1_shenyao_tactical_turnaround_candidate_v4.png`：清除了人物左耳银点，却仍未形成可辨的画布左眉尾旧伤，并在局部编辑中丢失右侧面耳钉，继续退稿。
- `R2_linghao_home_turnaround_candidate_v3.png`、`v4.png`：裤装出现重复暗纹；v4 还丢失清晰耳后接口。

以上退稿文件仅保留用于审计，不在活动生产引用中。
