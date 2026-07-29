# 创作区「拆镜头」触发改版：放宽识别 + 动作卡确认

日期：2026-06-26　状态：待实现（用户已拍板简化版方案）

## 1. 背景与根因

创作助手里「拆故事 → 结构化分镜 → 落画布」这条链路，触发机制是 [`creationIntentRouting.ts:15`](../../src/workbench/creation/creationIntentRouting.ts) 的一串**写死正则**：命中 `拆镜头|分镜|镜头脚本|成片|出片|(做|弄|变|剪|拍|生成)…(视频|短片|片子)` 就在 [`CreationAiPanel.send():268`](../../src/workbench/creation/CreationAiPanel.tsx) **静默直接开跑**规划师。

两个真痛点（用户反馈「不灵敏 / 不知道关键词搞没搞错」）：
- **脆**：换个说法（「把故事整成一段段画面」「铺成画面接画面」）就漏，用户不知道暗号。
- **隐形**：命中了也是静默开跑，用户看不到「发生了什么 / 这个能力存在」。

## 2. 方案（一刀，用户拍板的简化版）

**放宽识别 + 命中弹动作卡（点了才落画布）。**

1. **治脆**：把写死正则升级成**高召回的「动词+宾语」产生式**口径——换措辞也能认。仍是纯函数 + 单测锁覆盖（不引 LLM 分类：零延迟/零额度，且残余漏判由"用户换句话"兜底，不值得为它加每条消息一次的模型调用）。
2. **治隐形**：识别到意图后**不再直接 launch**，而是在对话流里推一条**带按钮的动作卡**——「看起来你想把故事拆成镜头 → [拆成镜头·落画布]」。用户**点按钮才**真正开跑规划师。每次贴边都看得见、可预期，黑魔法消失。

**不在本次范围**（用户明确说先不做，避免铺太大）：常驻能力提示条、「写分镜」模式正名。`skipIntentRouting`（选了写分镜模式/锁定 skill 就不路由）保持现状。

## 3. 详细设计

### 3.1 识别口径（治脆）

`routeCreationIntent` 改判定逻辑（仍返回 `'storyboard' | 'fixation' | null`）：

- **storyboard 命中** = 满足任一：
  - 明确名词：`拆镜头`、`分镜`、`镜头脚本`、`storyboard`、`成片`、`出片`；
  - 产生式「动词 + 宾语」：`(拆|切|分|变|做|整|铺|排|拍|剪|生成|搞|弄).{0,6}(镜头|分镜|画面|视频|短片|片子|一段段|一格格|一幕幕|一幕)`。
- **fixation 命中**（沿用并略放宽）：`立角色卡|角色卡|人物卡|定妆|角色设定|建.{0,2}角色`。
- storyboard 优先于 fixation（与现状一致）。
- **防误伤**：`照片`、`看视频`、`视频通话/会议` 不触发——动词表不含「看/通/开」，且不裸匹配「片」。

口径只放在这一个纯函数里（唯一真相源），单测把"该命中/不该命中"两类钉死。

### 3.2 消息模型扩展（最小、向后兼容）

[`workbenchAiTypes.ts`](../../src/workbench/ai/workbenchAiTypes.ts) 的 `WorkbenchAiMessage` 加一个可选字段：

```ts
/** 跨面板动作卡：assistant 消息携带可一键触发的动作（拆镜头/立角色卡）。
 *  prompt = 原始用户输入（按钮点击时传给 launch，供编辑器为空时抠故事）。 */
action?: { kind: 'storyboard' | 'fixation'; prompt: string }
```

可选字段，旧 session 消息无此字段照常渲染，零迁移。

### 3.3 send() 改动

[`CreationAiPanel.send()`](../../src/workbench/creation/CreationAiPanel.tsx) 里现在的：

```ts
if (intent === 'storyboard') { launchStoryboardPlanning(...); return }
if (intent === 'fixation')   { launchFixationPlanning(...); return }
```

改为：识别到 intent → 推一条 user 气泡（用户原话）+ 一条带 `action` 的 assistant 卡，**不 launch**：

```ts
if (intent) {
  pushUserMessage(userRequest)
  pushActionCard({ kind: intent, prompt: userRequest })
  setDraft(''); return
}
```

- 「方案审阅中（`storyboardEditorOpen`）输入即改方案」那条分支（:256）**不变**——那是修方案，仍直接 `launchStoryboardPlanning(revision)`，不出卡。
- `launchStoryboardPlanning` / `launchFixationPlanning` **函数体一字不动**，只是改由"卡片按钮点击"调用，而非 send 直接调。

### 3.4 渲染（新增动作卡分支）

消息 map（:558）加一个**优先分支**：`message.action` 存在 → 渲染 `StoryboardActionCard`（新组件），否则走原有 AssistantMessageView / 错误卡逻辑。

新组件 `src/workbench/creation/storyboard/StoryboardActionCard.tsx`（小文件，≤80 行）：
- 文案：storyboard = 「看起来你想把故事拆成镜头」；fixation = 「看起来你想给角色立卡」。
- 主按钮：`WorkbenchButton variant="primary"`，图标 + 「拆成镜头·落画布」/「立角色卡」+ 右箭头。
- 视觉走设计系统 token（`bg-nomi-paper border-nomi-line rounded-nomi-lg`，主按钮 `bg-nomi-ink hover:bg-nomi-accent`），与现有待批写卡同语言。
- **消费态**：点过的卡按钮置灰（`resolvedActionIds` set，仿 `recoveryShownIds`），防重复开跑；launch 自身会追加"正在拆镜头"pending，链路衔接自然。

### 3.5 分层与文件清单

| 文件 | 改动 | 行数影响 |
|---|---|---|
| `ai/workbenchAiTypes.ts` | +`action?` 字段 | +3 |
| `creation/creationIntentRouting.ts` | 放宽 storyboard 口径（纯函数） | ~+8 |
| `creation/creationIntentRouting.test.ts` | 加新措辞命中 + 防误伤负例 | ~+15 |
| `creation/storyboard/StoryboardActionCard.tsx` | 新组件 | +~70 |
| `creation/CreationAiPanel.tsx` | send 改推卡 + 渲染分支 + resolved 态 | ~净增 <20 |

无文件破 800 行门（CreationAiPanel 现 ~720，净增 <20，仍过）。

## 4. 不动项（守住，别误伤）

- `launchStoryboardPlanning` / `launchFixationPlanning` 内部逻辑、规划师调用、免费规划守卫。
- `storyboardEditorOpen` 改方案分支（审阅中输入=改方案）。
- `skipIntentRouting`（写分镜模式 / 锁定 skill 不路由）。
- 空态建议按钮「梳理成分镜脚本」——它走 send()，自然变成"弹卡"，无需单独改。
- `extractStoryFromRequest` / 编辑器为空抠故事补写文稿的逻辑。

## 5. 回滚

纯增量。回滚 = 还原 send() 那两行为直接 launch + 删动作卡分支/组件 + 还原正则。单 commit 可整体 revert。

## 6. 验收门

- **单测**：`creationIntentRouting.test.ts` 新增用例全绿——
  - 命中：`帮我拆镜头`/`把故事整成一段段画面`/`铺成画面接画面`/`切成几个镜头`/`排成分镜`/`做成短片`；
  - 不误伤：`今天天气怎么样`/`发张照片`/`看个视频`/`帮我改下这句` → null。
- **五门**：`pnpm run gates` 全过。
- **真机走查（R13）**：创作区写一段故事 → 用一句"旧正则会漏"的措辞（如「把这个故事整成一段段画面」）→ 看到动作卡冒出 → 点按钮 → 规划师开跑 → 方案卡落地。截图人眼判断。

## 7. 验收对账（报完成前逐项核）

| 项 | 判据 |
|---|---|
| 治脆 | 旧正则漏的措辞，新版能识别（单测 + 走查实证） |
| 治隐形 | 识别后出可见动作卡，点击才落画布（走查截图） |
| 不留尾巴 | fixation 同样走卡（对称），消费态置灰防重复 |
| 无回归 | 改方案分支/空态建议/写分镜模式抑制 行为不变 |
