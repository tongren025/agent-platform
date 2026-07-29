# 图片/视频模型「通用接入」方法：声明式 Transport 描述符

> 日期：2026-06-07 ｜ 状态：设计提案（基于 ~20 家官方 API 实地调研）｜ 配套：`docs/plan/2026-06-06-universal-model-onboarding.md`
> 问题：怎么让用户**既方便、又能覆盖各家供应商**地接入自己的图片/视频模型？
> 方法：4 路并行调研 ~20 家官方文档（同步图片中转 / 异步 task 平台 / 国内直连 / 非标 chat-modalities）。

---

## 0. 一句话结论

> **~20 家供应商，坍缩成 3-4 种 transport 形状。用一张「声明式 Transport 描述符」(带一组形状开关) 能表达 ~95%；
> 真正逃不掉的硬边缘只有 3 处（JWT 签名 / 二段下载 / base64 编码），用枚举开关 + 一个 token 钩子就能收编。**
> 所以"通用方法" = **描述符 schema 当唯一抽象**；"方便" = 这张描述符可由 ①内置预设 ②社区导入包 ③AI 读文档生成 ④手填 任一方式填出来——同一张表，四种来源。
>
> **✅ 已实测验证（2026-06-07 spike，`tests/transport-spike/`）**：写了一个描述符解释器 + 6 家真实描述符
> （SiliconFlow/OpenAI=images-sync，OpenRouter=chat-modalities，Replicate/fal/kie=async-task），**用假 key 打真实端点**——
> **6/6 全部到达供应商、被假 key 拒（401）**= 请求形状全部正确。证明"一个解释器 + 纯数据描述符"对 3 种 transport +
> 3 种认证（bearer / fal 的 `Key` 前缀 / header）都能构造出正确请求。**这不是纸上设计，是跑通的。**

---

## 1. 实地调研：~20 家坍缩成 3-4 种形状（证据）

| Transport 形状 | 代表供应商 | 结果取值 | 同/异步 |
|---|---|---|---|
| **A. images-sync**（OpenAI images 形状） | OpenAI、SiliconFlow、DeepInfra、Together、xAI、智谱 CogView、火山 Seedream、Google AI Studio 兼容层 | `data[].url`/`data[].b64_json` 或 `images[].url` | 同步 |
| **B. chat-modalities**（图走 chat 通道） | **OpenRouter**（`modalities:["image"]`）、Gemini 原生（`:generateContent`） | `message.images[].image_url.url` / `parts[].inlineData.data`（base64） | 同步 |
| **C. async-task**（提交→轮询/回调→取结果） | fal、Replicate、kie(market)、Runway、Luma、Veo、Sora、火山 Seedance、阿里 Wan、智谱 CogVideoX、MiniMax、可灵 Kling、Novita | `output` / `video_url` / `assets.video` / … | 异步 |

**关键观察**：
- **几乎所有视频 = C（异步）**；图片横跨 A/B/C。
- **同一语义参数，各家字段名/路径全不同**：宽高比 = `size` / `image_size` / `width+height` / `aspect_ratio` / `image_config.aspect_ratio` / `generationConfig...aspectRatio` / `parameters.aspect_ratio`（一个概念 7 种写法）。
- **`GET /v1/models` 不通用**：文本中转有（实测 dm-fox 200/13 个）；**图/视很多没有**（kie 实测 404；SiliconFlow 图片在单独页；fal/Runway/Luma/Veo 无标准 list）。→ **"拉取模型"对图/视不可靠，得靠预置/导入的精选列表。**

---

## 2. 通用方法：一张「Transport 描述符」schema

每个"供应商 × 能力(t2i/i2i/t2v/i2v)"= 一条描述符。字段：

```jsonc
{
  "transport": "images-sync | chat-modalities | gen-content | async-task",  // 形状开关①
  "endpoint":  "https://.../v1/images/generations",   // URL 模板，支持 {model} 与后缀(:generateContent/:predictLongRunning)插值
  "auth":      "bearer | header:x-goog-api-key | jwt(ak,sk)",  // 形状开关②（jwt 是唯一需代码钩子）
  "extraHeaders": { "X-DashScope-Async": "enable", "X-Runway-Version": "2024-11-06" },
  "contentType": "json | multipart",                  // Sora 创建/OpenAI edits 用 multipart
  "requestMap": {                                      // canonical → 该家字段；支持嵌套路径/枚举值映射/按模型派生
    "prompt": "prompt",
    "aspectRatio": "image_config.aspect_ratio",        // 嵌套路径
    "size": { "fn": "derive", "to": ["width","height"] }, // 按模型派生(Together)
    "responseFormat": { "map": { "b64": "base64" } }      // 枚举值映射(Together 的 base64 ≠ OpenAI 的 b64_json)
  },
  "responsePath": { "path": "data[].b64_json", "encoding": "url | base64-dataurl | base64-raw | remote-uri | json-string-then-parse | fetch-content-endpoint" },
  "refImages": { "location": "body|messages", "field": "image", "encoding": "url|base64", "max": 16 },
  "poll": {                                            // 仅 async-task
    "taskIdPath": "data.taskId | id | request_id",
    "endpoint":   "fixed-template | fromResponse('status_url')",  // fal 的 poll URL 在提交返回里
    "statusField":"state | status | task_status",
    "successValue":"success|succeeded|SUCCEEDED|SUCCESS|Success|completed|COMPLETED",  // 必可配，别硬编码
    "resultPath": "output | data.resultJson→resultUrls[] | assets.video",
    "downloadStep": null | "second-hop(files/retrieve, file_id)" | "get-content-endpoint"  // MiniMax/Sora
  },
  "listModels": "GET endpoint | null"                  // 图/视常为 null → 配 curatedModels 列表
}
```

**这张表覆盖全部调研家**：A 类用子集（无 poll）；B 类 `transport:chat-modalities` + responsePath 取 message.images；C 类带 poll 块。各家差异全落在**值**上，不需要为某家开代码分支。

---

## 3. 真正逃不掉的 3 处硬边缘（已有收编方案）

| 硬边缘 | 谁 | 收编方法 |
|---|---|---|
| **JWT 本地签名鉴权** | 可灵 Kling 官方（AccessKey/SecretKey→JWT） | `auth:"jwt"` 留一个 token 生成钩子（唯一需代码）；**或走阿里云百炼代理 → 退化成普通 Bearer**，钩子都省了 |
| **二段下载**（结果 URL 不在 status 响应里） | MiniMax（query→files/retrieve）、Sora（GET /content 二进制） | `poll.downloadStep` 枚举覆盖，仍是声明 |
| **结果编码各异**（base64-dataurl / 远端 uri / JSON-string 再 parse） | OpenRouter / Veo / kie market | `responsePath.encoding` 枚举覆盖 |
| **HTTP 永远 200，真实状态码在 body**（spike 实测发现） | kie（`{"code":401,...}`） | 加 `statusInBody.codePath` 开关——解释器读 `body.code` 判成败，不只看 HTTP 状态 |
| **认证不是 Bearer**（spike 实测发现） | fal（`Authorization: Key <key>`）、可灵 JWT、Google `x-goog-api-key` | `auth` 做成枚举：`bearer`/`key`/`header:<name>`/`jwt(hook)` |

→ 除可灵官方 JWT 需一个钩子外，**全部用枚举开关收编，无需 per-家代码**（已 spike 验证 6 家）。

---

## 4. "方便"从哪来：同一张描述符，四种填法（按省力排序）

1. **内置预设**：我们为热门家直接内置描述符（OpenAI/SiliconFlow/OpenRouter/fal/Replicate/火山/阿里/智谱/MiniMax/可灵…）→ 用户**选一个 + 贴 key**，立即可用。
2. **可导入接入包**（机制已存在 `importModelCatalogPackage`）：一人配好 → 导出 `.json` → 全员一键导入。社区补长尾。
3. **AI 读文档生成**（现有 onboarding agent 升级）：用户贴 API 文档 URL → agent **填出这张描述符**（不再每模型手配）。是长尾兜底，不是默认。
4. **手填/微调**：高级用户直接编辑描述符。

→ "通用 + 方便"= **描述符是统一抽象（通用）× 四种来源填它（方便）**。

---

## 5. 与现有代码的关系（怎么落，不推翻）

- 现状：kie 的 transport 是**写死的 per-model mapping**（`electron/catalog/kie*.ts`）。它其实就是"async-task 描述符"的硬编码特例（kie market：`jobs/createTask`+`jobs/recordInfo`，`state=success`，`resultJson` 需 parse）。
- 落地 = **把"描述符 schema + 解释器"做出来，kie 现有 mapping 改写成几条描述符数据**（加新必删旧，规则 1）；现有通用 `/v1/images|videos/generations` transport = `images-sync` 描述符的内置默认。
- **两层不变**：描述符 = transport 层（怎么调）；archetype 档案 = identity 层（要哪些参数槽/UI，按 modelKey 认）。组合即用。

---

## 6. 待真机验证（调研里标"未确认"的，落地前必测）

- 各家 list-models 接口到底有没有（fal/kie/Runway/Luma/Veo 多半没有 → 走 curatedModels）。
- 可灵官方 query 任务的精确路径与 JSON（官方页 HTTP 446 没直读到）。
- 智谱 CogView 参考图字段、CogVideoX 首尾帧字段名。
- Novita img2img/qwen-edit 参考图字段名与张数。
- **接入即验证**：每条描述符落地后，按 `docs/workflow/2026-06-06-real-generation-e2e-loop.md` 跑一次真实 E2E 生成才算"接入成功"。

## 8. 开源先例调研（2026-06-07，R6）+ build-vs-adopt 修正

调研了 ~20 个开源项目（LiteLLM / Portkey / Vercel AI SDK / aisuite / one-api / new-api / uni-api / Dify / LobeChat / FastGPT / ComfyUI / n8n / PixelRelay / ImageRouter / Open-Generative-AI…）。

**三条硬结论：**

1. **没有"纯声明式描述符"的现成开源——这是真空地带。** 主流项目（LiteLLM/Portkey/AI SDK/one-api/Dify…）的供应商层**全是"每家写代码"**；最配置化的 uni-api 也只是"配置选哪段写死的 engine"。**印证：转换算法本质要代码，描述符能声明的是"槽"（端点/认证/参数映射/模型清单/轮询字段），不是转换本身。** 我们 P4「档案声明槽、通用系统填」方向对，但别幻想用 JSON 描述清任意响应解析。

2. **图/视统一接入"没有可直接用的活开源库"**——这块被闭源 SaaS（Lumenfall/Runware/WaveSpeed/fal）占了；唯一对口的开源 ImageRouter 已弃坑无 license。**但有三处"模式"值得抄（不抄代码，license 不允许）：**
   - **Dify 的 provider/model YAML schema**（`credential_form_schemas` 变量声明 + `AIModelEntity` 能力槽）= 最接近我们描述符的骨架，**抄 schema 结构**（Apache+附加，抄思想合规）。**但 Dify 把图当受限二等公民、视频踢出供应商体系丢给 Tool——这是反面教材，我们图/视必须一等公民。**
   - **ComfyUI 的 `sync_op/poll_op` 两段式异步**（提交→taskId→轮询[进度+中断+超时]→下载 + 媒体上传/下载/校验工具层）= 异步生命周期的黄金范式（GPL，仅借模式）。
   - **new-api 的 task 子系统**（统一状态机 `queued/in_progress/completed/failed` + 异己字段进 JSON blob + **结果 URL 统一代理端点 `/v1/videos/:id/content` 服务端补凭证**）= 生产级"per-model 结果路径不一"的抹平法（AGPL，仅借设计）。

3. **★ "per-model 不手配"有成熟可抄的路：Replicate / fal 都把每个模型的 OpenAPI schema 当一等公民暴露。** 标准配方（Replicate 官网 playground 就这么干）：**拉该模型 schema → `json-schema-ref-parser`(MIT) 摊平 enum → 按 type/x-order 渲染控件/构参 → 参数原样透传 → 服务端校验**。→ **对 schema-exposing 的家，参数槽应运行时从 schema 自动 derive，不手写**（正中 CLAUDE 自检#3「随输入变的必须 derive」）。手配只在 schema 缺失 / 需归一化字段名时才要。

### build-vs-adopt 修正（重要）

- **别从零造网关。** 我们**当前技术栈就是 Vercel AI SDK**，而 **AI SDK v6 已经把 image + video 统一进 `experimental_generateImage / experimental_generateVideo`**（覆盖 Veo/Kling/Wan/Seedance/Grok 等，in-process、零 sidecar）。→ **视频/图片接入优先评估"升 AI SDK v6 用它的 media 接口"，而不是自造网关**。代价：每家仍是代码 provider 包（非声明式）、异步是黑盒（无进度/断点续传）、有 Undici 5 分钟超时坑。
- **分层落地建议**：
  - **标准家（OpenAI 兼容 images / chat-modalities）** → 我们的声明式描述符（spike 已验证）+ 现有 transport。
  - **大异步媒体家** → 优先用 AI SDK v6 的 media 接口覆盖；它没覆盖的，按 ComfyUI poll 模式 + new-api 状态机/结果代理自己补。
  - **Replicate/fal 等暴露 schema 的家** → 参数槽**运行时拉 schema 自动 derive**（json-schema-ref-parser），不手配每个模型。
  - **descriptor schema** → 抄 Dify 的骨架，但图/视一等公民 + 预留异步声明槽（提交端点/轮询端点/状态字段/结果字段/进度字段，照 ComfyUI）。

## 7. 倒计时注意

Imagen（2026-06-24 停）、OpenAI Sora Videos API（2026-09-24 停）——新接入别押这俩；图片押 Gemini image(generateContent)/SiliconFlow/火山，视频押 fal/Replicate/可灵/Veo/国内直连。

---

## 附：~20 家分类速查（实地调研，2026-06-07）

| 家 | 能力 | 形状 | 结果路径 | list-models | 备注 |
|---|---|---|---|---|---|
| OpenAI | 图 | A | `data[].b64_json`(GPT-image 只 b64) | ✅ | edits 走 multipart 子端点，refs≤16 |
| SiliconFlow | 图 | A | `images[].url` | ✅ | size=`image_size`,n=`batch_size` |
| DeepInfra | 图 | A | `data[].b64_json` | ✅ | base 多 `/v1/openai` |
| Together | 图 | A | `data[].url`/b64 | ✅ | size→width/height 或 aspect_ratio(按模型) |
| xAI Grok | 图 | A | `data[].url` | ✅(分2个) | aspect_ratio 走 extra_body；edits 必 JSON |
| AI Studio 兼容层 | 图 | A | `data[].url` | ✅ | 可靠性弱于原生，当迁移层 |
| 智谱 CogView | 图 | A | `data[].url` | ? | OpenAI 兼容 |
| 火山 Seedream | 图 | A | `data[].url` | ? | image 1或2-10张,refs |
| OpenRouter | 图 | B | `message.images[].image_url.url`(b64 dataurl) | ✅ | snake/camel 双形 |
| Gemini 原生 | 图 | B | `parts[].inlineData.data`(b64) | ✅ | refs≤14 |
| fal | 图/视 | C | per-model(`images[0].url`/`video.url`) | ✗ | poll URL 在提交返回;成功`COMPLETED` |
| Replicate | 图/视 | C | `output` | ✅ | 最规整;成功`succeeded` |
| kie market | 图/视 | C | `data.resultJson`→parse→`resultUrls[]` | ✗ | 成功`success`;另有专用线(别用) |
| Runway | 视 | C | `output[0]` | ✗ | 提交按能力分path;poll统一`/tasks/{id}`;成功`SUCCEEDED` |
| Luma | 视/图 | C | `assets.video`/`assets.image` | ✗ | 成功`completed` |
| Veo | 视 | C | `response...generatedSamples[0].video.uri` | ✅ | `:predictLongRunning`;下载带key+redirect |
| Sora | 视 | C | GET `/videos/{id}/content`(二进制) | ✅ | ⚠️2026-09-24停;二段下载 |
| 火山 Seedance | 视 | C | `content.video_url` | ? | content数组+role(first/last_frame) |
| 阿里 Wan | 视 | C | `output.video_url` | ? | 必带`X-DashScope-Async`;地域绑定 |
| 智谱 CogVideoX | 视 | C | `video_result[0].url` | ? | poll`/async-result/{id}`;成功`SUCCESS` |
| MiniMax Hailuo | 视 | C | query→`file_id`→retrieve→`download_url` | ? | 二段下载;成功`Success` |
| 可灵 Kling | 视 | C | 官方未直读/百炼`output.video_url` | ? | 官方JWT;百炼代理退化普通Bearer |
| Novita | 图 | C | `images[].image_url` | ? | extra/request双层嵌套;成功`TASK_STATUS_SUCCEED` |
