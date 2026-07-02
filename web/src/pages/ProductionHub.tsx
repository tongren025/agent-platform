import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb, Button, Card, Col, Empty, Progress, Row, Select,
  Space, Spin, Tag, Tooltip, Typography, Badge, Segmented, message,
} from 'antd';
import {
  AppstoreOutlined, BarsOutlined, PlayCircleOutlined, PictureOutlined,
  VideoCameraOutlined, FileTextOutlined, UserOutlined, SettingOutlined,
  RightOutlined, HomeOutlined, StarOutlined, SkinOutlined,
  EnvironmentOutlined, EditOutlined, BulbOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { COLORS } from '../theme';

const { Text, Title } = Typography;

/* ── 类型 ── */
interface StageInfo { key: string; name: string; order: number; auto: boolean }
interface CardItem {
  card_id: string; project_id: string; stage: string; title: string;
  content: string; episode: number | null; shot_number: number; prompts: string[];
  images: string[]; videos: string[]; metadata: Record<string, any>;
  status: string; assignee: string; created_at: string; updated_at: string;
}
interface Project {
  project_id: string; name: string; description: string;
  source_type: string; source_content: string;
  employee_key: string; team_code: string;
  cards?: CardItem[]; stages?: StageInfo[]; stats?: any;
  created_at: string; updated_at: string; cardCount?: number;
}

/* ── 集信息 ── */
interface EpisodeInfo {
  episode: number;
  title: string;
  shotCount: number;
  stageProgress: Record<string, { total: number; done: number }>;
  thumbnail: string | null;
  totalCards: number;
  doneCards: number;
}

/* ── 全局资产分组 ── */
interface AssetGroup {
  label: string;
  icon: React.ReactNode;
  cards: CardItem[];
}

const STAGE_LABELS: Record<string, string> = {
  idea: '创意', script: '剧本', setting: '设定', design: '设计',
  storyboard: '分镜', img_prompt: '图片词', vid_prompt: '视频词',
  img_gen: '生图', vid_gen: '生视频', final: '成片',
};

const STAGE_COLORS: Record<string, string> = {
  idea: '#6366f1', script: '#6366f1', setting: '#8b5cf6', design: '#8b5cf6',
  storyboard: '#6366f1', img_prompt: '#10b981', vid_prompt: '#10b981',
  img_gen: '#f59e0b', vid_gen: '#f59e0b', final: '#ef4444',
};

function extractEpisodeTitle(cards: CardItem[], ep: number): string {
  const brief = cards.find(c => c.episode === ep && c.stage === 'idea');
  if (brief) {
    const t = brief.title.replace(/^导演Brief\s*/i, '').replace(/^EP\d+\s*/, '').trim();
    if (t) return t;
  }
  const script = cards.find(c => c.episode === ep && c.stage === 'script' && c.shot_number === 0);
  if (script) {
    const t = script.title.replace(/^EP\d+\s*/, '').trim();
    if (t) return t;
  }
  return '';
}

function groupGlobalAssets(globals: CardItem[]): AssetGroup[] {
  const story: CardItem[] = [];
  const characters: CardItem[] = [];
  const scenes: CardItem[] = [];
  const design: CardItem[] = [];
  const other: CardItem[] = [];

  for (const c of globals) {
    const id = c.card_id.toLowerCase();
    const meta = c.metadata || {};
    if (meta.type === 'character' || id.includes('char') || id.includes('-r1') || id.includes('-r2') || id.includes('-r3') || id.includes('set-r')) {
      characters.push(c);
    } else if (id.includes('scene') || id.includes('sc0') || id.includes('cloud') || id.includes('lands')) {
      scenes.push(c);
    } else if (id.includes('story') || id.includes('brief') || id.includes('emotion') || id.includes('sfx') || id.includes('delivery') || id.includes('director')) {
      story.push(c);
    } else if (c.stage === 'design' || id.includes('des-') || id.includes('art-bible') || id.includes('style')) {
      design.push(c);
    } else {
      other.push(c);
    }
  }

  const groups: AssetGroup[] = [];
  if (story.length) groups.push({ label: '故事 & 规范', icon: <BulbOutlined />, cards: story });
  if (characters.length) groups.push({ label: '角色', icon: <UserOutlined />, cards: characters });
  if (scenes.length) groups.push({ label: '场景', icon: <EnvironmentOutlined />, cards: scenes });
  if (design.length) groups.push({ label: '视觉设计', icon: <SkinOutlined />, cards: design });
  if (other.length) groups.push({ label: '其他', icon: <FileTextOutlined />, cards: other });
  return groups;
}

/* ── 迷你进度条 ── */
function StageBar({ stages }: { stages: Record<string, { total: number; done: number }> }) {
  const order = ['script', 'storyboard', 'img_prompt', 'vid_prompt', 'img_gen', 'vid_gen'];
  return (
    <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
      {order.map(s => {
        const info = stages[s];
        if (!info || info.total === 0) return (
          <Tooltip key={s} title={`${STAGE_LABELS[s] || s}: 无`}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#f0f0f0' }} />
          </Tooltip>
        );
        const pct = Math.round((info.done / info.total) * 100);
        return (
          <Tooltip key={s} title={`${STAGE_LABELS[s] || s}: ${info.done}/${info.total}`}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#f0f0f0', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%', borderRadius: 2,
                background: pct === 100 ? '#52c41a' : STAGE_COLORS[s] || '#1890ff',
                transition: 'width .3s',
              }} />
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}

/* ── 主组件 ── */
export default function ProductionHub() {
  const navigate = useNavigate();
  const { pid } = useParams<{ pid: string }>();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedPid, setSelectedPid] = useState(pid || '');
  const [project, setProject] = useState<Project | null>(null);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    try { setProjects(await api.listProjects()); } catch { /* ignore */ }
  }, []);

  const loadProject = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getProject(id);
      setProject(data);
      setCards(data.cards || []);
    } catch (e: any) { message.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => {
    if (!selectedPid && projects.length > 0) {
      const first = projects[0].project_id;
      setSelectedPid(first);
      navigate(`/production/${first}`, { replace: true });
    }
  }, [projects, selectedPid, navigate]);
  useEffect(() => {
    if (pid && pid !== selectedPid) setSelectedPid(pid);
  }, [pid]);
  useEffect(() => { if (selectedPid) loadProject(selectedPid); }, [selectedPid, loadProject]);

  /* ── 数据计算 ── */
  const globalCards = useMemo(() => cards.filter(c => c.episode == null), [cards]);
  const assetGroups = useMemo(() => groupGlobalAssets(globalCards), [globalCards]);

  const episodes: EpisodeInfo[] = useMemo(() => {
    const epNums = new Set<number>();
    cards.forEach(c => { if (c.episode != null) epNums.add(c.episode); });

    return Array.from(epNums).sort((a, b) => a - b).map(ep => {
      const epCards = cards.filter(c => c.episode === ep);
      const shots = new Set(epCards.filter(c => c.shot_number > 0).map(c => c.shot_number));

      const stageProgress: Record<string, { total: number; done: number }> = {};
      for (const c of epCards) {
        if (!stageProgress[c.stage]) stageProgress[c.stage] = { total: 0, done: 0 };
        stageProgress[c.stage].total++;
        if (c.status === 'done') stageProgress[c.stage].done++;
      }

      const firstImage = epCards.find(c => c.images.length > 0);

      return {
        episode: ep,
        title: extractEpisodeTitle(cards, ep),
        shotCount: shots.size,
        stageProgress,
        thumbnail: firstImage?.images[0] || null,
        totalCards: epCards.length,
        doneCards: epCards.filter(c => c.status === 'done').length,
      };
    });
  }, [cards]);

  const overallProgress = useMemo(() => {
    const epCards = cards.filter(c => c.episode != null);
    if (epCards.length === 0) return 0;
    return Math.round((epCards.filter(c => c.status === 'done').length / epCards.length) * 100);
  }, [cards]);

  if (loading && !project) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 120 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: '20px 28px', maxWidth: 1400 }}>
      {/* ── 顶栏 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Breadcrumb items={[
            { title: <><HomeOutlined /> 制作</> },
            ...(project ? [{ title: project.name }] : []),
          ]} />
          {project && (
            <Title level={4} style={{ margin: '8px 0 0' }}>{project.name}</Title>
          )}
          {project?.description && (
            <Text type="secondary" style={{ fontSize: 13 }}>{project.description}</Text>
          )}
        </div>
        <Space>
          {projects.length > 1 && (
            <Select
              value={selectedPid}
              onChange={v => { setSelectedPid(v); navigate(`/production/${v}`); }}
              style={{ width: 200 }}
              options={projects.map(p => ({ value: p.project_id, label: p.name }))}
            />
          )}
          <Button icon={<BarsOutlined />}
            onClick={() => navigate(`/production/${selectedPid}/pipeline`)}>
            管线视图
          </Button>
        </Space>
      </div>

      {!project ? (
        <Empty description="暂无项目" />
      ) : (
        <>
          {/* ── 总览条 ── */}
          <Card size="small" style={{ marginBottom: 20, borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>总进度</Text>
                <Progress percent={overallProgress} size="small" style={{ width: 160, margin: 0 }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>剧集</Text>
                <div><Text strong>{episodes.length}</Text> 集</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>卡片</Text>
                <div><Text strong>{cards.length}</Text> 张</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>全局资产</Text>
                <div><Text strong>{globalCards.length}</Text> 项</div>
              </div>
            </div>
          </Card>

          {/* ── 全局资产 ── */}
          {assetGroups.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <Title level={5} style={{ marginBottom: 12 }}>
                <StarOutlined style={{ marginRight: 6, color: COLORS.iris }} />
                项目资产
              </Title>
              <Row gutter={[12, 12]}>
                {assetGroups.map(g => (
                  <Col key={g.label} xs={24} sm={12} lg={8} xl={6}>
                    <Card size="small" hoverable
                      style={{ borderRadius: 10, height: '100%' }}
                      styles={{ body: { padding: '12px 14px' } }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ color: COLORS.iris }}>{g.icon}</span>
                        <Text strong style={{ fontSize: 13 }}>{g.label}</Text>
                        <Badge count={g.cards.length} style={{ backgroundColor: COLORS.iris }} />
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {g.cards.slice(0, 6).map(c => (
                          <Tag key={c.card_id} style={{ fontSize: 11, margin: 0 }}>
                            {c.title.length > 12 ? c.title.slice(0, 12) + '…' : c.title}
                          </Tag>
                        ))}
                        {g.cards.length > 6 && (
                          <Tag style={{ fontSize: 11, margin: 0, color: COLORS.slate }}>
                            +{g.cards.length - 6}
                          </Tag>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* ── 剧集网格 ── */}
          <Title level={5} style={{ marginBottom: 12 }}>
            <PlayCircleOutlined style={{ marginRight: 6, color: COLORS.iris }} />
            剧集
          </Title>
          {episodes.length === 0 ? (
            <Empty description="暂无剧集数据" />
          ) : (
            <Row gutter={[14, 14]}>
              {episodes.map(ep => {
                const pct = ep.totalCards > 0
                  ? Math.round((ep.doneCards / ep.totalCards) * 100) : 0;
                return (
                  <Col key={ep.episode} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/production/${selectedPid}/ep/${ep.episode}`)}
                      style={{ borderRadius: 12, overflow: 'hidden', height: '100%' }}
                      styles={{ body: { padding: 0 } }}
                    >
                      {/* 缩略图 */}
                      <div style={{
                        height: 100, background: '#f0f0f5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', position: 'relative',
                      }}>
                        {ep.thumbnail ? (
                          <img src={ep.thumbnail} alt="" style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                          }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <PlayCircleOutlined style={{ fontSize: 32, color: '#d0d0d0' }} />
                        )}
                        <div style={{
                          position: 'absolute', top: 8, left: 8,
                          background: 'rgba(0,0,0,0.6)', color: '#fff',
                          borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 600,
                        }}>
                          EP{String(ep.episode).padStart(2, '0')}
                        </div>
                        {pct === 100 && (
                          <div style={{
                            position: 'absolute', top: 8, right: 8,
                          }}>
                            <CheckCircleOutlined style={{ fontSize: 18, color: '#52c41a', background: '#fff', borderRadius: '50%' }} />
                          </div>
                        )}
                      </div>
                      {/* 信息 */}
                      <div style={{ padding: '10px 14px 14px' }}>
                        <Text strong style={{ fontSize: 14, display: 'block' }}>
                          {ep.title || `第${ep.episode}集`}
                        </Text>
                        <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12, color: COLORS.slate }}>
                          <span>{ep.shotCount} 镜头</span>
                          <span>{ep.totalCards} 卡片</span>
                          <span>{pct}%</span>
                        </div>
                        <StageBar stages={ep.stageProgress} />
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </>
      )}
    </div>
  );
}
