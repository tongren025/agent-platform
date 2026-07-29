# 全 App UX 冗余/复杂度审计（从头到脚 · 第 1 轮基线）

> 2026-06-22 ｜ 用户：「扫描出类似的…从头到脚优化一遍」。五路并行只读体检（创作 / 画布 / 预览 / 库+跨切面 / 导航），用「模型接入」那把尺子（入口重叠 / 两套心智-并行版 / 概念过载 / 字段没收起 / 分散入口 / 长尾占主路 / 文案不一致）。本文档=本轮**现状地图（point-in-time）**，只诊断。
>
> **institutionalized**：这套体检已固化成 `nomi-ux-audit` 技能（`.claude/skills/nomi-ux-audit/`，evaluation 体系的「结构/UX 质量」lane），可复跑 + 带 diff/回归看门狗，随 R14 节奏跑。**活路线图（什么时候整什么、状态）见 [`docs/audit/redundancy-backlog.md`](redundancy-backlog.md)**——那是唯一活真相源；本文档只是第 1 轮快照。

## A. 🧹 卫生清理（纯删并行版 / 复用设计系统 / 删死码——低风险，无产品决策）

| # | 问题 | 证据 | 风险 |
|---|---|---|---|
| A1 | **3 套 toast + 1 套死的本地 store**：`ui/toast.tsx`(Mantine,catch才fallback) / `utils/showUndoToast.ts` / `utils/showInfoToast.ts` 各封装一遍；两个屏角(`main.tsx:37` top-right vs `toast.tsx:40` bottom-right)；`useToastStore`/`ToastHost` 几乎永不触发=死码(~18 文件高频依赖) | 见库审计 P0 | 低 |
| A2 | **4 库面板各手搓搜索框 + 3 处手搓分段 tab**，绕过现成 `DesignTextInput`/`DesignSegmentedControl`(仅 onboarding 用)；placeholder/高度/圆角都不一致 | `ProjectLibraryPage:174/201` `PromptLibraryPanel:138/157` `AssetLibraryPanel:237/266` `AssetPicker:75` | 低 |
| A3 | **空态 8 处各手写**，「还没有/暂无/没有匹配」三种说法混用，无统一空态组件 | `AssetLibraryPanel:279` `PromptLibraryPanel:170` `ProjectLibraryPage:212` `CanvasEmptyState` 等 | 低 |
| A4 | **模型接入入口 props/事件双轨 + 死 intent**：6 处就近入口(保留)，但一半走 props 一半 `dispatchEvent`；`WorkbenchAiHeaderActions:68` 带的 `intent` 监听端`NomiStudioApp:147`不读=死参数 | 导航 P1 | 低 |
| A5 | **`openWorkbenchModelIntegration` 死函数**(无调用方) | `WorkbenchAiHeaderActions:65` | 低 |
| A6 | **overlay 外壳各写一遍**：点外关/ESC/zIndex(4000/4200/5000)散在 6+ 处手写，`DesignModal/DesignDrawer` 仅 2 处用 | `AboutNomiPopover:42` `PromptLibraryPanel:76` `AssetLibraryPanel:124` 等 | 中 |
| A7 | **文案不一致**：拼片=「AI拼片/排进时间轴/发送到时间轴」；重生成=「重新生成/就地重出/派生重新生成/用相同参数重生成」；接入=「模型接入/接入文本模型/去配置/去接入」；slogan 两版(「AI起草你定稿」vs「AI草拟随便改」) | 多处 | 低 |

## B. 🔀 产品级取舍（需出样张 + 你拍板）

| # | 问题 | 证据 | 影响 |
|---|---|---|---|
| B1 | **「写分镜」模式 vs「拆镜头」规划师 双路**：creation mode `storyboard`(出纯文本) 与意图正则 `STORYBOARD_REQUEST_PATTERN`→`StoryboardPlanEditor`(出可落画布方案) 同目标两套，靠隐式关键词触发+「锁技能跳过路由」补丁 | `creationAiModes.ts:76` `creationIntentRouting.ts:14` `CreationAiPanel:161/262` | **高**(创作核心) |
| B2 | **导出双入口 + 零设置**：AppBar「导出」(非预览页=跳转/预览页=执行) 与控制条「导出MP4」同源；`resolution/quality` 写死(`:258`)而 `exportApi` 本支持 720p/1080p+quality | `NomiAppBar:251` `TimelinePreview:781/258` | 高(主线终点) |
| B3 | **字幕 vs 标题卡 概念冗余**：底层只是同一文字 clip 的初始字号/落点不同(`textLayout:15`自承「存进position后与手拖无差别」)；且文字的内容/样式/时长拆在叠加层双击+控制条+文字轨三处 | `TimelinePreview:710` `textLayout:24` `TextClipStyleControls:18` | 中 |
| B4 | **composer 三选择器（模式/技能/模型）相邻打架**：语义不同却同屏，代码自承「锁技能跳过意图路由」 | `CreationAiPanel:262/680` | 中-高 |
| B5 | **画布→时间轴 4 路径、落点语义三套**(末尾/playhead/任意拖放)，幂等去重只 arrange 有 | `sendStoryboardToTimeline:102/122` `TimelineTrack:58` `applyCanvasToolCall:467` | 高(核心桥) |
| B6 | **onboarding 三套并行**(开屏SplashIntro / 上手清单 / 聚光引导)，同一动作两份近似 hint 文案 | `OnboardingChecklist:43` `OnboardingSpotlight:30` | 中(首启必经) |

## C. 🗂️ 字段没收起 / 长尾占主路（中风险）

| # | 问题 | 证据 |
|---|---|---|
| C1 | **composer 参数全铺开无「高级」折叠**：最宽 7 控件≈810px，为不折叠付出 shiftX 横向夹取+flipUp+max-w-880 一整套救火码；历史在「弹层↔全平铺」横跳过 | `InlineParameterBar:34/145` `NodeGenerationComposer:148` `NodeParameterControls:448` |
| C2 | **预览画幅 7 项平铺**(16:9/9:16/1:1/4:5/3:4/21:9/4:3)，长尾与高频同级 | `TimelinePreview:41/646` |
| C3 | **控制条一行 12+ 控件组**(播放/构图/文字/导出四类心智)靠 flex-wrap 硬塞；「显示适配 contain/cover」与「构图缩放/偏移」取景概念重叠 | `TimelinePreview:566/658` |
| C4 | **节点选中态浮层叠罗汉**：图片编辑条+下载条+provenance+独立副本+时间轴拖柄+8resize+composer 同屏，根因在 `BaseGenerationNode.tsx`(907 巨壳) | `BaseGenerationNode:449-890` |

## D. 🏗️ 大重构 / 名实不符（影响大改动大，单列后续）

| # | 问题 | 证据 |
|---|---|---|
| D1 | **3D/站位/运镜子系统 ~9000 行服务长尾**：站位参考/运镜小片有完整词汇表+builder 但**零手动入口**(仅 `applyCanvasToolCall:325/393` Agent 触发)，手动 3D 又产不出对等站位图/运镜片=两套不通路径；3D 内三正交编辑态(变换/取景/轨迹)+三 banner | `stagingVocab` `cameraMoveVocab` `Scene3DFullscreen`(800) `scene3dInspector`(685) |
| D2 | **素材库名实不符**：能筛「音频」但传不了音频/拖不了；删除/拖出留 v1.1 未做 | `AssetLibraryPanel:8/34/159` |
| D3 | **无设置页 + 「关于」实为更新器占品牌位**：全仓无 Settings/Preferences；`AboutNomiPopover` 是 7-phase 更新器状态机 | `AboutNomiPopover:92` |
| D4 | **画布「添加节点」三处同源入口**(左栏/右键/空态,共享数据源=良性) + 单/批量生成两套编排路径 | `CanvasToolbar:17` `NodeGenerationComposer:114` vs `GenerationCanvas:292` |

## 进度（2026-06-22）
- ✅ A1 toast 三合一删死码（3c041a8）｜✅ A4/A5 删死 intent/死函数（3c041a8）
- ✅ A3 抽 DesignEmptyState + 3 库面板空态收口（7734f51）｜✅ A2 抽 DesignSearchInput + 3 搜索框收口（7734f51）
- ⏸️ A2 筛选 tab：刻意不抽（计数/tablist/pill 三语境差异大，共享=过度抽象）
- ⬜ A6 overlay 外壳统一（最难，overlay 生命周期，需走查）｜⬜ A7 文案统一（低价值文本）
- ⚠️ A2/A3 真机走查欠：本会话 Playwright electron.launch 连续 EPERM（并行会话 Electron 占资源），低风险 token 收敛，待环境恢复补截图。

## 攻坚顺序（建议）
1. **先做 A 卫生清理**（低风险、纯收敛、立竿见影一致性）——可直接做不必逐张样张，五门+走查。
2. **再逐项 B 产品取舍**（每项出多方案样张→你拍→实现→走查），按 B1(双分镜,最严重)→B2(导出)→B3(字幕)→B6(onboarding)→B4/B5。
3. **C 折叠收纳**穿插在相关 B 里做。
4. **D 大重构**单独立项，量级大、需专门拍板（尤其 D1 3D/运镜）。
