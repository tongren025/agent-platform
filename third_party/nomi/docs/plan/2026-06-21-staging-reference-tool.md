# AI 站位参考工具 `create_staging_reference`

> 2026-06-21。把已校准的 3D 导演图能力拆成 AI 可调用工具：AI 用「人话词汇」描述站位/动作/机位 → 组装 3D 场景 → 离屏渲染出一张「站位+动作+机位」参考图 → 自动连到镜头当 composition_ref。锁死视频模型最易崩的三件事：动作崩、站位崩、张冠李戴。
>
> 地基：预设动作已校准（[[scene3d-pose-calibration]]，commit 8c207e7）。

## 1. 通俗讲解（解决哪个真实摩擦）

视频模型生成多角色互动镜头时，常「谁站哪、做什么动作」乱掉（A 该跪在 B 面前，结果两人都站着 / 位置对调）。导演图能用一张参考图把这关系钉死，但现在要用户手动开 3D 编辑器摆——累。本工具让 AI 在拆镜头时**自动**：判断「这镜头需要站位锁」→ 说人话（"A 单膝跪在 B 正前方 1.5 米，低机位仰拍，中景"）→ 系统组装 3D 场景出图 → 自动挂到镜头参考槽。用户什么都不用做，视频生成就稳了。

## 2. 触发机制（设计要点）

**不是每个镜头都做**（纯对话特写不需要，强加=多花额度+干扰）。三个触发面：
- **AI 自动判断**（主）：拆镜头/建节点时，镜头满足任一条件就调用——① ≥2 角色且有空间关系；② 有具体肢体动作（跪/坐/蹲/指/跑…）；③ 导演指定了机位（仰拍/俯拍/侧面…）。工具 description 把「何时用」写清楚教给 AI。
- **用户显式**：对话里说「给这个镜头做站位参考」；或镜头节点上的「建站位参考」入口（v1 走对话路径，按钮入口为薄封装）。
- **产物形态**：建一个 `scene3d`「站位台」节点（保留、可改、可重出图）+ 自动截一张 `image` 节点，连 `composition_ref` 边到目标镜头。**单一真相源=3D 场景**，改场景重出图即更新参考。

## 3. 语义词汇表（人话 → 3D 参数）

| 维度 | 取值 | → 3D |
|---|---|---|
| pose 动作 | 12 预设 id（standing/walk/run/sit/squat/single-knee/double-knee/hands-on-hips/point/wave/cheer/t-pose） | mannequin.pose |
| layout 站位 | solo / facing(面对面) / side-by-side(并排) / line(纵队) / behind(一前一后) / circle(环绕) | 各 mannequin position+rotation.y |
| facing 朝向 | toward(朝向彼此/中心) / away / camera / left / right | rotation.y |
| cameraAngle 方位 | front / three-quarter / side / back | 相机方位角 |
| cameraHeight 高度 | eye / low(仰) / high(俯) / overhead(顶) | 相机俯仰 |
| shot 景别 | wide(全) / medium(中) / close(近) | 相机距离 + fov |
| environment 环境 | studio(中性) / day / night | background+sky+light |
| crowd 群众 | rows×cols（可选背景人群） | mannequinCrowd 对象 |

不在词汇表里的怪动作做不出（持续扩词表，不退化成「AI 直吐坐标」）。

## 4. 分层与文件

- **词汇常量** `scene3d/stagingVocab.ts`（新）：CAMERA_ANGLES / SHOT_SIZES / LAYOUTS / ENV_PRESETS（纯数据，可被工具 description 引用）。
- **builder** `scene3d/stagingBuilder.ts`（新，纯函数+单测）：`buildStagingScene(spec) → Scene3DState`。复用 createDefaultScene3DState/normalizeScene3DState、MANNEQUIN_DEFAULT_SCALE、预设 pose。
- **离屏自动截图** `scene3d/Scene3DAutoCapture.tsx`（新）：隐藏 `<Canvas>` 渲染场景内容（mannequin+灯光+环境，无控制器/网格/标签）+ 选定相机 `captureScene` → dataURL。复用 Mannequin（带落地）+ captureScene。
- **节点接线**：`Scene3DEditor.tsx` 检测 `meta.stagingAutoCapture` → 挂 Scene3DAutoCapture → 出图后复用 handleScreenshot 路径（持久化+image 节点+composition_ref 边到 target）→ 清标志。
- **工具注册（4 处）**：① `electron/ai/canvasTools.ts` schema+name；② `electron/ai/agentChatV2.ts` buildCanvasToolsForV2 包装；③ `src/.../agent/applyCanvasToolCall.ts` dispatch：build state → 建 scene3d 节点(带 autoCapture meta+target)；④ `agent/gate.ts` 放行策略（建节点类，需确认、零扣费）。
- **schema 镜像**：主进程 canvasTools.ts 与渲染层 applyCanvasToolCall 各一份 staging spec schema，刻意同步（同 storyboardPlan 例）。

## 5. 不动项 / 回滚

- 不动现有 8→12 预设数据、不动生成 runner、不动参考边解析（复用 composition_ref）。
- 不做「全自动每镜出图」（成本/干扰）；不做 AI 直吐坐标（违 D1）。
- 回滚：工具是新增，删 4 处注册 + 新文件即回到现状；scene3d 节点本身不变。

## 6. 验收门

- 单测：buildStagingScene 各 layout/camera 组合产出合法 Scene3DState（normalizeScene3DState 不报错、相机朝向群组中心、角色数对）。
- 真实用户视角 E2E（打包 App + playwright _electron）：对话输入「两个角色，A 单膝跪向 B，低机位仰拍中景」→ agent 调 create_staging_reference → 画布出现 scene3d 站位台 + image 参考 + composition_ref 边 → 截图非空、人眼判断站位/动作/机位对。
- 五门全过 + 设计系统合规（新 UI 用 token，节点视觉沿用现有 registry/renderRegistry）。

## 7. 排期（切片）

- S1 词汇表 + builder + 单测（纯逻辑，可独立验）。
- S2 离屏自动截图组件 + Scene3DEditor 接线（出图落库+连边）。
- S3 工具注册 4 处 + agentCreatable 处理。
- S4 真实用户 E2E + 五门 + 真机走查 + commit。
