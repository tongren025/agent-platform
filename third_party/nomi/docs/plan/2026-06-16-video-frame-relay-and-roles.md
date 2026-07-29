# 执行计划：视频接力帧（通用）+ Seedance 角色数组合并

> 2026-06-16。落地两份交接（`docs/handoff/2026-06-16-video-frame-extraction.md` + `2026-06-16-seedance-apimart-complete.md`），
> 但**按 P4 通用第一 + P1 单一真相源收紧**——不做 Seedance 专用形状。工作树 main 分支。
> 调研已完成（Context7/官方文档 WebFetch + 两个 Explore agent 摸真实代码，file:line 见下）。

## 核心设计：三层正交，谁都不认识 Seedance

```
①抽帧 IPC          视频+which(first/last/秒) → 图片URL    —— 纯基建，不知道 Seedance/storyboard
②接力帧解析(唯一真相源) 一条策略链回答"这条边的接力帧是什么"：
                    有现成尾帧URL(return_last_frame)→用它；否则→抽帧；都没有→拦下报错，绝不冒充
③combineSlotsInto   把若干带 role 的槽 → 角色对象数组   —— 通用原语，任何 role-array 模型复用
```
抽帧填进 `last_frame`/`first_frame` 槽 → combine 把槽打成 `image_with_roles` → catalog 翻译 vendor 字段名。
**三层各管一件，新模型只在档案声明，三层代码一行不改 = 通用的证明。**

## 通用红线（做歪就退化成 Seedance 专用，CI/review 盯死）

1. **键名不硬编码**：合并键来自 `mode.combineSlotsInto.key`，绝不 `if(vendor==='apimart')` 或写死 `image_with_roles`。vendor 字段名只在 catalog body 翻译一次（M1）。
2. **role 派生自 kind，不开平行轴（P1）**：slot 已有 `kind`（first_frame/last_frame/image_ref）→ role 默认由 kind 推（first_frame→`first_frame`、last_frame→`last_frame`、image_ref→`reference_image`）；只有 vendor 措辞不同才用 `slot.roleName` 覆盖。不新增一条和 kind 并行的 role 真相源。
3. **合并在构造层**：`buildArchetypeInputParams`（renderer）拼好整个数组再进模板——模板引擎丢不掉 `{url:undefined}` 对象（apimart 文档§6 坑），结构必须进模板前成型。
4. **抽帧失败不冒充**：resolver 已封死"视频/封面当首帧"；抽帧失败 → 节点标人话错误，**绝不 fallback**。
5. **通用性测试**：写一个"假想第二个 role-array 模型只靠声明就通过"的单测，证明零代码改动可扩展。

## 现状（坏在哪，已核实 file:line）

- `relayFromVideoUrl` 全仓只有 resolver(`generationReferenceResolver.ts:18/50/119`)+其测试引用，**零消费者**——算出来就被丢。这是根（P2）：承诺方就位、消费方真空。多镜视频接力裸跑的潜伏 bug 就源于此。
- resolver 输出 relay 时**故意 firstFrameUrl=undefined**（:102），等抽帧填。脊梁不变量，保住。
- storyboard `storyboardPlan.ts:293` 只有注释不建 shot→shot 边（B-clean）；`dependencyWaves.ts` 靠边分波，无边=同波并行。
- 抽帧 IPC 不存在；`referenceUrl.ts:12` 的 `asUrl` 已放行 `nomi-local://`（抽帧返回值协议已就位）。
- apimart Seedance i2v body(`apimartVideos.ts:90`)用 `image_urls`，**无 image_with_roles**；kie 用扁平 `first_frame_url`/`last_frame_url`(`kieSeedance.ts:61-62`)。

## 关键文件地图（落点）

| 层 | 文件:行 | 动作 |
|---|---|---|
| 抽帧实现 | `electron/video/extractVideoFrame.ts`（新） | ffprobe 测时长 + ffmpeg 输出端 seek 抽帧 → writeAsset → nomi-local |
| ffmpeg | `electron/export/ffmpegRunner.ts:196 resolveFfmpegPath` + `mediaProbe.ts:222 probeMediaMetadata` + `ensureExecutable.ts:14` | 复用 |
| 反解/写盘 | `electron/assets/localAssetFile.ts:9 absolutePathFromLocalAssetUrl` + `runtime.ts:212 writeAsset` | 复用 |
| IPC | `electron/main.ts:288`（`ipcMain.handle("nomi:video:extract-frame", …)`）+ `preload.ts:13`（`video:{extractFrame}`）+ `src/desktop/bridge.ts:72`（类型） | 新增 |
| 接力消费 | `src/workbench/generationCanvas/runner/generationNodeExecutor.ts:29-31`（video 分支） | resolver 后 await 抽帧填 firstFrameUrl |
| 取 projectId | `src/workbench/project/workbenchProjectSession.ts:89`（加 `getActiveWorkbenchProjectId()`） | 新增 getter（单源） |
| storyboard 接力 | `agent/storyboardPlan.ts:293` + `storyboardPlan.test.ts:126` | 视频镜头间建 first_frame 边 + 改断言 |
| combine | `src/config/modelArchetypes/types.ts:22-40/53-82`（slot `roleName?`/mode `combineSlotsInto?`）+ `archetypeMeta.ts:259-298` | 通用合并原语 |
| Seedance | `src/config/modelArchetypes/seedanceApimart.ts` + `electron/catalog/apimartVideos.ts` | 加首尾帧模式 + face/fast-face + seed/return_last_frame |

## 落地顺序（小爆炸半径，先通用后场景）

- **M-A 通用接力帧基建**：抽帧 IPC + 接力帧解析消费 + projectId getter。单测（mock IPC / relay→firstFrame 填充 / 抽帧失败拦下）。手动画布 video→video 边验证。五门 + commit。
- **M-B storyboard 接力重连**：视频镜头间建 first_frame 边 + dependencyWaves 自动分波串行 + 改 storyboardPlan.test 断言。五门 + commit。
- **M-C Seedance combine** ✅ **已 push main（9dddd3f）**：通用 combineSlotsInto 原语 + 首尾帧模式 + face/fast-face
  + seed + catalog image_with_roles。根治 mapping id 撞（idKey）。单测 8（含「假想第二模型」通用性断言）。五门绿。
- **~~M-B storyboard 自动重连~~ 已取消**：用户拍板「shot→shot 自动链删除 → 保留」（与交接 §2C 冲突，按 R3 以用户为准）。
  不自动连——多数分镜切镜头，强行首帧接力反而错；连贯靠共享定妆/场景卡。M-A 已让手动 video→video 边真抽帧、根治潜伏 batch bug。
- **M-D 真实 E2E** ✅ **已完成并通过**（`tests/ux/seedance-apimart.e2e.mjs`，opt-in 烧额度，用 app 已配 apimart key 自解密）：
  ① 首尾帧真实生成 → apimart 接受 image_with_roles(未 400) → 轮询 ~5min → **真实出片**(apib.ai mp4)；
  ② M-A 抽帧：对生成的真实视频抽尾帧 → https 下载+ffmpeg+writeAsset → **nomi-local 素材**。7 项断言全过。
  真实 E2E 顺带抓出一个真问题:duration 必须 int(string 被 apimart 400)——核实真实渲染流程发 number(taskParams.ts:39)、
  仅测试 artifact，非产品 bug。③ return_last_frame 字段名：留作单独跟进（需在 body 加 return_last_frame:true 再跑一次抓响应）。
- A/C 已完成：typecheck/filesize/tokens/lint/build + 1429 单测 + 零额度 e2e(smoke10/ipc6/cold9) 全绿；R13 画布 build 后健康。

## 不动什么

- resolver 的"不冒充"不变量（:102）——只在它之后填，不改它。
- 现有 image 边图合并逻辑（archetypeMeta ARRAY 分支）——combine 是末尾追加的新步骤，不改老路径。
- kie Seedance 扁平键路径——它走 DEFAULT_INPUT_KEY，不碰。

## 回滚

每个 M 独立 commit。M-A 出问题：抽帧失败已设计成"拦下报错"，不会污染老链路（relay 边在 B-clean 后 storyboard 不产，只有手动连才触发）。M-C combine 是新模式，老模式不受影响。

## 验收门

五门（filesize/lint/typecheck/test/build）每个 M 全过；M-A/M-C 接入类必跑真实 E2E（M-D）；与官方文档逐项对账（Seedance 变体×模式×参数全表打钩，见 handoff §1）。
