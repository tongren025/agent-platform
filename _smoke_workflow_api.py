"""临时冒烟测试：工作流 API 全链路（CRUD + run + runs），用 template 节点，零网络。"""
from fastapi.testclient import TestClient
from app.main import app

c = TestClient(app)

wf = {
    "workflowKey": "smoke-wf",
    "name": "冒烟工作流",
    "nodes": [
        {"nodeKey": "s", "type": "start", "config": {"inputs": [{"name": "topic"}]}},
        {"nodeKey": "t", "type": "template", "config": {"template": "主题是：{{start.topic}}"}},
        {"nodeKey": "e", "type": "end", "config": {"outputTemplate": "结果 -> {{t.output}}"}},
    ],
    "edges": [
        {"edgeId": "1", "source": "s", "target": "t"},
        {"edgeId": "2", "source": "t", "target": "e"},
    ],
}

# 清理可能的残留
c.delete("/api/v1/agentapp/workflow/smoke-wf")

r = c.post("/api/v1/agentapp/workflow", json=wf)
print("CREATE", r.status_code, "validationError=", r.json()["data"].get("validationError"))
assert r.status_code == 200

r = c.get("/api/v1/agentapp/workflow")
keys = [w["workflowKey"] for w in r.json()["data"]]
print("LIST", r.status_code, keys)
assert "smoke-wf" in keys

r = c.get("/api/v1/agentapp/workflow/node-types")
print("NODE-TYPES", [n["type"] for n in r.json()["data"]])
assert r.status_code == 200 and len(r.json()["data"]) == 7

r = c.post("/api/v1/agentapp/workflow/smoke-wf/run", json={"inputs": {"topic": "猫咪漫剧"}})
data = r.json()["data"]
print("RUN", r.status_code, "status=", data["status"], "final=", repr(data["finalOutput"]))
assert r.status_code == 200 and data["status"] == "success"
assert data["finalOutput"] == "结果 -> 主题是：猫咪漫剧", data["finalOutput"]

r = c.get("/api/v1/agentapp/workflow/smoke-wf/runs")
print("RUNS", r.status_code, "count=", len(r.json()["data"]))
assert len(r.json()["data"]) >= 1

c.delete("/api/v1/agentapp/workflow/smoke-wf")
print("\nWORKFLOW API SMOKE PASSED")
