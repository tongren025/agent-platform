"use strict";
var import_vitest = require("vitest");
var import_Vec = require("../Vec");
var import_Arc2d = require("./Arc2d");
var import_Circle2d = require("./Circle2d");
var import_Edge2d = require("./Edge2d");
var import_Polyline2d = require("./Polyline2d");
var import_Rectangle2d = require("./Rectangle2d");
var import_intersect = require("../intersect");
const lsA = new import_Vec.Vec(0, 0);
const lsB = new import_Vec.Vec(100, 50);
const lsP = new import_Vec.Vec(30, 60);
(0, import_vitest.describe)("Vec line segment", () => {
  (0, import_vitest.bench)("NearestPointOnLineSegment", () => {
    import_Vec.Vec.NearestPointOnLineSegment(lsA, lsB, lsP, true);
  });
  (0, import_vitest.bench)("DistanceToLineSegment", () => {
    import_Vec.Vec.DistanceToLineSegment(lsA, lsB, lsP, true);
  });
});
const vecA = new import_Vec.Vec(3, 4);
const vecB = new import_Vec.Vec(-1, 2);
const lineOrigin = new import_Vec.Vec(10, 10);
const lineDir = new import_Vec.Vec(0.7071, 0.7071);
const lineTestP = new import_Vec.Vec(20, 15);
(0, import_vitest.describe)("Vec utilities", () => {
  (0, import_vitest.bench)("Lrp", () => {
    import_Vec.Vec.Lrp(lsA, lsB, 0.35);
  });
  (0, import_vitest.bench)("AngleBetween", () => {
    import_Vec.Vec.AngleBetween(vecA, vecB);
  });
  (0, import_vitest.bench)("NearestPointOnLineThroughPoint", () => {
    import_Vec.Vec.NearestPointOnLineThroughPoint(lineOrigin, lineDir, lineTestP);
  });
  (0, import_vitest.bench)("DistanceToLineThroughPoint", () => {
    import_Vec.Vec.DistanceToLineThroughPoint(lineOrigin, lineDir, lineTestP);
  });
});
const intA1 = new import_Vec.Vec(0, 0);
const intA2 = new import_Vec.Vec(100, 100);
const intB1 = new import_Vec.Vec(100, 0);
const intB2 = new import_Vec.Vec(0, 100);
const intB1Miss = new import_Vec.Vec(200, 0);
const intB2Miss = new import_Vec.Vec(200, 100);
const intCenter = new import_Vec.Vec(50, 50);
(0, import_vitest.describe)("Intersections", () => {
  (0, import_vitest.bench)("lineSegment-lineSegment (hit)", () => {
    (0, import_intersect.intersectLineSegmentLineSegment)(intA1, intA2, intB1, intB2);
  });
  (0, import_vitest.bench)("lineSegment-lineSegment (miss)", () => {
    (0, import_intersect.intersectLineSegmentLineSegment)(intA1, intA2, intB1Miss, intB2Miss);
  });
  (0, import_vitest.bench)("lineSegment-circle (hit)", () => {
    (0, import_intersect.intersectLineSegmentCircle)(intA1, intA2, intCenter, 30);
  });
  (0, import_vitest.bench)("lineSegment-circle (miss)", () => {
    (0, import_intersect.intersectLineSegmentCircle)(intA1, intA2, intCenter, 5);
  });
});
const edge = new import_Edge2d.Edge2d({ start: new import_Vec.Vec(0, 0), end: new import_Vec.Vec(100, 50) });
const edgePoint = new import_Vec.Vec(30, 60);
(0, import_vitest.describe)("Edge2d", () => {
  (0, import_vitest.bench)("nearestPoint", () => {
    edge.nearestPoint(edgePoint);
  });
  (0, import_vitest.bench)("distanceToPoint", () => {
    edge.distanceToPoint(edgePoint);
  });
});
const circle = new import_Circle2d.Circle2d({ radius: 50, isFilled: true });
const circlePoint = new import_Vec.Vec(80, 60);
const circlePointInside = new import_Vec.Vec(50, 50);
(0, import_vitest.describe)("Circle2d", () => {
  (0, import_vitest.bench)("nearestPoint", () => {
    circle.nearestPoint(circlePoint);
  });
  (0, import_vitest.bench)("distanceToPoint", () => {
    circle.distanceToPoint(circlePoint);
  });
  (0, import_vitest.bench)("hitTestPoint (outside)", () => {
    circle.hitTestPoint(circlePoint, 5);
  });
  (0, import_vitest.bench)("hitTestPoint (inside)", () => {
    circle.hitTestPoint(circlePointInside, 5, true);
  });
});
const arc = new import_Arc2d.Arc2d({
  center: new import_Vec.Vec(50, 50),
  start: new import_Vec.Vec(100, 50),
  end: new import_Vec.Vec(50, 100),
  sweepFlag: 1,
  largeArcFlag: 0
});
const arcPoint = new import_Vec.Vec(90, 90);
(0, import_vitest.describe)("Arc2d", () => {
  (0, import_vitest.bench)("nearestPoint", () => {
    arc.nearestPoint(arcPoint);
  });
});
const polyPoints = [];
for (let i = 0; i <= 20; i++) {
  const t = i / 20;
  polyPoints.push(new import_Vec.Vec(t * 200, Math.sin(t * Math.PI * 2) * 50 + 50));
}
const polyline = new import_Polyline2d.Polyline2d({ points: polyPoints });
const polyPoint = new import_Vec.Vec(100, 80);
(0, import_vitest.describe)("Polyline2d", () => {
  (0, import_vitest.bench)("nearestPoint", () => {
    polyline.nearestPoint(polyPoint);
  });
  (0, import_vitest.bench)("distanceToPoint", () => {
    polyline.distanceToPoint(polyPoint);
  });
});
const rect = new import_Rectangle2d.Rectangle2d({ width: 100, height: 80, isFilled: true });
const rectPointOutside = new import_Vec.Vec(120, 40);
const rectPointInside = new import_Vec.Vec(50, 40);
(0, import_vitest.describe)("Rectangle2d (Geometry2d)", () => {
  (0, import_vitest.bench)("hitTestPoint (outside)", () => {
    rect.hitTestPoint(rectPointOutside, 5);
  });
  (0, import_vitest.bench)("hitTestPoint (inside)", () => {
    rect.hitTestPoint(rectPointInside, 5, true);
  });
  (0, import_vitest.bench)("distanceToPoint (outside)", () => {
    rect.distanceToPoint(rectPointOutside);
  });
  (0, import_vitest.bench)("distanceToPoint (inside)", () => {
    rect.distanceToPoint(rectPointInside, true);
  });
});
//# sourceMappingURL=geometry.bench.js.map
