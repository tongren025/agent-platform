import { computed } from "@tldraw/state";
import { Store } from "@tldraw/store";
import {
  UserRecordType,
  createCachedUserResolve,
  createTLSchema,
  createUserId,
  registerColorsFromThemes,
  registerFontsFromThemes
} from "@tldraw/tlschema";
import { FileHelpers, assert } from "@tldraw/utils";
import { Editor } from "../editor/Editor.mjs";
import { resolveThemes } from "../editor/managers/ThemeManager/ThemeManager.mjs";
import { checkAssets } from "./defaultAssets.mjs";
import { checkBindings } from "./defaultBindings.mjs";
import { checkShapesAndAddCore } from "./defaultShapes.mjs";
import { loadSnapshot } from "./TLEditorSnapshot.mjs";
import { defaultUserPreferences, getUserPreferences } from "./TLUserPreferences.mjs";
const defaultAssetResolve = (asset) => asset.props.src;
const _defaultCurrentUser = computed("defaultCurrentUser", () => {
  const prefs = getUserPreferences();
  if (!prefs.id) return null;
  return UserRecordType.create({
    id: createUserId(prefs.id),
    name: prefs.name ?? "",
    color: prefs.color ?? defaultUserPreferences.color
  });
});
const defaultUserStore = {
  currentUser: _defaultCurrentUser
};
const inlineBase64AssetStore = {
  upload: async (_, file) => {
    return { src: await FileHelpers.blobToDataUrl(file) };
  }
};
function createTLSchemaFromUtils(opts) {
  if ("schema" in opts && opts.schema) return opts.schema;
  return createTLSchema({
    shapes: "shapeUtils" in opts && opts.shapeUtils ? utilsToMap(checkShapesAndAddCore(opts.shapeUtils)) : void 0,
    bindings: "bindingUtils" in opts && opts.bindingUtils ? utilsToMap(checkBindings(opts.bindingUtils)) : void 0,
    assets: "assetUtils" in opts && opts.assetUtils ? utilsToMap(checkAssets(opts.assetUtils)) : void 0,
    records: "records" in opts ? opts.records : void 0,
    migrations: "migrations" in opts ? opts.migrations : void 0
  });
}
function createTLStore({
  initialData,
  defaultName = "",
  id,
  assets = inlineBase64AssetStore,
  users = defaultUserStore,
  onMount,
  collaboration,
  themes,
  ...rest
} = {}) {
  const resolvedThemes = resolveThemes(themes);
  registerColorsFromThemes(resolvedThemes);
  registerFontsFromThemes(resolvedThemes);
  const schema = createTLSchemaFromUtils(rest);
  const store = new Store({
    id,
    schema,
    initialData,
    props: {
      defaultName,
      assets: {
        upload: assets.upload,
        resolve: assets.resolve ?? defaultAssetResolve,
        remove: assets.remove ?? (() => Promise.resolve())
      },
      users: {
        currentUser: users.currentUser,
        resolve: users.resolve ?? createCachedUserResolve((userId) => {
          const current = users.currentUser.get();
          return current && current.id === createUserId(userId) ? current : null;
        })
      },
      onMount: (editor) => {
        assert(editor instanceof Editor);
        onMount?.(editor);
      },
      collaboration
    }
  });
  if (rest.snapshot) {
    if (initialData) throw new Error("Cannot provide both initialData and snapshot");
    loadSnapshot(store, rest.snapshot, { forceOverwriteSessionState: true });
  }
  return store;
}
function utilsToMap(utils) {
  return Object.fromEntries(
    utils.map((s) => [
      s.type,
      {
        props: s.props,
        migrations: s.migrations
      }
    ])
  );
}
export {
  createTLSchemaFromUtils,
  createTLStore,
  defaultUserStore,
  inlineBase64AssetStore
};
//# sourceMappingURL=createTLStore.mjs.map
