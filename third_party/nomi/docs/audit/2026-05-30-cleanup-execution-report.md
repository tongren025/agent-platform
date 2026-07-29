# 代码梳理执行报告 2026-05-30

> Status: 执行中
> Audit 来源：`docs/audit/2026-05-30-codebase-cleanup.md`
> 本次范围：A1-A5（立即可删/合并）+ C1（audio 端到端补全）
> 不在本次范围：B1 拆 runtime.ts（高风险，单独立项 v0.8.1）

## 0. 决策一句话

**只动结构 + 加 audio。不动业务逻辑、不重构大文件、不动设计系统。**
每一步独立，跑挂可单独 revert。

## 1. 范围矩阵

| 编号 | 动作 | 风险 | 估时 |
|---|---|---|---|
| A1 | 12 RELEASE_NOTES → `docs/release-notes/` | 极低 | 5 min |
| A2 | `docs/plans/` → `docs/plan/` | 极低 | 2 min |
| A3 | 删 14 个失败 trial 目录 | 极低 | 1 min |
| A4 | `src/workbench/feedback/` → `src/utils/` | 低（要 grep 修引用） | 10 min |
| A5 | `src/workbench/nomi/` → `src/ui/app-shell/` | 低（要 grep 修引用） | 10 min |
| C1 | `BillingModelKind` / `ProfileKind` 加 `audio` | 中（影响 catalog + commit + 类型） | 30 min |
| 收尾 | 全量 tsc + commit | — | 5 min |

总：~65 分钟。

## 2. 明确不做（本次）

- **B1 拆 runtime.ts**：2,687 行拆 6 模块。改面大、要全跑一遍 desktop 才能确信，单独立项 v0.8.1 处理
- **B2 砍旧 modelCatalog UI**：已经在 v0.8 M8 范围里
- **C2 ModelKind/BillingModelKind 同源**：等 B1 时一起
- **C4 release 自动化**：营销 W1 任务，不在 audit 范围
- 删除任何带逻辑的代码 / 改任何 hook / 改任何组件 prop

## 3. 回滚策略

- 每步独立 commit，跑挂直接 `git revert <sha>` 不影响其它步骤
- A1-A5 全是 `git mv` 或 `rm -rf docs/onboarding-trials/2026-05-28T...` —— 没有代码逻辑变更，最坏情况文件错位
- C1 改 union 类型 + 两处 if 分支，tsc 兜底
- 整个会话不会动 `electron/runtime.ts` 的业务函数体（仅类型）

## 4. 验收门

每步过 3 关：

1. `git status` 显示符合预期的 add/delete
2. `pnpm exec tsc --noEmit` 不出新错（已知 pre-existing 错误忽略）
3. 没有"被遗忘"的引用（`grep -rln <old-path>` 应为空）

## 5. 输出

- 7 个 commit（或并到 2-3 个，按变更大小决定）
- 本报告末尾更新执行结果
- task #66-72 全部 completed

---

## 6. 执行结果

| 编号 | 状态 | 验收要点 |
|---|---|---|
| A1 | ✓ | 12 个 RELEASE_NOTES_v*.md 全部进 `docs/release-notes/v*.md`，根目录无 RELEASE_NOTES 文件 |
| A2 | ✓ | `docs/plans/` 内 2 文件合入 `docs/plan/`，空目录已删 |
| A3 | ✓ | 14 个 `2026-05-28T14-{14..36}-*-gpt-image-2-text-to` 失败 trial 删除（gitignored，纯本地清理）；保留 7 个有效 trial（kling success + 3 attack + 2 m4-retest + 1 m5-install） |
| A4 | ✓ | `showUndoToast.ts` → `src/utils/`；唯一引用 `CategorySidebar.tsx` 已改路径 |
| A5 | ✓ | `NomiAppBar.tsx` → `src/ui/app-shell/`；`WorkbenchShell.tsx` import 已更新；NomiAppBar 内部 3 个相对路径同步升级 |
| C1 | ✓ | `BillingModelKind` 加 `"audio"`；`ProfileKind` 加 `text_to_audio` / `image_to_audio`；`commitOnboardedModelToCatalog` 拆掉 audio 拒绝分支；`getModelCatalogHealth.byKind` 加 audio；`modelCatalog.constants.buildRequestProfileV2Template` 补 2 个 audio 模板；`lab-install-from-trial.ts` 同步 |
| 收尾 | ✓ | 我引入的改动 type-check 全过；项目残余 118 行错误均为本次之前已有的问题（M5.3 已记录），不阻塞 |

### 6.1 文件移动统计

```
 mv  12 release notes -> docs/release-notes/
 mv  2  plan docs     -> docs/plan/
 rm  14 failed trials -> gone
 mv  1  showUndoToast -> src/utils/
 mv  1  NomiAppBar    -> src/ui/app-shell/
 type 4 文件类型扩展 audio（runtime.ts + server.ts + modelCatalog.constants.ts + lab-install-from-trial.ts）
```

### 6.2 commit 计划

一个 commit，title `chore: codebase cleanup (audit 2026-05-30 section A + C)`。
理由：每步内变化都很小、彼此独立但属同一次梳理；分 6 个 commit 不便回滚整体。如真出问题，
`git revert` 一次即可。

### 6.3 后续

- **B1 拆 runtime.ts**：留作 v0.8.1，单独项目
- **B2 砍旧 modelCatalog UI**：v0.8 M8 范围
- **C 余下：ModelKind/BillingModelKind 同源 + release 自动化**：随 B1 一起做
- 营销 W1 任务（demo / README / CHANGELOG / Show HN 草稿）：另起会话推进
