// 用户端登录页：账号密码换 token，成功后进入主界面。
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from 'antd';
import { message } from '../ui';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { COLORS } from '../theme';
import { userAuth } from '../userAuth';
import { useResponsive } from '../hooks/useResponsive';

export default function UserLogin() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username || !password) {
      message.warning('请输入账号和密码');
      return;
    }
    setLoading(true);
    try {
      await userAuth.login(username, password);
      message.success('登录成功');
      navigate('/', { replace: true });
    } catch (e: any) {
      message.error(e.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${COLORS.ink} 0%, ${COLORS.inkLight} 100%)`,
        backgroundImage: 'url(/login-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        style={{
          width: isMobile ? '100%' : 380,
          maxWidth: 380,
          background: COLORS.white,
          borderRadius: isMobile ? 12 : 18,
          padding: isMobile ? '24px 16px' : '40px 36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          margin: isMobile ? '0 16px' : undefined,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/favicon.svg" alt="Agent Studio" width={52} height={52} style={{ borderRadius: 14, margin: '0 auto 14px', display: 'block', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.slateDark }}>Agent Studio</div>
          <div style={{ fontSize: 13, color: COLORS.slate, marginTop: 4 }}>登录以继续使用</div>
        </div>

        <Input
          size="large"
          prefix={<UserOutlined style={{ color: COLORS.slate }} />}
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginBottom: 14 }}
          onPressEnter={submit}
        />
        <Input.Password
          size="large"
          prefix={<LockOutlined style={{ color: COLORS.slate }} />}
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 22 }}
          onPressEnter={submit}
        />
        <Button type="primary" size="large" block loading={loading} onClick={submit}>
          登录
        </Button>
      </div>
    </div>
  );
}
