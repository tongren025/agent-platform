"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var TickManager_exports = {};
__export(TickManager_exports, {
  TickManager: () => TickManager
});
module.exports = __toCommonJS(TickManager_exports);
var import_utils = require("@tldraw/utils");
const throttleToNextFrame = typeof process !== "undefined" && process.env.NODE_ENV === "test" ? (
  // At test time we should use actual raf and not throttle, because throttle was set up to evaluate immediately during tests, which causes stack overflow
  // for the tick manager since it sets up a raf loop.
  function mockThrottle(cb) {
    const frame = requestAnimationFrame(cb);
    return () => cancelAnimationFrame(frame);
  }
) : import_utils.throttleToNextFrame;
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
  import_utils.bind
], TickManager.prototype, "tick", 1);
__decorateClass([
  import_utils.bind
], TickManager.prototype, "dispose", 1);
//# sourceMappingURL=TickManager.js.map
