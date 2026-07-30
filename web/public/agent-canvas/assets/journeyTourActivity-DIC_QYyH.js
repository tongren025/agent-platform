import { S as u } from "./agentStudioMount-CP7x4OcS.js";
let t = !1;
const r = /* @__PURE__ */ new Set();
function o() {
  r.forEach((e) => e());
}
function s(e) {
  t !== e && (t = e, o());
}
function n() {
  return t;
}
function c(e) {
  return r.add(e), () => {
    r.delete(e);
  };
}
function a() {
  return u.useSyncExternalStore(
    c,
    n,
    n
  );
}
export {
  s,
  a as u
};
