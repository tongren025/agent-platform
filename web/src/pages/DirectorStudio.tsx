// 导演 Agent：用一条主线完成创意、剧本、分镜、图片、视频与成片。
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button, Empty, Input, Modal, Progress, Segmented, Select, Spin, Tag, Tooltip,
  Typography,
} from 'antd';
import {
  ArrowRightOutlined, CheckCircleFilled, ClockCircleOutlined, EditOutlined,
  ExclamationCircleOutlined, FileTextOutlined, FolderOpenOutlined, PlusOutlined,
  ReloadOutlined, RocketOutlined, SyncOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { message } from '../ui';
import { useResponsive } from '../hooks/useResponsive';
import './DirectorStudio.css';

const { Text, Title } = Typography;
const { TextArea } = Input;

type MediaKind = 'image' | 'video';

interface Project {
  project_id: string;
  name: string;
  description?: string;
  source_type: string;
  aspect_ratio: string;
  updated_at: string;
}

interface StageState {
  key: string;
  name: string;
  done: number;
  total: number;
}

interface VideoJob {
  id: string;
  status: string;
  model: string;
  error?: string;
}

interface ShotState {
  episode: number | null;
  unit: number;
  title: string;
  script: string;
  imageCardId: string;
  imagePrompt: string;
  imageUrl: string;
  videoCardId: string;
  videoPrompt: string;
  videoUrl: string;
  videoJob?: VideoJob | null;
  durationSeconds: number;
  reviewCount: number;
}

interface DirectorState {
  project: Project;
  stages: StageState[];
  shots: ShotState[];
  totalUnits: number;
  overallProgress: number;
  nextAction: { kind: string; stage: string; label: string; count: number };
  reviewCount: number;
  activeJobs: number;
  finalUrl: string;
}

interface MediaModel {
  id: string;
  name: string;
  kind: MediaKind;
  description?: string;
  pricing?: Record<string, string | number>;
  supportedResolutions?: string[];
  supportedAspectRatios?: string[];
}

const STAGE_ICONS: Record<string, React.ReactNode> = {
  script: <FileTextOutlined />,
  storyboard: <EditOutlined />,
  img_prompt: <EditOutlined />,
  image: <FolderOpenOutlined />,
  vid_prompt: <EditOutlined />,
  video: <VideoCameraOutlined />,
  final: <CheckCircleFilled />,
};

function stagePercent(stage: StageState) {
  if (!stage.total) return 0;
  return Math.round(stage.done / stage.total * 100);
}

function modelPriceLabel(model: MediaModel | undefined, kind: MediaKind) {
  if (!model?.pricing || Object.keys(model.pricing).length === 0) return '价格以 OpenRouter 结算为准';
  if (kind === 'video') {
    const value = model.pricing['per-video-second'] ?? model.pricing['per_video_second'];
    if (value !== undefined) return `$${value} / 秒`;
  }
  const first = Object.entries(model.pricing)[0];
  return first ? `${first[0]} · $${first[1]}` : '价格以 OpenRouter 结算为准';
}

export default function DirectorStudio() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [state, setState] = useState<DirectorState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '', source: '', format: 'gc', aspectRatio: '9:16',
  });
  const [mediaKind, setMediaKind] = useState<MediaKind | null>(null);
  const [mediaModels, setMediaModels] = useState<MediaModel[]>([]);
  const [mediaModel, setMediaModel] = useState('');
  const [modelLoading, setModelLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });

  const loadProjects = useCallback(async () => {
    const data = await api.listProjects();
    setProjects(data);
    if (!projectId && data.length) {
      const remembered = localStorage.getItem('director-project');
      const selected = data.find((item: Project) => item.project_id === remembered) || data[0];
      setProjectId(selected.project_id);
    }
  }, [projectId]);

  const loadState = useCallback(async (pid = projectId, quiet = false) => {
    if (!pid) return;
    if (!quiet) setLoading(true);
    try {
      const data = await api.getDirectorState(pid);
      setState(data);
      localStorage.setItem('director-project', pid);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjects().catch((error: any) => message.error(error.message)).finally(() => setLoading(false));
  }, [loadProjects]);
  useEffect(() => { if (projectId) loadState(projectId); }, [projectId, loadState]);

  const syncJobs = useCallback(async (quiet = false) => {
    if (!state || !projectId) return;
    const active = state.shots.filter(shot =>
      shot.videoCardId && shot.videoJob && ['pending', 'in_progress'].includes(shot.videoJob.status),
    );
    if (!active.length) return;
    if (!quiet) setBusy('sync');
    try {
      for (const shot of active) await api.syncDirectorVideo(projectId, shot.videoCardId);
      await loadState(projectId, true);
      if (!quiet) message.success('视频任务已同步');
    } catch (error: any) {
      if (!quiet) message.error(error.message);
    } finally {
      if (!quiet) setBusy('');
    }
  }, [state, projectId, loadState]);

  useEffect(() => {
    if (!state?.activeJobs) return;
    const timer = window.setInterval(() => syncJobs(true), 15000);
    return () => window.clearInterval(timer);
  }, [state?.activeJobs, syncJobs]);

  const openMedia = async (kind: MediaKind) => {
    setMediaKind(kind);
    setModelLoading(true);
    setMediaModels([]);
    setMediaModel('');
    try {
      const models = await api.listDirectorMediaModels(kind);
      setMediaModels(models);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setModelLoading(false);
    }
  };

  const runNext = async () => {
    if (!state || !projectId) return;
    const next = state.nextAction;
    if (next.kind === 'image' || next.kind === 'video') {
      await openMedia(next.kind);
      return;
    }
    if (next.kind === 'compose') {
      setBusy('compose');
      try {
        await api.composeDirectorCut(projectId);
        message.success('成片预览已合成');
        await loadState(projectId, true);
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setBusy('');
      }
      return;
    }
    if (next.kind !== 'stage') return;
    setBusy(next.stage);
    try {
      await api.generateStage(projectId, {
        target_stage: next.stage,
        episode: state.project.source_type === 'gc' ? null : 1,
        mode: 'replace',
      });
      message.success(`${next.label}完成`);
      await loadState(projectId, true);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setBusy('');
    }
  };

  const createProject = async () => {
    if (!createForm.name.trim() || !createForm.source.trim()) {
      message.warning('请填写片名和创意素材');
      return;
    }
    setBusy('create');
    try {
      const project = await api.createProject({
        name: createForm.name.trim(),
        description: createForm.format === 'gc' ? '15-30 秒概念片' : '单集漫剧',
        sourceType: createForm.format,
        sourceContent: createForm.source.trim(),
        episodeCount: 1,
        episodeDurationSeconds: createForm.format === 'gc' ? 30 : 90,
        aspectRatio: createForm.aspectRatio,
      });
      setCreateOpen(false);
      setCreateForm({ name: '', source: '', format: 'gc', aspectRatio: '9:16' });
      await loadProjects();
      setProjectId(project.project_id);
      message.success('制作任务已建立');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setBusy('');
    }
  };

  const pendingShots = useMemo(() => {
    if (!state || !mediaKind) return [];
    return state.shots.filter(shot => mediaKind === 'image'
      ? Boolean(shot.imageCardId && !shot.imageUrl)
      : Boolean(shot.videoCardId && shot.imageUrl && !shot.videoUrl && !shot.videoJob));
  }, [state, mediaKind]);

  const selectedModel = mediaModels.find(model => model.id === mediaModel);
  const startMediaBatch = () => {
    if (!state || !projectId || !mediaKind || !mediaModel || !pendingShots.length) return;
    Modal.confirm({
      title: mediaKind === 'image' ? `生成 ${pendingShots.length} 张镜头图` : `提交 ${pendingShots.length} 个视频任务`,
      content: `${selectedModel?.name || mediaModel} · ${modelPriceLabel(selectedModel, mediaKind)}。本操作会消耗 OpenRouter 额度。`,
      okText: '确认生成',
      cancelText: '取消',
      onOk: async () => {
        setBusy(`batch-${mediaKind}`);
        setBatchProgress({ done: 0, total: pendingShots.length });
        try {
          for (let index = 0; index < pendingShots.length; index += 1) {
            const shot = pendingShots[index];
            if (mediaKind === 'image') {
              await api.generateDirectorImage(projectId, shot.imageCardId, {
                model: mediaModel,
                prompt: shot.imagePrompt,
                resolution: '1K',
                aspect_ratio: state.project.aspect_ratio,
              });
            } else {
              await api.generateDirectorVideo(projectId, shot.videoCardId, {
                model: mediaModel,
                prompt: shot.videoPrompt,
                duration: shot.durationSeconds,
                resolution: '720p',
                aspect_ratio: state.project.aspect_ratio,
                image_url: shot.imageUrl,
                generate_audio: true,
              });
            }
            setBatchProgress({ done: index + 1, total: pendingShots.length });
          }
          setMediaKind(null);
          message.success(mediaKind === 'image' ? '镜头图片已生成' : '视频任务已全部提交');
          await loadState(projectId, true);
        } catch (error: any) {
          message.error(error.message);
          await loadState(projectId, true);
          throw error;
        } finally {
          setBusy('');
        }
      },
    });
  };

  if (loading && !state) {
    return <div className="director-loading"><Spin size="large" /></div>;
  }

  return (
    <div className="director-page">
      <header className="director-header">
        <div>
          <Text className="director-eyebrow">一人制片工作室</Text>
          <Title level={2}>导演 Agent</Title>
        </div>
        <div className="director-header-actions">
          {projects.length > 0 && (
            <Select
              value={projectId}
              onChange={setProjectId}
              className="director-project-select"
              options={projects.map(project => ({ value: project.project_id, label: project.name }))}
            />
          )}
          <Button icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>新片</Button>
        </div>
      </header>

      {!state ? (
        <div className="director-empty">
          <Empty description="还没有制作任务">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>建立第一部片</Button>
          </Empty>
        </div>
      ) : (
        <>
          <section className="director-project-band">
            <div className="director-project-copy">
              <Text type="secondary">当前制作</Text>
              <Title level={3}>{state.project.name}</Title>
              <div className="director-project-meta">
                <Tag>{state.project.source_type === 'gc' ? '概念片' : '漫剧'}</Tag>
                <Tag>{state.project.aspect_ratio}</Tag>
                <Tag>{state.totalUnits} 镜</Tag>
                {state.reviewCount > 0 && <Tag color="warning">{state.reviewCount} 项待审</Tag>}
              </div>
            </div>
            <div className="director-progress-block">
              <div className="director-progress-number">{state.overallProgress}%</div>
              <Progress percent={state.overallProgress} showInfo={false} strokeColor="#0f766e" />
              <Text type="secondary">生产完成度</Text>
            </div>
          </section>

          <section className="director-pipeline" aria-label="生产阶段">
            {state.stages.map((stage, index) => {
              const complete = stagePercent(stage) === 100;
              return (
                <div key={stage.key} className={`director-stage ${complete ? 'is-complete' : ''}`}>
                  <div className="director-stage-icon">{complete ? <CheckCircleFilled /> : STAGE_ICONS[stage.key]}</div>
                  <div className="director-stage-copy"><strong>{stage.name}</strong><span>{stage.done}/{stage.total}</span></div>
                  {index < state.stages.length - 1 && <ArrowRightOutlined className="director-stage-arrow" />}
                </div>
              );
            })}
          </section>

          <section className="director-action-band">
            <div className="director-action-copy">
              <span className="director-action-label">下一步</span>
              <strong>{state.nextAction.label}</strong>
              {state.nextAction.count > 0 && <span>{state.nextAction.count} 项</span>}
            </div>
            <div className="director-action-buttons">
              {state.activeJobs > 0 && (
                <Button icon={<SyncOutlined spin={busy === 'sync'} />} onClick={() => syncJobs()}>
                  同步 {state.activeJobs} 个视频
                </Button>
              )}
              {state.nextAction.kind !== 'done' && (
                <Button type="primary" icon={<RocketOutlined />} loading={Boolean(busy && busy !== 'sync')} onClick={runNext}>
                  {state.nextAction.label}
                </Button>
              )}
              <Tooltip title="打开高级制作看板">
                <Button icon={<FolderOpenOutlined />} onClick={() => navigate(`/production/${projectId}`)}>看板</Button>
              </Tooltip>
            </div>
          </section>

          {state.finalUrl && (
            <section className="director-final">
              <div className="director-section-heading">
                <div><Text type="secondary">最新交付</Text><Title level={4}>成片预览</Title></div>
                <Tag color="success" icon={<CheckCircleFilled />}>已合成</Tag>
              </div>
              <video src={state.finalUrl} controls playsInline />
            </section>
          )}

          <section className="director-shots">
            <div className="director-section-heading">
              <div><Text type="secondary">审片看板</Text><Title level={4}>{state.totalUnits} 个生成镜头</Title></div>
              <Button icon={<ReloadOutlined />} onClick={() => loadState(projectId)}>刷新</Button>
            </div>
            {state.shots.length === 0 ? (
              <Empty description="剧本生成后，镜头会出现在这里" />
            ) : (
              <div className="director-shot-grid">
                {state.shots.map(shot => {
                  const jobActive = shot.videoJob && ['pending', 'in_progress'].includes(shot.videoJob.status);
                  return (
                    <article key={`${shot.episode ?? 'global'}-${shot.unit}`} className="director-shot-card">
                      <div className="director-shot-media">
                        {shot.videoUrl ? (
                          <video src={shot.videoUrl} controls playsInline />
                        ) : shot.imageUrl ? (
                          <img src={shot.imageUrl} alt={shot.title} loading="lazy" />
                        ) : (
                          <div className="director-shot-placeholder"><FileTextOutlined /><span>G{shot.unit}</span></div>
                        )}
                        <div className="director-shot-index">G{shot.unit}</div>
                      </div>
                      <div className="director-shot-body">
                        <strong className="director-shot-title">{shot.title}</strong>
                        <p>{shot.script || shot.imagePrompt || '等待剧本'}</p>
                        <div className="director-shot-status">
                          <Tag color={shot.imageUrl ? 'success' : 'default'}>{shot.imageUrl ? '有图' : '待图'}</Tag>
                          <Tag color={shot.videoUrl ? 'success' : jobActive ? 'processing' : 'default'}>
                            {shot.videoUrl ? '有视频' : jobActive ? '生成中' : '待视频'}
                          </Tag>
                          {shot.reviewCount > 0 && <Tag color="warning">待审 {shot.reviewCount}</Tag>}
                        </div>
                        {shot.videoJob?.status === 'failed' && (
                          <div className="director-shot-error"><ExclamationCircleOutlined /> {shot.videoJob.error || '视频生成失败'}</div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <Modal
        open={createOpen}
        title="建立制作任务"
        okText="开始制作"
        cancelText="取消"
        confirmLoading={busy === 'create'}
        onOk={createProject}
        onCancel={() => setCreateOpen(false)}
        width={isMobile ? 'calc(100vw - 24px)' : 620}
      >
        <div className="director-form">
          <label>片名<Input value={createForm.name} maxLength={60} onChange={event => setCreateForm({ ...createForm, name: event.target.value })} /></label>
          <label>创意素材<TextArea value={createForm.source} autoSize={{ minRows: 7, maxRows: 14 }} onChange={event => setCreateForm({ ...createForm, source: event.target.value })} /></label>
          <div className="director-form-row">
            <label>规格<Segmented value={createForm.format} onChange={value => setCreateForm({ ...createForm, format: String(value) })} options={[{ label: '15-30 秒概念片', value: 'gc' }, { label: '90 秒单集', value: 'idea' }]} /></label>
            <label>画幅<Segmented value={createForm.aspectRatio} onChange={value => setCreateForm({ ...createForm, aspectRatio: String(value) })} options={['9:16', '16:9', '1:1']} /></label>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(mediaKind)}
        title={mediaKind === 'image' ? '生成镜头图片' : '生成镜头视频'}
        okText={mediaKind === 'image' ? '生成图片' : '提交视频任务'}
        cancelText="取消"
        okButtonProps={{ disabled: !mediaModel || pendingShots.length === 0 }}
        confirmLoading={busy.startsWith('batch-')}
        onOk={startMediaBatch}
        onCancel={() => !busy.startsWith('batch-') && setMediaKind(null)}
        width={isMobile ? 'calc(100vw - 24px)' : 620}
      >
        <div className="director-media-dialog">
          <div className="director-media-summary">
            <strong>{pendingShots.length} 个待生成镜头</strong>
            <span>{mediaKind === 'image' ? '1K · 项目画幅' : '720p · 首帧转视频 · 同步音频'}</span>
          </div>
          <label>OpenRouter 模型</label>
          <Select
            showSearch
            loading={modelLoading}
            value={mediaModel || undefined}
            onChange={setMediaModel}
            placeholder="选择模型"
            optionFilterProp="label"
            options={mediaModels.map(model => ({
              value: model.id,
              label: `${model.name} · ${modelPriceLabel(model, mediaKind || 'image')}`,
            }))}
          />
          {selectedModel && <Text type="secondary">{modelPriceLabel(selectedModel, mediaKind || 'image')}</Text>}
          {busy.startsWith('batch-') && batchProgress.total > 0 && (
            <Progress percent={Math.round(batchProgress.done / batchProgress.total * 100)} />
          )}
          {mediaKind === 'video' && state?.shots.some(shot => shot.videoCardId && !shot.imageUrl) && (
            <div className="director-media-warning"><ClockCircleOutlined /> 没有首帧图的镜头会等到图片完成后再生成。</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
