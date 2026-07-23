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
  const [version, setVersion] = useState(0);

  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    past.current.push({ nodes: cloneNodes(nodes), edges: cloneEdges(edges) });
    if (past.current.length > maxSize) past.current.shift();
    future.current = [];
    setVersion(v => v + 1);
  }, [maxSize]);

  const undo = useCallback((currentNodes: Node[], currentEdges: Edge[]): Snapshot | null => {
    if (past.current.length === 0) return null;
    future.current.push({ nodes: cloneNodes(currentNodes), edges: cloneEdges(currentEdges) });
    const snapshot = past.current.pop()!;
    setVersion(v => v + 1);
    return snapshot;
  }, []);

  const redo = useCallback((currentNodes: Node[], currentEdges: Edge[]): Snapshot | null => {
    if (future.current.length === 0) return null;
    past.current.push({ nodes: cloneNodes(currentNodes), edges: cloneEdges(currentEdges) });
    const snapshot = future.current.pop()!;
    setVersion(v => v + 1);
    return snapshot;
  }, []);

  const clear = useCallback(() => {
    past.current = [];
    future.current = [];
    setVersion(v => v + 1);
  }, []);

  return { takeSnapshot, undo, redo, clear, canUndo: past.current.length > 0, canRedo: future.current.length > 0, version };
}
