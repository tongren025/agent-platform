import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Switch, InputNumber,
  TimePicker, Tag, Space, Popconfirm, message, Drawer, Row, Col, Tooltip,
  Empty, Typography, Alert, Statistic, Image, Spin,
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined,
  ThunderboltOutlined, PictureOutlined, CopyOutlined, HeartFilled,
  ClockCircleOutlined, RobotOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '../api';

const { Text, Paragraph } = Typography;

// 图片加载失败时的灰底占位（避免外站签名 URL 过期/防盗链导致破图）
const IMG_FALLBACK =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160">' +
    '<rect width="100%" height="100%" fill="#f0f0f0"/>' +
    '<text x="50%" y="50%" fill="#bbb" font-size="14" text-anchor="middle" dominant-baseline="middle">图片已失效</text></svg>'
  );

const PLATFORMS = [
  { value: 'jimeng', label: '即梦 · 图片', defaultUrl: 'https://jimeng.jianying.com/ai-tool/home/' },
  { value: 'jimeng', label: '即梦 · 视频', defaultUrl: 'https://jimeng.jianying.com/ai-tool/home/video' },
  { value: 'xyq', label: '小云雀（需登录）', defaultUrl: 'https://xyq.jianying.com/home?from_page=xiaoyunque_landing_page&tab_name=home' },
];

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  success: { color: 'green', text: '成功' },
  failed: { color: 'red', text: '失败' },
  needs_login: { color: 'orange', text: '需登录' },
  '': { color: 'default', text: '未运行' },
};

export default function AutoLearn() {
  const [sources, setSources] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const [runningCode, setRunningCode] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSource, setDrawerSource] = useState<any | null>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [src, emp] = await Promise.all([
        api.listScrapeSources(),
        api.listEmployees().catch(() => []),
      ]);
      setSources(src);
      setEmployees(emp);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      platform: 'jimeng',
      url: PLATFORMS[0].defaultUrl,
      scheduleTime: dayjs('09:00', 'HH:mm'),
      maxItems: 40,
      enabled: true,
    });
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue({
      sourceCode: record.sourceCode,
      name: record.name,
      platform: record.platform,
      url: record.url,
      targetEmployeeKey: record.targetEmployeeKey || undefined,
      scheduleTime: record.scheduleTime ? dayjs(record.scheduleTime, 'HH:mm') : dayjs('09:00', 'HH:mm'),
      maxItems: record.maxItems,
      enabled: record.enabled,
    });
    setModalOpen(true);
  };

  const onPlatformChange = (val: string) => {
    const p = PLATFORMS.find(x => x.value === val);
    if (p && !editing) form.setFieldValue('url', p.defaultUrl);
  };

  const handleSave = async () => {
    try {
      const v = await form.validateFields();
      setSaving(true);
      const payload = {
        ...v,
        scheduleTime: v.scheduleTime ? dayjs(v.scheduleTime).format('HH:mm') : '09:00',
        targetEmployeeKey: v.targetEmployeeKey || '',
        maxItems: v.maxItems ?? 40,
      };
      if (editing) {
        await api.updateScrapeSource(editing.sourceCode, payload);
        message.success('已更新');
      } else {
        await api.saveScrapeSource(payload);
        message.success('采集源已创建');
      }
      setModalOpen(false);
      fetchAll();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await api.deleteScrapeSource(code);
      message.success('已删除');
      fetchAll();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleRun = async (code: string) => {
    setRunningCode(code);
    try {
      const r = await api.runScrapeSource(code);
      if (r.status === 'success') {
        message.success(`采集完成：新增 ${r.newCount} 条，累计 ${r.totalCount} 条`);
      } else if (r.status === 'needs_login') {
        message.warning(r.message || '该平台需要登录');
      } else {
        message.error(r.message || '采集失败');
      }
      fetchAll();
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setRunningCode(null);
    }
  };

  const openPrompts = async (record: any) => {
    setDrawerSource(record);
    setPrompts([]);
    setDrawerOpen(true);
    setPromptsLoading(true);
    try {
      const p = await api.listScrapePrompts(record.sourceCode, 200);
      setPrompts(p);
    } catch (e: any) {
      message.error(e?.message || '加载失败');
      setPrompts([]);
    } finally {
      setPromptsLoading(false);
    }
  };

  const copyPrompt = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // 非安全上下文（局域网 IP 明文访问）降级
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      message.success('提示词已复制');
    } catch {
      message.error('当前环境不支持自动复制，请手动选择文本复制');
    }
  };

  const empName = (key: string) => employees.find(e => e.employeeKey === key)?.name || key || '—';

  const columns = [
    {
      title: '采集源',
      dataIndex: 'name',
      render: (v: string, r: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.sourceCode}</Text>
        </Space>
      ),
    },
    {
      title: '平台',
      dataIndex: 'platform',
      render: (v: string) => {
        const p = PLATFORMS.find(x => x.value === v);
        return <Tag color={v === 'jimeng' ? 'blue' : 'gold'}>{p?.label || v}</Tag>;
      },
    },
    {
      title: '注入员工',
      dataIndex: 'targetEmployeeKey',
      render: (v: string) => v ? <Tag icon={<RobotOutlined />}>{empName(v)}</Tag> : <Text type="secondary">未设置</Text>,
    },
    {
      title: '定时',
      dataIndex: 'scheduleTime',
      render: (v: string, r: any) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: r.enabled ? '#1677ff' : '#bbb' }} />
          <span>每日 {v}</span>
        </Space>
      ),
    },
    {
      title: '最近运行',
      key: 'lastRun',
      render: (_: any, r: any) => {
        const s = STATUS_MAP[r.lastStatus] || STATUS_MAP[''];
        return (
          <Space direction="vertical" size={0}>
            <Tag color={s.color}>{s.text}</Tag>
            {r.lastRunAt && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {dayjs(r.lastRunAt).format('MM-DD HH:mm')} · 累计 {r.totalCollected}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 280,
      render: (_: any, r: any) => (
        <Space size={4} wrap>
          <Button
            type="primary" size="small" icon={<ThunderboltOutlined />}
            loading={runningCode === r.sourceCode}
            onClick={() => handleRun(r.sourceCode)}
          >立即采集</Button>
          <Button size="small" icon={<PictureOutlined />} onClick={() => openPrompts(r)}>
            提示词库
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="确认删除该采集源及其数据？" onConfirm={() => handleDelete(r.sourceCode)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalCollected = sources.reduce((sum, s) => sum + (s.totalCollected || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>自动学习 · 提示词采集</Typography.Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAll}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建采集源</Button>
        </Space>
      </div>

      <Alert
        type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }}
        message="工作原理"
        description={
          <span>
            系统每天定时从配置的网页抓取热门作品的提示词，自动去重后写入「注入员工」的知识库。
            该员工对话时即可参考这些真实热门案例来生成更好的提示词 / 图片 / 视频。
            即梦（Dreamina）首页公开数据可直接抓取；小云雀需登录态，暂不支持服务端采集。
          </span>
        }
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Statistic title="采集源" value={sources.length} prefix={<ThunderboltOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Statistic title="累计提示词" value={totalCollected} prefix={<PictureOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Statistic title="启用中" value={sources.filter(s => s.enabled).length} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Table
          rowKey="sourceCode"
          columns={columns as any}
          dataSource={sources}
          loading={loading}
          pagination={false}
          locale={{ emptyText: <Empty description="还没有采集源，点击右上角新建" /> }}
        />
      </Card>

      {/* 新建 / 编辑 采集源 */}
      <Modal
        title={editing ? '编辑采集源' : '新建采集源'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        destroyOnHidden
        forceRender
        width={640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="标识 (sourceCode)" name="sourceCode" rules={[{ required: true, message: '请输入唯一标识' }]}>
                <Input placeholder="如 jimeng-daily" disabled={!!editing} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder="如 即梦每日灵感" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="平台" name="platform" rules={[{ required: true }]}>
            <Select options={PLATFORMS.map(p => ({ label: p.label, value: p.value }))} onChange={onPlatformChange} />
          </Form.Item>
          <Form.Item label="采集地址" name="url" rules={[{ required: true, message: '请输入采集地址' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item
            label="注入员工"
            name="targetEmployeeKey"
            extra="采集到的提示词将写入该员工的知识库；不选则只入库不注入。"
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="选择一个数字员工"
              options={employees.map(e => ({ label: `${e.name} (${e.employeeKey})`, value: e.employeeKey }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="每日采集时间" name="scheduleTime" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={5} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="单次最多抓取" name="maxItems">
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="启用定时" name="enabled" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 提示词库抽屉 */}
      <Drawer
        title={
          <Space>
            <PictureOutlined />
            {drawerSource?.name} · 提示词库
            <Tag>{prompts.length} 条</Tag>
          </Space>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={760}
      >
        {promptsLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
        ) : prompts.length === 0 ? (
          <Empty description="还没有采集到提示词，先点「立即采集」" />
        ) : (
          <Row gutter={[12, 12]}>
            {prompts.map((p) => (
              <Col span={12} key={p.externalId}>
                <Card
                  size="small"
                  style={{ borderRadius: 10, height: '100%' }}
                  cover={p.imageUrl ? (
                    <div style={{ height: 160, overflow: 'hidden', borderRadius: '10px 10px 0 0', background: '#fafafa' }}>
                      <Image
                        src={p.imageUrl}
                        height={160}
                        width="100%"
                        style={{ objectFit: 'cover' }}
                        fallback={IMG_FALLBACK}
                      />
                    </div>
                  ) : undefined}
                >
                  <Space style={{ marginBottom: 6 }} size={6} wrap>
                    <Tag color={p.itemType === 'video' ? 'purple' : 'blue'}>
                      {p.itemType === 'video' ? '视频' : '图片'}
                    </Tag>
                    <Tooltip title="收藏数">
                      <span style={{ color: '#eb2f96', fontSize: 12 }}>
                        <HeartFilled /> {p.favoriteNum}
                      </span>
                    </Tooltip>
                    <Text type="secondary" style={{ fontSize: 12 }}>@{p.author || '匿名'}</Text>
                  </Space>
                  <Paragraph
                    ellipsis={{ rows: 4, expandable: true, symbol: '展开' }}
                    style={{ fontSize: 12, marginBottom: 8 }}
                  >
                    {p.prompt}
                  </Paragraph>
                  <Button size="small" icon={<CopyOutlined />} onClick={() => copyPrompt(p.prompt)} block>
                    复制提示词
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Drawer>
    </div>
  );
}
