// OpenRouter 模型市场：实时读取模型目录，筛选免费模型，并一键加入本地 openrouter 供应商。
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Segmented, Space, Table, Tag, Typography, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckOutlined, CloudDownloadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { api } from '../api';
import { useInputHabit } from '../hooks/useInputHabit';
import { message } from '../ui';
import { useResponsive } from '../hooks/useResponsive';

const { Title, Text } = Typography;

interface OpenRouterModel {
  id: string;
  name: string;
  contextLength?: number;
  promptPrice?: string;
  completionPrice?: string;
  isFree: boolean;
  modality?: string;
  inputModalities: string[];
  outputModalities: string[];
  configured: boolean;
}

function priceText(value?: string) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n === 0) return '$0';
  return `$${(n * 1_000_000).toFixed(2)} / 1M`;
}

function formatContext(value?: number) {
  if (!value) return '-';
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

export default function OpenRouterModels() {
  const { isMobile } = useResponsive();
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useInputHabit<'all' | 'free' | 'configured'>('openrouter.market-mode', 'free');
  const [query, setQuery] = useInputHabit('openrouter.market-query', '');
  const [adding, setAdding] = useState<Record<string, boolean>>({});

  const fetchModels = async () => {
    setLoading(true);
    try {
      const data = await api.listOpenRouterModels();
      setModels(data);
    } catch (e: any) {
      message.error(e.message || '读取 OpenRouter 模型失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModels(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models
      .filter((m) => (mode === 'free' ? m.isFree : mode === 'configured' ? m.configured : true))
      .filter((m) => !q || `${m.name} ${m.id} ${m.modality || ''}`.toLowerCase().includes(q))
      .sort((a, b) => Number(b.isFree) - Number(a.isFree) || a.name.localeCompare(b.name));
  }, [models, mode, query]);

  const addModel = async (model: OpenRouterModel) => {
    setAdding((prev) => ({ ...prev, [model.id]: true }));
    try {
      await api.addAiProviderModel('openrouter', {
        modelName: model.name,
        modelId: model.id,
        timeoutMinutes: 20,
      });
      message.success(`已加入: ${model.name}`);
      setModels((prev) => prev.map((m) => m.id === model.id ? { ...m, configured: true } : m));
    } catch (e: any) {
      message.error(e.message || '加入模型失败');
    } finally {
      setAdding((prev) => ({ ...prev, [model.id]: false }));
    }
  };

  const columns: ColumnsType<OpenRouterModel> = [
    {
      title: '模型',
      dataIndex: 'name',
      minWidth: 260,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space wrap>
            <Text strong>{record.name}</Text>
            {record.isFree && <Tag color="green">免费</Tag>}
            {record.configured && <Tag color="blue">已加入</Tag>}
          </Space>
          <Text code style={{ fontSize: 12 }}>{record.id}</Text>
        </Space>
      ),
    },
    {
      title: '能力',
      dataIndex: 'modality',
      responsive: ['md'],
      render: (_, record) => (
        <Space wrap size={4}>
          <Tag>{record.modality || 'text'}</Tag>
          {record.inputModalities?.includes('image') && <Tag color="purple">图像输入</Tag>}
          {record.inputModalities?.includes('file') && <Tag color="cyan">文件输入</Tag>}
        </Space>
      ),
    },
    {
      title: '上下文',
      dataIndex: 'contextLength',
      width: 110,
      sorter: (a, b) => (a.contextLength || 0) - (b.contextLength || 0),
      render: (v) => formatContext(v),
    },
    {
      title: '价格',
      width: 180,
      responsive: ['lg'],
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>输入 {priceText(record.promptPrice)}</Text>
          <Text style={{ fontSize: 12 }}>输出 {priceText(record.completionPrice)}</Text>
        </Space>
      ),
    },
    {
      title: '操作',
      width: 110,
      fixed: isMobile ? undefined : 'right',
      render: (_, record) => record.configured ? (
        <Button size="small" icon={<CheckOutlined />} disabled>已加入</Button>
      ) : (
        <Tooltip title="加入 openrouter 供应商，之后可在员工模型里选择">
          <Button size="small" type="primary" icon={<CloudDownloadOutlined />} loading={adding[record.id]} onClick={() => addModel(record)}>
            加入
          </Button>
        </Tooltip>
      ),
    },
  ];

  const freeCount = models.filter((m) => m.isFree).length;
  const configuredCount = models.filter((m) => m.configured).length;

  return (
    <div>
      <Space align="center" style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>模型市场</Title>
          <Text type="secondary">OpenRouter 模型目录实时拉取，免费模型已标绿。</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchModels} loading={loading}>刷新</Button>
      </Space>

      <Card style={{ borderRadius: 8, marginBottom: 14 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as typeof mode)}
            options={[
              { label: `免费 ${freeCount}`, value: 'free' },
              { label: `全部 ${models.length}`, value: 'all' },
              { label: `已加入 ${configuredCount}`, value: 'configured' },
            ]}
          />
          <Input
            allowClear
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索模型名、ID、能力"
            style={{ width: isMobile ? '100%' : 320 }}
          />
        </Space>
      </Card>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={filtered}
        size="middle"
        scroll={{ x: 900 }}
        pagination={{ pageSize: 20, showSizeChanger: true }}
      />
    </div>
  );
}
