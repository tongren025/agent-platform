import { aR as t } from "./agentStudioMount-BaWK4RwX.js";
const r = "agent-studio.production-director-mode";
function i() {
  return typeof window > "u" ? "guided" : window.localStorage.getItem(r) === "professional" ? "professional" : "guided";
}
const n = t((o) => ({
  // 新用户永远先进入一步一指引；主动切到专业画布后才记住选择。
  mode: i(),
  directoryOpen: !0,
  setMode: (e) => {
    typeof window < "u" && window.localStorage.setItem(r, e), o({ mode: e, directoryOpen: e === "guided" });
  },
  setDirectoryOpen: (e) => o({ directoryOpen: e }),
  toggleDirectory: () => o((e) => ({ directoryOpen: !e.directoryOpen }))
}));
export {
  n as u
};
