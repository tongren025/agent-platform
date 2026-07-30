// 精品媒体验收：图片、镜头视频、整集成片共用交互，规则统一由后端返回。
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Progress, Rate, Skeleton, Space, Tag, Typography } from 'antd';
import {
  api,
  type VisualQualityProfile,
  type VisualQualityRatings,
} from '../api';
import { useResponsive } from '../hooks/useResponsive';
import { message } from '../ui';

const { Text } = Typography;

type QualityKind = 'image' | 'video' | 'final';

const cachedProfiles: Partial<Record<QualityKind, VisualQualityProfile>> = {};

interface Props {
  open: boolean;
  image?: string;
  video?: string;
  kind?: QualityKind;
  title?: string;
  busy?: boolean;
  onCancel: () => void;
  onSubmit: (ratings: VisualQualityRatings) => void | Promise<void>;
}

export default function VisualQualityReviewModal({
  open,
  image = '',
  video = '',
  kind = 'image',
  title,
  busy = false,
  onCancel,
  onSubmit,
}: Props) {
  const { isMobile } = useResponsive();
  const [profile, setProfile] = useState<VisualQualityProfile | null>(
    cachedProfiles[kind] || null,
  );
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState<VisualQualityRatings>({});

  useEffect(() => {
    if (!open) return;
    setRatings({});
    if (cachedProfiles[kind]) {
      setProfile(cachedProfiles[kind] || null);
      return;
    }
    let active = true;
    setProfile(null);
    setLoading(true);
    api.getProductionQualityProfile()
      .then(result => {
        if (!active) return;
        cachedProfiles[kind] = result[kind];
        setProfile(result[kind]);
      })
      .catch((error: any) => {
        if (active) message.error(error.message || '精品验收规则加载失败');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kind, open]);

  const result = useMemo(() => {
    if (!profile) return { complete: false, score: 0, failed: [] as string[] };
    const complete = profile.dimensions.every(item => ratings[item.key] != null);
    const score = complete
      ? profile.dimensions.reduce(
        (sum, item) => sum + (ratings[item.key] / 5) * item.weight,
        0,
      )
      : 0;
    const failed = profile.dimensions
      .filter(item => {
        const value = ratings[item.key];
        if (value == null) return false;
        const required = item.critical
          ? profile.criticalMinimumRating
          : profile.minimumRating;
        return value < required;
      })
      .map(item => item.label);
    return {
      complete,
      score: Math.round(score * 10) / 10,
      failed,
    };
  }, [profile, ratings]);

  const passed = Boolean(
    result.complete
    && profile
    && result.score >= profile.minimumScore
    && result.failed.length === 0,
  );

  return (
    <Modal
      open={open}
      title={title || '精品五维验收'}
      onCancel={onCancel}
      onOk={() => onSubmit(ratings)}
      okText="达到门槛并通过"
      cancelText="暂不通过"
      confirmLoading={busy}
      okButtonProps={{ disabled: !passed || loading }}
      width={isMobile ? 'calc(100vw - 24px)' : 720}
      style={isMobile ? { top: 12, maxWidth: 'none', margin: 0 } : undefined}
      styles={{
        body: {
          maxHeight: isMobile ? 'calc(100vh - 150px)' : 'calc(100vh - 220px)',
          overflowY: 'auto',
          paddingRight: isMobile ? 2 : undefined,
        },
      }}
      destroyOnHidden
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message={
            kind === 'image'
              ? '新图片只是候选，不会自动进入视频阶段'
              : kind === 'video'
                ? '新视频只是候选，不会自动进入整集合成'
                : '合成结果只是候选，通过整集验收后才算可交付'
          }
          description="所有维度必须评分，关键项必须单独达标；综合分不足时请关闭本窗口并选择退回原因。"
        />
        {image && (
          <div style={{ textAlign: 'center' }}>
            <Image
              src={image}
              alt="待验收图片"
              style={{ maxHeight: 280, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
            />
          </div>
        )}
        {video && (
          <div style={{ textAlign: 'center' }}>
            <video
              src={video}
              controls
              playsInline
              aria-label={kind === 'final' ? '待验收整集成片' : '待验收镜头视频'}
              style={{ maxHeight: 320, maxWidth: '100%', borderRadius: 8, background: '#000' }}
            />
          </div>
        )}
        {loading || !profile ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <>
            <div>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text strong>综合评分</Text>
                <Text strong style={{ color: passed ? '#16a34a' : '#d97706' }}>
                  {result.complete ? `${result.score} / 100` : '请完成五项评分'}
                </Text>
              </Space>
              <Progress
                percent={result.complete ? result.score : 0}
                status={passed ? 'success' : 'normal'}
                showInfo={false}
                strokeColor={passed ? '#16a34a' : '#f59e0b'}
              />
            </div>
            {profile.dimensions.map(item => {
              const required = item.critical
                ? profile.criticalMinimumRating
                : profile.minimumRating;
              const value = ratings[item.key];
              const failed = value != null && value < required;
              return (
                <section
                  key={item.key}
                  style={{
                    border: `1px solid ${failed ? '#fecaca' : '#e5e7eb'}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    background: failed ? '#fff7f7' : '#fff',
                  }}
                >
                  <Space
                    direction={isMobile ? 'vertical' : 'horizontal'}
                    size={isMobile ? 8 : 'small'}
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align={isMobile ? 'start' : 'start'}
                  >
                    <div>
                      <Space>
                        <Text strong>{item.label}</Text>
                        <Tag color={item.critical ? 'red' : 'blue'}>
                          {item.critical ? `关键项 ≥ ${required}` : `最低 ≥ ${required}`}
                        </Tag>
                        <Tag>{item.weight}%</Tag>
                      </Space>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                      </div>
                    </div>
                    <Rate
                      count={5}
                      value={value}
                      allowClear={false}
                      style={isMobile ? { fontSize: 24 } : undefined}
                      onChange={next => setRatings(current => ({
                        ...current,
                        [item.key]: next,
                      }))}
                    />
                  </Space>
                </section>
              );
            })}
            {result.complete && !passed && (
              <Alert
                type="warning"
                showIcon
                message={
                  result.failed.length
                    ? `未达标维度：${result.failed.join('、')}`
                    : `综合分需达到 ${profile.minimumScore}`
                }
                description="当前候选不能标记通过，请返回后选择最主要的退回原因。"
              />
            )}
          </>
        )}
      </Space>
    </Modal>
  );
}
