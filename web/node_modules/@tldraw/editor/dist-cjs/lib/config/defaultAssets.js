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
var defaultAssets_exports = {};
__export(defaultAssets_exports, {
  checkAssets: () => checkAssets
});
module.exports = __toCommonJS(defaultAssets_exports);
function checkAssets(customAssets) {
  const assets = [];
  const addedCustomAssetTypes = /* @__PURE__ */ new Set();
  for (const customAsset of customAssets) {
    if (addedCustomAssetTypes.has(customAsset.type)) {
      throw new Error(`Asset type "${customAsset.type}" is defined more than once`);
    }
    assets.push(customAsset);
    addedCustomAssetTypes.add(customAsset.type);
  }
  return assets;
}
//# sourceMappingURL=defaultAssets.js.map
