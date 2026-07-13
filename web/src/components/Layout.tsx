// 用户端主布局：左侧导航（按权限显隐）+ 内容区；含折叠与窄屏适配。
import { useEffect, useState } from 'react';
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
  VideoCameraOutlined,
  TableOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  ShareAltOutlined,
  RiseOutlined,
  ExpandOutlined,
  HistoryOutlined,
  CloudSyncOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { COLORS } from '../theme';
import { hasPerm, userAuth } from '../userAuth';

// perm 为空的条目所有登录用户可见;有 perm 的按角色权限显隐(与后端中间件的映射一致)
type NavItem = { key: string; icon: React.ReactNode; label: string; perm?: string };
type NavSection = { title?: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    title: '创作',
    items: [
      { key: '/dashboard', icon: <DashboardOutlined />, label: '总览' },
      { key: '/production', icon: <VideoCameraOutlined />, label: '制作看板', perm: 'production:manage' },
      { key: '/production/matrix', icon: <TableOutlined />, label: '全链路对照', perm: 'production:manage' },
      { key: '/canvas', icon: <ExpandOutlined />, label: '自由画布', perm: 'production:manage' },
      { key: '/workbench', icon: <MessageOutlined />, label: '数字员工工作台', perm: 'workbench:use' },
    ],
  },
  {
    title: '资产',
    items: [
      { key: '/employees', icon: <TeamOutlined />, label: '数字员工', perm: 'employee:manage' },
      { key: '/templates', icon: <AppstoreOutlined />, label: '角色模板', perm: 'employee:manage' },
      { key: '/knowledge-graph', icon: <ShareAltOutlined />, label: '知识图谱', perm: 'employee:manage' },
      { key: '/memory', icon: <BulbOutlined />, label: '记忆库', perm: 'employee:manage' },
    ],
  },
  {
    title: '自动化',
    items: [
      { key: '/teams', icon: <ApartmentOutlined />, label: '团队编排', perm: 'team:manage' },
      { key: '/workflows', icon: <PartitionOutlined />, label: '工作流', perm: 'workflow:manage' },
      { key: '/auto-learn', icon: <ThunderboltOutlined />, label: '提示词采集', perm: 'employee:manage' },
      { key: '/article-learn', icon: <ReadOutlined />, label: '文章学习', perm: 'employee:manage' },
      { key: '/trends', icon: <RocketOutlined />, label: 'AI 趋势', perm: 'employee:manage' },
      { key: '/evolution', icon: <RiseOutlined />, label: '自我进化', perm: 'employee:manage' },
      { key: '/runs', icon: <HistoryOutlined />, label: '运行记录', perm: 'workbench:use' },
      { key: '/tasks', icon: <CloudSyncOutlined />, label: '任务中心', perm: 'workbench:use' },
    ],
  },
  {
    title: '系统',
    items: [
      { key: '/tools', icon: <ToolOutlined />, label: '工具 & MCP', perm: 'tool:manage' },
      { key: '/settings', icon: <SettingOutlined />, label: '设置', perm: 'settings:manage' },
    ],
  },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pageIsWorkspace = location.pathname === '/workbench' || location.pathname === '/production' || location.pathname === '/canvas';

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const sync = () => setIsNarrow(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const navCollapsed = collapsed || isNarrow;
  const siderWidth = navCollapsed ? 64 : 240;

  // 按当前用户权限过滤导航;整段为空的分组连标题一起隐藏
  const visibleSections = navSections
    .map((s) => ({ ...s, items: s.items.filter((it) => !it.perm || hasPerm(it.perm)) }))
    .filter((s) => s.items.length > 0);
  const currentNavKey = visibleSections.flatMap(s => s.items).map(i => i.key)
    .filter(key => location.pathname === key || (key !== '/dashboard' && location.pathname.startsWith(`${key}/`)))
    .sort((a, b) => b.length - a.length)[0];

  const logout = () => {
    userAuth.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', width: '100vw', overflowX: 'hidden' }}>
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
          justifyContent: navCollapsed ? 'center' : 'flex-start',
          padding: navCollapsed ? '0' : '0 20px',
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
          {!navCollapsed && (
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
        <div style={{ flex: 1, padding: navCollapsed ? '12px 8px' : '12px 12px' }}>
          {visibleSections.map((section, si) => (
            <div key={si} style={{ marginBottom: 8 }}>
              {/* Section title */}
              {section.title && !navCollapsed && (
                <div style={{
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.25)',
                  padding: '10px 12px 6px',
                }}>
                  {section.title}
                </div>
              )}
              {section.title && navCollapsed && (
                <div style={{
                  height: 1, background: 'rgba(255,255,255,0.06)',
                  margin: '8px 6px',
                }} />
              )}

              {section.items.map(item => {
                const isActive = currentNavKey === item.key;
                const navItem = (
                  <button
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    key={item.key}
                    onClick={() => navigate(item.key)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: 12, padding: navCollapsed ? '10px 0' : '10px 12px',
                      justifyContent: navCollapsed ? 'center' : 'flex-start',
                      borderRadius: 10, cursor: 'pointer',
                      marginBottom: 2,
                      transition: 'all 0.15s',
                      background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                      fontWeight: isActive ? 600 : 400,
                      position: 'relative',
                      border: 0, width: '100%', fontFamily: 'inherit', textAlign: 'left',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                      }
                    }}
                  >
                    {isActive && (
                      <div style={{
                        position: 'absolute', left: navCollapsed ? '50%' : -12, top: navCollapsed ? 'auto' : '50%',
                        bottom: navCollapsed ? -2 : 'auto',
                        transform: navCollapsed ? 'translateX(-50%)' : 'translateY(-50%)',
                        width: navCollapsed ? 20 : 3,
                        height: navCollapsed ? 3 : 20,
                        borderRadius: 2,
                        background: COLORS.iris,
                      }} />
                    )}
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    {!navCollapsed && <span style={{ fontSize: 14 }}>{item.label}</span>}
                  </button>
                );

                return navCollapsed ? (
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

        {/* Logout */}
        <button
          type="button"
          aria-label="退出登录"
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            justifyContent: navCollapsed ? 'center' : 'flex-start',
            padding: navCollapsed ? '12px 0' : '12px 24px',
            cursor: 'pointer',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.35)', fontSize: 13,
            transition: 'color 0.15s', flexShrink: 0,
            border: 0, width: '100%', background: 'transparent', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = COLORS.rose; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
        >
          <LogoutOutlined style={{ fontSize: 15 }} />
          {!navCollapsed && <span>退出登录</span>}
        </button>

        {/* Collapse toggle */}
        <button
          type="button"
          aria-label={collapsed ? '展开导航' : '折叠导航'}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            padding: '14px 0', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.3)', fontSize: 14,
            transition: 'color 0.15s', flexShrink: 0,
            visibility: isNarrow ? 'hidden' : 'visible',
            border: 0, width: '100%', background: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
        >
          {collapsed ? <RightOutlined /> : <LeftOutlined />}
        </button>
      </div>

      {/* Main content */}
      <div style={{
        marginLeft: siderWidth,
        flex: 1,
        width: `calc(100vw - ${siderWidth}px)`,
        minWidth: 0,
        transition: 'margin-left 0.2s',
        background: COLORS.canvas,
        minHeight: '100vh',
        overflowX: 'hidden',
      }}>
        <div style={{ padding: pageIsWorkspace ? (isNarrow ? '8px' : '14px') : (isNarrow ? '16px' : '28px'), minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
