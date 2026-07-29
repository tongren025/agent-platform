// 短剧画布入口：默认加载完整 Nomi 工作台，旧生产画布仅作为兼容入口保留。
import { lazy, Suspense } from 'react';
import { Button, Space, Spin, Tooltip } from 'antd';
import { ApartmentOutlined, FullscreenOutlined, RollbackOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';

const LegacyProductionCanvas = lazy(() => import('./Canvas'));

const NOMI_CANVAS_URL = '/nomi/index.html#/studio';

export default function CanvasHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const legacy = searchParams.get('legacy') === '1';

  if (legacy) {
    return (
      <main style={{ height: 'calc(100vh - 56px)', minHeight: 0, position: 'relative' }}>
        <div style={{ position: 'absolute', right: 16, top: 12, zIndex: 80 }}>
          <Button
            icon={<RollbackOutlined />}
            onClick={() => setSearchParams({})}
          >
            返回短剧画布
          </Button>
        </div>
        <Suspense
          fallback={(
            <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
              <Spin size="large" />
            </div>
          )}
        >
          <LegacyProductionCanvas embedded />
        </Suspense>
      </main>
    );
  }

  return (
    <main
      aria-label="短剧无限画布"
      style={{
        height: 'calc(100vh - 56px)',
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
        background: '#f4f1ea',
      }}
    >
      <Space
        size={6}
        style={{
          position: 'absolute',
          right: 14,
          top: 10,
          zIndex: 20,
          padding: 4,
          borderRadius: 10,
          background: 'rgba(255,255,255,.86)',
          boxShadow: '0 4px 18px rgba(15,23,42,.12)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Tooltip title="在新窗口打开完整工作台">
          <Button
            type="text"
            size="small"
            icon={<FullscreenOutlined />}
            aria-label="在新窗口打开短剧画布"
            onClick={() => window.open(NOMI_CANVAS_URL, '_blank', 'noopener,noreferrer')}
          />
        </Tooltip>
        <Button
          type="text"
          size="small"
          icon={<ApartmentOutlined />}
          onClick={() => setSearchParams({ legacy: '1' })}
        >
          旧版画布
        </Button>
      </Space>
      <iframe
        src={NOMI_CANVAS_URL}
        title="Nomi 短剧无限画布"
        allow="clipboard-read; clipboard-write; fullscreen"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          border: 0,
          background: '#f4f1ea',
        }}
      />
    </main>
  );
}
