# 接入魔搭 ModelScope + 官方火山引擎 Ark（#3 第一批）

> 2026-06-19 · 状态：方案待拍板
> 用户拍板：先接 **魔搭 ModelScope** + **官方火山引擎 Ark**（不做 Gemini）。交互入口统一走现有「模型接入」。

## 0. 关键结论（R6 读真代码后）

**不是架构问题，是覆盖问题。** Nomi 的生成接入已是纯数据驱动、零代码——一条 `Mapping`
把请求形状写成 `HttpOperation` 模板（[electron/catalog/apimartImages.ts](electron/catalog/apimartImages.ts) /
[apimartVendor.ts](electron/catalog/apimartVendor.ts)），比 Infinite-Canvas 的固定 6 协议更通用，比
toonflow 的「每供应商写 TS 文件」省一整层。**这两家都是 async create→poll 家族，和 apimart 同构**，
直接照 apimart 镜像即可，无需新 transport（不像即梦 CLL / ComfyUI）。

更省的是：**档案（archetype）已经有了**——`SEEDREAM`（火山 Seedream）、`Z_IMAGE`（魔搭 Z-Image-Turbo）、
`QWEN_IMAGE`（魔搭 Qwen-Image）都已注册（[modelArchetypes/index.ts:23](src/config/modelArchetypes/index.ts)），
现在只是把它们从「挂在 apimart 聚合站」扩成「也能挂在官方 vendor」。同档案跨 vendor 复用 = 设计本意
（档案=能力，vendor=端点），**不是并行版**（P1 不违反）。

## 1. 魔搭 ModelScope（图片，async-poll，与 apimart 同构）

来源：Infinite-Canvas `main.py:7279-7320`（真实工作代码）。

```
vendor: key="modelscope" name="魔搭社区" baseUrl="https://api-inference.modelscope.cn" authType=bearer
```

**create op**（异步）：
```
POST /v1/images/generations
headers: { Authorization: "Bearer {{user_api_key}}", Content-Type: application/json, "X-ModelScope-Async-Mode": "true" }
body:    { model: "{{model.modelKey}}", prompt: "{{request.prompt}}",
           size?: "{{request.params.size}}", image_url?: "{{request.params.image_urls}}" }   // image_url 是改图输入(data URL 数组)
response_mapping / provider_meta_mapping: { task_id: "task_id" }
```
**poll op**：
```
GET /v1/tasks/{{providerMeta.task_id}}
headers: { Authorization: "Bearer {{user_api_key}}", "X-ModelScope-Task-Type": "image_generation" }
response_mapping: { status: "task_status", image_url: "output_images.0", error_message: "error_info" }
```
**status 归一**：SUCCEED→succeeded；FAILED/FAIL/ERROR/CANCELED/TIMEOUT/REVOKED→failed；其余→running。

**curated 模型**（复用已有档案）：
| modelKey | 档案 | taskKind |
|---|---|---|
| `Tongyi-MAI/Z-Image-Turbo` | z-image | text_to_image |
| `Qwen/Qwen-Image-2512` | qwen-image | text_to_image |
| `Qwen/Qwen-Image-Edit-2511` | qwen-image | image_edit |
| `black-forest-labs/FLUX.2-klein-9B` | 新建 flux-klein 档案（无现成） | text_to_image |

> LoRA（Daniel8152/film 等）魔搭支持但属进阶，v1 不做（避免一次堆参数，符合 R2）。
> 魔搭也有 OpenAI 兼容 chat（Qwen3，`/v1/chat/completions`）→ 可作文本 vendor，但本批只做图片，chat 留后。

## 2'. 火山实测发现（2026-06-19，用户 key 真实 probe）—— 阻塞在「模型未开通」

用真实 key 直接 probe 火山 Ark，钉死了几件事，也暴露了硬阻塞：

- **认证**：核心生成走 **Bearer API key**（用户给的 `ark-` key），不是 AK/SK V4 签名。
  IC 里的 V4 签名只用于「头像素材管理」子系统，Seedream/Seedance 生成用 Bearer（已 probe 证实）。
- **modelKey 用模型直连名**（不用 endpoint id）。错误文案 `InvalidEndpointOrModel.NotFound` 证实两者都收。
- **❌ 阻塞：账号未开通任何模型**。视频端点明确回 `{"code":"ModelNotOpen","message":"account
  2126482930 has not activated the model ... activate in the Ark Console"}`；图片同样 404。
  → **真实出图/出片验证不可能**，直到用户在 Ark 控制台「开通管理」激活 Seedream + Seedance。
- **⚠️ Seedream 尺寸契约刁且不可凭猜**：IC 的 `normalize_volcengine_size` 有整套吸附（按比例 + 最小
  像素数 ~3686400(≈1920²) + 16 对齐 + 边长上限），错误样本含 "image size must be at least N pixels"
  / "Seedream 5.0 建议从 2K 起步"。**没有 live 模型根本调不准**——这正是不该凭猜写进默认目录的地方。

**结论**：火山不照魔搭那样"先写后验"——它的参数契约必须 live 验证。**待用户开通模型后，一次性写
+真实出片/出图验证再并入默认目录**（与魔搭同标准）。在此之前不 seed 火山 vendor（避免给用户显示
跑不通的模型）。下方是已扒到的形状，开通后照此写+验。

## 2. 官方火山引擎 Ark（图片 Seedream 同步 + 视频 Seedance 异步）

来源：Infinite-Canvas `VOLCENGINE_DEFAULT_BASE_URL` + Ark 官方协议（实现前 R5 用火山官方文档逐字核对）。

```
vendor: key="volcengine" name="火山引擎 Ark" baseUrl="https://ark.cn-beijing.volces.com" authType=bearer
```

**图片 Seedream（同步，无 poll）**：
```
POST /api/v3/images/generations
body: { model:"{{model.modelKey}}", prompt:"{{request.prompt}}", size?:"{{request.params.size}}" }
→ data[0].url 直出   response_mapping: { image_url: "data.0.url" }
```
档案：seedream。modelKey 用 Ark 的 endpoint/model 名（如 `doubao-seedream-*`，实现时确认）。

**视频 Seedance（异步 create→poll）**：
```
POST /api/v3/contents/generations/tasks
body: { model:"{{model.modelKey}}", content:[{type:"text", text:"{{request.prompt}}"}, (i2v 加 image)] }
→ { id }   provider_meta_mapping: { task_id: "id" }
poll: GET /api/v3/contents/generations/tasks/{{providerMeta.task_id}}
→ { status, content:{ video_url } }   status: succeeded/failed/running
```
档案：seedance（已有）。模型：`doubao-seedance-2-0-260128` / `-fast` / `1-5-pro` 等（t2v + i2v 两条 mapping）。

## 3. 落地清单（数据为主，镜像 apimart）

新增文件（不碰现有 vendor）：
- `electron/catalog/modelscopeVendor.ts`（vendor 种子 + query/status op）
- `electron/catalog/modelscopeImages.ts`（create op + curated 模型）
- `electron/catalog/volcengineVendor.ts`
- `electron/catalog/volcengineImages.ts`（Seedream 同步）+ `volcengineVideos.ts`（Seedance 异步）
- `src/config/modelArchetypes/fluxKlein.ts`（仅 FLUX.2-klein 需要新档案）
- 改 `electron/catalog/seedBuiltins.ts`：把上述 model/mapping 加进 CURATED_MODELS/CURATED_MAPPINGS
- 改 `src/config/knownVendors.ts`：加两家 preset（onboarding 下拉里能直接选）

> ⚠️ **并行会话冲突**：`seedBuiltins.ts` 正被另一会话改（apimart 文本大脑）。只在 CURATED 数组追加
> 自己的行、不动他们的导入，push 前 fetch 对账（已踩过这坑）。

## 4. 不动什么
- 不碰 apimart/kie 现有 vendor 与 mapping（P1：新增不改旧）。
- 不引入新 transport（两家都套现有 async-poll requestJson 管线）。
- 不做 LoRA / 魔搭 chat / 火山 endpoint 自建（本批范围外）。

## 5. 回滚
纯增量：删两个 vendor 种子文件 + 从 seedBuiltins 撤回追加行。对账是幂等的，旧装机不受影响。

## 6. 验收门（「接入即验证」铁律）
1. 五门全过。
2. vendor/mapping 形状单测（mirror `apimartImages` 既有测试）。
3. **真实 E2E 生成**：需用户的 **魔搭 API key + 火山 Ark API key**（用户资源）→ 每家跑一次真出图/出片，
   分层验 UI/配置/传输/渲染，按 model-onboarding 铁律对账全参数表。
4. 真机走查：模型接入面板能选到两家、配 key、画布节点能选其模型生成。

## 7. 需要用户提供
- 魔搭 ModelScope API key（api-inference）
- 火山引擎 Ark API key（+ 是否已开通 Seedream/Seedance 模型权限）
- 火山侧确认：用「模型直连名」还是「推理接入点 endpoint id」（影响 modelKey 取值，R5 核对）
