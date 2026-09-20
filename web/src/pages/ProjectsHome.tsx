// 项目入口：以真实素材、成片状态和下一步组织制作，保留故事阅读与专业流程入口。
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Tag,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  EyeOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { api, type ProductionGoal } from '../api';
import { useInputHabit } from '../hooks/useInputHabit';
import { thumbUrl, onImageError } from '../media';
import { message } from '../ui';
import { MEMORY_SWORDSMAN_STARTER } from '../storyStarters';
import {
  extractOneLineStory,
  friendlyCopy,
  friendlyProjectName,
  projectTypePresentation,
} from '../storyPresentation';
import './StoryProjects.css';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

interface StoryPreview {
  available_images: number;
  approved_images?: number;
  expected_images: number;
  missing_images: number;
  preview_images: string[];
  video_count: number;
  has_final_video: boolean;
}

interface ProjectListItem {
  project_id: string;
  name: string;
  description: string;
  source_type: string;
  source_content?: string;
  updated_at: string;
  episode_count?: number;
  episode_duration_seconds?: number;
  pinned?: boolean;
  settings?: Record<string, any>;
  stats?: {
    story_preview?: StoryPreview;
    readiness?: {
      overall_progress?: number;
      spec_ready?: number;
      blockers?: number;
      next_action?: string;
    };
  };
}

interface NewProjectForm {
  name: string;
  description: string;
  sourceType: string;
  sourceContent: string;
  episodeCount: number;
  episodeDurationSeconds: number;
  aspectRatio: string;
  visualStyle: string;
  productionGoal: ProductionGoal;
}

const EMPTY_FORM: NewProjectForm = {
  name: '',
  description: '',
  sourceType: 'idea',
  sourceContent: '',
  episodeCount: 1,
  episodeDurationSeconds: 180,
  aspectRatio: '9:16',
  visualStyle: '',
  productionGoal: 'final',
};

const PRODUCTION_GOAL_OPTIONS: { value: ProductionGoal; label: string; description: string }[] = [
  { value: 'final', label: '完整成片', description: '走完剧本、分镜、画面、视频、审片和成片交付。' },
  { value: 'images', label: '先做镜头图片', description: '先完成可审核的镜头画面，确认视觉方向后再进入视频。' },
  { value: 'storyboard', label: '先完成文字分镜', description: '先把剧情、角色、镜头和提示词规格定稿。' },
];

function ProjectCover({
  images,
  available,
  known,
  title,
}: {
  images: string[];
  available: number;
  known: boolean;
  title: string;
}) {
  const visible = images.filter(Boolean).slice(0, 4);
  if (!visible.length) {
    return (
      <div className="story-project-cover story-project-cover--empty">
        <VideoCameraOutlined aria-hidden />
        <strong>{title}</strong>
        <span>{available > 0
          ? `已有 ${available} 张画面 · 打开项目查看`
          : known ? '画面待生成 · 从故事开始制作' : '打开项目查看素材'}</span>
      </div>
    );
  }
  return (
    <div className={`story-project-cover story-project-cover--${Math.min(visible.length, 4)}`}>
      {visible.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={thumbUrl(image, 512)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={onImageError}
        />
      ))}
      <span className="story-project-cover__count">
        <PictureOutlined /> {available} 张剧情画面
      </span>
    </div>
  );
}

function resolveStoryPreview(project: ProjectListItem): StoryPreview | undefined {
  if (project.stats?.story_preview) return project.stats.story_preview;
  const formalAssets = project.settings?.formal_image_assets;
  if (!Array.isArray(formalAssets) || formalAssets.length === 0) return undefined;
  const images = formalAssets.map((asset: string) => (
    asset.startsWith('/')
      ? asset
      : `/api/v1/agentapp/production/resource/production/${project.project_id}/${asset.replace(/^[/\\]+/, '')}`
  ));
  const expected = Number(project.settings?.shot_count) || images.length;
  return {
    available_images: images.length,
    approved_images: Math.min(Number(project.settings?.approved_image_count) || 0, images.length),
    expected_images: expected,
    missing_images: Math.max(expected - images.length, 0),
    preview_images: images.slice(0, 4),
    video_count: 0,
    has_final_video: false,
  };
}


function projectNextStep(project: ProjectListItem, preview?: StoryPreview): string {
  if (preview?.has_final_video) return '查看成片，确认交付版本';
  const nextAction = friendlyCopy(project.stats?.readiness?.next_action || '');
  // 镜头卡完成不能代替成片文件；成片状态始终以 story_preview 的真实媒体为准。
  if (nextAction.includes('成片已经')) return '检查剪辑并导出成片';
  if (nextAction) return nextAction;
  if (preview?.video_count) return '检查镜头视频，继续剪辑与审片';
  if (preview?.available_images) return '确认画面，继续生成镜头视频';
  return '完善故事与剧本，确定第一个镜头';
}

function projectUpdatedLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getMonth() + 1}月${date.getDate()}日更新`;
}

export default function ProjectsHome() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useInputHabit<NewProjectForm>('projects.create', { ...EMPTY_FORM });

  const loadProjects = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setProjects(await api.listProjects());
    } catch {
      setLoadError('暂时无法读取项目，请检查服务后重试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadProjects(); }, []);

  const orderedProjects = useMemo(() => [...projects].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return String(b.updated_at || '').localeCompare(String(a.updated_at || ''));
  }), [projects]);

  const projectSummary = useMemo(() => {
    const previews = projects.map(resolveStoryPreview);
    return {
      withImages: previews.filter(preview => (preview?.available_images || 0) > 0).length,
      withFinalVideo: previews.filter(preview => preview?.has_final_video).length,
    };
  }, [projects]);

  const openCreate = () => {
    setCreateStep(0);
    setCreateOpen(true);
  };

  const nextCreateStep = () => {
    if (!form.name.trim()) {
      message.warning('先给故事起一个名字');
      return;
    }
    if (!form.description.trim()) {
      message.warning('请先用一句话说清这个故事讲什么');
      return;
    }
    setCreateStep(1);
  };

  const applyMemorySwordsmanStarter = () => {
    setForm(current => ({
      ...current,
      name: MEMORY_SWORDSMAN_STARTER.name,
      description: MEMORY_SWORDSMAN_STARTER.oneLine,
      sourceType: 'gc',
      sourceContent: MEMORY_SWORDSMAN_STARTER.sourceContent,
      episodeCount: 1,
      episodeDurationSeconds: 30,
      aspectRatio: '9:16',
      visualStyle: MEMORY_SWORDSMAN_STARTER.visualStyle,
    }));
    message.success('已套用示例模板，创建前仍可继续修改');
  };

  const createProject = async () => {
    setCreating(true);
    try {
      const created = await api.createProject({
        name: form.name.trim(),
        description: form.description.trim(),
        sourceType: form.sourceType,
        sourceContent: form.sourceContent.trim(),
        productionGoal: form.productionGoal,
        teamCode: 'comic-drama-team',
        episodeCount: form.sourceType === 'gc' ? 1 : form.episodeCount,
        episodeDurationSeconds: form.sourceType === 'gc' ? 30 : form.episodeDurationSeconds,
        aspectRatio: form.aspectRatio,
        visualStyle: form.visualStyle.trim(),
      });
      message.success('故事项目已创建');
      setForm(current => ({
        ...EMPTY_FORM,
        sourceType: current.sourceType,
        episodeCount: current.episodeCount,
        episodeDurationSeconds: current.episodeDurationSeconds,
        aspectRatio: current.aspectRatio,
        visualStyle: current.visualStyle,
      }));
      setCreateOpen(false);
      navigate(`/production/${created.project_id}`);
    } catch (error: any) {
      message.error(error?.message || '创建失败，请稍后重试');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="story-page projects-home">
      <section className="story-home-hero">
        <div>
          <Text className="story-eyebrow">创作工作室</Text>
          <Title level={2}>我的项目</Title>
          <Paragraph>
            从一个好故事，到一支完整短片。查看现有素材，接着上一次的进度继续制作。
          </Paragraph>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreate}>
          新建作品
        </Button>
      </section>

      {loading ? (
        <div className="story-centered-state" role="status" aria-live="polite">
          <Spin size="large" />
          <Text type="secondary">正在读取作品和制作进度…</Text>
        </div>
      ) : loadError ? (
        <Alert
          type="error"
          showIcon
          message="项目加载失败"
          description={loadError}
          action={<Button onClick={() => void loadProjects()}>重试</Button>}
        />
      ) : orderedProjects.length === 0 ? (
        <Card className="story-empty-card">
          <Empty
            image={<img src="/empty-create.svg" alt="" width={170} />}
            description={(
              <Space direction="vertical" size={4}>
                <Text strong>开始你的第一部作品</Text>
                <Text type="secondary">先写清一个人物、一件难事和一次改变，再把它拍成短片。</Text>
              </Space>
            )}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>创建第一部短片</Button>
          </Empty>
        </Card>
      ) : (
        <>
          <section className="story-project-summary" aria-label="作品概况">
            <div><strong>{orderedProjects.length}</strong><span>全部作品</span></div>
            <div><strong>{projectSummary.withImages}</strong><span>已有画面</span></div>
            <div><strong>{projectSummary.withFinalVideo}</strong><span>已有成片</span></div>
          </section>
          <div className="story-section-heading">
            <div>
              <Title level={4}>继续你的作品</Title>
              <Text type="secondary">重点项目优先，其余按最近更新排序。</Text>
            </div>
          </div>
          <Row gutter={[18, 18]}>
            {orderedProjects.map(project => {
              const type = projectTypePresentation(project.source_type);
              const preview = resolveStoryPreview(project);
              const previewKnown = Boolean(preview);
              const available = preview?.available_images || 0;
              const missing = preview?.missing_images || 0;
              const videos = preview?.video_count || 0;
              const hasFinalVideo = Boolean(preview?.has_final_video);
              const episodeCount = Number(project.episode_count ?? project.settings?.episode_count);
              const typeLabel = episodeCount === 1 && project.source_type !== 'gc' ? '单集短片' : type.label;
              const statusLabel = hasFinalVideo ? '已有成片'
                : videos > 0 ? '视频制作中'
                  : available > 0 ? '画面制作中'
                    : project.stats?.readiness?.spec_ready ? '分镜准备中' : '故事准备中';
              const nextStep = projectNextStep(project, preview);
              return (
                <Col key={project.project_id} xs={24} md={12} xl={8}>
                  <Card className="story-project-card" styles={{ body: { padding: 0 } }}>
                    <ProjectCover
                      images={preview?.preview_images || []}
                      available={available}
                      known={previewKnown}
                      title={friendlyProjectName(project.name)}
                    />
                    <div className="story-project-card__body">
                      <div className="story-project-card__tags">
                        <Space size={6} wrap>
                          <Tag className="story-project-kind">{typeLabel}</Tag>
                          {project.pinned && <Tag color="gold">重点项目</Tag>}
                        </Space>
                        <span className={`story-project-state${hasFinalVideo ? ' is-finished' : ''}`}>
                          {hasFinalVideo ? <CheckCircleOutlined /> : <ClockCircleOutlined />} {statusLabel}
                        </span>
                      </div>
                      <Title level={4}>{friendlyProjectName(project.name)}</Title>
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {extractOneLineStory(project) || '还没有一句话故事。'}
                      </Paragraph>
                      <div className="story-project-signals">
                        <span className={available ? 'is-ready' : ''}>
                          <PictureOutlined />
                          {available
                            ? `${available} 张画面可看`
                            : previewKnown ? '暂无剧情画面' : '打开查看剧情画面'}
                        </span>
                        {missing > 0 && <span>{missing} 张未生成</span>}
                        {videos > 0 && (
                          <span><VideoCameraOutlined /> {videos} 段视频</span>
                        )}
                      </div>
                      <div className="story-project-next">
                        <span>下一步</span>
                        <strong>{nextStep}</strong>
                      </div>
                      <div className="story-project-card__actions">
                        <Button
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          onClick={() => navigate(hasFinalVideo
                            ? `/studio?project=${encodeURIComponent(project.project_id)}`
                            : `/production/${project.project_id}/pipeline`)}
                        >
                          {hasFinalVideo ? '查看成片' : '继续制作'}
                        </Button>
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/production/${project.project_id}`)}
                        >
                          故事与画面
                        </Button>
                        <span className="story-project-updated">{projectUpdatedLabel(project.updated_at)}</span>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}

      <Modal
        title="新建作品"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        width={640}
        destroyOnHidden
        footer={createStep === 0 ? [
          <Button key="cancel" onClick={() => setCreateOpen(false)}>取消</Button>,
          <Button key="next" type="primary" onClick={nextCreateStep}>下一步：制作计划</Button>,
        ] : [
          <Button key="back" onClick={() => setCreateStep(0)}>上一步</Button>,
          <Button key="create" type="primary" loading={creating} onClick={createProject}>创建作品</Button>,
        ]}
      >
        <Steps
          size="small"
          current={createStep}
          items={[{ title: '故事是什么' }, { title: '怎么制作' }]}
          style={{ margin: '12px 0 24px' }}
        />
        {createStep === 0 ? (
          <div className="story-form-grid">
            <details className="story-template-helper">
              <summary>用示例了解故事怎么填写</summary>
              <Alert
                type="info"
                showIcon
                icon={<BulbOutlined />}
                message="想先看看完整填写方式？"
                description="“失忆剑客”是可编辑的30秒创作模板。套用会替换当前表单，点击创建后才会成为项目。"
                action={(
                  <Button type="dashed" onClick={applyMemorySwordsmanStarter}>
                    套用失忆剑客模板
                  </Button>
                )}
              />
            </details>
            <label>
              <Text strong>故事来源</Text>
              <Select
                value={form.sourceType}
                onChange={sourceType => setForm(current => ({
                  ...current,
                  sourceType,
                  ...(sourceType === 'gc' ? { episodeCount: 1, episodeDurationSeconds: 30 } : {}),
                }))}
                options={[
                  { value: 'outline', label: '故事大纲（单集或系列）' },
                  { value: 'gc', label: '概念预告片（约 30 秒看故事与画风）' },
                  { value: 'novel', label: '小说改编剧集' },
                  { value: 'script', label: '已有剧本项目' },
                  { value: 'idea', label: '原创故事创意' },
                ]}
              />
            </label>
            <label>
              <Text strong>故事名称</Text>
              <Input
                value={form.name}
                onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                placeholder="给这部作品起一个名字"
              />
            </label>
            <label>
              <Text strong>一句话故事</Text>
              <Text type="secondary">让第一次看到的人立刻知道“谁遇到了什么难题”。</Text>
              <TextArea
                value={form.description}
                onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
                placeholder="谁想做成什么事，遇到了什么阻碍，最后做出了什么选择？"
                rows={3}
              />
            </label>
            <label>
              <Text strong>已有素材（可选）</Text>
              <TextArea
                value={form.sourceContent}
                onChange={event => setForm(current => ({ ...current, sourceContent: event.target.value }))}
                placeholder="可以粘贴大纲、人物设定、小说片段或已有剧本。"
                rows={5}
              />
            </label>
          </div>
        ) : (
          <div className="story-form-grid story-form-grid--two">
            {form.sourceType !== 'gc' && (
              <>
                <div className="story-plan-presets">
                  <span>快速设置</span>
                  <Button size="small" onClick={() => setForm(current => ({ ...current, episodeCount: 1, episodeDurationSeconds: 180 }))}>3 分钟单集短片</Button>
                  <Button size="small" onClick={() => setForm(current => ({ ...current, episodeCount: 12, episodeDurationSeconds: 90 }))}>12 集短剧</Button>
                </div>
                <label>
                  <Text strong>计划集数</Text>
                  <InputNumber
                    min={1}
                    max={500}
                    value={form.episodeCount}
                    onChange={value => setForm(current => ({ ...current, episodeCount: value || 1 }))}
                    style={{ width: '100%' }}
                  />
                </label>
                <label>
                  <Text strong>每集时长（秒）</Text>
                  <InputNumber
                    min={5}
                    max={3600}
                    value={form.episodeDurationSeconds}
                    onChange={value => setForm(current => ({ ...current, episodeDurationSeconds: value || 180 }))}
                    style={{ width: '100%' }}
                  />
                </label>
              </>
            )}
            {form.sourceType === 'gc' && (
              <Alert
                type="info"
                showIcon
                message="概念预告片默认 1 集、30 秒"
                description="它的作用是先把故事核心和视觉方向做成一组能直接看的画面。"
                style={{ gridColumn: '1 / -1' }}
              />
            )}
            <label>
              <Text strong>画面比例</Text>
              <Select
                value={form.aspectRatio}
                onChange={aspectRatio => setForm(current => ({ ...current, aspectRatio }))}
                options={[
                  { value: '9:16', label: '竖屏 9:16（短视频）' },
                  { value: '16:9', label: '横屏 16:9' },
                  { value: '1:1', label: '方形 1:1' },
                ]}
              />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <Text strong>交付目标</Text>
              <Text type="secondary">系统会按目标安排下一步；真实图片/视频生成会单独显示模型和费用确认。</Text>
              <Select
                value={form.productionGoal}
                onChange={productionGoal => setForm(current => ({ ...current, productionGoal }))}
                style={{ width: '100%', marginTop: 6 }}
                options={PRODUCTION_GOAL_OPTIONS.map(option => ({
                  value: option.value,
                  label: option.label + ' · ' + option.description,
                }))}
              />
            </label>
            <label>
              <Text strong>希望的画风（可选）</Text>
              <Input
                value={form.visualStyle}
                onChange={event => setForm(current => ({ ...current, visualStyle: event.target.value }))}
                placeholder="例如：自然光、真实生活质感、克制的电影镜头"
              />
            </label>
          </div>
        )}
      </Modal>
    </main>
  );
}
