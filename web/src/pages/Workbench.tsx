// 工作台：与数字员工/团队对话的主界面，含会话管理、附件、产出物与审批。
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Alert, Badge, Button, Collapse, Divider, Drawer, Empty, Image, Input, List, Modal, Popconfirm, Radio, Select, Space, Spin, Tag, Tooltip, Typography, Upload } from 'antd';
import { message } from '../ui';
import {
  CopyOutlined, CheckOutlined,
  DeleteOutlined, FileTextOutlined, InboxOutlined, RobotOutlined,
  SendOutlined, TeamOutlined, UserOutlined, PaperClipOutlined,
  PictureOutlined, CloseCircleFilled, FileOutlined,
  ExpandOutlined, CompressOutlined, BugOutlined,
  ReloadOutlined, StopOutlined, FolderOpenOutlined,
  EditOutlined, PlusOutlined, BookOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInputHabit } from '../hooks/useInputHabit';
import { useResponsive } from '../hooks/useResponsive';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { api } from '../api';
import { COLORS } from '../theme';
import DeepAgentWorkspacePanel from '../components/DeepAgentWorkspacePanel';
import type {
  AgentRunResponse,
  ConversationArtifact,
  DeepAgentWorkspace,
  DeepAgentWorkspaceFile,
  DeepAgentWorkspaceFileView,
  Employee,
  SessionItem,
  Team,
} from '../types';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number } | null;
  traces?: { toolName: string; arguments: string | null; result: string | null; success: boolean }[];
  attachments?: ChatAttachment[];
}

interface ChatAttachment {
  fileId: string;
  fileName: string;
  isImage: boolean;
  url: string;
  textContent?: string;
}

interface QuickPrompt {
  id: string;
  title: string;
  content: string;
  employee_key?: string | null;
  created_at: string;
  updated_at: string;
}

type TargetMode = 'employee' | 'team';

function formatTime(ts: string) {
  try {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return ts; }
}

function firstLine(text?: string | null, max = 80) {
  const raw = (text || '').split('\n').find((l) => l.trim()) || '';
  const clean = raw.replace(/[#*_`>-]/g, '').trim();
  return clean.length > max ? clean.slice(0, max) + '...' : clean;
}

function createRunId() {
  const randomPart = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID().replace(/-/g, '')
    : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  return `run_${randomPart.slice(0, 16).padEnd(16, '0')}`;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  return (
    <Tooltip title={copied ? '已复制' : '复制'}>
      <Button type="text" size="small" icon={copied ? <CheckOutlined style={{ color: COLORS.mint }} /> : <CopyOutlined />}
        aria-label={copied ? '已复制' : '复制回复'}
        onClick={copy} style={{ fontSize: 12, width: 28, height: 28, color: COLORS.slate }} />
    </Tooltip>
  );
}

function CodeBlock({ children, className }: { children?: React.ReactNode; className?: string }) {
  const text = String(children).replace(/\n$/, '');
  const lang = (className || '').replace('language-', '');
  return (
    <div style={{ position: 'relative', margin: '8px 0' }}>
      <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4, alignItems: 'center', zIndex: 1 }}>
        {lang && <span style={{ fontSize: 10, color: '#94a3b8', background: 'rgba(255,255,255,.08)', padding: '1px 6px', borderRadius: 4 }}>{lang}</span>}
        <CopyBtn text={text} />
      </div>
      <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: '14px 16px', borderRadius: 10, overflow: 'auto', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
        <code>{text}</code>
      </pre>
    </div>
  );
}

const mdComponents: Components = {
  code({ children, className, ...props }) {
    const isBlock = className || (typeof children === 'string' && children.includes('\n'));
    if (isBlock) return <CodeBlock className={className}>{children}</CodeBlock>;
    return <code style={{ background: 'rgba(99,102,241,.08)', padding: '1px 5px', borderRadius: 4, fontSize: 13, fontFamily: "'Cascadia Code','Fira Code',Consolas,monospace" }} {...props}>{children}</code>;
  },
  pre({ children }) { return <>{children}</>; },
  a({ href, children, ...props }) {
    if (href && /\.(mp4|webm)(?:[?#].*)?$/i.test(href)) {
      return (
        <video
          controls
          preload="metadata"
          src={href}
          style={{ display: 'block', width: '100%', maxWidth: 560, borderRadius: 10, margin: '10px 0' }}
        >
          {children}
        </video>
      );
    }
    return <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>;
  },
};

const _LATEX_MAP: Record<string, string> = {
  '\\rightarrow': '→', '\\leftarrow': '←', '\\uparrow': '↑', '\\downarrow': '↓',
  '\\Rightarrow': '⇒', '\\Leftarrow': '⇐', '\\leftrightarrow': '↔', '\\Leftrightarrow': '⇔',
  '\\le': '≤', '\\leq': '≤', '\\ge': '≥', '\\geq': '≥', '\\ne': '≠', '\\neq': '≠',
  '\\approx': '≈', '\\sim': '∼', '\\equiv': '≡', '\\pm': '±', '\\mp': '∓',
  '\\times': '×', '\\div': '÷', '\\cdot': '·', '\\infty': '∞',
  '\\ldots': '…', '\\dots': '…', '\\cdots': '⋯',
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\epsilon': 'ε',
  '\\theta': 'θ', '\\lambda': 'λ', '\\mu': 'μ', '\\pi': 'π', '\\sigma': 'σ', '\\omega': 'ω',
  '\\sum': '∑', '\\prod': '∏', '\\int': '∫', '\\partial': '∂', '\\nabla': '∇',
  '\\forall': '∀', '\\exists': '∃', '\\in': '∈', '\\notin': '∉',
  '\\subset': '⊂', '\\supset': '⊃', '\\cup': '∪', '\\cap': '∩',
  '\\emptyset': '∅', '\\neg': '¬', '\\land': '∧', '\\lor': '∨',
  '\\star': '★', '\\bullet': '•', '\\circ': '∘', '\\degree': '°',
  '\\checkmark': '✓', '\\triangle': '△', '\\square': '□',
};
const _CMD_RE = new RegExp(
  '(' + Object.keys(_LATEX_MAP).map(k => k.replace(/\\/g, '\\\\')).join('|') + ')(?=[^a-zA-Z]|$)',
  'g',
);
function cleanLatex(text: string): string {
  return text.replace(/\$([^$]+)\$/g, (_, inner: string) => {
    const cleaned = inner.replace(_CMD_RE, (cmd: string) => _LATEX_MAP[cmd] || cmd);
    return cleaned;
  });
}

export default function Workbench() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [mode, setMode] = useInputHabit<TargetMode>('workbench.target-mode', 'employee');
  const [selectedKey, setSelectedKey] = useInputHabit('workbench.target', '');
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [artifacts, setArtifacts] = useState<ConversationArtifact[]>([]);
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<ConversationArtifact | null>(null);
  const [workspace, setWorkspace] = useState<DeepAgentWorkspace | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');
  const [workspaceDrawerOpen, setWorkspaceDrawerOpen] = useState(false);
  const [workspaceFileOpen, setWorkspaceFileOpen] = useState(false);
  const [workspaceFileLoading, setWorkspaceFileLoading] = useState(false);
  const [activeWorkspaceFile, setActiveWorkspaceFile] = useState<DeepAgentWorkspaceFileView | null>(null);
  const [inputValue, setInputValue] = useInputHabit('workbench.message-draft', '');
  const [loading, setLoading] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [stoppingRun, setStoppingRun] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState('');
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [targetsError, setTargetsError] = useState('');
  const [showArchived, setShowArchived] = useInputHabit('workbench.show-archived', false);
  const [pendingFiles, setPendingFiles] = useState<ChatAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useInputHabit('workbench.right-collapsed', false);
  const [traceDrawerOpen, setTraceDrawerOpen] = useState(false);
  const [activeTraces, setActiveTraces] = useState<ChatMessage['traces']>([]);
  const [quickPrompts, setQuickPrompts] = useState<QuickPrompt[]>([]);
  const [quickPromptsLoading, setQuickPromptsLoading] = useState(true);
  const [quickPromptsError, setQuickPromptsError] = useState('');
  const [quickPromptOpen, setQuickPromptOpen] = useState(false);
  const [quickPromptSaving, setQuickPromptSaving] = useState(false);
  const [editingQuickPromptId, setEditingQuickPromptId] = useState<string | null>(null);
  const [quickPromptForm, setQuickPromptForm] = useState({ title: '', content: '', employee_key: '' });
  const abortRef = useRef<AbortController | null>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<any>(null);
  const quickPromptRequestRef = useRef(0);
  const workspaceRequestRef = useRef(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  const loadTargets = useCallback(async () => {
    setTargetsLoading(true);
    setTargetsError('');
    const [employeeResult, teamResult] = await Promise.allSettled([
      api.listAgentEmployees(),
      api.listTeams(),
    ]);
    if (employeeResult.status === 'fulfilled') setEmployees(employeeResult.value);
    else setEmployees([]);
    if (teamResult.status === 'fulfilled') setTeams(teamResult.value);
    else setTeams([]);
    if (employeeResult.status === 'rejected' && teamResult.status === 'rejected') {
      setTargetsError('暂时无法加载数字员工和团队，请稍后重试。');
    } else if (employeeResult.status === 'rejected') {
      setTargetsError('数字员工列表暂时无法加载，团队仍可使用。');
    } else if (teamResult.status === 'rejected') {
      setTargetsError('团队列表暂时无法加载，数字员工仍可使用。');
    }
    setTargetsLoading(false);
  }, []);

  const loadQuickPrompts = useCallback(async () => {
    const requestId = ++quickPromptRequestRef.current;
    setQuickPromptsLoading(true);
    setQuickPromptsError('');
    try {
      const items = await api.listQuickPrompts();
      if (requestId !== quickPromptRequestRef.current) return;
      setQuickPrompts(items);
    } catch {
      if (requestId !== quickPromptRequestRef.current) return;
      setQuickPrompts([]);
      setQuickPromptsError('常用指令暂时无法加载，你仍然可以正常输入消息。');
    } finally {
      if (requestId === quickPromptRequestRef.current) setQuickPromptsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTargets();
  }, [loadTargets]);
  useEffect(() => {
    void loadQuickPrompts();
    return () => { quickPromptRequestRef.current += 1; };
  }, [loadQuickPrompts]);

  useEffect(() => {
    const team = searchParams.get('team');
    const employee = searchParams.get('employee');
    if (team && teams.some((t) => t.teamCode === team)) { setMode('team'); setSelectedKey(team); return; }
    if (employee && employees.some((e) => e.employeeKey === employee)) { setMode('employee'); setSelectedKey(employee); }
  }, [employees, teams, searchParams]);

  useEffect(() => {
    if (targetsLoading) return;
    const available = mode === 'team'
      ? teams.map(team => team.teamCode)
      : employees.map(employee => employee.employeeKey);
    if (available.length && !available.includes(selectedKey)) {
      setSelectedKey(available[0]);
    }
  }, [employees, mode, selectedKey, setSelectedKey, targetsLoading, teams]);

  const selectedEmployee = employees.find((e) => e.employeeKey === selectedKey);
  const selectedTeam = teams.find((t) => t.teamCode === selectedKey);
  const teamMembers = useMemo(() => {
    if (!selectedTeam) return [];
    return (selectedTeam.memberEmployeeKeys || []).map((k) => employees.find((e) => e.employeeKey === k)).filter(Boolean) as Employee[];
  }, [employees, selectedTeam]);
  const leaderKey = selectedTeam?.leaderEmployeeKey || selectedTeam?.defaultEmployeeKey || selectedTeam?.memberEmployeeKeys?.[0];
  const leader = employees.find((e) => e.employeeKey === leaderKey);
  const targetReady = mode === 'team' ? !!selectedTeam : !!selectedEmployee;
  const targetName = mode === 'team' ? selectedTeam?.name : selectedEmployee?.name;

  const refreshSessions = async () => {
    if (!selectedKey) { setSessions([]); setSessionsError(''); return; }
    setSessionsLoading(true);
    setSessionsError('');
    try {
      const data = mode === 'team'
        ? await api.listTeamSessions(selectedKey, 50, true)
        : await api.listSessions(selectedKey, 50, true);
      setSessions(data);
    } catch {
      setSessionsError('暂时无法加载会话记录，请稍后重试。');
    }
    finally { setSessionsLoading(false); }
  };

  useEffect(() => { refreshSessions(); }, [mode, selectedKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const clearWorkspace = () => {
    workspaceRequestRef.current += 1;
    setWorkspace(null);
    setWorkspaceLoading(false);
    setWorkspaceError('');
    setWorkspaceDrawerOpen(false);
    setWorkspaceFileOpen(false);
    setActiveWorkspaceFile(null);
  };

  const loadWorkspace = async (sid: string) => {
    const requestId = ++workspaceRequestRef.current;
    setWorkspaceLoading(true);
    setWorkspaceError('');
    try {
      const data = await api.getSessionWorkspace(sid);
      if (requestId === workspaceRequestRef.current) setWorkspace(data);
    } catch {
      if (requestId === workspaceRequestRef.current) {
        setWorkspace(null);
        setWorkspaceError('暂时无法读取这个会话的工作区，请稍后重试。');
      }
    } finally {
      if (requestId === workspaceRequestRef.current) setWorkspaceLoading(false);
    }
  };

  const updateRoute = (m: TargetMode, k: string) => {
    if (!k) { setSearchParams({}, { replace: true }); return; }
    setSearchParams(m === 'team' ? { team: k } : { employee: k }, { replace: true });
  };
  const handleModeChange = (m: TargetMode) => { setMode(m); setSelectedKey(''); setSessionId(null); setMessages([]); setArtifacts([]); setPendingFiles([]); clearWorkspace(); updateRoute(m, ''); };
  const handleSelectTarget = (k: string) => { setSelectedKey(k); setSessionId(null); setMessages([]); setArtifacts([]); setPendingFiles([]); clearWorkspace(); updateRoute(mode, k); };
  const handleNewChat = () => { setSessionId(null); setMessages([]); setArtifacts([]); setPendingFiles([]); clearWorkspace(); };

  const handleLoadSession = (s: SessionItem) => {
    setSessionId(s.sessionId);
    setMessages((s.messages || []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content, timestamp: m.timestamp })));
    setArtifacts(s.artifacts || []);
    setPendingFiles([]);
    clearWorkspace();
    void loadWorkspace(s.sessionId);
  };

  const handleArchiveSession = async (sid: string, archived: boolean) => {
    try {
      const updated = await api.archiveSession(sid, archived);
      setSessions((prev) => prev.map((s) => s.sessionId === sid ? updated : s));
      if (sessionId === sid && archived) { setSessionId(null); setMessages([]); setArtifacts([]); clearWorkspace(); }
      message.success(archived ? '已归档' : '已恢复');
    } catch (e: any) { message.error(e.message); }
  };

  const handleDeleteSession = async (sid: string) => {
    try {
      await api.deleteSession(sid);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sid));
      if (sessionId === sid) { setSessionId(null); setMessages([]); setArtifacts([]); clearWorkspace(); }
      message.success('已删除');
    } catch (e: any) { message.error(e.message); }
  };

  const hydrateSession = async (sid: string) => {
    try {
      const detail = await api.getSession(sid);
      setArtifacts(detail.artifacts || []);
      void loadWorkspace(sid);
      setSessions((prev) => {
        const exists = prev.some((s) => s.sessionId === sid);
        if (exists) return prev.map((s) => s.sessionId === sid ? detail : s);
        return [detail, ...prev];
      });
    } catch { refreshSessions(); }
  };

  const openWorkspaceFile = async (file: DeepAgentWorkspaceFile) => {
    if (!sessionId) return;
    setActiveWorkspaceFile(null);
    setWorkspaceFileOpen(true);
    setWorkspaceFileLoading(true);
    try {
      const detail = await api.getSessionWorkspaceFile(sessionId, file.path);
      setActiveWorkspaceFile(detail);
    } catch {
      setWorkspaceFileOpen(false);
      message.error('文件暂时无法读取，请刷新工作区后重试。');
    } finally {
      setWorkspaceFileLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { message.error('文件不能超过 10 MB'); return; }
    setUploading(true);
    try {
      const r = await api.uploadFile(file);
      setPendingFiles((prev) => [...prev, { fileId: r.fileId, fileName: r.fileName, isImage: r.isImage, url: r.url, textContent: r.textContent }]);
    } catch (e: any) { message.error(e.message); }
    finally { setUploading(false); }
  };

  const removePendingFile = (fileId: string) => setPendingFiles((prev) => prev.filter((f) => f.fileId !== fileId));

  const handleSend = async () => {
    const text = inputValue.trim();
    if ((!text && pendingFiles.length === 0) || !targetReady || loading) return;

    let extraContext = '';
    if (pendingFiles.length > 0) {
      const parts = pendingFiles.map((f) => {
        if (f.isImage) return `[用户上传了图片: ${f.fileName}，链接: ${f.url}]`;
        if (f.textContent) return `[用户上传了文件: ${f.fileName}]\n\`\`\`\n${f.textContent.slice(0, 8000)}\n\`\`\``;
        return `[用户上传了文件: ${f.fileName}，链接: ${f.url}]`;
      });
      extraContext = parts.join('\n\n');
    }

    const displayContent = text + (pendingFiles.length > 0 ? '\n' + pendingFiles.map((f) => `📎 ${f.fileName}`).join('\n') : '');
    const userMsg: ChatMessage = { role: 'user', content: displayContent, timestamp: new Date().toISOString(), attachments: [...pendingFiles] };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    const filesToSend = [...pendingFiles];
    setPendingFiles([]);
    setLoading(true);
    setStoppingRun(false);
    const runId = createRunId();
    setActiveRunId(runId);

    try {
      const payload: any = {
        employeeKey: selectedKey,
        userInput: text || '请查看附件',
        sessionId: sessionId || undefined,
        runId,
      };
      if (extraContext) payload.extraContext = extraContext;

      const res: AgentRunResponse = mode === 'team'
        ? await api.runTeam({
            teamCode: selectedKey,
            userInput: text || '请查看附件',
            sessionId: sessionId || undefined,
            extraContext: extraContext || undefined,
            runId,
          })
        : await api.runAgent(payload);

      const assistantMsg: ChatMessage = {
        role: 'assistant', content: res.assistantMessage, timestamp: new Date().toISOString(),
        tokenUsage: res.tokenUsage, traces: res.traces?.length ? res.traces : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (res.cancelled) message.info('当前运行已安全停止。');
      if (res.sessionId) { setSessionId(res.sessionId); hydrateSession(res.sessionId); }
    } catch (e: any) { message.error(e.message); }
    finally {
      setLoading(false);
      setActiveRunId(null);
      setStoppingRun(false);
    }
  };

  const handleStopRun = async () => {
    if (!activeRunId || stoppingRun) return;
    setStoppingRun(true);
    try {
      const observation = await api.cancelAgentRun(activeRunId);
      message.info(observation.summary);
    } catch (e: any) {
      setStoppingRun(false);
      message.error(e.message || '停止运行失败，请稍后重试。');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const insertMention = (emp: Employee) => setInputValue((prev) => prev.endsWith(' ') || !prev ? prev + `@${emp.name} ` : `${prev} @${emp.name} `);

  const insertQuickPrompt = (prompt: QuickPrompt) => {
    const textArea = composerRef.current?.resizableTextArea?.textArea as HTMLTextAreaElement | undefined;
    const start = textArea?.selectionStart ?? inputValue.length;
    const end = textArea?.selectionEnd ?? inputValue.length;
    const needsSpacing = start > 0 && inputValue.slice(0, start).trim() ? '\n\n' : '';
    const inserted = `${needsSpacing}${prompt.content}`;
    const nextValue = inputValue.slice(0, start) + inserted + inputValue.slice(end);
    const nextCursor = start + inserted.length;
    setInputValue(nextValue);
    window.setTimeout(() => {
      textArea?.focus();
      textArea?.setSelectionRange(nextCursor, nextCursor);
    }, 0);
  };

  const openNewQuickPrompt = () => {
    const content = inputValue.trim();
    setEditingQuickPromptId(null);
    setQuickPromptForm({
      title: firstLine(content, 24),
      content,
      employee_key: mode === 'employee' ? selectedKey : '',
    });
    setQuickPromptOpen(true);
  };

  const openEditQuickPrompt = (prompt: QuickPrompt) => {
    setEditingQuickPromptId(prompt.id);
    setQuickPromptForm({
      title: prompt.title,
      content: prompt.content,
      employee_key: prompt.employee_key || '',
    });
    setQuickPromptOpen(true);
  };

  const handleSaveQuickPrompt = async () => {
    const title = quickPromptForm.title.trim();
    const content = quickPromptForm.content.trim();
    if (!title || !content) {
      message.warning('请填写指令名称和内容');
      return;
    }
    setQuickPromptSaving(true);
    try {
      const payload = {
        title,
        content,
        // 编辑时也要显式发送空字符串，否则 JSON.stringify 会丢掉 undefined，
        // 后端便无法把“仅某员工可用”改回“所有员工通用”。
        employee_key: quickPromptForm.employee_key,
      };
      if (editingQuickPromptId) {
        const updated = await api.updateQuickPrompt(editingQuickPromptId, payload);
        setQuickPrompts(prev => prev.map(item => item.id === updated.id ? updated : item));
        message.success('常用指令已更新');
      } else {
        const created = await api.createQuickPrompt(payload);
        setQuickPrompts(prev => [created, ...prev]);
        message.success('已保存为常用指令');
      }
      setQuickPromptsError('');
      setQuickPromptOpen(false);
    } catch {
      message.error('常用指令暂时无法保存，请稍后重试。');
    } finally {
      setQuickPromptSaving(false);
    }
  };

  const handleDeleteQuickPrompt = async (id: string) => {
    try {
      await api.deleteQuickPrompt(id);
      setQuickPrompts(prev => prev.filter(item => item.id !== id));
      if (editingQuickPromptId === id) {
        setEditingQuickPromptId(null);
        setQuickPromptForm({ title: '', content: '', employee_key: mode === 'employee' ? selectedKey : '' });
      }
      message.success('常用指令已删除');
    } catch {
      message.error('暂时无法删除这条常用指令，请稍后重试。');
    }
  };

  const activeSessions = sessions.filter((s) => !s.archived);
  const archivedSessions = sessions.filter((s) => s.archived);
  const visibleSessions = showArchived ? archivedSessions : activeSessions;
  const targetOptions = mode === 'team'
    ? teams.map((t) => ({ label: `${t.name} (${(t.memberEmployeeKeys || []).length}人)`, value: t.teamCode }))
    : employees.map((e) => ({ label: e.name, value: e.employeeKey }));
  const applicableQuickPrompts = useMemo(
    () => quickPrompts.filter(prompt => !prompt.employee_key || (mode === 'employee' && prompt.employee_key === selectedKey)),
    [quickPrompts, mode, selectedKey],
  );

  const rightWidth = rightCollapsed ? 0 : 320;
  const hasWorkspacePanel = !!sessionId && (
    workspaceLoading
    || !!workspaceError
    || workspace?.checkpointVersion != null
    || workspace?.status === 'warning'
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? 'calc(100dvh - 16px)' : 'calc(100vh - 56px)',
      minHeight: 0,
      gap: isMobile ? 6 : 10,
    }}>
      <section
        aria-label="工作台用途说明"
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 4 : 16,
          padding: isMobile ? '8px 10px' : '9px 14px',
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Text strong style={{ display: 'block', color: '#1e293b' }}>找数字员工处理通用任务</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isMobile
              ? '在手机上也能聊；制作漫剧请切到「快速制作」。'
              : '制作之外的事，也可以找数字员工帮忙——翻译、调研、写文案或处理其他日常工作。'}
          </Text>
        </div>
        <Button type="link" size="small" onClick={() => navigate('/studio')} style={{ flexShrink: 0, paddingInline: 4 }}>
          要制作漫剧？去快速制作
        </Button>
      </section>

      <div className="wb-root" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        flex: 1,
        minHeight: 0,
        background: COLORS.canvas,
        borderRadius: isMobile ? 10 : 14,
        overflow: 'hidden',
        border: `1px solid ${COLORS.border}`,
      }}>

      {/* ── Left: selector + sessions ── */}
      <div className="wb-left" style={{
        width: isMobile ? '100%' : 260,
        flexShrink: 0,
        background: '#fff',
        borderRight: isMobile ? 'none' : `1px solid ${COLORS.border}`,
        borderBottom: isMobile ? `1px solid ${COLORS.border}` : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: isMobile ? '8px 10px' : '16px 14px 12px', borderBottom: isMobile ? 'none' : `1px solid ${COLORS.border}` }}>
          {targetsLoading && (
            <div role="status" aria-live="polite" style={{ textAlign: 'center', marginBottom: 10 }}>
              <Spin size="small" /> <Text type="secondary" style={{ fontSize: 12 }}>正在加载可选对象…</Text>
            </div>
          )}
          {targetsError && (
            <Alert
              role="alert"
              type="warning"
              showIcon
              message={targetsError}
              action={<Button type="link" size="small" onClick={loadTargets}>重试</Button>}
              style={{ marginBottom: 10, padding: '6px 8px' }}
            />
          )}
          <Radio.Group value={mode} onChange={(e) => handleModeChange(e.target.value)} buttonStyle="solid" style={{ width: '100%', display: 'flex', marginBottom: isMobile ? 6 : 10 }}>
            <Radio.Button value="employee" style={{ flex: 1, textAlign: 'center', fontSize: 13 }}><UserOutlined /> 员工</Radio.Button>
            <Radio.Button value="team" style={{ flex: 1, textAlign: 'center', fontSize: 13 }}><TeamOutlined /> 团队</Radio.Button>
          </Radio.Group>
          <div style={{ display: 'flex', gap: 6 }}>
            <Select style={{ flex: 1, minWidth: 0 }} placeholder={mode === 'team' ? '选择团队' : '选择数字员工'} value={selectedKey || undefined} onChange={handleSelectTarget} options={targetOptions} showSearch optionFilterProp="label" />
            <Button onClick={handleNewChat} disabled={!targetReady} style={{ borderRadius: 8, fontWeight: 500, flexShrink: 0 }}>+ 新会话</Button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '10px 10px', display: isMobile ? 'none' : 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 4px' }}>
            <Text strong style={{ fontSize: 12, color: COLORS.slate }}>会话记录</Text>
            <Radio.Group size="small" value={showArchived ? 'a' : 'c'} onChange={(e) => setShowArchived(e.target.value === 'a')}>
              <Radio.Button value="c" style={{ fontSize: 11, padding: '0 8px' }}>活跃 {activeSessions.length}</Radio.Button>
              <Radio.Button value="a" style={{ fontSize: 11, padding: '0 8px' }}>归档 {archivedSessions.length}</Radio.Button>
            </Radio.Group>
          </div>
          {sessionsLoading ? <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: 24 }}><Spin size="small" /><Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>正在加载会话记录…</Text></div>
            : sessionsError ? (
              <Alert
                role="alert"
                type="error"
                showIcon
                message="会话记录加载失败"
                description={sessionsError}
                action={<Button size="small" onClick={refreshSessions}>重试</Button>}
                style={{ marginTop: 12 }}
              />
            )
            : visibleSessions.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={showArchived ? '暂无归档' : '暂无历史'} style={{ marginTop: 40 }} />
            : visibleSessions.map((s) => {
              const isActive = s.sessionId === sessionId;
              const preview = s.title || s.messages?.[0]?.content?.slice(0, 50) || '(空会话)';
              return (
                <div key={s.sessionId} className="wb-session-item" onClick={() => handleLoadSession(s)}
                  role="button" tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleLoadSession(s);
                    }
                  }}
                  style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 4, background: isActive ? `${COLORS.iris}0c` : 'transparent', border: isActive ? `1px solid ${COLORS.iris}30` : '1px solid transparent', transition: 'all .15s' }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>{formatTime(s.lastActiveAt || s.createdAt)}</Text>
                    <Space size={2}>
                      <Button type="text" size="small" icon={<InboxOutlined />} aria-label={s.archived ? '恢复会话' : '归档会话'} style={{ fontSize: 12, width: 24, height: 24 }} onClick={(e) => { e.stopPropagation(); handleArchiveSession(s.sessionId, !s.archived); }} />
                      <Popconfirm title="确定删除？" onConfirm={(e) => { e?.stopPropagation(); handleDeleteSession(s.sessionId); }} okText="删除" cancelText="取消">
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label="删除会话" style={{ fontSize: 12, width: 24, height: 24 }} onClick={(e) => e.stopPropagation()} />
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ── Center: chat ── */}
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', background: COLORS.canvas }}>
        {/* Chat header */}
        <div style={{
          minHeight: isMobile ? 48 : 56,
          background: '#fff',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '6px 10px' : '0 20px',
          flexShrink: 0,
        }}>
          <Space size={12}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${COLORS.iris}10`, color: COLORS.iris, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              {mode === 'team' ? <TeamOutlined /> : <RobotOutlined />}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#1e293b', lineHeight: 1.3 }}>{targetName || '选择会话对象'}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {mode === 'team' ? `${teamMembers.length} 名成员${leader ? ` · 负责人 ${leader.name}` : ''}` : selectedEmployee?.employeeKey || ''}
              </Text>
            </div>
          </Space>
          <Space size={8}>
            {sessionId && <Tag style={{ fontSize: 11, borderRadius: 6 }}>{sessionId.slice(0, 8)}</Tag>}
            {isMobile && hasWorkspacePanel && (
              <Button
                type="text"
                size="small"
                icon={<FolderOpenOutlined />}
                aria-label="查看 DeepAgent 工作区"
                onClick={() => setWorkspaceDrawerOpen(true)}
              />
            )}
            {!isMobile && <Tooltip title={rightCollapsed ? '展开面板' : '收起面板'}>
              <Button type="text" size="small" icon={rightCollapsed ? <ExpandOutlined /> : <CompressOutlined />} aria-label={rightCollapsed ? '展开辅助面板' : '收起辅助面板'} onClick={() => setRightCollapsed(!rightCollapsed)} />
            </Tooltip>}
          </Space>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '12px 10px' : '24px 28px' }}>
          {!targetReady ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Empty image={<img src="/empty-connect.svg" alt="" width={160} />} description={mode === 'team' ? '选择一个团队开始协作' : '选择一个数字员工开始对话'} />
            </div>
          ) : messages.length === 0 && !loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: `${COLORS.iris}10`, color: COLORS.iris, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>
                  <RobotOutlined />
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>{targetName}</div>
                <Text type="secondary">输入消息开始对话，支持上传图片和文件</Text>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={i} className="wb-msg-row" style={{ display: 'flex', marginBottom: 20, justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 10 }}>
                    {!isUser && (
                      <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: `${COLORS.iris}10`, color: COLORS.iris, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                        <RobotOutlined />
                      </div>
                    )}
                    <div style={{ maxWidth: isMobile ? '86%' : '72%', minWidth: 60 }}>
                      <div className={isUser ? 'wb-bubble-user' : 'wb-bubble-ai'} style={{
                        padding: '12px 16px', fontSize: 14, lineHeight: 1.7, wordBreak: 'break-word',
                        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isUser ? COLORS.iris : '#fff',
                        color: isUser ? '#fff' : '#1e293b',
                        border: isUser ? 'none' : `1px solid ${COLORS.border}`,
                        boxShadow: isUser ? '0 2px 8px rgba(99,102,241,.2)' : '0 1px 4px rgba(0,0,0,.03)',
                      }}>
                        {isUser ? (
                          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        ) : (
                          <div className="wb-markdown"><ReactMarkdown components={mdComponents}>{cleanLatex(msg.content)}</ReactMarkdown></div>
                        )}
                      </div>
                      {/* Attachments with image preview */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                          {msg.attachments.map((a) => a.isImage ? (
                            <Image key={a.fileId} src={a.url} alt={a.fileName} width={120} style={{ borderRadius: 8, objectFit: 'cover' }} />
                          ) : (
                            <Tag key={a.fileId} icon={<FileOutlined />} style={{ fontSize: 11, borderRadius: 6 }}>{a.fileName}</Tag>
                          ))}
                        </div>
                      )}
                      {/* Action bar for AI messages */}
                      {!isUser && (
                        <div className="wb-msg-actions" style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 4, opacity: 0, transition: 'opacity .15s' }}>
                          <CopyBtn text={msg.content} />
                          {msg.tokenUsage && (
                            <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                              本次模型用量 {msg.tokenUsage.totalTokens}
                            </Text>
                          )}
                          {msg.traces && msg.traces.length > 0 && (
                            <Tooltip title="查看执行详情">
                              <Button type="text" size="small" icon={<BugOutlined />} style={{ fontSize: 12, width: 28, height: 28, color: COLORS.slate }}
                                aria-label="查看这条回复的执行详情"
                                onClick={() => { setActiveTraces(msg.traces!); setTraceDrawerOpen(true); }} />
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </div>
                    {isUser && (
                      <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: `${COLORS.iris}18`, color: COLORS.iris, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                        <UserOutlined />
                      </div>
                    )}
                  </div>
                );
              })}
              {loading && (
                <div role="status" aria-live="polite" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${COLORS.iris}10`, color: COLORS.iris, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RobotOutlined /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ padding: '12px 16px', background: '#fff', borderRadius: '16px 16px 16px 4px', border: `1px solid ${COLORS.border}` }}>
                      <Spin size="small" /> <Text type="secondary" style={{ marginLeft: 6, fontSize: 13 }}>思考中...</Text>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={msgEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: isMobile ? '8px 8px 10px' : '12px 20px 16px', background: '#fff', borderTop: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
          {/* @ mentions for team */}
          {mode === 'team' && teamMembers.length > 0 && (
            <Space size={4} wrap style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>@成员</Text>
              {teamMembers.map((emp) => (
                <Tag key={emp.employeeKey} style={{ cursor: 'pointer', fontSize: 12 }} onClick={() => insertMention(emp)}>@{emp.name}</Tag>
              ))}
            </Space>
          )}
          {/* 常用指令：点击即插入当前光标位置，仍可继续补充上下文。 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 8,
            minWidth: 0,
            overflowX: 'auto',
            paddingBottom: 1,
          }}>
            <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              <BookOutlined /> 常用指令
            </Text>
            {quickPromptsLoading ? (
              <Spin size="small" />
            ) : applicableQuickPrompts.length > 0 ? (
              applicableQuickPrompts.slice(0, isMobile ? 4 : 8).map(prompt => (
                <Tooltip key={prompt.id} title={prompt.content}>
                  <Button
                    size="small"
                    type="dashed"
                    onClick={() => insertQuickPrompt(prompt)}
                    style={{ flexShrink: 0, maxWidth: isMobile ? 130 : 180, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {prompt.title}
                  </Button>
                </Tooltip>
              ))
            ) : (
              <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>还没有保存</Text>
            )}
            <Button
              size="small"
              type="text"
              icon={<PlusOutlined />}
              disabled={!inputValue.trim()}
              onClick={openNewQuickPrompt}
              style={{ flexShrink: 0 }}
            >
              保存当前
            </Button>
            <Button
              size="small"
              type="link"
              onClick={() => {
                setEditingQuickPromptId(null);
                setQuickPromptForm({ title: '', content: '', employee_key: mode === 'employee' ? selectedKey : '' });
                setQuickPromptOpen(true);
              }}
              style={{ flexShrink: 0 }}
            >
              管理
            </Button>
          </div>
          {quickPromptsError && (
            <Alert
              type="warning"
              showIcon
              message={quickPromptsError}
              action={<Button size="small" onClick={loadQuickPrompts}>重试</Button>}
              style={{ marginBottom: 8, padding: '5px 8px' }}
            />
          )}
          {/* Pending files */}
          {pendingFiles.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8, padding: '8px 10px', background: '#f8f9fc', borderRadius: 10 }}>
              {pendingFiles.map((f) => (
                <Tag key={f.fileId} closable onClose={() => removePendingFile(f.fileId)} icon={f.isImage ? <PictureOutlined /> : <FileOutlined />} style={{ borderRadius: 6 }}>
                  {f.fileName}
                </Tag>
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '40px minmax(0, 1fr) auto', gap: isMobile ? 6 : 8, alignItems: 'flex-end' }}>
            <Upload beforeUpload={(file) => { handleUpload(file as File); return false; }} showUploadList={false} multiple accept="*/*">
              <Tooltip title="上传图片/文件">
                <Button icon={<PaperClipOutlined />} aria-label="上传图片或文件" loading={uploading} disabled={!targetReady || loading} style={{ borderRadius: 10, height: 40, width: 40 }} />
              </Tooltip>
            </Upload>
            <TextArea
              ref={composerRef}
              value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={targetReady ? '输入消息，Enter 发送，Shift+Enter 换行' : '请先选择对象'}
              autoSize={{ minRows: 1, maxRows: 5 }} disabled={!targetReady || loading}
              style={{ flex: 1, borderRadius: 10 }}
            />
            {loading ? (
              <Button
                danger
                icon={<StopOutlined />}
                onClick={handleStopRun}
                loading={stoppingRun}
                disabled={!activeRunId}
                style={{ borderRadius: 10, height: 40, fontWeight: 500 }}
              >
                {isMobile ? null : stoppingRun ? '正在停止' : '停止'}
              </Button>
            ) : (
              <Button type="primary" icon={<SendOutlined />} onClick={handleSend}
                disabled={!targetReady || (!inputValue.trim() && pendingFiles.length === 0)}
                style={{ borderRadius: 10, height: 40, fontWeight: 500 }}>
                {isMobile ? null : '发送'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: context + artifacts ── */}
      <div style={{ width: rightWidth, flexShrink: 0, background: '#fff', borderLeft: `1px solid ${COLORS.border}`, overflow: 'auto', transition: 'width .2s', display: isMobile || rightCollapsed ? 'none' : 'block' }}>
        {/* Context */}
        <div style={{ padding: '18px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
          <Text strong style={{ fontSize: 13, color: COLORS.slate, marginBottom: 10, display: 'block' }}>上下文</Text>
          {mode === 'team' ? (
            <>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 10 }}>
                团队会话由负责人统一回应，可通过 @ 指定成员参与。
              </Text>
              <div style={{ fontSize: 12, color: COLORS.slate, marginBottom: 6 }}>负责人</div>
              {leader ? <Tag color="purple">{leader.name}</Tag> : <Text type="secondary" style={{ fontSize: 12 }}>未设置</Text>}
              <div style={{ fontSize: 12, color: COLORS.slate, margin: '12px 0 6px' }}>成员</div>
              <Space size={4} wrap>{teamMembers.map((e) => <Tag key={e.employeeKey}>{e.name}</Tag>)}</Space>
            </>
          ) : selectedEmployee ? (
            <>
              <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>{firstLine(selectedEmployee.roleProfile) || '暂无描述'}</Paragraph>
              <Space size={4} wrap>
                {(selectedEmployee.tags || []).map((t) => <Tag key={t} style={{ fontSize: 11 }}>{t}</Tag>)}
                {selectedEmployee.hasKnowledgeBase && <Tag color="green" style={{ fontSize: 11 }}>知识库</Tag>}
                {selectedEmployee.deepAgent && <Tag color="purple" style={{ fontSize: 11 }}>DeepAgent</Tag>}
              </Space>
            </>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="选择对象后查看" style={{ marginTop: 20 }} />
          )}
        </div>

        {hasWorkspacePanel && (
          <DeepAgentWorkspacePanel
            workspace={workspace}
            loading={workspaceLoading}
            error={workspaceError}
            onRetry={() => sessionId && void loadWorkspace(sessionId)}
            onOpenFile={openWorkspaceFile}
          />
        )}

        {/* Artifacts */}
        <div style={{ padding: '14px 16px' }}>
          <Text strong style={{ fontSize: 13, color: COLORS.slate, marginBottom: 8, display: 'block' }}>
            产出物 {artifacts.length > 0 && <Badge count={artifacts.length} style={{ backgroundColor: COLORS.iris, marginLeft: 6 }} />}
          </Text>
          {artifacts.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="AI 回复中的代码块和长文档会自动收集" style={{ marginTop: 20 }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {artifacts.map((a) => (
                <div key={a.artifactId} onClick={() => { setActiveArtifact(a); setArtifactOpen(true); }}
                  style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${COLORS.border}`, transition: 'background .15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f8f9fc'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ''; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileTextOutlined style={{ color: COLORS.iris, fontSize: 14 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                      <Text type="secondary" style={{ fontSize: 11 }}>{a.kind} · {formatTime(a.createdAt)}</Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        title={editingQuickPromptId ? '编辑常用指令' : '管理常用指令'}
        open={quickPromptOpen}
        onCancel={() => {
          if (!quickPromptSaving) setQuickPromptOpen(false);
        }}
        onOk={handleSaveQuickPrompt}
        okText={editingQuickPromptId ? '保存修改' : '新增指令'}
        cancelText="关闭"
        confirmLoading={quickPromptSaving}
        okButtonProps={{ disabled: !quickPromptForm.title.trim() || !quickPromptForm.content.trim() }}
        width={isMobile ? 'calc(100vw - 24px)' : 620}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>指令名称</Text>
            <Input
              value={quickPromptForm.title}
              onChange={event => setQuickPromptForm(prev => ({ ...prev, title: event.target.value }))}
              placeholder="例如：把台词改得更口语"
              maxLength={60}
              style={{ marginTop: 4 }}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>指令内容</Text>
            <TextArea
              value={quickPromptForm.content}
              onChange={event => setQuickPromptForm(prev => ({ ...prev, content: event.target.value }))}
              placeholder="输入以后可以一键插入的完整指令"
              autoSize={{ minRows: 3, maxRows: 7 }}
              maxLength={4000}
              showCount
              style={{ marginTop: 4 }}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>适用员工（可选）</Text>
            <Select
              value={quickPromptForm.employee_key || undefined}
              onChange={value => setQuickPromptForm(prev => ({ ...prev, employee_key: value || '' }))}
              placeholder="所有数字员工都可用"
              allowClear
              showSearch
              optionFilterProp="label"
              options={employees.map(employee => ({ value: employee.employeeKey, label: employee.name }))}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>
          <Divider style={{ margin: '4px 0 0' }} />
          <div>
            <Text strong style={{ fontSize: 13 }}>已保存的指令 ({quickPrompts.length})</Text>
            {quickPrompts.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有常用指令" style={{ marginBlock: 14 }} />
            ) : (
              <List
                size="small"
                dataSource={quickPrompts}
                style={{ marginTop: 6, maxHeight: 260, overflow: 'auto' }}
                renderItem={prompt => (
                  <List.Item
                    actions={[
                      <Button
                        key="use"
                        type="link"
                        size="small"
                        disabled={quickPromptSaving}
                        onClick={() => {
                          insertQuickPrompt(prompt);
                          setQuickPromptOpen(false);
                        }}
                      >
                        插入
                      </Button>,
                      <Button
                        key="edit"
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        disabled={quickPromptSaving}
                        aria-label={`编辑常用指令${prompt.title}`}
                        onClick={() => openEditQuickPrompt(prompt)}
                      />,
                      <Popconfirm
                        key="delete"
                        title="删除这条常用指令？"
                        okText="删除"
                        cancelText="取消"
                        onConfirm={() => handleDeleteQuickPrompt(prompt.id)}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          disabled={quickPromptSaving}
                          aria-label={`删除常用指令${prompt.title}`}
                        />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Text style={{ fontSize: 13 }}>{prompt.title}</Text>}
                      description={
                        <div>
                          <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 12 }}>
                            {prompt.content}
                          </Paragraph>
                          {prompt.employee_key && (
                            <Tag style={{ marginTop: 4, fontSize: 10 }}>
                              {employees.find(employee => employee.employeeKey === prompt.employee_key)?.name || prompt.employee_key}
                            </Tag>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Artifact drawer */}
      <Drawer title={activeArtifact?.title || '产出物'} open={artifactOpen} onClose={() => setArtifactOpen(false)} width={720}>
        <div className="wb-markdown" style={{ background: '#f8fafc', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 20 }}>
          <ReactMarkdown components={mdComponents}>{cleanLatex(activeArtifact?.content || '')}</ReactMarkdown>
        </div>
      </Drawer>

      <Drawer
        title="DeepAgent 工作区"
        open={workspaceDrawerOpen}
        onClose={() => setWorkspaceDrawerOpen(false)}
        width={isMobile ? '100%' : 420}
      >
        <DeepAgentWorkspacePanel
          workspace={workspace}
          loading={workspaceLoading}
          error={workspaceError}
          onRetry={() => sessionId && void loadWorkspace(sessionId)}
          onOpenFile={openWorkspaceFile}
        />
      </Drawer>

      <Drawer
        title={activeWorkspaceFile?.path || '工作区文件'}
        open={workspaceFileOpen}
        onClose={() => setWorkspaceFileOpen(false)}
        width={isMobile ? '100%' : 720}
        extra={activeWorkspaceFile ? <CopyBtn text={activeWorkspaceFile.content} /> : null}
      >
        {workspaceFileLoading ? (
          <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>正在读取文件…</Text>
          </div>
        ) : activeWorkspaceFile ? (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 10 }}>
              {activeWorkspaceFile.summary}
            </Text>
            <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: 16, borderRadius: 10, fontSize: 12, lineHeight: 1.6, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {activeWorkspaceFile.content}
            </pre>
          </>
        ) : (
          <Empty description="没有可显示的文件内容" />
        )}
      </Drawer>

      {/* Trace debug drawer */}
      <Drawer title="执行详情" open={traceDrawerOpen} onClose={() => setTraceDrawerOpen(false)} width={640}>
        {(activeTraces || []).length === 0 ? <Empty description="无调用记录" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(activeTraces || []).map((t, i) => (
              <div key={i} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Space size={8}>
                    <Tag color={t.success ? 'green' : 'red'} style={{ fontSize: 11 }}>{t.success ? 'OK' : 'FAIL'}</Tag>
                    <Text strong style={{ fontSize: 13 }}>{t.toolName}</Text>
                  </Space>
                  <CopyBtn text={`${t.toolName}\n参数: ${t.arguments || '-'}\n结果: ${t.result || '-'}`} />
                </div>
                {t.arguments && (
                  <div style={{ padding: '8px 14px', borderTop: `1px solid ${COLORS.border}` }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>参数</Text>
                    <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: 10, borderRadius: 6, fontSize: 12, margin: '4px 0 0', overflow: 'auto', maxHeight: 200 }}>{t.arguments}</pre>
                  </div>
                )}
                {t.result && (
                  <div style={{ padding: '8px 14px', borderTop: `1px solid ${COLORS.border}` }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>结果</Text>
                    <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: 10, borderRadius: 6, fontSize: 12, margin: '4px 0 0', overflow: 'auto', maxHeight: 200 }}>{t.result}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Drawer>
      </div>
    </div>
  );
}
