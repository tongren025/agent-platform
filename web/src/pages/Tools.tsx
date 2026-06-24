import { useEffect, useState } from 'react';
import {
  Tabs, Table, Button, Modal, Form, Input, Space, Popconfirm, message, Tag, Spin,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api } from '../api';

const { TextArea } = Input;

export default function Tools() {
  const [tools, setTools] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [mcpServers, setMcpServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [toolOpen, setToolOpen] = useState(false);
  const [toolEditing, setToolEditing] = useState<any>(null);
  const [toolForm] = Form.useForm();

  const [skillOpen, setSkillOpen] = useState(false);
  const [skillEditing, setSkillEditing] = useState<any>(null);
  const [skillForm] = Form.useForm();

  const [mcpOpen, setMcpOpen] = useState(false);
  const [mcpEditing, setMcpEditing] = useState<any>(null);
  const [mcpForm] = Form.useForm();

  const fetchAll = () => {
    setLoading(true);
    Promise.all([api.listTools(), api.listSkills(), api.listMcpServers()])
      .then(([t, s, m]) => { setTools(t); setSkills(s); setMcpServers(m); })
      .catch((e: any) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Tool CRUD ──
  const handleSaveTool = async () => {
    try {
      const v = await toolForm.validateFields();
      await api.saveTool({ toolCode: v.toolCode, name: v.name, description: v.description || '', inputSchema: v.inputSchema || '' });
      message.success(toolEditing ? '更新成功' : '创建成功');
      setToolOpen(false);
      fetchAll();
    } catch (e: any) { if (e.message) message.error(e.message); }
  };

  // ── Skill CRUD ──
  const handleSaveSkill = async () => {
    try {
      const v = await skillForm.validateFields();
      await api.saveSkill({ code: v.code, name: v.name, summary: v.summary || '', description: v.description || '', isTree: false, children: [] });
      message.success(skillEditing ? '更新成功' : '创建成功');
      setSkillOpen(false);
      fetchAll();
    } catch (e: any) { if (e.message) message.error(e.message); }
  };

  // ── MCP CRUD ──
  const handleSaveMcp = async () => {
    try {
      const v = await mcpForm.validateFields();
      const payload: any = {
        serverCode: v.serverCode,
        name: v.name,
        description: v.description || '',
        command: v.command || '',
        args: v.args ? v.args.split('\n').filter((s: string) => s.trim()) : [],
        url: v.url || '',
        transportType: v.transportType || 'stdio',
      };
      if (v.env?.trim()) {
        try { payload.env = JSON.parse(v.env); }
        catch { message.error('环境变量 JSON 格式错误'); return; }
      } else { payload.env = {}; }
      await api.saveMcpServer(payload);
      message.success(mcpEditing ? '更新成功' : '创建成功');
      setMcpOpen(false);
      fetchAll();
    } catch (e: any) { if (e.message) message.error(e.message); }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', marginTop: 120, textAlign: 'center' }} />;

  return (
    <>
      <Tabs defaultActiveKey="tools" items={[
        {
          key: 'tools',
          label: `工具 (${tools.length})`,
          children: (
            <>
              <div style={{ marginBottom: 12, textAlign: 'right' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setToolEditing(null); toolForm.resetFields(); setToolOpen(true); }}>添加工具</Button>
              </div>
              <Table rowKey="toolCode" dataSource={tools} pagination={false} columns={[
                { title: '工具编码', dataIndex: 'toolCode', key: 'toolCode' },
                { title: '名称', dataIndex: 'name', key: 'name' },
                { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
                {
                  title: '操作', key: 'actions', width: 150,
                  render: (_: unknown, r: any) => (
                    <Space>
                      <Button type="link" size="small" onClick={() => {
                        setToolEditing(r);
                        toolForm.setFieldsValue({ toolCode: r.toolCode, name: r.name, description: r.description, inputSchema: r.inputSchema });
                        setToolOpen(true);
                      }}>编辑</Button>
                      <Popconfirm title="确认删除？" onConfirm={async () => { await api.deleteTool(r.toolCode); message.success('已删除'); fetchAll(); }}>
                        <Button type="link" size="small" danger>删除</Button>
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]} />
            </>
          ),
        },
        {
          key: 'skills',
          label: `技能 (${skills.length})`,
          children: (
            <>
              <div style={{ marginBottom: 12, textAlign: 'right' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSkillEditing(null); skillForm.resetFields(); setSkillOpen(true); }}>添加技能</Button>
              </div>
              <Table rowKey="code" dataSource={skills} pagination={false} columns={[
                { title: '编码', dataIndex: 'code', key: 'code' },
                { title: '名称', dataIndex: 'name', key: 'name' },
                { title: '摘要', dataIndex: 'summary', key: 'summary', ellipsis: true },
                { title: '树形', dataIndex: 'isTree', key: 'isTree', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '是' : '否'}</Tag> },
                {
                  title: '操作', key: 'actions', width: 150,
                  render: (_: unknown, r: any) => (
                    <Space>
                      <Button type="link" size="small" onClick={() => {
                        setSkillEditing(r);
                        skillForm.setFieldsValue({ code: r.code, name: r.name, summary: r.summary, description: r.description });
                        setSkillOpen(true);
                      }}>编辑</Button>
                      <Popconfirm title="确认删除？" onConfirm={async () => { await api.deleteSkill(r.code); message.success('已删除'); fetchAll(); }}>
                        <Button type="link" size="small" danger>删除</Button>
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]} />
            </>
          ),
        },
        {
          key: 'mcp',
          label: `MCP 服务器 (${mcpServers.length})`,
          children: (
            <>
              <div style={{ marginBottom: 12, textAlign: 'right' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setMcpEditing(null); mcpForm.resetFields(); setMcpOpen(true); }}>添加 MCP 服务器</Button>
              </div>
              <Table rowKey="serverCode" dataSource={mcpServers} pagination={false} columns={[
                { title: '编码', dataIndex: 'serverCode', key: 'serverCode' },
                { title: '名称', dataIndex: 'name', key: 'name' },
                { title: '传输类型', dataIndex: 'transportType', key: 'transportType', render: (v: string) => <Tag color={v === 'sse' ? 'green' : 'blue'}>{v || 'stdio'}</Tag> },
                { title: '命令', dataIndex: 'command', key: 'command', ellipsis: true },
                { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
                {
                  title: '操作', key: 'actions', width: 150,
                  render: (_: unknown, r: any) => (
                    <Space>
                      <Button type="link" size="small" onClick={() => {
                        setMcpEditing(r);
                        mcpForm.setFieldsValue({
                          serverCode: r.serverCode, name: r.name, description: r.description,
                          command: r.command, args: r.args?.join('\n') ?? '', url: r.url,
                          transportType: r.transportType, env: r.env ? JSON.stringify(r.env, null, 2) : '',
                        });
                        setMcpOpen(true);
                      }}>编辑</Button>
                      <Popconfirm title="确认删除？" onConfirm={async () => { await api.deleteMcpServer(r.serverCode); message.success('已删除'); fetchAll(); }}>
                        <Button type="link" size="small" danger>删除</Button>
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]} />
            </>
          ),
        },
      ]} />

      {/* Tool Modal */}
      <Modal title={toolEditing ? '编辑工具' : '添加工具'} open={toolOpen} onOk={handleSaveTool} onCancel={() => setToolOpen(false)} destroyOnHidden width={600}>
        <Form form={toolForm} layout="vertical">
          <Form.Item label="工具编码" name="toolCode" rules={[{ required: true }]}><Input disabled={!!toolEditing} /></Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="描述" name="description"><TextArea rows={2} /></Form.Item>
          <Form.Item label="输入 Schema (JSON)" name="inputSchema"><TextArea rows={4} placeholder='{"type":"object","properties":{...}}' /></Form.Item>
        </Form>
      </Modal>

      {/* Skill Modal */}
      <Modal title={skillEditing ? '编辑技能' : '添加技能'} open={skillOpen} onOk={handleSaveSkill} onCancel={() => setSkillOpen(false)} destroyOnHidden width={600}>
        <Form form={skillForm} layout="vertical">
          <Form.Item label="编码" name="code" rules={[{ required: true }]}><Input disabled={!!skillEditing} /></Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="摘要" name="summary"><Input /></Form.Item>
          <Form.Item label="详细描述" name="description"><TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>

      {/* MCP Modal */}
      <Modal title={mcpEditing ? '编辑 MCP 服务器' : '添加 MCP 服务器'} open={mcpOpen} onOk={handleSaveMcp} onCancel={() => setMcpOpen(false)} destroyOnHidden width={640}>
        <Form form={mcpForm} layout="vertical">
          <Form.Item label="服务器编码" name="serverCode" rules={[{ required: true }]}><Input disabled={!!mcpEditing} /></Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="描述" name="description"><TextArea rows={2} /></Form.Item>
          <Form.Item label="传输类型" name="transportType" initialValue="stdio"><Input placeholder="stdio 或 sse" /></Form.Item>
          <Form.Item label="命令" name="command"><Input placeholder="如 npx, python" /></Form.Item>
          <Form.Item label="参数（每行一个）" name="args"><TextArea rows={3} /></Form.Item>
          <Form.Item label="URL（SSE 模式）" name="url"><Input /></Form.Item>
          <Form.Item label="环境变量（JSON）" name="env"><TextArea rows={3} placeholder='{"API_KEY":"xxx"}' /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
