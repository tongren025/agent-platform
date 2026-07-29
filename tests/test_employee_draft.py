"""智能员工草稿接口：用户只描述岗位，系统负责生成可直接创建的完整配置。"""
from __future__ import annotations

import json


def test_generate_employee_draft_with_llm(app_client, stub_llm):
    """有效模型回复应转成前端可直接回填的员工草稿。"""
    stub_llm["content"] = json.dumps(
        {
            "employeeKey": "software-architect",
            "name": "软件架构师",
            "roleProfile": (
                "你是一名资深软件架构师，负责把业务目标转化为可演进的系统架构。"
                "先确认业务规模、质量属性、团队能力和交付约束，再输出组件边界、数据流、"
                "接口契约、关键技术选型及其取舍。必须主动识别容量、安全、可用性和迁移风险，"
                "所有结论都给出验证方式。输出顺序为结论、架构方案、决策记录、实施阶段、"
                "风险清单和验收标准；信息不足时只追问最影响决策的关键问题。"
            ),
            "deepAgent": True,
            "tags": ["架构", "技术决策", "方案评审"],
            "skillRefs": ["definitely-not-existing"],
            "toolRefs": [],
            "mcpServerRefs": [],
            "temperature": 0.3,
            "maxTokens": 8192,
        },
        ensure_ascii=False,
    )

    response = app_client.post(
        "/api/v1/agentapp/registry/employees/generate-draft",
        json={"roleRequest": "我要一个软件架构师", "modelId": "gpt-4o"},
    )

    assert response.status_code == 200
    draft = response.json()["data"]
    assert draft["generatedBy"] == "ai"
    assert draft["employeeKey"].startswith("software-architect")
    assert draft["name"] == "软件架构师"
    assert "架构方案" in draft["roleProfile"]
    assert draft["skillRefs"] == []
    assert draft["defaultModelPolicy"]["model_id"] == "gpt-4o"
    assert draft["defaultModelPolicy"]["temperature"] == 0.3


def test_generate_employee_draft_falls_back_without_model(app_client, monkeypatch):
    """模型不可用也不能把空白提示词表单重新丢给用户。"""
    from app.dependencies import ai_service

    def unavailable():
        raise ValueError("没有可用模型")

    monkeypatch.setattr(ai_service, "get_default_client", unavailable)

    response = app_client.post(
        "/api/v1/agentapp/registry/employees/generate-draft",
        json={"roleRequest": "软件架构师"},
    )

    assert response.status_code == 200
    draft = response.json()["data"]
    assert draft["generatedBy"] == "fallback"
    assert draft["employeeKey"].startswith("software-architect")
    assert draft["name"] == "软件架构师"
    assert draft["roleProfile"].startswith("你是资深软件架构师")
    assert "核心职责" in draft["roleProfile"]
    assert "工作方式" in draft["roleProfile"]
    assert "行为边界" in draft["roleProfile"]
    assert draft["defaultModelPolicy"]["max_tokens"] == 8192
