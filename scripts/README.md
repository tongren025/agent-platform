# scripts/ 脚本清单

> 31 个脚本按「可复用 / 常驻自动化 / 一次性 / 探针」分类。每条标注跑法与破坏性。
> 命名约定：**`_` 前缀 = 一次性探针/临时脚本**（根目录的 `_gen_cards_v3/v4.py` 也遵循此约定）。
>
> 跑法总规律：
> - 硬编码绝对路径或 `sys.path.insert('.')` 的脚本：`python scripts/xxx.py`，**cwd 必须是仓库根**；
> - 直接 `import app.*` 无 path hack 的：`python -m scripts.xxx`；
> - `_create_comic_team` / `_update_prompts` 走 HTTP：需 :8000 服务在跑。

## 可复用工具（放心跑）

| 脚本 | 用途 | 跑法 |
|------|------|------|
| `gen_module_index.py` | 从代码 docstring 自动生成 docs/MODULE_INDEX.md | `python -m scripts.gen_module_index` |
| `git_auto_backup.ps1` | 工作树完整快照（含未提交）提交到 auto-backup 分支并推送；不碰 master 与真实暂存区 | Windows 计划任务每日跑，或 `pwsh -File scripts\git_auto_backup.ps1` |
| `start_letta.ps1` | 启动 Letta server(:8283)，默认 SQLite，`-UsePG` 复用 compose 的 PG | `.\scripts\start_letta.ps1 [-Port n] [-UsePG]` |
| `migrate_json_to_pg.py` | data/ JSON 运行态导入 PostgreSQL（幂等 upsert，不动 JSON 源） | 先 `alembic upgrade head` 再 `python -m scripts.migrate_json_to_pg` |
| `refresh_comic_profiles.py` | 统一刷新漫剧 7 个员工的生产提示词（保留 KNOWLEDGE_MARKER 后的项目知识段）并同步 comic-drama 工作流模板 | `python scripts/refresh_comic_profiles.py` ⚠️ 整体覆盖 comic-* 员工的 roleProfile |

## 一次性迁移/修复（已完成使命，留档可查）

| 脚本 | 用途 | 破坏性 |
|------|------|--------|
| `rewrite_storyboards_v2.py` | 五季分镜卡升级为 schema 2.0-detailed（`--check` 干跑、`--source-head` 从 Git HEAD 重迁） | ⚠️ 就地重写 cards.json 分镜卡 |
| `fix_card_violations.py` | 批量修复违反 Seedance 规则的提示词（去「快速」、补双语运镜词） | ⚠️ 就地改写 jiulu-s1 prompts |
| `gen_cards.py` | 补 jiulu-s1 EP02-10 缺失流水线卡（按 card_id 去重只增不删） | 低 |
| `gen_settings_and_artbible.py` | 生成 Art Bible 全局风格卡 + 每集 setting 卡（只增不删） | 低 |
| `merge_cards.py` | 合并 shots_data.json 分镜卡 | **已不可运行**：输入文件 scripts/shots_data.json 已不存在 |
| `migrate` 系记忆脚本：`consolidate_memory.py` / `restructure_memory_duanju.py` / `clean_and_verify.py` / `verify_fixes.py` | 记忆沉淀/重构/LaTeX 脏数据清洗，各自按 sourceSession 幂等 | ⚠️ 就地改写 data/memory/ |
| 知识种子：`seed_knowledge.py` / `seed_pro_canon.py` / `seed_craft_deep.py` / `seed_craft_deep2.py` | 三轮职业正典/手艺知识写入员工知识库+记忆（同名先清后写，幂等） | 有限（只覆盖自身 session 数据） |
| `enrich_employees.py` | Art Bible/角色 DNA 注入员工 roleProfile（SEPARATOR 标记，重跑先剥离旧注入） | ⚠️ 就地重写员工 JSON |
| `use_employee.py` / `use_employee2.py` | 真实调用员工干活验证学习闭环（后者绑死历史会话 ID，不可复用） | 无（产生真实会话） |

## `_` 前缀探针/临时脚本（调试用，可删）

| 脚本 | 用途 |
|------|------|
| `_create_comic_team.py` | 经 :8000 API 一键创建漫剧团队（9 员工+1 团队）；PUT 会覆盖同 key 员工 |
| `_update_prompts.py` | 重写团队 9 成员 roleProfile（已被 refresh_comic_profiles.py 取代） |
| `_smoke_workflow_api.py` / `_test_workflow.py` / `_test_tool_security.py` | 工作流 API 冒烟 / 引擎分支验证 / 工具授权闸门验证（TestClient 零网络） |
| `_probe_video.py` / `_probe_video2.py` / `_probe_video3.py` | 即梦视频接口 SSR 探针三轮（文件头自述「调试用，可删」） |

## ⚠️ 危险区（误跑即数据事故）

| 脚本 | 风险 |
|------|------|
| 根目录 `_gen_cards_v3.py` | **`open('w')` 全量覆盖 `data/production/jiulu-s1/cards.json`**，会用 2026-06-25 的旧卡集摧毁现有卡池（现已是五季 4062 卡）。孤儿脚本，已被 v4 取代，仅留档 |
| 根目录 `_gen_cards_v4.py` | 同上，全量覆盖 jiulu-s1 卡池。README 提到的初始演示数据即它生成，但**当前卡池早已多轮增补重写，不可再跑** |

## 其它

- `scripts/_workflow_design.md`：工作流系统设计文档（2026-06-24，47KB），是文档不是脚本，留档。
