"""卡片上传文件的存取一致性。

历史遗留坑：上传写入 data/production/<pid>/uploads/，返回的 URL 却走
resource/production/ 前缀（RESOURCE_DIR=resouce/ 下并不存在该文件）——
上传成功但 GET 必 404。serve_resource 现对 production/ 前缀回退到 data/ 读。
同时钉住两条安全性质：媒体 GET 免鉴权可直连（<img> 场景）、路径穿越仍被拦。
"""
from __future__ import annotations

import pytest

# 1x1 红色 PNG（67 字节），够真实走完 multipart 上传
PNG_1PX = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108020000009077"
    "53de0000000c4944415408d763f8cfc000000301010018dd8db00000000049"
    "454e44ae426082"
)


@pytest.fixture()
def upload_env(tmp_path, monkeypatch, app_client):
    """隔离 production 数据目录到 tmp，并通过 API 造一个带单卡的项目。"""
    import app.api.production as prod

    monkeypatch.setattr(prod, "DATA_DIR", tmp_path)

    r = app_client.post("/api/v1/agentapp/production/projects", json={"name": "上传测试"})
    assert r.status_code == 200, r.text
    pid = r.json()["data"]["project_id"]

    r = app_client.post(f"/api/v1/agentapp/production/projects/{pid}/cards", json={
        "stage": "img_prompt", "title": "G1 首帧", "content": "x", "episode": 1, "shot_number": 1,
    })
    assert r.status_code == 200, r.text
    card_id = r.json()["data"]["card_id"]
    return app_client, pid, card_id


def test_uploaded_file_is_servable_via_returned_url(upload_env):
    """上传成功后，返回的 URL 必须能 GET 到同一份字节（写 data/ 读 resource/ 的回退）。"""
    client, pid, card_id = upload_env
    r = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/upload?file_type=image",
        files={"file": ("frame.png", PNG_1PX, "image/png")},
    )
    assert r.status_code == 200, r.text
    url = r.json()["data"]["url"]
    assert url.startswith("/api/v1/agentapp/production/resource/production/")

    resp = client.get(url)
    assert resp.status_code == 200, f"上传的图 GET 404：写读目录不一致回归 ({url})"
    assert resp.content == PNG_1PX


def test_media_get_is_auth_exempt(upload_env):
    """媒体 GET 必须免鉴权——浏览器 <img src> 不会带 Authorization 头。"""
    client, pid, card_id = upload_env
    r = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/upload?file_type=image",
        files={"file": ("frame.png", PNG_1PX, "image/png")},
    )
    url = r.json()["data"]["url"]
    resp = client.get(url, headers={"Authorization": ""})
    assert resp.status_code == 200


def test_traversal_still_blocked(upload_env):
    """production/ 前缀的 data/ 回退不得放开路径穿越。

    用 %2e%2e 编码形式——裸 ../ 会被 httpx 在客户端折叠掉，根本到不了服务端；
    编码形式则原样送达、由 Starlette 解码进 path 参数，才真正打到防护逻辑。
    """
    client, _, _ = upload_env
    resp = client.get(
        "/api/v1/agentapp/production/resource/production/%2e%2e/%2e%2e/%2e%2e/requirements.txt")
    assert resp.status_code in (403, 404), f"路径穿越未被拦截: {resp.status_code}"
