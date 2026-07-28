/**
 * 登录失效后的全局跳转闸门。
 *
 * 背景：401 处理原本是每个请求各自 `location.href = '/login'`。
 * 赋值 href 只是「请求导航」，浏览器卸载页面前当前页仍在跑，
 * 于是页面上并发的其它请求继续拿到 401、继续重复跳转，
 * 形成每 60ms 一次的请求风暴（日志里同一路径连打十几次就是这么来的）。
 *
 * 这里用一个进程内标志把「已经在去登录页的路上」记下来：
 * 第一次 401 触发跳转，之后所有请求直接短路，不再发出也不再重复跳转。
 */

let redirecting = false;

/** 是否已经在跳登录页的路上（此时不该再发任何带凭证的请求）。 */
export function isSessionExpired(): boolean {
  return redirecting;
}

/**
 * 触发一次性的登录页跳转。重复调用只有第一次生效。
 *
 * 用 replace 而不是赋值 href：失效的页面不该留在历史栈里，
 * 否则用户重新登录后按「后退」会回到一个必然 401 的页面。
 */
export function redirectToLogin(loginPath: string): void {
  if (redirecting) return;
  if (window.location.pathname.startsWith(loginPath)) return;
  redirecting = true;
  window.location.replace(loginPath);
}

/** 供登录页在成功登录后复位，避免同一次会话里残留短路状态。 */
export function resetSessionGuard(): void {
  redirecting = false;
}
