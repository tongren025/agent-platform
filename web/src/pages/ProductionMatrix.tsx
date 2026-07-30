// 全链路对照矩阵：季 → 集 → G 生成单元 → 剧本/分镜/首帧/末帧/视频提示词/图/视频，一屏铺开。
//
// 制作看板按阶段竖切成 10 列，同一个 G 单元的四个环节散落在不同列里，
// 无法回答"这一集哪些单元还没图""哪个单元断链了"。本页把主键
// (季, 集, G单元) 拉成行，把阶段拉成列，缺口一眼可见。
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Table, Tag, Segmented, Space, Typography, Spin, Empty, Tooltip, Badge, Progress, Alert, Button, Drawer, List, Modal, Popconfirm, Divider, Input } from 'antd';
import { message } from '../ui';
import {
  FileTextOutlined, BuildOutlined, PictureOutlined, LockOutlined,
  VideoCameraOutlined, WarningOutlined, InboxOutlined, UndoOutlined,
  HistoryOutlined, ToolOutlined,
} from '@ant-design/icons';
import {
  api,
  type ArchivedCard,
  type MatrixProject,
  type MatrixRow,
  type OrphanCard,
  type ProjectDiagnosticIssue,
  type ProjectDiagnostics,
  type ProjectFeedback,
  type ProjectFeedbackIssue,
  type ProjectOptimizationRun,
} from '../api';
import { useResponsive } from '../hooks/useResponsive';
import { COLORS } from '../theme';
import ProjectViewNav from '../components/ProjectViewNav';

const { Text, Title, Paragraph } = Typography;

/** 链路上的七个环节：四个 spec 阶段（含首帧/末帧拆分）+ 两个产出。 */
const CHAIN: { key: keyof MatrixRow; label: string; icon: React.ReactNode; color: string; spec: boolean }[] = [
  { key: 'script', label: '剧本', icon: <FileTextOutlined />, color: '#7c4dff', spec: true },
  { key: 'storyboard', label: '分镜', icon: <BuildOutlined />, color: '#00897b', spec: true },
  { key: 'img_prompt', label: '首帧提示词', icon: <PictureOutlined />, color: '#1e88e5', spec: true },
  { key: 'flf', label: '末帧锁', icon: <LockOutlined />, color: '#8d6e63', spec: false },
  { key: 'vid_prompt', label: '视频提示词', icon: <VideoCameraOutlined />, color: '#e53935', spec: true },
  { key: 'images', label: '图', icon: <PictureOutlined />, color: '#43a047', spec: false },
  { key: 'videos', label: '视频', icon: <VideoCameraOutlined />, color: '#fb8c00', spec: false },
];

type Filter = 'all' | 'gap' | 'noimg';
type IssueFilter = 'priority' | 'automatic' | 'manual';

/** 单元格：有几张就显示几张，0 张时区分"该有却没有"(红叉)与"本就可选"(灰点)。 */
function Cell({ n, required }: { n: number; required: boolean }) {
  if (n > 0) {
    return <Text aria-label={`已有 ${n} 项内容`} style={{ color: '#389e0d', fontWeight: 600 }}>{n > 1 ? `✓ ${n}` : '✓'}</Text>;
  }
  return required
    ? <Tooltip title="缺少这个必需步骤"><Text aria-label="缺少必需内容" style={{ color: '#cf1322', fontWeight: 600 }}>✗</Text></Tooltip>
    : <Text aria-label="此步骤可选，当前没有内容" type="secondary" style={{ opacity: 0.35 }}>·</Text>;
}

export default function ProductionMatrix() {
  const navigate = useNavigate();
  const { pid: routePid } = useParams<{ pid: string }>();
  const { isMobile } = useResponsive();
  const [projects, setProjects] = useState<MatrixProject[]>([]);
  const [rows, setRows] = useState<MatrixRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pid, setPid] = useState<string>(routePid || '');
  const [filter, setFilter] = useState<Filter>('all');

  const [orphans, setOrphans] = useState<OrphanCard[]>([]);
  const [orphanOpen, setOrphanOpen] = useState(false);
  const [archived, setArchived] = useState<ArchivedCard[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveError, setArchiveError] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [diagnostics, setDiagnostics] = useState<ProjectDiagnostics | null>(null);
  const [feedback, setFeedback] = useState<ProjectFeedback | null>(null);
  const [optimizationRuns, setOptimizationRuns] = useState<ProjectOptimizationRun[]>([]);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [diagnosticsError, setDiagnosticsError] = useState('');
  const [issuesOpen, setIssuesOpen] = useState(false);
  const [issueFilter, setIssueFilter] = useState<IssueFilter>('priority');
  const [issueCodeFilter, setIssueCodeFilter] = useState('');
  const [optimizingIssueId, setOptimizingIssueId] = useState('');

  const reload = useCallback(async () => {
    const [m, o] = await Promise.all([api.getMatrix(), api.listOrphans()]);
    setProjects(m.projects);
    setRows(m.rows);
    setOrphans(o);
    return m;
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const m = await reload();
        if (!m.projects.length) return;
        const requested = routePid && m.projects.some(project => project.project_id === routePid)
          ? routePid
          : '';
        setPid(current => requested
          || (m.projects.some(project => project.project_id === current) ? current : m.projects[0].project_id));
    } catch {
      setLoadError('暂时无法加载完整性检查，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }, [reload, routePid]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (routePid) setPid(routePid);
  }, [routePid]);

  useEffect(() => {
    setIssueFilter('priority');
  }, [pid]);

  const loadDiagnostics = useCallback(async (projectId = pid) => {
    if (!projectId) return;
    setDiagnosticsLoading(true);
    setDiagnosticsError('');
    try {
      const [report, runs] = await Promise.all([
        api.getProjectDiagnostics(projectId),
        api.listProjectOptimizationRuns(projectId, 20),
      ]);
      setDiagnostics(report);
      setOptimizationRuns(runs);
    } catch {
      setDiagnostics(null);
      setOptimizationRuns([]);
      setDiagnosticsError('项目问题扫描暂时失败，请稍后重试。');
    } finally {
      setDiagnosticsLoading(false);
    }
  }, [pid]);

  useEffect(() => {
    void loadDiagnostics();
  }, [loadDiagnostics]);

  const loadFeedback = useCallback(async () => {
    try {
      setFeedback(await api.getProjectFeedback());
    } catch {
      setFeedback(null);
    }
  }, []);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  const refreshArchive = useCallback(async () => {
    if (!pid) return;
    setArchiveLoading(true);
    setArchiveError('');
    try {
      setArchived(await api.listArchive(pid));
    } catch {
      setArchiveError('暂时无法加载归档内容，请稍后重试。');
      setArchived([]);
    } finally {
      setArchiveLoading(false);
    }
  }, [pid]);

  // 归档区按项目分别存放，切季时重新拉
  useEffect(() => {
    void refreshArchive();
  }, [refreshArchive]);

  const myOrphans = useMemo(() => orphans.filter(o => o.project_id === pid), [orphans, pid]);

  const handleArchive = async (cards: OrphanCard[]) => {
    if (!cards.length) return;
    setBusy(true);
    try {
      const reason = '未归类卡片：所属镜头不存在（该集无此镜头的剧本/分镜/首帧/视频提示词）';
      await api.archiveCards(pid, cards.map(c => c.card_id), reason);
      message.success(`已归档 ${cards.length} 张，可随时恢复`);
      setOrphanOpen(false);
      await Promise.all([reload(), refreshArchive()]);
    } catch (e: any) { message.error('归档失败: ' + e.message); }
    finally { setBusy(false); }
  };

  const handleRestore = async (cardId: string) => {
    setBusy(true);
    try {
      await api.restoreCard(pid, cardId);
      message.success('已恢复回卡片列表');
      await Promise.all([reload(), refreshArchive()]);
    } catch (e: any) { message.error('恢复失败: ' + e.message); }
    finally { setBusy(false); }
  };

  const openManualAction = (issue: ProjectDiagnosticIssue) => {
    if (issue.action.kind === 'edit_project') {
      navigate(`/production/${pid}/pipeline`);
      return;
    }
    if (issue.action.kind === 'review_card') {
      setIssuesOpen(false);
      navigate(
        issue.episode == null
          ? `/production/${pid}/pipeline`
          : `/production/${pid}/ep/${issue.episode}`,
      );
      return;
    }
    // 图片、视频、状态同步和成片合成都回到导演主线处理；那里会继续定位到当前项目。
    navigate(`/studio?project=${pid}`);
  };

  const runOptimization = async (issue: ProjectDiagnosticIssue, extraInstruction = '') => {
    setOptimizingIssueId(issue.id);
    try {
      const result = await api.optimizeProjectIssue(pid, issue.id, extraInstruction);
      if (result.resolved) {
        message.success(`已修复，项目健康分 ${result.beforeScore} → ${result.afterScore}`);
      } else {
        message.warning(result.summary);
      }
      await Promise.all([reload(), loadDiagnostics(pid), loadFeedback()]);
    } catch (error: any) {
      message.error(error.message || '自动修复失败，请刷新后重试');
      await loadDiagnostics(pid);
    } finally {
      setOptimizingIssueId('');
    }
  };

  const handleDiagnosticIssue = (issue: ProjectDiagnosticIssue) => {
    if (!issue.autoFixable) {
      openManualAction(issue);
      return;
    }
    let extraInstruction = '';
    Modal.confirm({
      title: issue.action.label,
      content: (
        <div>
          <Paragraph style={{ marginBottom: 8 }}>{issue.message}</Paragraph>
          {issue.acceptanceCriteria.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <Text strong style={{ fontSize: 12 }}>本次验收条件</Text>
              {issue.acceptanceCriteria.map(item => (
                <Text key={item} type="secondary" style={{ display: 'block', fontSize: 12 }}>
                  · {item}
                </Text>
              ))}
            </div>
          )}
          <Input.TextArea
            aria-label="本次返工的补充要求"
            placeholder="可选：补充必须保留的画风、台词或剧情约束"
            autoSize={{ minRows: 2, maxRows: 4 }}
            maxLength={4000}
            showCount
            onChange={event => { extraInstruction = event.target.value; }}
          />
          <Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
            只替换这个镜头的这个阶段；开始前会自动保存版本快照。
          </Paragraph>
        </div>
      ),
      okText: '开始定向返工',
      cancelText: '取消',
      onOk: () => runOptimization(issue, extraInstruction),
    });
  };

  const openFeedbackIssue = (item: ProjectFeedbackIssue) => {
    const currentProjectHasIssue = diagnostics?.projectId === pid && diagnostics.issues.some(
      issue => issue.code === item.code,
    );
    const targetProjectId = currentProjectHasIssue
      ? pid
      : ((item.projectIds || [])[0] || pid);
    setIssueCodeFilter(item.code);
    setIssueFilter('priority');
    setIssuesOpen(true);
    if (targetProjectId && targetProjectId !== pid) {
      setPid(targetProjectId);
      navigate(`/production/${targetProjectId}/matrix`);
    }
  };

  const visible = useMemo(() => {
    let r = rows.filter(x => x.project_id === pid);
    if (filter === 'gap') r = r.filter(x => x.missing.length > 0);
    if (filter === 'noimg') r = r.filter(x => x.images === 0);
    return r;
  }, [rows, pid, filter]);

  /** 当前季的整体进度：spec 齐全率 与 出图率。 */
  const stats = useMemo(() => {
    const r = rows.filter(x => x.project_id === pid);
    if (!r.length) return null;
    return {
      units: r.length,
      episodes: new Set(r.map(x => x.episode)).size,
      specDone: r.filter(x => x.missing.length === 0).length,
      gaps: r.filter(x => x.missing.length > 0).length,
      withImg: r.filter(x => x.images > 0).length,
      withVid: r.filter(x => x.videos > 0).length,
    };
  }, [rows, pid]);

  const issueView = useMemo(() => {
    const issues = diagnostics?.issues || [];
    const scoped = issueCodeFilter
      ? issues.filter(issue => issue.code === issueCodeFilter)
      : issues;
    const automatic = scoped.filter(issue => issue.autoFixable);
    const manual = scoped.filter(issue => !issue.autoFixable && issue.severity !== 'info');
    const selected = issueFilter === 'automatic'
      ? automatic
      : issueFilter === 'manual' ? manual : scoped;
    return {
      automaticCount: automatic.length,
      manualCount: manual.length,
      total: selected.length,
      visible: selected.slice(0, 50),
    };
  }, [diagnostics, issueCodeFilter, issueFilter]);

  const visibleFeedbackIssues = useMemo(() => {
    if (!feedback) return [];
    const recommended = feedback.topIssues.find(
      item => item.code === feedback.recommendedIssueCode,
    );
    return [
      ...(recommended ? [recommended] : []),
      ...feedback.topIssues,
    ].filter(
      (item, index, items) => items.findIndex(
        candidate => candidate.code === item.code,
      ) === index,
    ).slice(0, 3);
  }, [feedback]);

  const issueCodeLabel = feedback?.topIssues.find(
    item => item.code === issueCodeFilter,
  )?.label || issueCodeFilter;

  const columns = [
    {
      title: '集', dataIndex: 'episode', width: 74, fixed: 'left' as const,
      render: (ep: number) => <Tag color="blue" style={{ margin: 0 }}>EP{String(ep).padStart(2, '0')}</Tag>,
    },
    {
      title: '镜头', dataIndex: 'unit', width: 76, fixed: 'left' as const,
      render: (u: number) => <Text strong>镜头 {u}</Text>,
    },
    {
      title: '标题', dataIndex: 'title', ellipsis: true,
      render: (t: string, r: MatrixRow) => (
        <Space size={4}>
          {r.missing.length > 0 && (
            <Tooltip title={`缺：${r.missing.join('、')}`}>
              <WarningOutlined style={{ color: '#cf1322' }} />
            </Tooltip>
          )}
          <Text style={{ fontSize: 12 }}>{t || '—'}</Text>
        </Space>
      ),
    },
    ...CHAIN.map(c => ({
      title: (
        <Tooltip title={c.spec ? '必需步骤，缺失时需要补齐' : '可选或产出步骤'}>
          <span style={{ color: c.color, fontSize: 12 }}>{c.icon} {c.label}</span>
        </Tooltip>
      ),
      dataIndex: c.key as string,
      width: 108,
      align: 'center' as const,
      render: (n: number) => <Cell n={n} required={c.spec} />,
    })),
  ];

  if (loading) {
    return (
      <div role="status" aria-live="polite" style={{ padding: 80, textAlign: 'center' }}>
        <Spin />
        <Text type="secondary" style={{ display: 'block', marginTop: 10 }}>正在检查项目内容…</Text>
      </div>
    );
  }
  if (loadError) {
    return (
      <div role="alert" style={{ padding: isMobile ? 16 : 60, maxWidth: 680, margin: '0 auto' }}>
        <Alert
          type="error"
          showIcon
          message="完整性检查加载失败"
          description={loadError}
          action={<Button onClick={loadInitial}>重试</Button>}
        />
      </div>
    );
  }
  if (!projects.length) {
    return <div style={{ padding: 60 }}><Empty image={<img src="/empty-create.svg" alt="" width={160} />} description="还没有制作项目" /></div>;
  }

  return (
    <main style={{ padding: isMobile ? 8 : 16, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <Title level={3} style={{ margin: '0 0 4px' }}>完整性检查</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            按集和镜头检查剧本、分镜、提示词、图片与视频，缺少哪一步一眼可见。
          </Text>
        </div>
        <ProjectViewNav projectId={pid} current="diagnostics" />
      </div>

      <Space style={{ margin: isMobile ? '8px 0 6px' : '14px 0 10px', flexWrap: 'wrap' }} wrap>
        <Segmented value={pid} onChange={v => {
          const nextPid = v as string;
          setIssueCodeFilter('');
          setPid(nextPid);
          navigate(`/production/${nextPid}/matrix`);
        }}
          options={projects.map(p => ({
            value: p.project_id,
            label: `${p.name}（${p.episode_count} 集 / ${p.card_count} 卡）`,
          }))} />
        <Segmented value={filter} onChange={v => setFilter(v as Filter)}
          options={[
            { value: 'all', label: '全部单元' },
            { value: 'gap', label: '只看缺项' },
            { value: 'noimg', label: '只看没图' },
          ]} />
        <Badge count={archived.length} size="small" offset={[-4, 4]}>
          <Button icon={<InboxOutlined />} onClick={() => setArchiveOpen(true)}>归档区</Button>
        </Badge>
      </Space>

      {diagnosticsError ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 12 }}
          message="项目问题扫描失败"
          description={diagnosticsError}
          action={<Button size="small" onClick={() => loadDiagnostics(pid)}>重试</Button>}
        />
      ) : diagnosticsLoading && !diagnostics ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message="正在检查真实生产链路…"
        />
      ) : diagnostics && (
        <Alert
          type={diagnostics.state === 'complete' ? 'success' : 'warning'}
          showIcon
          style={{ marginBottom: 12 }}
          message={
            <Space wrap>
              <Text strong>项目健康度 {diagnostics.score} 分</Text>
              {diagnostics.blockerCount > 0 && (
                <Tag color="error">{diagnostics.blockerCount} 个阻塞问题</Tag>
              )}
              {diagnostics.inProgressCount > 0 && (
                <Tag color="processing">{diagnostics.inProgressCount} 项生成中</Tag>
              )}
            </Space>
          }
          description={
            <div style={{ minWidth: isMobile ? 0 : 420 }}>
              <Paragraph style={{ margin: '4px 0 8px' }}>{diagnostics.summary}</Paragraph>
              <Progress
                percent={diagnostics.score}
                showInfo={false}
                size="small"
                strokeColor={diagnostics.state === 'complete' ? '#52c41a' : COLORS.iris}
              />
              <Space size={[4, 4]} wrap style={{ margin: '4px 0 6px' }}>
                {diagnostics.scoreBreakdown.map(item => (
                  <Tooltip
                    key={item.key}
                    title={`${item.label}在当前交付目标中占 ${item.weight} 分`}
                  >
                    <Tag color={item.score >= item.weight ? 'success' : 'default'}>
                      {item.label} {item.score}/{item.weight}
                    </Tag>
                  </Tooltip>
                ))}
              </Space>
              {diagnostics.issues[0] && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  首要问题：{diagnostics.issues[0].message}
                </Text>
              )}
              {isMobile && (
                <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
                  {diagnostics.issues[0] && diagnostics.issues[0].severity !== 'info' && (
                    <Button
                      block
                      type="primary"
                      icon={<ToolOutlined />}
                      loading={optimizingIssueId === diagnostics.issues[0].id}
                      onClick={() => handleDiagnosticIssue(diagnostics.issues[0])}
                    >
                      {diagnostics.issues[0].action.label}
                    </Button>
                  )}
                  <Button block icon={<WarningOutlined />} onClick={() => setIssuesOpen(true)}>
                    查看问题与记录
                  </Button>
                </Space>
              )}
            </div>
          }
          action={!isMobile ? (
            <Space>
              {diagnostics.issues[0] && diagnostics.issues[0].severity !== 'info' && (
                <Button
                  type="primary"
                  icon={<ToolOutlined />}
                  loading={optimizingIssueId === diagnostics.issues[0].id}
                  onClick={() => handleDiagnosticIssue(diagnostics.issues[0])}
                >
                  {diagnostics.issues[0].action.label}
                </Button>
              )}
              <Button icon={<WarningOutlined />} onClick={() => setIssuesOpen(true)}>
                查看问题与记录
              </Button>
            </Space>
          ) : undefined}
        />
      )}

      {myOrphans.length > 0 && (
        <Alert type="warning" showIcon style={{ marginBottom: 12 }}
          message={`发现 ${myOrphans.length} 张未归类卡片`}
          description="这些卡片对应的镜头目前不存在，相关的剧本、分镜和提示词也都没有。内容不会被删除，可以先查看，再决定是否移入归档区。"
          action={<Button size="small" danger onClick={() => setOrphanOpen(true)}>查看并归档</Button>} />
      )}

      {stats && (
        <Space size={20} style={{ marginBottom: 12 }} wrap>
          <span><Text type="secondary" style={{ fontSize: 12 }}>集数 </Text><Text strong>{stats.episodes}</Text></span>
          <span><Text type="secondary" style={{ fontSize: 12 }}>镜头数 </Text><Text strong>{stats.units}</Text></span>
          <span>
            <Text type="secondary" style={{ fontSize: 12 }}>四阶段齐全 </Text>
            <Text strong style={{ color: '#389e0d' }}>{stats.specDone}</Text>
            {stats.gaps > 0 && <Badge count={`缺项 ${stats.gaps}`} style={{ backgroundColor: '#cf1322', marginLeft: 6 }} />}
          </span>
          <span style={{ minWidth: isMobile ? 140 : 200 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>出图进度 </Text>
            <Progress percent={Math.round(100 * stats.withImg / stats.units)} size="small"
              format={() => `${stats.withImg}/${stats.units}`} style={{ width: isMobile ? 100 : 150 }}
              strokeColor={stats.withImg === 0 ? '#d9d9d9' : COLORS.iris} />
          </span>
        </Space>
      )}

      <div style={{ flex: 1, minHeight: 0, overflowX: 'auto' }}>
        <Table<MatrixRow>
          rowKey={r => `${r.project_id}-${r.episode}-${r.unit}`}
          dataSource={visible}
          columns={columns}
          size="small"
          pagination={false}
          virtual
          scroll={{ x: 1080, y: Math.max(300, window.innerHeight - (isMobile ? 400 : 340)) }}
          onRow={r => ({
            style: { cursor: 'pointer' },
            tabIndex: 0,
            onClick: () => navigate(`/production/${r.project_id}/ep/${r.episode}`),
            onKeyDown: event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate(`/production/${r.project_id}/ep/${r.episode}`);
              }
            },
          })}
          locale={{ emptyText: filter === 'gap' ? '没有缺少步骤的镜头 🎉' : filter === 'noimg' ? '所有镜头都有图 🎉' : '暂无镜头数据' }}
        />
      </div>

      <Drawer
        title="问题驱动优化"
        open={issuesOpen}
        onClose={() => setIssuesOpen(false)}
        width={isMobile ? '100%' : 680}
      >
        {diagnostics ? (
          <>
            {feedback && (
              <Alert
                type="info"
                showIcon
                message={`真实反馈 · ${feedback.projectCount} 个项目 / ${feedback.issueCount} 个待办`}
                description={(
                  <div>
                    <Paragraph style={{ margin: '4px 0 8px' }}>{feedback.summary}</Paragraph>
                    <Space size={[4, 4]} wrap>
                      {visibleFeedbackIssues.map(item => (
                        <Tooltip key={item.code} title={item.recommendation}>
                          <Tag
                            color={item.code === feedback.recommendedIssueCode ? 'processing' : 'default'}
                            role="button"
                            tabIndex={0}
                            style={{ cursor: 'pointer' }}
                            onClick={() => openFeedbackIssue(item)}
                            onKeyDown={event => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                openFeedbackIssue(item);
                              }
                            }}
                          >
                            {item.label} {item.count}
                          </Tag>
                        </Tooltip>
                      ))}
                    </Space>
                    <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                      建议：{feedback.nextActions[0]}
                      {feedback.optimization.total > 0
                        ? ` · 定向修复成功率 ${feedback.optimization.successRate}%`
                        : ' · 实际修复成功率将在首次操作后开始累计'}
                    </Text>
                  </div>
                )}
                style={{ marginBottom: 12 }}
              />
            )}
            <Alert
              type={diagnostics.state === 'complete' ? 'success' : 'info'}
              showIcon
              message={
                diagnostics.state === 'complete'
                  ? '当前交付目标已通过全部检查'
                  : `按优先级列出 ${diagnostics.issues.length} 个问题`
              }
              description="自动修复只会替换对应镜头的对应阶段；图片和视频仍需你选择模型后执行。"
              style={{ marginBottom: 12 }}
            />
            <Divider orientation="left"><WarningOutlined /> 当前项目问题</Divider>
            {issueCodeFilter && (
              <Space size={6} style={{ marginBottom: 8 }} wrap>
                <Text type="secondary" style={{ fontSize: 12 }}>当前只看</Text>
                <Tag
                  color="processing"
                  closable
                  onClose={() => setIssueCodeFilter('')}
                >
                  {issueCodeLabel}
                </Tag>
              </Space>
            )}
            <Segmented
              block
              value={issueFilter}
              onChange={value => setIssueFilter(value as IssueFilter)}
              options={[
                {
                  value: 'priority',
                  label: isMobile ? `优先 ${diagnostics.issues.length}` : `按优先级（${diagnostics.issues.length}）`,
                },
                {
                  value: 'automatic',
                  label: isMobile ? `自动 ${issueView.automaticCount}` : `可自动（${issueView.automaticCount}）`,
                },
                {
                  value: 'manual',
                  label: isMobile ? `人工 ${issueView.manualCount}` : `需人工（${issueView.manualCount}）`,
                },
              ]}
              style={{ marginBottom: 8 }}
            />
            {issueView.total > issueView.visible.length && (
              <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                当前筛选有 {issueView.total} 项，为保持页面流畅先显示前 {issueView.visible.length} 项。
              </Text>
            )}
            <List<ProjectDiagnosticIssue>
              dataSource={issueView.visible}
              rowKey={issue => issue.id}
              locale={{ emptyText: '没有待处理问题' }}
              renderItem={issue => (
                <List.Item
                  actions={issue.severity === 'info' ? [] : [
                    <Button
                      key="action"
                      size="small"
                      type={issue.autoFixable ? 'primary' : 'default'}
                      loading={optimizingIssueId === issue.id}
                      onClick={() => handleDiagnosticIssue(issue)}
                    >
                      {issue.action.label}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={(
                      <Space size={6} wrap>
                        <Tag color={
                          issue.severity === 'blocker'
                            ? 'error'
                            : issue.severity === 'warning' ? 'warning' : 'processing'
                        }>
                          {issue.severity === 'blocker'
                            ? '阻塞'
                            : issue.severity === 'warning' ? '提醒' : '进行中'}
                        </Tag>
                        <Tag>{issue.stageLabel}</Tag>
                        {issue.episode != null && <Tag>EP{String(issue.episode).padStart(2, '0')}</Tag>}
                        {issue.unit != null && <Tag>G{issue.unit}</Tag>}
                      </Space>
                    )}
                    description={(
                      <div>
                        <Paragraph style={{ margin: '4px 0' }}>{issue.message}</Paragraph>
                        {issue.details.map(detail => (
                          <Text key={detail} type="secondary" style={{ display: 'block', fontSize: 12 }}>
                            · {detail}
                          </Text>
                        ))}
                        {issue.acceptanceCriteria.length > 0 && (
                          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
                            验收：{issue.acceptanceCriteria.join('；')}
                          </Text>
                        )}
                      </div>
                    )}
                  />
                </List.Item>
              )}
            />

            <Divider orientation="left"><HistoryOutlined /> 最近优化记录</Divider>
            <List<ProjectOptimizationRun>
              size="small"
              dataSource={optimizationRuns}
              rowKey={run => run.runId}
              locale={{ emptyText: '还没有自动修复记录' }}
              renderItem={run => (
                <List.Item>
                  <List.Item.Meta
                    title={(
                      <Space size={6} wrap>
                        <Tag color={
                          run.status === 'resolved'
                            ? 'success'
                            : run.status === 'failed' ? 'error' : 'warning'
                        }>
                          {run.status === 'resolved'
                            ? '已解决'
                            : run.status === 'failed' ? '失败' : '仍需检查'}
                        </Tag>
                        <Text>{run.summary}</Text>
                      </Space>
                    )}
                    description={(
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        健康分 {run.beforeScore} → {run.afterScore}
                        {' · '}
                        {run.finishedAt.slice(0, 19).replace('T', ' ')}
                        {run.error ? ` · ${run.error}` : ''}
                      </Text>
                    )}
                  />
                </List.Item>
              )}
            />
          </>
        ) : (
          <Empty description="暂无项目诊断结果" />
        )}
      </Drawer>

      {/* 未归类卡片：先看清内容再决定归档，绝不静默移动 */}
      <Modal title={`未归类卡片（${myOrphans.length}）`} open={orphanOpen} width={isMobile ? '100%' : 720}
        onCancel={() => setOrphanOpen(false)}
        footer={[
          <Button key="c" onClick={() => setOrphanOpen(false)}>取消</Button>,
          <Popconfirm key="a" title={`归档这 ${myOrphans.length} 张卡？`}
            description="卡片内容会原样保留，可随时恢复。"
            onConfirm={() => handleArchive(myOrphans)} okText="归档" cancelText="再想想">
            <Button type="primary" loading={busy} icon={<InboxOutlined />}>全部归档</Button>
          </Popconfirm>,
        ]}>
        <List dataSource={myOrphans} rowKey={o => o.card_id}
          renderItem={o => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <Space size={6} wrap>
                  <Tag color="blue">EP{String(o.episode).padStart(2, '0')}</Tag>
                  <Tag color="red">镜头 {o.shot_number}（当前不存在）</Tag>
                  <Tag>{o.stage}</Tag>
                  <Text strong style={{ fontSize: 13 }}>{o.title}</Text>
                </Space>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    该集实际只有镜头 {o.episode_units.join('、')} —— 可能是编号错位或该镜头尚未写完
                  </Text>
                </div>
                <Paragraph type="secondary" ellipsis={{ rows: 2 }}
                  style={{ fontSize: 11, margin: '6px 0 0', background: '#fafafa', padding: 8, borderRadius: 6 }}>
                  {o.content}
                </Paragraph>
              </div>
            </List.Item>
          )} />
      </Modal>

      {/* 归档区：永不删除，一卡一文件存在 data/production/<pid>/archive/ */}
      <Drawer title={`归档区 · ${projects.find(p => p.project_id === pid)?.name || ''}`}
        open={archiveOpen} onClose={() => setArchiveOpen(false)} width={isMobile ? '100%' : 560}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          归档不是删除。卡片内容会原样保留，之后可随时恢复。
        </Text>
        {archiveLoading ? (
          <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
            <Text type="secondary" style={{ display: 'block', marginTop: 10 }}>正在加载归档内容…</Text>
          </div>
        ) : archiveError ? (
          <Alert
            role="alert"
            type="error"
            showIcon
            message="归档内容加载失败"
            description={archiveError}
            action={<Button size="small" onClick={refreshArchive}>重试</Button>}
            style={{ marginTop: 12 }}
          />
        ) : (
          <List style={{ marginTop: 12 }} dataSource={archived} rowKey={a => a.card_id}
            locale={{ emptyText: '归档区是空的' }}
            renderItem={a => (
              <List.Item actions={[
                <Button key="r" size="small" icon={<UndoOutlined />} loading={busy}
                  onClick={() => handleRestore(a.card_id)}>恢复</Button>,
              ]}>
                <List.Item.Meta
                  title={<Space size={6} wrap>
                    {a.episode != null && <Tag color="blue">EP{String(a.episode).padStart(2, '0')}</Tag>}
                    <Tag color="red">镜头 {a.shot_number}</Tag>
                    <Text strong style={{ fontSize: 13 }}>{a.title}</Text>
                  </Space>}
                  description={<>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {a.archived_at.slice(0, 19).replace('T', ' ')} · {a.archive_reason}
                    </Text>
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }}
                      style={{ fontSize: 11, margin: '6px 0 0' }}>{a.content}</Paragraph>
                  </>} />
              </List.Item>
            )} />
        )}
      </Drawer>
    </main>
  );
}
