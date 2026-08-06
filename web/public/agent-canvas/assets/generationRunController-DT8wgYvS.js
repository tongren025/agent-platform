import { c3 as h, co as be, d8 as N, cn as Be, cf as je, bB as Le, bE as L, aW as U, dp as Ge, dn as We, cE as Oe, bb as ze, av as qe, dy as ve, c_ as ie, aj as ke, bn as Je, bz as Ye, dW as b, ce as He, bU as Y, e3 as Z, a$ as ee, cw as te, dJ as ne, e7 as Me, dc as Xe, ag as Qe, cI as Ze } from "./agentStudioMount-xGP7t2dE.js";
const et = {
  queued: () => h.t("generationCommon.observability.progress.queued"),
  resolving: () => h.t("generationCommon.observability.progress.resolving"),
  requesting: () => h.t("generationCommon.observability.progress.requesting"),
  waiting: () => h.t("generationCommon.observability.progress.waiting"),
  generating: (e) => typeof e.elapsedMs == "number" && e.elapsedMs >= 5e3 ? h.t("generationCommon.observability.progress.generatingElapsed", {
    seconds: Math.round(e.elapsedMs / 1e3)
  }) : h.t("generationCommon.observability.progress.generating"),
  // 软超时后:视频较慢仍在跑,后台继续等。说真话(已等 N 分钟),不假装快完成。
  "still-generating": (e) => typeof e.elapsedMs == "number" ? h.t("generationCommon.observability.progress.stillGeneratingElapsed", {
    minutes: Math.round(e.elapsedMs / 6e4)
  }) : h.t("generationCommon.observability.progress.stillGenerating"),
  retrying: (e) => e.attempt && e.maxAttempts ? h.t("generationCommon.observability.progress.retryingAttempt", {
    attempt: e.attempt,
    maxAttempts: e.maxAttempts
  }) : h.t("generationCommon.observability.progress.retrying"),
  finalizing: () => h.t("generationCommon.observability.progress.finalizing")
};
function j(e, t = {}) {
  return et[e](t);
}
const tt = {
  auth: "auth",
  balance: "balance",
  quota: "quota",
  "poll-timeout": "pollTimeout",
  network: "network",
  "model-config": "modelConfig",
  "model-not-open": "modelNotOpen",
  "image-route-disabled": "imageRouteDisabled",
  "account-gate": "accountGate",
  "content-policy": "contentPolicy",
  server: "server",
  input: "input",
  "output-truncated": "outputTruncated",
  unknown: "unknown"
};
function x(e) {
  const t = tt[e];
  return {
    reason: h.t(`generationCommon.observability.error.${t}.reason`),
    hint: h.t(`generationCommon.observability.error.${t}.hint`)
  };
}
const Ie = /@\[asset:([^\]]+)\]/g;
function Se(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}
function nt(e) {
  return `@[asset:${encodeURIComponent(e)}]`;
}
function un(e) {
  const t = [];
  let n = 0;
  const r = new RegExp(Ie.source, "g");
  let s;
  for (; (s = r.exec(e)) !== null; )
    s.index > n && t.push({ type: "text", value: e.slice(n, s.index) }), t.push({ type: "mention", url: Se(s[1]) }), n = s.index + s[0].length;
  return n < e.length && t.push({ type: "text", value: e.slice(n) }), t;
}
function xe(e, t) {
  if (!e) return e;
  const n = e.replace(Ie, (r, s) => {
    const o = t.indexOf(Se(s));
    return o >= 0 ? `@image${o + 1}` : "";
  });
  return Ae(n);
}
function rt(e, t) {
  return xe(e, t);
}
function mn(e, t) {
  return xe(e, t);
}
function Ae(e) {
  return e.replace(/[ \t]{2,}/g, " ").replace(/\s+([，。、,.!?])/g, "$1").trim();
}
function fn(e, t) {
  if (!e) return e;
  const n = nt(t);
  return e.includes(n) ? Ae(e.split(n).join("")) : e;
}
function ot(e) {
  return !e || !e.enabled ? !1 : e.authType === "none" ? !0 : !!e.hasApiKey;
}
async function st(e = be) {
  const t = await e();
  return new Set(
    (Array.isArray(t) ? t : []).filter(ot).map((n) => String(n.key || "").trim()).filter(Boolean)
  );
}
function ae(e) {
  return N({
    modelKey: e.modelKey,
    modelAlias: e.modelAlias,
    vendorKey: e.vendorKey,
    meta: e.meta
  });
}
function ce(e) {
  const t = typeof e == "string" ? e.trim() : "";
  return t.startsWith("models/") ? t.slice(7) : t;
}
function de(e, t) {
  const n = ce(t);
  return n ? [e.modelKey, e.modelAlias].map((r) => ce(r)).filter(Boolean).includes(n) : !1;
}
function it(e) {
  const t = e.models.filter((a) => a.enabled && e.usable.has(String(a.vendorKey || "").trim()));
  if (!t.length) return null;
  const n = t.filter((a) => de(a, e.modelKey) || (e.modelAlias ? de(a, e.modelAlias) : !1));
  if (n.length) return n[0];
  const r = N({
    modelKey: e.modelKey,
    modelAlias: e.modelAlias,
    vendorKey: e.vendor,
    meta: e.meta
  });
  if (!r) return null;
  const s = t.filter((a) => ae(a)?.id === r.id);
  if (s.length) return s[0];
  const o = t.filter((a) => ae(a)?.family === r.family);
  return o.length ? o[0] : null;
}
function at(e, t, n) {
  if (e && e.id === n.id) return null;
  const r = e?.modes.find((i) => i.id === t), s = r ? r.transportTaskKind ?? e?.transportTaskKind : void 0, a = (s ? n.modes.find((i) => (i.transportTaskKind ?? n.transportTaskKind) === s) : void 0) || n.modes.find((i) => i.id === n.defaultModeId) || n.modes[0];
  return a ? { id: n.id, modeId: a.id } : null;
}
function m(e) {
  return typeof e == "string" ? e.trim() : "";
}
function T(e) {
  const t = typeof e == "number" ? e : typeof e == "string" ? Number(e) : NaN;
  return Number.isFinite(t) ? t : void 0;
}
function E(e) {
  return Array.isArray(e) ? e.map((t) => m(t)).filter(Boolean) : [];
}
function V(e) {
  return Array.from(new Set(e.map((t) => t.trim()).filter(Boolean)));
}
function C(e) {
  const t = m(e.modelVendor) || m(e.vendor), n = m(e.modelKey) || m(e.modelAlias);
  return t === "comfyui-local" ? null : N({
    modelKey: n,
    modelAlias: m(e.modelAlias),
    vendorKey: t || null,
    meta: e
  });
}
function Re(e) {
  const t = e.meta || {};
  return m(t.modelVendor) || m(t.vendor) || m(t.imageModelVendor) || m(t.videoModelVendor);
}
function O(e) {
  const t = e.meta || {};
  return m(t.modelKey) || m(t.modelAlias) || m(t.imageModel) || m(t.videoModel);
}
function ct(e) {
  return Le(e.kind);
}
async function dt(e, t) {
  const n = Re(e), r = O(e);
  if (!n && !r) return e;
  const s = t.listCatalogVendors || be;
  let o = null;
  try {
    o = await st(s);
  } catch {
    o = null;
  }
  if (!o || n && o.has(n)) return e;
  if (!r)
    throw new Error(`供应商「${n}」已断开，且该节点未记录模型。请重新连接，或在该节点上改选已连接供应商的模型。`);
  const a = t.listCatalogModels || Be;
  let i;
  try {
    i = await a({ kind: ct(e), enabled: !0 });
  } catch (w) {
    const k = w instanceof Error && w.message ? w.message : String(w);
    throw new Error(`模型目录解析失败：${k}`);
  }
  const c = e.meta || {}, d = m(c.modelAlias), l = it({ modelKey: r, modelAlias: d, vendor: n, meta: c, models: i, usable: o });
  if (!l) {
    const k = N({ modelKey: r, modelAlias: d, vendorKey: n, meta: c })?.label || m(c.modelLabel) || r;
    throw new Error(`当前没有已连接的供应商提供「${k}」模型。请重新连接原供应商，或在该节点上改选一个已连接供应商的模型。`);
  }
  const u = m(l.vendorKey);
  if (!u) throw new Error(`模型目录缺少 vendorKey：${r}`);
  const g = N({ modelKey: r, modelAlias: d, vendorKey: n, meta: c }), f = N({ modelKey: l.modelKey, modelAlias: l.modelAlias, vendorKey: u, meta: l.meta }), v = f ? at(g, m(c.archetype?.modeId) || void 0, f) : null;
  return {
    ...e,
    meta: {
      ...c,
      modelKey: m(l.modelKey) || r,
      modelAlias: m(l.modelAlias) || r,
      modelVendor: u,
      vendor: u,
      modelLabel: m(l.labelZh) || r,
      ...v ? { archetype: v } : {},
      ...je(e.kind) ? { videoModel: m(l.modelKey) || r, videoModelVendor: u } : { imageModel: m(l.modelKey) || r, imageModelVendor: u }
    }
  };
}
function lt(e, t) {
  const n = L(e.kind), r = e.meta || {};
  if (n === "video" || n === "image" || n === "audio") {
    const s = C(r);
    if (s) return U(s, r).transportTaskKind ?? s.transportTaskKind;
  }
  if (n === "video")
    return !!(m(t.firstFrameUrl) || m(t.lastFrameUrl) || (t.referenceImages?.length || 0) > 0) ? "image_to_video" : "text_to_video";
  if (n === "image")
    return (t.referenceImages?.length || 0) > 0 ? "image_edit" : "text_to_image";
  if (n === "text") return "chat";
  if (n === "audio") return "text_to_audio";
  throw new Error(`${e.kind} generation is not implemented yet`);
}
const ut = /* @__PURE__ */ new Set(["chat", "prompt_refine", "image_to_prompt", "transcribe"]);
function mt(e) {
  if (!e || typeof e != "object") return "";
  const t = e, n = t.choices;
  if (Array.isArray(n) && n.length) {
    const s = n[0], a = s?.message?.content;
    if (typeof a == "string") return a.trim();
    if (Array.isArray(a))
      return a.map((c) => typeof c == "string" ? c : m(c?.text)).filter(Boolean).join("").trim();
    const i = m(s?.text);
    if (i) return i;
  }
  const r = t.content;
  if (Array.isArray(r)) {
    const s = r.map((o) => m(o?.text)).filter(Boolean).join("").trim();
    if (s) return s;
  }
  return m(t.text);
}
function ft(e) {
  return e === "text_to_video" || e === "image_to_video" ? "video" : e === "text_to_audio" ? "audio" : e === "text_to_3d" || e === "image_to_3d" ? "model3d" : "image";
}
function Fe(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return "";
  const t = e, n = [
    t.message,
    t.error,
    t.errorMessage,
    t.failureReason,
    t.reason
  ];
  for (const s of n) {
    const o = m(s);
    if (o) return o;
  }
  const r = [t.raw, t.response, t.data, t.result];
  for (const s of r) {
    const o = Fe(s);
    if (o) return o;
  }
  return "";
}
function gt(e) {
  const t = Fe(e.raw), n = [
    e.id ? `taskId=${e.id}` : "",
    e.kind ? `kind=${e.kind}` : ""
  ].filter(Boolean).join(", "), r = t || "模型任务执行失败";
  return n ? `${r} (${n})` : r;
}
function pt(e) {
  return T(e?.durationSeconds);
}
function le(e, t) {
  if (e.status === "failed")
    throw new Error(gt(e));
  if (ut.has(e.kind)) {
    const d = mt(e.raw);
    if (!d) throw new Error("模型任务完成但没有返回文本内容");
    const l = ue(e);
    return {
      id: `${t.id}-${e.id || Date.now()}`,
      type: "text",
      text: d,
      model: O(t) || void 0,
      taskId: e.id,
      taskKind: "text",
      raw: e.raw,
      createdAt: Date.now(),
      ...l ? { provenance: l } : {}
    };
  }
  const n = ft(e.kind), r = e.assets.find((d) => d.type === "video" && m(d.url)), s = e.assets.find((d) => d.type === "image" && m(d.url)), o = e.assets.find((d) => d.type === "audio" && m(d.url)), a = r || s || o || e.assets.find((d) => m(d.url));
  if (!a) throw new Error(n === "video" ? "模型任务完成但没有返回视频地址" : n === "audio" ? "配音生成完成但没有返回音频" : "模型任务完成但没有返回图片地址");
  const i = a.type === "video" || a.type === "image" || a.type === "audio" ? a.type : n, c = ue(e);
  return {
    id: `${t.id}-${e.id || Date.now()}`,
    type: i,
    url: a.url,
    thumbnailUrl: a.thumbnailUrl || void 0,
    ...a.providerUrl ? { providerUrl: a.providerUrl } : {},
    model: O(t) || void 0,
    durationSeconds: i === "video" ? pt(a) : void 0,
    taskId: e.id,
    taskKind: i,
    assetId: a.assetId || void 0,
    assetRefId: a.assetRefId || void 0,
    raw: e.raw,
    createdAt: Date.now(),
    ...c ? { provenance: c } : {}
  };
}
function ue(e) {
  const t = e.provenance;
  if (!t || typeof t != "object") return;
  const n = t;
  return {
    timestamp: typeof n.timestamp == "number" ? n.timestamp : Date.now(),
    ...typeof n.provider == "string" ? { provider: n.provider } : {},
    ...typeof n.modelKey == "string" ? { modelKey: n.modelKey } : {},
    ...typeof n.modelVersion == "string" ? { modelVersion: n.modelVersion } : {},
    ...typeof n.prompt == "string" ? { prompt: n.prompt } : {},
    ...typeof n.negativePrompt == "string" ? { negativePrompt: n.negativePrompt } : {},
    ...typeof n.seed == "number" ? { seed: n.seed } : {},
    ...n.params && typeof n.params == "object" ? { params: n.params } : {},
    ...typeof n.vendorRequestId == "string" ? { vendorRequestId: n.vendorRequestId } : {},
    ...typeof n.agentRunId == "string" ? { agentRunId: n.agentRunId } : {}
  };
}
class _e extends Error {
  constructor(t) {
    super(`生成超时(可找回): ${t.taskId}`), this.recoverable = !0, this.name = "RecoverableTimeoutError", this.detail = t;
  }
}
function ht(e) {
  return e instanceof _e;
}
const me = /* @__PURE__ */ new Set(["succeeded", "failed"]), yt = 45e3, wt = /* @__PURE__ */ new Set(["chat", "prompt_refine", "image_to_prompt"]);
function bt(e, t) {
  const n = e.meta || {}, r = V([
    ...E(n.referenceImages),
    ...t.referenceImages || []
  ]), s = V([
    ...E(n.styleReferenceImages),
    ...t.styleReferenceImages || []
  ]), o = V([
    ...E(n.characterReferenceImages),
    ...t.characterReferenceImages || []
  ]), a = V([
    ...E(n.compositionReferenceImages),
    ...t.compositionReferenceImages || []
  ]), i = C(n);
  if (i) {
    const l = qe(n, i, {
      firstFrameUrl: m(t.firstFrameUrl) || null,
      lastFrameUrl: m(t.lastFrameUrl) || null,
      // 切片1：把画布边产出的实时参考图喂进档案 image 槽（此前只读 meta，边的角色图被丢）。
      // referenceImages 已是 meta.referenceImages + 边超集的去重并集。
      referenceImages: r,
      // B4：连线进来的视频/音频参考喂进 video_ref/audio_ref 槽（此前只收 meta 上传）。
      referenceVideos: t.referenceVideos || [],
      referenceAudios: t.referenceAudios || []
    }), u = U(i, n), g = (u.slots || []).some((S) => S.kind === "first_frame"), f = (u.slots || []).some((S) => S.kind === "last_frame"), v = g ? m(t.firstFrameUrl) || m(n.firstFrameUrl) : "", w = f ? m(t.lastFrameUrl) || m(n.lastFrameUrl) : "", k = (u.slots || []).some((S) => S.kind === "image_ref"), $ = V([
      ...r,
      ...k ? E(n.referenceImageUrls) : []
    ]);
    return {
      ...$.length ? { referenceImages: $ } : {},
      ...v ? { firstFrameUrl: v } : {},
      ...w ? { lastFrameUrl: w } : {},
      archetypeInput: l,
      ...s.length ? { styleReferenceImages: s } : {},
      ...o.length ? { characterReferenceImages: o } : {},
      ...a.length ? { compositionReferenceImages: a } : {}
    };
  }
  const c = m(t.firstFrameUrl) || m(n.firstFrameUrl), d = m(t.lastFrameUrl) || m(n.lastFrameUrl);
  return {
    ...r.length ? { referenceImages: r } : {},
    ...c ? { firstFrameUrl: c } : {},
    ...d ? { lastFrameUrl: d } : {},
    ...s.length ? { styleReferenceImages: s } : {},
    ...o.length ? { characterReferenceImages: o } : {},
    ...a.length ? { compositionReferenceImages: a } : {}
  };
}
function vt(e, t = {}) {
  const n = Re(e);
  if (!n) throw new Error("请先在模型管理里选择一个可用模型");
  const r = O(e);
  if (!r) throw new Error("请先选择模型");
  const s = m(e.prompt);
  if (!s) throw new Error("prompt is required");
  const o = t.references || {}, a = lt(e, o), i = e.meta || {}, c = C(i), d = c ? Oe(i, c, o.referenceImages || []) : E(i.referenceImageUrls), l = rt(s, d), u = o.stagingComposition && (a === "text_to_image" || a === "image_edit") ? `${l}

（构图参考仅用于确定人物站位、各自姿势和镜头机位；请据此完全写实地重新渲染人物与场景——真实皮肤/衣物/光影，不要保留参考图里灰色人偶或 3D 渲染的外观。）` : l, g = T(i.width), f = T(i.height), v = T(i.steps), w = T(i.cfgScale), k = T(i.seed);
  return {
    vendor: n,
    request: {
      kind: a,
      prompt: u,
      ...typeof k == "number" ? { seed: k } : {},
      ...typeof g == "number" ? { width: g } : {},
      ...typeof f == "number" ? { height: f } : {},
      ...typeof v == "number" ? { steps: v } : {},
      ...typeof w == "number" ? { cfgScale: w } : {},
      extras: {
        ...i,
        modelKey: r,
        modelAlias: m(i.modelAlias) || r,
        nodeId: e.id,
        nodeKind: e.kind,
        // 付费守卫令牌：随 extras 下到主进程 runTask 核验消费（无则主进程拦截）。
        ...t.grantId ? { grantId: t.grantId } : {},
        // 提交幂等键：随 extras 下到主进程 runTask，同键提交内核 at-most-once（堵「丢回执→重试→二次下单」）。
        ...t.idempotencyKey ? { idempotencyKey: t.idempotencyKey } : {},
        // S8 缓存语义:节点血统里已出过图(result 或 history,含「基于此重生成」副本)→
        // 再点生成=用户要重抽 → 强制重跑绕指纹缓存;首次生成/批量补跑同配方命中缓存
        // 秒回零花费(防双击/重复受理重复扣费)。路由旗标,不进指纹。
        ...e.result || e.history && e.history.length > 0 ? { forceRerun: !0 } : {},
        ...bt(e, o)
      }
    }
  };
}
function kt(e) {
  return new Promise((t) => globalThis.setTimeout(t, e));
}
async function Mt(e, t, n, r) {
  if (me.has(n.status)) return n;
  const s = r.pollIntervalMs ?? 1500, o = t.kind === "text_to_video" || t.kind === "image_to_video", a = r.pollTimeoutMs ?? (o ? 3e5 : 12e4), i = r.pollTimeoutMs ?? (o ? 12e5 : 12e4), c = Date.now(), d = r.fetchTaskResult || ze, l = () => new _e({
    taskId: n.id,
    vendor: e,
    taskKind: t.kind,
    modelKey: m(t.extras?.modelKey)
  });
  let u = n, g = null;
  for (; !me.has(u.status); ) {
    const f = Date.now() - c;
    if (f > i)
      throw l();
    const v = f > a;
    r.onProgress?.({
      phase: v ? "still-generating" : "generating",
      message: j(v ? "still-generating" : "generating", { elapsedMs: f }),
      taskId: n.id
    }), await kt(s);
    try {
      u = (await d({
        taskId: n.id,
        vendor: e,
        taskKind: t.kind,
        prompt: t.prompt,
        modelKey: m(t.extras?.modelKey) || null
      })).result, g = null;
    } catch {
      const w = Date.now();
      if (g == null && (g = w), w - g > yt || w - c > i)
        throw l();
      r.onProgress?.({
        phase: "still-generating",
        message: j("still-generating", { elapsedMs: w - c }),
        taskId: n.id
      });
    }
  }
  return u;
}
async function G(e, t = {}) {
  const n = (d, l, u) => t.onProgress?.({ phase: d, message: j(d, u), ...l ? { taskId: l } : {} });
  n("resolving");
  const r = await dt(e, t), { vendor: s, request: o } = vt(r, t);
  if (t.onTextDelta && wt.has(o.kind) && !t.runTask) {
    const d = t.runTextStream || Ge;
    n("requesting");
    const l = await d(s, o, { onDelta: t.onTextDelta });
    return n("finalizing", l.id), le(l, r);
  }
  const a = t.runTask || We;
  n("requesting");
  const i = await a(s, o);
  n("waiting", i.id);
  const c = await Mt(s, o, i, t);
  return n("finalizing", i.id), le(c, r);
}
async function It(e, t = {}) {
  return G(e, t);
}
async function St(e, t = {}) {
  return G(e, t);
}
async function xt(e, t = {}) {
  return G(e, t);
}
function I(e) {
  if (typeof e != "string") return "";
  const t = e.trim();
  return /^https?:\/\//i.test(t) || t.startsWith("/") || t.startsWith("blob:") || t.startsWith("nomi-local://") ? t : "";
}
function H(e) {
  return I(e?.url) || I(e?.providerUrl) || I(e?.thumbnailUrl);
}
function Q(e, t) {
  const [n, r] = t.split(":"), s = e.get(n);
  if (!s) return "";
  if (r) {
    const o = s.history?.find((a) => a.id === r);
    return H(o);
  }
  return H(s.result) || H(s.history?.[0]);
}
function W(e, t) {
  const n = I(t);
  return n || (typeof t != "string" ? "" : Q(e, t));
}
function M(e, t) {
  const n = I(t);
  n && !e.includes(n) && e.push(n);
}
function At(e) {
  const t = ke(e);
  if (!t) return !1;
  const n = U(t, e.meta || {}), r = new Set(n.slots.map((s) => s.kind));
  return r.has("video_ref") || r.has("source_video") ? !1 : r.has("first_frame");
}
function K(e, t = {}) {
  const n = t.nodes || [e], r = t.edges || [], s = new Map(n.map((p) => [p.id, p])), o = [], a = [], i = [], c = [];
  let d = "", l = "", u = "", g = !1;
  for (const p of ve(r)) {
    if (p.target !== e.id) continue;
    const y = Q(s, p.source);
    if (y) {
      if (p.mode === "first_frame") {
        const R = s.get(p.source);
        if (R && ie(R) === "video") {
          u = u || y;
          continue;
        }
        d = d || y, M(o, y);
        continue;
      }
      if (p.mode === "last_frame") {
        l = l || y, M(o, y);
        continue;
      }
      if (p.mode === "style_ref") {
        M(a, y), M(o, y);
        continue;
      }
      if (p.mode === "character_ref") {
        M(i, y), M(o, y);
        continue;
      }
      if (p.mode === "composition_ref") {
        M(c, y), M(o, y), s.get(p.source)?.meta?.stagingComposition === !0 && (g = !0);
        continue;
      }
      if (!p.mode || p.mode === "reference") {
        const R = s.get(p.source);
        if (R && ie(R) === "video" && At(e)) {
          u = u || y;
          continue;
        }
        M(o, y);
      }
    }
  }
  (e.references || []).forEach((p) => {
    const y = I(p);
    M(o, y || Q(s, p));
  });
  const f = e.meta || {};
  [f.referenceImages, f.upstreamResultUrls].forEach((p) => {
    Array.isArray(p) ? p.forEach((y) => M(o, y)) : M(o, p);
  });
  const v = u ? o.filter((p) => p !== u) : o, w = /* @__PURE__ */ new Map();
  for (const p of n) {
    const y = p.result?.type, R = y === "video" || !y && p.kind === "video" ? "video" : y === "audio" || !y && p.kind === "audio" ? "audio" : "image";
    for (const Ve of [p.result?.url, ...(p.history || []).map((D) => D.url)]) {
      const D = I(Ve);
      D && !w.has(D) && w.set(D, R);
    }
  }
  const k = [], $ = [], S = [];
  for (const p of v) {
    const y = w.get(p) || "image";
    y === "video" ? $.push(p) : y === "audio" ? S.push(p) : k.push(p);
  }
  const $e = d || I(f.firstFrameUrl) || I(f.first_frame_url) || W(s, f.firstFrameRef) || W(s, f.firstFrameReference) || // relay 时首帧要等抽帧填，绝不 fallback 到通用参考图（否则又冒充）。只从**图片**参考兜底（视频已分流）。
  (u ? void 0 : k[0]) || void 0, De = l || I(f.lastFrameUrl) || I(f.last_frame_url) || W(s, f.lastFrameRef) || W(s, f.lastFrameReference) || void 0;
  return {
    referenceImages: k,
    referenceVideos: $,
    referenceAudios: S,
    firstFrameUrl: $e,
    lastFrameUrl: De,
    styleReferenceImages: a,
    characterReferenceImages: i,
    compositionReferenceImages: c,
    ...g ? { stagingComposition: g } : {},
    ...u ? { relayFromVideoUrl: u } : {}
  };
}
async function Rt(e) {
  if (!e.relayFromVideoUrl || e.firstFrameUrl) return;
  const t = e.relayFromVideoUrl;
  if (e.lastFrameUrl) {
    e.firstFrameUrl = e.lastFrameUrl, delete e.relayFromVideoUrl;
    return;
  }
  const n = Je();
  if (!n) throw new Error("视频接力失败：找不到当前项目（请先保存项目后重试）");
  const r = Ye()?.video?.extractFrame;
  if (!r) throw new Error("视频接力失败：当前环境不支持抽帧（需桌面端）");
  let s = "";
  try {
    s = (await r({ videoUrl: t, which: "last", projectId: n }))?.url || "";
  } catch (o) {
    throw new Error(`视频接力抽帧失败：${o instanceof Error ? o.message : String(o)}`);
  }
  if (!s) throw new Error("视频接力失败：未能从源视频取到尾帧");
  e.firstFrameUrl = s, delete e.relayFromVideoUrl;
}
function B(e, t) {
  return e ? t?.length ? { type: "text", text: e, marks: t } : { type: "text", text: e } : null;
}
function Te(e) {
  const t = [], n = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  let r = 0;
  for (const o of e.matchAll(n)) {
    const a = o.index ?? 0, i = o[0], c = e.slice(r, a), d = B(c);
    if (d && t.push(d), i.startsWith("**") && i.endsWith("**") || i.startsWith("__") && i.endsWith("__")) {
      const l = B(i.slice(2, -2), [{ type: "bold" }]);
      l && t.push(l);
    } else if (i.startsWith("`") && i.endsWith("`")) {
      const l = B(i.slice(1, -1), [{ type: "code" }]);
      l && t.push(l);
    } else if (i.startsWith("*") && i.endsWith("*") || i.startsWith("_") && i.endsWith("_")) {
      const l = B(i.slice(1, -1), [{ type: "italic" }]);
      l && t.push(l);
    }
    r = a + i.length;
  }
  const s = B(e.slice(r));
  return s && t.push(s), t;
}
function re(e) {
  return { type: "paragraph", content: Te(e) };
}
function fe(e) {
  return { type: "listItem", content: [re(e)] };
}
function A(e, t) {
  const n = e.join(" ").trim();
  n && t.push(re(n)), e.length = 0;
}
function Ft(e) {
  const t = String(e || "").replace(/\r\n/g, `
`).trim();
  if (!t) return [];
  const n = [], r = [], s = t.split(`
`);
  let o = 0;
  for (; o < s.length; ) {
    const i = s[o].trim();
    if (!i) {
      A(r, n), o += 1;
      continue;
    }
    if (i.startsWith("```")) {
      A(r, n);
      const g = [];
      for (o += 1; o < s.length && !s[o].trim().startsWith("```"); )
        g.push(s[o]), o += 1;
      n.push({
        type: "codeBlock",
        content: g.length ? [{ type: "text", text: g.join(`
`) }] : void 0
      }), o += 1;
      continue;
    }
    const c = i.match(/^(#{1,6})\s+(.+)$/);
    if (c) {
      A(r, n), n.push({
        type: "heading",
        attrs: { level: Math.min(3, c[1].length) },
        content: Te(c[2].trim())
      }), o += 1;
      continue;
    }
    const d = i.match(/^>\s?(.*)$/);
    if (d) {
      A(r, n);
      const g = [d[1]];
      for (o += 1; o < s.length; ) {
        const v = s[o].trim().match(/^>\s?(.*)$/);
        if (!v) break;
        g.push(v[1]), o += 1;
      }
      n.push({ type: "blockquote", content: [re(g.join(" ").trim())] });
      continue;
    }
    if (i.match(/^[-*+]\s+(.+)$/)) {
      A(r, n);
      const g = [];
      for (; o < s.length; ) {
        const f = s[o].trim().match(/^[-*+]\s+(.+)$/);
        if (!f) break;
        g.push(fe(f[1].trim())), o += 1;
      }
      n.push({ type: "bulletList", content: g });
      continue;
    }
    if (i.match(/^\d+[.)]\s+(.+)$/)) {
      A(r, n);
      const g = [];
      for (; o < s.length; ) {
        const f = s[o].trim().match(/^\d+[.)]\s+(.+)$/);
        if (!f) break;
        g.push(fe(f[1].trim())), o += 1;
      }
      n.push({ type: "orderedList", content: g });
      continue;
    }
    if (/^---+$/.test(i)) {
      A(r, n), n.push({ type: "horizontalRule" }), o += 1;
      continue;
    }
    r.push(i), o += 1;
  }
  return A(r, n), n;
}
function ge(e) {
  const t = e.meta?.textGenMode;
  return t === "replace" || t === "rewrite" ? t : "append";
}
async function _t(e, t = {}) {
  const n = (e.prompt || "").trim(), r = Ee(e.contentJson), s = typeof e.meta?.textGenSelection == "string" ? e.meta.textGenSelection.trim() : "", o = ge(e) === "rewrite" && !s ? "append" : ge(e), a = Tt(o, { userPrompt: n, docText: r, selText: s }), i = o === "append" && Array.isArray(e.contentJson?.content) ? e.contentJson.content : [];
  let c = "";
  const d = o === "rewrite" ? void 0 : (g) => {
    c += g, pe(e.id, o, i, c, !1);
  }, l = await G(
    { ...e, prompt: a },
    { ...t, ...d ? { onTextDelta: d } : {} }
  ), u = (l.text || "").trim();
  return u && (o === "rewrite" ? Et(e.id, l.id) : pe(e.id, o, i, u, !0)), l;
}
function Ee(e) {
  const t = (n) => {
    if (!n || typeof n != "object") return "";
    const r = n;
    return typeof r.text == "string" ? r.text : Array.isArray(r.content) ? r.content.map(t).join("") : "";
  };
  return !e || !Array.isArray(e.content) ? "" : e.content.map(t).map((n) => n.trim()).filter(Boolean).join(`
`).trim();
}
function Tt(e, t) {
  const { userPrompt: n, docText: r, selText: s } = t;
  return e === "rewrite" ? [
    "请改写下面这段文字：",
    `"""
${s}
"""`,
    `要求：${n || "保持原意，让它更通顺自然"}`,
    "只输出改写后的文字本身，不要解释、不要加引号。"
  ].join(`
`) : e === "replace" ? [
    `请按下面的要求写一篇完整文本：${n || "自由发挥"}`,
    r ? `（可参考现有内容：
"""
${r}
"""）` : "",
    "只输出正文本身，不要解释。"
  ].filter(Boolean).join(`
`) : r ? [
    "这是当前文档内容：",
    `"""
${r}
"""`,
    `请接着往下写${n ? `，要求：${n}` : ""}。`,
    "只输出新增的正文内容，不要重复已有内容，不要解释。"
  ].join(`
`) : [
    `请按要求写一段文本：${n || "自由发挥"}`,
    "只输出正文本身，不要解释。"
  ].join(`
`);
}
function pe(e, t, n, r, s) {
  const o = Ft(r);
  if (!o.length) return;
  const a = t === "replace" ? o : [...n || [], ...o];
  b.getState().updateNode(
    e,
    { contentJson: { type: "doc", content: a } },
    s ? void 0 : { persist: !1 }
  );
}
function Et(e, t) {
  const n = b.getState(), r = n.nodes.find((s) => s.id === e);
  n.updateNode(
    e,
    { meta: { ...r?.meta || {}, textPendingSelectionApply: t } },
    { persist: !1 }
  );
}
function Kt(e) {
  const t = Ee(e.contentJson);
  if (t) return t;
  const n = typeof e.result?.text == "string" ? e.result.text.trim() : "";
  return n || (e.prompt || "").trim();
}
function Nt(e, t = {}) {
  const n = L(e.kind);
  if (n !== "image" && n !== "video") return [];
  const r = t.nodes || [e], s = t.edges || [];
  if (s.length === 0) return [];
  const o = new Map(r.map((c) => [c.id, c])), a = /* @__PURE__ */ new Set(), i = [];
  for (const c of ve([...s])) {
    if (c.target !== e.id || a.has(c.source)) continue;
    const d = o.get(c.source);
    if (!d || !He(d, e, c.mode)) continue;
    const l = Kt(d);
    l && (a.add(d.id), i.push(l));
  }
  return i;
}
function he(e, t = {}) {
  const n = Nt(e, t);
  if (n.length === 0) return e;
  const r = [(e.prompt || "").trim(), ...n].filter(Boolean).join(`

`);
  return r === (e.prompt || "") ? e : { ...e, prompt: r };
}
async function Ut(e, t = {}) {
  return G(e, t);
}
const Ct = async (e, t) => {
  const n = L(e.kind), r = t?.onProgress, s = t?.grantId, o = {
    ...s ? { grantId: s } : {},
    ...t?.idempotencyKey ? { idempotencyKey: t.idempotencyKey } : {}
  };
  if (n === "image") {
    const a = K(e, t), i = he(e, t);
    return St(i, { references: a, ...o, ...r ? { onProgress: r } : {} });
  }
  if (n === "video") {
    const a = K(e, t);
    await Rt(a);
    const i = he(e, t);
    return Ut(i, { references: a, ...o, ...r ? { onProgress: r } : {} });
  }
  if (n === "text")
    return _t(e, r ? { onProgress: r } : void 0);
  if (n === "audio") {
    const a = K(e, t);
    return It(e, { references: a, ...o, ...r ? { onProgress: r } : {} });
  }
  if (n === "model3d") {
    const a = K(e, t);
    return xt(e, { references: a, ...o, ...r ? { onProgress: r } : {} });
  }
  throw new Error(`${e.kind} generation is not implemented yet`);
}, z = "nomi:model-health:v1", Pt = 2, $t = 1440 * 60 * 1e3, Ke = /* @__PURE__ */ new Map();
function Dt() {
  try {
    if (typeof localStorage < "u") return localStorage.getItem(z);
  } catch {
  }
  return Ke.get(z) ?? null;
}
function Vt(e) {
  try {
    if (typeof localStorage < "u") {
      localStorage.setItem(z, e);
      return;
    }
  } catch {
  }
  Ke.set(z, e);
}
function oe() {
  const e = Dt();
  if (!e) return {};
  try {
    const t = JSON.parse(e);
    if (!t || typeof t != "object") return {};
    const n = {};
    for (const [r, s] of Object.entries(t)) {
      const o = s;
      o && typeof o.fails == "number" && typeof o.lastFailAt == "number" && (n[r] = { fails: o.fails, lastFailAt: o.lastFailAt });
    }
    return n;
  } catch {
    return {};
  }
}
function Ne(e) {
  Vt(JSON.stringify(e));
}
function se(e) {
  return typeof e == "string" ? e.trim() : "";
}
function Bt(e, t = Date.now()) {
  const n = se(e);
  if (!n) return;
  const r = oe(), s = r[n];
  r[n] = { fails: (s?.fails ?? 0) + 1, lastFailAt: t }, Ne(r);
}
function jt(e) {
  const t = se(e);
  if (!t) return;
  const n = oe();
  t in n && (delete n[t], Ne(n));
}
function gn(e, t = Date.now()) {
  const n = se(e);
  if (!n) return !1;
  const r = oe()[n];
  return !r || t - r.lastFailAt > $t ? !1 : r.fails >= Pt;
}
const q = "NOMI_VENDOR_ERR_B64::";
function Lt(e) {
  const t = String(e || ""), n = t.indexOf(q);
  if (n < 0) return null;
  const r = t.slice(n + q.length), s = r.indexOf("::");
  if (s < 0) return null;
  try {
    const o = atob(r.slice(0, s)), a = Uint8Array.from(o, (i) => i.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(a));
  } catch {
    return null;
  }
}
function X(e) {
  const t = String(e || ""), n = t.indexOf(q);
  if (n < 0) return t;
  const r = t.slice(n + q.length), s = r.indexOf(":: ");
  return s < 0 ? t.slice(0, n).trim() || t : (t.slice(0, n) + r.slice(s + 3)).trim();
}
function F(e, t) {
  const n = String(e || "").replace(/\s+/g, " ").trim();
  return !n || n === "(no detail from provider)" || n === t ? "" : n.length > 200 ? `${n.slice(0, 199)}…` : n;
}
function _(e) {
  const t = String(e || "").trim();
  if (!t) return "";
  try {
    const r = JSON.parse(t);
    if (r && typeof r == "object") {
      const s = r, o = s.error, a = [
        typeof o == "object" && o ? o.message : void 0,
        typeof o == "string" ? o : void 0,
        s.message,
        s.detail,
        s.error_description
      ];
      for (const i of a)
        if (typeof i == "string" && i.trim()) return ye(i.trim());
    }
  } catch {
  }
  const n = t.split(`
`).map((r) => r.trim()).find(Boolean);
  return n ? ye(n) : "";
}
function ye(e) {
  const t = e.replace(/\s+/g, " ").trim();
  return t.length > 100 ? `${t.slice(0, 99)}…` : t;
}
const Gt = ["auth", "balance", "quota", "network", "server", "input"];
function Wt(e) {
  const t = e.toLowerCase();
  return e.includes("输出长度上限") || e.includes("内容被截断") ? "output-truncated" : t.includes("api key") || t.includes("apikey") || t.includes("unauthorized") || t.includes("401") ? "auth" : e.includes("余额") || t.includes("balance") || e.includes("欠费") || t.includes("arrears") || t.includes("402") ? "balance" : t.includes("quota") || t.includes("rate limit") || t.includes("429") || t.includes("insufficient") ? "quota" : e.includes("轮询超时") || t.includes("task poll timeout") ? "poll-timeout" : t.includes("timeout") || t.includes("etimedout") || t.includes("econnreset") || t.includes("network") ? "network" : t.includes("model") && (t.includes("not found") || t.includes("未找到") || t.includes("not configured")) ? "model-config" : t.includes("content") && (t.includes("policy") || t.includes("safety") || t.includes("filter")) ? "content-policy" : null;
}
function Ot(e, t) {
  const n = `${e || ""} ${t}`.toLowerCase();
  return n.includes("not activated the model") || n.includes("activate the model service") || n.includes("modelnotopen") || n.includes("未开通") || n.includes("开通管理") || // 「开通+模型」必须再有控制台语境才算——否则太宽：即梦 CLI 的会员兜底文案（「需开通即梦会员…
  // 该模型首次使用…」）曾被这条误吞成「模型未开通/火山 Ark 指引」（2026-07-06 真机走查抓出）。
  n.includes("开通") && n.includes("模型") && (n.includes("控制台") || n.includes("console") || n.includes("ark") || n.includes("激活"));
}
function zt(e, t) {
  const n = `${e || ""} ${t}`.toLowerCase();
  return n.includes("not enabled for this group") || n.includes("image generation is not enabled") || n.includes("images api is not enabled") || n.includes("endpoint is disabled") ? !0 : (n.includes("分组") || n.includes("group")) && (n.includes("未开通") || n.includes("无权限") || n.includes("not enabled") || n.includes("no permission"));
}
function qt(e, t) {
  const n = `${e || ""} ${t}`.toLowerCase();
  return (
    // 即梦高级会员（dreamina）
    n.includes("maestro vip") || n.includes("高级会员") || n.includes("开通即梦会员") || n.includes("dreamina_cli 使用权限") || n.includes("会员") && (n.includes("生成") || n.includes("试用")) || // RunningHub 标准模型需企业级共享 Key（errorCode 1014）
    n.includes("enterprise-shared") || n.includes("企业级") || n.includes("企业共享") || n.includes("仅限企业") || // 即梦部分模型首次需网页端授权
    n.includes("aigccomplianceconfirmationrequired") || n.includes("complianceconfirmationrequired") || n.includes("授权") && (n.includes("网页") || n.includes("web") || n.includes("确认"))
  );
}
function Jt(e, t) {
  const n = `${e || ""} ${t}`.toLowerCase();
  return n.includes("余额不足") || n.includes("请充值") || n.includes("账户余额") || n.includes("欠费") || n.includes("不支持 api 调用") || n.includes("insufficient balance") || n.includes("please recharge") || n.includes("top up");
}
function Yt(e) {
  const t = Lt(e), n = X(String(e || "")).split(`
→`)[0].trim() || h.t("generationCommon.observability.error.unknown.reason");
  if (qt(t?.upstreamMsg, n)) {
    const { reason: o, hint: a } = x("account-gate"), i = F(t?.upstreamMsg ?? _(n), o);
    return { reason: o, hint: a, raw: n, ...i ? { providerMessage: i } : {} };
  }
  if (Ot(t?.upstreamMsg, n)) {
    const { reason: o, hint: a } = x("model-not-open"), i = F(t?.upstreamMsg ?? _(n), o);
    return { reason: o, hint: a, raw: n, ...i ? { providerMessage: i } : {} };
  }
  if (zt(t?.upstreamMsg, n)) {
    const { reason: o, hint: a } = x("image-route-disabled"), i = F(t?.upstreamMsg ?? _(n), o);
    return { reason: o, hint: a, raw: n, ...i ? { providerMessage: i } : {} };
  }
  if (Jt(t?.upstreamMsg, n)) {
    const { reason: o, hint: a } = x("balance"), i = F(t?.upstreamMsg ?? _(n), o);
    return { reason: o, hint: a, raw: n, ...i ? { providerMessage: i } : {} };
  }
  if (t?.category && Gt.includes(t.category)) {
    const { reason: o, hint: a } = x(t.category), i = F(t.upstreamMsg, o);
    return { reason: o, hint: a, raw: X(e), ...i ? { providerMessage: i } : {} };
  }
  const r = X(String(e || "")).split(`
→`)[0].trim() || h.t("generationCommon.observability.error.unknown.reason");
  if (r.includes("网页媒体下载失败"))
    return {
      reason: h.t("generationCommon.observability.error.webMedia.reason"),
      hint: h.t("generationCommon.observability.error.webMedia.hint"),
      raw: r
    };
  const s = Wt(r);
  if (s) {
    const { reason: o, hint: a } = x(s), i = F(_(r), o);
    return { reason: o, hint: a, raw: r, ...i ? { providerMessage: i } : {} };
  }
  return {
    reason: _(r) || x("unknown").reason,
    hint: x("unknown").hint,
    raw: r
  };
}
function J(e) {
  const t = L(e);
  return t === "video" ? "video" : t === "audio" ? "audio" : "image";
}
function Ht(e) {
  const t = b.getState().nodes, n = new Set(
    e.map((r) => t.find((s) => s.id === r)).filter((r) => !!r).map((r) => J(r.kind))
  );
  return n.size === 1 ? [...n][0] : n.size === 0 ? "image" : "mixed";
}
const Xt = 3, Qt = 350;
function Zt(e) {
  if (e instanceof TypeError) return !0;
  if (!(e instanceof Error)) return !1;
  const t = e;
  if (typeof t.status == "number")
    return t.status === 408 || t.status === 409 || t.status === 425 || t.status === 429 || t.status >= 500;
  const n = t.message.trim().toLowerCase();
  return n.includes("failed to fetch") || n.includes("networkerror") || n.includes("socket") || n.includes("timeout") || n.includes("temporarily unavailable") || n.includes("rate limit");
}
function en(e) {
  return typeof e != "number" || !Number.isFinite(e) ? Xt : Math.max(1, Math.min(5, Math.floor(e)));
}
function tn(e) {
  return typeof e != "number" || !Number.isFinite(e) ? Qt : Math.max(0, Math.min(3e3, Math.floor(e)));
}
async function nn(e, t) {
  t <= 0 || await new Promise((n) => globalThis.setTimeout(n, t * 2 ** Math.max(0, e - 1)));
}
function Ue(e) {
  const t = b.getState(), n = t.nodes.find((o) => o.id === e);
  if (!n) return;
  const r = Xe(n, t.nodes, t.edges);
  if (!r) return;
  const s = ke(n);
  s && t.updateNode(e, {
    meta: Qe(n.meta || {}, s, r)
  });
}
function we(e) {
  return b.getState().nodes.find((n) => n.id === e)?.meta?.modelKey;
}
async function P(e, t = {}) {
  const n = String(e || "").trim();
  if (!n) throw new Error("nodeId is required");
  Ue(n);
  const r = b.getState(), s = r.nodes.find((a) => a.id === n);
  if (!s) throw new Error("node not found");
  if (!Pe(s, { nodes: r.nodes, edges: r.edges }))
    throw new Error(
      s.kind === "video" ? "视频节点缺少上游真实图片或视频资产 URL。请先生成或选择首帧/参考图后再生成视频。" : `暂不支持「${s.kind}」类型节点的生成`
    );
  const o = r.appendNodeRun(n, {
    status: "queued",
    startedAt: Date.now(),
    updatedAt: Date.now()
  });
  b.getState().setNodeProgress(n, {
    runId: o.id,
    phase: "queued",
    message: j("queued"),
    percent: 0
  });
  try {
    const a = t.executor ?? Ct, i = en(t.retry?.maxAttempts), c = tn(t.retry?.baseDelayMs);
    let d = null;
    for (let l = 1; l <= i; l += 1) {
      const u = b.getState(), g = u.nodes.find((f) => f.id === n) || s;
      try {
        d = await a(g, {
          nodes: u.nodes,
          edges: u.edges,
          ...t.grantId ? { grantId: t.grantId } : {},
          // 提交幂等键 = 本次 run.id：重试循环内每次 attempt 复用同一个 run.id，
          // electron 侧台账据此认作「同一次意图提交」→ 重试绝不二次下单。新生成 = 新 run.id。
          idempotencyKey: o.id,
          // S2:catalog 任务各阶段回报 → 节点进度(人话已由 narrate 翻好)。
          onProgress: (f) => {
            b.getState().setNodeProgress(n, {
              runId: o.id,
              phase: f.phase,
              message: f.message,
              ...f.taskId ? { taskId: f.taskId } : {}
            });
          }
        });
        break;
      } catch (f) {
        if (l >= i || !Zt(f))
          throw f;
        b.getState().setNodeProgress(n, {
          runId: o.id,
          phase: "retrying",
          // 文案走 narrate 注册表(S2 纪律:展示文案不许散落字面量)。
          message: j("retrying", { attempt: l + 1, maxAttempts: i })
        }), await nn(l, c);
      }
    }
    if (!d) throw new Error("生成失败");
    return b.getState().addNodeResult(n, d), jt(we(n)), await Ze().catch(() => {
    }), d;
  } catch (a) {
    if (ht(a))
      throw b.getState().setNodeStatus(n, "recoverable", a.message), a;
    Bt(we(n));
    const i = a instanceof Error && a.message ? a.message : "生成失败";
    throw b.getState().setNodeStatus(n, "error", i), a;
  }
}
function rn(e) {
  return typeof e != "number" || !Number.isFinite(e) ? 6 : Math.max(1, Math.min(8, Math.floor(e)));
}
async function Ce(e, t = {}) {
  const n = e.map((d) => String(d || "").trim()).filter((d, l, u) => !!d && u.indexOf(d) === l), r = rn(t.concurrency), s = [], o = [];
  let a = 0;
  async function i() {
    for (; a < n.length; ) {
      const d = a;
      a += 1;
      const l = n[d];
      try {
        const u = await P(l, {
          executor: t.executor,
          retry: t.retry,
          ...t.grantId ? { grantId: t.grantId } : {}
        });
        s.push({ nodeId: l, result: u }), t.onNodeResult?.({ ok: !0, nodeId: l, result: u });
      } catch (u) {
        const g = u instanceof Error ? u : new Error(String(u));
        o.push({ nodeId: l, error: g }), t.onNodeResult?.({ ok: !1, nodeId: l, error: g });
      }
    }
  }
  const c = Array.from({ length: Math.min(r, n.length) }, () => i());
  return await Promise.all(c), { totalCount: n.length, successes: s, failures: o };
}
async function on(e, t = {}) {
  const n = [], r = [], s = (c, d) => {
    const l = new Error(d);
    b.getState().setNodeStatus(c, "error", d), r.push({ nodeId: c, error: l }), t.onNodeResult?.({ ok: !1, nodeId: c, error: l });
  };
  for (const c of e.blocked) s(c.nodeId, c.detail);
  const o = new Set(e.waves.flat()), a = /* @__PURE__ */ new Map();
  for (const c of e.edgesUsed)
    !o.has(c.source) || !o.has(c.target) || a.set(c.target, [...a.get(c.target) ?? [], c.source]);
  const i = new Set(e.blocked.map((c) => c.nodeId));
  for (const c of e.waves) {
    const d = [];
    for (const u of c) {
      const g = (a.get(u) ?? []).find((f) => i.has(f));
      if (g) {
        i.add(u);
        const f = b.getState().nodes.find((v) => v.id === g)?.title || g;
        s(u, `上游「${f}」本批生成失败,本节点未执行`);
      } else
        d.push(u);
    }
    if (d.length === 0) continue;
    const l = await Ce(d, t);
    n.push(...l.successes);
    for (const u of l.failures)
      i.add(u.nodeId), r.push(u);
  }
  return { totalCount: e.waves.flat().length + e.blocked.length, successes: n, failures: r };
}
async function sn(e, t = {}) {
  const n = b.getState().nodes.find((a) => a.id === e);
  if (!await Z.getState().requestConfirm({
    title: t.rerun ? h.t("generationCommon.spend.generateVariant") : h.t("generationCommon.spend.startGeneration"),
    message: ee(1, n ? J(n.kind) : "image"),
    confirmLabel: t.rerun ? h.t("generationCommon.spend.generateVariant") : h.t("generationCommon.spend.generate"),
    light: !0
  })) return;
  let s = e;
  if (t.rerun) {
    const a = b.getState().duplicateNodeForRegeneration(e);
    if (!a) return;
    s = a.id;
  }
  let o;
  try {
    o = await te([s]);
  } catch (a) {
    ne(
      a instanceof Error && a.message ? a.message : h.t("generationCommon.batchPlan.authorizationFailed"),
      "error"
    );
    return;
  }
  try {
    await P(s, { grantId: o });
  } catch {
  }
}
async function an(e, t, n = {}) {
  const r = String(e || "").trim();
  if (!r) return;
  const s = Math.max(1, Math.min(8, Math.floor(t))), o = b.getState().nodes.find((i) => i.id === r);
  if (await Z.getState().requestConfirm({
    title: h.t("generationCommon.spend.startGeneration"),
    message: ee(s, o ? J(o.kind) : "image"),
    confirmLabel: h.t("generationCommon.spend.generate"),
    light: !0
  }))
    for (let i = 0; i < s; i += 1) {
      let c;
      try {
        c = await te([r]);
      } catch (d) {
        ne(
          d instanceof Error && d.message ? d.message : h.t("generationCommon.batchPlan.authorizationFailed"),
          "error"
        );
        return;
      }
      try {
        const d = await P(r, { ...n, grantId: c });
        Me.getState().reconcileTimelineForUpdatedNodes(r, d);
      } catch {
        return;
      }
    }
}
async function cn(e, t = {}) {
  const r = b.getState().duplicateNodeForRegeneration(e);
  if (!r) throw new Error("node not found");
  return P(r.id, t);
}
async function dn(e) {
  const t = String(e || "").trim();
  if (!t) return;
  const n = b.getState().nodes.find((o) => o.id === t);
  if (!await Z.getState().requestConfirm({
    title: h.t("generationCommon.composer.regenerate"),
    message: ee(1, n ? J(n.kind) : "image"),
    confirmLabel: h.t("generationCommon.composer.regenerate"),
    light: !0
  })) return;
  let s;
  try {
    s = await te([t]);
  } catch (o) {
    ne(
      o instanceof Error && o.message ? o.message : h.t("generationCommon.batchPlan.authorizationFailed"),
      "error"
    );
    return;
  }
  try {
    const o = await P(t, { grantId: s });
    Me.getState().reconcileTimelineForUpdatedNodes(t, o);
  } catch {
  }
}
function Pe(e, t = {}) {
  if (!e) return !1;
  const n = L(e.kind);
  if (n === "image") {
    if (!("id" in e) || !e.id) return !0;
    const i = e.meta || {}, c = C(i), d = c ? U(c, i) : null;
    if (!d || d.transportTaskKind !== "image_edit" || (d.slots || []).length === 0) return !0;
    const l = K(e, t);
    return !!(l.referenceImages.length > 0 || l.firstFrameUrl || c && Y(i, c));
  }
  if (n === "text") return !0;
  if (n === "audio") {
    if (!("meta" in e)) return !0;
    const i = e.meta || {}, c = C(i);
    return ((c ? U(c, i) : null)?.slots || []).some((u) => u.kind === "audio_ref") ? !!(c && Y(i, c)) : !0;
  }
  if (n !== "video" || !("id" in e) || !e.id) return !1;
  const r = e.meta || {}, s = C(r), o = s ? U(s, r) : null;
  if (o && (o.slots || []).length === 0) return !0;
  const a = K(e, t);
  return !!(a.firstFrameUrl || a.lastFrameUrl || a.referenceImages.length > 0 || s && Y(r, s));
}
const pn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  canRunGenerationNode: Pe,
  classifyGenerationError: Yt,
  confirmAndRunNode: sn,
  confirmAndRunNodeVariants: an,
  reconcileNodeModeWithConnectedReferences: Ue,
  regenerateNodeInPlace: dn,
  rerunGenerationNodeAsNewNode: cn,
  runGenerationNode: P,
  runGenerationNodesBatch: Ce,
  runGenerationNodesByPlan: on,
  spendCostKindForNodes: Ht
}, Symbol.toStringTag, { value: "Module" }));
export {
  m as a,
  I as b,
  Pe as c,
  Yt as d,
  sn as e,
  an as f,
  nt as g,
  Q as h,
  pn as i,
  ge as j,
  gn as k,
  le as l,
  Ft as m,
  j as n,
  mn as o,
  un as p,
  at as q,
  dn as r,
  fn as s,
  K as t,
  lt as u,
  H as v,
  on as w,
  O as x,
  Re as y,
  Ht as z
};
