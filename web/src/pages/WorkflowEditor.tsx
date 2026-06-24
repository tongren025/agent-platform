import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background, Controls, addEdge, useNodesState, useEdgesState,
  type Connection, type Edge, type Node, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Space, message, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { api } from '../api';
import { COLORS } from '../theme';
import WorkflowNodeCard from '../components/workflow/WorkflowNodeCard';
import NodeConfigDrawer from '../components/workflow/NodeConfigDrawer';
import RunPanel from '../components/workflow/RunPanel';
import { NODE_META, NODE_ORDER } from '../components/workflow/nodeMeta';
import type { Employee, ToolDef, WorkflowDefinition, WorkflowNode as WfNode, WorkflowNodeType } from '../types';

const { Text } = Typography;

function genId(type: string): string {
  return `${type}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function WorkflowEditor() {
  const { key = '' } = useParams();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [meta, setMeta] = useState<Partial<WorkflowDefinition>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runOpen, setRunOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tools, setTools] = useState<ToolDef[]>([]);

  const nodeTypes = useMemo(() => ({ wf: WorkflowNodeCard }), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [wf, emps, tls] = await Promise.all([
          api.getWorkflow(key),
          api.listEmployees().catch(() => []),
          api.listTools().catch(() => []),
        ]);
        setEmployees(emps); setTools(tls);
        setMeta({ workflowKey: wf.workflowKey, name: wf.name, description: wf.description, teamCode: wf.teamCode, enabled: wf.enabled });
        setNodes((wf.nodes || []).map((n: WfNode): Node => ({
          id: n.nodeKey, type: 'wf', position: n.position || { x: 0, y: 0 },
          data: { type: n.type, name: n.name, config: n.config || {} },
        })));
        setEdges((wf.edges || []).map((e: any): Edge => ({
          id: e.edgeId, source: e.source, target: e.target,
          sourceHandle: e.sourceHandle || undefined,
          markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#94a3b8' },
          label: e.sourceHandle || undefined,
        })));
      } catch (e: any) {
        message.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [key]); // eslint-disable-line

  const onConnect = useCallback((c: Connection) => {
    setEdges((eds) => addEdge({
      ...c, id: genId('e'),
      markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#94a3b8' },
      label: c.sourceHandle || undefined,
    }, eds));
  }, [setEdges]);

  const addNode = (type: WorkflowNodeType) => {
    const id = type === 'start' ? 'start' : type === 'end' ? genId('end') : genId(type);
    const node: Node = {
      id, type: 'wf',
      position: { x: 240 + Math.random() * 160, y: 120 + Math.random() * 160 },
      data: { type, name: NODE_META[type].label, config: defaultConfig(type) },
    };
    setNodes((ns) => [...ns, node]);
    setSelectedId(id);
  };

  const updateNode = (updated: WfNode) => {
    setNodes((ns) => ns.map((n) => n.id === updated.nodeKey
      ? { ...n, data: { ...n.data, name: updated.name, config: updated.config } }
      : n));
  };

  const deleteNode = (nodeKey: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== nodeKey));
    setEdges((es) => es.filter((e) => e.source !== nodeKey && e.target !== nodeKey));
    setSelectedId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const def = {
        workflowKey: key, name: meta.name || key, description: meta.description ?? null,
        teamCode: meta.teamCode ?? null, enabled: meta.enabled ?? true,
        nodes: nodes.map((n): WfNode => ({
          nodeKey: n.id, type: n.data.type, name: n.data.name,
          position: { x: Math.round(n.position.x), y: Math.round(n.position.y) }, config: n.data.config || {},
        })),
        edges: edges.map((e) => ({
          edgeId: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle ?? null,
        })),
      };
      const saved = await api.updateWorkflow(key, def);
      if (saved.validationError) message.warning(`已保存（草稿）：${saved.validationError}`);
      else message.success('已保存');
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedNode: WfNode | null = useMemo(() => {
    const n = nodes.find((x) => x.id === selectedId);
    if (!n) return null;
    return { nodeKey: n.id, type: n.data.type, name: n.data.name, position: n.position as any, config: n.data.config || {} };
  }, [selectedId, nodes]);

  const allWfNodes: WfNode[] = useMemo(() => nodes.map((n) => ({
    nodeKey: n.id, type: n.data.type, name: n.data.name, position: n.position as any, config: n.data.config || {},
  })), [nodes]);

  const currentDef: WorkflowDefinition | null = useMemo(() => ({
    workflowKey: key, name: meta.name || key, description: meta.description ?? null, teamCode: meta.teamCode ?? null,
    nodes: allWfNodes, edges: [] as any, enabled: true, sortOrder: 0, createdAt: '', updatedAt: '',
  }), [key, meta, allWfNodes]);

  if (loading) return <Spin size="large" style={{ display: 'block', marginTop: 120, textAlign: 'center' }} />;

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/workflows')}>返回</Button>
          <Text strong style={{ fontSize: 16 }}>{meta.name}</Text>
          <Tag style={{ background: '#f8f9fc', border: '1px solid #eef0f6', color: COLORS.slate }}>{key}</Tag>
        </Space>
        <Space>
          <Button icon={<PlayCircleOutlined />} onClick={() => setRunOpen(true)}>运行</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>保存</Button>
        </Space>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>
        {/* Palette */}
        <div style={{ width: 132, flexShrink: 0, background: '#fff', border: '1px solid #eef0f6', borderRadius: 12, padding: 10, overflow: 'auto' }}>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>添加节点</Text>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {NODE_ORDER.filter((t) => t !== 'start').map((t) => (
              <div
                key={t}
                onClick={() => addNode(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 8,
                  cursor: 'pointer', border: '1px solid #f0f1f5', fontSize: 12, color: '#334155',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = `${NODE_META[t].color}10`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ''; }}
              >
                <span>{NODE_META[t].icon}</span>{NODE_META[t].label}
                <PlusOutlined style={{ marginLeft: 'auto', fontSize: 10, color: '#cbd5e1' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, border: '1px solid #eef0f6', borderRadius: 12, overflow: 'hidden', background: '#fafbfd' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, n) => setSelectedId(n.id)}
            onPaneClick={() => setSelectedId(null)}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#e2e8f0" gap={18} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>

      <NodeConfigDrawer
        open={!!selectedNode}
        node={selectedNode}
        allNodes={allWfNodes}
        employees={employees}
        tools={tools}
        onChange={updateNode}
        onClose={() => setSelectedId(null)}
        onDelete={deleteNode}
      />

      <RunPanel open={runOpen} workflow={currentDef} onClose={() => setRunOpen(false)} />
    </div>
  );
}

function defaultConfig(type: WorkflowNodeType): Record<string, any> {
  switch (type) {
    case 'start': return { inputs: [{ name: 'input', label: '输入' }] };
    case 'agent': return { employeeKey: '', userInputTemplate: '' };
    case 'knowledge': return { employeeKey: '', queryTemplate: '', topK: 5 };
    case 'condition': return { cases: [{ label: 'hit', var: '', op: 'eq', value: '' }], elseLabel: 'else' };
    case 'template': return { template: '' };
    case 'tool': return { employeeKey: '', toolCode: '', argsTemplate: '{}' };
    case 'end': return { outputTemplate: '' };
    default: return {};
  }
}
