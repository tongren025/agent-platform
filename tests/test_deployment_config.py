"""部署编排回归测试：容器网络地址与镜像运行时文件必须完整。"""
from __future__ import annotations

from pathlib import Path

import pytest
import yaml


ROOT = Path(__file__).resolve().parents[1]


def _compose_services() -> dict:
    compose = yaml.safe_load((ROOT / "docker-compose.yml").read_text(encoding="utf-8"))
    return compose["services"]


@pytest.mark.parametrize("service_name", ["app", "admin", "worker"])
def test_compose_uses_container_network_addresses(service_name: str):
    """主机开发地址不能覆盖容器内的 postgres/redis 服务名。"""
    environment = _compose_services()[service_name]["environment"]

    assert environment["REDIS_URL"] == "redis://redis:6379/0"
    assert "@postgres:5432/" in environment["DATABASE_URL"]
    assert "${DATABASE_URL" not in environment["DATABASE_URL"]


def test_runtime_image_contains_skill_tracker_package():
    """默认开启的趋势同步任务在运行时镜像中必须能导入其包。"""
    dockerfile = (ROOT / "Dockerfile").read_text(encoding="utf-8")

    assert "COPY skill_tracker/ ./skill_tracker/" in dockerfile


def test_runtime_image_contains_node_runner_for_stdio_mcp():
    """工具页默认示例使用 npx；运行镜像必须能真正启动这类 stdio MCP。"""
    dockerfile = (ROOT / "Dockerfile").read_text(encoding="utf-8")

    assert "nodejs npm" in dockerfile


def test_tools_page_exposes_mcp_connection_test():
    """MCP 保存后应能在同一页面直接测试，不依赖用户猜测系统管家入口。"""
    source = (ROOT / "web" / "src" / "pages" / "Tools.tsx").read_text(
        encoding="utf-8",
    )

    assert "api.testSystemManagerMcp(serverCode)" in source
    assert ">测试</Button>" in source
    assert "commandArgs: v.args" in source
    assert "r.commandArgs?.join" in source


def test_grafana_optional_provisioning_directories_exist():
    """Grafana 启动时会读取这两个可选目录；缺失会产生误导性的 error 日志。"""
    provisioning = ROOT / "deploy" / "grafana" / "provisioning"

    assert (provisioning / "plugins").is_dir()
    assert (provisioning / "alerting").is_dir()
