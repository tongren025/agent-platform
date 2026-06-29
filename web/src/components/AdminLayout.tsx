import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Tooltip, message } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { COLORS } from '../theme';
import { adminApi, adminToken } from '../adminApi';

const navItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '系统总览' },
  { key: '/admin/employees', icon: <TeamOutlined />, label: '员工治理' },
  { key: '/admin/providers', icon: <ApiOutlined />, label: 'AI 服务商' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [username, setUsername] = useState('');

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', width: '100vw', overflowX: 'hidden' }}>
      {/* Sidebar — 管理端用偏冷的深色调，与用户端区分 */}
      <div
        style={{
          width: 240,
          background: `linear-gradient(180deg, ${COLORS.slateDark} 0%, #1e293b 100%)`,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand */}
        <div
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
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '12px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.key);
            return (
              <div
                key={item.key}
                onClick={() => navigate(item.key)}
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
          marginLeft: 240,
          flex: 1,
          width: 'calc(100vw - 240px)',
          minWidth: 0,
          background: COLORS.canvas,
          minHeight: '100vh',
        }}
      >
        <div style={{ padding: 28, minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
