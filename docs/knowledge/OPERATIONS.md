# 开发运行与排障

核验日期：2026-09-15。命令默认在仓库根目录 PowerShell 执行，Python 3.12、Node.js 20 与 CI/Docker 一致。

## 本地启动

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm --prefix web ci

# 用户端 API
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 主前端 React/Vite
npm --prefix web run dev -- --host 127.0.0.1 --port 5173 --strictPort

# 管理 API
.\.venv\Scripts\python.exe -m uvicorn admin.main:app --host 127.0.0.1 --port 8001 --reload
```

主界面是 http://127.0.0.1:5173，管理页是 /admin/login。web 是 React；Vue 只在 modules/yuxi-runtime/web 子工程。

```powershell
Invoke-RestMethod http://127.0.0.1:8000/healthcheck
Invoke-RestMethod http://127.0.0.1:8001/healthcheck
npm --prefix web run build
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m evals.run_evals
```

python -m app.main 会读取业务配置 Port，缺省 5311；开发/生产请使用显式 Uvicorn --port 8000。根目录 main.py 只是指路牌。python -m admin.main 读取 ADMIN_PORT，默认 8001。

## Redis、数据库与迁移

任务中心另开 worker，并让 API 与 worker 使用同一个 REDIS_URL：

```powershell
$env:REDIS_URL = 'redis://127.0.0.1:6379/0'
.\.venv\Scripts\python.exe -m app.tasks.worker

# .env 中设置本机 DATABASE_URL 后
.\.venv\Scripts\python.exe -m alembic current
.\.venv\Scripts\python.exe -m alembic upgrade head
# 迁移后再设置 USE_DB_STORES=true 并重启相关进程
```

默认 DATABASE_URL/REDIS_URL 的主机名是 Compose 服务名 postgres/redis；裸机请改为 127.0.0.1。Alembic 优先读取 ALEMBIC_URL，否则读取 DATABASE_URL；alembic.ini 是占位值。

## Docker

```powershell
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail 100 app admin worker

docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail 100 app admin worker nginx
```

标准 Compose：app 8000、admin 8001、worker、PostgreSQL 5432、Redis 6379、Prometheus 9090、Grafana 3000。生产 Compose：nginx、app、admin、worker、PostgreSQL、Redis；nginx 对外 80/443/8001。若 config --quiet 失败，先修复 YAML/环境变量再部署。

## 配置速查

- app/config.py：业务 Agent、Workflow、aiModels、modelPrices、quotas、Port。
- app/core/settings.py：USE_DB_STORES、DATABASE_URL、REDIS_URL、USER_API_AUTH、CORS_ORIGINS、ADMIN_API_URL、DASHSCOPE_API_KEY、AI_PROVIDER_ENCRYPTION_KEY、趋势和种子开关。
- admin/config.py：ADMIN_USERNAME、ADMIN_PASSWORD、ADMIN_SECRET、ADMIN_TOKEN_TTL、ADMIN_PORT。
- aiModels[].apiKey 支持 \$\{ENV_NAME\} 占位符；后台供应商密文在 data/ai-providers/，主密钥在 data/.secrets/。密钥只放环境变量或受保护运行数据。

## 排障索引

| 现象 | 首查 |
|---|---|
| API 起不来 | Python 依赖、端口、业务 JSON；USE_DB_STORES=true 时再查 PostgreSQL |
| 跑到 5311 | 是否误用 python -m app.main；改显式 uvicorn --port 8000 |
| 任务 503 或 queued | Redis 地址、30 秒熔断、worker、同一 arq:queue |
| 管理 502 | admin 是否在 8001；ADMIN_API_URL 是否正确（容器内 http://admin:8001） |
| 管理 401/403 | 共享身份凭证的签名和 TTL、账号是否启用，以及当前角色是否具有 system:admin；两端需共享正确的 ADMIN_SECRET 和用户数据 |
| 迁移失败 | ALEMBIC_URL、DSN、凭据和 pgvector |
| 8000 白屏/assets 404 | npm --prefix web run build，确认 index.html 与 assets 同批 |
| 模型失败 | aiModels 或管理端供应商、加密主密钥、app/services/ai.py 日志 |
| 检索为空 | DB store/embedding 配置、向量表；关键词检索可能兜底 |
| 定时任务重复 | 多个 app worker 会各自启动 DailyScheduler |
| 生产素材缺失 | ./data 与拼写为 resouce/ 的素材挂载，勿先清理运行数据 |

标准 Compose 的 Prometheus 每 15 秒抓取 app/admin /metrics；worker 没有独立 HTTP 指标端点，应结合 worker 日志、Redis job 状态和运行记录排查。
