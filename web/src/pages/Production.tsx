import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Button, Card, Drawer, Empty, Input, List, message, Modal, Popconfirm,
  Select, Space, Spin, Tag, Tooltip, Typography, Badge, Image, Tabs,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, CopyOutlined, CheckOutlined,
  RobotOutlined, RightOutlined, EditOutlined, EyeOutlined,
  PlayCircleOutlined, FileTextOutlined, PictureOutlined,
  VideoCameraOutlined, ThunderboltOutlined, CaretRightOutlined,
  GlobalOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { COLORS } from '../theme';
import ReactMarkdown from 'react-markdown';

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

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <Tooltip title={copied ? '已复制' : '复制'}>
      <Button type="text" size="small" icon={copied ? <CheckOutlined style={{ color: COLORS.mint }} /> : <CopyOutlined />}
        onClick={(e) => { e.stopPropagation(); copy(); }} style={{ fontSize: 12, width: 26, height: 26, color: COLORS.slate }} />
    </Tooltip>
  );
}

interface StageInfo { key: string; name: string; order: number; auto: boolean }
interface CardItem {
  card_id: string; project_id: string; stage: string; title: string;
  content: string; episode: number | null; shot_number: number; prompts: string[];
  images: string[]; videos: string[]; metadata: Record<string, any>;
  status: string; created_at: string; updated_at: string;
}
interface Project {
  project_id: string; name: string; description: string;
  source_type: string; source_content: string;
  employee_key: string; team_code: string;
  created_at: string; updated_at: string; cardCount?: number;
  cards?: CardItem[]; stages?: StageInfo[];
}

function CardThumbnails({ images }: { images: string[] }) {
  if (!images.length) return null;
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
      {images.slice(0, 3).map((url, i) => (
        <div key={i} style={{
          width: 48, height: 48, borderRadius: 6, overflow: 'hidden',
          border: `1px solid ${COLORS.border}`, flexShrink: 0,
        }}>
          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      ))}
      {images.length > 3 && (
        <div style={{
          width: 48, height: 48, borderRadius: 6, background: '#f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: '#999', border: `1px solid ${COLORS.border}`,
        }}>+{images.length - 3}</div>
      )}
    </div>
  );
}

export default function Production() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedPid, setSelectedPid] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [stages, setStages] = useState<StageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<string>('all');

  const [newProjOpen, setNewProjOpen] = useState(false);
  const [newProjForm, setNewProjForm] = useState({ name: '', description: '', sourceType: 'idea', sourceContent: '', employeeKey: '' });
  const [cardDrawerOpen, setCardDrawerOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<CardItem | null>(null);
  const [genDialogOpen, setGenDialogOpen] = useState(false);
  const [genTarget, setGenTarget] = useState('');
  const [genExtra, setGenExtra] = useState('');
  const [genEmpKey, setGenEmpKey] = useState('');

  const episodes = useMemo(() => {
    const eps = new Set<number>();
    cards.forEach(c => { if (c.episode != null) eps.add(c.episode); });
    return Array.from(eps).sort((a, b) => a - b);
  }, [cards]);

  const globalCards = useMemo(() => cards.filter(c => c.episode == null), [cards]);

  const filteredCards = useMemo(() => {
    if (activeEpisode === 'all') return cards;
    if (activeEpisode === 'global') return globalCards;
    const ep = parseInt(activeEpisode);
    return cards.filter(c => c.episode === ep);
  }, [cards, activeEpisode, globalCards]);

  const loadProjects = useCallback(async () => {
    try {
      const data = await api.listProjects();
      setProjects(data);
    } catch { /* ignore */ }
  }, []);

  const loadProject = useCallback(async (pid: string) => {
    if (!pid) return;
    setLoading(true);
    try {
      const data = await api.getProject(pid);
      setProject(data);
      setCards(data.cards || []);
      setStages(data.stages || []);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); api.listEmployees().then(setEmployees).catch(() => {}); }, [loadProjects]);
  useEffect(() => { if (selectedPid) loadProject(selectedPid); }, [selectedPid, loadProject]);

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
    } catch (e: any) {
      message.error('生成失败: ' + e.message);
    } finally {
      setGenerating('');
      setGenExtra('');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await api.deleteCard(cardId);
      setCards(prev => prev.filter(c => c.card_id !== cardId));
      if (activeCard?.card_id === cardId) setCardDrawerOpen(false);
    } catch (e: any) { message.error(e.message); }
  };

  const openGenDialog = (stageKey: string) => {
    setGenTarget(stageKey);
    setGenEmpKey(project?.employee_key || '');
    setGenExtra('');
    setGenDialogOpen(true);
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
      const status = cards.filter(c => c.episode === ep).every(c => c.status === 'pending') ? 'pending' : 'active';
      tabs.push({
        key: String(ep),
        label: <>{`EP${String(ep).padStart(2, '0')}`}{status === 'pending' && <span style={{ opacity: 0.5 }}> (待做)</span>}</>,
        count,
      });
    });
    return tabs;
  }, [cards, globalCards, episodes]);

  const activeStages = useMemo(() => {
    const usedStages = new Set(filteredCards.map(c => c.stage));
    return stages.filter(s => usedStages.has(s.key));
  }, [stages, filteredCards]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', gap: 0 }}>
      {/* Left: Project list */}
      <div style={{ width: 260, borderRight: `1px solid ${COLORS.border}`, background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text strong style={{ fontSize: 15 }}>制作项目</Text>
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setNewProjOpen(true)}>新建</Button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
          {projects.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无项目" style={{ marginTop: 40 }} />
          ) : (
            projects.map(p => (
              <div key={p.project_id}
                onClick={() => { setSelectedPid(p.project_id); setActiveEpisode('all'); }}
                style={{
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer', marginBottom: 4,
                  background: selectedPid === p.project_id ? `${COLORS.iris}08` : 'transparent',
                  border: selectedPid === p.project_id ? `1.5px solid ${COLORS.iris}30` : '1.5px solid transparent',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { if (selectedPid !== p.project_id) (e.currentTarget.style.background = '#f8f9fc'); }}
                onMouseLeave={e => { if (selectedPid !== p.project_id) (e.currentTarget.style.background = 'transparent'); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 13 }}>{p.name}</Text>
                  <Popconfirm title="删除此项目？" onConfirm={(e) => { e?.stopPropagation(); handleDeleteProject(p.project_id); }} onCancel={e => e?.stopPropagation()}>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} style={{ width: 24, height: 24 }} />
                  </Popconfirm>
                </div>
                {p.description && <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>{p.description}</Text>}
                <div style={{ marginTop: 6 }}>
                  <Tag style={{ fontSize: 10 }}>{p.cardCount ?? 0} 张卡片</Tag>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main: Kanban board */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedPid ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="选择或创建一个项目开始制作" />
          </div>
        ) : loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <Text strong style={{ fontSize: 16 }}>{project?.name}</Text>
                {project?.description && <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>{project.description}</Text>}
              </div>
              <Space>
                {nextAutoStage && (
                  <Button type="primary" icon={<ThunderboltOutlined />}
                    loading={!!generating}
                    onClick={() => openGenDialog(nextAutoStage.key)}>
                    AI 生成: {nextAutoStage.name}
                  </Button>
                )}
                <Text type="secondary" style={{ fontSize: 12 }}>{filteredCards.length} / {cards.length} 张卡片</Text>
              </Space>
            </div>

            {/* Episode tabs */}
            <div style={{
              padding: '0 20px', background: '#fff',
              borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0,
            }}>
              <Tabs
                activeKey={activeEpisode}
                onChange={setActiveEpisode}
                size="small"
                style={{ marginBottom: 0 }}
                items={episodeTabs.map(t => ({
                  key: t.key,
                  label: (
                    <Space size={4}>
                      {t.label}
                      <Badge count={t.count} style={{
                        backgroundColor: t.key === activeEpisode ? COLORS.iris : '#e0e0e0',
                        color: t.key === activeEpisode ? '#fff' : '#666',
                        fontSize: 10,
                      }} size="small" overflowCount={999} />
                    </Space>
                  ),
                }))}
              />
            </div>

            {/* Board */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 8px', display: 'flex', gap: 8 }}>
              {(activeEpisode === 'all' ? stages : activeStages.length > 0 ? activeStages : stages).map(stage => {
                const sc = stageCards(stage.key);
                const color = STAGE_COLORS[stage.key] || COLORS.iris;
                const isGenerating = generating === stage.key;
                return (
                  <div key={stage.key} style={{
                    minWidth: 240, maxWidth: 280, flex: '0 0 auto',
                    display: 'flex', flexDirection: 'column',
                    background: '#f8f9fc', borderRadius: 12, overflow: 'hidden',
                  }}>
                    {/* Column header */}
                    <div style={{ padding: '10px 12px', borderBottom: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                      <Space size={6}>
                        <span style={{ color, fontSize: 13 }}>{STAGE_ICONS[stage.key]}</span>
                        <Text strong style={{ fontSize: 12 }}>{stage.name}</Text>
                        {sc.length > 0 && <Badge count={sc.length} style={{ backgroundColor: color }} size="small" />}
                      </Space>
                      {stage.auto && (
                        <Tooltip title={`AI 生成${stage.name}`}>
                          <Button type="text" size="small"
                            icon={<ThunderboltOutlined style={{ color }} />}
                            loading={isGenerating}
                            onClick={() => openGenDialog(stage.key)}
                            style={{ width: 26, height: 26 }} />
                        </Tooltip>
                      )}
                    </div>

                    {/* Cards */}
                    <div style={{ flex: 1, overflow: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {isGenerating && (
                        <div style={{ padding: 16, textAlign: 'center' }}>
                          <Spin size="small" /><br />
                          <Text type="secondary" style={{ fontSize: 11 }}>AI 生成中...</Text>
                        </div>
                      )}
                      {sc.map(card => (
                        <div key={card.card_id}
                          onClick={() => { setActiveCard(card); setCardDrawerOpen(true); }}
                          className="card-hover"
                          style={{
                            background: '#fff', borderRadius: 8, padding: '10px 12px',
                            border: `1px solid ${card.status === 'pending' ? '#ffd591' : COLORS.border}`,
                            cursor: 'pointer', fontSize: 12,
                            opacity: card.status === 'pending' ? 0.7 : 1,
                          }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                            <div style={{ flex: 1 }}>
                              <Text strong style={{ fontSize: 12 }}>{card.title}</Text>
                              {activeEpisode === 'all' && (
                                <Tag style={{ fontSize: 9, marginLeft: 4, lineHeight: '14px', padding: '0 4px' }}
                                  color={card.episode == null ? 'purple' : 'blue'}>
                                  {card.episode == null ? '全局' : `EP${String(card.episode).padStart(2, '0')}`}
                                </Tag>
                              )}
                            </div>
                            {card.prompts.length > 0 && <CopyBtn text={card.prompts.join('\n\n')} />}
                          </div>
                          {card.content && (
                            <Paragraph type="secondary" ellipsis={{ rows: 2 }}
                              style={{ fontSize: 11, margin: '4px 0 0', lineHeight: 1.5 }}>
                              {card.content}
                            </Paragraph>
                          )}
                          <CardThumbnails images={card.images} />
                          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                            {card.prompts.length > 0 && <Tag color="blue" style={{ fontSize: 10, lineHeight: '16px' }}>{card.prompts.length} 条提示词</Tag>}
                            {card.images.length > 0 && <Tag color="green" style={{ fontSize: 10, lineHeight: '16px' }}>{card.images.length} 图</Tag>}
                            {card.videos.length > 0 && <Tag color="purple" style={{ fontSize: 10, lineHeight: '16px' }}>{card.videos.length} 视频</Tag>}
                            {card.metadata?.type && <Tag style={{ fontSize: 10, lineHeight: '16px' }}>{card.metadata.type}</Tag>}
                          </div>
                        </div>
                      ))}
                      {sc.length === 0 && !isGenerating && (
                        <div style={{ padding: '20px 0', textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {stage.auto ? '点击 ⚡ 生成' : '暂无内容'}
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

      {/* New project dialog */}
      <Modal title="新建制作项目" open={newProjOpen} onCancel={() => setNewProjOpen(false)} onOk={handleCreateProject} okText="创建" width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>项目名称</Text>
            <Input value={newProjForm.name} onChange={e => setNewProjForm(p => ({ ...p, name: e.target.value }))}
              placeholder="例：九陆纪元 S1E01" style={{ marginTop: 4 }} />
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
            <Text type="secondary" style={{ fontSize: 12 }}>原始内容（粘贴你的想法、小说片段或剧本）</Text>
            <TextArea value={newProjForm.sourceContent} onChange={e => setNewProjForm(p => ({ ...p, sourceContent: e.target.value }))}
              placeholder="在这里粘贴你的创意、小说章节、或剧本大纲..." rows={8} style={{ marginTop: 4 }} />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>AI 员工（用于后续生成）</Text>
            <Select value={newProjForm.employeeKey} onChange={v => setNewProjForm(p => ({ ...p, employeeKey: v }))}
              style={{ width: '100%', marginTop: 4 }} allowClear placeholder="选择一个数字员工"
              options={employees.map(e => ({ value: e.employeeKey, label: e.name }))} />
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

      {/* Card detail drawer */}
      <Drawer title={activeCard?.title || '卡片详情'} open={cardDrawerOpen}
        onClose={() => setCardDrawerOpen(false)} width={680}
        extra={
          <Space>
            {activeCard?.episode != null && <Tag color="blue">EP{String(activeCard.episode).padStart(2, '0')}</Tag>}
            {activeCard?.episode == null && activeCard && <Tag color="purple">全局资产</Tag>}
            <Popconfirm title="删除此卡片？" onConfirm={() => activeCard && handleDeleteCard(activeCard.card_id)}>
              <Button danger size="small" icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          </Space>
        }>
        {activeCard && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stage & shot */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Tag color={STAGE_COLORS[activeCard.stage]} style={{ fontSize: 12 }}>
                {stages.find(s => s.key === activeCard.stage)?.name || activeCard.stage}
              </Tag>
              {activeCard.shot_number > 0 && <Tag style={{ fontSize: 11 }}>镜头 {activeCard.shot_number}</Tag>}
              {activeCard.metadata?.type && <Tag style={{ fontSize: 11 }}>{activeCard.metadata.type}</Tag>}
              {activeCard.metadata?.r_id && <Tag color="geekblue" style={{ fontSize: 11 }}>{activeCard.metadata.r_id}</Tag>}
              {activeCard.status === 'pending' && <Tag color="warning" style={{ fontSize: 11 }}>待制作</Tag>}
            </div>

            {/* Images */}
            {activeCard.images.length > 0 && (
              <div>
                <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                  图片 <Badge count={activeCard.images.length} style={{ backgroundColor: '#10b981', marginLeft: 6 }} size="small" />
                </Text>
                <Image.PreviewGroup>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {activeCard.images.map((url, i) => (
                      <Image key={i} src={url} alt=""
                        width={activeCard.images.length === 1 ? 300 : 150}
                        style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, objectFit: 'cover' }}
                        fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23f0f0f0' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3E加载失败%3C/text%3E%3C/svg%3E"
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}

            {/* Content */}
            {activeCard.content && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text strong style={{ fontSize: 13 }}>内容</Text>
                  <CopyBtn text={activeCard.content} />
                </div>
                <div style={{ background: '#f8f9fc', borderRadius: 10, padding: 16, border: `1px solid ${COLORS.border}` }}
                  className="wb-markdown">
                  <ReactMarkdown>{activeCard.content}</ReactMarkdown>
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
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <CopyBtn text={p} />
                    </div>
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
