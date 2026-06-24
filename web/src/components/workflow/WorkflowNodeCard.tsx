import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { NODE_META } from './nodeMeta';
import type { WorkflowNodeType } from '../../types';
import { COLORS } from '../../theme';

export interface WfNodeData {
  type: WorkflowNodeType;
  name: string;
  config: Record<string, any>;
  runStatus?: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
}

const STATUS_RING: Record<string, string> = {
  running: COLORS.iris,
  success: '#22c55e',
  failed: COLORS.rose,
  skipped: '#cbd5e1',
};

/** 画布上的自定义节点卡片。condition 节点按 config.cases + elseLabel 渲染多个出口 handle。 */
export default function WorkflowNodeCard({ data, selected }: NodeProps<WfNodeData>) {
  const meta = NODE_META[data.type] || NODE_META.agent;
  const isCondition = data.type === 'condition';
  const hasTarget = data.type !== 'start';
  const hasDefaultSource = data.type !== 'end' && !isCondition;

  const cases: any[] = isCondition ? (data.config?.cases || []) : [];
  const elseLabel = data.config?.elseLabel || 'else';
  const handles = isCondition
    ? [...cases.map((c) => c.label || 'case'), elseLabel]
    : [];

  const ring = data.runStatus ? STATUS_RING[data.runStatus] : undefined;

  return (
    <div
      style={{
        minWidth: 168, borderRadius: 12, background: '#fff',
        border: `1px solid ${selected ? meta.color : '#e8ecf4'}`,
        boxShadow: ring
          ? `0 0 0 2px ${ring}, 0 4px 14px rgba(0,0,0,0.06)`
          : selected ? `0 4px 18px ${meta.color}33` : '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      {hasTarget && <Handle type="target" position={Position.Left} style={{ background: meta.color, width: 9, height: 9 }} />}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', background: `${meta.color}12`, borderBottom: '1px solid #f0f1f5',
      }}>
        <span style={{ fontSize: 14 }}>{meta.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.name || meta.label}
          </div>
          <div style={{ fontSize: 10, color: COLORS.slate }}>{meta.label}</div>
        </div>
        {data.runStatus === 'running' && (
          <span style={{ fontSize: 10, color: COLORS.iris }}>运行中</span>
        )}
      </div>

      <div style={{ padding: '8px 12px', fontSize: 11, color: COLORS.slate, minHeight: 18 }}>
        {nodeSummary(data)}
      </div>

      {hasDefaultSource && (
        <Handle type="source" position={Position.Right} style={{ background: meta.color, width: 9, height: 9 }} />
      )}

      {isCondition && (
        <div style={{ padding: '0 12px 8px' }}>
          {handles.map((h, i) => (
            <div key={h + i} style={{ position: 'relative', height: 22, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{
                fontSize: 10, color: h === elseLabel ? COLORS.slate : meta.color,
                background: '#f8f9fc', padding: '1px 6px', borderRadius: 5, marginRight: 6,
              }}>
                {h}
              </span>
              <Handle
                id={h}
                type="source"
                position={Position.Right}
                style={{ position: 'relative', transform: 'none', top: 'auto', background: meta.color, width: 9, height: 9 }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function nodeSummary(data: WfNodeData): string {
  const c = data.config || {};
  switch (data.type) {
    case 'agent': return c.employeeKey ? `员工：${c.employeeKey}` : '未选择员工';
    case 'knowledge': return c.employeeKey ? `检索：${c.employeeKey}` : '未选择员工';
    case 'tool': return c.toolCode ? `工具：${c.toolCode}` : '未选择工具';
    case 'condition': return `${(c.cases || []).length} 个条件分支`;
    case 'template': return c.template ? '已配置模板' : '空模板';
    case 'start': return `${(c.inputs || []).length} 个输入字段`;
    case 'end': return c.outputTemplate ? '已配置输出' : '默认输出';
    default: return '';
  }
}
