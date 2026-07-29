#!/usr/bin/env node
// 根仓库 pre-commit 入口：复用已随 Nomi 源码固定的同一安全扫描器。
import "../third_party/nomi/scripts/check-no-secrets.mjs";
