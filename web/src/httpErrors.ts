/**
 * 浏览器请求错误的用户化处理。
 *
 * fetch 在断网、服务未启动或请求被中止时只会抛出 TypeError/AbortError，
 * 其中的英文消息不应直接展示给最终用户。
 */

const SERVICE_UNAVAILABLE_MESSAGE = '服务暂时不可用，请稍后重试。若持续出现，请联系管理员';

function isAbortError(error: unknown): boolean {
  return typeof DOMException !== 'undefined' && error instanceof DOMException
    ? error.name === 'AbortError' || error.name === 'TimeoutError'
    : error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError');
}

/** 保留原生 fetch 行为，只把浏览器级失败转换成可操作的中文提示。 */
export async function friendlyFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error('请求超时，请稍后重试');
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new Error('网络连接已断开，请检查网络后重试');
    }
    throw new Error(SERVICE_UNAVAILABLE_MESSAGE);
  }
}

function payloadMessage(payload: unknown): string {
  if (typeof payload === 'string') return payload.trim();
  if (!payload || typeof payload !== 'object') return '';

  const record = payload as Record<string, unknown>;
  const candidate = record.detail ?? record.message ?? record.error;
  if (typeof candidate === 'string') return candidate.trim();

  // FastAPI 参数校验错误通常是 detail 数组，提取其中可读的 msg。
  if (Array.isArray(candidate)) {
    return candidate
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && typeof (item as Record<string, unknown>).msg === 'string') {
          return (item as Record<string, unknown>).msg as string;
        }
        return '';
      })
      .filter(Boolean)
      .join('；');
  }
  return '';
}

function statusFallback(status: number): string {
  if (status === 400 || status === 422) return '提交的内容有误，请检查后重试';
  if (status === 401) return '登录已失效，请重新登录';
  if (status === 403) return '当前账号无权执行此操作';
  if (status === 404) return '请求的内容不存在';
  if (status === 408 || status === 504) return '请求超时，请稍后重试';
  if (status === 409) return '数据状态已发生变化，请刷新后重试';
  if (status === 413) return '上传内容过大，请压缩后重试';
  if (status === 429) return '操作过于频繁，请稍后重试';
  if (status >= 500) return SERVICE_UNAVAILABLE_MESSAGE;
  return '请求失败，请稍后重试';
}

/**
 * 优先保留后端返回的业务错误；没有业务消息时按 HTTP 状态给出用户提示。
 */
export async function getHttpErrorMessage(response: Response, fallback?: string): Promise<string> {
  const text = await response.text().catch(() => '');
  if (text) {
    try {
      const message = payloadMessage(JSON.parse(text));
      if (message) return message;
    } catch {
      const plainText = text.trim();
      const looksLikeHtml = /^<!doctype html|^<html/i.test(plainText);
      const isGenericServerError = /^(internal server error|bad gateway|service unavailable|gateway timeout)$/i.test(plainText);
      if (!looksLikeHtml && !isGenericServerError && plainText) return plainText;
    }
  }
  return fallback || statusFallback(response.status);
}

/** 成功响应也统一保护 JSON 解析，避免向用户暴露浏览器解析异常。 */
export async function readJson<T>(response: Response): Promise<T> {
  try {
    return await response.json() as T;
  } catch {
    throw new Error('服务返回异常，请稍后重试');
  }
}
