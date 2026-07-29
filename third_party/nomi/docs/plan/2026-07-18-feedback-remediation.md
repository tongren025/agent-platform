# 2026-07-18 用户反馈分级与串行修复计划

> **执行要求：** REQUIRED SUB-SKILL: 使用 `executing-plans` 串行执行；每个 bug 使用 `systematic-debugging` + `test-driven-development`。不并行改共享入口，不把未复现反馈直接写成修复。

**目标：** 把 2026-07-18 微信/GitHub/B站反馈从“原话清单”变成有证据、有优先级、有回归保护的修复队列，并逐项关闭。

**架构原则：** 每一项先在输入、持久化、状态、渲染四层追数据流；只有根因已定位且能稳定复现才进入实现。每项形成独立提交并通过针对性测试，全部关闭后再跑五门与真实用户旅程。

**技术栈：** Electron、React 18、Zustand、Vitest、Playwright。

---

## 0. 执行结果

| 队列 | 结果 | 根因层处理 |
|---|---|---|
| P0 参考视频不可见 | ✅ 完成 | 消费已持久化的 `cameraMoveVideo.url`，卡内直接播放；删除重复完成横条 |
| P1 应用整体缩放 | ✅ 完成 | 主窗口锁定页面 zoom=1，画布业务缩放保留 |
| P1 ComfyUI 产物未回收 | ✅ 完成 | 仅对可信同源的本地 ComfyUI 产物放行回收并本地化 |
| P1 原稿 / 分镜找不到 | ✅ 完成 | 双工作面明确导航，两份状态独立持久化 |
| P2 Grok 参考图错端点 | ✅ 完成 | 模型级 edit mapping + xAI JSON `/v1/images/edits` 协议 + 存量迁移 |
| P3 图片放大 / 直接改名 | ✅ 完成 | 所有画布图片共用原图 lightbox；普通图片节点复用同一 `updateNode` 原地改名 |
| P3 多文档 / 更多模型 | ✅ 去重关闭 | 双工作面和通用自定义模型接入已覆盖真实摩擦，不扩成 IDE、不堆过时硬编码目录 |

每个代码项均有独立提交；用户可见项均由生产构建 Playwright 旅程截图人工核对。最终合并前再跑全门与最新 `origin/main` 去重。

---

## 1. 分级口径

| 级别 | 判断口径 | 本轮处理方式 |
|---|---|---|
| P0 | 结果已产生但用户无法取得，核心产出链断裂 | 立即修；独立红测、真机截图、独立提交 |
| P1 | 主流程被阻断、状态丢失、应用级交互被破坏，或多人稳定复现 | P0 后逐项复现并修；复现失败就补诊断证据，不猜 |
| P2 | 能力声明与真实协议不一致，或错误只在特定模型/中继组合发生 | 先校准能力契约，再决定隐藏不支持能力还是补正确传输 |
| P3 | 不阻断任务，但明显增加操作成本的体验需求 | 去重、验证使用频率，再按 D1 的真实摩擦逐项做 |

## 2. 串行队列

### P0-1：3D 参考视频已生成但节点不可播放

**用户摩擦：** 用户录完 take，底部只出现“参考视频已生成”，卡面仍是 3D 空态；真正的 mp4 无入口。

**已确认根因：**

1. `CameraMoveCaptureHost` 把结果写入 `node.meta.cameraMoveVideo.url`。
2. `readTakeCaptureStatus()` 读取同一 URL，所以成功徽标会出现。
3. `Scene3DEditor` 的卡面只读取 `scene3dState.lastThumbnail`，从未读取 `cameraMoveVideo.url`。
4. 因此数据、持久化与状态层都已成功，断点唯一落在预览选择器。

**设计决定（用户已要求按计划直接推进）：**

- 生成中：保留底部“参考视频生成中…”状态。
- 生成完成：mp4 取代空态/旧截图，整张卡直接显示原生可播放视频。
- 完成态不再保留遮挡控制条的成功横条；视频本身就是完成证据（P1 加新删旧）。
- 右上角“打开 3D 编辑器”仍保留；视频优先级高于 `lastThumbnail`，截图仅在无视频时显示。
- 播放 URL、延迟加载和错误诊断复用普通视频节点的既有实现，不建立第二套媒体管线。

**同类参考图结论：** `handleScreenshot()` 已创建标准 image 节点，写入 `result.url`、`status=success`、history、尺寸并连接 reference 边；标准图片节点已有预览实现。当前没有证据表明它与视频是同一断点，需用 E2E 验证“首帧/尾帧图片节点可见”，不做无证据代码改动。

**验收：**

- 同时存在 `cameraMoveVideo.url` 与旧 `lastThumbnail` 时，卡面显示视频。
- 仅有 `lastThumbnail` 时继续显示截图。
- 空白/缺失视频 URL 不误判完成。
- 真机录 take 后，卡内出现可播放 `<video controls>`；成功横条消失；右上角 3D 入口可用。
- 首/尾帧截图产生的 image 节点都可见且连线仍存在。

### P1-1：Cmd/Ctrl 缩放破坏整个应用且无法恢复

**证据：** Electron 主窗口没有 `before-input-event` 的页面缩放守卫；默认 Chromium 页面缩放会把整个工作台缩小。画布自身缩放是独立交互，不能被一起禁掉。

**目标：** 只拦截主窗口的 Cmd/Ctrl `+`、`-`、`0` 页面缩放快捷键，并把主窗口 zoom factor 固定为 1；不影响画布滚轮/手势缩放，不影响内嵌浏览视图。

**进入实现的门：** 先以 Electron E2E 证明当前快捷键能改变 `webContents.getZoomFactor()`，再写纯函数快捷键判定红测。

**精确文件与验收：**

- 新增：`electron/windowInput.ts`，只负责识别主窗口页面缩放快捷键与安装 zoom factor 守卫。
- 新增：`electron/windowInput.test.ts`，覆盖 macOS Meta、Windows/Linux Ctrl、主键区/小键盘 `+ - 0`，并证明无修饰键、Alt、普通按键不被拦。
- 修改：`electron/main.ts`，创建主窗口后安装守卫；不挂到应用内浏览器 `WebContentsView`。
- 新增：`tests/ux/app-page-zoom.e2e.mjs`，真实发送 Cmd/Ctrl `-`、`+`、`0` 并断言主窗口 `getZoomFactor()` 始终为 1。
- 验收：页面快捷键不再改变应用壳尺寸；画布滚轮/工具栏缩放仍改变 canvas transform；浏览器视图不受影响。

### P1-2：ComfyUI 已出图/视频但 Nomi 未回收

**现状：** 最新代码已覆盖标准 `/history/{prompt_id}` 的 image、gif、video 输出；群内有明确反馈和失败截图，表现为 ComfyUI 已成功生成、Nomi 没拿回图片。仅凭截图无法判断是自定义节点输出形状、路径编码、子图结构还是轮询时序。

**2026-07-18 根因复现：** `/history` 变换能正确拼出 `http://127.0.0.1:8188/view?...`，但真实生成带 `projectId`，终态会调用 `importRemoteAsset` 把产物本地化；该函数使用通用 `hardenedFetch`，按 SSRF 规则拒绝所有 loopback/私网地址。旧集成测试没传 `projectId`，只验证到 URL 拼接，绕开了失败点。因此 ComfyUI 日志显示成功，Nomi 在回收文件时失败。

**修复边界：** 通用远程素材导入仍默认拒绝私网；仅当任务供应商是 `comfyui-local`，并且产物 URL 与用户配置的 ComfyUI `baseUrl` 精确同源时，允许下载且禁止重定向。集成测试必须带真实项目目录，验证 `/view` 被请求、文件落到 `assets/generated`、返回 `nomi-local://`。

**处理顺序：**

1. 收集本机/反馈样本中的真实 history JSON（只读，脱敏）。
2. 用现有解析器跑样本，定位第一个丢失字段。
3. 把该 JSON 缩成最小 fixture，先写失败测试。
4. 只扩展统一输出解析器；不为具体工作流硬编码节点名。
5. fake ComfyUI E2E 验证图片与视频都能落成标准节点结果。

**无样本时的处理：** 不写猜测性 fallback；补足结构化诊断日志，让下一次失败能打印“找到了哪些 output 节点/媒体字段、为何被过滤”。

### P1-3：脚本生成后创作区消失或回退

**现状：** 微信上下文是“创作地方没了 / 变成最开始的剧本”→ 一分钟后“找到了”→ 随后提议“剧本、拆分脚本多做几个窗口”。代码核对确认原稿与分镜方案是两份独立状态，生成方案时 `storyboardEditorOpen=true` 会让 `CreationWorkspace` 直接以方案编辑器替换原稿；唯一返回入口只写“收起”。因此不是内容被旧快照覆盖，而是工作面替换没有导航语义，用户一度找不到原稿/方案。

**修复形状：** 不扩成多窗口 IDE。在创作主列增加仅有两项的工作面切换：`原稿 / 分镜方案`；方案不存在时不显示。自动生成方案仍直接展示结果，但两个入口始终可见；移除含义重复且模糊的“收起”，对话卡入口改成“返回原稿”。

**验收：** 生产 E2E 用同一项目同时种入原稿 sentinel 与分镜 sentinel：打开方案后两份内容可往返；重载后原稿、方案仍同时存在，默认回原稿；截图证明切换入口不与创作助手争抢空间。

### P2-1：中继把 Grok 参考图发往错误端点

**已确认：** 当前 relay 层统一把 image edit 映射到 `/v1/chat/completions`，同时又对所有 relay 图片模型声明 `supportsReferenceImages: true`。这是能力声明与传输协议的系统性缺口，不是单个按钮问题。

**官方对账（2026-05-26）：** xAI Imagine 图片编辑是 `POST /v1/images/edits` + Bearer + `application/json`；单参考图用 `image:{type:"image_url",url}`，多参考图用 `images:[...]`、最多 3 张，返回 `data[*].url`。xAI 还明确说明其 edits **不是** OpenAI SDK 的 multipart 口径。来源：[xAI REST Images](https://docs.x.ai/developers/rest-api-reference/inference/images)、[xAI Image Editing](https://docs.x.ai/developers/model-capabilities/images/editing)、[xAI Multi-Image Editing](https://docs.x.ai/developers/model-capabilities/images/multi-image-editing)。

**修复形状：** 把 image edit 从 vendor 级单 mapping 改为模型级精确 mapping：Nano Banana 等保留 generic `chat/completions`，Grok Imagine 档案命中 JSON `images/edits`；`selectTaskMapping` 既有“精确 modelKey > generic”规则负责分流。新接入直接写精确 mapping，catalog v5→v6 给存量 Grok 自动补精确 mapping，无需删后重加；只有真实存在 edit mapping 才写 `supportsReferenceImages=true`，并把 `imageEditProtocol` 一并持久化。

**验收：** 红测先证明同一中转只能落一条 generic edit mapping；修复后同站 Nano/Grok 各有精确 mapping。runtime 集成测试真实走 `runTask`，断言请求 URL 为 `/v1/images/edits`、body 有 `image` 且没有 `messages`；单图/多图造型、3 张上限、存量迁移幂等分别有纯函数/迁移测试。

### P3：效率型需求

候选：图片点击放大、画布直接改名、多创作文档、更广的自定义模型。先查最新 main 与历史 digest 去重；已完成的不重复做。剩余项按“频次 × 对主链路节省的操作数 × 维护面”排序，每项单独走样张与实现计划。

**去重结论（2026-07-18）：**

1. **图片放大：真实缺口。** 标准图片结果只渲染 `DeferredNodeImage`，没有 dialog / portal / 全尺寸入口；`NomiImage.thumbnailSrc` 的注释虽写“点开大图才用原图”，但画布端没有消费这层语义。
2. **直接改名：部分覆盖、普通图片仍缺。** `EditableNodeTitle` 已让角色/场景/道具卡面可点名修改；普通生成图、分镜图和 asset 纯图片预览没有标题编辑面，只能回侧栏。修在 `BaseGenerationNode` 的非卡片图片入口，不复制三张卡既有实现。
3. **多创作文档：本轮 P1-3 已覆盖真实摩擦。** 微信上下文是“原稿 / 分镜方案找不到”，不是任意数量文档管理；双工作面已经保留两份状态并给出明确导航，不继续扩成 IDE。
4. **更多自定义模型：通用能力已存在。** 当前模型接入支持手动填写 OpenAI-compatible 模型 ID，且已支持批量删除；本轮 P2 又补齐模型级参考图协议。继续硬编码更多中转站模型会制造过时目录，故不另加平行入口。Seedance 2.0 Fast 已在最新 main 的接入工作中，合并前再去重。

**P3-1 实现形状（图片预览 + 原地改名，共用图片结果入口）：**

- 新增单一 `NodeImageLightbox`：从画布图片节点打开原图，portal 到应用 body；背景点击 / Esc / 关闭按钮均可退出，关闭后恢复触发按钮焦点。
- 每张有结果的图片节点右上角常显“放大预览”按钮，和既有生成记录按钮共用一行；不把整张图变成按钮，以免破坏节点拖拽、框选和连线。
- 非卡片图片节点在图内左下显示标题胶囊：未选中时 hover 浮现、选中时常显，点击即复用 `EditableNodeTitle` 写回同一个 `updateNode` 真相源。角色/场景/道具继续使用既有标题，不重复显示。
- 样张：`docs/design/mockups/canvas-image-preview-and-rename.html`。实现前先用真实画布密度核对按钮、标题与分镜角标不互相遮挡。

**P3-1 验收：**

- 普通生成图、分镜图、asset 图片与角色/场景/道具图片均有同一个放大入口；视频/音频/3D 不误显示。
- 放大后使用原始 `result.url`，dialog 有可读标题、`aria-modal`、Esc 关闭和加载失败兜底。
- 普通图片标题点击后原地输入，Enter / 失焦保存、Escape 撤销；重载项目后新名字仍在。
- 图片节点仍能拖动、选中和连线；标题不遮住右下“转视频”，放大按钮不遮住左上“镜头 N”。
- 生产构建 Playwright 真实走完：打开项目 → 进入生成 → 打开放大 → Esc 关闭 → 原地改名 → 重载验证 → 截图人工审阅。

## 3. 每项共同验收门

1. **RED：** 最小回归测试必须先因目标行为缺失而失败。
2. **GREEN：** 最小实现让定向测试通过，随后跑相关测试集。
3. **根因复核：** 明确输入→持久化→状态→渲染/传输的断点，回答“同类入口为何不会再复发”。
4. **P1 清理：** 新行为替代旧行为时，同提交删除旧状态条、错误声明或重复分支。
5. **体验证据：** 用户可见项必须跑生产构建的 Playwright 真实旅程，产出截图并人工查看。
6. **提交：** 每个可独立回滚的问题一个提交；全部完成后跑 `check:filesize`、`check:tokens`、`lint:ci`、`typecheck`、`test`、`build`，再推送 main。

## 4. P0-1 精确实施步骤

**文件：**

- 修改：`src/workbench/generationCanvas/nodes/Scene3DEditor.tsx`
- 新增：`src/workbench/generationCanvas/nodes/scene3d/scene3dCardPreview.ts`
- 修改：`src/workbench/generationCanvas/nodes/Scene3DEditor.test.ts`
- 修改：`tests/ux/scene3d-take-record.walk.mjs`
- 修改：`tests/ux/scene3d-reference-pack.walk.mjs`
- 新增样张：`docs/design/mockups/scene3d-reference-video-preview.html`

- [x] **步骤 1：为预览优先级写红测**

  导出纯函数 `readScene3DCardPreview(node)`，期望返回：有效 `cameraMoveVideo.url` → `video`；否则有效 `lastThumbnail` → `image`；否则 `empty`。测试必须先因函数不存在而失败。

- [x] **步骤 2：运行红测**

  运行：`pnpm exec vitest run src/workbench/generationCanvas/nodes/Scene3DEditor.test.ts`

  预期：FAIL，明确指出 `readScene3DCardPreview` 尚未导出。

- [x] **步骤 3：实现单一预览选择器**

  在 `Scene3DEditor.tsx` 中从节点 meta 读取并 trim 视频 URL；视频优先，图片回退，空值不进入媒体组件。渲染视频时复用 `DeferredNodeVideo`、`buildVideoPlaybackUrl`、`diagnoseVideoPlaybackFailure`。

- [x] **步骤 4：删除完成横条的旧实现**

  `Scene3DTakeStatusOverlay` 只接受 `generating`；完成态由可播放视频表达。`readTakeCaptureStatus` 仍可返回 `done` 供领域测试，但渲染入口只在 `generating` 时挂状态条。

- [x] **步骤 5：运行绿测与相关单测**

  运行：`pnpm exec vitest run src/workbench/generationCanvas/nodes/Scene3DEditor.test.ts src/workbench/generationCanvas/nodes/DeferredNodeMedia.test.tsx`

  预期：全部 PASS。

- [x] **步骤 6：补真实旅程断言**

  `scene3d-take-record.walk.mjs` 首次进入编辑器时跳过 coach marks；出片后断言 `[data-scene3d-take-video="true"]` 可见且有 `controls`，截图卡面。`scene3d-reference-pack.walk.mjs` 同样处理 coach marks，并断言首/尾帧标准 image 节点各自渲染图片。

- [x] **步骤 7：生产构建真机走查**

  运行 `pnpm build` 后执行两个 walk；人工查看“出片前/出片后/参考图”截图，确认视频控制条无遮挡、3D 入口仍在、图片节点无裂图。

- [x] **步骤 8：定向提交**

  只暂存本项的实现、测试、计划与样张文件，提交后进入 P1-1。

## 5. 回滚

每项独立提交，可按问题单独 revert。P0-1 不迁移数据结构，只改变既有 `cameraMoveVideo.url` 的消费方式；回滚不会损坏已经生成的 mp4。
