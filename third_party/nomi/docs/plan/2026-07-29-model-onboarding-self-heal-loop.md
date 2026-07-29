# 2026-07-29 群反馈根治：第三方模型接入「自愈闭环」

来源：用户群持续反馈簇 + board 存量同根项——`fb-20260721-add-model-id-button`（加模型 Id/预设可编辑）、`unc-20260722-model-preset-editability`（endpoint/参数改不了，阶跃星辰案例）、`fb-20260720-relay-model-pull-error-clarity`（报错文案不具体）、`fb-20260720-inapp-logs`（App 内看报错）。表象五花八门（接 A 站报错/接 B 模型无法用/想换 URL 找不到/新手首配即挂），是**同一类病**：配置错误发现太晚 + 发现后无处修 + 每个新形状都要我们发版。

## 为什么这类问题天天冒（根因，读码实证）

1. **报错离配置现场太远**。接入时只有协议级「测试连接」（非阻断，`onboardingIpc.ts:141`），文本/视频类零探活（`catalogCommit.ts:270-273` 自注：text 无 mapping 无连通性入口）；图像只探「改图协议」。新手配错 base URL / key / 模型名，要到画布上**首次付费生成**才炸——错误出现在离配置最远的地方，所以感觉「到处报错、各个地方都出问题」。
2. **发现后无处修**。命名官方预设（stepfun 等 13 家，`providerPresets.ts:35`）接入时 base URL 被隐藏（`OnboardingWizard.tsx:62` `editBaseUrl=false`）；落库后不在 `KNOWN_VENDORS`（`knownVendors.ts:74`），要靠恰好分桶进 `otherVendorGroups` 才能拿到 `CustomVendorManage` 编辑卡（`OnboardingDrawer.tsx:363-392`）——分桶不中就**改 URL 无门**（阶跃星辰反馈根因）。kind 只在接入期能改（`OnboardingWizard.tsx:467`），落库后无编辑器；`imageEditProtocol` 全 App 零 UI。用户唯一出路=删了整家重加。
3. **诊断能力是半截**。`testModelCatalogMapping`（真跑一次该模型，`catalogCommit.ts:437`）逻辑齐全、已暴露到 `desktopClient.ts:297`，但**无任何 UI 调用**——用户接完模型没法「点一下测测」，只能盲发生成（花额度）来试。
4. **错误人话层是窄短语白名单**。`classifyError.ts:130-207` 的 account-gate/model-not-open/balance 特判靠已见过的措辞；新中转站奇形报错落 `unknown` → 提示「稍后重试」，对配置错误是误导。
5. **新模型 = 改代码发版**。策展种子（`electron/catalog/apimart*.ts`）编译进包，新模型上架/参数修正都要发版——「天天改」的结构性来源。

**这类 bug 的入口集**：任何「配置 × 上游形状」不匹配（URL 变体/key 无效/模型未开通/kind 猜错/协议判错/账号档位闸）。修在单点=永远修不完；修法必须是**把「发现→定位→修复」收进一个闭环**。

## 一劳永逸的形状：三层闭环 + 一层数据化

**L1 零额度体检器（治「报错离现场远」）**
把 `imageEditProbe` 已验证的「错误形状嗅探」（`imageEditProbe.ts:63-65`：故意发**缺必填字段**的请求、读报错形状判端点，服务端在计费前就拒绝，零花费）泛化成全类探活梯子，对每个已接模型给出诊断：
- ① key 有效性：GET `/models` 带 key（401/403 → key 错；纯 auth 检查，零风险）
- ② 模型在列：拉到的列表里有没有这个 model id（没有 → 模型名错/未开通）
- ③ 端点/参数形状：POST 故意缺必填字段 → 报「缺参/required」= 端点通；404/405 = 端点不对（自动试 `/v1` 变体等已有兜底）；401 = key；业务码 = 账号闸（走既有 `classifyError` 词表）
- 保守原则沿用 imageEditProbe：**拿不准一律「未知」，绝不误报绿**；绝不发可能触发计费的完整请求。
- 挂两处：接入 commit 后自动跑一轮（非阻断，结果落模型卡角标）；已接模型管理卡常驻「体检」按钮。
- 「真跑一次」（花额度、最小参数）= 给已有 `testModelCatalogMapping` 接上 UI 按钮，用户点了才花，结果与体检共用同一诊断卡。

**L2 统一模型管理卡（治「改不了/删了重加」）**
所有 vendor —— 自定义中转、策展家、命名官方预设 —— 同一张管理卡口径（现状能力差异见下表），在 `CustomVendorManage` 既有编辑套件（URL/key/断开/单删/启停，`CustomVendorManage.tsx:48-94`）之上补齐：
- kind 落库后可改（`ModelEnableEditor` 加类型下拉，猜错不再删家重来）
- `imageEditProtocol` 显式三选（chat 多模态 / openai-multipart / xai-json，现只有 commit 时探测定死）
- 「+ 添加模型 Id」（board 存量需求，漏拉的模型手补一条，复用 guessKinds 预填）
- 命名官方预设一视同仁拿到这张卡（收掉「分桶对了才有编辑入口」的脆弱链）

| 能力 | 自定义中转 | 策展家 | 命名预设 | 改后 |
|---|---|---|---|---|
| 改 URL / 换 key / 单删模型 | ✅ | ✅(URL 除外) | ❌ | 全 ✅ |
| 改 kind / 改图协议 / 加模型 Id | ❌ | ❌ | ❌ | 全 ✅ |
| 体检 / 真跑一次 | ❌ | ❌ | ❌ | 全 ✅ |

**L3 报错→回诊一键闭环（治「看懂了也没有下一步」）**
生成错误卡（`NodeErrorReport.tsx` / `AssistantErrorCard.tsx`，已共用 `classifyGenerationError`）加「去体检」动作：深链到该模型管理卡并自动跑 L1，体检结论直接给可点的修复项（切 URL 变体/换协议/改模型 id/换 key）。`unknown` 类兜底文案从「稍后重试」改为「跑体检定位」+ 服务商原话前置（原话展示已有，`classifyError.ts:14-19`）。错误详情加「复制诊断包」（含 requestId/端点/状态码，对应 in-app logs 需求的最小闭环）。

**L4 策展目录数据化 OTA（治「天天改/发版」，Phase 2 单独拍板）**
apimart 等策展种子从「编译进包」升级为「包内基线 + 远端 overlay」：新模型上架/参数修正=改数据仓即时生效，不发版。沿用 builtinPacks 的「出口前置」模式（⚠️ 已知坑：在线拉取会整体顶掉 seed，overlay 必须是叠加合并不是替换）。数据与代码的边界：**模型清单/参数/文案走数据**，**传输协议仍在代码**（有限集合、缓慢增长——三协议+异步轮询已覆盖绝大多数中转）。

## 方案对比（R3）

| 方案 | 用户看到 | 代价 | 复发风险 |
|---|---|---|---|
| **A：L1+L2+L3（推荐）** | 接完立刻知道每个模型通不通、不通为什么；任何配置随时可改；报错卡一键回诊 | 中（3 个子系统改造，UI 需样张拍板） | 新形状中转仍可能落 unknown，但有体检兜底定位；新模型上架仍需发版 |
| B：A + L4 | 同 A + 新模型「上架即有」 | 大（远端 overlay 的安全/回滚/顶掉 seed 风险） | 最低，但引入远端数据正确性新风险面 |
| C：逐条修 board 单项 | 每条小改善（加个按钮/改句文案） | 小 | **高**——下一个新中转/新模型出现同类问题，继续天天修 |

推荐 **A 先行**：C 治不了「类」（违 P2）；L4 收益真实但独立、且有 seed 顶掉类风险，等 A 落地后单独拍板节奏。

## 不动项

- 既有健全地基不重造：统一错误人话层（`classifyError`+`narrate` 穷举 Record）、`VendorRequestError.structured` 双端穿透、单文件持久化（`model-catalog.json` + safeStorage）、图生图三协议+免费探测+运行时 `imageRouteFallback`、`/v1` 双端点兜底、非阻断保存门槛（`onboardingSaveGate`）。
- 「重试绝不包住付费提交」铁律不动（体检器全部走零额度路径，真跑一次是显式用户动作）。
- 三套 vendor 名单的**展示**分区不合并（策展家卡有产品语义）；只统一**编辑能力**口径。

## 验收门

- 单测：探活梯子判定表（401/404-route/404-model/400-missing-param/业务码/超时 → 各诊断）、kind 改写迁移、协议切换后 mapping 重建。
- 五门全过；UI 改动先出可交互样张 + 用户拍板（R8），实现后与样张逐项对账 + R13 真机走查（接一个故意配错的中转 → 体检给出正确诊断 → 一键修好 → 真生成通）。
- 落 main：独立 sibling worktree 钉 origin/main cherry-pick 后 push（并行纪律）。

## 回滚

L1/L2/L3 各自独立 commit；体检器纯增量（新 IPC + 卡片 UI），回滚即撤卡；kind/协议编辑走既有 `mutateCatalog` 事务，无 schema 迁移（字段全部已存在）。
