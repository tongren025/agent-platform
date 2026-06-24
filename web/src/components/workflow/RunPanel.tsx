import { useEffect, useState } from 'react';
import {
  Drawer, Form, Input, Button, Tag, Typography, Collapse, Empty, Spin, message, Tabs, Space,
} from 'antd';
import { PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { api } from '../../api';
import { COLORS } from '../../theme';
import TraceList from '../TraceList';
import type { WorkflowDefinition, WorkflowRun } from '../../types';

const { TextArea } = Input;
const { Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
  running: COLORS.iris, success: '#22c55e', failed: COLORS.rose, skipped: '#94a3b8', pending: '#cbd5e1', timeout: '#f59e0b',
};
const STATUS_TEXT: Record<string, string> = {
  running: '运行中', success: '成功', failed: '失败', skipped: '跳过', pending: '待运行', timeout: '超时',
};

export default function RunPanel({ open, workflow, onClose }: {
  open: boolean; workflow: WorkflowDefinition | null; onClose: () => void;
}) {
  const [form] = Form.useForm();
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [history, setHistory] = useState<WorkflowRun[]>([]);
  const [tab, setTab] = useState('run');

  const startNode = workflow?.nodes.find((n) => n.type === 'start');
  const inputs: any[] = startNode?.config?.inputs || [];

  useEffect(() => { if (open && workflow) loadHistory(); }, [open, workflow?.workflowKey]); // eslint-disable-line

  const loadHistory = async () => {
    if (!workflow) return;
    try { setHistory(await api.listWorkflowRuns(workflow.workflowKey)); } catch { /* ignore */ }
  };

  const handleRun = async () => {
    if (!workflow) return;
    const vals = await form.validateFields().catch(() => null);
    if (vals === null) return;
    setRunning(true);
    setRun(null);
    try {
      const r = await api.runWorkflow(workflow.workflowKey, vals || {});
      setRun(r);
      if (r.status === 'failed') message.error(r.error || '工作流运行失败');
      else if (r.status === 'success') message.success('运行完成');
      loadHistory();
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setRunning(false);
    }
  };

  const renderRun = (r: WorkflowRun) => (
    <div>
      <Space style={{ marginBottom: 12 }} wrap>
        <Tag color={STATUS_COLOR[r.status]}>{STATUS_TEXT[r.status] || r.status}</Tag>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Token：{r.totalPromptTokens}+{r.totalCompletionTokens}={r.totalPromptTokens + r.totalCompletionTokens}
        </Text>
      </Space>
      {r.error && <div style={{ color: COLORS.rose, fontSize: 12, marginBottom: 10 }}>{r.error}</div>}

      <div style={{ position: 'relative' }}>
        {r.steps.map((s, i) => (
          <div key={s.nodeKey} style={{ display: 'flex', gap: 10, paddingBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: STATUS_COLOR[s.status], flexShrink: 0, marginTop: 4 }} />
              {i < r.steps.length - 1 && <div style={{ width: 2, flex: 1, background: '#eef0f6', marginTop: 2 }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Space size={6}>
                <Text strong style={{ fontSize: 13 }}>{s.nodeKey}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{s.type}</Text>
                <Tag color={STATUS_COLOR[s.status]} style={{ fontSize: 10, lineHeight: '16px', padding: '0 5px' }}>
                  {STATUS_TEXT[s.status] || s.status}
                </Tag>
              </Space>
              {s.error && <div style={{ color: COLORS.rose, fontSize: 12, marginTop: 2 }}>{s.error}</div>}
              {s.output != null && s.output !== '' && (
                <div style={{
                  fontSize: 12, color: '#334155', marginTop: 4, background: '#f8f9fc',
                  padding: '6px 10px', borderRadius: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  maxHeight: 160, overflow: 'auto',
                }}>
                  {s.output}
                </div>
              )}
              {s.traces && s.traces.length > 0 && (
                <div style={{ marginTop: 6 }}><TraceList traces={s.traces} /></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {r.finalOutput != null && (
        <div style={{ marginTop: 8, padding: 12, borderRadius: 10, background: `${COLORS.iris}08`, border: `1px solid ${COLORS.iris}20` }}>
          <Text strong style={{ fontSize: 12, color: COLORS.iris }}>最终输出</Text>
          <div style={{ fontSize: 13, color: '#1e293b', marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {r.finalOutput}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Drawer open={open} onClose={onClose} width={540} title={`运行 · ${workflow?.name || ''}`}>
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: 'run', label: '运行',
            children: (
              <>
                <Form form={form} layout="vertical">
                  {inputs.length === 0 ? (
                    <Text type="secondary" style={{ fontSize: 12 }}>该工作流的 start 节点没有声明输入字段，直接运行即可。</Text>
                  ) : inputs.map((inp) => (
                    <Form.Item
                      key={inp.name} name={inp.name} label={inp.label || inp.name}
                      rules={inp.required ? [{ required: true, message: `请输入 ${inp.label || inp.name}` }] : []}
                    >
                      <TextArea autoSize={{ minRows: 1, maxRows: 4 }} placeholder={`{{start.${inp.name}}}`} />
                    </Form.Item>
                  ))}
                </Form>
                <Button type="primary" icon={<PlayCircleOutlined />} loading={running} onClick={handleRun} block style={{ marginTop: 8 }}>
                  {running ? '运行中…' : '运行工作流'}
                </Button>
                <div style={{ marginTop: 18 }}>
                  {running && !run ? (
                    <div style={{ textAlign: 'center', padding: 30 }}><Spin /> <Text type="secondary">编排执行中…</Text></div>
                  ) : run ? renderRun(run) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="填好输入后点运行" />
                  )}
                </div>
              </>
            ),
          },
          {
            key: 'history', label: `历史 (${history.length})`,
            children: (
              <>
                <Button size="small" icon={<ReloadOutlined />} onClick={loadHistory} style={{ marginBottom: 12 }}>刷新</Button>
                {history.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无运行记录" /> : (
                  <Collapse
                    accordion
                    items={history.map((h) => ({
                      key: h.runId,
                      label: (
                        <Space size={8}>
                          <Tag color={STATUS_COLOR[h.status]} style={{ margin: 0 }}>{STATUS_TEXT[h.status] || h.status}</Tag>
                          <Text style={{ fontSize: 12 }}>{new Date(h.startedAt).toLocaleString('zh-CN')}</Text>
                        </Space>
                      ),
                      children: renderRun(h),
                    }))}
                  />
                )}
              </>
            ),
          },
        ]}
      />
    </Drawer>
  );
}
