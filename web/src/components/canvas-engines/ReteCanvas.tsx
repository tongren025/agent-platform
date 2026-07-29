// Rete.js 可执行节点编辑器：面向数据流、AI 工具链和低代码编排实验。
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Space } from 'antd';
import {
  ApiOutlined, DeleteOutlined, ExportOutlined, RobotOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { ClassicPreset, NodeEditor } from 'rete';
import { AreaExtensions, AreaPlugin } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { Presets as ReactPresets, ReactPlugin } from 'rete-react-plugin';
import { createRoot } from 'react-dom/client';
import { useCanvasEngineDocument } from '../../hooks/useCanvasEngineDocument';
import { EngineError, EngineLoading, SavingBadge } from './EngineState';

type NodeKind = 'prompt' | 'agent' | 'output';

interface SavedReteNode {
  id: string;
  kind: NodeKind;
  label: string;
  text: string;
  position: { x: number; y: number };
}

interface SavedReteConnection {
  source: string;
  sourceOutput: string;
  target: string;
  targetInput: string;
}

interface ReteRuntime {
  editor: any;
  area: any;
  addNode: (kind: NodeKind) => Promise<void>;
  serialize: () => Record<string, any>;
  clear: () => Promise<void>;
  destroy: () => void;
}

const socket = new ClassicPreset.Socket('data');

function makeNode(kind: NodeKind, text = '', id?: string) {
  const labels: Record<NodeKind, string> = {
    prompt: '输入提示词',
    agent: 'AI 处理节点',
    output: '输出结果',
  };
  const node = new ClassicPreset.Node(labels[kind]) as any;
  if (id) node.id = id;
  node.__kind = kind;
  node.addControl('text', new ClassicPreset.InputControl('text', { initial: text }));
  if (kind !== 'prompt') node.addInput('input', new ClassicPreset.Input(socket, '输入'));
  if (kind !== 'output') node.addOutput('output', new ClassicPreset.Output(socket, '输出'));
  return node;
}

function nodeText(node: any): string {
  return String(node.controls?.text?.value ?? '');
}

async function createReteRuntime(
  container: HTMLElement,
  content: Record<string, any>,
  onChange: (content: Record<string, any>) => void,
): Promise<ReteRuntime> {
  const editor = new NodeEditor<any>();
  const area = new AreaPlugin<any, any>(container);
  const connection = new ConnectionPlugin<any, any>();
  const render = new ReactPlugin<any, any>({ createRoot });

  render.addPreset(ReactPresets.classic.setup());
  connection.addPreset(ConnectionPresets.classic.setup());
  editor.use(area);
  area.use(connection);
  area.use(render);

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });
  AreaExtensions.simpleNodesOrder(area);

  const serialize = () => ({
    version: 1,
    nodes: editor.getNodes().map((node: any) => ({
      id: node.id,
      kind: node.__kind || 'agent',
      label: node.label,
      text: nodeText(node),
      position: area.nodeViews.get(node.id)?.position || { x: 0, y: 0 },
    })),
    connections: editor.getConnections().map((item: any) => ({
      source: item.source,
      sourceOutput: item.sourceOutput,
      target: item.target,
      targetInput: item.targetInput,
    })),
  });

  let restoring = true;
  let changeTimer: ReturnType<typeof setTimeout> | null = null;
  const notifyChange = () => {
    if (restoring) return;
    if (changeTimer) clearTimeout(changeTimer);
    changeTimer = setTimeout(() => onChange(serialize()), 120);
  };
  editor.addPipe((context: any) => {
    if (['nodecreated', 'noderemoved', 'connectioncreated', 'connectionremoved'].includes(context.type)) notifyChange();
    return context;
  });
  area.addPipe((context: any) => {
    if (context.type === 'nodetranslated') notifyChange();
    return context;
  });

  const savedNodes = (content.nodes || []) as SavedReteNode[];
  const savedConnections = (content.connections || []) as SavedReteConnection[];
  const nodesById = new Map<string, any>();

  const addSavedNode = async (saved: SavedReteNode) => {
    const node = makeNode(saved.kind, saved.text, saved.id);
    node.label = saved.label || node.label;
    await editor.addNode(node);
    await area.translate(node.id, saved.position || { x: 0, y: 0 });
    nodesById.set(node.id, node);
  };

  if (savedNodes.length) {
    for (const saved of savedNodes) await addSavedNode(saved);
    for (const saved of savedConnections) {
      const source = nodesById.get(saved.source);
      const target = nodesById.get(saved.target);
      if (source && target && source.outputs[saved.sourceOutput] && target.inputs[saved.targetInput]) {
        await editor.addConnection(new ClassicPreset.Connection(
          source, saved.sourceOutput, target, saved.targetInput,
        ));
      }
    }
  } else {
    const starter: SavedReteNode[] = [
      { id: '', kind: 'prompt', label: '输入提示词', text: '生成一组漫剧分镜', position: { x: 80, y: 180 } },
      { id: '', kind: 'agent', label: 'AI 处理节点', text: '按分镜规范拆解镜头', position: { x: 360, y: 180 } },
      { id: '', kind: 'output', label: '输出结果', text: '结构化分镜数据', position: { x: 660, y: 180 } },
    ];
    for (const item of starter) {
      const node = makeNode(item.kind, item.text);
      await editor.addNode(node);
      await area.translate(node.id, item.position);
      nodesById.set(item.kind, node);
    }
    await editor.addConnection(new ClassicPreset.Connection(nodesById.get('prompt'), 'output', nodesById.get('agent'), 'input'));
    await editor.addConnection(new ClassicPreset.Connection(nodesById.get('agent'), 'output', nodesById.get('output'), 'input'));
  }

  restoring = false;
  await AreaExtensions.zoomAt(area, editor.getNodes());

  const addNode = async (kind: NodeKind) => {
    const node = makeNode(kind);
    await editor.addNode(node);
    const index = editor.getNodes().length - 1;
    await area.translate(node.id, { x: 120 + (index % 4) * 250, y: 100 + Math.floor(index / 4) * 210 });
    notifyChange();
  };

  const clear = async () => {
    for (const item of [...editor.getConnections()]) await editor.removeConnection(item.id);
    for (const node of [...editor.getNodes()]) await editor.removeNode(node.id);
    notifyChange();
  };

  return {
    editor,
    area,
    addNode,
    serialize,
    clear,
    destroy: () => {
      if (changeTimer) clearTimeout(changeTimer);
      area.destroy();
    },
  };
}

export default function ReteCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<ReteRuntime | null>(null);
  const [ready, setReady] = useState(false);
  const { initialContent, loading, saving, error, scheduleSave, save, retry } = useCanvasEngineDocument('rete');

  useEffect(() => {
    if (loading || !initialContent || !hostRef.current) return;
    let cancelled = false;
    let runtime: ReteRuntime | null = null;
    createReteRuntime(hostRef.current, initialContent, (content) => scheduleSave(content))
      .then((value) => {
        if (cancelled) {
          value.destroy();
          return;
        }
        runtime = value;
        runtimeRef.current = value;
        setReady(true);
      });
    return () => {
      cancelled = true;
      runtime?.destroy();
      runtimeRef.current = null;
      setReady(false);
    };
  }, [initialContent, loading, scheduleSave]);

  const addNode = useCallback((kind: NodeKind) => {
    void runtimeRef.current?.addNode(kind);
  }, []);

  if (loading || !initialContent) return <EngineLoading label="Rete 节点实验室" />;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#f8fafc' }}>
      <EngineError message={error} onRetry={retry} />
      <SavingBadge saving={saving} />
      <div style={{
        minHeight: 48, display: 'flex', alignItems: 'center',
        padding: '6px 150px 6px 12px', background: '#fff', borderBottom: '1px solid #e2e8f0',
      }}>
        <Space wrap>
          <Button icon={<ExportOutlined />} disabled={!ready} onClick={() => addNode('prompt')}>输入节点</Button>
          <Button icon={<RobotOutlined />} disabled={!ready} onClick={() => addNode('agent')}>AI 节点</Button>
          <Button icon={<ApiOutlined />} disabled={!ready} onClick={() => addNode('output')}>输出节点</Button>
          <Button icon={<SaveOutlined />} disabled={!ready} onClick={() => {
            const content = runtimeRef.current?.serialize();
            if (content) void save(content);
          }}>立即保存</Button>
          <Button danger icon={<DeleteOutlined />} disabled={!ready} onClick={() => void runtimeRef.current?.clear()}>
            清空
          </Button>
        </Space>
      </div>
      <div
        ref={hostRef}
        aria-label="Rete 可执行节点画布"
        style={{
          flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden',
          backgroundColor: '#f8fafc',
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
    </div>
  );
}
