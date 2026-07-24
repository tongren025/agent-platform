// 项目内视图切换：把总览、制作流水线和完整性检查收进同一个项目上下文。
import { Button, Space } from 'antd';
import {
  AppstoreOutlined,
  BarsOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export type ProjectView = 'overview' | 'pipeline' | 'diagnostics';

interface ProjectViewNavProps {
  projectId: string;
  current: ProjectView;
}

const views: Array<{
  key: ProjectView;
  label: string;
  icon: React.ReactNode;
  path: (projectId: string) => string;
}> = [
  {
    key: 'overview',
    label: '项目总览',
    icon: <AppstoreOutlined />,
    path: projectId => `/production/${projectId}`,
  },
  {
    key: 'pipeline',
    label: '制作流水线',
    icon: <BarsOutlined />,
    path: projectId => `/production/${projectId}/pipeline`,
  },
  {
    key: 'diagnostics',
    label: '完整性检查',
    icon: <WarningOutlined />,
    path: projectId => `/production/${projectId}/matrix`,
  },
];

export default function ProjectViewNav({ projectId, current }: ProjectViewNavProps) {
  const navigate = useNavigate();

  if (!projectId) return null;

  return (
    <nav aria-label="项目视图" style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Space.Compact>
        {views.map(view => (
          <Button
            key={view.key}
            size="small"
            type={current === view.key ? 'primary' : 'default'}
            icon={view.icon}
            aria-current={current === view.key ? 'page' : undefined}
            onClick={() => navigate(view.path(projectId))}
          >
            {view.label}
          </Button>
        ))}
      </Space.Compact>
    </nav>
  );
}
