#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# agent-platform 一键部署脚本（Ubuntu 24.04 / 2G 内存）
#
# 首次部署:
#   ssh root@47.85.46.171
#   curl -fsSL https://raw.githubusercontent.com/tongren025/agent-platform/master/scripts/deploy-server.sh | bash
#
# 更新部署:
#   cd /opt/agent-platform && bash scripts/deploy-server.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

INSTALL_DIR="/opt/agent-platform"
REPO_URL="https://github.com/tongren025/agent-platform.git"
BRANCH="master"
SWAP_SIZE="2G"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ── 0. 必须 root ──────────────────────────────────────────
if [ "$(id -u)" -ne 0 ]; then
    err "请用 root 运行: sudo bash $0"
    exit 1
fi

# ── 1. 系统依赖 ───────────────────────────────────────────
log "安装系统依赖..."
apt-get update -qq
apt-get install -y -qq git curl ca-certificates gnupg lsb-release > /dev/null

# ── 2. 安装 Docker ────────────────────────────────────────
if ! command -v docker &> /dev/null; then
    log "安装 Docker..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin > /dev/null
    systemctl enable --now docker
    log "Docker 安装完成: $(docker --version)"
else
    log "Docker 已安装: $(docker --version)"
fi

# ── 3. 设置 Swap（2G 内存机器必须）────────────────────────
if [ ! -f /swapfile ]; then
    log "创建 ${SWAP_SIZE} swap..."
    fallocate -l ${SWAP_SIZE} /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    # 降低 swappiness，优先用物理内存
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    log "Swap 已启用"
else
    log "Swap 已存在，跳过"
fi

# ── 4. 防火墙 ─────────────────────────────────────────────
if command -v ufw &> /dev/null; then
    log "配置防火墙..."
    ufw --force enable 2>/dev/null || true
    ufw allow 22/tcp   # SSH
    ufw allow 80/tcp   # HTTP（用户端）
    ufw allow 8001/tcp # 管理端
    ufw reload
    log "防火墙已配置: 22, 80, 8001"
fi

# ── 5. 拉取代码 ───────────────────────────────────────────
if [ -d "${INSTALL_DIR}/.git" ]; then
    log "更新代码..."
    cd "${INSTALL_DIR}"
    git fetch origin
    git reset --hard "origin/${BRANCH}"
else
    log "克隆仓库..."
    git clone --depth 1 -b "${BRANCH}" "${REPO_URL}" "${INSTALL_DIR}"
    cd "${INSTALL_DIR}"
fi

# ── 6. 生成 .env（仅首次）─────────────────────────────────
if [ ! -f "${INSTALL_DIR}/.env" ]; then
    log "生成 .env（安全随机密码）..."

    PG_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
    ADMIN_PASS=$(openssl rand -base64 16 | tr -d '/+=' | head -c 16)
    ADMIN_SEC=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)

    cat > "${INSTALL_DIR}/.env" <<ENVEOF
# ── 自动生成 $(date '+%Y-%m-%d %H:%M') ──────────────────
APP_ENV=production

# 数据库
POSTGRES_USER=agent
POSTGRES_PASSWORD=${PG_PASS}
POSTGRES_DB=agent
DATABASE_URL=postgresql+psycopg://agent:${PG_PASS}@postgres:5432/agent

# Redis
REDIS_URL=redis://redis:6379/0

# 管理端
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${ADMIN_PASS}
ADMIN_SECRET=${ADMIN_SEC}
ADMIN_TOKEN_TTL=43200

# LLM（手动填写）
DASHSCOPE_API_KEY=

# 存储
USE_DB_STORES=false
USER_API_AUTH=true
SEED_DEMO_WORKFLOWS=false

# 趋势同步
TRENDS_AUTO_SYNC=false
GITHUB_TOKEN=

# 日志
LOG_LEVEL=INFO
LOG_JSON=true

# CORS（生产收窄到实际域名,临时先开放）
CORS_ORIGINS=*
ENVEOF

    chmod 600 "${INSTALL_DIR}/.env"
    log ".env 已生成"
    warn "管理端密码: ${ADMIN_PASS}  ← 请记下！之后 cat /opt/agent-platform/.env 可查"
else
    log ".env 已存在，跳过生成"
fi

# ── 7. 构建 & 启动 ────────────────────────────────────────
log "构建并启动服务（首次较慢，需拉取镜像+编译前端）..."
cd "${INSTALL_DIR}"
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

# ── 8. 等待数据库就绪 → 跑迁移 ────────────────────────────
log "等待 PostgreSQL 就绪..."
for i in $(seq 1 30); do
    if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U agent > /dev/null 2>&1; then
        break
    fi
    sleep 2
done

log "执行数据库迁移..."
docker compose -f docker-compose.prod.yml exec -T app alembic upgrade head || warn "迁移失败或无迁移可执行"

# ── 9. 健康检查 ───────────────────────────────────────────
log "验证服务状态..."
sleep 3
docker compose -f docker-compose.prod.yml ps

echo ""
log "════════════════════════════════════════════════"
log "  部署完成！"
log "  用户端:  http://47.85.46.171"
log "  管理端:  http://47.85.46.171:8001"
log "  配置:    ${INSTALL_DIR}/.env"
log "════════════════════════════════════════════════"
echo ""
warn "请手动完成:"
echo "  1. 在 .env 里填写 DASHSCOPE_API_KEY（LLM 功能需要）"
echo "  2. 填完后重启: cd ${INSTALL_DIR} && docker compose -f docker-compose.prod.yml restart app admin worker"
echo "  3. 如需 HTTPS，绑定域名后可加 certbot"
echo ""
