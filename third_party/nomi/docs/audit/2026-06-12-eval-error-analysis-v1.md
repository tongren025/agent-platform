# 首轮 Error Analysis（评测体系 S2）

> 数据源：eval 基线 run（storyboard 15 case × pass@1，真实 agent 真实模型）+ 施工期 3 次探索轨迹。
> 方法：open coding（逐条看输入 vs 画布终态 vs 工具流）→ 失败分类法 v1。
> 标注载体：`pnpm eval:view <runDir>`（轨迹查看器，S1.5）。
> ⚠ 本轮 open coding 由 AI 完成（bootstrap），分类法与两个产品决策待用户复核——用户本人才是 judge 校准的金标准。

## 基线结果（2026-06-12，commit db36abb 代码 + 后续校准）

- 冒烟档（5 case × pass@1）：**5/5 绿**，~3 分钟，~11.2 万 tokens
- 全量档（15 case × pass@1）：见 `evals/runs/2026-06-11-19-23-storyboard/report.md`（本地）
- 单 trial 实测：**26–50s，1.6–2.8 万 tokens**（D2 账表回填：全量一轮 ≈ 30 万 tokens；按便宜档/中档模型计价 ≈ $0.5–3/轮，远低于预估上限）

## 已修真 bug（评测施工期抓出，均已锁回归）

| # | bug | 根因 | 修复 |
|---|---|---|---|
| B1 | 打包版 agent 会话桶全落 `local`（跨项目串台 + 事件轨迹静默不落盘） | prod 用 hash 路由，`projectId` 在 hash 段；三处只读 search 段 | `windowUrlParam.ts` 唯一实现 + 4 单测（commit c27f7ed） |
| B2 | agent 连线 clientId 不翻译 → `n1→n2` 吊边落盘，连线静默丢失 | clientId→真实 id 映射只回给 LLM，渲染层不存；connect 不校验端点存在 | 注册表三处统一解析 + connect 守门 + skippedEdges 诚实回报 + 3 单测（commit 32c93fd） |

## 失败分类法 v1

| 编号 | 模式 | 频次 | 定性 | 处置 |
|---|---|---|---|---|
| F1 | 持久化节点的 `shotIndex` 字段恒空 | 11/11 | **非 bug**：序号渲染时由 `useShotIndex` derive，持久化字段是遗留物 | 遗留字段清理候选（低优）；eval 不再断言此字段 |
| F2 | video 节点"缺 size" | 4/4 video case | **非 bug**：video 用 vendor 原词 `aspect_ratio`/`resolution`/`duration`，参数齐全（P4 词表差异） | 已转化为评测加固：`ratioParamsValid` 谓词按 kind 断言词表 |
| F3 | 顺序镜头是否连线非确定 | 5/11 没连，6/11 连了 | **UX 一致性问题**：同类输入行为漂移；用户体感"有时帮我连有时不连" | **待拍板 Q1**（下） |
| F4 | 视频模型选择漂移（veo3.1-fast vs sora-2，同类宣传片输入） | 2 种 | 观察项：可能由时长/竖屏因素合理驱动，未见错误选择 | 继续观察，暂不断言 |
| F5 | 宣传片/广告/教学 → video 节点，故事/散文 → image 节点 | 启发式稳定 | **未约定的产品行为**：J1 主链路预期是"先关键画面(image)再动画"？还是直接 video 合理？ | **待拍板 Q2**（下） |
| F6 | （正面确认）prompt 质量高 | 84–204 字，具体可生成 | 镜头划分忠实文案、主体一致性好（人工抽看） | L2 rubric 候选维度"忠实文案/可生成性"在合成集上未见失败——judge 价值待真实轨迹验证 |

## 待用户拍板的产品决策（评测只发现，不替你定）

- **Q1（来自 F3）**：agent 拆镜头后是否**默认按叙事顺序连线**？
  - 选连：行为一致、J1 直接可批量生成；代价是用户想要独立镜头时要手动删线（sb-015 显示 agent 能听懂"不要连线"）。
  - 现状：靠模型心情。无论选哪个，定下来就进 system prompt + eval 用例锁死。
- **Q2（来自 F5）**：宣传片类输入默认产 image（关键画面→再动画，J1 流程）还是 video（一步到位）？
  - 定下来后 dataset 的 `kind` 断言从 `["image","video"]` 收紧回单值。

## 评测体系自身的校准记录（本轮学到的）

1. **断言只许断指令明确要求的东西**：sb-001 曾断 minChainEdges=2，但指令没要求连线——非确定性把它变成 flaky。已改：只有明确说"连起来/不要连"的 case 才断边。
2. **kind 断言放宽为 image|video**：宣传片产 video 是合理选择（待 Q2 收紧）。
3. **两段式回本实证**：sb-002 的 kind 误判通过零额度重评分修正，没重跑 agent。

## 下一轮

- dataset v1 扩充暂缓"凑数"：合成 case 已 15 个且基线接近全绿（capability 集健康线是 ~70% 通过率，**全绿 = 集子太弱的信号**）。扩充必须来自：① Q1/Q2 拍板后的指令遵循新用例；② 真实使用轨迹的失败样本（S0 已在攒）。
- 攒够 ~50 条真实轮次后做第二轮 error analysis（`check:audit` 已带提醒）。
