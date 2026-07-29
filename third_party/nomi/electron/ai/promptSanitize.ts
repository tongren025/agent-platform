/**
 * Prompt-text sanitization for broad model compatibility.
 *
 * Different model tokenizers have wildly different Unicode handling.
 * Moonshot's tokenizer chokes on em-dashes; some Chinese models reject
 * certain math symbols; old GPT-3 tokenizers struggled with emojis.
 *
 * Rule of thumb: any text we send TO a model (system prompt, tool
 * descriptions, user messages) should be ASCII-portable. UI text and
 * developer-facing strings can keep their fancy typography.
 *
 * This module is the single chokepoint for prompt cleanup. Apply it
 * wherever a string is about to be sent to an LLM.
 */

// Use unicode escapes so the source is unambiguous across editors / linters.
const ZERO_WIDTH = /[​‌‍‎‏‪-‮⁠﻿]/g;
const SPECIAL_SPACE = /[  - 　]/g;
const EM_DASH_LIKE = /[—―]/g;          // — ―
const EN_DASH = /–/g;                       // –
const UNICODE_MINUS = /−/g;                 // −
const CURLY_SINGLE_QUOTES = /[‘’‚‛]/g;
const CURLY_DOUBLE_QUOTES = /[“”„‟]/g;
const ELLIPSIS = /…/g;
const ARROWS = /[←→⇐⇒]/g;    // ← → ⇐ ⇒
const BULLETS = /[•‣◦⁃]/g;

/**
 * Replace non-portable Unicode with ASCII equivalents.
 */
export function sanitizeForBroadCompat(input: string): string {
  if (!input) return input;
  return input
    .replace(EM_DASH_LIKE, " - ")
    .replace(EN_DASH, "-")
    .replace(UNICODE_MINUS, "-")
    .replace(CURLY_SINGLE_QUOTES, "'")
    .replace(CURLY_DOUBLE_QUOTES, '"')
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/≠/g, "!=")
    .replace(/≈/g, "~=")
    .replace(/×/g, "x")
    .replace(/÷/g, "/")
    .replace(ELLIPSIS, "...")
    .replace(ARROWS, "->")
    .replace(SPECIAL_SPACE, " ")
    .replace(ZERO_WIDTH, "")
    .replace(BULLETS, "*");
}

/**
 * Walk an object and apply sanitization to every string leaf.
 * Used to clean nested tool-schema descriptions before sending.
 */
export function sanitizeObjectStrings<T>(value: T): T {
  if (value == null) return value;
  if (typeof value === "string") return sanitizeForBroadCompat(value) as unknown as T;
  if (Array.isArray(value)) return value.map(sanitizeObjectStrings) as unknown as T;
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeObjectStrings(v);
    }
    return out as unknown as T;
  }
  return value;
}
