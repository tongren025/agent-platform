// “我的项目”入口：先帮助用户选故事、看已有剧情画面，再进入专业制作工具。
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
  BookOutlined,
  BulbOutlined,
  EyeOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { useInputHabit } from '../hooks/useInputHabit';
import { thumbUrl, onImageError } from '../media';
import { message } from '../ui';
import { MEMORY_SWORDSMAN_STARTER } from '../storyStarters';
import {
  extractOneLineStory,
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
  pinned?: boolean;
  settings?: Record<string, any>;
  stats?: {
    story_preview?: StoryPreview;
    readiness?: {
      overall_progress?: number;
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
}

const EMPTY_FORM: NewProjectForm = {
  name: '',
  description: '',
  sourceType: 'outline',
  sourceContent: '',
  episodeCount: 12,
  episodeDurationSeconds: 90,
  aspectRatio: '9:16',
  visualStyle: '',
};

function ProjectCover({
  images,
  available,
  known,
}: {
  images: string[];
  available: number;
  known: boolean;
}) {
  const visible = images.filter(Boolean).slice(0, 4);
  if (!visible.length) {
    return (
      <div className="story-project-cover story-project-cover--empty">
        <BookOutlined />
        <span>{known ? '还没有可看的剧情图' : '打开后查看故事画面'}</span>
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
          <Text className="story-eyebrow">故事库</Text>
          <Title level={2}>我的项目</Title>
          <Paragraph>
            先看懂故事，再处理制作。打开项目后只会先展示一句话剧情和已经生成的画面；
            提示词、卡片和流程状态都收在“进入制作”里。
          </Paragraph>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreate}>
          新建故事
        </Button>
      </section>

      {loading ? (
        <div className="story-centered-state" role="status" aria-live="polite">
          <Spin size="large" />
          <Text type="secondary">正在整理你的故事…</Text>
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
                <Text strong>还没有故事项目</Text>
                <Text type="secondary">先写一句话故事，之后再逐步生成角色和剧情画面。</Text>
              </Space>
            )}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建第一个故事</Button>
          </Empty>
        </Card>
      ) : (
        <>
          <div className="story-section-heading">
            <div>
              <Title level={4}>选择一个故事</Title>
              <Text type="secondary">卡片只显示能帮助你理解故事的信息。</Text>
            </div>
            <Text type="secondary">{orderedProjects.length} 个项目</Text>
          </div>
          <Row gutter={[18, 18]}>
            {orderedProjects.map(project => {
              const type = projectTypePresentation(project.source_type);
              const preview = resolveStoryPreview(project);
              const previewKnown = Boolean(preview);
              const available = preview?.available_images || 0;
              const expected = preview?.expected_images || 0;
              const missing = preview?.missing_images || 0;
              const videos = preview?.video_count || 0;
              return (
                <Col key={project.project_id} xs={24} md={12} xl={8}>
                  <Card className="story-project-card" styles={{ body: { padding: 0 } }}>
                    <ProjectCover
                      images={preview?.preview_images || []}
                      available={available}
                      known={previewKnown}
                    />
                    <div className="story-project-card__body">
                      <Space size={6} wrap>
                        <Tag color={type.color}>{type.label}</Tag>
                        {project.pinned && <Tag color="gold">重点项目</Tag>}
                      </Space>
                      <Title level={4}>{friendlyProjectName(project.name)}</Title>
                      <Paragraph ellipsis={{ rows: 3 }}>
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
                        {expected > 0 && videos > 0 && (
                          <span><VideoCameraOutlined /> {videos} 段视频</span>
                        )}
                      </div>
                      <div className="story-project-card__actions">
                        <Button
                          type="primary"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/production/${project.project_id}`)}
                        >
                          看故事
                        </Button>
                        <Button
                          type="text"
                          icon={<PlayCircleOutlined />}
                          onClick={() => navigate(`/production/${project.project_id}/pipeline`)}
                        >
                          进入制作
                        </Button>
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
        title="新建故事"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        width={640}
        destroyOnHidden
        footer={createStep === 0 ? [
          <Button key="cancel" onClick={() => setCreateOpen(false)}>取消</Button>,
          <Button key="next" type="primary" onClick={nextCreateStep}>下一步：制作计划</Button>,
        ] : [
          <Button key="back" onClick={() => setCreateStep(0)}>上一步</Button>,
          <Button key="create" type="primary" loading={creating} onClick={createProject}>创建故事</Button>,
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
            <Alert
              type="info"
              showIcon
              icon={<BulbOutlined />}
              message="想先看看完整填写方式？"
              description="“失忆剑客”是可编辑的30秒创作模板，不是项目库里已经存在的剧本。只有点击创建后才会成为你的项目。"
              action={(
                <Button type="dashed" onClick={applyMemorySwordsmanStarter}>
                  套用失忆剑客模板
                </Button>
              )}
            />
            <label>
              <Text strong>项目形式</Text>
              <Select
                value={form.sourceType}
                onChange={sourceType => setForm(current => ({
                  ...current,
                  sourceType,
                  ...(sourceType === 'gc' ? { episodeCount: 1, episodeDurationSeconds: 30 } : {}),
                }))}
                options={[
                  { value: 'outline', label: '连续剧集' },
                  { value: 'gc', label: '概念预告片（约 30 秒看故事与画风）' },
                  { value: 'novel', label: '小说改编剧集' },
                  { value: 'script', label: '已有剧本项目' },
                  { value: 'idea', label: '故事创意' },
                ]}
              />
            </label>
            <label>
              <Text strong>故事名称</Text>
              <Input
                value={form.name}
                onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                placeholder="例如：铁心恋人 · 第一季"
              />
            </label>
            <label>
              <Text strong>一句话故事</Text>
              <Text type="secondary">让第一次看到的人立刻知道“谁遇到了什么难题”。</Text>
              <TextArea
                value={form.description}
                onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
                placeholder="例如：不需要任何人保护的女保镖，意外唤醒了一个只听她命令的军用仿生人。"
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
                    onChange={value => setForm(current => ({ ...current, episodeDurationSeconds: value || 90 }))}
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
            <label>
              <Text strong>希望的画风（可选）</Text>
              <Input
                value={form.visualStyle}
                onChange={event => setForm(current => ({ ...current, visualStyle: event.target.value }))}
                placeholder="例如：干净二维东方幻想动画"
              />
            </label>
          </div>
        )}
      </Modal>
    </main>
  );
}
