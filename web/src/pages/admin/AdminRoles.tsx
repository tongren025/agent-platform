import { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Popconfirm, message, Spin, Modal, Form, Input, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminApi, type PlatformRole, type PermissionDef } from '../../adminApi';
import { COLORS } from '../../theme';

export default function AdminRoles() {
  const [list, setList] = useState<PlatformRole[]>([]);
  const [perms, setPerms] = useState<PermissionDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformRole | null>(null);
  const [form] = Form.useForm();

  const fetchAll = () => {
    setLoading(true);
    Promise.all([adminApi.listRoles(), adminApi.listPermissions()])
      .then(([r, p]) => { setList(r); setPerms(p); })
      .catch((e) => message.error(e.message || '加载失败'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchAll, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ permissions: [] });
    setOpen(true);
  };

  const openEdit = (record: PlatformRole) => {
    setEditing(record);
    form.setFieldsValue({
      roleCode: record.roleCode,
      name: record.name,
      description: record.description,
      permissions: record.permissions,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await adminApi.updateRole(editing.roleCode, {
          roleCode: editing.roleCode,
          name: values.name,
          description: values.description || '',
          permissions: values.permissions || [],
        });
        message.success('更新成功');
      } else {
        await adminApi.createRole({
          roleCode: values.roleCode,
          name: values.name,
          description: values.description || '',
          permissions: values.permissions || [],
        });
        message.success('创建成功');
      }
      setOpen(false);
      fetchAll();
    } catch (e: any) {
      if (e.message) message.error(e.message);
    }
  };

  const handleDelete = async (roleCode: string) => {
    try {
      await adminApi.deleteRole(roleCode);
      message.success('已删除');
      fetchAll();
    } catch (e: any) { message.error(e.message); }
  };

  const columns = [
    {
      title: '角色', key: 'role',
      render: (_: unknown, r: PlatformRole) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {r.name}
            {r.builtIn && <Tag style={{ marginLeft: 8, borderRadius: 5, fontSize: 11 }} color="blue">内置</Tag>}
          </div>
          <div style={{ fontSize: 12, color: COLORS.slate }}>{r.roleCode}</div>
        </div>
      ),
    },
    {
      title: '说明', dataIndex: 'description', key: 'desc',
      render: (v: string) => v || <span style={{ color: COLORS.slate }}>-</span>,
    },
    {
      title: '权限', dataIndex: 'permissions', key: 'permissions',
      render: (v: string[]) => (
        <Space size={4} wrap>
          {v.map((p) => {
            const def = perms.find((d) => d.code === p);
            return <Tag key={p} style={{ borderRadius: 5 }}>{def?.label || p}</Tag>;
          })}
        </Space>
      ),
    },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, r: PlatformRole) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(r)}>编辑</Button>
          {!r.builtIn && (
            <Popconfirm title={`确认删除角色「${r.name}」？`} onConfirm={() => handleDelete(r.roleCode)}>
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
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: COLORS.slateDark }}>角色管理</h1>
          <div style={{ color: COLORS.slate, fontSize: 14, marginTop: 4 }}>定义角色及其权限，用户通过角色获得对应操作权限</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增角色</Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : (
        <Table rowKey="roleCode" columns={columns} dataSource={list} pagination={false} size="middle" />
      )}

      <Modal
        title={editing ? `编辑角色 — ${editing.name}` : '新增角色'}
        open={open}
        onOk={handleSave}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        forceRender
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="角色标识" name="roleCode" rules={[{ required: true, message: '请输入角色标识' }]}>
            <Input disabled={!!editing} placeholder="唯一标识，如 editor" />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="显示名称" />
          </Form.Item>
          <Form.Item label="说明" name="description">
            <Input placeholder="可选描述" />
          </Form.Item>
          <Form.Item label="权限" name="permissions">
            <Checkbox.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {perms.map((p) => (
                <Checkbox key={p.code} value={p.code}>{p.label}</Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
