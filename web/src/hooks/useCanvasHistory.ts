// 画布撤销与重做历史记录状态管理 Hook
import { useCallback, useRef, useState } from 'react';
import type { Node, Edge } from 'reactflow';

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

function cloneNodes(nodes: Node[]): Node[] {
  return nodes.map(n => ({
    ...n,
    position: { ...n.position },
    data: { ...n.data },
    ...(n.style ? { style: { ...n.style } } : {}),
  }));
}

function cloneEdges(edges: Edge[]): Edge[] {
  return edges.map(e => ({
    ...e,
    ...(e.data ? { data: { ...e.data } } : {}),
  }));
}

export function useCanvasHistory(maxSize = 40) {
  const past = useRef<Snapshot[]>([]);
  const future = useRef<Snapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const sync = useCallback(() => {
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  }, []);

  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    past.current.push({ nodes: cloneNodes(nodes), edges: cloneEdges(edges) });
    if (past.current.length > maxSize) past.current.shift();
    future.current = [];
    sync();
  }, [maxSize, sync]);

  const undo = useCallback((currentNodes: Node[], currentEdges: Edge[]): Snapshot | null => {
    if (past.current.length === 0) return null;
    future.current.push({ nodes: cloneNodes(currentNodes), edges: cloneEdges(currentEdges) });
    const snapshot = past.current.pop()!;
    sync();
    return snapshot;
  }, [sync]);

  const redo = useCallback((currentNodes: Node[], currentEdges: Edge[]): Snapshot | null => {
    if (future.current.length === 0) return null;
    past.current.push({ nodes: cloneNodes(currentNodes), edges: cloneEdges(currentEdges) });
    const snapshot = future.current.pop()!;
    sync();
    return snapshot;
  }, [sync]);

  const clear = useCallback(() => {
    past.current = [];
    future.current = [];
    sync();
  }, [sync]);

  return { takeSnapshot, undo, redo, clear, canUndo, canRedo };
}
