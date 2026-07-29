// 2026-07-29 新接 5 个 apimart 模型的真实生成验证（R5 ④ E2E 闭环）：
//   Vidu Q3（参考生）· 可灵 3.0 Turbo（t2v）· HappyHorse 1.1（R2V 角色参考）·
//   Seedream 5.0 Pro（t2i）· Wan 2.7-R2V（image_with_roles 角色参考）
// body 与生产 catalog（electron/catalog/apimartVideos.ts / apimartImages.ts + 档案默认值）逐字对齐——
// 证明产品里这条路能出片，不是「文档理论通」。参数取最省额度档（最短时长/最低清晰度）。
//
// 在 electron 主进程内跑（safeStorage 解密真实存储的 apimart key，掩码显示不回显明文）：
//   ./node_modules/.bin/electron tests/transport-spike/apimart-new-models-20260729.cjs [case]
// case 缺省=全部；可传 vidu|klingturbo|hh11|seedream5pro|wanr2v 单跑。

const fs = require("node:fs");
const path = require("node:path");
const { app, safeStorage } = require("electron");

app.setName("nomi"); // 对齐 dev electron 的 keychain 项名（nomi Safe Storage）

const repoRoot = path.resolve(__dirname, "../..");
const { applySystemProxy } = require(path.join(repoRoot, "dist-electron/systemProxy.js"));

const BASE = "https://api.apimart.ai";
const mask = (k) => (k ? k.slice(0, 3) + "…" + k.slice(-3) : "(空)");
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (obj, p) => p.split(".").reduce((c, s) => (c == null ? c : c[s]), obj);

function loadApimartKey() {
  for (const dir of ["nomi", "Nomi"]) {
    const p = path.join(app.getPath("appData"), dir, "model-catalog.json");
    try {
      const c = JSON.parse(fs.readFileSync(p, "utf8"));
      const rec = c.apiKeysByVendor && c.apiKeysByVendor.apimart;
      if (!rec) continue;
      if (rec.enc === "safeStorage") {
        try {
          return safeStorage.decryptString(Buffer.from(rec.apiKey, "base64"));
        } catch {
          continue; // 该目录的 keychain ACL 不属于本进程，试下一个
        }
      }
      if (typeof rec.apiKey === "string" && rec.apiKey.startsWith("sk-")) return rec.apiKey;
    } catch {
      /* 没有该目录/文件，继续 */
    }
  }
  return "";
}

// 公网可达参考图（Unsplash CDN 直链，jpg，512px 档）——Vidu/HH/Wan 参考槽用。
const REF_IMG_1 = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=512&fm=jpg&fit=crop";
const REF_IMG_2 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=512&fm=jpg&fit=crop";

const PROMPT_IMG = "a single red paper crane on a wooden desk, soft window light, minimal";
const VPROMPT = "the person smiles and waves at the camera, slow cinematic push-in";
const IMG_RESULT = ["data.result.images.0.url.0", "data.result.images.0.url", "data.result.images.0"];
const VID_RESULT = ["data.result.videos.0.url.0", "data.result.videos.0.url", "data.result.videos.0"];

const CASES = {
  // Vidu Q3 标准变体（参考生，生产默认 720p/16:9，最短 3s；image_urls 1-7）
  vidu: {
    label: "Vidu Q3 参考生", path: "/v1/videos/generations", resultPaths: VID_RESULT,
    body: { model: "viduq3", prompt: VPROMPT, image_urls: [REF_IMG_1], duration: 3, resolution: "540p", aspect_ratio: "16:9" },
  },
  // 可灵 3.0 Turbo 文生视频（最短 3s / 720p）
  klingturbo: {
    label: "可灵 3.0 Turbo t2v", path: "/v1/videos/generations", resultPaths: VID_RESULT,
    body: { model: "kling-3.0-turbo", prompt: "a corgi running on the beach, golden hour", aspect_ratio: "16:9", resolution: "720p", duration: 3 },
  },
  // HappyHorse 1.1 角色参考（image_urls 触发 R2V 自动路由；720P / 3s）
  hh11: {
    label: "HappyHorse 1.1 R2V", path: "/v1/videos/generations", resultPaths: VID_RESULT,
    body: { model: "happyhorse-1.1", prompt: VPROMPT, image_urls: [REF_IMG_1], resolution: "720P", size: "16:9", duration: 3 },
  },
  // Seedream 5.0 Pro 文生图（1K 最省）
  seedream5pro: {
    label: "Seedream 5.0 Pro t2i", path: "/v1/images/generations", resultPaths: IMG_RESULT,
    body: { model: "doubao-seedream-5-0-pro", prompt: PROMPT_IMG, size: "1:1", resolution: "1K" },
  },
  // Wan 2.7-R2V 角色参考（image_with_roles 对象数组 = combineSlotsInto 产物形状；720P / 2s 最短）
  wanr2v: {
    label: "Wan 2.7-R2V 角色参考", path: "/v1/videos/generations", resultPaths: VID_RESULT,
    body: {
      model: "wan2.7-r2v", prompt: "the person walks forward and smiles, city street background",
      image_with_roles: [{ url: REF_IMG_2, role: "reference_image" }],
      resolution: "720P", size: "16:9", duration: 2,
    },
  },
};

async function run(auth, name) {
  const c = CASES[name];
  console.log(`\n──────── ${c.label} ────────`);
  console.log(`POST ${BASE}${c.path}  body=${JSON.stringify(c.body)}`);
  let res = await fetch(`${BASE}${c.path}`, { method: "POST", headers: auth, body: JSON.stringify(c.body) });
  const createText = await res.text();
  console.log(`create HTTP ${res.status} → ${createText.slice(0, 400)}`);
  let create;
  try { create = JSON.parse(createText); } catch { console.log("❌ create 非 JSON"); return false; }
  const taskId = pick(create, "data.0.task_id") || pick(create, "data.0.taskId");
  if (!taskId) { console.log("❌ 没拿到 data[0].task_id（请求形状/参数错）"); return false; }
  console.log(`✅ task_id = ${taskId} · 初始 status = ${pick(create, "data.0.status")}`);

  for (let i = 0; i < 96; i += 1) {
    await delay(5000);
    res = await fetch(`${BASE}/v1/tasks/${encodeURIComponent(taskId)}?language=zh`, { headers: { Authorization: auth.Authorization } });
    const text = await res.text();
    let poll;
    try { poll = JSON.parse(text); } catch { console.log(`轮询 ${i} 非 JSON: ${text.slice(0, 200)}`); continue; }
    const status = pick(poll, "data.status");
    process.stdout.write(`  [${i}] status=${status} progress=${pick(poll, "data.progress") ?? "-"}\n`);
    if (status === "completed") {
      console.log("✅ completed · data.result =", JSON.stringify(pick(poll, "data.result")).slice(0, 500));
      let url;
      for (const p of c.resultPaths) {
        url = pick(poll, p);
        if (typeof url === "string" && /^https?:/.test(url)) { console.log(`  ← 结果 URL 路径命中: ${p}`); break; }
        url = undefined;
      }
      if (!url) { console.log("⚠️ 未命中预期结果路径"); return false; }
      const head = await fetch(url, { method: "GET" });
      console.log(`  拉回 URL: HTTP ${head.status} · Content-Type=${head.headers.get("content-type")} → ${head.ok ? "✅ 真媒体" : "❌"}`);
      return head.ok;
    }
    if (status === "failed" || status === "cancelled") {
      console.log(`❌ ${status} · error=`, JSON.stringify(pick(poll, "data.error")));
      return false;
    }
  }
  console.log("⏱ 轮询超时（8min）");
  return false;
}

app.whenReady().then(async () => {
  try {
    await applySystemProxy();
  } catch (e) {
    console.log("systemProxy 应用失败（继续直连）:", String(e).slice(0, 120));
  }
  const key = loadApimartKey();
  console.log(`apimart 新模型验证 · key=${mask(key)} · safeStorage=${safeStorage.isEncryptionAvailable()}`);
  if (!key) { console.log("❌ 拿不到 apimart key"); app.exit(2); return; }
  const auth = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const arg = process.argv[2];
  const targets = arg && CASES[arg] ? [arg] : Object.keys(CASES);
  const results = {};
  for (const t of targets) results[t] = await run(auth, t);
  console.log("\n==== 汇总 ====");
  for (const [k, ok] of Object.entries(results)) console.log(`${ok ? "✅" : "❌"} ${CASES[k].label}`);
  app.exit(Object.values(results).every(Boolean) ? 0 : 1);
});
