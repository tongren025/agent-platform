// 用户端登录页：账号密码换 token，成功后进入主界面。
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Input } from 'antd';
import { message } from '../ui';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { COLORS } from '../theme';
import { userAuth } from '../userAuth';
import { useInputHabit } from '../hooks/useInputHabit';
import { useResponsive } from '../hooks/useResponsive';

export default function UserLogin() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [username, setUsername] = useInputHabit('login.username', '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      await userAuth.login(username, password);
      message.success('登录成功');
      navigate('/', { replace: true });
    } catch (e: any) {
      setError(e.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
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
      <form
        onSubmit={(event) => { event.preventDefault(); submit(); }}
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
          <h1 style={{ fontSize: 20, fontWeight: 700, color: COLORS.slateDark, margin: 0 }}>Agent Studio</h1>
          <div style={{ fontSize: 13, color: COLORS.slate, marginTop: 4 }}>登录以继续使用</div>
        </div>

        {error && <Alert role="alert" showIcon type="error" message={error} style={{ marginBottom: 16 }} />}
        <label htmlFor="login-username" style={{ display: 'block', marginBottom: 6, color: COLORS.slateDark }}>用户名</label>
        <Input
          id="login-username"
          name="username"
          autoComplete="username"
          size="large"
          prefix={<UserOutlined style={{ color: COLORS.slate }} />}
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginBottom: 14 }}
        />
        <label htmlFor="login-password" style={{ display: 'block', marginBottom: 6, color: COLORS.slateDark }}>密码</label>
        <Input.Password
          id="login-password"
          name="password"
          autoComplete="current-password"
          size="large"
          prefix={<LockOutlined style={{ color: COLORS.slate }} />}
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 22 }}
        />
        <Button htmlType="submit" type="primary" size="large" block loading={loading}>
          登录
        </Button>
      </form>
    </main>
  );
}
