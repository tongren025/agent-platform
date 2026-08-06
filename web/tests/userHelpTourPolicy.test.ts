import { describe, expect, it } from 'vitest';
import { shouldAutoStartUserGuide } from '../src/components/userHelpTourPolicy';

describe('全局新人引导自动启动策略', () => {
  it.each(['/canvas', '/canvas/', '/canvas/project-1'])(
    '%s 不自动启动，避免遮挡画布内引导',
    (pathname) => {
      expect(shouldAutoStartUserGuide(pathname, false)).toBe(false);
    },
  );

  it('其他未完成引导的页面仍可自动启动', () => {
    expect(shouldAutoStartUserGuide('/studio', false)).toBe(true);
  });

  it('已完成引导或进入手机轻制作时不自动启动', () => {
    expect(shouldAutoStartUserGuide('/studio', true)).toBe(false);
    expect(shouldAutoStartUserGuide('/mobile', false)).toBe(false);
  });
});
