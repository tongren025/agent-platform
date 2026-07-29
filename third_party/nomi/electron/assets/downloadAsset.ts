// 把生成结果（本地 nomi-local 资源 或 远端 http(s) 链接）另存到用户选定位置，默认落「下载」目录。
// 统一一条下载路径：图片/视频/素材都走这里（按 url 协议取字节，不为不同类型分叉）。从 main.ts 抽出（规则 12 巨壳净减）。
import { app, BrowserWindow, dialog, net } from "electron";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { resolveProjectRelativePath } from "../projects/repository";

function sanitizeDownloadName(name: string): string {
  // 仅去掉路径分隔与文件系统非法字符（保留中英文/数字/空格/连字符等可读字符），留下安全的单段文件名。
  return name.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
}

export async function downloadAssetToDisk(
  payload: { url?: unknown; suggestedName?: unknown } | null,
): Promise<{ ok: boolean; canceled?: boolean; path?: string }> {
  const rawUrl = String(payload?.url || "").trim();
  if (!rawUrl) throw new Error("url is required");
  let bytes: Buffer;
  if (rawUrl.startsWith("nomi-local://")) {
    const url = new URL(rawUrl);
    const [projectId, ...relativeParts] = decodeURIComponent(url.pathname.replace(/^\/+/, "")).split("/");
    const filePath = resolveProjectRelativePath(projectId, relativeParts.join("/"));
    bytes = await readFile(filePath);
  } else if (/^https?:/i.test(rawUrl)) {
    const response = await net.fetch(rawUrl);
    if (!response.ok) throw new Error(`下载失败（${response.status}）`);
    bytes = Buffer.from(await response.arrayBuffer());
  } else {
    throw new Error("不支持的资源地址");
  }
  const fallbackExt = (() => {
    try {
      const ext = path.extname(new URL(rawUrl).pathname);
      return ext && ext.length <= 6 ? ext : "";
    } catch {
      return "";
    }
  })();
  let suggested = sanitizeDownloadName(String(payload?.suggestedName || ""));
  if (!suggested) suggested = `nomi-asset${fallbackExt || ".bin"}`;
  else if (!path.extname(suggested) && fallbackExt) suggested += fallbackExt;
  const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0] || undefined;
  const result = await dialog.showSaveDialog(win as BrowserWindow, {
    defaultPath: path.join(app.getPath("downloads"), suggested),
  });
  if (result.canceled || !result.filePath) return { ok: false, canceled: true };
  await writeFile(result.filePath, bytes);
  return { ok: true, path: result.filePath };
}
