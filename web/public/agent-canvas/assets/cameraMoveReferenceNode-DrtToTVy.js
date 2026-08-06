import { g as f } from "./generationCanvasTools-RgI03Wij.js";
import { l as T } from "./trajectoryLayout--TtvOQEm.js";
import { c3 as M, bv as A } from "./agentStudioMount-xGP7t2dE.js";
import { w as y, y as j, C as P, B as R, m as D, x as I, z as N } from "./scene3dSerializer-CA8L6Op6.js";
import { cS as O, eT as p, cM as _ } from "./scene3dConstants-DlRfsgmW.js";
import { CAMERA_SPEED_DURATION as E, CAMERA_MOVE_FRAMING as b, CAMERA_MOVE_LABEL as k } from "./cameraMoveVocab-CkwMRCGZ.js";
import { z as w, e as F } from "./cameraMovePreset-CF7nKvIN.js";
import { b as z } from "./scene3dPropSpecs-CT7N5sBG.js";
import { b as L } from "./scene3dSceneTemplates-DjnNjh9W.js";
import { E as U } from "./stagingVocab-CtNMad_q.js";
const x = Math.PI / 180, B = _[1] * 0.5, Y = 1.45, v = 1.35;
function G(o, e, t) {
  switch (o) {
    case "push_in":
      return [
        [0, t, e * 1.8],
        [0, t, e]
      ];
    case "pull_out":
      return [
        [0, t, e],
        [0, t, e * 1.8]
      ];
    case "orbit_left":
      return l(e, t, 9, 300, 1);
    case "orbit_right":
      return l(e, t, 9, 300, -1);
    case "arc_left":
      return l(e, t, 5, 90, 1);
    case "arc_right":
      return l(e, t, 5, 90, -1);
    case "crane_up":
      return d(e, t, 1);
    case "crane_down":
      return d(e, t, -1);
    case "track_left":
      return [
        [e * 0.9, t, e],
        [e * 0.45, t, e],
        [0, t, e],
        [-e * 0.45, t, e],
        [-e * 0.9, t, e]
      ];
    case "track_right":
      return [
        [-e * 0.9, t, e],
        [-e * 0.45, t, e],
        [0, t, e],
        [e * 0.45, t, e],
        [e * 0.9, t, e]
      ];
    case "zoom_in":
    case "zoom_out":
      return [
        [0, t, e],
        [0, t, e + 2e-3]
      ];
    case "dolly_zoom":
      return [
        [0, t, e],
        [0, t, e * F(1)]
      ];
    default:
      return [
        [0, t, e],
        [0, t, e + 2e-3]
      ];
  }
}
function l(o, e, t, r, a) {
  return Array.from({ length: t }, (c, s) => {
    const n = a * (s / (t - 1)) * r * x;
    return [Math.sin(n) * o, e, Math.cos(n) * o];
  });
}
function d(o, e, t) {
  const r = e * 0.5, a = e * 3, c = t > 0 ? r : a, s = t > 0 ? a : r, n = 5;
  return Array.from({ length: n }, (i, u) => {
    const m = u / (n - 1);
    return [0, c + (s - c) * m, o];
  });
}
function V(o) {
  const e = o.subjectPose ? O.find((t) => t.id === o.subjectPose) : void 0;
  return {
    id: j(),
    name: "主体",
    type: "mannequin",
    visible: !0,
    position: [0, B, 0],
    rotation: [0, 0, 0],
    scale: [..._],
    color: p[0],
    pose: e?.pose
  };
}
function Q(o, e) {
  const t = e.map((r) => ({
    id: P(),
    position: [...r]
  }));
  return {
    id: R(),
    name: k[o],
    points: t,
    tension: 0.5,
    closed: !1,
    color: p[2]
  };
}
function q(o, e) {
  const t = b[o], r = [0, v, 0];
  return {
    id: I(),
    name: "运镜机位",
    visible: !0,
    position: [...e],
    rotation: D(e, r),
    target: r,
    // 注意:**不设 followTargetId**。主体在运镜里是静止的(只有相机绑轨迹动),
    // 若 followTargetId=主体,播放时注视点会被加上主体半身高 → 落到头顶(Y≈2.5)而非授权的胸口
    // [0,1.35,0],把全身裁出框(P0-A 根因)。留空 → cameraWithPlaybackPosition 回落到静态 target。
    followTargetId: void 0,
    fov: t.fov,
    aspectRatio: "16:9",
    lensDepth: 0,
    near: 0.1,
    far: 200
  };
}
function J(o, e, t, r) {
  return {
    id: N(),
    trajectoryId: e,
    objects: [{ objectId: o, offsetRatio: 0 }],
    startTime: 0,
    endTime: t,
    direction: "forward",
    ...r ? { fovFrom: r.fovFrom, fovTo: r.fovTo } : {}
  };
}
function K(o) {
  const e = y(), t = o.shot ?? "medium", r = E[o.speed ?? "medium"], a = b[t], c = V(o), s = G(o.move, a.distance, Y), n = Q(o.move, s), i = q(t, s[0]), u = J(i.id, n.id, r, w(o.move, a.fov, 1)), m = U.studio, g = o.sceneTemplate ? L(o.sceneTemplate) : [], C = z(o.props);
  return {
    ...e,
    objects: [...g, ...C, c],
    cameras: [i],
    trajectories: [n],
    trajectoryBindings: [u],
    trajectoryGroups: [],
    sceneTimeline: { totalDuration: r },
    environment: {
      ...e.environment,
      backgroundColor: m.backgroundColor,
      showSky: m.showSky,
      darkMode: m.darkMode,
      showGrid: !1,
      showAxes: !1
    },
    editorCamera: {
      position: i.position,
      target: i.target ?? [0, v, 0],
      rotation: i.rotation,
      mode: "edit"
    }
  };
}
const S = 24;
function Z(o, e = S) {
  return Math.round(E[o.speed ?? "medium"] * e);
}
function ae(o) {
  const { spec: e, targetNodeId: t } = o, r = o.inCtx ?? ((m) => m()), a = K(e), c = S, s = Z(e, c), n = f.read_canvas().nodes, i = T(["image"], n)[0];
  return { cameraMoveNodeId: r(
    () => f.create_nodes([
      {
        kind: "scene3d",
        categoryId: A("scene3d"),
        title: M.t("scene3d.capture.cameraMoveReference"),
        prompt: "",
        position: i,
        meta: {
          scene3dState: a,
          // 标志带上 move（供 Host 拼运镜 prompt directive 的人话/降级 floor；不必从 3D 场景反推）。
          cameraMoveAutoCapture: { ...t ? { targetNodeId: t } : {}, fps: c, frameCount: s, move: e.move }
        }
      }
    ])
  )[0]?.id ?? null, fps: c, frameCount: s };
}
export {
  S as CAMERA_MOVE_CAPTURE_FPS,
  Z as cameraMoveFrameCount,
  ae as createCameraMoveReferenceNode
};
