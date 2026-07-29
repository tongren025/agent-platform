# 《铁心恋人》S1 前期视觉资产独立预检记录

> 日期：2026-07-28  
> 性质：技术与连续性预检，不构成导演批准。  
> 结论：8 个场景包完成预检闭环；6 套角色服装包均可进入导演审核。
> 沈曜两套采用“完整全身三视图 + 三张高清身份细节锚”的联合验收，
> 不是以头像替代三视图。所有批准数保持为 0。
>
> 本轮活动候选的内置 imagegen 模式与最终提示词约束见
> [候选图生成记录](preproduction_imagegen_prompt_log_2026-07-28.md)。

## 角色三视图

| 审核 ID | 当前结论 | 证据与处置 |
|---|---|---|
| `R1_daily` | PRECHECK PASS | v1 主板独立复核通过：且仅有完整等比例全身正面、人物右侧（鼻尖朝画布左）、背面；日常服装与主要配件连续。正面 v5、右侧标记 v5、左侧无标记反证 v5 补充锁定眉疤/单耳钉。四图联合待导演批准。 |
| `R1_tactical` | PRECHECK PASS | v1 主板独立复核通过：完整全身正/右/背成立，板甲背心、肩带、腰带、护具、手套、裤装与战靴连续；共享同一组三张高清身份细节锚。四图联合待导演批准。 |
| `R2_suit` | PRECHECK PASS | 正/严格右侧/背成立；西装结构、脸、发型、体型和右耳后接口连续。 |
| `R2_tactical` | PRECHECK PASS | 三视图及战术服结构成立；右耳后接口清楚，v1 错误上臂银色矩形已消失。 |
| `R2_home` | PRECHECK PASS | v5 从无花纹服装重新生成；脸与西装/战术版一致，纯深灰裤装和右耳后接口均可核验。采用后锁定“收腰白 T、外露抽绳”。 |
| `R3_suit` | PRECHECK PASS | 三视图、细框眼镜、深灰三件套和低饱和深紫领带连续。 |

### 明确退稿但保留审计的角色候选

- `R1_shenyao_daily_turnaround_candidate_v2.png`：伤疤与右耳钉仍不可辨。
- `R1_shenyao_tactical_turnaround_candidate_v2.png`：同上。
- `R1_shenyao_identity_markers_candidate_v1.png`：正面伤疤落在错误侧，形成侧别冲突。
- 旧 `R1_shenyao_face_v3.png`、`R1_shenyao_full_v3.png`、`R1_shenyao_tactical_v3.png`：
  画面侧别与书面规格冲突，不能继续作为沈曜权威标记母版。
- `R1_shenyao_daily_turnaround_candidate_v3.png`、`v4.png`：中间人物鼻尖朝画布右，
  实为人物左侧而非右侧；正面旧伤仍落错侧或不可辨。
- `R1_shenyao_tactical_turnaround_candidate_v3.png`、`v4.png`：旧伤不可辨；
  v3 疑似左耳亮点，v4 清除亮点时又丢失右侧耳钉。
- `R1_shenyao_face_candidate_v4.png`：镜像后固定标记侧别正确，但脸与光线漂移，
  皮肤出现网状伪影。
- `R1_shenyao_face_right_profile_candidate_v6.png`：严格右侧方向成立，但皮肤出现
  明显网状伪影；后续 v7 仍有同类伪影，未复制进活动资产。
- `R1_shenyao_daily_turnaround_candidate_v5.png`：三视图结构成立，但眉疤缺失、
  双耳疑似均有耳钉且手表跨视图漂移，退稿。
- `R2_linghao_home_turnaround_candidate_v3.png`、`v4.png`：裤装出现重复暗纹；
  v4 同时丢失清晰耳后接口。

## 场景多机位设定包

| 场景包 | 当前结论 | 关键核验 |
|---|---|---|
| `LAB` | PRECHECK PASS | A/B 反打、玻璃区/箱区、C 功能侧视、D 坍塌梁和 PLAN 路线闭环。 |
| `OFFICE` | PRECHECK PASS | 楼梯、器械墙、训练垫、会议室、医疗位和北窗主光闭环。 |
| `ROOFTOP` | PRECHECK PASS | C_RIGHT v2 改为低中层城区与远山，不再与相反方向 C_LEFT 重复针状高楼；门屋、椅子、栏杆和盆栽未漂移。 |
| `APARTMENT` | PRECHECK PASS | 室内闭环；GARAGE_PLAN v2 改为车头朝防火门、车尾朝坡道，黄色路线至左舵驾驶门，青线表示倒车驶向坡道，与 A/B/SUV 内景一致。 |
| `WAREHOUSE` | PRECHECK PASS | A/B 左右关系、C 横向功能位、东墙楼梯/叉车、上层路线与 PLAN 一致。 |
| `CITY_ROAD` | PRECHECK PASS | 四个独立路线节点的各组反打均保持物理锚点；隧道摩托、黎明光向和 ROUTE_PLAN 连续。 |
| `HANYU_TOWER` | PRECHECK PASS | 外部、大厅、总控、竖井、屋顶和竖向路线闭环；导演仍需确认总控/救援环东侧方位及路线折返语义。 |
| `HANYU_LAB` | PRECHECK PASS | C v2 与 PLAN v2 将唯一方舱统一锁定东北象限；A 右、B 左、C 右后、PLAN 右上，南楼梯和北控制室未漂移。 |

## 本轮激活的新候选

- `R1_shenyao_daily_turnaround_candidate_v1.png`（全身三视图主板）
- `R1_shenyao_tactical_turnaround_candidate_v1.png`（全身三视图主板）
- `R1_shenyao_face_front_candidate_v5.png`（严格正面身份锚）
- `R1_shenyao_face_right_profile_candidate_v5.png`（人物右侧标记近照）
- `R1_shenyao_face_left_profile_negative_candidate_v5.png`（人物左侧无标记反证）
- `R2_linghao_home_turnaround_candidate_v5.png`
- `ROOFTOP_C_RIGHT_candidate_v2.png`
- `APARTMENT_GARAGE_PLAN_candidate_v2.png`
- `HANYU_LAB_C_side_candidate_v2.png`
- `HANYU_LAB_PLAN_candidate_v2.png`

这些文件已写入 `preproduction_approvals.json` 的活动候选路径，但记录状态仍为
`candidate`，没有写入 `approved`。

## 剩余硬阻塞

1. 导演须明确批准 6 套角色服装包与 8 个场景包的当前文件版本；沈曜每套批准
   必须同时绑定全身三视图和三张身份细节锚。
2. 前一项满足后先生成 3 张逐镜分镜样片并逐张审核。
3. 前两项满足前，216 张逐镜分镜的可生成数必须保持为 0。

## 机器验证

- Python 编译通过；前期资产、媒体恢复和生产就绪相关回归测试 **55/55 通过**。
- 媒体清单稳定态重复执行 `cards_changed=0`，未产生重复卡片。
- `character_identity_details` 按日常/战术两包计数为 **6/6 存在、6/6 有效**，
  无缺失、无无效、无同包角色内容重复。
- 全季验证当前为 `partial`：`invalid_count=0`；`missing_count=516` 对应尚未生成的
  216 张分镜、72 张首帧、216 个视频段和 12 集成片；`approval_gap_count=530`
  对应 6 套角色包、8 个场景包及全部下游交付仍未人工批准。
