// 全局错误边界：避免单个页面渲染异常导致整站白屏，给用户明确恢复入口。
import React from 'react';
import { Button, Result } from 'antd';

interface State { error: Error | null }

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('页面渲染失败', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <Result status="error" title="页面遇到问题"
      subTitle="你的数据没有丢失。可以重新加载页面；若问题持续，请复制控制台中的错误信息。"
      extra={<Button type="primary" onClick={() => window.location.reload()}>重新加载</Button>} />;
  }
}
