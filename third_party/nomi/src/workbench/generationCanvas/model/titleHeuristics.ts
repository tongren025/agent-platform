/**
 * v0.7.7: 节点标题"是否有意义"判断。
 *
 * 用户场景：从素材库 / Agent / 模型输出导入的素材常常带 hash 文件名
 * （如 `1e7c411e05e7cfe8d6fca2cca51cb0f3_395b49d269db4e08b18cc1ed73a24730.png`），
 * 直接当 title 展示在卡片上挡画面又难看。
 *
 * 判定为"无意义"的情况：
 *  - 纯 hash / UUID
 *  - 长 hex 序列（asset id 特征）
 *  - 太长（> 28 字符，胶囊塞不下）
 *  - 空串
 *
 * 判定为"有意义"的例子：
 *  - 「主角」「教室夜景」「rain_bgm.mp3」「海报.png」（带扩展名但短）
 */

/**
 * 判定 title 是 "机器生成的无意义字符串"（hash / UUID / 长 hex）。
 * 注意：长度不算判定依据 —— 长但人类可读的标题应该截断显示而不是隐藏。
 */
export function looksLikeGeneratedName(title: string | undefined): boolean {
  if (!title) return true
  const t = title.trim()
  if (!t) return true
  // 标准 UUID
  if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(t)) return true
  // 文件名 = 纯 hash + 可选扩展名
  if (/^[a-f0-9_-]{16,}(\.\w{1,5})?$/i.test(t)) return true
  // 含 20+ 连续 hex 字符（asset id 文件名特征）
  if (/[a-f0-9]{20,}/i.test(t)) return true
  return false
}

/**
 * 返回适合 UI 显示的标题。长度策略：
 *  - hash 类（looksLikeGeneratedName）→ fallback
 *  - 长但人类可读 → 截断到 maxLen + "…"
 *  - 短 → 原样
 */
export function getDisplayTitle(
  title: string | undefined,
  fallback: string = '未命名',
  maxLen: number = 20,
): string {
  if (!title || looksLikeGeneratedName(title)) return fallback
  const t = title.trim()
  if (t.length <= maxLen) return t
  return t.slice(0, maxLen) + '…'
}
