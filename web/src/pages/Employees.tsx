import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Switch, Select, Tag, Space, Popconfirm, message,
  Descriptions, Upload, Slider, InputNumber, Divider, Row, Col, Typography,
} from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../api';
import { COLORS } from '../theme';
import type { Employee } from '../types';

const { TextArea } = Input;
const { Text } = Typography;

export default function Employees() {
  const [list, setList] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  const [tools, setTools] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [mcpServers, setMcpServers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [aiProviders, setAiProviders] = useState<any[]>([]);

  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [knowledgeEmp, setKnowledgeEmp] = useState<Employee | null>(null);
  const [knowledgeDocs, setKnowledgeDocs] = useState<any[]>([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEmp, setDetailEmp] = useState<Employee | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [emp, t, s, m, tm, prov] = await Promise.all([
        api.listEmployees(), api.listTools(), api.listSkills(), api.listMcpServers(), api.listTeams(),
        api.listAiProviders().catch(() => []),
      ]);
      setList(emp); setTools(t); setSkills(s); setMcpServers(m); setTeams(tm); setAiProviders(prov);
    } catch (e: any) { message.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ enabled: true, deepAgent: false, tags: [], skillRefs: [], toolRefs: [], mcpServerRefs: [], modelId: 'gpt-4o', temperature: 0.7, maxTokens: 4096 });
    setOpen(true);
  };

  const openEdit = (record: Employee) => {
    setEditing(record);
    form.setFieldsValue({
      employeeKey: record.employeeKey, name: record.name, roleProfile: record.roleProfile,
      deepAgent: record.deepAgent, tags: record.tags ?? [], teamCode: record.teamCode ?? undefined,
      enabled: record.enabled, skillRefs: record.skillRefs ?? [], toolRefs: record.toolRefs ?? [],
      mcpServerRefs: record.mcpServerRefs ?? [],
      modelId: record.defaultModelPolicy?.model_id ?? record.defaultModelPolicy?.modelId ?? 'gpt-4o',
      temperature: record.defaultModelPolicy?.temperature ?? 0.7,
      maxTokens: record.defaultModelPolicy?.max_tokens ?? record.defaultModelPolicy?.maxTokens ?? 4096,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { modelId, temperature, maxTokens, ...rest } = values;
      const payload = {
        ...rest,
        teamCode: values.teamCode || null,
        skillRefs: values.skillRefs ?? [], toolRefs: values.toolRefs ?? [], mcpServerRefs: values.mcpServerRefs ?? [],
        defaultModelPolicy: { model_id: modelId || 'gpt-4o', temperature: parseFloat(temperature) || 0.7, max_tokens: parseInt(maxTokens) || 4096 },
      };
      if (editing) { await api.updateEmployee(editing.employeeKey, payload); message.success('更新成功'); }
      else { await api.saveEmployee(payload); message.success('创建成功'); }
      setOpen(false); fetchAll();
    } catch (e: any) { if (e.message) message.error(e.message); }
  };

  const handleDelete = async (key: string) => { try { await api.deleteEmployee(key); message.success('删除成功'); fetchAll(); } catch (e: any) { message.error(e.message); } };
  const handleToggle = async (record: Employee) => { try { await api.toggleEnabled(record.employeeKey, !record.enabled); message.success(record.enabled ? '已禁用' : '已启用'); fetchAll(); } catch (e: any) { message.error(e.message); } };

  const openKnowledge = async (record: Employee) => {
    setKnowledgeEmp(record);
    try { setKnowledgeDocs(await api.listKnowledge(record.employeeKey)); } catch { setKnowledgeDocs([]); }
    setKnowledgeOpen(true);
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!knowledgeEmp) return;
    try {
      await api.deleteKnowledge(knowledgeEmp.employeeKey, docId);
      message.success('文档已删除');
      setKnowledgeDocs(await api.listKnowledge(knowledgeEmp.employeeKey));
      fetchAll();
    } catch (e: any) { message.error(e.message); }
  };

  const handleUploadKnowledge = async (file: File) => {
    if (!knowledgeEmp) return false;
    try {
      await api.uploadKnowledge(knowledgeEmp.employeeKey, file);
      message.success('上传成功');
      setKnowledgeDocs(await api.listKnowledge(knowledgeEmp.employeeKey));
      fetchAll();
    } catch (e: any) { message.error(e.message); }
    return false;
  };

  const openDetail = (record: Employee) => { setDetailEmp(record); setDetailOpen(true); };

  const getRefNames = (refs: string[] | null, source: any[], codeField: string, nameField: string) => {
    if (!refs || refs.length === 0) return '-';
    return refs.map(r => { const item = source.find(i => i[codeField] === r); return item ? item[nameField] : r; }).join(', ');
  };

  const columns = [
    {
      title: '名称', dataIndex: 'name', key: 'name',
      render: (v: string, record: Employee) => (
        <Button type="link" style={{ padding: 0, fontWeight: 500 }} onClick={() => openDetail(record)}>{v}</Button>
      ),
    },
    { title: '标识', dataIndex: 'employeeKey', key: 'employeeKey', render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: '团队', dataIndex: 'teamCode', key: 'teamCode',
      render: (v: string) => {
        if (!v) return <Text type="secondary">-</Text>;
        const team = teams.find(t => t.teamCode === v);
        return <Tag style={{ borderRadius: 5, background: '#f8f9fc', border: '1px solid #eef0f6', color: COLORS.slateDark }}>{team?.name ?? v}</Tag>;
      },
    },
    {
      title: '绑定', key: 'bindings',
      render: (_: unknown, record: Employee) => {
        const tc = record.toolRefs?.length ?? 0;
        const sc = record.skillRefs?.length ?? 0;
        const mc = record.mcpServerRefs?.length ?? 0;
        return (
          <Space size={4}>
            {tc > 0 && <Tag style={{ borderRadius: 5 }}>工具:{tc}</Tag>}
            {sc > 0 && <Tag color="blue" style={{ borderRadius: 5 }}>技能:{sc}</Tag>}
            {mc > 0 && <Tag color="purple" style={{ borderRadius: 5 }}>MCP:{mc}</Tag>}
            {tc + sc + mc === 0 && <Text type="secondary">-</Text>}
          </Space>
        );
      },
    },
    {
      title: '知识库', dataIndex: 'hasKnowledgeBase', key: 'knowledge',
      render: (v: boolean, record: Employee) => (
        <Button type="link" size="small" onClick={() => openKnowledge(record)} style={{ fontSize: 13 }}>
          {v ? '已有' : '管理'}
        </Button>
      ),
    },
    {
      title: '状态', dataIndex: 'enabled', key: 'enabled',
      render: (v: boolean) => (
        <Tag
          style={{ borderRadius: 5, background: v ? '#ecfdf5' : '#f8f9fc', color: v ? COLORS.mint : COLORS.slate, border: v ? '1px solid #d1fae5' : '1px solid #eef0f6' }}
        >
          {v ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, record: Employee) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>编辑</Button>
          <Button type="link" size="small" onClick={() => handleToggle(record)}>{record.enabled ? '禁用' : '启用'}</Button>
          <Popconfirm title="确认删除该员工？" onConfirm={() => handleDelete(record.employeeKey)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#1e293b' }}>
            数字员工
          </h1>
          <Text type="secondary">管理和配置 AI 团队成员</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建员工</Button>
      </div>
      <Table rowKey="employeeKey" columns={columns} dataSource={list} loading={loading} pagination={{ pageSize: 20 }} />

      <Modal title={editing ? '编辑员工' : '新建员工'} open={open} onOk={handleSave} onCancel={() => setOpen(false)} destroyOnHidden width={720}>
        <Form form={form} layout="vertical">
          <Form.Item label="员工标识" name="employeeKey" rules={[{ required: true, message: '请输入员工标识' }]}>
            <Input disabled={!!editing} placeholder="唯一标识，创建后不可修改" />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="角色描述" name="roleProfile">
            <TextArea rows={4} placeholder="描述该员工的角色与职责" />
          </Form.Item>
          <Form.Item label="深度代理" name="deepAgent" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="团队" name="teamCode">
            <Select allowClear placeholder="选择所属团队" options={teams.map(t => ({ label: t.name, value: t.teamCode }))} />
          </Form.Item>
          <Form.Item label="绑定工具" name="toolRefs">
            <Select mode="multiple" placeholder="选择该员工可使用的工具" options={tools.map(t => ({ label: `${t.name} (${t.toolCode})`, value: t.toolCode }))} />
          </Form.Item>
          <Form.Item label="绑定技能" name="skillRefs">
            <Select mode="multiple" placeholder="选择该员工可使用的技能" options={skills.map(s => ({ label: `${s.name} (${s.code})`, value: s.code }))} />
          </Form.Item>
          <Form.Item label="绑定 MCP 服务器" name="mcpServerRefs">
            <Select mode="multiple" placeholder="选择该员工可连接的 MCP 服务器" options={mcpServers.map(m => ({ label: `${m.name} (${m.serverCode})`, value: m.serverCode }))} />
          </Form.Item>
          <Divider orientation="left" plain style={{ fontSize: 13 }}>模型配置</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="模型" name="modelId">
                <Select showSearch placeholder="选择 AI 模型"
                  options={aiProviders.flatMap(p => (p.models ?? []).map((m: any) => ({ label: `${m.modelName || m.modelId}  (${p.name})`, value: m.modelId || m.modelName })))}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="温度" name="temperature"><Slider min={0} max={2} step={0.1} /></Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="最大 Token" name="maxTokens"><InputNumber min={256} max={128000} step={256} style={{ width: '100%' }} /></Form.Item>
            </Col>
          </Row>
          <Divider orientation="left" plain style={{ fontSize: 13 }}>其他</Divider>
          <Form.Item label="标签" name="tags"><Select mode="tags" placeholder="输入后回车添加标签" /></Form.Item>
          <Form.Item label="启用" name="enabled" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>

      <Modal title={`员工详情 — ${detailEmp?.name ?? ''}`} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={640}>
        {detailEmp && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="员工标识">{detailEmp.employeeKey}</Descriptions.Item>
            <Descriptions.Item label="名称">{detailEmp.name}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={detailEmp.enabled ? 'green' : 'default'}>{detailEmp.enabled ? '启用' : '禁用'}</Tag></Descriptions.Item>
            <Descriptions.Item label="深度代理">{detailEmp.deepAgent ? '是' : '否'}</Descriptions.Item>
            <Descriptions.Item label="团队">{teams.find(t => t.teamCode === detailEmp.teamCode)?.name ?? detailEmp.teamCode ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="角色描述"><div style={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>{detailEmp.roleProfile || '-'}</div></Descriptions.Item>
            <Descriptions.Item label="绑定工具">{getRefNames(detailEmp.toolRefs, tools, 'toolCode', 'name')}</Descriptions.Item>
            <Descriptions.Item label="绑定技能">{getRefNames(detailEmp.skillRefs, skills, 'code', 'name')}</Descriptions.Item>
            <Descriptions.Item label="绑定 MCP 服务器">{getRefNames(detailEmp.mcpServerRefs, mcpServers, 'serverCode', 'name')}</Descriptions.Item>
            <Descriptions.Item label="知识库">{detailEmp.hasKnowledgeBase ? '已有' : '无'}</Descriptions.Item>
            <Descriptions.Item label="标签">{detailEmp.tags?.length ? detailEmp.tags.join(', ') : '-'}</Descriptions.Item>
            <Descriptions.Item label="来源">{detailEmp.source}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detailEmp.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal title={`知识库管理 — ${knowledgeEmp?.name ?? ''}`} open={knowledgeOpen} onCancel={() => setKnowledgeOpen(false)} footer={null} width={600}>
        <Upload.Dragger
          beforeUpload={(file) => { handleUploadKnowledge(file); return false; }}
          showUploadList={false}
          style={{ marginBottom: 16, borderRadius: 10 }}
        >
          <p><UploadOutlined style={{ fontSize: 24, color: COLORS.iris }} /></p>
          <p>点击或拖拽文件上传知识文档</p>
          <p style={{ color: COLORS.slate, fontSize: 12 }}>支持 .txt, .md, .pdf 等文本格式</p>
        </Upload.Dragger>
        <Table
          rowKey="docId" dataSource={knowledgeDocs} pagination={false} size="small"
          columns={[
            { title: '文件名', dataIndex: 'fileName', key: 'fileName' },
            { title: '片段数', dataIndex: 'chunkCount', key: 'chunkCount', render: (v: number) => v ?? '-' },
            { title: '上传时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleString() : '-' },
            {
              title: '操作', key: 'actions', width: 80,
              render: (_: unknown, r: any) => (
                <Popconfirm title="确认删除？" onConfirm={() => handleDeleteDoc(r.docId)}>
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
