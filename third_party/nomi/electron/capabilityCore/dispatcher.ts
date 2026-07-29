// 能力核 · 方法路由（单一真相源）。
// RPC 传输（rpcServer）与 headless host（host）共用这一份 method→core 映射，杜绝两份路由漂移（P1）。
import {
  addProjectNodes,
  connectProjectNodes,
  createNamedProject,
  deleteProjectNodes,
  generateOnProject,
  listAllProjects,
  listAvailableModels,
  readProjectCanvas,
  setProjectNodePrompt,
  type FetchTaskResultFn,
  type GenerateInput,
  type RunTaskFn,
} from './core'
import type { ProjectGateway } from './gateway'

export class RpcError extends Error {
  constructor(message: string, readonly httpStatus: number) {
    super(message)
  }
}

export function projectIdOf(params: Record<string, unknown>): string {
  return typeof params.projectId === 'string' ? params.projectId : ''
}

/**
 * makeGateway：按 projectId 解析该用哪个网关——A 模式（app 开着且该项目正打开）→ 渲染层网关（实时）；
 * 否则 → 磁盘网关（直写盘）。rpcServer 据 isProjectOpen + 渲染层可达性提供；headless host 恒磁盘网关。
 */
export type DispatchContext = {
  runTask: RunTaskFn
  fetchTaskResult?: FetchTaskResultFn
  makeGateway: (projectId: string) => ProjectGateway
}

export async function dispatch(method: string, params: Record<string, unknown>, ctx: DispatchContext): Promise<unknown> {
  switch (method) {
    case 'ping':
      return { ok: true }
    case 'project.list':
      return { projects: listAllProjects() }
    case 'project.create':
      return createNamedProject(typeof params.name === 'string' ? params.name : undefined)
    case 'models.list':
      return { models: listAvailableModels() }
    case 'canvas.read':
      return readProjectCanvas(ctx.makeGateway(projectIdOf(params)))
    case 'canvas.addNodes':
      return addProjectNodes(ctx.makeGateway(projectIdOf(params)), Array.isArray(params.nodes) ? (params.nodes as never[]) : [])
    case 'canvas.connect':
      return connectProjectNodes(ctx.makeGateway(projectIdOf(params)), Array.isArray(params.connections) ? (params.connections as never[]) : [])
    case 'canvas.setPrompt':
      return setProjectNodePrompt(
        ctx.makeGateway(projectIdOf(params)),
        String(params.nodeId || ''),
        String(params.prompt || ''),
        typeof params.title === 'string' ? params.title : undefined,
      )
    case 'canvas.deleteNodes':
      return deleteProjectNodes(ctx.makeGateway(projectIdOf(params)), Array.isArray(params.nodeIds) ? (params.nodeIds as string[]) : [])
    case 'generate':
      return generateOnProject(params as unknown as GenerateInput, ctx.makeGateway(projectIdOf(params)), ctx.runTask, ctx.fetchTaskResult)
    default:
      throw new RpcError(`未知方法: ${method}`, 404)
  }
}
