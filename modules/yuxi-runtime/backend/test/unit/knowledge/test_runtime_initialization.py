from __future__ import annotations

import json
import os
import subprocess
import sys
from types import SimpleNamespace

import pytest
from yuxi.knowledge.manager import KnowledgeBaseManager
from yuxi.knowledge.parser.factory import DocumentProcessorFactory
from yuxi.knowledge.parser.registry import PROCESSOR_TYPES

pytestmark = pytest.mark.unit


def test_document_processor_factory_uses_shared_registry():
    assert DocumentProcessorFactory.PROCESSOR_TYPES is PROCESSOR_TYPES


def test_knowledge_runtime_preserves_lite_mode(tmp_path):
    env = os.environ.copy()
    env["LITE_MODE"] = "1"
    result = subprocess.run(
        [
            sys.executable,
            "-c",
            (
                "import json; from yuxi.knowledge.runtime import knowledge_base; "
                "from yuxi.knowledge.factory import KnowledgeBaseFactory; "
                "print(json.dumps({"
                "'manager': type(knowledge_base).__name__, "
                "'types': sorted(KnowledgeBaseFactory.get_available_types())"
                "}))"
            ),
        ],
        cwd=tmp_path,
        env=env,
        capture_output=True,
        text=True,
        check=True,
    )

    loaded = json.loads(result.stdout.splitlines()[-1])
    assert loaded == {"manager": "KnowledgeBaseManager", "types": ["dify", "notion"]}


@pytest.mark.asyncio
async def test_initialize_awaits_existing_kb_metadata_loading(monkeypatch):
    """initialize() 必须等待 KB 元数据加载完成，避免启动后短期内操作命中未填充的缓存。"""
    manager = KnowledgeBaseManager("/tmp/yuxi-test")

    load_calls: list[str] = []

    async def fake_load_metadata(_self):
        load_calls.append("loaded")

    async def fake_get_all(_self):
        return [
            SimpleNamespace(kb_id="kb_1", kb_type="milvus"),
        ]

    fake_instance = SimpleNamespace()
    fake_instance._load_metadata = fake_load_metadata.__get__(fake_instance)

    def fake_create(_kb_type, _work_dir):
        return fake_instance

    monkeypatch.setattr(
        "yuxi.repositories.knowledge_base_repository.KnowledgeBaseRepository.get_all",
        fake_get_all,
    )
    monkeypatch.setattr(
        "yuxi.knowledge.manager.KnowledgeBaseFactory.is_type_supported",
        classmethod(lambda cls, _kb_type: True),
    )
    monkeypatch.setattr(
        "yuxi.knowledge.manager.KnowledgeBaseFactory.create",
        staticmethod(fake_create),
    )

    await manager.initialize()

    assert load_calls == ["loaded"]
    assert "milvus" in manager.kb_instances
