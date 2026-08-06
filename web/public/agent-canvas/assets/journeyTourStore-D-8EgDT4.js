import { aR as I, cs as O, dB as x, dW as D, e7 as E } from "./agentStudioMount-D0_EKHTh.js";
import { a as S } from "./applyCanvasToolCall-CmLvkhnG.js";
import { s as h } from "./journeyTourActivity-B7H7sNao.js";
import { getDemoProjectName as P, getDemoStory as M, buildDemoStoryboardPlan as C, DEMO_NODE_IMAGES as W, DEMO_CANVAS_SPOTLIGHTS as m } from "./demoProject-Dius-uoH.js";
const k = [
  {
    id: "write",
    mode: "creation",
    kind: "cinematic"
  },
  {
    id: "split",
    mode: "creation",
    kind: "cinematic"
  },
  {
    id: "canvas",
    mode: "generation",
    kind: "cinematic"
  },
  {
    id: "character",
    mode: "generation",
    kind: "spotlight",
    selectors: ['[data-tour-target="character"]', ".generation-canvas-v2-node"]
  },
  {
    id: "staging",
    mode: "generation",
    kind: "spotlight",
    selectors: ['[data-tour-target~="staging"]', ".generation-canvas-v2-node"]
  },
  {
    id: "trajectory",
    mode: "generation",
    kind: "spotlight",
    selectors: ['[data-tour-target~="trajectory"]', ".generation-canvas-v2-node"]
  },
  {
    id: "generate",
    mode: "generation",
    kind: "spotlight",
    selectors: [
      '[data-tour-target="character"] [aria-label="生成素材"]',
      '[data-tour-target="character"] [aria-label="Generate asset"]',
      '.generation-canvas-v2-node [aria-label="生成素材"]',
      '.generation-canvas-v2-node [aria-label="Generate asset"]',
      '[data-tour-target="character"]'
    ]
  },
  {
    id: "captions",
    mode: "preview",
    kind: "spotlight",
    selectors: [
      '[data-tour-target="captions"]',
      '[aria-label="添加字幕"]',
      '[aria-label="Add caption"]',
      '[aria-label="文字"]',
      '[aria-label="Text"]'
    ]
  },
  {
    id: "export",
    mode: "preview",
    kind: "spotlight",
    selectors: [".workbench-preview-player__export-button", ".nomi-appbar__primary"]
  }
], q = k.filter((e) => e.kind === "spotlight").length, T = [
  {
    id: "manga",
    emoji: "🎭",
    label: "漫剧示例",
    subtitle: "二次元短剧 · 校园天台",
    projectName: "示例：天台上的告白",
    story: [
      "放学后的天台。夕阳把整座教学楼镀成橘金色，风把白色窗帘吹得鼓起。",
      "林夏抱着一摞试卷站在天台门口，看见顾辰背对着她，正撑在栏杆上望远方。",
      "她深吸一口气走过去：「学长，这次月考……我超过你了。」",
      "顾辰转过头，露出一个意外又骄傲的笑。「那你之前说要拿第一就跟我告白，记得吗？」",
      "林夏的脸瞬间红到耳根。风掠过两个人之间，把她手里的卷子吹得四散。",
      "她小声说：「记得。」",
      "夕阳落在两个少年人之间，定格成一帧少女漫的封面。"
    ].join(`

`)
  },
  {
    id: "product-demo",
    emoji: "🚀",
    label: "产品 demo 示例",
    subtitle: "SaaS 30 秒介绍 · AI 协作工具",
    projectName: "示例：30 秒产品介绍",
    story: [
      "镜头一：一个团队负责人深夜加班，对着满屏的文档和聊天窗口皱眉。屏幕的蓝光打在她疲惫的脸上。",
      '镜头二：她打开我们的产品 LumenFlow，输入一句话："帮我把这周所有客户反馈整理成下周路线图。"',
      "镜头三：界面上 AI 自动抓取来自 Slack、Notion、邮件的散落信息，可视化地汇集成一份结构化报告。",
      "镜头四：早晨九点，团队成员陆续打开同一份报告，每个人都看到了清晰的优先级和分工。",
      "镜头五：负责人在咖啡馆轻松地喝着拿铁，手机推送显示：今天的会议比预定时间早结束 45 分钟。",
      "收尾：产品 logo 出现在屏幕中央，下方一行字：LumenFlow — 让团队像一个人一样思考。"
    ].join(`

`)
  },
  {
    id: "travel-vlog",
    emoji: "🎒",
    label: "短视频示例",
    subtitle: "Vlog 风格 · 京都一日",
    projectName: "示例：京都一日 vlog",
    story: [
      "清晨六点，京都还在睡。我提着相机从青旅出门，街道上只有送报纸的自行车。",
      "第一站是伏见稻荷。还没到旅行团到来的时间，千本鸟居里只有我一个人，阳光从鸟居缝隙漏下来，洒成一地金色的格子。",
      "中午在锦市场吃了一串现烤的鳗鱼，老板用京都腔说着「ありがとうね」。",
      "下午沿着哲学之道走，樱花已经落了大半，但溪流里漂着粉色的花瓣，比盛开时更安静。",
      "傍晚去了八坂神社旁边的小山。爬到顶上时，整座京都正好在脚下慢慢被夕阳染红。",
      "回到青旅那一刻，我打开相机预览，发现今天拍了三百多张照片。但最想分享的，只有一句话：",
      '"京都最美的时刻，永远在游客醒来之前。"'
    ].join(`

`)
  }
];
T.find((e) => e.id === "product-demo") ?? T[0];
function L(e, t = "") {
  const l = e.split(/\n{2,}/g).map((o) => o.trim()).filter(Boolean);
  return {
    version: 1,
    title: t,
    contentJson: {
      type: "doc",
      content: l.length === 0 ? [{ type: "paragraph" }] : l.map((o) => ({
        type: "paragraph",
        content: [{ type: "text", text: o }]
      }))
    },
    updatedAt: Date.now()
  };
}
const R = 26, G = 200;
function B(e) {
  return new Promise((t) => window.setTimeout(t, e));
}
async function J(e) {
  const { story: t, title: l, setDocument: o, shouldAbort: r, charMs: a = R } = e;
  for (let s = 1; s <= t.length; s += 1) {
    if (r()) return;
    o(L(t.slice(0, s), l)), await B(t[s - 1] === `
` ? G : a);
  }
}
let p = 0, i = null;
const b = (e) => new Promise((t) => window.setTimeout(t, e)), _ = () => b(80), v = (e) => k.find((t) => t.id === e), $ = I((e) => {
  const t = () => new Promise((o) => {
    i = o;
  }), l = async () => {
    const o = p += 1, r = () => p !== o, a = () => E.getState();
    e({ phase: "running", beat: null, teachIndex: 0, selectors: null });
    let s = 0;
    const y = (n) => e({ beat: v(n), selectors: null }), c = async (n, d) => {
      r() || (s += 1, e({ beat: v(n), teachIndex: s, selectors: d ?? v(n).selectors ?? null }), await t());
    };
    if (a().setStoryboardEditorOpen(!1), a().setStoryboardPlan(null), a().setWorkspaceMode("creation"), await _(), r() || (y("write"), await J({
      story: M(),
      title: P(),
      setDocument: (n) => a().setWorkbenchDocument(n),
      shouldAbort: r
    }), await b(600), r())) return;
    const w = C();
    if (a().setStoryboardPlan(w), a().setStoryboardEditorOpen(!0), y("split"), await b(2600), r()) return;
    const j = x(w), A = await S("create_canvas_nodes", j);
    a().commitStoryboardPlan(), a().setWorkspaceMode("generation"), a().requestCanvasFit();
    const f = A?.clientIdToNodeId ?? {}, N = D.getState();
    for (const [n, d] of Object.entries(f)) {
      const u = W[n];
      u && d && N.addNodeResult(d, { id: `demo-${n}`, type: "image", url: u, createdAt: Date.now() });
    }
    const g = (n, d = "") => {
      const u = f[n];
      return u ? [`[data-node-id="${u}"]${d}`, ".generation-canvas-v2-node"] : [".generation-canvas-v2-node"];
    };
    if (y("canvas"), await b(2200), !r() && (await c("character", g(m.character)), await c("staging", g(m.staging)), await c("trajectory", g(m.trajectory)), await c("generate", g(m.generate, ' [aria-label="生成素材"]')), !r())) {
      try {
        await S("arrange_storyboard_to_timeline", {});
      } catch {
      }
      a().setWorkspaceMode("preview"), await _(), await c("captions"), await c("export"), !r() && e({ phase: "finale", beat: null, selectors: null });
    }
  };
  return {
    active: !1,
    phase: "idle",
    beat: null,
    teachIndex: 0,
    selectors: null,
    start: () => {
      h(!0), e({ active: !0, phase: "running", beat: null, teachIndex: 0, selectors: null }), l();
    },
    stop: () => {
      p += 1, i?.(), i = null, h(!1), e({ active: !1, phase: "idle", beat: null, selectors: null });
    },
    advance: () => {
      const o = i;
      i = null, o?.();
    },
    skip: () => {
      p += 1, i?.(), i = null, e({ phase: "finale", beat: null, selectors: null });
    },
    finish: () => {
      O(), p += 1, i?.(), i = null, h(!1), e({ active: !1, phase: "idle", beat: null, selectors: null });
    }
  };
}), z = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  useJourneyTourStore: $
}, Symbol.toStringTag, { value: "Module" }));
export {
  q as T,
  z as j,
  $ as u
};
