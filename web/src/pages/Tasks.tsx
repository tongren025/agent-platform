import { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Button, Tag, Space, message, Empty, Spin, Input,
  Drawer, Typography, Descriptions, Statistic, Row, Col,
} from 'antd';
import { ThunderboltOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { api } from '../api';

const { Text } = Typography;

interface TaskInfo {
  job_id: string;
  status: string;
  result: any;
  enqueue_time: string | null;
}

function statusTag(s: string) {
  switch (s) {
    case 'queued': return <Tag color="default">排队中</Tag>;
    case 'in_progress': return <Tag color="processing">执行中</Tag>;
    case 'complete': return <Tag color="success">已完成</Tag>;
    case 'not_found': return <Tag color="default">未找到</Tag>;
    default: return <Tag>{s}</Tag>;
  }
}

export default function Tasks() {
  const [jobId, setJobId] = useState('');
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<TaskInfo | null>(null);

  const lookupTask = useCallback(async () => {
    if (!jobId.trim()) { message.warning('请输入 Job ID'); return; }
    setLoading(true);
    try {
      const info = await api.getTaskStatus(jobId.trim());
      setTasks(prev => {
        const exists = prev.find(t => t.job_id === info.job_id);
        if (exists) return prev.map(t => t.job_id === info.job_id ? info : t);
        return [info, ...prev];
      });
      message.success(`任务 ${info.job_id} 状态: ${info.status}`);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const refreshAll = useCallback(async () => {
    if (tasks.length === 0) return;
    setLoading(true);
    try {
      const updated = await Promise.all(
        tasks.map(t => api.getTaskStatus(t.job_id).catch(() => t))
      );
      setTasks(updated);
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  }, [tasks]);

  const columns = [
    { title: 'Job ID', dataIndex: 'job_id', width: 260,
      render: (v: string) => <Text copyable style={{ fontSize: 12 }}>{v}</Text> },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => statusTag(s) },
    { title: '入队时间', dataIndex: 'enqueue_time', width: 180,
      render: (v: string | null) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    { title: '结果', key: 'result', width: 120,
      render: (_: any, r: TaskInfo) => {
        if (r.status !== 'complete') return <Text type="secondary">—</Text>;
        const ok = r.result?.success;
        return ok ? <Tag color="success">成功</Tag> : <Tag color="error">失败</Tag>;
      }},
    { title: '操作', key: 'action', width: 72,
      render: (_: any, r: TaskInfo) => <Button type="link" size="small" onClick={() => setDetail(r)}>详情</Button> },
  ];

  const queuedCount = tasks.filter(t => t.status === 'queued').length;
  const runningCount = tasks.filter(t => t.status === 'in_progress').length;
  const doneCount = tasks.filter(t => t.status === 'complete').length;

  return (
    <div>
      <Card
        title={<span><ThunderboltOutlined /> 异步任务队列</span>}
        extra={
          <Space>
            <Input
              placeholder="输入 Job ID 查询"
              value={jobId}
              onChange={e => setJobId(e.target.value)}
              onPressEnter={lookupTask}
              style={{ width: 280 }}
              suffix={<SearchOutlined style={{ cursor: 'pointer', color: '#999' }} onClick={lookupTask} />}
            />
            <Button icon={<ReloadOutlined />} onClick={refreshAll} disabled={tasks.length === 0}>
              刷新全部
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16, color: '#888', fontSize: 13 }}>
          通过 <code>POST /tasks/agent-run</code> 入队的长任务在独立 worker 执行，这里查看执行状态。
          输入入队时返回的 Job ID 即可追踪。
        </div>

        {tasks.length > 0 && (
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}><Card size="small"><Statistic title="排队中" value={queuedCount} /></Card></Col>
            <Col span={8}><Card size="small"><Statistic title="执行中" value={runningCount}
              valueStyle={{ color: runningCount > 0 ? '#1677ff' : undefined }} /></Card></Col>
            <Col span={8}><Card size="small"><Statistic title="已完成" value={doneCount}
              valueStyle={{ color: '#52c41a' }} /></Card></Col>
          </Row>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin /><div style={{ marginTop: 10, color: '#64748b', fontSize: 13 }}>查询中...</div>
          </div>
        ) : tasks.length === 0 ? (
          <Empty description="输入 Job ID 查询任务状态，或通过 API 入队新任务" />
        ) : (
          <Table
            dataSource={tasks}
            columns={columns as any}
            rowKey="job_id"
            size="small"
            pagination={false}
          />
        )}
      </Card>

      <Drawer
        title={detail ? `任务详情 · ${detail.job_id}` : '任务详情'}
        open={!!detail}
        onClose={() => setDetail(null)}
        width={640}
      >
        {detail && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Job ID">{detail.job_id}</Descriptions.Item>
              <Descriptions.Item label="状态">{statusTag(detail.status)}</Descriptions.Item>
              <Descriptions.Item label="入队时间">
                {detail.enqueue_time ? new Date(detail.enqueue_time).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
            </Descriptions>

            {detail.status === 'complete' && detail.result && (
              <Card size="small" title="执行结果" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="成功">
                    {detail.result.success ? <Tag color="success">是</Tag> : <Tag color="error">否</Tag>}
                  </Descriptions.Item>
                  {detail.result.elapsed_ms != null && (
                    <Descriptions.Item label="耗时">
                      {(detail.result.elapsed_ms / 1000).toFixed(1)}s
                    </Descriptions.Item>
                  )}
                  {detail.result.session_id && (
                    <Descriptions.Item label="会话 ID" span={2}>
                      <Text copyable>{detail.result.session_id}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
                {detail.result.assistant_message && (
                  <div style={{ marginTop: 12 }}>
                    <Text strong>回复：</Text>
                    <div style={{
                      marginTop: 6, padding: 12, borderRadius: 8,
                      background: '#f6f8fa', fontSize: 13, whiteSpace: 'pre-wrap',
                      maxHeight: 400, overflow: 'auto',
                    }}>
                      {detail.result.assistant_message}
                    </div>
                  </div>
                )}
                {detail.result.error && (
                  <div style={{ marginTop: 12 }}>
                    <Text type="danger">错误：{detail.result.error}</Text>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
