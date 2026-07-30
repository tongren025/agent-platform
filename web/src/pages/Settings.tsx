// 设置页：AI 供应商配置（endpoint/key/模型列表）与系统信息。
import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, Tag, Space, Typography, Descriptions, Table, Switch, Button, Modal, Form, Input, Select, InputNumber, Popconfirm, Divider, Alert } from 'antd';
import { message } from '../ui';
import {
  ApiOutlined, SettingOutlined, SafetyCertificateOutlined,
  CloudServerOutlined, PlusOutlined, DeleteOutlined,
  EditOutlined, ExperimentOutlined, CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { useResponsive } from '../hooks/useResponsive';

const { Title, Text } = Typography;

interface SystemInfo {
  version: string;
  python: string;
  platform: string;
  port: number;
  providerCount: number;
  modelCount: number;
  delegationEnabled: boolean;
  delegationMaxDepth: number;
  knowledgeEnabled: boolean;
  shellEnabled: boolean;
  runTimeout: number;
}

interface AiModel {
  modelName: string;
  modelId: string;
  timeoutMinutes?: number;
}

interface AiProvider {
  name: string;
  endpoint: string;
  apiKeyMasked?: string;
  hasApiKey?: boolean;
  enabled: boolean;
  models: AiModel[];
  managed?: boolean;
  apiMode?: 'auto' | 'responses' | 'chat';
}

export default function Settings() {
  const { isMobile } = useResponsive();
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AiProvider | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const [testingName, setTestingName] = useState<string | null>(null);
  const [syncingName, setSyncingName] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ name: string; success: boolean; reply?: string; error?: string } | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sys, prov] = await Promise.all([
        api.getSystemInfo().catch(() => null),
        api.listAiProviders().catch(() => []),
      ]);
      setSysInfo(sys);
      setProviders(prov);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const [pendingFormValues, setPendingFormValues] = useState<any>(null);

  useEffect(() => {
    if (modalOpen && pendingFormValues) {
      form.setFieldsValue(pendingFormValues);
      setPendingFormValues(null);
    }
  }, [modalOpen, pendingFormValues, form]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    const vals = { name: '', endpoint: '', apiKey: '', enabled: true, apiMode: 'responses', models: [{ modelName: '', modelId: '', timeoutMinutes: 10 }] };
    setPendingFormValues(vals);
    setModalOpen(true);
  };

  const openEdit = (provider: AiProvider) => {
    setEditing(provider);
    form.resetFields();
    const vals = {
      name: provider.name,
      endpoint: provider.endpoint,
      apiKey: '',
      enabled: provider.enabled,
      apiMode: provider.apiMode || 'responses',
      models: provider.models?.length
        ? provider.models.map(m => ({ modelName: m.modelName, modelId: m.modelId, timeoutMinutes: m.timeoutMinutes || 10 }))
        : [{ modelName: '', modelId: '', timeoutMinutes: 10 }],
    };
    setPendingFormValues(vals);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const models = (values.models || []).filter((m: AiModel) => m.modelName || m.modelId).map((m: AiModel) => ({
        modelName: m.modelName || m.modelId,
        modelId: m.modelId || m.modelName,
        timeoutMinutes: m.timeoutMinutes || 10,
      }));
      const payload = { ...values, models };

      if (editing) {
        await api.updateAiProvider(editing.name, payload);
        message.success('供应商已更新');
      } else {
        await api.saveAiProvider(payload);
        message.success('供应商已添加');
      }
      setModalOpen(false);
      fetchAll();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await api.deleteAiProvider(name);
      message.success('已删除');
      fetchAll();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleTest = async (name: string) => {
    setTestingName(name);
    setTestResult(null);
    try {
      const result = await api.testAiProvider(name);
      setTestResult({ name, ...result });
      if (result.success) {
        message.success(`连接成功: ${result.reply || 'OK'}`);
      } else {
        message.error(`连接失败: ${result.error || '未知错误'}`);
      }
    } catch (e: any) {
      setTestResult({ name, success: false, error: e.message });
      message.error(e.message);
    } finally {
      setTestingName(null);
    }
  };

  const handleSyncGptModels = async (name: string) => {
    setSyncingName(name);
    try {
      const result = await api.syncAiProviderGptModels(name);
      message.success(
        `已同步 ${result.gptCount} 个 GPT 文字/视觉模型`
        + (result.addedCount ? `，新增 ${result.addedCount} 个` : ''),
      );
      await fetchAll();
    } catch (e: any) {
      message.error(`模型同步失败: ${e.message}`);
    } finally {
      setSyncingName(null);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', marginTop: 120, textAlign: 'center' }} />;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>系统设置</Title>

      {/* AI Providers */}
      <Card
        title={<Space><ApiOutlined /> AI 模型供应商</Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>添加供应商</Button>}
        style={{ borderRadius: 12, marginBottom: 16 }}
      >
        {providers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '20px 0' : '40px 0' }}>
            <Text type="secondary" style={{ fontSize: 14 }}>尚未配置任何 AI 供应商</Text>
            <br /><br />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>添加第一个供应商</Button>
          </div>
        ) : (
          providers.map((p, idx) => (
            <Card
              key={p.name}
              type="inner"
              title={
                <Space>
                  <CloudServerOutlined />
                  <Text strong>{p.name}</Text>
                  <Tag color={p.enabled ? 'green' : 'default'}>{p.enabled ? '启用' : '禁用'}</Tag>
                  {!p.managed && <Tag color="orange">配置文件</Tag>}
                </Space>
              }
              extra={
                <Space>
                  <Button
                    size="small"
                    icon={<CloudServerOutlined />}
                    loading={syncingName === p.name}
                    onClick={() => handleSyncGptModels(p.name)}
                  >
                    同步 GPT 模型
                  </Button>
                  <Button
                    size="small"
                    icon={<ExperimentOutlined />}
                    loading={testingName === p.name}
                    onClick={() => handleTest(p.name)}
                  >
                    测试连接
                  </Button>
                  {p.managed ? (
                    <>
                      <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(p)}>编辑</Button>
                      <Popconfirm title="确认删除该供应商？" onConfirm={() => handleDelete(p.name)}>
                        <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
                      </Popconfirm>
                    </>
                  ) : (
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(p)}>
                      转为托管
                    </Button>
                  )}
                </Space>
              }
              style={{ marginBottom: idx < providers.length - 1 ? 12 : 0, borderRadius: 8 }}
            >
              {testResult?.name === p.name && (
                <Alert
                  type={testResult.success ? 'success' : 'error'}
                  showIcon
                  icon={testResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  message={testResult.success ? `连接成功${testResult.reply ? ` — ${testResult.reply}` : ''}` : `连接失败 — ${testResult.error}`}
                  closable
                  onClose={() => setTestResult(null)}
                  style={{ marginBottom: 12 }}
                />
              )}
              <Descriptions size="small" column={isMobile ? 1 : 3}>
                <Descriptions.Item label="Endpoint">
                  <Text code style={{ fontSize: 12 }}>{p.endpoint}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="API Key">
                  <Space size={4}>
                    <Text code style={{ fontSize: 12 }}>
                      {p.hasApiKey ? (p.apiKeyMasked || '****') : '未配置'}
                    </Text>
                    {p.hasApiKey && <Tag color="green" icon={<SafetyCertificateOutlined />}>服务端加密</Tag>}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="模型数量">
                  <Tag color="blue">{p.models?.length ?? 0}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="调用协议">
                  <Tag color={p.apiMode === 'chat' ? 'default' : 'purple'}>
                    {p.apiMode === 'responses' ? 'Responses（强制）' : p.apiMode === 'chat' ? 'Chat（兼容）' : 'Responses 优先'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
              {p.models && p.models.length > 0 && (
                <Table
                  size="small"
                  rowKey={(r) => r.modelId || r.modelName}
                  dataSource={p.models}
                  pagination={p.models.length > 20 ? { pageSize: 20, showSizeChanger: false } : false}
                  style={{ marginTop: 8 }}
                  columns={[
                    { title: '模型名称', dataIndex: 'modelName', render: (v: string) => <Text strong>{v}</Text> },
                    { title: '模型 ID', dataIndex: 'modelId', render: (v: string) => <Text code style={{ fontSize: 12 }}>{v}</Text> },
                    { title: '超时（分钟）', dataIndex: 'timeoutMinutes', width: 120, render: (v: number) => v || '-' },
                  ]}
                />
              )}
            </Card>
          ))
        )}
      </Card>

      <Row gutter={[16, 16]}>
        {/* System Config */}
        <Col xs={24} lg={12}>
          <Card
            title={<Space><SettingOutlined /> 运行参数</Space>}
            style={{ borderRadius: 12, height: '100%' }}
          >
            {sysInfo && (
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="服务版本">v{sysInfo.version}</Descriptions.Item>
                <Descriptions.Item label="Python 版本">{sysInfo.python}</Descriptions.Item>
                <Descriptions.Item label="运行平台">{sysInfo.platform}</Descriptions.Item>
                <Descriptions.Item label="服务端口">{sysInfo.port}</Descriptions.Item>
                <Descriptions.Item label="Agent 执行超时">{sysInfo.runTimeout} 秒</Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </Col>

        {/* Feature Flags */}
        <Col xs={24} lg={12}>
          <Card
            title={<Space><SafetyCertificateOutlined /> 功能开关</Space>}
            style={{ borderRadius: 12, height: '100%' }}
          >
            {sysInfo && (
              <div>
                {[
                  { label: '员工委派', desc: `最大深度 ${sysInfo.delegationMaxDepth} 层`, enabled: sysInfo.delegationEnabled },
                  { label: '知识库', desc: '支持上传文档作为员工专属知识', enabled: sysInfo.knowledgeEnabled },
                  { label: 'Shell 执行', desc: '允许 Agent 执行受限 Shell 命令', enabled: sysInfo.shellEnabled },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 0', borderBottom: '1px solid #f0f0f0',
                  }}>
                    <div>
                      <div><Text strong>{item.label}</Text></div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                    </div>
                    <Switch checked={item.enabled} disabled />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Provider Modal */}
      <Modal
        title={editing ? (editing.managed ? '编辑供应商' : '转为托管配置') : '添加 AI 供应商'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        destroyOnHidden
        width={isMobile ? '100%' : 720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item label="供应商名称" name="name" rules={[{ required: true, message: '请输入供应商名称' }]}>
            <Input placeholder="例如: openai、deepseek、aitag" disabled={!!editing} />
          </Form.Item>
          <Form.Item label="Endpoint（接入地址）" name="endpoint" rules={[{ required: true, message: '请输入 API 地址' }]}>
            <Input placeholder="https://api.openai.com/v1/" />
          </Form.Item>
          <Form.Item
            label="API Key"
            name="apiKey"
            rules={editing?.managed ? [] : [{ required: true, message: '请输入 API Key' }]}
            extra={editing?.managed ? '留空表示不修改服务器上已加密保存的 Key' : 'Key 只发送到服务器并加密保存，不会由接口回传'}
          >
            <Input.Password placeholder={editing?.managed ? '留空保持原 Key' : '输入 API Key'} visibilityToggle />
          </Form.Item>
          <Form.Item
            label="模型调用协议"
            name="apiMode"
            extra="推荐“Responses 优先”：GPT-5/o 系列直接走 /v1/responses，自动启用真流式和提示词缓存；供应商明确不支持时才降级 Chat。"
          >
            <Select
              options={[
                { value: 'auto', label: 'Responses 优先（推荐，自动兼容）' },
                { value: 'responses', label: '强制 Responses API' },
                { value: 'chat', label: '强制 Chat Completions' },
              ]}
            />
          </Form.Item>
          <Form.Item label="启用" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Divider orientation="left" plain style={{ fontSize: 13 }}>模型列表</Divider>
          <Form.List name="models">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={[8, 8]} align="middle" style={{ marginBottom: 8 }}>
                    <Col xs={24} sm={8}>
                      <Form.Item {...restField} name={[name, 'modelName']} noStyle>
                        <Input placeholder="模型名称" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item {...restField} name={[name, 'modelId']} noStyle>
                        <Input placeholder="模型 ID" />
                      </Form.Item>
                    </Col>
                    <Col xs={16} sm={5}>
                      <Form.Item {...restField} name={[name, 'timeoutMinutes']} noStyle>
                        <InputNumber placeholder="超时(分)" min={1} max={120} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={8} sm={3} style={{ textAlign: 'center' }}>
                      {fields.length > 1 && (
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                      )}
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" onClick={() => add({ modelName: '', modelId: '', timeoutMinutes: 10 })} icon={<PlusOutlined />} block>
                  添加模型
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
