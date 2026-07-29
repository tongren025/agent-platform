# Pending 状态统一 — 审计 + 设计 + 修复（R4）

> 起因:用户「pending 状态有的没有、有的不一致,把所有 pending 找出来,缺的补上,全部修复」。
> Explore 全仓清点见本文档第一节;统一规范见第二节;分批修复见第三节。

## 一、现状审计(Explore 全仓清点)

**唯一品牌 spinner** = `NomiLoadingMark`(转动的 N)。但 **最常用按钮 `WorkbenchButton` 没有 `loading` prop**(只能手写 disabled);`DesignProgress` 进度条原语**零业务调用**;无 skeleton 原语。

**8 处不一致(同概念不同实现)**:
1. 上传中:AttachmentRail 用 `NomiLoadingMark` vs AssetPicker/NodeComposer dropzone 用纯文字「上传中…」
2. spinner:全仓 `NomiLoadingMark` vs `NomiRouterApp:19` 自写 `animate-spin` 圆环
3. 进度条:`DesignProgress`(未用) vs `TimelinePreview` 自写导出进度条
4. 「生成中」三套:节点徽标文字 / 生成键「···」/ narrate 整句,且**全程无转圈**(助手同样「进行中」却转圈)
5. 异步拉列表:modelCatalog 有 loading 文案 vs `AssistantModelPicker` 直接 `return null`(消失)
6. Suspense fallback:文字「加载中…」vs 纯空白色块(WorkspaceLoading/GenerationCanvasLoading)
7. 提交反馈:VendorOnboardCard 仅 `disabled` vs OnboardingWizard `loading` 转圈
8. 停止键:CanvasAssistantPanel 有 vs CreationAiPanel 无

**8 处缺失(该有 pending 却没有)**:
- `AssistantModelPicker`:拉模型无 loading,`models.length===0` 直接 return null → 加载中组件凭空消失
- `AssetPicker`:丢弃了 useAssetPool 的 `loading`,加载期显空态文字而非 skeleton
- `ProjectLibraryPage`:打开/新建/删除项目按钮无 busy/disabled
- `WorkspaceLoading`/`GenerationCanvasLoading`:Suspense fallback 是空白色块
- `VendorOnboardCard`:解锁/断开仅 disabled,无可见反馈
- `OnboardingDrawer`:列表刷新静默
- `CanvasToolbar`:「全部生成」无批量聚合进度、按钮无 busy
- 节点正文 running 态:静态斜纹「等待生成」无 shimmer/pulse

## 二、统一规范(设计)

**原则:每种「等待形态」一个原语,全仓一致**——用户看到「进行中」时视觉语言始终一致。

| # | 形态 | 何时用 | 统一原语 | 杀掉 |
|---|---|---|---|---|
| 1 | 不确定·小转圈 | 按钮/小区域 async 中 | `NomiLoadingMark` | 自写圆环、纯文字「上传中…」 |
| 2 | 按钮 busy | 点击触发 async 的按钮 | `WorkbenchButton` 新增 `loading`(NomiLoadingMark 占位 + disabled + aria-busy) | 各处手写 disabled-only |
| 3 | 内容骨架 | 列表/面板数据 async 加载 | 新原语 `NomiSkeleton`(pulse 占位块) | 空白色块 fallback、return null、空态文字 |
| 4 | 确定进度 | 已知百分比(导出) | `DesignProgress` | TimelinePreview 自写条 |
| 5 | 节点生成中 | node.status queued/running | StatusBadge 文案 + 正文 pulse shimmer | 静态斜纹无动效 |
| 6 | 等你确认 | 工具待批准 | 时间线 active 步骤(已统一,本次不动) | — |

文案统一走 `narrate` 注册表(已有),不散写。

## 三、分批修复

**本次范围 = 创作主链路(助手/画布/素材/Suspense/共享原语)。** 避开 onboarding 簇
(VendorOnboardCard/OnboardingDrawer/OnboardingWizard——并行会话正重构 + 拆分 chip 在跑,
高冲突),那批留作 fast-follow 单独做。导出进度条(TimelinePreview)自成一体、最完整、
最低优先,本次只标不改。

| 批 | 内容 | 文件 | 状态 |
|---|---|---|---|
| B1 原语 | `WorkbenchButton` 加 `loading`;新建 `NomiSkeleton`(status.tsx);`NomiRouterApp` 自写圆环→NomiLoadingMark | design/actions, design/status, design/index, NomiRouterApp | ✅ |
| B2 上传统一 | AssetPicker / NodeComposer dropzone「上传中…」→ NomiLoadingMark | AssetPicker, NodeGenerationComposer | ✅ |
| B3 缺失补齐 | AssistantModelPicker 加载 skeleton(不再消失);AssetPicker 用 loading→缩略图 skeleton;两个 Suspense 空白块→居中 NomiLoadingMark | AssistantModelPicker, AssetPicker, WorkbenchShell, NomiStudioApp | ✅ |
| B4 节点动效 | 节点正文 running 态 pulse shimmer | BaseGenerationNode / CardCommon | ⏸ 暂缓 |

**B4 暂缓原因**:BaseGenerationNode 是白名单巨壳(935 基线,加 prop 顶破棘轮)且并行会话正在改它;
节点状态徽标已显示「生成中 / 正在生成,已等 N 秒」(narrate),body shimmer 是纯打磨,不为它打棘轮战。

**其余暂缓(fast-follow,均因并行会话热点或自成一体)**:
- onboarding 簇(VendorOnboardCard 禁用→反馈 / OnboardingDrawer 列表刷新)——并行会话正重构 + 拆分 chip 在跑
- ProjectLibraryPage 打开/新建/删除按钮 busy——库区并行改过(起始页)
- CreationAiPanel 停止键——需接 cancel 句柄,行为改动
- 导出进度条→DesignProgress——自成一体、最完整、最低优先
- 行内文字 loader(FilePreviewPanel「加载中…」等)——文字状态是可接受形态,非「坏」,不强转 spinner

## 验收
每批五门全过;真机抽查加载态可见(AssistantModelPicker 加载不再消失、上传转圈一致、Suspense 不再空白)。
