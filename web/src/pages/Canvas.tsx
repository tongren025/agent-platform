// 自由画布 —— 一人团队的人工主控台。
// 文本、图片、视频都能手动创建/修改/审核；AI 派生和媒体生成只是可选加速器。
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState,
  type Connection, type Edge, type Node, type ReactFlowInstance, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './Canvas.css';
import {
  Alert, Button, Empty, Input, Modal, Popconfirm, Select, Space, Spin, Switch,
  Tag, Tooltip, Typography,
} from 'antd';
import { message } from '../ui';
import {
  ApartmentOutlined, BranchesOutlined, CloudOutlined, CloudSyncOutlined,
  DeleteOutlined, EditOutlined, ExportOutlined, FileTextOutlined,
  FolderOpenOutlined, ImportOutlined, PlusOutlined, RedoOutlined, SaveOutlined,
  UndoOutlined, UploadOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { useResponsive } from '../hooks/useResponsive';
import {
  CanvasCtx, DataNode, MediaNode, REVIEW_META, STAGE_META, VideoNode,
  type CanvasActions,
} from '../components/canvas/CanvasNodes';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface CanvasSummary {
  canvas_id: string;
  name: string;
  nodeCount: number;
  updated_at: string;
}

interface ImageModel {
  provider: string;
  modelId: string;
  modelName: string;
}

interface CanvasSnapshot {
  nodes: Node[];
  edges: Edge[];
}

type SaveStatus = 'saved' | 'dirty' | 'saving' | 'error';

const DERIVE_STAGES = ['script', 'setting', 'design', 'storyboard', 'img_prompt', 'vid_prompt'];
const ALL_STAGES = Object.keys(STAGE_META);
const STAGE_ORDER = ['idea', 'script', 'setting', 'design', 'storyboard', 'img_prompt', 'img_gen', 'vid_prompt', 'vid_gen', 'final', ''];

const IMAGE_SIZES = [
  { value: '1024x1024', label: '1:1' },
  { value: '864x1152', label: '3:4' },
  { value: '1152x864', label: '4:3' },
  { value: '720x1280', label: '9:16' },
  { value: '1280x720', label: '16:9' },
];

const VIDEO_DURATIONS = [3, 5, 8, 10, 15].map((value) => ({ value, label: `${value} 秒` }));
const VIDEO_RESOLUTIONS = ['480p', '720p', '1080p'].map((value) => ({ value, label: value }));
const ASPECT_RATIOS = ['9:16', '16:9', '1:1'].map((value) => ({ value, label: value }));

const edgeDefaults = {
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { stroke: '#93a4b8', strokeWidth: 1.5 },
};

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function cloneSnapshot(nodes: Node[], edges: Edge[]): CanvasSnapshot {
  return {
    nodes: nodes.map((node) => ({
      ...node,
      position: { ...node.position },
      data: { ...node.data, generating: false, syncing: false },
    })),
    edges: edges.map((edge) => ({ ...edge })),
  };
}

function persistedNode(node: Node) {
  const { generating: _generating, syncing: _syncing, ...data } = node.data || {};
  return {
    node_id: node.id,
    type: node.type || 'data',
    position: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
    data,
  };
}

function persistedEdge(edge: Edge) {
  return { edge_id: edge.id, source: edge.source, target: edge.target };
}

function deserializeNode(raw: any): Node {
  const legacyPrompt = raw.type === 'prompt';
  const type = legacyPrompt ? 'data' : (raw.type || 'data');
  const data = {
    ...(raw.data || {}),
    stage: legacyPrompt ? 'img_prompt' : (raw.data?.stage || ''),
    title: raw.data?.title || '',
    content: raw.data?.content ?? raw.data?.prompt ?? '',
    prompt: raw.data?.prompt || '',
    reviewStatus: raw.data?.reviewStatus || (type === 'data' ? 'draft' : 'review'),
    mediaKind: raw.data?.mediaKind || (type === 'video' ? 'video' : type === 'image' ? 'image' : undefined),
  };
  return {
    id: raw.id || raw.node_id || genId(type),
    type,
    position: raw.position || { x: 0, y: 0 },
    data,
  };
}

function deserializeEdge(raw: any): Edge {
  return {
    id: raw.id || raw.edge_id || genId('e'),
    source: raw.source,
    target: raw.target,
    ...edgeDefaults,
  };
}

export default function Canvas() {
  const { isMobile } = useResponsive();
  return isMobile ? <CanvasMobileGate /> : <CanvasDesktop />;
}

function CanvasMobileGate() {
  return (
    <div className="canvas-mobile-gate">
      <div className="canvas-mobile-mark">CUT</div>
      <Title level={3}>自由画布需要桌面空间</Title>
      <Text type="secondary">手机端适合查看结果；镜头编排、连线和人工审核请在电脑上完成。</Text>
    </div>
  );
}

function CanvasDesktop() {
  const [canvases, setCanvases] = useState<CanvasSummary[]>([]);
  const [currentId, setCurrentId] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [savedAt, setSavedAt] = useState('');
  const [, setHistoryVersion] = useState(0);
  const [dropActive, setDropActive] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [employees, setEmployees] = useState<any[]>([]);
  const [models, setModels] = useState<ImageModel[]>([]);
  const [model, setModel] = useState(() => localStorage.getItem('canvas.model') || '');
  const [size, setSize] = useState(() => localStorage.getItem('canvas.size') || '720x1280');

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState('');

  const [deriveNodeId, setDeriveNodeId] = useState<string | null>(null);
  const [deriveEmp, setDeriveEmp] = useState(() => localStorage.getItem('canvas.emp') || '');
  const [deriveStage, setDeriveStage] = useState('');
  const [deriveInstr, setDeriveInstr] = useState('');

  const [videoSourceId, setVideoSourceId] = useState<string | null>(null);
  const [videoModels, setVideoModels] = useState<any[]>([]);
  const [videoModelsLoading, setVideoModelsLoading] = useState(false);
  const [videoModel, setVideoModel] = useState(() => localStorage.getItem('canvas.video.model') || '');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoResolution, setVideoResolution] = useState('720p');
  const [videoAspect, setVideoAspect] = useState('9:16');
  const [videoAudio, setVideoAudio] = useState(true);
  const [videoSubmitting, setVideoSubmitting] = useState(false);
  const [composing, setComposing] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importProject, setImportProject] = useState('');
  const [importCards, setImportCards] = useState<any[]>([]);
  const [importEpisode, setImportEpisode] = useState('all');
  const [importStage, setImportStage] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  const [boardNodeId, setBoardNodeId] = useState<string | null>(null);
  const [boardProject, setBoardProject] = useState('');
  const [boardStage, setBoardStage] = useState('');
  const [boardEpisode, setBoardEpisode] = useState('');
  const [sendingBoard, setSendingBoard] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const flowRef = useRef<ReactFlowInstance | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const currentIdRef = useRef(currentId);
  const modelRef = useRef(model);
  const sizeRef = useRef(size);
  const skipSaveRef = useRef(true);
  const saveQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const revisionByCanvasRef = useRef<Record<string, number>>({});
  const historyRef = useRef<CanvasSnapshot[]>([]);
  const futureRef = useRef<CanvasSnapshot[]>([]);
  const checkpointRef = useRef({ group: '', at: 0 });

  nodesRef.current = nodes;
  edgesRef.current = edges;
  currentIdRef.current = currentId;
  modelRef.current = model;
  sizeRef.current = size;

  const nodeTypes = useMemo(() => ({ data: DataNode, image: MediaNode, video: VideoNode }), []);
  const saveFingerprint = useMemo(() => JSON.stringify({
    nodes: nodes.map(persistedNode),
    edges: edges.map(persistedEdge),
  }), [edges, nodes]);

  const checkpoint = useCallback((group = `action-${Date.now()}`) => {
    const now = Date.now();
    if (checkpointRef.current.group === group && now - checkpointRef.current.at < 900) {
      checkpointRef.current.at = now;
      return;
    }
    historyRef.current.push(cloneSnapshot(nodesRef.current, edgesRef.current));
    if (historyRef.current.length > 50) historyRef.current.shift();
    futureRef.current = [];
    checkpointRef.current = { group, at: now };
    setHistoryVersion((value) => value + 1);
  }, []);

  const undo = useCallback(() => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    futureRef.current.push(cloneSnapshot(nodesRef.current, edgesRef.current));
    setNodes(previous.nodes);
    setEdges(previous.edges);
    checkpointRef.current = { group: '', at: 0 };
    setHistoryVersion((value) => value + 1);
  }, [setEdges, setNodes]);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    historyRef.current.push(cloneSnapshot(nodesRef.current, edgesRef.current));
    setNodes(next.nodes);
    setEdges(next.edges);
    checkpointRef.current = { group: '', at: 0 };
    setHistoryVersion((value) => value + 1);
  }, [setEdges, setNodes]);

  const loadCanvases = useCallback(async () => {
    try {
      const list = await api.listCanvases();
      setCanvases(list);
      return list as CanvasSummary[];
    } catch {
      return [];
    }
  }, []);

  const loadProjects = useCallback(() => {
    api.listProjects().then(setProjects).catch(() => {});
  }, []);

  const loadCanvas = useCallback(async (cid: string) => {
    skipSaveRef.current = true;
    setLoading(true);
    try {
      const doc = await api.getCanvas(cid);
      skipSaveRef.current = true;
      revisionByCanvasRef.current[cid] = Number(doc.revision || 0);
      setCurrentName(doc.name || '未命名画布');
      setNodes((doc.nodes || []).map(deserializeNode));
      setEdges((doc.edges || []).map(deserializeEdge));
      historyRef.current = [];
      futureRef.current = [];
      setHistoryVersion((value) => value + 1);
      setSaveStatus('saved');
      setSavedAt(doc.updated_at || '');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [setEdges, setNodes]);

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

  useEffect(() => {
    if (currentId) loadCanvas(currentId);
  }, [currentId, loadCanvas]);
  useEffect(() => { if (model) localStorage.setItem('canvas.model', model); }, [model]);
  useEffect(() => { localStorage.setItem('canvas.size', size); }, [size]);
  useEffect(() => { if (deriveEmp) localStorage.setItem('canvas.emp', deriveEmp); }, [deriveEmp]);
  useEffect(() => { if (videoModel) localStorage.setItem('canvas.video.model', videoModel); }, [videoModel]);

  const doSave = useCallback(async (silent = true, name?: string): Promise<boolean> => {
    const cid = currentIdRef.current;
    if (!cid) return false;
    const payload = {
      name,
      nodes: nodesRef.current.map(persistedNode),
      edges: edgesRef.current.map(persistedEdge),
    };
    if (currentIdRef.current === cid) setSaveStatus('saving');

    const task = saveQueueRef.current.then(async () => {
      const doc = await api.saveCanvas(cid, {
        ...payload,
        base_revision: revisionByCanvasRef.current[cid] || 0,
      });
      revisionByCanvasRef.current[cid] = Number(doc.revision || 0);
      return doc;
    });
    saveQueueRef.current = task.catch(() => undefined);

    try {
      const doc = await task;
      if (currentIdRef.current === cid) {
        setSaveStatus('saved');
        setSavedAt(doc.updated_at || new Date().toISOString());
        setCanvases((items) => items.map((canvas) => canvas.canvas_id === cid ? {
          ...canvas,
          name: name || canvas.name,
          nodeCount: payload.nodes.length,
          updated_at: doc.updated_at || canvas.updated_at,
        } : canvas));
      }
      if (!silent) message.success('画布已保存');
      return true;
    } catch (error: any) {
      if (currentIdRef.current === cid) setSaveStatus('error');
      if (!silent) message.error(error.message);
      return false;
    }
  }, []);

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    if (!currentId) return;
    setSaveStatus('dirty');
    const timer = window.setTimeout(() => doSave(true), 1200);
    return () => window.clearTimeout(timer);
  }, [saveFingerprint, currentId, doSave]);

  const updateNodeData = useCallback((id: string, patch: Record<string, any>) => {
    checkpoint(`edit-${id}`);
    setNodes((items) => items.map((node) => node.id === id ? {
      ...node,
      data: { ...node.data, ...patch },
    } : node));
  }, [checkpoint, setNodes]);

  const setTransient = useCallback((id: string, patch: Record<string, any>) => {
    setNodes((items) => items.map((node) => node.id === id ? {
      ...node,
      data: { ...node.data, ...patch },
    } : node));
  }, [setNodes]);

  const duplicateNode = useCallback((id: string) => {
    const source = nodesRef.current.find((node) => node.id === id);
    if (!source) return;
    checkpoint();
    const newId = genId(source.type || 'node');
    setNodes((items) => [...items, {
      ...source,
      id: newId,
      selected: false,
      position: { x: source.position.x + 48, y: source.position.y + 48 },
      data: { ...source.data, title: source.data.title ? `${source.data.title} · 副本` : '副本' },
    }]);
  }, [checkpoint, setNodes]);

  const deleteNode = useCallback((id: string) => {
    checkpoint();
    setNodes((items) => items.filter((node) => node.id !== id));
    setEdges((items) => items.filter((edge) => edge.source !== id && edge.target !== id));
  }, [checkpoint, setEdges, setNodes]);

  const deriveFrom = useCallback((id: string) => {
    const source = nodesRef.current.find((node) => node.id === id);
    if (!String(source?.data.content || '').trim()) {
      message.warning('节点内容为空，无法派生');
      return;
    }
    setDeriveNodeId(id);
    setDeriveInstr('');
  }, []);

  const handleDerive = async () => {
    const source = nodesRef.current.find((node) => node.id === deriveNodeId);
    if (!source) return;
    if (!deriveEmp) {
      message.warning('请选择执行派生的数字员工');
      return;
    }
    const sourceId = source.id;
    checkpoint();
    setDeriveNodeId(null);
    setTransient(sourceId, { generating: true });
    try {
      const result = await api.canvasDerive(currentIdRef.current, {
        source_title: source.data.title || '',
        source_content: source.data.content || '',
        source_stage: source.data.stage || '',
        target_stage: deriveStage,
        employee_key: deriveEmp,
        instruction: deriveInstr,
      });
      if (!result.items?.length) {
        message.warning('AI 未返回可解析的条目');
        return;
      }
      const newNodes = result.items.map((item, index): Node => ({
        id: genId('d'),
        type: 'data',
        position: { x: source.position.x + 390, y: source.position.y + index * 230 },
        data: {
          stage: item.stage || '',
          title: item.title || '',
          content: item.content || '',
          reviewStatus: 'review',
        },
      }));
      setNodes((items) => [...items, ...newNodes]);
      setEdges((items) => [...items, ...newNodes.map((node) => ({
        id: genId('e'), source: sourceId, target: node.id, ...edgeDefaults,
      }))]);
      message.success(`派生出 ${newNodes.length} 个待审核节点`);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setTransient(sourceId, { generating: false });
    }
  };

  const generateImageFrom = useCallback(async (id: string) => {
    const source = nodesRef.current.find((node) => node.id === id);
    if (!source) return;
    const prompt = String(source.data.prompt || source.data.content || '').trim();
    if (!prompt) {
      message.warning('没有可用的图片提示词');
      return;
    }
    if (!modelRef.current) {
      message.warning('请先在上方选择生图模型');
      return;
    }
    checkpoint();
    setTransient(id, { generating: true });
    try {
      const result = await api.canvasGenerate(currentIdRef.current, {
        prompt,
        model: modelRef.current,
        size: sizeRef.current,
      });
      const newId = genId('img');
      setNodes((items) => [...items, {
        id: newId,
        type: 'image',
        position: { x: source.position.x + 390, y: source.position.y },
        data: {
          mediaKind: 'image', stage: 'img_gen', title: `${source.data.title || '镜头'} · 图片`,
          url: result.url, prompt, reviewStatus: 'review',
        },
      }]);
      setEdges((items) => [...items, { id: genId('e'), source: id, target: newId, ...edgeDefaults }]);
      message.success('图片已生成，请人工审核');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setTransient(id, { generating: false });
    }
  }, [checkpoint, setEdges, setNodes, setTransient]);

  const ensureVideoModels = useCallback(async () => {
    if (videoModels.length || videoModelsLoading) return;
    setVideoModelsLoading(true);
    try {
      const list = await api.listCanvasMediaModels('video');
      setVideoModels(list);
      if (!videoModel && list.length) setVideoModel(list[0].id);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setVideoModelsLoading(false);
    }
  }, [videoModel, videoModels.length, videoModelsLoading]);

  const videoFrom = useCallback((id: string) => {
    const source = nodesRef.current.find((node) => node.id === id);
    if (!source) return;
    const prompt = String(source.data.prompt || source.data.content || '').trim();
    if (!prompt) {
      message.warning('请先写视频提示词');
      return;
    }
    setVideoSourceId(id);
    setVideoPrompt(prompt);
    ensureVideoModels();
  }, [ensureVideoModels]);

  const handleVideoSubmit = async () => {
    const source = nodesRef.current.find((node) => node.id === videoSourceId);
    if (!source || !videoModel || !videoPrompt.trim()) {
      message.warning('请选择视频模型并填写提示词');
      return;
    }
    setVideoSubmitting(true);
    checkpoint();
    try {
      const result = await api.canvasGenerateVideo(currentIdRef.current, {
        model: videoModel,
        prompt: videoPrompt.trim(),
        duration: videoDuration,
        resolution: videoResolution,
        aspect_ratio: videoAspect,
        image_url: source.type === 'image' ? (source.data.url || '') : '',
        generate_audio: videoAudio,
      });
      const newId = genId('vid');
      setNodes((items) => [...items, {
        id: newId,
        type: 'video',
        position: { x: source.position.x + 390, y: source.position.y },
        data: {
          mediaKind: 'video', stage: 'vid_gen', title: `${source.data.title || '镜头'} · 视频`,
          prompt: videoPrompt.trim(), job: result.job, reviewStatus: 'draft',
        },
      }]);
      setEdges((items) => [...items, { id: genId('e'), source: source.id, target: newId, ...edgeDefaults }]);
      setVideoSourceId(null);
      message.success('视频任务已提交，可稍后在节点上刷新状态');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setVideoSubmitting(false);
    }
  };

  const syncVideo = useCallback(async (id: string) => {
    const node = nodesRef.current.find((item) => item.id === id);
    const jobId = String(node?.data.job?.id || '');
    if (!jobId) return;
    setTransient(id, { syncing: true });
    try {
      const result = await api.canvasSyncVideo(currentIdRef.current, jobId);
      const patch: Record<string, any> = { job: result.job, syncing: false };
      if (result.job.url) {
        checkpoint();
        patch.url = result.job.url;
        patch.reviewStatus = 'review';
        message.success('视频已完成并固化到本地，请人工审核');
      } else if (result.job.status === 'failed') {
        message.error(result.job.error || '视频生成失败');
      } else {
        message.info(`任务状态：${result.job.status || '处理中'}`);
      }
      setTransient(id, patch);
    } catch (error: any) {
      message.error(error.message);
      setTransient(id, { syncing: false });
    }
  }, [checkpoint, setTransient]);

  const sendToBoard = useCallback((id: string) => {
    const node = nodesRef.current.find((item) => item.id === id);
    if (!node) return;
    setBoardNodeId(id);
    setBoardStage(node.data.stage || (node.type === 'video' ? 'vid_gen' : node.type === 'image' ? 'img_gen' : 'idea'));
    setBoardEpisode('');
    loadProjects();
  }, [loadProjects]);

  const actions = useMemo<CanvasActions>(() => ({
    updateNodeData,
    deriveFrom,
    imageFrom: generateImageFrom,
    videoFrom,
    variantFrom: generateImageFrom,
    syncVideo,
    duplicateNode,
    deleteNode,
    sendToBoard,
  }), [deleteNode, deriveFrom, duplicateNode, generateImageFrom, sendToBoard, syncVideo, updateNodeData, videoFrom]);

  const handleSendToBoard = async () => {
    const node = nodesRef.current.find((item) => item.id === boardNodeId);
    if (!node || !boardProject) {
      message.warning('请选择目标项目');
      return;
    }
    setSendingBoard(true);
    try {
      const isMedia = node.type === 'image' || node.type === 'video';
      const content = isMedia ? (node.data.prompt || '') : (node.data.content || '');
      const title = String(node.data.title || content || '画布节点').slice(0, 40);
      const stage = boardStage || 'idea';
      const card = await api.addCard(boardProject, {
        stage,
        title,
        content,
        episode: boardEpisode ? Number.parseInt(boardEpisode, 10) : null,
        shot_number: 0,
        status: node.data.reviewStatus === 'approved' ? 'done' : 'review',
        prompts: ['img_prompt', 'vid_prompt'].includes(stage) && content ? [content] : [],
      });
      if (node.type === 'image' && node.data.url) await api.updateCard(card.card_id, { images: [node.data.url] });
      if (node.type === 'video' && node.data.url) await api.updateCard(card.card_id, { videos: [node.data.url] });
      message.success(`已写入看板「${STAGE_META[stage]?.label || stage}」阶段`);
      setBoardNodeId(null);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setSendingBoard(false);
    }
  };

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
      .then((project) => setImportCards(project.cards || []))
      .catch((error) => message.error(error.message))
      .finally(() => setImportLoading(false));
  }, [importProject]);

  const importFiltered = useMemo(() => {
    let list = importCards;
    if (importEpisode === 'global') list = list.filter((card) => card.episode == null);
    else if (importEpisode !== 'all') list = list.filter((card) => card.episode === Number.parseInt(importEpisode, 10));
    if (importStage) list = list.filter((card) => card.stage === importStage);
    return list;
  }, [importCards, importEpisode, importStage]);

  const importEpisodes = useMemo(() => {
    const values = new Set<number>();
    importCards.forEach((card) => { if (card.episode != null) values.add(card.episode); });
    return Array.from(values).sort((a, b) => a - b);
  }, [importCards]);

  const handleBoardImport = () => {
    if (!importFiltered.length) {
      message.warning('没有可导入的卡片');
      return;
    }
    if (importFiltered.length > 60) {
      message.warning(`命中 ${importFiltered.length} 张卡片，单次最多导入 60 张`);
      return;
    }
    checkpoint();
    const baseX = nodesRef.current.length ? Math.max(...nodesRef.current.map((node) => node.position.x)) + 420 : 80;
    const byStage = new Map<string, any[]>();
    importFiltered.forEach((card) => {
      const group = byStage.get(card.stage) || [];
      group.push(card);
      byStage.set(card.stage, group);
    });
    const newNodes: Node[] = [];
    Array.from(byStage.entries()).forEach(([stage, cards], column) => {
      cards.sort((a, b) => (a.shot_number || 0) - (b.shot_number || 0));
      cards.forEach((card, row) => {
        newNodes.push({
          id: genId('c'),
          type: 'data',
          position: { x: baseX + column * 390, y: 60 + row * 250 },
          data: {
            stage,
            title: card.title || '',
            content: card.content || (card.prompts || []).join('\n'),
            reviewStatus: card.status === 'done' ? 'approved' : 'review',
          },
        });
      });
    });
    setNodes((items) => [...items, ...newNodes]);
    setImportOpen(false);
    message.success(`已导入 ${newNodes.length} 张卡片`);
  };

  const addDataNode = () => {
    checkpoint();
    const selected = nodesRef.current.find((node) => node.selected);
    const index = nodesRef.current.length;
    setNodes((items) => [...items, {
      id: genId('d'),
      type: 'data',
      position: selected
        ? { x: selected.position.x + 390, y: selected.position.y }
        : { x: 120 + (index % 3) * 390, y: 120 + Math.floor(index / 3) * 280 },
      data: { stage: '', title: '', content: '', reviewStatus: 'draft' },
    }]);
  };

  const uploadFiles = useCallback(async (files: File[] | FileList, origin?: { x: number; y: number }) => {
    const list = Array.from(files);
    if (!list.length || !currentIdRef.current) return;
    checkpoint();
    for (let index = 0; index < list.length; index += 1) {
      const file = list[index];
      try {
        const result = await api.uploadCanvasAsset(currentIdRef.current, file);
        setNodes((items) => [...items, {
          id: genId(result.kind === 'video' ? 'vid' : 'img'),
          type: result.kind,
          position: { x: (origin?.x || 150) + index * 42, y: (origin?.y || 150) + index * 42 },
          data: {
            mediaKind: result.kind,
            stage: result.kind === 'video' ? 'vid_gen' : 'img_gen',
            title: result.name,
            url: result.url,
            prompt: '',
            reviewStatus: 'review',
            sizeBytes: result.size,
          },
        }]);
      } catch (error: any) {
        message.error(`${file.name}: ${error.message}`);
      }
    }
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  }, [checkpoint, setNodes]);

  const handleCreate = async () => {
    try {
      const doc = await api.createCanvas(newName.trim() || '未命名画布');
      setNewOpen(false);
      setNewName('');
      await loadCanvases();
      setCurrentId(doc.canvas_id);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleRename = async () => {
    const name = renameName.trim();
    if (!name) return;
    if (await doSave(false, name)) {
      setCurrentName(name);
      setRenameOpen(false);
      await loadCanvases();
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteCanvas(currentId);
      message.success('画布已删除');
      const list = await loadCanvases();
      setCurrentId(list.length ? list[0].canvas_id : '');
      if (!list.length) {
        setNodes([]);
        setEdges([]);
        setCurrentName('');
      }
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const onConnect = useCallback((connection: Connection) => {
    checkpoint();
    setEdges((items) => addEdge({ ...connection, id: genId('e'), ...edgeDefaults }, items));
  }, [checkpoint, setEdges]);

  const autoLayout = () => {
    if (!nodesRef.current.length) return;
    checkpoint();
    const groups = new Map<string, Node[]>();
    nodesRef.current.forEach((node) => {
      const stage = String(node.data.stage || '');
      const values = groups.get(stage) || [];
      values.push(node);
      groups.set(stage, values);
    });
    const orderedStages = [
      ...STAGE_ORDER.filter((stage) => groups.has(stage)),
      ...Array.from(groups.keys()).filter((stage) => !STAGE_ORDER.includes(stage)),
    ];
    setNodes((items) => items.map((node) => {
      const column = orderedStages.indexOf(String(node.data.stage || ''));
      const row = groups.get(String(node.data.stage || ''))?.findIndex((item) => item.id === node.id) || 0;
      return { ...node, position: { x: 60 + column * 390, y: 70 + row * 380 } };
    }));
    window.setTimeout(() => flowRef.current?.fitView({ padding: 0.12, duration: 400 }), 50);
  };

  const exportCanvas = () => {
    const document = {
      schemaVersion: 2,
      name: currentName,
      exportedAt: new Date().toISOString(),
      nodes: nodesRef.current.map(persistedNode),
      edges: edgesRef.current.map(persistedEdge),
    };
    const blob = new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = `${currentName || 'canvas'}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importCanvasFile = async (file?: File) => {
    if (!file) return;
    try {
      const document = JSON.parse(await file.text());
      if (!Array.isArray(document.nodes) || !Array.isArray(document.edges)) throw new Error('不是有效的画布备份');
      const importedNodes = document.nodes.map(deserializeNode);
      const importedEdges = document.edges.map(deserializeEdge);
      Modal.confirm({
        title: '用备份替换当前画布？',
        content: `将导入 ${importedNodes.length} 个节点。当前内容可先点“导出备份”保留。`,
        okText: '确认替换',
        cancelText: '取消',
        onOk: () => {
          checkpoint();
          setNodes(importedNodes);
          setEdges(importedEdges);
          message.success('画布备份已导入');
        },
      });
    } catch (error: any) {
      message.error(error.message);
    } finally {
      if (jsonInputRef.current) jsonInputRef.current.value = '';
    }
  };

  const approvedVideos = useMemo(() => nodes
    .filter((node) => node.type === 'video' && node.data.url && node.data.reviewStatus === 'approved' && node.data.stage !== 'final')
    .sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y), [nodes]);

  const handleCompose = () => {
    if (!approvedVideos.length) {
      message.warning('请先把要使用的视频节点标记为“已通过”');
      return;
    }
    Modal.confirm({
      title: `按画布顺序合成 ${approvedVideos.length} 个镜头？`,
      content: '顺序为从左到右、同列从上到下。只会使用“已通过”的视频节点。',
      okText: '开始合成',
      cancelText: '取消',
      onOk: async () => {
        setComposing(true);
        checkpoint();
        try {
          if (!await doSave(true)) return;
          const result = await api.canvasCompose(currentIdRef.current, {
            video_urls: approvedVideos.map((node) => node.data.url),
            aspect_ratio: videoAspect,
          });
          const newId = genId('final');
          const maxX = Math.max(...approvedVideos.map((node) => node.position.x));
          setNodes((items) => [...items, {
            id: newId,
            type: 'video',
            position: { x: maxX + 430, y: 80 },
            data: {
              mediaKind: 'video', stage: 'final', title: `${currentName} · 成片`,
              url: result.url, prompt: `由 ${approvedVideos.length} 个已通过镜头合成`, reviewStatus: 'review',
            },
          }]);
          setEdges((items) => [...items, ...approvedVideos.map((node) => ({
            id: genId('e'), source: node.id, target: newId, ...edgeDefaults,
          }))]);
          message.success('成片已合成，请做最后一次人工审核');
        } catch (error: any) {
          message.error(error.message);
        } finally {
          setComposing(false);
        }
      },
    });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey;
      if (!modifier) return;
      const target = event.target as HTMLElement | null;
      const editingText = Boolean(
        target?.isContentEditable || target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA',
      );
      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        doSave(false);
      } else if (editingText) {
        return;
      } else if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [doSave, redo, undo]);

  const modelOptions = useMemo(() => models.map((item) => ({
    value: item.modelId,
    label: `${item.provider} / ${item.modelName}`,
  })), [models]);
  const employeeOptions = useMemo(() => employees.map((employee) => ({
    value: employee.employeeKey,
    label: employee.name,
  })), [employees]);
  const stageOptions = (keys: string[]) => keys.map((key) => ({ value: key, label: STAGE_META[key]?.label || key }));
  const deriveSource = nodes.find((node) => node.id === deriveNodeId);
  const videoSource = nodes.find((node) => node.id === videoSourceId);

  const qualityCounts = useMemo(() => ({
    draft: nodes.filter((node) => (node.data.reviewStatus || 'draft') === 'draft').length,
    review: nodes.filter((node) => node.data.reviewStatus === 'review').length,
    approved: nodes.filter((node) => node.data.reviewStatus === 'approved').length,
    pendingJobs: nodes.filter((node) => node.type === 'video' && node.data.job?.id && !node.data.url).length,
  }), [nodes]);

  const saveLabel = saveStatus === 'saving' ? '正在保存' : saveStatus === 'dirty' ? '有未保存修改' : saveStatus === 'error' ? '保存失败' : '已保存';

  return (
    <div className="canvas-page">
      <section className="canvas-command-deck">
        <div className="canvas-title-block">
          <span className="canvas-kicker">ONE-PERSON CUT ROOM</span>
          <div className="canvas-title-row">
            <Title level={3}>自由画布</Title>
            {currentId && <Tag bordered={false}>{currentName}</Tag>}
          </div>
          <Text>从想法到成片，由你决定每一步；AI 只在你点按钮时介入。</Text>
        </div>

        <div className="canvas-command-main">
          <Space wrap>
            <Select
              value={currentId || undefined}
              aria-label="选择画布"
              onChange={setCurrentId}
              placeholder="选择画布"
              className="canvas-picker"
              options={canvases.map((canvas) => ({
                value: canvas.canvas_id,
                label: `${canvas.name} · ${canvas.nodeCount}`,
              }))}
            />
            <Tooltip title="新建画布"><Button icon={<PlusOutlined />} onClick={() => setNewOpen(true)}>新建</Button></Tooltip>
            <Tooltip title="修改画布名称">
              <Button aria-label="重命名画布" icon={<EditOutlined />} disabled={!currentId} onClick={() => { setRenameName(currentName); setRenameOpen(true); }} />
            </Tooltip>
            <Popconfirm title="删除此画布？此操作不可恢复" onConfirm={handleDelete}>
              <Button aria-label="删除画布" danger icon={<DeleteOutlined />} disabled={!currentId} />
            </Popconfirm>
          </Space>
          <Space wrap>
            <Button icon={<UndoOutlined />} disabled={!historyRef.current.length} onClick={undo}>撤销</Button>
            <Button icon={<RedoOutlined />} disabled={!futureRef.current.length} onClick={redo}>重做</Button>
            <Button icon={<SaveOutlined />} type="primary" disabled={!currentId} onClick={() => doSave(false)}>保存</Button>
          </Space>
        </div>

        <div className="canvas-tool-rail">
          <div className="canvas-tool-group">
            <span>创建</span>
            <Button icon={<FileTextOutlined />} onClick={addDataNode} disabled={!currentId}>文本节点</Button>
            <Button icon={<UploadOutlined />} onClick={() => mediaInputRef.current?.click()} disabled={!currentId}>图片 / 视频</Button>
            <Button icon={<ImportOutlined />} onClick={openImport} disabled={!currentId}>看板数据</Button>
          </div>
          <div className="canvas-tool-group">
            <span>图片生成</span>
            <Select
              value={model || undefined}
              aria-label="选择生图模型"
              onChange={setModel}
              placeholder="选择生图模型"
              className="canvas-model-picker"
              options={modelOptions}
              showSearch
              optionFilterProp="label"
              allowClear
            />
            <Select aria-label="图片尺寸" value={size} onChange={setSize} className="canvas-size-picker" options={IMAGE_SIZES} />
          </div>
          <div className="canvas-tool-group canvas-tool-group-right">
            <span>整理与交付</span>
            <Button icon={<ApartmentOutlined />} disabled={!nodes.length} onClick={autoLayout}>按流程排布</Button>
            <Button icon={<FolderOpenOutlined />} disabled={!currentId} onClick={() => jsonInputRef.current?.click()}>导入备份</Button>
            <Button icon={<ExportOutlined />} disabled={!nodes.length} onClick={exportCanvas}>导出备份</Button>
            <Button type="primary" ghost icon={<VideoCameraOutlined />} loading={composing}
              disabled={!approvedVideos.length} onClick={handleCompose}>合成已通过镜头</Button>
          </div>
        </div>
      </section>

      <section className="canvas-quality-strip" aria-label="画布质量状态">
        {(Object.keys(REVIEW_META) as Array<keyof typeof REVIEW_META>).map((key) => (
          <span key={key} style={{ '--status-color': REVIEW_META[key].color } as React.CSSProperties}>
            <i /> {REVIEW_META[key].label} {qualityCounts[key]}
          </span>
        ))}
        <span><CloudSyncOutlined /> 视频任务 {qualityCounts.pendingJobs}</span>
        <span className={`canvas-save-state is-${saveStatus}`}>
          {saveStatus === 'saved' ? <CloudOutlined /> : <CloudSyncOutlined />}
          {saveLabel}{savedAt && saveStatus === 'saved' ? ` · ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
        </span>
        <Text>只有你标记为“已通过”的视频才会进入成片。</Text>
      </section>

      <input ref={mediaInputRef} type="file" accept="image/*,video/mp4,video/webm" multiple hidden
        onChange={(event) => uploadFiles(event.target.files || [])} />
      <input ref={jsonInputRef} type="file" accept="application/json,.json" hidden
        onChange={(event) => importCanvasFile(event.target.files?.[0])} />

      <div className={`canvas-workspace${dropActive ? ' is-drop-active' : ''}`}>
        {!currentId ? (
          <div className="canvas-empty">
            <Empty description="新建一个画布，把第一条想法放进来" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewOpen(true)}>新建画布</Button>
            </Empty>
          </div>
        ) : loading ? (
          <div className="canvas-loading"><Spin size="large" /></div>
        ) : (
          <CanvasCtx.Provider value={actions}>
            <ReactFlow
              key={currentId}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={(instance) => { flowRef.current = instance; }}
              onNodeDragStart={() => checkpoint()}
              onNodesDelete={() => checkpoint()}
              onDragOver={(event) => { event.preventDefault(); setDropActive(true); }}
              onDragLeave={() => setDropActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDropActive(false);
                if (!event.dataTransfer.files.length) return;
                const position = flowRef.current?.screenToFlowPosition({ x: event.clientX, y: event.clientY });
                uploadFiles(event.dataTransfer.files, position);
              }}
              nodeTypes={nodeTypes}
              nodesFocusable={false}
              deleteKeyCode={['Backspace', 'Delete']}
              fitView
              fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
              minZoom={0.08}
              maxZoom={1.8}
              snapToGrid
              snapGrid={[20, 20]}
              zoomOnDoubleClick={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#d6dde7" gap={20} size={1} />
              <Controls showInteractive={false} />
              <MiniMap
                pannable
                zoomable
                nodeColor={(node) => node.data.reviewStatus === 'approved' ? '#16a34a' : node.type === 'video' ? '#ea580c' : node.type === 'image' ? '#d97706' : '#43566f'}
              />
            </ReactFlow>
            {!nodes.length && (
              <div className="canvas-first-step">
                <span>01</span>
                <strong>写下镜头或拖入素材</strong>
                <Text>文本 → 图片 → 视频 → 人工通过 → 合成</Text>
              </div>
            )}
            {dropActive && <div className="canvas-drop-mask">松手，把素材放到这里</div>}
            <a className="canvas-deerflow-mark" href="https://deerflow.tech" target="_blank" rel="noreferrer">Created By Deerflow</a>
          </CanvasCtx.Provider>
        )}
      </div>

      <Modal title="新建自由画布" open={newOpen} onCancel={() => setNewOpen(false)} onOk={handleCreate} okText="创建" width={420}>
        <Input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="例如：EP01 镜头工作台"
          autoFocus onPressEnter={handleCreate} style={{ marginTop: 12 }} />
      </Modal>

      <Modal title="重命名画布" open={renameOpen} onCancel={() => setRenameOpen(false)} onOk={handleRename} okText="保存名称" width={420}>
        <Input value={renameName} onChange={(event) => setRenameName(event.target.value)} autoFocus
          onPressEnter={handleRename} style={{ marginTop: 12 }} />
      </Modal>

      <Modal
        title={<><BranchesOutlined /> AI 派生{deriveSource ? ` · ${deriveSource.data.title || '未命名节点'}` : ''}</>}
        open={!!deriveNodeId}
        onCancel={() => setDeriveNodeId(null)}
        onOk={handleDerive}
        okText="开始派生"
        width={480}
      >
        <Alert type="info" showIcon message="AI 结果会标记为“待审核”，不会自动进入成片。" style={{ margin: '12px 0' }} />
        <div className="canvas-modal-stack">
          <label>执行员工</label>
          <Select aria-label="执行员工" value={deriveEmp || undefined} onChange={setDeriveEmp} placeholder="选择数字员工"
            options={employeeOptions} showSearch optionFilterProp="label" />
          <label>目标阶段</label>
          <Select aria-label="派生目标阶段" value={deriveStage} onChange={setDeriveStage}
            options={[{ value: '', label: '自由派生（按额外指令）' }, ...stageOptions(DERIVE_STAGES)]} />
          <label>额外指令（可选）</label>
          <TextArea value={deriveInstr} onChange={(event) => setDeriveInstr(event.target.value)} rows={4}
            placeholder="例如：只拆前 10 秒；固定角色服装；镜头运动保持克制……" />
        </div>
      </Modal>

      <Modal
        title={<><VideoCameraOutlined /> 生成视频{videoSource ? ` · ${videoSource.data.title || '当前节点'}` : ''}</>}
        open={!!videoSourceId}
        onCancel={() => setVideoSourceId(null)}
        onOk={handleVideoSubmit}
        okText="提交视频任务"
        confirmLoading={videoSubmitting}
        width={520}
      >
        <Alert type="warning" showIcon message="提交会消耗模型额度。图片节点会自动作为首帧；文本节点走文生视频。" style={{ margin: '12px 0' }} />
        <div className="canvas-modal-stack">
          <label>视频模型</label>
          <Select aria-label="视频模型" value={videoModel || undefined} onChange={setVideoModel} loading={videoModelsLoading}
            placeholder="选择 OpenRouter 视频模型" showSearch optionFilterProp="label"
            options={videoModels.map((item) => ({ value: item.id, label: item.name || item.id }))} />
          <label>视频提示词</label>
          <TextArea value={videoPrompt} onChange={(event) => setVideoPrompt(event.target.value)} rows={5} />
          <div className="canvas-modal-grid">
            <div><label>时长</label><Select aria-label="视频时长" value={videoDuration} onChange={setVideoDuration} options={VIDEO_DURATIONS} /></div>
            <div><label>清晰度</label><Select aria-label="视频清晰度" value={videoResolution} onChange={setVideoResolution} options={VIDEO_RESOLUTIONS} /></div>
            <div><label>画幅</label><Select aria-label="视频画幅" value={videoAspect} onChange={setVideoAspect} options={ASPECT_RATIOS} /></div>
          </div>
          <div className="canvas-switch-row"><span>生成音频</span><Switch checked={videoAudio} onChange={setVideoAudio} /></div>
        </div>
      </Modal>

      <Modal title="从制作看板导入" open={importOpen} onCancel={() => setImportOpen(false)} onOk={handleBoardImport}
        okText={`导入 ${importFiltered.length} 张`} width={500} okButtonProps={{ disabled: !importFiltered.length }}>
        <div className="canvas-modal-stack canvas-modal-top">
          <label>制作项目</label>
          <Select aria-label="导入项目" value={importProject || undefined} onChange={setImportProject} placeholder="选择项目"
            options={projects.map((project) => ({ value: project.project_id, label: project.name }))} />
          <div className="canvas-modal-grid canvas-modal-grid-two">
            <div>
              <label>集数</label>
              <Select aria-label="导入集数" value={importEpisode} onChange={setImportEpisode} loading={importLoading} options={[
                { value: 'all', label: '全部' },
                { value: 'global', label: '全局资产' },
                ...importEpisodes.map((episode) => ({ value: String(episode), label: `EP${String(episode).padStart(2, '0')}` })),
              ]} />
            </div>
            <div>
              <label>阶段</label>
              <Select aria-label="导入阶段" value={importStage || undefined} onChange={(value) => setImportStage(value || '')}
                placeholder="全部阶段" allowClear options={stageOptions(ALL_STAGES)} />
            </div>
          </div>
          <Text type="secondary">命中 {importFiltered.length} 张卡片，导入后仍可逐项手工修改。</Text>
        </div>
      </Modal>

      <Modal title="回写到制作看板" open={!!boardNodeId} onCancel={() => setBoardNodeId(null)} onOk={handleSendToBoard}
        okText="写入" confirmLoading={sendingBoard} width={460}>
        <div className="canvas-modal-stack canvas-modal-top">
          <label>目标项目</label>
          <Select aria-label="目标制作项目" value={boardProject || undefined} onChange={setBoardProject} placeholder="选择制作项目"
            options={projects.map((project) => ({ value: project.project_id, label: project.name }))} />
          <div className="canvas-modal-grid canvas-modal-grid-two">
            <div><label>阶段</label><Select aria-label="回写阶段" value={boardStage || undefined} onChange={setBoardStage} options={stageOptions(ALL_STAGES)} /></div>
            <div><label>集数（留空为全局）</label><Input aria-label="回写集数" type="number" value={boardEpisode} onChange={(event) => setBoardEpisode(event.target.value)} /></div>
          </div>
          <Text type="secondary">未标记“已通过”的节点会以“待审核”状态写入看板。</Text>
        </div>
      </Modal>
    </div>
  );
}
