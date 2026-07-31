// 用户端登录页：账号密码换 token，成功后进入主界面。
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Input } from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { message } from '../ui';
import { userAuth } from '../userAuth';
import { useInputHabit } from '../hooks/useInputHabit';
import './UserLogin.css';

const CAPABILITIES = [
  ['精准编排', '把复杂任务拆成可执行流程'],
  ['质量优先', '用评审与反馈持续校准结果'],
  ['全程可见', '过程、文件与产出都有迹可循'],
];

export default function UserLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useInputHabit('login.username', '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      await userAuth.login(username.trim(), password);
      message.success('登录成功');
      navigate('/', { replace: true });
    } catch (e: any) {
      setError(e.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-page__aurora login-page__aurora--one" aria-hidden="true" />
      <div className="login-page__aurora login-page__aurora--two" aria-hidden="true" />

      <div className="login-shell">
        <section className="login-story" aria-labelledby="login-brand-title">
          <div className="login-brand">
            <span className="login-brand__mark">
              <img src="/favicon.svg" alt="" width={34} height={34} />
            </span>
            <span>
              <strong>Agent Studio</strong>
              <small>AI PRODUCTION OS</small>
            </span>
          </div>

          <div className="login-story__content">
            <span className="login-story__eyebrow">
              <span className="login-story__pulse" />
              你的数字团队已就绪
            </span>
            <h1 id="login-brand-title">
              把创意，交给一支
              <span>会协作的数字团队。</span>
            </h1>
            <p>
              从想法、研究到生产与交付，让每位数字员工在同一个工作台里理解目标、协同执行、持续优化。
            </p>

            <div className="login-capabilities" aria-label="平台能力">
              {CAPABILITIES.map(([title, description]) => (
                <div className="login-capability" key={title}>
                  <CheckCircleFilled />
                  <span>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="login-story__footer">
            <span><i /> 单人创作工作区</span>
            <span>专注你的每一次高质量产出</span>
          </div>
        </section>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel__mobile-brand">
            <img src="/favicon.svg" alt="" width={38} height={38} />
            <span><strong>Agent Studio</strong><small>AI PRODUCTION OS</small></span>
          </div>

          <form
            className="login-form"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <div className="login-form__header">
              <span className="login-form__eyebrow">WELCOME BACK</span>
              <h2 id="login-title">登录工作台</h2>
              <p>继续推进你的项目和数字员工任务</p>
            </div>

            {error && (
              <Alert
                className="login-form__error"
                role="alert"
                showIcon
                type="error"
                message={error}
              />
            )}

            <div className="login-field">
              <label htmlFor="login-username">用户名</label>
              <Input
                id="login-username"
                name="username"
                autoComplete="username"
                autoFocus
                size="large"
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  if (error) setError('');
                }}
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">密码</label>
              <Input.Password
                id="login-password"
                name="password"
                autoComplete="current-password"
                size="large"
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError('');
                }}
              />
            </div>

            <Button
              className="login-submit"
              htmlType="submit"
              type="primary"
              size="large"
              block
              loading={loading}
            >
              {!loading && (
                <>
                  <span>进入工作台</span>
                  <ArrowRightOutlined />
                </>
              )}
            </Button>

            <p className="login-form__security">
              <SafetyCertificateOutlined />
              凭证仅用于验证当前工作台身份
            </p>
          </form>

          <p className="login-panel__copyright">© 2026 Agent Studio · Creative AI Platform</p>
        </section>
      </div>
    </main>
  );
}
