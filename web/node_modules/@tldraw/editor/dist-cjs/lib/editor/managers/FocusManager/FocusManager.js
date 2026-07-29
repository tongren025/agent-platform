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
var FocusManager_exports = {};
__export(FocusManager_exports, {
  FocusManager: () => FocusManager
});
module.exports = __toCommonJS(FocusManager_exports);
var import_utils = require("@tldraw/utils");
class FocusManager {
  constructor(editor, autoFocus) {
    this.editor = editor;
    this.disposeSideEffectListener = editor.sideEffects.registerAfterChangeHandler(
      "instance",
      (prev, next) => {
        if (prev.isFocused !== next.isFocused) {
          this.updateContainerClass();
        }
      }
    );
    const currentFocusState = editor.getInstanceState().isFocused;
    if (autoFocus !== currentFocusState) {
      editor.updateInstanceState({ isFocused: !!autoFocus });
    }
    this.updateContainerClass();
    const body = editor.getContainerDocument().body;
    body.addEventListener("keydown", this.handleKeyDown);
    body.addEventListener("mousedown", this.handleMouseDown);
  }
  editor;
  disposeSideEffectListener;
  /**
   * The editor's focus state and the container's focus state
   * are not necessarily always in sync. For that reason we
   * can't rely on the css `:focus` or `:focus-within` selectors to style the
   * editor when it is in focus.
   *
   * For that reason we synchronize the editor's focus state with a
   * special class on the container: tl-container__focused
   */
  updateContainerClass() {
    const container = this.editor.getContainer();
    const instanceState = this.editor.getInstanceState();
    if (instanceState.isFocused) {
      container.classList.add("tl-container__focused");
    } else {
      container.classList.remove("tl-container__focused");
    }
    container.classList.add("tl-container__no-focus-ring");
  }
  handleKeyDown(keyEvent) {
    const container = this.editor.getContainer();
    const activeEl = container.ownerDocument.activeElement;
    if (this.editor.getEditingShapeId() && !activeEl?.closest(".tlui-contextual-toolbar")) return;
    if (activeEl === container && this.editor.getSelectedShapeIds().length > 0) return;
    if (["Tab", "ArrowUp", "ArrowDown"].includes(keyEvent.key)) {
      container.classList.remove("tl-container__no-focus-ring");
    }
  }
  handleMouseDown() {
    const container = this.editor.getContainer();
    container.classList.add("tl-container__no-focus-ring");
  }
  focus() {
    this.editor.getContainer().focus();
  }
  blur({ blurContainer = true } = {}) {
    this.editor.complete();
    if (blurContainer) this.editor.getContainer().blur();
  }
  dispose() {
    const body = this.editor.getContainerDocument().body;
    body.removeEventListener("keydown", this.handleKeyDown);
    body.removeEventListener("mousedown", this.handleMouseDown);
    this.disposeSideEffectListener?.();
  }
}
__decorateClass([
  import_utils.bind
], FocusManager.prototype, "handleKeyDown", 1);
__decorateClass([
  import_utils.bind
], FocusManager.prototype, "handleMouseDown", 1);
//# sourceMappingURL=FocusManager.js.map
