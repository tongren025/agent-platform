// 前端入口：挂载 React 根组件，套 antd 中文语言包与主题配置。
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { theme } from './theme';
import { AntdMessageBridge } from './ui';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import './global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={theme}>
      {/* AntdApp 提供 message 等的主题上下文；Bridge 把实例灌给 ./ui 的代理，业务代码从 ./ui 导入 message */}
      <AntdApp component={false}>
        <AntdMessageBridge />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppErrorBoundary><App /></AppErrorBoundary>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>,
);
