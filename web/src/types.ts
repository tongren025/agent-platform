export interface Employee {
  employeeKey: string;
  name: string;
  roleProfile: string;
  deepAgent: boolean;
  defaultModelPolicy: Record<string, unknown>;
  skillRefs: string[] | null;
  toolRefs: string[] | null;
  mcpServerRefs: string[] | null;
  teamCode: string | null;
  templateCode: string | null;
  hasKnowledgeBase: boolean;
  avatarUrl: string | null;
  tags: string[];
  enabled: boolean;
  source: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleTemplate {
  templateCode: string;
  name: string;
  category: string;
  description: string | null;
  roleProfile: string;
  deepAgent: boolean;
  defaultModelPolicy: Record<string, unknown>;
  suggestedSkillCodes: string[];
  suggestedToolCodes: string[];
  suggestedMcpServerCodes: string[];
  tags: string[];
  icon: string | null;
  source: string;
  sortOrder: number;
}

export interface ToolDef {
  toolCode: string;
  name: string;
  description: string | null;
  inputSchema: string | null;
  sortOrder: number;
}

export interface SkillDef {
  code: string;
  name: string;
  summary: string | null;
  description: string | null;
  isTree: boolean;
  children: unknown[] | null;
  sortOrder: number;
}

export interface TeamRole {
  employeeKey: string;
  stage: string;
  order: number;
}

export interface Team {
  teamCode: string;
  name: string;
  memberEmployeeKeys: string[];
  defaultEmployeeKey: string | null;
  leaderEmployeeKey?: string | null;
  description?: string | null;
  roles?: TeamRole[] | null;
  defaultWorkflowKey?: string | null;
  sortOrder: number;
}

export interface Overview {
  skills: number;
  mcpServers: number;
  tools: number;
  employees: number;
  teams: number;
  roleTemplates: number;
}

export interface SessionItem {
  sessionId: string;
  employeeKey: string;
  targetType?: 'employee' | 'team';
  teamCode?: string | null;
  title?: string;
  archived?: boolean;
  messages: { role: string; content: string; timestamp: string }[];
  artifacts?: ConversationArtifact[];
  metadata?: Record<string, any>;
  createdAt: string;
  lastActiveAt: string;
}

export interface ConversationArtifact {
  artifactId: string;
  title: string;
  kind: string;
  content: string;
  sourceMessageIndex: number;
  createdAt: string;
}

export interface AgentRunResponse {
  assistantMessage: string;
  tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number } | null;
  traces: { toolName: string; arguments: string | null; result: string | null; success: boolean }[];
  sessionId: string | null;
  pendingApproval: { description: string; actionType: string } | null;
}

export interface AgentInvocationTrace {
  iteration: number;
  toolName: string;
  arguments: string | null;
  result: string | null;
  success: boolean;
  elapsedMilliseconds: number;
}

export interface AgentRunRecord {
  runId: string;
  sessionId: string;
  employeeKey: string;
  workflowKey: string | null;
  model: string;
  success: boolean;
  iterations: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number | null;
  elapsedMilliseconds: number;
  errorMessage: string | null;
  pendingApproval: boolean;
  traces: AgentInvocationTrace[];
  createdAt: string;
}

export interface ApiResult<T> {
  code: number;
  data: T;
  message?: string;
}

// ── 工作流编排 ──────────────────────────────────────────────
export type WorkflowNodeType =
  | 'start' | 'agent' | 'condition' | 'template' | 'tool' | 'knowledge' | 'end';

export interface WorkflowNode {
  nodeKey: string;
  type: WorkflowNodeType;
  name: string;
  position: { x: number; y: number };
  config: Record<string, any>;
}

export interface WorkflowEdge {
  edgeId: string;
  source: string;
  target: string;
  sourceHandle: string | null;
}

export interface WorkflowDefinition {
  workflowKey: string;
  name: string;
  description: string | null;
  teamCode: string | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  validationError?: string | null;
}

export interface NodeStepResult {
  nodeKey: string;
  type: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  output: string | null;
  error: string | null;
  elapsedMs: number;
  traces: { toolName: string; arguments: string | null; result: string | null; success: boolean }[];
  promptTokens: number;
  completionTokens: number;
}

export interface WorkflowRun {
  runId: string;
  workflowKey: string;
  status: 'running' | 'success' | 'failed' | 'timeout';
  inputs: Record<string, any>;
  variables: Record<string, any>;
  steps: NodeStepResult[];
  finalOutput: string | null;
  error: string | null;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  startedAt: string;
  finishedAt: string | null;
}

export interface NodeTypeMeta {
  type: WorkflowNodeType;
  label: string;
  desc: string;
}
