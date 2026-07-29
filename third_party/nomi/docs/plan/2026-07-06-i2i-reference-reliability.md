# 图生图/改图「不按原图」根治：存量自愈 + 本地优先 URL + 诚实护栏

日期：2026-07-06 ｜ 状态：已交付（三层全部实现 + 单测 + R13 真机走查全过）｜ 施工分支：钉 origin/main 的独立 worktree（本地 main 落后 63 提交不可用）

## 背景（为什么）

多位用户反馈「图生图/改图没有根据原图调整」。深挖（2026-07-05 调查，三路 agent + v0.16.1 逐行核实）定位为**参考图根本没送到模型手里**，两个主根因 + 一组放大器：

1. **存量中转模型没有图生图能力，且永远不会自动获得。** 8c711f0c（随 v0.16.0 发出）只在**新接入**时写 `image_edit` mapping + `meta.imageOptions.supportsReferenceImages`（catalogCommit.ts:178,201-209）；reconcile 只认 9 家内置 vendor，v3→v4 迁移只补 paramMap。旧条目：UI 不渲染参考槽（parameterControlModel.ts:109）；用连线绕过 → `resolveTaskKind` 判 `image_edit`（catalogTaskResolve.ts:189-190）→ 无 mapping → **runtime fallback 请求体没有任何图片字段**（runtime.ts:601-609）→ 生成成功、扣费成功、无视原图。云雾用户 07-01 反馈即此（含「只能出 1K」）。
2. **参考链路一律优先「会过期的服务商临时直链」。** 三处同口径 providerUrl 优先（referenceUrl.ts:16-17 / nodeContext.ts:51 / parameterControlModel.ts:186-190）；生成结果明明有本地持久文件（runtime.localizeTaskAsset 双写 url+providerUrl），但 kie CDN ~3 天 / apimart 72h 过期后：chip「加载失败」+ 发出去的就是死链（localizeAssetsForVendor 只处理 nomi-local://，https 原样放行）。**且** sidecar `.meta` 的 originalUrl 在上传管线里短路（assetLocalization.ts:211,116）——即便先翻转优先级，过期 originalUrl 仍会被直接采用。
3. **放大器：** taskKind 只看模式不看参考是否非空；图像节点生成钮永远可点（canRunGenerationNode image 恒 true，视频有护栏图像没有）；`image_to_video` 掉 fallback 同样丢首帧（同类病）；chip「加载失败」长得像无害缩略图问题。

## 方案（三层，全修）

### L1 存量自愈 —— catalog v4→v5 迁移 `migrateRelayImageEditCapability`

- 对每个**非内置** vendor（沿用 BUILTIN_VENDOR_KEYS 排除法）：其 image 模型 ≥1 且存在 create.path 以 `/images/generations` 结尾的 t2i mapping（OpenAI 兼容证据，与 v4 同款嗅探）才动手；奇形怪状的 agent 自接 vendor 不猜、不动。
- 三件事（幂等、只增不改用户自定义）：
  1. 无 `(vendor, image_edit)` mapping → 补一条 `NEWAPI_IMAGE_EDIT_OP`（chat/completions 多模态，与新接入同源常量）。
  2. 每个 image 模型 `meta.imageOptions.supportsReferenceImages` 补 true（保留 meta 其余字段）。
  3. 参数升级：仅当 `meta.parameters` 的 key ⊆ {size, quality, n}（老标准签名，含空）→ 替换为 NEWAPI_STANDARD_IMAGE_PARAMS 投影（比例/清晰度 1K/2K/4K/质量/张数）；doc 派生的自定义参数一律不碰。v4 已给老 body 补 paramMap，故新参数经 ratioResToOpenAiSize 翻译后老 body 照样能发。
- `CURRENT_CATALOG_VERSION` 4→5；高版本只读保护既有机制自动生效。

### L2 本地优先 URL —— 「参考图永不过期」

- **渲染层收口 + 翻转**：`referenceUrl.resultUrl` 改为 `url → providerUrl → thumbnailUrl`（本地持久文件优先，providerUrl 只在无本地拷贝时兜底——#4「providerUrl-only 被丢」仍覆盖）；`nodeContext.collectNodeContext` 与 `parameterControlModel.resultPreviewUrl` 改调 `resultUrl`（P1 单源，消灭三份手写优先级）。chip 预览随之变本地 → 永不腐烂。
- **electron sidecar 新鲜度门**：`readNomiLocalAsset` 返回值加 `ageMs`（资产文件 mtime 推）；assetLocalization 引入 `ORIGINAL_URL_TRUST_MS = 48h`（kie ~3d / apimart 72h 的安全下界），originalUrl 仅在新鲜时短路采用，过期 → 走既有上传链（目标 vendor → kie → apimart → 其他 → litterbox/tmpfiles 匿名兜底）重新换公网直链。新鲜路径零新增延迟、零新增上传。
- 本地文件缺失（被删/迁移）→ 上传链读文件失败即抛**人话错误**（不再有 providerUrl 可赌，诚实失败优于静默错图）。

### L3 诚实护栏 —— 静默降级 → 显式失败

- **electron runTask 两道闸**（付费守卫之前）：
  1. `kind === 'image_edit'` 且请求里一张参考图都没有（新 helper `hasImageEditReferences`，读 referenceInputParams + firstReferenceImage，纯函数可测）→ 拒发：「图生图请求缺少参考图…」。
  2. `kind ∈ {image_edit, image_to_video}` 且无 mapping → **绝不掉进丢图的 fallback**，拒发：「该模型没有配置图生图/图生视频通道（旧版本接入不含此能力），请删除后重新接入或换模型」。（L1 已自愈中转存量；此闸接住 agent 自接等残余 + MCP/headless 路。）
- **渲染层生成钮护栏**：`canRunGenerationNode` 图像分支不再恒 true——档案当前模式为 image_edit 且声明了参考槽、而 `resolveReferenceSlots` 零填充（含 pending）且无 meta 上传 → false；composer `disabledReason` 给图像版文案「图生图需要参考图：连线图片节点，或点 + 添加」。连了线未生成（pending）仍走既有「备齐」波次，不禁用。
- **chip 失效态**：NomiImage 加可选 `fallbackLabel/fallbackTitle`，AssetTile 参考图用「图已失效」+ 可行动 title（删除此参考重加 / 重新生成源图）。

## 不动项

- 内置 curated vendor 的 seed/repair（kie GPT Image 2 等）一概不碰。
- `/v1/images/edits` multipart（gpt-image/DALL·E 原生改图端点）仍不接（8c711f0c 既有诚实边界，另立项）。
- 上传结果缓存（同素材重复上传去重）不做——新鲜 sidecar 已覆盖绝大多数（≤48h 重生成）场景，剩余重传成本可接受，避免过度设计。
- AI 对话助手附件栏（useComposerAttachments）是另一条路，不在本次范围。

## 回滚

三层同属一份「图生图不按原图」根治包、单 commit 交付（billingKindForTaskKind 下沉与 L1 的 types.ts 版本位纠缠，拆开会造出不可独立 revert 的半截）——回滚即整包 revert。L1 迁移只增不删：回滚代码后 v5 catalog 对旧应用触发只读保护（既有机制），不会损数据。

## 验收记录（2026-07-06）

- 单测：catalogMigrateV5（7）/ referenceUrl 口径 / assetLocalization 新鲜窗（4）/ hasImageEditReferences（7）/ runtime 两道闸+「参考图真到 wire」正路径（4）/ canRun 图像分支（4）；全量 268 文件 2548 测全绿。
- 五门：filesize（runtime 643→630 净减）/ tokens / lint / typecheck / test / build 全过。
- R13（scripts/i2i-reliability-walkthrough.mjs，截图在 .i2i-reliability-lab/）：
  - A：种 v4 老中转 catalog → 真实启动后磁盘 catalog=v5、image_edit mapping（chat/completions）落盘、supportsReferenceImages=true、参数升级 aspect_ratio/resolution；UI 上该模型参考槽 tile + 清晰度控件出现。
  - B1：GPT Image 2 切「图生图」零参考 → 生成钮真实禁用，tooltip「图生图需要参考图（拖入 / 连线 / 点 +），或切回「文生图」」。
  - B2：上传参考后按钮恢复可点。
  - B3：删除底层资产文件 + 重启实例 → chip 显示「图已失效」（替代无害化的「加载失败」）。
  - 全程零 console/page error。
- 未做真金生成对拍（图生图真实出图跟不跟原图）：走查用假 key；wire 层已由「参考图真到 chat content」单测钉死，真图对拍留给下次带真 key 的评测批。

## 验收门

- 单测：迁移（存量升级/幂等/内置不动/自定义参数不动）、resultUrl 优先级、sidecar 新鲜度门、hasImageEditReferences、runTask 两道闸、canRunGenerationNode 图像分支。
- 五门全过（worktree 里 `pnpm run gates`）。
- R13 走查：真机验 ①迁移后存量中转模型参考槽出现 ②图生图零参考禁用+文案 ③chip 本地预览。可行则加一发真生成（kie GPT Image 2 i2i，评测额度默认授权）验「参考图真跟着原图」。
- 样张：L3 用户可见部分（禁用态 tooltip / 拒发错误卡文案 / chip 失效态）出 HTML 样张对账。

## 关联

- 调查记录：本文件背景节（2026-07-05 会话）；docs/plan/2026-07-01-generic-relay-image-edit-and-resolution.md（其「存量需删了重加」遗留由本次 L1 关闭）。
- 记忆：generic-relay-image-edit-and-resolution / url-priority-inconsistency-ref-lost / retry-must-not-wrap-paid-submit（上传重试边界不变）。
