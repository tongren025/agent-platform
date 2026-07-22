#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# agent-platform 一键部署脚本（Ubuntu 24.04 / 2G 内存）
#
# 首次部署（私有仓库需先配置只读 GitHub Deploy Key）:
#   bash /path/to/deploy-server.sh
#
# 更新部署:
#   cd /opt/agent-platform && bash scripts/deploy-server.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

INSTALL_DIR="/opt/agent-platform"
REPO_URL="git@github.com:tongren025/agent-platform.git"
BRANCH="master"
SWAP_SIZE="2G"
DEPLOY_SHA="${DEPLOY_SHA:-}"
GITHUB_DEPLOY_KEY="${GITHUB_DEPLOY_KEY:-/root/.ssh/agent-platform-github}"
GITHUB_KNOWN_HOSTS="${GITHUB_KNOWN_HOSTS:-/root/.ssh/known_hosts_agent_platform}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*" >&2; }

resolve_deploy_ref() {
    local branch_ref="$1"

    if [ -z "${DEPLOY_SHA}" ]; then
        printf '%s\n' "${branch_ref}"
        return
    fi

    if [[ ! "${DEPLOY_SHA}" =~ ^[0-9a-f]{40}$ ]]; then
        err "DEPLOY_SHA 必须是 40 位小写 Git commit SHA"
        return 2
    fi

    local branch_sha
    branch_sha="$(git rev-parse "${branch_ref}")"
    if [ "${branch_sha}" != "${DEPLOY_SHA}" ]; then
        err "master 已前进：拒绝部署未对应当前 master 的 ${DEPLOY_SHA}"
        return 3
    fi

    printf '%s\n' "${DEPLOY_SHA}"
}

# ── 0. 必须 root ──────────────────────────────────────────
if [ "$(id -u)" -ne 0 ]; then
    err "请用 root 运行: sudo bash $0"
    exit 1
fi

# 私有仓库只使用 GitHub Deploy Key（只读），不在服务器保存个人 PAT。
if [ ! -f "${GITHUB_DEPLOY_KEY}" ] || [ ! -f "${GITHUB_KNOWN_HOSTS}" ]; then
    err "缺少 GitHub Deploy Key 或已验证的 known_hosts"
    err "需要: ${GITHUB_DEPLOY_KEY} 与 ${GITHUB_KNOWN_HOSTS}"
    exit 1
fi
export GIT_SSH_COMMAND="ssh -i ${GITHUB_DEPLOY_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=${GITHUB_KNOWN_HOSTS}"

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
    ufw allow 80/tcp   # HTTP
    ufw allow 443/tcp  # HTTPS
    ufw allow 8001/tcp # 管理端
    ufw reload
    log "防火墙已配置: 22, 80, 443, 8001"
fi

# ── 5. 拉取代码 ───────────────────────────────────────────
if [ -d "${INSTALL_DIR}/.git" ]; then
    log "更新代码..."
    cd "${INSTALL_DIR}"
    # 私有仓库会跟踪普通 data/ 快照，但生产服务器上的 UI 修改必须优先保留。
    # reset 前备份三类服务器权威数据：制作看板、后台供应商配置、供应商加密主密钥。
    RUNTIME_BACKUP="/tmp/agent-runtime-backup"
    rm -rf "${RUNTIME_BACKUP}"
    mkdir -p "${RUNTIME_BACKUP}"
    for REL_PATH in production ai-providers .secrets; do
        if [ -d "data/${REL_PATH}" ]; then
            cp -a "data/${REL_PATH}" "${RUNTIME_BACKUP}/${REL_PATH}"
        fi
    done
    git fetch origin
    TARGET_REF="$(resolve_deploy_ref "origin/${BRANCH}")"
    git reset --hard "${TARGET_REF}"
    # 完整恢复服务器版本；不能用 cp -n，否则 reset 出来的同名文件会挡住运行时数据。
    for REL_PATH in production ai-providers .secrets; do
        if [ -d "${RUNTIME_BACKUP}/${REL_PATH}" ]; then
            rm -rf "data/${REL_PATH}"
            mkdir -p data
            cp -a "${RUNTIME_BACKUP}/${REL_PATH}" "data/${REL_PATH}"
        fi
    done
    rm -rf "${RUNTIME_BACKUP}"
else
    log "克隆仓库..."
    git clone --depth 1 -b "${BRANCH}" "${REPO_URL}" "${INSTALL_DIR}"
    cd "${INSTALL_DIR}"
    # CI/CD 首次部署也必须与已测试 SHA 一致；master 已前进时直接失败等待新流水线。
    resolve_deploy_ref HEAD > /dev/null
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

# CORS
CORS_ORIGINS=https://aikirito.cloud,https://www.aikirito.cloud
ENVEOF

    chmod 600 "${INSTALL_DIR}/.env"
    log ".env 已生成"
    warn "管理端密码: ${ADMIN_PASS}  ← 请记下！之后 cat /opt/agent-platform/.env 可查"
else
    log ".env 已存在，跳过生成"
fi

# ── 6.5 确保 bind mount 目录存在 ─────────────────────────────
mkdir -p "${INSTALL_DIR}/data" "${INSTALL_DIR}/resouce"
if [ -z "$(ls -A ${INSTALL_DIR}/data/employees 2>/dev/null)" ]; then
    warn "data/ 目录为空——员工/团队/工作流等数据缺失。"
    warn "请在本地执行: bash scripts/sync-assets.sh"
fi
if [ -z "$(ls -A ${INSTALL_DIR}/resouce 2>/dev/null)" ]; then
    warn "resouce/ 目录为空——图片将无法显示。"
    warn "请在本地执行: bash scripts/sync-assets.sh"
fi

# ── 7. 构建 & 启动 ────────────────────────────────────────
log "构建并启动服务（首次较慢，需拉取镜像+编译前端）..."
cd "${INSTALL_DIR}"

# compose 挂载 _active.conf；根据证书状态选用 HTTP 或 HTTPS 版
if [ -f "/etc/letsencrypt/live/aikirito.cloud/fullchain.pem" ]; then
    cp deploy/nginx/default.conf deploy/nginx/_active.conf
else
    log "证书尚未就绪，先以 HTTP 模式启动..."
    cp deploy/nginx/default-http-only.conf deploy/nginx/_active.conf
fi

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

# ── 9. HTTPS 证书（Let's Encrypt）──────────────────────────
DOMAIN="aikirito.cloud"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

if [ ! -f "${CERT_PATH}" ]; then
    log "申请 HTTPS 证书..."
    apt-get install -y -qq certbot > /dev/null

    # 先停 nginx 释放 80 端口给 certbot standalone 验证
    docker compose -f docker-compose.prod.yml stop nginx 2>/dev/null || true

    certbot certonly --standalone --non-interactive --agree-tos \
        --email kiritott@proton.me \
        -d "${DOMAIN}" -d "www.${DOMAIN}" \
        && log "证书申请成功" \
        || warn "证书申请失败，将以 HTTP 模式运行"

    if [ -f "${CERT_PATH}" ]; then
        # 把宿主机证书同步到 Docker volume
        docker volume create --name agent-platform_certbot_certs 2>/dev/null || true
        docker run --rm \
            -v agent-platform_certbot_certs:/certs \
            -v /etc/letsencrypt:/src:ro \
            alpine sh -c "cp -rL /src/* /certs/"

        # 切到 HTTPS nginx 配置
        cp deploy/nginx/default.conf deploy/nginx/_active.conf

        # 自动续期 cron（每周一 03:00）
        cat > /etc/cron.d/certbot-renew <<'CRON'
0 3 * * 1 root certbot renew --quiet && docker run --rm -v agent-platform_certbot_certs:/certs -v /etc/letsencrypt:/src:ro alpine sh -c "cp -rL /src/* /certs/" && cd /opt/agent-platform && docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload
CRON
        log "自动续期 cron 已配置"
    fi

    # 重启 nginx
    docker compose -f docker-compose.prod.yml up -d nginx
else
    log "证书已存在，跳过申请"
fi

# ── 10. 健康检查 ──────────────────────────────────────────
# app/admin 每次部署会被 recreate，容器 IP 可能变化；nginx 的静态 upstream
# 只在配置加载时解析服务名。如果 nginx 沿用旧容器，会持续代理到旧 IP 并返回 502。
log "刷新 Nginx 上游解析..."
docker compose -f docker-compose.prod.yml restart nginx

log "等待应用健康..."
APP_HEALTHY=false
for i in $(seq 1 30); do
    if docker compose -f docker-compose.prod.yml exec -T nginx \
        wget -qO- http://app:8000/healthcheck > /dev/null 2>&1; then
        APP_HEALTHY=true
        break
    fi
    sleep 2
done

if [ "${APP_HEALTHY}" != "true" ]; then
    warn "应用在 60 秒内未通过容器内健康检查，输出诊断日志"
    docker compose -f docker-compose.prod.yml ps
    docker compose -f docker-compose.prod.yml logs --tail=200 app nginx
    exit 1
fi

log "验证服务状态..."
docker compose -f docker-compose.prod.yml ps

echo ""
log "════════════════════════════════════════════════"
log "  部署完成！"
if [ -f "${CERT_PATH}" ]; then
    log "  用户端:  https://aikirito.cloud"
    log "  管理端:  https://aikirito.cloud:8001"
else
    log "  用户端:  http://47.85.46.171"
    log "  管理端:  http://47.85.46.171:8001"
    warn "  HTTPS 未就绪，域名解析生效后重跑此脚本即可申请证书"
fi
log "  配置:    ${INSTALL_DIR}/.env"
log "════════════════════════════════════════════════"
echo ""
warn "请手动完成:"
echo "  1. 在 .env 里填写 DASHSCOPE_API_KEY（LLM 功能需要）"
echo "  2. 填完后重启: cd ${INSTALL_DIR} && docker compose -f docker-compose.prod.yml restart app admin worker"
echo ""
