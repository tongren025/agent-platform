// 单集详情页：该集全部 G 生成单元卡片，按阶段 Tab 查看剧本/分镜/提示词/图/视频。
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import { Breadcrumb, Button, Card, Col, Drawer, Empty, Image, Row, Space, Spin, Tag, Tooltip, Typography, Tabs, Badge } from 'antd';
import { message } from '../ui';
import {
  ArrowLeftOutlined, CopyOutlined, CheckOutlined, HomeOutlined,
  PictureOutlined, VideoCameraOutlined,
  FileTextOutlined, EditOutlined,
  CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { thumbUrl, onImageError } from '../media';
import { COLORS } from '../theme';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const { Text, Title } = Typography;

interface CardItem {
  card_id: string; project_id: string; stage: string; title: string;
  content: string; episode: number | null; shot_number: number; prompts: string[]; negative_prompts?: string[];
  images: string[]; videos: string[]; metadata: Record<string, any>;
  status: string; assignee: string; created_at: string; updated_at: string;
}

interface UnitGroup {
  unitNumber: number;
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

function unitLabel(unitNumber: number): string {
  return `G${unitNumber}`;
}

function cleanUnitTitle(title: string): string {
  return title.replace(/^G\s*0*\d+\s*/i, '').trim() || title;
}

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
  const { isMobile } = useResponsive();
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

  const unitGroups: UnitGroup[] = useMemo(() => {
    const unitMap = new Map<number, CardItem[]>();
    for (const c of epCards) {
      if (c.shot_number <= 0) continue;
      if (!unitMap.has(c.shot_number)) unitMap.set(c.shot_number, []);
      unitMap.get(c.shot_number)!.push(c);
    }

    return Array.from(unitMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([num, cards]) => {
        const scriptCard = cards.find(c => c.stage === 'script');
        const title = scriptCard?.title || `${unitLabel(num)} 生成单元`;
        return {
          unitNumber: num,
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

  // 导出本集提示词包：整集级头部卡 + 每个 G 单元的首帧/视频提示词，按生成顺序拼成 markdown。
  // 服务真实工作流——从平台成批拿提示词去小云雀/即梦生成，不用逐卡手动复制。
  const exportPrompts = () => {
    const PROMPT_ORDER: [string, string][] = [['img_prompt', '首帧/末帧提示词'], ['vid_prompt', '视频提示词']];
    const lines: string[] = [`# EP${String(epNum).padStart(2, '0')}《${epTitle}》提示词包`, ''];
    // 整集级卡（全局头部/视觉母题等）放最前，生成时通常要拼在每条前面
    for (const [stage, label] of PROMPT_ORDER) {
      for (const c of overviewCards.filter(x => x.stage === stage)) {
        lines.push(`## [整集] ${label} · ${c.title}`, '', c.content, '');
      }
    }
    for (const g of unitGroups) {
      for (const [stage, label] of PROMPT_ORDER) {
        for (const c of g.cards.filter(x => x.stage === stage)) {
          lines.push(`## G${g.unitNumber} · ${label} · ${c.title}`, '', c.content, '');
          for (const p of c.prompts) lines.push(p, '');
          if ((c.negative_prompts?.length ?? 0) > 0) {
            lines.push('### 供应商负向提示词（独立使用，不拼入正向提示词）', '');
            for (const p of c.negative_prompts!) lines.push(p, '');
          }
        }
      }
    }
    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `EP${String(epNum).padStart(2, '0')}_提示词包.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    navigator.clipboard?.writeText(text).catch(() => { /* 剪贴板不可用时仅下载 */ });
    message.success('提示词包已下载并复制到剪贴板');
  };

  if (loading && allCards.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 120 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: isMobile ? '12px 10px' : '20px 28px', maxWidth: 1400 }}>
      {/* ── 顶栏 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <Breadcrumb items={[
            { title: <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/production/${pid}`)}><HomeOutlined /> {projectName}</span> },
            { title: `EP${String(epNum).padStart(2, '0')} ${epTitle}` },
          ]} />
          <Title level={4} style={{ margin: '8px 0 0' }}>
            EP{String(epNum).padStart(2, '0')}《{epTitle}》
          </Title>
        </div>
        <Space wrap>
          <Tooltip title="整集级头部 + 每个 G 单元的首帧/视频提示词，按顺序拼成 markdown，下载并复制">
            <Button icon={<DownloadOutlined />} onClick={exportPrompts}>导出提示词</Button>
          </Tooltip>
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
            <div><Text type="secondary">生成单元</Text> <Text strong>{unitGroups.length}</Text></div>
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

      {/* ── 生成单元列表 ── */}
      {unitGroups.length === 0 ? (
        <Empty description="该集暂无生成单元数据" />
      ) : (
        <Row gutter={[12, 12]}>
          {unitGroups.map(sg => (
            <Col key={sg.unitNumber} xs={24} sm={12} md={8} lg={6}>
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
                    {unitLabel(sg.unitNumber)}
                  </Text>
                  {sg.allDone ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} />
                  ) : (
                    <ClockCircleOutlined style={{ color: '#faad14', fontSize: 14 }} />
                  )}
                </div>
                <Text style={{ fontSize: 12, color: COLORS.slateDark, display: 'block', marginTop: 4 }} ellipsis>
                  {cleanUnitTitle(sg.title)}
                </Text>

                {/* 缩略图 */}
                {sg.hasImages && (() => {
                  const imgCard = sg.cards.find(c => c.images.length > 0);
                  return imgCard ? (
                    <div style={{
                      marginTop: 8, height: 60, borderRadius: 6, overflow: 'hidden',
                      background: '#f5f5f5',
                    }}>
                      <img src={thumbUrl(imgCard.images[0], 128)} alt="" loading="lazy" decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={onImageError} />
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

      {/* ── 生成单元详情 Drawer ── */}
      <Drawer
        open={!!drawerCard}
        onClose={() => setDrawerCard(null)}
        width={isMobile ? '100%' : 680}
        title={drawerCard ? `${unitLabel(drawerCard.shot_number)} 生成单元资源` : ''}
      >
        {drawerCard && (() => {
          const unitNum = drawerCard.shot_number;
          const unitCards = epCards.filter(c => c.shot_number === unitNum);

          const tabItems = STAGE_ORDER
            .filter(s => unitCards.some(c => c.stage === s))
            .map(s => {
              const stageCards = unitCards.filter(c => c.stage === s);
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
                          <Space size={4}>
                            {/* 提示词正文存在 content 字段，必须能一键复制去生成端 */}
                            {card.content && <CopyBtn text={card.content} />}
                            <Tag color={card.status === 'done' ? 'success' : card.status === 'review' ? 'processing' : 'warning'}>
                              {card.status === 'done' ? '已完成' : card.status === 'review' ? '待复核' : '待制作'}
                            </Tag>
                          </Space>
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
                        {(card.negative_prompts?.length ?? 0) > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <Text type="warning" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                              供应商负向提示词（独立字段）
                            </Text>
                            {card.negative_prompts!.map((p, i) => (
                              <div key={i} style={{ background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8, padding: '10px 14px', fontSize: 12, whiteSpace: 'pre-wrap', marginBottom: 6 }}>
                                {p}
                              </div>
                            ))}
                          </div>
                        )}
                        {(card.metadata?.quality_gate?.issues?.length ?? 0) > 0 && (
                          <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                            <Text type="danger" style={{ fontSize: 12 }}>
                              自动质检：{card.metadata.quality_gate.issues.map((issue: { message: string }) => issue.message).join('；')}
                            </Text>
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
                                  <Image key={i} src={thumbUrl(url, 256)} preview={{ src: url }} loading="lazy"
                                    width={120} height={120}
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
                                  style={{ maxWidth: isMobile ? '100%' : 280, borderRadius: 8, background: '#000' }} />
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
