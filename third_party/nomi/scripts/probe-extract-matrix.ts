#!/usr/bin/env tsx
/**
 * Offline extraction stress test across real relay-station docs.
 * Fetches each doc's live HTML and runs the full deterministic extraction
 * stack (the exact functions the agent's fetch_raw_docs uses). No LLM, no key.
 *
 * Proves: does the param-extraction layer generalize across platforms?
 */
import { extractOpenApiOperations, extractDehydratedParameters, extractEmbeddedParameterData, extractSpecLinks } from "../electron/ai/onboarding/specExtractors";
import { extractTables, extractCurlExamples } from "../electron/ai/onboarding/docExtractors";

const DOCS: Array<{ label: string; url: string }> = [
  { label: "kie GPT Image-2 (image)", url: "https://docs.kie.ai/market/gpt/gpt-image-2-text-to-image" },
  { label: "kie Seedance v1-pro t2v (video)", url: "https://docs.kie.ai/market/bytedance/v1-pro-text-to-video" },
  { label: "kie Grok-imagine t2v (x-apidog-enum case)", url: "https://docs.kie.ai/market/grok-imagine/text-to-video" },
  { label: "kie Hailuo 02 t2v pro (video)", url: "https://docs.kie.ai/market/hailuo/02-text-to-video-pro" },
  { label: "kie Seedream v4 t2i (image)", url: "https://docs.kie.ai/market/seedream/seedream-v4-text-to-image" },
  { label: "kie Z-Image (image)", url: "https://docs.kie.ai/market/z-image/z-image" },
  { label: "Replicate veo-3 (OpenAPI)", url: "https://replicate.com/google/veo-3" },
  { label: "Replicate flux-pro (OpenAPI)", url: "https://replicate.com/black-forest-labs/flux-1.1-pro" },
  { label: "fal.ai flux-pro (Next/RSC)", url: "https://fal.ai/models/fal-ai/flux-pro" },
];

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function summarizeFields(ops: { method?: string; path?: string; fields: Array<{ key: string; type: string; options?: Array<{ value: string }> }> }[]): string {
  if (!ops.length) return "—";
  return ops
    .map((op) => {
      const head = `${op.method || "?"} ${op.path || "?"}`;
      const fields = op.fields
        .map((f) => `${f.key}${f.options ? `[${f.options.length}]` : ""}`)
        .join(", ");
      return `${head} :: ${fields || "(no fields)"}`;
    })
    .join(" | ");
}

async function main() {
  for (const doc of DOCS) {
    console.log("\n══════════════════════════════════════════════════════");
    console.log(`▶ ${doc.label}`);
    console.log(`  ${doc.url}`);
    let html = "";
    try {
      html = await fetchHtml(doc.url);
    } catch (e) {
      console.log(`  ✗ fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      continue;
    }
    console.log(`  html: ${(html.length / 1024).toFixed(0)} KB`);

    const openapi = extractOpenApiOperations(html);
    const dehydrated = extractDehydratedParameters(html);
    const tables = extractTables(html);
    const curls = extractCurlExamples(html);
    const digest = extractEmbeddedParameterData(html);

    console.log(`  tables: ${tables.length} | curls: ${curls.length}`);
    console.log(`  [1] OpenAPI ops:      ${summarizeFields(openapi as any)}`);
    console.log(`  [2] dehydrated ops:   ${summarizeFields(dehydrated as any)}`);

    // R2: when nothing is embedded, follow candidate spec links (fal.ai etc.).
    let followed: Awaited<ReturnType<typeof extractOpenApiOperations>> = [];
    if (!openapi.length && !dehydrated.length) {
      const links = extractSpecLinks(html, doc.url);
      if (links.length) console.log(`  [R2] spec links:      ${links.join(" , ")}`);
      for (const link of links) {
        try {
          const specOps = extractOpenApiOperations(await fetchHtml(link));
          if (specOps.length) {
            followed = specOps;
            console.log(`  [R2] followed ops:    ${summarizeFields(specOps as any)}`);
            break;
          }
        } catch {
          /* unreachable / not JSON — try next */
        }
      }
    }

    const chosen = openapi.length ? "OpenAPI" : dehydrated.length ? "dehydrated" : followed.length ? "followed-spec(R2)" : tables.length ? "tables" : curls.length ? "curl" : digest.found ? "digest" : "NONE";
    console.log(`  → agent path: ${chosen}${chosen === "NONE" ? "  ⚠️" : ""}`);
    if (chosen === "digest") console.log(`     digest excerpt len: ${digest.excerpt.length}`);
  }
  console.log("\n══════════════════════════════════════════════════════");
}

void main();
