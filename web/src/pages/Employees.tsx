// 数字员工管理页：员工 CRUD、启停、克隆、绑定技能/工具/MCP、参考资料上传。
import { useEffect, useMemo, useRef, useState } from 'react';
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

const MEDIA_TOOL_CODES = new Set([
  'generate_image',
  'generate_video',
  'check_video_generation',
]);

function modelIdOf(model: any): string {
  return String(model?.modelId || model?.actualModelId || model?.modelName || model?.id || '');
}

function unqualifiedModelId(modelRef: string): string {
  const separator = modelRef.indexOf(':');
  if (separator < 0) return modelRef;
  const prefix = modelRef.slice(0, separator);
  return prefix.includes('/') ? modelRef : modelRef.slice(separator + 1);
}

function isImageGenerationModel(modelRef: string): boolean {
  const modelId = unqualifiedModelId(modelRef);
  return /^(gpt-image-|chatgpt-image-|dall-e-)/i.test(modelId)
    || /(flux|ideogram|imagen|imagegen|recraft|seedream|stable-diffusion)/i.test(modelId)
    || (/image/i.test(modelId) && !/vision/i.test(modelId));
}

function isVideoGenerationModel(modelRef: string): boolean {
  return /(grok-imagine-video|hailuo|happyhorse|kling|seedance|sora|veo|video-generation|wan-|wan-video)/i.test(
    unqualifiedModelId(modelRef),
  );
}

function isChatModel(modelRef: string): boolean {
  const modelId = unqualifiedModelId(modelRef);
  return !!modelId
    && !isImageGenerationModel(modelId)
    && !isVideoGenerationModel(modelId)
    && !/(audio|codex|embedding|moderation|realtime|search-preview|transcribe|tts)/i.test(modelId);
}

function providerModelRef(provider: any, model: any): string {
  return `${provider.name}:${modelIdOf(model)}`;
}

export default function Employees() {
  const [list, setList] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [supportError, setSupportError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form] = Form.useForm();
  const outputModalities = Form.useWatch('outputModalities', form) as string[] | undefined;

  const [tools, setTools] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [mcpServers, setMcpServers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [aiProviders, setAiProviders] = useState<any[]>([]);
  const [imageModels, setImageModels] = useState<any[]>([]);
  const [videoModels, setVideoModels] = useState<any[]>([]);
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
      const [
        toolsResult,
        skillsResult,
        mcpResult,
        teamsResult,
        providersResult,
        templatesResult,
        imageModelsResult,
        videoModelsResult,
      ] = await Promise.allSettled([
        api.listTools(),
        api.listSkills(),
        api.listMcpServers(),
        api.listTeams(),
        api.listAiProviders(),
        api.listTemplates(),
        api.listDirectorMediaModels('image'),
        api.listDirectorMediaModels('video'),
      ]);
      setTools(toolsResult.status === 'fulfilled' ? toolsResult.value : []);
      setSkills(skillsResult.status === 'fulfilled' ? skillsResult.value : []);
      setMcpServers(mcpResult.status === 'fulfilled' ? mcpResult.value : []);
      setTeams(teamsResult.status === 'fulfilled' ? teamsResult.value : []);
      setAiProviders(providersResult.status === 'fulfilled' ? providersResult.value : []);
      setTemplates(templatesResult.status === 'fulfilled' ? templatesResult.value : []);
      setImageModels(imageModelsResult.status === 'fulfilled' ? imageModelsResult.value : []);
      setVideoModels(videoModelsResult.status === 'fulfilled' ? videoModelsResult.value : []);
      const unavailable = [
        toolsResult.status === 'rejected' && '工具',
        skillsResult.status === 'rejected' && '技能',
        mcpResult.status === 'rejected' && '连接',
        teamsResult.status === 'rejected' && '团队',
        providersResult.status === 'rejected' && '模型',
        templatesResult.status === 'rejected' && '岗位模板',
        imageModelsResult.status === 'rejected' && 'OpenRouter 图片模型',
        videoModelsResult.status === 'rejected' && 'OpenRouter 视频模型',
      ].filter(Boolean);
      if (unavailable.length) setSupportError(`${unavailable.join('、')}配置暂时无法加载；员工列表仍可正常查看。`);
    } catch (e: any) {
      setList([]);
      setLoadError(e.message || '数字员工暂时无法加载');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const chatModelOptions = useMemo(() => aiProviders
    .filter(provider => provider.enabled !== false)
    .flatMap(provider => (
      (provider.models ?? [])
        .map((model: any) => ({
          label: `${model.modelName || model.modelId}  (${provider.name})`,
          value: providerModelRef(provider, model),
        }))
        .filter((option: any) => isChatModel(option.value))
    )), [aiProviders]);

  const imageModelOptions = useMemo(() => {
    const options = aiProviders
      .filter(provider => provider.enabled !== false)
      .flatMap(provider => (
        (provider.models ?? [])
          .map((model: any) => ({
            label: `${model.modelName || model.modelId}  (${provider.name})`,
            value: providerModelRef(provider, model),
          }))
          .filter((option: any) => isImageGenerationModel(option.value))
      ));
    imageModels.forEach(model => options.push({
      label: `${model.name || model.id}  (OpenRouter 图片)`,
      value: `openrouter:${model.id}`,
    }));
    return Array.from(new Map(options.map(option => [option.value, option])).values());
  }, [aiProviders, imageModels]);

  const videoModelOptions = useMemo(() => (
    videoModels.map(model => ({
      label: `${model.name || model.id}  (OpenRouter 视频)`,
      value: `openrouter:${model.id}`,
    }))
  ), [videoModels]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    const availableModelIds = chatModelOptions.map(option => option.value);
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
      outputModalities: ['text'],
      temperature: 0.7,
      maxTokens: 4096,
      reasoningEffort: 'low',
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
      imageModelId: record.defaultModelPolicy?.image_model_id ?? record.defaultModelPolicy?.imageModelId,
      videoModelId: record.defaultModelPolicy?.video_model_id ?? record.defaultModelPolicy?.videoModelId,
      outputModalities: record.outputModalities?.length ? record.outputModalities : ['text'],
      temperature: record.defaultModelPolicy?.temperature ?? 0.7,
      maxTokens: record.defaultModelPolicy?.max_tokens ?? record.defaultModelPolicy?.maxTokens ?? 4096,
      reasoningEffort: record.defaultModelPolicy?.reasoning_effort ?? record.defaultModelPolicy?.reasoningEffort ?? 'low',
    });
    setOpen(true);
  };

  const applyDraft = (draft: any) => {
    const policy = draft.defaultModelPolicy ?? {};
    const currentModel = form.getFieldValue('modelId');
    const safeCurrentModel = isChatModel(String(currentModel || ''))
      ? currentModel
      : undefined;
    form.setFieldsValue({
      employeeKey: draft.employeeKey,
      name: draft.name,
      roleProfile: draft.roleProfile,
      deepAgent: draft.deepAgent ?? false,
      tags: draft.tags ?? [],
      skillRefs: draft.skillRefs ?? [],
      toolRefs: draft.toolRefs ?? [],
      mcpServerRefs: draft.mcpServerRefs ?? [],
      modelId: policy.model_id || policy.modelId || safeCurrentModel,
      imageModelId: policy.image_model_id || policy.imageModelId,
      videoModelId: policy.video_model_id || policy.videoModelId,
      outputModalities: draft.outputModalities?.length ? draft.outputModalities : ['text'],
      temperature: policy.temperature ?? 0.35,
      maxTokens: policy.max_tokens ?? policy.maxTokens ?? 4096,
      reasoningEffort: policy.reasoning_effort ?? policy.reasoningEffort ?? 'low',
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
      if (draft.needsConfiguration) {
        const labels: Record<string, string> = {
          model_id: '思考模型',
          image_model_id: '图片模型',
          video_model_id: '视频模型',
        };
        const missing = (draft.missingRoutes ?? [])
          .map((item: string) => labels[item] || item)
          .join('、');
        message.warning(`员工草稿已生成，还需要选择：${missing}`);
      } else {
        message.success(draft.generatedBy === 'ai'
          ? '员工已经设计好了，可以创建'
          : '已生成可用草稿；设计调用失败，使用了本地专业模板');
      }
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
      outputModalities: template.outputModalities,
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
      const {
        modelId,
        imageModelId,
        videoModelId,
        temperature,
        maxTokens,
        reasoningEffort,
        ...rest
      } = values;
      const parsedTemperature = Number(temperature);
      const parsedMaxTokens = Number(maxTokens);
      const modalities = Array.from(new Set<string>([
        'text',
        ...((values.outputModalities ?? []) as string[]),
      ]));
      const selectedTools = new Set<string>(
        ((values.toolRefs ?? []) as string[]).filter(
          code => !MEDIA_TOOL_CODES.has(code),
        ),
      );
      if (modalities.includes('image')) selectedTools.add('generate_image');
      if (modalities.includes('video')) {
        selectedTools.add('generate_video');
        selectedTools.add('check_video_generation');
      }
      const defaultModelPolicy: Record<string, any> = {
        ...(editing?.defaultModelPolicy ?? {}),
        model_id: modelId || 'gpt-4o',
        temperature: Number.isFinite(parsedTemperature) ? parsedTemperature : 0.7,
        max_tokens: Number.isFinite(parsedMaxTokens) && parsedMaxTokens > 0 ? Math.trunc(parsedMaxTokens) : 4096,
      };
      delete defaultModelPolicy.modelId;
      delete defaultModelPolicy.imageModelId;
      delete defaultModelPolicy.videoModelId;
      delete defaultModelPolicy.reasoningEffort;
      if (reasoningEffort && reasoningEffort !== 'auto') {
        defaultModelPolicy.reasoning_effort = reasoningEffort;
      } else {
        delete defaultModelPolicy.reasoning_effort;
      }
      if (modalities.includes('image') && imageModelId) {
        defaultModelPolicy.image_model_id = imageModelId;
      } else {
        delete defaultModelPolicy.image_model_id;
      }
      if (modalities.includes('video') && videoModelId) {
        defaultModelPolicy.video_model_id = videoModelId;
      } else {
        delete defaultModelPolicy.video_model_id;
      }

      const payload = {
        ...(editing ?? {}),
        ...rest,
        outputModalities: modalities,
        teamCode: values.teamCode || null,
        skillRefs: values.skillRefs ?? [],
        toolRefs: Array.from(selectedTools),
        mcpServerRefs: values.mcpServerRefs ?? [],
        defaultModelPolicy,
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
        toolRefs: Array.from(selectedTools),
        mcpServerRefs: values.mcpServerRefs ?? [],
        modelId: modelId || 'gpt-4o',
        outputModalities: modalities,
        imageModelId: modalities.includes('image') ? imageModelId : undefined,
        videoModelId: modalities.includes('video') ? videoModelId : undefined,
        temperature: Number.isFinite(parsedTemperature) ? parsedTemperature : 0.7,
        maxTokens: Number.isFinite(parsedMaxTokens) && parsedMaxTokens > 0 ? Math.trunc(parsedMaxTokens) : 4096,
        reasoningEffort: reasoningEffort || 'low',
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
          <Form.Item
            label="员工输出能力"
            name="outputModalities"
            extra="思考模型始终负责文字规划；勾选图片或视频后，系统会绑定对应媒体工具并使用独立模型。"
          >
            <Select
              mode="multiple"
              options={[
                { label: '文字 / 推理', value: 'text', disabled: true },
                { label: '生成图片', value: 'image' },
                { label: '生成视频', value: 'video' },
              ]}
            />
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
          <Divider orientation="left" plain style={{ fontSize: 13 }}>文字与推理模型</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="员工思考模型"
                name="modelId"
                extra="这里只负责分析、写作和生成提示词，不是最终出图模型；生图时会单独选择真正支持图片输出的模型。"
              >
                <Select showSearch placeholder="选择文字/推理模型"
                  options={chatModelOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12} md={4}>
              <Form.Item
                label="推理强度"
                name="reasoningEffort"
                extra="GPT-5.6 日常任务推荐 low；复杂终审再用 medium/high。"
              >
                <Select options={[
                  { label: '自动', value: 'auto' },
                  { label: '无', value: 'none' },
                  { label: '极低', value: 'minimal' },
                  { label: '低（推荐）', value: 'low' },
                  { label: '中', value: 'medium' },
                  { label: '高', value: 'high' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12} md={4}>
              <Form.Item label="温度" name="temperature"><Slider min={0} max={2} step={0.1} /></Form.Item>
            </Col>
            <Col xs={12} sm={12} md={4}>
              <Form.Item label="最大 Token" name="maxTokens"><InputNumber min={256} max={128000} step={256} style={{ width: '100%' }} /></Form.Item>
            </Col>
          </Row>
          {(outputModalities ?? []).some(value => value === 'image' || value === 'video') && (
            <>
              <Divider orientation="left" plain style={{ fontSize: 13 }}>媒体生成模型</Divider>
              <Alert
                showIcon
                type="info"
                message="媒体模型不会进入 Chat Completions"
                description="员工先用上面的思考模型整理提示词，再通过专用图片或视频接口生成最终素材。"
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {(outputModalities ?? []).includes('image') && (
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="图片生成模型"
                      name="imageModelId"
                      rules={[{ required: true, message: '请选择图片生成模型' }]}
                      extra="OpenAI 推荐 gpt-image-2；图片模型只走 Images API。"
                    >
                      <Select
                        showSearch
                        placeholder="选择 gpt-image-2 或 OpenRouter 图片模型"
                        options={imageModelOptions}
                      />
                    </Form.Item>
                  </Col>
                )}
                {(outputModalities ?? []).includes('video') && (
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="视频生成模型"
                      name="videoModelId"
                      rules={[{ required: true, message: '请选择视频生成模型' }]}
                      extra="视频采用异步任务；生成后由员工查询状态并回传播放器。"
                    >
                      <Select
                        showSearch
                        placeholder="选择 Seedance 等视频模型"
                        options={videoModelOptions}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </>
          )}
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
            <Descriptions.Item label="输出能力">
              {(detailEmp.outputModalities?.length ? detailEmp.outputModalities : ['text']).join(' / ')}
            </Descriptions.Item>
            <Descriptions.Item label="思考模型">
              {String(detailEmp.defaultModelPolicy?.model_id ?? detailEmp.defaultModelPolicy?.modelId ?? '-')}
            </Descriptions.Item>
            {(detailEmp.outputModalities ?? []).includes('image') && (
              <Descriptions.Item label="图片模型">
                {String(detailEmp.defaultModelPolicy?.image_model_id ?? detailEmp.defaultModelPolicy?.imageModelId ?? '-')}
              </Descriptions.Item>
            )}
            {(detailEmp.outputModalities ?? []).includes('video') && (
              <Descriptions.Item label="视频模型">
                {String(detailEmp.defaultModelPolicy?.video_model_id ?? detailEmp.defaultModelPolicy?.videoModelId ?? '-')}
              </Descriptions.Item>
            )}
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
