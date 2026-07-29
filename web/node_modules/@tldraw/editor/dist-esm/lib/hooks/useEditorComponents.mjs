import { jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { DefaultBackground } from "../components/default-components/DefaultBackground.mjs";
import { DefaultCanvas } from "../components/default-components/DefaultCanvas.mjs";
import { DefaultErrorFallback } from "../components/default-components/DefaultErrorFallback.mjs";
import { DefaultGrid } from "../components/default-components/DefaultGrid.mjs";
import { DefaultLoadingScreen } from "../components/default-components/DefaultLoadingScreen.mjs";
import { DefaultShapeErrorFallback } from "../components/default-components/DefaultShapeErrorFallback.mjs";
import { DefaultShapeWrapper } from "../components/default-components/DefaultShapeWrapper.mjs";
import { DefaultSpinner } from "../components/default-components/DefaultSpinner.mjs";
import { DefaultSvgDefs } from "../components/default-components/DefaultSvgDefs.mjs";
import { EditorComponentsContext } from "./EditorComponentsContext.mjs";
import { useShallowObjectIdentity } from "./useIdentity.mjs";
import { useEditorComponents } from "./EditorComponentsContext.mjs";
function EditorComponentsProvider({
  overrides = {},
  children
}) {
  const _overrides = useShallowObjectIdentity(overrides);
  const value = useMemo(
    () => ({
      Background: DefaultBackground,
      Canvas: DefaultCanvas,
      Grid: DefaultGrid,
      InFrontOfTheCanvas: null,
      LoadingScreen: DefaultLoadingScreen,
      OnTheCanvas: null,
      ShapeWrapper: DefaultShapeWrapper,
      Spinner: DefaultSpinner,
      SvgDefs: DefaultSvgDefs,
      ErrorFallback: DefaultErrorFallback,
      ShapeErrorFallback: DefaultShapeErrorFallback,
      ..._overrides
    }),
    [_overrides]
  );
  return /* @__PURE__ */ jsx(EditorComponentsContext.Provider, { value, children });
}
export {
  EditorComponentsProvider,
  useEditorComponents
};
//# sourceMappingURL=useEditorComponents.mjs.map
