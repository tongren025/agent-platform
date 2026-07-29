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
var Edge2d_exports = {};
__export(Edge2d_exports, {
  Edge2d: () => Edge2d
});
module.exports = __toCommonJS(Edge2d_exports);
var import_Vec = require("../Vec");
var import_Geometry2d = require("./Geometry2d");
class Edge2d extends import_Geometry2d.Geometry2d {
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
    return new import_Vec.Vec(start.x + dx * t, start.y + dy * t);
  }
  distanceToPoint(point, _hitInside = false) {
    const { _start: start, _end: end, _dx: dx, _dy: dy, _len2: len2 } = this;
    if (len2 === 0) return import_Vec.Vec.Dist(point, start);
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
//# sourceMappingURL=Edge2d.js.map
