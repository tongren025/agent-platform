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
var AssetUtil_exports = {};
__export(AssetUtil_exports, {
  AssetUtil: () => AssetUtil
});
module.exports = __toCommonJS(AssetUtil_exports);
class AssetUtil {
  constructor(editor) {
    this.editor = editor;
  }
  editor;
  /** Configure this asset util's {@link AssetUtil.options | `options`}. */
  static configure(options) {
    return class extends this {
      // @ts-expect-error
      options = { ...this.options, ...options };
    };
  }
  /**
   * Options for this asset util. Override this to provide customization options for your asset.
   * Use {@link AssetUtil.configure} to customize existing asset utils.
   */
  options = {};
  static props;
  static migrations;
  /**
   * The type of the asset util, which should match the asset's type.
   */
  static type;
  /**
   * Get the MIME types that this asset type supports.
   * Return an empty array if this asset type doesn't support files (e.g. bookmarks).
   */
  getSupportedMimeTypes() {
    return [];
  }
  /**
   * Check whether this asset type accepts a given MIME type.
   */
  acceptsMimeType(mimeType) {
    return this.getSupportedMimeTypes().includes(mimeType);
  }
  /**
   * Create an asset from a file. Return null if this asset type can't handle the file.
   */
  async getAssetFromFile(_file, _assetId) {
    return null;
  }
}
//# sourceMappingURL=AssetUtil.js.map
