# 工作流编排引擎 + 自动学习补齐（落地说明）

本次为 agent 平台新增了 **DIFY 式可视化工作流编排引擎**，并补齐了**定时文章学习**，
同时修复了一个潜伏的主循环工具 bug。全部为增量改动，不破坏既有单 agent 运行。

## 一、修复：主循环工具桥（P0）

**症状**：此前主 agent 循环里每个工具调用都落到 stub（"工具尚未注册处理函数"）——
`runner._build_tool_handler` 只读一个从未被写入的本地 dict，而真正的 handler 全注册在
`app/tools/base._handlers`。所以 `delegate_to_employee` 和所有 builtin/strategy 工具在
正式对话里**根本不执行**（只有 deep.py 的子代理路径直连 base 才能用）。

**修复**（`app/runtime/runner.py`）：`_build_tool_handler` 改为回退到
`app.tools.base.get_handler()`，用一个 `ToolContext` 适配器桥接 loop 的调用协议，并透传
`employee_key` / `extra_context`（delegate 的深度/环检测依赖 `extra_context` 里的
`__delegation_stack`）。Shell 仍受 `Agent.ShellExecute.Enabled` 开关、审批仍走
`##PENDING_APPROVAL##` 机制，未放开任何安全闸门。

## 二、工作流编排引擎

### 数据模型（`app/models/workflow.py`）
- `WorkflowDefinition`：DAG（节点 + 边），按 registry 文件存储（`data/workflows/<key>.json`）。
- `WorkflowNode`：`{nodeKey, type, name, position, config}`，类型相关配置放 `config` 松散 dict。
- `WorkflowEdge`：`{source, target, sourceHandle}`，`sourceHandle` 用于 condition 分支。
- `WorkflowRun` / `NodeStepResult`：运行记录与逐节点明细，`data/workflow-runs/<key>.json`（原子写、封顶 50）。

### 节点类型（v1，`app/services/workflow_nodes.py`，插件式注册表）
| 类型 | 作用 |
|------|------|
| `start` | 入口，声明输入字段，播种 `{{start.x}}` |
| `agent` | **核心多-subagent**：包一个数字员工，原样调用 `run_invocation()` |
| `knowledge` | 检索某员工知识库片段注入下游 |
| `condition` | if/else 分支（安全枚举比较器，**绝不 eval**） |
| `template` | 用 `{{node.field}}` 拼装文本，不耗 token |
| `tool` | 调用已注册的工具 / MCP |
| `end` | 汇总最终输出 |

### 执行引擎（`app/services/workflow_executor.py`）
- Kahn ready-set 遍历；变量池 `variables[nodeKey] = {field: value}`。
- `{{node.field}}` 解析见 `app/runtime/template.py`，缺失 → 空串（fail-soft）。
- 分支剪枝：condition 只激活一条出边；菱形 join 在任一分支到达即触发，死分支整支 `skipped`。
- 就绪批次 `asyncio.gather` 并发（**已知 v1 限制**：底层 OpenAI 调用同步，故 LLM 节点实际串行；
  换成 AsyncOpenAI 后即自动并发，无需改引擎）。
- 兜底：`max_steps`（默认 50）、节点级超时、整体超时（API 层 `wait_for` + 504）、
  节点 `onError ∈ {stop|continue}`、输出落盘截断 2000 字。

### API（`app/api/workflow.py`，prefix `/api/v1/agentapp/workflow`）
`GET ""`（列表）/ `POST ""`（建，草稿可存，返回 `validationError`）/ `GET|PUT|DELETE /{key}` /
`POST /{key}/run` / `GET /{key}/runs` / `GET /{key}/runs/{runId}` / `GET /node-types`。

### 前端（`web/src/`，画布库 `reactflow ^11`）
- `pages/Workflows.tsx`：工作流列表 / CRUD / 运行。
- `pages/WorkflowEditor.tsx`：reactflow 画布 + 左侧节点调色板 + 工具栏（运行/保存）。
- `components/workflow/NodeConfigDrawer.tsx`：分类型配置表单 + **变量插入器**（点击 `{{x}}` 注入）。
- `components/workflow/RunPanel.tsx`：运行输入 + 逐节点状态时间线 + token + 工具轨迹 + 历史。
- `components/TraceList.tsx`：从 Workbench 抽出的工具轨迹组件，Workbench 与 RunPanel 共用。

## 三、团队管理修复

后端 `TeamDefinition`（`app/models/registry.py`）从扁平名单升级为带真实结构：
新增 `leaderEmployeeKey` / `description` / `roles[{employeeKey,stage,order}]` / `defaultWorkflowKey`
（全部可选、`extra:allow` 兼容旧数据）。`member_employee_keys` 仍是 delegate 的权威成员源。
启动迁移（`main.py` `migrate_teams_and_seed`）非破坏性回填，并幂等种入 9 人**漫剧创作流水线**
（`comic-drama` 工作流：导演→编剧→角色/场景/分镜设计(并行)→提示词工程→角色/场景/关键帧生成(并行)→成片）。
前端 `Teams.tsx` 改为读后端真实 `roles.stage`（替代此前按 tag 关键词猜阶段），并加「查看协作工作流」入口。

## 四、自动学习补齐：定时文章学习

新增与「提示词采集」并列的第二类自动学习——给定一批文章网址，**每天定时（默认凌晨 2:00）**
抓取正文 → LLM 总结 → 写入目标员工知识库 + 长期记忆（复用 `scrape_and_summarize`）。
- 后端：`app/models/learn.py`、`app/services/learn_store.py`、`app/services/learn_runner.py`，
  挂进既有 `DailyScheduler`（现同时巡检采集源与学习源，水位线每日一次），
  API 在 `app/api/scrape.py` 加 `/learn-sources` CRUD + `/run` + `/history`。
- 前端：`web/src/pages/ArticleLearn.tsx`（学习源管理 + 立即学习 + 运行历史）。

## 安全模型（对抗审查后加固）

经一轮多 agent 对抗审查，修复了 8 个确认问题，关键安全点：
- **工具节点授权**：`tool` 节点必须指定 `employeeKey`，且工具须在该员工绑定的 `tool_refs` 内才放行
  （复用 agent 路径的作用域语义，杜绝任意工作流调用任意有副作用工具的提权）；`execute`(Shell) /
  `delegate_to_employee` 在工作流节点中硬禁止。
- **审批闸门**：工具返回 `##PENDING_APPROVAL##` 时工作流节点按失败处理，不再静默跳过人审。
- **参数注入**：`argsTemplate` 一律先解析成结构再 `json.dumps`，插入值被 JSON 转义，
  无法越界改写工具参数。
- **委派开关**：`Delegation.Enabled=false` 现在真正拒绝委派（此前从未校验）。
- **审批恢复**：`approvalDecision` 现以 JSON 键 `__approval_decision` 传递（此前自由文本导致审批永远无法通过，且会破坏委派栈）。
- **超时落定**：整体超时的运行记录会被落定为 `timeout`（此前永远停在 `running`）。
- **迁移非破坏**：团队成员仅在为空时从 roles 回填，不再每次重启复活被手动移除的成员。
- **学习源**：`maxArticles` 约束 `[1,50]`，避免"有 URL 却学 0 篇还报成功"。

## 已知 v1 限制（非 bug，后续优化）
- LLM/agent 节点因底层同步 OpenAI 调用而实际串行（结构已支持并发，待迁 AsyncOpenAI）。
- 运行为同步请求/响应 + 轮询历史，暂无 SSE 实时点亮。
- 文件型存储无锁，适合单用户；多用户前需加锁。
- 迭代(iteration)/变量聚合/代码节点/子工作流 暂不在 v1。
