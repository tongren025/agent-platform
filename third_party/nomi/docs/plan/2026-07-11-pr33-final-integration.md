# PR #33 分拆合并收尾

日期：2026-07-11
目标：按仓库既有合并纪律，把 PR #33 中已验证的价值留在 `main`，补齐拆合后暴露的测试缺口，并关闭不再可整包合入的旧 PR。

## 现状与判断

- PR #33 基于旧主线 `e9077ead`，包含 13 个提交、86 个文件、`+23626/-2047`；当前与 `main` 冲突。
- 原 PR 的 Quality Gate 在 `check:filesize` 首门即失败：新增 2629/3637/2113 行巨壳，并让多个既有文件越过或倒退体积基线。
- 两块确定价值已经按提交/规格拆进 `main`：
  - `3c0a3a29` + `318b2a1e`：3D 全屏 Windows windowbar，并抽模块压回 800 行门内；来源为 PR 提交 `0892f2b8`。
  - `f92a2ddc`：把 PR 的“网页参考捕捞→素材库→画布”核心桥重做为单视图、安全默认拒绝的 M0，并保留作者署名。
- PR 中多标签/书签/悬停 DOM 注入/本地存储素材盒、付费 prompt 语义变更、批量 UI 重排和新图标依赖，已有明确评审结论，不能因“合并”而重新灌回主线。

## 本次范围

1. 保持 `main` 上已经落地的 3D windowbar 与参考捕捞 M0 为唯一实现，不再合入旧并行版。
2. 提取 PR `4fd2e19a` 中可独立验证的暗色可读性修复：项目卡删除按钮复用删除确认框的全局 destructive token（项目库不在 `workbench-shell` 作用域，不能使用其中的 `danger-soft` 变量）。
3. 从 PR `815c5d79` 提取完整、可测试的“文本节点 → 图片/视频 = prompt 上下文边”闭环：只在用户/agent 显式连边后，按边顺序把文本节点内容附加到下游 prompt；不把文本误当参考素材、不参与参考生成依赖，也不修改原节点持久数据。
4. 从 PR `246cfb86` 提取 `dev-electron` 的 renderer fail-fast：Vite 子进程若在 ready 前退出，立即报错，不再空等 180 秒。
5. 修复 3D windowbar 分拆后的 6 条 UX 走查脚本：退出按钮选择器从旧的 `title="关闭"` 对齐到 `title="退出 3D 场景"`，并限定在 3D 对话框内。
6. 把参考捕捞走查从“只打印 PASS/FAIL”收口为真实非零退出门禁，避免 CI/人工执行出现假绿。
7. 修正标准 Electron smoke 与 3D pose-click walk 的自包含启动环境：内置 `NOMI_E2E=1`；smoke 另用独立 user-data/settings/projects，避免本机已有 Nomi 实例触发单实例退出，也不读写用户项目。
8. 完整验证后直接推送 `main`；随后关闭 PR #33（重要提交已按作者署名分拆吸收，旧分支不再具备可合并语义）。不新增 PR 对话。

## 明确不动

- 不改写或 force-push PR 作者分支。
- 不合入 `browserViews.ts`、`NomiBrowserDialog.tsx`、`NomiBrowserAssetPopover.tsx` 等巨壳。
- 不引入 `lucide-react` / Radix tooltip；不恢复 localStorage 素材盒第二真相源。
- 不整包合入 `815c5d79`；只保留上面列明、由显式连边触发且有纯函数/集成测试覆盖的文本上下文闭环。旧素材盒导入、多选拖拽和批量 UI 改动均不进。
- 不覆盖当前本地 `main` 工作树里的未提交测试与工作流改动；所有实现和验证均在 sibling worktree 完成。

## 回滚

- 本次收尾为一个独立 commit，可直接 `git revert <commit>`。
- 已在 `main` 的 `3c0a3a29`、`318b2a1e`、`f92a2ddc` 不在本次回滚范围。
- PR #33 关闭后仍保留完整分支与历史；如需重新研究某切片，从对应原提交提取，不恢复整包。

## 验收门

1. `pnpm run gates` 全绿：filesize → tokens → dangling tokens → archetype defaults → lint → typecheck → unit tests → build。
2. `node tests/ux/reference-capture.walk.mjs` 六项全 PASS、console error 为 0，并以退出码证明结果。
3. 文本上下文边的纯函数、agent 建边、手动连边、依赖波次、参考祖先和节点执行相关测试全部绿；同时确认 `GenerationCanvas.tsx` 仍低于 800 行。
4. `dev-electron` renderer 提前退出场景不再等待 ready 超时。
5. 受 3D 退出按钮影响的 6 条零额度 walk 全部实际跑通；至少确认退出后旅程继续，而非静默跳过。
6. 暗色项目库中 hover 项目卡，删除按钮使用全局 destructive token 且图标可读；截图人工核对。
7. 推送前重新 fetch，确认 `main` 未漂移；推送后复核远端 SHA 与 PR 状态。

## 结果回填

- 合并提交：本计划与 PR #33 收尾代码同一提交；最终 SHA 见推送后的 `main` 与交付说明。
- 全量门禁：`pnpm run gates` 通过；filesize/tokens/dangling/archetype/lint/typecheck 均绿，Vitest `273 files / 2586 tests` 通过，renderer 与 Electron build 通过。Lint 保持基线内 `96 warnings / 98`，无 error。
- 浏览器捕捞：`reference-capture.walk.mjs` 六项全 PASS，覆盖入口、独立捕捞窗、地址栏导航、图片落 `assets/imported`、无 `.meta`、权限默认拒绝、主素材库实时回流；main/chrome/WebContentsView 合计 `0` console error，exit `0`。
- 标准 smoke：`pnpm run test:e2e` 在本机另有 Nomi 实例运行时仍可用隔离 profile 完成，`10/10` assertions PASS，exit `0`。
- 3D 零额度 UX：camera-move-retry、take-record、pose-click、camera-move-ctxloss-recovery、whitescreen-repro、camera-possess 六条 walk 全部 exit `0`；退出按钮均执行“可见→点击→编辑器消失”硬断言，白屏脚本同时确认双假人/重开无白屏、无 console/page error。
- 暗色视觉：项目库 hover 项目卡后，删除按钮 computed background 为 `oklch(0.62 0.18 30)`、图标对比度 `4.19:1`（图形控件门槛 `3:1`），页面无错误；截图为 `tests/ux/shots/pr33-dark-delete-final.png`（测试产物不入库）。人工核对可读。
- 远端状态：推送后等待 GitHub `Quality Gate` 与 `Mac Package`；两者通过后关闭 PR #33，不追加 PR 对话。若远端平台异常，本地全量证据不替代远端门禁，需在交付说明中明示。
