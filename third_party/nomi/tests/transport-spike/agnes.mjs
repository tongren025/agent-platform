// Agnes AI 策展接入 verify-first：用真 key 端到端探一次完整回路，证明 electron/catalog/agnes*.ts
// 的生产 body/响应路径在真 API 上成立。body 形状逐字对齐生产 mapping（含 paramMap 派生的
// **字符串** width/height/num_frames——验「网关是否接受字符串数字」这个 mock 验不了的风险点）。
//
// key 从环境变量读，不写进文件、不回显明文：
//   AGNES_KEY=sk-xxx node tests/transport-spike/agnes.mjs          # 文本+工具调用 + 一张图 + 改图
//   AGNES_KEY=sk-xxx node tests/transport-spike/agnes.mjs video    # 加测一条最短视频
//
// 契约（照 wiki.agnes-ai.com/en/docs/*.md，本脚本核验）：
//   文本 POST /v1/chat/completions → { choices:[{message:{content|tool_calls}}] }
//   图片 POST /v1/images/generations → { data:[{url|b64_json}] }（同步）
//   视频 POST /v1/videos → { video_id, status:"queued" }；GET /agnesapi?video_id= → { status, remixed_from_video_id }

const BASE = "https://apihub.agnes-ai.com";
const key = process.env.AGNES_KEY || "";
if (!key) { console.log("缺 key：AGNES_KEY=sk-xxx node tests/transport-spike/agnes.mjs [video]"); process.exit(1); }
const mask = (k) => k.slice(0, 4) + "…" + k.slice(-3);
const auth = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
function pick(obj, path) { let cur = obj; for (const seg of path.split(".")) { if (cur == null) return undefined; cur = cur[seg]; } return cur; }

// ── 复刻 paramTranslate.ts 的 AGNES 视频派生（证明生产派生值在真 API 成立）──
const TIER = { "480p": 480, "720p": 720, "1080p": 1080 };
const r8 = (n) => Math.max(8, Math.round(n / 8) * 8);
function dims(aspect, res) { const [a, b] = aspect.split(":").map(Number); const s = TIER[res] ?? 720; const long = r8(s * (Math.max(a, b) / Math.min(a, b))); return a >= b ? [long, r8(s)] : [r8(s), long]; }
function numFrames(sec) { const n = Math.max(1, Math.round((sec * 24 - 1) / 8)); return Math.min(441, 8 * n + 1); }

const PROMPT = "a single red paper crane on a wooden desk, soft window light, minimal";
const VPROMPT = "a waterfall cascading down rocks forming a small rainbow, slow cinematic push-in";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers: auth, body: JSON.stringify(body) });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = null; }
  return { status: res.status, json, text };
}

console.log(`AGNES verify · key ${mask(key)}\n`);

// ── 1) 文本 + 工具调用（agent 大脑）──
{
  const body = {
    model: "agnes-2.0-flash",
    messages: [{ role: "user", content: "上海现在天气怎么样？用工具查。" }],
    tools: [{ type: "function", function: { name: "get_weather", description: "查某城市天气", parameters: { type: "object", properties: { city: { type: "string" } }, required: ["city"] } } }],
  };
  const r = await post("/v1/chat/completions", body);
  const msg = pick(r.json, "choices.0.message");
  const toolCall = msg?.tool_calls?.[0]?.function?.name;
  console.log(`[文本] HTTP ${r.status} · tool_use=${toolCall || "(无,纯文本)"} · content=${(msg?.content || "").slice(0, 40) || "(空)"}`);
  if (r.status !== 200) console.log("  ⚠️ 文本失败：", r.text.slice(0, 200));
}

// ── 2) 图片 文生图（生产 body：size + extra_body.response_format）──
let editInput = null;
{
  const body = { model: "agnes-image-2.1-flash", prompt: PROMPT, size: "1024x1024", extra_body: { response_format: "url" } };
  const r = await post("/v1/images/generations", body);
  const url = pick(r.json, "data.0.url");
  editInput = url;
  console.log(`[图·文生图] HTTP ${r.status} · data.0.url=${url ? url.slice(0, 60) + "…" : "(无)"}`);
  if (r.status !== 200) console.log("  ⚠️ ", r.text.slice(0, 300));
}

// ── 3) 图片 改图（生产 body：extra_body.image 数组 + response_format —— 验嵌套被正确解析）──
if (editInput) {
  const body = { model: "agnes-image-2.1-flash", prompt: "把背景换成蓝天白云", size: "1024x1024", extra_body: { image: [editInput], response_format: "url" } };
  const r = await post("/v1/images/generations", body);
  const url = pick(r.json, "data.0.url");
  console.log(`[图·改图] HTTP ${r.status} · extra_body.image 被接受=${r.status === 200} · data.0.url=${url ? url.slice(0, 50) + "…" : "(无)"}`);
  if (r.status !== 200) console.log("  ⚠️ ", r.text.slice(0, 300));
}

// ── 4) 视频（生产 body：派生的字符串 width/height/num_frames + frame_rate 数字 —— 验字符串数字被接受）──
if (process.argv.includes("video")) {
  const [w, h] = dims("16:9", "720p");
  const nf = numFrames(3); // 最短，省时
  // 逐字模拟生产渲染后的 body：transform 产出**数字**(AGNES Go 后端 int 严格)，frame_rate 字面量数字。
  const body = { model: "agnes-video-v2.0", prompt: VPROMPT, width: w, height: h, num_frames: nf, frame_rate: 24 };
  console.log(`[视频] 提交 body: width=${body.width} height=${body.height} num_frames=${body.num_frames} frame_rate=${body.frame_rate}(全数字)`);
  const sub = await post("/v1/videos", body);
  const videoId = pick(sub.json, "video_id");
  console.log(`[视频·提交] HTTP ${sub.status} · video_id=${videoId || "(无)"} · status=${pick(sub.json, "status")}`);
  if (sub.status !== 200) { console.log("  ⚠️ 字符串数字可能被拒：", sub.text.slice(0, 400)); }
  else if (videoId) {
    for (let i = 0; i < 60; i++) {
      await delay(5000);
      const res = await fetch(`${BASE}/agnesapi?video_id=${encodeURIComponent(videoId)}`, { headers: auth });
      const j = await res.json().catch(() => null);
      const st = pick(j, "status");
      process.stdout.write(`\r  轮询 ${i + 1}: status=${st} progress=${pick(j, "progress") ?? "?"}    `);
      if (st === "completed") { console.log(`\n[视频·成品] remixed_from_video_id=${pick(j, "remixed_from_video_id")}`); break; }
      if (st === "failed") { console.log(`\n  ⚠️ 失败：`, JSON.stringify(j).slice(0, 300)); break; }
    }
  }
}
console.log("\n✅ verify 完成");
