// tldraw SDK 画布：通过 persistenceKey 使用本地 IndexedDB；生产环境需许可证密钥。
import { Alert } from 'antd';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

export default function TldrawCanvas() {
  const licenseKey = import.meta.env.VITE_TLDRAW_LICENSE_KEY as string | undefined;
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {!licenseKey && (
        <Alert
          banner
          type="warning"
          showIcon
          message="tldraw 已接入；开发环境可直接使用，生产部署前必须配置 VITE_TLDRAW_LICENSE_KEY。"
          style={{ position: 'absolute', inset: '0 0 auto 0', zIndex: 300 }}
        />
      )}
      <Tldraw
        persistenceKey="agent-platform-tldraw"
        licenseKey={licenseKey}
      />
    </div>
  );
}
