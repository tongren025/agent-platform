import { useCallback, useEffect, useState } from 'react';
import {
  Button, Drawer, Empty, Image, Input, Select, Space, Spin, Tag, Tooltip, Typography,
} from 'antd';
import {
  CheckOutlined, CloseOutlined, EditOutlined, PictureOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { useInputHabit } from '../hooks/useInputHabit';
import { message } from '../ui';
import { useResponsive } from '../hooks/useResponsive';

const { Text, Title } = Typography;
const { TextArea } = Input;

const STAGE_LABELS: Record<string, string> = {
  idea: '原始故事', script: '故事稿', setting: '角色·场景', design: '视觉参考',
  storyboard: '故事画面规划', img_prompt: '画面生成说明', vid_prompt: '视频动作说明',
  img_gen: '生成画面', vid_gen: '生成视频', final: '剪辑与交付',
};

// 导演生图最终只能安全回填到这两个阶段；设计/设定卡不可展示付费生成入口。
const IMAGE_EDITABLE_STAGES = new Set(['img_prompt', 'storyboard']);

const REVIEW_REASON_OPTIONS = [
  { value: 'tone_off', label: '基调偏差' },
  { value: 'character_drift', label: '角色走形' },
  { value: 'composition_mismatch', label: '构图不符分镜' },
  { value: 'lighting_wrong', label: '光影错误' },
  { value: 'anatomy_broken', label: '结构崩坏' },
  { value: 'other', label: '其他' },
];

export type CardItem = {
  card_id: string;
  project_id: string;
  stage: string;
  title: string;
  content: string;
  prompts: string[];
  images: string[];
  videos: string[];
  metadata: Record<string, any>;
  status: string;
  episode: number | null;
  shot_number: number;
};

type Props = {
  open: boolean;
  card: CardItem | null;
  projectId: string;
  onClose: () => void;
  onCardUpdated: () => void;
  mediaModels?: {
    id: string;
    name: string;
    pricing?: any;
    isFree?: boolean;
    recommended?: boolean;
    recommendationReason?: string;
  }[];
};

export default function CardDetailDrawer({
  open, card, projectId, onClose, onCardUpdated, mediaModels,
}: Props) {
  const { isMobile } = useResponsive();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const [genModel, setGenModel] = useInputHabit('director.card-image-model', '');
  const [generating, setGenerating] = useState(false);

  const [reviewBusy, setReviewBusy] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useInputHabit('director.review-reason', 'tone_off');
  const [rejectNote, setRejectNote] = useState('');

  const canEditPrompt = card ? IMAGE_EDITABLE_STAGES.has(card.stage) : false;
  const currentPrompt = card?.prompts?.[0] || card?.content || '';
  const currentImage = card?.metadata?.active_image || card?.images?.slice(-1)[0] || '';
  const reviews: any[] = (card?.metadata?.image_reviews || []).filter(
    (r: any) => String(r.image || '') === currentImage,
  );
  const latestReview = reviews.length ? reviews[reviews.length - 1] : null;

  useEffect(() => {
    if (!mediaModels?.length) return;
    if (!mediaModels.some(model => model.id === genModel)) {
      setGenModel((mediaModels.find(model => model.recommended) ?? mediaModels[0]).id);
    }
  }, [genModel, mediaModels, setGenModel]);

  const resetState = useCallback(() => {
    setEditing(false);
    setDraft('');
    setSaving(false);
    setGenerating(false);
    setReviewBusy(false);
    setRejectMode(false);
    setRejectReason('tone_off');
    setRejectNote('');
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const startEdit = () => {
    setDraft(currentPrompt);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft('');
  };

  const savePrompt = async () => {
    if (!card || !draft.trim() || draft.trim() === currentPrompt.trim()) return;
    setSaving(true);
    try {
      await api.updateDirectorImagePrompt(projectId, card.card_id, { prompt: draft.trim() });
      message.success('提示词已保存');
      setEditing(false);
      setDraft('');
      onCardUpdated();
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const regenerateImage = async () => {
    if (!card || !genModel) return;
    setGenerating(true);
    try {
      await api.generateDirectorImage(projectId, card.card_id, {
        model: genModel,
        prompt: currentPrompt,
        resolution: '1K',
      });
      message.success('图片已重新生成');
      onCardUpdated();
    } catch (error: any) {
      message.error(error.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const submitReview = async (verdict: 'pass' | 'reject') => {
    if (!card || !currentImage || reviewBusy) return;
    if (verdict === 'reject' && !rejectReason) return;
    setReviewBusy(true);
    try {
      await api.reviewCardImage(projectId, card.card_id, {
        verdict,
        image: currentImage,
        ...(verdict === 'reject' ? { reason: rejectReason, note: rejectNote.trim() } : {}),
      });
      message.success(verdict === 'pass' ? '已通过' : '已退回');
      setRejectMode(false);
      setRejectReason('tone_off');
      setRejectNote('');
      onCardUpdated();
    } catch (error: any) {
      message.error(error.message || '审核提交失败');
    } finally {
      setReviewBusy(false);
    }
  };

  if (!card) return null;

  const promptDirty = draft.trim() !== currentPrompt.trim();
  const busy = saving || generating || reviewBusy;

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={card.title || `${STAGE_LABELS[card.stage] || card.stage} 卡片`}
      width={isMobile ? '100%' : 520}
      destroyOnHidden
      extra={
        <Tag color={card.status === 'done' ? 'success' : card.status === 'review' ? 'warning' : 'default'}>
          {card.status === 'done' ? '完成' : card.status === 'review' ? '待确认或返工' : card.status}
        </Tag>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 阶段 & 位置 */}
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>阶段</Text>
          <div>
            <Tag>{STAGE_LABELS[card.stage] || card.stage}</Tag>
            {card.episode != null && <Tag>EP{card.episode}</Tag>}
            {card.shot_number > 0 && <Tag>G{card.shot_number}</Tag>}
          </div>
        </div>

        {/* 图片预览 */}
        {currentImage ? (
          <div>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 6, display: 'block' }}>当前图片</Text>
            <Image
              src={currentImage}
              alt={card.title}
              style={{ borderRadius: 8, maxHeight: 360, objectFit: 'contain', width: '100%' }}
              fallback="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='150'><rect fill='%23f0f0f0' width='200' height='150'/><text x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'>加载失败</text></svg>"
            />
            {latestReview && (
              <div style={{ marginTop: 8 }}>
                <Tag color={latestReview.verdict === 'pass' ? 'success' : 'error'}>
                  {latestReview.verdict === 'pass' ? '已通过' : '已退回'}
                </Tag>
                {latestReview.reason && (
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                    {REVIEW_REASON_OPTIONS.find(o => o.value === latestReview.reason)?.label || latestReview.reason}
                    {latestReview.note ? ` — ${latestReview.note}` : ''}
                  </Text>
                )}
              </div>
            )}
          </div>
        ) : card.images?.length === 0 && canEditPrompt ? (
          <div style={{ padding: '32px 0', textAlign: 'center', background: '#fafafa', borderRadius: 8 }}>
            <PictureOutlined style={{ fontSize: 32, color: '#ccc' }} />
            <div style={{ marginTop: 8, color: '#999' }}>还没有图片，编辑提示词后生成</div>
          </div>
        ) : null}

        {/* 历史图片 */}
        {card.images.length > 1 && (
          <div>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 6, display: 'block' }}>历史图片 ({card.images.length})</Text>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {card.images.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  alt={`版本 ${i + 1}`}
                  width={64}
                  height={64}
                  style={{ borderRadius: 6, objectFit: 'cover', border: url === currentImage ? '2px solid #6366f1' : '2px solid transparent' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 提示词 */}
        {canEditPrompt && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>提示词</Text>
              {!editing && (
                <Button type="text" size="small" icon={<EditOutlined />} onClick={startEdit} disabled={busy}>
                  编辑
                </Button>
              )}
            </div>
            {editing ? (
              <>
                <TextArea
                  value={draft}
                  autoSize={{ minRows: 4, maxRows: 12 }}
                  maxLength={4000}
                  onChange={e => setDraft(e.target.value)}
                  disabled={saving}
                />
                <Space style={{ marginTop: 8 }}>
                  <Button
                    size="small" type="primary" icon={<CheckOutlined />}
                    loading={saving}
                    disabled={!promptDirty || !draft.trim()}
                    onClick={savePrompt}
                  >
                    保存
                  </Button>
                  <Button size="small" icon={<CloseOutlined />} disabled={saving} onClick={cancelEdit}>
                    取消
                  </Button>
                </Space>
              </>
            ) : (
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#334155', background: '#f8fafc', padding: '10px 12px', borderRadius: 8, maxHeight: 200, overflow: 'auto' }}>
                {currentPrompt || '暂无提示词'}
              </div>
            )}
          </div>
        )}

        {/* 正文 */}
        {card.content && !canEditPrompt && (
          <div>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 6, display: 'block' }}>内容</Text>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#334155', background: '#f8fafc', padding: '10px 12px', borderRadius: 8, maxHeight: 200, overflow: 'auto' }}>
              {card.content}
            </div>
          </div>
        )}

        {/* 重新生成 */}
        {canEditPrompt && currentPrompt && (
          <div>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 6, display: 'block' }}>
              {currentImage ? '重新生成图片' : '生成图片'}
            </Text>
            <Space.Compact style={{ width: '100%' }}>
              <Select
                style={{ flex: 1 }}
                placeholder="选择模型"
                value={genModel || undefined}
                onChange={setGenModel}
                options={mediaModels?.map(m => ({
                  value: m.id,
                  label: `${m.recommended ? '推荐 · ' : ''}${m.name} · ${m.isFree ? '免费' : '付费'}`,
                })) || []}
                loading={!mediaModels}
              />
              <Tooltip title={!genModel ? '请先选择模型' : editing && promptDirty ? '请先保存提示词' : ''}>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  loading={generating}
                  disabled={!genModel || busy || (editing && promptDirty)}
                  onClick={regenerateImage}
                >
                  {currentImage ? '重新生成' : '生成'}
                </Button>
              </Tooltip>
            </Space.Compact>
          </div>
        )}

        {/* 审核 */}
        {currentImage && (
          <div>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 6, display: 'block' }}>审核</Text>
            {!rejectMode ? (
              <Space>
                <Button
                  icon={<CheckOutlined />}
                  type={latestReview?.verdict === 'pass' ? 'primary' : 'default'}
                  loading={reviewBusy}
                  disabled={busy}
                  onClick={() => submitReview('pass')}
                >
                  通过
                </Button>
                <Button
                  danger icon={<CloseOutlined />}
                  disabled={busy}
                  onClick={() => setRejectMode(true)}
                >
                  退回
                </Button>
              </Space>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#fff7ed', padding: 12, borderRadius: 8 }}>
                <Select
                  placeholder="选择退回原因"
                  value={rejectReason || undefined}
                  options={REVIEW_REASON_OPTIONS}
                  onChange={setRejectReason}
                />
                <TextArea
                  value={rejectNote}
                  maxLength={500}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  placeholder="补充说明（可选）"
                  onChange={e => setRejectNote(e.target.value)}
                />
                <Space>
                  <Button
                    danger type="primary" size="small"
                    loading={reviewBusy}
                    disabled={!rejectReason}
                    onClick={() => submitReview('reject')}
                  >
                    确认退回
                  </Button>
                  <Button size="small" onClick={() => { setRejectMode(false); setRejectReason(''); setRejectNote(''); }}>
                    取消
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
