import { useEffect, useState } from 'react';
import {
  Card, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Avatar,
  Typography, Badge, Tooltip, Row, Col, Empty,
} from 'antd';
import {
  PlusOutlined, TeamOutlined, CrownOutlined, UserOutlined, EditOutlined,
  DeleteOutlined, SettingOutlined, BookOutlined, BulbOutlined,
  ThunderboltOutlined, RobotOutlined, SwapOutlined, ArrowRightOutlined, ApartmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { COLORS } from '../theme';
import type { Employee, Team } from '../types';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const ROLE_COLORS: Record<string, string> = {
  '导演': '#8b5cf6', '编剧': COLORS.iris, '设计': '#10b981',
  '生成': '#f59e0b', '分镜': '#ec4899', '提示词': '#06b6d4',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  'director': <CrownOutlined />, 'screenwriter': <BookOutlined />,
  'designer': <BulbOutlined />, 'artist': <ThunderboltOutlined />,
  'storyboard': <SwapOutlined />, 'engineer': <SettingOutlined />,
};

const STAGE_MAP: Record<string, { label: string; color: string; order: number }> = {
  '导演': { label: '统筹', color: '#8b5cf6', order: 0 },
  '编剧': { label: '创作', color: COLORS.iris, order: 1 },
  '设计': { label: '设计', color: '#10b981', order: 2 },
  '分镜': { label: '设计', color: '#10b981', order: 2 },
  '生成': { label: '生成', color: '#f59e0b', order: 3 },
  '提示词': { label: '生成', color: '#f59e0b', order: 3 },
};

function getRoleColor(tags: string[]): string {
  for (const tag of tags ?? [])
    for (const [key, color] of Object.entries(ROLE_COLORS))
      if (tag.includes(key)) return color;
  return COLORS.iris;
}

function getRoleIcon(key: string): React.ReactNode {
  for (const [pattern, icon] of Object.entries(ROLE_ICONS))
    if (key.includes(pattern)) return icon;
  return <UserOutlined />;
}

function getStage(tags: string[]): { label: string; color: string; order: number } {
  for (const tag of tags ?? [])
    for (const [key, stage] of Object.entries(STAGE_MAP))
      if (tag.includes(key)) return stage;
  return { label: '其他', color: COLORS.slate, order: 99 };
}

function getModelShort(policy: Record<string, unknown> | null): string {
  if (!policy) return '';
  const id = (policy.model_id || policy.modelId || '') as string;
  return id.length > 22 ? id.slice(0, 20) + '…' : id;
}

function getFirstLine(text: string, maxLen = 80): string {
  const line = text.split('\n').find(l => l.trim() && !l.trim().startsWith('#') && !l.trim().startsWith('*'));
  const cleaned = (line || text).replace(/[#*\-@\[\]]/g, '').trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) + '…' : cleaned;
}

interface MemberCardProps {
  emp: Employee;
  onEdit: (emp: Employee) => void;
  onRemove: (key: string) => void;
  memoryStats: Record<string, any>;
}

function MemberCard({ emp, onEdit, onRemove, memoryStats }: MemberCardProps) {
  const color = getRoleColor(emp.tags);
  const stats = memoryStats[emp.employeeKey];
  const memCount = stats ? stats.semantic_count + stats.episodic_count + stats.procedural_count : 0;

  return (
    <div
      className="card-hover"
      style={{
        background: '#fff', borderRadius: 14, padding: '22px 20px',
        border: '1px solid #eef0f6', cursor: 'default',
        display: 'flex', flexDirection: 'column', height: '100%',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 50, height: 50, borderRadius: 14, flexShrink: 0,
          background: `${color}10`, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          {getRoleIcon(emp.employeeKey)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{emp.name}</div>
          <div style={{ fontSize: 12, color: COLORS.slate }}>{getModelShort(emp.defaultModelPolicy)}</div>
        </div>
        <Space size={2} style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(emp)} style={{ color: COLORS.slate }} />
          </Tooltip>
          <Popconfirm title="确认移出团队？" onConfirm={() => onRemove(emp.employeeKey)} okText="移出" cancelText="取消">
            <Tooltip title="移出">
              <Button type="text" size="small" icon={<DeleteOutlined />} style={{ color: '#e2e8f0' }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      </div>

      {/* Description */}
      <Paragraph
        type="secondary"
        style={{ fontSize: 13, marginBottom: 14, flex: 1, lineHeight: '20px' }}
        ellipsis={{ rows: 3 }}
      >
        {getFirstLine(emp.roleProfile || '暂无角色描述', 120)}
      </Paragraph>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {(emp.tags ?? []).map(tag => (
          <span key={tag} style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 6,
            background: '#f1f5f9', color: COLORS.slateDark, fontWeight: 500,
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Footer stats */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 12, color: emp.hasKnowledgeBase ? COLORS.mint : '#cbd5e1' }}>
            <BookOutlined style={{ marginRight: 4 }} />{emp.hasKnowledgeBase ? '知识库' : '无知识'}
          </span>
          <span style={{ fontSize: 12, color: memCount > 0 ? COLORS.iris : '#cbd5e1' }}>
            <BulbOutlined style={{ marginRight: 4 }} />{memCount} 条记忆
          </span>
        </div>
        <Badge
          status={emp.enabled ? 'success' : 'default'}
          text={<span style={{ fontSize: 11, color: COLORS.slate }}>{emp.enabled ? '在线' : '离线'}</span>}
        />
      </div>
    </div>
  );
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [memoryStats, setMemoryStats] = useState<Record<string, any>>({});
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [teamForm] = Form.useForm();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [t, e] = await Promise.all([api.listTeams(), api.listEmployees()]);
      setTeams(t); setEmployees(e);
      if (selectedTeam) {
        const fresh = t.find((tm: Team) => tm.teamCode === selectedTeam.teamCode);
        if (fresh) setSelectedTeam(fresh);
      } else if (t.length > 0) setSelectedTeam(t[0]);
    } catch (e: any) { message.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!selectedTeam) return;
    const keys = selectedTeam.memberEmployeeKeys ?? [];
    Promise.all(
      keys.map(k => api.getMemoryStats(k).then(s => [k, s] as const).catch(() => [k, null] as const))
    ).then(pairs => {
      const map: Record<string, any> = {};
      for (const [k, s] of pairs) { if (s) map[k] = s; }
      setMemoryStats(map);
    });
  }, [selectedTeam]);

  const teamMembers = (selectedTeam?.memberEmployeeKeys ?? [])
    .map(k => employees.find(e => e.employeeKey === k))
    .filter(Boolean) as Employee[];

  const leader = teamMembers.find(e =>
    selectedTeam?.defaultEmployeeKey === e.employeeKey
    || (selectedTeam as any)?.leaderEmployeeKey === e.employeeKey
  );
  const nonLeader = teamMembers.filter(e => e !== leader);

  // 按阶段分组：优先用后端真实 roles（authoritative），无 roles 时回退到 tag 猜测（向后兼容）
  const rolesMap = new Map<string, { stage: string; order: number }>();
  (selectedTeam?.roles ?? []).forEach(r => rolesMap.set(r.employeeKey, { stage: r.stage, order: r.order }));
  const STAGE_COLOR: Record<string, string> = {
    '统筹': '#8b5cf6', '创作': COLORS.iris, '设计': '#10b981', '生成': '#f59e0b', '其他': COLORS.slate,
  };

  const stageGroups: { label: string; color: string; members: Employee[] }[] = [];
  const stageMap = new Map<string, Employee[]>();
  for (const emp of nonLeader) {
    const label = rolesMap.has(emp.employeeKey)
      ? (rolesMap.get(emp.employeeKey)!.stage || '其他')
      : getStage(emp.tags).label;
    if (!stageMap.has(label)) stageMap.set(label, []);
    stageMap.get(label)!.push(emp);
  }
  // 组内按 role.order 排序
  stageMap.forEach((members) => members.sort(
    (a, b) => (rolesMap.get(a.employeeKey)?.order ?? 0) - (rolesMap.get(b.employeeKey)?.order ?? 0)
  ));
  const stageOrder = ['统筹', '创作', '设计', '生成', '其他'];
  const orderedLabels = [
    ...stageOrder.filter(l => stageMap.has(l)),
    ...[...stageMap.keys()].filter(l => !stageOrder.includes(l)),
  ];
  for (const label of orderedLabels) {
    const members = stageMap.get(label)!;
    if (members.length > 0) stageGroups.push({ label, color: STAGE_COLOR[label] ?? COLORS.slate, members });
  }

  const openCreateTeam = () => { setEditingTeam(null); teamForm.resetFields(); setTeamModalOpen(true); };
  const openEditTeam = (team: Team) => {
    setEditingTeam(team);
    teamForm.setFieldsValue({
      teamCode: team.teamCode, name: team.name,
      description: (team as any).description || '',
      defaultEmployeeKey: team.defaultEmployeeKey || (team as any).leaderEmployeeKey || '',
    });
    setTeamModalOpen(true);
  };
  const handleSaveTeam = async () => {
    try {
      const values = await teamForm.validateFields();
      await api.saveTeam({
        teamCode: values.teamCode, name: values.name, description: values.description || '',
        defaultEmployeeKey: values.defaultEmployeeKey || null, leaderEmployeeKey: values.defaultEmployeeKey || null,
        memberEmployeeKeys: editingTeam?.memberEmployeeKeys ?? [],
      });
      message.success(editingTeam ? '更新成功' : '创建成功');
      setTeamModalOpen(false); fetchData();
    } catch (e: any) { if (e.message) message.error(e.message); }
  };
  const handleDeleteTeam = async (code: string) => {
    try { await api.deleteTeam(code); message.success('删除成功'); if (selectedTeam?.teamCode === code) setSelectedTeam(null); fetchData(); }
    catch (e: any) { message.error(e.message); }
  };
  const handleRemoveMember = async (empKey: string) => {
    if (!selectedTeam) return;
    try {
      await api.updateTeamMembers(selectedTeam.teamCode, (selectedTeam.memberEmployeeKeys ?? []).filter(k => k !== empKey));
      message.success('已移出'); fetchData();
    } catch (e: any) { message.error(e.message); }
  };
  const [addKeys, setAddKeys] = useState<string[]>([]);
  const handleAddMembers = async () => {
    if (!selectedTeam || addKeys.length === 0) return;
    try {
      await api.updateTeamMembers(selectedTeam.teamCode, [...new Set([...(selectedTeam.memberEmployeeKeys ?? []), ...addKeys])]);
      message.success('添加成功'); setAddMemberOpen(false); setAddKeys([]); fetchData();
    } catch (e: any) { message.error(e.message); }
  };
  const handleEditEmployee = (emp: Employee) => { window.location.href = `/employees?edit=${emp.employeeKey}`; };
  const availableForAdd = employees.filter(e => !(selectedTeam?.memberEmployeeKeys ?? []).includes(e.employeeKey));

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#1e293b' }}>
            AI 团队
          </h1>
          <Text type="secondary" style={{ fontSize: 14 }}>管理 AI 协作团队与成员</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateTeam} size="large" style={{ borderRadius: 10 }}>
          新建团队
        </Button>
      </div>

      {/* Team selector - horizontal tabs */}
      {teams.length > 0 && (
        <div style={{
          display: 'flex', gap: 12, marginBottom: 32, overflowX: 'auto',
          padding: '4px 0',
        }}>
          {teams.map(team => {
            const isActive = selectedTeam?.teamCode === team.teamCode;
            const count = (team.memberEmployeeKeys ?? []).length;
            return (
              <div
                key={team.teamCode}
                onClick={() => setSelectedTeam(team)}
                style={{
                  padding: '14px 22px', borderRadius: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 14,
                  minWidth: 200, flexShrink: 0,
                  transition: 'all 0.2s',
                  background: isActive ? COLORS.iris : '#fff',
                  color: isActive ? '#fff' : '#1e293b',
                  border: isActive ? 'none' : '1px solid #eef0f6',
                  boxShadow: isActive ? '0 4px 16px rgba(99,102,241,0.3)' : '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: isActive ? '#fff' : COLORS.iris,
                }}>
                  <TeamOutlined />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{team.name}</div>
                  <div style={{ fontSize: 12, opacity: isActive ? 0.8 : 0.5 }}>
                    {count} 名成员
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTeam ? (
        <div>
          {/* Team toolbar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 24,
          }}>
            <div>
              <span style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>{selectedTeam.name}</span>
              {(selectedTeam as any).description && (
                <Text type="secondary" style={{ marginLeft: 12, fontSize: 13 }}>
                  {(selectedTeam as any).description}
                </Text>
              )}
            </div>
            <Space size={8}>
              {selectedTeam.defaultWorkflowKey && (
                <Button
                  type="primary" ghost icon={<ApartmentOutlined />}
                  onClick={() => navigate(`/workflows/${encodeURIComponent(selectedTeam.defaultWorkflowKey!)}/edit`)}
                >
                  查看协作工作流
                </Button>
              )}
              <Button icon={<PlusOutlined />} onClick={() => { setAddKeys([]); setAddMemberOpen(true); }}>添加成员</Button>
              <Button icon={<EditOutlined />} onClick={() => openEditTeam(selectedTeam)}>编辑</Button>
              <Popconfirm title="确认删除该团队？" onConfirm={() => handleDeleteTeam(selectedTeam.teamCode)}>
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          </div>

          {/* Leader banner - full width */}
          {leader && (
            <div style={{
              background: '#fff', borderRadius: 16, padding: '28px 32px',
              border: '1px solid #eef0f6',
              marginBottom: 32,
              display: 'flex', gap: 24, alignItems: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Accent bar */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                background: `linear-gradient(180deg, ${getRoleColor(leader.tags)}, ${getRoleColor(leader.tags)}66)`,
              }} />

              <div style={{
                width: 72, height: 72, borderRadius: 18, flexShrink: 0,
                background: `${getRoleColor(leader.tags)}10`,
                color: getRoleColor(leader.tags),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30,
              }}>
                <CrownOutlined />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{leader.name}</span>
                  <span style={{
                    fontSize: 11, padding: '2px 10px', borderRadius: 6, fontWeight: 600,
                    background: '#fef3c7', color: '#b45309',
                  }}>
                    团队负责人
                  </span>
                  <Badge status={leader.enabled ? 'success' : 'default'} text={
                    <span style={{ fontSize: 12, color: COLORS.slate }}>{leader.enabled ? '在线' : '离线'}</span>
                  } />
                </div>
                <Paragraph
                  type="secondary"
                  style={{ fontSize: 13, marginBottom: 8, maxWidth: 600, lineHeight: '20px' }}
                  ellipsis={{ rows: 2 }}
                >
                  {getFirstLine(leader.roleProfile || '暂无描述', 150)}
                </Paragraph>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(leader.tags ?? []).map(tag => (
                    <span key={tag} style={{
                      fontSize: 11, padding: '2px 10px', borderRadius: 5,
                      background: '#f1f5f9', color: COLORS.slateDark, fontWeight: 500,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20, flexShrink: 0, alignSelf: 'flex-start' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
                    {memoryStats[leader.employeeKey]
                      ? memoryStats[leader.employeeKey].semantic_count + memoryStats[leader.employeeKey].episodic_count + memoryStats[leader.employeeKey].procedural_count
                      : 0}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.slate }}>记忆</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
                    {leader.hasKnowledgeBase ? '有' : '无'}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.slate }}>知识库</div>
                </div>
                <Space size={4} style={{ alignSelf: 'center' }}>
                  <Tooltip title="编辑">
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEditEmployee(leader)} />
                  </Tooltip>
                  <Popconfirm title="确认移出团队？" onConfirm={() => handleRemoveMember(leader.employeeKey)} okText="移出" cancelText="取消">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </div>
            </div>
          )}

          {/* Workflow pipeline indicator */}
          {stageGroups.length > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 0, marginBottom: 28, padding: '0 40px',
            }}>
              {stageGroups.map((group, i) => (
                <div key={group.label} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '6px 18px', borderRadius: 8,
                    background: `${group.color}10`, color: group.color,
                    fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    {group.label}
                    <span style={{ marginLeft: 6, opacity: 0.6, fontWeight: 400 }}>
                      {group.members.length}人
                    </span>
                  </div>
                  {i < stageGroups.length - 1 && (
                    <ArrowRightOutlined style={{ margin: '0 12px', color: '#d0d5dd', fontSize: 14 }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Members by stage */}
          {stageGroups.map(group => (
            <div key={group.label} style={{ marginBottom: 32 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
              }}>
                <div style={{
                  width: 4, height: 20, borderRadius: 2, background: group.color,
                }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
                  {group.label}阶段
                </span>
                <span style={{ fontSize: 12, color: COLORS.slate }}>
                  {group.members.length} 名成员
                </span>
              </div>
              <Row gutter={[20, 20]}>
                {group.members.map(emp => (
                  <Col xs={24} sm={12} lg={8} key={emp.employeeKey}>
                    <MemberCard emp={emp} onEdit={handleEditEmployee} onRemove={handleRemoveMember} memoryStats={memoryStats} />
                  </Col>
                ))}
              </Row>
            </div>
          ))}

          {teamMembers.length === 0 && (
            <Empty description="团队还没有成员" style={{ padding: '60px 0' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setAddKeys([]); setAddMemberOpen(true); }}>
                添加成员
              </Button>
            </Empty>
          )}
        </div>
      ) : (
        <Empty description="暂无团队" style={{ padding: '80px 0' }} />
      )}

      {/* Create/Edit Team Modal */}
      <Modal title={editingTeam ? '编辑团队' : '新建团队'} open={teamModalOpen} onOk={handleSaveTeam} onCancel={() => setTeamModalOpen(false)} destroyOnHidden width={500}>
        <Form form={teamForm} layout="vertical">
          <Form.Item label="团队编码" name="teamCode" rules={[{ required: true }]}>
            <Input disabled={!!editingTeam} placeholder="唯一标识" />
          </Form.Item>
          <Form.Item label="团队名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="如：漫剧生成团队" />
          </Form.Item>
          <Form.Item label="团队描述" name="description">
            <TextArea rows={3} placeholder="描述团队的职能和工作流" />
          </Form.Item>
          <Form.Item label="团队负责人" name="defaultEmployeeKey">
            <Select allowClear placeholder="选择团队 leader" options={employees.map(e => ({ label: e.name, value: e.employeeKey }))} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Members Modal */}
      <Modal title={`添加成员到「${selectedTeam?.name ?? ''}」`} open={addMemberOpen} onOk={handleAddMembers} onCancel={() => setAddMemberOpen(false)} okText="添加" width={500}>
        <Select
          mode="multiple" style={{ width: '100%' }} placeholder="选择要添加的员工"
          value={addKeys} onChange={setAddKeys}
          options={availableForAdd.map(e => ({
            label: (
              <span>
                <Avatar size={20} style={{ background: getRoleColor(e.tags), marginRight: 8, fontSize: 10 }}>{e.name[0]}</Avatar>
                {e.name}
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>({e.employeeKey})</Text>
              </span>
            ),
            value: e.employeeKey,
          }))}
        />
      </Modal>
    </div>
  );
}
