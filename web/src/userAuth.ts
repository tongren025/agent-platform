import type { ApiResult } from './types';

const TOKEN_KEY = 'user_token';
const PERMS_KEY = 'user_perms';

export const userToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(PERMS_KEY); },
};

/** 当前用户的权限列表(登录/校验时由后端返回并缓存)。 */
export function getPerms(): string[] {
  try { return JSON.parse(localStorage.getItem(PERMS_KEY) || '[]'); } catch { return []; }
}

export function hasPerm(perm: string): boolean {
  return getPerms().includes(perm);
}

export const userAuth = {
  login: async (username: string, password: string) => {
    const res = await fetch('/api/v1/agentapp/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let msg = text;
      try { msg = JSON.parse(text).detail || JSON.parse(text).message || text; } catch {}
      throw new Error(msg || `HTTP ${res.status}`);
    }
    const json: ApiResult<{ token: string; username: string; displayName: string; role: string }> = await res.json();
    if (json.code !== 200) throw new Error(json.message || 'login failed');
    userToken.set(json.data.token);
    // 登录成功后立刻拉权限,供 Layout 按角色显隐导航
    await userAuth.check();
    return json.data;
  },

  check: async (): Promise<boolean> => {
    const token = userToken.get();
    if (!token) return false;
    try {
      const res = await fetch(`/api/v1/agentapp/auth/check?token=${encodeURIComponent(token)}`);
      if (!res.ok) { userToken.clear(); return false; }
      const json: ApiResult<{ username: string; role: string; permissions: string[] }> = await res.json();
      if (json.code !== 200) { userToken.clear(); return false; }
      localStorage.setItem(PERMS_KEY, JSON.stringify(json.data.permissions || []));
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    userToken.clear();
  },
};
