"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var PerformanceManager_exports = {};
__export(PerformanceManager_exports, {
  PerformanceManager: () => PerformanceManager
});
module.exports = __toCommonJS(PerformanceManager_exports);
var import_utils = require("@tldraw/utils");
var import_eventemitter3 = __toESM(require("eventemitter3"), 1);
function percentile(sorted, p) {
  const idx = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}
function computeFrameTimeStats(frameTimes) {
  if (frameTimes.length === 0) return { avg: 0, median: 0, p95: 0, p99: 0, min: 0, max: 0 };
  const sorted = [...frameTimes].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    avg: sum / sorted.length,
    median: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
    min: sorted[0],
    max: sorted[sorted.length - 1]
  };
}
function toLoafEntry(entry) {
  const e = entry;
  if (typeof e.duration !== "number") return null;
  return {
    startTime: e.startTime,
    duration: e.duration,
    blockingDuration: e.blockingDuration ?? 0,
    scripts: (e.scripts ?? []).map((s) => ({
      sourceURL: s.sourceURL ?? "",
      invoker: s.invoker ?? "",
      duration: s.duration ?? 0
    }))
  };
}
class PerformanceManager {
  /** @internal */
  emitter = new import_eventemitter3.default();
  editor;
  // Active interaction tracking
  activeInteraction = null;
  // Active camera tracking
  activeCamera = null;
  // Lazy listener cleanup functions
  frameCleanup = null;
  shapeCreatedCleanup = null;
  shapeEditedCleanup = null;
  shapeDeletedCleanup = null;
  // LoAF observer
  loafObserver = null;
  constructor(editor) {
    this.editor = editor;
  }
  /**
   * Subscribe to a performance event. Returns an unsubscribe function.
   *
   * @example
   * ```ts
   * const unsub = editor.performance.on('interaction-end', (event) => {
   *   sendToAnalytics({ name: event.name, fps: event.fps, p95: event.p95FrameTime })
   * })
   * // later: unsub()
   * ```
   *
   * @public
   */
  on(event, fn) {
    this.emitter.on(event, fn);
    this._maybeAttachLazyListeners(event);
    return () => {
      this.emitter.off(event, fn);
      this._maybeDetachLazyListeners(event);
    };
  }
  /**
   * Subscribe to a performance event once. The listener is removed after the first invocation.
   * Returns an unsubscribe function for early removal.
   *
   * @public
   */
  once(event, fn) {
    const wrapped = (...args) => {
      ;
      fn(...args);
      this._maybeDetachLazyListeners(event);
    };
    this.emitter.once(event, wrapped);
    this._maybeAttachLazyListeners(event);
    return () => {
      this.emitter.off(event, wrapped);
      this._maybeDetachLazyListeners(event);
    };
  }
  /** @internal */
  dispose() {
    if (this.activeCamera?.timeout) clearTimeout(this.activeCamera.timeout);
    this.activeInteraction = null;
    this.activeCamera = null;
    this.frameCleanup?.();
    this.frameCleanup = null;
    this.shapeCreatedCleanup?.();
    this.shapeCreatedCleanup = null;
    this.shapeEditedCleanup?.();
    this.shapeEditedCleanup = null;
    this.shapeDeletedCleanup?.();
    this.shapeDeletedCleanup = null;
    this._stopLoafObserver();
    this.emitter.removeAllListeners();
  }
  // --- Internal notification methods ---
  /** @internal */
  _notifyInteractionStart(name, path) {
    if (this.emitter.listenerCount("interaction-start") === 0 && this.emitter.listenerCount("interaction-end") === 0) {
      return;
    }
    if (this.activeInteraction) {
      console.warn(
        `[tldraw] New interaction '${name}' started while '${this.activeInteraction.name}' was still active`
      );
    }
    const selectedShapeTypes = {};
    for (const shape of this.editor.getSelectedShapes()) {
      selectedShapeTypes[shape.type] = (selectedShapeTypes[shape.type] || 0) + 1;
    }
    this.activeInteraction = {
      name,
      path,
      startTime: performance.now(),
      frameTimes: [],
      selectedShapeTypes,
      loafEntries: []
    };
    const event = {
      name,
      path,
      timestamp: performance.now()
    };
    this.emitter.emit("interaction-start", event);
  }
  /** @internal */
  _notifyInteractionEnd() {
    const interaction = this.activeInteraction;
    if (!interaction) return;
    this.activeInteraction = null;
    if (this.emitter.listenerCount("interaction-end") === 0) return;
    const duration = performance.now() - interaction.startTime;
    const stats = computeFrameTimeStats(interaction.frameTimes);
    const event = {
      name: interaction.name,
      path: interaction.path,
      duration,
      fps: interaction.frameTimes.length > 0 ? interaction.frameTimes.length / duration * 1e3 : 0,
      frameCount: interaction.frameTimes.length,
      avgFrameTime: stats.avg,
      medianFrameTime: stats.median,
      p95FrameTime: stats.p95,
      p99FrameTime: stats.p99,
      minFrameTime: stats.min,
      maxFrameTime: stats.max,
      frameTimes: interaction.frameTimes,
      shapeCount: this.editor.getCurrentPageShapeIds().size,
      selectedShapeTypes: interaction.selectedShapeTypes,
      longAnimationFrames: interaction.loafEntries.length > 0 ? interaction.loafEntries : void 0,
      zoomLevel: this.editor.getCamera().z,
      timestamp: performance.now()
    };
    this.emitter.emit("interaction-end", event);
  }
  /** @internal */
  _notifyCameraOperation(type) {
    if (this.emitter.listenerCount("camera-start") === 0 && this.emitter.listenerCount("camera-end") === 0) {
      return;
    }
    if (this.activeCamera) {
      if (this.activeCamera.timeout) {
        clearTimeout(this.activeCamera.timeout);
      }
      if (this.activeCamera.type !== type) {
        this._endCameraSession();
        this._startCameraSession(type);
      } else {
        this.activeCamera.timeout = this.editor.timers.setTimeout(
          () => this._endCameraSession(),
          50
        );
      }
    } else {
      this._startCameraSession(type);
    }
  }
  /** @internal */
  _notifyUndoRedo(type, undoDepth, redoDepth) {
    if (this.emitter.listenerCount(type) === 0) return;
    const event = {
      type,
      undoDepth,
      redoDepth
    };
    this.emitter.emit(type, event);
  }
  // --- Private helpers ---
  _startCameraSession(type) {
    this.activeCamera = {
      type,
      startTime: performance.now(),
      frameTimes: [],
      timeout: this.editor.timers.setTimeout(() => this._endCameraSession(), 50),
      loafEntries: []
    };
    if (this.emitter.listenerCount("camera-start") > 0) {
      const event = {
        type,
        timestamp: performance.now()
      };
      this.emitter.emit("camera-start", event);
    }
  }
  _endCameraSession() {
    const camera = this.activeCamera;
    if (!camera) return;
    this.activeCamera = null;
    if (camera.timeout) clearTimeout(camera.timeout);
    if (this.emitter.listenerCount("camera-end") === 0) return;
    const duration = performance.now() - camera.startTime;
    const stats = computeFrameTimeStats(camera.frameTimes);
    const viewportBounds = this.editor.getViewportScreenBounds();
    const totalShapes = this.editor.getCurrentPageShapeIds().size;
    const culledShapeCount = this.editor.getCulledShapes().size;
    const event = {
      type: camera.type,
      duration,
      fps: camera.frameTimes.length > 0 ? camera.frameTimes.length / duration * 1e3 : 0,
      frameCount: camera.frameTimes.length,
      avgFrameTime: stats.avg,
      medianFrameTime: stats.median,
      p95FrameTime: stats.p95,
      p99FrameTime: stats.p99,
      minFrameTime: stats.min,
      maxFrameTime: stats.max,
      frameTimes: camera.frameTimes,
      shapeCount: totalShapes,
      viewportWidth: viewportBounds.w,
      viewportHeight: viewportBounds.h,
      longAnimationFrames: camera.loafEntries.length > 0 ? camera.loafEntries : void 0,
      visibleShapeCount: totalShapes - culledShapeCount,
      culledShapeCount,
      zoomLevel: this.editor.getCamera().z,
      timestamp: performance.now()
    };
    this.emitter.emit("camera-end", event);
  }
  _onFrame(elapsed) {
    if (this.activeInteraction) {
      this.activeInteraction.frameTimes.push(elapsed);
    }
    if (this.activeCamera) {
      this.activeCamera.frameTimes.push(elapsed);
    }
    if (this.emitter.listenerCount("frame") > 0) {
      const totalShapes = this.editor.getCurrentPageShapeIds().size;
      const culledShapes = this.editor.getCulledShapes();
      const culledCount = culledShapes.size;
      const event = {
        elapsed,
        shapeCount: totalShapes,
        culledShapeCount: culledCount,
        visibleShapeCount: totalShapes - culledCount
      };
      this.emitter.emit("frame", event);
    }
  }
  _onShapesCreated(records) {
    if (this.emitter.listenerCount("shapes-created") === 0) return;
    const shapeTypes = {};
    for (const record of records) {
      if (record.typeName === "shape") {
        shapeTypes[record.type] = (shapeTypes[record.type] || 0) + 1;
      }
    }
    const count = Object.values(shapeTypes).reduce((a, b) => a + b, 0);
    if (count === 0) return;
    const event = {
      operation: "create",
      count,
      shapeTypes,
      timestamp: performance.now()
    };
    this.emitter.emit("shapes-created", event);
  }
  _onShapesEdited(records) {
    if (this.emitter.listenerCount("shapes-updated") === 0) return;
    const shapeTypes = {};
    for (const record of records) {
      if (record.typeName === "shape") {
        shapeTypes[record.type] = (shapeTypes[record.type] || 0) + 1;
      }
    }
    const count = Object.values(shapeTypes).reduce((a, b) => a + b, 0);
    if (count === 0) return;
    const event = {
      operation: "update",
      count,
      shapeTypes,
      timestamp: performance.now()
    };
    this.emitter.emit("shapes-updated", event);
  }
  _onShapesDeleted(ids) {
    if (this.emitter.listenerCount("shapes-deleted") === 0) return;
    const shapeTypes = {};
    for (const id of ids) {
      const shape = this.editor.getShape(id);
      if (shape) {
        shapeTypes[shape.type] = (shapeTypes[shape.type] || 0) + 1;
      }
    }
    const event = {
      operation: "delete",
      count: ids.length,
      shapeTypes,
      timestamp: performance.now()
    };
    this.emitter.emit("shapes-deleted", event);
  }
  // --- LoAF observer ---
  _startLoafObserver() {
    if (typeof PerformanceObserver === "undefined") return;
    try {
      const supported = PerformanceObserver.supportedEntryTypes;
      if (!supported?.includes("long-animation-frame")) return;
    } catch {
      return;
    }
    this.loafObserver = new PerformanceObserver((list) => {
      const isInteractionActive = this.activeInteraction !== null;
      const isCameraActive = this.activeCamera !== null;
      if (!isInteractionActive && !isCameraActive) return;
      for (const entry of list.getEntries()) {
        const loaf = toLoafEntry(entry);
        if (!loaf) continue;
        if (isInteractionActive) {
          this.activeInteraction.loafEntries.push(loaf);
        }
        if (isCameraActive) {
          this.activeCamera.loafEntries.push(loaf);
        }
      }
    });
    this.loafObserver.observe({ type: "long-animation-frame", buffered: false });
  }
  _stopLoafObserver() {
    if (this.loafObserver) {
      this.loafObserver.disconnect();
      this.loafObserver = null;
    }
  }
  // --- Lazy listener management ---
  _needsFrameListener() {
    return this.emitter.listenerCount("frame") > 0 || this.emitter.listenerCount("interaction-start") > 0 || this.emitter.listenerCount("interaction-end") > 0 || this.emitter.listenerCount("camera-start") > 0 || this.emitter.listenerCount("camera-end") > 0;
  }
  _needsLoafObserver() {
    return this.emitter.listenerCount("interaction-end") > 0 || this.emitter.listenerCount("camera-end") > 0;
  }
  _maybeAttachLazyListeners(event) {
    if (!this.frameCleanup && (event === "frame" || event === "interaction-start" || event === "interaction-end" || event === "camera-start" || event === "camera-end")) {
      if (this._needsFrameListener()) {
        this.editor.on("frame", this._onFrame);
        this.frameCleanup = () => this.editor.off("frame", this._onFrame);
      }
    }
    if (!this.loafObserver && (event === "interaction-end" || event === "camera-end")) {
      if (this._needsLoafObserver()) {
        this._startLoafObserver();
      }
    }
    if (!this.shapeCreatedCleanup && event === "shapes-created") {
      this.editor.on("created-shapes", this._onShapesCreated);
      this.shapeCreatedCleanup = () => this.editor.off("created-shapes", this._onShapesCreated);
    }
    if (!this.shapeEditedCleanup && event === "shapes-updated") {
      this.editor.on("edited-shapes", this._onShapesEdited);
      this.shapeEditedCleanup = () => this.editor.off("edited-shapes", this._onShapesEdited);
    }
    if (!this.shapeDeletedCleanup && event === "shapes-deleted") {
      this.editor.on("deleted-shapes", this._onShapesDeleted);
      this.shapeDeletedCleanup = () => this.editor.off("deleted-shapes", this._onShapesDeleted);
    }
  }
  _maybeDetachLazyListeners(event) {
    if (this.frameCleanup && (event === "frame" || event === "interaction-start" || event === "interaction-end" || event === "camera-start" || event === "camera-end")) {
      if (!this._needsFrameListener()) {
        this.frameCleanup();
        this.frameCleanup = null;
      }
    }
    if (this.loafObserver && (event === "interaction-end" || event === "camera-end")) {
      if (!this._needsLoafObserver()) {
        this._stopLoafObserver();
      }
    }
    if (this.shapeCreatedCleanup && event === "shapes-created" && this.emitter.listenerCount("shapes-created") === 0) {
      this.shapeCreatedCleanup();
      this.shapeCreatedCleanup = null;
    }
    if (this.shapeEditedCleanup && event === "shapes-updated" && this.emitter.listenerCount("shapes-updated") === 0) {
      this.shapeEditedCleanup();
      this.shapeEditedCleanup = null;
    }
    if (this.shapeDeletedCleanup && event === "shapes-deleted" && this.emitter.listenerCount("shapes-deleted") === 0) {
      this.shapeDeletedCleanup();
      this.shapeDeletedCleanup = null;
    }
  }
}
__decorateClass([
  import_utils.bind
], PerformanceManager.prototype, "_onFrame", 1);
__decorateClass([
  import_utils.bind
], PerformanceManager.prototype, "_onShapesCreated", 1);
__decorateClass([
  import_utils.bind
], PerformanceManager.prototype, "_onShapesEdited", 1);
__decorateClass([
  import_utils.bind
], PerformanceManager.prototype, "_onShapesDeleted", 1);
//# sourceMappingURL=PerformanceManager.js.map
