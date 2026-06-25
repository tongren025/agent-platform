import { useEffect, useState, useCallback } from 'react';
import {
  Card, Select, Tabs, Table, Button, Modal, Form, Input, InputNumber,
  Tag, Space, Popconfirm, message, Statistic, Row, Col, Empty, Spin,
} from 'antd';
import {
  BulbOutlined, ExperimentOutlined, ThunderboltOutlined,
  PlusOutlined, DeleteOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { api } from '../api';

const { TextArea } = Input;

interface Employee { employeeKey: string; name: string }

const CATEGORY_COLORS: Record<string, string> = {
  preference: 'blue',
  fact: 'green',
  knowledge: 'purple',
  context: 'orange',
};

export default function Memory() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const [semanticData, setSemanticData] = useState<any[]>([]);
  const [episodicData, setEpisodicData] = useState<any[]>([]);
  const [proceduralData, setProceduralData] = useState<any[]>([]);

  const [modalType, setModalType] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    api.listEmployees().then(setEmployees).catch(() => {});
  }, []);

  const refresh = useCallback(async (empKey: string) => {
    if (!empKey) return;
    setLoading(true);
    try {
      const [s, sem, ep, proc] = await Promise.all([
        api.getMemoryStats(empKey),
        api.listSemanticMemories(empKey),
        api.listEpisodicMemories(empKey),
        api.listProceduralMemories(empKey),
      ]);
      setStats(s);
      setSemanticData(sem);
      setEpisodicData(ep);
      setProceduralData(proc);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEmp) refresh(selectedEmp);
  }, [selectedEmp, refresh]);

  const handleAdd = async (values: any) => {
    try {
      if (modalType === 'semantic') {
        await api.addSemanticMemory(selectedEmp, values);
      } else if (modalType === 'episodic') {
        await api.addEpisodicMemory(selectedEmp, values);
      } else {
        await api.addProceduralMemory(selectedEmp, values);
      }
      message.success('记忆已添加');
      setModalOpen(false);
      form.resetFields();
      refresh(selectedEmp);
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleDelete = async (type: string, memId: string) => {
    try {
      if (type === 'semantic') await api.deleteSemanticMemory(selectedEmp, memId);
      else if (type === 'episodic') await api.deleteEpisodicMemory(selectedEmp, memId);
      else await api.deleteProceduralMemory(selectedEmp, memId);
      message.success('已删除');
      refresh(selectedEmp);
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const openAddModal = (type: string) => {
    setModalType(type);
    form.resetFields();
    setModalOpen(true);
  };

  const semanticColumns = [
    {
      title: '内容', dataIndex: 'content', key: 'content', width: '40%',
      render: (t: string) => <span style={{ wordBreak: 'break-all' }}>{t}</span>,
    },
    {
      title: '分类', dataIndex: 'category', key: 'category', width: 100,
      render: (c: string) => <Tag color={CATEGORY_COLORS[c] || 'default'}>{c}</Tag>,
    },
    {
      title: '重要度', dataIndex: 'importance', key: 'importance', width: 80,
      render: (v: number) => <span>{(v * 100).toFixed(0)}%</span>,
    },
    { title: '访问次数', dataIndex: 'accessCount', key: 'accessCount', width: 90 },
    {
      title: '操作', key: 'action', width: 80,
      render: (_: any, r: any) => (
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete('semantic', r.memoryId)}>
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const episodicColumns = [
    { title: '场景', dataIndex: 'observation', key: 'observation', width: '30%' },
    { title: '策略', dataIndex: 'action', key: 'action', width: '25%' },
    { title: '结果', dataIndex: 'result', key: 'result', width: '25%' },
    {
      title: '成功度', dataIndex: 'successScore', key: 'successScore', width: 80,
      render: (v: number) => <span>{(v * 100).toFixed(0)}%</span>,
    },
    {
      title: '操作', key: 'action2', width: 80,
      render: (_: any, r: any) => (
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete('episodic', r.memoryId)}>
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const proceduralColumns = [
    { title: '行为规则', dataIndex: 'rule', key: 'rule', width: '35%' },
    { title: '原因', dataIndex: 'rationale', key: 'rationale', width: '30%' },
    {
      title: '置信度', dataIndex: 'confidence', key: 'confidence', width: 80,
      render: (v: number) => <span>{(v * 100).toFixed(0)}%</span>,
    },
    { title: '激活次数', dataIndex: 'activationCount', key: 'activationCount', width: 90 },
    {
      title: '操作', key: 'action3', width: 80,
      render: (_: any, r: any) => (
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete('procedural', r.memoryId)}>
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const renderModalFields = () => {
    if (modalType === 'semantic') return (
      <>
        <Form.Item name="content" label="记忆内容" rules={[{ required: true }]}>
          <TextArea rows={3} placeholder="例：用户偏好电影感的视觉风格" />
        </Form.Item>
        <Form.Item name="category" label="分类" initialValue="fact">
          <Select options={[
            { value: 'preference', label: '偏好 (preference)' },
            { value: 'fact', label: '事实 (fact)' },
            { value: 'knowledge', label: '知识 (knowledge)' },
            { value: 'context', label: '上下文 (context)' },
          ]} />
        </Form.Item>
        <Form.Item name="importance" label="重要度" initialValue={0.5}>
          <InputNumber min={0} max={1} step={0.1} />
        </Form.Item>
      </>
    );
    if (modalType === 'episodic') return (
      <>
        <Form.Item name="observation" label="场景描述" rules={[{ required: true }]}>
          <TextArea rows={2} placeholder="用户要求什么 / 当时的情境" />
        </Form.Item>
        <Form.Item name="action" label="采取的策略">
          <TextArea rows={2} placeholder="使用了什么方法/提示词/工具" />
        </Form.Item>
        <Form.Item name="result" label="结果">
          <TextArea rows={2} placeholder="效果如何，用户是否满意" />
        </Form.Item>
        <Form.Item name="successScore" label="成功度" initialValue={0.5}>
          <InputNumber min={0} max={1} step={0.1} />
        </Form.Item>
      </>
    );
    return (
      <>
        <Form.Item name="rule" label="行为规则" rules={[{ required: true }]}>
          <TextArea rows={2} placeholder="例：回复视频提示词时优先推荐中文提示词" />
        </Form.Item>
        <Form.Item name="rationale" label="原因">
          <TextArea rows={2} placeholder="为什么要遵循这条规则" />
        </Form.Item>
        <Form.Item name="confidence" label="置信度" initialValue={0.5}>
          <InputNumber min={0} max={1} step={0.1} />
        </Form.Item>
      </>
    );
  };

  const typeLabels: Record<string, string> = {
    semantic: '语义记忆',
    episodic: '经验记忆',
    procedural: '行为记忆',
  };

  return (
    <div>
      <Card
        title="长期记忆管理"
        extra={
          <Space>
            <Select
              style={{ width: 240 }}
              placeholder="选择数字员工"
              value={selectedEmp || undefined}
              onChange={setSelectedEmp}
              options={employees.map(e => ({ value: e.employeeKey, label: e.name || e.employeeKey }))}
            />
            <Button icon={<ReloadOutlined />} onClick={() => refresh(selectedEmp)} disabled={!selectedEmp}>
              刷新
            </Button>
          </Space>
        }
      >
        {!selectedEmp ? (
          <Empty description="请选择一个数字员工查看其长期记忆" />
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin />
            <div style={{ marginTop: 10, color: '#64748b', fontSize: 13 }}>加载中...</div>
          </div>
        ) : (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="语义记忆（事实/偏好）"
                    value={stats?.semantic_count ?? 0}
                    prefix={<BulbOutlined style={{ color: '#1890ff' }} />}
                    suffix="条"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="经验记忆（成功模式）"
                    value={stats?.episodic_count ?? 0}
                    prefix={<ExperimentOutlined style={{ color: '#52c41a' }} />}
                    suffix="条"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="行为记忆（习得规则）"
                    value={stats?.procedural_count ?? 0}
                    prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
                    suffix="条"
                  />
                </Card>
              </Col>
            </Row>

            <Tabs items={[
              {
                key: 'semantic',
                label: <span><BulbOutlined /> 语义记忆</span>,
                children: (
                  <>
                    <div style={{ marginBottom: 12, color: '#888', fontSize: 13 }}>
                      从对话中提取的事实、用户偏好和知识。对应 LangMem 的 Semantic Memory — 帮助 Agent 记住"用户是谁、喜欢什么"。
                    </div>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => openAddModal('semantic')} style={{ marginBottom: 12 }}>
                      手动添加
                    </Button>
                    <Table dataSource={semanticData} columns={semanticColumns} rowKey="memoryId" size="small" pagination={{ pageSize: 10 }} />
                  </>
                ),
              },
              {
                key: 'episodic',
                label: <span><ExperimentOutlined /> 经验记忆</span>,
                children: (
                  <>
                    <div style={{ marginBottom: 12, color: '#888', fontSize: 13 }}>
                      成功的交互模式：场景 → 策略 → 结果。对应 LangMem 的 Episodic Memory — 帮助 Agent 复用"上次这样做效果好"。
                    </div>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => openAddModal('episodic')} style={{ marginBottom: 12 }}>
                      手动添加
                    </Button>
                    <Table dataSource={episodicData} columns={episodicColumns} rowKey="memoryId" size="small" pagination={{ pageSize: 10 }} />
                  </>
                ),
              },
              {
                key: 'procedural',
                label: <span><ThunderboltOutlined /> 行为记忆</span>,
                children: (
                  <>
                    <div style={{ marginBottom: 12, color: '#888', fontSize: 13 }}>
                      习得的行为规则，会自动注入系统提示词。对应 LangMem 的 Procedural Memory — 让 Agent 的"人格"随经验进化。
                    </div>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => openAddModal('procedural')} style={{ marginBottom: 12 }}>
                      手动添加
                    </Button>
                    <Table dataSource={proceduralData} columns={proceduralColumns} rowKey="memoryId" size="small" pagination={{ pageSize: 10 }} />
                  </>
                ),
              },
            ]} />
          </>
        )}
      </Card>

      <Modal
        title={`添加${typeLabels[modalType] || '记忆'}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          {renderModalFields()}
        </Form>
      </Modal>
    </div>
  );
}
