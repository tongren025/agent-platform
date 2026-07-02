import { useEffect, useState, useCallback } from 'react';
import {
  Card, Select, Table, Button, Tag, Space, message, Progress,
  Statistic, Row, Col, Empty, Spin, Drawer, Typography, Descriptions,
} from 'antd';
import { ReloadOutlined, HistoryOutlined } from '@ant-design/icons';
import { api } from '../api';
import type { AgentRunRecord } from '../types';

const { Text, Paragraph } = Typography;

interface Employee { employeeKey: string; name: string }
interface QuotaInfo { month: string; employee_key: string; tokens_used: number }

function statusTag(r: AgentRunRecord) {
  if (r.pendingApproval) return <Tag color="warning">待审批</Tag>;
  return r.success ? <Tag color="success">成功</Tag> : <Tag color="error">失败</Tag>;
}

export default function Runs() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [runs, setRuns] = useState<AgentRunRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [empFilter, setEmpFilter] = useState<string>('');
  const [successFilter, setSuccessFilter] = useState<string>('');   // '' | 'true' | 'false'
  const [detail, setDetail] = useState<AgentRunRecord | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);

  useEffect(() => {
    api.listEmployees().then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => {
    if (empFilter) {
      api.getQuota(empFilter).then(setQuota).catch(() => setQuota(null));
    } else {
      setQuota(null);
    }
  }, [empFilter]);

  const empName = useCallback(
    (key: string) => employees.find(e => e.employeeKey === key)?.name || key,
    [employees],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listRuns({
        employeeKey: empFilter || undefined,
        success: successFilter === '' ? undefined : successFilter === 'true',
        limit: 200,
      });
      setRuns(data);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [empFilter, successFilter]);

  useEffect(() => { refresh(); }, [refresh]);

  const total = runs.length;
  const okCount = runs.filter(r => r.success).length;
  const successRate = total ? Math.round((okCount / total) * 100) : 0;
  const totalTokens = runs.reduce((s, r) => s + (r.totalTokens || 0), 0);
  const hasCost = runs.some(r => r.costUsd != null);
  const totalCost = runs.reduce((s, r) => s + (r.costUsd || 0), 0);

  const columns = [
    { title: '时间', dataIndex: 'createdAt', width: 165,
      render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    { title: '员工', dataIndex: 'employeeKey', width: 130, render: (k: string) => empName(k) },
    { title: '模型', dataIndex: 'model', width: 130, render: (v: string) => v || '-' },
    { title: '状态', dataIndex: 'success', width: 90, render: (_: boolean, r: AgentRunRecord) => statusTag(r) },
    { title: '迭代', dataIndex: 'iterations', width: 64 },
    { title: 'Tokens', key: 'tokens', width: 150,
      render: (_: any, r: AgentRunRecord) => (
        <Text type="secondary" style={{ fontSize: 12 }}>{r.promptTokens}+{r.completionTokens}={r.totalTokens}</Text>
      ) },
    { title: '成本', dataIndex: 'costUsd', width: 90,
      render: (v: number | null) => v == null ? <Text type="secondary">—</Text> : `$${v.toFixed(4)}` },
    { title: '耗时', dataIndex: 'elapsedMilliseconds', width: 80,
      render: (v: number) => v ? `${(v / 1000).toFixed(1)}s` : '-' },
    { title: '操作', key: 'action', width: 72,
      render: (_: any, r: AgentRunRecord) => <Button type="link" size="small" onClick={() => setDetail(r)}>详情</Button> },
  ];

  const traceColumns = [
    { title: '轮', dataIndex: 'iteration', width: 48 },
    { title: '工具', dataIndex: 'toolName', width: 160 },
    { title: '成败', dataIndex: 'success', width: 68,
      render: (ok: boolean) => ok ? <Tag color="success">ok</Tag> : <Tag color="error">err</Tag> },
    { title: '耗时', dataIndex: 'elapsedMilliseconds', width: 80,
      render: (v: number) => v != null ? `${v}ms` : '-' },
  ];

  return (
    <div>
      <Card
        title={<span><HistoryOutlined /> 运行记录（可观测）</span>}
        extra={
          <Space>
            <Select
              style={{ width: 200 }}
              placeholder="全部员工"
              allowClear
              value={empFilter || undefined}
              onChange={v => setEmpFilter(v || '')}
              options={employees.map(e => ({ value: e.employeeKey, label: e.name || e.employeeKey }))}
            />
            <Select
              style={{ width: 120 }}
              value={successFilter}
              onChange={setSuccessFilter}
              options={[
                { value: '', label: '全部状态' },
                { value: 'true', label: '仅成功' },
                { value: 'false', label: '仅失败' },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={refresh}>刷新</Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16, color: '#888', fontSize: 13 }}>
          每次 agent 运行都会落一条记录——事后审计成本、token、走了哪条工具链、为什么失败。
        </div>

        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}><Card size="small"><Statistic title="运行数" value={total} /></Card></Col>
          <Col span={6}><Card size="small"><Statistic title="成功率" value={successRate} suffix="%"
            valueStyle={{ color: successRate >= 90 ? '#52c41a' : successRate >= 60 ? '#fa8c16' : '#f5222d' }} /></Card></Col>
          <Col span={6}><Card size="small"><Statistic title="Token 合计" value={totalTokens} /></Card></Col>
          <Col span={6}><Card size="small">
            {hasCost
              ? <Statistic title="成本合计" value={totalCost} precision={4} prefix="$" />
              : <Statistic title="成本合计" value="未配价目" valueStyle={{ fontSize: 16, color: '#999' }} />}
          </Card></Col>
        </Row>

        {quota && (
          <Card size="small" style={{ marginBottom: 20 }}>
            <Row align="middle" gutter={16}>
              <Col flex="auto">
                <Text strong>{empName(quota.employee_key)}</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  {quota.month} 月度 token 用量：{quota.tokens_used.toLocaleString()}
                </Text>
              </Col>
            </Row>
          </Card>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin /><div style={{ marginTop: 10, color: '#64748b', fontSize: 13 }}>加载中...</div>
          </div>
        ) : total === 0 ? (
          <Empty description="还没有运行记录——跑一次数字员工就会出现" />
        ) : (
          <Table
            dataSource={runs}
            columns={columns as any}
            rowKey="runId"
            size="small"
            pagination={{ pageSize: 20, showSizeChanger: false }}
          />
        )}
      </Card>

      <Drawer
        title={detail ? `运行详情 · ${empName(detail.employeeKey)}` : '运行详情'}
        open={!!detail}
        onClose={() => setDetail(null)}
        width={720}
      >
        {detail && (
          <>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Run ID" span={2}>{detail.runId}</Descriptions.Item>
              <Descriptions.Item label="会话">{detail.sessionId || '-'}</Descriptions.Item>
              <Descriptions.Item label="模型">{detail.model || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">{statusTag(detail)}</Descriptions.Item>
              <Descriptions.Item label="迭代">{detail.iterations}</Descriptions.Item>
              <Descriptions.Item label="Tokens">{detail.promptTokens}+{detail.completionTokens}={detail.totalTokens}</Descriptions.Item>
              <Descriptions.Item label="成本">{detail.costUsd == null ? '—' : `$${detail.costUsd.toFixed(4)}`}</Descriptions.Item>
              <Descriptions.Item label="耗时">{(detail.elapsedMilliseconds / 1000).toFixed(1)}s</Descriptions.Item>
              <Descriptions.Item label="时间">{new Date(detail.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
            </Descriptions>

            {detail.errorMessage && (
              <Paragraph style={{ marginBottom: 16 }}>
                <Text type="danger">错误：{detail.errorMessage}</Text>
              </Paragraph>
            )}

            <div style={{ marginBottom: 8, fontWeight: 600 }}>工具调用链（{detail.traces.length}）</div>
            {detail.traces.length === 0 ? (
              <Empty description="本次运行没有工具调用" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                dataSource={detail.traces.map((t, i) => ({ ...t, _k: i }))}
                columns={traceColumns as any}
                rowKey="_k"
                size="small"
                pagination={false}
                expandable={{
                  expandedRowRender: (t: any) => (
                    <div style={{ fontSize: 12 }}>
                      <div style={{ marginBottom: 6 }}>
                        <Text strong>参数：</Text>
                        <Text style={{ wordBreak: 'break-all' }}>{t.arguments || '-'}</Text>
                      </div>
                      <div>
                        <Text strong>结果：</Text>
                        <Text style={{ wordBreak: 'break-all' }}>{t.result || '-'}</Text>
                      </div>
                    </div>
                  ),
                }}
              />
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
