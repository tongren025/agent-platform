"""跨项目真实反馈汇总：统计高频问题、低健康项目和定向修复结果。

本模块只聚合已经生成的诊断与优化记录，不读写磁盘、不调用模型。API 可以使用
JSON 项目目录作为默认数据源，未来切换数据库时仍保持相同响应结构。
"""
from __future__ import annotations

from collections import Counter, defaultdict
from typing import Any


ISSUE_LABELS = {
    "source_missing": "缺少原始素材",
    "production_units_missing": "缺少结构化生产单元",
    "stage_missing": "规格阶段缺失",
    "quality_gate_failed": "静态质量门禁失败",
    "manual_review_required": "等待人工确认",
    "image_missing": "缺少镜头图片",
    "image_review_failed": "图片审核未通过",
    "video_processing": "视频生成中",
    "video_missing": "缺少镜头视频",
    "final_missing": "缺少当前成片",
}
ISSUE_RECOMMENDATIONS = {
    "source_missing": "先补齐可生成的创意、原著或明确需求。",
    "production_units_missing": "先生成结构化剧本，建立可逐镜推进的生产单元。",
    "stage_missing": "优先补齐缺失的文本规格，再进入图片和视频生成。",
    "quality_gate_failed": "按门禁明细定向返工，修复后再推进昂贵媒体阶段。",
    "manual_review_required": "先人工确认内容；没有失败原因时不要自动重写。",
    "image_missing": "规格通过后分批选择图片模型生成，先做小样再扩大批量。",
    "image_review_failed": "按退回原因修改当前提示词，只重新生成被退回的图片。",
    "video_processing": "等待任务完成并刷新状态，不要重复提交。",
    "video_missing": "先确认图片与视频提示词，再分批选择视频模型生成。",
    "final_missing": "全部镜头视频通过后，重新合成当前版本成片。",
}
STAGE_ORDER = {
    "source": 0,
    "script": 10,
    "storyboard": 20,
    "img_prompt": 30,
    "image": 40,
    "vid_prompt": 50,
    "video": 60,
    "final": 70,
}
ISSUE_RECOMMENDATION_ORDER = {
    "source_missing": 0,
    "production_units_missing": 10,
    "quality_gate_failed": 20,
    "manual_review_required": 30,
    "stage_missing": 40,
    "image_review_failed": 50,
    "image_missing": 60,
    "video_processing": 70,
    "video_missing": 80,
    "final_missing": 90,
}


def summarize_project_feedback(
    projects: list[dict[str, Any]],
    runs: list[dict[str, Any]],
) -> dict[str, Any]:
    """把多个项目诊断和优化运行收敛为可直接展示的真实反馈摘要。"""
    issue_count = Counter()
    issue_projects: dict[str, set[str]] = defaultdict(set)
    issue_stages: dict[str, Counter] = defaultdict(Counter)
    issue_auto = Counter()
    stage_count = Counter()
    project_summaries: list[dict[str, Any]] = []

    for item in projects:
        project_id = str(item.get("projectId") or "")
        diagnostics = item.get("diagnostics") or {}
        issues = diagnostics.get("issues") or []
        project_summaries.append({
            "projectId": project_id,
            "name": str(item.get("name") or project_id),
            "score": int(diagnostics.get("score") or 0),
            "blockerCount": int(diagnostics.get("blockerCount") or 0),
            "issueCount": len(issues),
            "topIssueCode": str(issues[0].get("code") or "") if issues else "",
        })
        for issue in issues:
            code = str(issue.get("code") or "unknown")
            stage = str(issue.get("stage") or "unknown")
            issue_count[code] += 1
            stage_count[stage] += 1
            issue_projects[code].add(project_id)
            issue_stages[code][stage] += 1
            if issue.get("autoFixable"):
                issue_auto[code] += 1

    total_issues = sum(issue_count.values())
    top_issues = []
    for code, count in issue_count.most_common():
        dominant_stage = issue_stages[code].most_common(1)[0][0]
        top_issues.append({
            "code": code,
            "label": ISSUE_LABELS.get(code, code),
            "count": count,
            "share": round(count / total_issues * 100, 1) if total_issues else 0,
            "projectCount": len(issue_projects[code]),
            "stage": dominant_stage,
            "autoFixableCount": issue_auto[code],
            "recommendation": ISSUE_RECOMMENDATIONS.get(
                code,
                "打开具体问题后按当前诊断说明处理。",
            ),
        })

    # 全局建议必须遵守生产依赖，不能因为“缺视频”数量更大就越过待确认文本或缺图。
    # 同一阶段内再优先明确可修的问题，最后才按频次决定。
    recommendations = list(top_issues)
    recommendations.sort(
        key=lambda item: (
            STAGE_ORDER.get(str(item["stage"]), 999),
            ISSUE_RECOMMENDATION_ORDER.get(str(item["code"]), 999),
            -int(item["autoFixableCount"]),
            -int(item["count"]),
        )
    )
    recommended = recommendations[0] if recommendations else None

    resolved = sum(1 for run in runs if run.get("status") == "resolved")
    needs_review = sum(1 for run in runs if run.get("status") == "needs_review")
    failed = sum(1 for run in runs if run.get("status") == "failed")
    gains = [
        int(run.get("afterScore") or 0) - int(run.get("beforeScore") or 0)
        for run in runs
        if run.get("status") == "resolved"
    ]
    optimization = {
        "total": len(runs),
        "resolved": resolved,
        "needsReview": needs_review,
        "failed": failed,
        "successRate": round(resolved / len(runs) * 100) if runs else None,
        "averageScoreGain": round(sum(gains) / len(gains), 1) if gains else None,
    }
    lowest_projects = sorted(
        project_summaries,
        key=lambda item: (
            int(item["score"]),
            -int(item["blockerCount"]),
            str(item["name"]),
        ),
    )[:5]
    average_score = (
        round(sum(item["score"] for item in project_summaries) / len(project_summaries))
        if project_summaries
        else 0
    )
    if not projects:
        summary = "还没有可统计的制作项目。"
    elif total_issues == 0:
        summary = f"{len(projects)} 个项目当前都已通过各自交付目标检查。"
    elif runs:
        summary = (
            f"{len(projects)} 个项目共有 {total_issues} 个待处理问题；"
            f"最近 {len(runs)} 次定向修复成功率为 {optimization['successRate']}%。"
        )
    else:
        summary = (
            f"{len(projects)} 个项目共有 {total_issues} 个待处理问题；"
            "尚无真实修复记录，成功率会从第一次实际操作开始累计。"
        )

    return {
        "status": "success",
        "summary": summary,
        "nextActions": (
            [recommended["recommendation"]]
            if recommended
            else ["继续保持当前交付质量"]
        ),
        "artifacts": ["data/production/*/project.json", "data/production/*/optimization-runs.json"],
        "projectCount": len(projects),
        "averageScore": average_score,
        "issueCount": total_issues,
        "autoFixableCount": sum(issue_auto.values()),
        "manualActionCount": total_issues - sum(issue_auto.values()),
        "topIssues": top_issues,
        "topStages": [
            {"stage": stage, "count": count}
            for stage, count in stage_count.most_common()
        ],
        "lowestProjects": lowest_projects,
        "optimization": optimization,
        "recommendedIssueCode": recommended["code"] if recommended else "",
    }
