# 每日代码自动备份 —— 把工作树完整快照(含未提交/未跟踪文件)提交到
# auto-backup 分支并推送 GitHub。防"改动堆在本地几天,机器一坏全丢"。
#
# 设计约束:
# - 不碰 master、不碰真实暂存区、不打断正在进行的工作(用临时 index 造提交)。
# - 与上次备份无差异时跳过,不刷无意义提交。
# - 由 Windows 计划任务每日调用(注册命令见 docs/CHANGELOG.md 对应条目),
#   也可手动执行:pwsh -File scripts\git_auto_backup.ps1
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

$indexFile = ".git\auto-backup-index"
$env:GIT_INDEX_FILE = $indexFile
try {
    # 用独立 index 暂存全部工作树内容(遵循 .gitignore),不影响真实暂存区
    git read-tree HEAD
    git add -A
    $tree = (git write-tree).Trim()

    # 父提交:已有 auto-backup 分支则接着链,否则从当前 HEAD 起链
    $parent = (git rev-parse --verify --quiet refs/heads/auto-backup 2>$null)
    if (-not $parent) { $parent = (git rev-parse HEAD).Trim() } else { $parent = $parent.Trim() }

    # 与上次备份内容相同则跳过
    $parentTree = (git rev-parse "$parent^{tree}").Trim()
    if ($tree -eq $parentTree) {
        Write-Host "auto-backup: 与上次备份无差异,跳过"
        exit 0
    }

    $base = (git rev-parse --short HEAD).Trim()
    $msg = "auto-backup $(Get-Date -Format 'yyyy-MM-dd HH:mm') (base $base)"
    $commit = (git commit-tree $tree -p $parent -m $msg).Trim()
    git update-ref refs/heads/auto-backup $commit
    Write-Host "auto-backup: 已生成备份提交 $commit"
}
finally {
    Remove-Item Env:\GIT_INDEX_FILE -ErrorAction SilentlyContinue
    Remove-Item $indexFile -Force -ErrorAction SilentlyContinue
}

git push origin auto-backup:auto-backup
Write-Host "auto-backup: 已推送到 origin/auto-backup"
