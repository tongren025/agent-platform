import { Collapse, Typography, Space } from 'antd';
import { COLORS } from '../theme';

const { Text } = Typography;

export interface Trace {
  toolName: string;
  arguments: string | null;
  result: string | null;
  success: boolean;
}

/** 工具调用轨迹列表——从 Workbench 抽出，Workbench 与工作流 RunPanel 共用。 */
export default function TraceList({ traces, label }: { traces: Trace[]; label?: string }) {
  if (!traces || traces.length === 0) return null;
  return (
    <Collapse
      size="small"
      items={[{
        key: 'traces',
        label: <Text type="secondary" style={{ fontSize: 12 }}>{label || '工具调用'} ({traces.length})</Text>,
        children: (
          <div>
            {traces.map((t, ti) => (
              <div
                key={ti}
                style={{
                  padding: '6px 0',
                  borderBottom: ti < traces.length - 1 ? '1px solid #f5f5f8' : 'none',
                }}
              >
                <Space size={4}>
                  <Text strong style={{ fontSize: 12 }}>{t.toolName}</Text>
                  <Text type={t.success ? 'success' : 'danger'} style={{ fontSize: 11 }}>
                    {t.success ? '成功' : '失败'}
                  </Text>
                </Space>
                {t.arguments && (
                  <div style={{
                    fontSize: 11, color: COLORS.slate, marginTop: 2,
                    background: '#f8f9fc', padding: '4px 8px', borderRadius: 6,
                    maxHeight: 80, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  }}>
                    {t.arguments}
                  </div>
                )}
                {t.result && (
                  <div style={{
                    fontSize: 11, color: COLORS.slate, marginTop: 2,
                    background: '#f0fdf4', padding: '4px 8px', borderRadius: 6,
                    maxHeight: 80, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  }}>
                    {t.result}
                  </div>
                )}
              </div>
            ))}
          </div>
        ),
      }]}
    />
  );
}
