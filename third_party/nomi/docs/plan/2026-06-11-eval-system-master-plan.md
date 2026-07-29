# Nomi 评测体系总体方案（Eval-Driven Iteration Loop）

> 状态：v3（已施工完毕，2026-06-12）。D1–D6 全按推荐拍板。
> **施工回填**：S0（由 harness 并行会话交付，验收通过）/ S0.5 / S1 / S1.5 / S2 / S4 / S5 / S6 全部完成并 push；S3 机制层完成，校准待用户两项输入（judge key + ≥10 条标注）。
> 命令族：`eval:run / eval:score / eval:diff / eval:view / eval:ops / eval:judge-calibrate / eval:review-images / test:journeys`，节奏提醒并入 `check:audit`。
> 循环已实证转通：施工期抓出并修掉 2 个真 bug（prod projectId 解析、agent 连线 clientId 吊边），各配回归锁；基线 15 case 行为分全绿（饱和 = 扩容信号，扩容来源限定真实失败 + Q1/Q2 拍板）。
> 实测账（回填 D2）：单 trial 26–50s / 1.6–2.8 万 tokens；冒烟档 5 case ≈3 分钟 ≈11 万 tokens；全量 15 case ≈10 分钟 ≈31 万 tokens。
> 待用户三件事：① `evals/judge.config.json` 填便宜档 key；② 查看器标注 ≥10 条导出；③ 拍板 Q1（默认连线？）/ Q2（宣传片默认 image 还是 video？）——见 `docs/audit/2026-06-12-eval-error-analysis-v1.md`。
> 关系：本方案是 `2026-06-11-nomi-harness-master-plan.md`（ETCSLV）的**姊妹件**——评测体系是 EventLog（S）的读侧第四消费者，复用 V 层的 NormalizedRecipe / V-a 自检结果，不另造日志格式。施工顺序关系见 D3。

---

## 0. 通俗讲解：这套体系到底是什么

今天的五门 CI 只能回答"代码健康吗"，R13 走查只能回答"界面顺不顺"。**没有任何机制回答：「AI 拆镜头拆得好不好？参数配得对不对？生成出来的片子能不能看？」**——这恰恰是产品的核心价值。

评测体系 = 给产品装一个"体检 + 病历 + 复查"的闭环：

```
真实使用轨迹落盘 ──→ 攒够一批就看病历（error analysis，找失败模式）
       ↑                        │
       │                        ▼
  修根因（P2）←── 失败模式变成评测用例（dataset）
       │                        │
       └──→ 复查（重跑评测，回归 diff）──→ 用例锁死不复发
```

以后迭代节奏变成：**评测发现问题 → 分级 → 修根因 → 用例锁死 → 下一轮**。不再靠"用一下感觉怪怪的"驱动。

**单人项目的特殊性（评审 PM#1 裁定）**：Nomi 没有外部用户流量，轨迹 = 开发者自己 dogfooding + 旅程跑出来的。所以节奏**不按日历驱动，按数据量驱动**——轨迹攒够 N 条才触发分析（并入 `check:audit` 提醒），某周没怎么用 app 就不硬分析。"系统性攒轨迹"本身是设计内动作（每次 R13 走查、每次真实创作都在攒），不是脚注。

## 0b. 业界共识（调研结论摘要）

- **起步规模小**：Anthropic 明确"20–50 个取自真实失败的任务"就够起步；越晚建越难建。
- **先做 error analysis 再写评测**：人工看真实轨迹做 open coding → 失败分类法 → 分类法决定评测集。评测标准只能在看数据过程中浮现（criteria drift），不要先拍脑袋写 rubric。
- **评终态不评路径**：以环境终态断言为主干（画布里是否真有 N 个合法节点），轨迹检查（轮数/token）只做趋势记录。
- **两段式跑/评分离**：跑一次 agent 花额度，先批量落 JSONL；评分器免费、可反复重跑。
- **LLM-judge 必须校准**：领域专家（= 用户本人）标 ~30 条二元 pass/fail + critique → judge few-shot → precision/recall 对齐 ≥80% 后才可信。弃 1–5 打分制（不可行动）。
- **capability 与 regression 分两套**：capability 通过率 ~70% 用于爬坡；饱和后"毕业"进 regression（~100%，破了即 P0）。pass 率 100% 说明 eval 太弱。
- **trace 查看器是最被低估的投资**（Hamel）——本方案以 S1.5 切片落实，不是口号。

来源：Anthropic《Demystifying evals for AI agents》、Hamel Husain《Your AI Product Needs Evals》/《LLM-as-judge》、OpenAI eval best practices、VBench（维度分解思路）。代码蓝本：promptfoo（数据面）+ OpenHands benchmarks（执行面）。

---

## 1. 现状与缺口（Explore 摸底结论）

**已有**（不重建，只复用）：
- 94 个 `.test.ts` 单测 + 五门 CI —— 即 L0 层
- 15 个 Playwright `_electron` 脚本 + 常驻 UI 驱动（`tests/ux/ui-driver.mjs`）+ J1-J5 旅程定义 —— L4 的执行体
- `tests/ux/design-fidelity.e2e.mjs`（computed-style/几何断言）—— **L4a 静态保真层**，已有名分（评审设计师#2 回填）
- `electron/export/mediaProbe.ts` —— **仅 ffprobe 元数据探测**（kind/时长/宽高/codec）；黑帧/静音检测**不存在**，需新写 ffmpeg 滤镜（评审后端#8 纠错）
- onboarding lab（`scripts/lab-onboard.ts` + `fixtures.yml` + trace/summary/mapping 三件套）—— dataset→run→report 的形态蓝本；注意它能 tsx 直驱是因为 onboarding 工具全在主进程、key 走 CLI——**这个前提对拆镜头 agent 不可迁移**（见 D5）
- 三条示例项目故事（`tryNowExamples.ts`）—— 评测集种子输入

**缺口**（按紧迫度）：
1. AI 对话轨迹持久化 —— `agentChatV2.ts:387` 内存 Map 重启即丢，评测集没有原料
2. 主进程 vendor HTTP 结构化落盘 —— `runtime.ts` 黑盒，错误压扁成字符串
3. 拆镜头质量评测 —— J1/J2 核心产出物零指标
4. agent 工具调用质量评测（该不该调 / 参数语义对不对）—— **由 L1 断言族承接**（评审 PM#3 回填）：L1 的断言里包含 tool-args 语义谓词（所选模型存在于 catalog、比例参数与素材匹配等），与 bug① 的"agent 选模型配参数"工作互为犄角
5. 生成产物质量评测 —— 技术自检管线不存在（不是"挂出口即可"）；VLM 审美未拍板
6. golden / 回归基线 —— 无
7. J1-J5 成功标准断言化 —— 只有 smoke 一个可断言 e2e
8. 运营指标（失败率 / 耗时 / 成本）—— 连零额度的统计都没有

---

## 2. 分层模型：五层评测 + 一层人工

| 层 | 评什么 | 怎么评 | 成本 | 频率 |
|---|---|---|---|---|
| **L0 确定性门** | 参数配置正确性：mapping / archetype / schema | vitest 纯断言（现有五门） | 零 | 每 commit |
| **L1 Agent 终态评测** | 拆镜头 agent：文案 → 跑 agent → 画布终态断言（节点数区间 / 每节点有 prompt / 参数 schema 合法 / 边连通 / tool-args 语义谓词） | 自建 runner（环境见 D5），两段式；**smoke 档 ≤5 case pass@1 / 全量档 pass@3** | 小额度 | smoke：改 agent 后；全量：手动/夜间 |
| **L2 LLM-judge 质量分** | 拆镜头质量、指令遵循 | llm-rubric + critique shadowing 校准。**rubric 维度不预设**，以下四个候选假设带进 S2 open coding 验证：镜头语言多样性 / 节奏（时长与信息密度）/ 视觉连续性（相邻镜头可剪性）/ 角色一致性。其中角色一致性先拆一半给确定性断言（引用同一角色卡的节点 prompt 是否含锚定描述） | 中额度 | 手动/夜间 |
| **L3 生成产物质量** | 图/视频产物 | **L3a 技术自检**：新建"结果本地化→ffprobe 元数据+黑帧/静音滤镜→review 事件→节点 ⚠"管线，**异步旁路，绝不挡 addNodeResult 的用户感知**（= harness V-a 施工，本方案只消费事件）；**L3b VLM**：只评客观可见缺陷（肢体崩坏/文字乱码/构图截断/与 prompt 实体不符——可二元化可校准），"美"用 pairwise 比较（天然服务 V-b 的 k=2 取优），不做绝对分 | L3a 零 / L3b 中 | L3a 每次生成；L3b 抽样（D4） |
| **L4 体验旅程评测** | J1-J5 旅程 | **两层，断言只是下限门**：① 硬断言层只覆盖可谓词化的骨架（J3/J5 全程 + J1/J4 的终态可达性 + 遮挡几何），J1/J2 的"质量"不硬化；② R13 截图人眼穿透是**不可替代的上层门，断言绿不豁免**（评审设计师#1 裁定，防 P3 反模式） | 小 | 发版前 / ≥25 commit |
| **L4a 静态保真层** | 设计规范 computed-style/DOM/几何 | 已有 `design-fidelity.e2e.mjs`，S5 的截图存档复用其 `__shots__` 机制，不另起双轨 | 零 | 改 UI 后 |
| **人工（不可替代）** | error analysis、judge 抽查校准、美感终审 | 操作载体 = S1.5 轨迹查看器（不是裸 JSONL）。美感终审介入点：每次真生成 E2E 后抽 ≥5 张 + 周期审计时复核 judge 判决 20 条，结论回流 rubric | 人时 | 见 §4 节奏 |

设计原则：**确定性断言能覆盖的绝不用 LLM**；LLM-judge 只评写不出谓词的"质量"维度；人工只做机器做不了的（发现新失败模式、校准 judge、终审美感）。

## 3. 数据层与执行层设计

### 3.1 数据三件套（类型抄 promptfoo，执行抄 OpenHands，本地 JSON 落盘）

```
evals/
  datasets/<domain>.yml        # case = { id, description, input, asserts[] }
  runs/<date>-<name>/
    output.jsonl               # EvalOutput per case（append，断点续跑）
    report.md                  # 人读摘要（形态见 §3.5）
  judges/<domain>-rubric.md    # judge prompt + few-shot（来自专家 critique）
  annotations/<domain>.jsonl   # 人工标注（pass/fail + critique，查看器写入）
```

核心类型（`evals/types.ts`）：
- `EvalCase = { id, description, input, asserts: Assertion[] }`
- `Assertion = { type: 'predicate' | 'llm-rubric' | 'media-probe', value, weight?, threshold? }`
- `GradingResult = { pass, score, reason, componentResults? }` —— 全系统统一三元组
- `EvalOutput = { caseId, terminalState, historyRef, metrics{latency,tokens,cost}, gitCommit, modelConfig, gradingResult?, error?, failureReason: 'assert'|'error' }`
  - 断言失败与基础设施错误**分开计数**（抄 promptfoo）；每份结果**绑 git commit + 模型配置**（抄 OpenHands）
  - **`historyRef` 是引用不是拷贝**（评审 CTO#5 裁定）：指向该 run 项目的 EventLog 文件 + seq 区间，轨迹真相源只有一份

**与 onboarding fixtures.yml 的关系**（评审 CTO#6 裁定）：中期把 onboarding lab 迁到本 harness 上（P1：吃掉旧约定），迁移排在 eval 骨架稳定之后；迁移前两域各管各的，不互通。

### 3.2 执行两段式

- `pnpm eval:run <dataset> [--smoke]` —— 花额度阶段：每 case 干净隔离启动 → 跑 agent 到底 → **取证画布终态（不信 agent 自述）** → append JSONL（已完成 caseId 跳过；超时不重试 / vendor 错误分级重试）
- `pnpm eval:score <run>` —— 免费阶段：读 JSONL → 逐 case 跑 asserts → 写 gradingResult + report.md
- `pnpm eval:diff <runA> <runB>` —— 按 caseId 对齐出回归表（新 fail / 新 pass / 分数漂移）+ 跨 run 趋势表（pass 率随 commit）

### 3.3 Runner 运行时环境（拍板项 D5——评审 4 角色共同命中的承重墙）

事实（评审已实证）：
- `agentChatV2.ts:22-24` 依赖 electron `app.getPath` / `safeStorage`（Keychain），**纯 tsx 直驱必炸**；
- 画布工具主进程侧**故意不带 execute**（`canvasTools.ts:12-16`），真正执行在渲染进程 `applyCanvasToolCall.ts`（gridPosition 布局/归类/默认标题/plannedNodeMeta 补全都在渲染层 derive）；
- tool-result 只回瘦 id 映射，**事件流重放拼不出忠实终态**；
- 隔离还必须同时隔 userData（`rememberWorkspace` 会污染全局最近项目列表）。

| 方案 | 怎么做 | 代价 |
|---|---|---|
| **A. 真 Electron 隐藏窗口（推荐）** | 复用 `tests/ux/ui-driver.mjs` 的 Playwright `_electron` 基建：eval runner 起一个真 app 实例（隐藏窗口 + `PROJECT_ROOT_ENV`/userData 双隔离），驱动 agent 跑完后经 IPC dump 渲染层画布 store 真终态 | 启动慢（秒级/实例，批量摊薄）；但**零并行版**——终态是真终态，applyCanvasToolCall 不用抽 |
| B. 事件重放 + applyCanvasToolCall 抽纯 | 把渲染层 apply 逻辑抽成环境无关模块，node 侧重放 tool-call 流成虚拟终态 | 重构量大；抽不净就是第二份 derive 语义（违 P1）；plannedNodeMeta 依赖 catalog IPC 链，抽纯成本最高 |

**Runner 安全铁律**（无论 A/B，评审后端#7）：runner 自动 resolve 工具确认时必须带**工具白名单**——costy/destructive 工具（如未来的 `run_generation_batch`）一律 deny，"确认前零调用"不变量在评测环境不许被结构性绕过；L3 真生成类 case 必须有 case 数硬上限 + 跑前总价确认。

### 3.4 与 harness master plan 的施工对账（拍板项 D3）

评审 CTO#3/4、后端#1/2/3 实证：原"S0 = EventLog 先头部队，做一份算两边"的说法不成立——
- harness 把 schema v1 定稿 + `eventLogRepository`（单写者、seq 统一编号）钉在其 S3，且 S2 验收明文依赖 S3 schema；
- `vendor.call.requested{recipe}` 的 NormalizedRecipe 和结构化错误是 harness S4 交付物，提前落只能是阉割版，schema 必然漂移；
- harness 合同规定 `finalTextHead` 截 2KB + 单事件 ≤4KB，而 error analysis 需要全文——**需要 sidecar 机制**（大 payload 落 `events/<seq>.json` 旁文件，主 JSONL 存引用），harness 文档提了一嘴但零设计。

三个选项（D3）：

| 方案 | 怎么做 | 代价 |
|---|---|---|
| **A. 重排 harness 施工序（推荐）** | 把 harness S3（schema 定稿 + 单写者 repository）+ sidecar 设计提到最前先做，评测 S0 = 消费它 | harness 主线让路 ~3-4 天；但两边共用一份地基，零返工 |
| B. 评测严格跟随 | harness 按原序走完 S3/S4，评测再开工 | 评测晚 2-3 周才有数据；轨迹断档期继续"用了白用" |
| C. 临时旁路 | 评测自带简易 appender 先攒数据，显式承认是"待收编的并行版"，harness S5 收编时重写 | 立刻有数据；但双写者 + schema 漂移 + 一笔明账的返工债（违 P1 精神，需用户明示豁免） |

### 3.5 报告与查看器（评审用户#2/3/6 + 设计师#5 合并裁定）

- **轨迹查看器（S1.5，~200 行单 HTML 脚本）**：把 EventLog JSONL 渲染成对话气泡 + 工具调用折叠 + 终态/产物缩略图；**加标注模式**（pass/fail 按钮 + critique 文本框，写回 `annotations/`）——error analysis 和 judge 校准共用同一载体，没有它两条人工纪律都会死
- **report.md 信息设计**：首屏 ≤5 行 verdict（对基线的三个 diff 数 + 最差 3 个 case 的输入/产出摘要 + 轨迹查看器链接）；全量表进附录；命令结束时终端直接打印 verdict 行
- **每条 fail 必须可下钻**：report → case → historyRef → 查看器打开那条轨迹，"从分数到改哪"不靠翻文件猜
- report 格式在 S1 用假数据先出样张过目（R8）

---

## 4. 迭代循环（运营节奏）

| 触发（事件驱动，不按日历硬转） | 动作 | 门 |
|---|---|---|
| **轨迹攒够 ~50 条新增**（`check:audit` 扩展提醒） | error analysis：查看器里 open coding → 失败分类 → 每个新失败模式 ≥1 case 进 dataset → 排修复优先级。**首轮约 2–4 小时，之后每轮 ~1 小时**（数字按 Hamel 实践对齐，不再写"每周 30 分钟"） | `docs/audit/` 增量记录 |
| **改 agent prompt / 工具 schema / 模型 profile** | 跑 smoke 档（≤5 case，pass@1，分钟级）+ `eval:diff` | **提醒不阻断**：LLM 在环（非确定 + 烧额度 + 断网不可跑）不进五门（评审 CTO#7 裁定）；只有确定性断言子集未来可考虑进门 |
| **接入新模型** | 走已有"接入即验证 E2E 回路"，验证过的任务沉淀成 dataset case | 一次真实 E2E 跑通 |
| **发版前** | L4 双层（断言 + R13 人眼）+ regression 全量 + L3 抽样 | 全绿 + 走查对账 |

- **S0 落盘后的第一个消费物不是 L1，是零额度运营周报**（评审 PM#6）：失败率 / P50 耗时 / 成本三个数，从真实使用轨迹直接统计——比 LLM-judge 早几周产生行动价值。
- capability / regression 生命周期：新 case 进 capability（~70% 通过率是健康态）→ 连续 3 次 run 全过即毕业进 regression → regression 破了 = P0。

## 5. 施工切片

> MVP 闭环 = **S0 + S0.5 + S1 + S1.5 + S2**（评审 PM#5 裁定）。S3 以后转得动再上。

| # | 切片 | 内容 | 验收门 | 估量 |
|---|---|---|---|---|
| **S0** | 轨迹持久化 | 按 D3 拍板结果施工（A：harness S3 提前 + sidecar 设计）。**前置**：① runtime.ts 当前 807/807 行零余量，插桩前先拆出 vendor 调用模块腾空间；② **安全铁律**：递归 redact（扫 url/query/body 中等于 apiKey 的值——现有 `redactHeaders` 只盖 headers，盖不住 query 鉴权 vendor）+ 单测锁死；③ **体积铁律**：二进制一律 sha256+localRef 引用（复用 harness §7.5 设计），JSONL 永不出现 base64 | 真用一次 app 后磁盘有完整可读轨迹；重启不丢；单测证明 key 不落盘 | 3–4 天（按 D3-A 诚实计价，不再写 1–2 天） |
| **S0.5** | 零额度运营周报 | 从 EventLog 统计失败率 / P50 耗时 / 成本，进 `check:audit` 输出 | 跑一条命令出三个数 | 0.5 天 |
| **S1** | eval 骨架 + L1 | `evals/types.ts` + 三命令 + runner（按 D5 拍板，A 方案复用 ui-driver 基建）+ 拆镜头 dataset v0（15 case 纯确定性断言，含 tool-args 语义谓词）+ report 样张 | smoke 档分钟级跑通出 report；**首次全量 run 实测 token/耗时回填 D2 账表** | 4–6 天（含 runner 环境，不再写 2–3 天） |
| **S1.5** | 轨迹查看器 + 标注 | §3.5 单 HTML + annotations 写回 | 打开任一轨迹 30 秒内看懂一条对话全貌；能标 pass/fail+critique | 1–2 天 |
| **S2** | 首轮 error analysis | 真实轨迹 open coding（首轮 2–4h 人工）→ 失败分类法 v1 → dataset 扩到 30–50（真实失败为主）→ L2 rubric 候选维度验证/淘汰 | `docs/audit/` 失败分类法文档 + dataset v1 | 1 天 |
| S3 | L2 judge + 校准 | 查看器里标 30 条 → judge few-shot → P/R ≥80% | 校准报告；judge 进 eval:score | 2 天 |
| S4 | L3 生成质量 | L3a 整条管线（本地化→探测[含新写黑帧/静音滤镜]→review 事件→节点 ⚠，异步旁路）**记 harness 工期不重复计价**；L3b 按 D4 | 坏产物有结构化记录且不挡用户感知 | （harness 侧 2–3 天）+ L3b 1 天 |
| S5 | L4 旅程断言化（收窄版） | 只断言可谓词化骨架：J3/J5 全程 + J1/J4 终态可达 + 遮挡几何；截图存档复用 `__shots__`；**J1/J2 质量明示留给 L1/L2 + R13 人眼** | 骨架断言独立 exit code；R13 上层门写进发版清单不被豁免 | 2 天 |
| S6 | 回归 + 节奏门岗 | eval:diff 趋势表；`check:audit` 扩展（轨迹计数提醒 error analysis；改 agent 文件提醒跑 smoke） | 提醒链路全通 | 1 天 |

**不动什么**：现有五门 CI、tests/ux 驱动、onboarding lab（中期才迁）、harness 主线其余切片。评测代码新增在 `evals/` + `scripts/`；业务代码只动 S0 合同内的插桩点（agentChatV2 / runtime 拆出的 vendor 模块）。

**回滚策略**：事件落盘是 append 旁路，删文件即回滚；`evals/` 整目录独立，任何切片失败不影响产品功能。

## 6. 拍板项

| # | 问题 | 推荐 | 备选 |
|---|---|---|---|
| **D1** | 自建轻量 harness vs 引入 promptfoo | 自建（类型抄 promptfoo + 执行抄 OpenHands；promptfoo 是 prompt×provider 矩阵评测器，与单 agent 端到端任务抽象不匹配，引入仍要自写 provider 且带进 SQLite 第二真相源） | 引 promptfoo 当库用 |
| **D2** | 额度账与 judge/VLM 模型 | **数量级粗估（S1 首跑实测后回填真账）**：L1 全量 15 case×pass@3 ≈ 45 次多轮 agent run ≈ $2–6/轮；smoke 档 ≈ $0.3–1/次；L2 judge 50 case ≈ <$0.5/晚（便宜档）；L3b 10 张 VLM ≈ $0.2–0.5/次。按"每周 2 次全量 + 改动若干次 smoke + 夜间 judge"估 **$30–80/月** | 砍 VLM / 砍 pass@3 / 全手动触发 |
| **D3** | 施工顺序（§3.4 三选项） | A：harness S3+sidecar 提前，评测消费 | B 跟随 / C 临时旁路（明示豁免 P1） |
| **D4** | VLM 审美评分（= harness V-b，两文档合并为此一项） | 暂开"客观缺陷二元判定"，"美"的 pairwise 留到 V-b 的 k=2 场景一起做 | 全关 / 全开 |
| **D5** | Runner 运行环境（§3.3） | A：真 Electron 隐藏窗口复用 ui-driver 基建 | B 事件重放+抽纯 |
| **D6** | 人工时间承诺 + push 门 | 接受"每攒够 ~50 条轨迹投入 1–4 小时 error analysis"；push 门用**提醒不阻断** | 不承诺（则 S2/S3 缓建，只跑 L0/L1 机器层）/ 硬门 |

## 7. 验收定义

**建成验收**（脚手架）：
1. 任何一次真实使用的 agent 对话与生成调用都有可回看、已脱敏、不含 base64 的轨迹（S0）
2. 改 agent 一行 prompt，**smoke 档分钟级**拿到"变好还是变坏"；全量答案夜间/手动出（S1+S6）
3. 任一 fail 从 report 两次点击下钻到那条轨迹的查看器视图（S1.5）

**运转验收**（发动机——评审 PM#8 裁定，4 周后复盘）：
4. error analysis 实际执行 ≥3 轮，dataset 中真实失败来源 case 占比 ≥60%
5. 经评测发现并修到根因、且有 case 锁死的问题 ≥5 个
6. regression 集非空且保持全绿，capability 集通过率落在 60–85% 区间（100% = 集子太弱，触发扩容）

---

## 附：6 角色评审回填记录（2026-06-11）

| 来源 | 必改项 | 处置 |
|---|---|---|
| CTO#1/2、前端#1/2/3、后端#6、用户#5 | headless 直驱不成立 / 画布终态无处取证 / tool-result 重放缺料 | §3.3 重写为 D5 拍板项，推荐真 Electron 隐藏窗口；S1 工期 2–3→4–6 天 |
| CTO#3/4、后端#1/2/3 | S0 与 harness S3/S4 合同冲突、2KB 截断 vs 全文矛盾 | §3.4 重写为 D3 三选项 + sidecar 设计列为交付物；S0 工期 1–2→3–4 天 |
| 后端#4/5 | API key 经 body/query/url 落盘；base64 爆体积 | S0 安全/体积铁律 + 单测锁死 |
| 后端#7 | runner 自动批准绕过确认门、烧额度零防线 | §3.3 Runner 安全铁律（工具白名单 + 硬上限 + 总价确认） |
| 后端#8 | mediaProbe 黑帧/静音不存在，挂出口会挡用户感知 | §1/§2/S4 改写：整条管线新建、异步旁路、记 harness 工期 |
| 前端#3 | runtime.ts 807/807 零余量 | S0 前置：先拆 vendor 模块腾空间 |
| 前端#8 | 临时项目污染全局 workspace 注册表 | D5-A 要求 userData 双隔离 |
| PM#1/2 | 周节奏数据断供；30 分钟 vs 2–4h 矛盾 | §0/§4 改事件驱动 + 数字对齐 + D6 拍板 |
| PM#3 | 缺口#4 无切片承接 | L1 断言族纳入 tool-args 语义谓词 |
| PM#4、CTO#10、用户#1 | "5 分钟"不成立；100% 回归门会被绕过 | smoke/全量分档；push 门改提醒不阻断；§7 改写 |
| PM#5 | 范围过大 | 明示 MVP = S0+S0.5+S1+S1.5+S2 |
| PM#6 | 漏运营指标 | 新增 S0.5 零额度周报 |
| PM#7 | 真拍板缺项 | D6 新增（人工时间 + push 门工作流） |
| PM#8 | 验收是 build-trap | §7 增加运转验收三条 |
| 设计师#1、CTO#8 | S5 制造 P3 反模式 / J1-J2 不可断言 | L4 两层化 + S5 收窄，R13 不被豁免 |
| 设计师#2 | design-fidelity 无家可归 | 新增 L4a 层，`__shots__` 复用 |
| 设计师#3 | L2 rubric 维度太薄 | 四候选维度进 S2 验证；角色一致性半数降级确定性断言 |
| 设计师#4 | L3b 美学校准空白 | 客观缺陷二元化 + pairwise，绝对分废弃；人工终审写明介入点 |
| 设计师#5、用户#2/3/6 | report/标注/下钻无载体 | §3.5 + S1.5 切片 |
| 用户#4 | 没有账 | D2 给出数量级估算 + S1 首跑实测回填 |
| CTO#5/6 | history 双真相源；fixtures 双格式 | historyRef 引用制；onboarding lab 中期收编 |
| CTO#9 | S4 双记工期 | S4 明示记 harness 侧，不重复计价 |
