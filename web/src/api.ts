import type { ApiResult } from './types';

const BASE = '/api/v1/agentapp';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...init?.headers },
    ...init,
  });
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
    const res = await fetch(`${BASE}/registry/employees/${key}/knowledge`, { method: 'POST', body: form });
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
    const res = await fetch(`${BASE}/agent/upload`, { method: 'POST', body: form });
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
  createProject: (data: { name: string; description?: string; sourceType?: string; sourceContent?: string; employeeKey?: string; teamCode?: string }) =>
    request<any>('/production/projects', { method: 'POST', body: JSON.stringify({ source_type: data.sourceType, source_content: data.sourceContent, employee_key: data.employeeKey, team_code: data.teamCode, ...data }) }),
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
    const resp = await fetch(`${BASE}/production/projects/${pid}/cards/${cardId}/upload?file_type=${fileType}`, { method: 'POST', body: form });
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
  generateStage: (pid: string, data: { target_stage: string; employee_key?: string; extra_instruction?: string }) =>
    request<any>(`/production/projects/${pid}/generate`, { method: 'POST', body: JSON.stringify(data) }),
  listStages: () => request<any[]>('/production/stages'),

  // AI 趋势雷达 (skill_tracker)
  listTrendQueries: () => request<any[]>('/skills/queries'),
  listTrends: (query: string) => request<any>(`/skills/list?query=${encodeURIComponent(query)}`),
  getRepoHistory: (query: string, fullName: string) =>
    request<any[]>(`/skills/repo-history?query=${encodeURIComponent(query)}&fullName=${encodeURIComponent(fullName)}`),
  refreshTrends: (query: string, limit = 15, recentDays = 180) =>
    request<any>('/skills/refresh', { method: 'POST', body: JSON.stringify({ query, limit, recentDays }) }),
  analyzeTrends: () => request<any>('/skills/analyze', { method: 'POST' }),
  getAnalysis: () => request<any>('/skills/analyze'),
  getTrendSummary: () => request<any>('/skills/summary'),

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
