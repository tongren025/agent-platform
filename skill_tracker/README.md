# skill_tracker

拉取 GitHub 上 **星最多** 和 **最新增长最快** 的 skill 仓库。独立小工具，
和本目录下原有的 FastAPI 工程互不影响（只复用了 `httpx` 依赖）。

## 它做什么

调用 GitHub 搜索 API，产出两个榜单：

1. **星最多** —— 按 `stargazers_count` 倒序。
2. **最新增长最快（估算）** —— GitHub 没有官方 trending API，这里用
   **「近 N 天内新建 + 星/天（stars ÷ 仓库年龄）」** 作为高增长新仓库的代理指标。
3. **真实近期增长** —— 每次运行都把抓到的仓库 stars 存成带时间戳的快照
   （按 query 分目录存在 `output/snapshots/<query>/`）。下次同 query 运行时，
   和上一份历史快照对比，算出**真实涨星数**和**真实日增速**，比估算更准。
   首次运行只建立基线，第二次起才有对比结果。

"skill" 只是默认搜索词，可通过 `-q` 改成任意 GitHub 搜索语法。

## 用法

```bash
# 默认搜 "skill"
python -m skill_tracker.tracker

# 换关键词 / 搜索语法
python -m skill_tracker.tracker -q "claude skill" -n 20
python -m skill_tracker.tracker -q "topic:mcp"
python -m skill_tracker.tracker -q "agent skill language:python"

# 调整"增长榜"统计窗口（近 90 天新建）
python -m skill_tracker.tracker --recent-days 90

# 同时导出 JSON 到 skill_tracker/output/
python -m skill_tracker.tracker --json
```

也可以直接当脚本跑：`python skill_tracker/tracker.py`

## 参数

| 参数 | 默认 | 说明 |
|------|------|------|
| `-q, --query` | `skill` | GitHub 搜索关键词/语法 |
| `-n, --limit` | `15` | 每个榜单返回条数 |
| `--recent-days` | `180` | 「增长最快」榜只统计近 N 天内新建的仓库 |
| `--json` | 关 | 额外把结果写成 JSON 文件 |

## 定时自动跑（Windows 计划任务）

为了让「真实近期增长」积累数据，最好每天自动跑。已提供
[`schedule_task.ps1`](schedule_task.ps1) 一键注册 Windows 计划任务
`SkillTrackerDaily`：

```powershell
# 注册：每天 09:00 跑默认 query 集
pwsh -File skill_tracker\schedule_task.ps1

# 自定义时间 + 带 token
pwsh -File skill_tracker\schedule_task.ps1 -Time 22:30 -Token ghp_xxx

# 立即试跑一次 / 查看 / 删除
Start-ScheduledTask -TaskName SkillTrackerDaily
Get-ScheduledTask   -TaskName SkillTrackerDaily
pwsh -File skill_tracker\schedule_task.ps1 -Remove
```

任务调用 [`daily_run.py`](daily_run.py)，批量跑一组 query（默认
`skill` / `claude skill` / `topic:mcp` / `agent skill`），各自存快照 + JSON，
日志写到 `output/logs/<日期>.log`。想改默认 query 集就编辑 `daily_run.py`
顶部的 `DEFAULT_QUERIES`，或手动传 `-q`：

```bash
python -m skill_tracker.daily_run -q "claude skill" -q "topic:mcp"
```

## 限流 / Token

匿名调用 GitHub 搜索 API 限流为 **10 次/分钟**。配置个人访问令牌后提升到 30 次/分钟：

```bash
# Windows PowerShell
$env:GITHUB_TOKEN = "ghp_xxx"
# bash
export GITHUB_TOKEN=ghp_xxx
```

令牌只需 public repo 读取权限即可。

## 说明

- 仅依赖 `httpx`（项目已自带），无额外安装。
- 快照自动存在 `output/snapshots/<query>/`，每次运行追加一份；想要"真实增长"
  数据，定期（比如每天）跑同一个 query 即可，相邻两次快照的差值就是真实涨星。
- `--json` 导出的文件里，有历史快照时会额外带 `real_growth` 字段。
- GitHub 搜索结果上限为前 1000 条，本工具自动翻页取到 `--limit`。
