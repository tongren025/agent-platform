// 数字员工管理页：员工 CRUD、启停、克隆、绑定技能/工具/MCP、参考资料上传。
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Descriptions, Divider, Empty, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Slider, Space, Spin, Switch, Table, Tag, Typography, Upload } from 'antd';
import { message } from '../ui';
import { DeleteOutlined, PlusOutlined, RobotOutlined, UploadOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { readInputHabit, useInputHabit, writeInputHabit } from '../hooks/useInputHabit';
import { useResponsive } from '../hooks/useResponsive';
import { api } from '../api';
import { COLORS } from '../theme';
import type { Employee } from '../types';

const { TextArea } = Input;
const { Text } = Typography;

export default function Employees() {
  const [list, setList] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [supportError, setSupportError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  const [tools, setTools] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [mcpServers, setMcpServers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [aiProviders, setAiProviders] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [roleRequest, setRoleRequest] = useInputHabit('employees.role-request', '');
  const [draftGenerating, setDraftGenerating] = useState(false);

  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [knowledgeEmp, setKnowledgeEmp] = useState<Employee | null>(null);
  const [knowledgeDocs, setKnowledgeDocs] = useState<any[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState('');
  const knowledgeRequestRef = useRef(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEmp, setDetailEmp] = useState<Employee | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobile } = useResponsive();

  const fetchAll = async () => {
    setLoading(true);
    setLoadError('');
    setSupportError('');
    try {
      const emp = await api.listEmployees();
      setList(emp);
      const [toolsResult, skillsResult, mcpResult, teamsResult, providersResult, templatesResult] = await Promise.allSettled([
        api.listTools(), api.listSkills(), api.listMcpServers(), api.listTeams(), api.listAiProviders(), api.listTemplates(),
      ]);
      setTools(toolsResult.status === 'fulfilled' ? toolsResult.value : []);
      setSkills(skillsResult.status === 'fulfilled' ? skillsResult.value : []);
      setMcpServers(mcpResult.status === 'fulfilled' ? mcpResult.value : []);
      setTeams(teamsResult.status === 'fulfilled' ? teamsResult.value : []);
      setAiProviders(providersResult.status === 'fulfilled' ? providersResult.value : []);
      setTemplates(templatesResult.status === 'fulfilled' ? templatesResult.value : []);
      const unavailable = [
        toolsResult.status === 'rejected' && '工具',
        skillsResult.status === 'rejected' && '技能',
        mcpResult.status === 'rejected' && '连接',
        teamsResult.status === 'rejected' && '团队',
        providersResult.status === 'rejected' && '模型',
        templatesResult.status === 'rejected' && '岗位模板',
      ].filter(Boolean);
      if (unavailable.length) setSupportError(`${unavailable.join('、')}配置暂时无法加载；员工列表仍可正常查看。`);
    } catch (e: any) {
      setList([]);
      setLoadError(e.message || '数字员工暂时无法加载');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    const availableModelIds = aiProviders.flatMap(provider => (
      (provider.models ?? []).map((model: any) => model.modelId || model.modelName).filter(Boolean)
    ));
    const remembered = readInputHabit<Record<string, any>>('employees.create-preferences', {});
    const rememberedModel = availableModelIds.includes(remembered.modelId)
      ? remembered.modelId
      : (availableModelIds[0] || 'gpt-4o');
    form.setFieldsValue({
      enabled: true,
      deepAgent: false,
      tags: [],
      skillRefs: [],
      toolRefs: [],
      mcpServerRefs: [],
      temperature: 0.7,
      maxTokens: 4096,
      ...remembered,
      modelId: rememberedModel,
    });
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

  const applyDraft = (draft: any) => {
    const policy = draft.defaultModelPolicy ?? {};
    const currentModel = form.getFieldValue('modelId');
    form.setFieldsValue({
      employeeKey: draft.employeeKey,
      name: draft.name,
      roleProfile: draft.roleProfile,
      deepAgent: draft.deepAgent ?? false,
      tags: draft.tags ?? [],
      skillRefs: draft.skillRefs ?? [],
      toolRefs: draft.toolRefs ?? [],
      mcpServerRefs: draft.mcpServerRefs ?? [],
      modelId: policy.model_id || policy.modelId || currentModel,
      temperature: policy.temperature ?? 0.35,
      maxTokens: policy.max_tokens ?? policy.maxTokens ?? 8192,
    });
  };

  const generateDraft = async () => {
    const request = roleRequest.trim();
    if (request.length < 2) {
      message.warning('直接说你想要什么员工，例如：我要一个软件架构师');
      return;
    }
    setDraftGenerating(true);
    try {
      const draft = await api.generateEmployeeDraft(request, form.getFieldValue('modelId'));
      applyDraft(draft);
      message.success(draft.generatedBy === 'ai'
        ? '员工已经设计好了，你可以直接创建'
        : '已生成可用草稿；当前设计模型不可用，使用了本地专业模板');
    } catch (e: any) {
      message.error(e.message || '员工草稿生成失败');
    } finally {
      setDraftGenerating(false);
    }
  };

  const applyTemplateDraft = (templateCode: string) => {
    const template = templates.find(item => item.templateCode === templateCode);
    if (!template) return;
    const baseKey = String(template.templateCode || 'digital-employee').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    let employeeKey = baseKey;
    let suffix = 2;
    while (list.some(item => item.employeeKey === employeeKey)) employeeKey = `${baseKey}-${suffix++}`;
    const policy = template.defaultModelPolicy ?? {};
    setRoleRequest(template.name || '');
    applyDraft({
      employeeKey,
      name: template.name,
      roleProfile: template.roleProfile,
      deepAgent: template.deepAgent,
      tags: template.tags,
      skillRefs: template.suggestedSkillCodes,
      toolRefs: template.suggestedToolCodes,
      mcpServerRefs: template.suggestedMcpServerCodes,
      defaultModelPolicy: {
        ...policy,
        model_id: policy.model_id || policy.modelId || form.getFieldValue('modelId'),
      },
    });
    message.success('岗位模板已填好，可直接创建');
  };

  useEffect(() => {
    const key = searchParams.get('edit');
    if (!key || list.length === 0 || editing?.employeeKey === key) return;
    const target = list.find((item) => item.employeeKey === key);
    if (target) openEdit(target);
    else {
      message.warning(`未找到员工：${key}`);
      const next = new URLSearchParams(searchParams);
      next.delete('edit');
      setSearchParams(next, { replace: true });
    }
  }, [list, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeEditor = () => {
    setOpen(false);
    if (searchParams.has('edit')) {
      const next = new URLSearchParams(searchParams);
      next.delete('edit');
      setSearchParams(next, { replace: true });
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { modelId, temperature, maxTokens, ...rest } = values;
      const parsedTemperature = Number(temperature);
      const parsedMaxTokens = Number(maxTokens);
      const payload = {
        ...rest,
        teamCode: values.teamCode || null,
        skillRefs: values.skillRefs ?? [], toolRefs: values.toolRefs ?? [], mcpServerRefs: values.mcpServerRefs ?? [],
        defaultModelPolicy: {
          model_id: modelId || 'gpt-4o',
          temperature: Number.isFinite(parsedTemperature) ? parsedTemperature : 0.7,
          max_tokens: Number.isFinite(parsedMaxTokens) && parsedMaxTokens > 0 ? Math.trunc(parsedMaxTokens) : 4096,
        },
      };
      if (editing) { await api.updateEmployee(editing.employeeKey, payload); message.success('更新成功'); }
      else {
        await api.saveEmployee(payload);
        setRoleRequest('');
        message.success('创建成功');
      }
      writeInputHabit('employees.create-preferences', {
        deepAgent: !!values.deepAgent,
        teamCode: values.teamCode || undefined,
        skillRefs: values.skillRefs ?? [],
        toolRefs: values.toolRefs ?? [],
        mcpServerRefs: values.mcpServerRefs ?? [],
        modelId: modelId || 'gpt-4o',
        temperature: Number.isFinite(parsedTemperature) ? parsedTemperature : 0.7,
        maxTokens: Number.isFinite(parsedMaxTokens) && parsedMaxTokens > 0 ? Math.trunc(parsedMaxTokens) : 4096,
        tags: values.tags ?? [],
        enabled: values.enabled !== false,
      });
      closeEditor(); fetchAll();
    } catch (e: any) { if (e.message) message.error(e.message); }
  };

  const handleDelete = async (key: string) => { try { await api.deleteEmployee(key); message.success('删除成功'); fetchAll(); } catch (e: any) { message.error(e.message); } };
  const handleToggle = async (record: Employee) => { try { await api.toggleEnabled(record.employeeKey, !record.enabled); message.success(record.enabled ? '已禁用' : '已启用'); fetchAll(); } catch (e: any) { message.error(e.message); } };

  const openKnowledge = async (record: Employee) => {
    const requestId = ++knowledgeRequestRef.current;
    setKnowledgeEmp(record);
    setKnowledgeOpen(true);
    setKnowledgeLoading(true);
    setKnowledgeError('');
    try {
      const docs = await api.listKnowledge(record.employeeKey);
      if (knowledgeRequestRef.current === requestId) setKnowledgeDocs(docs);
    } catch (e: any) {
      if (knowledgeRequestRef.current === requestId) {
        setKnowledgeDocs([]);
        setKnowledgeError(e.message || '参考资料暂时无法加载');
      }
    } finally {
      if (knowledgeRequestRef.current === requestId) setKnowledgeLoading(false);
    }
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
        <Space size={8}>
          {/* 头像：优先用员工自定义 avatarUrl，缺省或加载失败时兜底到默认机器人剪影 */}
          <img
            src={record.avatarUrl || '/avatar-default.svg'}
            alt=""
            width={28}
            height={28}
            style={{ borderRadius: '50%', objectFit: 'cover', display: 'block', background: '#f8f9fc', border: '1px solid #eef0f6' }}
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.src.endsWith('/avatar-default.svg')) img.src = '/avatar-default.svg';
            }}
          />
          <Button type="link" style={{ padding: 0, fontWeight: 500 }} onClick={() => openDetail(record)}>{v || record.employeeKey}</Button>
        </Space>
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
      title: '参考资料', dataIndex: 'hasKnowledgeBase', key: 'knowledge',
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
      <div style={{ marginBottom: isMobile ? 12 : 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#1e293b' }}>
            数字员工
          </h1>
          <Text type="secondary">管理和配置 AI 团队成员</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建员工</Button>
      </div>
      {loadError && <Alert
        showIcon
        type="error"
        message="数字员工暂时无法加载"
        description={loadError}
        action={<Button size="small" onClick={fetchAll}>重新加载</Button>}
        style={{ marginBottom: 16 }}
      />}
      {supportError && <Alert
        showIcon
        closable
        type="warning"
        message="部分编辑选项暂时不可用"
        description={supportError}
        onClose={() => setSupportError('')}
        style={{ marginBottom: 16 }}
      />}
      <Table rowKey="employeeKey" columns={columns} dataSource={list} loading={loading} pagination={{ pageSize: 20 }} scroll={{ x: 'max-content' }} />

      <Modal
        title={editing ? '编辑员工' : '创建数字员工'}
        open={open}
        onOk={handleSave}
        okText={editing ? '保存修改' : '创建员工'}
        onCancel={closeEditor}
        destroyOnHidden
        width={isMobile ? '100%' : 820}
      >
        {!editing && (
          <Card
            size="small"
            title={<Space><RobotOutlined />告诉我你要什么员工</Space>}
            style={{ marginBottom: 20, background: '#f8f7ff', borderColor: '#e8e5ff' }}
          >
            <Text type="secondary">
              不需要你写提示词。说清岗位和主要任务，系统会自动设计名称、工作提示词、模型参数，并从现有技能和工具中选择合适的绑定。
            </Text>
            <TextArea
              value={roleRequest}
              onChange={event => setRoleRequest(event.target.value)}
              rows={3}
              maxLength={1000}
              showCount
              placeholder="例如：我要一个软件架构师，负责系统架构设计、技术选型、方案评审和风险把关"
              style={{ marginTop: 12, background: '#fff' }}
              onPressEnter={event => {
                if (!event.shiftKey) {
                  event.preventDefault();
                  generateDraft();
                }
              }}
            />
            <Space wrap style={{ marginTop: 10 }}>
              <Text type="secondary">试试：</Text>
              {[
                '我要一个软件架构师，负责技术选型、系统设计和方案评审',
                '我要一个产品经理，能把模糊需求拆成可验收的产品方案',
                '我要一个代码审查员，重点检查安全、性能和可维护性',
                '我要一个短剧编剧，擅长强冲突、快节奏和章节钩子',
              ].map(example => (
                <Button key={example} size="small" onClick={() => setRoleRequest(example)}>
                  {example.match(/一个(.+?)[，,]/)?.[1] ?? example}
                </Button>
              ))}
            </Space>
            <Row gutter={12} style={{ marginTop: 14 }}>
              <Col xs={24} sm={15}>
                <Button type="primary" block icon={<RobotOutlined />} loading={draftGenerating} onClick={generateDraft}>
                  自动设计员工
                </Button>
              </Col>
              <Col xs={24} sm={9} style={{ marginTop: isMobile ? 8 : 0 }}>
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="或选择现成岗位模板"
                  value={undefined}
                  onChange={applyTemplateDraft}
                  options={templates.map(item => ({
                    label: `${item.name}${item.category ? ` · ${item.category}` : ''}`,
                    value: item.templateCode,
                  }))}
                />
              </Col>
            </Row>
          </Card>
        )}
        <Form form={form} layout="vertical">
          {!editing && <Divider orientation="left" plain>生成结果（可修改）</Divider>}
          <Form.Item label="员工标识" name="employeeKey" rules={[{ required: true, message: '请输入员工标识' }]}>
            <Input disabled={!!editing} placeholder="系统会自动生成唯一标识" />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="员工工作提示词" name="roleProfile" rules={[{ required: true, message: '请先让系统自动设计员工，或选择岗位模板' }]}>
            <TextArea rows={10} placeholder="系统会根据岗位需求自动生成；你也可以在这里微调" />
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
            <Col xs={24} sm={24} md={12}>
              <Form.Item label="模型" name="modelId">
                <Select showSearch placeholder="选择 AI 模型"
                  options={aiProviders.flatMap(p => (p.models ?? []).map((m: any) => ({ label: `${m.modelName || m.modelId}  (${p.name})`, value: m.modelId || m.modelName })))}
                />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Form.Item label="温度" name="temperature"><Slider min={0} max={2} step={0.1} /></Form.Item>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Form.Item label="最大 Token" name="maxTokens"><InputNumber min={256} max={128000} step={256} style={{ width: '100%' }} /></Form.Item>
            </Col>
          </Row>
          <Divider orientation="left" plain style={{ fontSize: 13 }}>其他</Divider>
          <Form.Item label="标签" name="tags"><Select mode="tags" placeholder="输入后回车添加标签" /></Form.Item>
          <Form.Item label="启用" name="enabled" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>

      <Modal title={`员工详情 — ${detailEmp?.name ?? ''}`} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={isMobile ? '100%' : 640}>
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
            <Descriptions.Item label="参考资料">{detailEmp.hasKnowledgeBase ? '已有' : '无'}</Descriptions.Item>
            <Descriptions.Item label="标签">{detailEmp.tags?.length ? detailEmp.tags.join(', ') : '-'}</Descriptions.Item>
            <Descriptions.Item label="来源">{detailEmp.source}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detailEmp.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal title={`参考资料 — ${knowledgeEmp?.name ?? ''}`} open={knowledgeOpen} onCancel={() => {
        knowledgeRequestRef.current += 1;
        setKnowledgeOpen(false);
      }} footer={null} width={isMobile ? '100%' : 600}>
        <Upload.Dragger
          beforeUpload={(file) => { handleUploadKnowledge(file); return false; }}
          showUploadList={false}
          style={{ marginBottom: 16, borderRadius: 10 }}
        >
          <p><UploadOutlined style={{ fontSize: 24, color: COLORS.iris }} /></p>
          <p>点击或拖拽，为这位员工添加参考资料</p>
          <p style={{ color: COLORS.slate, fontSize: 12 }}>支持 .txt, .md, .pdf 等文本格式</p>
        </Upload.Dragger>
        {knowledgeLoading ? <div role="status" aria-live="polite" aria-label="正在加载参考资料">
          <Spin style={{ display: 'block', padding: 40, textAlign: 'center' }} />
        </div> : knowledgeError ? <Alert
          showIcon
          type="error"
          message="参考资料暂时无法加载"
          description={knowledgeError}
          action={knowledgeEmp && <Button size="small" onClick={() => openKnowledge(knowledgeEmp)}>重试</Button>}
        /> : <Table
          rowKey="docId" dataSource={knowledgeDocs} pagination={false} size="small" scroll={{ x: 'max-content' }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有参考资料" /> }}
          columns={[
            { title: '文件名', dataIndex: 'fileName', key: 'fileName' },
            { title: '片段数', dataIndex: 'chunkCount', key: 'chunkCount', render: (v: number) => v ?? '-' },
            { title: '上传时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleString() : '-' },
            {
              title: '操作', key: 'actions', width: 80,
                render: (_: unknown, r: any) => (
                  <Popconfirm title="确认删除？" onConfirm={() => handleDeleteDoc(r.docId)}>
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} aria-label={`删除资料 ${r.fileName || ''}`} />
                  </Popconfirm>
                ),
            },
          ]}
        />}
      </Modal>
    </div>
  );
}
