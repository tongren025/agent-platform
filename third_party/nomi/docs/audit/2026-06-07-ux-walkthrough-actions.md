# Nomi UX 走查处置方案 — 6 角色评审 + 调研（2026-06-07）

> 配套文档：走查记录见 [`2026-06-07-ux-walkthrough.md`](./2026-06-07-ux-walkthrough.md)（发现编号 E/H/C/G/M/P 在那边）。
> 本文 = R7 六角色（CTO / 设计 / PM / 前端 / 后端 / 真实用户）并行评审 + R6 开源调研 + 处置路线。
> 所有 file:line 均来自评审 agent 实读代码核实；下面**先列两条对走查记录的事实修正**，再给汇总。

---

## 0. 评审先纠正的两条事实（已回填走查记录）

1. **E3 归因错误**：全仓 `grep requestSingleInstanceLock` **零命中**——代码**根本没有单实例锁**。"秒退"真因是启动链 `app.whenReady().then(…).catch(() => app.quit())`（`electron/main.ts:766-769`）任一步抛错即**静默退出、无 `dialog.showErrorBox`**。→ 暴露两个真根因：**① 缺单实例锁**（双开并发写同一 `model-catalog.json`/project JSON 有损坏风险）；**② 启动失败静默退无提示**。
2. **WIP 编译已自愈**：后端 agent 实跑 `pnpm run typecheck` **全过**，`electron/ai/agentChatHarness.ts` 已落地并导出 runtime.ts 需要的符号。走查记录里"编译 broken"在评审时已不成立。（注意：`agentChatHarness.ts` 仍是 `git status` 未跟踪新文件，与 runtime.ts 的 WIP 改动**必须同进同退**——回滚 runtime 不删 harness、或删 harness 不回滚 runtime，都会重新 broken。）

---

## 1. 根因聚类（把 19 条发现收敛成 6 个根因）

评审一致结论：表层 19 条发现，根子在 6 类。**修根因（P2）而非逐条修症状**。

| 根因簇 | 覆盖的发现 | 一句话本质 | 根在哪一层 |
|---|---|---|---|
| **R-A 失败静默** | E1, E2, E3② | 打开项目/启动/懒加载失败时**零可见反馈**，按钮像"坏的" | 渲染层不 catch（`NomiStudioApp.tsx:131-169`）+ 后端错误信息不可诊断 + 缺全局异步网兜 |
| **R-B 管线名泄漏** | M1, H1 | `kie`/`dm-fox`/`api-moonshot-cn`、下划线时间戳——给机器看的名字出现在创作者界面 | 渲染层 DTO 投影丢字段（`OnboardingDrawer.tsx:133`，而 `Vendor.name` 早已存在）；项目命名 derive 缺失 |
| **R-C 接入门槛** | M4, M3, M2 | 不懂技术的人被要求"贴 API 文档 + sk- key"；配完不知通没通；视频模型还归错类 | onboarding 缺"已知 vendor 按 archetype 预置免文档"这一层（`main.ts:489` 强制 docsUrl） |
| **R-D 空态/反馈缺失** | G1, C4, 示例没演示力 | 点节点没反应、编辑器一片白、示例打开是空项目——新用户卡在"现在该干嘛" | 纯 CSS 缺选中环（`generationCanvas.css` 无 `[data-selected]` 规则）+ 缺空态引导 + 示例数据空 |
| **R-E AI 入口双生子** | C2, C3, G4, G5, C5 | 两个长得一样的助手分不清、"拆镜头/分镜"两套概念、建议调性硬编码为小说向 | 两个 composer 外壳复制（`CreationAiPanel` vs `CanvasAssistantPanel`）+ chips/模式没随项目 derive |
| **R-F 空间挤压** | G2, G3, P1, M5, H3/H4/H5 | 画布被三栏夹成窄条、帮助弹错位、导出主操作被淹没、首页凌乱 | 三个侧空间消费者各管各的、无统一布局编排（`GenerationWorkspace.tsx:20`，助手 340px 写死） |

---

## 2. 六角色评审要点（各自最关键的判断）

- **CTO**：M 簇真相是"**后端数据模型已足够丰富，问题在渲染层 DTO 漏字段 + onboarding 缺 vendor 目录层**"——M1/M2/M3 是小改、M4 才是真架构活。健壮性上 R-A 必须修根因（一处 catch 堵整类静默）。单实例锁是**架构岔路**（加锁=单窗口模型，与"多项目多窗口"互斥，需拍板）。
- **设计**：最严重是"**一致性裂缝**"（管线名泄漏 / 助手双生子 / 缩略图&导出两套视觉），直接违反 `Design.md` 单一真相源。好消息：**节点选中态(§5.5)、状态徽章(§3.3 StatusBadge)、导出主按钮(§5.3)、占位斜条纹(§5.1) 设计系统里全有现成 token/组件，只是实现没接上**——属执行缺口不需重设计。需先出 mockup 的只有 4 项结构性改动。
- **PM**：漏斗最致命的两个收口是 **关口4（G1 找不到参数面板）** 和 **关口5（M4 模型门槛）**；**示例演示力是 aha moment 的引信**。本版应锁 P0（G1+M4+示例+E2）打通 J3，其余是漏斗内优化。
- **前端**：**G1 是纯 CSS 缺口**（`data-selected` 已正确切换、只差一条 outline 规则，**零重渲染代价**，性价比最高）；最大复用机会是抽 **`AssistantComposer`**（两面板 95% 相同，差异收进 `footerExtras` 槽）和 **`ModelRow`**（顺手把模型接入从 Mantine 孤岛迁回 token 体系）。巨壳警告：`OnboardingWizard.tsx` 790 行贴线，M3 逻辑务必落新建 `ModelRow.tsx`。
- **后端**：IPC 错误契约本身**健全**（`registerSyncIpc`+`invokeSync` 已成对冒泡），R-A 缺的是渲染层接 + `readWorkspaceProject` 区分错误类型（现在"读失败"和"不存在"都 `return null`）。免文档接入**已有两条路径**（内置 seed + manual-commit），只缺"已知 vendor 按 archetype 预置"。M2 必须在 commit 唯一写入口加 kind 护栏，否则下一个 onboard 的视频模型又归错。
- **真实用户（剪映用户，打 4/10）**：三个想关软件的瞬间 = **① 被要求贴 API 文档+key ② 点"等待生成"格子没反应又无引导 ③ 满屏 `kie` 黑话 + 小说向建议**。亮点要保留：**"自动选模型"方向对（应全局推广）**、导出禁用带原因、整体视觉干净。原话："方向对，但还没到能交给真人用的程度。"

---

## 3. 处置路线（按用户价值排序，P0→P2）

### P0 — 不修则 J3「30 秒上手」不成立（本版必做）

| 项 | 根因簇 | 改法（含 file:line） | 量 | 先 mockup? |
|---|---|---|---|---|
| **G1 节点选中态 + 检查器** | R-D | 先补选中环：`generationCanvas.css` 加 `[data-selected='true'] …{ outline:2px solid var(--nomi-accent); outline-offset:4px }`（零重渲染，别用 React 条件渲染破坏 memo）。再让点节点能进参数：评估把参数从节点内（`NodeParameterControls.tsx` 609 行）抽到右侧 inspector（参考 xyflow inspector 范式，顺带解 R-F 空间） | S（选中环）/ L（inspector） | inspector 要 |
| **M4 已知 vendor 免文档接入** | R-C | 后端：把散在 `kie*.ts` 的 curated 定义收口成 `vendorArchetypes` 注册表 + 新 IPC `nomi:onboarding:add-from-archetype`（`vendorKey/modelKey/archetypeId/apiKey` → upsert vendor/key/model/mapping，**不碰 docsUrl、不跑 agent**）。前端：选已知 vendor → 列 archetype 点选 → 填一次 key。docsUrl+agent 降级为未知 vendor 逃生口 | L | 要 |
| **冷启动断路（CS1+CS2）** | R-C | **空状态走查新增、比 M4 更前置**：① fresh install **零文本模型预置**（只有 kie 图片/视频），「30秒体验」必死——需内置一个可接入的**文本模型 archetype**（同 M4 机制）；② 首页**无任何「模型接入」入口**，且点示例的"打开模型面板"事件在首页无监听器——需在**首页/项目库**直接加模型接入入口（不必先进工作区），并把示例的模型预检 toast（现被裁断 CS3）改成"点此接入"可点引导。这是 J3「关口 0」，不修则新用户第一步就走不动 | M | 要 |
| **示例演示力** | R-D | 内置一个**真做完的样例项目**（文案+分镜+已生成缩略图+可直接预览/导出），打开即看到成品。需拍板形态（见 §5 取舍 A） | M | — |
| **E2 打开项目失败可见反馈** | R-A | `NomiStudioApp.hydrateProject` 包 try/catch → `toast(msg,'error')`；`!hydrated` 也给 toast；`openProject` 不再 `void` 吞返回值；加 `hydratingProjectId` loading 态。与 `openWorkspaceFlow.ts:46-60` 已有的错误契约对齐成一套 | M | — |
| **E1/E3 健壮性兜底** | R-A | ① `src/main.tsx` 挂 `vite:preloadError`→`location.reload()` + `unhandledrejection`→落 crashLog（堵 stale-chunk 整类）；② `electron/main.ts` 加 `requestSingleInstanceLock`（**需拍板单/多窗口**，见 §5 取舍 E）；③ 启动 catch（`main.ts:766`）补 `dialog.showErrorBox`+`logCrash` | S–M | — |

### P1 — 明显降信任/成功率，不物理卡死（这版尽量带上）

| 项 | 根因簇 | 改法 | 量 |
|---|---|---|---|
| **M1 vendor 真名替代内部 key** | R-B | `OnboardingDrawer` 副标题 `row.vendorKey` → `vendor.name`（数据已就位，fallback key）。**不要新增 displayName 字段**（造第二真相源） | S |
| **M3 模型行状态化** | R-C/R-D | 抽 `ModelRow.tsx`（token 化去 Mantine）：启用开关（`upsertModel({enabled})`）+ 状态徽章（消费 `getModelCatalogHealth()` 的 per-model issue + `StatusBadge`）+「测试连接」（复用 `main.ts:616` test-connection）+ 删除降为次级菜单 | M–L |
| **M2 视频模型归位 + commit 护栏** | R-C | 修该条 `Model.kind` 数据；在 `commitOnboardedModelToCatalog`（`runtime.ts:1126`）加软校验：名含 `video/视频` 但 kind=image → health warning | S–M |
| **R-E 统一 AI 助手** | R-E | 抽 `AssistantComposer`（共享空态/thread/textarea/send，差异进 `footerExtras`），创作/生成各自 store 映射进统一 props；chips/模式随项目类型 derive（产品项目给"提炼卖点/列亮点"而非"悬疑开场"）；"拆镜头/分镜"二选一去并行 | L |
| **C4 编辑器 placeholder** | R-D | 空编辑区加示范文案 placeholder（ink-40），配合示例形成上手闭环 | S |
| **H4 「继续创作」常显** | R-F | `ProjectLibraryPage.tsx:264` 的 `opacity-0 group-hover` 改常显；修卡片 `role=button` 套真 button 的嵌套语义 | S |

### P2 — 质感打磨（以后）

C1 下拉宽度 derive 不截断（`NomiSelect.tsx:85` 加 `width:max-content`）｜G3 帮助改锚定「?」的 popover（去掉飘右上的 toast）｜P1/P3 导出按钮提级到控制条右端独立主按钮 + inline 禁用原因｜R-F 画布三栏渐进展开（布局编排 store slice + 助手宽度可拖拽）｜H1 项目名 derive 友好默认｜H2/H3/H5 项目库去重/缩略图统一(用 §5.1 斜条纹)/hero 提权｜M5 模型搜索｜P4 合并双导出入口。

---

## 4. 必须先出 HTML mockup 再实现（R8，按优先级）

1. **画布三栏空间协同**（R-F）：工具栏固化为 60px 常驻图标条；分类栏与右助手互斥/自动收窄；画布最小宽度设为不变量。方案空间大，必拍板。
2. **模型接入行状态化**（M1/M2/M3）：`[logo] 模型真名 / 供应商名 + 能力 [● 状态徽章] [⋯ 测试/停用/删除]`。
3. **统一 AI 助手底栏**（R-E）：`[模式 NomiSelect▾] [上下文动作槽] [发送●]`，控件形态统一。
4. **首页冷启动 hero**（R-F）：在已有草稿 [`docs/design/mockups/2026-06-07-home-entry.html`](../design/mockups/2026-06-07-home-entry.html) 上补 hero 权重 / 缩略图统一 / 主操作常驻三项。

可不出 mockup、直接按已有规范落地：G1 选中态(§5.5)、C1 下拉宽度、G3 帮助就近、P1 导出按钮(§5.3)、各 caption 文案 derive——这些是"系统有规范、实现没接上"的执行缺口。

---

## 5. 需要产品负责人拍板的方向性取舍（不替你决定）

| 取舍 | 选项 A | 选项 B | 评审倾向 |
|---|---|---|---|
| **A 示例形态** | 完整成品样例（不依赖模型即可展示成品，aha 最强；需内置素材、包体增大） | 半成品引导式（亲手生成第一帧，参与感强；仍依赖模型接入） | PM：A 优先，B 作第二示例 |
| **B 模型接入深度** | 内置已知 vendor archetype 预设，填一次 key 自动列模型（30秒可用；需持续维护清单） | 保持手配 + "一键导入预设"（灵活；漏斗未根本拓宽） | PM/后端：A（与 P4 通用第一一致） |
| **C 两个助手** | 合并为一个贯穿助手（入口唯一；重构量大） | 保留两个但统一范式+加边界引导（各司其职；仍两入口） | 前端：B（抽 AssistantComposer 即达成，成本低） |
| **D 本版范围** | 只做 P0 打通 J3 漏斗（集中火力） | P0+P1 一起（更完整；战线长） | PM：D=A（先让漏斗通） |
| **E 单实例锁** | 加锁=单窗口、防 JSON 并发损坏（简单） | 不加锁=支持多项目多窗口，但要做文件级写锁/串行持久层（成本高一量级） | CTO：取决于产品要不要多窗口 |

---

## 6. 开源调研（R6，可直接借鉴）

| 来源 | 借鉴点 | 对应 |
|---|---|---|
| **Vite `vite:preloadError` 事件** | dynamic import 失败派发可取消事件，标准兜底 `e.preventDefault()+location.reload()`——stale-chunk 自愈，不暴露给用户 | E1/R-A |
| **Electron/VS Code `requestSingleInstanceLock`+`second-instance`** | 启动抢锁，第二实例把路径经 argv 传首实例 focus 打开后自退——解 E3 秒退无提示，顺带"双击文件在已开窗口打开" | E3 |
| **Continue.dev provider 抽象** | `title`(品牌名) 与 `provider`(内部 id) 分离 + 预置 `models[]` 能力档案 + 自带连接测试——一个结构同时解 M1(名分离)/M2(权威 kind 不靠猜)/M4(免文档) | M 簇 |
| **xyflow Inspector Panel 范式** | `useStore(s=>s.nodes.filter(n=>n.selected))` → 独立右侧 `<aside>` 渲染选中节点参数（而非塞进节点内）——解 G1"点节点出参数" + 给巨壳 `BaseGenerationNode`(1402行) 减负 + 解 R-F 空间 | G1/R-F |
| **剪映/CapCut「模板即成品·套用换内容」** | 首屏就是可直接播放的成品模板，"使用此模板"只换素材/文字——aha 前置到"看到成品+一键套用" | 示例演示力 |
| **Runway/Pika「零配置首次成功」** | 新用户用平台额度直接生成，不先配 key/选供应商——第一次成功不被接入门槛挡 | M4/激活漏斗 |
| **Linear 行内状态徽章 + 危险动作收纳** | 行主体=身份，状态=小圆点徽章，删除/archive 一律进行尾 `⋯`——删除不再裸露 | M3 ModelRow |
| **Descript 单一主导出 + 编辑区永居中** | 导出=右上唯一高权重主按钮，侧面板可推拉不挤压编辑区 | R-F/导出权重 |

---

## 7. 激活漏斗（PM，判断 P0 的依据）

```
[打开] →关口1→ [选示例/新建] →关口2→ [创作写文案] →关口3→ [画布配节点] →关口4→ [接入模型] →关口5→ [生成+导出] →关口6→ ✅
```

- **关口4（G1 找不到参数面板）** 与 **关口5（M4 模型门槛）= 两个致命收口**：即使示例/引导/文案全对，卡这两关一样出不了片。
- **关口2（示例演示力）= aha 引信**：打开示例是空项目→新用户没参照、不知终点长啥样→激活意愿断崖。
- 修复次序：**先 G1（链路物理可走通）→ 再示例演示力（让人愿意走）→ 再 C4（让人顺手走）**。

---

## 8. 落地建议（下一步）

1. **立即可做、零争议**（不需 mockup/拍板）：G1 选中环、E2 错误冒泡、E1 preloadError 兜底、M1 vendor 真名、C1 下拉宽度、启动失败 dialog——这批是确定性修复，建议先清。
2. **需先拍板**（§5）：示例形态 A、模型接入深度 B、本版范围 D、单实例锁 E。
3. **拍板后出 mockup**（§4 四项）→ 6 角色复审 mockup → 进 `docs/plan/` 写执行文档（R4）→ 实现 → `tests/ux/design-fidelity.e2e.mjs` 逐元素核对 → R13 真机走查复跑（重点复核本轮"待复核"项：素材库内部、节点 inspector、真实生成/导出、J2 定妆 / J4 参考图）。
4. **顺手减壳**：抽 `AssistantComposer` / `ModelRow` 时把 `CreationAiPanel`(490)/`CanvasAssistantPanel`(554) 减下来、消 Mantine 孤岛（R10 token-only）。

---

## 附：评审 agent 全文存档

本文为汇总。六角色完整分析（含更细 file:line 与论证）保存在本次 session 记录；如需展开某一角色原文可回溯。各 agent 一致性高、无相互冲突结论；唯一对走查记录的纠正即 §0 两条，已回填。
