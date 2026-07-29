# 统一选择面板：NomiSelect 通用组件（2026-06-07）

> 用户拍板：设计照样张（对勾改到**右边**）；**全部**选择面板统一；**抽象一个通用组件**，别散落各处，以后好改。先做选择面板，再做架构 B。

## 范围
建一个通用受控下拉 `NomiSelect`（基于 Mantine `Combobox`，R5 官方原语处理定位/翻向/键盘/点外关闭），渲染我们 token 化的紧凑选项（对勾在右）。替换全仓**所有 11 处原生 `<select>`**：

| 文件 | 处数 | 用途 |
|---|---|---|
| `NodeParameterControls.tsx` | 4 | catalog 控件 / boolean / 选项 / 模型芯片 |
| `AssistantModelPicker.tsx` | 1 | 助手模型 |
| `CreationAiPanel.tsx` | 1 | 创作模式 |
| `CanvasAssistantPanel.tsx` | 1 | AI 模式 |
| `Scene3DFullscreen.tsx` | 2 | 3D 控件 |
| `TimelinePreview.tsx` | 2 | 预览画幅 / 适配 |

## 组件 API（一个组件覆盖所有触发形态）
`leadingLabel?`（小灰标签：比例/模式/画幅）+ `value` + `triggerBadge?`（模板/通用）+ `▾`，整体一个 pill 触发。
选项行：`label` 左，`trailing?`（价格/徽标）右，**对勾最右**（选中可见，预留列不跳动）。
`size: 'sm'|'xs'`；`triggerMaxWidth?`（长模型名截断）；`variant: 'pill'|'bare'`；token-only、贴边翻向、键盘可达。

## 不动
- 表单字段用的 `DesignSelect`（Mantine Select，整宽表单场景，onboarding）——不同 UI 角色，本轮不并入（避免过度扩张；如需后续再议）。
- 业务逻辑/值/onChange 行为逐一保持等价（只换渲染层）。

## P1（加新必删旧）
每处替换在**同 commit** 删掉原生 `<select>` 及其专用 className（如 `inlineSelectClass`、`workbench-creation-ai__mode-select` 等若无其它引用）。

## 回滚
组件独立文件；替换是逐处等价替换，`git revert` 即可。

## 验收门
- 五门全过（filesize/lint/typecheck/test/build）。
- Playwright 真机：图片/视频节点参数下拉、助手模式/模型、时间轴画幅——对勾在右、紧凑无冗余、贴合设计语言；截图人眼判断（R13）。
- grep 全仓 `<select` = 0（除 DesignSelect 内部）。
