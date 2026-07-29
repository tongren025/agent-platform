# 通用中转（new-api 拉取式）补图生图 + 放开分辨率

- **日期**：2026-07-01
- **触发**：用户反馈——云雾 API（yunwu.ai，OpenAI 兼容中转）接进 Nomi 后「图生图/参考图一直用不了、只能出 1K」，同一 key 在竞品「大熊画布」正常。
- **定性**：确认是 Nomi 代码问题，且是**结构性**的（不是云雾一家没适配）。见根因。

---

## 一、根因（P2，已行级核实）

Nomi 对中转有两条接入路：

| 路 | 代码 | 参考图 | 分辨率 |
|---|---|---|---|
| 策展路（apimart 等，手工对齐每个模型） | `apimartImages.ts` | ✅ `image_urls` | ✅ 1K/2K/4K |
| **通用拉取路（云雾走这条）** | `newapiTransport.ts` | ❌ body 无字段 | ❌ 写死 1K 三档 |

通用路的图像模板当初只按「纯文生图」写：
- `NEWAPI_IMAGE_CREATE_OP.body`（`newapiTransport.ts:48-58`）只有 model/prompt/size/quality/n——**没有任何参考图字段**。
- `newapiTransportFor("image")`（`:150`）只注册 `text_to_image` 一条 mapping，**没有 image_edit**。
- UI 因模型没声明「参考能力」，**不渲染参考图槽**。
- `NEWAPI_STANDARD_IMAGE_PARAMS`（`:103-106`）把 size **写死** `1024x1024 / 1792x1024 / 1024x1792`，不从模型能力 derive → 「只能出 1K」。

→ 每个走通用路接中转的用户都会撞这堵墙，与 key/账号档位无关。这解释了用户「之前找的几个 api 也是同样问题」。

---

## 二、调研：中转图生图的真实口径（R5，公开文档，未碰用户 key）

图生图在 OpenAI 兼容中转上**不是一个口径，是分裂的**：

| 模型阵营 | 图生图接口 | 参考图放哪 | 出图返回 | 合 Nomi 架构? |
|---|---|---|---|---|
| **Gemini / nano-banana（当前主力）** | `POST /v1/chat/completions` 多模态 | `messages[].content[]` 的 `{type:"image_url",image_url:{url}}`（URL 或 base64） | **base64 塞在 `choices[0].message.content`**（可能 markdown `![](data:image/…)` 或结构化） | ✅ URL-in-JSON |
| gpt-image / DALL·E | `POST /v1/images/edits` | **multipart 二进制文件** `image[]` | `data[0].url` / `b64_json` | ❌ 要传字节，与 Nomi URL 架构不合 |
| 部分中转扩展 | `/v1/images/generations` 或 `/images/edits` 带 JSON `image`/`image_urls` | JSON URL 数组 | `data[0].url` | ✅ 但非 new-api 标准、各站不一 |

来源：doc.newapi.pro（官方 image 接口）、apiyi/laozhang/wentuo/七牛 的 nano-banana 中转文档。

**决策（取舍见 §五）**：通用路图生图**主打 chat/completions 多模态**——它是当前主力图生图模型（nano-banana/gemini 系）在中转上**覆盖最广**的口径，且纯 URL-in-JSON 贴合 Nomi 架构。代价是返回侧要写新解析（下）。gpt-image 的 multipart 路属「真不一样」，本期不强塞，文档标清。

---

## 三、Nomi 内部链路（已行级核实，方案照此接）

- **taskKind 路由不需档案**：`resolveTaskKind`（`catalogTaskResolve.ts:188-190`）——图像执行 kind 下，`hasReference ? 'image_edit' : 'text_to_image'`。非档案通用模型挂参考图**自动进 image_edit 桶**。
- **mapping 选择按 (vendor, taskKind, modelKey)**：`selectTaskMapping`（`catalog/types.ts:308-321`）。给通用路补一条 `taskKind:"image_edit"` mapping 即天然分流。
- **参考图 URL 已入 params**：非档案模型经 `buildReferenceExtras`（`catalogTaskActions.ts:96-105`）→ `extras.referenceImages` → `referenceInputParams`（`archetypeInput.ts:41`）→ **`request.params.reference_images`**（数组）。模板可读。
- **模板能渲染嵌套数组/对象**：`requestPipeline.ts:98-116`，单 `{{…}}` token 保真原始值。**但**声明式模板**展不开变长数组**（不能由 N 张参考图生成 N 个 content 元素）——需函数建构层（下）。
- **返回抽取只认 images 端点风格**：`assetUrlExtract.ts:7-25` 认 `data[0].url` / `data[0].b64_json` / `images[0].url` 等，**不认 `choices[0].message.content` 里的 base64/markdown**。→ **必须新写 chat 图像返回解析**（成败点）。
- **变长数组建构先例**：`processOperation.ts` 的 multiframe 走纯函数建构器绕开模板——chat content 数组照此模式建。
- **分辨率换算器现成到 4K**：`paramTranslate.ts:36` `TIER_LONG_EDGE = {1k:1024, 2k:2048, 4k:3840}`，`ratioResToOpenAiSize` 从 `aspect_ratio+resolution` 派生像素 size，受 `OPENAI_MAX_PIXELS` 夹取。`NEWAPI_IMAGE_PARAM_MAP`（`newapiTransport.ts:36`）已挂此 rule——**只需把标准参数从像素 size 换成 比例+清晰度档**，换算器/paramMap 零改动。

---

## 四、实施清单（分层，逐项守 P1「加新删旧无并行版」）

### 4.1 分辨率（最小、无争议、先做）
- `newapiTransport.ts:103-106` `NEWAPI_STANDARD_IMAGE_PARAMS`：删掉写死的像素 `size` select，改成
  - `aspect_ratio` select：`1:1 / 16:9 / 9:16 / 4:3 / 3:4`
  - `resolution` select：`1K / 2K / 4K`（大写 canonical，换算器内部 toLowerCase 归一）
  - `quality` 保留。
- create body（`:48-58`）继续发 `size`；`NEWAPI_IMAGE_PARAM_MAP` 已从 `aspect_ratio+resolution` 派生 → **不改**。
- 结果：像素 size 随选择 derive，不再钉 1K。

### 4.2 图生图 mapping（chat/completions 多模态）
- 新增 `NEWAPI_IMAGE_EDIT_OP`（chat/completions）：
  - `path: "/v1/chat/completions"`，JSON headers。
  - body：`{ model, messages: [{ role:"user", content: <多模态数组> }], stream:false }`。
  - `<多模态数组>` = `[{type:"text",text:prompt}, ...每张参考图一个 {type:"image_url",image_url:{url}}]`——**变长，走函数建构层**（不用声明式模板展）。
- `newapiTransportFor("image")`（`:137-151`）改为返回 t2i + image_edit 两条 mapping（照 apimart `apimartImages.ts:72-88` 的双 mapping 形态）。
- 建构层：新增「refs → chat multimodal content」纯函数，从 `request.params.reference_images`（+prompt）建 content 数组。落点对齐 `processOperation.ts` multiframe 建构器（变长数组不进模板）。**待实现时定**：是加一个 paramMap transform 产出 content 数组，还是在 processOperation 加一个 chat-image 分支——取代价小者，单源、不复制 apimart。

### 4.3 返回解析（成败点，必须写新码）
- 扩 `assetUrlExtract.ts`（或加一个 chat-image 专用解析步骤）：从 `choices[0].message.content` 抠图：
  - content 是字符串 → 正则抠 `data:image/…;base64,…` 或 markdown `![](…)`。
  - content 是数组 → 找 `image_url.url` / `{type:"image_url"}`。
  - 或 `message.images[]`（部分中转结构化返回）。
- 加单测覆盖三种返回形态。
- ⚠️ 保持对现有 `data[0].url` / `b64_json` 的处理不变（P1：只加不改旧行为）。

### 4.4 UI 参考图槽渲染
- 让通用图像模型渲染出参考图槽。最小改动（C7）：在 `NEWAPI_STANDARD_IMAGE_PARAMS` 加一个 `type:"image-url"` 的参考图参数，或在 commit（`catalogCommit.ts:169`）给 image 模型 `meta.imageOptions.supportsReferenceImages=true`。
- **复用已有参考槽组件**（`parameterControlModel.ts` / `NodeParameterControls.tsx`），非新设计 UI。
- 验证：真机（R13）——接一个通用中转图像模型，节点上出现参考图槽、能拖入/连线参考图。

### 4.5 stream 兜底（若非流式取不到图）
- 部分预览版模型图输出要求 `stream:true`。默认非流式；若真机发现某些模型只在流式回图，再加流式分支。本期先非流式 + 返回解析兜底，真机验证后决定是否补。

---

## 五、关键取舍（R3，用户已授权「做到能做的最好、真不一样就没办法」）

**为什么选 chat/completions 而不是 images/edits：**

| 方案 | 覆盖的主力图生图模型 | 合 Nomi URL 架构 | 实现代价 | 在任意中转能跑的概率 |
|---|---|---|---|---|
| **chat/completions 多模态（选）** | nano-banana/gemini 系（当前主力） | ✅ | 中（要写 chat 返回解析 + content 建构） | **高**（跨中转文档最广） |
| /v1/images/edits multipart | gpt-image/dall-e | ❌（要传二进制字节） | 高（与 Nomi 架构冲突） | 中 |
| /images/generations + image_urls（抄 apimart） | 取决于中转扩展 | ✅ | 低（复用现有返回） | 低（非 new-api 标准，各站不一） |

选 chat/completions = 用「实现代价换真实可用概率」：主力图生图模型都在这条口径上，且贴 Nomi 架构。

**诚实边界**：
- gpt-image/DALL·E 的 multipart 图生图本期不做（与 URL 架构冲突，属「真不一样」）。
- 因不碰用户 key、不加平台，**云雾具体某模型的字段/流式要求无法预先实测**——按公开文档最广口径实现，装新版后真机验证；若个别模型仍对不上，属可接受的长尾。

---

## 六、验收门（P3：全绿≠完成）

1. 五门全过（`pnpm run gates`：filesize→tokens→lint→typecheck→test→build）。
2. 新增单测：chat 返回三形态解析、refs→content 建构、分辨率派生。
3. **R13 真机走查**：接一个通用中转图像模型 →
   - ① 节点出现参考图槽、可拖/连参考图；
   - ② 分辨率下拉有 1K/2K/4K；
   - ③ （若有可用 key）真发一次图生图，人眼看出图确实受参考图影响。无 key 时至少验 mapping 选到 image_edit、请求体结构正确（mock/日志）。

## 六点五、Phase 2 通用性夯实（2026-07-01 续，用户「在其他通用上多夯实一下」）

对整条通用拉取路径做同类「只按最窄场景写」缺口审计（subagent，见对话）。**只做不需要猜任何供应商格式的那批**（纯内部健壮性 / OpenAI 标准且 doc.newapi.pro 已核 / 照抄已验证路径）——遵守「拿不到官方 API 必须问用户、不许拿次优源替代」（记忆 api-doc-fetch-fail-ask-dont-substitute）。

**已做（安全批）：**
1. 图片输出多资产：`NEWAPI_IMAGE_CREATE_OP` response_mapping `data.0.url`→`data[*].url`（pathValues 已验支持 `[*]` 通配摊平，responseParsing.ts:22）。n>1 取回全部图，不再只落第一张。
2. 图片张数：加 `n` 参数（OpenAI 标准，doc.newapi.pro 已核）+ body `n` 取 token；taskParams 强制 `Number()`（防 UI 存字符串 → 严格端点 400，同 AGNES int 坑）。
3. 音频语速：加 `speed`（OpenAI /v1/audio/speech 标准）+ body token，空则丢弃。
4. 视频 i2v 断链修复：body `image` 从裸 `{{request.params.image}}`（taskParams 从不产出）改成 `{{request.params.image_url}}`（firstReferenceImage 聚合）——通用路 i2v 首帧此前根本到不了 wire。
5. 空值不误发：taskParams `image_url` 空→undefined（非 ""），否则 body 会发 `image:""` 被部分中转拒。
6. 视频轮询多资产：`NEWAPI_VIDEO_QUERY_OP` `data.0.url`→`data[*].url`。

**故意没做（需真实供应商文档才能定字段，按纪律留给「问用户/装新版验」）：**
- 视频多参考图/尾帧/角色参考 wire 字段：new-api 视频非 OpenAI 标准，`last_frame`/`image_urls` 真名各站不一，不猜。
- 图片 `seed`/`negative_prompt`：OpenAI images 官方无此二参、属中转扩展，加了赌各站支持，暂缓（真要加须先拿到目标站文档）。
- 接入即验证（非阻断「测试连接」GET {baseUrl}/models）：需新增 main.ts IPC + desktopClient + UI（R8），独立一档。
- images/edits multipart 图生图（gpt-image/DALL·E）：与 URL 架构冲突，需 runner 支持二进制上传。
- 音频转写(Whisper)/声音克隆：新 mapping/multipart，二期。
- 删并行的 `NEWAPI_STATUS_MAPPING` 改依赖 responseParsing 通用兜底表（P1 去重）：低优先，暂留。

**验证**：新增 7 个专项测试（多资产 data[*]、n 数字、i2v 首帧到达/空值丢弃、视频多资产、音频 speed 有/无）。全量 2376 测试 + typecheck 过。

## 七、不动项 / 回滚
- 不改策展路（apimart 等）——它们本就正常。
- 不改视频/音频通用路。
- 不引入新平台/新依赖。
- 回滚：涉及文件集中在 `electron/catalog/newapiTransport.ts` + `electron/tasks/assetUrlExtract.ts`（或 processOperation）+ `electron/catalog/catalogCommit.ts` + 对应测试；单 commit 可整体 revert。

## 八、后记（2026-07-06）

- 「存量模型需删了重加才生效」的遗留已由 **catalog v4→v5 迁移**根治（见 docs/plan/2026-07-06-i2i-reference-reliability.md L1）：老中转 image 条目升级即自动补 image_edit mapping + supportsReferenceImages + 比例/清晰度参数，不再要求用户删了重加。
- 同一批修复还包含：参考 URL 本地优先（providerUrl 过期链整类失效）+ 图生图/图生视频缺参考或缺 mapping 时拒发报人话（不再静默退化纯文生图）。
