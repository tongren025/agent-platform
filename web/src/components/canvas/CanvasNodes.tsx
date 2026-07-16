// 自由画布节点：把“人工可编辑、AI 可选、结果可审核”放在同一张卡上。
// 节点 data 只保存可序列化字段，所有副作用通过 CanvasCtx 回到页面执行。
import { createContext, useContext, useMemo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Button, Image, Input, Select, Spin, Tag, Tooltip, Typography } from 'antd';
import {
  BranchesOutlined, CheckOutlined, CopyOutlined, DeleteOutlined, DownloadOutlined,
  FileTextOutlined, PictureOutlined, RetweetOutlined, SendOutlined, SyncOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { COLORS } from '../../theme';
import { thumbUrl } from '../../media';

const { Text } = Typography;
const { TextArea } = Input;

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

export const REVIEW_META = {
  draft: { label: '草稿', color: '#64748b' },
  review: { label: '待审核', color: '#f59e0b' },
  approved: { label: '已通过', color: '#16a34a' },
} as const;

export interface CanvasActions {
  updateNodeData: (id: string, patch: Record<string, any>) => void;
  deriveFrom: (id: string) => void;
  imageFrom: (id: string) => void;
  videoFrom: (id: string) => void;
  variantFrom: (id: string) => void;
  syncVideo: (id: string) => void;
  duplicateNode: (id: string) => void;
  deleteNode: (id: string) => void;
  sendToBoard: (id: string) => void;
}

export const CanvasCtx = createContext<CanvasActions>({
  updateNodeData: () => {},
  deriveFrom: () => {},
  imageFrom: () => {},
  videoFrom: () => {},
  variantFrom: () => {},
  syncVideo: () => {},
  duplicateNode: () => {},
  deleteNode: () => {},
  sendToBoard: () => {},
});

function CopyContentBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip title={copied ? '已复制' : '复制到外部生成工具'}>
      <Button
        size="small"
        aria-label="复制内容"
        icon={copied ? <CheckOutlined style={{ color: '#16a34a' }} /> : <CopyOutlined />}
        disabled={!text}
        onClick={() => {
          navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          });
        }}
      />
    </Tooltip>
  );
}

function ReviewSelect({ id, value }: { id: string; value?: string }) {
  const actions = useContext(CanvasCtx);
  const current = (value || 'draft') as keyof typeof REVIEW_META;
  return (
    <Select
      className="nodrag canvas-node-review"
      aria-label="节点审核状态"
      value={current}
      variant="borderless"
      popupMatchSelectWidth={false}
      onChange={(reviewStatus) => actions.updateNodeData(id, { reviewStatus })}
      options={Object.entries(REVIEW_META).map(([key, item]) => ({
        value: key,
        label: <span style={{ color: item.color }}>● {item.label}</span>,
      }))}
    />
  );
}

function NodeTools({ id }: { id: string }) {
  const actions = useContext(CanvasCtx);
  return (
    <div className="canvas-node-tools nodrag">
      <Tooltip title="复制节点">
        <Button size="small" type="text" aria-label="复制节点" icon={<CopyOutlined />} onClick={() => actions.duplicateNode(id)} />
      </Tooltip>
      <Tooltip title="删除节点">
        <Button size="small" type="text" danger aria-label="删除节点" icon={<DeleteOutlined />} onClick={() => actions.deleteNode(id)} />
      </Tooltip>
    </div>
  );
}

export function DataNode({ id, data, selected }: NodeProps) {
  const actions = useContext(CanvasCtx);
  const stageOptions = useMemo(() => [
    { value: '', label: '自由内容' },
    ...Object.entries(STAGE_META).map(([value, meta]) => ({ value, label: meta.label })),
  ], []);

  return (
    <article className={`canvas-node canvas-data-node${selected ? ' is-selected' : ''}`}>
      <header className="canvas-node-header">
        <FileTextOutlined className="canvas-node-kind" />
        <Select
          className="nodrag canvas-stage-select"
          aria-label="节点生产阶段"
          value={data.stage || ''}
          variant="borderless"
          popupMatchSelectWidth={false}
          onChange={(stage) => actions.updateNodeData(id, { stage })}
          options={stageOptions}
        />
        <ReviewSelect id={id} value={data.reviewStatus} />
        <NodeTools id={id} />
      </header>
      <Input
        className="nodrag canvas-node-title"
        value={data.title || ''}
        onChange={(event) => actions.updateNodeData(id, { title: event.target.value })}
        placeholder="给这个步骤起个名字"
        variant="borderless"
      />
      <TextArea
        className="nodrag nowheel canvas-node-content"
        value={data.content || ''}
        onChange={(event) => actions.updateNodeData(id, { content: event.target.value })}
        placeholder="写剧本、镜头说明、提示词、修改意见……内容完全由你决定"
        autoSize={{ minRows: 4, maxRows: 12 }}
      />
      <footer className="canvas-node-actions nodrag">
        <Tooltip title="让数字员工从这里继续生成；不需要时可以完全不用">
          <Button type="primary" size="small" icon={<BranchesOutlined />} loading={!!data.generating}
            onClick={() => actions.deriveFrom(id)}>AI 派生</Button>
        </Tooltip>
        <Tooltip title="用本节点内容直接生成图片">
          <Button size="small" icon={<PictureOutlined />} disabled={!String(data.content || '').trim()}
            onClick={() => actions.imageFrom(id)}>出图</Button>
        </Tooltip>
        <Tooltip title="用本节点内容直接生成视频">
          <Button size="small" icon={<VideoCameraOutlined />} disabled={!String(data.content || '').trim()}
            onClick={() => actions.videoFrom(id)}>出视频</Button>
        </Tooltip>
        <CopyContentBtn text={data.content || ''} />
        <Tooltip title="回写到制作看板">
          <Button size="small" aria-label="回写看板" icon={<SendOutlined />} onClick={() => actions.sendToBoard(id)} />
        </Tooltip>
      </footer>
      <Handle type="target" position={Position.Left} className="canvas-handle" />
      <Handle type="source" position={Position.Right} className="canvas-handle is-source" />
    </article>
  );
}

function isVideoNode(data: Record<string, any>): boolean {
  return data.mediaKind === 'video' || /\.(mp4|webm)(\?|$)/i.test(data.url || '');
}

export function MediaNode({ id, data, selected }: NodeProps) {
  const actions = useContext(CanvasCtx);
  const isVideo = isVideoNode(data);
  const jobStatus = String(data.job?.status || '');
  const pending = Boolean(data.job?.id && !data.url && !['failed', 'completed'].includes(jobStatus));

  return (
    <article className={`canvas-node canvas-media-node${selected ? ' is-selected' : ''}`}>
      <header className="canvas-node-header canvas-media-header">
        {isVideo ? <VideoCameraOutlined className="canvas-node-kind" /> : <PictureOutlined className="canvas-node-kind" />}
        <Tag bordered={false} color={isVideo ? 'volcano' : 'gold'}>{isVideo ? (data.stage === 'final' ? '成片' : '视频') : '图片'}</Tag>
        <ReviewSelect id={id} value={data.reviewStatus || (data.url ? 'review' : 'draft')} />
        <NodeTools id={id} />
      </header>

      <Input
        className="nodrag canvas-node-title canvas-media-title"
        value={data.title || ''}
        onChange={(event) => actions.updateNodeData(id, { title: event.target.value })}
        placeholder={isVideo ? '镜头视频' : '参考图 / 生成图'}
        variant="borderless"
      />

      <div className="canvas-media-preview nodrag">
        {data.url && isVideo ? (
          <video src={data.url} controls preload="metadata" />
        ) : data.url ? (
          <Image src={thumbUrl(data.url, 512)} preview={{ src: data.url }} loading="lazy" alt={data.title || '画布图片'} />
        ) : (
          <div className="canvas-media-pending">
            {pending ? <Spin size="small" /> : <VideoCameraOutlined />}
            <Text type="secondary">{jobStatus === 'failed' ? '生成失败，请检查任务' : '视频任务处理中'}</Text>
          </div>
        )}
      </div>

      <TextArea
        className="nodrag nowheel canvas-media-prompt"
        value={data.prompt || ''}
        onChange={(event) => actions.updateNodeData(id, { prompt: event.target.value })}
        placeholder="保留生成提示词或人工修改说明"
        autoSize={{ minRows: 2, maxRows: 6 }}
      />

      <footer className="canvas-node-actions nodrag">
        {!isVideo && (
          <>
            <Tooltip title="按当前提示词重新出图">
              <Button size="small" icon={<RetweetOutlined />} loading={!!data.generating}
                disabled={!data.prompt} onClick={() => actions.variantFrom(id)}>变体</Button>
            </Tooltip>
            <Tooltip title="以这张图为首帧生成视频">
              <Button size="small" icon={<VideoCameraOutlined />} disabled={!data.url}
                onClick={() => actions.videoFrom(id)}>出视频</Button>
            </Tooltip>
          </>
        )}
        {isVideo && data.job?.id && !data.url && (
          <Button size="small" icon={<SyncOutlined />} loading={!!data.syncing}
            onClick={() => actions.syncVideo(id)}>刷新任务</Button>
        )}
        <CopyContentBtn text={data.prompt || ''} />
        <Tooltip title="回写到制作看板">
          <Button size="small" aria-label="回写看板" icon={<SendOutlined />} disabled={!data.url}
            onClick={() => actions.sendToBoard(id)} />
        </Tooltip>
        {data.url && (
          <Tooltip title="下载原文件">
            <a href={data.url} download className="canvas-download-link" aria-label="下载原文件">
              <DownloadOutlined />
            </a>
          </Tooltip>
        )}
      </footer>
      <Handle type="target" position={Position.Left} className="canvas-handle" />
      <Handle type="source" position={Position.Right} className="canvas-handle is-source" />
    </article>
  );
}

// 兼容旧导入名，历史 image 节点无需迁移文件即可继续渲染。
export const ImageNode = MediaNode;
export const VideoNode = MediaNode;
