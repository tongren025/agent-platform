// 自由画布 —— 数据的可视化生成台。
// 节点=生产数据(剧本/设定/分镜/提示词)或图片(参考图/出图回传),
// 核心动作是「AI 派生」:指着任意节点让数字员工生成下游数据,连线记录派生血缘。
// 与看板同源双向:可把某项目/某集的卡片铺进画布,派生结果可回写成阶段卡片。
// 出图维持半自动:提示词一键复制 → 小云雀/即梦 → 成品传回;API 生图仅是可选动作。
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background, Controls, addEdge, useNodesState, useEdgesState,
  type Connection, type Edge, type Node, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Empty, Input, Modal, Popconfirm, Select, Space, Spin, Typography } from 'antd';
import { message } from '../ui';
import {
  PlusOutlined, DeleteOutlined, SaveOutlined, UploadOutlined,
  FileTextOutlined, ImportOutlined, BranchesOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { useResponsive } from '../hooks/useResponsive';
import { CanvasCtx, DataNode, ImageNode, STAGE_META, type CanvasActions } from '../components/canvas/CanvasNodes';

const { Text } = Typography;
const { TextArea } = Input;

interface CanvasSummary { canvas_id: string; name: string; nodeCount: number; updated_at: string }
interface ImageModel { provider: string; modelId: string; modelName: string }

// 可作为派生目标的阶段(有指令模板的数据阶段;空=自由派生)
const DERIVE_STAGES = ['script', 'setting', 'design', 'storyboard', 'img_prompt', 'vid_prompt'];
const ALL_STAGES = Object.keys(STAGE_META);

const SIZES = [
  { value: '1024x1024', label: '1:1 方形' },
  { value: '864x1152', label: '3:4 竖版' },
  { value: '1152x864', label: '4:3 横版' },
  { value: '720x1280', label: '9:16 竖屏' },
  { value: '1280x720', label: '16:9 横屏' },
];

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

const edgeDefaults = {
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { stroke: '#94a3b8' },
};

export default function Canvas() {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 32, textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🖥️</div>
          <h2 style={{ marginBottom: 8 }}>请在桌面端使用</h2>
          <p style={{ color: '#888' }}>画布功能需要更大的屏幕，请在电脑上打开此页面。</p>
        </div>
      </div>
    );
  }

  const [canvases, setCanvases] = useState<CanvasSummary[]>([]);
  const [currentId, setCurrentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [employees, setEmployees] = useState<any[]>([]);
  const [models, setModels] = useState<ImageModel[]>([]);
  const [model, setModel] = useState(() => localStorage.getItem('canvas.model') || '');
  const [size, setSize] = useState(() => localStorage.getItem('canvas.size') || '720x1280');

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState('');

  // AI 派生弹窗
  const [deriveNodeId, setDeriveNodeId] = useState<string | null>(null);
  const [deriveEmp, setDeriveEmp] = useState(() => localStorage.getItem('canvas.emp') || '');
  const [deriveStage, setDeriveStage] = useState('');
  const [deriveInstr, setDeriveInstr] = useState('');

  // 看板导入弹窗
  const [importOpen, setImportOpen] = useState(false);
  const [importProject, setImportProject] = useState('');
  const [importCards, setImportCards] = useState<any[]>([]);
  const [importEpisode, setImportEpisode] = useState<string>('all');
  const [importStage, setImportStage] = useState<string>('');
  const [importLoading, setImportLoading] = useState(false);

  // 回写看板弹窗
  const [boardNodeId, setBoardNodeId] = useState<string | null>(null);
  const [boardProject, setBoardProject] = useState('');
  const [boardStage, setBoardStage] = useState('');
  const [boardEpisode, setBoardEpisode] = useState<string>('');
  const [sendingBoard, setSendingBoard] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // 异步回调里读最新值用 ref,避免闭包过期
  const nodesRef = useRef<Node[]>([]);
  const modelRef = useRef(model);
  const sizeRef = useRef(size);
  const currentIdRef = useRef(currentId);
  const skipSaveRef = useRef(true);
  nodesRef.current = nodes;
  modelRef.current = model;
  sizeRef.current = size;
  currentIdRef.current = currentId;

  const nodeTypes = useMemo(() => ({ data: DataNode, image: ImageNode }), []);

  // ── 加载 ──
  const loadCanvases = useCallback(async () => {
    try {
      const list = await api.listCanvases();
      setCanvases(list);
      return list as CanvasSummary[];
    } catch { return []; }
  }, []);

  const loadProjects = useCallback(() => {
    api.listProjects().then(setProjects).catch(() => {});
  }, []);

  const loadCanvas = useCallback(async (cid: string) => {
    setLoading(true);
    try {
      const doc = await api.getCanvas(cid);
      skipSaveRef.current = true;
      setNodes((doc.nodes || []).map((n: any): Node => ({
        id: n.node_id,
        // 兼容旧版:prompt 节点迁移为数据节点(图片提示词阶段)
        type: n.type === 'prompt' ? 'data' : n.type,
        position: n.position || { x: 0, y: 0 },
        data: {
          stage: n.type === 'prompt' ? 'img_prompt' : (n.data?.stage || ''),
          title: n.data?.title || '',
          content: n.data?.content ?? n.data?.prompt ?? '',
          url: n.data?.url,
          prompt: n.data?.prompt,
        },
      })));
      setEdges((doc.edges || []).map((e: any): Edge => ({
        id: e.edge_id, source: e.source, target: e.target, ...edgeDefaults,
      })));
    } catch (e: any) { message.error(e.message); }
    finally { setLoading(false); }
  }, [setNodes, setEdges]);

  useEffect(() => {
    (async () => {
      const [list] = await Promise.all([
        loadCanvases(),
        api.listImageModels().then(setModels).catch(() => {}),
        api.listEmployees().then(setEmployees).catch(() => {}),
      ]);
      if (list.length > 0) setCurrentId(list[0].canvas_id);
    })();
  }, [loadCanvases]);

  useEffect(() => { if (currentId) loadCanvas(currentId); }, [currentId, loadCanvas]);
  useEffect(() => { if (model) localStorage.setItem('canvas.model', model); }, [model]);
  useEffect(() => { localStorage.setItem('canvas.size', size); }, [size]);
  useEffect(() => { if (deriveEmp) localStorage.setItem('canvas.emp', deriveEmp); }, [deriveEmp]);

  // ── 保存(1.2s 防抖自动保存 + 手动保存)──
  const doSave = useCallback(async (silent = true) => {
    const cid = currentIdRef.current;
    if (!cid) return;
    if (!silent) setSaving(true);
    try {
      await api.saveCanvas(cid, {
        nodes: nodesRef.current.map((n) => ({
          node_id: n.id, type: n.type || 'data',
          position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
          data: {
            stage: n.data.stage, title: n.data.title, content: n.data.content,
            url: n.data.url, prompt: n.data.prompt,
          },
        })),
        edges: edges.map((e) => ({ edge_id: e.id, source: e.source, target: e.target })),
      });
      if (!silent) message.success('已保存');
    } catch (e: any) {
      if (!silent) message.error(e.message);
    } finally {
      if (!silent) setSaving(false);
    }
  }, [edges]);

  useEffect(() => {
    if (skipSaveRef.current) { skipSaveRef.current = false; return; }
    if (!currentId) return;
    const t = setTimeout(() => doSave(true), 1200);
    return () => clearTimeout(t);
  }, [nodes, edges, currentId, doSave]);

  // ── 节点操作 ──
  const updateNodeData = useCallback((id: string, patch: Record<string, any>) => {
    setNodes((ns) => ns.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
  }, [setNodes]);

  const setGenerating = useCallback((id: string, generating: boolean) => {
    setNodes((ns) => ns.map((n) => n.id === id ? { ...n, data: { ...n.data, generating } } : n));
  }, [setNodes]);

  // 打开派生弹窗(数据节点的核心动作)
  const deriveFrom = useCallback((id: string) => {
    const src = nodesRef.current.find((n) => n.id === id);
    if (!src) return;
    if (!(src.data.content || '').trim()) { message.warning('节点内容为空,无从派生'); return; }
    setDeriveNodeId(id);
    setDeriveInstr('');
  }, []);

  const handleDerive = async () => {
    const src = nodesRef.current.find((n) => n.id === deriveNodeId);
    if (!src) return;
    if (!deriveEmp) { message.warning('请选择执行派生的数字员工'); return; }
    const srcId = src.id;
    setDeriveNodeId(null);
    setGenerating(srcId, true);
    try {
      const res = await api.canvasDerive(currentIdRef.current, {
        source_title: src.data.title || '',
        source_content: src.data.content || '',
        source_stage: src.data.stage || '',
        target_stage: deriveStage,
        employee_key: deriveEmp,
        instruction: deriveInstr,
      });
      const items: any[] = res.items || [];
      if (items.length === 0) { message.warning('AI 未返回可解析的条目'); return; }
      const newNodes: Node[] = items.map((it, i) => ({
        id: genId('d'), type: 'data',
        position: { x: src.position.x + 380, y: src.position.y + i * 200 },
        data: { stage: it.stage || '', title: it.title || '', content: it.content || '' },
      }));
      setNodes((ns) => [...ns, ...newNodes]);
      setEdges((es) => [...es, ...newNodes.map((n) => ({
        id: genId('e'), source: srcId, target: n.id, ...edgeDefaults,
      }))]);
      message.success(`派生出 ${items.length} 个节点`);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setGenerating(srcId, false);
    }
  };

  // 图片变体(可选的 API 生图动作;主出图路径仍是小云雀半自动)
  const variantFrom = useCallback(async (id: string) => {
    const src = nodesRef.current.find((n) => n.id === id);
    if (!src) return;
    const prompt = (src.data.prompt || '').trim();
    if (!prompt) { message.warning('该图片没有关联提示词'); return; }
    if (!modelRef.current) { message.warning('请先在顶栏选择生图模型'); return; }
    setGenerating(id, true);
    try {
      const res = await api.canvasGenerate(currentIdRef.current, {
        prompt, model: modelRef.current, size: sizeRef.current,
      });
      const newId = genId('img');
      setNodes((ns) => [...ns, {
        id: newId, type: 'image',
        position: { x: src.position.x + 340, y: src.position.y },
        data: { url: res.url, prompt },
      }]);
      setEdges((es) => [...es, { id: genId('e'), source: id, target: newId, ...edgeDefaults }]);
      message.success('生成完成');
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setGenerating(id, false);
    }
  }, [setNodes, setEdges, setGenerating]);

  const sendToBoard = useCallback((id: string) => {
    const node = nodesRef.current.find((n) => n.id === id);
    if (!node) return;
    setBoardNodeId(id);
    setBoardStage(node.data.stage || (node.type === 'image' ? 'img_gen' : 'idea'));
    setBoardEpisode('');
    loadProjects();
  }, [loadProjects]);

  const actions = useMemo<CanvasActions>(() => ({
    updateNodeData, deriveFrom, variantFrom, sendToBoard,
  }), [updateNodeData, deriveFrom, variantFrom, sendToBoard]);

  const handleSendToBoard = async () => {
    const node = nodesRef.current.find((n) => n.id === boardNodeId);
    if (!node || !boardProject) { message.warning('请选择项目'); return; }
    setSendingBoard(true);
    try {
      const isImage = node.type === 'image';
      const title = (node.data.title || node.data.prompt || node.data.content || '画布节点').slice(0, 30);
      const content = isImage ? (node.data.prompt || '') : (node.data.content || '');
      const stage = boardStage || 'idea';
      const payload: any = {
        stage, title, content,
        episode: boardEpisode ? parseInt(boardEpisode) : null,
        shot_number: 0, status: 'pending',
      };
      if (['img_prompt', 'vid_prompt'].includes(stage) && content) payload.prompts = [content];
      const card = await api.addCard(boardProject, payload);
      if (isImage && node.data.url) {
        await api.updateCard(card.card_id, { images: [node.data.url] });
      }
      message.success(`已写入看板「${STAGE_META[stage]?.label || stage}」阶段`);
      setBoardNodeId(null);
    } catch (e: any) { message.error(e.message); }
    finally { setSendingBoard(false); }
  };

  // ── 看板导入 ──
  const openImport = () => {
    setImportOpen(true);
    setImportCards([]);
    setImportProject('');
    setImportEpisode('all');
    setImportStage('');
    loadProjects();
  };

  useEffect(() => {
    if (!importProject) return;
    setImportLoading(true);
    api.getProject(importProject)
      .then((p) => setImportCards(p.cards || []))
      .catch((e) => message.error(e.message))
      .finally(() => setImportLoading(false));
  }, [importProject]);

  const importFiltered = useMemo(() => {
    let list = importCards;
    if (importEpisode === 'global') list = list.filter((c) => c.episode == null);
    else if (importEpisode !== 'all') list = list.filter((c) => c.episode === parseInt(importEpisode));
    if (importStage) list = list.filter((c) => c.stage === importStage);
    return list;
  }, [importCards, importEpisode, importStage]);

  const importEpisodes = useMemo(() => {
    const eps = new Set<number>();
    importCards.forEach((c) => { if (c.episode != null) eps.add(c.episode); });
    return Array.from(eps).sort((a, b) => a - b);
  }, [importCards]);

  const handleImport = () => {
    if (importFiltered.length === 0) { message.warning('没有可导入的卡片'); return; }
    if (importFiltered.length > 60) {
      message.warning(`筛选出 ${importFiltered.length} 张卡片,一次最多导入 60 张——请用集数/阶段缩小范围`);
      return;
    }
    // 落位:现有节点最右侧再往右;按阶段分列,列内按 G 单元号排
    const baseX = nodesRef.current.length > 0
      ? Math.max(...nodesRef.current.map((n) => n.position.x)) + 420 : 80;
    const baseY = 60;
    const byStage = new Map<string, any[]>();
    ALL_STAGES.forEach((s) => byStage.set(s, []));
    importFiltered.forEach((c) => {
      if (!byStage.has(c.stage)) byStage.set(c.stage, []);
      byStage.get(c.stage)!.push(c);
    });
    const newNodes: Node[] = [];
    let col = 0;
    byStage.forEach((cards) => {
      if (cards.length === 0) return;
      cards.sort((a, b) => (a.shot_number || 0) - (b.shot_number || 0));
      cards.forEach((c, row) => {
        newNodes.push({
          id: genId('c'), type: 'data',
          position: { x: baseX + col * 340, y: baseY + row * 210 },
          data: { stage: c.stage, title: c.title || '', content: c.content || (c.prompts || []).join('\n') },
        });
      });
      col += 1;
    });
    setNodes((ns) => [...ns, ...newNodes]);
    setImportOpen(false);
    message.success(`已导入 ${newNodes.length} 张卡片`);
  };

  // ── 工具栏操作 ──
  const addDataNode = () => {
    setNodes((ns) => [...ns, {
      id: genId('d'), type: 'data',
      position: { x: 120 + Math.random() * 120, y: 120 + Math.random() * 120 },
      data: { stage: '', title: '', content: '' },
    }]);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !currentId) return;
    for (let i = 0; i < files.length; i++) {
      try {
        const res = await api.uploadCanvasAsset(currentId, files[i]);
        setNodes((ns) => [...ns, {
          id: genId('img'), type: 'image',
          position: { x: 160 + i * 48, y: 160 + i * 48 },
          data: { url: res.url },
        }]);
      } catch (e: any) { message.error(`${files[i].name}: ${e.message}`); }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreate = async () => {
    try {
      const doc = await api.createCanvas(newName.trim() || '未命名画布');
      setNewOpen(false); setNewName('');
      await loadCanvases();
      setCurrentId(doc.canvas_id);
    } catch (e: any) { message.error(e.message); }
  };

  const handleDelete = async () => {
    try {
      await api.deleteCanvas(currentId);
      message.success('已删除');
      const list = await loadCanvases();
      setCurrentId(list.length > 0 ? list[0].canvas_id : '');
      if (list.length === 0) { setNodes([]); setEdges([]); }
    } catch (e: any) { message.error(e.message); }
  };

  const onConnect = useCallback((c: Connection) => {
    setEdges((es) => addEdge({ ...c, id: genId('e'), ...edgeDefaults }, es));
  }, [setEdges]);

  const modelOptions = useMemo(() => models.map((m) => ({
    value: m.modelId,
    label: `${m.provider} / ${m.modelName}`,
  })), [models]);

  const empOptions = useMemo(() => employees.map((e) => ({
    value: e.employeeKey, label: e.name,
  })), [employees]);

  const stageOptions = (keys: string[]) => keys.map((k) => ({
    value: k, label: STAGE_META[k]?.label || k,
  }));

  const deriveSrc = nodes.find((n) => n.id === deriveNodeId);

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* ── 顶栏 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <Space>
          <Select
            value={currentId || undefined} onChange={setCurrentId}
            placeholder="选择画布" style={{ width: 180 }}
            options={canvases.map((c) => ({ value: c.canvas_id, label: `${c.name} (${c.nodeCount})` }))}
          />
          <Button icon={<PlusOutlined />} onClick={() => setNewOpen(true)}>新建</Button>
          {currentId && (
            <Popconfirm title="删除此画布？节点数据不可恢复" onConfirm={handleDelete}>
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
        <Space wrap>
          <Button icon={<FileTextOutlined />} onClick={addDataNode} disabled={!currentId}>数据节点</Button>
          <Button icon={<ImportOutlined />} onClick={openImport} disabled={!currentId}>从看板导入</Button>
          <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()} disabled={!currentId}>上传图片</Button>
          <Select
            value={model || undefined} onChange={setModel}
            placeholder="生图模型(可选)" style={{ width: 190 }}
            options={modelOptions} showSearch optionFilterProp="label" allowClear
          />
          <Select value={size} onChange={setSize} style={{ width: 110 }} options={SIZES} />
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => doSave(false)} disabled={!currentId}>保存</Button>
        </Space>
      </div>
      <input
        ref={fileInputRef} type="file" accept="image/*" multiple hidden
        onChange={(e) => handleUpload(e.target.files)}
      />

      {/* ── 画布 ── */}
      <div style={{ flex: 1, border: '1px solid #eef0f6', borderRadius: 12, overflow: 'hidden', background: '#fafbfd', position: 'relative' }}>
        {!currentId ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="新建一个画布开始创作" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewOpen(true)}>新建画布</Button>
            </Empty>
          </div>
        ) : loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <CanvasCtx.Provider value={actions}>
            <ReactFlow
              key={currentId}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              deleteKeyCode={['Backspace', 'Delete']}
              fitView
              minZoom={0.1}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#e2e8f0" gap={18} />
              <Controls showInteractive={false} />
            </ReactFlow>
            {nodes.length === 0 && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', pointerEvents: 'none',
              }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <BranchesOutlined /> 「从看板导入」铺开存量数据,或建一个「数据节点」写下创意,然后 AI 派生
                </Text>
              </div>
            )}
          </CanvasCtx.Provider>
        )}
      </div>

      {/* ── 新建画布 ── */}
      <Modal title="新建画布" open={newOpen} onCancel={() => setNewOpen(false)} onOk={handleCreate} okText="创建" width={400}>
        <Input
          value={newName} onChange={(e) => setNewName(e.target.value)}
          placeholder="例:EP01 分镜推演" style={{ marginTop: 12 }}
          onPressEnter={handleCreate}
        />
      </Modal>

      {/* ── AI 派生 ── */}
      <Modal
        title={<><BranchesOutlined /> AI 派生{deriveSrc ? ` — ${deriveSrc.data.title || '未命名节点'}` : ''}</>}
        open={!!deriveNodeId} onCancel={() => setDeriveNodeId(null)} onOk={handleDerive}
        okText="开始派生" width={460}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>执行员工</Text>
            <Select
              value={deriveEmp || undefined} onChange={setDeriveEmp}
              placeholder="选择数字员工" style={{ width: '100%', marginTop: 4 }}
              options={empOptions} showSearch optionFilterProp="label"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>目标阶段(决定生成什么样的数据)</Text>
            <Select
              value={deriveStage} onChange={setDeriveStage}
              style={{ width: '100%', marginTop: 4 }}
              options={[{ value: '', label: '自由派生(按下方指令)' }, ...stageOptions(DERIVE_STAGES)]}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>额外指令(可选)</Text>
            <TextArea
              value={deriveInstr} onChange={(e) => setDeriveInstr(e.target.value)}
              placeholder="例:只拆前 10 秒;情绪按压抑→爆发走;引用 Art Bible 的固定描述词..."
              rows={3} style={{ marginTop: 4 }}
            />
          </div>
        </div>
      </Modal>

      {/* ── 从看板导入 ── */}
      <Modal
        title="从看板导入卡片" open={importOpen}
        onCancel={() => setImportOpen(false)} onOk={handleImport}
        okText={`导入 ${importFiltered.length} 张`} width={480}
        okButtonProps={{ disabled: importFiltered.length === 0 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>制作项目</Text>
            <Select
              value={importProject || undefined} onChange={setImportProject}
              placeholder="选择项目" style={{ width: '100%', marginTop: 4 }}
              options={projects.map((p) => ({ value: p.project_id, label: p.name }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>集数</Text>
              <Select
                value={importEpisode} onChange={setImportEpisode}
                style={{ width: '100%', marginTop: 4 }} loading={importLoading}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'global', label: '全局资产' },
                  ...importEpisodes.map((ep) => ({ value: String(ep), label: `EP${String(ep).padStart(2, '0')}` })),
                ]}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>阶段(可选)</Text>
              <Select
                value={importStage || undefined} onChange={(v) => setImportStage(v ?? '')}
                placeholder="全部阶段" allowClear style={{ width: '100%', marginTop: 4 }}
                options={stageOptions(ALL_STAGES)}
              />
            </div>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            命中 {importFiltered.length} 张卡片,将按阶段分列铺进画布(单次上限 60 张)
          </Text>
        </div>
      </Modal>

      {/* ── 回写看板 ── */}
      <Modal
        title="回写到制作看板" open={!!boardNodeId}
        onCancel={() => setBoardNodeId(null)} onOk={handleSendToBoard}
        okText="写入" confirmLoading={sendingBoard} width={440}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>目标项目</Text>
            <Select
              value={boardProject || undefined} onChange={setBoardProject}
              placeholder="选择制作项目" style={{ width: '100%', marginTop: 4 }}
              options={projects.map((p) => ({ value: p.project_id, label: p.name }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>阶段</Text>
              <Select
                value={boardStage || undefined} onChange={setBoardStage}
                style={{ width: '100%', marginTop: 4 }}
                options={stageOptions(ALL_STAGES)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>集数(留空=全局)</Text>
              <Input
                type="number" value={boardEpisode}
                onChange={(e) => setBoardEpisode(e.target.value)}
                placeholder="全局" style={{ marginTop: 4 }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
