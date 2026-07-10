// 自由画布节点组件:数据节点(DataNode,主角)与图片节点(ImageNode)。
// 画布定位是"数据的可视化生成台"——节点是生产数据(剧本/设定/分镜/提示词),
// 核心动作是「AI 派生」;图片节点服务参考图与半自动出图(小云雀)工作流。
// 回调经 CanvasCtx 注入,节点 data 只存可序列化字段。
import { createContext, useContext, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Button, Image, Input, Spin, Tag, Tooltip, Typography } from 'antd';
import {
  BranchesOutlined, CheckOutlined, CopyOutlined, DownloadOutlined,
  FileTextOutlined, RetweetOutlined, SendOutlined,
} from '@ant-design/icons';
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
}

export const CanvasCtx = createContext<CanvasActions>({
  updateNodeData: () => {},
  deriveFrom: () => {},
  variantFrom: () => {},
  sendToBoard: () => {},
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

export function DataNode({ id, data, selected }: NodeProps) {
  const actions = useContext(CanvasCtx);
  const stage = STAGE_META[data.stage];
  return (
    <div style={{ ...cardStyle(!!selected), width: 300, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        {stage ? (
          <Tag color={stage.color} style={{ margin: 0, fontSize: 10, lineHeight: '16px' }}>{stage.label}</Tag>
        ) : (
          <FileTextOutlined style={{ color: COLORS.slate, fontSize: 13 }} />
        )}
        {/* nodrag:标题/内容编辑时不拖动画布 */}
        <Input
          className="nodrag"
          value={data.title || ''}
          onChange={(e) => actions.updateNodeData(id, { title: e.target.value })}
          placeholder="标题"
          size="small" variant="borderless"
          style={{ fontSize: 13, fontWeight: 600, padding: 0, flex: 1 }}
        />
      </div>
      <TextArea
        className="nodrag nowheel"
        value={data.content || ''}
        onChange={(e) => actions.updateNodeData(id, { content: e.target.value })}
        placeholder="数据内容(剧本片段/设定/分镜/提示词...)"
        autoSize={{ minRows: 3, maxRows: 10 }}
        style={{ fontSize: 12 }}
      />
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
      <Handle type="target" position={Position.Left} style={{ background: '#94a3b8' }} />
      <Handle type="source" position={Position.Right} style={{ background: COLORS.iris }} />
    </div>
  );
}

// ── 图片节点:参考图 / 半自动出图回传 / 可选 API 生图 ──────────

export function ImageNode({ id, data, selected }: NodeProps) {
  const actions = useContext(CanvasCtx);
  return (
    <div style={{ ...cardStyle(!!selected), width: 264, overflow: 'hidden' }}>
      {data.url ? (
        <div className="nodrag" style={{ borderRadius: '11px 11px 0 0', overflow: 'hidden' }}>
          {/* 节点宽 264，用 512 缩略图足够；点开预览才拉原图 */}
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
}
