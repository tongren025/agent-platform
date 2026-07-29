// 提示词采集页：采集源 CRUD、手动触发、已采提示词与历史查看。
import { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Switch, InputNumber, TimePicker, Tag, Space, Popconfirm, Drawer, Row, Col, Tooltip, Empty, Typography, Alert, Statistic, Image, Spin } from 'antd';
import { message } from '../ui';
import {
  PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined,
  ThunderboltOutlined, PictureOutlined, CopyOutlined, HeartFilled,
  ClockCircleOutlined, RobotOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '../api';
import { readInputHabit, writeInputHabit } from '../hooks/useInputHabit';
import { useResponsive } from '../hooks/useResponsive';

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

export default function AutoLearn({ embedded = false }: { embedded?: boolean }) {
  const { isMobile } = useResponsive();
  const [sources, setSources] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [employeesError, setEmployeesError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const [runningCode, setRunningCode] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSource, setDrawerSource] = useState<any | null>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsError, setPromptsError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setLoadError('');
    setEmployeesError('');
    try {
      const [src, emp] = await Promise.all([
        api.listScrapeSources(),
        api.listEmployees().catch(() => {
          setEmployeesError('数字员工列表暂时无法加载；现有参考来源仍可查看。');
          return [];
        }),
      ]);
      setSources(src);
      setEmployees(emp);
    } catch {
      setLoadError('暂时无法加载参考来源，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    const remembered = readInputHabit<Record<string, any>>('learning.prompt-source-preferences', {});
    const platform = remembered.platform || 'jimeng';
    form.setFieldsValue({
      platform,
      url: PLATFORMS.find(item => item.value === platform)?.defaultUrl || PLATFORMS[0].defaultUrl,
      targetEmployeeKey: remembered.targetEmployeeKey,
      scheduleTime: dayjs(remembered.scheduleTime || '09:00', 'HH:mm'),
      maxItems: remembered.maxItems ?? 40,
      enabled: remembered.enabled !== false,
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
        writeInputHabit('learning.prompt-source-preferences', {
          platform: v.platform || 'jimeng',
          targetEmployeeKey: v.targetEmployeeKey || undefined,
          scheduleTime: payload.scheduleTime,
          maxItems: payload.maxItems,
          enabled: v.enabled !== false,
        });
        message.success('参考来源已添加');
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
        message.success(`收集完成：新增 ${r.newCount} 条，累计 ${r.totalCount} 条`);
      } else if (r.status === 'needs_login') {
        message.warning(r.message || '该平台需要登录');
      } else {
        message.error(r.message || '收集失败');
      }
      fetchAll();
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setRunningCode(null);
    }
  };

  const fetchPrompts = async (record: any) => {
    setPromptsLoading(true);
    setPromptsError('');
    try {
      const p = await api.listScrapePrompts(record.sourceCode, 200);
      setPrompts(p);
    } catch {
      setPromptsError('暂时无法加载已收集的提示词，请稍后重试。');
      setPrompts([]);
    } finally {
      setPromptsLoading(false);
    }
  };

  const openPrompts = (record: any) => {
    setDrawerSource(record);
    setPrompts([]);
    setDrawerOpen(true);
    void fetchPrompts(record);
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
      title: '参考来源',
      dataIndex: 'name',
      render: (v: string, r: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>定时收集创作参考</Text>
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
      title: '提供给',
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
          >立即收集</Button>
          <Button size="small" icon={<PictureOutlined />} onClick={() => openPrompts(r)}>
            查看提示词
          </Button>
          <Button size="small" icon={<EditOutlined />} aria-label={`编辑${r.name}`} onClick={() => openEdit(r)} />
          <Popconfirm title="确认删除这个参考来源及其数据？" onConfirm={() => handleDelete(r.sourceCode)}>
            <Button size="small" danger icon={<DeleteOutlined />} aria-label={`删除${r.name}`} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalCollected = sources.reduce((sum, s) => sum + (s.totalCollected || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: embedded ? 'flex-end' : 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        {!embedded && <Typography.Title level={4} style={{ margin: 0 }}>收集创作参考 · 热门提示词</Typography.Title>}
        <Space>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={fetchAll}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>添加参考来源</Button>
        </Space>
      </div>

      <Alert
        type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }}
        message="工作原理"
        description={
          <span>
            系统会定时从你配置的网页收集热门作品提示词，去重后提供给指定的数字员工。
            后续对话和创作时，它可以参考这些案例来生成提示词、图片或视频。
            即梦首页的公开内容可直接收集；需要登录的平台暂时不支持自动收集。
          </span>
        }
      />

      <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Statistic title="参考来源" value={sources.length} prefix={<ThunderboltOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Statistic title="已收集提示词" value={totalCollected} prefix={<PictureOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Statistic title="启用中" value={sources.filter(s => s.enabled).length} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {loading && (
        <div role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
          正在加载参考来源
        </div>
      )}
      {loadError && (
        <Alert
          role="alert"
          type="error"
          showIcon
          message="参考来源加载失败"
          description={loadError}
          action={<Button size="small" onClick={fetchAll}>重试</Button>}
          style={{ marginBottom: 12 }}
        />
      )}
      {employeesError && (
        <Alert
          role="alert"
          type="warning"
          showIcon
          message={employeesError}
          action={<Button size="small" onClick={fetchAll}>重试</Button>}
          style={{ marginBottom: 12 }}
        />
      )}
      <Card style={{ borderRadius: 12 }}>
        <Table
          rowKey="sourceCode"
          columns={columns as any}
          dataSource={sources}
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
          locale={{
            emptyText: loadError
              ? <div role="alert" style={{ padding: 24 }}>数据未加载，请点击上方“重试”。</div>
              : <Empty image={<img src="/empty-create.svg" alt="" width={120} />} description="还没有参考来源，点击右上角添加" />,
          }}
        />
      </Card>

      {/* 新建 / 编辑 采集源 */}
      <Modal
        title={editing ? '编辑参考来源' : '添加参考来源'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        destroyOnHidden
        width={isMobile ? '100%' : 640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="来源标识" name="sourceCode" rules={[{ required: true, message: '请输入唯一标识' }]} extra="仅用于区分不同来源，创建后不可修改">
                <Input placeholder="例如 jimeng-daily" disabled={!!editing} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder="如 即梦每日灵感" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="平台" name="platform" rules={[{ required: true }]}>
            <Select options={PLATFORMS.map(p => ({ label: p.label, value: p.value }))} onChange={onPlatformChange} />
          </Form.Item>
          <Form.Item label="内容网址" name="url" rules={[{ required: true, message: '请输入内容网址' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item
            label="提供给数字员工"
            name="targetEmployeeKey"
            extra="收集到的提示词会供这个数字员工后续创作时参考；不选则只保存在资料库中。"
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
            <Col xs={12} sm={8}>
              <Form.Item label="每日收集时间" name="scheduleTime" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={5} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item label="单次最多收集" name="maxItems">
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
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
        width={isMobile ? '100%' : 760}
      >
        {promptsLoading ? (
          <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: isMobile ? '30px 0' : '60px 0' }}>
            <Spin size="large" />
            <Text type="secondary" style={{ display: 'block', marginTop: 10 }}>正在加载提示词…</Text>
          </div>
        ) : promptsError ? (
          <Alert
            role="alert"
            type="error"
            showIcon
            message="提示词加载失败"
            description={promptsError}
            action={<Button size="small" onClick={() => drawerSource && fetchPrompts(drawerSource)}>重试</Button>}
          />
        ) : prompts.length === 0 ? (
          <Empty image={<img src="/empty-data.svg" alt="" width={120} />} description="还没有收集到提示词，先点「立即收集」" />
        ) : (
          <Row gutter={[12, 12]}>
            {prompts.map((p) => (
              <Col xs={24} sm={12} key={p.externalId}>
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
