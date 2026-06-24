import { useEffect, useState } from 'react';
import {
  Button, Modal, Form, Input, message, Empty, Spin, Tag, Popconfirm, Space, Typography,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, ReloadOutlined, ApartmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { COLORS } from '../theme';
import RunPanel from '../components/workflow/RunPanel';
import type { WorkflowDefinition } from '../types';

const { Text } = Typography;

export default function Workflows() {
  const [list, setList] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();
  const [runWf, setRunWf] = useState<WorkflowDefinition | null>(null);
  const navigate = useNavigate();

  const fetchAll = async () => {
    setLoading(true);
    try { setList(await api.listWorkflows()); }
    catch (e: any) { message.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    try {
      const v = await form.validateFields();
      const def = {
        workflowKey: v.workflowKey, name: v.name, description: v.description || null,
        enabled: true,
        nodes: [
          { nodeKey: 'start', type: 'start', name: '开始', position: { x: 80, y: 160 }, config: { inputs: [{ name: 'input', label: '输入' }] } },
          { nodeKey: 'end', type: 'end', name: '结束', position: { x: 600, y: 160 }, config: { outputTemplate: '' } },
        ],
        edges: [],
      };
      await api.saveWorkflow(def);
      message.success('工作流已创建');
      setCreateOpen(false);
      navigate(`/workflows/${encodeURIComponent(v.workflowKey)}/edit`);
    } catch (e: any) { if (e.message) message.error(e.message); }
  };

  const handleDelete = async (key: string) => {
    try { await api.deleteWorkflow(key); message.success('已删除'); fetchAll(); }
    catch (e: any) { message.error(e.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#1e293b' }}>工作流编排</h1>
          <Text type="secondary">把多个数字员工编排成可视化流程（DIFY 式节点图）</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAll}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setCreateOpen(true); }}>新建工作流</Button>
        </Space>
      </div>

      {loading ? (
        <Spin size="large" style={{ display: 'block', marginTop: 100, textAlign: 'center' }} />
      ) : list.length === 0 ? (
        <Empty description="还没有工作流，点右上角新建" style={{ marginTop: 80 }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {list.map((wf) => (
            <div key={wf.workflowKey} style={{ background: '#fff', border: '1px solid #eef0f6', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: `${COLORS.iris}12`, color: COLORS.iris,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>
                  <ApartmentOutlined />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wf.name}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{wf.workflowKey}</Text>
                </div>
              </div>
              <div style={{ fontSize: 12, color: COLORS.slate, minHeight: 32, marginBottom: 12 }}>
                {wf.description || '—'}
              </div>
              <Space size={6} style={{ marginBottom: 14 }} wrap>
                <Tag style={{ background: '#f8f9fc', border: '1px solid #eef0f6', color: COLORS.slateDark }}>{wf.nodes.length} 节点</Tag>
                <Tag style={{ background: '#f8f9fc', border: '1px solid #eef0f6', color: COLORS.slateDark }}>{wf.edges.length} 连线</Tag>
                {wf.validationError ? <Tag color="orange">草稿</Tag> : <Tag color="green">可运行</Tag>}
              </Space>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => navigate(`/workflows/${encodeURIComponent(wf.workflowKey)}/edit`)}>编辑</Button>
                <Button size="small" icon={<PlayCircleOutlined />} disabled={!!wf.validationError} onClick={() => setRunWf(wf)}>运行</Button>
                <Popconfirm title="确认删除该工作流及其运行记录？" onConfirm={() => handleDelete(wf.workflowKey)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal title="新建工作流" open={createOpen} onOk={handleCreate} onCancel={() => setCreateOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item label="标识 (workflowKey)" name="workflowKey" rules={[{ required: true, message: '请输入唯一标识' }, { pattern: /^[\w-]+$/, message: '只允许字母数字 _ -' }]}>
            <Input placeholder="如 comic-pipeline" />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如 漫剧创作流水线" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={2} placeholder="这个工作流做什么" />
          </Form.Item>
        </Form>
      </Modal>

      <RunPanel open={!!runWf} workflow={runWf} onClose={() => setRunWf(null)} />
    </div>
  );
}
