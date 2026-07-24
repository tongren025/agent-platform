// 文章学习页：学习源 CRUD、手动触发、学习历史（网页→LLM 总结→知识库+记忆）。
import { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Switch, InputNumber, TimePicker, Tag, Space, Popconfirm, Alert, Row, Col, Statistic, Typography, Drawer, Empty, Spin } from 'antd';
import { message } from '../ui';
import {
  PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined,
  ReadOutlined, ClockCircleOutlined, RobotOutlined, HistoryOutlined,
  LinkOutlined, FileTextOutlined, BookOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '../api';
import { COLORS } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  success: { color: 'green', text: '成功' },
  partial: { color: 'orange', text: '部分成功' },
  failed: { color: 'red', text: '失败' },
  '': { color: 'default', text: '未运行' },
};

export default function ArticleLearn({ embedded = false }: { embedded?: boolean }) {
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySource, setHistorySource] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [articleDetail, setArticleDetail] = useState<any | null>(null);
  const [detailTab, setDetailTab] = useState<'original' | 'summary'>('original');

  const fetchAll = async () => {
    setLoading(true);
    setLoadError('');
    setEmployeesError('');
    try {
      const [src, emp] = await Promise.all([api.listLearnSources(), api.listEmployees().catch(() => {
        setEmployeesError('数字员工列表暂时无法加载；现有文章来源仍可查看。');
        return [];
      })]);
      setSources(src); setEmployees(emp);
    } catch {
      setLoadError('暂时无法加载文章来源，请稍后重试。');
    }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null); form.resetFields();
    form.setFieldsValue({ scheduleTime: dayjs('02:00', 'HH:mm'), maxArticles: 10, enabled: true });
    setModalOpen(true);
  };
  const openEdit = (r: any) => {
    setEditing(r);
    form.setFieldsValue({
      sourceCode: r.sourceCode, name: r.name, targetEmployeeKey: r.targetEmployeeKey || undefined,
      roleHint: r.roleHint, urls: (r.urls || []).join('\n'),
      scheduleTime: r.scheduleTime ? dayjs(r.scheduleTime, 'HH:mm') : dayjs('02:00', 'HH:mm'),
      maxArticles: r.maxArticles, enabled: r.enabled,
    });
    setModalOpen(true);
  };
  const handleSave = async () => {
    try {
      const v = await form.validateFields();
      setSaving(true);
      const payload = {
        ...v,
        urls: (v.urls || '').split('\n').map((s: string) => s.trim()).filter(Boolean),
        scheduleTime: v.scheduleTime ? dayjs(v.scheduleTime).format('HH:mm') : '02:00',
        maxArticles: v.maxArticles ?? 10,
      };
      if (editing) { await api.updateLearnSource(editing.sourceCode, payload); message.success('已更新'); }
      else { await api.saveLearnSource(payload); message.success('文章来源已添加'); }
      setModalOpen(false); fetchAll();
    } catch (e: any) { if (e.message) message.error(e.message); }
    finally { setSaving(false); }
  };
  const handleDelete = async (code: string) => {
    try { await api.deleteLearnSource(code); message.success('已删除'); fetchAll(); }
    catch (e: any) { message.error(e.message); }
  };
  const handleRun = async (code: string) => {
    setRunningCode(code);
    try {
      const r = await api.runLearnSource(code);
      const s = STATUS_MAP[r.status] || STATUS_MAP[''];
      message[r.status === 'failed' ? 'error' : 'success'](`${s.text}：${r.message}`);
      fetchAll();
    } catch (e: any) { message.error(e.message); }
    finally { setRunningCode(null); }
  };
  const openHistory = async (r: any) => {
    setHistorySource(r); setHistory([]); setHistoryOpen(true); setHistoryLoading(true); setHistoryError('');
    try { setHistory(await api.listLearnHistory(r.sourceCode)); }
    catch {
      setHistory([]);
      setHistoryError('暂时无法加载学习记录，请稍后重试。');
    }
    finally { setHistoryLoading(false); }
  };

  const empName = (key: string) => employees.find(e => e.employeeKey === key)?.name || key || '—';
  const totalLearned = sources.reduce((sum, s) => sum + (s.totalLearned || 0), 0);

  const columns = [
    { title: '文章来源', dataIndex: 'name', render: (v: string, r: any) => (
      <Space direction="vertical" size={0}><Text strong>{v}</Text><Text type="secondary" style={{ fontSize: 12 }}>定时整理文章资料</Text></Space>
    )},
    { title: '提供给', dataIndex: 'targetEmployeeKey', render: (v: string) => v ? <Tag icon={<RobotOutlined />}>{empName(v)}</Tag> : <Text type="secondary">未设置</Text> },
    { title: '文章数', dataIndex: 'urls', render: (v: string[]) => <Tag>{(v || []).length} 篇</Tag> },
    { title: '定时', dataIndex: 'scheduleTime', render: (v: string, r: any) => (
      <Space size={4}><ClockCircleOutlined style={{ color: r.enabled ? COLORS.iris : '#bbb' }} /><span>每日 {v}</span></Space>
    )},
    { title: '最近运行', key: 'lastRun', render: (_: any, r: any) => {
      const s = STATUS_MAP[r.lastStatus] || STATUS_MAP[''];
      return (
        <Space direction="vertical" size={0}>
          <Tag color={s.color}>{s.text}</Tag>
          {r.lastRunAt && <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(r.lastRunAt).format('MM-DD HH:mm')} · 累计 {r.totalLearned}</Text>}
        </Space>
      );
    }},
    { title: '启用', dataIndex: 'enabled', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
    { title: '操作', key: 'actions', width: 280, render: (_: any, r: any) => (
      <Space size={4} wrap>
        <Button type="primary" size="small" icon={<ThunderboltOutlined />} loading={runningCode === r.sourceCode} onClick={() => handleRun(r.sourceCode)}>立即整理</Button>
        <Button size="small" icon={<HistoryOutlined />} onClick={() => openHistory(r)}>学习记录</Button>
        <Button size="small" icon={<EditOutlined />} aria-label={`编辑${r.name}`} onClick={() => openEdit(r)} />
        <Popconfirm title="确认删除这个文章来源？" onConfirm={() => handleDelete(r.sourceCode)}>
          <Button size="small" danger icon={<DeleteOutlined />} aria-label={`删除${r.name}`} />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: embedded ? 'flex-end' : 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        {!embedded && <Typography.Title level={4} style={{ margin: 0 }}>收集创作参考 · 文章资料</Typography.Title>}
        <Space wrap>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={fetchAll}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>添加文章来源</Button>
        </Space>
      </div>

      <Alert
        type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }}
        message="工作原理"
        description="系统会定时读取你配置的文章网址，提炼成可复用的专业知识，并提供给指定的数字员工。后续回答和创作时，它会参考这些文章资料。"
      />

      <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}><Card size="small" style={{ borderRadius: 10 }}><Statistic title="文章来源" value={sources.length} prefix={<ReadOutlined />} /></Card></Col>
        <Col xs={24} sm={8}><Card size="small" style={{ borderRadius: 10 }}><Statistic title="已整理文章" value={totalLearned} prefix={<ThunderboltOutlined />} /></Card></Col>
        <Col xs={24} sm={8}><Card size="small" style={{ borderRadius: 10 }}><Statistic title="启用中" value={sources.filter(s => s.enabled).length} prefix={<ClockCircleOutlined />} /></Card></Col>
      </Row>

      {loading && (
        <div role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
          正在加载文章来源
        </div>
      )}
      {loadError && (
        <Alert
          role="alert"
          type="error"
          showIcon
          message="文章来源加载失败"
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
        <Table rowKey="sourceCode" columns={columns as any} dataSource={sources} loading={loading} pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: loadError
              ? <div role="alert" style={{ padding: 24 }}>数据未加载，请点击上方“重试”。</div>
              : <Empty image={<img src="/empty-create.svg" alt="" width={120} />} description="还没有文章来源，点击右上角添加" />,
          }} />
      </Card>

      <Modal title={editing ? '编辑文章来源' : '添加文章来源'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} confirmLoading={saving} destroyOnHidden forceRender width={isMobile ? '100%' : 640}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}><Form.Item label="来源标识" name="sourceCode" rules={[{ required: true, message: '请输入唯一标识' }, { pattern: /^[\w-]+$/, message: '只允许字母、数字、下划线和短横线' }]} extra="仅用于区分不同来源，创建后不可修改"><Input placeholder="例如 design-blogs" disabled={!!editing} /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label="显示名称" name="name" rules={[{ required: true, message: '请输入名称' }]}><Input placeholder="例如 设计灵感周刊" /></Form.Item></Col>
          </Row>
          <Form.Item label="提供给数字员工" name="targetEmployeeKey" rules={[{ required: true, message: '请选择员工' }]} extra="整理后的知识会供这个数字员工后续回答和创作时参考">
            <Select showSearch optionFilterProp="label" placeholder="选择一个数字员工"
              options={employees.map(e => ({ label: `${e.name} (${e.employeeKey})`, value: e.employeeKey }))} />
          </Form.Item>
          <Form.Item label="文章网址（每行一个）" name="urls" rules={[{ required: true, message: '至少一个网址' }]}>
            <TextArea rows={5} placeholder={'https://example.com/article-1\nhttps://example.com/article-2'} />
          </Form.Item>
          <Form.Item label="关注领域（可选）" name="roleHint" extra="例如“分镜设计”或“古风服饰”，帮助系统提炼更相关的重点">
            <Input placeholder="如 漫剧分镜设计" />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={8}><Form.Item label="每日学习时间" name="scheduleTime" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={5} /></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item label="单次最多学习" name="maxArticles"><InputNumber min={1} max={50} style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item label="启用定时" name="enabled" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Drawer title={`学习记录 · ${historySource?.name ?? ''}`} open={historyOpen} onClose={() => setHistoryOpen(false)} width={isMobile ? '100%' : 640}>
        {historyLoading ? <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: 40 }}><Spin /><Text type="secondary" style={{ display: 'block', marginTop: 10 }}>正在加载学习记录…</Text></div>
          : historyError ? (
            <Alert
              role="alert"
              type="error"
              showIcon
              message="学习记录加载失败"
              description={historyError}
              action={<Button size="small" onClick={() => historySource && openHistory(historySource)}>重试</Button>}
            />
          )
          : history.length === 0 ? <Empty image={<img src="/empty-data.svg" alt="" width={120} />} description="暂无运行记录" />
          : history.map((h, i) => (
            <Card key={i} size="small" style={{ marginBottom: 12, borderRadius: 10 }}>
              <Space style={{ marginBottom: 8 }} wrap>
                <Tag color={(STATUS_MAP[h.status] || STATUS_MAP['']).color}>{(STATUS_MAP[h.status] || STATUS_MAP['']).text}</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>{h.finishedAt ? dayjs(h.finishedAt).format('MM-DD HH:mm') : ''}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>成功 {h.learnedCount}/{h.totalUrls}</Text>
              </Space>
              {(h.articles || []).map((a: any, j: number) => (
                <div key={j} style={{ fontSize: 12, padding: '6px 0', borderTop: j ? '1px solid #f5f5f8' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Tag color={a.status === 'ok' ? 'green' : 'red'} style={{ fontSize: 10 }}>{a.status === 'ok' ? 'OK' : '失败'}</Tag>
                    <Text strong style={{ fontSize: 12 }}>{a.title || '(无标题)'}</Text>
                    {a.status === 'ok' && <Text type="secondary" style={{ fontSize: 11 }}>+{a.memoriesAdded} 记忆 · {a.charCount} 字</Text>}
                  </div>
                  {a.url && (
                    <div style={{ marginTop: 2, paddingLeft: 4 }}>
                      <a href={a.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: COLORS.iris }}>
                        <LinkOutlined style={{ marginRight: 3 }} />{a.url.length > 60 ? a.url.slice(0, 60) + '…' : a.url}
                      </a>
                    </div>
                  )}
                  {a.status === 'ok' && (a.originalContent || a.summary) && (
                    <Space size={4} style={{ marginTop: 4, paddingLeft: 4 }}>
                      {a.originalContent && <Button type="link" size="small" icon={<FileTextOutlined />} style={{ fontSize: 11, padding: 0, height: 'auto' }} onClick={() => { setArticleDetail(a); setDetailTab('original'); }}>原文</Button>}
                      {a.summary && <Button type="link" size="small" icon={<BookOutlined />} style={{ fontSize: 11, padding: 0, height: 'auto' }} onClick={() => { setArticleDetail(a); setDetailTab('summary'); }}>AI 总结</Button>}
                    </Space>
                  )}
                  {a.message && <Paragraph type="danger" style={{ fontSize: 11, margin: '2px 0 0' }}>{a.message}</Paragraph>}
                </div>
              ))}
            </Card>
          ))}
      </Drawer>

      <Drawer
        title={articleDetail?.title || '文章详情'}
        open={!!articleDetail}
        onClose={() => setArticleDetail(null)}
        width={isMobile ? '100%' : 720}
        extra={
          <Space>
            <Button size="small" type={detailTab === 'original' ? 'primary' : 'default'} icon={<FileTextOutlined />} onClick={() => setDetailTab('original')}>原文</Button>
            <Button size="small" type={detailTab === 'summary' ? 'primary' : 'default'} icon={<BookOutlined />} onClick={() => setDetailTab('summary')}>AI 总结</Button>
          </Space>
        }
      >
        {articleDetail && (
          <>
            {articleDetail.url && (
              <div style={{ marginBottom: 12, padding: isMobile ? '6px 8px' : '8px 12px', background: '#fafafa', borderRadius: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>来源：</Text>
                <a href={articleDetail.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, marginLeft: 4 }}>{articleDetail.url}</a>
              </div>
            )}
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.8 }}>
              {detailTab === 'original'
                ? (articleDetail.originalContent || '(未保存原文)')
                : (articleDetail.summary || '(未保存总结)')}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
