// 管理端 API 封装：走 /api/admin/*（代理到 :8001），带管理端独立 token。
import type { ApiResult } from './types';
import { friendlyFetch, getHttpErrorMessage, readJson } from './httpErrors';

const BASE = (import.meta.env.VITE_ADMIN_API_BASE as string) || '/api/admin';

const TOKEN_KEY = 'admin_token';

export const adminToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, init?: RequestInit, options?: { isLogin?: boolean }): Promise<T> {
  const token = adminToken.get();
  const res = await friendlyFetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (res.status === 401) {
    if (options?.isLogin) {
      adminToken.clear();
      throw new Error(await getHttpErrorMessage(res, '用户名或密码错误'));
    }
    adminToken.clear();
    if (!location.pathname.startsWith('/admin/login')) {
      location.href = '/admin/login';
    }
    throw new Error('登录已失效，请重新登录');
  }
  if (res.status === 403) {
    throw new Error('权限不足');
  }
  if (!res.ok) {
    throw new Error(await getHttpErrorMessage(res));
  }
  const json = await readJson<ApiResult<T>>(res);
  if (json.code !== 200) throw new Error(json.message || '请求失败，请稍后重试');
  return json.data;
}

export interface AdminOverview {
  employees: number;
  employeesEnabled: number;
  employeesDisabled: number;
  teams: number;
  workflows: number;
  tools: number;
  skills: number;
  mcpServers: number;
  roleTemplates: number;
}

export interface PlatformUser {
  userId: string;
  username: string;
  displayName: string;
  role: string;
  roleName?: string;
  enabled: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface PlatformRole {
  roleCode: string;
  name: string;
  description: string;
  permissions: string[];
  builtIn: boolean;
}

export interface PermissionDef {
  code: string;
  label: string;
}

export interface AdminProvider {
  name: string;
  endpoint: string;
  apiKeyMasked: string;
  hasApiKey: boolean;
  enabled: boolean;
  models: { modelId?: string; modelName?: string }[];
  managed: boolean;
}

export interface TestResult {
  success: boolean;
  model?: string;
  reply?: string;
  error?: string;
}

export const adminApi = {
  login: (username: string, password: string) =>
    request<{ token: string; username: string; displayName: string; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, { isLogin: true }),
  me: () => request<PlatformUser & { permissions: string[] }>('/auth/me'),
  overview: () => request<AdminOverview>('/system/overview'),

  // 用户管理
  listUsers: () => request<PlatformUser[]>('/users'),
  createUser: (data: { username: string; password: string; displayName?: string; role?: string; enabled?: boolean }) =>
    request<PlatformUser>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (username: string, data: { displayName?: string; role?: string; enabled?: boolean; password?: string }) =>
    request<PlatformUser>(`/users/${username}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (username: string) =>
    request<boolean>(`/users/${username}`, { method: 'DELETE' }),

  // 角色管理
  listRoles: () => request<PlatformRole[]>('/roles'),
  listPermissions: () => request<PermissionDef[]>('/roles/permissions'),
  createRole: (data: { roleCode: string; name: string; description?: string; permissions: string[] }) =>
    request<PlatformRole>('/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (roleCode: string, data: { roleCode: string; name: string; description?: string; permissions: string[] }) =>
    request<PlatformRole>(`/roles/${roleCode}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRole: (roleCode: string) =>
    request<boolean>(`/roles/${roleCode}`, { method: 'DELETE' }),

  // AI 服务商
  listProviders: () => request<AdminProvider[]>('/providers'),
  saveProvider: (data: { name: string; endpoint: string; apiKey: string; enabled?: boolean; models?: unknown[] }) =>
    request<AdminProvider>('/providers', { method: 'POST', body: JSON.stringify(data) }),
  updateProvider: (name: string, data: { name: string; endpoint: string; apiKey?: string; enabled?: boolean; models?: unknown[] }) =>
    request<AdminProvider>(`/providers/${name}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProvider: (name: string) =>
    request<boolean>(`/providers/${name}`, { method: 'DELETE' }),
  testProvider: (name: string) =>
    request<TestResult>(`/providers/${name}/test`, { method: 'POST' }),
};
