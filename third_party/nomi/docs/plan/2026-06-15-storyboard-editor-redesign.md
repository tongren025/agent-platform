# 分镜方案编辑器 视觉重设计 · 实现规范（2026-06-15）

> 用户拍板样张 `docs/design/reviews/2026-06-15-storyboard-editor-redesign.html` + 图标决策（见下）。
> 只动视觉层级/克制度,**数据/交互/字段全不变**,token-only。

## 诊断（违背设计系统的点）
大蓝 banner 占整行 / 锚=一堆灰块无层级 / carrier 长胶囊撞蓝色 / 镜卡扁平与锚争重量 / 到处叠 border。
违背：density over decoration、one visual hierarchy、用 spacing 建层级而非加 border、彩色克制。

## 图标映射（设计系统 §6：只 Tabler、同概念跨界面复用）
| 位置 | 图标 | 说明 |
|---|---|---|
| header | IconMovie | 不变 |
| 锚·角色/场景/道具/风格 | IconUser / IconPhoto / IconBox / IconPalette | 锁定集,沿用现有镜卡 KIND_ICON |
| carrier 视觉「参考图」| **IconCamera** + 小字「参考图」 | 用户拍板 A;不能再用 IconPhoto(撞场景) |
| carrier 文本「文字」| **IconLetterCase** + 小字「文字」 | 与时间轴文字图标复用(替原 IconTypography) |
| 镜卡参考 chip | 无图标·纯文字 | 用户拍板,减噪 |
| grip/删除/加/锁/勾/警 | IconGripVertical / IconTrash / IconPlus / IconLockOpen / IconCheck / IconAlertTriangle | 不变 |

## 视觉规范（token-only）
- **大蓝 banner → 一行小灰字**：`px-4 py-1.5 text-caption text-nomi-ink-40 border-b border-nomi-line-soft`，`IconLockOpen` 14 + 「AI 草拟，随便改 · 确认前不生成、不花钱」。删掉 accent-soft 整条底色 + 「规划免费」蓝 pill。
- **锚区 = 一个分组面**：外 `border border-nomi-line rounded-nomi overflow-hidden`;每行 `flex items-center gap-2.5 px-2.5 py-2 border-t border-nomi-line-soft`(首行无 top);删掉每锚的 `bg-nomi-ink-05` 灰块。add-row 在容器底部 `bg-nomi-ink-05` 一行。
- **carrier**：图标(IconCamera/IconLetterCase 13)+ 小字(text-caption);视觉态 `bg-nomi-accent-soft text-nomi-accent`,文本态 `border border-nomi-line text-nomi-ink-60`。
- **镜卡 = 主轴**：`border border-nomi-line rounded-nomi bg-nomi-paper shadow-nomi-sm p-3`(加 shadow);编号 `镜 N` 用 `text-title font-semibold`(比现在大、醒目)。
- **镜卡参考 chip**：选中 = `bg-nomi-ink-05 text-nomi-ink-80`(中性,不再 accent-soft 满屏蓝),纯文字;失效 = danger-soft 不变;+参考 = dashed 不变。
- **统一**：卡 rounded-nomi、输入 rounded-nomi-sm、chip rounded-full。

## 取舍（要向用户说明的 1 处）
- 锚的**类型(kind)仍可编辑**：样张把类型画成静态图标徽标,但现状 kind 可改(changeAnchorKind)。为不丢功能(P1),实现成**点图标徽标 → 内联展开 4 类型选择器**(复用镜卡现有 inline picker 范式,不走 portal、无遮挡风险),既近样张又保编辑。

## 改动文件
- `StoryboardPlanEditor.tsx`：banner→小灰字;锚区包进分组面容器;镜区不变(只透传)。
- `StoryboardAnchorCard.tsx`：去灰块改行式;kind 图标徽标+inline picker;carrier 图标+小字(camera/letter-case)。
- `StoryboardShotCard.tsx`：加 shadow-nomi-sm;镜号放大;参考 chip 改中性纯文字。

## 不动项
数据模型 / 校验 / 拖拽重排 / 落画布逻辑 / NomiSelect 时长。

## 验收门
五门 + `tests/ux/design-fidelity.e2e.mjs`(若有分镜断言则更新)+ 真机走查与样张逐项对账。

## 回滚
纯样式改,revert 即回。
