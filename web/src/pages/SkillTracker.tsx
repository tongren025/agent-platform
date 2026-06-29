import { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Button, Tabs, Tag, Space, message, Drawer, Spin,
  Statistic, Empty, Typography, Tooltip,
} from 'antd';
import {
  ReloadOutlined, StarFilled, RiseOutlined, FireFilled,
  GithubOutlined, LinkOutlined, ClockCircleOutlined,
  ForkOutlined, RocketOutlined,
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
  // real growth fields
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
  const w = 200;
  const h = 60;
  const pad = 4;
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

  const fetchQueries = useCallback(async () => {
    try {
      const list: QueryInfo[] = await api.listTrendQueries();
      setQueries(list);
      if (list.length > 0 && !activeQuery) {
        setActiveQuery(list[0].query);
      }
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
    } catch {
      setTrendData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQueries(); }, [fetchQueries]);
  useEffect(() => { if (activeQuery) fetchTrends(activeQuery); }, [activeQuery, fetchTrends]);

  const handleRefresh = async () => {
    if (!activeQuery) return;
    setRefreshing(true);
    try {
      const data = await api.refreshTrends(activeQuery);
      setTrendData(data);
      message.success(`已刷新「${activeQuery}」`);
      fetchQueries();
    } catch (e: any) {
      message.error('刷新失败: ' + e.message);
    } finally {
      setRefreshing(false);
    }
  };

  const openDetail = async (repo: Repo) => {
    setDetailRepo(repo);
    setDrawerOpen(true);
    setHistoryLoading(true);
    try {
      const pts = await api.getRepoHistory(activeQuery, repo.full_name);
      setHistory(pts);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const baseColumns = [
    {
      title: '#',
      width: 48,
      render: (_: any, __: any, idx: number) => (
        <span style={{ color: COLORS.slate, fontWeight: 500 }}>{idx + 1}</span>
      ),
    },
    {
      title: '仓库',
      dataIndex: 'full_name',
      render: (name: string, r: Repo) => (
        <div>
          <a href={r.html_url} target="_blank" rel="noreferrer"
            style={{ fontWeight: 600, fontSize: 14 }}
          >
            {name}
          </a>
          {r.language && (
            <Tag style={{
              marginLeft: 8, fontSize: 11, borderRadius: 4,
              color: LANG_COLORS[r.language] || COLORS.slate,
              borderColor: LANG_COLORS[r.language] || COLORS.border,
              background: 'transparent',
            }}>
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

  const starCol = {
    title: '⭐ Stars',
    dataIndex: 'stars',
    width: 110,
    sorter: (a: Repo, b: Repo) => a.stars - b.stars,
    render: (v: number) => <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtStars(v)}</span>,
  };

  const velocityCol = {
    title: '⭐/天',
    dataIndex: 'stars_per_day',
    width: 100,
    sorter: (a: Repo, b: Repo) => a.stars_per_day - b.stars_per_day,
    render: (v: number) => <span style={{ fontWeight: 600, color: COLORS.iris }}>{v.toFixed(0)}</span>,
  };

  const deltaCol = {
    title: '近期涨星',
    dataIndex: 'delta',
    width: 120,
    sorter: (a: Repo, b: Repo) => (a.delta ?? 0) - (b.delta ?? 0),
    render: (v: number, r: Repo) => (
      <div>
        <DeltaTag delta={v} />
        {r.delta_per_day !== undefined && (
          <div style={{ fontSize: 11, color: COLORS.slate }}>{r.delta_per_day > 0 ? '+' : ''}{r.delta_per_day.toFixed(1)}/天</div>
        )}
      </div>
    ),
  };

  const actionCol = {
    title: '',
    width: 64,
    render: (_: any, r: Repo) => (
      <Button size="small" type="link" onClick={() => openDetail(r)}>详情</Button>
    ),
  };

  const topStarredCols = [...baseColumns, starCol, actionCol];
  const growingCols = [...baseColumns, starCol, velocityCol, actionCol];
  const realGrowthCols = [...baseColumns, starCol, deltaCol, actionCol];

  const tabItems = [
    {
      key: 'top',
      label: <span><StarFilled style={{ color: '#faad14' }} /> 星最多</span>,
      children: (
        <div>
          <div style={{ color: COLORS.slate, fontSize: 12, marginBottom: 12 }}>
            按 GitHub 总星标数排序，展示该领域最受关注的头部项目
          </div>
          <Table
            dataSource={trendData?.topStarred || []}
            columns={topStarredCols}
            rowKey="full_name"
            pagination={false}
            size="small"
          />
        </div>
      ),
    },
    {
      key: 'growing',
      label: <span><RiseOutlined style={{ color: COLORS.iris }} /> 增长最快</span>,
      children: (
        <div>
          <div style={{ color: COLORS.slate, fontSize: 12, marginBottom: 12 }}>
            筛选近半年内创建的新项目，按日均涨星速度排序 — 发现正在爆发的新星
          </div>
          <Table
            dataSource={trendData?.fastestGrowing || []}
            columns={growingCols}
            rowKey="full_name"
            pagination={false}
            size="small"
          />
        </div>
      ),
    },
    {
      key: 'real',
      label: <span><FireFilled style={{ color: COLORS.rose }} /> 真实增长</span>,
      children: trendData?.realGrowth?.length ? (
        <div>
          <div style={{ color: COLORS.slate, fontSize: 12, marginBottom: 12 }}>
            基于每日快照对比的真实涨星数据，不是估算 — 谁在真正涨，一目了然
          </div>
          <Table
            dataSource={trendData.realGrowth}
            columns={realGrowthCols}
            rowKey="full_name"
            pagination={false}
            size="small"
          />
        </div>
      ) : (
        <Empty description="暂无快照对比数据，需至少积累两天数据" style={{ padding: 40 }} />
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
            追踪 GitHub 上 AI 领域最火项目 · 每天自动更新
          </div>
        </div>
        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          loading={refreshing}
          onClick={handleRefresh}
          disabled={!activeQuery}
        >
          刷新当前
        </Button>
      </div>

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
                    padding: '6px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
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

      {/* 统计卡片 */}
      {trendData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="收录项目" value={trendData.topStarred?.length || 0} prefix={<GithubOutlined />} />
          </Card>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic
              title="头部项目 Stars"
              value={trendData.topStarred?.[0]?.stars || 0}
              formatter={(v) => fmtStars(Number(v))}
              prefix={<StarFilled style={{ color: '#faad14' }} />}
            />
          </Card>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic
              title="有真实增长数据"
              value={trendData.realGrowth?.length || 0}
              suffix="个"
              prefix={<FireFilled style={{ color: COLORS.rose }} />}
            />
          </Card>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic
              title="数据更新于"
              value={fmtTime(trendData.generatedAt)}
              valueStyle={{ fontSize: 14 }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </div>
      )}

      {/* 榜单 */}
      <Card style={{ borderRadius: 14 }}>
        {loading ? (
          <Spin style={{ display: 'block', padding: 80, textAlign: 'center' }} />
        ) : trendData ? (
          <Tabs items={tabItems} />
        ) : (
          <Empty description={
            <span>
              没有「{activeQuery}」的数据
              <Button type="link" onClick={handleRefresh} loading={refreshing}>立即拉取</Button>
            </span>
          } style={{ padding: 60 }} />
        )}
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title={detailRepo?.full_name}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
      >
        {detailRepo && (
          <div>
            {/* 基本信息 */}
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
              <Tooltip title="日均涨星（总星标 ÷ 项目存活天数，越高说明增长越猛）">
                <Tag>{detailRepo.stars_per_day?.toFixed(0)} ⭐/天</Tag>
              </Tooltip>
              {detailRepo.delta !== undefined && (
                <Tooltip title="通过每日快照对比得出的真实涨星数，不是估算">
                  <Tag color={detailRepo.delta > 0 ? 'green' : 'default'}>
                    近期 {detailRepo.delta > 0 ? '+' : ''}{detailRepo.delta}
                  </Tag>
                </Tooltip>
              )}
            </Space>

            {/* Topics */}
            {detailRepo.topics?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Topics</Text>
                <Space wrap size={4}>
                  {detailRepo.topics.map(t => (
                    <Tag key={t} style={{ fontSize: 11, borderRadius: 4 }}>{t}</Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* 时间 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24, fontSize: 13 }}>
              <div>
                <Text type="secondary">创建于</Text>
                <div>{fmtTime(detailRepo.created_at)}</div>
              </div>
              <div>
                <Text type="secondary">最近推送</Text>
                <div>{fmtTime(detailRepo.pushed_at)}</div>
              </div>
            </div>

            {/* Star 走势 */}
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Star 走势（快照历史）</Text>
              {historyLoading ? (
                <Spin size="small" />
              ) : history.length >= 2 ? (
                <div>
                  <SparkLine data={history} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLORS.slate, marginTop: 4 }}>
                    <span>{fmtTime(history[0].takenAt)}</span>
                    <span>{fmtTime(history[history.length - 1].takenAt)}</span>
                  </div>
                </div>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>需至少 2 个快照才能绘制走势</Text>
              )}
            </div>

            {/* 链接 */}
            <Button
              type="primary"
              icon={<LinkOutlined />}
              href={detailRepo.html_url}
              target="_blank"
              block
            >
              在 GitHub 上查看
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
