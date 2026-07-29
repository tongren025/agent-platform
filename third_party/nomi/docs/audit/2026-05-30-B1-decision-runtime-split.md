# B1 决策：要不要拆 `electron/runtime.ts`

> Status: 待你决策
> 目标：把"该不该拆 2,687 行的大文件"想清楚，再做或不做

## 0. 写这份的原因

我在 audit 里提了 B1（拆 runtime.ts 成 6 模块），口气像建议。
但你问我"凭什么"，是对的——技术债决策不该靠"看着乱"这种感觉。
所以这份**自己挑自己刺**，把支持和反对放在同一张桌上。

## 1. 提案回顾

```
runtime.ts (2,687 行)
├── 项目存储 / 资产 / cost     → electron/storage/{projects,assets,cost}.ts
├── catalog CRUD + 迁移 + 加密  → electron/catalog/{schema,store,migrate,encrypt}.ts
├── catalog 导入导出           → electron/catalog/portable.ts
├── 任务执行 + 厂商调用         → electron/tasks/{runner,providers,template}.ts
├── 文档抓取                   → electron/catalog/docsFetcher.ts
└── runtime.ts 只剩 re-export 兼容旧引用
```

估时 1-2 天。

## 2. 真实的好处

| 好处 | 强度 |
|---|---|
| 单文件 2,687 行 → 6 个 < 500 行，认知负荷低 | 中 |
| 一个 PR 不再大面积污染 git diff | 中 |
| 每个模块可单独写单元测试（catalog 尤其） | 中 |
| 共享类型 (`Vendor/Model/Mapping`) 可以拉出来给 onboarding agent 复用 | 中-高（解一次性 bug 有用） |
| 后来人（包括 1 个月后的你）找东西快 | 中 |
| catalog 那块和 `electron/ai/onboarding/` 结构对齐，符合一致性 | 中 |

## 3. 真实的坏处

| 坏处 | 强度 |
|---|---|
| **它现在能跑。**v0.7.9 在用户机器上没出过事 | **强** |
| **没单元测试。**靠运行 desktop app 才能发现回归 | **强** |
| 隐式耦合：模块级变量 / 闭包，拆出去都要变 import | 中-强 |
| 大爆炸式 PR，挂了难 bisect | 中 |
| 占用 1-2 天，期间不能写用户能看到的东西 | 中 |
| v0.8 M8 还要改 catalog，refactor 时 API 不稳 | 中 |
| 痛点未证：我自己改 catalog 的 M5.1+5.2+5.4 都靠 grep 找到，没真感觉慢 | **中-强** |

## 4. 我用什么标准判断"该不该拆"

不是"行数大"——而是看下面 6 个信号，过 4 个才拆。

| 信号 | runtime.ts 实际 |
|---|---|
| 多人协作冲突 | ✗（单人） |
| 模块结构挡测试 | ✗（暂时没人写测试） |
| 排查 bug 时找不到代码 | ✗（grep 就行） |
| 加新功能时改的地方分散 | △（catalog 改动开始密集） |
| 文件大到编辑器卡 / 失去 lint | ✗ |
| 热更新慢 | ✗（electron main rebuild ~1s） |

打勾：**1.5 / 6**。**不到拆的门槛**。

## 5. 备选方案（按 ROI 排）

### A. 什么都不做
- 成本：0
- 风险：长期维护成本缓慢累积
- 适合：现在最近 1-3 个月

### B. **Strangler fig（推荐之一）**
- 做法：下次改 runtime.ts 任何函数时，**顺手**把那部分拆出去
- 成本：每次小步骤 + 5-15 分钟
- 风险：极低，每次都有明确驱动
- 适合：稳定单人开发节奏；不抢用户功能时间

### C. **只拆 catalog 那一块（推荐之二）**
- 做法：把 catalog CRUD + migrate + encrypt + portable 4 个文件拉出来，其它不动
- 成本：半天
- 风险：中（API 稳，但要小心被 runtime.ts 其它部分依赖的内部函数）
- 收益：v0.8 M8 砍旧 UI 时 catalog 已经分清楚；和 onboarding agent 共享类型成本最低
- **适合：v0.8 M8 之前做这一刀**

### D. 完整 B1（原提案）
- 成本：1-2 天
- 风险：高（无测试）
- 适合：有测试 + 有合作者 + 有用户的产品

### E. 换个轴拆（按生命周期，不按域）
- 做法：`runtime/init.ts` / `runtime/handlers.ts` / `runtime/state.ts` ...
- 成本：1 天
- 评价：更贴合现状，但增加迁移工作。**不推荐**，因为它把 catalog 和 tasks 重新搅在一起，反而让"M8 砍旧 UI"更麻烦

### F. 不拆，只重组
- 做法：在 runtime.ts 里加 `// ===== Section: Catalog =====` 一类的分割注释 + 顶部一份目录
- 成本：30 分钟
- 收益：30% 的导航体验，0 风险
- 适合：等不及 C 但又焦虑

## 6. 推荐

**短期（v0.8 M8 之前）：F + 锁定 C 的边界**

具体：
1. 现在花 30 分钟做 F：runtime.ts 顶部加目录注释 + 各 section 加 banner
2. 在 docs/plan 写一份 `B1-targeted-catalog-split.md`，明确未来哪些函数搬去 `electron/catalog/`，做边界冻结
3. **不动代码**，继续推 M5.5 + M6

**中期（v0.8 M8 期间）：执行 C**

理由：M8 本来就要砍旧 catalog UI、改 catalog 表现，那时 catalog 模块是热区域。**和正在做的事一起做改动**比单独 refactor 风险低得多。

**永远不做 D**，除非：
- 项目有了至少 2 个 contributor
- 或者 runtime.ts 突破 4,500 行
- 或者出现了一个真实的 bug 是因为这个文件太大才没发现的

## 7. 决策矩阵

| 你现在的状态 | 推荐 |
|---|---|
| 想立刻清爽 | F（30 分钟） |
| 想为 M8 铺路 | C（半天，**M8 时一起做**） |
| 想现在大动 | 别做 D，做 C |
| 不知道选什么 | F + 等 M8 |

## 8. 一句话总结

> 现在拆 runtime.ts 是过早优化。
> 真正的紧迫优化是：marketing W1（让人看到这工具）+ M5.5（5 个模型装齐）。
> 等 M8 砍旧 UI 时**顺手**拆 catalog 一段（方案 C），是性价比最高的时机。
