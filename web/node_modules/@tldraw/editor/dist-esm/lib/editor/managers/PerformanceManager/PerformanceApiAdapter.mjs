function safeMark(name, detail) {
  try {
    performance.mark(name, detail ? { detail } : void 0);
  } catch {
    performance.mark(name);
  }
}
class PerformanceApiAdapter {
  cleanups = [];
  constructor(perfManager) {
    this.cleanups.push(
      perfManager.on("interaction-start", (event) => {
        safeMark(`tldraw:interaction:${event.name}:start`, { path: event.path });
      })
    );
    this.cleanups.push(
      perfManager.on("interaction-end", (event) => {
        const startMark = `tldraw:interaction:${event.name}:start`;
        const endMark = `tldraw:interaction:${event.name}:end`;
        safeMark(endMark, {
          path: event.path,
          fps: event.fps,
          frameCount: event.frameCount,
          shapeCount: event.shapeCount
        });
        try {
          performance.measure(`tldraw:interaction:${event.name}`, startMark, endMark);
        } catch {
        }
      })
    );
    this.cleanups.push(
      perfManager.on("camera-start", (event) => {
        safeMark(`tldraw:camera:${event.type}:start`);
      })
    );
    this.cleanups.push(
      perfManager.on("camera-end", (event) => {
        const startMark = `tldraw:camera:${event.type}:start`;
        const endMark = `tldraw:camera:${event.type}:end`;
        safeMark(endMark, { fps: event.fps, shapeCount: event.shapeCount });
        try {
          performance.measure(`tldraw:camera:${event.type}`, startMark, endMark);
        } catch {
        }
      })
    );
  }
  /** Remove all listeners and stop piping events. @public */
  dispose() {
    for (const cleanup of this.cleanups) {
      cleanup();
    }
    this.cleanups.length = 0;
  }
}
export {
  PerformanceApiAdapter
};
//# sourceMappingURL=PerformanceApiAdapter.mjs.map
