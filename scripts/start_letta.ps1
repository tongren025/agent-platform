<#
.SYNOPSIS
    启动 Letta server（有状态 Agent 记忆运行时）。
.DESCRIPTION
    独立进程跑在 :8283，与 agent-platform(:8000) 和 admin(:8001) 互不冲突。
    默认 SQLite 存储（零配置），设 LETTA_PG_URI 可接已有 PostgreSQL。
.EXAMPLE
    # 默认启动（SQLite）
    .\scripts\start_letta.ps1

    # 接 docker-compose 里的 PostgreSQL
    .\scripts\start_letta.ps1 -UsePG

    # 自定义端口
    .\scripts\start_letta.ps1 -Port 9000
#>
param(
    [int]$Port = 8283,
    [switch]$UsePG,
    [switch]$Debug
)

$ErrorActionPreference = 'Stop'

# 检查 letta 是否已安装
try {
    $ver = python -c "import letta; print(letta.__version__)" 2>&1
    if ($LASTEXITCODE -ne 0) { throw "letta not found" }
    Write-Host "[Letta] v$ver installed" -ForegroundColor Cyan
} catch {
    Write-Host "[Letta] 未安装，执行 pip install letta ..." -ForegroundColor Yellow
    pip install letta asyncpg
    if ($LASTEXITCODE -ne 0) { Write-Host "安装失败" -ForegroundColor Red; exit 1 }
}

# 检查端口是否被占用
$inUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($inUse) {
    Write-Host "[Letta] 端口 $Port 已被占用（PID: $($inUse[0].OwningProcess)）" -ForegroundColor Red
    Write-Host "  用 -Port <其他端口> 或先关掉占用进程" -ForegroundColor Yellow
    exit 1
}

# PostgreSQL 连接（复用 docker-compose 的实例，独立库名 letta）
if ($UsePG) {
    $pgUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "agent" }
    $pgPass = if ($env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD } else { "change-me-in-prod" }
    $pgHost = "127.0.0.1"
    $pgPort = 5432
    $pgDb   = "letta"

    $env:LETTA_PG_URI = "postgresql+asyncpg://${pgUser}:${pgPass}@${pgHost}:${pgPort}/${pgDb}"
    Write-Host "[Letta] 使用 PostgreSQL: ${pgHost}:${pgPort}/${pgDb}" -ForegroundColor Green

    # 自动建库（如果不存在）
    try {
        $checkDb = psql -U $pgUser -h $pgHost -p $pgPort -tc "SELECT 1 FROM pg_database WHERE datname='$pgDb'" 2>$null
        if (-not ($checkDb -match '1')) {
            Write-Host "[Letta] 创建数据库 $pgDb ..." -ForegroundColor Yellow
            psql -U $pgUser -h $pgHost -p $pgPort -c "CREATE DATABASE $pgDb" 2>$null
        }
    } catch {
        Write-Host "[Letta] 跳过自动建库（psql 不可用），请确保数据库 $pgDb 已存在" -ForegroundColor Yellow
    }
} else {
    Write-Host "[Letta] 使用 SQLite（数据在 ~/.letta/）" -ForegroundColor Gray
}

# 构建启动参数
$args = @("server", "--port", $Port)
if ($Debug) { $args += "--debug" }

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Letta Server  →  http://localhost:$Port" -ForegroundColor Cyan
Write-Host "  管理面板      →  https://app.letta.com/development-servers/local/dashboard" -ForegroundColor Cyan
Write-Host "  API 文档      →  http://localhost:${Port}/docs" -ForegroundColor Cyan
Write-Host "  Ctrl+C 停止" -ForegroundColor Gray
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

letta @args
