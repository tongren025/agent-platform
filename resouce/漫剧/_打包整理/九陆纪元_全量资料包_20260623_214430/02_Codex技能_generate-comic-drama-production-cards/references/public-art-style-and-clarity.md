# 公共美术画风与清晰资产规范

## 适用场景

当用户提供公共美术目录、画风参考图，或指出“画面脏、糊、黑线、主体不清、分镜图不是我要的”时，先按本规范修正交付策略。

## 画风锚点

默认画风应靠近用户公共美术参考：

- 精致二次元国风奇幻厚涂设定稿。
- 商业快节奏漫剧关键帧质感，人物五官和服装结构清楚。
- 大形体、大轮廓、大光影优先，细节只服务主体。
- 背景有世界观信息，但不能抢角色脸、手、服装和动作。
- 粒子、火星、魔法符文是点缀，不是填满画面的噪点。
- 色彩过渡干净，边缘清楚，阴影平滑，不要粗黑描边和随机黑线。

## 三类核心资产

### 角色图

角色图用于连续性锁定，不用于表现复杂剧情。

必须要求：

- 主体占画面 45%-70%。
- 脸、眼睛、手、发型、伤痕、服装结构、道具清楚。
- 背景为纯净低干扰背景，或弱化的世界观背景。
- 无运动模糊、无景深糊脸、少烟尘、少粒子。
- 需要同角色多形态时，分别输出定妆图、三视图、表情图、战损图。

推荐正向短语：

```text
公共美术同款画风，精致二次元国风奇幻厚涂设定稿，清晰角色设计图，主体占画面60%，sharp focus on main character, clean facial details, detailed eyes, detailed hands, crisp edges, clean silhouette, controlled detail, simplified cinematic background, smooth natural shadows, soft diffuse light, clean color transition
```

角色图负向必须包含：

```text
blurry, soft focus, motion blur, depth of field blur, noisy details, over-detailed background, messy texture, low clarity face, distorted hands, muddy details, excessive particles, haze, random black lines, thick black outline, sketch lines, dirty ink, panel borders, text, watermark
```

### 场景图

场景图用于稳定空间，不用于完整动作剧情。

必须要求：

- 优先空镜，或人物只作为比例尺。
- 前景、中景、远景层级清楚。
- 角色可移动路线、障碍物、高低差、光源位置清楚。
- 远景可以宏大，但细节要成组，不要满屏碎纹和伪细节。
- 战斗场景图只表现开打前空间关系或关键站位，不要把连续动作塞进一张图。

场景图负向必须包含：

```text
over-detailed background, noisy ruins, messy debris, excessive sparks, excessive smoke, muddy color, black cracks everywhere, dirty texture, unclear path, tiny unreadable characters, random black lines, panel borders, text, watermark
```

### 黑白轨迹分镜图

黑白轨迹分镜图用于视频执行，不是最终彩色画面。

必须要求：

- 使用黑白灰信息图、粗略镜头框、角色编号、运动箭头、镜头箭头、攻击路径、特效路径。
- 不追求精美，只追求动作方向、空间关系、镜头调度清楚。
- 一个镜头可用 2-3 张轨迹小图；复杂打斗可用 10-20 张。
- 不使用彩色厚涂、复杂纹理、史诗光效或成片式分镜。
- 不把轨迹图作为生图画风参考，避免工具学习黑线、边框、编号。

## 交付策略

当用户要“一段视频制作包”时，默认按以下顺序输出：

1. 角色定妆和角色图提示词。
2. 场景空镜和场景图提示词。
3. 黑白轨迹分镜总览和逐镜头轨迹说明。
4. 关键参考图提示词，仅挑首帧、高光帧、尾帧。
5. 完整视频提示词，写清资产、动作因果、运镜、声音和负向限制。

不要把 24 宫格、48 宫格彩色故事板作为默认交付；只有用户明确要求“彩色故事板图”时才做。
