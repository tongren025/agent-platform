// Excalidraw 自由白板：保留原生交互，文档通过平台画布 API 自动保存。
import { useCallback, useMemo } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useCanvasEngineDocument } from '../../hooks/useCanvasEngineDocument';
import { EngineError, EngineLoading, SavingBadge } from './EngineState';

function serializableAppState(appState: Record<string, any>) {
  const keys = [
    'viewBackgroundColor', 'gridSize', 'gridStep', 'gridModeEnabled',
    'currentItemStrokeColor', 'currentItemBackgroundColor', 'currentItemFillStyle',
    'currentItemStrokeWidth', 'currentItemStrokeStyle', 'currentItemRoughness',
    'currentItemOpacity', 'currentItemFontFamily', 'currentItemFontSize',
    'currentItemTextAlign', 'currentItemStartArrowhead', 'currentItemEndArrowhead',
    'zenModeEnabled', 'objectsSnapModeEnabled',
  ];
  return Object.fromEntries(keys.filter((key) => appState[key] !== undefined).map((key) => [key, appState[key]]));
}

export default function ExcalidrawCanvas() {
  const { initialContent, loading, saving, error, scheduleSave, retry } = useCanvasEngineDocument('excalidraw');

  const initialData = useMemo(() => initialContent ? {
    elements: initialContent.elements || [],
    appState: initialContent.appState || { viewBackgroundColor: '#f8fafc' },
    files: initialContent.files || {},
    scrollToContent: true,
  } : undefined, [initialContent]);

  const handleChange = useCallback((elements: readonly any[], appState: any, files: Record<string, any>) => {
    scheduleSave({
      elements: [...elements],
      appState: serializableAppState(appState),
      files,
    });
  }, [scheduleSave]);

  if (loading || !initialData) return <EngineLoading label="自由白板" />;

  return (
    <div style={{ height: '100%', position: 'relative', background: '#fff' }}>
      <EngineError message={error} onRetry={retry} />
      <SavingBadge saving={saving} />
      <Excalidraw
        initialData={initialData as any}
        onChange={handleChange as any}
        langCode="zh-CN"
        theme="light"
      />
    </div>
  );
}
