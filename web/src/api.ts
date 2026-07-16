// 用户端 API 封装：统一 BASE 前缀、Bearer 凭证、错误信封解包；401 自动清 token 回登录页。
import type { ApiResult, AgentRunRecord } from './types';
import { userToken } from './userAuth';

const BASE = '/api/v1/agentapp';

/** 全链路矩阵：一个项目（季）的概要。 */
export interface MatrixProject {
  project_id: string;
  name: string;
  episode_count: number;
  card_count: number;
}

/** 全链路矩阵：一个 G 生成单元一行，值为该单元在各阶段的卡片数。 */
export interface MatrixRow {
  project_id: string;
  project_name: string;
  episode: number;
  unit: number;
  title: string;
  script: number;
  storyboard: number;
  img_prompt: number;   // 首帧提示词（不含末帧锁）
  flf: number;          // 末帧锁 FLF
  vid_prompt: number;
  images: number;
  videos: number;
  missing: string[];    // 四个 spec 阶段里缺哪些
  orphan: boolean;      // 四个阶段全缺 = 该 G 单元不存在，这些卡是孤儿
  ep_level_cards: number;
}

/** 孤儿卡：挂在一个不存在的 G 单元上，四个 spec 阶段全空。 */
export interface OrphanCard {
  card_id: string;
  project_id: string;
  project_name: string;
  episode: number;
  shot_number: number;
  stage: string;
  title: string;
  content: string;
  episode_units: number[];  // 该集实际存在的 G 单元号，用于判断是否编号错位
}

/** 归档区里的卡片：原卡内容 + 归档时间与原因。 */
export interface ArchivedCard {
  card_id: string;
  episode: number | null;
  shot_number: number;
  stage: string;
  title: string;
  content: string;
  archived_at: string;
  archive_reason: string;
}

export interface TaskInfo {
  job_id: string;
  status: string;
  result: any;
  enqueue_time: string | null;
  employee_key?: string;
  user_input?: string;
  created_at?: number | null;
}

/** 文件上传等裸 fetch 用的鉴权头——FormData 请求不能设 Content-Type（浏览器要自己拼 boundary）。 */
function authHeaders(): Record<string, string> {
  const token = userToken.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = userToken.get();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (res.status === 401) {
    // 凭证失效:统一清 token 回登录页,免得每个页面各自处理
    userToken.clear();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('登录已失效，请重新登录');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = text;
    try {
      const json = JSON.parse(text);
      message = json.detail || json.message || text;
    } catch {
      // keep raw text
    }
    throw new Error(message || `HTTP ${res.status}`);
  }
  let json: ApiResult<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error(`服务端返回了非 JSON 响应 (HTTP ${res.status})`);
  }
  if (json.code !== 200) throw new Error(json.message || `code ${json.code}`);
  return json.data;
}

export const api = {
  // Registry
  getOverview: () => request<Record<string, number>>('/registry/overview'),

  // Runs (运行可观测)
  listRuns: (params?: { employeeKey?: string; sessionId?: string; success?: boolean; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.employeeKey) q.set('employeeKey', params.employeeKey);
    if (params?.sessionId) q.set('sessionId', params.sessionId);
    if (params?.success !== undefined) q.set('success', String(params.success));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return request<AgentRunRecord[]>(`/agent/runs${qs ? `?${qs}` : ''}`);
  },
  getRun: (runId: string) => request<AgentRunRecord>(`/agent/runs/${runId}`),
  getQuota: (employeeKey: string) => request<{ month: string; employee_key: string; tokens_used: number }>(`/agent/quota/${encodeURIComponent(employeeKey)}`),

  // Tasks (异步队列)
  enqueueAgentRun: (data: { employeeKey: string; userInput: string; sessionId?: string }) =>
    request<{ job_id: string; status: string }>('/tasks/agent-run', { method: 'POST', body: JSON.stringify(data) }),
  listTasks: (limit = 50) => request<TaskInfo[]>(`/tasks?limit=${limit}`),
  getTaskStatus: (jobId: string) => request<TaskInfo>(`/tasks/${encodeURIComponent(jobId)}`),
  cancelTask: (jobId: string) => request<{ job_id: string; cancelled: boolean }>(`/tasks/${encodeURIComponent(jobId)}/cancel`, { method: 'POST' }),
  retryTask: (jobId: string) => request<{ job_id: string; status: string }>(`/tasks/${encodeURIComponent(jobId)}/retry`, { method: 'POST' }),

  // Knowledge 语义搜索
  searchKnowledge: (key: string, q: string, topK = 5) =>
    request<any[]>(`/registry/employees/${encodeURIComponent(key)}/knowledge/search?q=${encodeURIComponent(q)}&topK=${topK}`),
  listEmployees: () => request<any[]>('/registry/employees'),
  getEmployee: (key: string) => request<any>(`/registry/employees/${key}`),
  saveEmployee: (data: any) => request<any>('/registry/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (key: string, data: any) => request<any>(`/registry/employees/${key}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEmployee: (key: string) => request<any>(`/registry/employees/${key}`, { method: 'DELETE' }),
  toggleEnabled: (key: string, enabled: boolean) => request<any>(`/registry/employees/${key}/enabled`, { method: 'POST', body: JSON.stringify({ enabled }) }),
  cloneEmployee: (key: string, newKey: string, newName: string) =>
    request<any>(`/registry/employees/${key}/clone`, { method: 'POST', body: JSON.stringify({ newKey, newName }) }),
  applyTemplate: (code: string, employeeKey: string, employeeName: string) =>
    request<any>(`/registry/role-templates/${code}/apply`, { method: 'POST', body: JSON.stringify({ employeeKey, employeeName }) }),

  listTemplates: () => request<any[]>('/registry/role-templates'),
  listTools: () => request<any[]>('/registry/tools'),
  listSkills: () => request<any[]>('/registry/skills'),
  listTeams: () => request<any[]>('/registry/teams'),
  saveTeam: (data: any) => request<any>('/registry/teams', { method: 'POST', body: JSON.stringify(data) }),
  deleteTeam: (code: string) => request<any>(`/registry/teams/${code}`, { method: 'DELETE' }),
  updateTeamMembers: (code: string, memberEmployeeKeys: string[]) =>
    request<any>(`/registry/teams/${code}/members`, { method: 'PUT', body: JSON.stringify({ memberEmployeeKeys }) }),

  listMcpServers: () => request<any[]>('/registry/mcp-servers'),
  saveMcpServer: (data: any) => request<any>('/registry/mcp-servers', { method: 'POST', body: JSON.stringify(data) }),
  deleteMcpServer: (code: string) => request<any>(`/registry/mcp-servers/${code}`, { method: 'DELETE' }),

  saveTool: (data: any) => request<any>('/registry/tools', { method: 'POST', body: JSON.stringify(data) }),
  deleteTool: (code: string) => request<any>(`/registry/tools/${code}`, { method: 'DELETE' }),

  saveSkill: (data: any) => request<any>('/registry/skills', { method: 'POST', body: JSON.stringify(data) }),
  deleteSkill: (code: string) => request<any>(`/registry/skills/${code}`, { method: 'DELETE' }),

  updateBindings: (key: string, bindings: { skillRefs?: string[]; toolRefs?: string[]; mcpServerRefs?: string[] }) =>
    request<any>(`/registry/employees/${key}/bindings`, { method: 'PUT', body: JSON.stringify(bindings) }),

  // Knowledge
  listKnowledge: (key: string) => request<any[]>(`/registry/employees/${key}/knowledge`),
  deleteKnowledge: (key: string, docId: string) => request<any>(`/registry/employees/${key}/knowledge/${docId}`, { method: 'DELETE' }),
  uploadKnowledge: async (key: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/registry/employees/${key}/knowledge`, { method: 'POST', body: form, headers: authHeaders() });
    const json = await res.json();
    if (json.code !== 200) throw new Error(json.message || 'upload failed');
    return json.data;
  },

  // AI Providers
  listAiProviders: () => request<any[]>('/agent/ai-providers'),
  getAiProvider: (name: string) => request<any>(`/agent/ai-providers/${encodeURIComponent(name)}`),
  saveAiProvider: (data: any) => request<any>('/agent/ai-providers', { method: 'POST', body: JSON.stringify(data) }),
  updateAiProvider: (name: string, data: any) =>
    request<any>(`/agent/ai-providers/${encodeURIComponent(name)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAiProvider: (name: string) =>
    request<any>(`/agent/ai-providers/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  testAiProvider: (name: string) =>
    request<any>(`/agent/ai-providers/${encodeURIComponent(name)}/test`, { method: 'POST' }),
  listOpenRouterModels: () => request<any[]>('/agent/openrouter/models'),
  addAiProviderModel: (name: string, data: { modelName: string; modelId: string; timeoutMinutes?: number }) =>
    request<any>(`/agent/ai-providers/${encodeURIComponent(name)}/models`, { method: 'POST', body: JSON.stringify(data) }),

  // System
  getSystemInfo: () => request<any>('/agent/system-info'),

  // 自动学习 / 提示词采集
  listScrapeSources: () => request<any[]>('/scrape/sources'),
  getScrapeSource: (code: string) => request<any>(`/scrape/sources/${encodeURIComponent(code)}`),
  saveScrapeSource: (data: any) => request<any>('/scrape/sources', { method: 'POST', body: JSON.stringify(data) }),
  updateScrapeSource: (code: string, data: any) =>
    request<any>(`/scrape/sources/${encodeURIComponent(code)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteScrapeSource: (code: string) =>
    request<any>(`/scrape/sources/${encodeURIComponent(code)}`, { method: 'DELETE' }),
  runScrapeSource: (code: string) =>
    request<any>(`/scrape/sources/${encodeURIComponent(code)}/run`, { method: 'POST' }),
  listScrapePrompts: (code: string, limit = 200) =>
    request<any[]>(`/scrape/sources/${encodeURIComponent(code)}/prompts?limit=${limit}`),
  listScrapeHistory: (code: string) =>
    request<any[]>(`/scrape/sources/${encodeURIComponent(code)}/history`),

  // 定时文章学习
  listLearnSources: () => request<any[]>('/scrape/learn-sources'),
  saveLearnSource: (data: any) => request<any>('/scrape/learn-sources', { method: 'POST', body: JSON.stringify(data) }),
  updateLearnSource: (code: string, data: any) =>
    request<any>(`/scrape/learn-sources/${encodeURIComponent(code)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLearnSource: (code: string) =>
    request<any>(`/scrape/learn-sources/${encodeURIComponent(code)}`, { method: 'DELETE' }),
  runLearnSource: (code: string) =>
    request<any>(`/scrape/learn-sources/${encodeURIComponent(code)}/run`, { method: 'POST' }),
  listLearnHistory: (code: string) =>
    request<any[]>(`/scrape/learn-sources/${encodeURIComponent(code)}/history`),

  // 长期记忆
  getMemoryStats: (empKey: string) => request<any>(`/memory/stats/${encodeURIComponent(empKey)}`),
  getAllMemories: (empKey: string) => request<any>(`/memory/all/${encodeURIComponent(empKey)}`),
  listSemanticMemories: (empKey: string) => request<any[]>(`/memory/semantic/${encodeURIComponent(empKey)}`),
  addSemanticMemory: (empKey: string, data: any) =>
    request<any>(`/memory/semantic/${encodeURIComponent(empKey)}`, { method: 'POST', body: JSON.stringify(data) }),
  deleteSemanticMemory: (empKey: string, memId: string) =>
    request<any>(`/memory/semantic/${encodeURIComponent(empKey)}/${encodeURIComponent(memId)}`, { method: 'DELETE' }),
  listEpisodicMemories: (empKey: string) => request<any[]>(`/memory/episodic/${encodeURIComponent(empKey)}`),
  addEpisodicMemory: (empKey: string, data: any) =>
    request<any>(`/memory/episodic/${encodeURIComponent(empKey)}`, { method: 'POST', body: JSON.stringify(data) }),
  deleteEpisodicMemory: (empKey: string, memId: string) =>
    request<any>(`/memory/episodic/${encodeURIComponent(empKey)}/${encodeURIComponent(memId)}`, { method: 'DELETE' }),
  listProceduralMemories: (empKey: string) => request<any[]>(`/memory/procedural/${encodeURIComponent(empKey)}`),
  addProceduralMemory: (empKey: string, data: any) =>
    request<any>(`/memory/procedural/${encodeURIComponent(empKey)}`, { method: 'POST', body: JSON.stringify(data) }),
  deleteProceduralMemory: (empKey: string, memId: string) =>
    request<any>(`/memory/procedural/${encodeURIComponent(empKey)}/${encodeURIComponent(memId)}`, { method: 'DELETE' }),
  triggerMemoryExtraction: (empKey: string, sessionId: string) =>
    request<any>(`/memory/extract/${encodeURIComponent(empKey)}/${encodeURIComponent(sessionId)}`, { method: 'POST' }),

  // 工作流编排
  listWorkflows: () => request<any[]>('/workflow'),
  getWorkflow: (key: string) => request<any>(`/workflow/${encodeURIComponent(key)}`),
  saveWorkflow: (data: any) => request<any>('/workflow', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkflow: (key: string, data: any) =>
    request<any>(`/workflow/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkflow: (key: string) =>
    request<any>(`/workflow/${encodeURIComponent(key)}`, { method: 'DELETE' }),
  runWorkflow: (key: string, inputs: Record<string, any>) =>
    request<any>(`/workflow/${encodeURIComponent(key)}/run`, { method: 'POST', body: JSON.stringify({ inputs }) }),
  listWorkflowRuns: (key: string) => request<any[]>(`/workflow/${encodeURIComponent(key)}/runs`),
  listNodeTypes: () => request<any[]>('/workflow/node-types'),

  // Agent
  listAgentEmployees: () => request<any[]>('/agent/employees'),
  uploadFile: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/agent/upload`, { method: 'POST', body: form, headers: authHeaders() });
    const json = await res.json();
    if (json.code !== 200) throw new Error(json.message || 'upload failed');
    return json.data as { fileId: string; fileName: string; fileSize: number; ext: string; isImage: boolean; isText: boolean; textContent: string; url: string };
  },
  runAgent: (data: { employeeKey: string; userInput: string; sessionId?: string; extraContext?: string }) =>
    request<any>('/agent/run', { method: 'POST', body: JSON.stringify(data) }),
  listSessions: (employeeKey: string, limit = 20, includeArchived = false) =>
    request<any[]>(`/agent/sessions?employeeKey=${encodeURIComponent(employeeKey)}&targetType=employee&includeArchived=${includeArchived}&limit=${limit}`),
  listTeamSessions: (teamCode: string, limit = 20, includeArchived = false) =>
    request<any[]>(`/agent/sessions?teamCode=${encodeURIComponent(teamCode)}&targetType=team&includeArchived=${includeArchived}&limit=${limit}`),
  getSession: (sessionId: string) => request<any>(`/agent/sessions/${encodeURIComponent(sessionId)}`),
  archiveSession: (sessionId: string, archived = true) =>
    request<any>(`/agent/sessions/${encodeURIComponent(sessionId)}/archive`, { method: 'POST', body: JSON.stringify({ archived }) }),
  deleteSession: (sessionId: string) => request<any>(`/agent/sessions/${sessionId}`, { method: 'DELETE' }),
  runTeam: (data: { teamCode: string; userInput: string; sessionId?: string; extraContext?: string }) =>
    request<any>('/agent/team-run', { method: 'POST', body: JSON.stringify(data) }),

  // Production pipeline
  listProjects: () => request<any[]>('/production/projects'),
  createProject: (data: { name: string; description?: string; sourceType?: string; sourceContent?: string; employeeKey?: string; teamCode?: string; episodeCount?: number; episodeDurationSeconds?: number; aspectRatio?: string; visualStyle?: string; budget?: number }) =>
    request<any>('/production/projects', { method: 'POST', body: JSON.stringify({ source_type: data.sourceType, source_content: data.sourceContent, employee_key: data.employeeKey, team_code: data.teamCode, episode_count: data.episodeCount, episode_duration_seconds: data.episodeDurationSeconds, aspect_ratio: data.aspectRatio, visual_style: data.visualStyle, budget: data.budget, name: data.name, description: data.description }) }),
  getProject: (pid: string) => request<any>(`/production/projects/${pid}`),
  updateProject: (pid: string, data: any) =>
    request<any>(`/production/projects/${pid}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (pid: string) =>
    request<any>(`/production/projects/${pid}`, { method: 'DELETE' }),
  addCard: (pid: string, data: any) =>
    request<any>(`/production/projects/${pid}/cards`, { method: 'POST', body: JSON.stringify(data) }),
  batchAddCards: (pid: string, cards: any[]) =>
    request<any>(`/production/projects/${pid}/cards/batch`, { method: 'POST', body: JSON.stringify({ cards }) }),
  updateCard: (cardId: string, data: any) =>
    request<any>(`/production/cards/${cardId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCard: (cardId: string) =>
    request<any>(`/production/cards/${cardId}`, { method: 'DELETE' }),
  moveCard: (cardId: string, stage: string) =>
    request<any>(`/production/cards/${cardId}/move?stage=${stage}`, { method: 'POST' }),
  batchMoveCards: (cardIds: string[], stage: string) =>
    request<any>(`/production/cards/batch-move`, { method: 'POST', body: JSON.stringify({ card_ids: cardIds, stage }) }),
  uploadCardFile: async (pid: string, cardId: string, file: File, fileType: 'image' | 'video' = 'image') => {
    const form = new FormData();
    form.append('file', file);
    const resp = await fetch(`${BASE}/production/projects/${pid}/cards/${cardId}/upload?file_type=${fileType}`, { method: 'POST', body: form, headers: authHeaders() });
    const json = await resp.json();
    if (!resp.ok || json.code !== 200) throw new Error(json.detail || 'Upload failed');
    return json.data;
  },
  batchDeleteCards: (cardIds: string[]) =>
    request<any>(`/production/cards/batch-delete`, { method: 'POST', body: JSON.stringify({ card_ids: cardIds }) }),
  batchUpdateStatus: (cardIds: string[], status: string) =>
    request<any>(`/production/cards/batch-status`, { method: 'POST', body: JSON.stringify({ card_ids: cardIds, status }) }),
  searchCards: (pid: string, params: { q?: string; stage?: string; status?: string; episode?: number; assignee?: string }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.stage) qs.set('stage', params.stage);
    if (params.status) qs.set('status', params.status);
    if (params.episode !== undefined) qs.set('episode', String(params.episode));
    if (params.assignee) qs.set('assignee', params.assignee);
    return request<any[]>(`/production/projects/${pid}/search?${qs.toString()}`);
  },
  getProjectStats: (pid: string) => request<any>(`/production/projects/${pid}/stats`),
  addMember: (pid: string, data: { name: string; role?: string; avatar?: string }) =>
    request<any>(`/production/projects/${pid}/members`, { method: 'POST', body: JSON.stringify(data) }),
  updateMemberRole: (pid: string, userId: string, role: string) =>
    request<any>(`/production/projects/${pid}/members/${userId}`, { method: 'PUT', body: JSON.stringify({ role }) }),
  removeMember: (pid: string, userId: string) =>
    request<any>(`/production/projects/${pid}/members/${userId}`, { method: 'DELETE' }),
  generateStage: (pid: string, data: { target_stage: string; employee_key?: string; extra_instruction?: string; episode?: number | null; shot_number?: number; mode?: 'append' | 'replace' }) =>
    request<any>(`/production/projects/${pid}/generate`, { method: 'POST', body: JSON.stringify(data) }),
  generateCardImage: (pid: string, cardId: string, data: { model: string; prompt?: string; size?: string }) =>
    request<{ url: string; model: string; card: any }>(`/production/projects/${pid}/cards/${cardId}/generate-image`, {
      method: 'POST', body: JSON.stringify(data),
    }),
  splitStoryboardCard: (pid: string, cardId: string) =>
    request<{ split: number; source_card_id: string; cards: any[] }>(
      `/production/projects/${pid}/cards/${cardId}/split-storyboard`, { method: 'POST' },
    ),
  listStages: () => request<any[]>('/production/stages'),
  /** 跨季全链路对照矩阵：每个 G 生成单元一行，只回统计量不回卡片正文。 */
  getMatrix: () => request<{ projects: MatrixProject[]; rows: MatrixRow[] }>('/production/matrix'),
  /** 跨季列出孤儿卡：挂在四个 spec 阶段全空的 G 单元上的卡片。 */
  listOrphans: () => request<OrphanCard[]>('/production/orphans'),
  /** 归档卡片（移入 archive/ 目录，不删除，可恢复）。 */
  archiveCards: (pid: string, cardIds: string[], reason?: string) =>
    request<{ archived: number; cards: string[] }>(`/production/projects/${pid}/archive`,
      { method: 'POST', body: JSON.stringify({ card_ids: cardIds, ...(reason ? { reason } : {}) }) }),
  /** 列出某项目归档区的卡片。 */
  listArchive: (pid: string) => request<ArchivedCard[]>(`/production/projects/${pid}/archive`),
  /** 把归档卡片恢复回 cards.json。 */
  restoreCard: (pid: string, cardId: string) =>
    request<{ restored: string }>(`/production/projects/${pid}/archive/${cardId}/restore`, { method: 'POST' }),

  // 导演 Agent：项目状态、OpenRouter 媒体生产与成片合成
  getDirectorState: (pid: string) => request<any>(`/director/projects/${pid}`),
  listDirectorMediaModels: (kind: 'image' | 'video') =>
    request<any[]>(`/director/media-models?kind=${kind}`),
  generateDirectorImage: (pid: string, cardId: string, data: {
    model: string; prompt?: string; resolution?: string; aspect_ratio?: string;
  }) => request<any>(`/director/projects/${pid}/cards/${cardId}/image`, {
    method: 'POST', body: JSON.stringify(data),
  }),
  generateDirectorVideo: (pid: string, cardId: string, data: {
    model: string; prompt?: string; duration?: number; resolution?: string;
    aspect_ratio?: string; image_url?: string; generate_audio?: boolean;
  }) => request<any>(`/director/projects/${pid}/cards/${cardId}/video`, {
    method: 'POST', body: JSON.stringify(data),
  }),
  syncDirectorVideo: (pid: string, cardId: string) =>
    request<any>(`/director/projects/${pid}/cards/${cardId}/video/sync`, { method: 'POST' }),
  composeDirectorCut: (pid: string) =>
    request<any>(`/director/projects/${pid}/compose`, { method: 'POST' }),

  // 自由画布
  listCanvases: () => request<any[]>('/canvas/canvases'),
  createCanvas: (name: string) => request<any>('/canvas/canvases', { method: 'POST', body: JSON.stringify({ name }) }),
  getCanvas: (cid: string) => request<any>(`/canvas/canvases/${cid}`),
  saveCanvas: (cid: string, data: { name?: string; nodes: any[]; edges: any[] }) =>
    request<any>(`/canvas/canvases/${cid}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCanvas: (cid: string) => request<any>(`/canvas/canvases/${cid}`, { method: 'DELETE' }),
  listImageModels: () => request<any[]>('/canvas/image-models'),
  canvasGenerate: (cid: string, data: { prompt: string; model: string; size?: string }) =>
    request<{ url: string; model: string }>(`/canvas/canvases/${cid}/generate`, { method: 'POST', body: JSON.stringify(data) }),
  canvasDerive: (cid: string, data: {
    source_title?: string; source_content: string; source_stage?: string;
    target_stage?: string; employee_key: string; instruction?: string; max_items?: number;
  }) =>
    request<{ items: { title: string; content: string; stage: string }[]; raw?: string }>(
      `/canvas/canvases/${cid}/derive`, { method: 'POST', body: JSON.stringify(data) }),
  uploadCanvasAsset: async (cid: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const token = userToken.get();
    const res = await fetch(`${BASE}/canvas/canvases/${cid}/upload`, {
      method: 'POST', body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const json = await res.json();
    if (!res.ok || json.code !== 200) throw new Error(json.detail || json.message || '上传失败');
    return json.data as { url: string };
  },

  // AI 趋势雷达 (skill_tracker)
  listTrendQueries: () => request<any[]>('/skills/queries'),
  listTrends: (query: string) => request<any>(`/skills/list?query=${encodeURIComponent(query)}`),
  getRepoHistory: (query: string, fullName: string) =>
    request<any[]>(`/skills/repo-history?query=${encodeURIComponent(query)}&fullName=${encodeURIComponent(fullName)}`),
  // 跨全部 query 查仓库(AI 报告里的项目未必属于当前选中的 query);查不到返回 null
  lookupRepo: (fullName: string) =>
    request<{ repo: any; query: string; history: { takenAt: string; stars: number }[] } | null>(
      `/skills/repo-lookup?fullName=${encodeURIComponent(fullName)}`,
    ),
  refreshTrends: (query: string, limit = 15, recentDays = 180) =>
    request<any>('/skills/refresh', { method: 'POST', body: JSON.stringify({ query, limit, recentDays }) }),
  analyzeTrends: () => request<any>('/skills/analyze', { method: 'POST' }),
  getAnalysis: () => request<any>('/skills/analyze'),
  getTrendSummary: () => request<any>('/skills/summary'),

  // 个人化每日简报：只回没看过且与画像相关的几条，标记已读后永不再出现
  getDigest: () => request<any>('/skills/digest'),
  makeDigest: (force = false) => request<any>(`/skills/digest?force=${force}`, { method: 'POST' }),
  markDigestRead: (ids: string[]) =>
    request<any>('/skills/digest/read', { method: 'POST', body: JSON.stringify({ ids }) }),
  getDigestProfile: () => request<any>('/skills/digest/profile'),
  saveDigestProfile: (profile: any) =>
    request<any>('/skills/digest/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  // 多源趋势
  getHnQueries: () => request<any[]>('/trend-sources/hn/queries'),
  getHnList: (query: string, limit = 20) =>
    request<any>(`/trend-sources/hn?query=${encodeURIComponent(query)}&limit=${limit}`),
  getArxivCategories: () => request<any[]>('/trend-sources/arxiv/categories'),
  getArxivList: (category: string, limit = 20) =>
    request<any>(`/trend-sources/arxiv?category=${encodeURIComponent(category)}&limit=${limit}`),
  getNewsTopics: () => request<any[]>('/trend-sources/news/topics'),
  getNewsList: (query: string, limit = 20) =>
    request<any>(`/trend-sources/news?query=${encodeURIComponent(query)}&limit=${limit}`),
  getRedditSubs: () => request<any[]>('/trend-sources/reddit/subs'),
  getRedditList: (subreddit: string, limit = 20) =>
    request<any>(`/trend-sources/reddit?subreddit=${encodeURIComponent(subreddit)}&limit=${limit}`),
  getTrendSourcesOverview: () => request<any[]>('/trend-sources/overview'),
  translateTitles: (titles: string[]) =>
    request<string[]>('/trend-sources/translate', { method: 'POST', body: JSON.stringify({ titles }) }),

  // 知识图谱
  getKnowledgeGraph: () => request<any>('/knowledge-graph'),

  // Deep Dream 蒸馏
  triggerDistillation: (empKey: string) =>
    request<any>(`/memory/distill/${empKey}`, { method: 'POST' }),
  listDistillationLogs: (empKey: string) =>
    request<any[]>(`/memory/distillation-logs/${empKey}`),

  // 自我进化
  listInsights: (empKey: string) => request<any[]>(`/evolution/insights/${empKey}`),
  triggerEvolution: (empKey: string) =>
    request<any>(`/evolution/analyze/${empKey}`, { method: 'POST' }),
  acceptInsight: (empKey: string, insightId: string) =>
    request<any>(`/evolution/accept/${empKey}/${insightId}`, { method: 'POST' }),
  rejectInsight: (empKey: string, insightId: string) =>
    request<any>(`/evolution/reject/${empKey}/${insightId}`, { method: 'POST' }),
  evolutionRunLogs: (empKey: string) => request<any[]>(`/evolution/run-logs/${empKey}`),
  evolutionOverview: () => request<any[]>('/evolution/overview'),
};
