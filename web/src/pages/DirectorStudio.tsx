// 快速制作：用户先选交付目标，再沿一条主线完成创意、剧本、分镜、图片、视频与成片。
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button, Empty, Input, Modal, Progress, Segmented, Select, Spin, Tag, Tooltip,
  Typography,
} from 'antd';
import {
  ArrowRightOutlined, CheckCircleFilled, CheckOutlined, ClockCircleOutlined,
  CloseOutlined, DownloadOutlined, EditOutlined, ExclamationCircleOutlined,
  FileTextOutlined, FolderOpenOutlined, HistoryOutlined, MenuOutlined,
  PictureOutlined, PlusOutlined, ReloadOutlined, RocketOutlined, SaveOutlined,
  SortAscendingOutlined, SyncOutlined, VideoCameraOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, type ProductionGoal } from '../api';
import { message } from '../ui';
import { readInputHabit, useInputHabit, writeInputHabit } from '../hooks/useInputHabit';
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
  imageReviewVerdict?: 'pass' | 'reject' | '';
  imageStale?: boolean;
  videoStale?: boolean;
}

interface DirectorState {
  project: Project;
  stages: StageState[];
  shots: ShotState[];
  totalUnits: number;
  overallProgress: number;
  nextAction: { kind: string; stage: string; label: string; count: number; issueId?: string };
  reviewCount: number;
  activeJobs: number;
  finalUrl: string;
  finalStale?: boolean;
  diagnostics?: {
    state: string;
    score: number;
    summary: string;
    blockerCount: number;
    warningCount: number;
  };
}

interface ProjectVersion {
  version_id?: string;
  id?: string;
  label?: string;
  reason?: string;
  summary?: string | Record<string, unknown>;
  created_at?: string;
  created_by?: string;
}

interface MediaModel {
  id: string;
  name: string;
  kind: MediaKind;
  description?: string;
  pricing?: Record<string, string | number>;
  supportedResolutions?: string[];
  supportedAspectRatios?: string[];
  isFree?: boolean;
  recommended?: boolean;
  recommendationReason?: string;
}

const ACTIVE_VIDEO_STATUSES = new Set([
  'pending', 'in_progress', 'queued', 'processing', 'running',
]);
const READY_VIDEO_STATUSES = new Set(['completed', 'complete', 'succeeded', 'success', 'done', 'ready']);

const REVIEW_REASON_OPTIONS = [
  { value: 'tone_off', label: '基调偏差' },
  { value: 'character_drift', label: '角色走形' },
  { value: 'composition_mismatch', label: '构图不符分镜' },
  { value: 'lighting_wrong', label: '光影错误' },
  { value: 'anatomy_broken', label: '结构崩坏' },
  { value: 'other', label: '其他' },
];

const VERSION_REASON_LABELS: Record<string, string> = {
  automatic: '系统自动保存',
  manual: '手动保存',
  before_restore: '版本回退前保护',
  generate_replace: 'AI 覆盖生成前保护',
  image_prompt_update: '镜头提示词修改前保护',
  card_update: '制作卡片修改前保护',
  shot_reorder: '镜头排序前保护',
};

const VERSION_STAGE_LABELS: Record<string, string> = {
  idea: '创意',
  script: '剧本',
  setting: '角色场景',
  design: '视觉设计',
  storyboard: '分镜',
  img_prompt: '图片提示词',
  vid_prompt: '视频提示词',
  img_gen: '镜头图片',
  vid_gen: '镜头视频',
  final: '成片',
};

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
  if (model?.isFree) return '免费';
  if (kind === 'image') return '付费 · 以 OpenRouter 实际结算为准';
  if (!model?.pricing || Object.keys(model.pricing).length === 0) return '价格以 OpenRouter 结算为准';
  if (kind === 'video') {
    const value = model.pricing['per-video-second'] ?? model.pricing['per_video_second'];
    if (value !== undefined) return `$${value} / 秒`;
  }
  const first = Object.entries(model.pricing)[0];
  return first ? `${first[0]} · $${first[1]}` : '价格以 OpenRouter 结算为准';
}

function safeMediaUrl(value: string) {
  if (!value) return '';
  try {
    const url = new URL(value, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function downloadFilename(name: string) {
  const safeName = name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').slice(0, 80);
  return `${safeName || '漫剧成片'}.mp4`;
}

function shotEpisodeKey(episode: number | null) {
  return episode === null ? 'global' : String(episode);
}

function versionIdentity(version: ProjectVersion) {
  return version.version_id || version.id || '';
}

function versionSummary(version: ProjectVersion) {
  if (!version.summary) return '';
  if (typeof version.summary === 'string') return version.summary;
  const parts: string[] = [];
  const description = version.summary.description;
  if (typeof description === 'string' && description.trim()) parts.push(description.trim());
  const cardCount = version.summary.card_count;
  if (typeof cardCount === 'number') parts.push(`${cardCount} 张制作卡片`);
  const stageCounts = version.summary.stage_counts;
  if (stageCounts && typeof stageCounts === 'object' && !Array.isArray(stageCounts)) {
    const stages = Object.entries(stageCounts)
      .map(([stage, count]) => `${VERSION_STAGE_LABELS[stage] || stage} ${String(count)}`)
      .join('、');
    if (stages) parts.push(stages);
  }
  const episodes = version.summary.episodes;
  if (Array.isArray(episodes) && episodes.length) {
    parts.push(`${episodes.length} 集`);
  }
  return parts.join(' · ');
}

function versionReasonLabel(reason?: string) {
  if (!reason) return '';
  return VERSION_REASON_LABELS[reason] || reason;
}

function versionTime(value?: string) {
  if (!value) return '时间未知';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
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
  const [createForm, setCreateForm] = useInputHabit('director.create-project', {
    name: '', source: '', format: 'gc', aspectRatio: '9:16', goal: 'images' as ProductionGoal,
  });
  const [productionGoal, setProductionGoal] = useState<ProductionGoal>('final');
  const [goalSaving, setGoalSaving] = useState(false);
  const [mediaKind, setMediaKind] = useState<MediaKind | null>(null);
  const [mediaModels, setMediaModels] = useState<MediaModel[]>([]);
  const [mediaModel, setMediaModel] = useState('');
  const [modelLoading, setModelLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });
  const [mediaTargetCardId, setMediaTargetCardId] = useState('');
  const [editingPromptCardId, setEditingPromptCardId] = useState('');
  const [promptDrafts, setPromptDrafts] = useState<Record<string, string>>({});
  const [promptBusy, setPromptBusy] = useState<Record<string, boolean>>({});
  const [cardMediaBusy, setCardMediaBusy] = useState<Record<string, MediaKind>>({});
  const [reviewBusy, setReviewBusy] = useState<Record<string, boolean>>({});
  const [rejectTargetCardId, setRejectTargetCardId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [reorderOpen, setReorderOpen] = useState(false);
  const [reorderEpisodeKey, setReorderEpisodeKey] = useState('');
  const [reorderDraft, setReorderDraft] = useState<number[]>([]);
  const [reorderBaseUpdatedAt, setReorderBaseUpdatedAt] = useState('');
  const [reorderBusy, setReorderBusy] = useState(false);
  const [draggedUnit, setDraggedUnit] = useState<number | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [snapshotBusy, setSnapshotBusy] = useState(false);
  const [restoreBusyId, setRestoreBusyId] = useState('');
  const [versionLabel, setVersionLabel] = useState('');
  const [versionReason, setVersionReason] = useState('');
  const [exportBusy, setExportBusy] = useState(false);
  const currentProjectRef = useRef(projectId);
  const videoStatusProjectRef = useRef('');
  const videoStatusRef = useRef<Record<string, string>>({});
  const notifiedVideoTransitionsRef = useRef(new Set<string>());
  const syncInFlightRef = useRef(false);
  const mediaModelRequestRef = useRef(0);
  const versionRequestRef = useRef(0);
  const reorderOperationRef = useRef(0);
  const versionOperationRef = useRef(0);
  const exportOperationRef = useRef(0);
  const reorderInFlightRef = useRef(false);
  const snapshotInFlightRef = useRef(false);
  const restoreInFlightRef = useRef(false);
  const restoreConfirmRef = useRef('');
  const exportInFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    // React StrictMode 会在开发环境执行一次 setup → cleanup → setup；
    // 每次 setup 都恢复挂载标记，避免首轮清理后永久拦截合法响应。
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      currentProjectRef.current = '';
      mediaModelRequestRef.current += 1;
    };
  }, []);

  useEffect(() => {
    currentProjectRef.current = projectId;
    mediaModelRequestRef.current += 1;
    setMediaKind(null);
    setMediaTargetCardId('');
    setEditingPromptCardId('');
    setPromptDrafts({});
    setRejectTargetCardId('');
    setRejectReason('');
    setRejectNote('');
    setReorderOpen(false);
    setReorderEpisodeKey('');
    setReorderDraft([]);
    setReorderBaseUpdatedAt('');
    setReorderBusy(false);
    setDraggedUnit(null);
    setVersionsOpen(false);
    setVersions([]);
    setVersionsLoading(false);
    setSnapshotBusy(false);
    setRestoreBusyId('');
    setVersionLabel('');
    setVersionReason('');
    setExportBusy(false);
    versionRequestRef.current += 1;
    reorderOperationRef.current += 1;
    versionOperationRef.current += 1;
    exportOperationRef.current += 1;
    reorderInFlightRef.current = false;
    snapshotInFlightRef.current = false;
    restoreInFlightRef.current = false;
    restoreConfirmRef.current = '';
    exportInFlightRef.current = false;
  }, [projectId]);

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

  const loadState = useCallback(async (
    pid = projectId,
    quiet = false,
    silentError = false,
  ): Promise<boolean> => {
    if (!pid) return false;
    if (!quiet) {
      setLoading(true);
      setLoadError('');
      setState(current => current?.project.project_id === pid ? current : null);
    }
    try {
      const data = await api.getDirectorState(pid);
      if (!mountedRef.current || currentProjectRef.current !== pid) return false;
      setState(data);
      setProductionGoal(data.project.production_goal || 'final');
      localStorage.setItem('director-project', pid);
      return true;
    } catch (error: any) {
      if (!mountedRef.current || currentProjectRef.current !== pid) return false;
      if (!quiet) setLoadError('暂时无法加载这个制作项目，请稍后重试');
      else if (!silentError) message.error(error.message);
      return false;
    } finally {
      if (!quiet && mountedRef.current && currentProjectRef.current === pid) setLoading(false);
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
    if (productionGoal === 'final') return Boolean(state.finalUrl && !state.finalStale);
    const target = state.stages.find(stage => stage.key === PRODUCTION_GOALS[productionGoal].targetStage);
    return Boolean(target && stagePercent(target) === 100);
  }, [state, productionGoal]);

  const reorderEpisodeOptions = useMemo(() => {
    if (!state) return [];
    const groups = new Map<string, { value: string; label: string; count: number }>();
    for (const shot of state.shots) {
      const key = shotEpisodeKey(shot.episode);
      const existing = groups.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        groups.set(key, {
          value: key,
          label: shot.episode === null ? '全片镜头' : `第 ${shot.episode} 集`,
          count: 1,
        });
      }
    }
    return [...groups.values()]
      .filter(group => group.count > 1)
      .map(({ value, label }) => ({ value, label }));
  }, [state]);

  const reorderSourceShots = useMemo(() => {
    if (!state || !reorderEpisodeKey) return [];
    return state.shots.filter(shot => shotEpisodeKey(shot.episode) === reorderEpisodeKey);
  }, [state, reorderEpisodeKey]);

  const reorderShots = useMemo(() => {
    const shotsByUnit = new Map(reorderSourceShots.map(shot => [shot.unit, shot]));
    return reorderDraft
      .map(unit => shotsByUnit.get(unit))
      .filter((shot): shot is ShotState => Boolean(shot));
  }, [reorderSourceShots, reorderDraft]);

  const reorderDirty = useMemo(() => (
    reorderSourceShots.length === reorderDraft.length
    && reorderSourceShots.some((shot, index) => shot.unit !== reorderDraft[index])
  ), [reorderSourceShots, reorderDraft]);

  const selectReorderEpisode = (key: string) => {
    const shots = state?.shots.filter(shot => shotEpisodeKey(shot.episode) === key) || [];
    setReorderEpisodeKey(key);
    setReorderDraft(shots.map(shot => shot.unit));
    setDraggedUnit(null);
  };

  const openReorder = () => {
    const firstEpisode = reorderEpisodeOptions[0]?.value;
    if (!state || !firstEpisode) return;
    selectReorderEpisode(firstEpisode);
    setReorderBaseUpdatedAt(state.project.updated_at);
    setReorderOpen(true);
  };

  const moveReorderUnit = (unit: number, nextIndex: number) => {
    setReorderDraft(current => {
      const currentIndex = current.indexOf(unit);
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= current.length || currentIndex === nextIndex) {
        return current;
      }
      const next = [...current];
      next.splice(currentIndex, 1);
      next.splice(nextIndex, 0, unit);
      return next;
    });
  };

  const dropReorderUnit = (targetUnit: number, sourceUnit = draggedUnit) => {
    if (sourceUnit === null || sourceUnit === targetUnit) {
      setDraggedUnit(null);
      return;
    }
    const targetIndex = reorderDraft.indexOf(targetUnit);
    moveReorderUnit(sourceUnit, targetIndex);
    setDraggedUnit(null);
  };

  const saveReorder = async () => {
    if (!projectId || !reorderEpisodeKey || !reorderDirty || reorderInFlightRef.current) return;
    const pid = projectId;
    const operationId = ++reorderOperationRef.current;
    const episode = reorderEpisodeKey === 'global' ? null : Number(reorderEpisodeKey);
    const orderedUnits = [...reorderDraft];
    reorderInFlightRef.current = true;
    setReorderBusy(true);
    try {
      await api.reorderDirectorShots(pid, {
        episode,
        ordered_units: orderedUnits,
        expected_project_updated_at: reorderBaseUpdatedAt || undefined,
      });
      if (!mountedRef.current || currentProjectRef.current !== pid || reorderOperationRef.current !== operationId) return;
      const refreshed = await loadState(pid, true);
      if (!mountedRef.current || currentProjectRef.current !== pid || reorderOperationRef.current !== operationId) return;
      setReorderOpen(false);
      setReorderEpisodeKey('');
      setReorderDraft([]);
      setReorderBaseUpdatedAt('');
      if (refreshed) {
        message.success('镜头顺序已保存并重新编号；旧成片已标记为需重新合成');
      } else {
        message.warning('镜头顺序已保存，但页面状态未刷新，请点击“刷新素材”查看最新顺序');
      }
    } catch (error: any) {
      if (mountedRef.current && currentProjectRef.current === pid && reorderOperationRef.current === operationId) {
        message.error(error.message || '镜头顺序保存失败，当前草稿仍保留');
      }
    } finally {
      if (mountedRef.current && currentProjectRef.current === pid && reorderOperationRef.current === operationId) {
        reorderInFlightRef.current = false;
        setReorderBusy(false);
      }
    }
  };

  const loadVersions = useCallback(async (pid = projectId) => {
    if (!pid) return;
    const requestId = ++versionRequestRef.current;
    setVersionsLoading(true);
    try {
      const response = await api.listProjectVersions(pid);
      const items = (Array.isArray(response)
        ? response
        : ((response as any)?.versions || (response as any)?.items || [])) as ProjectVersion[];
      if (
        mountedRef.current
        && currentProjectRef.current === pid
        && versionRequestRef.current === requestId
      ) {
        setVersions(items);
      }
    } catch (error: any) {
      if (
        mountedRef.current
        && currentProjectRef.current === pid
        && versionRequestRef.current === requestId
      ) {
        message.error(error.message || '版本历史暂时无法加载');
      }
    } finally {
      if (
        mountedRef.current
        && currentProjectRef.current === pid
        && versionRequestRef.current === requestId
      ) {
        setVersionsLoading(false);
      }
    }
  }, [projectId]);

  const openVersions = () => {
    if (!projectId) return;
    setVersionsOpen(true);
    setVersionLabel('');
    setVersionReason('');
    void loadVersions(projectId);
  };

  const createSnapshot = async () => {
    if (
      !projectId
      || snapshotInFlightRef.current
      || restoreInFlightRef.current
      || Boolean(restoreConfirmRef.current)
    ) return;
    const pid = projectId;
    const operationId = ++versionOperationRef.current;
    snapshotInFlightRef.current = true;
    setSnapshotBusy(true);
    try {
      await api.createProjectVersion(pid, {
        ...(versionLabel.trim() ? { label: versionLabel.trim() } : {}),
        ...(versionReason.trim() ? { reason: versionReason.trim() } : {}),
      });
      if (!mountedRef.current || currentProjectRef.current !== pid || versionOperationRef.current !== operationId) return;
      setVersionLabel('');
      setVersionReason('');
      message.success('当前制作状态已保存为一个可回退版本');
      await loadVersions(pid);
    } catch (error: any) {
      if (mountedRef.current && currentProjectRef.current === pid && versionOperationRef.current === operationId) {
        message.error(error.message || '保存版本失败，请稍后重试');
      }
    } finally {
      if (mountedRef.current && currentProjectRef.current === pid && versionOperationRef.current === operationId) {
        snapshotInFlightRef.current = false;
        setSnapshotBusy(false);
      }
    }
  };

  const confirmRestoreVersion = (version: ProjectVersion) => {
    const versionId = versionIdentity(version);
    if (
      !projectId
      || !versionId
      || snapshotInFlightRef.current
      || restoreInFlightRef.current
      || restoreConfirmRef.current
    ) return;
    const pid = projectId;
    restoreConfirmRef.current = versionId;
    Modal.confirm({
      title: `回退到${version.label ? `“${version.label}”` : '这个版本'}？`,
      content: '当前状态会先自动保存，再恢复所选版本。恢复后新增的图片或视频文件不会被删除。',
      okText: '确认回退',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onCancel: () => {
        if (restoreConfirmRef.current === versionId) restoreConfirmRef.current = '';
      },
      onOk: async () => {
        if (currentProjectRef.current !== pid) return;
        const operationId = ++versionOperationRef.current;
        restoreInFlightRef.current = true;
        setRestoreBusyId(versionId);
        try {
          await api.restoreProjectVersion(pid, versionId);
          if (!mountedRef.current || currentProjectRef.current !== pid || versionOperationRef.current !== operationId) return;
          const refreshed = await loadState(pid, true);
          await loadVersions(pid);
          if (!mountedRef.current || currentProjectRef.current !== pid || versionOperationRef.current !== operationId) return;
          if (refreshed) {
            message.success('已恢复所选版本，回退前状态也已自动留档');
          } else {
            message.warning('版本已恢复且回退前状态已留档，但页面刷新失败，请手动刷新素材');
          }
        } catch (error: any) {
          if (mountedRef.current && currentProjectRef.current === pid && versionOperationRef.current === operationId) {
            message.error(error.message || '版本回退失败，当前状态未改变');
          }
        } finally {
          if (mountedRef.current && currentProjectRef.current === pid && versionOperationRef.current === operationId) {
            restoreInFlightRef.current = false;
            restoreConfirmRef.current = '';
            setRestoreBusyId('');
          }
        }
      },
    });
  };

  const exportProject = async () => {
    if (!projectId || exportInFlightRef.current) return;
    const pid = projectId;
    const operationId = ++exportOperationRef.current;
    exportInFlightRef.current = true;
    setExportBusy(true);
    try {
      await api.downloadProjectExport(pid);
      if (!mountedRef.current || currentProjectRef.current !== pid || exportOperationRef.current !== operationId) return;
      message.success('项目备份已开始下载');
    } catch (error: any) {
      if (mountedRef.current && currentProjectRef.current === pid && exportOperationRef.current === operationId) {
        message.error(error.message || '项目导出失败，请稍后重试');
      }
    } finally {
      if (mountedRef.current && currentProjectRef.current === pid && exportOperationRef.current === operationId) {
        exportInFlightRef.current = false;
        setExportBusy(false);
      }
    }
  };

  const syncJobs = useCallback(async (quiet = false) => {
    if (!state || !projectId || syncInFlightRef.current) return;
    const syncingProjectId = projectId;
    const active = state.shots.filter(shot =>
      shot.videoCardId && shot.videoJob && ACTIVE_VIDEO_STATUSES.has(shot.videoJob.status),
    );
    if (!active.length) return;
    syncInFlightRef.current = true;
    if (!quiet) setBusy('sync');
    try {
      for (const shot of active) {
        if (currentProjectRef.current !== syncingProjectId) break;
        await api.syncDirectorVideo(syncingProjectId, shot.videoCardId);
      }
      if (currentProjectRef.current === syncingProjectId) {
        await loadState(syncingProjectId, true);
      }
      if (!quiet && mountedRef.current && currentProjectRef.current === syncingProjectId) {
        message.success('视频任务已同步');
      }
    } catch (error: any) {
      if (!quiet && mountedRef.current) message.error(error.message);
    } finally {
      syncInFlightRef.current = false;
      if (!quiet && mountedRef.current) setBusy('');
    }
  }, [state, projectId, loadState]);

  useEffect(() => {
    if (!state?.shots.some(shot => shot.videoJob && ACTIVE_VIDEO_STATUSES.has(shot.videoJob.status))) return;
    const timer = window.setInterval(() => {
      // 同步接口会查询 OpenRouter 并仅在状态变化时落库；in-flight 锁避免慢请求重叠。
      void syncJobs(true);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [state?.shots, syncJobs]);

  useEffect(() => {
    if (!state || !projectId) return;
    const currentStatuses: Record<string, string> = {};
    for (const shot of state.shots) {
      if (!shot.videoCardId) continue;
      const status = shot.videoUrl ? 'ready' : (shot.videoJob?.status || '');
      currentStatuses[shot.videoCardId] = status;
    }

    if (videoStatusProjectRef.current !== projectId) {
      videoStatusProjectRef.current = projectId;
      videoStatusRef.current = currentStatuses;
      notifiedVideoTransitionsRef.current = new Set();
      return;
    }

    for (const shot of state.shots) {
      if (!shot.videoCardId) continue;
      const previous = videoStatusRef.current[shot.videoCardId];
      const current = currentStatuses[shot.videoCardId];
      if (!previous || !ACTIVE_VIDEO_STATUSES.has(previous) || ACTIVE_VIDEO_STATUSES.has(current)) continue;
      const transitionKey = `${projectId}:${shot.videoJob?.id || shot.videoCardId}:${current}`;
      if (notifiedVideoTransitionsRef.current.has(transitionKey)) continue;
      notifiedVideoTransitionsRef.current.add(transitionKey);
      if (current === 'failed') {
        message.error(`镜头 G${shot.unit} 视频生成失败${shot.videoJob?.error ? `：${shot.videoJob.error}` : ''}`);
      } else if (shot.videoUrl || READY_VIDEO_STATUSES.has(current)) {
        message.success(`镜头 G${shot.unit} 视频生成完成`);
      }
    }
    videoStatusRef.current = currentStatuses;
  }, [state, projectId]);

  const openMedia = async (kind: MediaKind, shot?: ShotState) => {
    if (shot && kind === 'image' && editingPromptCardId === shot.imageCardId) {
      const draft = promptDrafts[shot.imageCardId] ?? shot.imagePrompt;
      if (draft.trim() !== shot.imagePrompt.trim()) {
        message.warning('请先保存或取消提示词修改，再生成这张图片');
        return;
      }
    }
    setMediaKind(kind);
    setMediaTargetCardId(shot ? (kind === 'image' ? shot.imageCardId : shot.videoCardId) : '');
    setModelLoading(true);
    setMediaModels([]);
    const rememberedModel = readInputHabit(`director.media-model.${kind}`, '');
    setMediaModel(rememberedModel);
    const requestId = ++mediaModelRequestRef.current;
    const mediaProjectId = projectId;
    try {
      const models = await api.listDirectorMediaModels(kind);
      if (
        mediaModelRequestRef.current === requestId
        && currentProjectRef.current === mediaProjectId
      ) {
        setMediaModels(models);
        const recommendedModel = models.find(model => model.recommended) ?? models[0];
        setMediaModel(models.some(model => model.id === rememberedModel)
          ? rememberedModel
          : (recommendedModel?.id || ''));
      }
    } catch (error: any) {
      if (
        mediaModelRequestRef.current === requestId
        && currentProjectRef.current === mediaProjectId
      ) {
        message.error(error.message);
      }
    } finally {
      if (
        mediaModelRequestRef.current === requestId
        && currentProjectRef.current === mediaProjectId
      ) {
        setModelLoading(false);
      }
    }
  };

  const startPromptEdit = (shot: ShotState) => {
    if (!shot.imageCardId) return;
    setEditingPromptCardId(shot.imageCardId);
    setPromptDrafts(current => (
      Object.prototype.hasOwnProperty.call(current, shot.imageCardId)
        ? current
        : { ...current, [shot.imageCardId]: shot.imagePrompt }
    ));
  };

  const cancelPromptEdit = (cardId: string) => {
    setEditingPromptCardId('');
    setPromptDrafts(current => {
      const next = { ...current };
      delete next[cardId];
      return next;
    });
  };

  const savePrompt = async (shot: ShotState) => {
    const cardId = shot.imageCardId;
    const prompt = (promptDrafts[cardId] ?? shot.imagePrompt).trim();
    if (!prompt) {
      message.warning('图片提示词不能为空');
      return;
    }
    setPromptBusy(current => ({ ...current, [cardId]: true }));
    try {
      await api.updateDirectorImagePrompt(projectId, cardId, { prompt });
      await loadState(projectId, true);
      setEditingPromptCardId('');
      setPromptDrafts(current => {
        const next = { ...current };
        delete next[cardId];
        return next;
      });
      message.success(`镜头 G${shot.unit} 提示词已保存`);
    } catch (error: any) {
      message.error(`${error.message || '提示词保存失败'}；草稿仍保留，可直接重试`);
    } finally {
      setPromptBusy(current => {
        const next = { ...current };
        delete next[cardId];
        return next;
      });
    }
  };

  const submitReview = async (
    shot: ShotState,
    verdict: 'pass' | 'reject',
    reason = '',
    note = '',
  ) => {
    const cardId = shot.imageCardId;
    if (!cardId || !shot.imageUrl || reviewBusy[cardId]) return;
    setReviewBusy(current => ({ ...current, [cardId]: true }));
    try {
      await api.reviewCardImage(projectId, cardId, {
        verdict,
        image: shot.imageUrl,
        ...(verdict === 'reject' ? { reason, note: note.trim() } : {}),
      });
      await loadState(projectId, true);
      message.success(verdict === 'pass' ? `镜头 G${shot.unit} 已通过` : `镜头 G${shot.unit} 已退回`);
      if (verdict === 'reject') {
        setRejectTargetCardId('');
        setRejectReason('');
        setRejectNote('');
      }
      return true;
    } catch (error: any) {
      message.error(error.message || '审核提交失败，请稍后重试');
      return false;
    } finally {
      setReviewBusy(current => {
        const next = { ...current };
        delete next[cardId];
        return next;
      });
    }
  };

  const runNext = async () => {
    if (!state || !projectId || goalReached) return;
    const next = state.nextAction;
    if (next.kind === 'review') {
      navigate(`/production/${projectId}/matrix`);
      return;
    }
    if (next.kind === 'optimize' && next.issueId) {
      setBusy(`optimize-${next.stage}`);
      try {
        const result = await api.optimizeProjectIssue(projectId, next.issueId);
        if (result.resolved) {
          message.success(`${next.label}完成，健康分 ${result.beforeScore} → ${result.afterScore}`);
        } else {
          message.warning(result.summary);
        }
        await loadState(projectId, true);
      } catch (error: any) {
        message.error(error.message || '定向返工失败，请刷新后重试');
      } finally {
        setBusy('');
      }
      return;
    }
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
      setCreateForm(current => ({ ...current, name: '', source: '' }));
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
    if (mediaTargetCardId) {
      const target = state.shots.find(shot => (
        mediaKind === 'image'
          ? shot.imageCardId === mediaTargetCardId
          : shot.videoCardId === mediaTargetCardId
      ));
      if (!target) return [];
      if (mediaKind === 'video' && (!target.imageUrl || target.imageStale
        || (target.videoJob && ACTIVE_VIDEO_STATUSES.has(target.videoJob.status)))) return [];
      return [target];
    }
    return state.shots.filter(shot => mediaKind === 'image'
      ? Boolean(
        shot.imageCardId
        && (!shot.imageUrl || shot.imageStale || shot.reviewCount > 0 || shot.imageReviewVerdict === 'reject'),
      )
      : Boolean(
        shot.videoCardId
        && shot.imageUrl
        && !shot.imageStale
        && (!shot.videoUrl || shot.videoStale)
        && !(shot.videoJob && ACTIVE_VIDEO_STATUSES.has(shot.videoJob.status)),
      ));
  }, [state, mediaKind, mediaTargetCardId]);

  const selectedModel = mediaModels.find(model => model.id === mediaModel);
  const rejectTarget = state?.shots.find(shot => shot.imageCardId === rejectTargetCardId);
  const finalMediaUrl = safeMediaUrl(state?.finalUrl || '');
  const finalMediaIsCrossOrigin = useMemo(() => {
    if (!finalMediaUrl) return false;
    try {
      return new URL(finalMediaUrl).origin !== window.location.origin;
    } catch {
      return false;
    }
  }, [finalMediaUrl]);

  const startMediaBatch = () => {
    if (!state || !projectId || !mediaKind || !mediaModel || !pendingShots.length) return;
    const requestedKind = mediaKind;
    const requestedModel = mediaModel;
    const requestedShots = [...pendingShots];
    const requestedTargetCardId = mediaTargetCardId;
    const singleShot = Boolean(requestedTargetCardId);
    Modal.confirm({
      title: singleShot
        ? `${requestedKind === 'image' ? '重新生成图片' : '生成视频'} · G${requestedShots[0].unit}`
        : requestedKind === 'image'
          ? `生成 ${requestedShots.length} 张镜头图`
          : `提交 ${requestedShots.length} 个视频任务`,
      content: `${selectedModel?.name || requestedModel} · ${modelPriceLabel(selectedModel, requestedKind)}。本操作会消耗 OpenRouter 额度。`,
      okText: '确认生成',
      cancelText: '取消',
      onOk: async () => {
        if (singleShot) {
          setCardMediaBusy(current => ({ ...current, [requestedTargetCardId]: requestedKind }));
        } else {
          setBusy(`batch-${requestedKind}`);
        }
        setBatchProgress({ done: 0, total: requestedShots.length });
        let staleResults = 0;
        try {
          for (let index = 0; index < requestedShots.length; index += 1) {
            const shot = requestedShots[index];
            if (requestedKind === 'image') {
              const result = await api.generateDirectorImage(projectId, shot.imageCardId, {
                model: requestedModel,
                prompt: shot.imagePrompt,
                resolution: '1K',
                aspect_ratio: state.project.aspect_ratio,
              });
              if (result?.stale || result?.applied === false) staleResults += 1;
            } else {
              const result = await api.generateDirectorVideo(projectId, shot.videoCardId, {
                model: requestedModel,
                prompt: shot.videoPrompt,
                duration: shot.durationSeconds,
                resolution: '720p',
                aspect_ratio: state.project.aspect_ratio,
                image_url: shot.imageUrl,
                generate_audio: true,
              });
              if (result?.stale || result?.applied === false) staleResults += 1;
            }
            setBatchProgress({ done: index + 1, total: requestedShots.length });
          }
          setMediaKind(null);
          setMediaTargetCardId('');
          if (staleResults > 0) {
            message.warning(
              `${staleResults} 个结果返回前镜头内容已变化，未设为当前版本；请按最新提示词重新生成`,
            );
          } else {
            message.success(singleShot
              ? `镜头 G${requestedShots[0].unit} ${requestedKind === 'image' ? '图片已重新生成' : '视频任务已提交'}`
              : requestedKind === 'image' ? '镜头图片已生成' : '视频任务已全部提交');
          }
          await loadState(projectId, true);
        } catch (error: any) {
          message.error(error.message);
          await loadState(projectId, true);
          throw error;
        } finally {
          if (singleShot) {
            setCardMediaBusy(current => {
              const next = { ...current };
              delete next[requestedTargetCardId];
              return next;
            });
          } else {
            setBusy('');
          }
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
                {state.reviewCount > 0 && <span className="is-warning">{state.reviewCount} 项待返工</span>}
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
                <div><strong>{state.reviewCount}</strong><span>待返工镜头</span></div>
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
              {state.finalStale && (
                <span className="director-stale-note">旧成片已过期，完成镜头视频后可重新合成。</span>
              )}
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
              <Button icon={<HistoryOutlined />} onClick={openVersions}>版本历史</Button>
              <Button
                icon={<DownloadOutlined />}
                loading={exportBusy}
                onClick={() => void exportProject()}
              >
                导出项目
              </Button>
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

          {finalMediaUrl && (
            <section className="director-final">
              <div className="director-section-heading">
                <div><Text className="director-section-kicker">最新成片</Text><Title level={3}>成片预览</Title></div>
                <div className="director-final-actions">
                  <Tag
                    color={state.finalStale ? 'warning' : 'success'}
                    icon={state.finalStale ? <ExclamationCircleOutlined /> : <CheckCircleFilled />}
                  >
                    {state.finalStale ? '旧成片已过期' : '已合成'}
                  </Tag>
                  <a
                    className="director-download-button"
                    href={finalMediaUrl}
                    download={downloadFilename(state.project.name)}
                    {...(finalMediaIsCrossOrigin
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    aria-label={`下载成片：${state.project.name}`}
                    title={finalMediaIsCrossOrigin ? '跨域文件将在安全的新窗口中打开' : undefined}
                  >
                    <DownloadOutlined aria-hidden="true" />
                    下载成片
                  </a>
                </div>
              </div>
              <div className="director-final-frame">
                <video src={finalMediaUrl} controls playsInline aria-label={`${state.project.name} 成片预览`} />
              </div>
              {state.finalStale && (
                <p className="director-final-stale" role="status">
                  当前预览仍可查看，但不含最新镜头图片。完成镜头视频后请重新合成。
                </p>
              )}
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
                <Button
                  icon={<SortAscendingOutlined />}
                  disabled={reorderEpisodeOptions.length === 0}
                  onClick={openReorder}
                >
                  调整顺序
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => loadState(projectId)}>刷新素材</Button>
              </div>
            </div>
            {state.shots.length === 0 ? (
              <Empty image={<img src="/empty-data.svg" alt="" width={160} />} description="剧本生成后，镜头会出现在这里" />
            ) : (
              <div className="director-shot-grid">
                {state.shots.map(shot => {
                  const jobActive = Boolean(shot.videoJob && ACTIVE_VIDEO_STATUSES.has(shot.videoJob.status));
                  const promptEditing = editingPromptCardId === shot.imageCardId;
                  const promptDraft = promptDrafts[shot.imageCardId] ?? shot.imagePrompt;
                  const promptDirty = promptDraft.trim() !== shot.imagePrompt.trim();
                  const savingPrompt = Boolean(promptBusy[shot.imageCardId]);
                  const generatingImage = cardMediaBusy[shot.imageCardId] === 'image';
                  const generatingVideo = cardMediaBusy[shot.videoCardId] === 'video';
                  const reviewing = Boolean(reviewBusy[shot.imageCardId]);
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
                        <div className="director-shot-media-state">
                          {shot.imageStale ? '画面需重做' : shot.videoStale ? '视频需重做' : shot.videoUrl ? '视频' : shot.imageUrl ? '画面' : '脚本'}
                        </div>
                      </div>
                      <div className="director-shot-body">
                        <strong className="director-shot-title">{shot.title}</strong>
                        {shot.script && <p className="director-shot-script">{shot.script}</p>}
                        <section className="director-shot-prompt" aria-labelledby={`shot-prompt-${shot.imageCardId || shot.unit}`}>
                          <div className="director-shot-prompt-heading">
                            <strong id={`shot-prompt-${shot.imageCardId || shot.unit}`}>画面提示词</strong>
                            {!promptEditing && shot.imageCardId && (
                              <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => startPromptEdit(shot)}
                                disabled={savingPrompt || generatingImage || reviewing}
                                aria-label={`编辑镜头 G${shot.unit} 的画面提示词`}
                              >
                                编辑
                              </Button>
                            )}
                          </div>
                          {promptEditing ? (
                            <>
                              <TextArea
                                value={promptDraft}
                                autoSize={{ minRows: 3, maxRows: 8 }}
                                maxLength={4000}
                                onChange={event => setPromptDrafts(current => ({
                                  ...current,
                                  [shot.imageCardId]: event.target.value,
                                }))}
                                disabled={savingPrompt}
                                aria-label={`镜头 G${shot.unit} 的画面提示词`}
                              />
                              <div className="director-shot-prompt-actions">
                                <Button
                                  size="small"
                                  type="primary"
                                  icon={<CheckOutlined />}
                                  loading={savingPrompt}
                                  disabled={!promptDirty || !promptDraft.trim()}
                                  onClick={() => void savePrompt(shot)}
                                >
                                  保存
                                </Button>
                                <Button
                                  size="small"
                                  icon={<CloseOutlined />}
                                  disabled={savingPrompt}
                                  onClick={() => cancelPromptEdit(shot.imageCardId)}
                                >
                                  取消
                                </Button>
                              </div>
                            </>
                          ) : (
                            <p>{shot.imagePrompt || '还没有画面提示词'}</p>
                          )}
                        </section>
                        <div className="director-shot-status">
                          <Tag color={shot.imageStale ? 'warning' : shot.imageUrl ? 'success' : 'default'}>
                            {shot.imageStale ? '提示词已更新，需重做画面' : shot.imageUrl ? '画面就绪' : '等待画面'}
                          </Tag>
                          <Tag color={shot.videoStale ? 'warning' : shot.videoUrl ? 'success' : jobActive ? 'processing' : 'default'}>
                            {shot.videoStale
                              ? '图片已更新，需重做视频'
                              : shot.videoUrl ? '视频就绪' : jobActive ? '视频生成中' : '等待视频'}
                          </Tag>
                          {shot.reviewCount > 0 && <Tag color="warning">待返工 {shot.reviewCount}</Tag>}
                          {!shot.imageStale && shot.imageReviewVerdict === 'pass' && <Tag color="success">画面已通过</Tag>}
                          {!shot.imageStale && shot.imageReviewVerdict === 'reject' && <Tag color="error">画面已退回</Tag>}
                        </div>
                        {shot.videoJob?.status === 'failed' && (
                          <div className="director-shot-error"><ExclamationCircleOutlined /> {shot.videoJob.error || '视频生成失败'}</div>
                        )}
                        <div className="director-shot-actions" aria-label={`镜头 G${shot.unit} 操作`}>
                          {shot.imageCardId && (
                            <Tooltip title={promptEditing && promptDirty ? '请先保存或取消提示词修改' : ''}>
                              <span>
                                <Button
                                  size="small"
                                  icon={<PictureOutlined />}
                                  loading={generatingImage}
                                  disabled={savingPrompt || reviewing || (promptEditing && promptDirty)}
                                  onClick={() => void openMedia('image', shot)}
                                >
                                  {shot.imageUrl ? '重新生成图片' : '生成图片'}
                                </Button>
                              </span>
                            </Tooltip>
                          )}
                          {shot.videoCardId && (
                            <Tooltip title={!shot.imageUrl || shot.imageStale ? '先按最新提示词生成这张镜头图片' : ''}>
                              <span>
                                <Button
                                  size="small"
                                  icon={<VideoCameraOutlined />}
                                  loading={generatingVideo || jobActive}
                                  disabled={!shot.imageUrl || shot.imageStale || jobActive}
                                  onClick={() => void openMedia('video', shot)}
                                >
                                  {shot.videoStale
                                    ? '重做视频'
                                    : shot.videoJob?.status === 'failed'
                                    ? '重试视频'
                                    : shot.videoUrl ? '重新生成视频' : '生成视频'}
                                </Button>
                              </span>
                            </Tooltip>
                          )}
                          {shot.imageUrl && shot.imageCardId && !shot.imageStale && (
                            <>
                              <Button
                                size="small"
                                type={shot.imageReviewVerdict === 'pass' ? 'primary' : 'default'}
                                icon={<CheckOutlined />}
                                loading={reviewing}
                                disabled={savingPrompt || generatingImage}
                                onClick={() => void submitReview(shot, 'pass')}
                              >
                                通过
                              </Button>
                              <Button
                                size="small"
                                danger
                                icon={<CloseOutlined />}
                                disabled={reviewing || savingPrompt || generatingImage}
                                onClick={() => {
                                  setRejectTargetCardId(shot.imageCardId);
                                  setRejectReason('');
                                  setRejectNote('');
                                }}
                              >
                                退回
                              </Button>
                            </>
                          )}
                        </div>
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
        open={reorderOpen}
        title="调整镜头顺序"
        okText="保存新顺序"
        cancelText="取消"
        confirmLoading={reorderBusy}
        okButtonProps={{ disabled: !reorderDirty || reorderShots.length < 2 }}
        onOk={() => void saveReorder()}
        onCancel={() => {
          if (reorderBusy) return;
          setReorderOpen(false);
          setReorderEpisodeKey('');
          setReorderDraft([]);
          setReorderBaseUpdatedAt('');
          setDraggedUnit(null);
        }}
        width={isMobile ? 'calc(100vw - 24px)' : 680}
      >
        <div className="director-reorder-dialog">
          <div className="director-reorder-warning" role="note">
            <ExclamationCircleOutlined />
            <span>保存后镜头会按新顺序重新编号，已有成片会标记为过期，需要重新合成。</span>
          </div>
          {reorderEpisodeOptions.length > 1 && (
            <label>
              选择集数
              <Select
                value={reorderEpisodeKey}
                options={reorderEpisodeOptions}
                disabled={reorderBusy}
                onChange={selectReorderEpisode}
                aria-label="选择要调整顺序的集数"
              />
            </label>
          )}
          <div className="director-reorder-help">
            拖动镜头改变顺序；手机或键盘操作可使用每行的上移、下移按钮。
          </div>
          <div className="director-reorder-list" role="list" aria-label="镜头排序草稿">
            {reorderShots.map((shot, index) => (
              <div
                key={shot.unit}
                role="listitem"
                className={`director-reorder-row ${draggedUnit === shot.unit ? 'is-dragging' : ''}`}
                draggable={!reorderBusy}
                onDragStart={event => {
                  setDraggedUnit(shot.unit);
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', String(shot.unit));
                }}
                onDragOver={event => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }}
                onDrop={event => {
                  event.preventDefault();
                  const transferredValue = event.dataTransfer.getData('text/plain');
                  const transferredUnit = Number(transferredValue);
                  dropReorderUnit(
                    shot.unit,
                    transferredValue && Number.isFinite(transferredUnit) ? transferredUnit : draggedUnit,
                  );
                }}
                onDragEnd={() => setDraggedUnit(null)}
              >
                <span className="director-reorder-handle" aria-hidden="true"><MenuOutlined /></span>
                <span className="director-reorder-position">{index + 1}</span>
                <div className="director-reorder-copy">
                  <strong>G{shot.unit} · {shot.title || '未命名镜头'}</strong>
                  <span>{shot.script || shot.imagePrompt || '暂无镜头说明'}</span>
                </div>
                <div className="director-reorder-controls" aria-label={`移动镜头 G${shot.unit}`}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={reorderBusy || index === 0}
                    onClick={() => moveReorderUnit(shot.unit, index - 1)}
                    aria-label={`上移镜头 G${shot.unit}`}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={reorderBusy || index === reorderShots.length - 1}
                    onClick={() => moveReorderUnit(shot.unit, index + 1)}
                    aria-label={`下移镜头 G${shot.unit}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={versionsOpen}
        title="版本历史"
        footer={null}
        onCancel={() => {
          if (snapshotBusy || restoreBusyId || restoreConfirmRef.current) return;
          setVersionsOpen(false);
          versionRequestRef.current += 1;
        }}
        width={isMobile ? 'calc(100vw - 24px)' : 720}
      >
        <div className="director-versions-dialog">
          <section className="director-version-create" aria-labelledby="director-version-create-title">
            <div>
              <strong id="director-version-create-title">保存当前版本</strong>
              <span>关键修改前系统会自动留档，也可以在这里手动添加一个容易辨认的节点。</span>
            </div>
            <div className="director-version-create-fields">
              <Input
                value={versionLabel}
                maxLength={60}
                disabled={snapshotBusy || Boolean(restoreBusyId)}
                placeholder="版本名称（可选），例如：客户初审版"
                onChange={event => setVersionLabel(event.target.value)}
                aria-label="版本名称"
              />
              <Input
                value={versionReason}
                maxLength={120}
                disabled={snapshotBusy || Boolean(restoreBusyId)}
                placeholder="保存原因（可选）"
                onChange={event => setVersionReason(event.target.value)}
                aria-label="版本保存原因"
              />
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={snapshotBusy}
                disabled={Boolean(restoreBusyId)}
                onClick={() => void createSnapshot()}
              >
                保存当前版本
              </Button>
            </div>
          </section>
          <section className="director-version-history" aria-label="可回退版本列表">
            <div className="director-version-history-heading">
              <strong>历史版本</strong>
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                loading={versionsLoading}
                disabled={snapshotBusy || Boolean(restoreBusyId)}
                onClick={() => void loadVersions(projectId)}
              >
                刷新
              </Button>
            </div>
            {versionsLoading && versions.length === 0 ? (
              <div className="director-version-loading"><Spin /></div>
            ) : versions.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有可回退版本" />
            ) : (
              <div className="director-version-list">
                {[...versions]
                  .sort((left, right) => (
                    new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime()
                  ))
                  .map(version => {
                    const versionId = versionIdentity(version);
                    const summary = versionSummary(version);
                    return (
                      <article key={`${versionId}-${version.created_at || ''}`} className="director-version-card">
                        <div className="director-version-copy">
                          <div className="director-version-title">
                            <strong>{version.label || '自动保存版本'}</strong>
                            <time dateTime={version.created_at}>{versionTime(version.created_at)}</time>
                          </div>
                          {version.reason && <p>{versionReasonLabel(version.reason)}</p>}
                          {summary && <span>{summary}</span>}
                          {version.created_by && <small>保存人：{version.created_by}</small>}
                        </div>
                        <Button
                          danger
                          size="small"
                          loading={restoreBusyId === versionId}
                          disabled={!versionId || snapshotBusy || Boolean(restoreBusyId && restoreBusyId !== versionId)}
                          onClick={() => confirmRestoreVersion(version)}
                        >
                          回退到这里
                        </Button>
                      </article>
                    );
                  })}
              </div>
            )}
          </section>
        </div>
      </Modal>

      <Modal
        open={Boolean(rejectTarget)}
        title={rejectTarget ? `退回镜头 G${rejectTarget.unit}` : '退回镜头'}
        okText="确认退回"
        cancelText="取消"
        okButtonProps={{ danger: true, disabled: !rejectReason }}
        confirmLoading={Boolean(rejectTarget && reviewBusy[rejectTarget.imageCardId])}
        onOk={() => {
          if (rejectTarget && rejectReason) {
            void submitReview(rejectTarget, 'reject', rejectReason, rejectNote);
          }
        }}
        onCancel={() => {
          if (rejectTarget && reviewBusy[rejectTarget.imageCardId]) return;
          setRejectTargetCardId('');
          setRejectReason('');
          setRejectNote('');
        }}
        width={isMobile ? 'calc(100vw - 24px)' : 520}
      >
        <div className="director-review-dialog">
          <p>选择问题原因并记录到审核历史，便于修改提示词或重新生成。</p>
          <label>
            退回原因
            <Select
              value={rejectReason || undefined}
              placeholder="请选择主要问题"
              options={REVIEW_REASON_OPTIONS}
              onChange={setRejectReason}
              aria-label="选择镜头退回原因"
            />
          </label>
          <label>
            补充说明（可选）
            <TextArea
              value={rejectNote}
              maxLength={500}
              autoSize={{ minRows: 3, maxRows: 6 }}
              placeholder="例如：人物应看向画面右侧"
              onChange={event => setRejectNote(event.target.value)}
              aria-label="镜头退回补充说明"
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={Boolean(mediaKind)}
        title={mediaTargetCardId && pendingShots[0]
          ? `${mediaKind === 'image' ? '生成图片' : '生成视频'} · G${pendingShots[0].unit}`
          : mediaKind === 'image' ? '生成镜头图片' : '生成镜头视频'}
        okText={mediaTargetCardId
          ? mediaKind === 'image' ? '重新生成图片' : '提交这个视频'
          : mediaKind === 'image' ? '生成图片' : '提交视频任务'}
        cancelText="取消"
        okButtonProps={{ disabled: !mediaModel || pendingShots.length === 0 }}
        confirmLoading={busy.startsWith('batch-') || Boolean(mediaTargetCardId && cardMediaBusy[mediaTargetCardId])}
        onOk={startMediaBatch}
        onCancel={() => {
          if (busy.startsWith('batch-') || (mediaTargetCardId && cardMediaBusy[mediaTargetCardId])) return;
          setMediaKind(null);
          setMediaTargetCardId('');
        }}
        width={isMobile ? 'calc(100vw - 24px)' : 620}
      >
        <div className="director-media-dialog">
          <div className="director-media-summary">
            <strong>{mediaTargetCardId && pendingShots[0]
              ? `镜头 G${pendingShots[0].unit}`
              : `${pendingShots.length} 个待生成镜头`}</strong>
            <span>{mediaKind === 'image' ? '1K · 项目画幅' : '720p · 首帧转视频 · 同步音频'}</span>
          </div>
          <label>OpenRouter 模型</label>
          {mediaKind === 'image' && mediaModels.length > 0 && !mediaModels.some(model => model.isFree) && (
            <div className="director-media-warning">
              OpenRouter 当前没有免费生图模型；已优先推荐低成本且支持多张角色参考图的模型。
            </div>
          )}
          <Select
            showSearch
            loading={modelLoading}
            value={mediaModel || undefined}
            onChange={value => {
              setMediaModel(value);
              if (mediaKind) writeInputHabit(`director.media-model.${mediaKind}`, value);
            }}
            placeholder="选择模型"
            optionFilterProp="label"
            options={mediaModels.map(model => ({
              value: model.id,
              label: `${model.recommended ? '推荐 · ' : ''}${model.name} · ${modelPriceLabel(model, mediaKind || 'image')}`,
            }))}
          />
          {selectedModel && (
            <Text type="secondary">
              {selectedModel.recommendationReason || modelPriceLabel(selectedModel, mediaKind || 'image')}
            </Text>
          )}
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
