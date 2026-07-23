// 自由画布节点组件:数据节点(DataNode,主角)与图片节点(ImageNode)。
// 画布定位是"数据的可视化生成台"——节点是生产数据(剧本/设定/分镜/提示词),
// 核心动作是「AI 派生」;图片节点服务参考图与半自动出图(小云雀)工作流。
// 回调经 CanvasCtx 注入,节点 data 只存可序列化字段。
import { createContext, memo, useContext, useState } from 'react';
import { Handle, NodeResizer, Position, type NodeProps } from 'reactflow';
import { Button, Image, Input, Spin, Tag, Tooltip, Typography } from 'antd';
import {
  BranchesOutlined, CheckOutlined, CopyOutlined, DownloadOutlined,
  EditOutlined, EyeOutlined, FileTextOutlined, LockOutlined, RetweetOutlined, SendOutlined,
} from '@ant-design/icons';
import Markdown from 'react-markdown';
import { COLORS } from '../../theme';
import { thumbUrl } from '../../media';

const { Text } = Typography;
const { TextArea } = Input;

// 阶段标签(与看板 STAGES 对齐;色值同 Production.tsx 的 STAGE_COLORS)
export const STAGE_META: Record<string, { label: string; color: string }> = {
  idea: { label: '创意/原著', color: '#6366f1' },
  script: { label: '剧本', color: '#6366f1' },
  setting: { label: '角色·场景', color: '#8b5cf6' },
  design: { label: '视觉设计', color: '#8b5cf6' },
  storyboard: { label: '分镜', color: '#6366f1' },
  img_prompt: { label: '图片提示词', color: '#10b981' },
  vid_prompt: { label: '视频提示词', color: '#10b981' },
  img_gen: { label: '生图', color: '#f59e0b' },
  vid_gen: { label: '生视频', color: '#f59e0b' },
  final: { label: '成片', color: '#ef4444' },
};

export interface CanvasActions {
  updateNodeData: (id: string, patch: Record<string, any>) => void;
  deriveFrom: (id: string) => void;
  variantFrom: (id: string) => void;
  sendToBoard: (id: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
}

export const CanvasCtx = createContext<CanvasActions>({
  updateNodeData: () => {},
  deriveFrom: () => {},
  variantFrom: () => {},
  sendToBoard: () => {},
  updateEdgeLabel: () => {},
});

const cardStyle = (selected: boolean): React.CSSProperties => ({
  background: '#fff',
  border: selected ? `2px solid ${COLORS.iris}` : '1px solid #e2e8f0',
  borderRadius: 12,
  boxShadow: selected ? '0 4px 16px rgba(99,102,241,.18)' : '0 1px 4px rgba(0,0,0,.06)',
  transition: 'box-shadow .15s, border-color .15s',
});

function CopyContentBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip title={copied ? '已复制' : '复制内容(粘去小云雀/即梦)'}>
      <Button size="small"
        icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
        disabled={!text}
        onClick={() => {
          navigator.clipboard.writeText(text).then(() => {
            setCopied(true); setTimeout(() => setCopied(false), 1500);
          });
        }}>复制</Button>
    </Tooltip>
  );
}

// ── 数据节点(主角):一段生产数据 + AI 派生 ────────────────────

export const DataNode = memo(function DataNode({ id, data, selected }: NodeProps) {
  const actions = useContext(CanvasCtx);
  const [collapsed, setCollapsed] = useState(false);
  const [preview, setPreview] = useState(false);
  const stage = STAGE_META[data.stage];
  const barColor = stage?.color || '#cbd5e1';
  const hasContent = (data.content || '').trim().length > 0;
  const locked = !!data.locked;
  return (
    <div style={{ ...cardStyle(!!selected), width: 300, display: 'flex', overflow: 'hidden', opacity: locked ? 0.85 : 1 }}>
      <div style={{ width: 4, minHeight: '100%', background: barColor, borderRadius: '12px 0 0 12px', flexShrink: 0 }} />
      <div style={{ flex: 1, padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          {stage ? (
            <Tag color={stage.color} style={{ margin: 0, fontSize: 10, lineHeight: '16px' }}>{stage.label}</Tag>
          ) : (
            <FileTextOutlined style={{ color: COLORS.slate, fontSize: 13 }} />
          )}
          <Input
            className="nodrag"
            value={data.title || ''}
            onChange={(e) => actions.updateNodeData(id, { title: e.target.value })}
            placeholder="标题"
            size="small" variant="borderless"
            style={{ fontSize: 13, fontWeight: 600, padding: 0, flex: 1 }}
            disabled={locked}
          />
          {locked && <LockOutlined style={{ color: '#94a3b8', fontSize: 11 }} />}
          {!collapsed && hasContent && (
            <Tooltip title={preview ? '编辑' : '预览'}>
              <Button size="small" type="text"
                icon={preview ? <EditOutlined /> : <EyeOutlined />}
                style={{ fontSize: 10, padding: '0 4px', color: '#94a3b8' }}
                onClick={() => setPreview(!preview)} />
            </Tooltip>
          )}
          <Button size="small" type="text"
            style={{ fontSize: 10, padding: '0 4px', color: '#94a3b8' }}
            onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '展开' : '收起'}
          </Button>
        </div>
        {!collapsed && !preview && (
          <TextArea
            className="nodrag nowheel"
            value={data.content || ''}
            onChange={(e) => actions.updateNodeData(id, { content: e.target.value })}
            placeholder="数据内容(剧本片段/设定/分镜/提示词...)"
            autoSize={{ minRows: 3, maxRows: 10 }}
            style={{ fontSize: 12 }}
            disabled={locked}
          />
        )}
        {!collapsed && preview && (
          <div className="nodrag nowheel" style={{
            fontSize: 12, lineHeight: 1.6, maxHeight: 240, overflowY: 'auto',
            padding: '4px 0', wordBreak: 'break-word',
          }}>
            <Markdown>{data.content || ''}</Markdown>
          </div>
        )}
        {collapsed && hasContent && (
          <Text type="secondary" style={{ fontSize: 11, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {(data.content || '').slice(0, 60)}...
          </Text>
        )}
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          <Tooltip title="以此节点为源,让数字员工生成下游数据">
            <Button type="primary" size="small" icon={<BranchesOutlined />}
              loading={!!data.generating}
              onClick={() => actions.deriveFrom(id)}>
              {data.generating ? '派生中' : 'AI 派生'}
            </Button>
          </Tooltip>
          <CopyContentBtn text={data.content || ''} />
          <Tooltip title="回写为看板卡片">
            <Button size="small" icon={<SendOutlined />}
              onClick={() => actions.sendToBoard(id)}>看板</Button>
          </Tooltip>
        </div>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: '#94a3b8' }} />
      <Handle type="source" position={Position.Right} style={{ background: COLORS.iris }} />
    </div>
  );
});

// ── 分镜格节点:镜头 + 时长 + 运镜 + 画面描述 + 缩略图 ──────────

const CAMERA_TYPES = ['全景', '中景', '近景', '特写', '大特写', '鸟瞰', '仰视'];
const CAMERA_MOVES = ['static', 'dolly in', 'dolly out', 'pan left', 'pan right', 'tilt up', 'tilt down', 'truck', 'zoom in', 'zoom out', 'arc', 'crane'];

export const StoryboardNode = memo(function StoryboardNode({ id, data, selected }: NodeProps) {
  const actions = useContext(CanvasCtx);
  const [collapsed, setCollapsed] = useState(false);
  const locked = !!data.locked;
  return (
    <div style={{ ...cardStyle(!!selected), width: 320, display: 'flex', overflow: 'hidden', opacity: locked ? 0.85 : 1 }}>
      <div style={{ width: 4, minHeight: '100%', background: '#6366f1', borderRadius: '12px 0 0 12px', flexShrink: 0 }} />
      <div style={{ flex: 1, padding: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Tag color="#6366f1" style={{ margin: 0, fontSize: 10, lineHeight: '16px' }}>分镜</Tag>
          <Input className="nodrag" value={data.shotNumber || ''} placeholder="G1"
            onChange={(e) => actions.updateNodeData(id, { shotNumber: e.target.value })}
            size="small" variant="borderless" style={{ width: 50, fontSize: 13, fontWeight: 700, padding: 0 }}
            disabled={locked} />
          <Input className="nodrag" value={data.duration || ''} placeholder="3s"
            onChange={(e) => actions.updateNodeData(id, { duration: e.target.value })}
            size="small" variant="borderless" style={{ width: 36, fontSize: 12, padding: 0, color: '#8b5cf6' }}
            disabled={locked} />
          <div style={{ flex: 1 }} />
          {locked && <LockOutlined style={{ color: '#94a3b8', fontSize: 11 }} />}
          <Button size="small" type="text" style={{ fontSize: 10, padding: '0 4px', color: '#94a3b8' }}
            onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '展开' : '收起'}
          </Button>
        </div>
        {!collapsed && (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <select className="nodrag" value={data.cameraType || ''} style={selectStyle}
                onChange={(e) => actions.updateNodeData(id, { cameraType: e.target.value })}
                disabled={locked}>
                <option value="">景别</option>
                {CAMERA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className="nodrag" value={data.cameraMove || ''} style={selectStyle}
                onChange={(e) => actions.updateNodeData(id, { cameraMove: e.target.value })}
                disabled={locked}>
                <option value="">运镜</option>
                {CAMERA_MOVES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {data.url && (
              <div className="nodrag" style={{ borderRadius: 6, overflow: 'hidden', marginBottom: 6 }}>
                <Image src={thumbUrl(data.url, 512)} preview={{ src: data.url }} loading="lazy"
                  alt="" width="100%" style={{ display: 'block' }} />
              </div>
            )}
            <TextArea className="nodrag nowheel" value={data.description || ''}
              onChange={(e) => actions.updateNodeData(id, { description: e.target.value })}
              placeholder="画面描述:角色、环境、光影、情绪..."
              autoSize={{ minRows: 2, maxRows: 8 }} style={{ fontSize: 11 }}
              disabled={locked} />
          </>
        )}
        {collapsed && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            {[data.cameraType, data.cameraMove, (data.description || '').slice(0, 40)].filter(Boolean).join(' · ') || '(空)'}
          </Text>
        )}
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          <Tooltip title="AI 派生">
            <Button type="primary" size="small" icon={<BranchesOutlined />}
              loading={!!data.generating} onClick={() => actions.deriveFrom(id)}>
              {data.generating ? '派生中' : 'AI 派生'}
            </Button>
          </Tooltip>
          <CopyContentBtn text={[
            data.shotNumber && `镜号:${data.shotNumber}`,
            data.duration && `时长:${data.duration}`,
            data.cameraType && `景别:${data.cameraType}`,
            data.cameraMove && `运镜:${data.cameraMove}`,
            data.description,
          ].filter(Boolean).join('\n')} />
          <Tooltip title="回写为看板卡片">
            <Button size="small" icon={<SendOutlined />} onClick={() => actions.sendToBoard(id)}>看板</Button>
          </Tooltip>
        </div>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: '#94a3b8' }} />
      <Handle type="source" position={Position.Right} style={{ background: COLORS.iris }} />
    </div>
  );
});

const selectStyle: React.CSSProperties = {
  fontSize: 11, padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: 6,
  background: '#f8fafc', flex: 1, outline: 'none', cursor: 'pointer',
};

// ── 分组框:视觉编排用的可缩放虚线框 ───────────────────────────

export const GROUP_COLORS: { key: string; bg: string; border: string; text: string }[] = [
  { key: 'indigo', bg: 'rgba(99,102,241,0.04)', border: '#6366f1', text: '#6366f1' },
  { key: 'emerald', bg: 'rgba(16,185,129,0.05)', border: '#10b981', text: '#059669' },
  { key: 'amber', bg: 'rgba(245,158,11,0.05)', border: '#f59e0b', text: '#b45309' },
  { key: 'rose', bg: 'rgba(244,63,94,0.05)', border: '#f43f5e', text: '#e11d48' },
  { key: 'sky', bg: 'rgba(14,165,233,0.05)', border: '#0ea5e9', text: '#0284c7' },
  { key: 'slate', bg: 'rgba(100,116,139,0.04)', border: '#94a3b8', text: '#64748b' },
];

function resolveGroupColor(colorKey: string) {
  return GROUP_COLORS.find((c) => c.key === colorKey) || GROUP_COLORS[0];
}

export const GroupNode = memo(function GroupNode({ id, data, selected }: NodeProps) {
  const actions = useContext(CanvasCtx);
  const gc = resolveGroupColor(data.color || 'indigo');
  return (
    <div style={{
      width: '100%', height: '100%',
      border: selected ? `2px dashed ${gc.border}` : '2px dashed #cbd5e1',
      borderRadius: 16, background: gc.bg, padding: '6px 10px',
    }}>
      <NodeResizer color={gc.border} isVisible={!!selected} minWidth={200} minHeight={150} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Input
          className="nodrag"
          value={data.label || ''}
          onChange={(e) => actions.updateNodeData(id, { label: e.target.value })}
          placeholder="分组名称(场景/段落/集)"
          variant="borderless"
          style={{ fontWeight: 700, fontSize: 14, color: gc.text, padding: 0, background: 'transparent', flex: 1 }}
        />
        <div style={{ display: 'flex', gap: 3 }}>
          {GROUP_COLORS.map((c) => (
            <div key={c.key}
              onClick={() => actions.updateNodeData(id, { color: c.key })}
              style={{
                width: 10, height: 10, borderRadius: '50%', background: c.border,
                cursor: 'pointer', border: (data.color || 'indigo') === c.key ? '2px solid #333' : '1px solid transparent',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// ── 图片节点:参考图 / 半自动出图回传 / 可选 API 生图 ──────────

export const ImageNode = memo(function ImageNode({ id, data, selected }: NodeProps) {
  const actions = useContext(CanvasCtx);
  return (
    <div style={{ ...cardStyle(!!selected), width: 264, overflow: 'hidden' }}>
      {data.url ? (
        <div className="nodrag" style={{ borderRadius: '11px 11px 0 0', overflow: 'hidden' }}>
          <Image src={thumbUrl(data.url, 512)} preview={{ src: data.url }} loading="lazy"
            alt="" width="100%" style={{ display: 'block' }} />
        </div>
      ) : (
        <div style={{
          height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 8, background: '#f8f9fc',
        }}>
          <Spin size="small" />
          <Text type="secondary" style={{ fontSize: 11 }}>生成中...</Text>
        </div>
      )}
      <div style={{ padding: '8px 10px' }}>
        {data.prompt && (
          <Tooltip title={data.prompt}>
            <Text type="secondary" style={{
              fontSize: 11, display: 'block', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6,
            }}>
              {data.prompt}
            </Text>
          </Tooltip>
        )}
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="用同样的提示词再生成一张(需在顶栏选好生图模型)">
            <Button size="small" icon={<RetweetOutlined />}
              loading={!!data.generating}
              disabled={!data.prompt}
              onClick={() => actions.variantFrom(id)}>变体</Button>
          </Tooltip>
          <Tooltip title="回写为看板卡片">
            <Button size="small" icon={<SendOutlined />}
              disabled={!data.url}
              onClick={() => actions.sendToBoard(id)}>看板</Button>
          </Tooltip>
          {data.url && (
            <Tooltip title="下载">
              <a href={data.url} download style={{ marginLeft: 'auto' }}>
                <Button size="small" icon={<DownloadOutlined />} />
              </a>
            </Tooltip>
          )}
        </div>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: '#94a3b8' }} />
      <Handle type="source" position={Position.Right} style={{ background: COLORS.iris }} />
    </div>
  );
});

// ── 便签节点:5 色快速备忘,拍脑袋创意用 ────────────────────────

export const STICKY_COLORS: Record<string, { bg: string; border: string }> = {
  yellow: { bg: '#fef9c3', border: '#facc15' },
  pink: { bg: '#fce7f3', border: '#f472b6' },
  blue: { bg: '#dbeafe', border: '#60a5fa' },
  green: { bg: '#dcfce7', border: '#4ade80' },
  purple: { bg: '#f3e8ff', border: '#c084fc' },
};

export const StickyNote = memo(function StickyNote({ id, data, selected }: NodeProps) {
  const actions = useContext(CanvasCtx);
  const color = data.color || 'yellow';
  const c = STICKY_COLORS[color] || STICKY_COLORS.yellow;
  const locked = !!data.locked;
  return (
    <div style={{
      width: 200, minHeight: 80, padding: 10,
      background: c.bg,
      border: selected ? `2px solid ${c.border}` : `1px solid ${c.border}`,
      borderRadius: 8,
      boxShadow: selected ? `0 4px 16px ${c.border}44` : '0 1px 4px rgba(0,0,0,.06)',
      opacity: locked ? 0.85 : 1,
    }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6, alignItems: 'center' }}>
        {Object.entries(STICKY_COLORS).map(([k, v]) => (
          <div key={k}
            onClick={() => { if (!locked) actions.updateNodeData(id, { color: k }); }}
            style={{
              width: 12, height: 12, borderRadius: '50%',
              background: v.border, cursor: locked ? 'default' : 'pointer',
              border: k === color ? '2px solid #333' : '1px solid transparent',
              flexShrink: 0,
            }}
          />
        ))}
        {locked && <LockOutlined style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 11 }} />}
      </div>
      <TextArea
        className="nodrag nowheel"
        value={data.content || ''}
        onChange={e => actions.updateNodeData(id, { content: e.target.value })}
        placeholder="随手记..."
        autoSize={{ minRows: 2, maxRows: 8 }}
        variant="borderless"
        style={{ fontSize: 12, background: 'transparent', padding: 0 }}
        disabled={locked}
      />
      <Handle type="target" position={Position.Left} style={{ background: c.border }} />
      <Handle type="source" position={Position.Right} style={{ background: c.border }} />
    </div>
  );
});
