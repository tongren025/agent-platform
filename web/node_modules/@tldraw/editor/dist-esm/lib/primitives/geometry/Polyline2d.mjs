import { pointInPolygon } from "../utils.mjs";
import { Vec } from "../Vec.mjs";
import { Edge2d } from "./Edge2d.mjs";
import { Geometry2d } from "./Geometry2d.mjs";
class Polyline2d extends Geometry2d {
  _points;
  _segments;
  constructor(config) {
    super({ isClosed: false, isFilled: false, ...config });
    const { points } = config;
    this._points = points;
    if (points.length < 2) {
      throw new Error("Polyline2d: points must be an array of at least 2 points");
    }
  }
  // eslint-disable-next-line tldraw/no-setter-getter
  get segments() {
    if (!this._segments) {
      this._segments = [];
      const { vertices } = this;
      for (let i = 0, n = vertices.length - 1; i < n; i++) {
        const start = vertices[i];
        const end = vertices[i + 1];
        this._segments.push(new Edge2d({ start, end }));
      }
      if (this.isClosed) {
        this._segments.push(new Edge2d({ start: vertices[vertices.length - 1], end: vertices[0] }));
      }
    }
    return this._segments;
  }
  getLength() {
    return this.segments.reduce((acc, segment) => acc + segment.length, 0);
  }
  getVertices() {
    return this._points;
  }
  nearestPoint(A) {
    const { vertices } = this;
    let bestX = vertices[0].x;
    let bestY = vertices[0].y;
    let bestDist2 = (A.x - bestX) * (A.x - bestX) + (A.y - bestY) * (A.y - bestY);
    const limit = this.isClosed ? vertices.length : vertices.length - 1;
    for (let i = 0; i < limit; i++) {
      const start = vertices[i];
      const end = vertices[(i + 1) % vertices.length];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const len2 = dx * dx + dy * dy;
      let nx, ny;
      if (len2 === 0) {
        nx = start.x;
        ny = start.y;
      } else {
        const t = ((A.x - start.x) * dx + (A.y - start.y) * dy) / len2;
        if (t <= 0) {
          nx = start.x;
          ny = start.y;
        } else if (t >= 1) {
          nx = end.x;
          ny = end.y;
        } else {
          nx = start.x + dx * t;
          ny = start.y + dy * t;
        }
      }
      const ex = A.x - nx;
      const ey = A.y - ny;
      const d2 = ex * ex + ey * ey;
      if (d2 < bestDist2) {
        bestX = nx;
        bestY = ny;
        bestDist2 = d2;
      }
    }
    return new Vec(bestX, bestY);
  }
  hitTestPoint(point, margin = 0, hitInside = false) {
    return this.distanceToPoint(point, hitInside) <= margin;
  }
  distanceToPoint(point, hitInside = false) {
    const { segments } = this;
    let minDist = Infinity;
    for (let i = 0; i < segments.length; i++) {
      const d = segments[i].distanceToPoint(point);
      if (d < minDist) minDist = d;
    }
    if (this.isClosed && (this.isFilled || hitInside) && pointInPolygon(point, this.vertices)) {
      return -minDist;
    }
    return minDist;
  }
  hitTestLineSegment(A, B, distance = 0) {
    const { segments } = this;
    for (let i = 0, n = segments.length; i < n; i++) {
      if (segments[i].hitTestLineSegment(A, B, distance)) {
        return true;
      }
    }
    return false;
  }
  getSvgPathData() {
    const { vertices } = this;
    if (vertices.length < 2) return "";
    return vertices.reduce((acc, vertex, i) => {
      if (i === 0) return `M ${vertex.x} ${vertex.y}`;
      return `${acc} L ${vertex.x} ${vertex.y}`;
    }, "");
  }
}
export {
  Polyline2d
};
//# sourceMappingURL=Polyline2d.mjs.map
