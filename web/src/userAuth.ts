import type { ApiResult } from './types';

const TOKEN_KEY = 'user_token';

export const userToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

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
      try { msg = JSON.parse(text).detail || text; } catch {}
      throw new Error(msg || `HTTP ${res.status}`);
    }
    const json: ApiResult<{ token: string; username: string; displayName: string; role: string }> = await res.json();
    if (json.code !== 200) throw new Error(json.message || 'login failed');
    userToken.set(json.data.token);
    return json.data;
  },

  check: async (): Promise<boolean> => {
    const token = userToken.get();
    if (!token) return false;
    try {
      const res = await fetch(`/api/v1/agentapp/auth/check?token=${encodeURIComponent(token)}`);
      if (!res.ok) { userToken.clear(); return false; }
      const json: ApiResult<any> = await res.json();
      if (json.code !== 200) { userToken.clear(); return false; }
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    userToken.clear();
  },
};
