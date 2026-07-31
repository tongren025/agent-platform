// 总览页：以“继续制作、当前阻塞、下一步行动”为核心，而非罗列系统资源数量。
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Empty, Progress, Result, Skeleton, Space, Tag, Tooltip, Typography } from 'antd';
import {
  ArrowRightOutlined, CheckCircleOutlined, CloudSyncOutlined, ExclamationCircleOutlined,
  MessageOutlined, PlusOutlined, PushpinFilled, PushpinOutlined, ReloadOutlined, VideoCameraOutlined,
  CalendarOutlined, ThunderboltOutlined, AppstoreOutlined, AimOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import { api, type TaskInfo } from '../api';
import { COLORS } from '../theme';
import { hasPerm } from '../userAuth';
import HelpHint from '../components/HelpHint';
import './Dashboard.css';

const { Text, Title } = Typography;

interface Readiness {
  units: number; spec_ready: number; with_image: number; with_video: number; delivered: number;
  blockers: number; overall_progress: number; next_action: string;
}

interface ProjectSummary {
  project_id: string; name: string; description: string; updated_at: string; cardCount: number;
  episode_count?: number; aspect_ratio?: string; production_goal?: 'storyboard' | 'images' | 'final';
  pinned?: boolean; stats?: { readiness?: Readiness };
}

const EMPTY_READINESS: Readiness = {
  units: 0, spec_ready: 0, with_image: 0, with_video: 0, delivered: 0,
  blockers: 0, overall_progress: 0, next_action: '补充项目素材',
};

const GOAL_LABELS: Record<NonNullable<ProjectSummary['production_goal']>, string> = {
  storyboard: '目标：完成文字分镜',
  images: '目标：生成镜头图片',
  final: '目标：完成整集成片',
};

function humanizeNextAction(action?: string) {
  if (!action) return '等待制作计划';
  return action
    .replace(/修复\s*(\d+)\s*个断链单元/g, '补齐 $1 个镜头的制作信息')
    .replace(/G\s*(?:生成)?单元/g, '镜头')
    .replace(/断链单元/g, '制作信息不完整的镜头')
    .replace(/生产单元/g, '镜头');
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const canManageProduction = hasPerm('production:manage');
  const canUseWorkbench = hasPerm('workbench:use');
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [tasksUnavailable, setTasksUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pinningIds, setPinningIds] = useState<Set<string>>(() => new Set());
  const pinningIdsRef = useRef(new Set<string>());

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (canManageProduction) {
        const projectData = await api.listProjects();
        setProjects(projectData);
      } else {
        setProjects([]);
      }
      // Redis/worker 是可选依赖；任务摘要异步补齐，不能拖住制作首页。
      if (canUseWorkbench) {
        api.listTasks(20)
          .then(data => { setTasks(data); setTasksUnavailable(false); })
          .catch(() => { setTasks([]); setTasksUnavailable(true); });
      }
    } catch (e: any) {
      setError(e.message || '总览加载失败');
    } finally {
      setLoading(false);
    }
  }, [canManageProduction, canUseWorkbench]);

  useEffect(() => { load(); }, [load]);

  const sortedProjects = useMemo(() => [...projects].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    const blockerDiff = (b.stats?.readiness?.blockers || 0) - (a.stats?.readiness?.blockers || 0);
    if (blockerDiff) return blockerDiff;
    return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
  }), [projects]);
  const primary = sortedProjects[0];
  const readiness = primary?.stats?.readiness || EMPTY_READINESS;
  const blockedProject = sortedProjects.find(project => (project.stats?.readiness?.blockers || 0) > 0);
  const runningTasks = tasks.filter(t => ['queued', 'in_progress', 'deferred'].includes(t.status));
  const failedTasks = tasks.filter(t => t.status === 'complete' && t.result && !t.result.success);
  const totalBlockers = projects.reduce((sum, p) => sum + (p.stats?.readiness?.blockers || 0), 0);
  const totalDelivered = projects.reduce((sum, p) => sum + (p.stats?.readiness?.delivered || 0), 0);
  const todayLabel = new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());
  const primaryLabel = primary?.pinned
    ? '团队置顶项目'
    : (primary?.stats?.readiness?.blockers || 0) > 0
      ? '优先处理：存在缺失环节'
      : '继续最近项目';

  const togglePin = async (project: ProjectSummary) => {
    if (pinningIdsRef.current.has(project.project_id)) return;
    const nextPinned = !project.pinned;
    setActionError('');
    pinningIdsRef.current.add(project.project_id);
    setPinningIds(current => new Set(current).add(project.project_id));
    setProjects(current => current.map(item => item.project_id === project.project_id
      ? { ...item, pinned: nextPinned }
      : item));
    try {
      const updated = await api.updateProject(project.project_id, { pinned: nextPinned });
      if (updated.pinned !== nextPinned) {
        throw new Error('项目置顶服务暂未就绪，请稍后重试');
      }
    } catch (e: any) {
      setProjects(current => current.map(item => item.project_id === project.project_id
        ? { ...item, pinned: project.pinned }
        : item));
      setActionError(e.message || '置顶状态保存失败，请重试');
    } finally {
      pinningIdsRef.current.delete(project.project_id);
      setPinningIds(current => {
        const next = new Set(current);
        next.delete(project.project_id);
        return next;
      });
    }
  };

  if (loading) return <div className="today-page today-loading" role="status" aria-live="polite" aria-label="正在加载今日制作">
    <Skeleton active paragraph={{ rows: 12 }} />
  </div>;
  if (error) return <Result status="error" title="总览暂时无法加载" subTitle={error}
    extra={<Button type="primary" icon={<ReloadOutlined />} onClick={load}>重新加载</Button>} />;

  return (
    <main className="today-page" aria-labelledby="dashboard-title">
      <header className="today-header">
        <div className="today-title-lockup">
          <span className="today-kicker">CREATIVE OPERATIONS</span>
          <div className="today-title-row">
            <Title id="dashboard-title" level={1}>今日制作</Title>
            <HelpHint
              title="今日制作是什么？"
              content="系统把最需要继续的项目、当前风险和唯一下一步集中到这里。新手通常只需要点击“继续制作”。"
            />
          </div>
          <p>把最重要的故事继续推向交付，下一步已经为你排好。</p>
        </div>
        <div className="today-header-side">
          <span className="today-date"><CalendarOutlined /> {todayLabel}</span>
          <div className="today-header-actions">
            {canUseWorkbench && <Button className="today-ghost-button" icon={<MessageOutlined />} onClick={() => navigate('/workbench')}>召唤员工</Button>}
            {canManageProduction && <Button className="today-create-button" type="primary" icon={<PlusOutlined />} onClick={() => navigate('/studio')}>开始新制作</Button>}
          </div>
        </div>
      </header>

      {actionError && <Alert role="alert" showIcon closable message={actionError}
        onClose={() => setActionError('')} className="today-alert" />}

      {primary ? (
        <section className="today-hero" aria-labelledby="today-primary-project">
          <div className="today-hero-grid" aria-hidden="true" />
          <div className="today-project-focus">
            <div className="today-focus-topline">
              <span className="today-live-label"><i /> {primaryLabel}</span>
              <div className="today-focus-tools">
                <span>{primary.aspect_ratio || '16:9'}</span>
                <span>{primary.episode_count || 1} 集</span>
                {canManageProduction && <Tooltip title={primary.pinned ? '取消置顶' : '置顶到今日工作'}>
                  <Button
                    type="text"
                    icon={primary.pinned ? <PushpinFilled /> : <PushpinOutlined />}
                    aria-label={`${primary.pinned ? '取消置顶' : '置顶'}项目：${primary.name}`}
                    aria-pressed={Boolean(primary.pinned)}
                    loading={pinningIds.has(primary.project_id)}
                    onClick={() => togglePin(primary)}
                    className="today-pin-button"
                  />
                </Tooltip>}
              </div>
            </div>
            <div className="today-project-number" aria-hidden="true">01</div>
            <Title id="today-primary-project" level={2}>{primary.name}</Title>
            <p className="today-project-description">{primary.description || '继续完善这个故事，从当前进度推进到可交付成片。'}</p>
            <div className="today-project-tags">
              {primary.production_goal && <span className="today-goal-chip"><AimOutlined /> {GOAL_LABELS[primary.production_goal]}</span>}
              {readiness.blockers > 0 && <span className="today-warning-chip"><ExclamationCircleOutlined /> {readiness.blockers} 项待处理</span>}
            </div>

            <div className="today-next-step">
              <div className="today-progress-orbit">
                <Progress
                  type="circle"
                  percent={readiness.overall_progress}
                  size={isMobile ? 76 : 88}
                  strokeWidth={5}
                  strokeColor={{ '0%': '#a48466', '100%': '#718070' }}
                  trailColor="rgba(255,255,255,.1)"
                  format={percent => <span>{percent}<small>%</small></span>}
                  aria-label={`${primary.name} 完成度 ${readiness.overall_progress}%`}
                />
              </div>
              <div className="today-next-copy">
                <span>
                  系统推荐下一步
                  <HelpHint
                    tone="dark"
                    title="为什么推荐这一步？"
                    content="系统根据剧本、人物、场景、分镜、图片和视频的真实完成情况，选择当前最早缺失的生产环节。"
                  />
                </span>
                <strong>{humanizeNextAction(readiness.next_action)}</strong>
                <p>从这里继续，不需要重新寻找上次做到哪里。</p>
              </div>
              <Button
                className="today-continue-button"
                type="primary"
                onClick={() => navigate(`/studio?project=${encodeURIComponent(primary.project_id)}`)}
              >
                继续制作 <ArrowRightOutlined />
              </Button>
            </div>
          </div>

          <aside className="today-readiness" aria-label="当前项目交付就绪度">
            <div className="today-readiness-heading">
              <div>
                <span className="today-panel-kicker">DELIVERY RADAR</span>
                <strong>
                  交付就绪度
                  <HelpHint
                    tone="dark"
                    title="交付就绪度怎么算？"
                    content="按镜头检查制作规格、镜头图片、镜头视频和最终确认。它表示完成程度，不代表模型画面质量评分。"
                  />
                </strong>
              </div>
              <span className="today-readiness-score">{readiness.overall_progress}<small>%</small></span>
            </div>
            <div className="today-readiness-list">
              {[
                { key: 'spec', label: '规格齐全', value: readiness.spec_ready, total: readiness.units, color: '#9a7b55' },
                { key: 'image', label: '镜头出图', value: readiness.with_image, total: readiness.units, color: '#7a6551' },
                { key: 'video', label: '镜头视频', value: readiness.with_video, total: readiness.units, color: '#718070' },
                { key: 'delivery', label: '确认交付', value: readiness.delivered, total: readiness.units, color: '#647c68' },
              ].map(metric => {
                const percent = metric.total ? Math.round(metric.value / metric.total * 100) : 0;
                return <div key={metric.key} className="today-readiness-item">
                  <div>
                    <span><i style={{ background: metric.color }} />{metric.label}</span>
                    <strong>{metric.value}<small> / {metric.total}</small></strong>
                  </div>
                  <Progress
                    percent={percent}
                    showInfo={false}
                    strokeColor={metric.color}
                    trailColor="rgba(148,163,184,.16)"
                    size="small"
                    aria-label={`${metric.label} ${metric.value}/${metric.total}`}
                  />
                </div>;
              })}
            </div>
            <div className="today-readiness-foot">
              <span><VideoCameraOutlined /> {readiness.units} 个制作镜头</span>
              <span className={readiness.blockers ? 'has-risk' : ''}>
                {readiness.blockers ? `${readiness.blockers} 项风险` : '链路正常'}
              </span>
            </div>
          </aside>
        </section>
      ) : canManageProduction ? (
        <section className="today-empty-hero">
          <div className="today-empty-art" aria-hidden="true"><PlusOutlined /></div>
          <div>
            <span className="today-kicker">YOUR FIRST PRODUCTION</span>
            <Title level={2}>从一句创意，开始第一部作品</Title>
            <p>选择交付目标，数字员工会带你完成剧本、分镜、镜头图片和视频。</p>
          </div>
          <ol className="today-empty-steps">
            <li><span>01</span><div><strong>选择目标</strong><small>文字分镜、镜头图片或完整成片</small></div></li>
            <li><span>02</span><div><strong>交给员工</strong><small>粘贴素材，由导演员工拆解制作</small></div></li>
            <li><span>03</span><div><strong>逐步交付</strong><small>按推荐步骤确认每一个关键结果</small></div></li>
          </ol>
          <Button className="today-create-button" type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate('/studio')}>开始第一部作品</Button>
        </section>
      ) : <Card className="today-permission-card">
        <Result
          status="info"
          title="当前账号没有制作权限"
          subTitle="你仍可查看今日工作；如需创建或进入制作项目，请联系管理员调整角色。"
        />
      </Card>}

      <section className="today-stat-strip" aria-label="制作概况">
        <div><span className="today-stat-icon is-violet"><AppstoreOutlined /></span><p><small>制作项目</small><strong>{projects.length}</strong><em>个项目</em></p></div>
        <div><span className="today-stat-icon is-blue"><CloudSyncOutlined /></span><p><small>正在运行</small><strong>{runningTasks.length}</strong><em>项任务</em></p></div>
        <div><span className={`today-stat-icon ${totalBlockers ? 'is-amber' : 'is-green'}`}><ExclamationCircleOutlined /></span><p><small>制作风险</small><strong>{totalBlockers}</strong><em>项待处理</em></p></div>
        <div><span className="today-stat-icon is-green"><CheckCircleOutlined /></span><p><small>累计交付</small><strong>{totalDelivered}</strong><em>个镜头</em></p></div>
      </section>

      {(canManageProduction && totalBlockers > 0 || failedTasks.length > 0) && <div className="today-attention" role="status" aria-live="polite">
        <span className="today-attention-icon"><ExclamationCircleOutlined /></span>
        <div>
          <strong>有事项需要你确认</strong>
          <p>{`${canManageProduction && totalBlockers ? `${totalBlockers} 个镜头的制作信息不完整。` : ''}${failedTasks.length ? ` ${failedTasks.length} 个后台任务执行失败。` : ''}`}</p>
        </div>
        <Space wrap>
          {blockedProject && <Button onClick={() => navigate(`/production/${blockedProject.project_id}/matrix`)}>检查缺失环节</Button>}
          {failedTasks.length > 0 && <Button onClick={() => navigate('/tasks')}>查看任务</Button>}
        </Space>
      </div>}

      <section className={`today-lower-grid ${!canManageProduction ? 'is-single' : ''}`}>
        {canManageProduction && <div className="today-panel today-project-panel">
          <div className="today-panel-heading">
            <div><span className="today-panel-kicker">ACTIVE PRODUCTIONS</span><Title level={3}>重点项目</Title></div>
            <Button type="text" onClick={() => navigate('/production')}>查看全部 <ArrowRightOutlined /></Button>
          </div>
          <div className="today-project-list">
            {sortedProjects.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : sortedProjects.slice(0, 4).map((project, index) => {
              const projectReadiness = project.stats?.readiness;
              const progress = projectReadiness?.overall_progress || 0;
              return <article key={project.project_id} className="today-project-row">
                <button type="button" className="today-project-open" onClick={() => navigate(`/production/${project.project_id}`)}>
                  <span className="today-row-index">{String(index + 1).padStart(2, '0')}</span>
                  <div className="today-row-copy">
                    <div>
                      <strong>{project.name}</strong>
                      {project.production_goal && <Tag bordered={false}>{GOAL_LABELS[project.production_goal].replace('目标：', '')}</Tag>}
                    </div>
                    <span>{humanizeNextAction(projectReadiness?.next_action)}</span>
                  </div>
                  <div className="today-row-progress">
                    <span>{progress}%</span>
                    <Progress percent={progress} showInfo={false} strokeColor={COLORS.iris} trailColor="#edf0f7" size="small" aria-label={`${project.name} 完成度 ${progress}%`} />
                  </div>
                  {!isMobile && <ArrowRightOutlined className="today-row-arrow" aria-hidden />}
                </button>
                <Tooltip title={project.pinned ? '取消置顶' : '置顶'}>
                  <Button
                    className="today-row-pin"
                    type="text"
                    icon={project.pinned ? <PushpinFilled /> : <PushpinOutlined />}
                    aria-label={`${project.pinned ? '取消置顶' : '置顶'}项目：${project.name}`}
                    aria-pressed={Boolean(project.pinned)}
                    loading={pinningIds.has(project.project_id)}
                    onClick={() => togglePin(project)}
                  />
                </Tooltip>
              </article>;
            })}
          </div>
        </div>}

        {canUseWorkbench && <aside className="today-panel today-task-panel" aria-live="polite">
          <div className="today-panel-heading">
            <div><span className="today-panel-kicker">AGENT ACTIVITY</span><Title level={3}>员工任务</Title></div>
            <Button type="text" onClick={() => navigate('/tasks')}>任务中心</Button>
          </div>
          <div className="today-task-summary">
            <div><span className="is-running"><CloudSyncOutlined /></span><p><small>进行中</small><strong>{runningTasks.length}</strong></p></div>
            <div><span className={failedTasks.length ? 'is-failed' : 'is-ok'}>{failedTasks.length ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}</span><p><small>需处理</small><strong>{failedTasks.length}</strong></p></div>
          </div>
          <div className="today-task-feed">
            {tasksUnavailable ? <Alert
              showIcon
              type="info"
              message="任务状态暂时无法获取"
              description="项目制作不受影响，可以稍后重试。"
              action={<Button size="small" onClick={load}>重试</Button>}
            /> : runningTasks.length ? runningTasks.slice(0, 3).map(task => <div key={task.job_id} className="today-task-item">
              <span className="today-task-pulse" />
              <div><Text ellipsis>{task.user_input || task.employee_key || task.job_id}</Text><small>{task.status === 'queued' ? '正在排队' : '员工处理中'}</small></div>
              <Tag bordered={false}>{task.status === 'queued' ? '排队' : '运行'}</Tag>
            </div>) : <div className="today-task-empty">
              <span><ThunderboltOutlined /></span>
              <strong>当前队列空闲</strong>
              <p>新的员工任务会实时出现在这里。</p>
            </div>}
          </div>
        </aside>}
      </section>
    </main>
  );
}
