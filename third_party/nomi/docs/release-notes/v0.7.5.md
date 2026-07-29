# Nomi v0.7.5 — UX 审计修复（新手 onboarding + power user 快捷键）

发布日期：2026-05-27
依据：3 类极致用户旅程审计（新手 / 50+ 节点 / 暴力测试）

## 修了什么（4 个明显问题）

### 1. 没配模型时的 composer 引导
之前：composer 模型 dropdown 显示灰色 "没有可用图像模型" 文本，用户不知道下一步做什么。  
现在：变成醒目的 **"没有可用图像模型 ｜ 去配置 →"** 按钮，点击直接弹出模型接入页（dispatch `nomi-open-model-catalog` 事件）。

### 2. 生成失败错误友好化
之前：`generationRunController` 错误文案只有"生成失败"或原始 API 错。  
现在：`enrichGenerationError` 识别常见错误并加 hint：
- 401 / unauthorized / api key → "→ 请在「模型接入」页检查 API Key"
- quota / rate limit / 429 → "→ 服务商配额或限流"
- timeout / network → "→ 网络问题"
- content policy → "→ 提示词被安全策略拦截"

### 3. Cmd+A 全选
之前：Cmd+C/X/V/Z/Y 都有，独缺 Cmd+A。  
现在：Cmd+A 全选当前分类的所有节点。

### 4. TitlePill 性能优化
之前：TitlePill 每个实例独立 filter+sort 所有 shots 节点（n × O(n log n) 每次 state 变）。  
现在：复用 v0.7.2 建的 WeakMap 缓存 hook + React.memo。补完上一版没改完的地方。

## 用户旅程审计 — 仍待讨论的项目

下面这些有意义但需要决定方向，没擅自改：

**新手向**
- 首次打开是否做引导 tour？
- 新建项目要不要弹出起名对话框，还是保持自动名？
- 拖到时间轴的小 grip 按钮要不要加文字提示 / 替换成更明显的"+ 添加到时间轴"按钮？

**Power user 向**
- 画布上 TitlePill 双击重命名（当前要走 sidebar 右键）？
- 节点搜索 by name？
- 撤销历史可视化面板？
- 批量改属性对话框（选中 10 个节点 → 一次性改模型 / 参数 / prompt 前缀）？

**安全 / 暴力测试向**
- 上传大文件改 electron IPC 写盘（v0.8 议题）
- 超长 prompt 截断 / 警告？
- 删除被引用节点时的提示（"该角色被 5 个道具卡 / 8 个分镜引用"）？

## 升级

v0.7.x → v0.7.5 数据兼容。
