# 《铁心恋人》第一季前期视觉资产审核单

> 当前状态：6 套角色联合资产包均通过技术预检、待导演审核；8 个场景包候选待审。
> 本文只用于导演审片，不代表任何资产已经批准。
> 批准结果必须写入 `qa/preproduction_approvals.json`，并绑定所审文件的
> SHA-256、资产包内容指纹和当前规格指纹；文件被替换后旧批准自动失效。
> 独立逐图预检与退稿依据见
> [preproduction_visual_preflight_2026-07-28.md](qa/preproduction_visual_preflight_2026-07-28.md)。

## 一、角色标准三视图（6/6 项候选待审）

验收口径：同一角色的正面、严格 90° 侧面、背面必须是同一身份、同一发型、
同一套服装和同一身体比例；中立站姿、全身完整、无遮挡。人物解剖学右侧面
鼻尖朝画布左。面部身份细节锚只能补充核验微小固定标记，不能替代全身三视图；
沈曜的主三视图与三张身份细节图必须作为一个联合包批准。

| 审核 ID | 角色 / 服装 | 候选文件 | 状态 |
|---|---|---|---|
| `R1_daily` | 沈曜 / 日常行动装 | [全身三视图](assets/characters/turnarounds/R1_shenyao_daily_turnaround_candidate_v1.png) / [正面身份](assets/characters/details/R1_shenyao_face_front_candidate_v5.png) / [右侧标记](assets/characters/details/R1_shenyao_face_right_profile_candidate_v5.png) / [左侧反证](assets/characters/details/R1_shenyao_face_left_profile_negative_candidate_v5.png) | candidate：联合包技术预检通过 |
| `R1_tactical` | 沈曜 / 战术装 | [全身三视图](assets/characters/turnarounds/R1_shenyao_tactical_turnaround_candidate_v1.png) / [正面身份](assets/characters/details/R1_shenyao_face_front_candidate_v5.png) / [右侧标记](assets/characters/details/R1_shenyao_face_right_profile_candidate_v5.png) / [左侧反证](assets/characters/details/R1_shenyao_face_left_profile_negative_candidate_v5.png) | candidate：联合包技术预检通过 |
| `R2_suit` | 凌昊 / 西装 | [打开三视图](assets/characters/turnarounds/R2_linghao_suit_turnaround_candidate_v2.png) | candidate |
| `R2_tactical` | 凌昊 / 战术装 | [打开三视图](assets/characters/turnarounds/R2_linghao_tactical_turnaround_candidate_v2.png) | candidate |
| `R2_home` | 凌昊 / 居家白 T | [打开三视图](assets/characters/turnarounds/R2_linghao_home_turnaround_candidate_v5.png) | candidate |
| `R3_suit` | 韩少卿 / 三件套西装 | [打开三视图](assets/characters/turnarounds/R3_hanshaoqing_suit_turnaround_candidate_v1.png) | candidate |

## 二、场景多机位设定包（8/8 候选）

验收口径：反打不能改变物理左右关系；门、窗、楼梯、控制台、道具锚点与
剧情动作位必须在各视图间一致；PLAN 负责锁定路线、180° 轴线和机位关系。
逐镜分镜会按剧情功能选择对应视图，而不是对所有镜头只喂一张主视图。

| 场景包 | 必审视图 | 候选目录 / 主视图 | 状态 |
|---|---|---|---|
| `LAB` | A、B、C、D、PLAN | [候选目录](assets/scenes/packages/LAB/) | candidate |
| `OFFICE` | A、B、C、MEETING、MEDICAL、PLAN | [候选目录](assets/scenes/packages/OFFICE/) | candidate |
| `ROOFTOP` | A、B、C_LEFT、C_RIGHT、PLAN | [候选目录](assets/scenes/packages/ROOFTOP/) | candidate |
| `APARTMENT` | INTERIOR_A/B/PLAN、GARAGE_A/B/PLAN、SUV_INTERIOR | [候选目录](assets/scenes/packages/APARTMENT/) | candidate |
| `WAREHOUSE` | A、B、C、UPPER_EAST、PLAN | [候选目录](assets/scenes/packages/WAREHOUSE/) | candidate |
| `CITY_ROAD` | STREET_A/B、OVERPASS_A/B、TUNNEL_A/B、DAWN_ROAD_A/B、ROUTE_PLAN | [候选目录](assets/scenes/packages/CITY_ROAD/) / [OVERPASS_A](assets/scenes/CITY_ROAD.png) | candidate |
| `HANYU_TOWER` | EXTERIOR、LOBBY_A/B、CONTROL_ROOM、ELEVATOR_SHAFT、ROOFTOP、VERTICAL_ROUTE_PLAN | [候选目录](assets/scenes/packages/HANYU_TOWER/) / [LOBBY_A](assets/scenes/HANYU_TOWER.png) | candidate |
| `HANYU_LAB` | A、B、C、CONTROL、PLAN | [候选目录](assets/scenes/packages/HANYU_LAB/) | candidate |

每一项实际选用文件及技术审查备注见
[preproduction_approvals.json](qa/preproduction_approvals.json)。旧版或退稿候选会
继续留在目录中作为审计记录，但不会被媒体清单引用。

## 三、批准后的唯一下一步

1. 先把通过的 6 套角色三视图和 8 个场景包写为 `approved`。
2. 只生成 3 张逐镜分镜小样，逐张核对人物、服装、空间轴线、景别和动作。
3. 小样通过后扩至 216 张“一镜一卡、一镜一图”分镜；每张都要单独批准。
4. 同组 A/B/C 三张分镜全过后，才允许生成对应首帧；首帧通过后才允许生成
   5 秒视频段。

如需退回修改，请给出“审核 ID / 视图名 / 问题 / 期望修改”。没有明确批准前，
角色三视图批准数、场景包批准数和分镜可生成数都应保持为 0。
