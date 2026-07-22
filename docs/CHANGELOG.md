# 改动记录 CHANGELOG

> 规则见 [CLAUDE.md](../CLAUDE.md):每次功能性改动必须在此追加一条。
> 最新在上。格式:`## [日期] 标题` + 变更点 + 影响面。

---

## [2026-07-21] feat: 导演工作台视觉重构

- `web/src/pages/DirectorStudio.tsx` 重排为电影制片控制台：新增项目生命体征、环形完成度、推荐动作区、
  七阶段制作轨道和联系表式镜头审片台，同时保留新建项目、批量生成、任务同步与高级看板入口。
- `web/src/pages/DirectorStudio.css` 建立导演台专属视觉系统，以深墨绿、暖琥珀和生产青为语义色，补齐
  44px 交互热区、键盘焦点、图片占位、懒加载、减少动态效果和 375/768/1024/1440 响应式布局。
- 影响面：仅用户端 `/studio` 页面结构、文案与样式；无 API、数据模型、环境变量或部署变化。

---

## [2026-07-21] fix+feat: 基调漂移三连修——风格句去污染、基调板、两键评审

**动机**：用户长期卡在"图片基调对不上"过不了图片关。诊断出三个开环：①Art Bible 全局风格锚点句
混入 G1 具体画面元素「蓝白魔法阵与赤金龙焰对撞」并扩散 1451 处（五季卡池/9 员工 roleProfile/
长期记忆/画布），安静戏也被拉向对撞大战；②S1 192 张首帧④写"暖赤金 vs 净化冷蓝"双色对撞但不定
主次，同卡④⑤冷暖指令互相打架，模型每次自行配平致批间漂移；③废图无出口——卡片 status=done 只表示
生成完成，不满意原因从不落数据，重生成不带修正。

**变更**：
- 新增 `scripts/fix_style_anchor_pollution.py`：全量删除污染短语（1451 处、27 文件，历史日志/备份不动）；
  s1 192 张 img_prompt 按各卡⑤光影+⑥情绪判型（warm 88/cold 57/green 25/cloud 14+追加型），
  模板尾巴替换为显式"配色权重"句（主次比例+次色出现范围+冷暖不均分）；冷主导卡④中段暖调词同步改。幂等。
- 新增 `scripts/seed_tone_boards.py`：jiulu-s1 design 阶段种入 5 张基调板卡（`g-tone-01..05`，
  金绿/暖赤金/冷蓝/龙焰爆发/云海），带小云雀可直接复制的生成提示词与挑图标准；选定图后作为
  对应分型全部首帧的 @图片2 基调参考——基调用图锁，不用文字赌。status=pending 待挑图。
- 新增两键评审：`POST /production/projects/{pid}/cards/{card_id}/review`（pass/reject，reject 必带
  枚举 reason：基调偏差/角色走形/构图不符分镜/光影错误/结构崩坏/其他）+
  `GET /production/projects/{pid}/review-stats`（废弃原因分布+按集统计）。评审追加进卡片
  `metadata.image_reviews`。前端单集详情页图片下加通过/废弃两键+原因弹窗，顶部统计条直接提示
  "废弃主因 X，优先修它"。
- 新增 `docs/VISUAL_ASSET_ROLES.md`：定死制片故事板/首帧图/轨迹板三类资产唯一用途与验收问题，
  S1 不再全量重制第四轮；首帧图三重锁（角色母版+基调板+配色权重句）。
- 同步修复：种子基调板卡 shot_number 误写 None 导致 jiulu-s1 全部加载端点 500，已改 0 并修脚本。

**影响面**：production API 新增 2 端点（写权限沿用现有前缀映射）；`data/production/jiulu-s1..s5/cards.json`、
9 个员工 JSON、10 个 semantic.json、GC 画布、EP01 交付包批量修改；前端 `EpisodeDetail.tsx`/`api.ts`；
无数据库迁移。后端 180 项测试通过（新增 5 项 `test_production_review.py`），前端 tsc 通过，
浏览器端到端验证废弃/通过/统计条闭环。

- 依据专业故事板与生成式视频提示词指南，重新区分“制片故事板”“最终概念图”和“五格动作轨迹板”；GC 镜头改为一个画面只表达一个决定性剧情节拍。
- 新增 13 张 9:16 清晰低噪制作故事板，统一为干净石墨线稿、三阶灰度与少量剧情色彩焦点；角色、幼龙和成年龙均由正式母版锁定身份与比例。
- G1–G4、G7–G11 各使用一张制片画面；存在真实切镜的 G5、G6 拆为 A/B 两张，生产卡资产类型切换为 `production_storyboard_frame_sequence`。
- 新增 `docs/GC_STORYBOARD_PROMPTS.md`，记录检索来源、统一提示词模板、13 镜头提示词集和可直接审阅的故事板总页；旧版 `动作轨迹_v1` 资产非破坏性保留。
- 影响面：`data/production/a3ab9f6a/cards.json`、GC uploads 与故事板提示词文档；不影响 API、数据库表或部署配置。

---

## [2026-07-20] 《九陆纪元》GC 故事板、场景与角色母版补齐

- 新增 11 张 GC 动作轨迹故事板，每张为 5 格连续动作大图，覆盖 G1「九陆之瞳」至 G11「我自己选」，并在卡片元数据中标记为 `action_trajectory_storyboard`。
- 新增 5 张 9:16 纯场景母版：觉醒遗迹、废矿坑龙蛋巢、烬龙陆龙骨荒原、垂死世界树天穹、世界树钥匙虚空。
- 新增 5 张正式角色/生物母版：苍霖前期三视图、苍霖后期三视图、艾拉三视图、幼龙设定板、成年龙三视图；GC 阶段锁定卡和第一季全局角色母版卡均已改用新资产，不再以旧人物参考冒充龙族母版。
- GC 的 5 张场景卡、4 张阶段角色卡、11 张故事板卡已绑定实际图片；第一季苍霖、艾拉、巨龙 3 张全局角色母版卡由 `pending` 更新为 `done`。
- 影响面：`data/production/a3ab9f6a/cards.json`、`data/production/jiulu-s1/cards.json`、GC uploads 与 `resouce/漫剧/output/characters/`；不影响 API、数据库表或部署配置。

---

## [2026-07-20] 《九陆纪元》S1 动作轨迹故事板批量交付

- 新增 `scripts/render_jiulu_s1_trajectory_storyboards.py`，从 24 集 `storyboard` 卡正文解析时间码、景别机位、唯一运镜、起止姿态和分时动作，批量渲染每个 G 单元的多格动作轨迹大图。
- 轨迹板以现有首帧或该集关键参考图作为视觉锚点，橙色标主体动作路线、蓝色标镜头运动；原图不修改，已有关键帧继续保留。
- 已交付 143 张 G 单元轨迹板、1229 个独立子镜头、24 张分集总览和 1 张全季总览；143 张生产卡首图绑定完整，原关键帧保留在后续图片位置。
- 当前生产版 `jiulu-s1-script.html/.pdf` 与全五季剧本已嵌入 24 集全部轨迹板；另一路 EP01《泥里的人》正式剧本 v2 保持独立，避免按集号错配素材。
- 同步修正 `project.json` 和项目生产索引中的旧“10 集/372 卡”口径为当前“24 集/798 卡”，并明确仍待制作的 5 张非故事板全局母版。
- 影响面：`data/production/jiulu-s1/cards.json` 的 storyboard 图片绑定、项目元数据与生产索引、`resouce/漫剧/九陆纪元_S1烬龙陆篇_v2_动作轨迹故事板/` 交付目录；不影响 API、数据库表或部署配置。

---

## [2026-07-20] feat: 第一季正式剧本 v2 图文完整版

**动机**：根目录旧 PDF 来自另一套制片卡池剧情，未收录《九陆纪元》S1 24 集正式剧本 v2 已完成的
逐集关键参考图和四格分镜图，容易把“文档排版完成”误认为“正式剧本视觉资产已齐”。

**变更**：
- 新增正式剧本 v2 图文导出脚本，将 24 集正文、24 张关键参考图、24 张四格分镜图、两张全季总览
  以及 EP01 已完成的 5 张逐镜头分镜编入同一份 HTML/PDF。
- 新增一张竖屏矿洞场景母版，作为正式剧本主要场景的补充参考；原始 v2 图包不覆盖、不降级。
- 导出前校验 EP01-EP24 素材一一对应，文档缩略图与清单可重复生成。

**影响面**：新增第一季正式剧本 v2 图文版、文档素材与导出脚本；不改写另一剧情分支的
`data/production/jiulu-s1/cards.json`，不修改 API 或数据库。

---

## [2026-07-16] feat: 第一季剧本补入现有视觉资产

**动机**：已导出的《九陆纪元》第一季剧本和五季完整剧本只有镜头拆分表，没有呈现第一季卡池中
已经完成并绑定的角色、场景、道具、总分镜和分集关键帧。

**变更**：
- 新增 `scripts/embed_jiulu_s1_visuals.py`，从第一季 design/storyboard 卡解析已绑定图片，校验本地资源，
  生成文档用缩略图并按集数/G 单元嵌入两份 HTML。
- 视觉区块包含 23 幅全局设定/总分镜与 60 幅分集关键帧；未生成的空图片卡不使用占位图冒充。
- 脚本支持通过本机 Chrome/Edge 幂等重导出 `jiulu-s1-script.pdf` 和 `jiulu-full-script.pdf`，不修改原始成图。

**影响面**：新增 `script-assets/jiulu-s1/` 文档素材目录；更新第一季与完整剧本 HTML/PDF；不修改生产卡
schema、API、数据库或原始媒体文件。

---

## [2026-07-16] feat: 后台 AI 供应商密钥加密持久化

**动机**：真实模型 Key 不能进入 Git，但单人团队需要在后台直接录入 DeepSeek、Google、OpenRouter 等
供应商密钥，并保证部署到远程服务器后重启不丢失。

**变更**：
- 后台保存的 `apiKey` 改为 Fernet 加密后写入 `data/ai-providers/*.json`，磁盘仅保留
  `apiKeyEncrypted`；运行时在服务端内存中解密后交给模型客户端。
- 主密钥优先读取服务器 `AI_PROVIDER_ENCRYPTION_KEY`；未配置时自动生成到
  `data/.secrets/provider-encryption.key`。标准 Compose 共用 `app_data` 卷，生产 Compose 共用服务器
  `./data` bind mount，因此配置和主密钥都会随远程服务器持久化。
- 读取旧版明文供应商 JSON 时自动原子迁移为密文，无需手工改数据；`${ENV_NAME}` 引用继续原样支持。
- 用户端和管理端供应商 API 只返回 `apiKeyMasked` 与 `hasApiKey`，不再回传明文；前端移除查看 Key，
  编辑时留空保留服务器旧值，配置文件来源转托管时要求重新输入。
- 新增 `cryptography` 运行依赖；`data/.secrets/` 明确排除出 Git。
- 仓库内 AITAG/Google AI Studio 供应商种子改用 `${AITAG_API_KEY}` / `${GOOGLE_AI_STUDIO_API_KEY}`，
  不再携带可被误认为真实 Key 的值；远程服务器已有后台托管配置继续优先保留。
- 生产部署在 `git reset` 前后备份/恢复服务器 `production`、`ai-providers`、`.secrets`，素材同步脚本
  排除后两者，避免代码更新或本地同步覆盖后台刚保存的远程密钥配置。

**影响面**：`AiProviderStore` 磁盘格式升级（自动兼容旧格式）；供应商 API 响应移除 `apiKey`、新增
`hasApiKey`；新增可选环境变量 `AI_PROVIDER_ENCRYPTION_KEY`；无数据库迁移。后端全量 172 项测试通过，
前端 TypeScript 与生产构建通过，部署脚本通过 Bash 语法检查。

---

## [2026-07-16] feat: 导演 Agent 一站式制片与 OpenRouter 图片/视频生成

**动机**：一人团队不应在员工、工作流、卡片和设置之间手工搬运结果；用户需要从创意直接推进到
剧本、分镜、图片、审片看板和视频成片，并且只在需要拍板或付费时介入。

**变更**：
- 新增默认入口 `/studio`“导演 Agent”，聚合项目七步生产进度、唯一下一步、镜头审片、待审状态与成片预览。
- 新增 `/api/v1/agentapp/director/*`：项目导演态、OpenRouter 图片/视频模型目录、单镜生图、异步视频提交/同步、FFmpeg 成片合成。
- OpenRouter 图片使用专用 `/images` API；视频使用 `/videos` 异步任务并在完成后下载到
  `data/uploads/production/<project_id>/`，API Key 继续只从已有供应商配置/环境变量解析。
- 批量媒体生成必须在前端二次确认，显示模型、镜头数和可用价格信息；打开页面、刷新、同步任务都不会触发付费生成。
- 导航默认收束为工作室与管理入口，其余页面进入“高级功能”；新增手机端单列审片与阶段条局部横向滚动。
- 成片接口使用本机 FFmpeg 统一项目画幅并按集数/G 单元顺序串接已落地视频，生成 final 卡片和 MP4 预览。

**影响面**：新增 director API/服务/页面；`app.main` 注册新路由；用户端写权限沿用
`production:manage`；新增本地媒体目录，无数据库迁移。验证：相关后端 39 项测试通过、前端生产构建通过、
桌面 1440px 与手机 319px 页面无主体横向溢出。

---

## [2026-07-15] feat: OpenRouter 模型市场页

**动机**：用户希望单独查看 OpenRouter 模型，标出免费模型，并可自行选择加入平台使用。

**变更**：
- 新增 `GET /api/v1/agentapp/agent/openrouter/models`，实时读取 OpenRouter 模型目录并标记免费模型。
- 新增 `POST /api/v1/agentapp/agent/ai-providers/{name}/models`，支持把选中的模型追加到供应商模型列表。
- 新增前端 `/models` 模型市场页，支持免费/全部/已加入筛选、搜索、价格与上下文展示、一键加入 OpenRouter。
- 供应商存储读取也支持 `${ENV_NAME}` 密钥占位，避免把 OpenRouter key 写入托管 JSON。

**影响面**：用户端新增“模型市场”导航；OpenRouter 模型选择不需要手改 JSON；无数据库变更。

---

## [2026-07-15] feat: OpenRouter 作为 OpenAI 兼容模型供应商接入

**动机**：用户已有 OpenRouter 账号，希望平台里的数字员工能直接选择并调用 OpenRouter 上的模型。

**变更**：
- `appsettings*.json` 的 `aiModels[].apiKey` 支持 `${ENV_NAME}` 环境变量占位，避免把 OpenRouter key 写死进 JSON。
- 业务配置加载时会读取仓库根 `.env`，保证 `OPENROUTER_API_KEY` 在 `app.config` 先导入时也能解析。
- `.env.example` 新增 `OPENROUTER_API_KEY` 示例。
- README / RUNBOOK 补充 OpenRouter 最小配置，endpoint 使用 `https://openrouter.ai/api/v1`，模型可先用 `openrouter/auto` 或替换为控制台里的模型 ID。

**影响面**：`app/config.py` 配置解析；本地/生产配置可用环境变量承载 LLM provider 密钥；无数据库或 API schema 变更。

---

## [2026-07-15] feat: 单集镜头级返工台与图片版本管理

**动机**：单人创作时只能按整集替换阶段，无法针对某个 G 镜头返工；单集详情页也只能查看提示词，
图片失败后缺少编辑提示词、立即重画和版本回退闭环。

**变更**：
- 单集详情页的剧本、分镜、图片提示词和视频提示词卡新增直接编辑，可保存正文、主提示词和负向提示词。
- 阶段生成请求新增可选 `shot_number`；`replace` 在传入该字段时只替换同项目、同集、同 G、同阶段卡片，
  并强制新卡仍落回该 G，不影响其他镜头。
- 图片提示词卡新增“立即生图”，读取刚编辑的主提示词并调用已启用的 OpenAI 兼容 images 模型；
  图片持久化到 `data/uploads/canvas/`。
- 新图以版本形式追加，旧图不覆盖；卡片 `metadata.active_image` 记录当前版本，单集页可随时切换。
- 分镜规范升级为“一镜一卡”：每个 ≤6 秒子镜头独立 storyboard 卡；历史上一张 G 内含多个
  `### 镜头N` 的大分镜可在单集页一键拆成逐镜卡，每镜可单独生成故事板图。
- 视频提示词卡新增“视频参考包”，自动汇总同 G 的逐镜故事板图、首尾帧，以及项目全局人物三视图/定妆图，
  便于按 Veo 等视频模型的参考图限制选择素材，而不是只拿一段文字盲生视频。
- 抽取 `app/services/image_generation.py`，让画布和制作看板共用同一套远端图片落地逻辑。

**影响面**：`POST /api/v1/agentapp/production/projects/{pid}/generate` 新增 `shot_number`；新增
`POST /api/v1/agentapp/production/projects/{pid}/cards/{card_id}/generate-image`；卡片更新接口补充
`negative_prompts` 写入；新增 `split-storyboard`；前端单集详情页新增返工、编辑、生图、逐镜拆分、
视频参考包和版本选择操作。

---

## [2026-07-14] fix: 部署后数据全空——data/resouce bind mount + 同步脚本

**问题**：部署后员工/团队/工作流等数据全空，制作看板图片也全部 404。

**根因**：
- 所有注册表（员工/团队/工作流/工具/技能/知识库）存在 `data/` 目录的 JSON 文件里，
  但 `data/*` 在 `.gitignore` 里不入库（仅 `data/production/` 例外）。
- 素材文件在 `resouce/` 目录，同样被 `.gitignore` 排除。
- `docker-compose.prod.yml` 用 Docker named volume `app_data:/app/data`，
  首次创建后为空（git 仓库里没有这些文件），导致部署后容器无数据可读。

**修复**：
- `docker-compose.prod.yml`：
  - `app_data` named volume → `./data:/app/data` bind mount（app/admin/worker 三个服务）
  - 新增 `./resouce:/app/resouce:ro` bind mount（app/admin）
  - 删除 `app_data` volume 声明
- `scripts/sync-assets.sh`（新增）：rsync 同步 `data/` + `resouce/` 到远程服务器，
  bind mount 使容器立刻可读取，无需重启。
- `scripts/deploy-server.sh`：
  - 部署时自动 `mkdir -p data/ resouce/`，数据/素材为空时给出警告
  - `git reset --hard` 前备份 `data/production/`（防止覆盖服务器上新增的卡片数据）

**影响面**：生产部署配置变更；首次部署后需执行 `bash scripts/sync-assets.sh`
同步数据和素材到服务器。后续在服务器 UI 上创建的数据直接写入宿主机目录，持久化。

---

## [2026-07-14] feat: GC 概念宣传片项目类型 + 生产提示词 v2 重写

**动机**：制作看板的分镜/图片提示词/视频提示词质量差——分镜堆砌通用影视理论、图片提示词
用编号分段而非自然语言、视频提示词把整个 G 单元镜头列表塞进一张卡（14s/7-9 镜头），
视频模型根本无法理解。同时需要先做 GC（概念宣传片）验证视觉风格再铺正剧。

**STAGE_INSTRUCTIONS v2 重写** (`app/models/production.py`)
- `storyboard`：删除所有通用影视理论模板，每镜头只写 6 项（画面内容/角色动作-身体部位级/
  景别+运镜/光影/时长≤6s/承接），禁止不可画短语和重复影视规则。
- `img_prompt`：七要素合并为一段流畅中文（无①②③标签），附具体范例，禁止负面描述。
- `vid_prompt`：关键改动——「一张卡 = 一次提交给视频模型的完整提示词，不是整个 G 的镜头
  列表」。附完整单卡范例。致命规则：一卡一动作≤6s/不得多镜头序列/无负面词/无"快速"/
  角色描述每卡重复/G>6s 必须拆多张子段卡。

**GC 概念宣传片** (`app/models/production.py` + `app/api/production.py` + `web/src/pages/Production.tsx`)
- 新增 `GC_STAGES`（8 阶段，跳过 setting/design）、`GC_STAGE_KEYS`、`GC_STAGE_INSTRUCTIONS`。
- GC 剧本指令：挑 3-5 个最炸视觉瞬间，15-30s 总时长，末尾必须是悬念钩子。
- `generate_stage` 按 `source_type=="gc"` 动态选用 GC 阶段/指令。
- `get_project` 返回 GC 专属 8 阶段定义。
- 前端创建项目 modal 第一步新增"GC 概念宣传片"选项，选中后自动设 1 集/30s，隐藏集数/时长。

**影响面**
- API：`POST /projects` 接受 `source_type: "gc"`；`GET /projects/{pid}` 对 GC 项目返回 8 阶段。
- API：`POST /projects/{pid}/generate` 对 GC 项目使用 GC 专属指令。
- 前端：制作看板创建流程、看板阶段列渲染。
- 数据：已有项目不受影响（`source_type` 非 `"gc"` 走原 10 阶段）。

---

## [2026-07-14] docs: 文档体检大修——新增 RUNBOOK/脚本清单,修复文档与代码相反的硬伤

**动机**:四路并行审计(启动真相/脚本清单/未入档目录/README 偏差)发现:启动知识散落在
README 中段、CHANGELOG 与代码注释里,没有一页能照抄命令起服务;31 个脚本仅 7 个有文档;
多处文档说法与代码**相反**(不存在的端点、已解决却仍列为限制的条目、声称 Redis 实为内存的
docstring、必然构建失败的 Dockerfile COPY)。

**新增文档**
- `docs/RUNBOOK.md`:启动与排障手册——零配置最短路径(admin/admin123 直接登录,LLM 供应商可
  事后配)、端口坑(`python -m app.main` 起在 5311 / 鲜克隆直连 :8000 白屏)、配置双轨制键表、
  可选服务矩阵(不起 PG/Redis/DashScope 会怎样)、常见报错→解法表、data/ 27 子目录地图
  (哪些可删/哪些不可再生)、根目录文件辨析。
- `scripts/README.md`:31 个脚本清单(用途/跑法/一次性 vs 可复用/破坏性),含危险区警告
  (`_gen_cards_v3/v4.py` 会全量覆盖现有 4062 卡卡池;`merge_cards.py` 输入文件已失踪不可运行)。

**修复的文档-代码硬伤**
- `Dockerfile`:`COPY --from=web-build /web/dist/` 改为 `/wwwroot/`——vite outDir 是 `../wwwroot`,
  原写法镜像构建必失败,README 宣称的 Docker 一键启动实际不可用。
- `admin/main.py`:根路径指引里的过期前端端口 5188 → 5173。
- `app/core/rate_limit.py`:docstring 声称"USE_DB_STORES 开=Redis INCRBY 配额"与实现相反,
  改为如实描述(纯内存计数、重启归零,Redis 方案为规划项)。
- `app/services/workflow_nodes.py`:删除"OpenAI 同步调用、并行实际串行"的过期注释
  (runner.py 已用 AsyncOpenAI 真并发)。
- 根目录 `main.py`:死桩("Hello from agent!")改为指路牌,打印真实启动命令并指向 RUNBOOK。

**同步更新的既有文档**
- `README.md`:节点类型 7→11(补迭代/HTTP/代码/子工作流四行);删除不存在的
  `POST /run/approve` 与 `GET /ai-models`(改为 `/run` 携带 approvalDecision、`/agent/ai-providers`);
  API 前缀标注 pipeline 例外;production 表补 matrix/orphans/archive/search;已知限制两条改"已解决";
  内置示例改为五季 4062 卡现状;快速开始加零配置说明、5311 端口警告与 worker 启动;文档导航
  与项目结构注脚补 RUNBOOK/scripts 清单/七个未入档顶层目录。
- `WORKFLOW_ENGINE.md`:节点表 7→11 种;删除已过期的"同步调用"限制。
- `docs/ROADMAP.md`:盘点数字修正(372 卡→五季 4062 卡、118→131 测试、7→11 节点);
  §3.1 LLM 韧性改窄为"仅剩 canvas/scraper 两条旁路"(主链路重试/fallback 已在 loop.py 落地)。
- `CLAUDE.md` / `AGENTS.md`:头部加互为镜像的同步提醒;删除不存在的 `app/repositories/`;
  M2-M6 里程碑补 ✅。
- `.env.example`:REDIS_URL 补本机直连注释、补 ADMIN_PORT 键。
- `docs/MODULE_INDEX.md`:重新生成(120 后端模块 + 49 前端文件)。

**影响面**:一处容器构建修复(Dockerfile COPY)、两处代码内字符串/注释/docstring 修正,无接口、
无行为、无数据变化;其余全部为文档。ROADMAP 的 KPI"S1 成片 0/10"十集口径与卡池 24 集结构
不一致,属业务口径决策,本次未改动待老板拍板。

---

## [2026-07-13] fix: 漫剧生产提示词与分镜质量门禁整改

**动机**:实物审计发现现有分镜大量使用“一句话剧情概述”和不可绘制的模板句，场景/首帧提示词
同时堆叠暗部、裂纹、锁链、碎石、反光与粒子，导致画面高频噪点和主体失焦；视频任务存在单条
10~18 秒但质检仍判 PASS、前期角色混用后期服装、九宫格/速度线被默认使用等问题。

**变更点**
- `app/models/production.py`:重写剧本、角色场景、分镜、图片与视频阶段模板；生成时长与画幅改为
  使用项目配置；G 单元必须拆成 2~6 秒连续生成子段；分镜强制包含前中后景、画面位置、起止姿态、
  视线/运动方向和连续性；图片加入“一主体/三道具/一特效”降噪预算；图片/视频优先输出结构化 JSON。
- `app/services/production_quality.py`、`app/api/production.py`:新增确定性静态质量门禁，扫描抽象分镜、
  缺失生产字段、正向提示词中的负向措辞、高频纹理过载、视频高风险运动词和超 6 秒连续段；不合格
  草稿保留但状态改为 `review`，卡片 metadata 返回具体返工项，避免再次伪报 `done`。
- `ProductionCard`:新增独立 `negative_prompts` 字段；默认不生成负向提示词，供应商明确支持时才单独
  保存，禁止与正向 `prompts/content` 拼接。旧卡无需迁移，Pydantic 默认空列表兼容。
- `scripts/refresh_comic_profiles.py`:统一刷新编剧、角色、场景、分镜、提示词、关键帧和质检员工的职责
  与输出规范，保留已有项目知识库，并同步本地工作流提示词。分镜改为先消费角色版本与场景资产，
  关键帧按需要选择单首帧或 FLF，不再默认九宫格；质检缺少实际图/视频时必须标记“未检”。
- `app/services/seed_workflows.py`、`app/runtime/cli_pipeline.py`:新建工作流和 CLI 流水线同步采用上述规范；
  工作流依赖调整为“编剧 → 角色/场景 → 分镜 → 提示词”，避免分镜脱离资产版本并行生成。
- `web/src/pages/Production.tsx`、`web/src/pages/EpisodeDetail.tsx`:展示静态质检返工原因和独立负向
  提示词；`review` 显示为“待复核”；导出提示词包时将负向内容放入明确分隔的独立章节。
- `tests/test_production_quality.py`、`tests/test_production_generate.py`:覆盖一句话分镜、纹理过载、负向
  混入、超 6 秒视频、状态降级和项目时长/画幅注入。
- `scripts/rewrite_storyboards_v2.py`、`data/production/jiulu-s1..s5/cards.json`:将五季全部现有逐 G
  分镜升级为 V2 详细执行格式。保留原剧情、景别、运镜、光影和音效，新增主体画面位置、前中后景、
  屏幕轴线、起始姿态、逐时动作节拍、结束姿态、首末帧承接和逐镜验收；长 G 改为逐镜独立生成后
  剪辑，移除“一次生成全部可用/零丢弃”和“环境自行演进”等不可执行表述。
- `tests/test_storyboard_rewrite.py`:锁定分镜迁移后的生产字段、手部关节级动作、群像节拍、台词与手部
  错峰表演，并防止“触发”误判为手部动作、代词盖过装置主体等语义回归。

**影响面**:生产卡片新增可选响应字段 `negative_prompts`；AI 生成卡片可能从 `done` 变为 `review`，
并在 `metadata.quality_gate` 返回返工原因；无数据库迁移、环境变量或端口变化。五季 719 张历史分镜卡
已原位升级（共 5228 镜），其他历史卡片与图片不覆盖，后续重生成时应用新规范。

**验证**:`python -m pytest -q` 全量 156 项通过；`python -m compileall -q app scripts/rewrite_storyboards_v2.py scripts/refresh_comic_profiles.py`
通过；`web/npm run build` 通过（仅保留既有大 chunk 提示）；`git diff --check` 通过。

---

## [2026-07-13] feat: 桌面端生产体验闭环——真实就绪度、行动首页、建项向导与用户任务中心

**动机**:体验审计发现项目总览会把 AI 生成的文案卡直接视为 `done`，第一季显示 100%，
但全链路实际只有 1/145 个 G 单元有图、视频尚未完成；首页主要展示员工/工具数量，
无法回答“下一步做什么”；异步任务页还要求用户手工保存 Job ID。此次明确不处理移动端，
集中修复桌面端核心生产旅程。

**变更点**
- `app/api/production.py`:新增按 G 单元计算的真实生产就绪度：规格齐全 40%、出图 30%、
  视频 20%、成片交付 10%；保留 `card_status_progress` 供诊断，`overall_progress` 改为交付口径，
  并返回断链数与下一步动作。
- `app/models/production.py`、`web/src/pages/Production.tsx`:项目新增计划集数、单集时长、画幅、
  视觉风格、预算字段；新建项目改为三步向导，并用当前登录用户作为真实 owner（不再写死
  `owner/创建者`）。Pydantic 默认值保证旧 `project.json` 无需迁移。
- `web/src/pages/ProductionHub.tsx`:项目和单集进度改用真实就绪度，展示规格/图/视频/交付数量，
  不再以卡片 `done` 数制造 100% 假象。
- `web/src/pages/Dashboard.tsx`:总览重做为最近项目、下一步、阻塞、后台任务；入口按当前权限显隐。
- `app/api/tasks.py`、`web/src/pages/Tasks.tsx`:Redis 增加 30 天用户级任务索引与任务元数据；新增
  `GET /tasks`、`POST /tasks/{id}/cancel`、`POST /tasks/{id}/retry`。任务中心自动列出当前用户任务、
  每 5 秒刷新进行中状态，支持取消、失败重试和详情查看；按用户隔离任务元数据。
- `web/src/components/Layout.tsx`:导航重组为“创作 / 资产 / 自动化 / 系统”，修复 `/production`
  与 `/production/matrix` 同时高亮；导航、退出与折叠控制改为键盘可访问按钮。
- `web/src/App.tsx`:全部业务页面改为路由级懒加载；新增全局错误边界和登录校验加载反馈，
  避免渲染异常白屏和登录阶段空白。
- `tests/test_production_readiness.py`:新增 3 个就绪度回归测试，锁住“文案 done != 成片完成”。

**影响面**:用户端生产项目 API 响应中的 `stats.overall_progress` 语义变为真实交付就绪度；
新增项目字段和 4 个任务 API；前端总览、制作项目、任务中心和主导航更新。Redis 不可用时任务中心
显示可重试错误，不影响同步工作台与制作看板。无数据库表迁移，无环境变量变化，不涉及移动端布局。

**验证**:`python -m pytest -q` 全量通过；`npm run build` 通过。路由拆包后各大型页面按需加载。

---

## [2026-07-10] chore: 引入 Letta 有状态记忆运行时脚手架（尚未接线）

**动机**:为后续接入 Letta（有状态 Agent 记忆运行时，:8283）预留脚手架。本条由推送前审计补记——
该批文件由并发会话加入且当时缺文档，按仓库硬性文档同步规则补齐说明。

**变更点**（均为脚手架，**当前无任何应用代码引用**）
- `openapi_letta.json`:Letta v0.16.8 的 OpenAPI 参考规范（vendored，仅作接口对照，未被 `app/` 消费）。
- `scripts/start_letta.ps1`:本地启动 Letta 服务的脚本。
- `.env.example`:新增 `LETTA_PG_URI` 注释块（默认 SQLite 零配置；接 PostgreSQL 时启用，建议独立库名 letta）。

**影响面**:纯新增文件 + 一段样例环境变量注释,不改动任何现有接口/数据/前端,不影响运行时。
真正的 Letta 接入（后端读取 spec、调用服务）待后续单独实现并补测试与文档。

---

## [2026-07-10] fix: 蒸馏/进化每次重启都重跑全部员工 —— 今日实测 316 次，应为 22 次

**动机**:上一轮启动后端时发现日志里每次都在刷「定时触发蒸馏 × 11 / 定时触发自我进化 × 11」。
查证:`DailyScheduler._distill_done_today` / `_evolve_done_today` **只活在内存里**,
进程一重启就忘光,于是每次重启都把全部启用员工重跑一遍。
实测当天累计:**蒸馏 151 次 + 自我进化 165 次 = 316 次 LLM 调用,而应为 11 + 11 = 22 次**
(单次蒸馏 11~17 秒,约合半小时以上的无效 LLM 时间)。开发期反复重启后端会持续放大。

同时暴露一个**潜伏的失败重试循环**:`_dispatch_distill` / `_dispatch_evolve` 只在**成功**时
写入 `done_today`,失败则不写——下一次 30 秒巡检又会重新派发,即失败一次就会重试一整天。
(今天恰好 316 次全部成功,所以这个坑没被触发,但它一直在。)

**变更点**
- `app/services/distillation.py` / `app/services/evolution.py`:各新增 `last_run_at(employee_key)`,
  从**已落盘的运行日志**(`distillation_logs.json` / `run_logs.json`,两者都已有 `ranAt`,
  且**失败路径也会落盘**)推导最近一次运行时间。不新增任何状态文件——
  与趋势同步的 `is_query_fresh()` 同一套思路:让产出自己成为幂等依据。
- `app/services/scheduler.py`:
  - 新增 `_ran_on(last, today)`。日志里的 `ranAt` 是 UTC(带 `Z`),而调度器按**本地日期**
    判断"今天",必须先 `astimezone()`;用 `>=` 而非 `==` 以对付时钟回拨(宁可少跑一次,不要疯狂重跑)。
  - `_scan_distillation` / `_scan_evolution` 先查落盘日志,当天已跑过则跳过并写入内存缓存
    (免得每 30 秒重读 11 个文件)。
  - `_dispatch_*` 的 `done_today` 标记从「仅成功」改到 `finally`——**失败也算今天已尝试**,
    堵住 30 秒重试循环。需要立刻重跑走已有的手动端点
    (`POST /memory/{key}/distill`、`POST /evolution/{key}/analyze`)。
- `tests/test_scheduler_daily_idempotency.py`(新增,10 例):锁住最易回归的两处——
  UTC→本地日期换算(含跨日、时钟回拨、naive datetime),以及"失败也算跑过";
  另覆盖日志损坏时退化为"没跑过"而不是打挂整个巡检。

**影响面**:纯调度行为,无 API / 数据 / 前端变更。
行为变化:同一天内每个员工的蒸馏与进化**最多各执行一次**(此前每次进程启动都会各执行一次),
且失败当天不再自动重试。

**验证**:`pytest` 全过(exit 0),新增 10 例全绿。
实机重启后端:启动日志里 11 个员工的「定时触发蒸馏/自我进化」**全部消失**,只剩趋势同步(跳过 8 个 query);
盘上运行日志计数 **蒸馏 151→151、进化 165→165,本次重启新增 0 次**(修复前应各 +11);
持续观察 70 秒(跨 2 个 30 秒巡检周期),无任何蒸馏/进化派发、无 `chat/completions` 调用。

---

## [2026-07-10] feat: 今日要点 —— 个人化增量简报（先给结论 · 看过即永久消失）

**动机**:用户原话——「我每天都去看 100 多个我也看不过来」「你可以直接给我结论吗」
「我看了你就看了,下次报告就不要给我了,不然我每天看重复的也没意义」。
实测候选池当前 **184 条**,而现有 `/skills/analyze` 全景报告是**无状态、无画像**的:
每天把同一批数据重算一遍,既不知道你是谁,也不记得你看过什么。三个诉求一个都没满足。

**变更点**
- 新增 `app/services/trend_digest.py`,与全景报告明确分工:
  - **兴趣画像**(`data/trends/profile.json`):默认按用户真实工作预填(竖屏 AI 漫剧 + 自建 Agent 平台),
    含 `not_interested` 负向清单。泛泛的"AI 爱好者"画像过滤不掉任何东西,所以默认值必须具体。
  - **已读永久化**(`data/trends/seen.json`):标记后该条目从**候选池**里剔除,
    而不只是从当前这份简报里隐藏——重新生成、换一天、重跑 LLM 都不会再出现。带 180 天 TTL GC。
  - **先减法再送 LLM**:先剔已读、再按源配额取样,而不是每天把同样的东西喂给模型重算。
  - 提示词要求**先给结论**(这是什么、能拿来干什么),而非复述标题;并强制「宁缺毋滥,
    没有值得看的就返回空数组」,最多 6 条。
- `app/api/skills.py`:新增 `GET/POST /skills/digest`、`POST /skills/digest/read`、
  `GET/PUT /skills/digest/profile`。
- `app/services/scheduler.py`:每日同步后自动生成简报(失败不影响榜单与全景报告)。
- `web/src/pages/SkillTracker.tsx`:新增「今日要点」并设为**默认首屏**。
  卡片以结论为主标题、原标题降级为副链接;每条带相关度环形分与「已读」按钮,
  另有「全部已读」与「调整关注点」抽屉(可编辑画像三段)。空态明确告知"已读的不会再出现"。
- `web/src/api.ts`:新增 5 个简报接口。

**踩到并修掉的坑**:粗排信号直接比数字大小,GitHub 的 `79000⭐` 会碾压 HN 的 `534 points`,
截断后候选池里其他四个源**一条都不剩**,五源追踪名存实亡。
改为**按源配额**取样(GitHub 32,其余各 12),保证每个源都有机会参赛。

**影响面**:新增 5 个端点,均在 `/skills/digest` 前缀下,不改动任何既有接口。
新增运行时目录 `data/trends/`(已被 `data/` 的 gitignore 覆盖——画像与已读记录属个人数据,不进版本库)。
趋势页默认 tab 由「全景总览」改为「今日要点」。

**验证**:`pytest` exit 0;`tsc --noEmit` 零错误。
候选池实测 184 条(GitHub 124 / Hacker News 40 / arXiv 20)→ 配额取样 56 条送 LLM → 入选 6 条。
浏览器实测完整闭环:默认落在「今日要点」渲染 6 张卡、结论居首;
点某条「已读」→ 该条立即消失(6→5);刷新页面仍为 5 条;
**强制 `POST /digest?force=true` 重跑 LLM 后,`candidateCount` 由 184 降为 183,该条目未再出现**;
「全部已读」→ 卡片清零并显示空态文案。「调整关注点」抽屉正确回填 role/6 项关注/4 项不关注。
测试结束后已把 `seen.json` 重置为空(清掉 7 条测试标记)并重新生成干净简报。

---

## [2026-07-10] perf/fix: 趋势雷达体检 —— 产出无限增长、GITHUB_TOKEN 死配置、静默吞异常

**动机**:用户问"趋势雷达完善了吗,还有什么问题"。逐项实测,查出四个真问题,
其中两个是**会随时间恶化的定时炸弹**,一个是**配置写了等于没写**,一个是**故障不可见**。

**变更点**
1. **`_latest_per_query()` 每次 API 调用全量 parse 产出目录**(实测 70 份 / 3.5MB / **38ms**)。
   而 `queries` / `list` / `summary` / `repo-lookup` 四个端点各调一次,开一次页面就是 ~150ms 纯解析。
   按每天 8 份增长,一年后 ~2900 份、~1.5s/请求。
   → `app/api/skills.py` 加进程内缓存,签名 =(文件数, 最新 mtime_ns),只 stat 不读内容;
   同步写入新文件后签名自然变化,缓存自动失效。实测 **38ms → 2.9ms(13×)**,增删均能正确失效。
2. **产出目录无保留策略**。→ 新增 `skill_tracker/retention.py`:每个 query 只留最近 5 份
   `skills_*.json`,同步成功后由调度器调用。
   ⚠️ **`output/snapshots/` 永不清理** —— star 走势历史只存在于快照,GitHub 不提供历史 star 数,
   删掉不可再生。dry-run 实测:删 30 份、释放 1.01MB、每个 query 的最新一份均在保留集内、快照零触碰。
3. **`GITHUB_TOKEN` 写进 `.env` 完全不生效**(静默陷阱)。全仓无 `load_dotenv`,
   pydantic-settings 只把 `.env` 读进对象、不写 `os.environ`,而 `skill_tracker.GitHubClient`
   走 `os.getenv("GITHUB_TOKEN")`。实测当前为**匿名调用,限流 10 次/分钟**,
   而一次全量同步要打 **16 次** search(8 query × 2)——全靠 403 后 sleep 硬扛。
   → `app/core/settings.py` 新增 `github_token` 字段 + `export_to_env()` 回灌 `os.environ`,
   且**不覆盖真实环境变量**(真实 env 优先)。`.env.example` / README 补文档。
4. **前端静默吞异常**:四个源 tab 的 `catch { /* ok */ }` 让"拉取失败"和"真的没数据"
   在界面上长得一模一样(都只显示"暂无数据")——与之前 `<img onError → display:none>`
   把全站图片 401 藏了很久是同一个病。
   → `SkillTracker.tsx` 抽出 `fetchSource()`,失败时把原因写进 `data.error` 并渲染出来 + 「重试」按钮。
5. **AI 报告过期无提示**:自动同步若哪天悄悄失败,报告会无声停在旧日期(正是最初"10 天没更新"那个病)。
   → 报告元信息行在 `generatedAt` 超过 2 天时显示黄色 Tag「已 N 天未更新 · 自动同步可能失败了」。

**影响面**:无 API 契约变更。新增环境变量 `GITHUB_TOKEN`(可选,留空=匿名,行为同今天)。
新增运行时行为:同步成功后清理旧 `skills_*.json`。前端四个源 tab 的失败态由「暂无数据」改为「错误原因 + 重试」。

**验证**:`pytest` exit 0;`tsc --noEmit` 零错误。
缓存:冷 39.1ms → 命中 2.89ms,写入/删除文件后均自动失效。
Token:未配置时不污染 `os.environ`;配置后 `GitHubClient` 变为已认证;真实 env 不被 `.env` 覆盖。
浏览器实测:拦截 HN 请求模拟 `ECONNRESET` → 界面显示「Hacker News 拉取失败:ECONNRESET…」+ 重试按钮
(不再伪装成"暂无数据");点重试恢复出 15 行数据、错误态消失。
把 `analysis_cache.json` 的 `generatedAt` 临时改到 10 天前 → 出现「已 10 天未更新」黄标;
还原后(与备份逐字节一致)警示消失、元信息行显示「生成于 2026-07-10 11:47」。

---

## [2026-07-10] fix: antd 静态 message 主题告警根治 + wwwroot 构建产物更新到最新

**动机**:体检第三轮。①antd v5 静态 `message.xxx()` 拿不到 ConfigProvider 上下文,
**每次调用都在控制台刷一条 error 级告警**(29 个文件在用),污染所有调试;
②`wwwroot/` 构建产物停在当天 12:54,此后一整天的前端修复(缩略图/矩阵页/导出/复制)
从 `:8000` 直连全都看不到。

**变更点**
- `web/src/ui.tsx`(新增):message 上下文桥——`<AntdApp>` + `<AntdMessageBridge/>`
  把带上下文的实例灌进模块级 Proxy,业务代码只改 import 源、调用方式不变,
  桥未挂载时兜底回静态实现。`main.tsx` 挂 `<AntdApp component={false}>`。
- 脚本批量改写 29 个文件:`import { message } from 'antd'` → `from '<rel>/ui'`,
  只动 import 行;残留静态导入 0,tsc 全仓零错误。
- `npm run build` 重建 `wwwroot/`(index.html 已带 no-cache,浏览器自动拿新 bundle)。
- `README.md`:制作看板一节补齐缩略图 `?w=`、全链路对照页、孤儿卡归档、提示词批量导出。

**影响面**:纯前端;message 行为不变但开始跟随主题。
验证:登录页空表单触发 message 弹出正常,console **零错误**(修复前每条 message 一条 error);
新 bundle 从 `:8000` 返回 200 且 index.html 引用与磁盘一致。

---

## [2026-07-10] fix: 卡片上传"写 data/ 读 resouce/"目录错位——上传成功但图必 404

**动机**:体检第二轮发现的地雷。`upload_card_file` 把文件写进
`data/production/<pid>/uploads/`,返回的 URL 却是
`/production/resource/production/<pid>/uploads/...`——而 `serve_resource`
只从 `resouce/` 读。**只要上传一张图,GET 必 404**,配合前端曾经的
`display:none` onError,又是一个静默故障。目前盘上无存量上传文件、
卡片无此类 URL 引用,说明上传链路(叠加此前的 401 丢头问题)从未成功用过——
两个 bug 互相掩护,修掉一个才暴露另一个。

**变更点**
- `app/api/production.py` `serve_resource`:`resouce/` 下找不到且路径以
  `production/` 开头时,回退到 `DATA_DIR` 下读(剥前缀直拼,不依赖目录名),
  路径穿越防护按各自根目录分别校验。写路径与 URL 均不动,存量兼容。
- `app/services/knowledge.py` `_emp_dir`:employee_key 拦 `/` `\\` `..`,
  防目录穿越写文件(端点层已有 `_validate_key`,此为服务层纵深防御)。
- 新增 `tests/test_production_upload_serving.py` 三条回归:
  ①上传后按返回 URL GET 必须 200 且字节一致;②媒体 GET 免鉴权(<img> 场景);
  ③路径穿越用 %2e%2e 编码形式打服务端(裸 ../ 会被 httpx 在客户端折叠,测不到防护)。

**影响面**:上传→回显链路首次真正可用。测试 133 → 136 全过。

---

## [2026-07-10] fix/feat: 系统体检批量修——上传丢鉴权头、提示词无法复制、整集提示词导出

**动机**:全面体检发现三类问题:(A)三个文件上传接口没带 Authorization,鉴权开着必 401;
(B)提示词正文都存在卡片 `content` 字段,而复制按钮只认 `prompts` 数组——全库 1870 张卡
里 prompts 非空的仅 5 张,即 img_prompt/vid_prompt 卡上**根本不显示复制按钮**,
只能手动划选;且没有按集批量导出,798 张卡逐张复制不现实;(C)若干样式/缓存小problems。

**变更点**
- `web/src/api.ts`:新增 `authHeaders()`,补齐 `uploadKnowledge` / `uploadFile`(工作台附件)/
  `uploadCardFile`(制作卡片图/视频,**用户回传生图的主通道**)三处裸 fetch 的 Bearer 头
  (canvas 上传原本就带,其余三处为漏改)。
- `web/src/pages/Production.tsx`:看板卡面复制按钮回退 `content`——prompts 为空时复制正文。
  实测 EP01 视图从 0 个复制按钮变为 21 个(首帧 11 + 视频 10)。
- `web/src/pages/EpisodeDetail.tsx`:①单元抽屉每张卡标题旁新增内容复制按钮;
  ②顶栏新增「导出提示词」——整集级头部卡 + G1..Gn 的首帧/末帧/视频提示词按生成顺序
  拼成 markdown,一键下载并复制(EP01 实测 21 个条目 / ~14.7K 字),服务
  "从平台成批拿提示词去小云雀/即梦生成"的真实工作流。
- `app/api/production.py`:素材原图响应加 `Cache-Control: max-age=3600`
  (抽屉/预览不再每次重拉 MB 级原图;缩略图仍 immutable)。
- `web/src/components/Layout.tsx`:「提示词采集」图标改 ⚡,不再与「文章学习」重复。
- `web/src/pages/ProductionMatrix.tsx`:表格高度随视口(原固定 520px 大屏浪费/小屏溢出)。

**影响面**:无接口签名变化。上传三处从"鉴权开启即 401"恢复可用。
**已知未修**(记录在案):antd 静态 `message` 主题告警(23 个文件调用,需引入 App 上下文,
改动面大收益小,暂缓);`user_auth.py` `/me` 为占位接口(前端未使用)。

**验证**:tsc 全仓零错误;原图响应头 `max-age=3600`、缩略图 `immutable` 实测生效;
EpisodeDetail 导出按钮实点出 toast 且下载触发;单元抽屉复制按钮 3 个/tab;
看板 EP01 卡面复制按钮 0 → 21。

---

## [2026-07-10] feat: 全链路对照页 —— 季 × 集 × G 生成单元 一屏铺开，断链/无图一眼可见

**动机**:用户"看麻了"——制作看板按阶段竖切成 10 列,同一个 G 生成单元的
剧本 / 分镜 / 首帧提示词 / 视频提示词 散在四列里,无法回答"这一集哪些单元还没图"
"哪个单元断链了"。实际数据是干净的:`shot_number` 就是 G 单元号(`0` = 整集级卡),
四个阶段靠 `(project, episode, shot_number)` 天然可 join,只是从没有横向对齐的视图。

**变更点**
- `app/api/production.py`:新增 `GET /production/matrix`。跨全部项目返回
  「季 → 集 → G 单元」对照表,每个单元一行,聚合它在 script / storyboard /
  img_prompt / vid_prompt 四个 spec 阶段的卡片数与已产出的图/视频数。
  只回统计量不回卡片正文——三季 2000+ 张卡压成 ~360 行(86.7KB / 218ms)。
  首帧与末帧锁(FLF)同属 img_prompt 阶段,靠标题「末帧」区分并分列;
  **`missing` 按排除末帧锁后的首帧张数判断**,否则只有一张孤儿末帧锁的单元会被误判为齐全。
- `web/src/pages/ProductionMatrix.tsx`(新增):虚拟滚动表格,行 = G 单元,
  列 = 剧本/分镜/首帧提示词/末帧锁/视频提示词/图/视频。必需环节缺失显示红 ✗ 并提示"链路断在这里";
  顶部按季切换 + 「只看断链」「只看没图」筛选 + 出图进度条;点行下钻到单集详情。
- `web/src/api.ts`:新增 `getMatrix()` 与 `MatrixProject` / `MatrixRow` 类型。
- `web/src/App.tsx`:新增路由 `/production/matrix`,**必须排在 `/production/:pid` 之前**,
  否则 `matrix` 会被当作 pid 匹配掉。`components/Layout.tsx` 增加「全链路对照」导航项。

**影响面**:新增一个只读端点与一个前端页面,不改动任何既有接口/数据/字段。

**验证**:端点实测 361 行 / 86.7KB / 218ms;页面虚拟滚动仅渲染视口内 15 行(DOM 643 节点);
「只看断链」筛出 2 行;`tsc --noEmit` 全仓零错误。

**这份数据暴露出来的真相**(未改动数据,仅呈现):
- 三季 361 个 G 生成单元里 **359 个四阶段齐全,0 个有成图、0 个有成片**——全部停在 spec 阶段。
- `jiulu-s1` EP16 / EP17 各有一张孤儿 `G6末帧锁(FLF)` 卡挂在 `shot_number=6` 上,
  而这两集实际只有 G1–G5,其余四个阶段全空。疑似编号错位或 G6 从未写完,待作者确认。

---

## [2026-07-10] feat: 孤儿卡归档区 —— 一卡一文件、永不删除、随时可恢复

**动机**:上一条对照页照出两张孤儿卡(挂在不存在的 G 单元上、四个 spec 阶段全空)。
它们有真实内容(末帧锁提示词全文),删了可惜,留着又永远在"断链"里刷屏。
用户明确要求:「孤儿可以有个归档文件夹,里面放好,不要删了」。

**孤儿卡的定义**:某个 `shot_number > 0` 的 G 单元,其 script / storyboard /
首帧 img_prompt / vid_prompt **四个 spec 阶段全为空**,则该单元实际不存在,
挂在它上面的卡片即为孤儿。判断首帧张数时必须排除末帧锁(FLF)——两者同属
`img_prompt` 阶段,只能靠标题「末帧」区分。

**变更点**
- `app/api/production.py`:抽出 `_first_frame_count` / `_unit_missing_stages` / `_orphan_cards`
  三个 helper(矩阵端点与孤儿识别共用,消除重复判定逻辑);矩阵行新增 `orphan` 字段。
  新增四个端点:
  - `GET /production/orphans` —— 跨项目列出孤儿卡,附该集实际存在的 G 单元号,
    便于判断是编号错位还是该单元从未写完。
  - `POST /production/projects/{pid}/archive` —— 把卡片从 `cards.json` 移入
    `data/production/<pid>/archive/<card_id>.json`,一卡一文件、肉眼可读,
    附 `archived_at` / `archive_reason`。**幂等**:重复归档同一张不报错。
  - `GET /production/projects/{pid}/archive` —— 列出归档区(按归档时间倒序)。
  - `POST /production/projects/{pid}/archive/{card_id}/restore` —— 移回 `cards.json` 并删除归档文件;
    卡片已存在则只清理归档文件,不产生重复卡。
- `web/src/pages/ProductionMatrix.tsx`:孤儿存在时顶部显示告警条 →「查看并归档」弹窗
  (先看清每张卡的内容、所在集、该集实际单元号,再 Popconfirm 确认,**绝不静默移动**);
  工具栏新增带计数徽标的「归档区」抽屉,可逐张「恢复」。
- `web/src/api.ts`:新增 `listOrphans` / `archiveCards` / `listArchive` / `restoreCard`
  与 `OrphanCard` / `ArchivedCard` 类型。

**影响面**:新增运行时目录 `data/production/<pid>/archive/`(已被 `data/` 的 gitignore 覆盖)。
归档会触发 `_save_cards` 整体重写 `cards.json`——这是仓库既有行为,
会给缺省字段的旧卡补上模型默认值(本次为 781 张补 `assignee: ""`),**不删键、不改值**。

**验证**(在真实数据 `jiulu-s1` 上,操作前已备份):
往返测试 归档 → 矩阵断链归零 → 恢复 → 孤儿重现 → 再归档 → 重复归档幂等,全部通过。
UI 全流程实测:告警条「发现 2 张孤儿卡」→ 弹窗列出两张(标注"该集实际只有 G1–G5")→
归档 → 告警条消失、归档区徽标 2 → 抽屉里「恢复」一张 → 告警条变「发现 1 张」→ 再归档。
一致性:原始 798 张 = `cards.json` 796 + `archive/` 2,**零丢失**;
归档文件逐字段等于原卡。`tsc --noEmit` 全仓零错误。

**待作者决定**:两张 `G6末帧锁` 现暂存归档区。若本意是 G5 的末帧锁写错编号,
可恢复后把 `shot_number` 改成 5;若 EP16/EP17 本该有 G6,则需补齐该单元其余四个阶段。

---

## [2026-07-10] feat: 趋势雷达自动同步 + 处处可点详情（同步幂等 · index.html 禁缓存）

**动机**:用户要「AI 分析 + 自动同步 + 点得进详情」,实测三项全有缺口:
1. **AI 报告 10 天没更新** —— `analysis_cache.json` 停在 `2026-06-29`。`daily_run.py` 只拉榜单、
   完全不碰报告,而 `POST /analyze` 又有「同一天复用缓存」逻辑,于是除非手点「重新生成」,报告永不刷新。
2. **自动同步半残** —— Windows 计划任务 `SkillTrackerDaily` 确实在跑(今天 03:00 result=0),
   但 `DEFAULT_QUERIES` 只有 5 个,而前端 `QUERY_LABELS` 有 8 个。
   `agent skill` / `claude skill` / `skill` 三个 tab 的快照自 06-29 起就断更了,UI 上完全看不出来。
3. **详情只有「项目榜单」有** —— HN / arXiv / 新闻 / Reddit 四个 tab 与 AI 报告里的条目全无详情入口。

**变更点**
- `app/core/settings.py`:新增 `TRENDS_AUTO_SYNC`(默认 **开**)与 `TRENDS_SYNC_TIME`(默认 `02:00`)。
  趋势页的价值全靠数据新鲜度,默认关等于交付一份过期快照,故此处不沿用「新开关默认关」的惯例。
- `skill_tracker/daily_run.py`:`DEFAULT_QUERIES` 补齐到 8 个,与前端 `QUERY_LABELS` 一一对应,
  并声明为趋势 query 的**唯一事实来源**(后端调度器从这里导入)。
- `app/services/scheduler.py`:新增趋势同步任务(边沿触发 + 当天去重,与蒸馏/进化同一套语义)。
  到点后逐个 query 刷新(单个失败不中断),只要有一个成功就 `generate_analysis(force=True)` 重算报告;
  全部失败则不标记当天完成,留给下轮巡检重试。
- `app/api/skills.py`:把分析报告逻辑从路由里抽出为 `generate_analysis(force=False)`,只抛普通异常、
  由路由层翻译成 HTTP 码,这样调度器可直接复用;`force=True` 绕过「同一天复用缓存」。
  新增 `GET /skills/repo-lookup?fullName=` —— 跨全部 query 查仓库记录 + star 走势
  (AI 报告是跨领域汇总的,它提到的仓库未必落在当前选中的 query 里,不能复用 `/list` 的结果);
  查不到返回 `data=null`,前端据此降级为纯外链。
- `web/src/pages/SkillTracker.tsx`:`RepoLink` 左键改为打开详情抽屉,Ctrl/⌘/Shift+点击仍走 GitHub 新标签页;
  抽屉新增「所属领域」并支持 loading / 未收录两种空态。`SourcePanel` 新增 `renderDetail` + `linkOf`,
  四个源 tab 统一获得「详情」列 + 整行点击 → 抽屉(点行内 `<a>` 不触发,避免和外链打架)。
- `web/src/api.ts`:新增 `lookupRepo()`。

**把两个「手工活」消灭在代码里**(否则等于把运维负担转嫁给用户):
- **同步幂等** —— `app/api/skills.py` 新增 `is_query_fresh(query)`;调度器与 `daily_run.py` 两个入口
  都先判当天是否已有产出,有则跳过(`daily_run` 加 `-f/--force` 可强制)。这样后端调度器与
  Windows 计划任务 `SkillTrackerDaily` **并存也不会重复打 GitHub**,不再需要人工去关掉其中一个。
  (改动前实测当天 `skills_*.json` 出现 13 份 = 计划任务 5 + 调度器 8,即白拉一遍。)
- **`index.html` 禁缓存** —— `app/main.py` 的 SPA 兜底对 `index.html` 下发
  `Cache-Control: no-cache, must-revalidate`。`index.html` 引用的是内容 hash 化的 bundle,
  一旦被浏览器缓存就会一直去取旧 hash;而重新 build 后旧 bundle 已被 `emptyOutDir` 删除,
  于是 `/assets` 404、页面白屏,用户只能 `Ctrl+Shift+R` 自救(本仓库当天已实际踩中一次)。
  hash 化的 `assets/` 仍由 StaticFiles 带 ETag 返回,可长期缓存。**前端发版后不再需要硬刷新。**

**影响面**:新增 `GET /api/v1/agentapp/skills/repo-lookup` 一个只读端点;
`POST /skills/analyze` 行为不变(仍复用当天缓存)。新增两个环境变量,`.env.example` / README 已同步。
`/` 与所有前端路由的响应头新增 `Cache-Control`;`daily_run.py` 默认行为由「无条件重拉」改为「当天幂等」。

**验证**:后端热重载后调度器实拉成功——8 个 query 全部产出当天快照(含此前断更的 3 个),
`analysis_cache.json` 由 `2026-06-29` 刷新为当天;123 个测试全过。
浏览器实测:报告里点 `DietrichGebert/ponytail` 打开抽屉,跨 query 正确识别为「AI 智能体」领域,
展示 79k Stars / 4.3k Forks / 近期 +321 / Topics / star 走势图,且不跳转离开 `/trends`;
HN 行点击弹出详情(作者/热度/评论/HN 讨论/原文链接)且「打开原文」为 `target=_blank` 外链;
`repo-lookup` 查不存在的仓库返回 `null`。
幂等:`python -m skill_tracker.daily_run` 空转——跳过 8 个、0 次 GitHub 调用、exit 0。
缓存:`GET /trends` 响应头含 `Cache-Control: must-revalidate, no-cache`,`/assets/index-*.js` 带 ETag。

---

## [2026-07-10] fix: 制作看板图片全部渲染不出来 —— 素材路由挂在鉴权 API 下，<img> 带不了 token

**动机**:用户反馈"图片都没有地方渲染出来,我用其他生图的图片都没渲染"。
根因:卡片里存的图片 URL 是 `/api/v1/agentapp/production/resource/...`,落在 `/api/*` 下,
而 `UserAuthMiddleware` 只豁免 `/api/v1/agentapp/auth/`,其余 `/api/*` 一律要求
`Authorization: Bearer`。但浏览器的 `<img src>` / `<video src>` **永远不会带这个头**,
于是每张图都吃 401。更隐蔽的是 `Production.tsx` 的 `onError` 把失败的图
`display='none'` 静默隐藏,连破图图标都不显示,导致该 bug 长期不可见。
`POST /projects/{pid}/cards/{id}/upload` 返回的 URL(production.py:612)也拼成这条
gated 路由,所以用户手动上传的外部生图同样 401——与 `/uploads` 免鉴权静态挂载的
Workbench 附件、画布图片形成割裂(那两条一直是好的)。

**变更点**(`app/core/auth.py`)
- 新增 `_READ_EXEMPT_PREFIXES`,对 `GET/HEAD /api/v1/agentapp/production/resource/`
  豁免鉴权,供 `<img>/<video>` 直连;与 `app/main.py` 已有的 `/uploads` 免鉴权
  StaticFiles 挂载保持一致的做法。
- 写操作(上传)不受影响,仍需 `production:manage`;`serve_resource` 自带路径穿越防护。

**影响面**:`resouce/` 目录下的素材文件对未登录请求可读(局域网内)——这是本次
有意的取舍,换取 6 个媒体渲染点(看板缩略图/详情大图/视频、单集详情、画布节点)一次修好,
前端零改动。其余所有 `/api/*` 读写端点鉴权不变。
验证:24 张图片裸 GET 全部 200 + PNG(此前 24/24 全 401);
`POST .../upload` 与 `GET /production/projects` 无 token 仍返回 401;
浏览器 `new Image()` 加载成功(1536×1024, 357ms)。

**已知遗留**:已由下一条「素材缩略图」修复。

---

## [2026-07-10] perf: 素材缩略图 + 懒加载 + 破图可见 —— 看板图片流量降 99.9%

**动机**:上一条修复让图片终于能显示,随之暴露真正的代价——卡片缩略图只有 44×44,
拉的却是 1.5~3.8MB 的原图,24 张合计 **65.3MB**。同时 `onError` 里的 `display='none'`
把加载失败的图静默隐藏,正是它让"全站图片 401"这种级别的故障长期不可见。

**变更点**
- `app/api/production.py`:`serve_resource` 新增可选 `?w=64|128|256|512`,返回等比缩放的
  WebP;磁盘缓存在 `data/thumb-cache/<w>/<sha1>.webp`,缓存键含源文件 mtime(源图替换即失效),
  先写临时文件再原子改名(并发安全)。宽度白名单挡住 `?w=` 任意取值撑爆缓存;
  宽度非法/格式不支持/原图本就更窄/Pillow 缺失时**一律 fail-open 回退原图**。
  缩略图响应带 `Cache-Control: immutable`。
- `web/src/media.ts`(新增):`thumbUrl(url, w)` 只对素材路由拼 `?w=`,外链与 `/uploads/`
  原样返回;`onImageError()` 用灰底占位 + `title="图片加载失败"` 取代 `display='none'`。
- 接入 4 处:`Production.tsx` 卡片缩略图(w=128,`loading="lazy"`)与详情抽屉大图
  (w=512,`preview={{src:原图}}` 点开才拉原图);`EpisodeDetail.tsx` 两处同理(w=128 / w=256);
  `components/canvas/CanvasNodes.tsx` 图片节点(w=512)。
- `requirements.txt`:新增 `Pillow>=11.0.0`。

**影响面**:`GET /production/resource/{path}` 新增可选查询参数 `?w=`,不传时行为完全不变(返回原图),
向后兼容,存量卡片 URL 无需迁移。新增运行时目录 `data/thumb-cache/`(已被 `data/` 的 gitignore 覆盖)。
验证:单张 2.40MB PNG → `?w=128` 2.7KB(128×85 WebP)、`?w=256` 7.5KB、`?w=512` 24.5KB;
`?w=999` 正确回退原图 2.40MB;**24 张合计 65.3MB → 0.1MB(降 99.9%)**;
缓存命中 16~29ms;浏览器 `<img>` 实测 `?w=128` 得到 128×85。
`tsc --noEmit` 全仓零错误。

---

## [2026-07-10] fix: AI 趋势报告里的仓库名可点击 + 修复 wwwroot 构建产物错位

**动机**:用户反馈 AI 趋势雷达「AI 分析报告」页"点不动"。排查后是两个独立问题:
(1) 报告里的仓库名用 `COLORS.iris` 染成蓝色、看着像超链接,但实际渲染成
`<Text>` / `<Tag>` 纯文本,没有 `href`——点了当然没反应;而同页「项目榜单」
「Hacker News」「arXiv」等 tab 的仓库/文章名都是真链接,只有报告 tab 不一致。
(2) `wwwroot/index.html` 引用的 `assets/index-Cn0bRRc8.js` 在磁盘上不存在
(实际只有 `index-sWZwkiHE.js`),疑似两次并发 `vite build` 竞争 `emptyOutDir` 所致。
后端 `/assets` 是独立 `StaticFiles` 挂载,不会走 SPA 兜底,该请求直接 404,
**导致 `:8000` 冷加载出白屏**(用户当时看到的是浏览器缓存里的旧 bundle)。

**变更点**
- `web/src/pages/SkillTracker.tsx`:新增 `RepoLink` 组件,把仓库名统一渲染为
  指向 `https://github.com/<owner>/<repo>` 的链接;仅当名字匹配 `owner/repo`
  形态时才生成链接,否则退化为纯文本,避免 LLM 返回非仓库名时跳到无效页面。
  应用于「热门技术方向」的 `representative_repos` 标签与「崛起中的新星」的 `repo_name`。
- 重新执行 `npm run build`(输出到 `../wwwroot`),清掉孤儿 bundle,使
  `index.html` 与 `assets/` 重新自洽。

**影响面**:纯前端展示层改动,无 API / 表 / 配置变更。
`wwwroot/assets/` 为构建产物(gitignore),仅 `wwwroot/index.html` 的 script hash 变化。
验证:`/trends` 报告页 12 个仓库名全部渲染为 `<a href="https://github.com/...">`;
`/assets/index-BfBeuJES.js` 返回 200,旧的 `index-Cn0bRRc8.js` 返回 404(佐证修复前确为白屏)。

---

## [2026-07-09] fix: 制作数据粒度从“镜头号”纠正为 G 生成单元

**动机**:复查真实制作包后确认,现有数据不是「一张卡=一个镜头」,而是
「一集 → G 生成单元(约 8~15s) → 单元内 0.5~2s 剪辑段」。原层级页把
`shot_number=1..8` 显示成 S01..S08 镜头,制作看板单集列又用项目全局统计,
导致剧本、分镜、提示词和看板进度的理解全部偏一层。

**变更点**
- `app/models/production.py`:把 `STAGE_INSTRUCTIONS` 从「15~20 beat / 4~6s 生成单元」
  改为当前制作包实际规格:90s 成片、6~8 个 G 生成单元、G 内 0.5~2s 剪辑段;
  `ProductionCard` docstring 明确 `shot_number` 是历史兼容字段,业务语义为 G 单元号,
  `0` 表示一集级总表/头部/质检。
- `app/api/production.py`:AI 生成落卡先尝试解析结构化 JSON,失败再按 `---` 分段;
  自动识别标题/metadata 里的 `G1/G2`,写入 `metadata.unit_number/time_range/production_grain`;
  `镜头拆分表/全局头部/质检报告/视觉母题/单元衔接` 自动落为 `shot_number=0` 的概览卡。
- `web/src/pages/EpisodeDetail.tsx`:单集详情从 S 镜头改为 G 生成单元,抽屉标题/概览统计/空态全部跟随新语义。
- `web/src/pages/Production.tsx`:具体集/全局资产视图始终展示完整 10 阶段列;阶段进度按当前视图卡片计算,
  不再把项目全局统计套到单集列头;卡片详情和编辑表单改称 G 生成单元号。
- `web/src/pages/ProductionHub.tsx`:剧集卡的数量指标从「镜头」改为「G单元」。
- `tests/test_production_generate.py`:新增 G 单元元数据解析回归测试;保留旧式「镜头01」回复的顺延编号兼容测试。

**影响面**:`POST /api/v1/agentapp/production/projects/{pid}/generate` 的响应卡片会新增
`metadata.target_stage/production_grain/unit_number/time_range` 等字段;`shot_number` 字段名保持不变以兼容旧数据和前端,
但 UI 与文档统一按 G 生成单元解释。旧卡片无需迁移。

---

## [2026-07-09] fix: 制作看板「全部」视图平铺上千卡片卡死 —— 默认聚焦当集 + 概览封顶

**动机**:项目卡片规模涨到近 800 张(jiulu-s1 798 / jiulu-s2 768,已含 EP01-24),
而 `Production.tsx` 的看板默认 `activeEpisode='all'`,会把**全部卡片跨 10 个阶段列一次性平铺**——
每张卡还带一个 antd `Paragraph ellipsis`(逐张 DOM 测量截断),~800 张同步挂载直接把主线程铺死,
用户反馈「制作看板加载不出来」。

**变更点**(均在 `web/src/pages/Production.tsx`)
- 切换项目时,大项目(>150 卡)默认落到第一集(无集则全局资产),避免开屏就渲染全部;
  用 `initedViewPid` ref 记住已初始化的项目,生成/编辑后 `loadProject` 重跑不会重置用户手选的集数。
- 「全部」概览每个阶段列封顶 24 张(`ALL_VIEW_CAP`),超出用「仅显示前 24 张 · 还有 N 张,切到具体集查看」
  提示条代替(点击跳第一集),其余集视图不受影响、仍全量显示。

**影响面**:仅前端制作看板 `/production` 渲染路径,不涉接口/数据/字段。
实测 jiulu-s1(798 卡):开屏默认 EP01 渲染 41 张(原 798),主线程 15ms 秒开;
手点「全部」渲染 157 张(9 列封顶,原 798),主线程 5ms 流畅。

---

## [2026-07-07] fix: 恢复知识库 RAG 检索链路(retrieve_knowledge 缺失 + compile 签名缺参)

**动机**:所有带知识库的员工调 `/agent/run` 直接 500——`invocation.py` 在导入
`vector_store` 里不存在的 `retrieve_knowledge`;补上后又暴露 `compile()` 签名没有
`kb_snippets` 参数抛 TypeError;且更早之前 `prompt.py` 函数体引用未定义的
`kb_snippets` 的 NameError 一直被 try/except 吞掉——即 RAG 注入实际静默失效已久。
均为"向量优先预检索"半成品重构留下的断链,由运行剧本医生员工时发现。

**变更点**
- `app/services/vector_store.py`:新增模块级 `retrieve_knowledge()`——语义检索
  (需 USE_DB_STORES + DashScope)优先,失败或无结果兜底关键词检索,fail-open 绝不抛出。
- `app/runtime/prompt.py`:`compile()` 签名补 `kb_snippets` 可选参数(调用方预检索
  片段),不传时保持函数内关键词兜底,行为向后兼容。

**影响面**:`/agent/run`(带知识库员工从 500 恢复且知识注入生效)、
`/registry/employees/{key}/knowledge/search`(从 500 恢复)、工作流智能体节点同链路。
测试 122 全过(此前 `test_vector_store` 的"存量失败"即此 bug 的信号)。

---

## [2026-07-07] feat: 生成模板对齐高节奏竖屏漫剧方法论(逐 beat 剧本 / 七要素 / 八层结构)

**动机**:剧本→提示词→图→视频逐级劣化,根因之一是 `STAGE_INSTRUCTIONS` 的剧本模板
还是传统分场大纲格式,与实际采用的爆款方法论(1-2 秒一刀、一集 15-20 beat、
嘴替台词、情绪过山车)不匹配——AI 按旧模板永远产不出能拍的剧本。

**变更点**(`app/models/production.py` STAGE_INSTRUCTIONS,看板逐阶段生成与画布派生共用):
- `script`:分场大纲 → **逐 beat 拍摄单**。硬性要求:前 3 秒钩子、15-20 beat/集
  (每 beat 1-2s,情绪锚点可 hold 2-3s)、至少 1 反转、至少 1 句嘴替台词、结尾悬念;
  每 beat 含秒数区间/画面/台词(≤10字)/情绪值/音效。
- `storyboard`:新增**生成单元(4-6s)与剪辑 beat(1-2s)分离**,镜头标注覆盖哪些 beat
  与目标可用秒;景别按情绪选择;运镜每镜一个、中英双写。
- `img_prompt`:泛要求 → **七要素顺序组装** + 逐条检查清单(角色 DNA 固定词完整重复、
  9:16、只用正向词、禁「快速/fast」)。
- `vid_prompt`:简则 → **Seedance 2.0 八层结构** + 六条致命规则 + 每条标注
  生成时长与目标剪辑 beat。
- `setting` / `design` 模板不变。

**影响面**:看板「AI 生成」与画布「AI 派生」在 script/storyboard/img_prompt/vid_prompt
四个阶段的输出格式与质量标准变化;无 API/存储变更。

---

## [2026-07-07] feat: 看板 AI 生成改为按集 + 追加/替换,收起两处漫剧演示孤岛

**动机**:①看板「AI 生成」原逻辑是**整阶段替换且不分集数**——对 EP01-10 混存的
项目误点一次,十个集该阶段的卡片全部被删重建,等于不可用;②CLI 流水线页和
13 节点漫剧演示工作流的产物都不进看板,是两座只添乱的功能孤岛。

**变更点**
- `app/api/production.py` `POST /projects/{pid}/generate`:请求体新增
  `episode`(None=全局资产)和 `mode`(append 默认/replace)。按集生成时上下文
  只取本集卡片+全局资产;append 只追加(镜头号接在本范围已有最大号之后),
  replace 只删除**同阶段同集数**的旧卡片,其他集绝不触碰;新卡片落到指定集。
  响应新增 `replaced`/`mode`/`episode` 字段。
- 前端 `Production.tsx` 生成弹窗:新增集数输入(默认跟随当前集数 Tab)与
  追加/替换单选(默认追加),替换时显示删除范围警告;`api.ts` 同步类型。
- 收孤岛:`Layout.tsx`/`App.tsx` 移除「CLI 流水线」导航与路由(页面文件与
  后端 `/api/v1/pipeline` 保留,可随时挂回);漫剧演示工作流改为
  `SEED_DEMO_WORKFLOWS=true` 才种入(`app/core/settings.py` 新增开关,默认关,
  `main.py` 启动逻辑加闸),已种入的数据文件不动,可在工作流页面手动删。

**影响面**:`/production/generate` API(向后兼容:不传新字段时上下文行为不变,
但落卡从"替换"改为"追加"——这是有意的安全默认);前端导航少一项;新部署
默认无演示工作流。`.env.example`/README 已同步。

---

## [2026-07-06] docs: 年度路线图 ROADMAP.md(2026-07 ~ 2027-06)

**动机**:平台底座完工后进入"生产优先"阶段,需要一份进版本库的作战地图,
把目标/已完成/优化项/待建设/欠账/机会/不做清单固化,团队与 AI 会话共同对齐。

**变更点**:新增 `docs/ROADMAP.md`——北极星(单集成片周期)、KPI 季度表、
四季度主题计划(Q3 打样闭环 / Q4 成片发布团队化 / Q1 提速迭代 / Q2 规模与商业化决策)、
8 项优化(含验收标准)、8 项欠账、8 项触发式机会、负面清单、复盘机制。
README 文档导航挂链。

**影响面**:纯文档。每月对表更新,每集复盘追加到文末记录区。

---

## [2026-07-06] chore: 开源基线——AGPL-3.0 许可证 + 英文 README

**动机**:仓库自称 open-source 但底部写"私有项目仅供内部使用"且无 LICENSE 文件
(GitHub 显示 license: null),路人不敢用更不会 star;星的大头在国际社区但只有中文 README。

**变更点**
- 新增 `LICENSE`:AGPL-3.0 官方全文——个人/自部署/二开自由,SaaS 化需同协议开源,保留商业闭源授权空间。
- `README.md`:许可证一节改为 AGPL-3.0 说明;顶部加中英文切换链接。
- 新增 `README.en.md`:精简英文版(定位/功能/快速启动/架构/协议),突出垂直漫剧管线差异化。

**影响面**:纯文档/法律文件,无代码行为变化。GitHub 仓库页将自动识别并展示 AGPL-3.0。

---

## [2026-07-06] feat: 自由画布定位转向——数据的可视化生成台(AI 派生 + 看板双向)

**动机**:7-03 首版画布把重心放在"API 生图"上,方向偏了——出图由小云雀/即梦
半自动路径承担,没必要在平台里重造生成器。用户真正要的是**可视化地生成生产
数据**(剧本/设定/分镜/提示词):指着任意数据节点让数字员工派生下游数据,
派生血缘全程可见;看板是表视图,画布是图视图,同一份数据。

**变更点**
- `app/models/production.py`:新增 `STAGE_INSTRUCTIONS`(各阶段 AI 生成指令
  模板,从 production.py 的 generate_stage 函数体提取为模块级常量,
  看板逐阶段生成与画布派生共用,避免两处漂移)。
- `app/api/production.py`:generate_stage 改用共享模板,行为不变。
- `app/api/canvas.py`:新增 `POST /canvases/{cid}/derive`——源节点内容 +
  阶段指令模板 + 额外指令交给数字员工(复用 `run_invocation`),回复按
  `---` 分段解析成 1~N 个条目返回;单次上限 30 条;后端无状态,
  节点创建/连线由前端完成。
- 前端 `CanvasNodes.tsx`:提示词节点泛化为**数据节点**(阶段标签 + 可编辑
  标题/内容 + AI 派生/复制/回写看板);旧 prompt 类型节点加载时自动迁移。
  图片节点保留(参考图 + 半自动出图回传),API 生图降级为"变体"可选动作;
  图片改用 antd Image(点击可放大预览)。
- 前端 `Canvas.tsx`:新增「AI 派生」弹窗(员工/目标阶段/指令,员工选择记
  localStorage);「从看板导入」弹窗(项目 → 集数/阶段过滤 → 卡片按阶段
  分列铺进画布,单次上限 60 张);「回写看板」升级(任意阶段 + 集数,
  提示词阶段自动带 prompts 字段)。

**影响面**
- **接口**:新增 `/api/v1/agentapp/canvas/canvases/{cid}/derive`(写权限
  production:manage,同画布前缀);generate(T2I)/upload 接口保留不变。
- **数据**:画布节点 data 结构从 `{prompt,url}` 扩展为
  `{stage,title,content,url,prompt}`,旧数据自动迁移,无需手工处理。
- **验证**:真实跑通派生链路——分镜师员工把一条图片提示词拆成 3 个分镜
  节点,且自动引用了员工知识库中的角色固定描述词(R3苍霖/scene04),
  Art Bible 一致性词汇在派生中生效;看板导入 372 卡命中、过滤后 13 卡成列铺开。

---

## [2026-07-06] chore: 每日 git 自动备份到 auto-backup 分支

**动机**:工作树曾累积 183 个文件改动 4 天未提交,机器故障即全丢;
系统里没有任何自动同步 GitHub 的机制(DailyScheduler 只跑采集/学习)。

**变更点**
- 新增 `scripts/git_auto_backup.ps1`:用临时 index 把工作树完整快照
  (含未提交/未跟踪文件,遵循 .gitignore)提交到 `auto-backup` 分支并推送;
  不碰 master / 真实暂存区 / 进行中的工作;与上次备份无差异时跳过。
- 已实测:首次运行生成备份提交并推送 `origin/auto-backup` 成功。

**影响面**
- **远程新增分支** `auto-backup`(纯备份链,勿在其上开发;恢复文件用
  `git checkout auto-backup -- <路径>`)。
- **需手动注册一次**每日计划任务(管理员或本人终端执行):
  `schtasks /Create /F /SC DAILY /ST 21:30 /TN "agent-platform-git-backup" /TR "pwsh -NoProfile -File D:\P\agent\scripts\git_auto_backup.ps1"`
- 无代码行为 / 接口 / DB 变化。

---

## [2026-07-06] docs: 知识库体系——全量中文注释 + 模块索引 + 架构导览

**动机**：代码注释缺口大（451 处无 docstring），且没有"快速知道某模块干什么"的入口，
新人/未来的自己只能靠翻代码。本次建立四层文档体系。

**变更点**
- 全仓补齐中文 docstring：app/admin/evals/scripts 463 处（模块头/类/函数），
  web/src 45 个文件全部加中文头注释。AST 扫描缺失归零，118 tests 全绿（零行为变化）。
- 新增 `scripts/gen_module_index.py`：从 docstring 自动生成 `docs/MODULE_INDEX.md`
  （118 后端模块 + 45 前端文件的一句话职责索引），代码变了重跑即同步。
- 新增 `docs/ARCHITECTURE.md`（手写）：分层总览、5 条核心数据流
  （对话/异步任务/工作流/知识检索/记忆三层）、"想改 X 去哪个文件"速查表、文档四层约定。
- README 新增"文档导航"一节。

**影响面**：纯文档 + 一个生成脚本，无接口/行为变化。
维护约定：新增模块跑一次 `python -m scripts.gen_module_index`；
ARCHITECTURE.md 只在数据流/分层变化时手工更新。

---

## [2026-07-06] fix(M3): 知识文档向量化接线 + 首批 eval golden cases

**动机**：M3 交付时 `SemanticRetriever.index_document` / `remove_document` 写了但**没有任何调用方**——
即使配好 PG + DASHSCOPE_API_KEY，上传的知识文档也永远不会被向量化，语义检索恒空（退化关键词）。
本次把"入口"接上，语义检索链路才真正闭环。另补首批 eval golden cases（此前只有模板）。

**变更点**
- `app/api/registry.py`：
  - 上传知识文档成功后 `asyncio.create_task(_vectorize_doc(...))` 后台切片向量化
    （不阻塞上传响应；semantic_retriever 未启用或失败时静默跳过，fail-open）。
  - 删除知识文档时 `_drop_doc_vectors` 连带清掉该文档全部切片向量。
- 新增 3 个 eval golden case（`evals/cases/*.json`）：
  `prompt_engineer_basic` / `screenwriter_basic` / `qa_inspector_basic`——
  基于漫剧员工的保守确定性检查（min_length / contains / not_contains），
  `python -m evals.run_evals` 即可跑（需 LLM 供应商已配置）。
- 测试：`test_vector_store.py` 新增 4 用例（向量化调度 / 未启用空转 / 清向量 / 失败吞掉）。

**影响面**
- 接口行为：上传/删除知识文档的响应契约不变；仅在 `USE_DB_STORES=true` +
  `DASHSCOPE_API_KEY` 配置时新增后台向量化副作用。
- 无 DB schema / 配置项变化。全量测试 118 passed。

---

## [2026-07-03] feat: 自由画布(对标即梦智能画布的 MVP)

**动机**:制作看板是线性流水线,缺一个空间化、非线性的图像迭代工作区。
即梦智能画布(无限画布+局部重绘+扩图)是行业标配交互;本次先落 MVP:
无限画布 + 文生图 + 变体 + 上传参考图 + 出图回写看板,复用现有 ReactFlow。

**变更点**
- 新增 `app/api/canvas.py`:画布 CRUD(`/api/v1/agentapp/canvas/canvases*`)、
  `GET /image-models`(列启用供应商的模型,用户自选生图模型)、
  `POST /canvases/{cid}/generate`(文生图,走 ai_service 的 OpenAI 兼容
  images 接口,远端图片下载转存本地)、`POST /canvases/{cid}/upload`(传参考图)。
- 画布数据落盘 `data/canvas/{canvas_id}.json`;生成/上传的图片存
  `data/uploads/canvas/`,经 `/uploads` 静态挂载直出(`<img>` 无需带
  Authorization —— 刻意不放 `/api/*` 下,避开鉴权中间件)。
- `app/core/auth.py`:`_WRITE_PERMS` 增加 canvas 前缀 → `production:manage`。
- `app/main.py`:挂载 canvas router。
- 前端新增 `pages/Canvas.tsx` + `components/canvas/CanvasNodes.tsx`:
  提示词节点 → 生成 → 图片节点,连线记录血缘;变体/下载/发送到看板
  (回写为 img_gen 阶段卡片);节点改动 1.2s 防抖自动保存;
  模型与尺寸选择记在 localStorage。
- `App.tsx` 路由 `/canvas`;`Layout.tsx` 导航「自由画布」(perm production:manage)。

**影响面**
- **接口**:新增 `/api/v1/agentapp/canvas/*`(读=登录用户,写=production:manage)。
- **数据**:新目录 `data/canvas/`、`data/uploads/canvas/`。
- **依赖/配置**:无新增(httpx 已在 requirements)。生图必须先在
  AI 供应商里配好支持 OpenAI images 接口的模型(如方舟 seedream),
  在画布顶栏选择后才可用;未配置时生成返回明确错误,不影响其他功能。
- **暂不包含**:局部重绘/扩图/消除/放大/图生视频(下一迭代,依赖 inpaint 类 API)。

---

## [2026-07-02] P0 安全修复:用户端 API 强制鉴权 + 角色权限落地

**动机**:登录门禁此前只在前端路由(UserAuthGuard),后端 `/agent/run`、`/registry/*`
等全部裸奔——局域网内任何人可 curl 直调,烧 LLM 费用且可改数据;viewer/editor
角色权限在用户端完全未生效。

**变更点**
- 新增 `app/core/auth.py`:`UserAuthMiddleware`——保护 app 下所有 `/api/*`;
  豁免 `/auth/*` 与 OPTIONS;读(GET/HEAD)任何登录用户,写按前缀映射权限
  (registry→employee/team/tool、workflow、production+pipeline、ai-providers→settings、
  memory/scrape/skills/evolution/knowledge-graph/trend-sources→employee、默认 workbench:use);
  用户须存在且未禁用(禁用立即生效,不等 token 过期)。
- `app/core/settings.py` + `app/main.py`:开关 `USER_API_AUTH`(默认开)。
- 前端 `api.ts`:所有请求带 `Authorization: Bearer`;401 统一清 token 跳 `/login`。
- 前端 `userAuth.ts`:登录/校验后缓存 `permissions`;新增 `hasPerm()`。
- 前端 `Layout.tsx`:导航按权限显隐(空分组隐藏);侧栏新增退出登录。
- 测试:`test_user_api_auth.py`(7 用例);`conftest.app_client` 统一带管理员凭证。

**影响面**
- **接口**:app 服务全部 `/api/*` 未带凭证返回 401(信封格式);无权限写操作 403。
- **配置**:新增 `USER_API_AUTH`(默认 true)。
- **前端**:老 token 继续有效;权限列表登录后自动拉取。
- **注意**:`ADMIN_SECRET` 未配置时重启即随机——生产必须在 `.env` 固定,
  否则重启后全员被登出;app 与 admin 进程若各自随机,token 互不通用。
- 管理端(:8001)不受影响(原有 require_admin)。

---

## [2026-07-02] fix: 未构建前端时后端启动崩溃（CI 全红根因）

**动机**：`wwwroot/index.html` 已进版本库但 `wwwroot/assets/` 是构建产物（gitignore）。
克隆后未 `npm run build` 直接起后端（或 CI 跑测试）时，`StaticFiles(wwwroot/assets)`
构造即抛 `RuntimeError`，应用起不来——首轮 CI 因此 backend 全红。

**变更点**：`app/main.py` 挂载 `/assets` 前单独判断目录存在；SPA fallback 不受影响。

**影响面**：无接口/配置变化。CI backend job 恢复绿；新人克隆仓库可直接起后端。

---

## [2026-07-02] 修复 CLI 流水线页白屏 + 管理端根路径 404 + 补项目知识库文档

**动机**：用户反馈「CLI 流水线」页打不开、后台 :8001 报 404，并要求给制作项目补知识库文档。

**变更点**
- **修复 `web/src/pages/Pipeline.tsx` 白屏崩溃**：页面用裸 `fetch` 拉 `/api/v1/pipeline/*`，未带 `Authorization` 头。后端鉴权开启后返回 401 错误信封 `{code,message,data:null}`，被 `setCliStatus` 塞进 state，渲染时 `Object.entries(cliStatus.available)` 因 `available` 为 `undefined` 抛 TypeError 导致整页崩溃。修复：新增带 token 的 `authFetch`，6 处 fetch 全部改用；并对异常响应兜底（`r.ok ? r.json() : null` + `Array.isArray` 校验），避免错误对象污染 state。
- **修复管理端 `admin/main.py` 根路径 404**：`:8001` 是纯 API 服务，裸访问根路径 `/` 返回 404 令人困惑。新增 `GET /` 返回友好指引 JSON（说明后台界面在前端 `/admin` 路由、附文档/健康检查入口）。后台界面本身正常（前端 `/admin/login`，API 走 `/api/admin/*` 代理到 :8001）。
- **新增 `data/production/jiulu-s1/README.md`**：制作项目知识库总纲（命题/三幕/角色/场景/分集进度/资产索引/管线）。数据源自 `cards.json`+`project.json`+master packages。
- **删除两个废弃 story bible**：`story_bible_v2_龙棺.md`（《她死后，龙来了》龙棺重生复仇，主角沈昭）与 `story_bible_重绘.md`（《描红》世界重绘，主角昭）均为早期未采用的故事方向草案，与苍霖篇生产线不一致，易混淆，经用户确认后删除（已核对 `cards.json`/`project.json` 无悬空引用）。

**影响面**
- 前端：Pipeline 页恢复可用（此前任何已登录用户进入即白屏）。
- 后端：admin `:8001/` 由 404 变为 200 指引；无 API 行为变更。
- 数据：`data/` 属 gitignore，项目 README 跟随业务数据，不进版本库。

---

## [2026-07-02] 制作看板层级视图（剧 → 集 → 镜头 → 资源）

**动机**：原制作看板是平铺看板，372 张卡片混在一起，不直观。
用户需要按「剧 → 集 → 镜头 → 资源」的层级逐级下钻浏览。

**变更点**
- 新增 `web/src/pages/ProductionHub.tsx`：项目总览页，展示项目摘要、全局资产（按故事/角色/场景/设计分组）、剧集网格（含镜头数/进度/缩略图）。
- 新增 `web/src/pages/EpisodeDetail.tsx`：单集详情页，展示该集所有镜头卡片，点击任一镜头弹出 Drawer，按阶段 Tab 显示剧本/分镜/提示词/图片/视频等资源。
- 修改 `web/src/App.tsx`：新增路由 `/production/:pid`（层级总览）、`/production/:pid/ep/:ep`（集详情）、`/production/:pid/pipeline`（原看板）。
- 修改 `web/src/pages/Production.tsx`：项目列表卡片加「层级视图」按钮，跳转到 ProductionHub。

**影响面**
- 前端新增 2 个页面组件 + 3 条路由。
- 原 `/production` 看板不受影响，可通过 ProductionHub 的「管线视图」按钮回到看板。
- 无后端/API/数据库变更。

---

## [2026-07-01] M5 限流/配额 + M4 异步任务队列 + M3 向量检索 + M6 Grafana 面板

**动机**：M0-M2-M6 已落地后的收尾冲刺——把剩余三个里程碑（M5/M4/M3）一次性交付，
同时补齐 Grafana 自动置备面板，使 M0-M6 全线完工。

**变更点**

### M5 限流/配额
- 新增 `app/core/rate_limit.py`：slowapi 全局限速（IP 维度 60/min 默认）+
  员工月度 token 配额（`check_quota` / `record_token_usage`），配额从
  `appsettings.json` 的 `quotas` 段读（`default_monthly_tokens` + `overrides`）。
- `app/main.py`：挂载 slowapi `Limiter` + 429 handler。
- `app/api/agent.py`：`/run` 端点加 `@limiter.limit("20/minute")` + 配额检查。
- `app/api/runs.py`：新增 `GET /quota/{employee_key}` 查本月用量。
- `app/services/invocation.py`：每次 run 结束后 `record_token_usage` 累加。
- `app/config.py`：新增 `quotas` 配置项。
- 测试：`test_rate_limit.py`（7 用例：配额检查/阻断/override/API）。

### M4 异步任务队列
- 新增 `app/core/queue.py`：arq Redis 连接池 + `enqueue` 辅助。
- 新增 `app/tasks/agent_task.py`：`run_agent_task` 异步任务函数。
- 新增 `app/tasks/worker.py`：arq WorkerSettings，
  `python -m app.tasks.worker` 或 `arq app.tasks.worker.WorkerSettings` 启动。
- 新增 `app/api/tasks.py`：
  `POST /tasks/agent-run`（入队）+ `GET /tasks/{job_id}`（状态查询）。
- `docker-compose.yml`：新增 `worker` 服务（与 app 同镜像，command 改 worker）。
- 测试：`test_queue.py`（5 用例：模块可导入/worker 设置/API 路由）。

### M3 向量检索
- 新增 `app/core/embedding.py`：DashScope text-embedding-v3（1024 维），
  `embed_texts` / `embed_single`，无 API key 时 fail-open 返空。
- 新增 `app/models/db/embedding.py`：`EmbeddingORM`（pgvector Vector 列，
  SQLite 退化为 JSON）。
- 新增 `app/services/vector_store.py`：
  `VectorStore`（upsert/delete/cosine_distance 搜索）+
  `SemanticRetriever`（query→embed→search→KnowledgeSnippet）+
  `_split_text` 文本切片。
- `app/dependencies.py`：`use_db_stores=True` 时实例化 `vector_store` /
  `semantic_retriever`，否则为 None。
- `app/api/registry.py`：新增 `GET /employees/{key}/knowledge/search?q=&topK=`，
  有向量检索走语义，否则退化关键词。
- `app/core/db.py`：`init_db` 注册 EmbeddingORM。
- Alembic：`a7c2e3f41b90_add_embeddings_table` 新建 `embeddings` 表 + pgvector 扩展。
- 测试：`test_vector_store.py`（10 用例：模块导入/切片/无 key 退化/API）。

### M6 Grafana 面板
- 新增 `deploy/grafana/provisioning/dashboards/dashboard.yml`：面板自动置备。
- 新增 `deploy/grafana/provisioning/dashboards/agent-overview.json`：
  7 个 panel（运行次数/成功率/总次数/Token 速率/成本累计/HTTP 速率/HTTP P95），
  docker-compose 启动即自动加载。

**影响面**
- **配置**：appsettings.json 可选新增 `quotas` 段。
- **环境变量**：`DASHSCOPE_API_KEY`（M3 可选，不配则退化关键词检索）。
- **DB**：新增 `embeddings` 表（仅 use_db_stores=True 且有 PG 时）。
- **容器**：docker-compose 新增 `worker` 服务。
- **监控**：Grafana 启动即有 "Agent 运行概览" dashboard。
- **接口**：新增 `/tasks/agent-run`、`/tasks/{job_id}`、`/quota/{employee_key}`、
  `/employees/{key}/knowledge/search`。

---

## [2026-07-01] M2 成本真值 + M6 指标核心

**动机**:运行记录已落 token,但成本一直显"未配价目";可观测只有 HTTP 指标,没有 LLM 维度。
本次让成本变成可配的真数字,并把运行/token/成本暴露成 Prometheus 指标——"钱和量"闭环。

**变更点**
- M2:`estimate_cost` 改从配置读价目——`app/config.py` 新增 `model_prices`
  (appsettings.json 的 `modelPrices` 段:`model_id -> {promptPer1k, completionPer1k}`,USD)。
  填了才算,默认空(价格会漂,不硬编码)。运行看板的"成本"列随之自动显真金白银。
- M6:新增 `app/core/metrics.py`,自定义 Counter:`agent_runs_total{employee,success}`、
  `agent_prompt_tokens_total`、`agent_completion_tokens_total`、`agent_cost_usd_total`;
  `invocation.py` 每次 run 结束累加,随既有 /metrics 暴露,Grafana 可直接取。
- 新增测试:`test_metrics.py`(指标累加 + /metrics 暴露)、更新 `test_run_store.py` 成本用例。

**影响面**
- **配置**:appsettings.json 新增可选 `modelPrices` 段;不填则成本为 null(行为不变)。
- **指标**:/metrics 新增 4 个 `agent_*` 指标(需配 Grafana 面板才"看得见",面板本次未做)。
- 无 DB / 接口契约变化。

---

## [2026-07-01] ⚠️ 修正:M1 之前的"已完成"记录名不副实

**核对结论**:本文件此前的 M1 条目声称已交付 `app/repositories/user_repo.py`
(`PgRoleStore`/`PgUserStore`)、`alembic.ini` + `migrations/0001_initial`、
`scripts/migrate_json_to_pg.py`,并已把 `dependencies` 切到 PG。**代码树核对:上述文件
全部不存在**,`dependencies.py` 仍用 JSON 版 `RoleStore/UserStore`,`session_scope`/
`SessionLocal`/`init_db` 无任何调用处,且连 `sqlalchemy`/`psycopg` 都未安装。
即:M1 只有 `app/core/db.py` + `app/models/db/{base,user}.py` 的**脚手架**,从未真正接线。
现把该条目改写为真实进度,避免文档继续误导。

## [2026-07-01] M1 数据层:运行记录 + 会话 + 长期记忆 → PostgreSQL(可切换,"要查的"已齐)

**动机**:JSON 文件存储读改写无锁,并发下丢数据。M1 给每个 store 加"PG 可选"开关——
**只迁"要查的"运行态**(运行记录、会话、长期记忆),注册表等静态配置永远留 JSON。
JSON 默认(单人自用清爽),PG 备用(要查/演示/上量时一个环境变量切过去),两者不冲突。
本次收尾长期记忆后,三类"要查的"运行态全部可切。

**变更点**
- 新增 ORM:`app/models/db/{run,session,memory}.py`
  (`agent_runs` / `conversation_sessions` / `long_term_memories` 表),`to_dict()`/结构对齐旧 JSON。
- 新增仓储/后端:`run_store_db.py`(`AgentRunDbStore`)、`memory_db.py`(`ConversationMemoryDbStore`)、
  `long_term_memory_db.py`(`PgMemoryBackend`);接口与 JSON 版逐字一致,并发安全由事务保证。
- **长期记忆重构**:`long_term_memory.py` 把"读整表/写整表"抽成 `MemoryBackend` 原语
  (`JsonMemoryBackend` 默认),合并/衰减/检索/截断逻辑一行不改即可换 PG——零行为漂。
- `app/core/settings.py`:新增开关 `use_db_stores`(默认 `False`),灰度切换。
- `app/core/db.py`:`init_db()` 注册三张表 ORM。
- `app/dependencies.py`:开关为真时 `agent_run_store` / `memory_store` / `long_term_memory` 走 PG。
- 新增测试:`test_run_store_db.py`、`test_memory_db.py`、`test_long_term_memory_db.py`——
  SQLite 内存库验证 round-trip / 幂等 / 过滤 / 合并检索 / 子结构完整往返。
- 新增 Alembic:`alembic.ini` + `migrations/`(`env.py` 用 `settings.database_url`,`ALEMBIC_URL` 可覆盖),
  `5b08f4badaa1_initial_schema` 建全部 5 张表(users/roles/agent_runs/conversation_sessions/long_term_memories)。
- 新增导入脚本 `scripts/migrate_json_to_pg.py`:把 `data/{agent-runs,sessions,memory}` 幂等导入 PG
  (+ `test_migrate_json_to_pg.py`,SQLite 目标验证读→写映射)。

**影响面**
- **DB**:新增 `agent_runs`、`conversation_sessions`、`long_term_memories` 表(仅当 `use_db_stores=True` 且装了 DB 依赖)。
- **配置**:新增 `USE_DB_STORES` 环境变量,默认关。
- 受影响接口:`/agent/runs`、`/agent/sessions`、`/memory/*`(存储层透明切换,契约不变)。
- **仍为 JSON**:注册表(员工/团队/工具/技能/工作流,**刻意保留**——静态配置)、平台用户/角色、采集/学习历史。
- **生产启用步骤**:`pip install -r requirements.txt` → 配 `DATABASE_URL` → `alembic upgrade head` →
  (可选)`python -m scripts.migrate_json_to_pg` 搬历史 → `USE_DB_STORES=true`。
- **验证边界**:migration 已在 SQLite 上 upgrade/downgrade 通过;真实 PG 联调需在有 PG 的环境跑。

---

## [2026-07-01] M0 工程地基:Docker Compose + 配置密钥 + 结构化日志 + CI

**动机**:此前仅有 CORS 中间件、basicConfig 日志、密钥明文进 json、无测试无部署,
不具备"团队批量生产 + 可推广"的底座。M0 立起后续里程碑共同依赖的地基。

**变更点**
- 编排:`docker-compose.yml`(postgres+pgvector / redis / app / admin / prometheus / grafana)+ 多阶段 `Dockerfile` + `.dockerignore`。
- 配置:`app/core/settings.py`(pydantic-settings + `.env`),密钥移出版本库;`.env.example` 为样例;CORS 由环境变量收窄。
- 日志:`app/core/logging.py`(structlog)+ `app/core/middleware.py`(request_id 全链路)+ `app/core/errors.py`(统一异常信封,生产不外泄堆栈)。
- 可观测:`app/core/observability.py` 暴露 `/metrics`,Prometheus/Grafana 置备(`deploy/`)。
- 质量:`tests/`(冒烟测试)+ `pytest.ini` + `.github/workflows/ci.yml`(后端 pytest + 前端 tsc/build)。

**影响面**
- `app/main.py` / `admin/main.py`:挂 RequestContextMiddleware、异常处理器、`/metrics`;日志改 structlog。
- **配置**:新增环境变量 `APP_ENV/DATABASE_URL/REDIS_URL/LOG_LEVEL/LOG_JSON/CORS_ORIGINS/ADMIN_*/DASHSCOPE_API_KEY`。
- `.gitignore`:忽略 `.env`。
- 启动方式:`docker compose up -d --build` 一键起全套。
## [2026-07-15] GC 视频前置审核与参考资产

- 单集详情兼容 `episode=null` 的 GC 全局生成单元，避免概念片卡片在详情页缺失。
- 视频参考包增加逐镜人工审核状态与 Seedance 输入复制；仅准备提示词、参考图和参数，不自动提交视频任务。
- GC 生成模板改为继承正片项目的锁定 Art Bible，并将 3~5 个高光段拆为 8~12 个 1.5~4 秒剪辑镜头，禁止用少量一镜到底镜头填满全片。
- GC 流程补回“场景/人物锁定”和“视觉设计”阶段；场景必须先产出可复用母版提示词，角色必须锁定具体时期后才能进入故事板与生图提示词。
- 图片提示词必须继承明确视觉风格与母版参考；视频提示词只负责动作、运镜、环境和声音，不再重新发明人物与画风。
- GC 运行数据重写为抖音剧情型 11 镜、30 秒版本：命运拒绝→龙蛋选择→成长兑现→删除令→熔浆龙焰→世界树钥匙；同时新增 5 个场景提示词与 4 个角色时期锁定卡。错误三视图保持 rejected 并退出下游引用，未生成新图片。
- 影响面：`web/src/pages/EpisodeDetail.tsx`、`data/production/a3ab9f6a/cards.json`、`data/uploads/canvas/`。
