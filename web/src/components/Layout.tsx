import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ToolOutlined,
  MessageOutlined,
  ApartmentOutlined,
  SettingOutlined,
  ReadOutlined,
  BulbOutlined,
  LeftOutlined,
  RightOutlined,
  PartitionOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { COLORS } from '../theme';

const navSections = [
  {
    items: [
      { key: '/dashboard', icon: <DashboardOutlined />, label: '总览' },
      { key: '/workbench', icon: <MessageOutlined />, label: '工作台' },
    ],
  },
  {
    title: '资源',
    items: [
      { key: '/employees', icon: <TeamOutlined />, label: '数字员工' },
      { key: '/teams', icon: <ApartmentOutlined />, label: '团队' },
      { key: '/workflows', icon: <PartitionOutlined />, label: '工作流' },
      { key: '/pipeline', icon: <ThunderboltOutlined />, label: 'CLI 流水线' },
      { key: '/templates', icon: <AppstoreOutlined />, label: '角色模板' },
    ],
  },
  {
    title: '能力',
    items: [
      { key: '/tools', icon: <ToolOutlined />, label: '工具 & MCP' },
      { key: '/auto-learn', icon: <ReadOutlined />, label: '提示词采集' },
      { key: '/article-learn', icon: <ReadOutlined />, label: '文章学习' },
      { key: '/memory', icon: <BulbOutlined />, label: '记忆' },
    ],
  },
  {
    items: [
      { key: '/settings', icon: <SettingOutlined />, label: '设置' },
    ],
  },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const siderWidth = collapsed ? 72 : 240;

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div
        style={{
          width: siderWidth,
          background: `linear-gradient(180deg, ${COLORS.inkLight} 0%, ${COLORS.ink} 100%)`,
          borderRight: '1px solid rgba(255,255,255,0.04)',
          overflow: 'hidden auto',
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
          transition: 'width 0.2s',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Brand */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 20px',
          gap: 10, flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.iris}, ${COLORS.irisLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0,
            boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
          }}>
            A
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Agent Studio
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 500 }}>
                Creative AI Platform
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px 12px' }}>
          {navSections.map((section, si) => (
            <div key={si} style={{ marginBottom: 8 }}>
              {/* Section title */}
              {section.title && !collapsed && (
                <div style={{
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.25)',
                  padding: '10px 12px 6px',
                }}>
                  {section.title}
                </div>
              )}
              {section.title && collapsed && (
                <div style={{
                  height: 1, background: 'rgba(255,255,255,0.06)',
                  margin: '8px 6px',
                }} />
              )}

              {section.items.map(item => {
                const isActive = location.pathname === item.key || (item.key !== '/dashboard' && location.pathname.startsWith(item.key));
                const navItem = (
                  <div
                    key={item.key}
                    onClick={() => navigate(item.key)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: 12, padding: collapsed ? '10px 0' : '10px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 10, cursor: 'pointer',
                      marginBottom: 2,
                      transition: 'all 0.15s',
                      background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                      fontWeight: isActive ? 600 : 400,
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                        (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.8)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                        (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.5)';
                      }
                    }}
                  >
                    {isActive && (
                      <div style={{
                        position: 'absolute', left: collapsed ? '50%' : -12, top: collapsed ? 'auto' : '50%',
                        bottom: collapsed ? -2 : 'auto',
                        transform: collapsed ? 'translateX(-50%)' : 'translateY(-50%)',
                        width: collapsed ? 20 : 3,
                        height: collapsed ? 3 : 20,
                        borderRadius: 2,
                        background: COLORS.iris,
                      }} />
                    )}
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    {!collapsed && <span style={{ fontSize: 14 }}>{item.label}</span>}
                  </div>
                );

                return collapsed ? (
                  <Tooltip key={item.key} title={item.label} placement="right">
                    {navItem}
                  </Tooltip>
                ) : (
                  <div key={item.key}>{navItem}</div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Collapse toggle */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            padding: '14px 0', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.3)', fontSize: 14,
            transition: 'color 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.6)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.3)'; }}
        >
          {collapsed ? <RightOutlined /> : <LeftOutlined />}
        </div>
      </div>

      {/* Main content */}
      <div style={{
        marginLeft: siderWidth,
        flex: 1,
        transition: 'margin-left 0.2s',
        background: COLORS.canvas,
        minHeight: '100vh',
      }}>
        <div style={{ padding: location.pathname === '/workbench' ? '14px' : '28px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
