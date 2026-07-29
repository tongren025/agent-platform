class OverlayUtil {
  constructor(editor) {
    this.editor = editor;
  }
  editor;
  static type;
  /**
   * Options for this overlay util. Override this to provide customization options.
   * Use {@link OverlayUtil.configure} to customize existing overlay utils.
   *
   * `zIndex` controls paint and hit-test order across utils — higher numbers
   * paint on top and are hit-tested first. Ties resolve by registration order.
   * Defaults to `0`; built-in utils use larger integers (100, 200, …) with
   * gaps so custom utils can slot between.
   *
   * @public
   */
  options = {};
  /**
   * Create a new overlay util class with the given options merged in.
   *
   * @example
   * ```ts
   * const MyBrush = BrushOverlayUtil.configure({ fill: 'rgba(0,0,255,0.1)' })
   * ```
   *
   * @public
   */
  static configure(options) {
    return class extends this {
      // @ts-expect-error
      options = { ...this.options, ...options };
    };
  }
  /**
   * Returns hit-test geometry for an overlay instance, in page coordinates.
   * Return null for non-interactive overlays (e.g. snap indicators, scribbles).
   */
  getGeometry(_overlay) {
    return null;
  }
  /**
   * Returns the cursor type to show when hovering this overlay.
   */
  getCursor(_overlay) {
    return void 0;
  }
  /**
   * Render all active overlays into the canvas context.
   * The context is already transformed to page space (camera transform applied).
   * Called reactively when overlays or editor state changes.
   */
  render(_ctx, _overlays) {
  }
  /**
   * Optional: render all active overlays into the minimap canvas.
   * The context is already transformed to page space (minimap camera applied),
   * so overlays can use the same page-space coordinates as in {@link OverlayUtil.render}.
   *
   * `zoom` is the minimap's screen-pixels-per-page-unit, analogous to
   * `editor.getCamera().z`; use `1 / zoom` for one-minimap-pixel line widths.
   *
   * Most overlays should leave this blank — only overlays that are meaningful
   * at minimap scale (e.g. brushes, collaborator cursors) should opt in.
   */
  renderMinimap(_ctx, _overlays, _zoom) {
  }
  /**
   * Clean up any resources held by this overlay util.
   */
  dispose() {
  }
}
export {
  OverlayUtil
};
//# sourceMappingURL=OverlayUtil.mjs.map
