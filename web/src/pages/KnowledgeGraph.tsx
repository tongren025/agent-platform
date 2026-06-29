import { useEffect, useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Background, Controls, useNodesState, useEdgesState,
  type Node, type Edge, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Drawer, Spin, Tag, Space, Typography, Empty, Descriptions } from 'antd';
import {
  TeamOutlined, ToolOutlined, ThunderboltOutlined,
  CloudServerOutlined, ApartmentOutlined, PartitionOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { COLORS } from '../theme';

const { Text } = Typography;

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
      data: { label: n.label, type: n.type, color: cfg.color, icon: cfg.icon, metadata: n.metadata } as KGNodeData,
    };
  });

  const edges: Edge[] = rawEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: RELATION_LABELS[e.relation] || e.relation,
    type: 'default',
    animated: e.relation === 'workflow_contains',
    style: { stroke: COLORS.slate, strokeWidth: 1.5, opacity: 0.5 },
    labelStyle: { fontSize: 10, fill: COLORS.slate },
    markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: COLORS.slate },
  }));

  return { nodes, edges };
}

export default function KnowledgeGraph() {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selected, setSelected] = useState<KGNodeData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nodeTypes = useMemo(() => ({ kg: KGNode }), []);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getKnowledgeGraph();
        const layout = radialLayout(data.nodes, data.edges);
        setNodes(layout.nodes);
        setEdges(layout.edges);
      } catch {
        // empty graph
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelected(node.data as KGNodeData);
    setDrawerOpen(true);
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', padding: 120, textAlign: 'center' }} />;
  }

  if (nodes.length === 0) {
    return (
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
          <ShareAltOutlined style={{ marginRight: 8, color: COLORS.iris }} />
          知识图谱
        </div>
        <Empty description="暂无实体数据，请先创建数字员工、工具或工作流" style={{ padding: 80 }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            <ShareAltOutlined style={{ marginRight: 8, color: COLORS.iris }} />
            知识图谱
          </div>
          <div style={{ color: COLORS.slate, fontSize: 13, marginTop: 2 }}>
            可视化展示数字员工、工具、技能、团队、工作流之间的关系网络
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
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable
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
        {selected && (
          <Descriptions column={1} size="small" bordered>
            {Object.entries(selected.metadata).map(([k, v]) => (
              <Descriptions.Item key={k} label={k}>
                {typeof v === 'boolean' ? (v ? '是' : '否') : String(v || '-')}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
