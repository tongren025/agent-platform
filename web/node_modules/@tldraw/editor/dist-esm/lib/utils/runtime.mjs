import { hardReset } from "./sync/hardReset.mjs";
const runtime = {
  openWindow(url, target, allowReferrer = false) {
    return window.open(url, target, allowReferrer ? "noopener" : "noopener noreferrer");
  },
  refreshPage() {
    window.location.reload();
  },
  async hardReset() {
    return await hardReset({ shouldReload: true });
  }
};
function setRuntimeOverrides(input) {
  Object.assign(runtime, input);
}
function openWindow(url, target = "_blank", allowReferrer) {
  return runtime.openWindow(url, target, allowReferrer);
}
function refreshPage() {
  runtime.refreshPage();
}
function hardResetEditor() {
  runtime.hardReset();
}
export {
  hardResetEditor,
  openWindow,
  refreshPage,
  runtime,
  setRuntimeOverrides
};
//# sourceMappingURL=runtime.mjs.map
