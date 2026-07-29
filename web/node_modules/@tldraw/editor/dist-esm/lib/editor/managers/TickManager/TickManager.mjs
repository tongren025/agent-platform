var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
import { throttleToNextFrame as _throttleToNextFrame, bind } from "@tldraw/utils";
const throttleToNextFrame = typeof process !== "undefined" && process.env.NODE_ENV === "test" ? (
  // At test time we should use actual raf and not throttle, because throttle was set up to evaluate immediately during tests, which causes stack overflow
  // for the tick manager since it sets up a raf loop.
  (function mockThrottle(cb) {
    const frame = requestAnimationFrame(cb);
    return () => cancelAnimationFrame(frame);
  })
) : _throttleToNextFrame;
class TickManager {
  constructor(editor) {
    this.editor = editor;
    this.editor.disposables.add(this.dispose);
    this.start();
  }
  editor;
  cancelRaf;
  isPaused = true;
  now = 0;
  start() {
    this.isPaused = false;
    this.cancelRaf?.();
    this.cancelRaf = throttleToNextFrame(this.tick);
    this.now = Date.now();
  }
  tick() {
    if (this.isPaused) {
      return;
    }
    const now = Date.now();
    const elapsed = now - this.now;
    this.now = now;
    this.editor.emit("frame", elapsed);
    this.editor.emit("tick", elapsed);
    this.cancelRaf = throttleToNextFrame(this.tick);
  }
  dispose() {
    this.isPaused = true;
    this.cancelRaf?.();
  }
}
__decorateClass([
  bind
], TickManager.prototype, "tick", 1);
__decorateClass([
  bind
], TickManager.prototype, "dispose", 1);
export {
  TickManager
};
//# sourceMappingURL=TickManager.mjs.map
