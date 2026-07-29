# 空壳项目 GC + 草稿态生命周期（持久化根治）

**分支** `fix/persist-gc`　**源** START.md / 审计 P0-3　**日期** 2026-06-14

## 问题（根因）

- 创建即落盘：`createLocalProject` → `desktop.projects.create` 立即写 `.nomi/project.json` + 进 registry。点一次「新建空白」哪怕零编辑也永久留一条。
- 全仓零 GC（grep 无 `gc/purge/prune/cleanup/recycle`），删除路径又是「假删/真删」混用。缺「草稿态 ↔ 持久态 ↔ 回收」生命周期。

## 设计：显式草稿态标记 + 后端启动 GC（不靠 payload 考古、不跨边界 import）

**不变量**：`revision === 0 ⟺ 落盘 payload 就是出生默认值`（只有 `saveWorkspaceProject` 改 payload，且它把 revision 置为 `existing+1 ≥ 1`）。所以 `draft && revision===0` = 可证明的「从未编辑的空白」。

### 判据（全满足才回收，AND）
1. `source === "native"`（默认根内 Nomi 自管目录；folder/external 永不碰，复用 `deleteWorkspaceProject` 既有双重边界）
2. `!missing`（目录确实在）
3. `draft === true`（renderer 新建空白时打的标记；example 有 seedKey 不打、打开文件夹有 rootPath 不打、磁盘存量项目无此字段 → 都天然豁免）
4. `revision === 0`（从未走过 save）
5. `assets/` 递归无任何真实文件（忽略空日期目录 + `.DS_Store`）——防御纵深，杜绝误删带素材的项目

### 时机
- 在 `listProjects()` **首次调用懒触发一次**（模块级 `let gcDone=false` guard，仿 `discoverLegacyProjectsOnce`）。首次列举 = App 启动加载库，此刻盘上任何 draft 必来自**上一个进程**（本进程还没新建过）→ 安全。本会话新建的草稿在 GC 之后才产生，guard 保证只跑一次 → 永不误删当前会话项目。不碰 `main.ts`（范围外）。

## 改动文件（全部范围内）

| 文件 | 改动 |
|---|---|
| `electron/workspace/workspaceTypes.ts` | schema 加 `draft?: boolean`，随 manifest 持久化 |
| `electron/workspace/workspaceRepository.ts` | `createWorkspaceProject` 透传 draft；`saveWorkspaceProject` 首存即清 draft（promote）；新增 `gcEmptyDraftWorkspaceProjects(deps)`（deps 注入，可测）+ 资源空判 helper |
| `electron/projects/repository.ts` | `ProjectRecord` 加 `draft?`；`listProjects` 首调懒触发 GC（once-guard） |
| `src/workbench/project/projectRecordSchema.ts` | summary schema/type 加 `draft?: boolean` |
| `src/workbench/project/projectRepository.ts` | `createLocalProject` 对 blank（无 seedKey、无 rootPath）打 `draft:true` |

## 不动
- `NomiStudioApp.tsx` / `workbenchStore.ts` / `generationCanvas/`（别窗口地盘）
- 真删的「草稿态延迟落盘到完全不写盘」：那需要 renderer 创建触发点（NomiStudioApp，范围外）。本切片用「写盘 + 启动 GC」达到等价终态（库不再堆空壳），并落显式 draft 生命周期。差异已在此声明。
- 磁盘现有项目数据（存量已手动清到 2 个；GC 只认带 `draft` 字段的新空壳）。

## 回滚
单 commit 可 revert；draft 字段是 optional，老项目无字段、新项目带字段都安全；GC 不删任何无 draft 标记的项目。

## 验收门
TDD（临时目录夹具）→ 五门全过 → push `fix/persist-gc`（不合 main）。
