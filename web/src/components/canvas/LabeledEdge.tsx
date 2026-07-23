import { memo, useCallback, useContext, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, getSmoothStepPath, getStraightPath, type EdgeProps } from 'reactflow';
import { CanvasCtx } from './CanvasNodes';

export const LabeledEdge = memo(function LabeledEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, style, markerEnd, data, selected,
}: EdgeProps) {
  const { updateEdgeLabel } = useContext(CanvasCtx);
  const pathFn = data?.pathType === 'straight' ? getStraightPath
    : data?.pathType === 'step' ? getSmoothStepPath : getBezierPath;
  const [edgePath, labelX, labelY] = (pathFn as typeof getBezierPath)({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = useCallback(() => {
    setDraft(data?.label || '');
    setEditing(true);
  }, [data?.label]);

  const commitEdit = useCallback(() => {
    setEditing(false);
    updateEdgeLabel(id, draft.trim());
  }, [id, draft, updateEdgeLabel]);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 2.5 : 1.5,
          stroke: selected ? '#6366f1' : (style?.stroke || '#94a3b8'),
          transition: 'stroke .15s, stroke-width .15s',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onDoubleClick={(e) => { e.stopPropagation(); startEdit(); }}
        >
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') setEditing(false);
              }}
              style={{
                fontSize: 11, padding: '2px 8px', border: '1px solid #6366f1',
                borderRadius: 4, outline: 'none', background: '#fff', minWidth: 60,
                textAlign: 'center',
              }}
            />
          ) : data?.label ? (
            <div style={{
              fontSize: 10, padding: '1px 6px',
              background: 'rgba(255,255,255,.92)',
              borderRadius: 4, color: '#64748b',
              border: '1px solid #e2e8f0',
              whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none',
            }}>
              {data.label}
            </div>
          ) : selected ? (
            <div style={{
              fontSize: 10, padding: '1px 6px',
              background: 'rgba(255,255,255,.8)',
              borderRadius: 4, color: '#c7d2fe',
              border: '1px dashed #c7d2fe',
              cursor: 'pointer', userSelect: 'none',
            }}>
              双击加标签
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
