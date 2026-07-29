# Pose-over-time：录 take 的「动作随时间变化」录进离屏 mp4

> 状态：**已交付，端到端 R13 真机验过（含 mp4 抽帧人眼）**。日期 2026-06-30。
> 续 `2026-06-30-game-style-3d-character-control.md` 的 S2，补该 commit 明标的「pose 随时间变化」缺口。

## 0. 背景（实查澄清 + 整条已打通）

本 worktree 初始从 **S2 合入前的旧 main** 分叉，故任务点名的 `useScene3DTakeRecorder.ts`/`takeRecording.test.ts` 一度看似不存在。
rebase 到真 main 后确认 **S2 录制器已在 `1058face` 合入**，且该 commit 明说「pose 随时间变化不在 S2，已标缺口留后续」——
**本期正是补那条缺口**：先做与录制器解耦的 pose-over-time 内核，再 rebase 上真 S2、把内核接到真录制器，**整条端到端打通**。

`takeRecording.ts`（建位移轨迹）与 `scene3dPoseTrack.ts`（建 pose 轨道）**互补无重复**（不违 P1）：都喂 `buildRecordedTakeScene` 的产物 state。

## 1. 数据模型

`Scene3DObject.poseTrack?: Scene3DPoseKeyframe[]`（`{time, presetId?, pose?}`）。`time`=绝对场景时间轴秒，与
`trajectoryBinding.startTime`/播放头同时钟。`pose` 自包含（采样不查常量，preset 删了也不崩）。空=老行为（守 P1）。
`object.pose` 仍是静态基准（无 poseTrack / 首帧之前的姿势）。

## 2. 纯函数（TDD，`scene3dPoseTrack.ts`，零 THREE/常量依赖）

- `buildPoseTrack(events)`：滤非法/负 time → 升序稳定排序 → 塌合连续同 key → 深 clone。
- `samplePoseKeyframe(track, t)`：step-hold，取 `time ≤ t` 最近一帧；空/早于首帧 → undefined（落回静态基准）。
- `poseKeyframeKey(kf)`：稳定身份键（preset:/pose:/base），供离屏「只在边界换 pose」判重。
- `Scene3DPoseEvent` 类型：录制事件形态（recorder 产出）。

## 3. 套用到时刻 t

- `objectWithPlaybackPose`：先解析 pose-over-time（独立于轨迹），再叠轨迹位姿；两个 live 回放消费者天然受益。
- 离屏 `TrajectoryFrameStepper`：每 tick 用 `samplePoseKeyframe` 算关键帧，与「上次套用 key」比对，**仅边界变化时**对挂载骨架
  `group.children[i].children[0]` 调 `applyMannequinSkeletonPose`+`groundMannequinModel`（同步、帧内生效）。8 帧 settle 门不动；
  step-hold 一段 take 只重摆 1-3 次（每次动作切换），不是每帧 → 既帧准又不掉帧（避 `groundMannequinModel` 全顶点遍历）。

## 3b. 生产者接线（接到真 S2 录制器）

- `useScene3DTakeRecorder`：加 `poseEventsRef`。`startRecording` 种一个 t=0 起始姿势（读被操控角色当前 `object.pose`——
  因 `applyActionPreset` 即时改 pose，停止时克隆到的是末尾姿势，没种子第一段会错落回末尾）；新增 `recordPoseEvent(presetId)`
  录制中按 wall-clock 打戳；`stopRecording` 把 ms 归一为「起点起算秒」放进 `RecordedTake.poseEvents`。
- `Scene3DFullscreen`：点动作库 = `applyActionPreset`（即时改）+ `takeRecorder.recordPoseEvent`（录制中才记，非录制 no-op）。
- `buildRecordedTakeScene`：`poseTrack = buildPoseTrack(poseEvents)`，≥2 关键帧才挂到角色（单帧=全程同姿势=老行为）。

## 4. 验收门（实际完成）

- ✅ 五门 `pnpm run gates` 全过（R11）。
- ✅ 单测：纯函数 21（排序/塌合/step-hold/边界 + 离屏去重不变量：重摆数=切换数·确定性·边界推进）+ `objectWithPlaybackPose`
  pose-over-time + 序列化往返 + `takeRecording` pose 挂载（切动作挂/单帧不挂/省略不挂/回切同姿势塌合）。
- ✅ **端到端 R13**（`tests/ux/scene3d-take-record-pose.walk.mjs`，NOMI_E2E=1）：录制中切「下蹲→挥手」→ ① poseTrack
  真落盘（`squat`@1.747s + `wave`@3.481s + t=0 起始姿势）② 离屏出 4s/96 帧 mp4，零 console error。**mp4 抽帧人眼判**：
  帧0=站立、帧48(2s)=下蹲、帧84(3.5s)=挥手，全程贴地——动作确实随时间变进参考视频，治掉「mp4 停在末尾姿势」的原 bug。
- ✅ S1 live 走查（`scene3d-character-drive.walk.mjs`，补 splash-skip）零回归。

## 5. 回滚

poseTrack 为新增可选字段，空=老行为；`recordPoseEvent` 非录制 no-op；摘掉离屏 stepper 的 pose 套用块即回静态渲染，不影响相机轨迹链路。
