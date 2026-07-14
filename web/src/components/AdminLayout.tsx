// 管理端布局：独立导航与鉴权守卫，与用户端完全隔离。
import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Tooltip } from 'antd';
import { message } from '../ui';
import {
  DashboardOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  ApiOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { COLORS } from '../theme';
import { adminApi, adminToken } from '../adminApi';
import { useResponsive } from '../hooks/useResponsive';

const navItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '系统总览' },
  { key: '/admin/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/admin/roles', icon: <SafetyCertificateOutlined />, label: '角色管理' },
  { key: '/admin/providers', icon: <ApiOutlined />, label: 'AI 服务商' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [username, setUsername] = useState('');
  const { isMobile } = useResponsive();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 路由守卫：进入任意 /admin/* 页面先校验 token 是否仍有效
  useEffect(() => {
    if (!adminToken.get()) {
      setChecked(true);
      return;
    }
    adminApi
      .me()
      .then((res) => setUsername(res.username))
      .catch(() => adminToken.clear())
      .finally(() => setChecked(true));
  }, []);

  if (!adminToken.get()) {
    return <Navigate to="/admin/login" replace />;
  }
  if (!checked) {
    return null;
  }

  const logout = () => {
    adminToken.clear();
    message.success('已退出登录');
    navigate('/admin/login', { replace: true });
  };

  const handleNav = (key: string) => {
    navigate(key);
    if (isMobile) setDrawerOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100vw', overflowX: 'hidden' }}>
      {/* Mobile header */}
      {isMobile && (
        <div style={{
          height: 52, display: 'flex', alignItems: 'center', padding: '0 16px',
          background: COLORS.slateDark, position: 'sticky', top: 0, zIndex: 101,
          gap: 12, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button type="button" onClick={() => setDrawerOpen(!drawerOpen)} style={{
            background: 'none', border: 0, color: '#fff', fontSize: 18, cursor: 'pointer', padding: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {drawerOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
          <SafetyCertificateOutlined style={{ color: COLORS.iris, fontSize: 18 }} />
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>管理控制台</div>
        </div>
      )}

      {/* Backdrop */}
      {isMobile && drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{
          position: 'fixed', inset: 0, top: 52, background: 'rgba(0,0,0,0.5)',
          zIndex: 199, transition: 'opacity 0.2s',
        }} />
      )}

      {/* Sidebar */}
      <div
        style={{
          width: 240,
          background: `linear-gradient(180deg, ${COLORS.slateDark} 0%, #1e293b 100%)`,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          position: 'fixed',
          left: isMobile ? (drawerOpen ? 0 : -240) : 0,
          top: isMobile ? 52 : 0,
          bottom: 0,
          zIndex: isMobile ? 200 : 100,
          display: 'flex',
          flexDirection: 'column',
          transition: isMobile ? 'left 0.25s ease' : 'none',
        }}
      >
        {/* Brand — hidden on mobile (shown in header) */}
        {!isMobile && <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: 10,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${COLORS.iris}, ${COLORS.irisLight})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
            }}
          >
            <SafetyCertificateOutlined />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>管理控制台</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>Admin Console</div>
          </div>
        </div>}

        {/* Navigation */}
        <div style={{ flex: 1, padding: '12px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.key);
            return (
              <div
                key={item.key}
                onClick={() => handleNav(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  marginBottom: 2,
                  transition: 'all 0.15s',
                  background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 14 }}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* User + logout */}
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {username && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, padding: '0 12px 8px' }}>
              {username}
            </div>
          )}
          <Tooltip title="退出登录" placement="right">
            <div
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.55)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(244,63,94,0.15)';
                (e.currentTarget as HTMLDivElement).style.color = COLORS.rose;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.55)';
              }}
            >
              <LogoutOutlined style={{ fontSize: 16 }} />
              <span style={{ fontSize: 14 }}>退出登录</span>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          marginLeft: isMobile ? 0 : 240,
          flex: 1,
          width: isMobile ? '100vw' : 'calc(100vw - 240px)',
          minWidth: 0,
          background: COLORS.canvas,
          minHeight: isMobile ? 'calc(100vh - 52px)' : '100vh',
        }}
      >
        <div style={{ padding: isMobile ? 12 : 28, minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
