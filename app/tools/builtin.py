from __future__ import annotations

import json
import logging

from app.tools.base import ToolContext, register_handler
from app.dependencies import skill_registry, knowledge_retriever

logger = logging.getLogger(__name__)


class SkillDetailHandler:
    tool_code = "get_skill_detail"

    async def handle(self, ctx: ToolContext) -> str:
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
    tool_code = "query_knowledge_base"

    async def handle(self, ctx: ToolContext) -> str:
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
