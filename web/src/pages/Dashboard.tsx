// 总览页：以“继续制作、当前阻塞、下一步行动”为核心，而非罗列系统资源数量。
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Empty, Progress, Result, Row, Skeleton, Space, Statistic, Tag, Typography } from 'antd';
import {
  ArrowRightOutlined, CheckCircleOutlined, CloudSyncOutlined, ExclamationCircleOutlined,
  MessageOutlined, PlusOutlined, ReloadOutlined, VideoCameraOutlined,
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
  episode_count?: number; aspect_ratio?: string; stats?: { readiness?: Readiness };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const projectData = await api.listProjects();
      setProjects(projectData);
      // Redis/worker 是可选依赖；任务摘要异步补齐，不能拖住制作首页。
      if (hasPerm('workbench:use')) api.listTasks(20).then(setTasks).catch(() => setTasks([]));
    } catch (e: any) {
      setError(e.message || '总览加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sortedProjects = useMemo(() => [...projects].sort((a, b) =>
    new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()), [projects]);
  const primary = sortedProjects[0];
  const readiness = primary?.stats?.readiness;
  const runningTasks = tasks.filter(t => ['queued', 'in_progress', 'deferred'].includes(t.status));
  const failedTasks = tasks.filter(t => t.status === 'complete' && t.result && !t.result.success);
  const totalBlockers = projects.reduce((sum, p) => sum + (p.stats?.readiness?.blockers || 0), 0);

  if (loading) return <div style={{ maxWidth: 1280 }}><Skeleton active paragraph={{ rows: 12 }} /></div>;
  if (error) return <Result status="error" title="总览暂时无法加载" subTitle={error}
    extra={<Button type="primary" icon={<ReloadOutlined />} onClick={load}>重新加载</Button>} />;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Text type="secondary">创作工作台</Text>
          <Title level={2} style={{ margin: '4px 0 6px' }}>今天继续把故事做完</Title>
          <Text type="secondary">这里聚合最近项目、生产阻塞和后台任务。</Text>
        </div>
        <Space>
          {hasPerm('workbench:use') && <Button icon={<MessageOutlined />} onClick={() => navigate('/workbench')}>找数字员工</Button>}
          {hasPerm('production:manage') && <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/production')}>进入制作</Button>}
        </Space>
      </div>

      {primary && readiness ? (
        <Card style={{ borderRadius: 18, marginBottom: 22, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.45fr 1fr' }}>
            <div style={{ padding: isMobile ? '20px 16px' : '30px 34px', background: 'linear-gradient(135deg, #312e81, #6366f1)', color: '#fff' }}>
              <Text style={{ color: 'rgba(255,255,255,.68)' }}>继续最近项目</Text>
              <Title level={3} style={{ color: '#fff', margin: '8px 0 4px' }}>{primary.name}</Title>
              <div style={{ color: 'rgba(255,255,255,.72)', marginBottom: 24 }}>{primary.description || '暂无项目简介'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 18, flexWrap: 'wrap' }}>
                <Progress type="circle" percent={readiness.overall_progress} size={78}
                  strokeColor="#a7f3d0" trailColor="rgba(255,255,255,.15)" format={p => <span style={{ color: '#fff' }}>{p}%</span>} />
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>下一步</div>
                  <div style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 12px' }}>{readiness.next_action}</div>
                  <Button onClick={() => navigate(`/production/${primary.project_id}`)}>继续项目 <ArrowRightOutlined /></Button>
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
      ) : hasPerm('production:manage') ? (
        <Card style={{ marginBottom: 22 }}><Empty description="还没有制作项目">
          <Button type="primary" onClick={() => navigate('/production')}>创建第一个项目</Button>
        </Empty></Card>
      ) : null}

      {(totalBlockers > 0 || failedTasks.length > 0) && <Alert showIcon type="warning" style={{ marginBottom: 22 }}
        message="有事项需要处理"
        description={`${totalBlockers ? `${totalBlockers} 个生产单元存在断链。` : ''}${failedTasks.length ? ` ${failedTasks.length} 个后台任务执行失败。` : ''}`}
        action={<Space>{totalBlockers > 0 && <Button size="small" onClick={() => navigate('/production/matrix')}>查看断链</Button>}{failedTasks.length > 0 && <Button size="small" onClick={() => navigate('/tasks')}>查看任务</Button>}</Space>} />}

      <Row gutter={18}>
        <Col xs={24} md={16}>
          <Card title={<span><VideoCameraOutlined /> 最近项目</span>} extra={hasPerm('production:manage') && <Button type="link" onClick={() => navigate('/production')}>查看全部</Button>}>
            {sortedProjects.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : sortedProjects.slice(0, 4).map(p => {
              const r = p.stats?.readiness;
              return <button key={p.project_id} type="button" onClick={() => navigate(`/production/${p.project_id}`)} style={{
                width: '100%', border: 0, borderBottom: '1px solid #f0f0f5', background: 'transparent', padding: '14px 4px',
                display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 240px 32px', gap: isMobile ? 8 : 16, alignItems: 'center', textAlign: 'left', cursor: 'pointer',
              }}>
                <div><Text strong>{p.name}</Text><div><Text type="secondary" style={{ fontSize: 12 }}>{r?.next_action || '等待生产计划'}</Text></div></div>
                <Progress percent={r?.overall_progress || 0} size="small" strokeColor={COLORS.iris} />
                <ArrowRightOutlined style={{ color: COLORS.slate }} />
              </button>;
            })}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title={<span><CloudSyncOutlined /> 后台任务</span>} extra={hasPerm('workbench:use') && <Button type="link" onClick={() => navigate('/tasks')}>任务中心</Button>}>
            <Row gutter={12}>
              <Col span={12}><Statistic title="进行中" value={runningTasks.length} prefix={<CloudSyncOutlined />} /></Col>
              <Col span={12}><Statistic title="失败" value={failedTasks.length} valueStyle={failedTasks.length ? { color: COLORS.rose } : undefined} prefix={failedTasks.length ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />} /></Col>
            </Row>
            <div style={{ marginTop: 22 }}>
              {runningTasks.length ? runningTasks.slice(0, 3).map(t => <div key={t.job_id} style={{ marginBottom: 10 }}>
                <Text ellipsis style={{ maxWidth: '100%' }}>{t.user_input || t.employee_key || t.job_id}</Text><br /><Tag color="processing">{t.status === 'queued' ? '排队中' : '执行中'}</Tag>
              </div>) : <Text type="secondary">当前没有正在执行的任务</Text>}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
