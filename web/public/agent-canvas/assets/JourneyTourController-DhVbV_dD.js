import { dV as T, S as x, c8 as e, aJ as h, l as C, q as I } from "./agentStudioMount-Dd-4ILXh.js";
import { I as M } from "./IconArrowRight-pLGZaXEu.js";
import { u, T as N } from "./journeyTourStore-4jA9PE5F.js";
const b = 4, l = 12, g = 232, P = 12;
function L(r) {
  for (const n of r) {
    const d = document.querySelector(n);
    if (!d) continue;
    const t = d.getBoundingClientRect();
    if (!(t.width <= 0 || t.height <= 0) && !(t.bottom < 0 || t.top > window.innerHeight || t.right < 0 || t.left > window.innerWidth))
      return { left: t.left, top: t.top, width: t.width, height: t.height };
  }
  return null;
}
function S(r, n) {
  const d = window.innerWidth, t = window.innerHeight;
  let i = r.top + r.height + P;
  if (i + n > t - l) {
    const a = r.top - P - n;
    a >= l && (i = a);
  }
  i = Math.min(Math.max(i, l), Math.max(l, t - n - l));
  let c = r.left + r.width / 2 - g / 2;
  return c = Math.min(Math.max(c, l), d - g - l), { left: c, top: i };
}
function z({
  selectors: r,
  title: n,
  body: d,
  stepLabel: t,
  primaryLabel: i,
  onNext: c,
  onDismiss: a
}) {
  const { t: w } = T(), p = r.join("|"), [s, o] = x.useState(null), v = x.useRef(null), [E, R] = x.useState(96);
  x.useEffect(() => {
    if (o(null), r.length === 0) return;
    let m = 0;
    const f = () => {
      o(L(r)), m = window.requestAnimationFrame(f);
    };
    return m = window.requestAnimationFrame(f), () => window.cancelAnimationFrame(m);
  }, [p]), x.useLayoutEffect(() => {
    v.current && R(v.current.offsetHeight);
  }, [s, p]), x.useEffect(() => {
    const m = (y) => {
      const k = y.target;
      k && k.closest("[data-onboarding-spotlight-callout]") || a();
    }, f = (y) => {
      y.key === "Escape" && a();
    };
    return window.addEventListener("pointerdown", m, !0), window.addEventListener("keydown", f), () => {
      window.removeEventListener("pointerdown", m, !0), window.removeEventListener("keydown", f);
    };
  }, [a]);
  const j = s ? S(s, E) : {
    left: Math.max(l, Math.round((window.innerWidth - g) / 2)),
    top: Math.max(l, Math.round(window.innerHeight * 0.62))
  }, A = s && s.height <= 44 ? "rounded-full" : "rounded-nomi";
  return /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    s ? /* @__PURE__ */ e.jsx(
      "div",
      {
        "data-onboarding-spotlight-ring": "true",
        "aria-hidden": "true",
        className: h("fixed z-[3400] pointer-events-none border-2 border-nomi-accent", A),
        style: {
          left: s.left - b,
          top: s.top - b,
          width: s.width + b * 2,
          height: s.height + b * 2,
          boxShadow: "0 0 0 4px var(--nomi-accent-soft)"
        }
      }
    ) : null,
    /* @__PURE__ */ e.jsxs(
      "div",
      {
        ref: v,
        "data-onboarding-spotlight-callout": "true",
        role: "dialog",
        "aria-label": n,
        className: h(
          "fixed z-[3401] flex flex-col gap-1 p-3",
          "rounded-nomi-lg border border-nomi-line bg-nomi-paper shadow-nomi-lg"
        ),
        style: { left: j.left, top: j.top, width: g },
        children: [
          /* @__PURE__ */ e.jsx("div", { className: "text-caption font-bold text-nomi-accent", children: n }),
          /* @__PURE__ */ e.jsx("p", { className: "m-0 text-body-sm text-nomi-ink-80 leading-snug", children: d }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            t ? /* @__PURE__ */ e.jsx("span", { className: "text-micro text-nomi-ink-40 tabular-nums", children: t }) : null,
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: a,
                className: h(
                  "ml-auto inline-flex items-center h-7 px-2.5 rounded-full border-0 bg-transparent cursor-pointer font-inherit",
                  "text-caption text-nomi-ink-40 transition-colors hover:text-nomi-ink"
                ),
                children: w("onboarding.skip")
              }
            ),
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: c,
                className: h(
                  "inline-flex items-center gap-1 h-7 px-3 rounded-full border-0 cursor-pointer font-inherit",
                  "bg-nomi-ink text-nomi-paper text-caption font-medium transition-colors hover:bg-nomi-accent"
                ),
                children: [
                  i,
                  /* @__PURE__ */ e.jsx(M, { size: 13, stroke: 1.6, "aria-hidden": "true" })
                ]
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function F({ onStartReal: r }) {
  const { t: n } = T(), d = u((o) => o.active), t = u((o) => o.phase), i = u((o) => o.beat), c = u((o) => o.teachIndex), a = u((o) => o.selectors), w = u((o) => o.advance), p = u((o) => o.skip), s = u((o) => o.finish);
  return d ? t === "finale" ? /* @__PURE__ */ e.jsx(
    "div",
    {
      className: "fixed inset-0 z-[3402] grid place-items-center bg-nomi-scrim",
      "data-journey-tour": "finale",
      role: "dialog",
      "aria-label": n("onboardingProviders.journey.finaleAria"),
      children: /* @__PURE__ */ e.jsxs("div", { className: "w-[400px] max-w-[88vw] flex flex-col items-center gap-3 p-7 rounded-nomi-lg border border-nomi-line bg-nomi-paper shadow-nomi-lg text-center", children: [
        /* @__PURE__ */ e.jsx("span", { className: "grid place-items-center size-11 rounded-full bg-nomi-accent-soft text-nomi-accent", children: /* @__PURE__ */ e.jsx(C, { size: 22, stroke: 1.8, "aria-hidden": "true" }) }),
        /* @__PURE__ */ e.jsx("div", { className: "text-title font-semibold text-nomi-ink", children: n("onboardingProviders.journey.finaleTitle") }),
        /* @__PURE__ */ e.jsx("p", { className: "m-0 text-body-sm text-nomi-ink-60 leading-snug", children: n("onboardingProviders.journey.finaleBody") }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5 mt-2", children: [
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                s(), r();
              },
              className: h(
                "inline-flex items-center h-9 px-4 rounded-full border-0 cursor-pointer font-inherit",
                "bg-nomi-ink text-nomi-paper text-body-sm font-medium transition-colors hover:bg-nomi-accent"
              ),
              children: n("onboardingProviders.journey.startOwnStory")
            }
          ),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: s,
              className: h(
                "inline-flex items-center h-9 px-4 rounded-full border border-nomi-line bg-nomi-paper cursor-pointer font-inherit",
                "text-body-sm text-nomi-ink-80 transition-colors hover:bg-nomi-ink-05"
              ),
              children: n("onboardingProviders.journey.browseFirst")
            }
          )
        ] })
      ] })
    }
  ) : i ? i.kind === "spotlight" ? /* @__PURE__ */ e.jsx(
    z,
    {
      selectors: a ?? i.selectors ?? [],
      title: n(`onboardingProviders.journey.beats.${i.id}.title`),
      body: n(`onboardingProviders.journey.beats.${i.id}.body`),
      stepLabel: n("onboardingProviders.journey.step", { current: c, total: N }),
      primaryLabel: c >= N ? n("onboardingProviders.journey.complete") : n("onboardingProviders.journey.next"),
      onNext: w,
      onDismiss: p
    }
  ) : /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: "fixed left-1/2 bottom-7 -translate-x-1/2 z-[3401] w-[320px] max-w-[88vw] flex flex-col gap-1 p-3 rounded-nomi-lg border border-nomi-line bg-nomi-paper shadow-nomi-lg",
      "data-journey-tour": "cinematic",
      role: "status",
      children: [
        /* @__PURE__ */ e.jsx("div", { className: "text-caption font-bold text-nomi-accent", children: n(`onboardingProviders.journey.beats.${i.id}.title`) }),
        /* @__PURE__ */ e.jsx("p", { className: "m-0 text-body-sm text-nomi-ink-80 leading-snug", children: n(`onboardingProviders.journey.beats.${i.id}.body`) }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
          /* @__PURE__ */ e.jsxs("span", { className: "inline-flex items-center gap-1 text-micro text-nomi-ink-40", children: [
            /* @__PURE__ */ e.jsx(I, { size: 11, stroke: 1.8, "aria-hidden": "true" }),
            n("onboardingProviders.journey.autoplaying")
          ] }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: p,
              className: "ml-auto inline-flex items-center h-7 px-2.5 rounded-full border-0 bg-transparent cursor-pointer font-inherit text-caption text-nomi-ink-40 transition-colors hover:text-nomi-ink",
              children: n("onboardingProviders.journey.skip")
            }
          )
        ] })
      ]
    }
  ) : null : null;
}
export {
  F as JourneyTourController
};
