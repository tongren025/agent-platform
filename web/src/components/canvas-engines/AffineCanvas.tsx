// AFFiNE 是完整应用而不是嵌入式组件，通过自托管地址接入统一画布中心。
import { Alert, Button, Result, Space, Typography } from 'antd';
import { ExportOutlined, SettingOutlined } from '@ant-design/icons';

export default function AffineCanvas() {
  const affineUrl = (import.meta.env.VITE_AFFINE_URL as string | undefined)?.replace(/\/$/, '');

  if (!affineUrl) {
    return (
      <Result
        icon={<SettingOutlined />}
        title="AFFiNE 源码已就位，等待自托管地址"
        subTitle="AFFiNE 是包含服务端、同步和账号体系的完整应用，不能像普通 React 组件直接打进主包。部署后在 VITE_AFFINE_URL 配置访问地址即可嵌入。"
        extra={[
          <Button key="docs" type="primary" href="https://docs.affine.pro/self-host-affine" target="_blank">
            查看自托管文档
          </Button>,
        ]}
      >
        <Typography.Paragraph copyable style={{ margin: '0 auto', maxWidth: 620 }}>
          VITE_AFFINE_URL=http://localhost:3010
        </Typography.Paragraph>
      </Result>
    );
  }

  return (
    <div style={{ height: '100%', position: 'relative', background: '#fff' }}>
      <Alert
        banner
        type="info"
        message={(
          <Space>
            <span>AFFiNE 自托管知识画布</span>
            <Button size="small" type="link" icon={<ExportOutlined />} href={affineUrl} target="_blank">
              新窗口打开
            </Button>
          </Space>
        )}
      />
      <iframe
        title="AFFiNE 知识画布"
        src={affineUrl}
        allow="clipboard-read; clipboard-write; fullscreen"
        style={{ width: '100%', height: 'calc(100% - 40px)', border: 0 }}
      />
    </div>
  );
}
