import { useState, useEffect } from 'react';
import {
  Card, Button, Input, Table, Tag, Space, Spin, Typography,
  message, Collapse, Select, Modal, Alert,
} from 'antd';
import {
  PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
  FileTextOutlined, ThunderboltOutlined, ReloadOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const API = '/api/v1/pipeline';

interface StageInfo {
  order: number;
  employeeKey: string;
  name: string;
  defaultCli: string;
}

interface StepResult {
  employeeKey: string;
  name: string;
  cliType: string;
  file: string;
  success: boolean;
  error?: string;
  elapsedSeconds: number;
  outputLength: number;
}

interface RunResult {
  runId: string;
  theme: string;
  outputDir: string;
  finalFile?: string;
  success: boolean;
  totalSeconds: number;
  steps: StepResult[];
}

interface RunRecord {
  runId: string;
  theme?: string;
  totalSeconds?: number;
  steps?: { name: string; success: boolean; cliType: string }[];
}

const CLI_COLORS: Record<string, string> = {
  claude: '#D97706',
  gemini: '#4285F4',
};

export default function Pipeline() {
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [cliStatus, setCliStatus] = useState<{
    available: Record<string, boolean>;
    stages: StageInfo[];
  } | null>(null);
  const [cliOverrides, setCliOverrides] = useState<Record<string, string>>({});
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [finalDoc, setFinalDoc] = useState('');
  const [finalModalOpen, setFinalModalOpen] = useState(false);
  const hasAvailableCli = cliStatus ? Object.values(cliStatus.available).some(Boolean) : true;

  const readError = async (res: Response) => {
    const text = await res.text().catch(() => '');
    try {
      const json = JSON.parse(text);
      return json.detail || json.message || text;
    } catch {
      return text || `HTTP ${res.status}`;
    }
  };

  useEffect(() => {
    fetch(`${API}/cli-status`).then(r => r.json()).then(setCliStatus).catch(() => {});
    fetch(`${API}/runs`).then(r => r.json()).then(setRuns).catch(() => {});
  }, []);

  const handleRun = async () => {
    if (!theme.trim()) {
      message.warning('请输入漫剧题材');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const body: any = { theme: theme.trim() };
      if (Object.keys(cliOverrides).length > 0) body.cli_overrides = cliOverrides;

      const res = await fetch(`${API}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await readError(res));
      const data: RunResult = await res.json();
      setResult(data);
      message.success(`流水线完成: ${data.steps.filter(s => s.success).length}/${data.steps.length} 步成功`);
      fetch(`${API}/runs`).then(r => r.json()).then(setRuns).catch(() => {});
    } catch (err: any) {
      message.error(`运行失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showFinal = async (runId: string) => {
    try {
      const res = await fetch(`${API}/runs/${runId}/final`);
      if (!res.ok) throw new Error(await readError(res));
      const data = await res.json();
      setFinalDoc(data.content);
      setFinalModalOpen(true);
    } catch (err: any) {
      message.error(`获取文档失败: ${err.message || '未知错误'}`);
    }
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 4 }}>
        <ThunderboltOutlined style={{ marginRight: 8 }} />
        CLI 创作流水线
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        用本地 Claude / Gemini CLI 驱动创作，直接使用订阅额度，无需 API Key
      </Paragraph>

      {/* CLI 状态 */}
      {cliStatus && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space size="large">
            <Text strong>CLI 状态:</Text>
            {Object.entries(cliStatus.available).map(([name, ok]) => (
              <Tag
                key={name}
                color={ok ? 'success' : 'default'}
                icon={ok ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              >
                {name} {ok ? '可用' : '未安装'}
              </Tag>
            ))}
          </Space>
        </Card>
      )}
      {cliStatus && !hasAvailableCli && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="未检测到可用 CLI"
          description="安装并登录 Claude 或 Gemini CLI 后，这条本地创作流水线才能运行。其他页面和普通工作流不受影响。"
        />
      )}

      {/* 输入区 */}
      <Card title="新建创作" style={{ marginBottom: 24 }}>
        <TextArea
          rows={4}
          placeholder="输入漫剧题材/梗概，例如：一个社恐程序员意外获得读心术，在职场和恋爱中闹出一系列搞笑又温暖的故事"
          value={theme}
          onChange={e => setTheme(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {/* 高级：CLI 覆盖 */}
        {cliStatus && (
          <Collapse
            ghost
            style={{ marginBottom: 16 }}
            items={[{
              key: 'cli-map',
              label: '高级选项：自定义角色 → CLI 映射',
              children: (
                <Table
                  size="small"
                  dataSource={cliStatus.stages}
                  rowKey="employeeKey"
                  pagination={false}
                  columns={[
                    { title: '顺序', dataIndex: 'order', width: 60 },
                    { title: '角色', dataIndex: 'name', width: 140 },
                    {
                      title: 'CLI',
                      width: 160,
                      render: (_, row) => (
                        <Select
                          size="small"
                          value={cliOverrides[row.employeeKey] || row.defaultCli}
                          onChange={v => setCliOverrides(prev => ({ ...prev, [row.employeeKey]: v }))}
                          style={{ width: 120 }}
                        >
                          <Option value="claude">Claude</Option>
                          <Option value="gemini">Gemini</Option>
                        </Select>
                      ),
                    },
                  ]}
                />
              ),
            }]}
          />
        )}

        <Button
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          loading={loading}
          onClick={handleRun}
          disabled={!theme.trim() || !hasAvailableCli}
        >
          {loading ? '创作中...' : '开始创作'}
        </Button>
        {loading && (
          <Text type="secondary" style={{ marginLeft: 16 }}>
            9 个角色依次创作，预计 3-8 分钟
          </Text>
        )}
      </Card>

      {/* 运行结果 */}
      {result && (
        <Card
          title={`运行结果: ${result.runId}`}
          extra={
            <Space>
              <Tag color={result.success ? 'success' : 'error'}>
                {result.success ? '成功' : '部分失败'}
              </Tag>
              <Text type="secondary">耗时 {result.totalSeconds}s</Text>
              <Button
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => showFinal(result.runId)}
              >
                查看完整文档
              </Button>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Table
            size="small"
            dataSource={result.steps}
            rowKey="employeeKey"
            pagination={false}
            columns={[
              { title: '角色', dataIndex: 'name', width: 140 },
              {
                title: 'CLI',
                dataIndex: 'cliType',
                width: 100,
                render: v => (
                  <Tag color={CLI_COLORS[v] || 'default'}>{v}</Tag>
                ),
              },
              {
                title: '状态',
                dataIndex: 'success',
                width: 80,
                render: v => v
                  ? <Tag color="success" icon={<CheckCircleOutlined />}>成功</Tag>
                  : <Tag color="error" icon={<CloseCircleOutlined />}>失败</Tag>,
              },
              {
                title: '耗时',
                dataIndex: 'elapsedSeconds',
                width: 80,
                render: v => `${v}s`,
              },
              {
                title: '输出长度',
                dataIndex: 'outputLength',
                width: 100,
                render: v => `${v} 字`,
              },
              {
                title: '错误',
                dataIndex: 'error',
                render: v => v ? <Text type="danger">{v}</Text> : '-',
              },
            ]}
          />
        </Card>
      )}

      {/* 历史记录 */}
      <Card
        title="历史记录"
        extra={
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => fetch(`${API}/runs`).then(r => r.json()).then(setRuns)}
          >
            刷新
          </Button>
        }
      >
        {runs.length === 0 ? (
          <Text type="secondary">暂无运行记录</Text>
        ) : (
          <Table
            size="small"
            dataSource={runs}
            rowKey="runId"
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'ID', dataIndex: 'runId', width: 180 },
              { title: '题材', dataIndex: 'theme', ellipsis: true },
              {
                title: '耗时',
                dataIndex: 'totalSeconds',
                width: 80,
                render: v => v ? `${v}s` : '-',
              },
              {
                title: '操作',
                width: 120,
                render: (_, row) => (
                  <Button
                    size="small"
                    type="link"
                    icon={<FileTextOutlined />}
                    onClick={() => showFinal(row.runId)}
                  >
                    查看
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Card>

      {/* 文档查看弹窗 */}
      <Modal
        title="完整创作文档"
        open={finalModalOpen}
        onCancel={() => setFinalModalOpen(false)}
        footer={null}
        width={900}
      >
        <pre style={{
          whiteSpace: 'pre-wrap',
          maxHeight: '70vh',
          overflow: 'auto',
          fontSize: 13,
          lineHeight: 1.6,
          background: '#fafafa',
          padding: 16,
          borderRadius: 8,
        }}>
          {finalDoc}
        </pre>
      </Modal>
    </div>
  );
}
