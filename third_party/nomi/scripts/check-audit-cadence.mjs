#!/usr/bin/env node
// 审计节奏提醒（CLAUDE.md 规则 14）：距上次落盘的 docs/audit/ 文档已积累多少 main commit。
// 超过阈值就提醒"该跑一轮多维审计了"。只提醒、不阻断（审计是判断活，不该被 CI 卡死）。
//
// 用法：node scripts/check-audit-cadence.mjs    （或 pnpm run check:audit）
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT_DIR = path.join(ROOT, "docs/audit");
const THRESHOLD = 25; // 距上次审计 ≥ 25 个 main commit 就提醒

function git(args) {
  return execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8" }).trim();
}

// 最近一次 docs/audit/ 下任意文件被改动的 commit。
let lastAuditCommit = "";
try {
  lastAuditCommit = git('log -1 --format=%H -- docs/audit');
} catch {
  /* 无 git 或无记录 */
}

if (!lastAuditCommit) {
  console.log("审计节奏：未找到 docs/audit 历史，建议尽快做一轮基线审计。");
  process.exit(0);
}

let count = 0;
try {
  count = Number(git(`rev-list --count ${lastAuditCommit}..HEAD`)) || 0;
} catch {
  count = 0;
}

const lastDate = (() => {
  try {
    return git(`log -1 --format=%cs ${lastAuditCommit}`);
  } catch {
    return "?";
  }
})();

if (count >= THRESHOLD) {
  console.warn(
    `\n⚠️ 审计节奏提醒（规则 14）：距上次审计（${lastDate}）已 ${count} 个 commit ≥ ${THRESHOLD}。\n` +
      `该跑一轮多维审计了：6 角色（规则 7）+ 技术栈/语言/Agent/架构/测试/产品多维度 subagent，\n` +
      `落 docs/audit/<date>-*.md，清 P0、余项排路线、方案级留用户拍板，并跑 Playwright 走查（规则 13）。\n` +
      `其中「结构/UX 冗余」维度跑 nomi-ux-audit 技能（同一把尺子五路并行），更新 docs/audit/redundancy-backlog.md 活路线图。\n`,
  );
} else {
  console.log(`审计节奏：距上次审计（${lastDate}）${count}/${THRESHOLD} 个 commit，未到提醒线。`);
}
process.exit(0);
