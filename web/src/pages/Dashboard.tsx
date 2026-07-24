// 总览页：以“继续制作、当前阻塞、下一步行动”为核心，而非罗列系统资源数量。
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Empty, Progress, Result, Row, Skeleton, Space, Statistic, Tag, Tooltip, Typography } from 'antd';
import {
  ArrowRightOutlined, CheckCircleOutlined, CloudSyncOutlined, ExclamationCircleOutlined,
  MessageOutlined, PlusOutlined, PushpinFilled, PushpinOutlined, ReloadOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import { api, type TaskInfo } from '../api';
import { COLORS } from '../theme';
import { hasPerm } from '../userAuth';

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

  if (loading) return <div style={{ maxWidth: 1280 }} role="status" aria-live="polite" aria-label="正在加载今日工作">
    <Skeleton active paragraph={{ rows: 12 }} />
  </div>;
  if (error) return <Result status="error" title="总览暂时无法加载" subTitle={error}
    extra={<Button type="primary" icon={<ReloadOutlined />} onClick={load}>重新加载</Button>} />;

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto' }} aria-labelledby="dashboard-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Text type="secondary">创作工作台</Text>
          <Title id="dashboard-title" level={2} style={{ margin: '4px 0 6px' }}>今天继续把故事做完</Title>
          <Text type="secondary">从最重要的项目开始，下一步已经替你整理好了。</Text>
        </div>
        <Space>
          {canUseWorkbench && <Button icon={<MessageOutlined />} onClick={() => navigate('/workbench')}>找数字员工</Button>}
          {canManageProduction && <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/studio')}>快速开始</Button>}
        </Space>
      </div>

      {actionError && <Alert role="alert" showIcon closable message={actionError}
        onClose={() => setActionError('')} style={{ marginBottom: 16 }} />}

      {primary ? (
        <Card style={{ borderRadius: 18, marginBottom: 22, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.45fr 1fr' }}>
            <div style={{ padding: isMobile ? '20px 16px' : '30px 34px', background: 'linear-gradient(135deg, #312e81, #6366f1)', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <Text style={{ color: 'rgba(255,255,255,.78)' }}>{primaryLabel}</Text>
                {canManageProduction && <Tooltip title={primary.pinned ? '取消置顶' : '置顶到今日工作'}>
                  <Button
                    type="text"
                    icon={primary.pinned ? <PushpinFilled /> : <PushpinOutlined />}
                    aria-label={`${primary.pinned ? '取消置顶' : '置顶'}项目：${primary.name}`}
                    aria-pressed={Boolean(primary.pinned)}
                    loading={pinningIds.has(primary.project_id)}
                    onClick={() => togglePin(primary)}
                    style={{ color: '#fff', minWidth: 32, minHeight: 32 }}
                  />
                </Tooltip>}
              </div>
              <Title level={3} style={{ color: '#fff', margin: '8px 0 4px' }}>{primary.name}</Title>
              <div style={{ color: 'rgba(255,255,255,.72)', marginBottom: 24 }}>{primary.description || '暂无项目简介'}</div>
              {primary.production_goal && <Tag color="geekblue" style={{ marginBottom: 18 }}>
                {GOAL_LABELS[primary.production_goal]}
              </Tag>}
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 18, flexWrap: 'wrap' }}>
                <Progress type="circle" percent={readiness.overall_progress} size={78}
                  strokeColor="#a7f3d0" trailColor="rgba(255,255,255,.15)" format={p => <span style={{ color: '#fff' }}>{p}%</span>} />
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>下一步</div>
                  <div style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 12px' }}>{humanizeNextAction(readiness.next_action)}</div>
                  <Button onClick={() => navigate(`/studio?project=${encodeURIComponent(primary.project_id)}`)}>继续制作 <ArrowRightOutlined /></Button>
                </div>
              </div>
            </div>
            <div style={{ padding: isMobile ? '20px 16px' : '28px 30px' }}>
              <Title level={5} style={{ marginTop: 0 }}>交付就绪度</Title>
              {[
                ['规格齐全', readiness.spec_ready, readiness.units, '#6366f1'],
                ['已出图', readiness.with_image, readiness.units, '#10b981'],
                ['已成视频', readiness.with_video, readiness.units, '#f59e0b'],
                ['已交付', readiness.delivered, readiness.units, '#ef4444'],
              ].map(([label, value, total, color]) => <div key={String(label)} style={{ marginTop: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><Text>{label}</Text><Text type="secondary">{value}/{total}</Text></div>
                <Progress percent={Number(total) ? Math.round(Number(value) / Number(total) * 100) : 0} showInfo={false} strokeColor={String(color)} size="small" />
              </div>)}
            </div>
          </div>
        </Card>
      ) : canManageProduction ? (
        <Card title="三步做出第 1 集" style={{ marginBottom: 22 }}>
          <Empty image={<img src="/empty-create.svg" alt="" width={160} />} description="还没有制作项目">
            <ol style={{ textAlign: 'left', maxWidth: 360, margin: '18px auto 22px', paddingLeft: 24, lineHeight: 2 }}>
              <li>
                <Text strong>先选择这次要做到哪一步</Text>
                <div><Text type="secondary">文字分镜、镜头图片或完整成片</Text></div>
              </li>
              <li>粘贴故事素材，让导演员工生成分镜</li>
              <li>按推荐步骤推进到目标并确认交付</li>
            </ol>
            <Button type="primary" onClick={() => navigate('/studio')}>开始并选择目标</Button>
          </Empty>
        </Card>
      ) : <Card style={{ marginBottom: 22 }}>
        <Result
          status="info"
          title="当前账号没有制作权限"
          subTitle="你仍可查看今日工作；如需创建或进入制作项目，请联系管理员调整角色。"
        />
      </Card>}

      {(canManageProduction && totalBlockers > 0 || failedTasks.length > 0) && <Alert role="status" aria-live="polite" showIcon type="warning" style={{ marginBottom: 22 }}
        message="有事项需要处理"
        description={`${canManageProduction && totalBlockers ? `${totalBlockers} 个镜头的制作信息不完整。` : ''}${failedTasks.length ? ` ${failedTasks.length} 个后台任务执行失败。` : ''}`}
        action={<Space>{blockedProject && <Button size="small" onClick={() => navigate(`/production/${blockedProject.project_id}/matrix`)}>检查缺失环节</Button>}{failedTasks.length > 0 && <Button size="small" onClick={() => navigate('/tasks')}>查看任务</Button>}</Space>} />}

      <Row gutter={18}>
        {canManageProduction && <Col xs={24} md={16}>
          <Card title={<span><VideoCameraOutlined /> 重点项目</span>} extra={hasPerm('production:manage') && <Button type="link" onClick={() => navigate('/production')}>查看全部</Button>}>
            {sortedProjects.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : sortedProjects.slice(0, 4).map(p => {
              const r = p.stats?.readiness;
              return <div key={p.project_id} style={{
                borderBottom: '1px solid #f0f0f5', padding: '8px 0',
                display: 'grid', gridTemplateColumns: '1fr 40px', gap: 4, alignItems: 'center',
              }}>
                <button type="button" onClick={() => navigate(`/production/${p.project_id}`)} style={{
                  width: '100%', border: 0, background: 'transparent', padding: '6px 4px',
                  display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 220px 24px',
                  gap: isMobile ? 8 : 16, alignItems: 'center', textAlign: 'left', cursor: 'pointer',
                }}>
                  <div>
                    <Text strong>{p.name}</Text>
                    {p.production_goal && <Tag bordered={false} style={{ marginInlineStart: 8 }}>{GOAL_LABELS[p.production_goal].replace('目标：', '')}</Tag>}
                    <div><Text type="secondary" style={{ fontSize: 12 }}>{humanizeNextAction(r?.next_action)}</Text></div>
                  </div>
                  <Progress percent={r?.overall_progress || 0} size="small" strokeColor={COLORS.iris}
                    aria-label={`${p.name} 完成度 ${r?.overall_progress || 0}%`} />
                  {!isMobile && <ArrowRightOutlined aria-hidden style={{ color: COLORS.slate }} />}
                </button>
                <Tooltip title={p.pinned ? '取消置顶' : '置顶'}>
                  <Button
                    type="text"
                    icon={p.pinned ? <PushpinFilled /> : <PushpinOutlined />}
                    aria-label={`${p.pinned ? '取消置顶' : '置顶'}项目：${p.name}`}
                    aria-pressed={Boolean(p.pinned)}
                    loading={pinningIds.has(p.project_id)}
                    onClick={() => togglePin(p)}
                    style={{ minWidth: 32, minHeight: 32 }}
                  />
                </Tooltip>
              </div>;
            })}
          </Card>
        </Col>}
        {canUseWorkbench && <Col xs={24} md={canManageProduction ? 8 : 24}>
          <Card title={<span><CloudSyncOutlined /> 后台任务</span>} aria-live="polite"
            extra={<Button type="link" onClick={() => navigate('/tasks')}>任务中心</Button>}>
            <Row gutter={12}>
              <Col span={12}><Statistic title="进行中" value={runningTasks.length} prefix={<CloudSyncOutlined />} /></Col>
              <Col span={12}><Statistic title="失败" value={failedTasks.length} valueStyle={failedTasks.length ? { color: COLORS.rose } : undefined} prefix={failedTasks.length ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />} /></Col>
            </Row>
            <div style={{ marginTop: 22 }}>
              {tasksUnavailable ? <Alert
                showIcon
                type="info"
                message="任务状态暂时无法获取"
                description="项目制作不受影响，可以稍后重试。"
                action={<Button size="small" onClick={load}>重试</Button>}
              /> : runningTasks.length ? runningTasks.slice(0, 3).map(t => <div key={t.job_id} style={{ marginBottom: 10 }}>
                <Text ellipsis style={{ maxWidth: '100%' }}>{t.user_input || t.employee_key || t.job_id}</Text><br /><Tag color="processing">{t.status === 'queued' ? '排队中' : '执行中'}</Tag>
              </div>) : <Text type="secondary">当前没有正在执行的任务</Text>}
            </div>
          </Card>
        </Col>}
      </Row>
    </main>
  );
}
