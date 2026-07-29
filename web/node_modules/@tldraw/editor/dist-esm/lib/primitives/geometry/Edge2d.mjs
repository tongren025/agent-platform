import { Vec } from "../Vec.mjs";
import { Geometry2d } from "./Geometry2d.mjs";
class Edge2d extends Geometry2d {
  _start;
  _end;
  _dx;
  _dy;
  _len2;
  constructor(config) {
    super({ ...config, isClosed: false, isFilled: false });
    const { start, end } = config;
    this._start = start;
    this._end = end;
    this._dx = end.x - start.x;
    this._dy = end.y - start.y;
    this._len2 = this._dx * this._dx + this._dy * this._dy;
  }
  getLength() {
    return Math.sqrt(this._len2);
  }
  getVertices() {
    return [this._start, this._end];
  }
  nearestPoint(point) {
    const { _start: start, _end: end, _dx: dx, _dy: dy, _len2: len2 } = this;
    if (len2 === 0) return start;
    const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / len2;
    if (t <= 0) return start;
    if (t >= 1) return end;
    return new Vec(start.x + dx * t, start.y + dy * t);
  }
  distanceToPoint(point, _hitInside = false) {
    const { _start: start, _end: end, _dx: dx, _dy: dy, _len2: len2 } = this;
    if (len2 === 0) return Vec.Dist(point, start);
    const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / len2;
    let nx, ny;
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
    const ex = point.x - nx;
    const ey = point.y - ny;
    return Math.sqrt(ex * ex + ey * ey);
  }
  getSvgPathData(first = true) {
    const { _start: start, _end: end } = this;
    return `${first ? `M${start.toFixed()}` : ``} L${end.toFixed()}`;
  }
}
export {
  Edge2d
};
//# sourceMappingURL=Edge2d.mjs.map
