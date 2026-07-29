# Nomi v0.7.7 — 标题判优显示 + 不再被 hash 文件名糊脸

发布日期：2026-05-27

## 修了什么

用户上传的素材常带 hash 文件名（例如 `1e7c411e05e7cfe8d6fca2cca51cb0f3_395b49d269db4e08b18cc1ed73a24730.png`），之前直接当成节点标题灌进黑色胶囊，**横铺在画面顶部挡住图片**。

新增 `model/titleHeuristics.ts` 做标题质量判断：
- **判定为 hash / UUID** → 直接不显示，或在卡片信息区用分类 fallback（"角色" / "场景" / "道具" / "声音"）
- **长但人类可读** → 截断到 16-20 字符 + `…`，不糊脸
- **短且可读** → 原样显示

判定规则：
1. 标准 UUID（`xxxxxxxx-xxxx-...`）
2. 纯 hex / 下划线串 ≥ 16 字符 + 可选扩展名
3. 含 20+ 连续 hex 字符（asset id 文件名特征）

## 影响范围

- **TitlePill**（节点左上角胶囊）：hash 标题 → 整个胶囊不渲染
- **CharacterCardNode / SceneCardNode / PropCardNode / AudioStripNode** 的信息区名字行：hash → 显示分类 fallback，长名字截断
- 不动 `node.title` 的存储值：原始文件名留着，方便未来"修改名字" / 搜索

## 不在范围内（保留为讨论项）

- 上传时主动改写 `node.title`（目前保留原文件名进 store） —— 如果你希望"上传就自动起一个干净的名字"，告诉我
- 标题位置（顶部 vs 底部）—— 现在保留顶部胶囊但内容收敛了，应该已经不挡画面；如果还觉得挡，可以挪到底部或选中时才显示
