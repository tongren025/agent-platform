import { useEffect, useState, useCallback, useMemo, type DragEvent } from 'react';
import {
  Button, Drawer, Empty, Input, message, Modal, Popconfirm, Progress,
  Select, Space, Spin, Tag, Tooltip, Typography, Badge, Image, Tabs, Checkbox, Avatar,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, CopyOutlined, CheckOutlined,
  RobotOutlined, RightOutlined, EditOutlined, EyeOutlined,
  PlayCircleOutlined, FileTextOutlined, PictureOutlined,
  VideoCameraOutlined, ThunderboltOutlined, CaretRightOutlined,
  GlobalOutlined, AppstoreOutlined, UploadOutlined, SaveOutlined,
  SearchOutlined, SettingOutlined, TeamOutlined, UserOutlined,
  CloseOutlined, DragOutlined, FilterOutlined, BarChartOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { COLORS } from '../theme';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

const STAGE_COLORS: Record<string, string> = {
  idea: '#6366f1', script: '#6366f1',
  setting: '#8b5cf6', design: '#8b5cf6',
  storyboard: '#6366f1',
  img_prompt: '#10b981', vid_prompt: '#10b981',
  img_gen: '#f59e0b', vid_gen: '#f59e0b',
  final: '#ef4444',
};

const STAGE_ICONS: Record<string, React.ReactNode> = {
  idea: <FileTextOutlined />, script: <FileTextOutlined />,
  setting: <EditOutlined />, design: <PictureOutlined />,
  storyboard: <PlayCircleOutlined />,
  img_prompt: <PictureOutlined />, vid_prompt: <VideoCameraOutlined />,
  img_gen: <PictureOutlined />, vid_gen: <VideoCameraOutlined />,
  final: <CheckOutlined />,
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '待制作', color: '#faad14', icon: <ClockCircleOutlined /> },
  done: { label: '已完成', color: '#52c41a', icon: <CheckCircleOutlined /> },
  review: { label: '审核中', color: '#1890ff', icon: <ExclamationCircleOutlined /> },
};

const ROLE_MAP: Record<string, { label: string; color: string }> = {
  owner: { label: '所有者', color: 'gold' },
  editor: { label: '编辑者', color: 'blue' },
  viewer: { label: '查看者', color: 'default' },
};

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return label ? (
    <Button size="small"
      icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
      }}
      style={{ fontSize: 12 }}>
      {copied ? '已复制' : label}
    </Button>
  ) : (
    <Tooltip title={copied ? '已复制' : '复制'}>
      <Button type="text" size="small" icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
        }}
        style={{ fontSize: 12, width: 26, height: 26, color: COLORS.slate }} />
    </Tooltip>
  );
}

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');
  return (
    <div style={{ position: 'relative', marginBottom: 8 }}>
      <pre style={{
        background: '#1e293b', color: '#e2e8f0', borderRadius: 10,
        padding: '14px 16px', paddingRight: 80, fontSize: 12.5, lineHeight: 1.7,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'auto', maxHeight: 500,
      }}>
        <code className={className}>{code}</code>
      </pre>
      <Button size="small"
        icon={copied ? <CheckOutlined /> : <CopyOutlined />}
        onClick={() => { navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}
        style={{
          position: 'absolute', top: 8, right: 8, fontSize: 11,
          background: copied ? '#10b981' : 'rgba(255,255,255,.15)',
          color: '#fff', border: 'none',
        }}>
        {copied ? '已复制' : '复制'}
      </Button>
    </div>
  );
}

const PROMPT_STAGES = new Set(['img_prompt', 'vid_prompt']);

interface StageInfo { key: string; name: string; order: number; auto: boolean }
interface CardItem {
  card_id: string; project_id: string; stage: string; title: string;
  content: string; episode: number | null; shot_number: number; prompts: string[];
  images: string[]; videos: string[]; metadata: Record<string, any>;
  status: string; assignee: string; created_at: string; updated_at: string;
}
interface Member { user_id: string; name: string; role: string; avatar: string; added_at: string }
interface Project {
  project_id: string; name: string; description: string;
  source_type: string; source_content: string;
  employee_key: string; team_code: string;
  members?: Member[]; settings?: Record<string, any>;
  created_at: string; updated_at: string; cardCount?: number;
  cards?: CardItem[]; stages?: StageInfo[]; stats?: any;
}

function StageProgress({ total, done }: { total: number; done: number }) {
  if (total === 0) return null;
  const pct = Math.round((done / total) * 100);
  return (
    <Tooltip title={`${done}/${total} 完成`}>
      <div style={{ width: '100%', height: 3, background: '#e8e8e8', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 2,
          background: pct === 100 ? '#52c41a' : pct > 0 ? '#1890ff' : 'transparent',
          transition: 'width .3s',
        }} />
      </div>
    </Tooltip>
  );
}

function CardThumbnails({ images }: { images: string[] }) {
  if (!images.length) return null;
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
      {images.slice(0, 3).map((url, i) => (
        <div key={i} style={{
          width: 44, height: 44, borderRadius: 6, overflow: 'hidden',
          border: `1px solid ${COLORS.border}`, flexShrink: 0,
        }}>
          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      ))}
      {images.length > 3 && (
        <div style={{
          width: 44, height: 44, borderRadius: 6, background: '#f5f5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: '#999', border: `1px solid ${COLORS.border}`,
        }}>+{images.length - 3}</div>
      )}
    </div>
  );
}

export default function Production() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedPid, setSelectedPid] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [stages, setStages] = useState<StageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<string>('all');
  const [isNarrow, setIsNarrow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [dragCard, setDragCard] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const [newProjOpen, setNewProjOpen] = useState(false);
  const [newProjForm, setNewProjForm] = useState({ name: '', description: '', sourceType: 'idea', sourceContent: '', employeeKey: '' });
  const [cardDrawerOpen, setCardDrawerOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<CardItem | null>(null);
  const [genDialogOpen, setGenDialogOpen] = useState(false);
  const [genTarget, setGenTarget] = useState('');
  const [genExtra, setGenExtra] = useState('');
  const [genEmpKey, setGenEmpKey] = useState('');
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [addCardStage, setAddCardStage] = useState('idea');
  const [addCardForm, setAddCardForm] = useState({ title: '', content: '', episode: null as number | null, shot_number: 0 });
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CardItem>>({});
  const [uploading, setUploading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '' });
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({ name: '', role: 'editor' });
  const [statusFilter, setStatusFilter] = useState<string>('');

  const episodes = useMemo(() => {
    const eps = new Set<number>();
    cards.forEach(c => { if (c.episode != null) eps.add(c.episode); });
    return Array.from(eps).sort((a, b) => a - b);
  }, [cards]);

  const globalCards = useMemo(() => cards.filter(c => c.episode == null), [cards]);

  const filteredCards = useMemo(() => {
    let result = cards;
    if (activeEpisode === 'global') result = globalCards;
    else if (activeEpisode !== 'all') {
      const ep = parseInt(activeEpisode);
      result = result.filter(c => c.episode === ep);
    }
    if (statusFilter) result = result.filter(c => c.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        c.prompts.some(p => p.toLowerCase().includes(q))
      );
    }
    return result;
  }, [cards, activeEpisode, globalCards, searchQuery, statusFilter]);

  const loadProjects = useCallback(async () => {
    try { setProjects(await api.listProjects()); } catch { /* ignore */ }
  }, []);

  const loadProject = useCallback(async (pid: string) => {
    if (!pid) return;
    setLoading(true);
    try {
      const data = await api.getProject(pid);
      setProject(data);
      setCards(data.cards || []);
      setStages(data.stages || []);
    } catch (e: any) { message.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProjects(); api.listEmployees().then(setEmployees).catch(() => {}); }, [loadProjects]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const sync = () => setIsNarrow(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => { if (!selectedPid && projects.length > 0) setSelectedPid(projects[0].project_id); }, [projects, selectedPid]);
  useEffect(() => { if (selectedPid) loadProject(selectedPid); }, [selectedPid, loadProject]);

  // ── Handlers ──
  const handleCreateProject = async () => {
    if (!newProjForm.name.trim()) { message.warning('请输入项目名称'); return; }
    try {
      const data = await api.createProject({
        name: newProjForm.name, description: newProjForm.description,
        sourceType: newProjForm.sourceType, sourceContent: newProjForm.sourceContent,
        employeeKey: newProjForm.employeeKey,
      });
      message.success('项目已创建');
      setNewProjOpen(false);
      setNewProjForm({ name: '', description: '', sourceType: 'idea', sourceContent: '', employeeKey: '' });
      await loadProjects();
      setSelectedPid(data.project_id);
    } catch (e: any) { message.error(e.message); }
  };

  const handleDeleteProject = async (pid: string) => {
    try {
      await api.deleteProject(pid);
      message.success('已删除');
      if (selectedPid === pid) { setSelectedPid(''); setProject(null); setCards([]); }
      loadProjects();
    } catch (e: any) { message.error(e.message); }
  };

  const handleUpdateProject = async () => {
    if (!editProjectForm.name.trim()) { message.warning('请输入项目名称'); return; }
    try {
      await api.updateProject(selectedPid, editProjectForm);
      message.success('已更新');
      setEditProjectOpen(false);
      loadProject(selectedPid);
      loadProjects();
    } catch (e: any) { message.error(e.message); }
  };

  const handleGenerate = async () => {
    if (!genTarget) return;
    setGenDialogOpen(false);
    setGenerating(genTarget);
    try {
      const res = await api.generateStage(selectedPid, {
        target_stage: genTarget,
        employee_key: genEmpKey || project?.employee_key || '',
        extra_instruction: genExtra,
      });
      message.success(`已生成 ${res.generated} 张卡片`);
      await loadProject(selectedPid);
    } catch (e: any) { message.error('生成失败: ' + e.message); }
    finally { setGenerating(''); setGenExtra(''); }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await api.deleteCard(cardId);
      setCards(prev => prev.filter(c => c.card_id !== cardId));
      if (activeCard?.card_id === cardId) setCardDrawerOpen(false);
    } catch (e: any) { message.error(e.message); }
  };

  const handleMoveCard = async (cardId: string, stage: string) => {
    try {
      const moved = await api.moveCard(cardId, stage);
      setCards(prev => prev.map(c => c.card_id === cardId ? moved : c));
      if (activeCard?.card_id === cardId) setActiveCard(moved);
    } catch (e: any) { message.error(e.message); }
  };

  const handleAddCard = async () => {
    if (!addCardForm.title.trim()) { message.warning('请输入卡片标题'); return; }
    try {
      const data = await api.addCard(selectedPid, {
        stage: addCardStage, title: addCardForm.title, content: addCardForm.content,
        episode: addCardForm.episode, shot_number: addCardForm.shot_number, status: 'pending',
      });
      setCards(prev => [...prev, data]);
      setAddCardOpen(false);
      setAddCardForm({ title: '', content: '', episode: null, shot_number: 0 });
      message.success('卡片已创建');
    } catch (e: any) { message.error(e.message); }
  };

  const openAddCard = (stageKey: string) => {
    setAddCardStage(stageKey);
    const ep = activeEpisode !== 'all' && activeEpisode !== 'global' ? parseInt(activeEpisode) : null;
    setAddCardForm({ title: '', content: '', episode: ep, shot_number: 0 });
    setAddCardOpen(true);
  };

  const handleSaveCard = async () => {
    if (!activeCard) return;
    try {
      const payload: any = {};
      for (const [k, v] of Object.entries(editForm)) {
        if (v !== undefined) payload[k] = v;
      }
      const updated = await api.updateCard(activeCard.card_id, payload);
      setCards(prev => prev.map(c => c.card_id === activeCard.card_id ? updated : c));
      setActiveCard(updated);
      setEditMode(false);
      message.success('已保存');
    } catch (e: any) { message.error(e.message); }
  };

  const handleUploadFile = async (file: File, type: 'image' | 'video') => {
    if (!activeCard) return;
    setUploading(true);
    try {
      const res = await api.uploadCardFile(selectedPid, activeCard.card_id, file, type);
      setCards(prev => prev.map(c => c.card_id === activeCard.card_id ? res.card : c));
      setActiveCard(res.card);
      message.success('上传成功');
    } catch (e: any) { message.error(e.message); }
    finally { setUploading(false); }
  };

  const handleRemoveMedia = async (type: 'images' | 'videos', index: number) => {
    if (!activeCard) return;
    const list = [...(activeCard[type] || [])];
    list.splice(index, 1);
    try {
      const updated = await api.updateCard(activeCard.card_id, { [type]: list });
      setCards(prev => prev.map(c => c.card_id === activeCard.card_id ? updated : c));
      setActiveCard(updated);
      message.success('已删除');
    } catch (e: any) { message.error(e.message); }
  };

  // ── Batch operations ──
  const toggleSelectCard = (cardId: string) => {
    setSelectedCards(prev => {
      const next = new Set(prev);
      next.has(cardId) ? next.delete(cardId) : next.add(cardId);
      return next;
    });
  };

  const handleBatchMove = async (stage: string) => {
    try {
      await api.batchMoveCards(Array.from(selectedCards), stage);
      message.success(`已移动 ${selectedCards.size} 张卡片`);
      setSelectedCards(new Set());
      loadProject(selectedPid);
    } catch (e: any) { message.error(e.message); }
  };

  const handleBatchDelete = async () => {
    try {
      await api.batchDeleteCards(Array.from(selectedCards));
      message.success(`已删除 ${selectedCards.size} 张卡片`);
      setSelectedCards(new Set());
      loadProject(selectedPid);
    } catch (e: any) { message.error(e.message); }
  };

  const handleBatchStatus = async (status: string) => {
    try {
      await api.batchUpdateStatus(Array.from(selectedCards), status);
      message.success(`已更新 ${selectedCards.size} 张卡片状态`);
      setSelectedCards(new Set());
      loadProject(selectedPid);
    } catch (e: any) { message.error(e.message); }
  };

  // ── DnD ──
  const onDragStart = (e: DragEvent, cardId: string) => {
    setDragCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  };
  const onDragOver = (e: DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageKey);
  };
  const onDragLeave = () => setDragOverStage(null);
  const onDrop = async (e: DragEvent, stageKey: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const cardId = dragCard || e.dataTransfer.getData('text/plain');
    if (!cardId) return;
    setDragCard(null);
    const card = cards.find(c => c.card_id === cardId);
    if (card && card.stage !== stageKey) {
      await handleMoveCard(cardId, stageKey);
      message.success('已移动');
    }
  };

  // ── Member management ──
  const handleAddMember = async () => {
    if (!addMemberForm.name.trim()) return;
    try {
      await api.addMember(selectedPid, addMemberForm);
      message.success('成员已添加');
      setAddMemberOpen(false);
      setAddMemberForm({ name: '', role: 'editor' });
      loadProject(selectedPid);
    } catch (e: any) { message.error(e.message); }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.removeMember(selectedPid, userId);
      message.success('已移除');
      loadProject(selectedPid);
    } catch (e: any) { message.error(e.message); }
  };

  const handleUpdateMemberRole = async (userId: string, role: string) => {
    try {
      await api.updateMemberRole(selectedPid, userId, role);
      loadProject(selectedPid);
    } catch (e: any) { message.error(e.message); }
  };

  const openGenDialog = (stageKey: string) => {
    setGenTarget(stageKey);
    setGenEmpKey(project?.employee_key || '');
    setGenExtra('');
    setGenDialogOpen(true);
  };

  const openCard = (card: CardItem) => {
    setActiveCard(card);
    setEditMode(false);
    setEditForm({});
    setCardDrawerOpen(true);
  };

  const stageCards = (stageKey: string) =>
    filteredCards.filter(c => c.stage === stageKey).sort((a, b) => a.shot_number - b.shot_number);

  const autoStages = stages.filter(s => s.auto);
  const nextAutoStage = autoStages.find(s => stageCards(s.key).length === 0);

  const episodeTabs = useMemo(() => {
    const tabs: { key: string; label: React.ReactNode; count: number }[] = [
      { key: 'all', label: '全部', count: cards.length },
      { key: 'global', label: <><GlobalOutlined /> 全局资产</>, count: globalCards.length },
    ];
    episodes.forEach(ep => {
      const count = cards.filter(c => c.episode === ep).length;
      tabs.push({ key: String(ep), label: `EP${String(ep).padStart(2, '0')}`, count });
    });
    return tabs;
  }, [cards, globalCards, episodes]);

  const activeStages = useMemo(() => {
    const usedStages = new Set(filteredCards.map(c => c.stage));
    return stages.filter(s => usedStages.has(s.key));
  }, [stages, filteredCards]);

  const stats = project?.stats;
  const overallProgress = stats?.overall_progress ?? 0;

  return (
    <div style={{
      display: 'flex', flexDirection: isNarrow ? 'column' : 'row',
      height: isNarrow ? 'calc(100vh - 16px)' : 'calc(100vh - 56px)',
      gap: 0, minWidth: 0, overflow: 'hidden',
    }}>
      {/* ── Left: Project list ── */}
      <div style={{
        width: isNarrow ? '100%' : 260, height: isNarrow ? 150 : 'auto',
        borderRight: isNarrow ? 'none' : `1px solid ${COLORS.border}`,
        borderBottom: isNarrow ? `1px solid ${COLORS.border}` : 'none',
        background: '#fafbfd', display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${COLORS.border}`, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 15 }}>制作项目</Text>
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setNewProjOpen(true)}>新建</Button>
          </div>
        </div>
        <div style={{
          flex: 1, overflow: 'auto', padding: 8,
          display: isNarrow ? 'flex' : 'block', gap: isNarrow ? 8 : 0,
        }}>
          {projects.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无项目" style={{ marginTop: 40 }} />
          ) : projects.map(p => {
            const pStats = p.stats;
            const pProgress = pStats?.overall_progress ?? 0;
            return (
              <div key={p.project_id}
                onClick={() => { setSelectedPid(p.project_id); setActiveEpisode('all'); setSelectedCards(new Set()); }}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedPid(p.project_id); setActiveEpisode('all'); } }}
                style={{
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer', marginBottom: 4, outline: 'none',
                  background: selectedPid === p.project_id ? `${COLORS.iris}0a` : 'transparent',
                  border: selectedPid === p.project_id ? `1.5px solid ${COLORS.iris}30` : '1.5px solid transparent',
                  transition: 'all .15s', minWidth: isNarrow ? 220 : undefined,
                }}
                onMouseEnter={e => { if (selectedPid !== p.project_id) e.currentTarget.style.background = '#fff'; }}
                onMouseLeave={e => { if (selectedPid !== p.project_id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 13 }}>{p.name}</Text>
                  <Space size={2}>
                    <Tooltip title="层级视图">
                      <Button type="text" size="small" icon={<AppstoreOutlined />}
                        onClick={e => { e.stopPropagation(); navigate(`/production/${p.project_id}`); }}
                        style={{ width: 24, height: 24, opacity: 0.6, color: COLORS.iris }} />
                    </Tooltip>
                    <Popconfirm title="删除此项目？" onConfirm={(e) => { e?.stopPropagation(); handleDeleteProject(p.project_id); }} onCancel={e => e?.stopPropagation()}>
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} style={{ width: 24, height: 24, opacity: 0.5 }} />
                    </Popconfirm>
                  </Space>
                </div>
                {p.description && <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>{p.description}</Text>}
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag style={{ fontSize: 10 }}>{p.cardCount ?? 0} 卡片</Tag>
                  {pProgress > 0 && (
                    <Progress percent={pProgress} size="small" showInfo={false}
                      strokeColor={pProgress === 100 ? '#52c41a' : COLORS.iris}
                      style={{ flex: 1, marginBottom: 0 }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main: Kanban board ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 0 }}>
        {!selectedPid ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafbfd' }}>
            <Empty description="选择或创建一个项目开始制作" />
          </div>
        ) : loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{
              padding: isNarrow ? '10px 12px' : '10px 20px',
              borderBottom: `1px solid ${COLORS.border}`, background: '#fff',
              display: 'flex', flexDirection: isNarrow ? 'column' : 'row',
              alignItems: isNarrow ? 'stretch' : 'center',
              justifyContent: 'space-between', gap: 8, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <Text strong style={{ fontSize: 16, whiteSpace: 'nowrap' }}>{project?.name}</Text>
                  <Tooltip title="编辑项目">
                    <Button type="text" size="small" icon={<EditOutlined />}
                      onClick={() => { setEditProjectForm({ name: project?.name || '', description: project?.description || '' }); setEditProjectOpen(true); }}
                      style={{ width: 26, height: 26, color: COLORS.slate }} />
                  </Tooltip>
                  <Tooltip title="项目设置">
                    <Button type="text" size="small" icon={<SettingOutlined />}
                      onClick={() => setSettingsOpen(true)}
                      style={{ width: 26, height: 26, color: COLORS.slate }} />
                  </Tooltip>
                </div>
                {project?.description && !isNarrow && (
                  <Text type="secondary" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.description}
                  </Text>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Input prefix={<SearchOutlined style={{ color: '#bbb' }} />} placeholder="搜索卡片..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  allowClear size="small"
                  style={{ width: 180 }} />
                <Select size="small" value={statusFilter} onChange={v => setStatusFilter(v ?? '')}
                  placeholder="状态" allowClear style={{ width: 100 }}
                  options={[
                    { value: '', label: '全部状态' },
                    { value: 'pending', label: '待制作' },
                    { value: 'done', label: '已完成' },
                    { value: 'review', label: '审核中' },
                  ]} />
                {nextAutoStage && (
                  <Button type="primary" size="small" icon={<ThunderboltOutlined />}
                    loading={!!generating} onClick={() => openGenDialog(nextAutoStage.key)}>
                    AI 生成: {nextAutoStage.name}
                  </Button>
                )}
                <Text type="secondary" style={{ fontSize: 11 }}>{filteredCards.length}/{cards.length}</Text>
                {overallProgress > 0 && (
                  <Tooltip title={`总进度 ${overallProgress}%`}>
                    <Progress type="circle" percent={overallProgress} size={28}
                      strokeColor={overallProgress === 100 ? '#52c41a' : COLORS.iris}
                      format={p => <span style={{ fontSize: 10 }}>{p}</span>} />
                  </Tooltip>
                )}
              </div>
            </div>

            {/* ── Batch action bar ── */}
            {selectedCards.size > 0 && (
              <div style={{
                padding: '6px 20px', background: `${COLORS.iris}08`, borderBottom: `1px solid ${COLORS.iris}20`,
                display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
              }}>
                <Text strong style={{ fontSize: 12, color: COLORS.iris }}>已选 {selectedCards.size} 张</Text>
                <Select size="small" placeholder="批量移动到..." style={{ width: 150 }}
                  onChange={handleBatchMove}
                  options={stages.map(s => ({ value: s.key, label: s.name }))} />
                <Select size="small" placeholder="批量改状态..." style={{ width: 120 }}
                  onChange={handleBatchStatus}
                  options={[
                    { value: 'pending', label: '待制作' },
                    { value: 'done', label: '已完成' },
                    { value: 'review', label: '审核中' },
                  ]} />
                <Popconfirm title={`确定删除 ${selectedCards.size} 张卡片？`} onConfirm={handleBatchDelete}>
                  <Button size="small" danger icon={<DeleteOutlined />}>批量删除</Button>
                </Popconfirm>
                <Button size="small" onClick={() => setSelectedCards(new Set())}>取消选择</Button>
              </div>
            )}

            {/* ── Episode tabs ── */}
            <div style={{
              padding: isNarrow ? '0 12px' : '0 20px', background: '#fff',
              borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0,
            }}>
              <Tabs activeKey={activeEpisode} onChange={setActiveEpisode} size="small"
                style={{ marginBottom: 0 }}
                items={episodeTabs.map(t => ({
                  key: t.key,
                  label: (
                    <Space size={4}>
                      {t.label}
                      <Badge count={t.count} style={{
                        backgroundColor: t.key === activeEpisode ? COLORS.iris : '#e8e8e8',
                        color: t.key === activeEpisode ? '#fff' : '#999',
                        fontSize: 10, boxShadow: 'none',
                      }} size="small" overflowCount={999} />
                    </Space>
                  ),
                }))}
              />
            </div>

            {/* ── Board ── */}
            <div style={{
              flex: 1, overflow: 'auto', padding: isNarrow ? '10px 4px' : '12px 10px',
              display: 'flex', gap: 10, minWidth: 0, minHeight: 0, background: '#f5f6fa',
            }}>
              {(activeEpisode === 'all' ? stages : activeStages.length > 0 ? activeStages : stages).map(stage => {
                const sc = stageCards(stage.key);
                const color = STAGE_COLORS[stage.key] || COLORS.iris;
                const isGenerating = generating === stage.key;
                const isDragOver = dragOverStage === stage.key;
                const stageStat = stats?.by_stage?.[stage.key];
                const doneCount = stageStat?.done ?? sc.filter(c => c.status === 'done').length;
                return (
                  <div key={stage.key}
                    onDragOver={e => onDragOver(e, stage.key)}
                    onDragLeave={onDragLeave}
                    onDrop={e => onDrop(e, stage.key)}
                    style={{
                      minWidth: isNarrow ? 'calc(100vw - 96px)' : 250,
                      maxWidth: isNarrow ? 'calc(100vw - 96px)' : 290,
                      flex: '0 0 auto', display: 'flex', flexDirection: 'column',
                      background: isDragOver ? `${color}10` : '#fff',
                      borderRadius: 12, overflow: 'hidden',
                      border: isDragOver ? `2px dashed ${color}` : '1px solid #eee',
                      transition: 'all .2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                    }}>
                    {/* Column header */}
                    <div style={{ padding: '10px 12px 6px', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Space size={6}>
                          <span style={{ color, fontSize: 13 }}>{STAGE_ICONS[stage.key]}</span>
                          <Text strong style={{ fontSize: 12 }}>{stage.name}</Text>
                          {sc.length > 0 && <Badge count={sc.length} style={{ backgroundColor: color, boxShadow: 'none' }} size="small" />}
                        </Space>
                        <Space size={2}>
                          <Tooltip title="新建卡片">
                            <Button type="text" size="small"
                              icon={<PlusOutlined style={{ color, fontSize: 12 }} />}
                              onClick={() => openAddCard(stage.key)}
                              style={{ width: 26, height: 26 }} />
                          </Tooltip>
                          {stage.auto && (
                            <Tooltip title={`AI 生成${stage.name}`}>
                              <Button type="text" size="small"
                                icon={<ThunderboltOutlined style={{ color }} />}
                                loading={isGenerating}
                                onClick={() => openGenDialog(stage.key)}
                                style={{ width: 26, height: 26 }} />
                            </Tooltip>
                          )}
                        </Space>
                      </div>
                      <StageProgress total={sc.length} done={doneCount} />
                    </div>

                    {/* Cards */}
                    <div style={{ flex: 1, overflow: 'auto', padding: '4px 8px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {isGenerating && (
                        <div style={{ padding: 16, textAlign: 'center' }}>
                          <Spin size="small" /><br />
                          <Text type="secondary" style={{ fontSize: 11 }}>AI 生成中...</Text>
                        </div>
                      )}
                      {sc.map(card => {
                        const isSelected = selectedCards.has(card.card_id);
                        const st = STATUS_MAP[card.status] || STATUS_MAP.pending;
                        return (
                          <div key={card.card_id}
                            draggable
                            onDragStart={e => onDragStart(e, card.card_id)}
                            onDragEnd={() => { setDragCard(null); setDragOverStage(null); }}
                            onClick={() => openCard(card)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(card); } }}
                            role="button" tabIndex={0}
                            style={{
                              background: isSelected ? `${COLORS.iris}08` : '#fff',
                              borderRadius: 8, padding: '10px 12px',
                              border: isSelected ? `1.5px solid ${COLORS.iris}` : `1px solid #eee`,
                              cursor: 'grab', fontSize: 12, outline: 'none',
                              transition: 'all .15s', position: 'relative',
                              opacity: dragCard === card.card_id ? 0.4 : 1,
                            }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#d0d0d0'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,.06)'; }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.boxShadow = 'none'; }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                                <Checkbox checked={isSelected}
                                  onClick={e => e.stopPropagation()}
                                  onChange={() => toggleSelectCard(card.card_id)}
                                  style={{ marginRight: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <Text strong style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {card.title}
                                  </Text>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                                <Tooltip title={st.label}>
                                  <span style={{ color: st.color, fontSize: 12 }}>{st.icon}</span>
                                </Tooltip>
                                {PROMPT_STAGES.has(card.stage) && card.prompts.length > 0 && <CopyBtn text={card.prompts.join('\n\n')} />}
                              </div>
                            </div>
                            {activeEpisode === 'all' && (
                              <Tag style={{ fontSize: 9, marginTop: 4, lineHeight: '14px', padding: '0 4px' }}
                                color={card.episode == null ? 'purple' : 'blue'}>
                                {card.episode == null ? '全局' : `EP${String(card.episode).padStart(2, '0')}`}
                              </Tag>
                            )}
                            {card.content && (
                              <Paragraph type="secondary" ellipsis={{ rows: 2 }}
                                style={{ fontSize: 11, margin: '4px 0 0', lineHeight: 1.5 }}>
                                {card.content}
                              </Paragraph>
                            )}
                            <CardThumbnails images={card.images} />
                            {(card.prompts.length > 0 || card.images.length > 0 || card.videos.length > 0) && (
                              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                                {card.prompts.length > 0 && <Tag color="blue" style={{ fontSize: 10, lineHeight: '16px', margin: 0 }}>{card.prompts.length} 提示词</Tag>}
                                {card.images.length > 0 && <Tag color="green" style={{ fontSize: 10, lineHeight: '16px', margin: 0 }}>{card.images.length} 图</Tag>}
                                {card.videos.length > 0 && <Tag color="purple" style={{ fontSize: 10, lineHeight: '16px', margin: 0 }}>{card.videos.length} 视频</Tag>}
                              </div>
                            )}
                            {card.assignee && (
                              <div style={{ marginTop: 4 }}>
                                <Tag icon={<UserOutlined />} style={{ fontSize: 10, lineHeight: '16px', margin: 0 }}>{card.assignee}</Tag>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {sc.length === 0 && !isGenerating && (
                        <div style={{
                          padding: '24px 12px', textAlign: 'center', border: '1px dashed #e0e0e0',
                          borderRadius: 8, background: '#fafbfd',
                        }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {stage.auto ? '点击 ⚡ AI生成 或 + 手动添加' : '点击 + 添加卡片'}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}

      {/* New project */}
      <Modal title="新建制作项目" open={newProjOpen} onCancel={() => setNewProjOpen(false)} onOk={handleCreateProject} okText="创建" width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>项目名称</Text>
            <Input value={newProjForm.name} onChange={e => setNewProjForm(p => ({ ...p, name: e.target.value }))}
              placeholder="例：九陆纪元 · 第一季" style={{ marginTop: 4 }} />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>简介</Text>
            <Input value={newProjForm.description} onChange={e => setNewProjForm(p => ({ ...p, description: e.target.value }))}
              placeholder="可选" style={{ marginTop: 4 }} />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>素材类型</Text>
            <Select value={newProjForm.sourceType} onChange={v => setNewProjForm(p => ({ ...p, sourceType: v }))}
              style={{ width: '100%', marginTop: 4 }}
              options={[
                { value: 'idea', label: '创意/想法' },
                { value: 'novel', label: '小说/原著' },
                { value: 'script', label: '已有剧本' },
                { value: 'outline', label: '大纲' },
              ]} />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>原始内容</Text>
            <TextArea value={newProjForm.sourceContent} onChange={e => setNewProjForm(p => ({ ...p, sourceContent: e.target.value }))}
              placeholder="粘贴你的创意、小说章节、或剧本大纲..." rows={8} style={{ marginTop: 4 }} />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>AI 员工</Text>
            <Select value={newProjForm.employeeKey} onChange={v => setNewProjForm(p => ({ ...p, employeeKey: v }))}
              style={{ width: '100%', marginTop: 4 }} allowClear placeholder="选择一个数字员工"
              options={employees.map(e => ({ value: e.employeeKey, label: e.name }))} />
          </div>
        </div>
      </Modal>

      {/* Edit project */}
      <Modal title="编辑项目" open={editProjectOpen} onCancel={() => setEditProjectOpen(false)} onOk={handleUpdateProject} okText="保存" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>项目名称</Text>
            <Input value={editProjectForm.name} onChange={e => setEditProjectForm(p => ({ ...p, name: e.target.value }))} style={{ marginTop: 4 }} />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>简介</Text>
            <Input value={editProjectForm.description} onChange={e => setEditProjectForm(p => ({ ...p, description: e.target.value }))} style={{ marginTop: 4 }} />
          </div>
        </div>
      </Modal>

      {/* Generate dialog */}
      <Modal title={`AI 生成: ${stages.find(s => s.key === genTarget)?.name || ''}`}
        open={genDialogOpen} onCancel={() => setGenDialogOpen(false)} onOk={handleGenerate}
        okText="开始生成" okButtonProps={{ icon: <ThunderboltOutlined /> }} width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>执行员工</Text>
            <Select value={genEmpKey} onChange={setGenEmpKey}
              style={{ width: '100%', marginTop: 4 }} placeholder="选择数字员工"
              options={employees.map(e => ({ value: e.employeeKey, label: e.name }))} />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>额外指令（可选）</Text>
            <TextArea value={genExtra} onChange={e => setGenExtra(e.target.value)}
              placeholder="例：风格偏赛博朋克，角色偏少年感..." rows={3} style={{ marginTop: 4 }} />
          </div>
        </div>
      </Modal>

      {/* Add card */}
      <Modal title={`新建卡片 — ${stages.find(s => s.key === addCardStage)?.name || ''}`}
        open={addCardOpen} onCancel={() => setAddCardOpen(false)} onOk={handleAddCard} okText="创建" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>标题</Text>
            <Input value={addCardForm.title} onChange={e => setAddCardForm(p => ({ ...p, title: e.target.value }))}
              placeholder="例：场景1 / 角色：苍霖 / 镜头01" style={{ marginTop: 4 }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>集数（留空=全局）</Text>
              <Input type="number" value={addCardForm.episode ?? ''} placeholder="全局"
                onChange={e => setAddCardForm(p => ({ ...p, episode: e.target.value ? parseInt(e.target.value) : null }))}
                style={{ marginTop: 4 }} />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>镜头号</Text>
              <Input type="number" value={addCardForm.shot_number}
                onChange={e => setAddCardForm(p => ({ ...p, shot_number: parseInt(e.target.value) || 0 }))}
                style={{ marginTop: 4 }} />
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>内容</Text>
            <TextArea value={addCardForm.content} onChange={e => setAddCardForm(p => ({ ...p, content: e.target.value }))}
              placeholder="卡片内容..." rows={6} style={{ marginTop: 4 }} />
          </div>
        </div>
      </Modal>

      {/* ── Card detail drawer ── */}
      <Drawer title={null} open={cardDrawerOpen}
        onClose={() => { setCardDrawerOpen(false); setEditMode(false); setEditForm({}); }} width={680}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
      >
        {activeCard && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Drawer header */}
            <div style={{
              padding: '14px 20px', borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color={STAGE_COLORS[activeCard.stage]} style={{ fontSize: 12, margin: 0 }}>
                  {stages.find(s => s.key === activeCard.stage)?.name || activeCard.stage}
                </Tag>
                {activeCard.episode != null && <Tag color="blue" style={{ margin: 0 }}>EP{String(activeCard.episode).padStart(2, '0')}</Tag>}
                {activeCard.episode == null && <Tag color="purple" style={{ margin: 0 }}>全局资产</Tag>}
                {activeCard.shot_number > 0 && <Tag style={{ fontSize: 11, margin: 0 }}>镜头 {activeCard.shot_number}</Tag>}
              </div>
              <Space>
                {editMode ? (
                  <>
                    <Button size="small" onClick={() => { setEditMode(false); setEditForm({}); }}>取消</Button>
                    <Button type="primary" size="small" icon={<SaveOutlined />} onClick={handleSaveCard}>保存</Button>
                  </>
                ) : (
                  <>
                    <Button size="small" icon={<EditOutlined />} onClick={() => { setEditMode(true); setEditForm({}); }}>编辑</Button>
                    <Popconfirm title="删除此卡片？" onConfirm={() => handleDeleteCard(activeCard.card_id)}>
                      <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                    <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setCardDrawerOpen(false)} />
                  </>
                )}
              </Space>
            </div>

            {/* Drawer body */}
            <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title & move */}
              {!editMode && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0 }}>{activeCard.title}</Title>
                  <Select size="small" value={activeCard.stage}
                    onChange={(stage) => handleMoveCard(activeCard.card_id, stage)}
                    style={{ minWidth: 150 }}
                    options={stages.map(s => ({ value: s.key, label: `移至 ${s.name}` }))} />
                </div>
              )}

              {/* Status bar */}
              {!editMode && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Tag icon={STATUS_MAP[activeCard.status]?.icon} color={activeCard.status === 'done' ? 'success' : activeCard.status === 'review' ? 'processing' : 'warning'}>
                    {STATUS_MAP[activeCard.status]?.label || activeCard.status}
                  </Tag>
                  {activeCard.assignee && <Tag icon={<UserOutlined />}>{activeCard.assignee}</Tag>}
                  {activeCard.metadata?.type && <Tag>{activeCard.metadata.type}</Tag>}
                  {activeCard.metadata?.r_id && <Tag color="geekblue">{activeCard.metadata.r_id}</Tag>}
                </div>
              )}

              {editMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>标题</Text>
                    <Input value={editForm.title ?? activeCard.title}
                      onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} style={{ marginTop: 4 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>集数</Text>
                      <Input type="number" placeholder="留空=全局"
                        value={editForm.episode !== undefined ? (editForm.episode ?? '') : (activeCard.episode ?? '')}
                        onChange={e => setEditForm(p => ({ ...p, episode: e.target.value ? parseInt(e.target.value) : null }))}
                        style={{ marginTop: 4 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>镜头号</Text>
                      <Input type="number" value={editForm.shot_number ?? activeCard.shot_number}
                        onChange={e => setEditForm(p => ({ ...p, shot_number: parseInt(e.target.value) || 0 }))}
                        style={{ marginTop: 4 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>状态</Text>
                      <Select value={editForm.status ?? activeCard.status}
                        onChange={v => setEditForm(p => ({ ...p, status: v }))}
                        style={{ width: '100%', marginTop: 4 }}
                        options={[
                          { value: 'pending', label: '待制作' },
                          { value: 'done', label: '已完成' },
                          { value: 'review', label: '审核中' },
                        ]} />
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>负责人</Text>
                    <Input value={editForm.assignee ?? activeCard.assignee}
                      onChange={e => setEditForm(p => ({ ...p, assignee: e.target.value }))}
                      placeholder="可选" style={{ marginTop: 4 }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>内容</Text>
                    <TextArea value={editForm.content ?? activeCard.content}
                      onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
                      rows={8} style={{ marginTop: 4 }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>提示词（每行一条）</Text>
                    <TextArea value={(editForm.prompts ?? activeCard.prompts).join('\n')}
                      onChange={e => setEditForm(p => ({ ...p, prompts: e.target.value.split('\n').filter(Boolean) }))}
                      rows={4} style={{ marginTop: 4 }} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Images */}
                  {activeCard.images.length > 0 && (
                    <div>
                      <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                        图片 <Badge count={activeCard.images.length} style={{ backgroundColor: '#10b981', marginLeft: 6 }} size="small" />
                      </Text>
                      <Image.PreviewGroup>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {activeCard.images.map((url, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                              <Image src={url} alt=""
                                width={activeCard.images.length === 1 ? 300 : 150}
                                style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, objectFit: 'cover' }}
                                fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23f0f0f0' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3E加载失败%3C/text%3E%3C/svg%3E"
                              />
                              <Button type="text" size="small" danger icon={<DeleteOutlined />}
                                onClick={() => handleRemoveMedia('images', i)}
                                style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,255,255,.9)', width: 22, height: 22, borderRadius: '50%' }} />
                            </div>
                          ))}
                        </div>
                      </Image.PreviewGroup>
                    </div>
                  )}

                  {/* Videos */}
                  {activeCard.videos.length > 0 && (
                    <div>
                      <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                        视频 <Badge count={activeCard.videos.length} style={{ backgroundColor: '#8b5cf6', marginLeft: 6 }} size="small" />
                      </Text>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {activeCard.videos.map((url, i) => (
                          <div key={i} style={{ position: 'relative' }}>
                            <video src={url} controls
                              style={{ width: 280, borderRadius: 8, border: `1px solid ${COLORS.border}`, background: '#000' }} />
                            <Button type="text" size="small" danger icon={<DeleteOutlined />}
                              onClick={() => handleRemoveMedia('videos', i)}
                              style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,255,255,.9)', width: 22, height: 22, borderRadius: '50%' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button icon={<UploadOutlined />} loading={uploading}
                      onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleUploadFile(f, 'image'); }; input.click(); }}>
                      上传图片
                    </Button>
                    <Button icon={<UploadOutlined />} loading={uploading}
                      onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'video/*'; input.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleUploadFile(f, 'video'); }; input.click(); }}>
                      上传视频
                    </Button>
                  </div>

                  {/* Prompt quick-copy banner */}
                  {PROMPT_STAGES.has(activeCard.stage) && (() => {
                    const promptText = activeCard.prompts.length > 0
                      ? activeCard.prompts.join('\n\n')
                      : activeCard.content?.match(/```[\s\S]*?\n([\s\S]*?)```/)?.[1]?.trim();
                    return promptText ? (
                      <div style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        borderRadius: 12, padding: '14px 18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      }}>
                        <div style={{ color: '#fff' }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {activeCard.stage === 'img_prompt' ? '图片提示词' : '视频提示词'}
                          </div>
                          <div style={{ fontSize: 11, opacity: .8, marginTop: 2 }}>
                            复制后粘贴到即梦 / 小云雀 / Seedance
                          </div>
                        </div>
                        <CopyBtn text={promptText} label="一键复制提示词" />
                      </div>
                    ) : null;
                  })()}

                  {/* Content */}
                  {activeCard.content && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text strong style={{ fontSize: 13 }}>内容</Text>
                        <CopyBtn text={activeCard.content} />
                      </div>
                      <div style={{ background: '#f8f9fc', borderRadius: 10, padding: 16, border: `1px solid ${COLORS.border}` }}
                        className="wb-markdown">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ children, className, ...props }) {
                              const isBlock = className || String(children).includes('\n');
                              return isBlock
                                ? <CodeBlock className={className}>{String(children)}</CodeBlock>
                                : <code style={{ background: '#e8e8e8', padding: '1px 5px', borderRadius: 4, fontSize: '0.9em' }} {...props}>{children}</code>;
                            },
                            pre({ children }) { return <>{children}</>; },
                            table({ children, ...props }) {
                              return <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12.5, margin: '8px 0' }} {...props}>{children}</table>;
                            },
                            th({ children, ...props }) {
                              return <th style={{ border: '1px solid #e0e0e0', padding: '6px 10px', background: '#f0f0f0', textAlign: 'left', fontWeight: 600 }} {...props}>{children}</th>;
                            },
                            td({ children, ...props }) {
                              return <td style={{ border: '1px solid #e0e0e0', padding: '6px 10px' }} {...props}>{children}</td>;
                            },
                          }}
                        >{activeCard.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Prompts */}
                  {activeCard.prompts.length > 0 && (
                    <div>
                      <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                        提示词 <Badge count={activeCard.prompts.length} style={{ backgroundColor: COLORS.iris, marginLeft: 6 }} size="small" />
                      </Text>
                      {activeCard.prompts.map((p, i) => (
                        <div key={i} style={{
                          background: '#1e293b', color: '#e2e8f0', borderRadius: 10,
                          padding: '12px 16px', marginBottom: 8, position: 'relative',
                          fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                        }}>
                          <div style={{ position: 'absolute', top: 8, right: 8 }}><CopyBtn text={p} /></div>
                          {p}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* ── Project Settings Drawer ── */}
      <Drawer title="项目设置" open={settingsOpen} onClose={() => setSettingsOpen(false)} width={480}>
        {project && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Info */}
            <div>
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>基本信息</Text>
              <div style={{ background: '#f8f9fc', borderRadius: 10, padding: 16, border: `1px solid ${COLORS.border}` }}>
                <div style={{ marginBottom: 8 }}><Text type="secondary" style={{ fontSize: 12 }}>名称:</Text> <Text>{project.name}</Text></div>
                <div style={{ marginBottom: 8 }}><Text type="secondary" style={{ fontSize: 12 }}>简介:</Text> <Text>{project.description || '无'}</Text></div>
                <div style={{ marginBottom: 8 }}><Text type="secondary" style={{ fontSize: 12 }}>素材类型:</Text> <Tag>{project.source_type}</Tag></div>
                <div><Text type="secondary" style={{ fontSize: 12 }}>创建时间:</Text> <Text style={{ fontSize: 12 }}>{new Date(project.created_at).toLocaleString()}</Text></div>
              </div>
              <Button size="small" icon={<EditOutlined />} style={{ marginTop: 8 }}
                onClick={() => { setEditProjectForm({ name: project.name, description: project.description }); setEditProjectOpen(true); }}>
                编辑信息
              </Button>
            </div>

            {/* Members */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ fontSize: 14 }}>
                  <TeamOutlined style={{ marginRight: 6 }} />成员管理
                </Text>
                <Button size="small" type="primary" icon={<PlusOutlined />}
                  onClick={() => setAddMemberOpen(true)}>添加成员</Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(project.members || []).map(m => (
                  <div key={m.user_id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: '#f8f9fc', borderRadius: 8, border: `1px solid ${COLORS.border}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar size={32} icon={<UserOutlined />} style={{ backgroundColor: COLORS.iris }} />
                      <div>
                        <Text strong style={{ fontSize: 13 }}>{m.name}</Text>
                        <div>
                          <Tag color={ROLE_MAP[m.role]?.color} style={{ fontSize: 10, margin: 0 }}>
                            {ROLE_MAP[m.role]?.label || m.role}
                          </Tag>
                        </div>
                      </div>
                    </div>
                    <Space>
                      <Select size="small" value={m.role}
                        onChange={v => handleUpdateMemberRole(m.user_id, v)}
                        style={{ width: 100 }}
                        options={[
                          { value: 'owner', label: '所有者' },
                          { value: 'editor', label: '编辑者' },
                          { value: 'viewer', label: '查看者' },
                        ]} />
                      {m.role !== 'owner' && (
                        <Popconfirm title="移除此成员？" onConfirm={() => handleRemoveMember(m.user_id)}>
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      )}
                    </Space>
                  </div>
                ))}
                {(!project.members || project.members.length === 0) && (
                  <Empty description="暂无成员" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
                  <BarChartOutlined style={{ marginRight: 6 }} />项目统计
                </Text>
                <div style={{ background: '#f8f9fc', borderRadius: 10, padding: 16, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.iris }}>{stats.total}</div>
                      <Text type="secondary" style={{ fontSize: 11 }}>总卡片</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{stats.by_status?.done || 0}</div>
                      <Text type="secondary" style={{ fontSize: 11 }}>已完成</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#faad14' }}>{stats.by_status?.pending || 0}</div>
                      <Text type="secondary" style={{ fontSize: 11 }}>待制作</Text>
                    </div>
                  </div>
                  <Progress percent={stats.overall_progress} strokeColor={stats.overall_progress === 100 ? '#52c41a' : COLORS.iris}
                    format={p => `${p}%`} />
                </div>
              </div>
            )}

            {/* Settings */}
            <div>
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>项目配置</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13 }}>可见性</Text>
                  <Select size="small" value={project.settings?.visibility || 'private'}
                    style={{ width: 120 }}
                    onChange={v => api.updateProject(selectedPid, { settings: { visibility: v } }).then(() => loadProject(selectedPid))}
                    options={[
                      { value: 'private', label: '私有' },
                      { value: 'team', label: '团队可见' },
                      { value: 'public', label: '公开' },
                    ]} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13 }}>AI 生成</Text>
                  <Select size="small" value={project.settings?.allow_ai_generate !== false ? 'enabled' : 'disabled'}
                    style={{ width: 120 }}
                    onChange={v => api.updateProject(selectedPid, { settings: { allow_ai_generate: v === 'enabled' } }).then(() => loadProject(selectedPid))}
                    options={[
                      { value: 'enabled', label: '启用' },
                      { value: 'disabled', label: '禁用' },
                    ]} />
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add member modal */}
      <Modal title="添加成员" open={addMemberOpen} onCancel={() => setAddMemberOpen(false)} onOk={handleAddMember} okText="添加" width={400}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>成员名称</Text>
            <Input value={addMemberForm.name} onChange={e => setAddMemberForm(p => ({ ...p, name: e.target.value }))}
              placeholder="输入成员名称" style={{ marginTop: 4 }} />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>角色</Text>
            <Select value={addMemberForm.role} onChange={v => setAddMemberForm(p => ({ ...p, role: v }))}
              style={{ width: '100%', marginTop: 4 }}
              options={[
                { value: 'editor', label: '编辑者 — 可编辑卡片和内容' },
                { value: 'viewer', label: '查看者 — 只能查看' },
                { value: 'owner', label: '所有者 — 完整权限' },
              ]} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
