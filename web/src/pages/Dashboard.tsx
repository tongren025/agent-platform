import { useEffect, useState } from 'react';
import { Spin, Tag, Space, Typography, Avatar, Tooltip } from 'antd';
import {
  UserOutlined, AppstoreOutlined, ToolOutlined, ThunderboltOutlined,
  TeamOutlined, CloudServerOutlined, MessageOutlined, SettingOutlined,
  ArrowRightOutlined, CheckCircleFilled, CloseCircleFilled,
  RobotOutlined, BookOutlined, BulbOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { COLORS } from '../theme';
import type { Employee, Team } from '../types';

const { Text } = Typography;

interface SystemInfo {
  version: string;
  python: string;
  platform: string;
  port: number;
  providerCount: number;
  modelCount: number;
  delegationEnabled: boolean;
  knowledgeEnabled: boolean;
  shellEnabled: boolean;
  runTimeout: number;
}

export default function Dashboard() {
  const [data, setData] = useState<Record<string, number>>({});
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getOverview(),
      api.getSystemInfo().catch(() => null),
      api.listAiProviders().catch(() => []),
      api.listEmployees().catch(() => []),
      api.listTeams().catch(() => []),
    ]).then(([ov, sys, prov, emp, tm]) => {
      setData(ov); setSysInfo(sys); setProviders(prov); setEmployees(emp); setTeams(tm);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', marginTop: 120, textAlign: 'center' }} />;

  const onlineCount = employees.filter(e => e.enabled).length;
  const totalModels = providers.reduce((sum, p) => sum + (p.models?.length ?? 0), 0);

  return (
    <div>
      {/* Hero section - welcome + primary CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
        borderRadius: 18, padding: '36px 40px',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
        color: '#fff',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', right: -30, top: -30,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', right: 80, bottom: -40,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>
            Agent Studio
          </div>
          <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 24 }}>
            {onlineCount} 名员工在线 · {teams.length} 个团队就绪 · {totalModels} 个 AI 模型可用
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div
              onClick={() => navigate('/workbench')}
              style={{
                padding: '12px 28px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', gap: 10,
                fontWeight: 600, fontSize: 14, transition: 'background 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.2)'; }}
            >
              <MessageOutlined style={{ fontSize: 16 }} />
              开始对话
            </div>
            <div
              onClick={() => navigate('/teams')}
              style={{
                padding: '12px 28px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', gap: 10,
                fontWeight: 600, fontSize: 14, transition: 'background 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.1)'; }}
            >
              <TeamOutlined style={{ fontSize: 16 }} />
              查看团队
            </div>
          </div>
        </div>
      </div>

      {/* Compact metrics strip */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 28,
        background: '#fff', borderRadius: 14, border: '1px solid #eef0f6',
        overflow: 'hidden',
      }}>
        {[
          { key: 'employees', label: '数字员工', icon: <UserOutlined />, color: COLORS.iris, route: '/employees' },
          { key: 'teams', label: '团队', icon: <TeamOutlined />, color: COLORS.mint, route: '/teams' },
          { key: 'roleTemplates', label: '角色模板', icon: <AppstoreOutlined />, color: '#8b5cf6', route: '/templates' },
          { key: 'tools', label: '工具', icon: <ToolOutlined />, color: '#06b6d4', route: '/tools' },
          { key: 'skills', label: '技能', icon: <ThunderboltOutlined />, color: '#f59e0b', route: '/tools' },
          { key: 'mcpServers', label: 'MCP 服务', icon: <CloudServerOutlined />, color: '#ec4899', route: '/tools' },
        ].map((item, i, arr) => (
          <div
            key={item.key}
            onClick={() => navigate(item.route)}
            style={{
              flex: 1, padding: '18px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              borderRight: i < arr.length - 1 ? '1px solid #eef0f6' : 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#f8f9fc'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; }}
          >
            <div style={{
              color: item.color, fontSize: 16, opacity: 0.8,
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                {data[item.key] ?? 0}
              </div>
              <div style={{ fontSize: 11, color: COLORS.slate, marginTop: 2 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Team overview + System info */}
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Left: Team members preview */}
        <div style={{ flex: 3, minWidth: 0 }}>
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #eef0f6',
            padding: '24px 28px',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 20,
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                  <RobotOutlined style={{ marginRight: 8, color: COLORS.iris }} />
                  AI 员工
                </div>
              </div>
              <div
                onClick={() => navigate('/employees')}
                style={{
                  fontSize: 13, color: COLORS.iris, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                查看全部 <ArrowRightOutlined style={{ fontSize: 11 }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {employees.slice(0, 6).map(emp => (
                <div
                  key={emp.employeeKey}
                  onClick={() => navigate(`/workbench?employee=${encodeURIComponent(emp.employeeKey)}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    transition: 'background 0.15s', border: '1px solid #f5f6fa',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#f8f9fc'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `${COLORS.iris}10`, color: COLORS.iris,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700,
                  }}>
                    {emp.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{emp.name}</div>
                    <div style={{
                      fontSize: 12, color: COLORS.slate,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {emp.employeeKey}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    {emp.hasKnowledgeBase && (
                      <Tooltip title="有知识库">
                        <BookOutlined style={{ fontSize: 13, color: COLORS.mint }} />
                      </Tooltip>
                    )}
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: emp.enabled ? '#22c55e' : '#d1d5db',
                    }} />
                  </div>
                </div>
              ))}
              {employees.length > 6 && (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>还有 {employees.length - 6} 名员工</Text>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick actions */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #eef0f6',
            padding: '24px 24px',
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
              <ThunderboltOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
              快捷操作
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: '对话', icon: <MessageOutlined />, route: '/workbench', color: COLORS.iris },
                { label: '创建员工', icon: <UserOutlined />, route: '/employees', color: '#8b5cf6' },
                { label: '管理工具', icon: <ToolOutlined />, route: '/tools', color: '#06b6d4' },
                { label: '设置', icon: <SettingOutlined />, route: '/settings', color: COLORS.slate },
              ].map(a => (
                <div
                  key={a.label}
                  onClick={() => navigate(a.route)}
                  style={{
                    padding: '14px 14px', borderRadius: 10, cursor: 'pointer',
                    border: '1px solid #f0f1f5', textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = '#f8f9fc';
                    el.style.borderColor = '#e0e3eb';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = '';
                    el.style.borderColor = '#f0f1f5';
                  }}
                >
                  <div style={{ color: a.color, fontSize: 20, marginBottom: 6 }}>{a.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System status - compact */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #eef0f6',
            padding: '24px 24px',
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
              <SettingOutlined style={{ marginRight: 8, color: '#06b6d4' }} />
              系统状态
            </div>
            {sysInfo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  ['版本', `v${sysInfo.version}`, null],
                  ['端口', String(sysInfo.port), null],
                  ['供应商', `${sysInfo.providerCount} 个`, null],
                  ['模型', `${sysInfo.modelCount} 个`, null],
                  ['委派', null, sysInfo.delegationEnabled],
                  ['知识库', null, sysInfo.knowledgeEnabled],
                  ['Shell', null, sysInfo.shellEnabled],
                ].map(([label, value, bool]) => (
                  <div key={label as string} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 0', borderBottom: '1px solid #f8f9fc',
                  }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>{label}</Text>
                    {value != null ? (
                      <Text style={{ fontSize: 13, fontWeight: 500 }}>{value}</Text>
                    ) : (
                      bool ? (
                        <CheckCircleFilled style={{ color: '#22c55e', fontSize: 14 }} />
                      ) : (
                        <CloseCircleFilled style={{ color: '#d1d5db', fontSize: 14 }} />
                      )
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">加载中...</Text>
            )}

            {/* AI providers mini */}
            {providers.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #eef0f6' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.slate, marginBottom: 10 }}>
                  AI 供应商
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {providers.map(p => (
                    <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space size={6}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: p.enabled ? '#22c55e' : '#d1d5db',
                        }} />
                        <Text style={{ fontSize: 13 }}>{p.name}</Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>{p.models?.length ?? 0} 模型</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
