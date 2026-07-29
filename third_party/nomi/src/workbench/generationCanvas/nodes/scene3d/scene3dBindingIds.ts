// 相机运镜 take 的「瞄准轨迹」绑定 id 约定的单一真相源。
// 叶子模块（零依赖，不拖 THREE）——writer(takeRecording)、reader(scene3dPlayback)、
// 持久化(scene3dSerializer) 三方共用同一套 id 规则，避免 `:aim` 后缀在各处漂移。
//
// aim 绑定的 objectId = `${cameraId}:aim`（一个合成 id，不对应任何真实节点）。
// 相机 aimTrajectoryId 只是「有没有 aim 轨迹」的标志，实际采样按合成 id 在 trajectoryBindings 里找。
export const CAMERA_AIM_BINDING_SUFFIX = ':aim'

export function cameraAimBindingId(cameraId: string): string {
  return `${cameraId}${CAMERA_AIM_BINDING_SUFFIX}`
}

/** 合成 aim 绑定 objectId → 相机 id；非 aim 绑定 id 返回 null。 */
export function cameraIdFromAimBindingId(objectId: string): string | null {
  return objectId.endsWith(CAMERA_AIM_BINDING_SUFFIX)
    ? objectId.slice(0, -CAMERA_AIM_BINDING_SUFFIX.length)
    : null
}
