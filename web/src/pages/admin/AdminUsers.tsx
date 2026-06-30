import { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Switch, Popconfirm, message, Spin, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { adminApi, type PlatformUser, type PlatformRole } from '../../adminApi';
import { COLORS } from '../../theme';

export default function AdminUsers() {
  const [list, setList] = useState<PlatformUser[]>([]);
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformUser | null>(null);
  const [form] = Form.useForm();

  const fetchAll = () => {
    setLoading(true);
    Promise.all([adminApi.listUsers(), adminApi.listRoles()])
      .then(([u, r]) => { setList(u); setRoles(r); })
      .catch((e) => message.error(e.message || '加载失败'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchAll, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: 'viewer', enabled: true });
    setOpen(true);
  };

  const openEdit = (record: PlatformUser) => {
    setEditing(record);
    form.setFieldsValue({
      username: record.username,
      displayName: record.displayName,
      role: record.role,
      enabled: record.enabled,
      password: '',
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        const data: any = { displayName: values.displayName, role: values.role, enabled: values.enabled };
        if (values.password) data.password = values.password;
        await adminApi.updateUser(editing.username, data);
        message.success('更新成功');
      } else {
        await adminApi.createUser({
          username: values.username,
          password: values.password,
          displayName: values.displayName || values.username,
          role: values.role,
          enabled: values.enabled,
        });
        message.success('创建成功');
      }
      setOpen(false);
      fetchAll();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    }
  };

  const handleToggle = async (record: PlatformUser) => {
    try {
      await adminApi.updateUser(record.username, { enabled: !record.enabled });
      message.success(record.enabled ? '已禁用' : '已启用');
      fetchAll();
    } catch (e: any) { message.error(e.message); }
  };

  const handleDelete = async (username: string) => {
    try {
      await adminApi.deleteUser(username);
      message.success('已删除');
      fetchAll();
    } catch (e: any) { message.error(e.message); }
  };

  const filtered = search
    ? list.filter((u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName.toLowerCase().includes(search.toLowerCase()),
      )
    : list;

  const columns = [
    {
      title: '用户', key: 'user',
      render: (_: unknown, r: PlatformUser) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.displayName}</div>
          <div style={{ fontSize: 12, color: COLORS.slate }}>{r.username}</div>
        </div>
      ),
    },
    {
      title: '角色', dataIndex: 'roleName', key: 'role',
      render: (v: string, r: PlatformUser) => {
        const colorMap: Record<string, string> = { admin: '#f5222d', editor: '#2f54eb', viewer: '#52c41a' };
        return <Tag color={colorMap[r.role] || 'default'} style={{ borderRadius: 5 }}>{v || r.role}</Tag>;
      },
    },
    {
      title: '状态', dataIndex: 'enabled', key: 'enabled',
      render: (v: boolean, r: PlatformUser) => (
        <Switch size="small" checked={v} onChange={() => handleToggle(r)} />
      ),
    },
    {
      title: '最后登录', dataIndex: 'lastLoginAt', key: 'lastLogin',
      render: (v: string | null) => v ? new Date(v).toLocaleString() : <span style={{ color: COLORS.slate }}>从未</span>,
    },
    {
      title: '创建时间', dataIndex: 'createdAt', key: 'created',
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, r: PlatformUser) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm title={`确认删除「${r.displayName}」？`} onConfirm={() => handleDelete(r.username)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: COLORS.slateDark }}>用户管理</h1>
          <div style={{ color: COLORS.slate, fontSize: 14, marginTop: 4 }}>管理可以登录本平台的用户账号</div>
        </div>
        <Space>
          <Input
            prefix={<SearchOutlined style={{ color: COLORS.slate }} />}
            placeholder="搜索用户"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增用户</Button>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : (
        <Table rowKey="userId" columns={columns} dataSource={filtered} pagination={{ pageSize: 20 }} size="middle" />
      )}

      <Modal
        title={editing ? `编辑用户 — ${editing.displayName}` : '新增用户'}
        open={open}
        onOk={handleSave}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        forceRender
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input disabled={!!editing} placeholder="登录用的唯一标识" />
          </Form.Item>
          <Form.Item label="显示名称" name="displayName">
            <Input placeholder="显示在界面上的名称" />
          </Form.Item>
          <Form.Item
            label={editing ? '重置密码' : '密码'}
            name="password"
            rules={editing ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editing ? '留空则不修改密码' : '设置登录密码'} />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              options={roles.map((r) => ({
                label: `${r.name}${r.description ? ` — ${r.description}` : ''}`,
                value: r.roleCode,
              }))}
            />
          </Form.Item>
          <Form.Item label="启用" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
