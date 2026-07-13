// 用户端路由守卫：校验 token 有效性，未登录跳 /login。
import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { userToken, userAuth } from '../userAuth';

export default function UserAuthGuard() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    if (!userToken.get()) {
      setStatus('denied');
      return;
    }
    userAuth.check().then((valid) => setStatus(valid ? 'ok' : 'denied'));
  }, []);

  if (status === 'loading') return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><div style={{ textAlign: 'center' }}><Spin size="large" /><div style={{ marginTop: 12, color: '#64748b' }}>正在验证登录状态</div></div></div>;
  if (status === 'denied') return <Navigate to="/login" replace />;
  return <Outlet />;
}
