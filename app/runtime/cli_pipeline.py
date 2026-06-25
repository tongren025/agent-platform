"""
CLI Pipeline — 按角色顺序调 CLI，每步写入文件，最终合并。
不依赖 API Key，直接用本地已认证的 claude / gemini CLI。
"""
from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from app.config import BASE_DIR
from app.runtime.cli_executor import run_cli, check_available_clis

logger = logging.getLogger(__name__)

OUTPUT_DIR = BASE_DIR / "output"


# ── 角色 → CLI 映射（默认方案，可在员工配置里覆盖）─────────────────

DEFAULT_CLI_MAP: dict[str, str] = {
    # 文本/叙事类 → Claude（对白、角色塑造、逻辑推理最强）
    "comic-director": "claude",
    "comic-screenwriter": "claude",
    "comic-character-designer": "claude",
    "comic-storyboard": "claude",
    "comic-scene-designer": "claude",
    # 视觉描述/提示词类 → Gemini（多模态、图像描述强）
    "comic-prompt-engineer": "gemini",
    "comic-character-artist": "gemini",
    "comic-scene-artist": "gemini",
    "comic-keyframe-artist": "gemini",
}


@dataclass
class StepResult:
    employee_key: str
    name: str
    cli_type: str
    output_file: str
    output_text: str
    success: bool = True
    error: Optional[str] = None
    elapsed_seconds: float = 0


@dataclass
class PipelineRunResult:
    run_id: str
    theme: str
    output_dir: str
    steps: list[StepResult] = field(default_factory=list)
    final_file: Optional[str] = None
    success: bool = True
    total_seconds: float = 0


# ── 流水线阶段定义 ────────────────────────────────────────────────

PIPELINE_STAGES: list[dict] = [
    {
        "order": 1,
        "employee_key": "comic-director",
        "name": "导演·统筹",
        "file": "01_director.md",
        "prompt_template": (
            "你是漫剧导演。把下面的题材拆成一份创作简报"
            "（题材定位、目标受众、核心看点、集数建议、每集梗概）：\n\n{theme}"
        ),
        "depends_on": [],
    },
    {
        "order": 2,
        "employee_key": "comic-screenwriter",
        "name": "编剧·剧本",
        "file": "02_screenwriter.md",
        "prompt_template": (
            "你是编剧。根据导演的创作简报，写出完整的分集剧本"
            "（每集分场、场景描写、角色动作、对白）：\n\n{director}"
        ),
        "depends_on": ["01_director.md"],
    },
    {
        "order": 3,
        "employee_key": "comic-character-designer",
        "name": "角色设计",
        "file": "03_character_design.md",
        "prompt_template": (
            "你是角色设计师。根据剧本设计所有角色"
            "（外形、服装、性格、标志性特征、色彩方案）：\n\n{screenwriter}"
        ),
        "depends_on": ["02_screenwriter.md"],
    },
    {
        "order": 4,
        "employee_key": "comic-scene-designer",
        "name": "场景设计",
        "file": "04_scene_design.md",
        "prompt_template": (
            "你是场景设计师。根据剧本设计所有主要场景"
            "（环境、光线、氛围、关键道具、色调）：\n\n{screenwriter}"
        ),
        "depends_on": ["02_screenwriter.md"],
    },
    {
        "order": 5,
        "employee_key": "comic-storyboard",
        "name": "分镜",
        "file": "05_storyboard.md",
        "prompt_template": (
            "你是分镜师。根据剧本制作分镜"
            "（镜头号、景别、构图、角色位置、动作、转场）：\n\n{screenwriter}"
        ),
        "depends_on": ["02_screenwriter.md"],
    },
    {
        "order": 6,
        "employee_key": "comic-prompt-engineer",
        "name": "提示词工程",
        "file": "06_prompt_engineer.md",
        "prompt_template": (
            "你是提示词工程师。把以下设定转化为可直接出图的中文绘图提示词"
            "（分角色、场景、关键帧三组，每条提示词完整可用）：\n\n"
            "【角色设定】\n{character_design}\n\n"
            "【场景设定】\n{scene_design}\n\n"
            "【分镜】\n{storyboard}"
        ),
        "depends_on": [
            "03_character_design.md",
            "04_scene_design.md",
            "05_storyboard.md",
        ],
    },
    {
        "order": 7,
        "employee_key": "comic-character-artist",
        "name": "角色原画",
        "file": "07_character_art.md",
        "prompt_template": (
            "你是角色图生成师。根据提示词产出每个角色的最终出图提示词"
            "（正面全身、侧面、表情特写各一条）：\n\n{prompt_engineer}"
        ),
        "depends_on": ["06_prompt_engineer.md"],
    },
    {
        "order": 8,
        "employee_key": "comic-scene-artist",
        "name": "场景原画",
        "file": "08_scene_art.md",
        "prompt_template": (
            "你是场景图生成师。根据提示词产出每个场景的最终出图提示词"
            "（全景、中景各一条，含光线和氛围描述）：\n\n{prompt_engineer}"
        ),
        "depends_on": ["06_prompt_engineer.md"],
    },
    {
        "order": 9,
        "employee_key": "comic-keyframe-artist",
        "name": "关键帧",
        "file": "09_keyframe_art.md",
        "prompt_template": (
            "你是关键帧生成师。根据提示词为每个 shot 产出九宫格时序参考图提示词"
            "（每格一句描述）：\n\n{prompt_engineer}"
        ),
        "depends_on": ["06_prompt_engineer.md"],
    },
]


def _load_employee_system_prompt(employee_key: str) -> str:
    fp = BASE_DIR / "data" / "employees" / f"{employee_key}.json"
    if not fp.exists():
        return ""
    data = json.loads(fp.read_text(encoding="utf-8"))
    return data.get("roleProfile", "")


def _get_cli_for_employee(employee_key: str) -> str:
    fp = BASE_DIR / "data" / "employees" / f"{employee_key}.json"
    if fp.exists():
        data = json.loads(fp.read_text(encoding="utf-8"))
        cli_cfg = data.get("cliProvider")
        if cli_cfg and isinstance(cli_cfg, dict):
            return cli_cfg.get("type", DEFAULT_CLI_MAP.get(employee_key, "claude"))
    return DEFAULT_CLI_MAP.get(employee_key, "claude")


def _resolve_prompt(stage: dict, outputs: dict[str, str], theme: str) -> str:
    tpl = stage["prompt_template"]

    var_map = {
        "theme": theme,
        "director": outputs.get("01_director.md", ""),
        "screenwriter": outputs.get("02_screenwriter.md", ""),
        "character_design": outputs.get("03_character_design.md", ""),
        "scene_design": outputs.get("04_scene_design.md", ""),
        "storyboard": outputs.get("05_storyboard.md", ""),
        "prompt_engineer": outputs.get("06_prompt_engineer.md", ""),
    }

    result = tpl
    for k, v in var_map.items():
        result = result.replace(f"{{{k}}}", v)
    return result


def _build_final_doc(run_dir: Path, steps: list[StepResult], theme: str) -> Path:
    parts: list[str] = [
        f"# 漫剧创作完整文档\n\n",
        f"**题材**: {theme}\n",
        f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n",
        "---\n\n",
    ]

    for step in steps:
        if step.success and step.output_text:
            parts.append(f"## {step.name}\n\n")
            parts.append(f"*（{step.cli_type} CLI · {step.elapsed_seconds:.1f}s）*\n\n")
            parts.append(step.output_text)
            parts.append("\n\n---\n\n")

    final_path = run_dir / "99_final.md"
    final_path.write_text("".join(parts), encoding="utf-8")
    return final_path


async def run_pipeline(
    theme: str,
    run_id: Optional[str] = None,
    cli_overrides: Optional[dict[str, str]] = None,
    skip_employees: Optional[list[str]] = None,
) -> PipelineRunResult:
    if not run_id:
        run_id = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    run_dir = OUTPUT_DIR / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    available = check_available_clis()
    logger.info("Available CLIs: %s", available)

    result = PipelineRunResult(
        run_id=run_id,
        theme=theme,
        output_dir=str(run_dir),
    )

    # 保存原始题材
    (run_dir / "00_brief.md").write_text(
        f"# 创作题材\n\n{theme}\n", encoding="utf-8"
    )

    outputs: dict[str, str] = {}
    total_start = time.monotonic()
    skip_set = set(skip_employees or [])

    # 按 order 分组，同 order 可以并行（但 CLI 并行需要注意速率）
    sorted_stages = sorted(PIPELINE_STAGES, key=lambda s: s["order"])

    for stage in sorted_stages:
        emp_key = stage["employee_key"]
        if emp_key in skip_set:
            logger.info("Skipping %s (user excluded)", emp_key)
            continue

        # 确定使用哪个 CLI
        cli_type = (cli_overrides or {}).get(
            emp_key, _get_cli_for_employee(emp_key)
        )

        if not available.get(cli_type, False):
            # 降级到可用的 CLI
            fallback = "claude" if available.get("claude") else "gemini"
            if available.get(fallback):
                logger.warning(
                    "%s CLI not available, falling back to %s for %s",
                    cli_type, fallback, emp_key,
                )
                cli_type = fallback
            else:
                step = StepResult(
                    employee_key=emp_key,
                    name=stage["name"],
                    cli_type=cli_type,
                    output_file=stage["file"],
                    output_text="",
                    success=False,
                    error=f"{cli_type} CLI 不可用",
                )
                result.steps.append(step)
                continue

        # 检查依赖是否就绪
        deps_ready = all(d in outputs for d in stage["depends_on"])
        if not deps_ready:
            step = StepResult(
                employee_key=emp_key,
                name=stage["name"],
                cli_type=cli_type,
                output_file=stage["file"],
                output_text="",
                success=False,
                error="前置步骤未完成",
            )
            result.steps.append(step)
            continue

        # 组装提示词
        system_prompt = _load_employee_system_prompt(emp_key)
        user_prompt = _resolve_prompt(stage, outputs, theme)

        logger.info(
            "[Pipeline %s] Step %d: %s → %s CLI",
            run_id, stage["order"], stage["name"], cli_type,
        )

        step_start = time.monotonic()
        try:
            output_text = await run_cli(
                cli_type=cli_type,
                prompt=user_prompt,
                system_prompt=system_prompt,
                timeout_seconds=300,
            )
            elapsed = time.monotonic() - step_start

            # 写入文件
            out_path = run_dir / stage["file"]
            out_path.write_text(
                f"# {stage['name']}\n\n{output_text}\n",
                encoding="utf-8",
            )

            outputs[stage["file"]] = output_text

            step = StepResult(
                employee_key=emp_key,
                name=stage["name"],
                cli_type=cli_type,
                output_file=stage["file"],
                output_text=output_text,
                success=True,
                elapsed_seconds=round(elapsed, 1),
            )
            logger.info(
                "[Pipeline %s] ✓ %s done in %.1fs (%d chars)",
                run_id, stage["name"], elapsed, len(output_text),
            )

        except Exception as exc:
            elapsed = time.monotonic() - step_start
            logger.error(
                "[Pipeline %s] ✗ %s failed: %s", run_id, stage["name"], exc,
            )
            step = StepResult(
                employee_key=emp_key,
                name=stage["name"],
                cli_type=cli_type,
                output_file=stage["file"],
                output_text="",
                success=False,
                error=str(exc),
                elapsed_seconds=round(elapsed, 1),
            )

        result.steps.append(step)

    # 合并最终文档
    final_path = _build_final_doc(run_dir, result.steps, theme)
    result.final_file = str(final_path)
    result.total_seconds = round(time.monotonic() - total_start, 1)
    result.success = any(s.success for s in result.steps)

    # 写运行元数据
    manifest = {
        "runId": run_id,
        "theme": theme,
        "startedAt": datetime.now(timezone.utc).isoformat(),
        "totalSeconds": result.total_seconds,
        "steps": [
            {
                "employeeKey": s.employee_key,
                "name": s.name,
                "cliType": s.cli_type,
                "file": s.output_file,
                "success": s.success,
                "error": s.error,
                "elapsedSeconds": s.elapsed_seconds,
                "outputLength": len(s.output_text),
            }
            for s in result.steps
        ],
    }
    (run_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    logger.info(
        "[Pipeline %s] Complete: %d/%d steps succeeded in %.1fs",
        run_id,
        sum(1 for s in result.steps if s.success),
        len(result.steps),
        result.total_seconds,
    )

    return result

if __name__ == "__main__":
    import asyncio
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="CLI 创作流水线")
    parser.add_argument("--theme", type=str, required=True, help="漫剧题材/梗概")
    parser.add_argument("--run-id", type=str, help="运行 ID，默认自动生成")
    
    args = parser.parse_args()
    
    try:
        res = asyncio.run(run_pipeline(theme=args.theme, run_id=args.run_id))
        if res.success:
            print(f"✅ 流水线执行成功，输出目录：{res.output_dir}")
        else:
            print(f"❌ 流水线执行失败或部分失败，输出目录：{res.output_dir}")
    except Exception as e:
        print(f"❌ 运行报错: {e}")
