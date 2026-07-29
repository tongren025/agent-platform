import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Spin } from 'antd';

type CanvasMount = { unmount: () => void };
type CanvasModule = {
  mountAgentStudioCanvas: (container: HTMLElement) => CanvasMount;
};

export default function CanvasHub() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let disposed = false;
    let mounted: CanvasMount | undefined;

    const modulePath = '/agent-canvas/agent-canvas.js';
    void import(/* @vite-ignore */ modulePath)
      .then((module: CanvasModule) => {
        if (disposed || !hostRef.current) return;
        mounted = module.mountAgentStudioCanvas(hostRef.current);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        if (!disposed) {
          setLoading(false);
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      });

    return () => {
      disposed = true;
      mounted?.unmount();
    };
  }, [retryKey]);

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="画布加载失败"
        description={error}
        action={<Button onClick={() => { setError(''); setRetryKey((value) => value + 1); }}>重试</Button>}
      />
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 56px)', minHeight: 640, position: 'relative' }}>
      <div ref={hostRef} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <Spin size="large" tip="正在加载短剧画布" />
        </div>
      )}
    </div>
  );
}
