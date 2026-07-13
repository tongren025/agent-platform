// antd message 的上下文桥。
//
// antd v5 的静态 message.xxx() 拿不到 ConfigProvider 的主题上下文，
// 每次调用都在控制台刷 "Static function can not consume context" 告警，
// 且弹出的消息不跟随主题。根治办法是改用 App.useApp() 的实例——
// 但全仓 20+ 个文件在用静态 message，逐个改成 hook 侵入太大。
//
// 这里用桥接：main.tsx 挂 <AntdApp> + <AntdMessageBridge/> 把上下文实例
// 存进模块级变量，业务代码只需把 `import { message } from 'antd'`
// 换成从本模块导入，调用方式完全不变。桥未挂载时兜底回静态实现。
import { App as AntdApp, message as staticMessage } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

let impl: MessageInstance = staticMessage as unknown as MessageInstance;

/** 挂在 <AntdApp> 内部，把带上下文的 message 实例灌进模块变量。不渲染任何 DOM。 */
export function AntdMessageBridge() {
  const { message } = AntdApp.useApp();
  impl = message;
  return null;
}

/** 与 antd 静态 message 同形的代理：始终转发到当前实例（有上下文就用上下文的）。 */
export const message: MessageInstance = new Proxy({} as MessageInstance, {
  get: (_t, prop) => {
    const v = (impl as unknown as Record<PropertyKey, unknown>)[prop];
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(impl) : v;
  },
});
