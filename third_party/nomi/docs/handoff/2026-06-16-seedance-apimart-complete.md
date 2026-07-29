# 交接：apimart Seedance 2.0 接入「完整做完」

> 给接手 AI 的自包含上下文。**Seedance 是核心模型，必须照官方文档全覆盖，不许暂缓**（用户原话"必须完整做完，不是暂缓，这个模型非常重要"；上一版被批"不够全面，以后这种问题不能发生"）。
> 工作树：`/Users/aoqimin/Desktop/Nomi/`，分支 main，直接在 main 上 commit+push。读 CLAUDE.md 工程纪律。
> 官方文档（**动手前先 WebFetch 全读一遍，别凭本文转述**）：https://docs.apimart.ai/cn/api-reference/videos/doubao-seedance-2-0/generation · 全索引 https://docs.apimart.ai/llms.txt

## 0. 已完成（commit e2e2143，已在 main）

- **「全能参考」(omni) 模式**：`src/config/modelArchetypes/seedanceApimart.ts` 加了 omni 模式（image_urls≤9 + video_urls≤3 + audio_urls≤3，走档案级 image_to_video 桶，一条 body 覆盖、空数组键自动丢）。
- **Fast 变体**：`doubao-seedance-2.0-fast` → 独立 fast 档案（清晰度仅 480/720），catalog `electron/catalog/apimartVideos.ts` 加条目，`src/config/modelArchetypes/index.ts` 注册。
- catalog Seedance i2v body 已补 `size/video_urls/audio_urls`。
- 五门全过（typecheck/build/1414 单测/filesize/tokens/lint）。

## 1. 官方能力全表（对账基准）

**端点**：单端点 `POST https://api.apimart.ai/v1/videos/generations`，模式由参数组合决定（不分 endpoint）。响应 `{code:200,data:[{status:"submitted",task_id}]}`，轮询走 `apimartVendor` 的 APIMART_VIDEO_QUERY_OP（已有）。

**4 变体（model 字符串）**：
| model | 说明 | 1080p | Asset URL |
|---|---|---|---|
| `doubao-seedance-2.0` | 标准 | ✓ | ✓ |
| `doubao-seedance-2.0-fast` | 快速 | ✗（≤720p）| ✓ |
| `doubao-seedance-2.0-face` | 真人 | ✓ | ✗ |
| `doubao-seedance-2.0-fast-face` | 真人快速 | ✗（≤720p）| ✗ |
变体功能均"与标准版一致"。

**模式（参数驱动）**：文生(prompt) · 图生首帧(image_urls) · **首尾帧(image_with_roles first_frame/last_frame)** · 全能参考/多模态(image_urls≤9 + video_urls≤3 + audio_urls≤3) · 有声(generate_audio) · 连续(return_last_frame) · 参考人像(image_with_roles role=reference_image)。

**参数**：model · prompt(≤4000) · duration(4–15,默5) · size(16:9/9:16/1:1/4:3/3:4/21:9/adaptive,默16:9) · resolution(480p/720p/1080p,默480p) · seed · generate_audio(默false) · return_last_frame(默false) · image_urls(≤9) · image_with_roles · video_urls(≤3) · audio_urls(≤3)。
**互斥（必须执行）**：`image_urls` ⊥ `image_with_roles`；用首尾帧时 `video_urls`/`audio_urls` 不可用；参考视频需 480–720p、1.8s<时长<15.2s、不可出现真人；参考音频需配合参考图/视频、总时长≤15s。

## 2. 必须做完的剩余工作（不是暂缓）

### 2A. 首尾帧（image_with_roles）—— 最硬的一块，核心
**为什么难**：官方首尾帧用结构化数组 `image_with_roles:[{url,role}]`（role∈first_frame/last_frame/reference_image）。但模板引擎 `renderTemplateValue`（`electron/ai/requestPipeline.ts:94-99`）对**数组只丢弃 undefined 元素**——`{url:"{{last_frame_url}}",role:"last_frame"}` 是**对象**，即便 `last_frame_url` 渲染成 undefined，对象本身不被丢 → 空尾帧会带 `url:undefined` 污染请求。**所以模板里写死对象数组行不通，必须在构造层组装**。

**构造层在哪**：`src/workbench/generationCanvas/nodes/controls/archetypeMeta.ts`
- `buildArchetypeInputParams`（:259）把当前模式的槽 → snake 参数；`slotInputKey`（:245）= `slot.inputKey ?? DEFAULT_INPUT_KEY[kind]`；`DEFAULT_INPUT_KEY`（:221）：first_frame→`first_frame_url`、last_frame→`last_frame_url`。
- 即首尾帧槽现在产**扁平键** `first_frame_url`/`last_frame_url`（kie Seedance 就用这俩，见 `electron/catalog/kieSeedance.ts`，它走分离键不用 image_with_roles）。

**推荐做法（数据驱动，别 apimart 特判）**：给 archetype 加「把若干槽合并成带 role 的对象数组」的能力，例如：
- 槽上加可选 `role?: 'first_frame'|'last_frame'|'reference_image'`；模式上加可选 `combineSlotsInto?: { key: 'image_with_roles' }`。
- `buildArchetypeInputParams` 末尾：若 mode.combineSlotsInto 存在，遍历该模式有值的相关槽，组装 `out['image_with_roles'] = [{url, role}...]`（**只放有 url 的**），并**删掉**被合并的扁平键（避免 image_urls/first_frame_url 与 image_with_roles 并存触发互斥报错）。
- apimart Seedance 加「首尾帧」模式：slots first_frame(role:first_frame)+last_frame(role:last_frame)，combineSlotsInto image_with_roles。catalog body 加 `image_with_roles:"{{request.params.image_with_roles}}"`（整串一个 {{}}，数组原样透传，见 kieSeedance.ts:45 注释「整串就是一个 {{}} 的值原样透传」）。
- 加「参考人像」（role:reference_image，Asset URL）同机制。
**互斥执行**：image_with_roles 模式下，确保 image_urls/video_urls/audio_urls 不进 body（mode 投影已做大半，见 catalogTaskActions 的「非当前模式键投影掉」；构造合并时一并清）。

### 2B. face / fast-face 变体
- catalog `apimartVideos.ts` 加 `doubao-seedance-2.0-face`（档案同标准、1080p）、`doubao-seedance-2.0-fast-face`（档案同 fast、≤720p）。
- 仿现有 fast 变体写法；face 共用标准档案 `seedance-2-apimart`，fast-face 共用 `seedance-2-apimart-fast`（identifierPatterns 要加上对应 model 字符串，或新建 face 档案——若 face/标准能力完全一致，复用档案即可，只在 catalog 多两条 model 行）。
- 注意 face 变体 **不支持 Asset URL**（asset:// 参考）——若 Nomi 用 asset:// 传本地图，face 变体要么转直链、要么在档案/校验里标注限制。

### 2C. 参数补全
- `seed`（number，可选，无默认）、`return_last_frame`（boolean，默 false）加进 `PARAMS`（seedanceApimart.ts）+ catalog 各 body。
- `return_last_frame` 与未来「视频首尾帧接力」(B-full) 相关——它返回尾帧 URL，正好喂下一镜首帧，做完能顺带根治 storyboard 的视频接力（见 docs/plan/2026-06-16-storyboard-video-and-batch-fixes.md「视频帧接力 B-full」）。

### 2D. 真实生成 E2E 验证（接入即验证铁律，**必须跑**）
按 `docs/workflow/2026-06-06-real-generation-e2e-loop.md`：定义真实任务 → 隔离 electron 实例 + 主进程埋点（vendor HTTP 在主进程发，渲染层抓不到）→ 跑一条 apimart Seedance **全能参考** + 一条 **首尾帧** 真实生成 → 抓实际请求体确认字段名/结构对（image_urls vs image_with_roles、size vs aspect_ratio、generate_audio）→ 验视频结果回读 → 锁回归断言。烧额度，用户已授权"走真实额度"。

## 3. 传输管线全景（改之前先读懂）

槽（archetype mode.slots）→ `buildArchetypeInputParams`（archetypeMeta.ts:259，槽值→snake 参数，inputKey 覆盖默认键）→ 渲染层 catalogTaskActions（投影掉非当前模式的键 = 互斥）→ extras.archetypeInput → `referenceInputParams`（electron/catalog/archetypeInput.ts:24，原样采用）→ vendor body 模板（apimartVideos.ts 的 videoCreateOp，`{{request.params.X}}` 引用）→ `renderTemplateValue`（requestPipeline.ts，**undefined 键/元素丢弃，对象数组原样透传**）→ HTTP POST。

**关键不变量**：① 一条 body 可覆盖多模式，非当前模式的键为空 → 自动丢（empty-key dropping）；② 对象数组里 url=undefined 的**对象不被丢**（首尾帧的坑，见 2A）；③ vendor 字段名分歧只在 catalog body 翻译一次（M1 单源）。

## 4. 关键文件地图
- 档案（模式/参数/槽）：`src/config/modelArchetypes/seedanceApimart.ts`（+ kie 参照 `seedance.ts`）
- 档案注册：`src/config/modelArchetypes/index.ts`（MODEL_ARCHETYPES）
- catalog 传输（body 字段翻译）：`electron/catalog/apimartVideos.ts`、`apimartVendor.ts`（query/status）
- 槽→参数构造层：`src/workbench/generationCanvas/nodes/controls/archetypeMeta.ts`（buildArchetypeInputParams / DEFAULT_INPUT_KEY / slotInputKey）
- 参考输入翻译：`electron/catalog/archetypeInput.ts`
- 模板引擎：`electron/ai/requestPipeline.ts`（renderTemplateValue）
- 互斥投影：`src/workbench/generationCanvas/runner/catalogTaskActions.ts`（resolveTaskKind + 非当前模式键投影）
- 单测：`electron/catalog/seedBuiltins.test.ts`、`src/config/modelArchetypes/index.test.ts`、新增 seedanceApimart 专测
- 方案/对账：`docs/plan/2026-06-16-seedance-apimart-completeness.md`

## 5. 验收门（缺一不可）
1. 五门：check:filesize → lint:ci → typecheck → test → build 全过。
2. 单测覆盖：首尾帧 image_with_roles 只含有值的帧、互斥（image_urls 不与 image_with_roles 并存）、4 变体 identifier 命中正确档案、Fast/fast-face resolution 限 480/720。
3. **真实生成 E2E**（2D）：apimart Seedance 全能参考 + 首尾帧各跑通一条，抓请求体逐字段对官方文档，结果视频可回读。
4. 与官方文档**逐项对账**：变体×模式×参数全覆盖，无遗漏（这次被批的就是不全，务必对照 §1 全表打钩）。

## 6. 坑（前人踩过）
- kie Seedance（`seedance-2` 档案）≠ apimart Seedance（`seedance-2-apimart`）：kie 全能参考用扁平键 reference_image_urls/video/audio（部分带尾随空格，逐字符照抄 kie 文档），apimart 用 image_urls/video_urls/audio_urls + image_with_roles。**别把两套字段名搞混**。
- apimart 比例字段是 `size`（含 adaptive），不是 `aspect_ratio`（那是 Seedance 1.5 Pro 旧名）；音频是 `generate_audio` 不是 `audio`。
- 模板引擎能丢 undefined 键、丢 undefined 数组元素，但**丢不掉 {url:undefined,...} 这种对象** → image_with_roles 必须构造层组装（2A 核心）。
- 改完 archetype/catalog，`seedBuiltins.test.ts` 等数据驱动测试的计数会变，按实更新。
