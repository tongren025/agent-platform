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
import { EMPTY_ARRAY, atom, computed } from "@tldraw/state";
import { maxBy } from "@tldraw/utils";
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
  _visibilityClock = atom("collaboratorVisibilityClock", Date.now());
  _getCollaboratorsQuery() {
    return this.editor.store.query.records("instance_presence", () => ({
      userId: { neq: this.editor.user.getRecordId() }
    }));
  }
  getCollaborators() {
    const allPresenceRecords = this._getCollaboratorsQuery().get();
    if (!allPresenceRecords.length) return EMPTY_ARRAY;
    const userIds = [...new Set(allPresenceRecords.map((c) => c.userId))].sort();
    return userIds.map((id) => {
      const latestPresence = maxBy(
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
    if (!collaborators.length) return EMPTY_ARRAY;
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
  computed
], CollaboratorsManager.prototype, "_getCollaboratorsQuery", 1);
__decorateClass([
  computed
], CollaboratorsManager.prototype, "getCollaborators", 1);
__decorateClass([
  computed
], CollaboratorsManager.prototype, "getCollaboratorsOnCurrentPage", 1);
__decorateClass([
  computed
], CollaboratorsManager.prototype, "getVisibleCollaborators", 1);
__decorateClass([
  computed
], CollaboratorsManager.prototype, "getVisibleCollaboratorsOnCurrentPage", 1);
export {
  CollaboratorsManager
};
//# sourceMappingURL=CollaboratorsManager.mjs.map
