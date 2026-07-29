// 内置提示词包（随 App 构建发行，零网络依赖）。与外部拉取源（promptSources）的关系：
// getPromptLibrary 的对外出口恒定前置内置包；磁盘缓存只存外部源 → 升级后内置内容
// 立即是新版、回滚零残留（缓存里从来没有内置条目）。预设图打包在 public/prompt-media/，
// mediaUrl 用相对路径（dev 由 Vite serve，prod 相对 dist/index.html 解析），离线/国内不裂图。
import type { LibraryPrompt } from "./promptLibraryTypes";
import expressionPack from "./builtinExpressionPack.json";

const BUILTIN_PROMPTS = expressionPack as unknown as LibraryPrompt[];

/** 内置包占用的 sourceId 集合（用于对外部/缓存数据去重，保证幂等）。 */
export const BUILTIN_SOURCE_IDS: ReadonlySet<string> = new Set(BUILTIN_PROMPTS.map((prompt) => prompt.sourceId));

/** 内置条目（防御性拷贝，防调用方原地改动污染模块常量）。 */
export function getBuiltinPrompts(): LibraryPrompt[] {
  return BUILTIN_PROMPTS.map((prompt) => ({ ...prompt }));
}

/** 唯一咽喉：内置包前置 + 按 sourceId 过滤入参同源条目（老磁盘缓存/重复调用均幂等）。 */
export function withBuiltinPrompts(prompts: LibraryPrompt[]): LibraryPrompt[] {
  const external = prompts.filter((prompt) => !BUILTIN_SOURCE_IDS.has(prompt.sourceId));
  return [...getBuiltinPrompts(), ...external];
}
