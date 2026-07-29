# 导演台运镜升级（对标 2026-07-02 推特 AI 导演控制器 demo）

日期：2026-07-03 ｜ 样张：`docs/design/mockups/scene3d-camera-directing-upgrade.html`（已拍板：全都要，含场景模板）

## 背后逻辑（D6）

推上那个 Fable 5 单文件 demo（5.8k views）核心不是技术，是把「摄影师心智」铺在 UI 上：一排运镜预设点一下就出关键帧、焦段 mm 滑杆、手持抖动、宽银幕。我们的导演台底子更厚（录 take、轨迹逐点精修、**自动落画布喂 video_ref 的端到端闭环**——他没有），但用户侧有真空洞：**10 种运镜预设 AI 独占（`create_camera_move`），编辑器里用户点不到**，想动相机只能双击空地手画轨迹点；FOV 不参与动画导致变焦推/拉/希区柯克在数据模型上就做不了。

取舍：抄「交互皮」（预设按钮/摄影师参数），不抄「提示词导出」（我们 video_ref 路更强）。场景模板/道具库用户拍板要做——为首尾帧参考图与摆场效率服务，仍走灰模极简风（内容靠生成模型补），不做 PBR 材质内容库。

## 范围（按落地顺序）

### S1 FOV 动画地基
- `Scene3DTrajectoryBinding` 加可选 `fovFrom?/fovTo?`；播放路径（`cameraWithPlaybackPosition`）按 binding 进度线性插值 fov；serializer 读写 + clamp；单测。
- 不动项：无 fov 字段的旧 binding 行为逐字不变（缺省 = 用相机静态 fov）。

### S2 运镜词表扩到 13 + 「应用到现有相机」纯函数
- `cameraMoveVocab.ts`：加 `zoom_in / zoom_out / dolly_zoom`（标签：变焦推/变焦拉/希区柯克变焦）+ DESC。AI 工具 schema 引用词表 → 自动获得新招（P4，一套能力两入口）。
- 新纯函数 `applyCameraMovePreset(state, cameraId, {move, duration, amplitude})`：按**当前机位与 target** 就地生成轨迹点（幅度 % 缩放扫角/推拉比/升降幅），binding 追加到 `sceneTimeline` 末尾（连点即串联），zoom 三招写 fovFrom/fovTo（希区柯克按 tan(fov/2)·d 恒等式反解补偿）。单测覆盖 13 招 + 串联时序 + 幅度缩放。
- `buildCameraMoveScene`（AI 建整场景路径）复用同一 path 生成器，无并行版（P1）。

### S3 运镜预设面板（UI）
- 新文件 `scene3dCameraMovePanel.tsx`（R9：不塞进 641 行的 inspector 主体，作为子组件引入），挂在 PropertyPanel 选中相机时：时长(秒)/幅度(%) 两输入 + 13 按钮网格 + 追加反馈。落段后打开底部时间轴。
- 样张对账点：按钮网格 3 列、变焦三招虚线金框、hint 文案、连点串联。

### S4 焦段 mm（派生视图，fov 仍是唯一真相）
- `scene3dMath.ts` 加 `fovToFocalMm/focalMmToFov`（竖直向、35mm 全幅 24mm 片高：fov = 2·atan(12/mm)）+ 单测。
- 相机预览浮窗加「焦段」滑杆行（12–200mm，12 广角/50 标准/200 长焦刻度），写回 camera.fov；属性面板 FOV 数字框旁显示派生 mm。不新增存储字段（derive 不 hardcode）。

### S5 手持抖动
- `Scene3DCamera` 加可选 `shakeAmplitude?: number`（0–100，缺省 0 = 老行为）。
- 播放共享路径叠**确定性**噪声（多频正弦复合，按播放头 t 求值，禁 Math.random——离屏采帧必须可重现、与预览一致）；预览浮窗加开关 + 强度滑杆。抖动经离屏 mp4 → video_ref 真传进成片。

### S6 2.39:1 宽银幕
- `Scene3DAspectRatio` 枚举 + 比值表加 `'2.39:1'`；核对 `aspectDimensions`/`capCameraMoveDimensions` 均按 ratio 派生（应零改动）；预览浮窗比例按钮 6 档。

### S7 运镜首尾帧导出
- 时间轴/预览浮窗加「首尾帧」：把播放头钉到选中 binding 的 startTime/endTime 各 captureCamera 一张 → 走 `persistScene3DScreenshot` 落两个画布图片节点（命名 首帧/尾帧），可连去 first_frame 槽。复用现有截图管线，不新开采帧支线。

### S8 语义道具（灰模）
- 新文件 `scene3dProps.tssx→scene3dProps.tsx`：程序化灰模组件 车/建筑/树/路灯/墙（primitive 组合，同 ProceduralMannequin 范式）；`Scene3DObject` 加 `type:'prop'` + `propKind`；serializer/objects 渲染/factories/添加菜单（几何模型旁加「道具 ▸」级联，照现有 cascade 范式）。
- AI 侧 staging 词表同步声明道具（P4）。

### S9 场景模板
- 纯 builder：`城市街道`（马路面+车道线墙条+楼块+树+路灯）/`室内房间`（地板+三面墙+门窗洞）/`空场景`；入口 = 底部「添加」菜单顶部「场景模板 ▸」级联（复用现有菜单范式，非顶栏——顶栏已挤）。
- 非空场景应用前 toast 确认语义（追加 or 替换：**追加**，不清用户已摆的东西——绝不冲用户数据）。

### S10 走查收口
- 与样张逐项对账 + R13 真机截图走查（预设落段→播放→录出 mp4→落画布喂 video_ref 全链）；CHANGELOG；`pnpm run gates` 全过每片一 commit。

## 不动项
- 轨迹系统数据结构（点/曲率/组/时间轴交互）零改；录 take、姿势、群众、staging 全链不碰；AI 工具协议只增不改（新招进词表自动带出）。

## 回滚
每 slice 独立 commit，可单独 revert；新字段全部可选缺省=老行为。

## 验收门
五门全过 + 单测覆盖（fov 插值/13 招路径/焦段换算/串联时序/serializer 兼容）+ R13 截图对账样张。
