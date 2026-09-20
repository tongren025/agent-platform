/**
 * 按用户端和管理端隔离登录失效状态，阻止本端重复请求与重定向。
 * 页面导航完成前，并发请求仍可能返回 401；每端只触发一次登录跳转。
 */
export type SessionScope = 'user' | 'admin';

const loginPaths: Record<SessionScope, string> = {
  user: '/login',
  admin: '/admin/login',
};
const expiredSessions = new Set<SessionScope>();

/** 当前端凭证是否已失效；另一端的独立会话不受影响。 */
export function isSessionExpired(scope: SessionScope): boolean {
  return expiredSessions.has(scope);
}

/** 标记本端失效并跳到对应登录页；已在登录页时只封锁后续请求。 */
export function redirectToLogin(scope: SessionScope): void {
  if (expiredSessions.has(scope)) return;
  expiredSessions.add(scope);
  const loginPath = loginPaths[scope];
  const pathname = window.location.pathname;
  if (pathname === loginPath || pathname.startsWith(`${loginPath}/`)) return;
  // 避免重新登录后通过“后退”再次进入已失效的页面。
  window.location.replace(loginPath);
}

/** 本端成功登录后复位，保留另一端的失效状态。 */
export function resetSessionGuard(scope: SessionScope): void {
  expiredSessions.delete(scope);
}
