#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# 同步本地 data/ + resouce/ 到远程服务器
#
# 用法:
#   bash scripts/sync-assets.sh                # 使用默认服务器
#   bash scripts/sync-assets.sh user@host      # 指定服务器
#
# 同步内容:
#   data/     员工、团队、工作流、工具、技能、知识库、会话、生产卡片等
#   resouce/  美术素材（人物图/场景图/打包资料）
#
# docker-compose.prod.yml 通过 bind mount 直接映射宿主机目录进容器，
# rsync 完成后容器立刻可读取，无需重启。
# ─────────────────────────────────────────────────────────────
set -euo pipefail

REMOTE="${1:-root@47.85.46.171}"
INSTALL_DIR="/opt/agent-platform"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[SYNC]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*" >&2; }

ssh "${REMOTE}" "mkdir -p ${INSTALL_DIR}/data ${INSTALL_DIR}/resouce"

# ── 同步 data/ ──────────────────────────────────────────────
if [ -d "data" ]; then
    SIZE=$(du -sh data | cut -f1)
    log "同步 data/ (${SIZE}) → ${REMOTE}:${INSTALL_DIR}/data/"
    rsync -avz --progress \
        --exclude '*.bak*' \
        --exclude '*_log.jsonl' \
        --exclude 'thumb-cache/' \
        --exclude 'uploads/' \
        data/ \
        "${REMOTE}:${INSTALL_DIR}/data/"
    log "data/ 同步完成"
else
    warn "本地 data/ 目录不存在，跳过"
fi

# ── 同步 resouce/ ───────────────────────────────────────────
if [ -d "resouce" ]; then
    SIZE=$(du -sh resouce | cut -f1)
    log "同步 resouce/ (${SIZE}) → ${REMOTE}:${INSTALL_DIR}/resouce/"
    rsync -avz --progress \
        resouce/ \
        "${REMOTE}:${INSTALL_DIR}/resouce/"
    log "resouce/ 同步完成"
else
    warn "本地 resouce/ 目录不存在，跳过"
fi

log "全部同步完成！容器通过 bind mount 直接读取，无需重启。"
