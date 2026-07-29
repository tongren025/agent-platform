// 内置「表情预设」包预设图生成器（可复跑，断点续跑）。
// 通道：kie GPT Image 2（契约=electron/catalog/kieGptImage2.ts + assetLocalization.ts 的生产实测形状）。
// 流程：t2i 男/女中性定妆底图 → kie 文件托管取公网 URL → 每条提示词对两底图各 i2i 一次
//       （逐字用库里的 prompt，预设图本身就是提示词质检）→ 男左女右横拼精确 4:3 → 960×720 webp。
// 在 electron 主进程内跑（safeStorage 解 kie key；net.fetch 走 Chromium 栈自带系统代理）：
//   ./node_modules/.bin/electron scripts/generate-expression-pack-media.cjs [--skip-existing]
// 中间产物落 .tmp/expression-pack/（git 已忽略），已存在即跳过 → 失败单条重跑不重付全量。
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { app, net, safeStorage } = require("electron");

app.setName("nomi"); // 对齐 dev electron 写 keychain 的应用名，否则 safeStorage 解不开

const repoRoot = path.resolve(__dirname, "..");
const PACK = JSON.parse(fs.readFileSync(path.join(repoRoot, "electron/promptLibrary/builtinExpressionPack.json"), "utf8"));
const WORK = path.join(repoRoot, ".tmp/expression-pack");
const OUT_DIR = path.join(repoRoot, "public/prompt-media/expressions");
const KIE_BASE = "https://api.kie.ai";
const UPLOAD_ENDPOINT = "https://kieai.redpandaai.co/api/file-base64-upload";
const T2I_MODEL = "gpt-image-2-text-to-image";
const I2I_MODEL = "gpt-image-2-image-to-image";
const POLL_MS = 5000;
const TIMEOUT_MS = 8 * 60 * 1000;
const CONCURRENCY = 4;
const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";

const BASE_PROMPTS = {
  m: "正面头肩肖像照，一位28岁左右的中国男性演员，短黑发，穿深灰色圆领毛衣，面部表情完全中性平静，双眼平视镜头，嘴唇自然闭合，均匀柔和的影棚灯光，浅灰色纯色背景，真实摄影风格，细节清晰，人物居中",
  f: "正面头肩肖像照，一位26岁左右的中国女性演员，黑色中长直发，穿米白色圆领上衣，面部表情完全中性平静，双眼平视镜头，嘴唇自然闭合，均匀柔和的影棚灯光，浅灰色纯色背景，真实摄影风格，细节清晰，人物居中",
};

const mask = (k) => (k ? `${k.slice(0, 3)}…${k.slice(-3)}` : "(空)");
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function loadKieKey() {
  for (const dir of ["nomi", "Nomi"]) {
    const p = path.join(app.getPath("appData"), dir, "model-catalog.json");
    try {
      const rec = JSON.parse(fs.readFileSync(p, "utf8")).apiKeysByVendor?.kie;
      if (!rec?.apiKey) continue;
      if (rec.enc === "safeStorage") {
        try {
          const plain = safeStorage.decryptString(Buffer.from(rec.apiKey, "base64"));
          if (plain) {
            console.log(`[key] kie ← ${dir}/model-catalog.json (${mask(plain)})`);
            return plain;
          }
        } catch (e) {
          console.log(`[key] ${dir} 解密失败（keychain ACL?）: ${e.message}`);
        }
        continue;
      }
      console.log(`[key] kie ← ${dir}（明文存储）`);
      return rec.apiKey;
    } catch {
      /* 该目录无 catalog → 试下一个 */
    }
  }
  throw new Error("两个 userData 目录都拿不到 kie key");
}

async function kieJson(url, init) {
  const res = await net.fetch(url, init);
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  const json = JSON.parse(text);
  // kie（Java/Spring 系）惯例：HTTP 200 但 body.code 非 200 也是失败（见 vendorHttp.ts:170）
  if (typeof json.code === "number" && json.code !== 200) throw new Error(`kie code ${json.code}: ${json.msg || json.message || ""}`);
  return json;
}

function authHeaders(key) {
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function createTask(key, model, input) {
  const json = await kieJson(`${KIE_BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: authHeaders(key),
    body: JSON.stringify({ model, input }),
  });
  const taskId = json?.data?.taskId;
  if (!taskId) throw new Error(`createTask 无 taskId: ${JSON.stringify(json).slice(0, 200)}`);
  return taskId;
}

async function pollResult(key, taskId) {
  const started = Date.now();
  for (;;) {
    if (Date.now() - started > TIMEOUT_MS) throw new Error(`轮询超时 taskId=${taskId}`);
    await delay(POLL_MS);
    const json = await kieJson(`${KIE_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const state = String(json?.data?.state || "").toLowerCase();
    if (["success", "succeeded", "completed"].includes(state)) {
      let resultJson = json?.data?.resultJson;
      if (typeof resultJson === "string") resultJson = JSON.parse(resultJson);
      const url = resultJson?.resultUrls?.[0];
      if (!url) throw new Error(`成功但无 resultUrls: ${JSON.stringify(json?.data).slice(0, 200)}`);
      return url;
    }
    if (["fail", "failed", "error", "expired"].includes(state)) {
      throw new Error(`任务失败(${state}): ${json?.data?.failMsg || "无 failMsg"}`);
    }
  }
}

async function download(url, filePath) {
  const res = await net.fetch(url);
  if (!res.ok) throw new Error(`下载 HTTP ${res.status}: ${url}`);
  fs.writeFileSync(filePath, Buffer.from(await res.arrayBuffer()));
}

async function uploadBase64(key, filePath) {
  const dataUrl = `data:image/png;base64,${fs.readFileSync(filePath).toString("base64")}`;
  const json = await kieJson(UPLOAD_ENDPOINT, {
    method: "POST",
    headers: authHeaders(key),
    body: JSON.stringify({ base64Data: dataUrl, uploadPath: "images/nomi", fileName: path.basename(filePath) }),
  });
  const url = json?.data?.downloadUrl;
  if (!url) throw new Error(`上传无 downloadUrl: ${JSON.stringify(json).slice(0, 200)}`);
  return url;
}

async function withRetry(label, fn, attempts = 3) {
  let lastErr;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      console.log(`  [retry ${i}/${attempts}] ${label}: ${e.message}`);
      if (i < attempts) await delay(3000 * i);
    }
  }
  throw lastErr;
}

/** 并发池：跑完全部任务，收集失败不中断（最后统一报）。 */
async function runPool(tasks, size) {
  const failures = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(size, tasks.length) }, async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= tasks.length) return;
      try {
        await tasks[index]();
      } catch (e) {
        failures.push(e.message);
      }
    }
  });
  await Promise.all(workers);
  return failures;
}

function compositeToWebp(malePng, femalePng, outWebp) {
  // 每张 3:4 底裁成 2:3（中心裁宽）→ 480×720 → 横拼 = 960×720 精确 4:3，与卡片比例一致零黑边。
  // homebrew ffmpeg 无 libwebp 编码器 → ffmpeg 只负责拼图出 PNG，webp 交给 cwebp（brew webp）。
  const half = "crop='min(iw,ih*2/3)':ih,scale=480:720:flags=lanczos";
  const tmpPng = `${outWebp}.tmp.png`;
  execFileSync(FFMPEG, [
    "-y", "-i", malePng, "-i", femalePng,
    "-filter_complex", `[0:v]${half}[l];[1:v]${half}[r];[l][r]hstack=inputs=2`,
    "-frames:v", "1", tmpPng,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  try {
    execFileSync(process.env.CWEBP_PATH || "cwebp", ["-q", "82", tmpPng, "-o", outWebp], { stdio: ["ignore", "ignore", "pipe"] });
  } finally {
    fs.rmSync(tmpPng, { force: true });
  }
}

async function main() {
  await app.whenReady();
  const key = loadKieKey();
  for (const dir of [WORK, path.join(WORK, "base"), path.join(WORK, "raw"), OUT_DIR]) fs.mkdirSync(dir, { recursive: true });

  let generations = 0;

  // ── 底图（男/女各一，已存在即复用；公网 URL 缓存 ~3 天有效期内复用）──
  const baseUrls = {};
  for (const gender of ["m", "f"]) {
    const png = path.join(WORK, "base", `${gender}.png`);
    const urlFile = path.join(WORK, "base", `${gender}.url.txt`);
    if (!fs.existsSync(png)) {
      console.log(`[base] 生成${gender === "m" ? "男" : "女"}性定妆底图…`);
      await withRetry(`base-${gender}`, async () => {
        const taskId = await createTask(key, T2I_MODEL, { prompt: BASE_PROMPTS[gender], aspect_ratio: "3:4", resolution: "1K" });
        await download(await pollResult(key, taskId), png);
      });
      generations += 1;
      fs.rmSync(urlFile, { force: true }); // 新底图 → 旧公网 URL 作废
    }
    const cached = fs.existsSync(urlFile) && Date.now() - fs.statSync(urlFile).mtimeMs < 60 * 60 * 1000 * 60;
    if (cached) {
      baseUrls[gender] = fs.readFileSync(urlFile, "utf8").trim();
    } else {
      baseUrls[gender] = await withRetry(`upload-${gender}`, () => uploadBase64(key, png));
      fs.writeFileSync(urlFile, baseUrls[gender]);
    }
    console.log(`[base] ${gender} 就绪`);
  }

  // ── 50 次 i2i（断点续跑：raw 已有即跳过）──
  const edits = [];
  for (const entry of PACK) {
    for (const gender of ["m", "f"]) {
      const raw = path.join(WORK, "raw", `${entry.id}-${gender}.png`);
      if (fs.existsSync(raw)) continue;
      edits.push(async () => {
        await withRetry(`${entry.id}-${gender}`, async () => {
          const taskId = await createTask(key, I2I_MODEL, {
            prompt: entry.prompt,
            input_urls: [baseUrls[gender]],
            aspect_ratio: "3:4",
            resolution: "1K",
          });
          await download(await pollResult(key, taskId), raw);
        });
        generations += 1;
        console.log(`[i2i] ${entry.id}-${gender} 完成`);
      });
    }
  }
  console.log(`[i2i] 待生成 ${edits.length} 张（并发 ${CONCURRENCY}）`);
  const failures = await runPool(edits, CONCURRENCY);

  // ── 合成（两性都齐才拼；webp 落 public/）──
  let composed = 0;
  for (const entry of PACK) {
    const male = path.join(WORK, "raw", `${entry.id}-m.png`);
    const female = path.join(WORK, "raw", `${entry.id}-f.png`);
    const out = path.join(OUT_DIR, `${entry.id}.webp`);
    if (!fs.existsSync(male) || !fs.existsSync(female)) continue;
    compositeToWebp(male, female, out);
    composed += 1;
  }

  console.log(`\n[done] 本次真实生成 ${generations} 次；合成 ${composed}/${PACK.length} 张 → ${path.relative(repoRoot, OUT_DIR)}`);
  if (failures.length) {
    console.log(`[fail] ${failures.length} 条失败（重跑本脚本会只补这些）：\n  - ${failures.join("\n  - ")}`);
    app.exit(1);
    return;
  }
  app.exit(0);
}

main().catch((e) => {
  console.error(`[fatal] ${e.stack || e.message}`);
  app.exit(1);
});
