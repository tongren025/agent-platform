import { useValue } from "@tldraw/state-react";
import { useSvgExportContext } from "../editor/types/SvgExportContext.mjs";
import { useEditor } from "./useEditor.mjs";
function useColorMode() {
  const editor = useEditor();
  const exportContext = useSvgExportContext();
  return useValue(
    "colorMode",
    () => {
      if (exportContext) return exportContext.colorMode;
      return editor.getColorMode();
    },
    [exportContext, editor]
  );
}
export {
  useColorMode
};
//# sourceMappingURL=useColorMode.mjs.map
