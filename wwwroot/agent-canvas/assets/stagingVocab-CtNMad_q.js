import { cS as a } from "./scene3dConstants-DlRfsgmW.js";
a.map((e) => e.id);
const o = {
  front: 0,
  "three-quarter": 35,
  side: 90,
  back: 180
}, s = {
  eye: { camY: 1.45, targetY: 1.35, distanceScale: 1 },
  low: { camY: 0.7, targetY: 1.7, distanceScale: 1 },
  // 仰拍
  high: { camY: 3, targetY: 1, distanceScale: 1 },
  // 俯拍
  overhead: { camY: 6, targetY: 0.6, distanceScale: 0.5 }
  // 顶视
}, c = {
  wide: { distance: 5.2, fov: 42 },
  medium: { distance: 3.6, fov: 38 },
  close: { distance: 2.5, fov: 34 }
}, r = {
  studio: { backgroundColor: "#f6f3ee", showSky: !1, darkMode: !1 },
  day: { backgroundColor: "#cfe3f5", showSky: !0, darkMode: !1 },
  night: { backgroundColor: "#161c28", showSky: !1, darkMode: !0 }
}, i = 1.5, n = { close: 0.62, medium: 1, wide: 1.15 }, d = {
  solo: { angle: "front", height: "eye" },
  facing: { angle: "three-quarter", height: "eye" },
  "side-by-side": { angle: "front", height: "eye" },
  line: { angle: "side", height: "eye" },
  behind: { angle: "three-quarter", height: "high" },
  circle: { angle: "front", height: "high" }
};
export {
  o as C,
  r as E,
  d as L,
  c as S,
  s as a,
  n as b,
  i as c
};
