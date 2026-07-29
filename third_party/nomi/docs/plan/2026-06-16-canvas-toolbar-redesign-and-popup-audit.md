# 执行计划：画布浮条重设计 + icon/字体合规 + 弹窗精简

> 2026-06-16。用户拍板（方案 B + 抽首尾帧 + 多选藏浮条 + 并发6 + 批量并发反馈 + 弹窗审计 + 全条 icon/字体按设计系统重调）。
> 调研已完成（两个 Explore agent：合规违规表 + 弹窗分类表，见对话）。对照 `docs/design/nomi-design-system.md` §2/§6。

## 范围（切片）

### S1 ★共享浮条组件 + 方案 B 图片工具栏 + 全条 token/icon/字体合规
- **根因（P1/P2）**：NodeImageEditToolbar / NodeResultDownloadButton / BaseGenerationNode panorama-toolbar 是**三份重复浮条**，同一堆违规。→ 抽 `nodes/NodeFloatingToolbar.tsx`（容器 + 按钮原子，token 合规：`bg-nomi-paper/[0.96]` `border-nomi-line` `shadow-nomi-md` `rounded-nomi` `gap-1.5` `px-3` `min-h-9`，图标 14/1.6），三处全改用它（删旧拷贝）。
- **方案 B 图片工具栏**：`定妆`(accent) ｜ `裁剪` `切图▾`(四视图/九宫格) `变换▾`(旋转左右/翻转H/V) ｜ `下载`。下拉用现有 overlay 范式（BodyPortal/SettingsPopover 那套，防遮挡）。
- 合规对照基准 = selection-toolbar（最合规那条）。

### S2 视频节点抽帧浮条 + 抽帧→图片节点
- 视频节点浮条（用 S1 共享组件）：`抽首帧`(IconPlayerTrackPrev) `抽尾帧`(IconPlayerTrackNext) ｜ `下载`。首尾两个不同图标，一眼可分。
- wiring：点 → 复用 M-A 的 `window.nomiDesktop.video.extractFrame({videoUrl, which:'first'|'last', projectId})` → 落**独立图片节点**（建节点 + 填 result.url）。失败走错误 toast（不冒充）。

### S3 多选藏浮条 + 批量条放大
- BaseGenerationNode：所有每节点浮条（图片/视频/抽帧/下载/panorama）渲染条件加 `&& !isMultiSelectActive`（:93 已有该标志，没拿来用）。
- selection-toolbar（GenerationCanvas:667）：放大「生成 N 个」为主角（更大字+按钮），编组/清除退次级；图标 14/1.6（现 15/1.8）。

### S4 批量并发反馈（用户强调）
- 框选生成时，若 waves>1（要先生成参考再生成镜头），**明确告诉用户**：start 文案从「N 个(M 波)」改成人话「先生成 X 个参考，再生成 Y 个镜头（分 M 波依次）」。
- 合并「跑完连弹两条」：blocked notice（batchPlanPreview:65）并进完成汇总（:58-60）一条说清。

### S5 弹窗精简（按审计表）
- ❌ 删 6 条 routine 成功 toast：GenerationCanvas:338(编组)/:355(解组)、Scene3DFullscreen:3344/3355/3381/3396(复制粘贴×4)、AudioStripNode:141(复制转写)。
- ⚠️ 改善：batchPlanPreview:53/58 缩短、:65 合并(见S4)、Scene3DEditor:143 缩短、buildFixationNode:73 只留引导、GenerationCanvas:769 帮助 toast→常驻 popover（低优先，可暂留）。

### S6 零散合规（survey 表逐条）
- 违禁 stroke：NodeLockBadge:29 (2→1.8)、BaseGenerationNode:855 grip (2.1→1.6)。
- `rounded-pill`→`rounded-full`（InlineParameterBar:47/100）。`text-xs`→`text-caption`（CanvasToolbar:59）。
- CanvasToolbar 工具栏图标 15→18/1.6（:109）、菜单图标 15→14/1.6（:66）。ModeBar/composer 任意 px → 刻度类。
- derived-badge CSS：10.5px→text-micro(11)、font-weight 650→600、rgba/shadow→token。

### S7 设计系统文档修正
- §4.3 derived-badge 登记了 10.5px/rgba（与 §2 强制 token 冲突，文档欠债）→ 改文档为合规值，与 S6 代码同步。

## 不动什么
- 抽帧 IPC / 接力解析器（M-A，后端不碰）。
- BatchPlanOverlay 扣费确认关口（留）。所有 error/拒绝/前置未满足 warning（留）。
- 加节点/切模式/连边/删除的静默行为（已合规，不加 toast）。
- Scene3D「超100对象」「截图失败」「未选相机」等拒绝/失败提示（留）。

## 回滚
每切片独立 commit。S1 共享组件出问题 → 三处浮条回退到各自旧实现（git）。S5 删 toast 是纯减，零风险。

## 验收门
五门（filesize/lint/typecheck/test/build）每切片全过 + **R13 真机走查截图人眼判断**（这次不闷头）：① 图片工具栏方案B 干净、下拉不遮挡；② 视频节点抽首/尾帧可点、落图片节点；③ 多选只剩批量条、无每节点浮条；④ 批量启动文案说清"先参考后镜头"；⑤ 删掉的 toast 不再弹。`tests/ux/design-fidelity.e2e.mjs` 加 computed-style 断言锁合规（图标 size、token 类）。
