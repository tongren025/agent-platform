#!/usr/bin/env tsx
/**
 * Analyze trace.json files from onboarding trials.
 *
 * Goal: get real numbers behind token usage so we can do data-driven
 * optimization instead of guessing.
 *
 * Reports per trial:
 *  - system prompt size (chars + approx tokens)
 *  - each tool result size + total
 *  - duplicate fetches (same URL)
 *  - cumulative message size growth per LLM round
 *  - which tool category dominates the prompt
 *
 * Token estimate: ~4 chars per token for English / JSON-heavy text.
 * Not exact but good enough for relative comparison.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSystemPrompt } from "../electron/ai/onboarding/systemPrompt";
import type { ModelKind } from "../electron/ai/onboarding/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const trialsRoot = path.resolve(__dirname, "..", "docs", "onboarding-trials");

const APPROX_CHARS_PER_TOKEN = 4;

function approxTokens(text: string): number {
  return Math.round(text.length / APPROX_CHARS_PER_TOKEN);
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function analyzeTrial(trialDir: string) {
  const traceFile = path.join(trialDir, "trace.json");
  if (!fs.existsSync(traceFile)) return null;
  const trace = JSON.parse(fs.readFileSync(traceFile, "utf8")) as any[];

  const start = trace.find((e) => e.type === "trial-start");
  const end = trace.find((e) => e.type === "trial-end");
  if (!start || !end) return null;

  const targetKind: ModelKind = start.targetKind;
  const docsUrl: string = start.docsUrl;

  // System prompt size
  const systemPrompt = buildSystemPrompt(targetKind, docsUrl);
  const systemTokens = approxTokens(systemPrompt);

  // Tool result sizes
  const toolResultSizes: Array<{ name: string; chars: number; tokens: number; index: number }> = [];
  let resultIndex = 0;
  for (const ev of trace) {
    if (ev.type === "tool-result") {
      const serialized = JSON.stringify(ev.result || {});
      toolResultSizes.push({
        name: ev.toolName,
        chars: serialized.length,
        tokens: approxTokens(serialized),
        index: resultIndex++,
      });
    }
  }

  // Fetch URL stats
  const fetchUrls: string[] = [];
  for (const ev of trace) {
    if (ev.type === "tool-call" && ev.toolName === "fetch_raw_docs") {
      fetchUrls.push(ev.args?.url || "");
    }
  }
  const fetchCounts: Record<string, number> = {};
  for (const url of fetchUrls) {
    fetchCounts[url] = (fetchCounts[url] || 0) + 1;
  }
  const duplicateFetches = Object.entries(fetchCounts).filter(([_, n]) => n > 1);

  // Cumulative message size per LLM step
  // Each step sees: system + user + all prior tool calls + results so far
  const USER_MSG_TOKENS = 50;  // approx
  let runningToolBytesTokens = 0;
  const perStep: Array<{ step: number; cumulativeTokens: number; deltaFromPrior: number }> = [];
  let stepCount = 0;
  for (const ev of trace) {
    if (ev.type === "tool-call") {
      // tool call args estimated
      runningToolBytesTokens += approxTokens(JSON.stringify(ev.args || {})) + 50; // overhead
    }
    if (ev.type === "tool-result") {
      runningToolBytesTokens += approxTokens(JSON.stringify(ev.result || {})) + 50;
    }
    if (ev.type === "llm-step") {
      stepCount = ev.stepIndex;
      const prior = perStep.length > 0 ? perStep[perStep.length - 1].cumulativeTokens : 0;
      const cumulative = systemTokens + USER_MSG_TOKENS + runningToolBytesTokens;
      perStep.push({
        step: stepCount,
        cumulativeTokens: cumulative,
        deltaFromPrior: cumulative - prior,
      });
    }
  }

  // The total prompt tokens sent across all rounds:
  // sum of cumulative messages from each LLM call (because each round re-sends)
  // Note: real number is what the LLM actually billed; our estimate is what we sent.
  const ourEstimatedTotalPrompt = perStep.reduce((acc, s) => acc + s.cumulativeTokens, 0);
  const reportedTotalPrompt = end.outcome?.tokenUsage?.promptTokens || 0;
  const reportedCompletion = end.outcome?.tokenUsage?.completionTokens || 0;
  const reportedTotal = reportedTotalPrompt + reportedCompletion;

  // Identify biggest tool results
  const sortedBySize = [...toolResultSizes].sort((a, b) => b.tokens - a.tokens);

  return {
    trialId: start.trialId,
    docsUrl,
    targetKind,
    status: end.outcome?.status,
    systemTokens,
    rounds: perStep.length,
    toolResults: toolResultSizes,
    biggestResults: sortedBySize.slice(0, 5),
    fetchCounts,
    duplicateFetches,
    perStep,
    reported: { promptTokens: reportedTotalPrompt, completionTokens: reportedCompletion, total: reportedTotal },
    ourEstimateOfTotalPromptIfNoCache: ourEstimatedTotalPrompt,
  };
}

function reportTrial(t: NonNullable<ReturnType<typeof analyzeTrial>>) {
  console.log("");
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(` Trial ${t.trialId} — ${t.status}`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(` Docs: ${t.docsUrl}`);
  console.log(` Kind: ${t.targetKind}`);
  console.log(` Rounds: ${t.rounds}`);
  console.log("");
  console.log(` Token accounting:`);
  console.log(`   System prompt:        ${fmt(t.systemTokens)} tokens (sent each round)`);
  console.log(`   System prompt × rounds = ${fmt(t.systemTokens * t.rounds)} cumulative`);
  console.log(`   Tool results total:   ${fmt(t.toolResults.reduce((a, r) => a + r.tokens, 0))} tokens (sum, single instance)`);
  console.log(`   Our est. of total sent (no cache): ${fmt(t.ourEstimateOfTotalPromptIfNoCache)} tokens`);
  console.log(`   Provider reported total prompt:    ${fmt(t.reported.promptTokens)} tokens`);
  if (t.reported.promptTokens > 0 && t.ourEstimateOfTotalPromptIfNoCache > 0) {
    const ratio = t.reported.promptTokens / t.ourEstimateOfTotalPromptIfNoCache;
    console.log(`   Ratio (reported/estimate):         ${(ratio * 100).toFixed(0)}% (lower = cache likely active)`);
  }
  console.log("");
  console.log(` Top 5 biggest tool results (single instance):`);
  for (const r of t.biggestResults) {
    console.log(`   ${r.name.padEnd(28)} ${fmt(r.tokens).padStart(8)} tokens (${fmt(r.chars)} chars)`);
  }
  console.log("");
  console.log(` Fetch frequency:`);
  for (const [url, n] of Object.entries(t.fetchCounts)) {
    const tag = n > 1 ? `⚠ ${n}×` : `${n}×`;
    console.log(`   ${tag.padStart(6)} ${url.slice(0, 80)}`);
  }
  if (t.duplicateFetches.length > 0) {
    console.log(`   → ${t.duplicateFetches.length} unique URL(s) re-fetched`);
  }
  console.log("");
  console.log(` Per-round cumulative size (approx tokens sent that round):`);
  for (const s of t.perStep) {
    const bar = "█".repeat(Math.min(60, Math.round(s.cumulativeTokens / 1000)));
    console.log(`   step ${String(s.step).padStart(2)}: ${fmt(s.cumulativeTokens).padStart(8)} ${bar} (+${fmt(s.deltaFromPrior)})`);
  }
}

function summarizeAll(reports: Array<NonNullable<ReturnType<typeof analyzeTrial>>>) {
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(" Summary across all trials");
  console.log("═══════════════════════════════════════════════════════════════");
  const avgSystem = reports.reduce((a, r) => a + r.systemTokens, 0) / reports.length;
  const avgRounds = reports.reduce((a, r) => a + r.rounds, 0) / reports.length;
  const avgReportedPrompt = reports.reduce((a, r) => a + r.reported.promptTokens, 0) / reports.length;
  console.log(` Avg system prompt:    ${fmt(Math.round(avgSystem))} tokens (${((avgSystem / avgReportedPrompt) * 100).toFixed(1)}% of avg total)`);
  console.log(` Avg rounds:           ${avgRounds.toFixed(1)}`);
  console.log(` Avg reported prompt:  ${fmt(Math.round(avgReportedPrompt))} tokens`);
  console.log("");

  // Aggregate biggest tool result by category
  const totalByName: Record<string, { calls: number; tokens: number }> = {};
  for (const r of reports) {
    for (const tr of r.toolResults) {
      if (!totalByName[tr.name]) totalByName[tr.name] = { calls: 0, tokens: 0 };
      totalByName[tr.name].calls += 1;
      totalByName[tr.name].tokens += tr.tokens;
    }
  }
  console.log(` Tool result tokens, aggregated across all ${reports.length} trials:`);
  const sorted = Object.entries(totalByName).sort(([, a], [, b]) => b.tokens - a.tokens);
  for (const [name, info] of sorted) {
    console.log(`   ${name.padEnd(28)} ${fmt(info.tokens).padStart(10)} tokens across ${info.calls} calls (avg ${fmt(Math.round(info.tokens / info.calls))})`);
  }
}

function main() {
  const dirs = fs
    .readdirSync(trialsRoot)
    .filter((name) => /^\d{4}-\d{2}-\d{2}/.test(name))
    .map((name) => path.join(trialsRoot, name));

  const onlySuccess = process.argv.includes("--success-only");
  const reports = dirs
    .map(analyzeTrial)
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .filter((r) => (onlySuccess ? r.rounds > 0 && r.reported.promptTokens > 0 : true));

  if (reports.length === 0) {
    console.error("No trials found in", trialsRoot);
    process.exit(1);
  }

  for (const r of reports) reportTrial(r);
  summarizeAll(reports);
}

main();
