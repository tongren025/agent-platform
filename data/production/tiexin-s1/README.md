# 《铁心恋人》第一季生产包

## 当前完成度

第一季文本生产包已经补齐；前期视觉资产正在按正式漫剧流程重建：

- 12 集 × 90 秒完整制作剧本。
- 每集 6 个 G 单元，共 72 个 G 单元。
- 每个 G 单元拆为 A/B/C 三个 5 秒独立生成段，共 216 个镜头段。
- 216 份“一镜一卡”逐镜分镜规格、72 份首帧图片提示词、72 份
  Seedance 视频提示词。
- 3 张角色母版卡与 8 张场景基底卡。
- 总卡片数 385 张。
- 9 张旧角色身份/服装单图仍保留作审计，但旧单角度服装图已退出活动角色卡
  和生成引用，不再被误报为完整三视图；8 张场景 A 主视图只作为多机位包的一部分。
- 6 套角色服装标准全身三视图均已落盘并通过独立视觉预检；沈曜两套额外绑定
  严格正面、人物右侧标记和人物左侧无标记反证三张高清身份细节锚。细节锚
  只补充核验眉疤/右耳单耳钉，不能替代三视图；6 套当前均为 `candidate`。
- 8 个场景多机位候选包已经全部落盘，包含轴线反打、剧情功能位和空间
  PLAN，并已完成逐图连续性预检；当前仍待导演终审。逐镜分镜图尚未生成，
  不能越过前两项审核。
- 已建立 216 个逐镜分镜任务、72 个首帧任务、216 个视频段任务、12 集
  合成任务和不可绕过的审核闸门。

媒体实物进度不写死在文档中，以 `qa/media_status.json` 为准。外部生图/生视频
会上传本地母版和剧情提示词并产生费用，因此脚本要求显式的
`--confirm-external-upload`；没有该开关时不会提交任何付费任务。

## 文件说明

- `project.json`：项目元数据、集数、时长、画幅和全局视觉锚点。
- `cards.json`：平台读取的完整生产卡。
- `铁心恋人_S1_12集制作剧本.md`：便于通读、审稿和拍摄沟通的全季合并剧本。
- `视觉圣经_v1.md`：全季风格、摄影、色彩、角色与连续性硬规则。
- `PREPRODUCTION_ASSET_SPEC.md`：三视图、场景包、逐镜分镜和下游审核门。
- `PREPRODUCTION_REVIEW.md`：6 套角色三视图与 8 个场景包的导演审核清单。
- `qa/preproduction_visual_preflight_2026-07-28.md`：逐图视觉预检、退稿与返工闭环记录。
- `assets/characters/`：角色面部、全身与服装母版。
- `assets/characters/turnarounds/`：6 套角色服装标准三视图候选。
- `assets/characters/details/`：沈曜固定身份标记高清细节锚，与对应三视图联合审批。
- `assets/scenes/`：8 个场景 A 主视图；`packages/` 下补多机位场景包。
- `assets/storyboards/`：216 张逐镜分镜图。
- `assets/frames/`：72 个 G 单元批准首帧。
- `assets/videos/`：216 个 5 秒视频段。
- `assets/episodes/`：12 集 90 秒合成片。
- `media_manifest.json`：全部媒体任务、输入依赖和稳定输出路径。
- `qa/media_status.json`：当前完成数量与外部生成闸门。
- `qa/preproduction_approvals.json`：角色三视图与场景包当前批准版本。
- `qa/validation.json`：文件、分辨率、时长、音轨机器验收结果。
- `../../../scripts/complete_tiexin_s1.py`：可重复执行的补齐脚本；按逻辑键更新卡片，不会重复追加。

## 生产规格

- 画幅：竖屏 9:16。
- 风格：电影级真人现代都市科幻；写实皮肤、真实材质、克制科技光。
- 节奏：每集 6 个 15 秒 G 单元；每个 G 由 3 个 5 秒镜头组成。
- 人物原则：沈曜始终拥有行动权和最终决定权；凌昊的弧线是从“服从工具”走向“自主选择”。
- 视频口径：Seedance 2.0 Pro，单次 5 秒、720p、生成音频；稳定角色脸和服装通过 `image_url` 参考绑定，不依赖文本中的 `@` 引用语法。
- 连续性：每个子段的末帧作为下一子段首帧参考，锁定角色脸、发型、服装、伤势、手持物、空间方向和主光。
- 生产顺序：批准角色三视图和场景包 → 生成并逐张审核 216 张分镜 →
  审核 72 张首帧 → 生成 216 个视频段；任何阶段不得跨过前置审核。

## 整季剧情弧

- EP01–04「激活」：沈曜激活军用仿生人零号，立下规则，并在第一次任务中确立“她行动、他配合”的关系。
- EP05–08「磨合」：零号从清理痕迹到产生非标准情绪；沈曜为他命名“凌昊”，并拒绝瀚宇科技的所有权逻辑。
- EP09–12「抉择」：城市围捕迫使凌昊主动离开；沈曜闯入瀚宇核心实验室，两人拒绝彼此控制，以公开真相完成最终反击。

## 生产与断点续跑

在仓库根目录执行：

```powershell
python scripts/complete_tiexin_s1.py
python scripts/prepare_tiexin_media.py
```

脚本会保留原有 EP01 已完成内容，补齐或更新其余受管卡片，并重新导出全季合并剧本。

先在平台中完成三视图和场景包审核。批准版本写入
`qa/preproduction_approvals.json` 后，明确授权把本地参考图和提示词发送到
OpenRouter，先跑逐镜分镜小样：

```powershell
python scripts/render_tiexin_storyboards.py --storyboards 3 --concurrency 1 --confirm-external-upload
```

三张分镜逐张审核通过后，再跑对应 G 的首帧与视频小样：

```powershell
python scripts/render_tiexin_media.py --frames 1 --concurrency 1 --confirm-external-upload
python scripts/render_tiexin_videos.py --g-units 1 --concurrency 1 --confirm-external-upload
```

小样通过后扩大批次。分镜和首帧脚本跳过已存在文件；视频脚本持久化远端任务号，
同场镜头按 A→B→C 自动抽取末帧承接，跨场硬切改用本段批准分镜。付费提交前
写恢复记录并使用跨进程锁；部分完成的 G 只续跑缺失段，重复执行不会重复提交
已确认或状态不明的任务：

```powershell
python scripts/render_tiexin_storyboards.py --storyboards 216 --concurrency 2 --confirm-external-upload
python scripts/render_tiexin_media.py --frames 71 --concurrency 2 --confirm-external-upload
python scripts/render_tiexin_videos.py --g-units 72 --concurrency 2 --confirm-external-upload
python scripts/validate_tiexin_media.py
```

当某集的 18 段视频全部存在时，视频脚本自动合成 720×1280 的单集成片并
回写卡片。机器验收通过后，仍需按视觉圣经完成角色一致性、连续性、口型和
异常肢体人工审核。
