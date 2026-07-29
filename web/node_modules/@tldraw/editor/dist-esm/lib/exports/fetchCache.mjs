import { FileHelpers, LruCache, assert, fetch } from "@tldraw/utils";
function fetchCache(cb, init) {
  const cache = new LruCache(100);
  return async function fetchCached(url) {
    const existing = cache.get(url);
    if (existing) return existing;
    const promise = (async () => {
      try {
        const response = await fetch(url, init);
        assert(response.ok);
        return await cb(response);
      } catch (err) {
        console.error(err);
        return null;
      }
    })();
    cache.set(url, promise);
    return promise;
  };
}
const resourceToDataUrl = fetchCache(async (response) => {
  return await FileHelpers.blobToDataUrl(await response.blob());
});
export {
  fetchCache,
  resourceToDataUrl
};
//# sourceMappingURL=fetchCache.mjs.map
