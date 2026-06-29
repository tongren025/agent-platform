import { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Switch, Popconfirm, message, Spin, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { adminApi, type AdminEmployee } from '../../adminApi';
import { COLORS } from '../../theme';

export default function AdminEmployees() {
  const [list, setList] = useState<AdminEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = () => {
    setLoading(true);
    adminApi
      .listEmployees()
      .then(setList)
      .catch((e) => message.error(e.message || '加载失败'))
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const handleToggle = async (record: AdminEmployee) => {
    try {
      await adminApi.toggleEmployee(record.employeeKey, !record.enabled);
      message.success(record.enabled ? '已禁用' : '已启用');
      fetch();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await adminApi.deleteEmployee(key);
      message.success('已删除');
      fetch();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const filtered = search
    ? list.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.employeeKey.toLowerCase().includes(search.toLowerCase()) ||
          (e.teamName || '').toLowerCase().includes(search.toLowerCase()),
      )
    : list;

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, r: AdminEmployee) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: 12, color: COLORS.slate }}>{r.employeeKey}</div>
        </div>
      ),
    },
    {
      title: '团队',
      dataIndex: 'teamName',
      key: 'team',
      render: (v: string | null) =>
        v ? (
          <Tag style={{ borderRadius: 5, background: '#f0f5ff', border: '1px solid #d6e4ff', color: '#2f54eb' }}>
            {v}
          </Tag>
        ) : (
          <span style={{ color: COLORS.slate }}>-</span>
        ),
    },
    {
      title: '绑定',
      key: 'bindings',
      render: (_: unknown, r: AdminEmployee) => {
        const tc = r.toolRefs?.length ?? 0;
        const sc = r.skillRefs?.length ?? 0;
        const mc = r.mcpServerRefs?.length ?? 0;
        if (tc + sc + mc === 0) return <span style={{ color: COLORS.slate }}>-</span>;
        return (
          <Space size={4}>
            {tc > 0 && <Tag style={{ borderRadius: 5 }}>工具:{tc}</Tag>}
            {sc > 0 && <Tag color="blue" style={{ borderRadius: 5 }}>技能:{sc}</Tag>}
            {mc > 0 && <Tag color="purple" style={{ borderRadius: 5 }}>MCP:{mc}</Tag>}
          </Space>
        );
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) =>
        tags?.length ? (
          <Space size={4} wrap>
            {tags.map((t) => (
              <Tag key={t} style={{ borderRadius: 5 }}>
                {t}
              </Tag>
            ))}
          </Space>
        ) : (
          <span style={{ color: COLORS.slate }}>-</span>
        ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (v: string) => (
        <Tag style={{ borderRadius: 5, background: v === 'builtin' ? '#f0f5ff' : '#f6ffed', border: 'none', color: v === 'builtin' ? '#2f54eb' : '#52c41a' }}>
          {v === 'builtin' ? '内置' : '用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (v: boolean, r: AdminEmployee) => (
        <Switch size="small" checked={v} onChange={() => handleToggle(r)} />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, r: AdminEmployee) => (
        <Popconfirm title={`确认删除「${r.name}」？`} onConfirm={() => handleDelete(r.employeeKey)}>
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: COLORS.slateDark }}>员工治理</h1>
          <div style={{ color: COLORS.slate, fontSize: 14, marginTop: 4 }}>
            管理平台数字员工：启用/禁用、查看绑定、删除
          </div>
        </div>
        <Input
          prefix={<SearchOutlined style={{ color: COLORS.slate }} />}
          placeholder="搜索名称 / 标识 / 团队"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 260 }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 12, color: COLORS.slate, fontSize: 13 }}>
            共 {filtered.length} 名员工，启用 {filtered.filter((e) => e.enabled).length} / 禁用{' '}
            {filtered.filter((e) => !e.enabled).length}
          </div>
          <Table
            rowKey="employeeKey"
            columns={columns}
            dataSource={filtered}
            pagination={{ pageSize: 20 }}
            size="middle"
          />
        </>
      )}
    </div>
  );
}
