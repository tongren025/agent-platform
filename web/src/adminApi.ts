import type { ApiResult } from './types';

// 管理端独立后端服务。
// 开发期：由 vite 把 /api/admin 代理到 admin 服务端口（见 vite.config）。
// 生产期：admin 服务独立部署，通过 VITE_ADMIN_API_BASE 指向其地址。
const BASE = (import.meta.env.VITE_ADMIN_API_BASE as string) || '/api/admin';

const TOKEN_KEY = 'admin_token';

export const adminToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = adminToken.get();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });
  // 凭证失效：清 token 并踢回登录页
  if (res.status === 401) {
    adminToken.clear();
    if (!location.pathname.startsWith('/admin/login')) {
      location.href = '/admin/login';
    }
    throw new Error('未登录或登录已过期');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = text;
    try {
      const j = JSON.parse(text);
      message = j.detail || j.message || text;
    } catch {
      // keep raw text
    }
    throw new Error(message || `HTTP ${res.status}`);
  }
  let json: ApiResult<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error(`服务端返回了非 JSON 响应 (HTTP ${res.status})`);
  }
  if (json.code !== 200) throw new Error(json.message || `code ${json.code}`);
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

export interface AdminEmployee {
  employeeKey: string;
  name: string;
  roleProfile: string;
  deepAgent: boolean;
  defaultModelPolicy: Record<string, unknown>;
  skillRefs: string[] | null;
  toolRefs: string[] | null;
  mcpServerRefs: string[] | null;
  teamCode: string | null;
  teamName: string | null;
  hasKnowledgeBase: boolean;
  tags: string[];
  enabled: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProvider {
  name: string;
  endpoint: string;
  apiKeyMasked: string;
  apiKey?: string;
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
    request<{ token: string; username: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<{ username: string }>('/auth/me'),
  overview: () => request<AdminOverview>('/system/overview'),

  // 员工治理
  listEmployees: () => request<AdminEmployee[]>('/employees'),
  toggleEmployee: (key: string, enabled: boolean) =>
    request<AdminEmployee>(`/employees/${key}/enabled`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    }),
  deleteEmployee: (key: string) =>
    request<boolean>(`/employees/${key}`, { method: 'DELETE' }),

  // AI 服务商
  listProviders: () => request<AdminProvider[]>('/providers'),
  saveProvider: (data: { name: string; endpoint: string; apiKey: string; enabled?: boolean; models?: unknown[] }) =>
    request<AdminProvider>('/providers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProvider: (name: string, data: { name: string; endpoint: string; apiKey?: string; enabled?: boolean; models?: unknown[] }) =>
    request<AdminProvider>(`/providers/${name}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProvider: (name: string) =>
    request<boolean>(`/providers/${name}`, { method: 'DELETE' }),
  testProvider: (name: string) =>
    request<TestResult>(`/providers/${name}/test`, { method: 'POST' }),
};
