import fs from "node:fs";
import path from "node:path";

// 随附二进制（ffmpeg / ffprobe）的执行位自愈。
//
// 根因：打包/安装时平台包的 `chmod u+x` postinstall 可能被 pnpm 跳过
// （pnpm.onlyBuiltDependencies 未白名单这些 installer 包），导致随附的
// ffprobe 落盘时没有执行位 → spawn 报 EACCES → 导出静默丢音频/取景。
// ffmpeg 的 tarball 恰好自带执行位，ffprobe 没带，所以症状只在 ffprobe 出现。
//
// 这里在每次 spawn 随附二进制前做一次幂等自愈：缺执行位就补上。
// 这样无论打包流水线是否跑过 chmod，运行时都能保证可执行——防一整类
// 「打包丢执行位」回归，而不是只修当前这一个二进制。
export function ensureExecutable(binaryPath: string): void {
  // 只处理绝对路径的随附二进制；裸命令（走 PATH 的 "ffmpeg"）不碰。
  if (!binaryPath || !path.isAbsolute(binaryPath)) return;
  // Windows 不靠 Unix 执行位。
  if (process.platform === "win32") return;
  try {
    const stat = fs.statSync(binaryPath);
    const USER_EXEC = 0o100;
    if (stat.mode & USER_EXEC) return; // 已可执行，幂等返回
    // 补全三组执行位（owner/group/other），与平台包 postinstall 的 `chmod u+x` 同义但更稳。
    fs.chmodSync(binaryPath, stat.mode | 0o111);
  } catch {
    // 自愈是 best-effort：补不上（如只读卷/权限不足）就放行，
    // 让 spawn 走它原本的失败路径，不在这里吞掉真实错误。
  }
}
