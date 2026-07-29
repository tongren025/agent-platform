import { y as l } from "./scene3dSerializer-CA8L6Op6.js";
import { m as c } from "./scene3dPropSpecs-CT7N5sBG.js";
const p = {
  street: "城市街道",
  room: "室内房间"
}, d = ["street", "room"];
function s(t, r, e, n, i = [0, 0, 0]) {
  return {
    id: l(),
    name: t,
    type: "mesh",
    visible: !0,
    position: n,
    rotation: i,
    scale: e,
    color: r,
    geometry: "box"
  };
}
function u(t, r, e, n, i = 0.02) {
  return {
    id: l(),
    name: t,
    type: "mesh",
    visible: !0,
    position: [0, i, 0],
    rotation: [-Math.PI / 2, 0, 0],
    scale: [e, n, 1],
    color: r,
    geometry: "plane"
  };
}
function o(t, r, e, n = 0, i) {
  const a = c(t);
  return a.name = r, a.position = e, a.rotation = [0, n, 0], i && (a.scale = i), a;
}
function h() {
  const t = [
    u("马路", "#5a5d63", 8, 40),
    // 人行道两侧
    s("人行道·左", "#8f8a80", [3, 0.15, 40], [-5.5, 0.075, 0]),
    s("人行道·右", "#8f8a80", [3, 0.15, 40], [5.5, 0.075, 0])
  ];
  for (let e = 0; e < 8; e += 1)
    t.push(s("车道线", "#e8e4da", [0.15, 0.02, 2], [0, 0.04, -17.5 + e * 5]));
  [1, 0.7, 1.3, 0.85, 1.15, 0.75].forEach((e, n) => {
    const i = n % 2 === 0 ? -1 : 1, a = -15 + Math.floor(n / 2) * 15;
    t.push(o("building", "楼", [i * 11, 0, a], 0, [1, e, 1]));
  });
  for (const e of [-12, 0, 12])
    t.push(o("tree", "行道树", [-5.5, 0.15, e + 2])), t.push(o("tree", "行道树", [5.5, 0.15, e - 2]));
  return t.push(o("streetlamp", "路灯", [-4.6, 0.15, -8], 0)), t.push(o("streetlamp", "路灯", [4.6, 0.15, 8], Math.PI)), t.push(o("car", "车辆", [-2, 0.02, 6], 0)), t.push(o("car", "车辆", [2, 0.02, -6], Math.PI)), t;
}
function f() {
  return [
    u("地板", "#a89f90", 8, 6),
    // 三面墙（后 + 左右），门面留空给相机
    o("wall", "墙·后", [0, 0, -3], 0, [2, 1.1, 1]),
    o("wall", "墙·左", [-4, 0, 0], Math.PI / 2, [1.5, 1.1, 1]),
    o("wall", "墙·右", [4, 0, 0], Math.PI / 2, [1.5, 1.1, 1]),
    // 家具灰模
    s("床", "#b8aa98", [1.8, 0.5, 2.1], [-2.4, 0.25, -1.6]),
    s("桌子", "#9d8f7c", [1.6, 0.75, 0.8], [2.2, 0.375, -2.2]),
    s("沙发", "#8d9aa5", [2, 0.7, 0.9], [1.6, 0.35, 1.8], [0, Math.PI, 0]),
    {
      id: l(),
      name: "顶灯",
      type: "light",
      visible: !0,
      position: [0, 2.6, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      lightType: "point",
      lightColor: "#fff2dd",
      lightIntensity: 2.2
    }
  ];
}
function g(t) {
  const r = p[t];
  return (t === "street" ? h() : f()).map((e) => ({ ...e, templateGroup: r }));
}
export {
  d as S,
  p as a,
  g as b
};
