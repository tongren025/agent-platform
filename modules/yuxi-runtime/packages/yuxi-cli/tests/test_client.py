from __future__ import annotations

from yuxi_cli.client import YuxiClient
from yuxi_cli.config import Remote


def _patched_client(monkeypatch):
    client = YuxiClient(Remote(name="local", url="http://localhost:5173", api_key="yxkey_test"))
    calls: list[dict] = []

    def fake_request(method, path, **kwargs):
        calls.append({"method": method, "path": path, **kwargs})
        return {"ok": True, "method": method, "path": path}

    monkeypatch.setattr(client, "_request", fake_request)
    return client, calls


def test_run_agent_eval_uses_invocation_endpoint(monkeypatch):
    client, calls = _patched_client(monkeypatch)
    try:
        result = client.run_agent_eval(
            query="2+2=?",
            agent_slug="default-chatbot",
            evaluation={"dataset_name": "dataset-1"},
            meta={"request_id": "req-1"},
            timeout_seconds=123,
        )
    finally:
        client.close()

    assert result["method"] == "POST"
    assert result["path"] == "/agent-invocation/eval/runs"
    call = calls[-1]
    assert call["timeout"] == 123
    assert call["json"]["query"] == "2+2=?"
    assert call["json"]["agent_slug"] == "default-chatbot"
    assert call["json"]["evaluation"] == {"dataset_name": "dataset-1"}
    assert call["json"]["meta"] == {"request_id": "req-1"}


def test_list_external_databases_uses_external_path(monkeypatch):
    client, calls = _patched_client(monkeypatch)
    try:
        client.list_external_databases()
    finally:
        client.close()
    assert calls[-1]["method"] == "GET"
    assert calls[-1]["path"] == "/knowledge/databases/external"


def test_list_external_files_passes_query_params(monkeypatch):
    client, calls = _patched_client(monkeypatch)
    try:
        client.list_external_files("kb_1", query="report", offset=10, limit=50, status="indexed")
    finally:
        client.close()
    call = calls[-1]
    assert call["method"] == "GET"
    assert call["path"] == "/knowledge/databases/external/kb_1/files"
    params = call["params"]
    assert params["query"] == "report"
    assert params["offset"] == 10
    assert params["limit"] == 50
    assert params["status"] == "indexed"


def test_retrieve_external_posts_json_body(monkeypatch):
    client, calls = _patched_client(monkeypatch)
    try:
        client.retrieve_external("kb_1", query="hello", file_name="a.md", options={"final_top_k": 5})
    finally:
        client.close()
    call = calls[-1]
    assert call["method"] == "POST"
    assert call["path"] == "/knowledge/databases/external/kb_1/retrieve"
    assert call["json"] == {"query": "hello", "file_name": "a.md", "options": {"final_top_k": 5}}


def test_open_external_file_passes_offset_limit(monkeypatch):
    client, calls = _patched_client(monkeypatch)
    try:
        client.open_external_file("kb_1", "file_1", offset=20, limit=80)
    finally:
        client.close()
    call = calls[-1]
    assert call["method"] == "GET"
    assert call["path"] == "/knowledge/databases/external/kb_1/files/file_1/open"
    assert call["params"] == {"offset": 20, "limit": 80}


def test_find_external_file_posts_patterns(monkeypatch):
    client, calls = _patched_client(monkeypatch)
    try:
        client.find_external_file(
            "kb_1",
            "file_1",
            patterns=["foo", "bar"],
            use_regex=True,
            case_sensitive=True,
            max_windows=3,
            window_size=40,
        )
    finally:
        client.close()
    call = calls[-1]
    assert call["method"] == "POST"
    assert call["path"] == "/knowledge/databases/external/kb_1/files/file_1/find"
    assert call["json"]["patterns"] == ["foo", "bar"]
    assert call["json"]["use_regex"] is True
    assert call["json"]["case_sensitive"] is True
    assert call["json"]["max_windows"] == 3
    assert call["json"]["window_size"] == 40
