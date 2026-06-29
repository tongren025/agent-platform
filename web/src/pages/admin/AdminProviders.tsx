import { useEffect, useState } from 'react';
import {
  Table, Tag, Space, Button, Modal, Form, Input, Switch, message, Spin, Popconfirm, Card, Row, Col,
} from 'antd';
import {
  PlusOutlined, ApiOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined,
  DeleteOutlined, MinusCircleOutlined,
} from '@ant-design/icons';
import { adminApi, type AdminProvider, type TestResult } from '../../adminApi';
import { COLORS } from '../../theme';

export default function AdminProviders() {
  const [list, setList] = useState<AdminProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProvider | null>(null);
  const [form] = Form.useForm();
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const fetch = () => {
    setLoading(true);
    adminApi
      .listProviders()
      .then(setList)
      .catch((e) => message.error(e.message || '加载失败'))
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ enabled: true, models: [{ modelId: '' }] });
    setOpen(true);
  };

  const openEdit = (record: AdminProvider) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      endpoint: record.endpoint,
      apiKey: '',
      enabled: record.enabled,
      models: record.models?.length ? record.models.map((m) => ({ modelId: m.modelId || m.modelName || '' })) : [{ modelId: '' }],
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const models = (values.models || [])
        .filter((m: any) => m.modelId?.trim())
        .map((m: any) => ({ modelId: m.modelId.trim() }));

      if (editing) {
        await adminApi.updateProvider(editing.name, {
          name: editing.name,
          endpoint: values.endpoint,
          apiKey: values.apiKey || '',
          enabled: values.enabled,
          models,
        });
        message.success('更新成功');
      } else {
        await adminApi.saveProvider({
          name: values.name,
          endpoint: values.endpoint,
          apiKey: values.apiKey || '',
          enabled: values.enabled,
          models,
        });
        message.success('创建成功');
      }
      setOpen(false);
      fetch();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await adminApi.deleteProvider(name);
      message.success('已删除');
      fetch();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleTest = async (name: string) => {
    setTesting((prev) => ({ ...prev, [name]: true }));
    try {
      const result = await adminApi.testProvider(name);
      setTestResults((prev) => ({ ...prev, [name]: result }));
      if (result.success) {
        message.success(`连通成功：${result.model}`);
      } else {
        message.error(`连通失败：${result.error}`);
      }
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setTesting((prev) => ({ ...prev, [name]: false }));
    }
  };

  const columns = [
    {
      title: '服务商',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, r: AdminProvider) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: `${COLORS.iris}1a`, color: COLORS.iris,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}
          >
            <ApiOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{v}</div>
            <div style={{ fontSize: 12, color: COLORS.slate, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.endpoint}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'API Key',
      dataIndex: 'apiKeyMasked',
      key: 'apiKey',
      render: (v: string) => <span style={{ fontFamily: 'monospace', fontSize: 12, color: COLORS.slate }}>{v}</span>,
    },
    {
      title: '模型',
      dataIndex: 'models',
      key: 'models',
      render: (models: AdminProvider['models']) =>
        models?.length ? (
          <Space size={4} wrap>
            {models.map((m, i) => (
              <Tag key={i} style={{ borderRadius: 5 }}>
                {m.modelId || m.modelName || '未命名'}
              </Tag>
            ))}
          </Space>
        ) : (
          <span style={{ color: COLORS.slate }}>无模型</span>
        ),
    },
    {
      title: '来源',
      key: 'managed',
      dataIndex: 'managed',
      render: (v: boolean) => (
        <Tag style={{ borderRadius: 5, background: v ? '#f6ffed' : '#f0f5ff', border: 'none', color: v ? '#52c41a' : '#2f54eb' }}>
          {v ? '用户配置' : '系统配置'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (v: boolean) => (
        <Tag
          style={{
            borderRadius: 5,
            background: v ? '#ecfdf5' : '#f8f9fc',
            color: v ? COLORS.mint : COLORS.slate,
            border: v ? '1px solid #d1fae5' : '1px solid #eef0f6',
          }}
        >
          {v ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '连通性',
      key: 'test',
      render: (_: unknown, r: AdminProvider) => {
        const t = testing[r.name];
        const res = testResults[r.name];
        return (
          <Space>
            <Button size="small" loading={t} onClick={() => handleTest(r.name)}>
              测试
            </Button>
            {res && !t && (
              res.success
                ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            )}
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, r: AdminProvider) => (
        <Space>
          {r.managed && <Button type="link" size="small" onClick={() => openEdit(r)}>编辑</Button>}
          {r.managed && (
            <Popconfirm title={`确认删除「${r.name}」？`} onConfirm={() => handleDelete(r.name)}>
              <Button type="link" size="small" danger>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: COLORS.slateDark }}>AI 服务商</h1>
          <div style={{ color: COLORS.slate, fontSize: 14, marginTop: 4 }}>
            管理 AI 模型供应商配置：增删改查、连通测试
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          添加服务商
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${COLORS.iris}1a`, color: COLORS.iris, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                <ApiOutlined />
              </div>
              <div>
                <div style={{ fontSize: 12, color: COLORS.slate }}>服务商总数</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{list.length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf51a', color: COLORS.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                <CheckCircleOutlined />
              </div>
              <div>
                <div style={{ fontSize: 12, color: COLORS.slate }}>已启用</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{list.filter((p) => p.enabled).length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${COLORS.irisLight}1a`, color: COLORS.irisLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                <ApiOutlined />
              </div>
              <div>
                <div style={{ fontSize: 12, color: COLORS.slate }}>模型总数</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{list.reduce((s, p) => s + (p.models?.length || 0), 0)}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table rowKey="name" columns={columns} dataSource={list} pagination={{ pageSize: 20 }} size="middle" />
      )}

      <Modal
        title={editing ? `编辑服务商 — ${editing.name}` : '添加服务商'}
        open={open}
        onOk={handleSave}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        forceRender
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入服务商名称' }]}>
            <Input disabled={!!editing} placeholder="唯一标识，如 openai / deepseek" />
          </Form.Item>
          <Form.Item label="Endpoint" name="endpoint" rules={[{ required: true, message: '请输入 API 地址' }]}>
            <Input placeholder="https://api.openai.com/v1" />
          </Form.Item>
          <Form.Item label="API Key" name="apiKey">
            <Input.Password placeholder={editing ? '留空保持原 Key 不变' : '输入 API Key'} />
          </Form.Item>
          <Form.Item label="启用" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.List name="models">
            {(fields, { add, remove }) => (
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>模型列表</div>
                {fields.map(({ key, name, ...rest }) => (
                  <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Form.Item {...rest} name={[name, 'modelId']} style={{ flex: 1, marginBottom: 0 }}>
                      <Input placeholder="模型 ID，如 gpt-4o" />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add({ modelId: '' })} icon={<PlusOutlined />} style={{ width: '100%' }}>
                  添加模型
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
