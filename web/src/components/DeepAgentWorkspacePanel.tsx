// DeepAgent 待办列表与虚拟工作区状态展示面板组件
import { Alert, Button, Empty, Spin, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  PauseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type {
  DeepAgentWorkspace,
  DeepAgentWorkspaceFile,
} from '../types';
import { COLORS } from '../theme';

const { Text } = Typography;

interface Props {
  workspace: DeepAgentWorkspace | null;
  loading: boolean;
  error: string;
  runActive?: boolean;
  onRetry: () => void;
  onOpenFile: (file: DeepAgentWorkspaceFile) => void;
}

function todoPresentation(status: string, runActive: boolean) {
  if (status === 'completed') {
    return { color: 'success', label: '完成', icon: <CheckCircleOutlined /> };
  }
  if (status === 'in_progress') {
    return runActive
      ? { color: 'processing', label: '执行中', icon: <SyncOutlined spin /> }
      : { color: 'warning', label: '待继续', icon: <PauseCircleOutlined /> };
  }
  return { color: 'default', label: '待处理', icon: <ClockCircleOutlined /> };
}

function fileName(path: string) {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || path;
}

export default function DeepAgentWorkspacePanel({
  workspace,
  loading,
  error,
  runActive = false,
  onRetry,
  onOpenFile,
}: Props) {
  const completedCount = workspace?.todos.filter(todo => todo.status === 'completed').length ?? 0;

  return (
    <section aria-label="DeepAgent 工作区" style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <Text strong style={{ fontSize: 13, color: COLORS.slate }}>
          <FolderOpenOutlined style={{ marginRight: 6 }} />
          工作进度
        </Text>
        {workspace?.checkpointVersion != null && (
          <Tag style={{ margin: 0, fontSize: 10 }}>v{workspace.checkpointVersion}</Tag>
        )}
      </div>

      {loading ? (
        <div role="status" aria-live="polite" style={{ padding: '18px 0', textAlign: 'center' }}>
          <Spin size="small" />
          <Text type="secondary" style={{ display: 'block', marginTop: 6, fontSize: 12 }}>正在读取工作区…</Text>
        </div>
      ) : error ? (
        <Alert
          type="error"
          showIcon
          message="工作区加载失败"
          description={error}
          action={<Button size="small" onClick={onRetry}>重试</Button>}
        />
      ) : !workspace ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="选择会话后查看" />
      ) : (
        <>
          {workspace.status === 'warning' && (
            <Alert type="warning" showIcon message={workspace.summary} style={{ marginBottom: 10 }} />
          )}
          {workspace.status !== 'warning' && (
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 10 }}>
              {workspace.todos.length > 0
                ? `${completedCount}/${workspace.todos.length} 项完成 · ${workspace.files.length} 个工作文件`
                : workspace.summary}
            </Text>
          )}

          {workspace.todos.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Text style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>待办</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {workspace.todos.map((todo, index) => {
                  const presentation = todoPresentation(todo.status, runActive);
                  return (
                    <div key={`${todo.content}-${index}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <Tag color={presentation.color} icon={presentation.icon} style={{ margin: 0, fontSize: 10, flexShrink: 0 }}>
                        {presentation.label}
                      </Tag>
                      <Text style={{ fontSize: 12, lineHeight: 1.5 }}>{todo.content || '未命名待办'}</Text>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {workspace.files.length > 0 && (
            <div>
              <Text style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>文件</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {workspace.files.map(file => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => onOpenFile(file)}
                    title={file.path}
                    style={{
                      width: '100%',
                      border: `1px solid ${COLORS.border}`,
                      background: '#fff',
                      borderRadius: 8,
                      padding: '8px 9px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'left',
                    }}
                  >
                    <FileTextOutlined style={{ color: file.kind === 'large_tool_result' ? '#f59e0b' : COLORS.iris }} />
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fileName(file.path)}
                      </span>
                      <span style={{ display: 'block', fontSize: 10, color: COLORS.slate }}>
                        {file.kind === 'large_tool_result' ? '完整工具结果' : '工作文件'} · {file.size} 字符
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {workspace.todos.length === 0 && workspace.files.length === 0 && workspace.status !== 'warning' && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="DeepAgent 尚未创建待办或文件" />
          )}
        </>
      )}
    </section>
  );
}
