// Vitest 专用的 Electron 运行时桩（stub）。
//
// 单测跑在 `environment: "node"`，而真·electron 模块在被 import 时会执行
// `node_modules/electron/index.js`：若平台二进制不可解析（如 CI 全新环境里
// path.txt 缺失），它会**在 import 那一刻**抛
// "Electron failed to install correctly"。源码（如 runtimePaths.ts）在模块顶层
// `import { app } from "electron"`，于是任何传递依赖到它的单测都会在加载期崩。
//
// 这里把 electron 整个 alias 成无副作用的桩：单测本就不该、也无法使用真 electron
// 运行时；真正需要 electron 行为的测试各自注入自己的假实现。桩只需"存在且不抛"。
// 真实 app 构建走 vite.config.ts，不受此 alias 影响。

const noop = (): undefined => undefined;

export const app = {
  getPath: (_name?: string): string => "",
  getAppPath: (): string => "",
  getName: (): string => "Nomi",
  getVersion: (): string => "0.0.0-test",
  on: noop,
  whenReady: (): Promise<void> => Promise.resolve(),
  quit: noop,
};

export const ipcMain = { handle: noop, on: noop, removeHandler: noop };

export const ipcRenderer = {
  invoke: (): Promise<unknown> => Promise.resolve(undefined),
  on: noop,
  send: noop,
};

export const contextBridge = { exposeInMainWorld: noop };

export class BrowserWindow {
  static getAllWindows(): BrowserWindow[] {
    return [];
  }
}

export const dialog = {
  showOpenDialog: (): Promise<{ canceled: boolean; filePaths: string[] }> =>
    Promise.resolve({ canceled: true, filePaths: [] }),
  showSaveDialog: (): Promise<{ canceled: boolean; filePath?: string }> =>
    Promise.resolve({ canceled: true }),
};

export const shell = {
  openExternal: (): Promise<void> => Promise.resolve(),
  openPath: (): Promise<string> => Promise.resolve(""),
};

export const safeStorage = {
  isEncryptionAvailable: (): boolean => false,
  encryptString: (s: string): Buffer => Buffer.from(s, "utf-8"),
  decryptString: (b: Buffer): string => b.toString("utf-8"),
};

export const net = { request: noop };

export const session = { defaultSession: undefined };

export const protocol = { handle: noop, registerSchemesAsPrivileged: noop };

export const webContents = { getAllWebContents: (): unknown[] => [] };

export default {
  app,
  ipcMain,
  ipcRenderer,
  contextBridge,
  BrowserWindow,
  dialog,
  shell,
  safeStorage,
  net,
  session,
  protocol,
  webContents,
};
