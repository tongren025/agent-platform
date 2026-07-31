// 画布提示词学习与采纳记录追溯页面组件
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Empty,
  List,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  ReloadOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '../api';
import { message } from '../ui';

const { Paragraph, Text } = Typography;

const KIND_LABEL: Record<string, string> = {
  character: '人物定妆',
  scene: '场景定景',
  storyboard: '分镜方案',
  image_prompt: '图片分镜',
  video_prompt: '视频分镜',
  prompt_refine: '提示词优化',
};

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
  message.success('提示词已复制');
}

export default function CanvasPromptLearning() {
  const [data, setData] = useState<any>({ catalog: [], records: [], stats: {} });
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [overview, employeeRows] = await Promise.all([
        api.getCanvasPromptLearning(150),
        api.listEmployees().catch(() => []),
      ]);
      setData(overview || { catalog: [], records: [], stats: {} });
      setEmployees(employeeRows);
    } catch {
      setError('画布提示词学习记录暂时无法加载，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const employeeNames = useMemo(
    () => new Map(employees.map((item) => [item.employeeKey, item.name || item.employeeKey])),
    [employees],
  );

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void load()}>刷新</Button>
      </Space>

      <Alert
        type="success"
        showIcon
        style={{ marginBottom: 16, borderRadius: 8 }}
        message="画布会学习你真正采用的提示词"
        description="系统已内置人物定妆、场景定景、图片分镜、视频分镜和首帧接力方法。AI 提出的内容不会直接学习；只有你在画布中确认落地或点击“应用优化”后，成功案例才会进入对应数字员工的经验与行为记忆，供后续项目复用。"
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={<Button size="small" onClick={() => void load()}>重试</Button>}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small"><Statistic title="内置专业方法" value={data.stats?.builtinCount || 0} prefix={<BookOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small"><Statistic title="已采用案例" value={data.stats?.acceptedCount || 0} prefix={<CheckCircleOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small"><Statistic title="已学习员工" value={data.stats?.employeeCount || 0} prefix={<RobotOutlined />} /></Card>
        </Col>
      </Row>

      <Card title="画布内置方法论" style={{ marginBottom: 16 }}>
        <Paragraph type="secondary">
          这些不是空白占位符，而是画布 Agent 在人物、场景和分镜任务中实际注入的创作规则；也可以复制后自行修改。
        </Paragraph>
        <Collapse
          items={(data.catalog || []).map((item: any) => ({
            key: item.id,
            label: (
              <Space wrap>
                <Text strong>{item.title}</Text>
                {(item.tags || []).slice(0, 4).map((tag: string) => <Tag key={tag}>{tag}</Tag>)}
              </Space>
            ),
            children: (
              <>
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{item.prompt}</Paragraph>
                <Button size="small" icon={<CopyOutlined />} onClick={() => void copyText(item.prompt)}>复制</Button>
              </>
            ),
          }))}
        />
      </Card>

      <Card title="最近确认采用的提示词">
        {loading && !(data.records || []).length ? (
          <div style={{ minHeight: 160, display: 'grid', placeItems: 'center' }}><Spin /></div>
        ) : (
          <List
            dataSource={data.records || []}
            locale={{ emptyText: <Empty description="还没有采用记录；在画布确认一次定妆、分镜或提示词优化后会出现在这里。" /> }}
            renderItem={(item: any) => (
              <List.Item
                actions={[
                  <Button key="copy" type="link" icon={<CopyOutlined />} onClick={() => void copyText(item.prompt)}>复制</Button>,
                ]}
              >
                <List.Item.Meta
                  title={(
                    <Space wrap>
                      <span>{item.title || '未命名提示词'}</span>
                      <Tag color="blue">{KIND_LABEL[item.kind] || item.kind}</Tag>
                      {item.employeeKey && <Tag icon={<RobotOutlined />}>{employeeNames.get(item.employeeKey) || item.employeeKey}</Tag>}
                    </Space>
                  )}
                  description={(
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text type="secondary">{dayjs(item.acceptedAt).format('YYYY-MM-DD HH:mm')}</Text>
                      <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '展开' }} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {item.prompt}
                      </Paragraph>
                    </Space>
                  )}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
