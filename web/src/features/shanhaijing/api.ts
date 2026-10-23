/**
 * 山海经专栏 HTTP API 请求接口。
 */
import { BASE, request } from '@/shared/api/client';
import type { ShanhaiCategoryInfo, ShanhaiCharacter, ShanhaiEdition, ShanhaiCitation, WebImageResult } from './types';

export const shanhaijingApi = {
  /** 查询原典版本与卷目录。 */
  listEditions: (signal?: AbortSignal) =>
    request<ShanhaiEdition[]>('/shanhaijing/editions', { signal }),
  /** 读取版本详情及书影资源状态。 */
  getEdition: (id: string, signal?: AbortSignal) =>
    request<ShanhaiEdition>(`/shanhaijing/editions/${encodeURIComponent(id)}`, { signal }),
  /** 原文出处独立于角色编辑接口保存。 */
  getCitations: (id: string, signal?: AbortSignal) =>
    request<ShanhaiCitation[]>(`/shanhaijing/characters/${encodeURIComponent(id)}/citations`, {
      signal,
    }),
  /** 获取山海经分类与山系概览 */
  getCategories: () =>
    request<ShanhaiCategoryInfo>('/shanhaijing/categories'),

  /** 查询角色列表 */
  listCharacters: (params?: { category?: string; mountain?: string; query?: string }) => {
    const sp = new URLSearchParams();
    if (params?.category) sp.set('category', params.category);
    if (params?.mountain) sp.set('mountain', params.mountain);
    if (params?.query) sp.set('query', params.query);
    const qs = sp.toString();
    return request<ShanhaiCharacter[]>(`/shanhaijing/characters${qs ? `?${qs}` : ''}`);
  },

  /** 查询单个角色 */
  getCharacter: (id: string) =>
    request<ShanhaiCharacter>(`/shanhaijing/characters/${encodeURIComponent(id)}`),

  /** 创建角色 */
  createCharacter: (data: Partial<ShanhaiCharacter> & { auto_fetch_images?: boolean }) =>
    request<ShanhaiCharacter>('/shanhaijing/characters', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 更新角色 */
  updateCharacter: (id: string, data: Partial<ShanhaiCharacter>) =>
    request<ShanhaiCharacter>(`/shanhaijing/characters/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** 删除角色 */
  deleteCharacter: (id: string) =>
    request<{ deleted: string; name: string }>(`/shanhaijing/characters/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  /** 为指定角色从网络抓取 1~3 张图片 */
  fetchWebImagesForCharacter: (id: string, count = 3, applyToCharacter = true) =>
    request<{
      character_id: string;
      name: string;
      retrieved_count: number;
      images: WebImageResult[];
      character: ShanhaiCharacter;
    }>(
      `/shanhaijing/characters/${encodeURIComponent(id)}/fetch-web-images?count=${count}&apply_to_character=${applyToCharacter}`,
      { method: 'POST' },
    ),

  /** 在线检索 1~3 张网络图片 */
  searchWebImages: (query: string, count = 3) =>
    request<{
      query: string;
      count: number;
      images: WebImageResult[];
    }>(`/shanhaijing/search-web-images?query=${encodeURIComponent(query)}&count=${count}`),

  /** 重置回预设山海经经典角色 */
  resetDefaults: () =>
    request<{ message: string; count: number }>('/shanhaijing/reset-defaults', {
      method: 'POST',
    }),
};

/**
 * 转换图片为稳定代理地址，避免跨域防盗链导致图片破损。
 */
export function toSafeImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('/')) return url;
  return `${BASE}/shanhaijing/image-proxy?url=${encodeURIComponent(url)}`;
}
