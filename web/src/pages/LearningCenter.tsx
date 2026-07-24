// 参考资料统一入口：按资料类型聚合优秀提示词与专业文章，旧功能仍按需懒加载。
import { lazy, Suspense } from 'react';
import { ReadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Spin, Tabs, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';

const AutoLearn = lazy(() => import('./AutoLearn'));
const ArticleLearn = lazy(() => import('./ArticleLearn'));

type LearningTab = 'prompts' | 'articles';

function PageLoading() {
  return (
    <div style={{ minHeight: 240, display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Spin />
        <div style={{ marginTop: 10, color: '#64748b' }}>正在打开参考资料</div>
      </div>
    </div>
  );
}

export default function LearningCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab: LearningTab = requestedTab === 'articles' ? 'articles' : 'prompts';

  const switchTab = (tab: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>给员工补充参考资料</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ margin: '6px 0 0' }}>
          为数字员工补充优秀提示词或专业文章，让它在后续任务中使用这些经验。
        </Typography.Paragraph>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={switchTab}
        items={[
          {
            key: 'prompts',
            label: <span><ThunderboltOutlined />收集优秀提示词</span>,
            children: (
              <Suspense fallback={<PageLoading />}>
                <AutoLearn embedded />
              </Suspense>
            ),
          },
          {
            key: 'articles',
            label: <span><ReadOutlined />学习专业文章</span>,
            children: (
              <Suspense fallback={<PageLoading />}>
                <ArticleLearn embedded />
              </Suspense>
            ),
          },
        ]}
      />
    </div>
  );
}
