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
import { bind, uniqueId } from "@tldraw/utils";
import { Vec } from "../../../primitives/Vec.mjs";
const MAX_CLICK_DISTANCE = 40;
class ClickManager {
  constructor(editor) {
    this.editor = editor;
  }
  editor;
  _clickId = "";
  _clickTimeout;
  _clickScreenPoint;
  _previousScreenPoint;
  _isPressingWhilePending = false;
  _getClickTimeout(state, id = uniqueId()) {
    this._clickId = id;
    clearTimeout(this._clickTimeout);
    this._clickTimeout = this.editor.timers.setTimeout(
      () => {
        if (this._clickState === state && this._clickId === id) {
          switch (this._clickState) {
            case "pendingOverflow": {
              this.editor.dispatch({
                ...this.lastPointerInfo,
                type: "click",
                name: "double_click",
                phase: this._isPressingWhilePending ? "settle-down" : "settle-up"
              });
              break;
            }
            default: {
            }
          }
          this._clickState = "idle";
        }
      },
      state === "idle" || state === "pendingDouble" ? this.editor.options.doubleClickDurationMs : this.editor.options.multiClickDurationMs
    );
  }
  /**
   * The current click state.
   *
   * @internal
   */
  _clickState = "idle";
  /**
   * The current click state.
   *
   * @public
   */
  // eslint-disable-next-line tldraw/no-setter-getter
  get clickState() {
    return this._clickState;
  }
  lastPointerInfo = {};
  handlePointerEvent(info) {
    switch (info.name) {
      case "pointer_down": {
        if (!this._clickState) return info;
        this._clickScreenPoint = Vec.From(info.point);
        this._isPressingWhilePending = true;
        if (this._previousScreenPoint && Vec.Dist2(this._previousScreenPoint, this._clickScreenPoint) > MAX_CLICK_DISTANCE ** 2) {
          this._clickState = "idle";
        }
        this._previousScreenPoint = this._clickScreenPoint;
        this.lastPointerInfo = info;
        switch (this._clickState) {
          case "pendingDouble": {
            this._clickState = "pendingOverflow";
            this._clickTimeout = this._getClickTimeout(this._clickState);
            return {
              ...info,
              type: "click",
              name: "double_click",
              phase: "down"
            };
          }
          case "idle": {
            this._clickState = "pendingDouble";
            break;
          }
          case "pendingOverflow": {
            this._clickState = "overflow";
            break;
          }
          default: {
          }
        }
        this._clickTimeout = this._getClickTimeout(this._clickState);
        return info;
      }
      case "pointer_up": {
        if (!this._clickState) return info;
        this._clickScreenPoint = Vec.From(info.point);
        this._isPressingWhilePending = false;
        switch (this._clickState) {
          case "pendingOverflow": {
            return {
              ...this.lastPointerInfo,
              type: "click",
              name: "double_click",
              phase: "up"
            };
          }
          default: {
          }
        }
        return info;
      }
      case "pointer_move": {
        if (this._clickState !== "idle" && this._clickScreenPoint && Vec.Dist2(this._clickScreenPoint, this.editor.inputs.getCurrentScreenPoint()) > (this.editor.getInstanceState().isCoarsePointer ? this.editor.options.coarseDragDistanceSquared : this.editor.options.dragDistanceSquared)) {
          this.cancelDoubleClickTimeout();
        }
        return info;
      }
    }
    return info;
  }
  cancelDoubleClickTimeout() {
    this._clickTimeout = clearTimeout(this._clickTimeout);
    this._clickState = "idle";
    this._isPressingWhilePending = false;
  }
}
__decorateClass([
  bind
], ClickManager.prototype, "_getClickTimeout", 1);
__decorateClass([
  bind
], ClickManager.prototype, "cancelDoubleClickTimeout", 1);
export {
  ClickManager
};
//# sourceMappingURL=ClickManager.mjs.map
