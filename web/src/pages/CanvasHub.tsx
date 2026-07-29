// 统一画布中心：按任务选择专用引擎，并把现有生产画布作为默认入口。
import { lazy, Suspense, useMemo } from 'react';
import { Tabs, Tag, Typography } from 'antd';
import {
  ApartmentOutlined, AppstoreOutlined, BgColorsOutlined,
  BorderOutlined, DeploymentUnitOutlined, EditOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { EngineLoading } from '../components/canvas-engines/EngineState';

const ProductionCanvas = lazy(() => import('./Canvas'));
const ExcalidrawCanvas = lazy(() => import('../components/canvas-engines/ExcalidrawCanvas'));
const FabricCanvas = lazy(() => import('../components/canvas-engines/FabricCanvas'));
const ReteCanvas = lazy(() => import('../components/canvas-engines/ReteCanvas'));
const AffineCanvas = lazy(() => import('../components/canvas-engines/AffineCanvas'));
const TldrawCanvas = lazy(() => import('../components/canvas-engines/TldrawCanvas'));

const MODES = [
  {
    key: 'production',
    label: '生产画布',
    icon: <ApartmentOutlined />,
    summary: '素材血缘、AI 派生和看板回写',
    badge: 'React Flow',
  },
  {
    key: 'whiteboard',
    label: '自由白板',
    icon: <EditOutlined />,
    summary: '手绘、流程草图和分镜讨论',
    badge: 'Excalidraw',
  },
  {
    key: 'design',
    label: '视觉排版',
    icon: <BgColorsOutlined />,
    summary: '图片、字幕、形状和封面构图',
    badge: 'Fabric.js',
  },
  {
    key: 'nodes',
    label: '节点实验室',
    icon: <DeploymentUnitOutlined />,
    summary: '可执行数据流和低代码编排',
    badge: 'Rete.js',
  },
  {
    key: 'knowledge',
    label: '知识画布',
    icon: <AppstoreOutlined />,
    summary: '文档与无限画布融合',
    badge: 'AFFiNE',
  },
  {
    key: 'tldraw',
    label: 'SDK 画布',
    icon: <BorderOutlined />,
    summary: '自定义形状和应用原型',
    badge: 'tldraw',
  },
] as const;

type CanvasMode = (typeof MODES)[number]['key'];

function ModeLabel({ mode }: { mode: (typeof MODES)[number] }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {mode.icon}
      <span>{mode.label}</span>
      <Tag bordered={false} style={{ marginInlineEnd: 0, fontSize: 10 }}>{mode.badge}</Tag>
    </span>
  );
}

export default function CanvasHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('mode') as CanvasMode | null;
  const activeMode: CanvasMode = MODES.some((item) => item.key === requested) ? requested! : 'production';
  const activeMeta = MODES.find((item) => item.key === activeMode)!;

  const content = useMemo(() => {
    switch (activeMode) {
      case 'whiteboard': return <ExcalidrawCanvas />;
      case 'design': return <FabricCanvas />;
      case 'nodes': return <ReteCanvas />;
      case 'knowledge': return <AffineCanvas />;
      case 'tldraw': return <TldrawCanvas />;
      default: return <ProductionCanvas embedded />;
    }
  }, [activeMode]);

  return (
    <main aria-labelledby="canvas-hub-title" style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '2px 12px 0' }}>
        <Tabs
          activeKey={activeMode}
          onChange={(mode) => setSearchParams({ mode })}
          items={MODES.map((mode) => ({ key: mode.key, label: <ModeLabel mode={mode} /> }))}
          tabBarStyle={{ margin: 0 }}
        />
      </div>
      <div style={{
        minHeight: 36, display: 'flex', alignItems: 'center', padding: '5px 14px',
        background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
      }}>
        <Typography.Text id="canvas-hub-title" type="secondary" style={{ fontSize: 12 }}>
          {activeMeta.summary}
        </Typography.Text>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Suspense fallback={<EngineLoading label={activeMeta.label} />}>
          {content}
        </Suspense>
      </div>
    </main>
  );
}
