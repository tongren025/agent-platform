// 快速制作：用户先选交付目标，再沿一条主线完成创意、剧本、分镜、图片、视频与成片。
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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, type ProductionGoal } from '../api';
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
  production_goal: ProductionGoal;
  pinned: boolean;
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

const PRODUCTION_GOALS: Record<ProductionGoal, {
  label: string;
  description: string;
  targetStage: string;
}> = {
  storyboard: {
    label: '完成文字分镜',
    description: '生成剧本和分镜设计，先确认镜头内容与顺序。',
    targetStage: 'storyboard',
  },
  images: {
    label: '生成镜头图片',
    description: '从创意一路推进到每个镜头都有可审核的画面。',
    targetStage: 'image',
  },
  final: {
    label: '制作完整成片',
    description: '继续生成镜头视频，并合成为可预览成片。',
    targetStage: 'final',
  },
};

const GOAL_OPTIONS = (Object.entries(PRODUCTION_GOALS) as [ProductionGoal, typeof PRODUCTION_GOALS[ProductionGoal]][])
  .map(([value, goal]) => ({ value, label: goal.label }));

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
  const [searchParams] = useSearchParams();
  const requestedProjectId = searchParams.get('project') || '';
  const { isMobile } = useResponsive();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [state, setState] = useState<DirectorState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '', source: '', format: 'gc', aspectRatio: '9:16', goal: 'images' as ProductionGoal,
  });
  const [productionGoal, setProductionGoal] = useState<ProductionGoal>('final');
  const [goalSaving, setGoalSaving] = useState(false);
  const [mediaKind, setMediaKind] = useState<MediaKind | null>(null);
  const [mediaModels, setMediaModels] = useState<MediaModel[]>([]);
  const [mediaModel, setMediaModel] = useState('');
  const [modelLoading, setModelLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });

  const loadProjects = useCallback(async () => {
    const data = await api.listProjects();
    setProjects(data);
    if (data.length) {
      const remembered = localStorage.getItem('director-project');
      const selected = data.find((item: Project) => item.project_id === requestedProjectId)
        || data.find((item: Project) => item.project_id === remembered)
        || data[0];
      setProjectId(current => current || selected.project_id);
    }
  }, [requestedProjectId]);

  const loadState = useCallback(async (pid = projectId, quiet = false) => {
    if (!pid) return;
    if (!quiet) {
      setLoading(true);
      setLoadError('');
      setState(current => current?.project.project_id === pid ? current : null);
    }
    try {
      const data = await api.getDirectorState(pid);
      setState(data);
      setProductionGoal(data.project.production_goal || 'final');
      localStorage.setItem('director-project', pid);
    } catch (error: any) {
      if (!quiet) setLoadError('暂时无法加载这个制作项目，请稍后重试');
      else message.error(error.message);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjects()
      .catch(() => {
        setLoadError('暂时无法加载制作项目，请稍后重试');
      })
      .finally(() => setLoading(false));
  }, [loadProjects]);
  useEffect(() => { if (projectId) loadState(projectId); }, [projectId, loadState]);

  const changeGoal = async (goal: ProductionGoal) => {
    if (goal === productionGoal || !projectId || goalSaving) return;
    const previousGoal = productionGoal;
    setProductionGoal(goal);
    setGoalSaving(true);
    try {
      const updated = await api.updateProject(projectId, { production_goal: goal });
      if (updated.production_goal !== goal) {
        throw new Error('制作目标服务暂未就绪');
      }
      const savedGoal = updated.production_goal as ProductionGoal;
      setProductionGoal(savedGoal);
      setState(current => current
        ? { ...current, project: { ...current.project, production_goal: savedGoal } }
        : current);
      setProjects(current => current.map(project => project.project_id === projectId
        ? { ...project, production_goal: savedGoal }
        : project));
    } catch {
      setProductionGoal(previousGoal);
      message.error('暂时无法保存制作目标，已恢复原设置，请稍后重试');
    } finally {
      setGoalSaving(false);
    }
  };

  const goalReached = useMemo(() => {
    if (!state) return false;
    if (productionGoal === 'final' && state.finalUrl) return true;
    const target = state.stages.find(stage => stage.key === PRODUCTION_GOALS[productionGoal].targetStage);
    return Boolean(target && stagePercent(target) === 100);
  }, [state, productionGoal]);

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
    if (!state || !projectId || goalReached) return;
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
      const requestedGoal = createForm.goal;
      const project = await api.createProject({
        name: createForm.name.trim(),
        description: createForm.format === 'gc' ? '15-30 秒概念片' : '单集漫剧',
        sourceType: createForm.format,
        sourceContent: createForm.source.trim(),
        episodeCount: 1,
        episodeDurationSeconds: createForm.format === 'gc' ? 30 : 90,
        aspectRatio: createForm.aspectRatio,
        productionGoal: createForm.goal,
      });
      setCreateOpen(false);
      setCreateForm({ name: '', source: '', format: 'gc', aspectRatio: '9:16', goal: 'images' });
      await loadProjects();
      setProjectId(project.project_id);
      if (project.production_goal === requestedGoal) {
        message.success('制作任务已建立');
      } else {
        message.warning('项目已创建，但制作目标暂未保存；请稍后重新选择目标');
      }
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
    return <div className="director-loading" role="status" aria-label="正在加载制作项目"><Spin size="large" /></div>;
  }

  return (
    <main className="director-page" aria-labelledby="director-title">
      <section className="director-command-deck">
        <div className="director-deck-grid" aria-hidden="true" />
        <header className="director-header">
          <div className="director-brand-lockup">
            <span className="director-reel-mark"><VideoCameraOutlined /></span>
            <div>
              <Text className="director-eyebrow">一步一步完成漫剧</Text>
              <Title id="director-title" level={1}>快速制作</Title>
              <p>先选交付目标，再按推荐步骤完成剧本、分镜、镜头图和成片</p>
            </div>
          </div>
          <div className="director-header-actions">
            <span className={`director-system-status ${loadError ? 'is-error' : ''}`} role="status">
              <i /> {loadError ? '制作服务暂不可用' : '制作服务就绪'}
            </span>
            {projects.length > 0 && (
              <Select
                value={projectId}
                onChange={setProjectId}
                className="director-project-select"
                aria-label="切换制作项目"
                options={projects.map(project => ({ value: project.project_id, label: project.name }))}
              />
            )}
            {!loadError && <Button className="director-new-button" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>新建制作</Button>}
          </div>
        </header>

        {!state ? (
          <div className="director-empty">
            <Empty
              image={<img src={loadError ? '/empty-connect.svg' : '/empty-create.svg'} alt="" width={160} />}
              description={loadError || '还没有制作项目，先选一个目标开始'}
            >
              {loadError ? (
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    if (projectId) {
                      loadState(projectId);
                    } else {
                      setLoading(true);
                      setLoadError('');
                      loadProjects()
                        .catch(() => setLoadError('暂时无法加载制作项目，请稍后重试'))
                        .finally(() => setLoading(false));
                    }
                  }}
                >
                  重新加载
                </Button>
              ) : (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>开始第一个项目</Button>
              )}
            </Empty>
          </div>
        ) : (
          <div className="director-project-hero">
            <div className="director-project-copy">
              <span className="director-live-label"><i /> 当前制作</span>
              <Title level={2}>{state.project.name}</Title>
              <p>{state.project.description || '从创意素材到可交付成片，持续推进当前制作。'}</p>
              <div className="director-project-meta">
                <span>{state.project.source_type === 'gc' ? '概念片' : '漫剧'}</span>
                <span>{state.project.aspect_ratio}</span>
                <span>{state.totalUnits} 个镜头</span>
                <span className="is-goal">目标：{PRODUCTION_GOALS[productionGoal].label}</span>
                {state.reviewCount > 0 && <span className="is-warning">{state.reviewCount} 项待审</span>}
              </div>
            </div>
            <div className="director-project-vitals">
              <div className="director-progress-block">
                <Progress
                  type="circle"
                  percent={state.overallProgress}
                  size={isMobile ? 112 : 138}
                  strokeWidth={5}
                  strokeColor="#e3a84f"
                  trailColor="rgba(255,255,255,0.1)"
                  format={percent => <span className="director-progress-number">{percent}<small>%</small></span>}
                />
                <span>制作进度</span>
              </div>
              <div className="director-vital-list">
                <div><strong>{state.totalUnits}</strong><span>镜头总数</span></div>
                <div><strong>{state.activeJobs}</strong><span>运行任务</span></div>
                <div><strong>{state.reviewCount}</strong><span>待审项目</span></div>
              </div>
            </div>
          </div>
        )}
      </section>

      {state && (
        <>
          <section className="director-action-band">
            <div className="director-action-index">下一步<br /><strong>01</strong></div>
            <div className="director-action-copy">
              <span className="director-action-label">当前目标 · {PRODUCTION_GOALS[productionGoal].label}</span>
              <strong>{goalReached ? '本次目标已完成' : state.nextAction.label}</strong>
              <span>{goalReached
                ? PRODUCTION_GOALS[productionGoal].description
                : state.nextAction.count > 0 ? `${state.nextAction.count} 项等待推进` : '制作链路已推进至当前节点'}</span>
            </div>
            <div className="director-action-buttons">
              <Select<ProductionGoal>
                aria-label="切换本次制作目标"
                value={productionGoal}
                onChange={changeGoal}
                loading={goalSaving}
                disabled={goalSaving}
                options={GOAL_OPTIONS}
                style={{ width: 154 }}
              />
              {state.activeJobs > 0 && (
                <Button icon={<SyncOutlined spin={busy === 'sync'} />} onClick={() => syncJobs()}>
                  同步 {state.activeJobs} 个视频
                </Button>
              )}
              {!goalReached && state.nextAction.kind !== 'done' && (
                <Button className="director-action-primary" type="primary" icon={<RocketOutlined />} loading={Boolean(busy && busy !== 'sync')} disabled={goalSaving} onClick={runNext}>
                  {state.nextAction.label}
                </Button>
              )}
              {goalReached && productionGoal !== 'final' && (
                <Button className="director-action-primary" type="primary" icon={<ArrowRightOutlined />} disabled={goalSaving} onClick={() => changeGoal('final')}>
                  继续制作成片
                </Button>
              )}
              <Tooltip title="打开高级制作看板">
                <Button icon={<FolderOpenOutlined />} onClick={() => navigate(`/production/${projectId}`)}>高级看板</Button>
              </Tooltip>
            </div>
          </section>

          <section className="director-pipeline-section" aria-labelledby="director-pipeline-title">
            <div className="director-section-heading">
              <div>
                <Text className="director-section-kicker">制作步骤</Text>
                <Title id="director-pipeline-title" level={3}>制作进程</Title>
              </div>
              <span className="director-stage-summary">
                {state.stages.filter(stage => stagePercent(stage) === 100).length} / {state.stages.length} 个步骤
              </span>
            </div>
            <div className="director-pipeline" aria-label="生产阶段">
              {state.stages.map((stage, index) => {
                const complete = stagePercent(stage) === 100;
                const active = !complete && (stage.key === state.nextAction.stage || stage.key === state.nextAction.kind);
                const target = stage.key === PRODUCTION_GOALS[productionGoal].targetStage;
                return (
                  <div key={stage.key} className={`director-stage ${complete ? 'is-complete' : ''} ${active ? 'is-active' : ''} ${target ? 'is-target' : ''}`}>
                    <span className="director-stage-number">0{index + 1}</span>
                    <div className="director-stage-icon">{complete ? <CheckCircleFilled /> : STAGE_ICONS[stage.key]}</div>
                    <div className="director-stage-copy">
                      <strong>{stage.name}</strong>
                      <span>{stage.done} / {stage.total}</span>
                      {target && <em className="director-stage-target-badge">本次目标</em>}
                    </div>
                    {index < state.stages.length - 1 && <ArrowRightOutlined className="director-stage-arrow" />}
                  </div>
                );
              })}
            </div>
          </section>

          {state.finalUrl && (
            <section className="director-final">
              <div className="director-section-heading">
                <div><Text className="director-section-kicker">最新成片</Text><Title level={3}>成片预览</Title></div>
                <Tag color="success" icon={<CheckCircleFilled />}>已合成</Tag>
              </div>
              <div className="director-final-frame"><video src={state.finalUrl} controls playsInline /></div>
            </section>
          )}

          <section className="director-shots">
            <div className="director-section-heading">
              <div>
                <Text className="director-section-kicker">镜头预览与确认</Text>
                <Title level={3}>镜头审片台</Title>
                <p>以故事顺序检查画面、视频状态与审核问题。</p>
              </div>
              <div className="director-shot-heading-actions">
                <span>{state.totalUnits} 个镜头</span>
                <Button icon={<ReloadOutlined />} onClick={() => loadState(projectId)}>刷新素材</Button>
              </div>
            </div>
            {state.shots.length === 0 ? (
              <Empty image={<img src="/empty-data.svg" alt="" width={160} />} description="剧本生成后，镜头会出现在这里" />
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
                        <div className="director-shot-index"><span>镜头</span> G{shot.unit}</div>
                        <div className="director-shot-media-state">{shot.videoUrl ? '视频' : shot.imageUrl ? '画面' : '脚本'}</div>
                      </div>
                      <div className="director-shot-body">
                        <strong className="director-shot-title">{shot.title}</strong>
                        <p>{shot.script || shot.imagePrompt || '等待剧本'}</p>
                        <div className="director-shot-status">
                          <Tag color={shot.imageUrl ? 'success' : 'default'}>{shot.imageUrl ? '画面就绪' : '等待画面'}</Tag>
                          <Tag color={shot.videoUrl ? 'success' : jobActive ? 'processing' : 'default'}>
                            {shot.videoUrl ? '视频就绪' : jobActive ? '视频生成中' : '等待视频'}
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

      <a className="director-deerflow" href="https://deerflow.tech" target="_blank" rel="noreferrer">
        <span /> Created by Deerflow
      </a>

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
          <fieldset className="director-goal-picker" aria-describedby="director-goal-help">
            <legend>
              <span>第一步</span>
              <strong>先选这次要做到哪一步</strong>
            </legend>
            <p id="director-goal-help">
              系统只推进到选定阶段，不会自动继续消耗图片或视频额度。
            </p>
            <div className="director-goal-options">
              {(Object.entries(PRODUCTION_GOALS) as [ProductionGoal, typeof PRODUCTION_GOALS[ProductionGoal]][])
                .map(([goal, item], index) => (
                  <label className="director-goal-option" key={goal}>
                    <input
                      type="radio"
                      name="production-goal"
                      value={goal}
                      checked={createForm.goal === goal}
                      onChange={() => setCreateForm({ ...createForm, goal })}
                    />
                    <span className="director-goal-card">
                      <span className="director-goal-index" aria-hidden="true">0{index + 1}</span>
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.description}</small>
                      </span>
                    </span>
                  </label>
                ))}
            </div>
          </fieldset>
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
            <div
              aria-live="polite"
              aria-label={`已完成 ${batchProgress.done} / ${batchProgress.total} 个镜头`}
            >
              <Progress percent={Math.round(batchProgress.done / batchProgress.total * 100)} />
            </div>
          )}
          {mediaKind === 'video' && state?.shots.some(shot => shot.videoCardId && !shot.imageUrl) && (
            <div className="director-media-warning"><ClockCircleOutlined /> 没有首帧图的镜头会等到图片完成后再生成。</div>
          )}
        </div>
      </Modal>
    </main>
  );
}
