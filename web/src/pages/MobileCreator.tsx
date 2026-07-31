// 手机灵感随手拍：用连续对话收集想法，并复用现有员工、项目与逐镜媒体生产能力。
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Empty,
  Input,
  Modal,
  Progress,
  Segmented,
  Select,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  AudioOutlined,
  BulbOutlined,
  CameraOutlined,
  CheckCircleFilled,
  DesktopOutlined,
  FireOutlined,
  FolderOpenOutlined,
  LoadingOutlined,
  MessageOutlined,
  PaperClipOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  RocketOutlined,
  SendOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import {
  api,
  type ProductionGoal,
  type VisualQualityProfile,
  type VisualQualityRatings,
} from '../api';
import HelpHint from '../components/HelpHint';
import { message } from '../ui';
import './MobileCreator.css';

const { Text, Title } = Typography;
const { TextArea } = Input;

type MobileTab = 'idea' | 'progress' | 'projects';
type MessageRole = 'assistant' | 'user';
type MediaKind = 'image' | 'video';

type ConversationMessage = {
  id: string;
  role: MessageRole;
  content: string;
  streaming?: boolean;
};

type MobileProject = {
  project_id: string;
  name: string;
  description?: string;
  source_type: string;
  updated_at: string;
  production_goal: ProductionGoal;
  aspect_ratio: string;
};

type MediaModel = {
  id: string;
  name: string;
  description?: string;
  isFree?: boolean;
  recommended?: boolean;
  recommendationReason?: string;
  pricing?: Record<string, string | number>;
};

type VideoJob = {
  id?: string;
  status?: string;
  error?: string;
};

type MobileShot = {
  episode: number | null;
  unit: number;
  title: string;
  imageCardId: string;
  imagePrompt: string;
  imageUrl: string;
  imageStale?: boolean;
  imageReviewVerdict?: 'pass' | 'reject' | '';
  imageQualityRequired?: boolean;
  imageQualityPassed?: boolean | null;
  imageQualityScore?: number | null;
  videoCardId: string;
  videoPrompt: string;
  videoUrl: string;
  videoCandidateUrl?: string;
  videoStale?: boolean;
  videoReviewVerdict?: 'pass' | 'reject' | '';
  videoQualityRequired?: boolean;
  videoQualityPassed?: boolean | null;
  videoQualityScore?: number | null;
  videoJob?: VideoJob | null;
  durationSeconds: number;
};

type MobileDirectorState = {
  project: MobileProject & { team_code?: string };
  stages: { key: string; name: string; done: number; total: number }[];
  shots: MobileShot[];
  overallProgress: number;
  totalUnits: number;
  activeJobs: number;
  nextAction: {
    kind: string;
    stage: string;
    label: string;
    count: number;
    issueId?: string;
  };
  finalUrl: string;
  finalCandidateUrl?: string;
  finalCardId?: string;
  finalPendingReview?: boolean;
  finalQualityRequired?: boolean;
  finalQualityPassed?: boolean | null;
  finalQualityScore?: number | null;
};

type MobileAction =
  | { kind: 'review-image'; shot: MobileShot }
  | { kind: 'review-video'; shot: MobileShot }
  | { kind: 'review-final' }
  | { kind: 'sync-video' }
  | { kind: 'stage'; stage: string; label: string }
  | { kind: 'image'; shot: MobileShot }
  | { kind: 'video'; shot: MobileShot }
  | { kind: 'compose' }
  | { kind: 'optimize'; issueId: string; label: string }
  | { kind: 'review-desktop'; label: string }
  | { kind: 'done' };

type UploadedReference = {
  name: string;
  url: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: {
    results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
  }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const MOBILE_SESSION_KEY = 'agent-studio:mobile-creator:session';
const MOBILE_PROJECT_KEY = 'agent-studio:mobile-creator:project';
const MOBILE_GUIDE_KEY = 'agent-studio:mobile-creator:guide:v1';
const DIRECTOR_EMPLOYEE = 'comic-director';
const TEAM_CODE = 'comic-drama-team';
const ACTIVE_VIDEO_STATUSES = new Set([
  'pending',
  'in_progress',
  'queued',
  'processing',
  'running',
]);

const STAGE_EMPLOYEES: Record<string, string> = {
  script: 'comic-screenwriter',
  storyboard: 'comic-storyboard',
  img_prompt: 'comic-prompt-engineer',
  vid_prompt: 'comic-prompt-engineer',
};

const HOOK_OPTIONS = [
  { label: '反转悬念', value: '反转悬念' },
  { label: '情绪共鸣', value: '情绪共鸣' },
  { label: '视觉奇观', value: '视觉奇观' },
  { label: '轻松搞笑', value: '轻松搞笑' },
];

const STARTER_IDEAS = [
  '一个普通人突然发现今天能听见所有人的心声',
  '帮我把一次下班路上的小事，变成有反转的短片',
  '我拍了一张照片，想让它变成有电影感的小视频',
];

const MOBILE_DIRECTOR_CONTEXT = `
你现在是 Agent Studio 手机端的“灵感导演”，服务第一次做短视频的普通用户。
目标是把用户随口说的想法收敛成 15–30 秒、9:16 竖屏小视频，而不是大型漫剧。
必须使用当前员工绑定的模型与知识，不要推荐用户去配置外部平台。

回复规则：
1. 不要输出 JSON、任务表、技术参数堆砌或长篇教程。
2. 每次回复最多 180 个中文字符，一次只推进一个决定。
3. 先用一句话指出这个想法最有传播潜力的部分，再给一个“前三秒钩子”建议。
4. 最后只问一个最关键的问题；不要一次问角色、风格、时长等多个问题。
5. 不得假装掌握实时平台热榜；请称为“常见高互动结构”或“高传播结构”。
6. 用户说“就这样”“开始拍”“按这个做”时，给出一段简洁的可执行创作方向，并提醒可以点击“按这个方向开拍”。
`.trim();

const initialMessage: ConversationMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '把脑海里的画面直接说出来就行，不用写剧本和提示词。我会先帮你找前三秒钩子，然后一次只带你走一个下一步。',
};

function createRunId() {
  return `run_mobile_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 8)}`;
}

function buildProjectName(messages: ConversationMessage[]) {
  const source = messages.find(item => item.role === 'user')?.content || '新灵感';
  const clean = source
    .replace(/📎.+$/gm, '')
    .replace(/[，。！？、；：“”‘’《》\s]+/g, '')
    .slice(0, 14);
  return `${clean || '新灵感'} · 随手拍`;
}

function modelPriceLabel(model: MediaModel | undefined, kind: MediaKind) {
  if (!model) return '尚未选择模型';
  if (model.isFree) return '免费模型';
  if (!model.pricing || Object.keys(model.pricing).length === 0) {
    return '可能产生模型费用';
  }
  if (kind === 'video') {
    const value = model.pricing['per-video-second']
      ?? model.pricing['per_video_second'];
    if (value !== undefined) return `$${value} / 秒`;
  }
  return '按模型供应商实际结算';
}

function maxRatings(profile: VisualQualityProfile | undefined): VisualQualityRatings {
  if (!profile) return {};
  return Object.fromEntries(
    profile.dimensions.map(dimension => [
      dimension.key,
      profile.ratingScale.max,
    ]),
  );
}

function stagePercent(done: number, total: number) {
  if (!total) return 0;
  return Math.round(done / total * 100);
}

function timeLabel(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return '';
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

function resolveMobileAction(state: MobileDirectorState | null): MobileAction | null {
  if (!state) return null;

  const imageReview = state.shots.find(shot => (
    Boolean(shot.imageUrl)
    && !shot.imageStale
    && shot.imageQualityRequired
    && shot.imageQualityPassed !== true
    && shot.imageReviewVerdict !== 'reject'
  ));
  if (imageReview) return { kind: 'review-image', shot: imageReview };

  const videoReview = state.shots.find(shot => (
    Boolean(shot.videoCandidateUrl)
    && !shot.videoStale
    && shot.videoQualityRequired
    && shot.videoQualityPassed !== true
    && shot.videoReviewVerdict !== 'reject'
  ));
  if (videoReview) return { kind: 'review-video', shot: videoReview };

  if (
    state.finalPendingReview
    && state.finalCandidateUrl
    && state.finalCardId
  ) {
    return { kind: 'review-final' };
  }

  if (state.activeJobs > 0) return { kind: 'sync-video' };

  const next = state.nextAction;
  if (next.kind === 'done') return { kind: 'done' };
  if (next.kind === 'stage') {
    return { kind: 'stage', stage: next.stage, label: next.label };
  }
  if (next.kind === 'image') {
    const shot = state.shots.find(item => (
      !item.imageUrl
      || item.imageStale
      || item.imageReviewVerdict === 'reject'
    ));
    return shot ? { kind: 'image', shot } : null;
  }
  if (next.kind === 'video') {
    const shot = state.shots.find(item => (
      item.imageQualityPassed === true
      && (
        !item.videoUrl
        || item.videoStale
        || item.videoReviewVerdict === 'reject'
      )
      && !ACTIVE_VIDEO_STATUSES.has(
        String(item.videoJob?.status || '').toLowerCase(),
      )
    ));
    return shot ? { kind: 'video', shot } : null;
  }
  if (next.kind === 'compose') return { kind: 'compose' };
  if (next.kind === 'final_review') return { kind: 'review-final' };
  if (next.kind === 'optimize' && next.issueId) {
    return { kind: 'optimize', issueId: next.issueId, label: next.label };
  }
  if (next.kind === 'review') {
    return { kind: 'review-desktop', label: next.label };
  }
  return null;
}

export default function MobileCreator() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<MobileTab>(
    () => (localStorage.getItem(MOBILE_PROJECT_KEY) ? 'progress' : 'idea'),
  );
  const [input, setInput] = useState('');
  const [hookStyle, setHookStyle] = useState('反转悬念');
  const [duration, setDuration] = useState(15);
  const [messages, setMessages] = useState<ConversationMessage[]>([
    initialMessage,
  ]);
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem(MOBILE_SESSION_KEY) || '',
  );
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reference, setReference] = useState<UploadedReference | null>(null);
  const [projects, setProjects] = useState<MobileProject[]>([]);
  const [projectId, setProjectId] = useState(
    () => localStorage.getItem(MOBILE_PROJECT_KEY) || '',
  );
  const [state, setState] = useState<MobileDirectorState | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState('');
  const [imageModels, setImageModels] = useState<MediaModel[]>([]);
  const [videoModels, setVideoModels] = useState<MediaModel[]>([]);
  const [imageModel, setImageModel] = useState('');
  const [videoModel, setVideoModel] = useState('');
  const [modelsLoading, setModelsLoading] = useState(false);
  const [qualityProfiles, setQualityProfiles] = useState<{
    image?: VisualQualityProfile;
    video?: VisualQualityProfile;
    final?: VisualQualityProfile;
  }>({});
  const [guideOpen, setGuideOpen] = useState(
    () => !localStorage.getItem(MOBILE_GUIDE_KEY),
  );
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const syncingRef = useRef(false);

  const hasUserIdea = messages.some(item => item.role === 'user');
  const action = useMemo(() => resolveMobileAction(state), [state]);
  const selectedImageModel = imageModels.find(model => model.id === imageModel);
  const selectedVideoModel = videoModels.find(model => model.id === videoModel);

  const loadProjects = useCallback(async () => {
    try {
      const result = await api.listProjects();
      setProjects(
        result
          .filter((project: MobileProject) => project.source_type === 'gc')
          .sort((left: MobileProject, right: MobileProject) => (
            new Date(right.updated_at).getTime()
            - new Date(left.updated_at).getTime()
          )),
      );
    } catch (error: any) {
      message.error(error.message || '暂时无法读取小视频项目');
    }
  }, []);

  const loadState = useCallback(async (id: string, silent = false) => {
    if (!id) return null;
    if (!silent) setProjectLoading(true);
    try {
      const result = await api.getDirectorState(id) as MobileDirectorState;
      setState(result);
      return result;
    } catch (error: any) {
      if (!silent) message.error(error.message || '暂时无法读取制作进度');
      if (id === localStorage.getItem(MOBILE_PROJECT_KEY)) {
        localStorage.removeItem(MOBILE_PROJECT_KEY);
        setProjectId('');
      }
      return null;
    } finally {
      if (!silent) setProjectLoading(false);
    }
  }, []);

  const loadMediaModels = useCallback(async () => {
    setModelsLoading(true);
    try {
      const [images, videos, profiles] = await Promise.all([
        api.listDirectorMediaModels('image', 'comic-keyframe-artist'),
        api.listDirectorMediaModels('video', 'comic-video-artist'),
        api.getProductionQualityProfile(),
      ]);
      setImageModels(images);
      setVideoModels(videos);
      setImageModel(current => (
        images.some((item: MediaModel) => item.id === current)
          ? current
          : (images.find((item: MediaModel) => item.recommended)?.id
            || images[0]?.id
            || '')
      ));
      setVideoModel(current => (
        videos.some((item: MediaModel) => item.id === current)
          ? current
          : (videos.find((item: MediaModel) => item.recommended)?.id
            || videos[0]?.id
            || '')
      ));
      setQualityProfiles({
        image: profiles.image,
        video: profiles.video,
        final: profiles.final,
      });
    } catch (error: any) {
      message.error(error.message || '暂时无法读取已配置的媒体模型');
    } finally {
      setModelsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.body.classList.add('mobile-creator-mode');
    void loadProjects();
    void loadMediaModels();
    if (projectId) void loadState(projectId, true);

    if (sessionId) {
      api.getSession(sessionId)
        .then(result => {
          const restored = (result.messages || [])
            .filter((item: any) => (
              item.role === 'user' || item.role === 'assistant'
            ))
            .map((item: any) => ({
              id: crypto.randomUUID(),
              role: item.role as MessageRole,
              content: String(item.content || ''),
            }));
          if (restored.length) setMessages([initialMessage, ...restored]);
        })
        .catch(() => {
          localStorage.removeItem(MOBILE_SESSION_KEY);
          setSessionId('');
        });
    }

    return () => {
      document.body.classList.remove('mobile-creator-mode');
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [messages, thinking]);

  const syncActiveVideos = useCallback(async (silent = false) => {
    if (!state || !projectId || syncingRef.current) return;
    const activeShots = state.shots.filter(shot => (
      shot.videoCardId
      && ACTIVE_VIDEO_STATUSES.has(
        String(shot.videoJob?.status || '').toLowerCase(),
      )
    ));
    if (!activeShots.length) {
      await loadState(projectId, true);
      return;
    }
    syncingRef.current = true;
    try {
      for (const shot of activeShots) {
        try {
          await api.syncDirectorVideo(projectId, shot.videoCardId);
        } catch (error: any) {
          if (!silent) {
            message.warning(error.message || `镜头 G${shot.unit} 仍在生成`);
          }
        }
      }
      await loadState(projectId, true);
    } finally {
      syncingRef.current = false;
    }
  }, [loadState, projectId, state]);

  useEffect(() => {
    if (!state?.activeJobs) return undefined;
    const timer = window.setInterval(() => {
      void syncActiveVideos(true);
    }, 12_000);
    return () => window.clearInterval(timer);
  }, [state?.activeJobs, syncActiveVideos]);

  const sendIdea = async (preset?: string) => {
    const content = (preset ?? input).trim();
    if ((!content && !reference) || thinking) return;

    const displayContent = [
      content || '请根据这张参考图帮我想一个小视频',
      reference ? `📎 ${reference.name}` : '',
    ].filter(Boolean).join('\n');
    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: displayContent,
    };
    const streamId = crypto.randomUUID();
    setMessages(current => [
      ...current,
      userMessage,
      {
        id: streamId,
        role: 'assistant',
        content: '',
        streaming: true,
      },
    ]);
    setInput('');
    setThinking(true);
    const attached = reference;
    setReference(null);

    try {
      const response = await api.runAgentStream({
        employeeKey: DIRECTOR_EMPLOYEE,
        userInput: content || '请根据参考图给我一个可拍的小视频方向',
        sessionId: sessionId || undefined,
        runId: createRunId(),
        transientContext: [
          MOBILE_DIRECTOR_CONTEXT,
          `本次偏好：${hookStyle}；目标时长：${duration} 秒；画幅：9:16。`,
        ].join('\n\n'),
        extraContext: attached
          ? `用户上传的参考图：${attached.name}，链接：${attached.url}`
          : undefined,
      }, {
        onContent: (_delta, text) => {
          setMessages(current => current.map(item => (
            item.id === streamId
              ? { ...item, content: text, streaming: true }
              : item
          )));
        },
      });
      setMessages(current => current.map(item => (
        item.id === streamId
          ? {
              ...item,
              content: response.assistantMessage
                || item.content
                || '这个方向可以继续。你可以直接开拍，或者再告诉我想强化哪种感觉。',
              streaming: false,
            }
          : item
      )));
      if (response.sessionId) {
        setSessionId(response.sessionId);
        localStorage.setItem(MOBILE_SESSION_KEY, response.sessionId);
      }
    } catch (error: any) {
      setMessages(current => current.map(item => (
        item.id === streamId
          ? {
              ...item,
              content: `这次没有分析完成：${error.message || '模型暂时不可用'}。你的想法已经保留，可以直接重试。`,
              streaming: false,
            }
          : item
      )));
    } finally {
      setThinking(false);
    }
  };

  const uploadReference = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.warning('手机轻制作目前只接收一张参考图片');
      return;
    }
    setUploading(true);
    try {
      const uploaded = await api.uploadFile(file);
      setReference({ name: uploaded.fileName, url: uploaded.url });
      message.success('参考图已加入本次灵感');
    } catch (error: any) {
      message.error(error.message || '参考图上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const browserWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = browserWindow.SpeechRecognition
      || browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      message.info('当前浏览器不支持语音转文字，请直接输入想法');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = event => {
      let transcript = '';
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript || '';
      }
      setInput(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      message.warning('没有听清，按住想法再说一次');
    };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const createProject = async () => {
    if (!hasUserIdea || actionBusy) return;
    setActionBusy('create');
    try {
      const userIdeas = messages
        .filter(item => item.role === 'user')
        .map(item => item.content)
        .join('\n');
      const directorAdvice = [...messages]
        .reverse()
        .find(item => item.role === 'assistant' && item.id !== 'welcome')
        ?.content || '';
      const project = await api.createProject({
        name: buildProjectName(messages),
        description: `手机灵感随手拍 · ${duration} 秒竖屏小视频`,
        sourceType: 'gc',
        sourceContent: [
          `【用户想法】\n${userIdeas}`,
          `【高互动方向】${hookStyle}`,
          directorAdvice ? `【灵感导演建议】\n${directorAdvice}` : '',
        ].filter(Boolean).join('\n\n'),
        teamCode: TEAM_CODE,
        episodeCount: 1,
        episodeDurationSeconds: duration,
        aspectRatio: '9:16',
        productionGoal: 'final',
      });
      setProjectId(project.project_id);
      localStorage.setItem(MOBILE_PROJECT_KEY, project.project_id);
      await Promise.all([
        loadState(project.project_id),
        loadProjects(),
      ]);
      setTab('progress');
      message.success('小视频项目已建立，下一步只做一件事');
    } catch (error: any) {
      message.error(error.message || '项目没有建立成功');
    } finally {
      setActionBusy('');
    }
  };

  const openProject = async (id: string) => {
    setProjectId(id);
    localStorage.setItem(MOBILE_PROJECT_KEY, id);
    await loadState(id);
    setTab('progress');
  };

  const startNewIdea = () => {
    setMessages([initialMessage]);
    setSessionId('');
    setReference(null);
    setInput('');
    setProjectId('');
    setState(null);
    localStorage.removeItem(MOBILE_SESSION_KEY);
    localStorage.removeItem(MOBILE_PROJECT_KEY);
    setTab('idea');
  };

  const rejectMedia = async (target: MobileAction) => {
    if (!state || !projectId || actionBusy) return;
    setActionBusy('reject');
    try {
      if (target.kind === 'review-image') {
        await api.reviewCardImage(projectId, target.shot.imageCardId, {
          verdict: 'reject',
          image: target.shot.imageUrl,
          reason: 'other',
          note: '手机端用户选择重做',
        });
      } else if (target.kind === 'review-video') {
        await api.reviewCardVideo(projectId, target.shot.videoCardId, {
          verdict: 'reject',
          video: target.shot.videoCandidateUrl,
          reason: 'other',
          note: '手机端用户选择重做',
        });
      } else if (target.kind === 'review-final') {
        await api.reviewCardVideo(projectId, state.finalCardId!, {
          verdict: 'reject',
          video: state.finalCandidateUrl,
          reason: 'other',
          note: '手机端用户选择重做',
        });
      }
      await loadState(projectId, true);
      message.info('已标记重做，只会处理当前画面或视频');
    } catch (error: any) {
      message.error(error.message || '暂时无法提交重做');
    } finally {
      setActionBusy('');
    }
  };

  const runNext = async () => {
    if (!action || !state || !projectId || actionBusy) return;
    if (action.kind === 'done') return;
    if (action.kind === 'review-desktop') {
      navigate(`/production/${projectId}/matrix`);
      return;
    }
    setActionBusy(action.kind);
    try {
      if (action.kind === 'review-image') {
        if (!qualityProfiles.image) throw new Error('正在读取画面验收标准，请稍后再试');
        await api.reviewCardImage(projectId, action.shot.imageCardId, {
          verdict: 'pass',
          image: action.shot.imageUrl,
          ratings: maxRatings(qualityProfiles.image),
        });
        message.success(`镜头 G${action.shot.unit} 画面已确认`);
      } else if (action.kind === 'review-video') {
        if (!qualityProfiles.video) throw new Error('正在读取视频验收标准，请稍后再试');
        await api.reviewCardVideo(projectId, action.shot.videoCardId, {
          verdict: 'pass',
          video: action.shot.videoCandidateUrl,
          ratings: maxRatings(qualityProfiles.video),
        });
        message.success(`镜头 G${action.shot.unit} 视频已确认`);
      } else if (action.kind === 'review-final') {
        if (!qualityProfiles.final) throw new Error('正在读取成片验收标准，请稍后再试');
        await api.reviewCardVideo(projectId, state.finalCardId!, {
          verdict: 'pass',
          video: state.finalCandidateUrl,
          ratings: maxRatings(qualityProfiles.final),
        });
        message.success('小视频已经完成验收');
      } else if (action.kind === 'sync-video') {
        await syncActiveVideos();
      } else if (action.kind === 'stage') {
        const employee = STAGE_EMPLOYEES[action.stage];
        await api.generateStage(projectId, {
          target_stage: action.stage,
          ...(employee ? { employee_key: employee } : {}),
          episode: null,
          mode: 'replace',
          extra_instruction: [
            '这是手机端 15–30 秒竖屏小视频。',
            '前三秒给出明确钩子，镜头数量保持精简，结尾保留记忆点。',
            `高互动方向：${hookStyle}。`,
          ].join(''),
        });
        message.success(`${action.label}完成`);
      } else if (action.kind === 'image') {
        if (!imageModel) throw new Error('还没有可用的图片模型，请先在电脑端接入模型');
        await api.generateDirectorImage(projectId, action.shot.imageCardId, {
          model: imageModel,
          employee_key: 'comic-keyframe-artist',
          prompt: action.shot.imagePrompt,
          resolution: '1K',
          aspect_ratio: '9:16',
        });
        message.success(`镜头 G${action.shot.unit} 画面已生成，请先看图`);
      } else if (action.kind === 'video') {
        if (!videoModel) throw new Error('还没有可用的视频模型，请先在电脑端接入模型');
        await api.generateDirectorVideo(projectId, action.shot.videoCardId, {
          model: videoModel,
          employee_key: 'comic-video-artist',
          prompt: action.shot.videoPrompt,
          duration: action.shot.durationSeconds,
          resolution: '720p',
          aspect_ratio: '9:16',
          image_url: action.shot.imageUrl,
          generate_audio: true,
        });
        message.success(`镜头 G${action.shot.unit} 已提交生成，可以稍后回来`);
      } else if (action.kind === 'compose') {
        await api.composeDirectorCut(projectId);
        message.success('成片预览已经合成，请最后看一遍');
      } else if (action.kind === 'optimize') {
        await api.optimizeProjectIssue(projectId, action.issueId);
        message.success(`${action.label}完成`);
      }
      await Promise.all([
        loadState(projectId, true),
        loadProjects(),
      ]);
    } catch (error: any) {
      message.error(error.message || '这一步没有完成，可以直接重试');
    } finally {
      setActionBusy('');
    }
  };

  const actionCopy = useMemo(() => {
    if (!action) {
      return {
        eyebrow: '正在准备',
        title: '读取当前下一步',
        detail: '系统正在检查项目状态。',
        button: '刷新',
      };
    }
    if (action.kind === 'review-image') {
      return {
        eyebrow: `镜头 G${action.shot.unit} · 先看再继续`,
        title: '这张画面满意吗？',
        detail: '只有你确认画面后，系统才会继续消耗视频额度。',
        button: '满意，继续',
      };
    }
    if (action.kind === 'review-video') {
      return {
        eyebrow: `镜头 G${action.shot.unit} · 视频候选`,
        title: '动作和画面可以吗？',
        detail: '不满意只重做当前镜头，不影响其他内容。',
        button: '满意，继续',
      };
    }
    if (action.kind === 'review-final') {
      return {
        eyebrow: '最后一步',
        title: '完整看一遍成片',
        detail: '确认后，这条小视频就可以交付。',
        button: '确认成片',
      };
    }
    if (action.kind === 'sync-video') {
      return {
        eyebrow: '视频正在生成',
        title: '可以先去做别的',
        detail: '生成完成后会自动更新；也可以手动刷新一次。',
        button: '刷新进度',
      };
    }
    if (action.kind === 'stage') {
      return {
        eyebrow: '只做当前一步',
        title: action.label,
        detail: '员工会沿用你的灵感和前序结果，完成后自动告诉你下一步。',
        button: action.label,
      };
    }
    if (action.kind === 'image') {
      return {
        eyebrow: `镜头 G${action.shot.unit} · 画面`,
        title: '生成这一镜的画面',
        detail: `${selectedImageModel?.name || '图片模型'} · ${modelPriceLabel(selectedImageModel, 'image')}`,
        button: `确认生成 G${action.shot.unit} 画面`,
      };
    }
    if (action.kind === 'video') {
      return {
        eyebrow: `镜头 G${action.shot.unit} · 视频`,
        title: '让这一镜动起来',
        detail: `${selectedVideoModel?.name || '视频模型'} · ${modelPriceLabel(selectedVideoModel, 'video')}`,
        button: `确认生成 G${action.shot.unit} 视频`,
      };
    }
    if (action.kind === 'compose') {
      return {
        eyebrow: '所有镜头已完成',
        title: '合成一条完整视频',
        detail: '系统会按镜头顺序合成预览，之后只剩最后验收。',
        button: '合成成片',
      };
    }
    if (action.kind === 'optimize') {
      return {
        eyebrow: '发现一个可自动修复的问题',
        title: action.label,
        detail: '只修复当前阻塞项，不会大范围重写项目。',
        button: action.label,
      };
    }
    if (action.kind === 'review-desktop') {
      return {
        eyebrow: '需要更细的专业检查',
        title: action.label,
        detail: '打开项目检查页确认具体问题后，再继续昂贵的媒体生成。',
        button: '打开检查页',
      };
    }
    return {
      eyebrow: '制作完成',
      title: '这条小视频已经准备好了',
      detail: '可以播放、下载，或者再开始一个新灵感。',
      button: '已完成',
    };
  }, [action, selectedImageModel, selectedVideoModel]);

  const currentReviewMedia = action?.kind === 'review-image'
    ? { kind: 'image' as const, url: action.shot.imageUrl }
    : action?.kind === 'review-video'
      ? { kind: 'video' as const, url: action.shot.videoCandidateUrl || '' }
      : action?.kind === 'review-final'
        ? { kind: 'video' as const, url: state?.finalCandidateUrl || '' }
        : null;

  return (
    <main className="mobile-creator" aria-labelledby="mobile-creator-title">
      <header className="mobile-creator__header">
        <div>
          <span className="mobile-creator__kicker">
            <FireOutlined /> 灵感随手拍
          </span>
          <Title id="mobile-creator-title" level={1}>
            说个想法，就开始。
          </Title>
        </div>
        <HelpHint
          title="手机模式是什么？"
          content="手机端只保留灵感对话、当前下一步、逐镜生成和作品查看。完整漫剧、无限画布、员工与模型配置继续在电脑端使用。"
        />
      </header>

      <div className="mobile-creator__mode-note">
        <span><MessageOutlined /> 总导演连续陪你聊</span>
        <span><VideoCameraOutlined /> 15–30 秒竖屏</span>
        <span><CheckCircleFilled /> 一个镜头一个镜头做</span>
      </div>

      {tab === 'idea' && (
        <section className="mobile-creator__idea" aria-label="灵感对话">
          <div className="mobile-creator__preferences">
            <div>
              <span>想要的感觉</span>
              <Segmented
                size="small"
                value={hookStyle}
                options={HOOK_OPTIONS}
                onChange={value => setHookStyle(String(value))}
              />
            </div>
            <div>
              <span>视频时长</span>
              <Segmented
                size="small"
                value={duration}
                options={[
                  { label: '15 秒', value: 15 },
                  { label: '30 秒', value: 30 },
                ]}
                onChange={value => setDuration(Number(value))}
              />
            </div>
          </div>

          <div className="mobile-creator__chat" aria-live="polite">
            {!hasUserIdea && (
              <div className="mobile-creator__starter">
                <span className="mobile-creator__starter-icon">
                  <BulbOutlined />
                </span>
                <strong>不用想完整，先说半句话也行</strong>
                <p>系统会帮你补钩子、节奏和结尾，但每次只问一个问题。</p>
                <div>
                  {STARTER_IDEAS.map(idea => (
                    <button
                      type="button"
                      key={idea}
                      onClick={() => void sendIdea(idea)}
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(item => (
              <article
                key={item.id}
                className={`mobile-chat-bubble is-${item.role}`}
              >
                {item.role === 'assistant' && (
                  <span className="mobile-chat-bubble__avatar" aria-hidden="true">
                    A
                  </span>
                )}
                <div>
                  {item.role === 'assistant' && (
                    <small>灵感导演</small>
                  )}
                  <p>
                    {item.content}
                    {item.streaming && !item.content && (
                      <><LoadingOutlined /> 正在找最有吸引力的开头</>
                    )}
                  </p>
                </div>
              </article>
            ))}

            {hasUserIdea && !thinking && (
              <div className="mobile-creator__launch-card">
                <div>
                  <span><RocketOutlined /> 方向确认后</span>
                  <strong>建立一条 {duration} 秒竖屏小视频</strong>
                  <p>会保存到“我的项目”，并一次只显示一个下一步。</p>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<PlayCircleOutlined />}
                  loading={actionBusy === 'create'}
                  onClick={() => void createProject()}
                >
                  按这个方向开拍
                </Button>
                <Button
                  type="text"
                  block
                  onClick={() => setInput('换一个更强的前三秒钩子')}
                >
                  我还想再改改
                </Button>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <div className="mobile-creator__composer">
            {reference && (
              <div className="mobile-creator__attachment">
                <img src={reference.url} alt="本次灵感参考图" />
                <span>{reference.name}</span>
                <button
                  type="button"
                  aria-label="移除参考图"
                  onClick={() => setReference(null)}
                >
                  ×
                </button>
              </div>
            )}
            <div className="mobile-creator__composer-row">
              <button
                type="button"
                aria-label="添加一张参考图片"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || thinking}
              >
                {uploading ? <LoadingOutlined /> : <PaperClipOutlined />}
              </button>
              <button
                type="button"
                aria-label={listening ? '停止语音输入' : '开始语音输入'}
                aria-pressed={listening}
                className={listening ? 'is-listening' : ''}
                onClick={toggleVoice}
                disabled={thinking}
              >
                <AudioOutlined />
              </button>
              <TextArea
                value={input}
                autoSize={{ minRows: 1, maxRows: 4 }}
                placeholder={listening ? '正在听你说…' : '突然想到什么，就说什么…'}
                aria-label="输入小视频灵感"
                disabled={thinking}
                onChange={event => setInput(event.target.value)}
                onPressEnter={event => {
                  if (!event.shiftKey) {
                    event.preventDefault();
                    void sendIdea();
                  }
                }}
              />
              <Button
                type="primary"
                shape="circle"
                aria-label="发送灵感"
                icon={thinking ? <LoadingOutlined /> : <SendOutlined />}
                disabled={thinking || (!input.trim() && !reference)}
                onClick={() => void sendIdea()}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) void uploadReference(file);
              }}
            />
            <Text>使用总导演员工和你已经配置的模型，不会调用陌生平台模型。</Text>
          </div>
        </section>
      )}

      {tab === 'progress' && (
        <section className="mobile-creator__progress" aria-label="当前制作进度">
          {!projectId ? (
            <Empty description="还没有正在制作的小视频">
              <Button type="primary" onClick={() => setTab('idea')}>
                先说一个灵感
              </Button>
            </Empty>
          ) : projectLoading && !state ? (
            <div className="mobile-creator__loading" role="status">
              <Spin />
              <span>正在读取制作进度</span>
            </div>
          ) : state ? (
            <>
              <article className="mobile-project-summary">
                <div>
                  <Tag color="purple">手机小制作</Tag>
                  <button
                    type="button"
                    aria-label="刷新制作进度"
                    onClick={() => void loadState(projectId)}
                  >
                    <ReloadOutlined />
                  </button>
                </div>
                <Title level={2}>{state.project.name}</Title>
                <p>{state.totalUnits || '—'} 个镜头 · 9:16 · 一次推进一步</p>
                <Progress
                  percent={state.overallProgress}
                  strokeColor={{ '0%': '#9a7152', '100%': '#5e8f76' }}
                  trailColor="#ebe7df"
                />
              </article>

              <div className="mobile-stage-strip" aria-label="制作阶段">
                {state.stages.map(stage => {
                  const complete = stage.total > 0 && stage.done >= stage.total;
                  const active = (
                    action?.kind === 'stage'
                    && action.stage === stage.key
                  ) || (
                    action?.kind === 'image'
                    && stage.key === 'image'
                  ) || (
                    action?.kind === 'video'
                    && stage.key === 'video'
                  );
                  return (
                    <div
                      key={stage.key}
                      className={`${complete ? 'is-complete' : ''}${active ? ' is-active' : ''}`}
                    >
                      <span>{complete ? <CheckCircleFilled /> : stage.name.slice(0, 1)}</span>
                      <small>{stage.name}</small>
                      <i style={{ width: `${stagePercent(stage.done, stage.total)}%` }} />
                    </div>
                  );
                })}
              </div>

              <article className="mobile-next-action">
                <span className="mobile-next-action__eyebrow">
                  {actionCopy.eyebrow}
                </span>
                <Title level={2}>{actionCopy.title}</Title>
                <p>{actionCopy.detail}</p>

                {currentReviewMedia?.url && (
                  <div className="mobile-next-action__media">
                    {currentReviewMedia.kind === 'image' ? (
                      <img src={currentReviewMedia.url} alt="等待确认的镜头画面" />
                    ) : (
                      <video
                        src={currentReviewMedia.url}
                        controls
                        playsInline
                        aria-label="等待确认的视频"
                      />
                    )}
                  </div>
                )}

                {action?.kind === 'image' && (
                  <label className="mobile-model-select">
                    <span>本镜头图片模型</span>
                    <Select
                      value={imageModel || undefined}
                      loading={modelsLoading}
                      placeholder="没有可用图片模型"
                      options={imageModels.map(model => ({
                        value: model.id,
                        label: `${model.name}${model.recommended ? ' · 推荐' : ''}`,
                      }))}
                      onChange={setImageModel}
                    />
                  </label>
                )}

                {action?.kind === 'video' && (
                  <label className="mobile-model-select">
                    <span>本镜头视频模型</span>
                    <Select
                      value={videoModel || undefined}
                      loading={modelsLoading}
                      placeholder="没有可用视频模型"
                      options={videoModels.map(model => ({
                        value: model.id,
                        label: `${model.name}${model.recommended ? ' · 推荐' : ''}`,
                      }))}
                      onChange={setVideoModel}
                    />
                  </label>
                )}

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={
                    action?.kind === 'done'
                      ? <CheckCircleFilled />
                      : action?.kind === 'sync-video'
                        ? <ReloadOutlined />
                        : <RocketOutlined />
                  }
                  loading={Boolean(actionBusy)}
                  disabled={!action || action.kind === 'done'}
                  onClick={() => void runNext()}
                >
                  {actionCopy.button}
                </Button>

                {(
                  action?.kind === 'review-image'
                  || action?.kind === 'review-video'
                  || action?.kind === 'review-final'
                ) && (
                  <Button
                    danger
                    type="text"
                    block
                    disabled={Boolean(actionBusy)}
                    onClick={() => void rejectMedia(action)}
                  >
                    不满意，只重做这一步
                  </Button>
                )}

                {action?.kind === 'done' && state.finalUrl && (
                  <video
                    className="mobile-final-video"
                    src={state.finalUrl}
                    controls
                    playsInline
                    aria-label="已完成的小视频"
                  />
                )}
              </article>

              <div className="mobile-progress-actions">
                <Button icon={<MessageOutlined />} onClick={() => setTab('idea')}>
                  继续问导演
                </Button>
                <Button icon={<DesktopOutlined />} onClick={() => navigate('/studio')}>
                  电脑精修
                </Button>
              </div>
            </>
          ) : (
            <Empty description="这个项目暂时无法打开">
              <Button onClick={() => setTab('projects')}>查看其他作品</Button>
            </Empty>
          )}
        </section>
      )}

      {tab === 'projects' && (
        <section className="mobile-creator__projects" aria-label="手机小视频项目">
          <div className="mobile-section-heading">
            <div>
              <span>我的小制作</span>
              <Title level={2}>随时回来继续</Title>
            </div>
            <Button icon={<PlusOutlined />} onClick={startNewIdea}>新灵感</Button>
          </div>
          {projects.length ? (
            <div className="mobile-project-list">
              {projects.map(project => (
                <button
                  type="button"
                  key={project.project_id}
                  onClick={() => void openProject(project.project_id)}
                >
                  <span className="mobile-project-list__cover">
                    <VideoCameraOutlined />
                  </span>
                  <span>
                    <strong>{project.name}</strong>
                    <small>
                      {project.description || '竖屏小视频'} · {timeLabel(project.updated_at)}
                    </small>
                  </span>
                  <PlayCircleOutlined />
                </button>
              ))}
            </div>
          ) : (
            <Empty description="还没有小视频项目">
              <Button type="primary" onClick={() => setTab('idea')}>
                说第一个灵感
              </Button>
            </Empty>
          )}
          <Button
            block
            icon={<FolderOpenOutlined />}
            onClick={() => navigate('/production')}
          >
            查看电脑端全部项目
          </Button>
        </section>
      )}

      <nav className="mobile-creator__tabs" aria-label="手机模式导航">
        <button
          type="button"
          className={tab === 'idea' ? 'is-active' : ''}
          aria-current={tab === 'idea' ? 'page' : undefined}
          onClick={() => setTab('idea')}
        >
          <BulbOutlined /><span>灵感</span>
        </button>
        <button
          type="button"
          className={tab === 'progress' ? 'is-active' : ''}
          aria-current={tab === 'progress' ? 'page' : undefined}
          onClick={() => setTab('progress')}
        >
          {state?.activeJobs ? <LoadingOutlined spin /> : <CameraOutlined />}
          <span>制作</span>
        </button>
        <button
          type="button"
          className={tab === 'projects' ? 'is-active' : ''}
          aria-current={tab === 'projects' ? 'page' : undefined}
          onClick={() => setTab('projects')}
        >
          <FolderOpenOutlined /><span>作品</span>
        </button>
      </nav>

      <Modal
        open={guideOpen}
        centered
        width="min(420px, calc(100vw - 28px))"
        title="手机只做四件事"
        closable
        onCancel={() => {
          localStorage.setItem(MOBILE_GUIDE_KEY, 'completed');
          setGuideOpen(false);
        }}
        footer={(
          <Button
            type="primary"
            size="large"
            block
            onClick={() => {
              localStorage.setItem(MOBILE_GUIDE_KEY, 'completed');
              setGuideOpen(false);
            }}
          >
            明白了，开始说灵感
          </Button>
        )}
        className="mobile-guide-modal"
      >
        <ol>
          <li><MessageOutlined /><span><strong>说灵感</strong><small>打字、语音或加一张参考图。</small></span></li>
          <li><FireOutlined /><span><strong>找钩子</strong><small>导演一次只问一个关键问题。</small></span></li>
          <li><CameraOutlined /><span><strong>逐步生成</strong><small>每次只显示一个下一步。</small></span></li>
          <li><CheckCircleFilled /><span><strong>看过再继续</strong><small>图片和视频满意后才进入下一步。</small></span></li>
        </ol>
      </Modal>
    </main>
  );
}
