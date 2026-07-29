# 内置「表情预设」包 — 方案（2026-07-28）

## 背景（用户群 7-28 结论）

XiaoLuo-emotion-director-studio 整体借鉴意义不大，但「25 个表情提示词（5 情绪族 × 5 强度）+ 对应预设图」值得做进 Nomi：配合角色定妆图，用图生图把同一角色改出指定强度的表情，服务跨镜表情控制。提示词全部自写（那个项目模型文件损坏、提示词是写死的本地拼接，不抄）。

## 用户看到什么

提示词库「Nomi 精选」画廊**最前面**多出 25 张卡片，来源标签「表情预设」：每张封面是同一对男/女角色在该表情该强度下的真实对照图（男左女右，真图生图产物，即所见即所得）；标题如「愤怒 4/5 · 怒目而视」。点开预览 → 送上画布，得到一个带完整表情改写提示词的图片节点；给节点挂上自己的角色图即可复现同款表情。搜「愤怒」「表情」都能搜到（搜索匹配 title/prompt/source）。

## 关键发现：seed ≠ 内置内容单源（勘察修正）

原任务设想「加进 promptLibrarySeed.json 即内置」。实况：`promptLibraryStore.getPromptLibrary()` 在线拉取 6 个外部 GitHub 源成功后**整体替换**缓存与磁盘，seed 只是「全拉失败且无缓存」时的地板——只改 seed 的表情包会在联网成功后消失（P2 根因层）。

**根治**：引入真正的「内置包」层。内置内容随构建走、不进磁盘缓存、在唯一读取出口恒定前置：

```
getPromptLibrary() = withBuiltinPrompts( 外部源结果 | 磁盘缓存 | seed 地板 )
```

- 磁盘缓存仍只存外部源 → 升级 App 后内置内容立即是新版，无缓存陈旧问题，回滚零残留。
- `withBuiltinPrompts` 按 sourceId 过滤入参再前置 → 幂等，防御历史缓存。

## 改动范围

| 文件 | 动作 |
|---|---|
| `electron/promptLibrary/builtinExpressionPack.json` | 新增：25 条完整 LibraryPrompt（内容单源，pretty JSON 可评审） |
| `electron/promptLibrary/builtinPacks.ts` | 新增：导入校验 + `withBuiltinPrompts()` |
| `electron/promptLibrary/promptLibraryStore.ts` | 原 `getPromptLibrary` 体改名内部 `getExternalPrompts`，导出口一行包裹（单一咽喉） |
| `electron/promptLibrary/builtinPacks.test.ts` | 新增：结构校验 + mediaUrl 文件存在 + 幂等/去重 |
| `public/prompt-media/expressions/*.webp` | 新增：25 张预设图（打包进 dist，本地加载） |
| `scripts/generate-expression-pack-media.mjs` | 新增：预设图生成器（可复跑，kie GPT Image 2） |

**不动项**：`promptLibrarySeed.json`、`promptSources.ts`、`snapshot-prompt-library.ts`、`NodeGenerationComposer`（含 7-28 刚修的 `applyPromptPickerItem`，公共库不走那条路）、`userPromptStore`、库面板全部 UI 组件（零 UI 代码改动，纯数据）。

## 内容规格

- 5 情绪族 × 5 强度：喜悦 / 愤怒 / 悲伤 / 惊讶 / 恐惧，强度 1（微）→ 5（极）。
- prompt 模板 = 身份锁前缀 + 表情描述：「保持画面中人物的身份、五官、发型、服装、姿态、构图与光线完全不变，仅将面部表情改为：〈眉/眼/嘴/面部肌肉的具体描写〉」。中文为主，适配图生图改表情场景。
- id `builtin-expr-<family>-<level>`；source「表情预设」；sourceId `builtin-expressions`；sourceUrl 指本仓库；promptType/mediaType `image`；origin `public`。

## 预设图（真生成，dogfood 提示词本身）

- 通道：kie GPT Image 2（传输契约来自 `electron/catalog/kieGptImage2.ts` + `assetLocalization.ts`，全部实测过的生产代码；key 取用户 catalog，不入仓）。
- 流程:t2i 生成男/女中性定妆底图各 1 → kie 文件托管取公网 URL → 每条提示词对两张底图各做一次 i2i（共 50 次，**用库里逐字相同的提示词**，预设图本身就是提示词的质检）→ 每条男左女右横拼 → 精确 4:3（各半裁成 2:3）→ 960×720 webp。
- mediaUrl 用**相对路径** `prompt-media/expressions/<id>.webp`：dev（Vite serve public/）与 prod（`file://…/dist/index.html`，Vite 拷贝 public/ → dist/）都成立，CSP `img-src 'self'` 已覆盖。国内/离线永不裂图（外部源 raw.githubusercontent 在国内常年裂，本家招牌包不吃这亏）。
- 额度：评测/内容生成默认已授权，事后报花销。

## 回滚

revert 单个 commit 即全退：纯数据 + 单文件咽喉包裹，无迁移、不触用户数据（用户磁盘缓存从不含内置条目）。

## 验收门

1. 单测：25 条结构完整（id 唯一、五族×五级齐、身份锁前缀在、mediaUrl 指向的文件真实存在于 public/）；`withBuiltinPrompts` 前置 + 幂等去重。
2. R13 走查（dist 构建，file:// 相对路径是关键验证面）：库面板出「表情预设」卡片**带图**渲染 → 搜索命中 → 预览 → 送上画布 prompt 完整落节点。截图亲眼看。
3. 五门全过，sibling worktree 落 main。
