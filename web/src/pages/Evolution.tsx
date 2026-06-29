import { useCallback, useEffect, useState } from 'react';
import {
  Button, Card, Collapse, Descriptions, Empty, message, Progress,
  Select, Space, Spin, Statistic, Table, Tag, Typography,
} from 'antd';
import {
  CheckOutlined, CloseOutlined, ExperimentOutlined,
  RiseOutlined, ThunderboltOutlined, ToolOutlined,
  BulbOutlined, EditOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { COLORS } from '../theme';

const { Text, Paragraph } = Typography;

const TYPE_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  prompt_improve: { color: COLORS.iris, label: '提示词优化', icon: <EditOutlined /> },
  new_rule:       { color: COLORS.mint, label: '新行为规则', icon: <BulbOutlined /> },
  skill_suggest:  { color: '#f59e0b',   label: '技能建议',   icon: <ThunderboltOutlined /> },
  tool_suggest:   { color: '#8b5cf6',   label: '工具建议',   icon: <ToolOutlined /> },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending:  { color: 'processing', label: '待审核' },
  accepted: { color: 'success',    label: '已采纳' },
  rejected: { color: 'default',    label: '已拒绝' },
};

interface Employee { employeeKey: string; name: string }

export default function Evolution() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empKey, setEmpKey] = useState('');
  const [insights, setInsights] = useState<any[]>([]);
  const [runLogs, setRunLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    api.listEmployees().then((list: any[]) => {
      const emps = list.map((e: any) => ({ employeeKey: e.employeeKey, name: e.name || e.employeeKey }));
      setEmployees(emps);
      if (emps.length > 0) setEmpKey(emps[0].employeeKey);
    }).catch(() => {});
  }, []);

  const loadData = useCallback(async (key: string) => {
    if (!key) return;
    setLoading(true);
    try {
      const [ins, logs] = await Promise.all([
        api.listInsights(key),
        api.evolutionRunLogs(key),
      ]);
      setInsights(ins);
      setRunLogs(logs);
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (empKey) loadData(empKey); }, [empKey, loadData]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const log = await api.triggerEvolution(empKey);
      message.success(`分析完成，生成 ${log.insightsGenerated} 条建议`);
      await loadData(empKey);
    } catch (e: any) {
      message.error(e.message || '分析失败');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAccept = async (insightId: string) => {
    try {
      await api.acceptInsight(empKey, insightId);
      message.success('已采纳');
      await loadData(empKey);
    } catch (e: any) { message.error(e.message); }
  };

  const handleReject = async (insightId: string) => {
    try {
      await api.rejectInsight(empKey, insightId);
      message.info('已拒绝');
      await loadData(empKey);
    } catch (e: any) { message.error(e.message); }
  };

  const pending = insights.filter(i => i.status === 'pending');
  const resolved = insights.filter(i => i.status !== 'pending');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            <RiseOutlined style={{ marginRight: 8, color: COLORS.iris }} />
            自我进化
          </div>
          <div style={{ color: COLORS.slate, fontSize: 13, marginTop: 2 }}>
            自动审视对话历史，生成改进建议——提示词优化、行为规则、技能与工具推荐
          </div>
        </div>
        <Space>
          <Select
            value={empKey || undefined}
            onChange={setEmpKey}
            placeholder="选择员工"
            style={{ width: 200 }}
            options={employees.map(e => ({ value: e.employeeKey, label: e.name }))}
          />
          <Button
            type="primary"
            icon={<ExperimentOutlined />}
            loading={analyzing}
            onClick={handleAnalyze}
            disabled={!empKey}
          >
            立即分析
          </Button>
        </Space>
      </div>

      {loading ? (
        <Spin size="large" style={{ display: 'block', padding: 80, textAlign: 'center' }} />
      ) : !empKey ? (
        <Empty description="请先选择一个数字员工" style={{ padding: 80 }} />
      ) : (
        <>
          {/* 统计卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <Card size="small" style={{ borderRadius: 12 }}>
              <Statistic title="待审核" value={pending.length} valueStyle={{ color: COLORS.iris }} />
            </Card>
            <Card size="small" style={{ borderRadius: 12 }}>
              <Statistic title="已采纳" value={insights.filter(i => i.status === 'accepted').length} valueStyle={{ color: COLORS.mint }} />
            </Card>
            <Card size="small" style={{ borderRadius: 12 }}>
              <Statistic title="已拒绝" value={insights.filter(i => i.status === 'rejected').length} valueStyle={{ color: COLORS.slate }} />
            </Card>
            <Card size="small" style={{ borderRadius: 12 }}>
              <Statistic title="分析次数" value={runLogs.length} valueStyle={{ color: '#8b5cf6' }} />
            </Card>
          </div>

          {/* 待审核建议 */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ fontSize: 16, marginBottom: 12, display: 'block' }}>
                待审核建议 ({pending.length})
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map((ins: any) => {
                  const cfg = TYPE_CONFIG[ins.type] || TYPE_CONFIG.prompt_improve;
                  return (
                    <Card key={ins.insightId} size="small" style={{ borderRadius: 12, borderLeft: `3px solid ${cfg.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <Space style={{ marginBottom: 8 }}>
                            <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>
                            <Text strong>{ins.title}</Text>
                          </Space>
                          <Paragraph style={{ margin: '8px 0', color: COLORS.slate }}>
                            {ins.content}
                          </Paragraph>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              理由：{ins.rationale}
                            </Text>
                            <Progress
                              percent={Math.round(ins.confidence * 100)}
                              size="small"
                              style={{ width: 100 }}
                              strokeColor={cfg.color}
                              format={p => `${p}%`}
                            />
                          </div>
                        </div>
                        <Space style={{ marginLeft: 16 }}>
                          <Button type="primary" icon={<CheckOutlined />} size="small"
                            onClick={() => handleAccept(ins.insightId)} style={{ background: COLORS.mint, borderColor: COLORS.mint }}>
                            采纳
                          </Button>
                          <Button icon={<CloseOutlined />} size="small"
                            onClick={() => handleReject(ins.insightId)}>
                            拒绝
                          </Button>
                        </Space>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 已处理 & 运行日志 */}
          <Collapse
            ghost
            items={[
              {
                key: 'resolved',
                label: `已处理建议 (${resolved.length})`,
                children: resolved.length > 0 ? (
                  <Table
                    dataSource={resolved}
                    rowKey="insightId"
                    size="small"
                    pagination={{ pageSize: 10 }}
                    columns={[
                      {
                        title: '类型', dataIndex: 'type', width: 120,
                        render: (t: string) => {
                          const cfg = TYPE_CONFIG[t] || TYPE_CONFIG.prompt_improve;
                          return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
                        },
                      },
                      { title: '标题', dataIndex: 'title' },
                      {
                        title: '状态', dataIndex: 'status', width: 90,
                        render: (s: string) => {
                          const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.pending;
                          return <Tag color={cfg.color}>{cfg.label}</Tag>;
                        },
                      },
                      {
                        title: '置信度', dataIndex: 'confidence', width: 100,
                        render: (v: number) => <Progress percent={Math.round(v * 100)} size="small" />,
                      },
                      {
                        title: '处理时间', dataIndex: 'resolvedAt', width: 160,
                        render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-',
                      },
                    ]}
                  />
                ) : <Empty description="暂无已处理的建议" />,
              },
              {
                key: 'logs',
                label: `运行日志 (${runLogs.length})`,
                children: runLogs.length > 0 ? (
                  <Table
                    dataSource={[...runLogs].reverse()}
                    rowKey="logId"
                    size="small"
                    pagination={{ pageSize: 10 }}
                    columns={[
                      {
                        title: '时间', dataIndex: 'ranAt', width: 160,
                        render: (v: string) => new Date(v).toLocaleString('zh-CN'),
                      },
                      { title: '分析对话数', dataIndex: 'sessionsAnalyzed', width: 100 },
                      { title: '生成建议数', dataIndex: 'insightsGenerated', width: 100 },
                      { title: '模型', dataIndex: 'llmModel', width: 150 },
                      {
                        title: '耗时', dataIndex: 'durationMs', width: 80,
                        render: (v: number) => `${(v / 1000).toFixed(1)}s`,
                      },
                      {
                        title: '状态', dataIndex: 'error', width: 80,
                        render: (v: string | null) => v
                          ? <Tag color="error">失败</Tag>
                          : <Tag color="success">成功</Tag>,
                      },
                    ]}
                  />
                ) : <Empty description="暂无运行记录" />,
              },
            ]}
          />
        </>
      )}
    </div>
  );
}
