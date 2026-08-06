function normalizePathname(pathname: string): string {
  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
}

/** 画布内有自己的制作引导，禁止外层新人 Tour 在这里自动抢占交互。 */
export function shouldAutoStartUserGuide(pathname: string, hasCompletedGuide: boolean): boolean {
  const normalizedPathname = normalizePathname(pathname);
  const isCanvasPath = normalizedPathname === '/canvas' || normalizedPathname.startsWith('/canvas/');
  return !hasCompletedGuide && normalizedPathname !== '/mobile' && !isCanvasPath;
}
