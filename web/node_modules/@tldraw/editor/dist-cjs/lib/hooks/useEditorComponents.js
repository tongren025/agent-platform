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
var useEditorComponents_exports = {};
__export(useEditorComponents_exports, {
  EditorComponentsProvider: () => EditorComponentsProvider,
  useEditorComponents: () => import_EditorComponentsContext2.useEditorComponents
});
module.exports = __toCommonJS(useEditorComponents_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_react = require("react");
var import_DefaultBackground = require("../components/default-components/DefaultBackground");
var import_DefaultCanvas = require("../components/default-components/DefaultCanvas");
var import_DefaultErrorFallback = require("../components/default-components/DefaultErrorFallback");
var import_DefaultGrid = require("../components/default-components/DefaultGrid");
var import_DefaultLoadingScreen = require("../components/default-components/DefaultLoadingScreen");
var import_DefaultShapeErrorFallback = require("../components/default-components/DefaultShapeErrorFallback");
var import_DefaultShapeWrapper = require("../components/default-components/DefaultShapeWrapper");
var import_DefaultSpinner = require("../components/default-components/DefaultSpinner");
var import_DefaultSvgDefs = require("../components/default-components/DefaultSvgDefs");
var import_EditorComponentsContext = require("./EditorComponentsContext");
var import_useIdentity = require("./useIdentity");
var import_EditorComponentsContext2 = require("./EditorComponentsContext");
function EditorComponentsProvider({
  overrides = {},
  children
}) {
  const _overrides = (0, import_useIdentity.useShallowObjectIdentity)(overrides);
  const value = (0, import_react.useMemo)(
    () => ({
      Background: import_DefaultBackground.DefaultBackground,
      Canvas: import_DefaultCanvas.DefaultCanvas,
      Grid: import_DefaultGrid.DefaultGrid,
      InFrontOfTheCanvas: null,
      LoadingScreen: import_DefaultLoadingScreen.DefaultLoadingScreen,
      OnTheCanvas: null,
      ShapeWrapper: import_DefaultShapeWrapper.DefaultShapeWrapper,
      Spinner: import_DefaultSpinner.DefaultSpinner,
      SvgDefs: import_DefaultSvgDefs.DefaultSvgDefs,
      ErrorFallback: import_DefaultErrorFallback.DefaultErrorFallback,
      ShapeErrorFallback: import_DefaultShapeErrorFallback.DefaultShapeErrorFallback,
      ..._overrides
    }),
    [_overrides]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_EditorComponentsContext.EditorComponentsContext.Provider, { value, children });
}
//# sourceMappingURL=useEditorComponents.js.map
