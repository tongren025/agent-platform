import { Alert, Button, Space, Spin, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

export function EngineLoading({ label }: { label: string }) {
  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
      <Space direction="vertical" align="center">
        <Spin size="large" />
        <Typography.Text type="secondary">正在加载{label}</Typography.Text>
      </Space>
    </div>
  );
}

export function EngineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  if (!message) return null;
  return (
    <Alert
      type="error"
      showIcon
      message={message}
      action={onRetry ? <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>重试保存</Button> : undefined}
    />
  );
}

export function SavingBadge({ saving }: { saving: boolean }) {
  return (
    <span style={{
      position: 'absolute', right: 16, top: 12, zIndex: 20,
      padding: '3px 9px', borderRadius: 999, fontSize: 12,
      color: saving ? '#4338ca' : '#64748b',
      background: 'rgba(255,255,255,.9)', border: '1px solid #e2e8f0',
      pointerEvents: 'none',
    }}>
      {saving ? '正在保存…' : '已启用自动保存'}
    </span>
  );
}
