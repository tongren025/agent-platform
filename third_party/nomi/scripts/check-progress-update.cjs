#!/usr/bin/env node
/**
 * commit-msg hook 调用此脚本。
 *
 * 规则：如果 commit message 包含形如 [E.2C-XX] 的 task id 引用，
 *      则必须在同一 commit 的暂存修改中，把 §10 进度表对应行更新为 ✓。
 *
 * 设计理由：见 docs/plans/2026-05-25-phase-e2-completion-and-tech-uplift.md §0。
 * 上一次 Phase E.2 spec 不被 executor 尊重的教训：progress 表全是 ⏸ 但代码已落地。
 *
 * 用法：作为 .git/hooks/commit-msg 的目标被调用，$1 = commit message file path。
 */
'use strict'

const fs = require('node:fs')
const { execSync } = require('node:child_process')

const PLAN_PATH = 'docs/plans/2026-05-25-phase-e2-completion-and-tech-uplift.md'
const TASK_PATTERN = /\[E\.2C-[0-9A-Za-z]+\]/

const msgFile = process.argv[2]
if (!msgFile || !fs.existsSync(msgFile)) {
  // 没拿到消息文件，放行（不阻塞非 commit-msg 调用场景）
  process.exit(0)
}

const msg = fs.readFileSync(msgFile, 'utf8')
const match = msg.match(TASK_PATTERN)
if (!match) {
  // commit message 不含 task id，放行
  process.exit(0)
}

const taskId = match[0].slice(1, -1) // 去掉 [ ]

let diff = ''
try {
  diff = execSync(`git diff --cached --unified=0 -- "${PLAN_PATH}"`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
} catch (_err) {
  diff = ''
}

if (!diff.trim()) {
  console.error(`\nERROR: commit references ${taskId} but ${PLAN_PATH} was not modified.`)
  console.error(`Update §10 progress table to mark ${taskId} as ✓ in the same commit.\n`)
  process.exit(1)
}

const addedLines = diff
  .split('\n')
  .filter((line) => line.startsWith('+') && !line.startsWith('+++'))

const ok = addedLines.some((line) => line.includes(taskId) && line.includes('✓'))
if (!ok) {
  console.error(`\nERROR: commit references ${taskId} but §10 progress table does not mark it ✓ in this commit.`)
  console.error(`Update the row for ${taskId} from ⏸ to ✓ in ${PLAN_PATH} §10.\n`)
  process.exit(1)
}

process.exit(0)
