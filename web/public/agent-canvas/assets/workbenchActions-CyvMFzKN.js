import { aK as s, cf as c } from "./agentStudioMount-CNVmpr5A.js";
function i({
  icon: r,
  label: e,
  className: t,
  type: n = "button",
  ...o
}) {
  const a = s(
    "tc-workbench-icon-button",
    "inline-grid place-items-center",
    "size-8 rounded-workbench-control border-0",
    "bg-transparent text-workbench-muted",
    "cursor-pointer",
    "transition-[background,color] duration-150 ease-out",
    "hover:bg-workbench-hover hover:text-workbench-ink",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    "[&>svg]:size-4 [&>svg]:stroke-2",
    t
  );
  return /* @__PURE__ */ c.jsx(
    "button",
    {
      ...o,
      className: a,
      type: n,
      "aria-label": o["aria-label"] ?? e,
      title: o.title ?? e,
      children: r
    }
  );
}
function d({
  children: r,
  className: e,
  type: t = "button",
  ...n
}) {
  const o = s(
    "tc-workbench-button",
    "inline-flex items-center justify-center gap-1.5",
    "h-8 px-3 rounded-workbench-control",
    "border border-workbench-border-soft",
    "bg-workbench-surface text-workbench-ink text-body-sm font-medium",
    "cursor-pointer",
    "transition-[background,border-color,color,box-shadow] duration-150 ease-out",
    "hover:bg-workbench-hover",
    "active:bg-workbench-pressed",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "[&>svg]:size-4 [&>svg]:stroke-2",
    e
  );
  return /* @__PURE__ */ c.jsx("button", { ...n, className: o, type: t, children: r });
}
export {
  d as W,
  i as a
};
