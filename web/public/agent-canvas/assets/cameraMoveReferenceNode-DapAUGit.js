import { g as f, l as T } from "./trajectoryLayout-BNppsAv9.js";
import { bX as M, bo as A } from "./agentStudioMount-Dd-4ILXh.js";
import { w as y, y as j, C as P, B as R, m as D, x as I, z as N } from "./scene3dSerializer-CA8L6Op6.js";
import { cS as O, eT as _, cM as p } from "./scene3dConstants-DlRfsgmW.js";
import { CAMERA_SPEED_DURATION as E, CAMERA_MOVE_FRAMING as b, CAMERA_MOVE_LABEL as k } from "./cameraMoveVocab-CkwMRCGZ.js";
import { z as w, e as F } from "./cameraMovePreset-CF7nKvIN.js";
import { b as z } from "./scene3dPropSpecs-CT7N5sBG.js";
import { b as L } from "./scene3dSceneTemplates-DjnNjh9W.js";
import { E as U } from "./stagingVocab-CtNMad_q.js";
const x = Math.PI / 180, B = p[1] * 0.5, Y = 1.45, v = 1.35;
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
function l(o, e, t, n, a) {
  return Array.from({ length: t }, (c, s) => {
    const r = a * (s / (t - 1)) * n * x;
    return [Math.sin(r) * o, e, Math.cos(r) * o];
  });
}
function d(o, e, t) {
  const n = e * 0.5, a = e * 3, c = t > 0 ? n : a, s = t > 0 ? a : n, r = 5;
  return Array.from({ length: r }, (i, u) => {
    const m = u / (r - 1);
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
    scale: [...p],
    color: _[0],
    pose: e?.pose
  };
}
function Q(o, e) {
  const t = e.map((n) => ({
    id: P(),
    position: [...n]
  }));
  return {
    id: R(),
    name: k[o],
    points: t,
    tension: 0.5,
    closed: !1,
    color: _[2]
  };
}
function q(o, e) {
  const t = b[o], n = [0, v, 0];
  return {
    id: I(),
    name: "运镜机位",
    visible: !0,
    position: [...e],
    rotation: D(e, n),
    target: n,
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
function J(o, e, t, n) {
  return {
    id: N(),
    trajectoryId: e,
    objects: [{ objectId: o, offsetRatio: 0 }],
    startTime: 0,
    endTime: t,
    direction: "forward",
    ...n ? { fovFrom: n.fovFrom, fovTo: n.fovTo } : {}
  };
}
function K(o) {
  const e = y(), t = o.shot ?? "medium", n = E[o.speed ?? "medium"], a = b[t], c = V(o), s = G(o.move, a.distance, Y), r = Q(o.move, s), i = q(t, s[0]), u = J(i.id, r.id, n, w(o.move, a.fov, 1)), m = U.studio, g = o.sceneTemplate ? L(o.sceneTemplate) : [], C = z(o.props);
  return {
    ...e,
    objects: [...g, ...C, c],
    cameras: [i],
    trajectories: [r],
    trajectoryBindings: [u],
    trajectoryGroups: [],
    sceneTimeline: { totalDuration: n },
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
function X(o, e = S) {
  return Math.round(E[o.speed ?? "medium"] * e);
}
function re(o) {
  const { spec: e, targetNodeId: t } = o, n = o.inCtx ?? ((m) => m()), a = K(e), c = S, s = X(e, c), r = f.read_canvas().nodes, i = T(["image"], r)[0];
  return { cameraMoveNodeId: n(
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
  X as cameraMoveFrameCount,
  re as createCameraMoveReferenceNode
};
