// 素材媒体工具：缩略图 URL 拼接 + 加载失败的可见占位。
//
// 背景：卡片里的图片 URL 指向 /api/v1/agentapp/production/resource/...，
// 后端支持 ?w=64|128|256|512 返回等比缩放的 WebP（磁盘缓存）。
// 原图动辄 1.5~3.8MB，直接拿来当 44×44 缩略图渲染会把看板拖死。

/** 后端缩略图宽度白名单——传其他值后端会忽略并回退原图。 */
export type ThumbWidth = 64 | 128 | 256 | 512;

/** 素材路由前缀；只有走这条路由的 URL 才支持 ?w= 缩放。 */
const RESOURCE_PREFIX = '/api/v1/agentapp/production/resource/';

/**
 * 给素材 URL 追加缩略图宽度。
 * 非素材路由（外链图、/uploads/ 静态文件）原样返回，避免给不认识 ?w= 的地址加噪声。
 */
export function thumbUrl(url: string, width: ThumbWidth): string {
  if (!url || !url.startsWith(RESOURCE_PREFIX)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}w=${width}`;
}

/**
 * 图片加载失败时的处理：显示灰底占位而不是 display:none。
 *
 * 曾经这里是 `display='none'`——素材路由整体 401 时所有图被静默隐藏，
 * 看起来像"根本没有渲染图片的地方"，让一次全站图片挂掉的故障长期不可见。
 */
export function onImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.failed === '1') return; // 占位符自身再失败就别递归了
  img.dataset.failed = '1';
  img.removeAttribute('src');
  img.style.background = '#f0f0f0';
  img.style.objectFit = 'contain';
  img.title = '图片加载失败';
  // 1×1 透明底 + CSS 画一个破图标记，避免再发一次网络请求
  img.style.boxShadow = 'inset 0 0 0 1px #e0e0e0';
  img.alt = '⚠';
}
