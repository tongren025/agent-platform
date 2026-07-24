// 知识图谱页：员工/工具/技能/团队/工作流的关系可视化。
import { useEffect, useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Background, Controls, useNodesState, useEdgesState,
  type Node, type Edge, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Descriptions, Drawer, Empty, Result, Space, Spin, Tag, Typography } from 'antd';
import {
  TeamOutlined, ToolOutlined, ThunderboltOutlined,
  CloudServerOutlined, ApartmentOutlined, PartitionOutlined,
  ReloadOutlined, ShareAltOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { COLORS } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

const { Text, Title } = Typography;

interface KGNodeData {
  label: string;
  type: string;
  color: string;
  icon: React.ReactNode;
  metadata: Record<string, any>;
}

const TYPE_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  employee:   { color: COLORS.iris,   label: '数字员工', icon: <TeamOutlined /> },
  tool:       { color: COLORS.mint,   label: '工具',     icon: <ToolOutlined /> },
  skill:      { color: '#f59e0b',     label: '技能',     icon: <ThunderboltOutlined /> },
  mcp_server: { color: '#8b5cf6',     label: 'MCP 服务', icon: <CloudServerOutlined /> },
  team:       { color: COLORS.rose,   label: '团队',     icon: <ApartmentOutlined /> },
  workflow:   { color: '#06b6d4',     label: '工作流',   icon: <PartitionOutlined /> },
};

const RELATION_LABELS: Record<string, string> = {
  uses_tool: '使用工具',
  has_skill: '拥有技能',
  uses_mcp: '使用 MCP',
  member_of: '隶属团队',
  leads: '领导',
  workflow_contains: '包含员工',
};

const REVERSE_RELATION_LABELS: Record<string, string> = {
  uses_tool: '被员工使用',
  has_skill: '被员工掌握',
  uses_mcp: '被员工连接',
  member_of: '团队成员',
  leads: '由其领导',
  workflow_contains: '所属工作流',
};

const METADATA_LABELS: Record<string, string> = {
  key: '标识',
  code: '标识',
  employeeKey: '员工标识',
  name: '名称',
  role: '角色',
  enabled: '是否启用',
  description: '说明',
  teamCode: '团队',
  source: '来源',
  type: '类型',
};

interface KGRelation {
  label: string;
  otherLabel: string;
  otherType: string;
}

function KGNode({ data }: { data: KGNodeData }) {
  return (
    <div style={{
      padding: '8px 14px',
      borderRadius: 10,
      background: '#fff',
      border: `2px solid ${data.color}`,
      boxShadow: `0 2px 8px ${data.color}22`,
      fontSize: 12,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      maxWidth: 160,
      cursor: 'pointer',
    }}>
      <span style={{ color: data.color, fontSize: 14 }}>{data.icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {data.label}
      </span>
    </div>
  );
}

function radialLayout(
  rawNodes: { id: string; type: string; label: string; metadata: any }[],
  rawEdges: { id: string; source: string; target: string; relation: string }[],
): { nodes: Node[]; edges: Edge[] } {
  const empNodes = rawNodes.filter(n => n.type === 'employee');
  const otherNodes = rawNodes.filter(n => n.type !== 'employee');

  const adjacency = new Map<string, Set<string>>();
  for (const e of rawEdges) {
    if (!adjacency.has(e.source)) adjacency.set(e.source, new Set());
    if (!adjacency.has(e.target)) adjacency.set(e.target, new Set());
    adjacency.get(e.source)!.add(e.target);
    adjacency.get(e.target)!.add(e.source);
  }

  const cx = 600, cy = 400;
  const innerR = Math.max(150, empNodes.length * 40);
  const outerR = innerR + 180;
  const positions = new Map<string, { x: number; y: number }>();

  empNodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(empNodes.length, 1);
    positions.set(n.id, { x: cx + innerR * Math.cos(angle), y: cy + innerR * Math.sin(angle) });
  });

  const placed = new Set(empNodes.map(n => n.id));
  const unplaced = [...otherNodes];

  for (const n of unplaced) {
    const neighbors = adjacency.get(n.id);
    if (neighbors) {
      const anchors = [...neighbors].filter(id => placed.has(id));
      if (anchors.length > 0) {
        let ax = 0, ay = 0;
        for (const a of anchors) {
          const p = positions.get(a)!;
          ax += p.x; ay += p.y;
        }
        ax /= anchors.length; ay /= anchors.length;
        const angle = Math.atan2(ay - cy, ax - cx);
        const jitter = (Math.random() - 0.5) * 0.6;
        positions.set(n.id, {
          x: cx + outerR * Math.cos(angle + jitter),
          y: cy + outerR * Math.sin(angle + jitter),
        });
        placed.add(n.id);
        continue;
      }
    }
    const angle = Math.random() * 2 * Math.PI;
    const r = outerR + 60 + Math.random() * 80;
    positions.set(n.id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }

  const nodes: Node[] = rawNodes.map(n => {
    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.tool;
    const pos = positions.get(n.id) || { x: cx, y: cy };
    return {
      id: n.id,
      type: 'kg',
      position: pos,
      ariaLabel: `${cfg.label}：${n.label}`,
      data: { label: n.label, type: n.type, color: cfg.color, icon: cfg.icon, metadata: n.metadata } as KGNodeData,
    };
  });

  const edges: Edge[] = rawEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: RELATION_LABELS[e.relation] || e.relation,
    data: { relation: e.relation },
    type: 'default',
    animated: e.relation === 'workflow_contains',
    style: { stroke: COLORS.slate, strokeWidth: 1.5, opacity: 0.5 },
    labelStyle: { fontSize: 10, fill: COLORS.slate },
    markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: COLORS.slate },
  }));

  return { nodes, edges };
}

export default function KnowledgeGraph() {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selected, setSelected] = useState<KGNodeData | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nodeTypes = useMemo(() => ({ kg: KGNode }), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getKnowledgeGraph();
      const layout = radialLayout(data.nodes, data.edges);
      setNodes(layout.nodes);
      setEdges(layout.edges);
    } catch (e: any) {
      setError(e.message || '员工能力关系暂时无法加载');
    } finally {
      setLoading(false);
    }
  }, [setEdges, setNodes]);

  useEffect(() => { load(); }, [load]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelected(node.data as KGNodeData);
    setSelectedNodeId(node.id);
    setDrawerOpen(true);
  }, []);

  const openDetails = (nodeId: string, data: KGNodeData) => {
    setSelected(data);
    setSelectedNodeId(nodeId);
    setDrawerOpen(true);
  };

  const relationsByNode = useMemo(() => {
    const nodeData = new Map(nodes.map(node => [node.id, node.data as KGNodeData]));
    const result = new Map<string, KGRelation[]>();
    const append = (nodeId: string, relation: KGRelation) => {
      result.set(nodeId, [...(result.get(nodeId) || []), relation]);
    };
    for (const edge of edges) {
      const relationKey = String(edge.data?.relation || '');
      const source = nodeData.get(edge.source);
      const target = nodeData.get(edge.target);
      if (source && target) {
        append(edge.source, {
          label: RELATION_LABELS[relationKey] || String(edge.label || relationKey || '关联'),
          otherLabel: target.label,
          otherType: target.type,
        });
        append(edge.target, {
          label: REVERSE_RELATION_LABELS[relationKey] || '关联',
          otherLabel: source.label,
          otherType: source.type,
        });
      }
    }
    return result;
  }, [edges, nodes]);

  const selectedRelations = relationsByNode.get(selectedNodeId) || [];
  const renderDetails = () => selected && <>
    {selectedRelations.length > 0 && <section aria-labelledby="selected-relations-title" style={{ marginBottom: 18 }}>
      <Title id="selected-relations-title" level={5}>与它有关的员工和能力</Title>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {selectedRelations.map((relation, index) => (
          <li key={`${relation.label}-${relation.otherLabel}-${index}`} style={{ marginBottom: 8 }}>
            <Text>{relation.label}：</Text>
            <Tag color={TYPE_CONFIG[relation.otherType]?.color}>{relation.otherLabel}</Tag>
          </li>
        ))}
      </ul>
    </section>}
    <Descriptions column={1} size="small" bordered>
      {Object.entries(selected.metadata).map(([key, value]) => (
        <Descriptions.Item key={key} label={METADATA_LABELS[key] || key}>
          {typeof value === 'boolean' ? (value ? '是' : '否') : String(value ?? '-')}
        </Descriptions.Item>
      ))}
    </Descriptions>
  </>;

  if (loading) {
    return <div role="status" aria-live="polite" aria-label="正在加载员工能力关系">
      <Spin size="large" style={{ display: 'block', padding: 120, textAlign: 'center' }} />
    </div>;
  }

  if (error) {
    return <Result
      status="error"
      title="员工能力关系暂时无法加载"
      subTitle={error}
      extra={<Button type="primary" icon={<ReloadOutlined />} onClick={load}>重新加载</Button>}
    />;
  }

  if (isMobile) {
    return (
      <main aria-labelledby="knowledge-relations-mobile-title">
        <Title id="knowledge-relations-mobile-title" level={2} style={{ marginTop: 0 }}>员工能力关系</Title>
        <Text type="secondary">手机端以列表展示；在电脑上打开可查看和拖动完整关系图。</Text>
        {nodes.length === 0 ? (
          <Empty image={<img src="/empty-data.svg" alt="" width={140} />}
            description="还没有可展示的员工、工具或工作流" style={{ padding: '56px 16px' }} />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0' }}>
            {nodes.map(node => {
              const data = node.data as KGNodeData;
              const cfg = TYPE_CONFIG[data.type] || TYPE_CONFIG.tool;
              const relations = relationsByNode.get(node.id) || [];
              return <li key={node.id} style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => openDetails(node.id, data)}
                  aria-label={`查看${data.label}的详情，共${relations.length}条关系`}
                  style={{
                    width: '100%', minHeight: 56, padding: '12px 14px', textAlign: 'left',
                    display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12,
                    border: `1px solid ${COLORS.border}`, borderRadius: 12, background: '#fff', cursor: 'pointer',
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span style={{ color: cfg.color, marginRight: 8 }} aria-hidden>{cfg.icon}</span>
                    <Text strong>{data.label}</Text>
                    {relations.slice(0, 2).map((relation, index) => <span key={`${relation.label}-${index}`}
                      style={{ display: 'block', color: COLORS.slate, fontSize: 12, marginTop: 3 }}>
                      {relation.label}：{relation.otherLabel}
                    </span>)}
                  </span>
                  <span style={{ flexShrink: 0 }}>
                    <Tag color={cfg.color}>{cfg.label}</Tag>
                    <Text type="secondary">{relations.length} 条关系</Text>
                  </span>
                </button>
              </li>;
            })}
          </ul>
        )}
        <Drawer
          title={selected?.label || '详情'}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width="min(400px, 100vw)"
        >
          {renderDetails()}
        </Drawer>
      </main>
    );
  }

  if (nodes.length === 0) {
    return (
      <main aria-labelledby="knowledge-relations-empty-title">
        <Title id="knowledge-relations-empty-title" level={2} style={{ fontSize: 22, marginBottom: 20 }}>
          <ShareAltOutlined style={{ marginRight: 8, color: COLORS.iris }} />
          员工能力关系
        </Title>
        <Empty image={<img src="/empty-data.svg" alt="" width={160} />} description="还没有可展示的员工、工具或工作流" style={{ padding: 80 }} />
      </main>
    );
  }

  return (
    <main aria-labelledby="knowledge-relations-title">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title id="knowledge-relations-title" level={2} style={{ fontSize: 22, margin: 0 }}>
            <ShareAltOutlined style={{ marginRight: 8, color: COLORS.iris }} />
            员工能力关系
          </Title>
          <div style={{ color: COLORS.slate, fontSize: 13, marginTop: 2 }}>
            查看数字员工用了哪些工具、技能，参加了哪些团队和工作流
          </div>
        </div>
        <Space size={12}>
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
            <Tag key={type} style={{ borderRadius: 6, border: `1px solid ${cfg.color}`, color: cfg.color, background: `${cfg.color}11` }}>
              {cfg.icon} <span style={{ marginLeft: 4 }}>{cfg.label}</span>
            </Tag>
          ))}
        </Space>
      </div>

      <div style={{ height: 'calc(100vh - 160px)', borderRadius: 14, overflow: 'hidden', border: `1px solid ${COLORS.border}`, background: '#fafbfe' }}>
        <ReactFlow
          aria-label="数字员工、工具、技能、团队和工作流的关系图"
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable
          nodesFocusable
          nodesConnectable={false}
          elementsSelectable
          minZoom={0.3}
          maxZoom={2}
        >
          <Background color={COLORS.border} gap={20} />
          <Controls position="bottom-right" />
        </ReactFlow>
      </div>

      <Drawer
        title={selected ? (
          <Space>
            <span style={{ color: TYPE_CONFIG[selected.type]?.color }}>{TYPE_CONFIG[selected.type]?.icon}</span>
            {selected.label}
            <Tag color={TYPE_CONFIG[selected.type]?.color}>{TYPE_CONFIG[selected.type]?.label}</Tag>
          </Space>
        ) : '详情'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
      >
        {renderDetails()}
      </Drawer>
    </main>
  );
}
