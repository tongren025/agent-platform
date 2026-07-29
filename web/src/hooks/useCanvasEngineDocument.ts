// 第三方画布引擎的统一持久化：首次从服务端加载，后续变更防抖保存。
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';

export function useCanvasEngineDocument(engine: string) {
  const [initialContent, setInitialContent] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<Record<string, any>>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setError('');
    api.getCanvasEngine(engine)
      .then((doc) => {
        latestRef.current = doc.content || {};
        if (mountedRef.current) setInitialContent(doc.content || {});
      })
      .catch((reason: any) => {
        if (!mountedRef.current) return;
        setError(reason?.message || `${engine} 画布加载失败`);
        setInitialContent({});
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [engine]);

  const save = useCallback(async (content: Record<string, any>) => {
    latestRef.current = content;
    setSaving(true);
    setError('');
    try {
      await api.saveCanvasEngine(engine, content);
    } catch (reason: any) {
      if (mountedRef.current) setError(reason?.message || `${engine} 画布保存失败`);
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [engine]);

  const scheduleSave = useCallback((content: Record<string, any>, delay = 900) => {
    latestRef.current = content;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void save(latestRef.current);
    }, delay);
  }, [save]);

  const retry = useCallback(() => save(latestRef.current), [save]);

  return { initialContent, loading, saving, error, scheduleSave, save, retry };
}
