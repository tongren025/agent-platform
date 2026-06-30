import { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Button, Tabs, Tag, Space, message, Drawer, Spin,
  Statistic, Empty, Typography, Tooltip, Progress,
} from 'antd';
import {
  ReloadOutlined, StarFilled, RiseOutlined, FireFilled,
  GithubOutlined, LinkOutlined, ClockCircleOutlined,
  ForkOutlined, RocketOutlined, ExperimentOutlined,
  BulbOutlined, ThunderboltOutlined, ToolOutlined,
  BarChartOutlined, CommentOutlined, FileTextOutlined,
  ReadOutlined, MessageOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { COLORS } from '../theme';

const { Text, Paragraph } = Typography;

interface QueryInfo {
  query: string;
  generatedAt: string;
  topCount: number;
  hasRealGrowth: boolean;
}

interface Repo {
  full_name: string;
  html_url: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  created_at: string;
  pushed_at: string;
  topics: string[];
  stars_per_day: number;
  age_days: number;
  delta?: number;
  prev_stars?: number;
  delta_per_day?: number;
}

interface TrendData {
  query: string;
  generatedAt: string;
  topStarred: Repo[];
  fastestGrowing: Repo[];
  realGrowth: Repo[];
}

interface AnalysisReport {
  summary: string;
  hot_tracks: { name: string; description: string; representative_repos: string[]; heat_score: number }[];
  rising_stars: { repo_name: string; reason: string; growth_metric: string }[];
  tech_shifts: { title: string; description: string }[];
  language_insights: { dominant: string; rising: string; insight: string };
  recommendations: { title: string; content: string }[];
  generatedAt: string;
  model: string;
}

interface CrossSummary {
  queries: { query: string; repoCount: number; topRepo: string; topStars: number; growingCount: number; totalDelta: number; generatedAt: string }[];
  languages: Record<string, number>;
  totalRepos: number;
  totalStars: number;
}

const QUERY_LABELS: Record<string, { label: string; desc: string }> = {
  'agent skill': { label: 'Agent 技能', desc: '智能体技能框架与插件生态' },
  'claude skill': { label: 'Claude 技能', desc: 'Claude 代码助手的技能包' },
  'skill': { label: '通用技能', desc: 'AI 技能工具合集' },
  'topic:mcp': { label: 'MCP 协议', desc: 'Model Context Protocol 生态项目' },
  'AI agent': { label: 'AI 智能体', desc: 'Agent 框架、编排与自动化平台' },
  'LLM': { label: '大语言模型', desc: 'LLM 推理引擎、微调与工具链' },
  'generative-ai': { label: '生成式 AI', desc: '图像/视频/音频生成应用与工具' },
  'AI coding': { label: 'AI 编程', desc: 'AI 辅助编程与代码生成工具' },
};

const LANG_COLORS: Record<string, string> = {
  Python: '#3572A5', TypeScript: '#3178c6', JavaScript: '#f1e05a',
  Rust: '#dea584', Go: '#00ADD8', Shell: '#89e051', Java: '#b07219',
  'C#': '#178600', Ruby: '#701516', Swift: '#F05138', Kotlin: '#A97BFF',
  'C++': '#f34b7d', Jupyter: '#DA5B0B', HTML: '#e34c26', Dart: '#00B4AB',
};

function fmtStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function fmtTime(iso: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function DeltaTag({ delta }: { delta: number }) {
  const color = delta > 0 ? COLORS.mint : delta < 0 ? COLORS.rose : COLORS.slate;
  const sign = delta > 0 ? '+' : '';
  return <span style={{ color, fontWeight: 600 }}>{sign}{fmtStars(delta)}</span>;
}

function SparkLine({ data }: { data: { stars: number }[] }) {
  if (data.length < 2) return <Text type="secondary" style={{ fontSize: 12 }}>数据不足</Text>;
  const stars = data.map(d => d.stars);
  const min = Math.min(...stars);
  const max = Math.max(...stars);
  const range = max - min || 1;
  const w = 200, h = 60, pad = 4;
  const points = stars.map((s, i) => {
    const x = pad + (i / (stars.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((s - min) / range) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={COLORS.iris} strokeWidth={2} strokeLinejoin="round" />
      {stars.map((s, i) => {
        const x = pad + (i / (stars.length - 1)) * (w - 2 * pad);
        const y = h - pad - ((s - min) / range) * (h - 2 * pad);
        return <circle key={i} cx={x} cy={y} r={2.5} fill={COLORS.iris} />;
      })}
    </svg>
  );
}

function LangBar({ languages }: { languages: Record<string, number> }) {
  const entries = Object.entries(languages).slice(0, 10);
  if (!entries.length) return null;
  const total = entries.reduce((s, [, c]) => s + c, 0);
  return (
    <div>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
        {entries.map(([lang, cnt]) => (
          <Tooltip key={lang} title={`${lang}: ${cnt} 个项目 (${(cnt / total * 100).toFixed(0)}%)`}>
            <div style={{
              width: `${cnt / total * 100}%`,
              background: LANG_COLORS[lang] || '#94a3b8',
              minWidth: 3,
            }} />
          </Tooltip>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {entries.map(([lang, cnt]) => (
          <span key={lang} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: LANG_COLORS[lang] || '#94a3b8', display: 'inline-block' }} />
            {lang} <span style={{ color: COLORS.slate }}>{cnt}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SourcePanel({ sourceLabel, color, queries, activeKey, onSelect, loading, data, onMount, columns, rowKey, titleField = 'title' }: {
  sourceLabel: string; color: string;
  queries: { key: string; label: string }[];
  activeKey: string; onSelect: (k: string) => void;
  loading: boolean; data: any; onMount: () => void;
  columns: any[]; rowKey: (r: any) => string;
  titleField?: string;
}) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);

  useEffect(() => { onMount(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setTranslations({}); }, [activeKey]);

  const handleTranslate = async () => {
    if (!data?.items?.length) return;
    setTranslating(true);
    try {
      const titles = data.items.map((it: any) => it[titleField] || '');
      const result: string[] = await api.translateTitles(titles);
      const map: Record<string, string> = {};
      data.items.forEach((it: any, i: number) => { map[it[titleField] || ''] = result[i] || ''; });
      setTranslations(map);
      message.success('翻译完成');
    } catch (e: any) {
      message.error('翻译失败: ' + (e.message || ''));
    } finally { setTranslating(false); }
  };

  const hasTranslations = Object.keys(translations).length > 0;
  const zhCol = {
    title: '中文简介', width: 200,
    render: (_: any, r: any) => {
      const zh = translations[r[titleField] || ''];
      return zh ? <span style={{ fontSize: 13, color: COLORS.slateDark }}>{zh}</span> : <span style={{ color: COLORS.slate }}>—</span>;
    },
  };
  const finalColumns = hasTranslations ? [...columns.slice(0, 2), zhCol, ...columns.slice(2)] : columns;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {queries.map(q => (
          <div
            key={q.key}
            onClick={() => onSelect(q.key)}
            style={{
              padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              fontWeight: activeKey === q.key ? 600 : 400,
              background: activeKey === q.key ? color : '#fff',
              color: activeKey === q.key ? '#fff' : COLORS.slateDark,
              border: `1px solid ${activeKey === q.key ? color : COLORS.border}`,
              transition: 'all 0.15s',
            }}
          >
            {q.label}
          </div>
        ))}
      </div>
      {data?.fetchedAt && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: COLORS.slate }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            数据来自 {sourceLabel} · 缓存于 {fmtTime(data.fetchedAt)} · {data.items?.length || 0} 条
          </div>
          <Button size="small" loading={translating} onClick={handleTranslate} disabled={!data?.items?.length}
            style={{ fontSize: 12 }} icon={<ReadOutlined />}>
            {hasTranslations ? '重新翻译' : '一键翻译'}
          </Button>
        </div>
      )}
      {loading ? (
        <Spin style={{ display: 'block', padding: 60, textAlign: 'center' }} />
      ) : data?.error ? (
        <Empty description={data.error} style={{ padding: 60 }} />
      ) : data?.items?.length ? (
        <Table dataSource={data.items} columns={finalColumns} rowKey={rowKey} pagination={{ pageSize: 15 }} size="small" />
      ) : (
        <Empty description={`暂无 ${sourceLabel} 数据`} style={{ padding: 60 }} />
      )}
    </div>
  );
}

export default function SkillTracker() {
  const [queries, setQueries] = useState<QueryInfo[]>([]);
  const [activeQuery, setActiveQuery] = useState('');
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailRepo, setDetailRepo] = useState<Repo | null>(null);
  const [history, setHistory] = useState<{ takenAt: string; stars: number }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [crossSummary, setCrossSummary] = useState<CrossSummary | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // 多源数据
  const [hnData, setHnData] = useState<any>(null);
  const [hnQuery, setHnQuery] = useState('AI agent');
  const [hnLoading, setHnLoading] = useState(false);
  const [arxivData, setArxivData] = useState<any>(null);
  const [arxivCat, setArxivCat] = useState('cs.AI');
  const [arxivLoading, setArxivLoading] = useState(false);
  const [newsData, setNewsData] = useState<any>(null);
  const [newsQuery, setNewsQuery] = useState('artificial intelligence');
  const [newsLoading, setNewsLoading] = useState(false);
  const [redditData, setRedditData] = useState<any>(null);
  const [redditSub, setRedditSub] = useState('MachineLearning');
  const [redditLoading, setRedditLoading] = useState(false);

  const fetchHn = useCallback(async (q: string) => {
    setHnLoading(true);
    try { const d = await api.getHnList(q); setHnData(d); } catch { /* ok */ }
    finally { setHnLoading(false); }
  }, []);
  const fetchArxiv = useCallback(async (cat: string) => {
    setArxivLoading(true);
    try { const d = await api.getArxivList(cat); setArxivData(d); } catch { /* ok */ }
    finally { setArxivLoading(false); }
  }, []);
  const fetchNews = useCallback(async (q: string) => {
    setNewsLoading(true);
    try { const d = await api.getNewsList(q); setNewsData(d); } catch { /* ok */ }
    finally { setNewsLoading(false); }
  }, []);
  const fetchReddit = useCallback(async (sub: string) => {
    setRedditLoading(true);
    try { const d = await api.getRedditList(sub); setRedditData(d); } catch { /* ok */ }
    finally { setRedditLoading(false); }
  }, []);

  const fetchQueries = useCallback(async () => {
    try {
      const list: QueryInfo[] = await api.listTrendQueries();
      setQueries(list);
      if (list.length > 0 && !activeQuery) setActiveQuery(list[0].query);
    } catch (e: any) {
      message.error('加载 query 列表失败: ' + e.message);
    }
  }, [activeQuery]);

  const fetchTrends = useCallback(async (q: string) => {
    if (!q) return;
    setLoading(true);
    try {
      const data = await api.listTrends(q);
      setTrendData(data);
    } catch { setTrendData(null); }
    finally { setLoading(false); }
  }, []);

  const fetchOverview = useCallback(async () => {
    try {
      const [summary, report] = await Promise.all([
        api.getTrendSummary(),
        api.getAnalysis(),
      ]);
      setCrossSummary(summary);
      if (report) setAnalysis(report);
    } catch { /* ok */ }
  }, []);

  useEffect(() => { fetchQueries(); fetchOverview(); }, [fetchQueries, fetchOverview]);
  useEffect(() => { if (activeQuery) fetchTrends(activeQuery); }, [activeQuery, fetchTrends]);

  const handleRefresh = async () => {
    if (!activeQuery) return;
    setRefreshing(true);
    try {
      const data = await api.refreshTrends(activeQuery);
      setTrendData(data);
      message.success(`已刷新「${QUERY_LABELS[activeQuery]?.label || activeQuery}」`);
      fetchQueries();
      fetchOverview();
    } catch (e: any) {
      message.error('刷新失败: ' + e.message);
    } finally { setRefreshing(false); }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const report = await api.analyzeTrends();
      setAnalysis(report);
      message.success('AI 分析报告生成完成');
    } catch (e: any) {
      message.error('分析失败: ' + e.message);
    } finally { setAnalyzing(false); }
  };

  const openDetail = async (repo: Repo) => {
    setDetailRepo(repo);
    setDrawerOpen(true);
    setHistoryLoading(true);
    try {
      const pts = await api.getRepoHistory(activeQuery, repo.full_name);
      setHistory(pts);
    } catch { setHistory([]); }
    finally { setHistoryLoading(false); }
  };

  // ── Table columns ──
  const baseColumns = [
    {
      title: '#', width: 48,
      render: (_: any, __: any, idx: number) => <span style={{ color: COLORS.slate, fontWeight: 500 }}>{idx + 1}</span>,
    },
    {
      title: '仓库', dataIndex: 'full_name',
      render: (name: string, r: Repo) => (
        <div>
          <a href={r.html_url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: 14 }}>{name}</a>
          {r.language && (
            <Tag style={{ marginLeft: 8, fontSize: 11, borderRadius: 4, color: LANG_COLORS[r.language] || COLORS.slate, borderColor: LANG_COLORS[r.language] || COLORS.border, background: 'transparent' }}>
              {r.language}
            </Tag>
          )}
          <div style={{ color: COLORS.slate, fontSize: 12, marginTop: 2, maxWidth: 400 }}>
            {(r.description || '').slice(0, 100)}{(r.description || '').length > 100 ? '…' : ''}
          </div>
        </div>
      ),
    },
  ];
  const starCol = { title: '⭐ Stars', dataIndex: 'stars', width: 110, sorter: (a: Repo, b: Repo) => a.stars - b.stars, render: (v: number) => <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtStars(v)}</span> };
  const velocityCol = { title: '⭐/天', dataIndex: 'stars_per_day', width: 100, sorter: (a: Repo, b: Repo) => a.stars_per_day - b.stars_per_day, render: (v: number) => <span style={{ fontWeight: 600, color: COLORS.iris }}>{v.toFixed(0)}</span> };
  const deltaCol = {
    title: '近期涨星', dataIndex: 'delta', width: 120, sorter: (a: Repo, b: Repo) => (a.delta ?? 0) - (b.delta ?? 0),
    render: (v: number, r: Repo) => (
      <div>
        <DeltaTag delta={v} />
        {r.delta_per_day !== undefined && <div style={{ fontSize: 11, color: COLORS.slate }}>{r.delta_per_day > 0 ? '+' : ''}{r.delta_per_day.toFixed(1)}/天</div>}
      </div>
    ),
  };
  const actionCol = { title: '', width: 64, render: (_: any, r: Repo) => <Button size="small" type="link" onClick={() => openDetail(r)}>详情</Button> };

  // ── Main tabs ──
  const mainTabItems = [
    // 总览 tab
    {
      key: 'overview',
      label: <span><BarChartOutlined style={{ color: COLORS.iris }} /> 全景总览</span>,
      children: (
        <div>
          {/* 跨查询统计 */}
          {crossSummary && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                <Card size="small" style={{ borderRadius: 12 }}><Statistic title="覆盖领域" value={crossSummary.queries.length} suffix="个" prefix={<GithubOutlined />} /></Card>
                <Card size="small" style={{ borderRadius: 12 }}><Statistic title="追踪项目" value={crossSummary.totalRepos} suffix="个" /></Card>
                <Card size="small" style={{ borderRadius: 12 }}><Statistic title="总计 Stars" value={crossSummary.totalStars} formatter={v => fmtStars(Number(v))} prefix={<StarFilled style={{ color: '#faad14' }} />} /></Card>
                <Card size="small" style={{ borderRadius: 12 }}><Statistic title="编程语言" value={Object.keys(crossSummary.languages).length} suffix="种" /></Card>
              </div>

              {/* 语言分布 */}
              <Card size="small" title="编程语言分布" style={{ borderRadius: 12, marginBottom: 20 }}>
                <LangBar languages={crossSummary.languages} />
              </Card>

              {/* 各领域概况表 */}
              <Card size="small" title="各领域概况" style={{ borderRadius: 12 }}>
                <Table
                  dataSource={crossSummary.queries}
                  rowKey="query"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: '领域', dataIndex: 'query', width: 140,
                      render: (q: string) => <Tag color={COLORS.iris}>{QUERY_LABELS[q]?.label || q}</Tag>,
                    },
                    { title: '收录', dataIndex: 'repoCount', width: 70, render: (v: number) => `${v} 个` },
                    {
                      title: '头部项目', dataIndex: 'topRepo', render: (v: string, r: any) => (
                        <span>{v} <span style={{ color: COLORS.slate }}>({fmtStars(r.topStars)}⭐)</span></span>
                      ),
                    },
                    {
                      title: '真实涨星', dataIndex: 'totalDelta', width: 100,
                      render: (v: number) => v ? <DeltaTag delta={v} /> : <span style={{ color: COLORS.slate }}>-</span>,
                    },
                    {
                      title: '更新', dataIndex: 'generatedAt', width: 100,
                      render: (v: string) => <span style={{ fontSize: 12, color: COLORS.slate }}>{v?.slice(0, 10)}</span>,
                    },
                  ]}
                />
              </Card>
            </>
          )}
          {!crossSummary && <Empty description="暂无跨查询汇总数据" style={{ padding: 60 }} />}
        </div>
      ),
    },
    // 榜单 tab
    {
      key: 'rankings',
      label: <span><StarFilled style={{ color: '#faad14' }} /> 项目榜单</span>,
      children: (
        <div>
          {/* Query 选择 */}
          {queries.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {queries.map(q => {
                const info = QUERY_LABELS[q.query];
                return (
                  <Tooltip key={q.query} title={info ? `搜索词：${q.query} — ${info.desc}` : q.query}>
                    <div
                      onClick={() => setActiveQuery(q.query)}
                      style={{
                        padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                        fontWeight: activeQuery === q.query ? 600 : 400,
                        background: activeQuery === q.query ? COLORS.iris : '#fff',
                        color: activeQuery === q.query ? '#fff' : COLORS.slateDark,
                        border: `1px solid ${activeQuery === q.query ? COLORS.iris : COLORS.border}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      {info?.label || q.query}
                      {q.hasRealGrowth && <FireFilled style={{ marginLeft: 6, fontSize: 10, color: activeQuery === q.query ? '#ffd666' : COLORS.rose }} />}
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          )}

          {/* 该 query 统计 */}
          {trendData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
              <Card size="small" style={{ borderRadius: 12 }}><Statistic title="收录项目" value={trendData.topStarred?.length || 0} prefix={<GithubOutlined />} /></Card>
              <Card size="small" style={{ borderRadius: 12 }}><Statistic title="头部 Stars" value={trendData.topStarred?.[0]?.stars || 0} formatter={v => fmtStars(Number(v))} prefix={<StarFilled style={{ color: '#faad14' }} />} /></Card>
              <Card size="small" style={{ borderRadius: 12 }}><Statistic title="真实增长数据" value={trendData.realGrowth?.length || 0} suffix="个" prefix={<FireFilled style={{ color: COLORS.rose }} />} /></Card>
              <Card size="small" style={{ borderRadius: 12 }}><Statistic title="更新于" value={fmtTime(trendData.generatedAt)} valueStyle={{ fontSize: 14 }} prefix={<ClockCircleOutlined />} /></Card>
            </div>
          )}

          {/* 三榜 */}
          {loading ? (
            <Spin style={{ display: 'block', padding: 60, textAlign: 'center' }} />
          ) : trendData ? (
            <Tabs items={[
              {
                key: 'top', label: <span><StarFilled style={{ color: '#faad14' }} /> 星最多</span>,
                children: <>
                  <div style={{ color: COLORS.slate, fontSize: 12, marginBottom: 12 }}>按 GitHub 总星标数排序，展示该领域最受关注的头部项目</div>
                  <Table dataSource={trendData.topStarred || []} columns={[...baseColumns, starCol, actionCol]} rowKey="full_name" pagination={false} size="small" />
                </>,
              },
              {
                key: 'growing', label: <span><RiseOutlined style={{ color: COLORS.iris }} /> 增长最快</span>,
                children: <>
                  <div style={{ color: COLORS.slate, fontSize: 12, marginBottom: 12 }}>筛选近半年内创建的新项目，按日均涨星速度排序 — 发现正在爆发的新星</div>
                  <Table dataSource={trendData.fastestGrowing || []} columns={[...baseColumns, starCol, velocityCol, actionCol]} rowKey="full_name" pagination={false} size="small" />
                </>,
              },
              {
                key: 'real', label: <span><FireFilled style={{ color: COLORS.rose }} /> 真实增长</span>,
                children: trendData.realGrowth?.length ? <>
                  <div style={{ color: COLORS.slate, fontSize: 12, marginBottom: 12 }}>基于每日快照对比的真实涨星数据，不是估算 — 谁在真正涨，一目了然</div>
                  <Table dataSource={trendData.realGrowth} columns={[...baseColumns, starCol, deltaCol, actionCol]} rowKey="full_name" pagination={false} size="small" />
                </> : <Empty description="暂无快照对比数据，需至少积累两天数据" style={{ padding: 40 }} />,
              },
            ]} />
          ) : (
            <Empty description={<span>没有「{activeQuery}」的数据 <Button type="link" onClick={handleRefresh} loading={refreshing}>立即拉取</Button></span>} style={{ padding: 60 }} />
          )}
        </div>
      ),
    },
    // AI 分析报告 tab
    {
      key: 'analysis',
      label: <span><ExperimentOutlined style={{ color: '#8b5cf6' }} /> AI 分析报告</span>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ color: COLORS.slate, fontSize: 13 }}>
              基于全部领域的趋势数据，用 AI 生成深度洞察报告
            </div>
            <Button type="primary" icon={<ExperimentOutlined />} loading={analyzing} onClick={handleAnalyze}>
              {analysis ? '重新生成' : '生成报告'}
            </Button>
          </div>

          {analysis ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 总结 */}
              <Card size="small" style={{ borderRadius: 12, borderLeft: `3px solid ${COLORS.iris}` }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>总体趋势</div>
                <Paragraph style={{ margin: 0, fontSize: 14, lineHeight: 1.8 }}>{analysis.summary}</Paragraph>
                <div style={{ marginTop: 8, fontSize: 12, color: COLORS.slate }}>
                  模型：{analysis.model} · 生成于 {fmtTime(analysis.generatedAt)}
                </div>
              </Card>

              {/* 热门赛道 */}
              <Card size="small" title={<span><FireFilled style={{ color: COLORS.rose, marginRight: 6 }} />热门技术方向</span>} style={{ borderRadius: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {analysis.hot_tracks?.map((track, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ minWidth: 60 }}>
                        <Progress type="circle" percent={track.heat_score * 10} size={48} strokeColor={track.heat_score >= 8 ? COLORS.rose : track.heat_score >= 5 ? COLORS.iris : COLORS.slate} format={() => `${track.heat_score}`} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text strong>{track.name}</Text>
                        <div style={{ color: COLORS.slate, fontSize: 13, marginTop: 2 }}>{track.description}</div>
                        <Space size={4} style={{ marginTop: 6 }}>
                          {track.representative_repos?.map(r => <Tag key={r} style={{ fontSize: 11, borderRadius: 4 }}>{r}</Tag>)}
                        </Space>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 新兴项目 & 技术转变 并排 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card size="small" title={<span><RiseOutlined style={{ color: COLORS.mint, marginRight: 6 }} />崛起中的新星</span>} style={{ borderRadius: 12 }}>
                  {analysis.rising_stars?.map((star, i) => (
                    <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < (analysis.rising_stars?.length ?? 0) - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                      <Text strong style={{ color: COLORS.iris }}>{star.repo_name}</Text>
                      <div style={{ fontSize: 13, color: COLORS.slate, marginTop: 2 }}>{star.reason}</div>
                      <Tag style={{ marginTop: 4, fontSize: 11 }}>{star.growth_metric}</Tag>
                    </div>
                  ))}
                </Card>

                <Card size="small" title={<span><ThunderboltOutlined style={{ color: '#f59e0b', marginRight: 6 }} />技术趋势转变</span>} style={{ borderRadius: 12 }}>
                  {analysis.tech_shifts?.map((shift, i) => (
                    <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < (analysis.tech_shifts?.length ?? 0) - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                      <Text strong>{shift.title}</Text>
                      <div style={{ fontSize: 13, color: COLORS.slate, marginTop: 2 }}>{shift.description}</div>
                    </div>
                  ))}
                </Card>
              </div>

              {/* 语言洞察 */}
              {analysis.language_insights && (
                <Card size="small" style={{ borderRadius: 12, background: '#fafbfe' }}>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>主导语言</Text>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{analysis.language_insights.dominant}</div>
                    </div>
                    <div style={{ width: 1, height: 30, background: COLORS.border }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>上升语言</Text>
                      <div style={{ fontWeight: 600, fontSize: 16, color: COLORS.mint }}>{analysis.language_insights.rising}</div>
                    </div>
                    <div style={{ width: 1, height: 30, background: COLORS.border }} />
                    <div style={{ flex: 1 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>洞察</Text>
                      <div style={{ fontSize: 13, marginTop: 2 }}>{analysis.language_insights.insight}</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* 建议 */}
              <Card size="small" title={<span><BulbOutlined style={{ color: '#f59e0b', marginRight: 6 }} />对 Agent 平台开发者的建议</span>} style={{ borderRadius: 12 }}>
                {analysis.recommendations?.map((rec, i) => (
                  <div key={i} style={{ marginBottom: i < (analysis.recommendations?.length ?? 0) - 1 ? 12 : 0, paddingBottom: 12, borderBottom: i < (analysis.recommendations?.length ?? 0) - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                    <Space>
                      <ToolOutlined style={{ color: COLORS.iris }} />
                      <Text strong>{rec.title}</Text>
                    </Space>
                    <div style={{ fontSize: 13, color: COLORS.slate, marginTop: 4, paddingLeft: 22 }}>{rec.content}</div>
                  </div>
                ))}
              </Card>
            </div>
          ) : (
            <Empty description="点击「生成报告」让 AI 分析全部趋势数据" style={{ padding: 80 }}>
              <Button type="primary" icon={<ExperimentOutlined />} loading={analyzing} onClick={handleAnalyze}>生成 AI 分析报告</Button>
            </Empty>
          )}
        </div>
      ),
    },
    // Hacker News tab
    {
      key: 'hn',
      label: <span><CommentOutlined style={{ color: '#ff6600' }} /> Hacker News</span>,
      children: (
        <SourcePanel
          sourceLabel="Hacker News"
          color="#ff6600"
          queries={[
            { key: 'AI agent', label: 'AI Agent' },
            { key: 'LLM', label: '大语言模型' },
            { key: 'Claude anthropic', label: 'Claude' },
            { key: 'GPT OpenAI', label: 'GPT / OpenAI' },
            { key: 'MCP model context protocol', label: 'MCP 协议' },
            { key: 'AI coding copilot', label: 'AI 编程' },
          ]}
          activeKey={hnQuery}
          onSelect={(k) => { setHnQuery(k); fetchHn(k); }}
          loading={hnLoading}
          data={hnData}
          onMount={() => { if (!hnData) fetchHn(hnQuery); }}
          columns={[
            { title: '#', width: 48, render: (_: any, __: any, i: number) => <span style={{ color: COLORS.slate }}>{i + 1}</span> },
            {
              title: '标题', dataIndex: 'title',
              render: (t: string, r: any) => (
                <div>
                  <a href={r.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: 14 }}>{t}</a>
                  <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 2 }}>
                    <a href={r.hnUrl} target="_blank" rel="noreferrer" style={{ color: '#ff6600' }}>HN 讨论</a>
                    {r.author && <span> · {r.author}</span>}
                  </div>
                </div>
              ),
            },
            {
              title: '热度', dataIndex: 'points', width: 80, sorter: (a: any, b: any) => a.points - b.points,
              render: (v: number) => <span style={{ fontWeight: 600, color: '#ff6600' }}>{v}</span>,
            },
            {
              title: '评论', dataIndex: 'comments', width: 80, sorter: (a: any, b: any) => a.comments - b.comments,
              render: (v: number) => <span>{v}</span>,
            },
          ]}
          rowKey={(r: any) => r.hnUrl || r.title}
        />
      ),
    },
    // arXiv tab
    {
      key: 'arxiv',
      label: <span><FileTextOutlined style={{ color: '#b31b1b' }} /> arXiv 论文</span>,
      children: (
        <SourcePanel
          sourceLabel="arXiv"
          color="#b31b1b"
          queries={[
            { key: 'cs.AI', label: '人工智能' },
            { key: 'cs.CL', label: '计算语言学' },
            { key: 'cs.LG', label: '机器学习' },
            { key: 'cs.CV', label: '计算机视觉' },
            { key: 'cs.MA', label: '多智能体' },
          ]}
          activeKey={arxivCat}
          onSelect={(k) => { setArxivCat(k); fetchArxiv(k); }}
          loading={arxivLoading}
          data={arxivData}
          onMount={() => { if (!arxivData) fetchArxiv(arxivCat); }}
          columns={[
            { title: '#', width: 48, render: (_: any, __: any, i: number) => <span style={{ color: COLORS.slate }}>{i + 1}</span> },
            {
              title: '论文', dataIndex: 'title',
              render: (t: string, r: any) => (
                <div>
                  <a href={r.absUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: 14 }}>{t}</a>
                  <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 2, maxWidth: 500 }}>
                    {r.authors?.slice(0, 3).join(', ')}{r.authors?.length > 3 ? ' et al.' : ''}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 2, maxWidth: 500 }}>{r.summary}</div>
                </div>
              ),
            },
            {
              title: '分类', dataIndex: 'categories', width: 150,
              render: (cats: string[]) => <Space size={2} wrap>{cats?.slice(0, 3).map(c => <Tag key={c} style={{ fontSize: 10, borderRadius: 3 }}>{c}</Tag>)}</Space>,
            },
            {
              title: '发布', dataIndex: 'publishedAt', width: 100,
              render: (v: string) => <span style={{ fontSize: 12, color: COLORS.slate }}>{v?.slice(0, 10)}</span>,
            },
            {
              title: '', width: 60,
              render: (_: any, r: any) => r.pdfUrl ? <Button size="small" type="link" href={r.pdfUrl} target="_blank">PDF</Button> : null,
            },
          ]}
          rowKey={(r: any) => r.absUrl || r.title}
        />
      ),
    },
    // Google News tab
    {
      key: 'news',
      label: <span><GlobalOutlined style={{ color: '#4285f4' }} /> 新闻</span>,
      children: (
        <SourcePanel
          sourceLabel="Google News"
          color="#4285f4"
          queries={[
            { key: 'artificial intelligence', label: 'AI 综合' },
            { key: 'large language model LLM', label: '大模型动态' },
            { key: 'AI agent autonomous', label: 'AI Agent' },
            { key: 'AI startup funding', label: 'AI 创业融资' },
            { key: 'AI regulation policy', label: 'AI 监管政策' },
          ]}
          activeKey={newsQuery}
          onSelect={(k) => { setNewsQuery(k); fetchNews(k); }}
          loading={newsLoading}
          data={newsData}
          onMount={() => { if (!newsData) fetchNews(newsQuery); }}
          columns={[
            { title: '#', width: 48, render: (_: any, __: any, i: number) => <span style={{ color: COLORS.slate }}>{i + 1}</span> },
            {
              title: '标题', dataIndex: 'title',
              render: (t: string, r: any) => (
                <div>
                  <a href={r.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: 14 }}>{t}</a>
                  {r.source && <Tag style={{ marginLeft: 8, fontSize: 11, borderRadius: 4 }}>{r.source}</Tag>}
                </div>
              ),
            },
            {
              title: '发布时间', dataIndex: 'publishedAt', width: 180,
              render: (v: string) => {
                if (!v) return '-';
                try { return new Date(v).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return v; }
              },
            },
          ]}
          rowKey={(r: any) => r.url || r.title}
        />
      ),
    },
    // Reddit tab
    {
      key: 'reddit',
      label: <span><MessageOutlined style={{ color: '#ff4500' }} /> Reddit</span>,
      children: (
        <SourcePanel
          sourceLabel="Reddit"
          color="#ff4500"
          queries={[
            { key: 'MachineLearning', label: '机器学习' },
            { key: 'LocalLLaMA', label: '本地大模型' },
            { key: 'artificial', label: 'AI 综合' },
            { key: 'ClaudeAI', label: 'Claude' },
            { key: 'ChatGPT', label: 'ChatGPT' },
          ]}
          activeKey={redditSub}
          onSelect={(k) => { setRedditSub(k); fetchReddit(k); }}
          loading={redditLoading}
          data={redditData}
          onMount={() => { if (!redditData) fetchReddit(redditSub); }}
          columns={[
            { title: '#', width: 48, render: (_: any, __: any, i: number) => <span style={{ color: COLORS.slate }}>{i + 1}</span> },
            {
              title: '帖子', dataIndex: 'title',
              render: (t: string, r: any) => (
                <div>
                  <a href={r.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: 14 }}>{t}</a>
                  <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 2 }}>
                    u/{r.author}
                    {r.flair && <Tag style={{ marginLeft: 6, fontSize: 10, borderRadius: 3 }}>{r.flair}</Tag>}
                  </div>
                </div>
              ),
            },
            {
              title: '投票', dataIndex: 'score', width: 80, sorter: (a: any, b: any) => a.score - b.score,
              render: (v: number) => <span style={{ fontWeight: 600, color: v > 100 ? '#ff4500' : COLORS.slateDark }}>{fmtStars(v)}</span>,
            },
            {
              title: '评论', dataIndex: 'comments', width: 80, sorter: (a: any, b: any) => a.comments - b.comments,
              render: (v: number) => <span>{v}</span>,
            },
          ]}
          rowKey={(r: any) => r.url || r.title}
        />
      ),
    },
  ];

  return (
    <div>
      {/* 页头 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            <RocketOutlined style={{ marginRight: 8, color: COLORS.iris }} />
            AI 趋势雷达
          </div>
          <div style={{ color: COLORS.slate, fontSize: 13, marginTop: 2 }}>
            GitHub · Hacker News · arXiv · Google News · Reddit — 五大源头追踪 AI 前沿
          </div>
        </div>
        <Button icon={<ReloadOutlined spin={refreshing} />} loading={refreshing} onClick={handleRefresh} disabled={!activeQuery}>
          刷新当前
        </Button>
      </div>

      {/* 主 Tabs */}
      <Card style={{ borderRadius: 14 }}>
        <Tabs items={mainTabItems} />
      </Card>

      {/* 详情抽屉 */}
      <Drawer title={detailRepo?.full_name} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}>
        {detailRepo && (
          <div>
            <Paragraph style={{ color: COLORS.slate }}>{detailRepo.description}</Paragraph>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <Card size="small" style={{ borderRadius: 10 }}>
                <Statistic title="Stars" value={detailRepo.stars} formatter={v => fmtStars(Number(v))} prefix={<StarFilled style={{ color: '#faad14' }} />} />
              </Card>
              <Card size="small" style={{ borderRadius: 10 }}>
                <Statistic title="Forks" value={detailRepo.forks} formatter={v => fmtStars(Number(v))} prefix={<ForkOutlined />} />
              </Card>
            </div>
            <Space style={{ marginBottom: 16 }} wrap>
              {detailRepo.language && <Tag color="blue">{detailRepo.language}</Tag>}
              <Tooltip title="日均涨星（总星标 ÷ 项目存活天数）"><Tag>{detailRepo.stars_per_day?.toFixed(0)} ⭐/天</Tag></Tooltip>
              {detailRepo.delta !== undefined && (
                <Tooltip title="通过每日快照对比得出的真实涨星数"><Tag color={detailRepo.delta > 0 ? 'green' : 'default'}>近期 {detailRepo.delta > 0 ? '+' : ''}{detailRepo.delta}</Tag></Tooltip>
              )}
            </Space>
            {detailRepo.topics?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Topics</Text>
                <Space wrap size={4}>{detailRepo.topics.map(t => <Tag key={t} style={{ fontSize: 11, borderRadius: 4 }}>{t}</Tag>)}</Space>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24, fontSize: 13 }}>
              <div><Text type="secondary">创建于</Text><div>{fmtTime(detailRepo.created_at)}</div></div>
              <div><Text type="secondary">最近推送</Text><div>{fmtTime(detailRepo.pushed_at)}</div></div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Star 走势（快照历史）</Text>
              {historyLoading ? <Spin size="small" /> : history.length >= 2 ? (
                <div>
                  <SparkLine data={history} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLORS.slate, marginTop: 4 }}>
                    <span>{fmtTime(history[0].takenAt)}</span>
                    <span>{fmtTime(history[history.length - 1].takenAt)}</span>
                  </div>
                </div>
              ) : <Text type="secondary" style={{ fontSize: 12 }}>需至少 2 个快照才能绘制走势</Text>}
            </div>
            <Button type="primary" icon={<LinkOutlined />} href={detailRepo.html_url} target="_blank" block>在 GitHub 上查看</Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
