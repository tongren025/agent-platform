// new-api 中转 verify-first 探测（Issue #8）：用真实 key 打一次完整回路，把三个**文档没给全的未知**
// 探明再写生产 catalog（避免「手配必漂」）：
//   ① 图片同步响应形状（data[0].url? b64_json? 还是别的字段）；该实例图片是同步还是异步
//   ② 视频提交响应里 task_id 的确切字段路径
//   ③ 视频轮询 `GET /v1/video/generations/{id}` 终态里**最终视频 url 的字段路径**（doc 没给）
//
// 不写进文件、不回显明文 key。用法（key 只本轮用，跑完可吊销）：
//   NEWAPI_BASE=https://你的中转 NEWAPI_KEY=sk-xxx \
//   NEWAPI_IMAGE_MODEL=dall-e-3 NEWAPI_VIDEO_MODEL=kling-v1 \
//   node tests/transport-spike/newapi.mjs
//   只测图片：省略 NEWAPI_VIDEO_MODEL。只测视频：省略 NEWAPI_IMAGE_MODEL。

const rawBase = (process.env.NEWAPI_BASE || "").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
const key = (process.env.NEWAPI_KEY || "").trim();
const imageModel = (process.env.NEWAPI_IMAGE_MODEL || "").trim();
const videoModel = (process.env.NEWAPI_VIDEO_MODEL || "").trim();

if (!rawBase || !key) {
  console.log("缺参数：NEWAPI_BASE=https://你的中转 NEWAPI_KEY=sk-xxx [NEWAPI_IMAGE_MODEL=..] [NEWAPI_VIDEO_MODEL=..] node tests/transport-spike/newapi.mjs");
  process.exit(1);
}
if (!imageModel && !videoModel) {
  console.log("至少给一个模型：NEWAPI_IMAGE_MODEL 或 NEWAPI_VIDEO_MODEL");
  process.exit(1);
}

const auth = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const mask = (s) => (s.length <= 8 ? "****" : `${s.slice(0, 4)}…${s.slice(-4)}`);
const PROMPT = "a calm sunrise over a quiet sea, gentle waves, cinematic";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function dump(label, obj) {
  const s = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  console.log(`${label}:\n${s.length > 4000 ? s.slice(0, 4000) + " …(截断)" : s}`);
}

async function probeImage() {
  console.log(`\n═══ ① 图片 · POST ${rawBase}/v1/images/generations · model=${imageModel} ═══`);
  const body = { model: imageModel, prompt: PROMPT, n: 1, size: "1024x1024" };
  let res;
  try {
    res = await fetch(`${rawBase}/v1/images/generations`, { method: "POST", headers: auth, body: JSON.stringify(body) });
  } catch (e) { console.log(`✗ 请求失败：${e?.message || e}`); return; }
  const text = await res.text().catch(() => "");
  let json; try { json = JSON.parse(text); } catch { json = null; }
  console.log(`HTTP ${res.status}`);
  dump("响应", json ?? text);
  // 给出字段定位提示，便于写 response_mapping。
  if (json?.data?.[0]) {
    const k = Object.keys(json.data[0]);
    console.log(`→ 同步返回：结果在 data[0]，字段=[${k.join(", ")}]（写 response_mapping image_url=data.0.${k.includes("url") ? "url" : k[0]}）`);
  } else if (json?.task_id || json?.data?.[0]?.task_id) {
    console.log("→ 注意：该实例图片是【异步】（返回了 task_id），需走轮询而非同步取图。");
  } else {
    console.log("→ 未识别到 data[0]/task_id，看上面原始响应定字段。");
  }
}

async function probeVideo() {
  console.log(`\n═══ ② 视频提交 · POST ${rawBase}/v1/video/generations · model=${videoModel} ═══`);
  const body = { model: videoModel, prompt: PROMPT };
  let res;
  try {
    res = await fetch(`${rawBase}/v1/video/generations`, { method: "POST", headers: auth, body: JSON.stringify(body) });
  } catch (e) { console.log(`✗ 提交失败：${e?.message || e}`); return; }
  const text = await res.text().catch(() => "");
  let json; try { json = JSON.parse(text); } catch { json = null; }
  console.log(`HTTP ${res.status}`);
  dump("提交响应", json ?? text);
  const taskId = json?.task_id || json?.id || json?.data?.task_id || json?.data?.[0]?.task_id;
  if (!taskId) { console.log("→ 没解析到 task_id，看原始响应定字段，无法继续轮询。"); return; }
  console.log(`→ task_id=${taskId}（字段路径见上面响应）`);

  console.log(`\n═══ ③ 视频轮询 · GET ${rawBase}/v1/video/generations/${taskId} ═══`);
  const terminal = new Set(["succeeded", "failed", "success", "completed", "error", "cancelled"]);
  for (let i = 0; i < 40; i++) {
    await sleep(i < 6 ? 5000 : i < 12 ? 10000 : 20000);
    let pr;
    try { pr = await fetch(`${rawBase}/v1/video/generations/${taskId}`, { headers: auth }); }
    catch (e) { console.log(`poll ${i + 1} 请求失败：${e?.message || e}`); continue; }
    const ptext = await pr.text().catch(() => "");
    let pjson; try { pjson = JSON.parse(ptext); } catch { pjson = null; }
    const status = String(pjson?.status || pjson?.task_status || "").toLowerCase();
    console.log(`poll ${i + 1}: HTTP ${pr.status} status=${status || "(无)"}`);
    if (terminal.has(status) || pr.status >= 400) {
      dump("终态完整响应（据此定『最终视频 url 字段路径』）", pjson ?? ptext);
      return;
    }
  }
  console.log("→ 轮询超时（40 次），看最后一次响应。");
}

console.log(`new-api 探测 · base=${rawBase} · key=${mask(key)}`);
if (imageModel) await probeImage();
if (videoModel) await probeVideo();
console.log("\n探测完成。把上面三段响应贴回来，我据此写生产 catalog 的 response_mapping。");
