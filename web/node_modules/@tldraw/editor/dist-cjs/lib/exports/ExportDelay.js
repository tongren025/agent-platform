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
var ExportDelay_exports = {};
__export(ExportDelay_exports, {
  ExportDelay: () => ExportDelay
});
module.exports = __toCommonJS(ExportDelay_exports);
var import_utils = require("@tldraw/utils");
class ExportDelay {
  constructor(maxDelayTimeMs) {
    this.maxDelayTimeMs = maxDelayTimeMs;
  }
  maxDelayTimeMs;
  isResolved = false;
  promisesToWaitFor = [];
  waitUntil(promise) {
    if (this.isResolved) {
      throw new Error(
        "Cannot `waitUntil` - the export has already been resolved. Make sure to call `waitUntil` as soon as possible during an export - ie within the first react effect after rendering."
      );
    }
    this.promisesToWaitFor.push(
      promise.catch((err) => console.error("Error while waiting for export:", err))
    );
  }
  async resolvePromises() {
    let lastLength = null;
    while (this.promisesToWaitFor.length !== lastLength) {
      lastLength = this.promisesToWaitFor.length;
      await Promise.allSettled(this.promisesToWaitFor);
      await (0, import_utils.sleep)(0);
    }
  }
  async resolve() {
    const timeoutPromise = (0, import_utils.sleep)(this.maxDelayTimeMs).then(() => "timeout");
    const resolvePromise = this.resolvePromises().then(() => "resolved");
    const result = await Promise.race([timeoutPromise, resolvePromise]);
    if (result === "timeout") {
      console.warn("[tldraw] Export delay timed out after ${this.maxDelayTimeMs}ms");
    }
    this.isResolved = true;
  }
}
__decorateClass([
  import_utils.bind
], ExportDelay.prototype, "waitUntil", 1);
//# sourceMappingURL=ExportDelay.js.map
