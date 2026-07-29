"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var Circle2d_exports = {};
__export(Circle2d_exports, {
  Circle2d: () => Circle2d
});
module.exports = __toCommonJS(Circle2d_exports);
var import_Box = require("../Box");
var import_intersect = require("../intersect");
var import_utils = require("../utils");
var import_Vec = require("../Vec");
var import_geometry_constants = require("./geometry-constants");
var import_Geometry2d = require("./Geometry2d");
class Circle2d extends import_Geometry2d.Geometry2d {
  constructor(config) {
    super({ isClosed: true, ...config });
    this.config = config;
    const { x = 0, y = 0, radius } = config;
    this._x = x;
    this._y = y;
    this._center = new import_Vec.Vec(radius + x, radius + y);
    this._radius = radius;
  }
  config;
  _center;
  _radius;
  _x;
  _y;
  getBounds() {
    return new import_Box.Box(this._x, this._y, this._radius * 2, this._radius * 2);
  }
  getVertices() {
    const { _center, _radius: radius } = this;
    const perimeter = import_utils.PI2 * radius;
    const vertices = [];
    for (let i = 0, n = (0, import_geometry_constants.getVerticesCountForArcLength)(perimeter); i < n; i++) {
      const angle = i / n * import_utils.PI2;
      vertices.push((0, import_utils.getPointOnCircle)(_center, radius, angle));
    }
    return vertices;
  }
  nearestPoint(point) {
    const { _center, _radius: radius } = this;
    const dx = point.x - _center.x;
    const dy = point.y - _center.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return new import_Vec.Vec(_center.x + radius, _center.y);
    const scale = radius / len;
    return new import_Vec.Vec(_center.x + dx * scale, _center.y + dy * scale);
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
    return (0, import_intersect.intersectLineSegmentCircle)(A, B, _center, radius + distance) !== null;
  }
  getSvgPathData() {
    const { _center, _radius: radius } = this;
    return `M${_center.x + radius},${_center.y} a${radius},${radius} 0 1,0 ${radius * 2},0a${radius},${radius} 0 1,0 -${radius * 2},0`;
  }
}
//# sourceMappingURL=Circle2d.js.map
