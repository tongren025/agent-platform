// 标准 MCP OAuth 浏览器回调页：使用现有登录凭证把 code/state 交给后端完成交换。
import { useEffect, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';

export default function McpOAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在完成 MCP 登录并验证连接');

  useEffect(() => {
    const state = params.get('state') || '';
    const code = params.get('code') || '';
    const error = params.get('error');
    if (error) {
      setStatus('error');
      setMessage(params.get('error_description') || error);
      return;
    }
    if (!state || !code) {
      setStatus('error');
      setMessage('授权回调缺少 code 或 state');
      return;
    }
    void api.completeSystemManagerMcpOAuth(state, code)
      .then(result => {
        setStatus('success');
        setMessage(`MCP「${result.serverCode}」登录成功，发现 ${result.toolCount} 个工具。`);
      })
      .catch((reason: any) => {
        setStatus('error');
        setMessage(reason?.message || 'MCP 登录失败');
      });
  }, [params]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div><Spin size="large" /><div style={{ marginTop: 16 }}>{message}</div></div>
      </div>
    );
  }
  return (
    <Result
      status={status}
      title={status === 'success' ? 'MCP 登录完成' : 'MCP 登录未完成'}
      subTitle={message}
      extra={<Button type="primary" onClick={() => navigate('/advanced/tools')}>返回系统工具</Button>}
    />
  );
}
