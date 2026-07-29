// 命名响应变换注册表（HttpOperation.response_transform 的执行层）。
// 当上游响应形状不是点路径 response_mapping 能直接读的（如 ComfyUI /history：动态 prompt_id 顶层键 +
// 取图要拼 /view URL），vendor 模块注册一个具名变换、在 op 上声明变换名；buildProfileTaskResult 跑
// response_mapping 前对 raw response 应用一次、归一成稳定形状。runtime 只按名查表、不含 vendor 逻辑（P4）。
//
// 注册在各 vendor 模块 import 时发生（如 comfyuiLocal.ts），经 seedBuiltins 于启动期 import → 任务触发
// （远晚于启动）时表已就绪。

export type ResponseTransformContext = {
  /** vendor.baseUrlHint（拼相对产物 URL 用，如 ComfyUI /view）。缺省空串。 */
  baseUrl: string;
};

export type ResponseTransformFn = (response: unknown, context: ResponseTransformContext) => unknown;

const registry = new Map<string, ResponseTransformFn>();

export function registerResponseTransform(name: string, fn: ResponseTransformFn): void {
  registry.set(name, fn);
}

/** 应用具名变换；未声明或未注册 → 原样返回（对现有全部 vendor 零影响）。 */
export function applyResponseTransform(name: string | undefined, response: unknown, context: ResponseTransformContext): unknown {
  if (!name) return response;
  const fn = registry.get(name);
  if (!fn) return response;
  try {
    return fn(response, context);
  } catch {
    // 变换抛错不该炸整条任务：退回原响应（response_mapping 读不到 → 继续轮询/如实为空）。
    return response;
  }
}
