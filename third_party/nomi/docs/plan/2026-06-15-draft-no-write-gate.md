# 草稿态「真不写盘」共享 draft-gate（P0-3 / 交接 1d 完整版）

> 状态：**方案 / 待在 main 上实现**（用户拍板：不在 raman 分支做，1a/1b/1c 已并 main）。
> 出处：交接 `docs/plan/2026-06-14-handoff-tails-popover-textsource.md` 任务 1d；真机验证发现见 memory `draft-no-write-spans-three-subsystems`。

## 1. 问题与真机发现

交接 1d 把「新建空白零编辑不落盘」描述成「renderer 端延迟 createLocalProject 到首次编辑」。raman 分支照此实现（内存草稿 build + pending 注册 + 首次编辑 promote），**真机测出不达标**：

新建一个**零编辑**项目，`~/Documents/Nomi Projects/<folder>/.nomi/` 仍出现 `project.json` **和** `conversations.json`。三条独立写盘路径：

1. **项目记录自动保存**：`hydrate` 会 `restoreWorkbenchProjectPayload` dirty 各 store，autosave（700ms 防抖）随即触发 → `persistProject` 把草稿 promote 落盘——**即使用户没编辑**。
2. **会话持久化**：`conversationPersistence` 按 `activeProjectId` flush，独立写 `conversations.json`，与项目记录无关。
3. **画布事件日志**：`replayCanvasEventTailAndSealGenesis` / 画布事件 flush 按 id 写盘（本次 seq=0 未触发，属同类隐患）。

## 2. 根因（P2）

各持久化子系统都**按 `activeProjectId` 写盘，不问该项目是否已落盘**。只堵 renderer 创建路径治不了——只是把写盘从「点击时」挪到「打开后 700ms」，文件夹照样生成。

## 3. 方案：共享 draft-gate 原语

一个被三路写盘共同查询的「草稿闸」：

- **状态**：模块级 `pendingDraftRecords: Map<id, record>`（renderer，已在 raman 分支验证可行，可复用）+ 导出 `isPendingDraft(id)` 供其它子系统查询。
- **新建空白**：`buildLocalProjectRecord()` 建内存草稿（不写盘）→ `registerDraftProject` → 用 id 正常 hydrate（hydrate 内跳过迁移写盘 + lastActive）。
- **三路写盘抑制**（草稿期间 `isPendingDraft(id) === true` 时全部 no-op）：
  1. `persistProject`：promote 前先判 `workbenchPayloadSemanticEquals(payload, draftDefaultPayload)`——**语义等于草稿默认态 = 还没真编辑 → 不 promote、不写盘**（排除 hydrate 自激的 autosave）。只有内容真变了才 promote（落工作区，保留草稿 id）+ 出闸。
  2. `conversationPersistence` flush：`isPendingDraft(id)` → 跳过写 `conversations.json`（草稿无消息时本就该 no-op，可双保险）。
  3. 画布事件 flush：`isPendingDraft(id)` → 不落事件日志（promote 时再 seal genesis）。
- **抬闸**：首次真编辑 promote 后 `pendingDraftRecords.delete(id)`，三路恢复正常 flush；补一次「把当前 conversations/事件」flush，避免漏掉 promote 瞬间的状态。
- **GC 兜底保留**：极端竞态漏网仍被空壳 GC 收。

## 4. 范围（文件）

- `src/workbench/project/projectRepository.ts`：`buildLocalProjectRecord` / `persistLocalProjectRecord`（build/persist 拆分，raman 分支已验证）。
- `src/workbench/project/projectPersistenceService.ts`：pending registry + `registerDraftProject` + `isPendingDraft` + `persistProject` 语义相等跳过 + hydrate 跳过。
- `src/workbench/library/localProjectStore.ts`：build/persist 包装。
- `src/workbench/ai/conversationPersistence.ts`：flush 查 `isPendingDraft` 跳过。
- 画布事件 flush 入口（`workbenchProjectSession` / `canvasEventEmitter`）：草稿期间不落盘。
- `src/workbench/NomiStudioApp.tsx`：`newProject` 走草稿路径。

## 5. 不动什么 / 回滚

- 不动 GC（兜底保留）。不动 example/打开文件夹路径（它们本就该立即落盘）。
- 回滚：删 draft-gate 查询、newProject 退回 `createAndOpenProject`（即当前 main 行为）。

## 6. 验收门

- 五门全过。
- 单测：`isPendingDraft` 语义相等跳过逻辑（pure）；build 不写盘 / persist 保留 id（raman 分支已写，可搬）。
- **真机走查（关键，raman 分支就是栽在这）**：新建空白 → 文件夹计数 0 增量；输入一个字 → 700ms 后 +1（project.json + conversations.json 一起出现）；切走未编辑草稿 → 无残留；重启不自动恢复未落盘草稿且不报错 toast。**必须在干净 Electron 环境跑（无并行会话占用 /tmp/nomi-ui）**。
