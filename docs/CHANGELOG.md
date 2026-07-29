# 改动记录 CHANGELOG

> 规则见 [CLAUDE.md](../CLAUDE.md):每次功能性改动必须在此追加一条。
> 最新在上。格式:`## [日期] 标题` + 变更点 + 影响面。

---

## [2026-07-29] feat: DeepAgent 会话工作区可视化

- 复用 Yuxi Agent 状态观察边界，为现有会话增加稳定的工作区摘要：返回执行状态、
  进度说明、下一步建议、待办和虚拟文件索引，但不在列表中内联文件正文。
- 新增工作区索引与单文件只读接口；大型工具结果和普通工作文件均按精确虚拟路径
  按需读取，文件不存在时返回可恢复的刷新、重试和停止建议。
- 会话列表、详情和归档响应不再返回完整 `deepAgentCheckpoint`，只暴露版本及
  待办/文件数量；持久化 metadata 保持原样，不删除或迁移用户数据。
- 工作台桌面端右侧新增工作进度面板，移动端提供抽屉入口，可查看待办状态、文件
  类型和正文，并处理加载失败与重试。
- 新增专项接口与数据边界测试；默认继续使用 JSON/Markdown/本地会话，不要求
  PostgreSQL 或 Redis。

**影响面**：新增
`GET /api/v1/agentapp/agent/sessions/{session_id}/workspace` 和
`GET /api/v1/agentapp/agent/sessions/{session_id}/workspace/file?path=...`；
调整会话响应 metadata 的展示形态及工作台右侧面板。无数据库表、环境变量或数据迁移。

---

## [2026-07-29] fix: 修复 vendored Nomi Git 门岗入口

- 根仓库的 `pre-commit` / `commit-msg` 钩子由 Nomi 安装器生成，但默认引用根
  `scripts/`，实际扫描器随 vendored 源码位于 `third_party/nomi/scripts/`，导致
  正常提交在安全检查前因模块不存在而失败。
- 新增两个极薄转发入口，继续执行原有敏感信息扫描与进度更新检查；不跳过、不复制
  或修改上游检查逻辑。

**影响面**：仅修复本地 Git 提交门岗的脚本入口；无运行时、API、数据库或前端变化。

---

## [2026-07-29] feat: DeepAgent 大型工具结果自动卸载

- 直接迁入 Yuxi SummaryMiddleware 的 L1 工具结果精简算法：按近似 token 阈值
  识别大型结果，用安全工具名和内容哈希生成稳定虚拟路径。
- 完整结果写入 DeepAgent 会话工作区的 `/outputs/large_tool_results/`，模型后续
  上下文只保留结果大小、读取路径和有限预览；需要细节时可用现有 `read_file` 获取。
- 精简只改变送入下一轮模型的上下文，运行 trace 仍保留原始结果摘要；卸载文件通过
  已有 checkpoint 随会话恢复。失败时 fail-open，自动回退原始结果。
- 仅 DeepAgent 启用；普通员工路径不变，不增加摘要模型调用，也不依赖 LangGraph、
  LangChain、数据库或 Redis。
- 新增 3 个专项测试，并扩展 checkpoint 集成测试，覆盖小结果直传、稳定内容寻址、
  AgentLoop 上下文替换和跨会话保存。

**影响面**：新增 `app/runtime/context_compaction.py`，扩展 AgentLoop 可选结果转换钩子
和 DeepAgent 运行器装配；无 API、数据库、环境变量、前端或数据迁移。

---

## [2026-07-29] feat: DeepAgent 工作状态随会话恢复

- 迁入 Yuxi checkpoint 的状态提取思路，把 DeepAgent 的 `todos/files` 作为版本化
  checkpoint 保存到现有会话 `metadata`；同一 `sessionId` 的下一轮运行会在工具
  handler 装配前恢复状态。
- 默认 JSON 会话仓储即可持久化；后台启用现有 PostgreSQL 会话仓储时复用同一
  metadata 字段，不要求 Redis、LangGraph 或新数据表。
- checkpoint 只保存可检查的工具状态，不保存隐藏推理；待审批信息继续使用原有
  独立字段。未知版本、坏字段和非 DeepAgent 路径均安全降级，不影响普通员工。
- 新增 4 个专项测试，覆盖序列化边界、坏数据隔离、运行器工具状态恢复和会话回写。

**影响面**：调整 DeepAgent 状态、Agent 运行器与会话调用编排；无 API、数据库、
Redis、环境变量、前端或 JSON 迁移，不删除和替换现有代码。

---

## [2026-07-29] feat: 接通 Skill 的工具、MCP 与子 Skill 依赖

- 从 Yuxi SkillsMiddleware 迁入确定性 DFS 依赖闭包，员工绑定根 Skill 后自动展开
  `skillDependencies`，并汇总闭包内的 `toolDependencies` 与 `mcpDependencies`。
- 依赖能力直接追加到现有员工运行时快照，不新建 Agent 内核；员工原有显式
  `toolRefs`、`mcpServerRefs` 保持优先顺序并去重，注册表配置本身不会被改写。
- 缺失 Skill 与循环依赖采用 fail-soft：记录告警并只跳过问题节点/边，其余
  Skill、工具和 MCP 继续装配。
- 新增 3 个专项测试，覆盖多层共享依赖去重、缺失/循环隔离和员工快照集成。

**影响面**：新增 `app/runtime/skills.py` 并调整快照装配；无 API、数据库、Redis、
环境变量、前端或 JSON 数据迁移，不改变未绑定 Skill 员工的运行路径。

---

## [2026-07-29] feat: 让现有 Skill 注册表识别 SKILL.md 技能包

- 从 Yuxi Skills Service 迁入 `SKILL.md` frontmatter 解析、slug 校验、依赖元数据
  和单包故障隔离，新增只读技能包发现层，不引入 PostgreSQL Skill Repository。
- 现有 `data/skills/*.json` 继续作为可编辑配置；同 code 的 JSON 配置优先，
  `SKILL.md` 目录或链接不会被保存、删除或覆盖。
- `data/skills/` 中已有的 `seedance-v2`、`ai-video-generation`、
  `remotion-render` 技能包现在可被后台列出、绑定员工，并由现有
  `get_skill_detail` 工具按需读取完整正文。
- 系统提示词只注入 Skill 与树形子技能摘要，命中技能后明确要求调用
  `get_skill_detail`；避免每轮重复注入大型技能全文。
- 新增 6 个技能包专项测试，覆盖 YAML 折叠描述、依赖、JSON 覆盖优先、
  损坏包隔离、现有详情工具和提示词按需加载。

**影响面**：扩展 SkillDefinition 返回字段，新增 `PyYAML>=6.0.2` 与只读
SKILL.md 发现；无数据库、Redis、环境变量、前端或现有 JSON 数据迁移，
未删除和改写任何技能包。

---

## [2026-07-29] feat: 接通员工 MCP 服务的真实工具执行链

- 从 Yuxi MCP Service 迁入配置哈希缓存、跨服务工具唯一命名、故障隔离和按绑定
  加载机制，新增轻量 `app/runtime/mcp.py` 适配层，不引入 Yuxi 数据库仓储或
  LangChain 运行栈。
- 后台已有 MCP 服务定义和员工 `mcpServerRefs` 继续作为唯一配置来源；运行时支持
  `stdio`、Streamable HTTP 与 SSE，发现的工具直接追加到现有 AgentLoop。
- 未绑定 MCP 的员工保持零额外运行行为：不导入 MCP SDK、不启动子进程、不联网；
  单个服务加载失败时只隔离该服务，其他 MCP 与现有本地工具继续执行。
- MCP 工具使用 `mcp__服务__工具` 命名空间，服务配置变化会自然刷新声明缓存；
  服务返回错误时进入现有工具失败 trace，不击穿整轮 Agent 调用。
- 新增 6 个 MCP 专项回归测试（含官方 SDK 的真实 stdio 协议往返），并通过
  现有工具循环、注册表和 API 契约测试。

**影响面**：新增可选 MCP 客户端依赖 `mcp>=1.28,<2`、MCP 运行时桥接和测试；
无 API、数据库、Redis、环境变量或前端迁移，未删除或替换任何现有 Agent 代码。

---

## [2026-07-29] fix: 移除第三方品牌页面并恢复平台原生画布

- `/canvas` 取消 iframe 和独立第三方 HTML，直接渲染 Agent Studio 原生 React
  画布；移除面向用户的上游 Logo、项目库、模型配置和浏览器 localStorage 项目。
- 画布顶栏直接展示平台数字员工与平台图片模型选择器；AI 派生继续经过员工角色、
  知识、工具和模型路由，媒体生成继续使用后台配置的平台模型。
- 首个源码级迁移为上游 AABB 螺旋节点避让算法：改写成 Agent Studio ReactFlow
  纯函数，新增数据、分镜、便签和分组节点时不再随机重叠。
- 移除 `/nomi` 静态挂载、Docker 复制、CI/CD 上游页面验收和专用 Web 适配端点。
  上游源码仅在 `third_party/nomi/` 作为保留许可证与归属的迁移研究基线。

**影响面**：调整 `/canvas` 页面、画布工具栏、Docker、FastAPI 静态路由、CI/CD、
README 和画布 API；无数据库或环境变量迁移。

---

## [2026-07-29] fix: 修复生产环境 Nomi 画布返回主站 404

- Docker 运行时镜像显式复制并校验 `web/public/nomi/`，避免独立画布静态包缺失时
  `/nomi/index.html` 被主站 SPA fallback 吞掉。
- 后端将 `/nomi` 作为独立静态应用挂载，Nomi 的入口、资源和 hash 路由不再经过
  主站页面回退。
- 前端构建门禁与部署后公网健康检查同时验证 Nomi HTML 标题；以后主站正常但画布
  丢失时 CI/CD 会明确失败，不再产生“部署成功”的假绿。

**影响面**：调整 Docker 镜像、FastAPI 静态路由、CI/CD 发布验收和部署说明；
无 API、数据库或环境变量迁移。

---

## [2026-07-29] chore: 固定引入 Yuxi Agent Runtime 源码模块

- 从 `xerrors/Yuxi` 的 `main` 分支固定提交
  `2f8fa7fdc8d641ccc1b158ad7022a26087b6c99a` 引入上游源码快照，
  存放在 `modules/yuxi-runtime/`。
- 保留上游 MIT 许可证、后端、Worker、沙盒、Skills/MCP、知识模块、CLI、
  前端和测试源码；初始引入不重写上游内核。
- 新增 `UPSTREAM.md` 与 `INTEGRATION.md`，明确来源、同步规则、独立运行边界
  以及与现有漫剧生产系统的职责划分。
- 当前尚未把 Yuxi 接入根 Compose，也未替换现有 Agent 运行链；后续先以
  本地单人模式验证，再增加最薄的 API/Artifact 映射层。
- 明确基础设施降级策略：默认不要求 PostgreSQL、Redis、MinIO、Milvus 或 Neo4j，
  会话、记忆、配置与产物使用 JSON/Markdown/本地文件，任务进程内执行；后台配置
  对应服务后再启用数据库仓储、持久任务队列和重型知识能力。

**影响面**：新增独立源码模块和文档，不改变现有 API、数据库、配置、前端与部署行为。

---

## [2026-07-29] fix: 兼容全局与分集生产单元混合统计

- 生产就绪度统计为 `(episode, shot_number)` 增加显式排序规则，旧 GC 全局单元的
  `episode=None` 与普通分集整数可以同时参与统计，不再触发 Python 3 的跨类型比较错误。
- 新增全局单元和分集单元混合场景回归测试，覆盖 CI/CD 中 4 个生产生成测试的共同根因。

**影响面**：调整生产看板就绪度统计；无 API、数据库或配置迁移。

---

## [2026-07-29] feat: 直接迁入 Nomi 短剧无限画布工作台

- `/canvas` 默认入口由六个通用画布引擎页签改为 Nomi v0.17.0 完整 Web
  工作台，直接保留短剧生成画布、素材库、节点关系、分组/撤销/整理、可展开多轨
  时间线、预览工作区、分镜计划和 3D 导演相关能力。
- 完整上游源码按 Apache-2.0 固定在 `third_party/nomi/`，对应 commit
  `4afb06452064b483a9cd2fb7b82523500b03c0a5`；许可证、上游文档和本地归属声明
  一并保留，不再以通用画布库仿写短剧工作台。
- Nomi renderer 的静态构建产物放入 `web/public/nomi/`，主站构建时自动复制到
  `wwwroot/nomi/`，并通过同源 iframe 嵌入登录后的平台布局。
- 新增 Nomi Web 适配 API：模型目录直接读取平台 OpenRouter 图片/视频模型，画布
  图片节点复用平台落图服务，视频节点复用异步提交与轮询服务；浏览器版不再因缺少
  Electron IPC 而显示“模型目录加载失败”。
- 原 React Flow 生产画布保留为右上角“旧版画布”兼容入口，避免删除既有画布数据；
  Nomi 在浏览器环境沿用上游 localStorage 项目存储，Electron 文件系统能力不冒充可用。

**影响面**：新增 `third_party/nomi/` 完整源码快照和 `web/public/nomi/` 静态子应用；
调整 `/canvas` 默认页面；新增 `/api/v1/agentapp/canvas/nomi/models`、
`/api/v1/agentapp/canvas/nomi/tasks` 和任务轮询 API；主站静态资源增加约 35MB；
无数据库迁移。

---

## [2026-07-29] feat: 数字员工按文字、图片、视频能力分流模型

- 员工与岗位模板新增 `outputModalities`，支持 `text`、`image`、`video`；员工
  `defaultModelPolicy` 将思考模型与 `image_model_id`、`video_model_id` 分开保存。
- 新增 `generate_image`、`generate_video`、`check_video_generation` 三个员工工具：
  图片走 Images/OpenRouter 图片接口并落地本地，视频走 OpenRouter 异步任务并保留
  `jobId`，完成后落地 MP4；工作台可直接显示图片和播放视频。
- 员工编辑页按能力显示独立模型选择器，图片/视频能力会自动绑定对应工具；后端禁止
  把图片、视频、音频、嵌入等专用模型存为聊天思考模型；模型引用保留供应商身份，
  同时兼容 `vendor/model:free` 这类模型自身带冒号的 ID。
- 旧员工 JSON 保持可读取，即使历史配置曾把媒体模型误填为思考模型也不会从界面
  消失；新建、更新和模板应用时统一要求显式且可用的思考模型。视频能力识别覆盖
  OpenRouter 当前 Seedance、Wan、Grok Imagine Video、HappyHorse 等模型族。
- 内置角色、场景、关键帧原画师声明图片能力并绑定 `gpt-image-2`；新增独立视频
  生成师并绑定 OpenRouter Seedance 2.0。视频提示词工程师继续只负责结构化提示词，
  不被混作生成岗位。
- 导演/分镜/质检推荐 GPT-5.6 Sol，其余创作与设计岗位推荐 GPT-5.6 Terra；推荐
  仅在界面和文档呈现，不做破坏性启动迁移，也不把未配置模型覆盖到现有员工。

**影响面**：调整员工/岗位模板 JSON 契约、运行时快照、提示词编译、员工 CRUD 校验、
安全基础字段迁移与员工管理/工作台界面；新增 3 个工具定义和媒体 handler；无数据库或环境
变量迁移。生产看板的媒体卡片回填仍沿用原有导演媒体流水线，本次新增能力首先服务于
员工对话/工作流工具调用。

---

## [2026-07-29] fix: 连接测试跳过纯图片生成模型

- 用户端与管理端供应商连接测试不再固定使用模型列表第一项，而是优先选择可用于
  Chat Completions 的模型；`gpt-image-*`、`chatgpt-image-*` 和 `dall-e-*`
  等纯生图模型不会再被错误发送到聊天接口。
- 供应商仅配置生图模型时返回明确提示，说明应使用 Images 或 Responses API，
  避免上游字符串错误被误报为 `.choices` 属性异常。

**影响面**：调整两个供应商连接测试接口及共享模型选择逻辑；无数据库、环境变量或
部署配置变化。

---

## [2026-07-29] fix: 兼容字符串形式的 Chat Completions 响应

- 新增统一响应归一化层，兼容标准 OpenAI SDK 对象、字典、重复 JSON 序列化字符串
  和纯文本回复，修复供应商连接测试读取 `.choices` 时因字符串响应失败的问题。
- 用户端与管理端连接测试、核心 Agent 工具循环、深度子任务及记忆、进化、蒸馏、
  技能生成、趋势摘要等文字任务统一使用兼容解析；标准响应和工具调用结构保持不变。

**影响面**：新增 `app/services/chat_response.py`；调整所有 Chat Completions 响应读取点；
无 API 路径、数据库、环境变量或部署配置变化。

---

## [2026-07-29] feat: AI 供应商一键同步 GPT 文字与视觉模型

- 系统设置的供应商卡片新增“同步 GPT 模型”，使用服务端已加密保存的 API Key
  调用供应商 `/models`，批量写入当前 Key 实际可用的通用 GPT 模型。
- 同步时排除音频、实时、转写、生图、搜索预览和 Codex 专用模型，避免它们进入
  普通 Agent 的 Chat Completions 模型列表；非 GPT 手工模型会原样保留，上游目录
  为空时不会清空已有配置。
- GPT-5.6 Terra、Sol、Luna 分别显示为中档、高档和经济档视觉模型，Terra 默认
  置顶用于连接测试；超过 20 个模型时列表自动分页。

**影响面**：新增
`POST /api/v1/agentapp/agent/ai-providers/{name}/models/sync-gpt`；
调整系统设置供应商模型管理界面；无数据库、环境变量或部署配置变化。

---

## [2026-07-29] feat: 六引擎统一画布中心

- `/canvas` 从单一素材画布升级为统一画布中心，按用途提供生产画布、自由白板、
  视觉排版、节点实验室、知识画布和 SDK 画布六种模式；各大型引擎独立懒加载，
  不增加普通页面首屏体积。
- 保留现有 React Flow 生产画布的素材血缘、AI 派生、看板导入/回写和自动保存；
  新增 Excalidraw 手绘白板、Fabric.js 图片/字幕排版、Rete.js 可执行节点编辑器。
- 新增第三方引擎通用 JSON 文档接口，Excalidraw、Fabric 和 Rete 使用平台鉴权与
  服务端自动保存，文档落在 `data/canvas/engines/`。
- AFFiNE 以完整自托管应用的边界接入，可通过 `VITE_AFFINE_URL` 嵌入；tldraw
  使用 IndexedDB 持久化，生产部署必须配置 `VITE_TLDRAW_LICENSE_KEY`。
- 六个上游仓库已浅克隆到 `vendor/canvas-sources/` 供审计和二次开发，目录不进入
  主仓提交；正式构建使用锁定的 npm 依赖。

**影响面**：新增 `GET/PUT /api/v1/agentapp/canvas/engines/{engine}`；
新增 `web/src/pages/CanvasHub.tsx`、四个原生画布引擎组件及两个外部应用接入组件；
新增可选环境变量 `VITE_AFFINE_URL`、`VITE_TLDRAW_LICENSE_KEY`；重新生成
`wwwroot/`，无数据库迁移。

---

## [2026-07-29] fix: 生图模型能力分流与角色一致性默认模型

- 画布和单集生图不再把 `openrouter/free`、Hy3、Gemma 等文字/推理模型错误显示为
  生图模型；模型下拉框改为实时读取 OpenRouter `/images/models` 图片能力目录。
- 通用生图服务识别显式 `openrouter:` 模型引用并改走 OpenRouter 专用 `/images`
  接口，画布尺寸会自动换算为最接近的宽高比和 1K/2K 分辨率。
- 当前 OpenRouter 没有免费图片生成模型，界面明确标注“付费”，不再因文本 token
  价格为 0 就误报免费；价格目录异常时仍保留图片能力目录，避免整个选择器不可用。
- 图片模型默认推荐 `google/gemini-3.1-flash-lite-image`：支持 9:16、低成本，并可
  接收最多 14 张角色参考图；失效的历史选择会自动回落到当前推荐模型。
- 数字员工配置中的模型改称“文字与推理模型”，明确说明角色生成师等员工负责分析、
  设计和生成提示词，真正出图时另选支持图片输出的模型，避免两类模型继续混用。

**影响面**：`GET /api/v1/agentapp/canvas/image-models` 的结果现在只含经实时目录确认的
OpenRouter 图片模型，并新增免费、推荐、价格和能力字段；无数据库或环境变量变化。

---

## [2026-07-29] feat: 一句话自动设计数字员工

- 新建员工不再要求用户先理解并手写系统提示词；用户只需输入“我要一个软件架构师”
  这类岗位需求，系统自动生成员工名称、唯一标识、完整工作提示词、模型参数、标签，
  并从当前真实存在的技能、工具和 MCP 连接中选择可用绑定。
- 新增岗位示例快捷入口和现成岗位模板；生成后的专业字段仍可展开检查和微调，但不再
  作为开始创建员工的前置知识门槛。
- 设计模型不可用、返回非 JSON 或内容质量不足时，后端自动生成包含职责、工作流程、
  输出要求和行为边界的可靠草稿，避免重新退化成空白表单。
- 模型返回的技能、工具和 MCP 引用会与本地注册表交叉校验，不保存不存在的绑定；
  岗位需求作为不可信数据传给模型，避免其中的指令覆盖员工设计任务。

**影响面**：新增 `POST /api/v1/agentapp/registry/employees/generate-draft`；
调整数字员工创建界面和前端 API 封装；无数据库、环境变量或部署配置变化。

---

## [2026-07-29] feat: 全站输入默认值与使用习惯保留

- 新增统一的浏览器端输入习惯存储：带类型保护、对象默认值合并和防抖写入，
  页面刷新或重新打开后可恢复用户上次的非敏感偏好与未提交草稿。
- 新建故事和制作项目会持续保存草稿，创建成功后只清空名称、描述和原始素材，
  保留项目形式、集数、时长、画幅、画风、预算和默认员工等制作习惯。
- 工作台自动恢复上次员工/团队、消息草稿、归档显示和侧栏状态；失效对象会自动
  回落到第一个可用对象，不再每次从空白状态开始。
- 制作看板、画布、导演台、生图、趋势雷达、运行记录、OpenRouter 市场、长期记忆、
  学习来源、CLI 流水线和管理端筛选均保留常用模型、尺寸、筛选与运行参数。
- 新建数字员工自动沿用上次模型、温度、Token、团队、技能、工具和标签配置，并在
  已记住的模型下线时回落到当前第一个可用模型；工具 Schema 与 MCP 环境变量提供
  可直接编辑的合法 JSON 默认值。
- 密码、API Key、验证码、文件内容和危险操作确认值明确不写入浏览器习惯存储。

**影响面**：新增 `web/src/hooks/useInputHabit.ts`，调整用户端和管理端高频输入页面；
重新生成 `wwwroot/` 前端产物；无 API、数据库、环境变量或部署配置变化。

---

## [2026-07-29] fix: OpenRouter 实时目录自动清理已下线模型

- 模型市场每次打开或手动刷新时请求 OpenRouter 完整模型目录，并自动从本地
  `openrouter` 供应商配置中删除已不在最新目录里的模型。
- 目录请求显式包含全部输出模态，避免只返回文本模型时误删图片、视频等模型。
- OpenRouter 请求失败、返回空目录或没有有效模型 ID 时返回 502 且不执行清理，
  防止上游临时异常导致本地模型配置被清空。

**影响面**：`GET /api/v1/agentapp/agent/openrouter/models` 现在会同步清理供应商模型配置；
无数据库、环境变量或部署配置变化。

---

## [2026-07-28] fix: 《铁心恋人》沈曜三视图侧别与身份细节联合门禁

- 纠正沈曜旧母版把画布方向误当人物方向的问题：人物解剖学右侧面统一为
  “角色右侧面对镜头、鼻尖朝画布左”，旧的错误侧别候选全部保留审计但退出活动输入。
- 沈曜日常装、战术装恢复使用经独立复核通过的完整全身正/右/后三视图 v1；
  新增严格正面、人物右侧标记近照、人物左侧无标记反证三张高清身份细节锚。
  细节锚只锁定右眉尾旧伤和右耳单耳钉，不能替代全身三视图。
- 角色审批由单文件升级为联合资产包：主三视图和声明的身份细节图共同参与
  内容指纹；任一文件缺失、被替换、角色路径越界或语义角色变化，旧批准自动失效。
  分镜正向参考只携带正面、右侧标记与对应服装三视图，不把左侧反证图误喂给生成器。
- 角色设定卡不再混入旧的单角度全身/战术/居家图，只展示当前身份近照与正式
  三视图候选，避免界面上同时出现已退役服装图并被误认为活动母版。
- 最终验证器新增 `character_identity_details` 组，逐服装包检查正式角色集合、
  安全路径、真实 9:16 PNG、缺失文件及同包不同角色复用相同内容；日常/战术包共享
  同一身份锚是有意设计，不会被误判为跨包重复。
- 当前 6 套角色联合资产包和 8 个场景包均仅为 `candidate`；导演批准数仍为 0，
  216 张逐镜分镜继续保持不可生成，未跨过审批门。

**影响面**：`scripts/prepare_tiexin_media.py`、`scripts/validate_tiexin_media.py`、
`tests/test_tiexin_preproduction.py`、`data/production/tiexin-s1/` 的角色细节资产、
审批清单、前期规格、审片单和 QA 记录；无 API、数据库、环境变量或部署变化。

---

## [2026-07-28] feat: 「我的项目」改为故事优先阅读页

- 侧栏「我的项目」不再直接进入十阶段制作看板，先展示故事库；项目默认先回答“讲什么、是什么形式、已经有多少画面”，专业制作和缺漏检查保留为二级入口。
- 项目详情新增普通话的一句话故事、四步故事脉络和按时间排序的剧情画面；聚合式概念预告会把 W01–W14 与分镜说明自动配对，并对跨阶段重复引用的图片去重。
- 用户界面把内部 `GC` 解释为“15–30 秒概念预告片”，并对世界观型预告明确提示“前 12 幕讲九大陆灾变、主角在最后两幕登场”，避免把奇观画面误认为剧情错误。
- 项目统计新增 `story_preview`，把剧情画面、已通过图片、缺图、视频和成片分开计算；聚合式预告不再错误显示 0%，当前 V3 可正确识别 14/14 张正式画面且视频尚未生成。
- 制作字段默认收起，`G 单元`、`生图`、`图片提示词`等内部说法改为镜头、生成画面和画面生成说明。
- 修正图片审核抽屉的退回原因枚举；设定/设计阶段不再暴露无法安全回填的付费生图入口，`review` 状态统一解释为“待确认或返工”。

**影响面**：`app/api/production.py`、`web/src/pages/ProjectsHome.tsx`、`web/src/pages/ProductionHub.tsx`、`web/src/pages/StoryProjects.css`、`web/src/storyPresentation.ts`、`web/src/App.tsx`、`web/src/components/ProjectViewNav.tsx`、`web/src/components/CardDetailDrawer.tsx`、`tests/test_production_readiness.py`；无数据库、环境变量或部署配置变化。

---

## [2026-07-28] fix: 登录失效、队列不可用与画布反向连线收口

- 用户端与管理端共用一次性会话失效闸门：首个 401 清理 token 并 `replace` 到登录页，页面卸载前的其余并发请求直接短路，避免重复跳转和 401 请求风暴。
- Redis 未启动时，API 连接在 1 秒内快速失败并进入 30 秒熔断窗口；已知队列不可用只记录单行告警，worker 仍保留宽容重试，避免可选队列拖慢请求或刷满日志。
- 自由画布从节点入口拖到空白处新建节点时，自动把新节点作为上游并反转边方向；从出口拖出时维持原方向。

**影响面**：`web/src/api.ts`、`web/src/adminApi.ts`、`web/src/sessionGuard.ts`、`web/src/pages/Canvas.tsx`、`app/api/tasks.py`、`app/core/queue.py`、`app/tasks/worker.py`；无 API 路由、数据库、环境变量或部署配置变化。

---

## [2026-07-28] content: 《九陆纪元》V3 当前图片快照先行入库

- 将项目 `7666b0e8` 切换为 `nine_continents_cataclysm_v3_clean_rework` 世界观型 GC，锁定无实体树干、无中心的九陆量子羁绊网视觉定义。
- 当前先行入库 W01–W14 共 14 张 9:16 正式关键帧、V3 视觉圣经、逐图提示词、SHA-256 资产清单和接触表；其中 8 张降 AI 感重做图同时保留替换前版本与候选记录。
- 补齐旧版 S16B、S16C、S17A、S17B、S17C 五张缺失关键位；旧 V2 AI 风格图移入可恢复归档，不删除生产历史。
- 本批仅固化当前已生成图片进度，后续图片继续独立增量提交，不再阻塞平台代码推送。

**影响面**：`data/production/7666b0e8/` 的项目配置、生产卡、V3 规范/清单、当前图片、候选与归档；无 API、数据库、环境变量或部署配置变化。

---

## [2026-07-28] feat: 《铁心恋人》建立漫剧前置资产与逐级审核门禁

### 前置视觉资产

- 明确废止“单张人物全身图代替三视图、单机位环境图代替场景设定包、文字三镜卡代替逐镜分镜图”的旧生产口径。
- 为沈曜、凌昊、韩少卿建立 6 套正面/严格侧面/背面的服装三视图候选，并把 168/185/180 cm、固定伤疤、耳钉、耳后接口和批准服装写入统一规格。
- 场景资产改为 A 主视图、B 轴线反打、C 功能侧视、剧情功能房/动作位和 PLAN 俯视图的多视角包；候选与导演批准状态独立记录，文件存在不能自动放行。
- 对全部活动候选执行独立逐图预检：凌昊居家三视图重做至 v5 并锁定纯深灰裤装、右耳后接口和收腰白 T；沈曜两套因右眉尾旧伤与右耳单耳钉仍不可稳定核验，状态改为 `rework`，不得送审。
- 修复三处场景连续性硬冲突：屋顶 C_RIGHT v2 使用相反方向低层城区/山线；公寓车库 PLAN v2 锁定车头朝防火门并倒车驶向坡道；瀚宇实验室 C/PLAN v2 将唯一方舱统一到东北象限。
- 逐镜任务按 EP/G/段显式绑定场景功能视图，不再用整组镜头文字猜机位；修正 EP04、EP08 两处跨场景切镜的真实场景、出镜角色和硬切输入。
- 将原 72 张“一卡三镜”文字分镜迁移为 216 张“一镜一卡、一镜一图”任务，生产卡总数由 241 调整为 385。

### 媒体生产与验收

- 新增分镜图生成器；首帧必须等待同组 A/B/C 三张分镜当前版本全部通过，视频必须继续等待首帧、视频提示词及全部上游资产通过。
- 图片审核记录新增当前文件 SHA-256 与生成规格指纹；同一路径覆盖、参考图或提示词变化后，旧审核结果自动失效。
- 视频远端任务、片段文件和单集合成均绑定依赖指纹；旧任务不能跨规格复用，过期成片会先归档再重合成。
- 视频模型进入任务版本；部分完成的 G 只续跑缺失段。付费提交前写 WAL 并使用跨进程领取锁，下载候选经 720×1280、4.5–5.5 秒和音轨校验后独占发布，异常中断可安全收养。
- 单集合成实时复核 18 段的磁盘哈希和交付批准，锁定输入后独占发布，并以 89–91 秒、720×1280 和音轨作为技术硬门；片段审批撤销会使已批准单集失效。
- 上游角色、场景、分镜或首帧审核一旦撤销，相关视频段与成片立即失效；场景候选路径只允许位于项目 `assets/scenes` 下，缺少局部候选视图只阻塞引用该视图的镜头，不再拖垮整份清单。
- 最终验证器现在用 Pillow 完整解码静态图片，不再因机器缺少 `ffprobe` 把 PNG 误判为损坏；并拒绝伪装格式、动图、短边低于 720px 的文件，竖屏图额外要求 9:16（容差 0.01）且高度至少 1280px。同时逐文件检查场景包所有 required view，拒绝路径越界、缺图、不同视图复用同一文件内容，并要求角色三视图为横向设定板。视频时长、画幅和音轨仍由 `ffprobe` 检查，视觉语义仍保留人工审批。
- 最终 QA 改为精确硬门禁：6 套三视图、8 套场景包、216 张分镜、72 张首帧、216 段视频和 12 集成片均须为当前版本且完成对应人工批准，普通检查清单不再等同于批准。

### 影响面

- API：`app/api/production.py` 的图片评审元数据新增 `file_sha256`、`spec_fingerprint`；无路由、数据库、环境变量或部署变化。
- 脚本：`complete_tiexin_s1.py`、`prepare_tiexin_media.py`、`render_tiexin_storyboards.py`、`render_tiexin_media.py`、`render_tiexin_videos.py`、`validate_tiexin_media.py`。
- 项目：`data/production/tiexin-s1/cards.json`、`media_manifest.json`、`qa/`、前置资产规格、视觉圣经、角色三视图和场景设定包；本批先行入库 103 张已生成图片（含后续补入的沈曜面部 v4 候选），审核状态仍区分 `candidate` / `rework`，不冒充最终验收成品；新增逐图预检记录。

---

## [2026-07-27] art: 《铁心恋人》核心角色升级为神颜 v3

- 重做沈曜、凌昊、韩少卿三张面部身份母版和六张日常/任务/居家全身母版；旧版继续保留，v3 成为后续首帧唯一权威身份参考。
- 将角色 DNA 从“写实普通演员”升级为“神颜级商业短剧主演”：沈曜明艳锋利、凌昊冷欲神性、韩少卿斯文危险，并明确手机小屏第一秒颜值、头肩比和动态侧脸验收标准。
- 已生成的旧角色首帧不再视为有效交付，需使用 v3 母版重新生产。

**影响面**：`scripts/complete_tiexin_s1.py`、`scripts/prepare_tiexin_media.py`、
`data/production/tiexin-s1/视觉圣经_v1.md`、角色母版、生产卡和媒体清单；
无 API、数据库、环境变量或部署变化。

---

## [2026-07-27] feat: 《铁心恋人》全季视觉母版与可恢复媒体生产链

### 视觉与生产资产
- 为 `tiexin-s1` 落盘 9 张角色身份/服装母版与 8 张场景母版，新增视觉圣经，统一为真实中国都市、动作爱情、克制近未来科技的真人竖屏基调。
- 建立 72 个 G 单元首帧、216 个 5 秒视频段和 12 个 90 秒单集的确定性媒体清单，并把已经存在的资产幂等回写 241 张生产卡。

### 媒体执行与安全
- OpenRouter 图片服务新增仓库内多参考图 `input_references`，视频服务新增仓库内首帧输入；本地绝对路径不会进入请求体，只发送编码后的图片内容。
- 新增首帧批量器、A→B→C 末帧承接视频批量器和 FFmpeg 单集自动合成；远端视频任务号持久化，异常中断后只同步已有任务，不重复付费提交。
- 图片和视频脚本必须显式传入 `--confirm-external-upload`，提醒操作者确认本地创作素材外传与模型费用。
- 新增全季媒体 QA 脚本，检查文件数量、竖屏分辨率、片段/单集时长和音轨，并保留角色一致性、连续性、口型与人体结构人工验收项。

### 影响面
- 服务：`app/services/openrouter_media.py`；无 API、数据库、环境变量和部署变化。
- 脚本：`prepare_tiexin_media.py`、`render_tiexin_media.py`、`render_tiexin_videos.py`、`validate_tiexin_media.py`。
- 项目：`data/production/tiexin-s1/assets/`、`media_manifest.json`、`qa/`、`视觉圣经_v1.md`、`README.md`、`cards.json`。

---

## [2026-07-25] content: 《铁心恋人》第一季全季生产包补齐

### 全季内容
- 将 `tiexin-s1` 从只有 EP01 剧本及 G1–G2 生产卡，补齐为 12 集 × 90 秒的完整第一季。
- 完成 72 个 15 秒 G 单元，每个 G 拆为 A/B/C 三个 5 秒独立镜头，共 216 个可生成镜头段。
- 补齐 EP01 G3–G6，以及 EP02–EP12 的完整剧本、分镜卡、首帧图片提示词和视频提示词。
- 故事弧统一为「激活→磨合→抉择」：凌昊从服从型军用仿生人走向自主选择，沈曜始终掌握行动权并最终拒绝所有权逻辑。

### 生产规范
- 新增沈曜公寓/地下车库、物流仓库、城市高架/服务通道、瀚宇总部、瀚宇核心实验室 5 张场景卡，全季共 3 张角色卡、8 张场景卡。
- 视频提示词按 Seedance 2.0 Pro 的 5 秒生产单元编排，统一 9:16、720p、生成音频，并明确使用 `image_url` 绑定稳定身份和承接上一段末帧。
- 新增幂等生成脚本和项目 README；脚本按逻辑键更新卡片，重复执行不会制造重复内容。

### 影响面
- `data/production/tiexin-s1/cards.json`：总计 241 张生产卡。
- `data/production/tiexin-s1/铁心恋人_S1_12集制作剧本.md`：新增全季合并制作剧本。
- `data/production/tiexin-s1/README.md`：新增生产规格、完成度和重生成说明。
- `scripts/complete_tiexin_s1.py`：新增第一季生产卡生成器。
- 无 API、数据库、环境变量和部署方式变化。

---

## [2026-07-25] fix: admin 进程读不到 .env，导致两进程 token 互不认账

### 症状
登录后立刻被踢回登录页，或前台能用但管理端接口一直 401。

### 根因（两层）
1. **`admin/config.py` 从不加载 `.env`。** 该模块用裸 `os.environ.get("ADMIN_SECRET")`，且常量在**模块导入时**求值。独立的 admin 进程（`uvicorn admin.main:app`）不经过 `app/config.py`，而 `load_dotenv()` 只写在那里——于是 admin 侧永远读不到 `.env`，静默落到 `or secrets.token_hex(32)` 随机分支。`app/core/auth.py:13-14` 的注释早已预告这个坑，但没人补加载。实测：写好 `.env` 后 `uvicorn app.main` 读到的值 MATCH，`uvicorn admin.main` 却 MISMATCH。
2. **孤儿 uvicorn 子进程堆积。** `--reload` 模式是父(reloader)+子(server)。杀父不杀子，子进程继承监听 socket 继续服务，而 netstat 仍报已死父进程的 PID（表现为"幽灵端口"）。本机一度在 8000 上并行着 3 个孤儿、8001 上 2 个，**每个各自随机生成 ADMIN_SECRET**：登录请求落到进程 A 拿到 token，下一个请求被分发到 B → 签名校验失败 → 踢回登录页。

### 修复
- `admin/config.py` 顶部加 `load_dotenv(BASE_DIR / ".env")`，放在所有 `os.environ.get` 之前。
- 本机 `.env` 补上固定的 `ADMIN_SECRET`（`.env.example:24` 本就预留了该键，只是一直空着）。

### 排障要点（下次直接用）
- **"幽灵端口"**：netstat 显示 LISTENING 但 `tasklist` 查无此 PID，且端口仍有真实响应 → 找孤儿子进程，不是 Docker/WSL。用 `Get-CimInstance Win32_Process -Filter "Name='python.exe'"` 列**全部** python 进程按父 PID 反查；孤儿的命令行是 `-c "from multiprocessing.spawn import spawn_main..."`，**不含 "uvicorn" 字样**，按关键字过滤会漏掉。
- 用「不带 token 打受保护接口」去判断多进程密钥是否一致是**无效测试**——任何进程都返回 401，没有区分力。

### 影响面
- `admin/config.py`（+6 行）。无 API/表结构/前端变化。
- 行为变化：配置了 `ADMIN_SECRET` 时，admin 进程从"每次启动随机"变为"读 `.env` 固定值"，重启不再令已发 token 失效；未配置时行为不变（仍随机）。

---

## [2026-07-25] fix: 全站可用性 Bug 修复——弹窗自动弹出 / 员工名缺失 / 画布连接点

### 弹窗加载即自动弹出（10 个页面 13 处 Modal）
- 症状：进入页面时编辑弹窗自己打开，必须先关掉才能操作。
- 根因：`<Modal>` 同时写了 `forceRender` 和 `destroyOnHidden`，两者语义矛盾。`forceRender` 会在首次打开前就把弹窗 DOM 渲染出来，在 React StrictMode + Vite HMR 的双重挂载周期里触发了 CSS 展开动画。
- 修复：移除全部 `forceRender`，保留 `destroyOnHidden`。涉及 `Employees` / `Workflows` / `AutoLearn` / `ArticleLearn` / `Teams` / `Tools`(×3) / `Memory` / `Settings` / `admin/AdminUsers` / `admin/AdminRoles` / `admin/AdminProviders`。
- **已验证不影响表单回填**：这些页面普遍是 `form.setFieldsValue(...)` 紧接 `setOpen(true)`，看似依赖 `forceRender` 预挂载 Form，实则不然——`useForm()` 的 FormStore 存在页面组件的 `useRef` 上（`rc-field-form@2.7.1` useForm.js:886-900），不随 Modal 卸载；Form 挂载时 `setInitialValues` 走 `merge(initialValues, this.store)`（useForm.js:97），**store 优先于 initialValues**。唯一会丢值的分支是 `preserve={false}` 下被卸载的字段，全仓只有 `Settings.tsx` 用了 `preserve={false}`，而它本来就有 `pendingFormValues` + `useEffect` 延迟回填兜底。另：`destroyOnHidden` 每次关闭都会卸载 Form，所以 `forceRender` 本来就只在“第一次打开”生效，若真会丢值，第二次之后的编辑早就坏了。

### 数字员工列表名称为空时不可点击
- 症状：`name` 为空的员工，列表里那一格是空白，点不到详情。
- 修复：`Employees.tsx:206` 渲染改为 `{v || record.employeeKey}`，缺名时回退显示员工标识。

### 画布节点连接点被裁切
- 卡片容器的 `overflow: hidden` 会把贴边的 React Flow `<Handle>` 裁掉，导致连线不好拖。
- 移除 `DataNode` / `StoryboardNode` / `ImageNode` 外层的 `overflow: hidden`（图片本身的圆角裁切改由内层容器负责），并统一连接点尺寸为 `HANDLE_SIZE = 10`，四类节点共用 `handleBase`。
- 同步移除工作流 `WorkflowNodeCard` 外层的 `overflow: hidden`，由头部色块自身圆角维持视觉效果，避免左右连接点被裁切。

### 一个不是代码 Bug 的排查结论
- 「常用指令暂时无法加载」不是前端问题：后端进程陈旧导致 `quick_prompts` 路由未注册，请求被 `main.py` 的 SPA fallback（`@app.get("/{full_path:path}")`）兜走返回了 HTML，前端 JSON 解析失败。**重启后端即恢复**，无需改代码。排查时注意 token 存在 localStorage 的 `user_token`（不是 `agent_token`），且 `ADMIN_SECRET` 未写入 `.env` 时每次重启随机生成，旧 token 会签名校验失败。

### 影响面
- 仅前端 `web/src/`：10 个页面 + `components/canvas/CanvasNodes.tsx` + `components/workflow/WorkflowNodeCard.tsx`。
- 无 API、数据库、环境变量、部署配置变化。`tsc --noEmit` 通过。

---

## [2026-07-24] chore: Art Bible 图片质量审核 + 垃圾归档

### 审核
- 对 `resouce/漫剧/output/` 和 `九陆纪元_90秒自然拆段制作包` 共 50+ 张生产图片按 Art Bible 标准逐张审核
- 检查项：风格锚点句、角色视觉 DNA 一致性、配色权重、正向约束词、禁止清单

### 归档
- 31 张不合格图片 `git mv` 到 `resouce/漫剧/_垃圾箱/`（未删除，可恢复）
- 不合格原因：角色 DNA 完全偏离(7)、风格基调错误(8)、宫格分镜格式(10)、死黑阴影/裂纹(4)、龙设计不一致(2)
- 保留 15 个文件：苍霖母版 ×3、巨龙母版 ×2、龙骨深渊场景 ×1、轨迹图 ×4、轨迹故事版 ×5

### 提示词复盘
- 编写 `_垃圾箱/POSTMORTEM.md`，定位六大根因：风格锚点缺失、角色 DNA 不完整、正向约束词缺失、配色权重未指定、宫格分镜格式错误、配角设计过度黑暗化
- STAGE_INSTRUCTIONS 和 Art Bible Skill 已在上轮注入，重生成时自动生效

---

## [2026-07-24] content: 《九陆纪元》导演级视觉重制 V2

### 剧本、分镜与提示词重构
- 将生产项目 `7666b0e8` 从旧版聚合式概念展示重写为 30 秒完整因果链：世界树共生体衰亡 → 古律要求“献一陆，续八陆” → 烬龙陆被判切除 → 苍霖以龙骨碎片建立生命旁路并拒绝牺牲任何一陆。
- 以当前《九陆纪元视觉宪法 v1》为世界观最高约束，统一世界树为承托九陆的实体生命基础设施、净化为冷青白无菌物质删除、苍霖为 16 岁偏瘦少年。
- 新建 24 个连续镜头、72 个 A/B/C 关键位及对应图片 / 视频提示词，生成 78 张现有看板可读卡片；构建脚本会自动发现已验收的 `S{NN}{A|B|C}.png` 并回写卡片和质检进度。

### 风格锚定、归档与质量门
- 将用户确认的六张风格样片固化到项目内，作为电影级东方暗黑神话、真实旧材质、宏大尺度、受控叙事光的风格参考；正式画面禁止继承样片的宫格、编号和文字。
- V1 原始项目数据与 12 张旧图已建立完整冻结快照；旧图从活动目录迁入可恢复垃圾归档，未删除。视觉审计结论为旧图均不直接进入 V2 正式成片，只保留作构图 / 情绪参考。
- 建立五轴质量门：世界观身份、镜头叙事、风格一致性、尺度空间、技术完整性；任一项低于 4 分或总分低于 22/25 不得进入正式图片目录。
- 已锁定世界树三尺度、九陆剪影、苍霖身份、烬龙 / 巨神 / 潮生剧情场景和净化删除面九组 P0 正式母版；正式关键帧生产按同一母版逐帧推进。

### 文件与影响面
- **生产数据**：`data/production/7666b0e8/project.json`、`cards.json`、`V2_SHOTS.json`、`GC_MASTER_PACKAGE.md`、`STYLE_BIBLE_V2.md`、`IMAGE_PROMPTS_V2.md`、`VIDEO_PROMPTS_V2.md`、`QA_STATUS_V2.json`。
- **资产与恢复**：`style-references/user-approved-2026-07-24/`、`uploads/images/`、`uploads/candidates/`、`uploads/review/`、`archive/style-overhaul-v1-original-2026-07-24/`、`trash/style-overhaul-v2/legacy-v1/`。
- **构建工具**：`data/production/7666b0e8/scripts/build_v2_package.mjs`。
- 仅影响该漫剧项目的生产数据与媒体资产；无 API、数据库、环境变量或部署配置变化。

---

## [2026-07-24] feat: 全局资产卡片可编辑 + Art Bible 风格锁定注入

### ProductionHub 资产卡片编辑
- 制作看板的角色图/场景图/视觉设计卡片从只读 Tag 升级为可点击打开详情 Drawer，支持：图片预览（含历史版本）、提示词编辑（TextArea + 保存/取消）、选择模型重新生图、通过/退回审核（退回需选原因）。
- 新增 `CardDetailDrawer` 通用组件，可复用于任何 ProductionCard；媒体模型列表在打开 Drawer 时懒加载。
- EpisodeDetail 镜头卡片的"立即生图"按钮扩展支持 setting/design 阶段。

### 后端 stage 白名单扩展
- `update_director_image_prompt` 和 `generate_director_image` 的阶段白名单从 `(img_prompt, storyboard)` 扩展为 `(img_prompt, storyboard, setting, design)`，使角色图/场景图/视觉设计卡片可以编辑提示词和重新生图。

### Art Bible 风格锁定
- 新增本地 Skill `.claude/skills/art-bible-prompt/SKILL.md`，在 Claude 对话中写角色/场景提示词时自动注入完整 Art Bible 规则（风格锚点句、角色视觉 DNA、7 个场景设定、4 种配色权重、正向约束词、禁止清单、输出格式模板）。
- 后端 `STAGE_INSTRUCTIONS` 和 `GC_STAGE_INSTRUCTIONS` 的 setting/design 阶段指令注入 Art Bible 硬规则，确保 AI 自动生成的提示词也带风格锁定——杜绝基调漂移和角色走形。

### 影响面
- **后端**：`app/api/director.py`（白名单扩展）、`app/models/production.py`（STAGE_INSTRUCTIONS 注入）。
- **前端**：新增 `web/src/components/CardDetailDrawer.tsx`；修改 `ProductionHub.tsx`（Drawer 接入）、`EpisodeDetail.tsx`（setting/design 生图按钮）。
- **Skill**：新增 `.claude/skills/art-bible-prompt/SKILL.md`。
- 无数据库迁移、环境变量或部署配置变化。

---

## [2026-07-24] feat: 制作闭环补齐镜头排序、版本回退、协作批注与个人效率

### 镜头调整、恢复与项目备份
- 快速制作新增按集镜头排序：可拖拽，也可用上移/下移按钮在键盘和手机上调整；保存时一次性重编号同集所有阶段卡片，并使旧成片进入需重新合成状态。
- 项目新增可读的版本历史：手动保存版本，且在 AI 覆盖生成、镜头提示词修改、关键卡片字段更新、镜头排序和版本回退前自动留档；回退操作会先保存“回退前”保护点，再恢复项目与全部卡片。
- 快速制作新增项目 ZIP 导出，包含项目配置、卡片元数据、批注、历史版本和项目目录内的本地图片/视频；导出文件名与 ZIP 内路径均做安全收敛，临时文件在响应结束后清理。

### 协作、查找与常用指令
- 制作看板顶部新增服务端关键词、阶段、状态、集数和负责人筛选；请求带防抖与递增序号，慢请求不会覆盖当前项目或新条件，手机端保持紧凑双列布局。
- 制作卡片新增项目级批注入口，可留言、标记已解决或重新打开；评论计数一次加载整个项目，打开卡片后才读取正文，避免卡片多时产生 N+1 请求。
- 数字员工工作台新增账号隔离的常用指令：可把当前输入保存为全局或指定员工短语，点击插入光标位置，并支持编辑、删除和失败重试；手机端同样可使用。

### 接口、存储与影响面
- **新增 API**：`PUT /api/v1/agentapp/director/projects/{pid}/shots/order`；`GET/POST /api/v1/agentapp/production/projects/{pid}/versions`；`POST /api/v1/agentapp/production/projects/{pid}/versions/{version_id}/restore`；`POST /api/v1/agentapp/production/projects/{pid}/export`；`GET /api/v1/agentapp/production/projects/{pid}/comments`；`POST /api/v1/agentapp/production/projects/{pid}/cards/{card_id}/comments`；`PATCH /api/v1/agentapp/production/projects/{pid}/comments/{comment_id}`；`GET/POST/PUT/DELETE /api/v1/agentapp/quick-prompts`。
- 版本与批注分别写入项目目录的 `versions/`、`comments.json`；常用指令按登录用户名哈希后写入 `data/quick-prompts/`，账号名不直接进入文件路径。
- 项目与账号文件写入增加进程内互斥；图片、视频、合成和 AI 阶段生成等长耗时调用结束后会重新读取最新状态再合并，过期任务结果单独保留而不会覆盖当前版本。镜头排序支持乐观并发校验，审核只接受当前图片，版本恢复失败会自动回滚。
- **影响面**：用户端生产与导演 API、路由注册、快速制作、制作看板、数字员工工作台和前端 API 类型；无数据库迁移、环境变量或部署配置变化。
- **验证**：完整后端回归 221 项通过；`tsc -b` 与 Vite 生产构建通过。独立服务完成登录、项目列表、导演状态、版本、批注、筛选、常用指令与 ZIP 导出的 HTTP 冒烟，生产静态资源均可加载且三个新增功能分包已写入构建产物；应用内浏览器策略拒绝访问该独立本地端口，因此本轮未重复执行桌面/手机渲染点击和像素级视觉回归。

---

## [2026-07-24] feat: 快速制作补齐镜头返工、审核与交付提醒

### 镜头级返工与审核
- “镜头审片台”支持直接编辑并保存画面主提示词、单镜头重新生图，以及单镜头视频生成/失败重试；编辑草稿与后台刷新隔离，保存失败不会丢失未提交内容。
- 镜头卡片内新增画面“通过 / 退回”入口；退回必须选择标准问题原因，可补充说明，审核明确绑定当前展示图片。通过会关闭待处理项，退回会把图片卡送回返工状态。
- 新增专用主提示词更新接口，仅替换图片卡 `prompts[0]`，保留同卡其余提示词、正文与元数据，避免通用整字段更新误删生产资料。

### 版本有效性、交付与通知
- 单镜重生图后，来源不匹配的旧视频和旧成片不再计入当前完成度；重新生成视频后，旧成片也会标记过期。合成接口会拒绝混入过期镜头，防止下载到画面与视频不一致的交付物。
- 成片预览新增“下载成片”，使用同源媒体地址和项目名生成安全文件名；跨域媒体采用安全新窗口降级。
- 导演页自动同步进行中的视频任务，并仅在状态真正迁移到完成/失败时提示；全局后台任务提醒首屏只建立基线、页面隐藏时暂停、故障后指数退避，避免历史消息轰炸和可选队列不可用时的高频请求。

### 接口与影响面
- **新增 API**：`PUT /api/v1/agentapp/director/projects/{project_id}/cards/{card_id}/image-prompt`。
- **行为调整**：`POST /api/v1/agentapp/production/projects/{pid}/cards/{card_id}/review` 会同步维护返工状态；`GET /api/v1/agentapp/director/projects/{project_id}` 新增当前图片审核结果、视频/成片过期状态并收窄图片待处理计数；成片合成会校验所有镜头均为当前有效版本。
- **前端影响**：快速制作镜头卡片、媒体选择弹窗、成片区与全局登录后布局；无数据库迁移、环境变量或部署配置变化。
- **验证**：完整后端回归 209 项通过；`tsc -b` 与 Vite 生产构建通过。内置浏览器在 1280px / 390px 下完成提示词编辑取消、单镜生成弹窗、退回原因必填、桌面/窄屏布局与控制台检查，无全页横向溢出、破图或控制台错误；本地 Redis 队列未启动，因此数字员工任务的真实完成迁移未做端到端触发。

---

## [2026-07-24] fix: 收紧移动分流文案与窄屏面包屑

- Workbench 手机端明确说明当前页面可以正常聊天，漫剧制作应切到“快速制作”，避免用户误以为手机端不能完成翻译、调研和文案等通用任务。
- 高级页面面包屑固定为单行，在窄屏上以横向滚动承载长标题，不再因名称过长折成两行。
- **影响面**：仅前端 Workbench 移动提示与高级页面面包屑样式；无 API、数据库或部署配置变化。

---

## [2026-07-23] fix: 新手路径二次收口——入口分工、目标前置与高级上下文

### 入口分工与任务用语
- “找数字员工帮忙”页顶部明确说明它处理翻译、调研、写文案等通用任务，并提供“去快速制作”入口；手机安全页同步说明两类对话入口的职责。
- 高级中心、学习中心和页签统一使用“给员工补充参考资料 / 收集优秀提示词 / 学习专业文章”，避免“资料、学习、采集”在同一条路径中反复换词。
- 高级中心卡片、侧栏归属和面包屑改为共用一份路由注册表，后续调整标题时不会再次出现入口与落地页名称漂移。

### 制作目标与高级返回链路
- 今日工作空状态把“先选择这次要做到哪一步”前置为第一步；快速制作的新建弹窗把三种交付目标提升为顶部目标卡，并明确只推进到选定阶段，不会自动继续消耗图片或视频额度。
- 所有高级子页面和工作流编辑深链新增“今日工作 → 任务中心 → 当前任务”面包屑；直接从收藏夹打开也能恢复来源与返回路径。
- 高级权限过滤后按 0 / 1 / 2+ 个任务中心自适应：没有则隐藏，仅一个则直接显示在主导航，两个及以上才使用“高级功能”折叠区。
- 移动导航在抽屉完成可见渲染后把焦点送入第一个任务入口，Esc 关闭后归还菜单按钮，避免打开后键盘焦点仍停留在遮罩外。

### 影响面
- **前端影响**：今日工作、快速制作、数字员工工作台、参考资料学习中心、高级任务中心、侧栏导航与高级子页面。
- **接口影响**：无 API、数据库、环境变量或部署配置变化。
- **验证**：`tsc -b && vite build` 通过；Chrome 在 1440px / 390px 下完成入口跳转、旧地址、直接深链、目标键盘选择、0 / 1 / 2+ 权限导航及抽屉焦点回归，无控制台错误、页面异常、失败请求或全页横向溢出。

---

## [2026-07-23] feat: 用户体验收口——项目偏好持久化、四类高级任务中心与安全降级

### 制作主线与今日工作
- 制作项目新增 `production_goal`（`storyboard / images / final`）和 `pinned`；创建、列表、详情、更新与导演状态统一返回，旧项目只在响应中应用安全默认值，不会因 GET 读取偷写历史文件。
- 快速制作不再用浏览器 `localStorage` 记目标：新建时随项目保存，切换目标立即更新后端，失败自动回滚；页面中的制作步骤、镜头状态和交付文案全部改为任务语言。
- 今日工作按“团队置顶 → 制作信息缺失 → 最近更新”排列重点项目，增加置顶、制作目标标签和首个项目三步引导；置顶支持并发请求隔离和失败回滚。
- 首页生产数据及深链动作统一受 `production:manage` 保护；无制作权限账号只看到明确权限说明，不再通过首页绕过侧栏边界。

### 导航与页面职责
- 原高级区 13 个平级入口收敛为“增强数字员工 / 设计自动化工作 / 查看运行与任务 / 配置系统能力”4 个任务中心；新增 `/advanced/:section` 聚合路由，旧深链继续兼容并正确高亮。
- “知识图谱 / 自我进化 / 知识库”等系统词在用户入口改为“员工能力关系 / 改进数字员工 / 参考资料”；员工能力关系的手机列表可直接看到关系类型和对端对象。
- 高级聚合页和侧栏按权限双重过滤；移动抽屉支持焦点进入、Esc 关闭、焦点归还和隐藏态不可聚焦。

### 错误态、移动端与可访问性
- 制作列表、项目详情、完整性检查、归档、学习来源/记录、员工参考资料、趋势记录等页面显式区分“加载失败”和“真实为空”，错误态提供重试，不再用空数据掩盖接口故障。
- 员工列表与其工具/技能/团队/模型辅助配置改为局部降级；改进建议与分析记录分开加载，辅助接口失败不再隐藏核心数据。
- 对话工作台、素材画布、员工能力关系和自动化编辑器在窄屏提供可浏览、可返回的安全替代界面，不再只显示“请在桌面端使用”。
- 登录页改为语义化表单，补齐可见标签、自动填充属性、持久错误提示和一级标题；异步区域补充 `aria-live` / `role=status`，图标按钮补充可访问名称和最小点击区。
- 响应式断点在首帧即读取真实屏宽，消除移动端先渲染桌面侧栏造成的布局跳动；素材画布把 ReactFlow 尺寸测量与真实内容变更分开，无操作浏览不再触发自动 PUT 或刷新 `updated_at`。

### 验证与影响面
- 新增 `tests/test_production_project_preferences.py`，覆盖创建、更新、导演状态、旧项目默认值及 GET 无写入副作用。
- TypeScript compiler API 全项目检查为 0 diagnostics；并完成桌面与 375/390px 浏览器路由、权限、错误态和横向溢出检查。
- **API 影响**：`POST/GET/PUT /api/v1/agentapp/production/projects*` 与 `GET /api/v1/agentapp/director/projects/{pid}` 新增项目偏好字段；无数据库迁移、环境变量或部署配置变化。
- **前端影响**：导航、登录、今日工作、快速制作、制作三视图、学习中心、员工管理、能力关系、改进建议、趋势、素材画布、自动化编辑器与对话工作台。

---

## [2026-07-23] feat: 新手主线重构——任务式导航、目标式快速制作与友好错误

### 用户入口与导航
- 默认入口由 `/studio` 调整为行动导向的 `/dashboard`，任何已登录角色都能先看到“今日工作”，再按权限进入具体任务。
- 默认侧栏精简为“今日工作、快速制作、我的项目、整理素材、找数字员工帮忙、管理数字员工”；系统能力统一归入“AI 能力 / 自动化与运维”。
- 移除全局“链路诊断”入口；项目总览、制作流水线、完整性检查改为项目内统一三视图导航。
- 新增知识学习中心 `/learning`，用“采集优秀提示词 / 学习专业文章”页签聚合原两套功能；`/auto-learn`、`/article-learn` 保留兼容跳转。

### 核心制作主线
- “导演 Agent”改为任务术语“快速制作”，建项时可选“完成文字分镜 / 生成镜头图片 / 制作完整成片”。
- 目标按项目保存在浏览器本地；达到选定阶段后停止继续推动，并提供“继续制作成片”显式动作。
- 今日工作可把指定项目带入快速制作；流水线读取路由中的项目 ID，切换项目时同步更新 URL，避免打开深链后误选第一个项目。
- 新增 `/production/:pid/matrix`，完整性检查保持当前项目上下文；旧 `/production/matrix` 继续兼容。

### 错误体验
- 新增统一浏览器请求错误层，区分断网、服务不可用、超时、HTTP 业务错误、权限不足和登录失效。
- 用户端、管理端、登录与文件上传全部收口，不再直接展示 `Failed to fetch`、`AbortError` 或 JSON 解析异常。
- 登录成功必须同时完成权限缓存，避免出现 token 已写入但导航权限尚未就绪的半登录状态。

**影响面**：前端默认路由、侧栏导航、快速制作、制作项目三视图、知识学习入口、用户/管理 API 请求封装；新增前端路由 `/learning`、`/production/:pid/matrix`，无后端 API、数据库或部署配置变更。

---

## [2026-07-23] feat: 素材侧栏面板——拖拽添加节点/工具栏精简

### 新增
- **CanvasSidebar 组件**：左侧素材面板，展示 4 种节点(数据/分镜/便签/分组)+ 从看板导入 + 上传图片
  - 支持拖拽到画布(dataTransfer + screenToFlowPosition)和点击添加两种方式
  - 可折叠为 36px 图标条，展开时 160px 带描述文字
  - 底部提示"拖拽到画布 或 点击添加"
- **布局重构**：画布区域从纯纵向 flex 改为 sidebar(左) + canvas(右) 水平布局

### 改进
- **工具栏精简**：移除"添加素材"区(数据/分镜/便签/图片/从看板导入 5 个按钮)，功能全部收进侧栏
- **更多菜单精简**：移除"分组框"选项(已在侧栏)
- **函数声明顺序修正**：addStoryboardNode/addGroupNode 移至 handleCanvasDrop 之前，消除 TS2448 错误

**影响面**：新增 `CanvasSidebar.tsx`；Canvas.tsx 布局+工具栏重写；无后端改动。

---

## [2026-07-23] refactor: 画布工具栏 UX 重构——分组布局/更多菜单/空画布引导

### 改进
- **工具栏分组**：19个按钮平铺→分 3 组(添加素材 / 排版 / 更多)，每组有标签和分隔线
- **更多下拉**：低频工具(分组框/编号/网格/连线样式/JSON导出/PNG导出/快捷键)收进 Dropdown 菜单
- **空画布引导**：从一句话提示改为居中卡片——标题+说明+三个快速操作按钮(写创意/从看板导入/贴图)
- **Button.Group→Space.Compact**：消除 Antd 5 deprecation 警告

**影响面**：Canvas.tsx 工具栏区域重写；无后端/组件改动。

---

## [2026-07-23] feat: 画布导演工位终极补齐——分组色板/边删除/自动编号/快捷键帮助

### 新增功能
- **分组节点色板**：GroupNode 内嵌 6 色选择器(indigo/emerald/amber/rose/sky/slate)，点击色点即时切色，边框/标题/MiniMap 联动
- **连线(Edge)选中删除**：Delete/Backspace 同时删除选中的节点和选中的边，修复了之前只删节点不删边的遗漏
- **分镜自动编号**：工具栏 sort-ascending 按钮，按位置(行优先→列)重编所有分镜节点为 G1/G2/G3...
- **快捷键帮助面板**：工具栏 ❓ 按钮弹出 Modal，列出全部 20+ 快捷键
- **右键菜单增强**：对数据/分镜节点显示「AI 派生」和「回写看板」；对所有节点显示「锁定/解锁」切换

### 组件变更
- `CanvasNodes.tsx`：新增 `GROUP_COLORS` 6 色数组 + `resolveGroupColor` 工具函数，GroupNode 完全重写为色彩感知
- `Canvas.tsx`：新增 `autoNumberStoryboards` 回调、`shortcutsOpen` 状态、快捷键 Modal、`handleKeyDelete` 修复边删除、`minimapNodeColor` 分组色联动

### 性能
- GroupNode 色板切换走 `updateNodeData` 不触发全局重排
- 自动编号仅读取 storyboard 类型节点，排序+批量更新一次性完成

**影响面**：Canvas.tsx + CanvasNodes.tsx 前端组件；无后端改动，无新 API。

---

## [2026-07-23] feat: 视觉资产补全——PWA 图标/404 页/apple-touch-icon

### 新增资产（Codex image_gen 生成）
- **icon-512.png**（512×512）— PWA 安装/启动屏图标
- **icon-192.png**（192×192）— PWA 安装小图标
- **apple-touch-icon.png**（180×180）— iOS 添加到主屏幕图标
- **empty-404.svg** — 404 页面星球裂纹插画

### 新增页面
- **NotFound.tsx** — 全局 404 兜底页面，显示 empty-404.svg 插画 + "返回首页"按钮

### 配置变更
- **App.tsx** — 新增 `<Route path="*">` 兜底路由指向 NotFound
- **manifest.json** — 新增 192/512 PNG 图标条目（Android/Chrome PWA 安装必需）
- **index.html** — apple-touch-icon 从 favicon.svg 改为 apple-touch-icon.png（iOS 不支持 SVG touch icon）

**影响面**：前端路由 + PWA 安装 + iOS 主屏书签；无后端改动。

---

## [2026-07-23] feat: 画布 UX 九项增强——快捷键/导出/缩放/自动连线

### 新增功能
- **Ctrl+C / Ctrl+V 复制粘贴**：选中节点 Ctrl+C 复制到剪贴板(含内部连线)，Ctrl+V 粘贴(自动偏移+60px，ID 重映射保持边关系)
- **剪贴板图片粘贴**：截图后直接 Ctrl+V 粘贴图片到画布(自动上传生成图片节点)
- **方向键微调**：选中节点 Arrow ±1px 移动，Shift+Arrow ±10px 移动，500ms 防抖合并快照
- **PNG 导出**：工具栏📷按钮导出画布为 2x 高清 PNG(过滤 MiniMap/Controls)
- **缩放栏(ZoomBar)**：替代原适配按钮，显示当前缩放百分比 + 放大/缩小/适配视图按钮，支持 Ctrl+0/+/-
- **批量改阶段**：多选工具栏新增「改阶段」下拉，一次性修改所有选中节点的 stage
- **连线样式切换**：工具栏按钮循环切换 bezier⌒/straight╱/step⌐ 三种连线样式，同步更新所有已有连线
- **拖到空白自动建节点**：从 handle 拖出连线到空白区域松手 → 弹出浮动菜单选择节点类型(数据/分镜/便签)，自动创建并连线

### 组件变更
- `SelectionToolbar.tsx`：新增 stageOptions/onBatchStage 属性
- `LabeledEdge.tsx`：支持 data.pathType 动态切换 getBezierPath/getStraightPath/getSmoothStepPath
- `Canvas.tsx`：新增 ZoomBar 组件、6 个 handler、键盘快捷键扩展、连接菜单浮层

### 性能
- 保持前一次提交的 React.memo + ref-proxy 性能优化，新功能全部走 stable callback

**影响面**：Canvas.tsx 主文件 + SelectionToolbar + LabeledEdge；无后端改动。

---

## [2026-07-23] feat: 画布功能全面补齐——对标 Miro/FigJam 级基础能力

### 新增功能
- **撤销/重做**：Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y，基于快照的 40 级历史栈。结构变更(添加/删除/移动/连线)前自动取快照，文本编辑不产生快照(防刷)。
- **多选工具栏**：选中 ≥2 个节点时画布顶部弹出浮动条——左/上/右/底对齐、水平/垂直均分、批量复制/分组/锁定/解锁/删除。
- **便签节点(StickyNote)**：5 色快速备忘(黄/粉/蓝/绿/紫)，点色块切换颜色，支持锁定。
- **连线标签(LabeledEdge)**：双击连线添加/编辑标注文字，Escape 取消，自动持久化到 edge.data.label。
- **画布复制**：工具栏复制按钮 → 后端 POST /duplicate，含全部节点/连线。
- **画布重命名**：工具栏编辑按钮 → PATCH /canvases/{cid}，仅改名不动节点。
- **节点锁定**：右键菜单 / 多选工具栏锁定，锁定后不可拖动不可编辑(draggable=false + 输入框 disabled)，半透明视觉标记。
- **对齐网格**：工具栏开关，开启后节点吸附 18px 网格。
- **导出 JSON**：工具栏下载按钮，导出当前画布全部节点+连线为 JSON 文件。
- **全选**：Ctrl+A 选中全部节点。
- **适配视图**：画布右上角按钮，一键 fitView。
- **右键菜单增强**：新增「锁定/解锁」条目。
- **Delete 键改进**：先取快照再删除，删除操作可撤销。

### 后端变更
- `CanvasEdge` 模型新增 `data: dict` 字段(存连线标签等扩展数据)。
- 新增 `PATCH /canvases/{cid}` 重命名端点。
- 新增 `POST /canvases/{cid}/duplicate` 复制端点。

### 前端新文件
- `web/src/hooks/useCanvasHistory.ts` — 撤销/重做 hook
- `web/src/components/canvas/SelectionToolbar.tsx` — 多选浮动工具栏
- `web/src/components/canvas/LabeledEdge.tsx` — 带标签的贝塞尔连线
- `web/src/components/canvas/CanvasNodes.tsx` — 新增 StickyNote + CanvasActions.updateEdgeLabel

**影响面**：Canvas.tsx 全面重写；canvas.py 增加 2 个端点 + 模型字段；api.ts 增加 2 个方法。

---

## [2026-07-23] feat: 画布核心三件套——分镜连续预览 + 节点分组框 + 右键快捷键

- **分镜连续预览条(Filmstrip)**：画布底部横向条，自动提取所有分镜节点按镜号排列，含缩略图/时长/景别，
  点击跳转对应节点(fitView)。工具栏「分镜条」按钮控制开关。
- **节点分组框(GroupNode)**：可缩放虚线框节点(NodeResizer)，用于按场景/段落/集组织节点。
  Ctrl+G 从选中节点自动创建分组(计算边界框)；工具栏有独立「分组框」按钮。
  zIndex=-1 始终在普通节点后方。保存/加载时序列化 style.width/height。
- **右键菜单**：节点右键弹出上下文菜单——AI 派生、复制节点(Ctrl+D)、创建分组(Ctrl+G)、删除(Del)。
  带快捷键标注，鼠标移出自动关闭。
- **键盘快捷键**：Ctrl+D 复制选中节点 / Ctrl+G 从选中创建分组 / Ctrl+F 切换搜索 / Ctrl+S 保存。
  输入框/文本域内不拦截，不干扰正常编辑。

**影响面**：`web/src/pages/Canvas.tsx`（分镜条、分组、右键菜单、快捷键）；
`web/src/components/canvas/CanvasNodes.tsx`（GroupNode 组件 + NodeResizer）。纯前端，无后端变更。

---

## [2026-07-22] feat: 画布功能大幅增强——导演/编剧向生产力工具

- **MiniMap 小地图**：ReactFlow MiniMap 组件，可缩放可平移，按节点类型/阶段着色。
- **节点阶段色带**：DataNode 左侧 4px 色带，颜色与看板阶段对齐（紫=剧本/创意，绿=提示词，橙=生成，红=成片）。
- **分镜格节点(StoryboardNode)**：新节点类型，含镜号、时长、景别(7 种)、运镜(12 种)、画面描述、缩略图槽位。
- **自动排版**：按阶段分列排版，同阶段内按镜号排序。
- **新建画布模板**：4 种模板——空白、分镜板(6 格 G1-G6)、角色设定(核心+3 人物卡)、情绪曲线(10 集连线)。
- **搜索节点**：实时过滤，匹配节点金色高亮，不匹配节点淡化。
- **文件拖拽上传**：直接拖图片到画布创建 image 节点。
- **Markdown 预览**：DataNode 新增 eye/edit 切换按钮，内容可在编辑/预览模式间切换(react-markdown)。
- **节点折叠**：DataNode、StoryboardNode 均支持收起/展开。
- **收件箱安全加固**：inbox_upload 改为 256KB 分块读取 + 50MB 单文件上限，防止大文件内存溢出。

**影响面**：`web/src/pages/Canvas.tsx`、`web/src/components/canvas/CanvasNodes.tsx`（前端）；
`app/api/production.py`（后端 inbox_upload 安全加固）。新增 `tests/test_production_inbox.py` 超限测试。
无数据库表或环境变量变化。

---

## [2026-07-22] fix: 部署后 Nginx 仍指向旧应用容器导致 502

- 生产部署重建 `app` / `admin` 后强制重建 Nginx，使配置挂载、Docker 网络和静态 upstream
  全部基于新容器重新建立，避免 Nginx 持续代理到已删除容器并返回 502。
- 部署脚本新增经过 Nginx HTTPS 代理链的容器内 `/healthcheck` 等待：最多等待 60 秒；失败时自动
  输出 app/nginx 状态与最近 200 行日志并退出，不再把“直连 app 正常”误判为公网链路可用。

**影响面**：`scripts/deploy-server.sh` 生产部署健康验证；无 API、数据库表、环境变量或端口变化。

---

## [2026-07-22] feat: 单集 burn-down 进度条——每个 G 单元距成片还差什么

- EpisodeDetail.tsx 新增「成片收口 N/M」进度条和 per-G Tag 列表。
- 每个 G 检查 6 项：剧本、分镜、首帧图、图片审核通过、视频提示词（非 superseded）、视频。
- 缺 ≥3 项红色、1-2 项橙色、全齐绿色；hover 展示具体缺什么。
- 纯前端从已加载 cards 中推导，无新 API。

**影响面**：仅 `web/src/pages/EpisodeDetail.tsx`，无后端变更。

---

## [2026-07-22] feat: 收件箱批量回填——按文件名自动分拣挂卡

**动机**：平台有「导出提示词」出口但回填入口只能逐卡手动上传，一集几十个外部生成的图/视频
文件（小云雀/即梦）拖回来是每天的摩擦。

- **后端** `POST /production/projects/{pid}/inbox/upload`：接收多文件 + 可选 `default_episode`，
  每个文件经 `parse_inbox_filename()` 解析文件名 → `resolve_inbox_target()` 在卡池中定位目标卡，
  命中的持久化到 `uploads/` 并追加到卡的 images/videos，未命中的返回原因。
- **文件名约定**：EP01_G03_首帧.png / EP01_G1-A.mp4 / TB1.png / EP01_G3_分镜.jpg 等，
  大小写不敏感，支持首帧/末帧/分镜/视频/基调板五种类型自动识别。
- **前端** EpisodeDetail.tsx 工具栏新增「收件箱」按钮，弹出拖拽上传 Modal，上传后展示
  matched/unmatched 分拣结果。当前集号自动作为缺省集数。
- **服务层** `app/services/inbox_ingest.py`：纯函数，23 个单元测试覆盖解析和匹配逻辑。
- **API 测试** `tests/test_production_inbox.py`：4 个端到端测试（命中/未命中/空文件/缺省集数）。
- 全量 203 测试通过，TypeScript 编译通过。

**影响面**：`app/api/production.py`、`app/services/inbox_ingest.py`（新）、
`web/src/api.ts`、`web/src/pages/EpisodeDetail.tsx`、`tests/test_production_inbox.py`（新）。
无数据库表或环境变量变更。

---

## [2026-07-21] feat: GitHub Actions 自动部署生产服务器

- 现有 CI 扩展为 CI/CD：`master` push 或手动触发时，后端测试与前端类型检查/构建全部通过后才部署。
- 新增 GitHub `production` Environment 接入，使用受限 SSH 用户、固定 host key 和最小权限部署密钥；
  部署串行执行，结束后请求公网 `/healthcheck`。
- `deploy-server.sh` 支持并校验 `DEPLOY_SHA`，只部署当前 `origin/master` 上与本次测试完全一致的 commit，
  避免连续 push 时部署尚未通过测试的新版本。
- 私有仓库拉取从匿名 HTTPS 改为服务器专用的 GitHub 只读 Deploy Key；服务器不保存个人 PAT，
  GitHub host key 使用固定 known_hosts 校验。
- 服务器 `.env`、制作数据、后台供应商配置与加密主密钥继续保留在服务器，不上传 GitHub Actions。

**影响面**：`.github/workflows/ci.yml`、`scripts/deploy-server.sh`、生产服务器受限 deploy 账号与 GitHub
Environment；无 API、数据库表或业务数据格式变更。

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
## [2026-07-28] 修复画布复制接口启动语法错误

- 补全画布复制接口构造 `CanvasDoc` 时缺失的参数分隔符，恢复用户端 API 正常导入和启动。
- 影响面：`POST /api/canvases/{cid}/duplicate`；无数据库、配置或部署变更。
