<#
.SYNOPSIS
    注册/删除一个 Windows 计划任务，每天自动跑 skill_tracker 榜单。

.DESCRIPTION
    任务名: SkillTrackerDaily
    动作:   用本项目 .venv 的 python 跑 skill_tracker.daily_run（默认 query 集）。
    快照会自动积累在 output/snapshots/，跑够两天即可在 output/ 看到真实增长。

.PARAMETER Time
    每天运行时间，24 小时制 HH:mm，默认 09:00。

.PARAMETER Remove
    传此开关则删除已注册的任务。

.PARAMETER Token
    可选。GitHub Token，写进任务环境以提高限流额度。

.EXAMPLE
    # 注册：每天 09:00 跑
    pwsh -File skill_tracker\schedule_task.ps1

.EXAMPLE
    # 每天 22:30 跑，并带 token
    pwsh -File skill_tracker\schedule_task.ps1 -Time 22:30 -Token ghp_xxx

.EXAMPLE
    # 删除任务
    pwsh -File skill_tracker\schedule_task.ps1 -Remove
#>
param(
    [string]$Time = "09:00",
    [switch]$Remove,
    [string]$Token
)

$ErrorActionPreference = "Stop"
$TaskName = "SkillTrackerDaily"

# 项目根 = 本脚本上一级目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$Python = Join-Path $ProjectRoot ".venv\Scripts\python.exe"

if ($Remove) {
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "已删除计划任务: $TaskName"
    } else {
        Write-Host "未找到计划任务: $TaskName"
    }
    return
}

if (-not (Test-Path $Python)) {
    throw "找不到 venv python: $Python（请先在项目根创建 .venv）"
}

# 动作: 设工作目录为项目根，调用 daily_run 模块
$argLine = "-m skill_tracker.daily_run"
$Action = New-ScheduledTaskAction -Execute $Python -Argument $argLine -WorkingDirectory $ProjectRoot

# 触发器: 每天指定时间
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time

# 当前用户身份运行，无需最高权限
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

# 已存在则先删，保证幂等
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger `
    -Principal $Principal -Settings $Settings `
    -Description "每天自动拉取 GitHub 星最多/增长最快的 skill 仓库" | Out-Null

# 可选: 把 GITHUB_TOKEN 写进当前用户环境变量（计划任务会继承）
if ($Token) {
    [Environment]::SetEnvironmentVariable("GITHUB_TOKEN", $Token, "User")
    Write-Host "已写入用户级 GITHUB_TOKEN 环境变量。"
}

Write-Host "已注册计划任务: $TaskName"
Write-Host "  每天 $Time 运行: $Python $argLine"
Write-Host "  工作目录: $ProjectRoot"
Write-Host ""
Write-Host "立即试跑一次:  Start-ScheduledTask -TaskName $TaskName"
Write-Host "查看任务:      Get-ScheduledTask -TaskName $TaskName"
Write-Host "删除任务:      pwsh -File skill_tracker\schedule_task.ps1 -Remove"
