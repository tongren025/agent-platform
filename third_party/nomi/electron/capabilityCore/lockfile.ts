// 能力核 · 实例广告 / 探测（见 docs/plan/2026-06-20-capability-core-headless-exposure.md §S4）。
//
// 「Nomi 开着没」是开/不开自动适配的关键探针。运行中的 app 启动 RPC server 后，把
// { pid, port, token, startedAt, version } 写到一个固定路径的 instance.json；外部 CLI/MCP
// 读它就知道：有活实例 → 走 RPC（A 模式，改动实时反映到 UI）；无/陈旧 → 走 headless host（B 模式）。
//
// 陈旧判定：写 instance.json 的进程已死（pid 不在）→ 视为没开（app 崩了没清锁）。
// 文件放 <settingsRoot>/capability-core/instance.json（userData 内，与 token 同根）。
import fs from 'node:fs'
import path from 'node:path'
import { ensureDir } from '../runtimePaths'
import { capabilityCoreDir } from './security'

const INSTANCE_FILE = 'instance.json'

export type InstanceAdvertisement = {
  pid: number
  port: number
  token: string
  startedAt: number
  version: string
}

function instancePath(): string {
  return path.join(capabilityCoreDir(), INSTANCE_FILE)
}

/** 运行中的 app 写实例广告（启动 RPC 后调）。 */
export function writeInstanceAdvertisement(advertisement: InstanceAdvertisement): void {
  ensureDir(capabilityCoreDir())
  fs.writeFileSync(instancePath(), JSON.stringify(advertisement, null, 2), 'utf8')
}

/** app 退出时清掉广告（best-effort，不抛——退出路径绝不卡）。 */
export function clearInstanceAdvertisement(): void {
  try {
    fs.rmSync(instancePath(), { force: true })
  } catch {
    /* 退出清理失败无所谓：下次读会做 pid 存活校验兜底 */
  }
}

function isProcessAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    // signal 0 = 只探测存在/权限，不真发信号。ESRCH=不存在，EPERM=存在但无权（仍算活）。
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM'
  }
}

/**
 * 读活实例广告：文件存在 + 写它的进程仍活 → 返回广告（app 开着）；否则 null（没开/陈旧）。
 * 陈旧文件顺手清掉，避免反复 pid 探测。
 */
export function readLiveInstance(): InstanceAdvertisement | null {
  let raw: string
  try {
    raw = fs.readFileSync(instancePath(), 'utf8')
  } catch {
    return null
  }
  let parsed: Partial<InstanceAdvertisement>
  try {
    parsed = JSON.parse(raw) as Partial<InstanceAdvertisement>
  } catch {
    return null
  }
  if (typeof parsed.pid !== 'number' || typeof parsed.port !== 'number' || typeof parsed.token !== 'string') {
    return null
  }
  if (!isProcessAlive(parsed.pid)) {
    clearInstanceAdvertisement()
    return null
  }
  return {
    pid: parsed.pid,
    port: parsed.port,
    token: parsed.token,
    startedAt: typeof parsed.startedAt === 'number' ? parsed.startedAt : 0,
    version: typeof parsed.version === 'string' ? parsed.version : '',
  }
}
