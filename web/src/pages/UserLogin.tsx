import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { COLORS } from '../theme';
import { userAuth } from '../userAuth';

export default function UserLogin() {
  const navigate = useNavigate();
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
      }}
    >
      <div
        style={{
          width: 380,
          background: COLORS.white,
          borderRadius: 18,
          padding: '40px 36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              margin: '0 auto 14px',
              background: `linear-gradient(135deg, ${COLORS.iris}, ${COLORS.irisLight})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 22,
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            }}
          >
            A
          </div>
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
