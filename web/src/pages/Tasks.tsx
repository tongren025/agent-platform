// 任务中心：自动列出当前用户任务并刷新状态，保留 Job ID 查询作为兼容入口。
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Descriptions, Drawer, Empty, Input, Popconfirm, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { CloseCircleOutlined, RedoOutlined, ReloadOutlined, SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { api, type TaskInfo } from '../api';
import { message } from '../ui';

const { Text, Title } = Typography;
const ACTIVE = new Set(['queued', 'in_progress', 'deferred']);

function statusTag(status: string, result?: any) {
  if (status === 'queued' || status === 'deferred') return <Tag>排队中</Tag>;
  if (status === 'in_progress') return <Tag color="processing">执行中</Tag>;
  if (status === 'cancelled' || status === 'aborted') return <Tag>已取消</Tag>;
  if (status === 'complete') return result?.success === false ? <Tag color="error">失败</Tag> : <Tag color="success">已完成</Tag>;
  return <Tag>{status}</Tag>;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [jobId, setJobId] = useState('');
  const [detail, setDetail] = useState<TaskInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState('');

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try { setTasks(await api.listTasks()); setError(''); }
    catch (e: any) { setError(e.message || '任务列表加载失败'); }
    finally { if (!quiet) setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!tasks.some(t => ACTIVE.has(t.status))) return;
    const timer = window.setInterval(() => load(true), 5000);
    return () => window.clearInterval(timer);
  }, [tasks, load]);

  const lookup = async () => {
    if (!jobId.trim()) return;
    try {
      const task = await api.getTaskStatus(jobId.trim());
      setTasks(prev => [task, ...prev.filter(t => t.job_id !== task.job_id)]);
      setJobId('');
    } catch (e: any) { message.error(e.message); }
  };

  const cancel = async (task: TaskInfo) => {
    setActing(task.job_id);
    try { await api.cancelTask(task.job_id); message.success('已请求取消任务'); await load(true); }
    catch (e: any) { message.error(e.message); }
    finally { setActing(''); }
  };

  const retry = async (task: TaskInfo) => {
    setActing(task.job_id);
    try { await api.retryTask(task.job_id); message.success('已重新入队'); await load(true); }
    catch (e: any) { message.error(e.message); }
    finally { setActing(''); }
  };

  const stats = useMemo(() => ({
    queued: tasks.filter(t => ['queued', 'deferred'].includes(t.status)).length,
    running: tasks.filter(t => t.status === 'in_progress').length,
    failed: tasks.filter(t => t.status === 'complete' && t.result?.success === false).length,
    done: tasks.filter(t => t.status === 'complete' && t.result?.success !== false).length,
  }), [tasks]);

  const columns = [
    { title: '任务', key: 'task', render: (_: any, task: TaskInfo) => <div>
      <Text strong>{task.user_input ? task.user_input.slice(0, 60) : task.employee_key || 'Agent 任务'}</Text>
      <div><Text type="secondary" copyable style={{ fontSize: 11 }}>{task.job_id}</Text></div>
    </div> },
    { title: '员工', dataIndex: 'employee_key', width: 170, render: (v: string) => v || '—' },
    { title: '状态', width: 100, render: (_: any, task: TaskInfo) => statusTag(task.status, task.result) },
    { title: '入队时间', dataIndex: 'enqueue_time', width: 180, render: (v: string | null) => v ? new Date(v).toLocaleString('zh-CN') : '—' },
    { title: '操作', width: 210, render: (_: any, task: TaskInfo) => <Space>
      <Button type="link" size="small" onClick={() => setDetail(task)}>详情</Button>
      {ACTIVE.has(task.status) && <Popconfirm title="取消这个任务？" onConfirm={() => cancel(task)}><Button type="link" danger size="small" loading={acting === task.job_id} icon={<CloseCircleOutlined />}>取消</Button></Popconfirm>}
      {task.status === 'complete' && task.result?.success === false && <Button type="link" size="small" loading={acting === task.job_id} icon={<RedoOutlined />} onClick={() => retry(task)}>重试</Button>}
    </Space> },
  ];

  return <div style={{ maxWidth: 1280, margin: '0 auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
      <div><Title level={3} style={{ margin: 0 }}><ThunderboltOutlined /> 任务中心</Title><Text type="secondary">自动追踪当前账号提交的后台任务，每 5 秒刷新进行中任务。</Text></div>
      <Space>
        <Input value={jobId} onChange={e => setJobId(e.target.value)} onPressEnter={lookup} placeholder="兼容查询 Job ID" suffix={<SearchOutlined onClick={lookup} />} style={{ width: 250 }} />
        <Button icon={<ReloadOutlined />} loading={loading} onClick={() => load()}>刷新</Button>
      </Space>
    </div>

    {error && <Alert type="error" showIcon message="任务队列暂时不可用" description={error} action={<Button size="small" onClick={() => load()}>重试</Button>} style={{ marginBottom: 18 }} />}
    <Row gutter={16} style={{ marginBottom: 18 }}>
      <Col span={6}><Card><Statistic title="排队中" value={stats.queued} /></Card></Col>
      <Col span={6}><Card><Statistic title="执行中" value={stats.running} valueStyle={stats.running ? { color: '#1677ff' } : undefined} /></Card></Col>
      <Col span={6}><Card><Statistic title="已完成" value={stats.done} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      <Col span={6}><Card><Statistic title="失败" value={stats.failed} valueStyle={stats.failed ? { color: '#cf1322' } : undefined} /></Card></Col>
    </Row>
    <Card>
      {!loading && tasks.length === 0 ? <Empty description="当前账号还没有后台任务" /> : <Table rowKey="job_id" loading={loading} dataSource={tasks} columns={columns as any} pagination={{ pageSize: 20, hideOnSinglePage: true }} />}
    </Card>

    <Drawer title="任务详情" open={!!detail} onClose={() => setDetail(null)} width={680}>
      {detail && <>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Job ID"><Text copyable>{detail.job_id}</Text></Descriptions.Item>
          <Descriptions.Item label="状态">{statusTag(detail.status, detail.result)}</Descriptions.Item>
          <Descriptions.Item label="员工">{detail.employee_key || '—'}</Descriptions.Item>
          <Descriptions.Item label="任务内容">{detail.user_input || '—'}</Descriptions.Item>
          <Descriptions.Item label="入队时间">{detail.enqueue_time ? new Date(detail.enqueue_time).toLocaleString('zh-CN') : '—'}</Descriptions.Item>
        </Descriptions>
        {detail.result && <Card size="small" title="执行结果" style={{ marginTop: 16 }}>
          {detail.result.error && <Alert type="error" showIcon message="执行失败" description={detail.result.error} />}
          {detail.result.assistant_message && <div style={{ whiteSpace: 'pre-wrap', maxHeight: 440, overflow: 'auto' }}>{detail.result.assistant_message}</div>}
        </Card>}
      </>}
    </Drawer>
  </div>;
}
