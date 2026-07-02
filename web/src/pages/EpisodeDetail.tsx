import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb, Button, Card, Col, Collapse, Drawer, Empty, Image, Row,
  Space, Spin, Tag, Tooltip, Typography, message, Tabs, Badge,
} from 'antd';
import {
  ArrowLeftOutlined, CopyOutlined, CheckOutlined, HomeOutlined,
  PlayCircleOutlined, PictureOutlined, VideoCameraOutlined,
  FileTextOutlined, EditOutlined, EyeOutlined, BarsOutlined,
  CheckCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { COLORS } from '../theme';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const { Text, Title, Paragraph } = Typography;

interface CardItem {
  card_id: string; project_id: string; stage: string; title: string;
  content: string; episode: number | null; shot_number: number; prompts: string[];
  images: string[]; videos: string[]; metadata: Record<string, any>;
  status: string; assignee: string; created_at: string; updated_at: string;
}

interface ShotGroup {
  shotNumber: number;
  cards: CardItem[];
  title: string;
  hasImages: boolean;
  hasVideos: boolean;
  hasPrompts: boolean;
  stagesPresent: string[];
  allDone: boolean;
}

const STAGE_ORDER = ['script', 'storyboard', 'img_prompt', 'vid_prompt', 'img_gen', 'vid_gen', 'final'];
const STAGE_LABELS: Record<string, string> = {
  idea: '创意', script: '剧本', setting: '设定', design: '设计',
  storyboard: '分镜', img_prompt: '图片提示词', vid_prompt: '视频提示词',
  img_gen: '生成图片', vid_gen: '生成视频', final: '成片',
};
const STAGE_ICONS: Record<string, React.ReactNode> = {
  script: <FileTextOutlined />, storyboard: <EditOutlined />,
  img_prompt: <PictureOutlined />, vid_prompt: <VideoCameraOutlined />,
  img_gen: <PictureOutlined />, vid_gen: <VideoCameraOutlined />,
  final: <CheckCircleOutlined />,
};
const STAGE_COLORS: Record<string, string> = {
  script: '#6366f1', storyboard: '#8b5cf6', img_prompt: '#10b981',
  vid_prompt: '#10b981', img_gen: '#f59e0b', vid_gen: '#f59e0b', final: '#ef4444',
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip title={copied ? '已复制' : '复制'}>
      <Button type="text" size="small"
        icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
        onClick={e => {
          e.stopPropagation();
          navigator.clipboard.writeText(text).then(() => {
            setCopied(true); setTimeout(() => setCopied(false), 1500);
          });
        }}
        style={{ fontSize: 12, width: 26, height: 26, color: COLORS.slate }} />
    </Tooltip>
  );
}

function StagePill({ stage, done }: { stage: string; done: boolean }) {
  return (
    <Tag
      icon={STAGE_ICONS[stage]}
      color={done ? 'success' : undefined}
      style={{ fontSize: 11, margin: 0, borderRadius: 4 }}
    >
      {STAGE_LABELS[stage] || stage}
    </Tag>
  );
}

export default function EpisodeDetail() {
  const navigate = useNavigate();
  const { pid, ep } = useParams<{ pid: string; ep: string }>();
  const epNum = parseInt(ep || '1');

  const [allCards, setAllCards] = useState<CardItem[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerCard, setDrawerCard] = useState<CardItem | null>(null);

  const loadData = useCallback(async () => {
    if (!pid) return;
    setLoading(true);
    try {
      const data = await api.getProject(pid);
      setProjectName(data.name || pid);
      setAllCards(data.cards || []);
    } catch (e: any) { message.error(e.message); }
    finally { setLoading(false); }
  }, [pid]);

  useEffect(() => { loadData(); }, [loadData]);

  const epCards = useMemo(() => allCards.filter(c => c.episode === epNum), [allCards, epNum]);

  const epTitle = useMemo(() => {
    const brief = epCards.find(c => c.stage === 'idea');
    if (brief) {
      const t = brief.title.replace(/^导演Brief\s*/i, '').replace(/^EP\d+\s*/, '').trim();
      if (t) return t;
    }
    return `第${epNum}集`;
  }, [epCards, epNum]);

  const overviewCards = useMemo(() =>
    epCards.filter(c => c.shot_number === 0), [epCards]);

  const shotGroups: ShotGroup[] = useMemo(() => {
    const shotMap = new Map<number, CardItem[]>();
    for (const c of epCards) {
      if (c.shot_number <= 0) continue;
      if (!shotMap.has(c.shot_number)) shotMap.set(c.shot_number, []);
      shotMap.get(c.shot_number)!.push(c);
    }

    return Array.from(shotMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([num, cards]) => {
        const scriptCard = cards.find(c => c.stage === 'script');
        const title = scriptCard?.title || `Shot ${num}`;
        return {
          shotNumber: num,
          cards,
          title,
          hasImages: cards.some(c => c.images.length > 0),
          hasVideos: cards.some(c => c.videos.length > 0),
          hasPrompts: cards.some(c => c.prompts.length > 0),
          stagesPresent: STAGE_ORDER.filter(s => cards.some(c => c.stage === s)),
          allDone: cards.every(c => c.status === 'done'),
        };
      });
  }, [epCards]);

  const totalEps = useMemo(() => {
    const eps = new Set<number>();
    allCards.forEach(c => { if (c.episode != null) eps.add(c.episode); });
    return Array.from(eps).sort((a, b) => a - b);
  }, [allCards]);

  if (loading && allCards.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 120 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: '20px 28px', maxWidth: 1400 }}>
      {/* ── 顶栏 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Breadcrumb items={[
            { title: <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/production/${pid}`)}><HomeOutlined /> {projectName}</span> },
            { title: `EP${String(epNum).padStart(2, '0')} ${epTitle}` },
          ]} />
          <Title level={4} style={{ margin: '8px 0 0' }}>
            EP{String(epNum).padStart(2, '0')}《{epTitle}》
          </Title>
        </div>
        <Space>
          <Button icon={<ArrowLeftOutlined />}
            disabled={!totalEps.length || epNum <= totalEps[0]}
            onClick={() => navigate(`/production/${pid}/ep/${epNum - 1}`)}>
            上一集
          </Button>
          <Button
            disabled={!totalEps.length || epNum >= totalEps[totalEps.length - 1]}
            onClick={() => navigate(`/production/${pid}/ep/${epNum + 1}`)}>
            下一集 <span style={{ marginLeft: 4 }}>→</span>
          </Button>
        </Space>
      </div>

      {/* ── 集概览卡 ── */}
      {overviewCards.length > 0 && (
        <Card size="small" style={{ marginBottom: 20, borderRadius: 12 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
            <div><Text type="secondary">镜头数</Text> <Text strong>{shotGroups.length}</Text></div>
            <div><Text type="secondary">卡片数</Text> <Text strong>{epCards.length}</Text></div>
            <div>
              <Text type="secondary">阶段覆盖</Text>{' '}
              {STAGE_ORDER.filter(s => epCards.some(c => c.stage === s)).map(s => (
                <Tag key={s} style={{ fontSize: 11, margin: '0 2px' }} color={STAGE_COLORS[s]}>
                  {STAGE_LABELS[s]}
                </Tag>
              ))}
            </div>
          </div>
          {overviewCards.map(c => (
            <div key={c.card_id} style={{ marginTop: 8, padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>[{STAGE_LABELS[c.stage] || c.stage}] </Text>
              <Text style={{ fontSize: 13 }}>{c.title}</Text>
            </div>
          ))}
        </Card>
      )}

      {/* ── 镜头列表 ── */}
      {shotGroups.length === 0 ? (
        <Empty description="该集暂无镜头数据" />
      ) : (
        <Row gutter={[12, 12]}>
          {shotGroups.map(sg => (
            <Col key={sg.shotNumber} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                size="small"
                style={{
                  borderRadius: 10, height: '100%',
                  borderLeft: `3px solid ${sg.allDone ? '#52c41a' : COLORS.iris}`,
                }}
                styles={{ body: { padding: '10px 12px' } }}
                onClick={() => {
                  const scriptCard = sg.cards.find(c => c.stage === 'script') || sg.cards[0];
                  setDrawerCard(scriptCard);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 13 }}>
                    S{String(sg.shotNumber).padStart(2, '0')}
                  </Text>
                  {sg.allDone ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} />
                  ) : (
                    <ClockCircleOutlined style={{ color: '#faad14', fontSize: 14 }} />
                  )}
                </div>
                <Text style={{ fontSize: 12, color: COLORS.slateDark, display: 'block', marginTop: 4 }} ellipsis>
                  {sg.title.replace(/^Shot\d+\s*/, '')}
                </Text>

                {/* 缩略图 */}
                {sg.hasImages && (() => {
                  const imgCard = sg.cards.find(c => c.images.length > 0);
                  return imgCard ? (
                    <div style={{
                      marginTop: 8, height: 60, borderRadius: 6, overflow: 'hidden',
                      background: '#f5f5f5',
                    }}>
                      <img src={imgCard.images[0]} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  ) : null;
                })()}

                {/* 阶段指示 */}
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 8 }}>
                  {sg.stagesPresent.map(s => {
                    const card = sg.cards.find(c => c.stage === s);
                    return <StagePill key={s} stage={s} done={card?.status === 'done'} />;
                  })}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── 镜头详情 Drawer ── */}
      <Drawer
        open={!!drawerCard}
        onClose={() => setDrawerCard(null)}
        width={680}
        title={drawerCard ? `S${String(drawerCard.shot_number).padStart(2, '0')} 资源详情` : ''}
      >
        {drawerCard && (() => {
          const shotNum = drawerCard.shot_number;
          const shotCards = epCards.filter(c => c.shot_number === shotNum);

          const tabItems = STAGE_ORDER
            .filter(s => shotCards.some(c => c.stage === s))
            .map(s => {
              const stageCards = shotCards.filter(c => c.stage === s);
              return {
                key: s,
                label: (
                  <span>
                    {STAGE_ICONS[s]} {STAGE_LABELS[s] || s}
                    <Badge count={stageCards.length} style={{
                      backgroundColor: stageCards.every(c => c.status === 'done') ? '#52c41a' : COLORS.iris,
                      marginLeft: 6, fontSize: 10,
                    }} />
                  </span>
                ),
                children: (
                  <div>
                    {stageCards.map(card => (
                      <div key={card.card_id} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <Text strong>{card.title}</Text>
                          <Tag color={card.status === 'done' ? 'success' : 'warning'}>
                            {card.status === 'done' ? '已完成' : '待制作'}
                          </Tag>
                        </div>

                        {/* 内容 */}
                        {card.content && (
                          <div style={{
                            background: '#fafbfc', borderRadius: 8, padding: '10px 14px',
                            marginBottom: 10, fontSize: 13, lineHeight: 1.8,
                            maxHeight: 300, overflow: 'auto',
                          }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {card.content}
                            </ReactMarkdown>
                          </div>
                        )}

                        {/* 提示词 */}
                        {card.prompts.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                              提示词
                            </Text>
                            {card.prompts.map((p, i) => (
                              <div key={i} style={{
                                background: '#1e293b', color: '#e2e8f0', borderRadius: 8,
                                padding: '10px 14px', fontSize: 12, lineHeight: 1.7,
                                whiteSpace: 'pre-wrap', marginBottom: 6, position: 'relative',
                              }}>
                                {p}
                                <div style={{ position: 'absolute', top: 6, right: 6 }}>
                                  <CopyBtn text={p} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 图片 */}
                        {card.images.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                              图片 ({card.images.length})
                            </Text>
                            <Image.PreviewGroup>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {card.images.map((url, i) => (
                                  <Image key={i} src={url} width={120} height={120}
                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjYwIiB5PSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiNjY2MiIGZvbnQtc2l6ZT0iMTIiPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4=" />
                                ))}
                              </div>
                            </Image.PreviewGroup>
                          </div>
                        )}

                        {/* 视频 */}
                        {card.videos.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                              视频 ({card.videos.length})
                            </Text>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {card.videos.map((url, i) => (
                                <video key={i} src={url} controls
                                  style={{ maxWidth: 280, borderRadius: 8, background: '#000' }} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ),
              };
            });

          return <Tabs items={tabItems} defaultActiveKey={tabItems[0]?.key} />;
        })()}
      </Drawer>
    </div>
  );
}
