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
var CollaboratorsManager_exports = {};
__export(CollaboratorsManager_exports, {
  CollaboratorsManager: () => CollaboratorsManager
});
module.exports = __toCommonJS(CollaboratorsManager_exports);
var import_state = require("@tldraw/state");
var import_utils = require("@tldraw/utils");
class CollaboratorsManager {
  constructor(editor) {
    this.editor = editor;
  }
  editor;
  _visibilityClockStarted = false;
  _startVisibilityClock() {
    if (this._visibilityClockStarted) return;
    this._visibilityClockStarted = true;
    this.editor.timers.setInterval(() => {
      this._visibilityClock.set(Date.now());
    }, this.editor.options.collaboratorCheckIntervalMs);
  }
  /**
   * Drives reactive re-evaluation of {@link CollaboratorsManager.getVisibleCollaborators}.
   * Ticked on a fixed interval so callers don't need to manage their own activity timers.
   */
  _visibilityClock = (0, import_state.atom)("collaboratorVisibilityClock", Date.now());
  _getCollaboratorsQuery() {
    return this.editor.store.query.records("instance_presence", () => ({
      userId: { neq: this.editor.user.getRecordId() }
    }));
  }
  getCollaborators() {
    const allPresenceRecords = this._getCollaboratorsQuery().get();
    if (!allPresenceRecords.length) return import_state.EMPTY_ARRAY;
    const userIds = [...new Set(allPresenceRecords.map((c) => c.userId))].sort();
    return userIds.map((id) => {
      const latestPresence = (0, import_utils.maxBy)(
        allPresenceRecords.filter((c) => c.userId === id),
        (p) => p.lastActivityTimestamp ?? 0
      );
      return latestPresence;
    });
  }
  getCollaboratorsOnCurrentPage() {
    const currentPageId = this.editor.getCurrentPageId();
    return this.getCollaborators().filter((c) => c.currentPageId === currentPageId);
  }
  getVisibleCollaborators() {
    const { editor } = this;
    const { collaboratorInactiveTimeoutMs, collaboratorIdleTimeoutMs } = editor.options;
    this._startVisibilityClock();
    this._visibilityClock.get();
    const now = Date.now();
    const collaborators = this.getCollaborators();
    if (!collaborators.length) return import_state.EMPTY_ARRAY;
    const { followingUserId, highlightedUserIds } = this.editor.getInstanceState();
    const currentUserId = this.editor.user.getRecordId();
    return collaborators.filter((presence) => {
      const { lastActivityTimestamp, userId, chatMessage } = presence;
      const elapsed = lastActivityTimestamp ? Math.max(0, now - lastActivityTimestamp) : 0;
      if (elapsed > collaboratorInactiveTimeoutMs) {
        return followingUserId === userId || highlightedUserIds.includes(userId);
      }
      if (elapsed > collaboratorIdleTimeoutMs) {
        if (presence.followingUserId === currentUserId) {
          return !!(chatMessage || highlightedUserIds.includes(userId));
        }
      }
      return true;
    });
  }
  getVisibleCollaboratorsOnCurrentPage() {
    const currentPageId = this.editor.getCurrentPageId();
    return this.getVisibleCollaborators().filter((c) => c.currentPageId === currentPageId);
  }
}
__decorateClass([
  import_state.computed
], CollaboratorsManager.prototype, "_getCollaboratorsQuery", 1);
__decorateClass([
  import_state.computed
], CollaboratorsManager.prototype, "getCollaborators", 1);
__decorateClass([
  import_state.computed
], CollaboratorsManager.prototype, "getCollaboratorsOnCurrentPage", 1);
__decorateClass([
  import_state.computed
], CollaboratorsManager.prototype, "getVisibleCollaborators", 1);
__decorateClass([
  import_state.computed
], CollaboratorsManager.prototype, "getVisibleCollaboratorsOnCurrentPage", 1);
//# sourceMappingURL=CollaboratorsManager.js.map
