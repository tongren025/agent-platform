// 真 key 端到端验证：用「描述符解释器」对一家供应商真跑——拉模型 → 真生成 → 取结果。
// key 从环境变量读（如 SF_KEY），不写进文件、不回显明文。
// 用法：SF_KEY=sk-xxx node tests/transport-spike/realtest.mjs siliconflow
import { DESCRIPTORS } from "./descriptors.mjs";
import { buildRequest } from "./interpreter.mjs";

const id = process.argv[2] || "siliconflow";
const d = DESCRIPTORS.find((x) => x.id === id);
if (!d) { console.log("没有描述符:", id); process.exit(1); }
const key = process.env.SF_KEY || process.env.KEY || "";
if (!key) { console.log("缺 key：SF_KEY=... node ..."); process.exit(1); }
const mask = (k) => k.slice(0, 3) + "…" + k.slice(-3);

// 取值路径（支持 a.b / images[].url / data[0].url）
function pick(obj, path) {
  if (!path) return undefined;
  let cur = obj;
  for (const seg of path.replace(/\[\]/g, ".0").split(".")) {
    if (cur == null) return undefined;
    cur = cur[seg];
  }
  return cur;
}

async function main() {
  console.log(`=== 真跑 ${d.id}（${d.transport}）key=${mask(key)} ===\n`);

  // 1) 拉模型
  console.log("① 拉取模型 GET /v1/models …");
  let imageModels = [];
  try {
    const res = await fetch("https://api.siliconflow.cn/v1/models?sub_type=text-to-image", { headers: { authorization: `Bearer ${key}` } });
    const j = await res.json();
    const ids = (j.data || []).map((m) => m.id).filter(Boolean);
    imageModels = ids;
    console.log(`   HTTP ${res.status} | 图片模型 ${ids.length} 个：${ids.slice(0, 12).join(", ")}${ids.length > 12 ? " …" : ""}`);
  } catch (e) { console.log("   失败:", e.message); }

  // 2) 自动识别（对照本机档案 modelKey —— 这里简单按名字含 flux/kolors/qwen/sd 演示）
  const recognizable = imageModels.filter((m) => /flux|kolors|qwen|sd|stable|seedream|nano/i.test(m));
  console.log(`\n② 自动识别：${recognizable.length}/${imageModels.length} 个能按身份套档案（示例匹配）：${recognizable.slice(0, 6).join(", ")}`);

  // 3) 真生成一张图（用解释器构造请求）
  const model = imageModels.find((m) => /Kolors/i.test(m)) || imageModels[0];
  console.log(`\n③ 真生成：用 ${model} 出一张图 …`);
  const params = { model, prompt: "a small red cat sitting, studio soft light, photoreal", size: "1024x1024" };
  const req = buildRequest(d, params, key);
  console.log(`   解释器构造：POST ${req.url} | body=${JSON.stringify(req.body)}`);
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 60000);
    const res = await fetch(req.url, { method: "POST", headers: req.headers, body: JSON.stringify(req.body), signal: ctrl.signal });
    clearTimeout(t);
    const txt = await res.text();
    let j; try { j = JSON.parse(txt); } catch {}
    console.log(`   HTTP ${res.status}`);
    if (!res.ok) { console.log("   生成失败:", txt.slice(0, 200)); return; }
    // 用描述符的 responsePath 取结果 url
    const url = j ? pick(j, d.responsePath) : undefined;
    console.log(`   描述符 responsePath="${d.responsePath}" → 取到 url: ${url ? url.slice(0, 80) + "…" : "(没取到!)"}`);
    if (url) {
      // 4) 真把图拿回来
      const img = await fetch(url);
      const buf = Buffer.from(await img.arrayBuffer());
      const sig = buf.slice(0, 4).toString("hex");
      const isImg = sig.startsWith("ffd8") || sig.startsWith("8950") || sig.startsWith("5249") || sig.startsWith("4749");
      console.log(`\n④ 拉回结果图：${buf.length} 字节，magic=${sig} → ${isImg ? "✅ 是真图片" : "⚠️ 不像图片"}`);
      if (isImg) { const fs = await import("node:fs"); fs.writeFileSync("tests/ux/shots/sf-realgen.png", buf); console.log("   存到 tests/ux/shots/sf-realgen.png"); }
    }
  } catch (e) { console.log("   生成异常:", e.message); }
}
await main();
