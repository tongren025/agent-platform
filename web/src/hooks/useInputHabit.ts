// 用户输入习惯与快捷键偏好持久化 Hook
import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

const PREFIX = 'agent-platform:input-habit:v1:';

function storageKey(key: string): string {
  return `${PREFIX}${key}`;
}

export function readInputHabit<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    if (
      fallback != null
      && parsed != null
      && typeof fallback === 'object'
      && !Array.isArray(fallback)
    ) {
      return (
        typeof parsed === 'object' && !Array.isArray(parsed)
          ? { ...fallback, ...parsed }
          : fallback
      ) as T;
    }
    if (Array.isArray(fallback)) return (Array.isArray(parsed) ? parsed : fallback) as T;
    return typeof parsed === typeof fallback ? parsed as T : fallback;
  } catch {
    return fallback;
  }
}

export function writeInputHabit<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    // 隐私模式、存储配额不足等情况不应影响主流程。
  }
}

export function clearInputHabit(key: string): void {
  try {
    window.localStorage.removeItem(storageKey(key));
  } catch {
    // 同上：习惯保存是增强能力，不阻断用户操作。
  }
}

/**
 * 保存非敏感输入偏好或草稿。
 *
 * 调用方必须显式选择要接入的字段；密码、API Key、验证码、文件和危险确认值
 * 不得传入本 Hook。写入带短防抖，连续输入不会频繁触发 localStorage。
 */
export function useInputHabit<T>(key: string, fallback: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readInputHabit(key, fallback));

  useEffect(() => {
    const timer = window.setTimeout(() => writeInputHabit(key, value), 180);
    return () => window.clearTimeout(timer);
  }, [key, value]);

  return [value, setValue];
}
