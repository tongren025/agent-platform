# 《铁心恋人》S1 前期视觉资产独立预检记录

> 日期：2026-07-28  
> 性质：技术与连续性预检，不构成导演批准。  
> 结论：8 个场景包完成预检闭环；6 套角色三视图中 4 套可进入导演审核，
> 沈曜 2 套仍须返工。所有批准数保持为 0。
>
> 本轮活动候选的内置 imagegen 模式与最终提示词约束见
> [候选图生成记录](preproduction_imagegen_prompt_log_2026-07-28.md)。

## 角色三视图

| 审核 ID | 当前结论 | 证据与处置 |
|---|---|---|
| `R1_daily` | REWORK | v3/v4 已把中间人物改为解剖右侧严格 90°且右耳钉成立，但正面旧伤仍无法从画布右侧可靠迁移到画布左眉尾；未激活。 |
| `R1_tactical` | REWORK | v3 的右侧面与耳钉成立但正面旧伤缺失并疑似错耳亮点；v4 清除错耳亮点后又丢失右侧面耳钉，且旧伤仍不可辨；未激活。 |
| `R2_suit` | PRECHECK PASS | 正/严格右侧/背成立；西装结构、脸、发型、体型和右耳后接口连续。 |
| `R2_tactical` | PRECHECK PASS | 三视图及战术服结构成立；右耳后接口清楚，v1 错误上臂银色矩形已消失。 |
| `R2_home` | PRECHECK PASS | v5 从无花纹服装重新生成；脸与西装/战术版一致，纯深灰裤装和右耳后接口均可核验。采用后锁定“收腰白 T、外露抽绳”。 |
| `R3_suit` | PRECHECK PASS | 三视图、细框眼镜、深灰三件套和低饱和深紫领带连续。 |

### 明确退稿但保留审计的角色候选

- `R1_shenyao_daily_turnaround_candidate_v2.png`：伤疤与右耳钉仍不可辨。
- `R1_shenyao_tactical_turnaround_candidate_v2.png`：同上。
- `R1_shenyao_identity_markers_candidate_v1.png`：正面伤疤落在错误侧，形成侧别冲突。
- `R1_shenyao_daily_turnaround_candidate_v3.png`、`v4.png`：右侧面与右耳钉已成立，
  但正面旧伤仍落错侧或不可辨。
- `R1_shenyao_tactical_turnaround_candidate_v3.png`、`v4.png`：旧伤不可辨；
  v3 疑似左耳亮点，v4 清除亮点时又丢失右侧耳钉。
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

- `R2_linghao_home_turnaround_candidate_v5.png`
- `ROOFTOP_C_RIGHT_candidate_v2.png`
- `APARTMENT_GARAGE_PLAN_candidate_v2.png`
- `HANYU_LAB_C_side_candidate_v2.png`
- `HANYU_LAB_PLAN_candidate_v2.png`

这些文件已写入 `preproduction_approvals.json` 的活动候选路径，但记录状态仍为
`candidate`，没有写入 `approved`。

## 剩余硬阻塞

1. 沈曜日常装、战术装必须解决人物解剖右眉尾旧伤与右耳单耳钉的稳定侧别证据。
2. 导演须明确批准 6 套角色三视图与 8 个场景包的当前文件版本。
3. 前两项满足前，216 张逐镜分镜的可生成数必须保持为 0。
