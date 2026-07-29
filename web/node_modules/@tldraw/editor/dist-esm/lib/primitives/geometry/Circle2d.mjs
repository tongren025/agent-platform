import { Box } from "../Box.mjs";
import { intersectLineSegmentCircle } from "../intersect.mjs";
import { PI2, getPointOnCircle } from "../utils.mjs";
import { Vec } from "../Vec.mjs";
import { getVerticesCountForArcLength } from "./geometry-constants.mjs";
import { Geometry2d } from "./Geometry2d.mjs";
class Circle2d extends Geometry2d {
  constructor(config) {
    super({ isClosed: true, ...config });
    this.config = config;
    const { x = 0, y = 0, radius } = config;
    this._x = x;
    this._y = y;
    this._center = new Vec(radius + x, radius + y);
    this._radius = radius;
  }
  config;
  _center;
  _radius;
  _x;
  _y;
  getBounds() {
    return new Box(this._x, this._y, this._radius * 2, this._radius * 2);
  }
  getVertices() {
    const { _center, _radius: radius } = this;
    const perimeter = PI2 * radius;
    const vertices = [];
    for (let i = 0, n = getVerticesCountForArcLength(perimeter); i < n; i++) {
      const angle = i / n * PI2;
      vertices.push(getPointOnCircle(_center, radius, angle));
    }
    return vertices;
  }
  nearestPoint(point) {
    const { _center, _radius: radius } = this;
    const dx = point.x - _center.x;
    const dy = point.y - _center.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return new Vec(_center.x + radius, _center.y);
    const scale = radius / len;
    return new Vec(_center.x + dx * scale, _center.y + dy * scale);
  }
  distanceToPoint(point, hitInside = false) {
    const { _center, _radius: radius } = this;
    const dx = point.x - _center.x;
    const dy = point.y - _center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const distToEdge = dist - radius;
    if (distToEdge < 0 && (this.isFilled || hitInside)) {
      return distToEdge;
    }
    return Math.abs(distToEdge);
  }
  hitTestPoint(point, margin = 0, hitInside = false) {
    const { _center, _radius: radius } = this;
    const dx = point.x - _center.x;
    const dy = point.y - _center.y;
    const dist2 = dx * dx + dy * dy;
    if ((this.isFilled || hitInside) && dist2 <= radius * radius) {
      return true;
    }
    const outerR = radius + margin;
    if (dist2 > outerR * outerR) return false;
    const innerR = radius - margin;
    if (innerR <= 0) return true;
    return dist2 >= innerR * innerR;
  }
  hitTestLineSegment(A, B, distance = 0) {
    const { _center, _radius: radius } = this;
    return intersectLineSegmentCircle(A, B, _center, radius + distance) !== null;
  }
  getSvgPathData() {
    const { _center, _radius: radius } = this;
    return `M${_center.x + radius},${_center.y} a${radius},${radius} 0 1,0 ${radius * 2},0a${radius},${radius} 0 1,0 -${radius * 2},0`;
  }
}
export {
  Circle2d
};
//# sourceMappingURL=Circle2d.mjs.map
