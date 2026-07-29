# J6 AI 运镜（camera-move）旅程级评测

2026-06-22 · 把 AI 运镜功能编进既有 `evals/journeys` 框架（不另造系统），按**真实用户旅程**逐里程碑验终态。

## 为什么

运镜是一条完整链路：用户对镜头**说人话** → agent **选对工具/参数**（词表内走 enum、词表外走自由描述、不该加时不加）→ 离屏**渲运镜小片 mp4** → **喂给视频镜头**作 `video_ref` → **真生成**。
现有覆盖各只摸一段：`camera-move-agent-eval` 只验「选不选对工具」（故意拒 `create_camera_move`，永不真渲）；单测只验纯函数与投影规则；`camera-move-render-e2e` 是独立脚本。J6 把这条链路按用户旅程穿成一条，进 `eval:journey` 统一报表。

## 形态（复用，不并行）

- 文件 `evals/journeys/j6-camera-move.mjs`，`needsAgent: true`，镜像 `j1-promo` / `j5-edit-export` 的旅程 shape（`{id,name,needsAgent,successCriterion,setup,milestones:[{id,title,say|act,verify→checks}]}`）。
- 复用 `evals/lib/journeyRunner.mjs`（`runJourneyTrial` / `check`）、`evals/lib/isoApp.mjs`（隔离启动、`createBlankProject`、`sendAgentMessage`、`approveUntilTurnEnds`、`waitForPersistedCanvas`、`readEventsLog`、`readProjectPayload`、`TOOL_WHITELIST`）。
- 在 `evals/journeys/index.mjs` 注册进 `JOURNEYS`。
- 取证一律读落盘 `.nomi/events`（`agent.tool.proposed` 的 `payload.args`）与 `.nomi/project.json` 节点终态，不信 agent 自述。

## 两层

### A 层 — 零额度行为层（默认跑，bulk）

`create_camera_move` 是**写盘工具**（`writes:true`），**不在** `TOOL_WHITELIST` → runner 的 `approveUntilTurnEnds` 在确认卡出现时会**拒绝**它 = **捕获 spec 后拒绝**。我们读被拒前已落盘的 `proposed` 事件 args 做取证，**不真渲、零生成额度**。

里程碑：

1. **seed-video-shot**（`say`）：让 agent 建一个 `kind=video` 镜头节点当运镜靶子（`create_canvas_nodes` 在白名单，自动批准、零额度）。验：画布上出现 `kind=video` 节点。
2. **in-vocab-push-in**（`say` "缓慢推近"）：验 `create_camera_move` 被提议 + `move=push_in`（词表内走 enum 精确路）+ `customMove` 留空 + `speed` 合法/留空。
3. **out-of-vocab-dolly-zoom**（`say` "希区柯克式眩晕变焦 dolly zoom"）：验提议带 `customMove` 非空 **且** `move ≠ push_in`（词表外不硬塞最近 enum）。
4. **negative-static**（`act`，"固定机位别加运镜"）：发消息前记下 camera_move 提议数，走 runner 同款 approve（会拒），验**本轮未新增**任何 `create_camera_move` 提议（负样本不该调）。

> 第二个视频节点 + 环绕的「节点定位」里程碑因断言可靠性不稳定，暂略（spec 允许跳过）。

### B 层 — 额度门 端到端层（`NOMI_SPEND_OK=1` 才花钱）

里程碑 **credit-gated-e2e**（`act`）：未设 `NOMI_SPEND_OK` 时只 push 一条 `SKIP` check 直接返回，**绝不花额度**。设了才：

1. 重发推近请求，用自带 approve 循环**批准** `create_camera_move`（本地渲染 FREE；镜像 render-e2e 的 `approveLoop` + `approveSet`）。
2. 轮询 `CameraMoveCaptureHost` 产物：`scene3d.meta.cameraMoveVideo.url` 出现 / 目标节点 `meta.referenceVideoUrls` 变非空（FREE 断言：mp4 产出 + 喂入 + 切 `omni` 模式）。
3. **批准** `run_generation_batch` 真生成（litterbox 上传 + Seedance）。轮询节点终态 `result.providerUrl||url` 或 `error`。验拿到产物视频 URL。
4. **VLM 判**：下载产物 → node 侧 ffmpeg 抽 6 帧 → 在**本旅程自己那台 app 的主进程内**（`ctx.app.evaluate`，复用 `appBridge.chatVision` 机制）解密 app 视觉 key + fetch 视觉模型，问「是否呈现请求的运镜」。拿不到视觉模型 / 无 ffmpeg → 降级成 `manual` 维度（产物 URL 存在即过，附 URL 供人眼复核）。

> 为支撑 B 层在「同一台 app」做视觉调用，`journeyRunner.buildCtx` 增加 `ctx.app`（Electron 实例，主进程上下文）。这是**唯一**对框架的改动，纯加法，普通旅程留 `null` 安全。

## 打分维度（dimension）

`check(label, pass, reason, dimension)` 的 dimension：`outcome`（终态功能性达成）、`behavior`（agent 选择正确性，A 层主轴）、`quality`（参数合理性）、`vlm`（视觉运动核验）、`manual`（人眼复核/SKIP 占位）、`safety`（runner 自动追加 `zeroVendorCalls`）。

## 怎么跑

```
# A 层（零生成额度；agent 文本额度默认授权）
pnpm eval:journey --only j6-camera-move

# A + B 层（B 花真生成额度）
NOMI_SPEND_OK=1 pnpm eval:journey --only j6-camera-move
```

`--ci` 只跑零额度旅程（J6 `needsAgent:true` 故 CI 自动跳过）。报表落 `evals/runs/<stamp>-journeys/`（output.jsonl / scores.json / report.md），可被 `eval:view` 读。

## 约束自检

加法（新增 j6 + 注册 + ctx.app 一行）；复用 journeyRunner/isoApp/check；默认零额度，额度仅在 `NOMI_SPEND_OK` 后；文件 ≤800 行；未碰任何门岗脚本。
