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
export {
  checkAssets
};
//# sourceMappingURL=defaultAssets.mjs.map
