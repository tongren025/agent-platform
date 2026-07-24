// 用户端登录态：token 存取、登录/校验/登出、权限缓存与 hasPerm() 判断。
import type { ApiResult } from './types';
import { friendlyFetch, getHttpErrorMessage, readJson } from './httpErrors';

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
    const res = await friendlyFetch('/api/v1/agentapp/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const fallback = res.status === 401 ? '用户名或密码错误' : undefined;
      throw new Error(await getHttpErrorMessage(res, fallback));
    }
    const json = await readJson<ApiResult<{ token: string; username: string; displayName: string; role: string }>>(res);
    if (json.code !== 200) throw new Error(json.message || '登录失败，请稍后重试');
    userToken.set(json.data.token);
    // 登录成功后立刻拉权限,供 Layout 按角色显隐导航
    const ready = await userAuth.check();
    if (!ready) {
      // 登录与权限缓存是一个完整动作，不能让用户带着半登录状态进入主界面。
      userToken.clear();
      throw new Error('登录验证未完成，请稍后重试');
    }
    return json.data;
  },

  check: async (): Promise<boolean> => {
    const token = userToken.get();
    if (!token) return false;
    try {
      const res = await friendlyFetch(`/api/v1/agentapp/auth/check?token=${encodeURIComponent(token)}`);
      // 仅凭证失效时清理本地登录态；服务异常或断网不误删 token。
      if (res.status === 401 || res.status === 403) { userToken.clear(); return false; }
      if (!res.ok) return false;
      const json = await readJson<ApiResult<{ username: string; role: string; permissions: string[] }>>(res);
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
