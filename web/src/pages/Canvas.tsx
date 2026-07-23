// 自由画布 —— 数据的可视化生成台。
// 节点=生产数据(剧本/设定/分镜/提示词)或图片(参考图/出图回传),
// 核心动作是「AI 派生」:指着任意节点让数字员工生成下游数据,连线记录派生血缘。
// 与看板同源双向:可把某项目/某集的卡片铺进画布,派生结果可回写成阶段卡片。
// 出图维持半自动:提示词一键复制 → 小云雀/即梦 → 成品传回;API 生图仅是可选动作。
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, Panel, addEdge, useNodesState, useEdgesState, useReactFlow, useStore,
  ReactFlowProvider,
  type Connection, type Edge, type Node, type ReactFlowInstance, MarkerType,
} from 'reactflow';
import { toPng } from 'html-to-image';
import 'reactflow/dist/style.css';
import { Button, Empty, Input, Modal, Popconfirm, Select, Space, Spin, Tooltip, Typography } from 'antd';
import { message } from '../ui';
import {
  PlusOutlined, DeleteOutlined, SaveOutlined, UploadOutlined,
  FileTextOutlined, ImportOutlined, BranchesOutlined, AppstoreOutlined,
  SearchOutlined, VideoCameraOutlined, GroupOutlined, CopyOutlined,
  OrderedListOutlined, UndoOutlined, RedoOutlined, LockOutlined, UnlockOutlined,
  DownloadOutlined, ExpandOutlined, EditOutlined, HighlightOutlined,
  QuestionCircleOutlined, SendOutlined, SortAscendingOutlined,
  CameraOutlined, ZoomInOutlined, ZoomOutOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { useResponsive } from '../hooks/useResponsive';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import { CanvasCtx, DataNode, GroupNode, GROUP_COLORS, ImageNode, StoryboardNode, StickyNote, STAGE_META, type CanvasActions } from '../components/canvas/CanvasNodes';
import { LabeledEdge } from '../components/canvas/LabeledEdge';
import { SelectionToolbar, type AlignAction } from '../components/canvas/SelectionToolbar';
import { thumbUrl } from '../media';

const { Text } = Typography;
const { TextArea } = Input;

interface CanvasSummary { canvas_id: string; name: string; nodeCount: number; updated_at: string }
interface ImageModel { provider: string; modelId: string; modelName: string }

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

// ── 分镜连续预览条(需在 ReactFlow 树内使用 useReactFlow) ──────
function FilmstripStrip({ nodes }: { nodes: Node[] }) {
  const { fitView } = useReactFlow();
  const sbNodes = useMemo(() =>
    nodes.filter((n) => n.type === 'storyboard')
      .sort((a, b) => (a.data?.shotNumber || '').localeCompare(b.data?.shotNumber || '', undefined, { numeric: true })),
    [nodes],
  );
  if (sbNodes.length === 0) return null;
  return (
    <div style={{
      display: 'flex', gap: 6, padding: '6px 10px',
      background: 'rgba(255,255,255,0.95)', borderRadius: '10px 10px 0 0',
      border: '1px solid #e2e8f0', borderBottom: 'none',
      maxWidth: '92%', overflowX: 'auto',
      backdropFilter: 'blur(8px)',
    }}>
      {sbNodes.map((n) => (
        <div key={n.id}
          onClick={() => fitView({ nodes: [{ id: n.id }], padding: 0.5, duration: 300 })}
          style={{
            cursor: 'pointer', padding: '4px 6px', borderRadius: 8,
            border: '1px solid #e2e8f0', minWidth: 64, textAlign: 'center',
            fontSize: 11, background: '#fff', transition: 'border-color .15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          {n.data.url && (
            <img src={thumbUrl(n.data.url, 128)} alt=""
              style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 4, display: 'block', margin: '0 auto 2px' }} />
          )}
          <div style={{ fontWeight: 700, color: '#6366f1' }}>{n.data.shotNumber || '?'}</div>
          <div style={{ color: '#94a3b8', fontSize: 10, whiteSpace: 'nowrap' }}>
            {[n.data.duration, n.data.cameraType].filter(Boolean).join(' ')}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 缩放控制栏(在 ReactFlowProvider 内) ────────────────────────
function ZoomBar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoom = useStore((s) => (s as any).transform[2] as number);
  const pct = Math.round(zoom * 100);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 1,
      background: 'rgba(255,255,255,.92)', borderRadius: 8,
      border: '1px solid #e2e8f0', padding: '1px 3px',
      backdropFilter: 'blur(8px)',
    }}>
      <Tooltip title="缩小 (Ctrl+-)">
        <Button size="small" icon={<ZoomOutOutlined />} onClick={() => zoomOut()}
          style={{ border: 'none', background: 'none', width: 26, height: 26 }} />
      </Tooltip>
      <Tooltip title="点击适配视图 (Ctrl+0)">
        <span onClick={() => fitView({ padding: 0.15, duration: 300 })}
          style={{ fontSize: 11, color: '#64748b', cursor: 'pointer', padding: '0 4px',
            minWidth: 36, textAlign: 'center', userSelect: 'none', fontVariantNumeric: 'tabular-nums' }}>
          {pct}%
        </span>
      </Tooltip>
      <Tooltip title="放大 (Ctrl+=)">
        <Button size="small" icon={<ZoomInOutlined />} onClick={() => zoomIn()}
          style={{ border: 'none', background: 'none', width: 26, height: 26 }} />
      </Tooltip>
      <div style={{ width: 1, height: 16, background: '#e2e8f0', margin: '0 2px' }} />
      <Tooltip title="适配视图">
        <Button size="small" icon={<ExpandOutlined />} onClick={() => fitView({ padding: 0.15, duration: 300 })}
          style={{ border: 'none', background: 'none', width: 26, height: 26 }} />
      </Tooltip>
    </div>
  );
}

export default function Canvas() {
  const { isMobile } = useResponsive();

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
  const [newTemplate, setNewTemplate] = useState('blank');

  const [deriveNodeId, setDeriveNodeId] = useState<string | null>(null);
  const [deriveEmp, setDeriveEmp] = useState(() => localStorage.getItem('canvas.emp') || '');
  const [deriveStage, setDeriveStage] = useState('');
  const [deriveInstr, setDeriveInstr] = useState('');

  const [importOpen, setImportOpen] = useState(false);
  const [importProject, setImportProject] = useState('');
  const [importCards, setImportCards] = useState<any[]>([]);
  const [importEpisode, setImportEpisode] = useState<string>('all');
  const [importStage, setImportStage] = useState<string>('');
  const [importLoading, setImportLoading] = useState(false);

  const [boardNodeId, setBoardNodeId] = useState<string | null>(null);
  const [boardProject, setBoardProject] = useState('');
  const [boardStage, setBoardStage] = useState('');
  const [boardEpisode, setBoardEpisode] = useState<string>('');
  const [sendingBoard, setSendingBoard] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  // 新增:重命名
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');

  // 新增:对齐网格
  const [snapGrid, setSnapGrid] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [edgePathType, setEdgePathType] = useState<'bezier' | 'straight' | 'step'>('bezier');
  const [connectMenu, setConnectMenu] = useState<{ x: number; y: number; sourceId: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const clipboardRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectCompletedRef = useRef(false);
  const connectSourceRef = useRef<string>('');
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const modelRef = useRef(model);
  const sizeRef = useRef(size);
  const currentIdRef = useRef(currentId);
  const skipSaveRef = useRef(true);
  nodesRef.current = nodes;
  edgesRef.current = edges;
  modelRef.current = model;
  sizeRef.current = size;
  currentIdRef.current = currentId;

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [filmstripOpen, setFilmstripOpen] = useState(true);

  // ── 撤销/重做 ──
  const { takeSnapshot: _snap, undo: _undo, redo: _redo, clear: _clearHistory, canUndo, canRedo } = useCanvasHistory();

  const takeSnapshot = useCallback(() => {
    _snap(nodesRef.current, edgesRef.current);
  }, [_snap]);

  const handleUndo = useCallback(() => {
    const snap = _undo(nodesRef.current, edgesRef.current);
    if (!snap) return;
    skipSaveRef.current = true;
    setNodes(snap.nodes);
    setEdges(snap.edges);
  }, [_undo, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const snap = _redo(nodesRef.current, edgesRef.current);
    if (!snap) return;
    skipSaveRef.current = true;
    setNodes(snap.nodes);
    setEdges(snap.edges);
  }, [_redo, setNodes, setEdges]);

  // ── 节点/连线类型 ──
  const nodeTypes = useMemo(() => ({
    data: DataNode, image: ImageNode, storyboard: StoryboardNode, group: GroupNode, sticky: StickyNote,
  }), []);

  const edgeTypes = useMemo(() => ({ labeled: LabeledEdge }), []);

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
      _clearHistory();
      setNodes((doc.nodes || []).map((n: any): Node => ({
        id: n.node_id,
        type: n.type === 'prompt' ? 'data' : n.type,
        position: n.position || { x: 0, y: 0 },
        ...(n.type === 'group' ? { style: { width: n.style?.width || 600, height: n.style?.height || 400, zIndex: -1 } } : {}),
        data: {
          stage: n.type === 'prompt' ? 'img_prompt' : (n.data?.stage || ''),
          title: n.data?.title || '',
          content: n.data?.content ?? n.data?.prompt ?? '',
          url: n.data?.url,
          prompt: n.data?.prompt,
          locked: n.data?.locked || false,
          color: n.data?.color || '',
          ...(n.type === 'group' ? { label: n.data?.label || '', color: n.data?.color || '' } : {}),
          ...(n.type === 'storyboard' ? {
            shotNumber: n.data?.shotNumber || '',
            duration: n.data?.duration || '',
            cameraType: n.data?.cameraType || '',
            cameraMove: n.data?.cameraMove || '',
            description: n.data?.description || '',
          } : {}),
        },
      })));
      setEdges((doc.edges || []).map((e: any): Edge => ({
        id: e.edge_id, source: e.source, target: e.target,
        type: 'labeled',
        data: e.data || {},
        ...edgeDefaults,
      })));
    } catch (e: any) { message.error(e.message); }
    finally { setLoading(false); }
  }, [setNodes, setEdges, _clearHistory]);

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

  // ── 保存(1.2s 防抖 + 手动) ──
  const doSave = useCallback(async (silent = true) => {
    const cid = currentIdRef.current;
    if (!cid) return;
    if (!silent) setSaving(true);
    try {
      await api.saveCanvas(cid, {
        nodes: nodesRef.current.map((n) => ({
          node_id: n.id, type: n.type || 'data',
          position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
          ...(n.type === 'group' ? { style: { width: n.style?.width || 600, height: n.style?.height || 400 } } : {}),
          data: {
            stage: n.data.stage, title: n.data.title, content: n.data.content,
            url: n.data.url, prompt: n.data.prompt,
            locked: n.data.locked || false,
            color: n.data.color || '',
            ...(n.type === 'group' ? { label: n.data.label, color: n.data.color } : {}),
            ...(n.type === 'storyboard' ? {
              shotNumber: n.data.shotNumber, duration: n.data.duration,
              cameraType: n.data.cameraType, cameraMove: n.data.cameraMove,
              description: n.data.description,
            } : {}),
          },
        })),
        edges: edgesRef.current.map((e) => ({
          edge_id: e.id, source: e.source, target: e.target,
          data: e.data || {},
        })),
      });
      if (!silent) message.success('已保存');
    } catch (e: any) {
      if (!silent) message.error(e.message);
    } finally {
      if (!silent) setSaving(false);
    }
  }, []);

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

  const updateEdgeLabel = useCallback((edgeId: string, label: string) => {
    takeSnapshot();
    setEdges((es) => es.map((e) => e.id === edgeId ? { ...e, data: { ...e.data, label } } : e));
  }, [setEdges, takeSnapshot]);

  const setGenerating = useCallback((id: string, generating: boolean) => {
    setNodes((ns) => ns.map((n) => n.id === id ? { ...n, data: { ...n.data, generating } } : n));
  }, [setNodes]);

  const deriveFrom = useCallback((id: string) => {
    const src = nodesRef.current.find((n) => n.id === id);
    if (!src) return;
    const text = (src.data.content || src.data.description || '').trim();
    if (!text) { message.warning('节点内容为空,无从派生'); return; }
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
    takeSnapshot();
    try {
      const srcContent = src.data.content || src.data.description || '';
      const res = await api.canvasDerive(currentIdRef.current, {
        source_title: src.data.title || src.data.shotNumber || '',
        source_content: srcContent,
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
        id: genId('e'), source: srcId, target: n.id, type: 'labeled' as const, data: {}, ...edgeDefaults,
      }))]);
      message.success(`派生出 ${items.length} 个节点`);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setGenerating(srcId, false);
    }
  };

  const variantFrom = useCallback(async (id: string) => {
    const src = nodesRef.current.find((n) => n.id === id);
    if (!src) return;
    const prompt = (src.data.prompt || '').trim();
    if (!prompt) { message.warning('该图片没有关联提示词'); return; }
    if (!modelRef.current) { message.warning('请先在顶栏选择生图模型'); return; }
    setGenerating(id, true);
    takeSnapshot();
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
      setEdges((es) => [...es, { id: genId('e'), source: id, target: newId, type: 'labeled' as const, data: {}, ...edgeDefaults }]);
      message.success('生成完成');
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setGenerating(id, false);
    }
  }, [setNodes, setEdges, setGenerating, takeSnapshot]);

  const sendToBoard = useCallback((id: string) => {
    const node = nodesRef.current.find((n) => n.id === id);
    if (!node) return;
    setBoardNodeId(id);
    setBoardStage(node.data.stage || (node.type === 'image' ? 'img_gen' : 'idea'));
    setBoardEpisode('');
    loadProjects();
  }, [loadProjects]);

  const actionsRef = useRef<CanvasActions>({ updateNodeData, deriveFrom, variantFrom, sendToBoard, updateEdgeLabel });
  actionsRef.current = { updateNodeData, deriveFrom, variantFrom, sendToBoard, updateEdgeLabel };
  const stableActions = useMemo<CanvasActions>(() => ({
    updateNodeData: (...a) => actionsRef.current.updateNodeData(...a),
    deriveFrom: (...a) => actionsRef.current.deriveFrom(...a),
    variantFrom: (...a) => actionsRef.current.variantFrom(...a),
    sendToBoard: (...a) => actionsRef.current.sendToBoard(...a),
    updateEdgeLabel: (...a) => actionsRef.current.updateEdgeLabel(...a),
  }), []);

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
    takeSnapshot();
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
    takeSnapshot();
    setNodes((ns) => [...ns, {
      id: genId('d'), type: 'data',
      position: { x: 120 + Math.random() * 120, y: 120 + Math.random() * 120 },
      data: { stage: '', title: '', content: '' },
    }]);
  };

  const addStickyNote = () => {
    takeSnapshot();
    setNodes((ns) => [...ns, {
      id: genId('st'), type: 'sticky',
      position: { x: 140 + Math.random() * 100, y: 140 + Math.random() * 100 },
      data: { content: '', color: 'yellow' },
    }]);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !currentId) return;
    takeSnapshot();
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

  const TEMPLATES: Record<string, { name: string; desc: string; seeds: () => { nodes: Node[]; edges: Edge[] } }> = useMemo(() => ({
    blank: { name: '空白画布', desc: '从零开始', seeds: () => ({ nodes: [], edges: [] }) },
    storyboard: {
      name: '分镜推演', desc: '按镜号排列,适合单集分镜推演',
      seeds: () => {
        const ns: Node[] = Array.from({ length: 6 }, (_, i) => ({
          id: genId('sb'), type: 'storyboard',
          position: { x: 60 + (i % 3) * 360, y: 60 + Math.floor(i / 3) * 300 },
          data: { stage: 'storyboard', shotNumber: `G${i + 1}`, duration: '', cameraType: '', cameraMove: '', description: '', title: '' },
        }));
        return { nodes: ns, edges: [] };
      },
    },
    character: {
      name: '角色设定', desc: '角色卡 + 视觉 DNA + 情感线',
      seeds: () => {
        const core: Node = { id: genId('d'), type: 'data', position: { x: 60, y: 60 },
          data: { stage: 'setting', title: '角色总览', content: '在此列出本集/本季核心角色及其关系' } };
        const chars: Node[] = ['主角', '配角A', '配角B'].map((name, i) => ({
          id: genId('d'), type: 'data', position: { x: 440, y: 60 + i * 240 },
          data: { stage: 'setting', title: name, content: `角色名:\n外貌特征:\n性格:\n弧光/变化:\n视觉 DNA 锚点:` },
        }));
        const es: Edge[] = chars.map((c) => ({ id: genId('e'), source: core.id, target: c.id, type: 'labeled' as const, data: {}, ...edgeDefaults }));
        return { nodes: [core, ...chars], edges: es };
      },
    },
    emotion: {
      name: '情绪曲线', desc: '按集铺开情绪走向,标注高潮/低谷',
      seeds: () => {
        const ns: Node[] = Array.from({ length: 10 }, (_, i) => ({
          id: genId('d'), type: 'data',
          position: { x: 60 + i * 300, y: 200 },
          data: { stage: 'idea', title: `EP${String(i + 1).padStart(2, '0')}`, content: `情绪定位:\n嘴替台词:\n结尾钩子:` },
        }));
        const es: Edge[] = ns.slice(1).map((n, i) => ({ id: genId('e'), source: ns[i].id, target: n.id, type: 'labeled' as const, data: {}, ...edgeDefaults }));
        return { nodes: ns, edges: es };
      },
    },
  }), []);

  const handleCreate = async () => {
    try {
      const tpl = TEMPLATES[newTemplate] || TEMPLATES.blank;
      const name = newName.trim() || tpl.name;
      const doc = await api.createCanvas(name);
      const seed = tpl.seeds();
      if (seed.nodes.length > 0) {
        await api.saveCanvas(doc.canvas_id, {
          nodes: seed.nodes.map((n) => ({
            node_id: n.id, type: n.type || 'data',
            position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
            data: n.data,
          })),
          edges: seed.edges.map((e) => ({ edge_id: e.id, source: e.source, target: e.target, data: e.data || {} })),
        });
      }
      setNewOpen(false); setNewName(''); setNewTemplate('blank');
      await loadCanvases();
      setCurrentId(doc.canvas_id);
    } catch (e: any) { message.error(e.message); }
  };

  // ── 画布管理:复制/重命名 ──
  const handleDuplicate = async () => {
    if (!currentId) return;
    try {
      const doc = await api.canvasDuplicate(currentId);
      await loadCanvases();
      setCurrentId(doc.canvas_id);
      message.success('已复制画布');
    } catch (e: any) { message.error(e.message); }
  };

  const handleRename = async () => {
    if (!currentId || !renameDraft.trim()) return;
    try {
      await api.canvasRename(currentId, renameDraft.trim());
      setRenameOpen(false);
      await loadCanvases();
      message.success('已重命名');
    } catch (e: any) { message.error(e.message); }
  };

  const openRename = () => {
    const c = canvases.find((x) => x.canvas_id === currentId);
    setRenameDraft(c?.name || '');
    setRenameOpen(true);
  };

  // ── 导出 JSON ──
  const exportJSON = useCallback(() => {
    const payload = {
      nodes: nodesRef.current.map((n) => ({
        node_id: n.id, type: n.type, position: n.position, data: n.data,
      })),
      edges: edgesRef.current.map((e) => ({
        edge_id: e.id, source: e.source, target: e.target, data: e.data,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `canvas_${currentIdRef.current}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  // ── 拖放 ──
  const handleCanvasDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    if (!currentIdRef.current) return;
    const files = e.dataTransfer.files;
    if (!files.length) return;
    takeSnapshot();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const baseX = e.clientX - rect.left;
    const baseY = e.clientY - rect.top;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;
      try {
        const res = await api.uploadCanvasAsset(currentIdRef.current, file);
        setNodes((ns) => [...ns, {
          id: genId('img'), type: 'image',
          position: { x: baseX + i * 48, y: baseY + i * 48 },
          data: { url: res.url },
        }]);
      } catch (e: any) { message.error(`${file.name}: ${e.message}`); }
    }
  }, [setNodes, takeSnapshot]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // ── 自动排版 ──
  const autoLayout = useCallback(() => {
    takeSnapshot();
    setNodes((ns) => {
      if (ns.length === 0) return ns;
      const stageOrder = Object.keys(STAGE_META);
      const byStage = new Map<string, Node[]>();
      const noStage: Node[] = [];
      ns.forEach((n) => {
        const s = n.data?.stage;
        if (s && stageOrder.includes(s)) {
          if (!byStage.has(s)) byStage.set(s, []);
          byStage.get(s)!.push(n);
        } else {
          noStage.push(n);
        }
      });
      const result: Node[] = [];
      let col = 0;
      const colWidth = 360, rowHeight = 220, baseX = 60, baseY = 60;
      stageOrder.forEach((stage) => {
        const group = byStage.get(stage);
        if (!group || group.length === 0) return;
        group.sort((a, b) => ((a.data?.shot_number || 0) - (b.data?.shot_number || 0)) || a.id.localeCompare(b.id));
        group.forEach((n, row) => {
          result.push({ ...n, position: { x: baseX + col * colWidth, y: baseY + row * rowHeight } });
        });
        col++;
      });
      noStage.forEach((n, i) => {
        result.push({ ...n, position: { x: baseX + col * colWidth, y: baseY + i * rowHeight } });
      });
      return result;
    });
    message.success('已按阶段自动排版');
  }, [setNodes, takeSnapshot]);

  // ── 搜索 ──
  const searchHits = useMemo(() => {
    if (!searchText.trim()) return new Set<string>();
    const q = searchText.toLowerCase();
    return new Set(nodes.filter((n) => {
      const t = (n.data?.title || '').toLowerCase();
      const c = (n.data?.content || '').toLowerCase();
      return t.includes(q) || c.includes(q);
    }).map((n) => n.id));
  }, [nodes, searchText]);

  const minimapNodeColor = useCallback((n: Node) => {
    if (n.type === 'image') return '#f59e0b';
    if (n.type === 'storyboard') return '#6366f1';
    if (n.type === 'sticky') return '#facc15';
    if (n.type === 'group') {
      const gc = GROUP_COLORS.find((c) => c.key === (n.data?.color || 'indigo'));
      return gc?.border || '#cbd5e1';
    }
    const stage = n.data?.stage;
    return STAGE_META[stage]?.color || '#94a3b8';
  }, []);

  // ── 节点添加 ──
  const addStoryboardNode = useCallback(() => {
    takeSnapshot();
    setNodes((ns) => [...ns, {
      id: genId('sb'), type: 'storyboard',
      position: { x: 120 + Math.random() * 120, y: 120 + Math.random() * 120 },
      data: {
        shotNumber: '', duration: '', cameraType: '', cameraMove: '',
        description: '', stage: 'storyboard', title: '',
      },
    }]);
  }, [setNodes, takeSnapshot]);

  // ── 复制节点 ──
  const duplicateNode = useCallback((nodeId: string) => {
    const src = nodesRef.current.find((n) => n.id === nodeId);
    if (!src) return;
    takeSnapshot();
    const newNode: Node = {
      ...src, id: genId(src.type === 'storyboard' ? 'sb' : src.type === 'image' ? 'img' : src.type === 'sticky' ? 'st' : 'd'),
      position: { x: src.position.x + 40, y: src.position.y + 40 },
      selected: false,
      data: { ...src.data, generating: false },
    };
    setNodes((ns) => [...ns, newNode]);
  }, [setNodes, takeSnapshot]);

  // ── 删除节点 ──
  const deleteNodeById = useCallback((nodeId: string) => {
    takeSnapshot();
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    setEdges((es) => es.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges, takeSnapshot]);

  // ── 选中节点批量操作 ──
  const getSelected = () => nodesRef.current.filter((n) => n.selected);

  const duplicateSelected = useCallback(() => {
    const sel = getSelected();
    if (sel.length === 0) return;
    takeSnapshot();
    const newNodes = sel.map((n) => ({
      ...n,
      id: genId(n.type === 'storyboard' ? 'sb' : n.type === 'image' ? 'img' : n.type === 'sticky' ? 'st' : 'd'),
      position: { x: n.position.x + 40, y: n.position.y + 40 },
      selected: false,
      data: { ...n.data, generating: false },
    }));
    setNodes((ns) => [...ns, ...newNodes]);
    message.success(`已复制 ${newNodes.length} 个节点`);
  }, [setNodes, takeSnapshot]);

  const deleteSelected = useCallback(() => {
    const ids = new Set(getSelected().map((n) => n.id));
    if (ids.size === 0) return;
    takeSnapshot();
    setNodes((ns) => ns.filter((n) => !ids.has(n.id)));
    setEdges((es) => es.filter((e) => !ids.has(e.source) && !ids.has(e.target)));
  }, [setNodes, setEdges, takeSnapshot]);

  // ── 复制到剪贴板(Ctrl+C) ──
  const copySelected = useCallback(() => {
    const sel = getSelected();
    if (sel.length === 0) return;
    const ids = new Set(sel.map((n) => n.id));
    const internalEdges = edgesRef.current.filter((e) => ids.has(e.source) && ids.has(e.target));
    clipboardRef.current = {
      nodes: sel.map((n) => ({ ...n, position: { ...n.position }, data: { ...n.data } })),
      edges: internalEdges.map((e) => ({ ...e, data: { ...e.data } })),
    };
    message.success(`已复制 ${sel.length} 个节点`);
  }, []);

  // ── 粘贴(Ctrl+V) ──
  const pasteClipboard = useCallback(() => {
    const clip = clipboardRef.current;
    if (!clip || clip.nodes.length === 0) return;
    takeSnapshot();
    const idMap = new Map<string, string>();
    clip.nodes.forEach((n) => {
      const prefix = n.type === 'storyboard' ? 'sb' : n.type === 'image' ? 'img' : n.type === 'sticky' ? 'st' : 'd';
      idMap.set(n.id, genId(prefix));
    });
    const newNodes: Node[] = clip.nodes.map((n) => ({
      ...n, id: idMap.get(n.id)!, selected: false,
      position: { x: n.position.x + 60, y: n.position.y + 60 },
      data: { ...n.data, generating: false },
    }));
    const newEdges: Edge[] = clip.edges
      .filter((e) => idMap.has(e.source) && idMap.has(e.target))
      .map((e) => ({
        ...e, id: genId('e'), source: idMap.get(e.source)!, target: idMap.get(e.target)!,
        data: { ...e.data },
      }));
    setNodes((ns) => [...ns.map((n) => ({ ...n, selected: false })), ...newNodes.map((n) => ({ ...n, selected: true }))]);
    if (newEdges.length > 0) setEdges((es) => [...es, ...newEdges]);
    clipboardRef.current = {
      nodes: newNodes.map((n) => ({ ...n, position: { ...n.position }, data: { ...n.data } })),
      edges: newEdges.map((e) => ({ ...e, data: { ...e.data } })),
    };
    message.success(`已粘贴 ${newNodes.length} 个节点`);
  }, [setNodes, setEdges, takeSnapshot]);

  // ── 箭头键微调位置 ──
  const nudgeSelected = useCallback((dx: number, dy: number) => {
    const sel = getSelected();
    if (sel.length === 0) return;
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    else takeSnapshot();
    const ids = new Set(sel.map((n) => n.id));
    setNodes((ns) => ns.map((n) => ids.has(n.id)
      ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } } : n));
    nudgeTimerRef.current = setTimeout(() => { nudgeTimerRef.current = null; }, 500);
  }, [setNodes, takeSnapshot]);

  // ── 批量改阶段 ──
  const batchSetStage = useCallback((stage: string) => {
    const sel = getSelected().filter((n) => n.type !== 'group' && n.type !== 'image');
    if (sel.length === 0) return;
    takeSnapshot();
    const ids = new Set(sel.map((n) => n.id));
    setNodes((ns) => ns.map((n) => ids.has(n.id) ? { ...n, data: { ...n.data, stage } } : n));
    message.success(`已将 ${sel.length} 个节点改为「${STAGE_META[stage]?.label || stage}」`);
  }, [setNodes, takeSnapshot]);

  // ── 导出 PNG ──
  const exportPNG = useCallback(async () => {
    const el = document.querySelector('.react-flow') as HTMLElement | null;
    if (!el) return;
    message.loading({ content: '正在导出图片...', key: 'export-png', duration: 0 });
    try {
      const url = await toPng(el, {
        backgroundColor: '#fafbfd',
        pixelRatio: 2,
        filter: (node) => !node.classList?.contains('react-flow__minimap')
          && !node.classList?.contains('react-flow__controls'),
      });
      const a = document.createElement('a');
      a.href = url;
      a.download = `canvas_${currentIdRef.current || 'export'}.png`;
      a.click();
      message.success({ content: '已导出', key: 'export-png' });
    } catch {
      message.error({ content: '导出失败', key: 'export-png' });
    }
  }, []);

  // ── 切换边样式 ──
  const cycleEdgePathType = useCallback(() => {
    const next = edgePathType === 'bezier' ? 'straight' : edgePathType === 'straight' ? 'step' : 'bezier';
    setEdgePathType(next);
    setEdges((es) => es.map((e) => ({ ...e, data: { ...e.data, pathType: next } })));
  }, [edgePathType, setEdges]);

  const addGroupNode = useCallback((x?: number, y?: number, w?: number, h?: number, label?: string) => {
    takeSnapshot();
    setNodes((ns) => [...ns, {
      id: genId('grp'), type: 'group',
      position: { x: x ?? 60, y: y ?? 60 },
      style: { width: w ?? 600, height: h ?? 400, zIndex: -1 },
      data: { label: label || '' },
    }]);
  }, [setNodes, takeSnapshot]);

  const createGroupFromSelected = useCallback(() => {
    const selected = getSelected().filter((n) => n.type !== 'group');
    if (selected.length < 2) { message.info('请选中至少 2 个节点再创建分组'); return; }
    const xs = selected.map((n) => n.position.x);
    const ys = selected.map((n) => n.position.y);
    const pad = 40;
    addGroupNode(
      Math.min(...xs) - pad, Math.min(...ys) - pad - 30,
      Math.max(...xs) - Math.min(...xs) + 340 + pad * 2,
      Math.max(...ys) - Math.min(...ys) + 280 + pad * 2,
    );
    message.success('已创建分组框');
  }, [addGroupNode]);

  // ── 分镜自动编号(按位置左上→右下) ──
  const autoNumberStoryboards = useCallback(() => {
    const sbs = nodesRef.current.filter((n) => n.type === 'storyboard');
    if (sbs.length === 0) { message.info('画布上没有分镜格节点'); return; }
    takeSnapshot();
    const sorted = [...sbs].sort((a, b) => {
      const rowA = Math.round(a.position.y / 150);
      const rowB = Math.round(b.position.y / 150);
      if (rowA !== rowB) return rowA - rowB;
      return a.position.x - b.position.x;
    });
    const idToNum = new Map(sorted.map((n, i) => [n.id, `G${i + 1}`]));
    setNodes((ns) => ns.map((n) =>
      idToNum.has(n.id) ? { ...n, data: { ...n.data, shotNumber: idToNum.get(n.id) } } : n,
    ));
    message.success(`已按位置重编 ${sorted.length} 个分镜号`);
  }, [setNodes, takeSnapshot]);

  // ── 锁定/解锁 ──
  const lockSelected = useCallback(() => {
    takeSnapshot();
    const ids = new Set(getSelected().map((n) => n.id));
    setNodes((ns) => ns.map((n) => ids.has(n.id)
      ? { ...n, draggable: false, data: { ...n.data, locked: true } } : n));
  }, [setNodes, takeSnapshot]);

  const unlockSelected = useCallback(() => {
    takeSnapshot();
    const ids = new Set(getSelected().map((n) => n.id));
    setNodes((ns) => ns.map((n) => ids.has(n.id)
      ? { ...n, draggable: true, data: { ...n.data, locked: false } } : n));
  }, [setNodes, takeSnapshot]);

  const toggleLockNode = useCallback((nodeId: string) => {
    takeSnapshot();
    setNodes((ns) => ns.map((n) => n.id === nodeId
      ? { ...n, draggable: !n.data.locked ? false : undefined, data: { ...n.data, locked: !n.data.locked } }
      : n));
  }, [setNodes, takeSnapshot]);

  // ── 对齐操作 ──
  const alignSelected = useCallback((action: AlignAction) => {
    const sel = getSelected();
    if (sel.length < 2) return;
    takeSnapshot();
    const ids = new Set(sel.map((n) => n.id));
    setNodes((ns) => {
      const targets = ns.filter((n) => ids.has(n.id));
      const xs = targets.map((n) => n.position.x);
      const ys = targets.map((n) => n.position.y);
      let updater: (n: Node, i: number) => { x: number; y: number };
      switch (action) {
        case 'left': { const minX = Math.min(...xs); updater = (n) => ({ ...n.position, x: minX }); break; }
        case 'right': { const maxX = Math.max(...xs); updater = (n) => ({ ...n.position, x: maxX }); break; }
        case 'top': { const minY = Math.min(...ys); updater = (n) => ({ ...n.position, y: minY }); break; }
        case 'bottom': { const maxY = Math.max(...ys); updater = (n) => ({ ...n.position, y: maxY }); break; }
        case 'distribute-h': {
          const sorted = [...targets].sort((a, b) => a.position.x - b.position.x);
          const total = sorted[sorted.length - 1].position.x - sorted[0].position.x;
          const step = total / (sorted.length - 1);
          const startX = sorted[0].position.x;
          const posMap = new Map(sorted.map((n, i) => [n.id, startX + i * step]));
          updater = (n) => ({ ...n.position, x: posMap.get(n.id) ?? n.position.x });
          break;
        }
        case 'distribute-v': {
          const sorted = [...targets].sort((a, b) => a.position.y - b.position.y);
          const total = sorted[sorted.length - 1].position.y - sorted[0].position.y;
          const step = total / (sorted.length - 1);
          const startY = sorted[0].position.y;
          const posMap = new Map(sorted.map((n, i) => [n.id, startY + i * step]));
          updater = (n) => ({ ...n.position, y: posMap.get(n.id) ?? n.position.y });
          break;
        }
      }
      return ns.map((n, i) => ids.has(n.id) ? { ...n, position: updater(n, i) } : n);
    });
  }, [setNodes, takeSnapshot]);

  // ── 多选工具栏数据 ──
  const selectedNodes = useMemo(() => nodes.filter((n) => n.selected), [nodes]);
  const selectionHasLocked = selectedNodes.some((n) => n.data?.locked);
  const selectionHasUnlocked = selectedNodes.some((n) => !n.data?.locked);

  // ── 右键菜单 ──
  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  // ── 手动处理 Delete 键(先快照再删节点+选中的边) ──
  const handleKeyDelete = useCallback(() => {
    const selNodes = getSelected();
    const selEdgeIds = new Set(edgesRef.current.filter((e) => e.selected).map((e) => e.id));
    if (selNodes.length === 0 && selEdgeIds.size === 0) return;
    takeSnapshot();
    const nodeIds = new Set(selNodes.map((n) => n.id));
    if (nodeIds.size > 0) setNodes((ns) => ns.filter((n) => !nodeIds.has(n.id)));
    setEdges((es) => es.filter((e) => !nodeIds.has(e.source) && !nodeIds.has(e.target) && !selEdgeIds.has(e.id)));
  }, [setNodes, setEdges, takeSnapshot]);

  // ── 全选 ──
  const selectAll = useCallback(() => {
    setNodes((ns) => ns.map((n) => ({ ...n, selected: true })));
  }, [setNodes]);

  // ── 键盘快捷键 ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); return; }
      if (mod && e.key === 'z' && e.shiftKey) { e.preventDefault(); handleRedo(); return; }
      if (mod && e.key === 'y') { e.preventDefault(); handleRedo(); return; }
      if (mod && e.key === 'f') { e.preventDefault(); setSearchOpen((v) => !v); return; }
      if (mod && e.key === 'd') { e.preventDefault(); duplicateSelected(); return; }
      if (mod && e.key === 'g') { e.preventDefault(); createGroupFromSelected(); return; }
      if (mod && e.key === 's') { e.preventDefault(); doSave(false); return; }
      if (mod && e.key === 'a') { e.preventDefault(); selectAll(); return; }
      if (mod && e.key === 'c') { e.preventDefault(); copySelected(); return; }
      if (mod && e.key === 'v') { e.preventDefault(); pasteClipboard(); return; }
      if (mod && (e.key === '0' || e.key === 'Digit0')) {
        e.preventDefault(); rfInstanceRef.current?.fitView({ padding: 0.15, duration: 300 }); return;
      }
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault(); rfInstanceRef.current?.zoomIn(); return;
      }
      if (mod && e.key === '-') {
        e.preventDefault(); rfInstanceRef.current?.zoomOut(); return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); handleKeyDelete(); return; }
      if (e.key === 'Escape') { setConnectMenu(null); return; }
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowUp') { e.preventDefault(); nudgeSelected(0, -step); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); nudgeSelected(0, step); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSelected(-step, 0); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSelected(step, 0); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [duplicateSelected, createGroupFromSelected, doSave, handleUndo, handleRedo,
    handleKeyDelete, selectAll, copySelected, pasteClipboard, nudgeSelected]);

  // ── 剪贴板粘贴图片 ──
  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      if (!currentIdRef.current) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (!file) continue;
          takeSnapshot();
          try {
            const res = await api.uploadCanvasAsset(currentIdRef.current, file);
            setNodes((ns) => [...ns, {
              id: genId('img'), type: 'image',
              position: { x: 200 + Math.random() * 80, y: 200 + Math.random() * 80 },
              data: { url: res.url },
            }]);
            message.success('已粘贴图片');
          } catch (err: any) { message.error(err.message); }
          return;
        }
      }
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [setNodes, takeSnapshot]);

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
    connectCompletedRef.current = true;
    takeSnapshot();
    setEdges((es) => addEdge({ ...c, id: genId('e'), type: 'labeled', data: { pathType: edgePathType === 'bezier' ? undefined : edgePathType }, ...edgeDefaults }, es));
  }, [setEdges, takeSnapshot, edgePathType]);

  const onConnectStart = useCallback((_: any, params: { nodeId: string | null }) => {
    connectCompletedRef.current = false;
    connectSourceRef.current = params.nodeId || '';
  }, []);

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    if (connectCompletedRef.current || !connectSourceRef.current) return;
    const target = event.target as HTMLElement;
    if (target.closest('.react-flow__handle')) return;
    const clientX = 'clientX' in event ? event.clientX : event.changedTouches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : event.changedTouches[0].clientY;
    setConnectMenu({ x: clientX, y: clientY, sourceId: connectSourceRef.current });
  }, []);

  const handleConnectMenuCreate = useCallback((type: string) => {
    if (!connectMenu) return;
    const instance = rfInstanceRef.current;
    if (!instance) return;
    const pos = instance.screenToFlowPosition({ x: connectMenu.x, y: connectMenu.y });
    takeSnapshot();
    const prefix = type === 'storyboard' ? 'sb' : type === 'image' ? 'img' : type === 'sticky' ? 'st' : 'd';
    const newId = genId(prefix);
    const nodeData = type === 'storyboard'
      ? { shotNumber: '', duration: '', cameraType: '', cameraMove: '', description: '', stage: 'storyboard', title: '' }
      : type === 'sticky' ? { content: '', color: 'yellow' }
      : { stage: '', title: '', content: '' };
    setNodes((ns) => [...ns, { id: newId, type, position: pos, data: nodeData }]);
    setEdges((es) => [...es, {
      id: genId('e'), source: connectMenu.sourceId, target: newId,
      type: 'labeled', data: { pathType: edgePathType === 'bezier' ? undefined : edgePathType },
      ...edgeDefaults,
    }]);
    setConnectMenu(null);
  }, [connectMenu, setNodes, setEdges, takeSnapshot, edgePathType]);

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
            <>
              <Tooltip title="重命名">
                <Button icon={<EditOutlined />} onClick={openRename} />
              </Tooltip>
              <Tooltip title="复制画布">
                <Button icon={<CopyOutlined />} onClick={handleDuplicate} />
              </Tooltip>
              <Popconfirm title="删除此画布？节点数据不可恢复" onConfirm={handleDelete}>
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
        <Space wrap>
          <Tooltip title="撤销 (Ctrl+Z)">
            <Button icon={<UndoOutlined />} onClick={handleUndo} disabled={!currentId || !canUndo} />
          </Tooltip>
          <Tooltip title="重做 (Ctrl+Shift+Z)">
            <Button icon={<RedoOutlined />} onClick={handleRedo} disabled={!currentId || !canRedo} />
          </Tooltip>
          <Button icon={<FileTextOutlined />} onClick={addDataNode} disabled={!currentId}>数据节点</Button>
          <Button icon={<VideoCameraOutlined />} onClick={addStoryboardNode} disabled={!currentId}>分镜格</Button>
          <Tooltip title="便签(随手创意备忘)">
            <Button icon={<HighlightOutlined />} onClick={addStickyNote} disabled={!currentId}>便签</Button>
          </Tooltip>
          <Button icon={<ImportOutlined />} onClick={openImport} disabled={!currentId}>从看板导入</Button>
          <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()} disabled={!currentId}>上传图片</Button>
          <Button icon={<GroupOutlined />} onClick={() => addGroupNode()} disabled={!currentId}>分组框</Button>
          <Button icon={<AppstoreOutlined />} onClick={autoLayout} disabled={!currentId || nodes.length === 0}>自动排版</Button>
          <Button icon={<OrderedListOutlined />} onClick={() => setFilmstripOpen(!filmstripOpen)} disabled={!currentId}
            type={filmstripOpen ? 'primary' : 'default'}>分镜条</Button>
          <Button icon={<SearchOutlined />} onClick={() => setSearchOpen(!searchOpen)} disabled={!currentId}
            type={searchOpen ? 'primary' : 'default'}>搜索</Button>
          <Tooltip title={snapGrid ? '关闭对齐网格' : '开启对齐网格'}>
            <Button onClick={() => setSnapGrid(!snapGrid)} disabled={!currentId}
              type={snapGrid ? 'primary' : 'default'}>
              {snapGrid ? '# ON' : '# OFF'}
            </Button>
          </Tooltip>
          <Tooltip title="分镜自动编号(按位置排序)">
            <Button icon={<SortAscendingOutlined />} onClick={autoNumberStoryboards}
              disabled={!currentId || nodes.filter((n) => n.type === 'storyboard').length === 0}>编号</Button>
          </Tooltip>
          <Tooltip title="导出 JSON">
            <Button icon={<DownloadOutlined />} onClick={exportJSON} disabled={!currentId || nodes.length === 0} />
          </Tooltip>
          <Tooltip title="导出 PNG 截图">
            <Button icon={<CameraOutlined />} onClick={exportPNG} disabled={!currentId || nodes.length === 0} />
          </Tooltip>
          <Tooltip title={`连线样式: ${edgePathType === 'bezier' ? '曲线' : edgePathType === 'straight' ? '直线' : '折线'}(点击切换)`}>
            <Button onClick={cycleEdgePathType} disabled={!currentId} style={{ fontSize: 12, padding: '0 8px' }}>
              {edgePathType === 'bezier' ? '⌒' : edgePathType === 'straight' ? '╱' : '⌐'}
            </Button>
          </Tooltip>
          <Tooltip title="快捷键一览">
            <Button icon={<QuestionCircleOutlined />} onClick={() => setShortcutsOpen(true)} />
          </Tooltip>
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

      {/* ── 搜索栏 ── */}
      {searchOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
          <Input
            prefix={<SearchOutlined />}
            value={searchText} onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索节点标题或内容..." allowClear size="small"
            style={{ maxWidth: 360 }}
          />
          {searchText && <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>命中 {searchHits.size} 个节点</Text>}
        </div>
      )}

      {/* ── 画布 ── */}
      <div
        style={{ flex: 1, border: '1px solid #eef0f6', borderRadius: 12, overflow: 'hidden', background: '#fafbfd', position: 'relative' }}
        onDrop={handleCanvasDrop} onDragOver={handleCanvasDragOver}
      >
        {!currentId ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="新建一个画布开始创作" image={<img src="/empty-create.svg" alt="" width={160} />}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewOpen(true)}>新建画布</Button>
            </Empty>
          </div>
        ) : loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <CanvasCtx.Provider value={stableActions}>
            <ReactFlowProvider>
              <ReactFlow
                key={currentId}
                nodes={searchText ? nodes.map((n) => searchHits.has(n.id)
                  ? { ...n, style: { ...n.style, boxShadow: '0 0 0 3px #faad14', borderRadius: 12 } }
                  : { ...n, style: { ...n.style, opacity: 0.35 } }
                ) : nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onInit={(i: ReactFlowInstance) => { rfInstanceRef.current = i; }}
                onNodeContextMenu={onNodeContextMenu}
                onPaneClick={() => { closeContextMenu(); setConnectMenu(null); }}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{ type: 'labeled', data: { pathType: edgePathType }, ...edgeDefaults }}
                deleteKeyCode={[]}
                snapToGrid={snapGrid}
                snapGrid={[18, 18]}
                fitView
                minZoom={0.1}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#e2e8f0" gap={18} />
                <Controls showInteractive={false} />
                <MiniMap
                  nodeColor={minimapNodeColor}
                  maskColor="rgba(240,241,245,.7)"
                  style={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                  pannable zoomable
                />
                {filmstripOpen && <Panel position="bottom-center"><FilmstripStrip nodes={nodes} /></Panel>}
                <Panel position="top-right">
                  <ZoomBar />
                </Panel>
                {selectedNodes.length >= 2 && (
                  <Panel position="top-center">
                    <SelectionToolbar
                      count={selectedNodes.length}
                      hasLocked={selectionHasLocked}
                      hasUnlocked={selectionHasUnlocked}
                      onAlign={alignSelected}
                      onDelete={deleteSelected}
                      onDuplicate={duplicateSelected}
                      onGroup={createGroupFromSelected}
                      onLock={lockSelected}
                      onUnlock={unlockSelected}
                      stageOptions={stageOptions(ALL_STAGES)}
                      onBatchStage={batchSetStage}
                    />
                  </Panel>
                )}
              </ReactFlow>
            </ReactFlowProvider>
            {connectMenu && (
              <div
                style={{
                  position: 'fixed', left: connectMenu.x, top: connectMenu.y,
                  zIndex: 50, background: '#fff', borderRadius: 10,
                  border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,.12)',
                  padding: 6, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 110,
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div style={{ fontSize: 11, color: '#94a3b8', padding: '2px 8px' }}>新建节点并连线</div>
                {(['data', 'storyboard', 'sticky'] as const).map((t) => (
                  <div
                    key={t}
                    onClick={() => handleConnectMenuCreate(t)}
                    style={{
                      padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                      transition: 'background .12s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f1f5f9'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    {t === 'data' ? '📄 数据节点' : t === 'storyboard' ? '🎬 分镜节点' : '📝 便签'}
                  </div>
                ))}
              </div>
            )}
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
      <Modal title="新建画布" open={newOpen} onCancel={() => setNewOpen(false)} onOk={handleCreate} okText="创建" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>模板</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
              {Object.entries(TEMPLATES).map(([key, tpl]) => (
                <div key={key} onClick={() => setNewTemplate(key)} style={{
                  border: newTemplate === key ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
                  background: newTemplate === key ? '#f5f3ff' : '#fff',
                  transition: 'all .15s',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{tpl.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{tpl.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>画布名称(可选)</Text>
            <Input
              value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder={TEMPLATES[newTemplate]?.name || '未命名画布'}
              style={{ marginTop: 4 }} onPressEnter={handleCreate}
            />
          </div>
        </div>
      </Modal>

      {/* ── 重命名画布 ── */}
      <Modal title="重命名画布" open={renameOpen} onCancel={() => setRenameOpen(false)} onOk={handleRename} okText="确定" width={360}>
        <Input value={renameDraft} onChange={(e) => setRenameDraft(e.target.value)}
          placeholder="画布名称" style={{ marginTop: 12 }} onPressEnter={handleRename} autoFocus />
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

      {/* ── 快捷键帮助 ── */}
      <Modal title="画布快捷键" open={shortcutsOpen} onCancel={() => setShortcutsOpen(false)} footer={null} width={380}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', fontSize: 13, marginTop: 12 }}>
          {([
            ['Ctrl+Z', '撤销'], ['Ctrl+Shift+Z / Ctrl+Y', '重做'],
            ['Ctrl+A', '全选'], ['Ctrl+D', '复制选中节点'],
            ['Ctrl+G', '选中节点建分组'], ['Ctrl+S', '手动保存'],
            ['Ctrl+F', '搜索节点'], ['Delete / Backspace', '删除选中节点/边'],
            ['鼠标右键', '节点上下文菜单'], ['双击连线', '编辑连线标签'],
            ['拖放图片文件', '上传为图片节点'],
          ] as [string, string][]).map(([key, desc], i) => (
            <div key={i} style={{ display: 'contents' }}>
              <span style={{ color: '#64748b' }}>{desc}</span>
              <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontSize: 11, whiteSpace: 'nowrap' }}>{key}</code>
            </div>
          ))}
        </div>
      </Modal>

      {/* ── 右键菜单 ── */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed', top: contextMenu.y, left: contextMenu.x,
            background: '#fff', borderRadius: 10, boxShadow: '0 4px 24px rgba(0,0,0,.14)',
            border: '1px solid #e2e8f0', zIndex: 1000, padding: '4px 0', minWidth: 170,
          }}
          onMouseLeave={closeContextMenu}
        >
          {(() => {
            const nd = nodesRef.current.find((n) => n.id === contextMenu.nodeId);
            const isLocked = nd?.data?.locked;
            const isGroup = nd?.type === 'group';
            const isDataOrSb = nd?.type === 'data' || nd?.type === 'storyboard';
            const items: ({ icon: React.ReactNode; label: string; shortcut: string; action: () => void; danger?: boolean } | null)[] = [];
            if (isDataOrSb) items.push(
              { icon: <BranchesOutlined />, label: 'AI 派生', shortcut: '', action: () => deriveFrom(contextMenu.nodeId) },
              { icon: <SendOutlined />, label: '回写看板', shortcut: '', action: () => sendToBoard(contextMenu.nodeId) },
            );
            items.push(
              { icon: <CopyOutlined />, label: '复制节点', shortcut: 'Ctrl+D', action: () => duplicateNode(contextMenu.nodeId) },
              { icon: <GroupOutlined />, label: '创建分组', shortcut: 'Ctrl+G', action: () => createGroupFromSelected() },
              { icon: isLocked ? <UnlockOutlined /> : <LockOutlined />, label: isLocked ? '解锁' : '锁定', shortcut: '', action: () => toggleLockNode(contextMenu.nodeId) },
            );
            if (isGroup) items.push(null);
            items.push(null);
            items.push(
              { icon: <DeleteOutlined style={{ color: '#ef4444' }} />, label: '删除', shortcut: 'Del', action: () => deleteNodeById(contextMenu.nodeId), danger: true },
            );
            return items;
          })().map((item, i) => item === null ? (
            <div key={i} style={{ height: 1, background: '#f1f5f9', margin: '4px 8px' }} />
          ) : (
            <div key={i}
              onClick={() => { item.action(); setContextMenu(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
                cursor: 'pointer', fontSize: 13,
                color: (item as any).danger ? '#ef4444' : '#334155',
                transition: 'background .1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.shortcut}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
