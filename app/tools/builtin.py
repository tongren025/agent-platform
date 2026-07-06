"""内置工具：技能详情查询 + 知识库检索。模块加载时自动注册到全局工具 registry（main.py 顶部 import 触发）。"""
from __future__ import annotations

import json
import logging

from app.tools.base import ToolContext, register_handler
from app.dependencies import skill_registry, knowledge_retriever

logger = logging.getLogger(__name__)


class SkillDetailHandler:
    """get_skill_detail 工具：按技能编码返回技能详情（含树形子技能展开），让 agent 按需拉取技能全文而非全部塞进提示词。"""
    tool_code = "get_skill_detail"

    async def handle(self, ctx: ToolContext) -> str:
        """执行查询：校验 skill_code，返回技能详情 JSON（树形技能递归展开 children）。"""
        args = ctx.parse_args()
        skill_code = args.get("skill_code", "").strip()
        if not skill_code:
            return json.dumps({"error": "skill_code is required"})

        skill = skill_registry.get(skill_code)
        if skill is None:
            return json.dumps({"error": f"Skill not found: {skill_code}"})

        result: dict = {
            "code": skill.code,
            "name": skill.name,
            "summary": skill.summary or "",
            "description": skill.description or "",
        }

        if skill.is_tree and skill.children:
            result["children"] = self._collect_children(skill.children)

        return json.dumps(result, ensure_ascii=False)

    def _collect_children(self, children: list[dict]) -> list[dict]:
        """递归展开子技能：优先用注册表里的最新定义覆盖节点内嵌数据。"""
        collected: list[dict] = []
        for child in children:
            child_code = child.get("code", "")
            entry: dict = {
                "code": child_code,
                "name": child.get("name", ""),
                "summary": child.get("summary", ""),
            }

            child_skill = skill_registry.get(child_code) if child_code else None
            if child_skill is not None:
                entry["name"] = child_skill.name or entry["name"]
                entry["summary"] = child_skill.summary or entry["summary"]
                entry["description"] = child_skill.description or ""
                if child_skill.is_tree and child_skill.children:
                    entry["children"] = self._collect_children(child_skill.children)
            elif child.get("children"):
                entry["children"] = self._collect_children(child["children"])

            collected.append(entry)
        return collected


class KnowledgeQueryHandler:
    """query_knowledge_base 工具：在该员工的知识库中按关键词检索，返回 top-k 片段（top_k 限 1-20）。"""
    tool_code = "query_knowledge_base"

    async def handle(self, ctx: ToolContext) -> str:
        """执行检索：校验 query，调 knowledge_retriever 返回命中片段 JSON。"""
        args = ctx.parse_args()
        query = args.get("query", "").strip()
        if not query:
            return json.dumps({"error": "query is required"})

        top_k = args.get("top_k", 5)
        try:
            top_k = int(top_k)
        except (ValueError, TypeError):
            top_k = 5
        top_k = max(1, min(top_k, 20))

        hits = knowledge_retriever.search(ctx.employee_key, query, top_k)

        return json.dumps(
            {
                "hits": [
                    {
                        "doc_id": h.doc_id,
                        "file_name": h.file_name,
                        "excerpt": h.excerpt,
                        "score": h.score,
                    }
                    for h in hits
                ]
            },
            ensure_ascii=False,
        )


register_handler(SkillDetailHandler())
register_handler(KnowledgeQueryHandler())
