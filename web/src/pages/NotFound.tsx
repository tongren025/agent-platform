// 404 页面未找到降级与返回导航组件
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Result
      icon={<img src="/empty-404.svg" alt="" width={220} style={{ margin: '0 auto' }} />}
      title="页面不存在"
      subTitle="你访问的路径无效，可能是链接已失效或输入有误。"
      extra={
        <Button type="primary" onClick={() => navigate('/', { replace: true })}>
          返回首页
        </Button>
      }
    />
  );
}
