"""生成模块索引 docs/MODULE_INDEX.md —— 从代码 docstring 自动提取，保证与代码同步。

用法：python -m scripts.gen_module_index
何时跑：新增/重命名模块、大改某模块职责之后。产物进版本库。

提取规则：
- Python：每个模块的 docstring 首行；frontend：每个 ts/tsx 文件的首行 // 注释。
- 按目录分组输出 Markdown 表格，路径可点击跳转。
"""
from __future__ import annotations

import ast
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "MODULE_INDEX.md"

PY_ROOTS = ["app", "admin", "evals"]
FE_ROOT = ROOT / "web" / "src"


def _module_doc_first_line(p: Path) -> str:
    """取 Python 模块 docstring 的第一行（无 docstring 返回空串）。"""
    try:
        doc = ast.get_docstring(ast.parse(p.read_text(encoding="utf-8")))
    except Exception:
        return "(解析失败)"
    if not doc:
        return ""
    return doc.strip().splitlines()[0].strip()


def _fe_header_first_line(p: Path) -> str:
    """取前端文件顶部 // 注释的第一行。"""
    try:
        first = p.read_text(encoding="utf-8", errors="replace").lstrip().splitlines()[0]
    except Exception:
        return ""
    if first.startswith("//"):
        return first.lstrip("/ ").strip()
    return ""


def _collect_python() -> dict[str, list[tuple[str, str]]]:
    """按目录分组收集 (相对路径, 模块说明)。"""
    groups: dict[str, list[tuple[str, str]]] = {}
    for root in PY_ROOTS:
        for p in sorted((ROOT / root).rglob("*.py")):
            if "__pycache__" in str(p):
                continue
            rel = p.relative_to(ROOT).as_posix()
            group = str(Path(rel).parent).replace("\\", "/")
            groups.setdefault(group, []).append((rel, _module_doc_first_line(p)))
    return groups


def _collect_frontend() -> dict[str, list[tuple[str, str]]]:
    groups: dict[str, list[tuple[str, str]]] = {}
    for p in sorted(FE_ROOT.rglob("*.ts*")):
        if "node_modules" in str(p):
            continue
        rel = p.relative_to(ROOT).as_posix()
        group = str(Path(rel).parent).replace("\\", "/")
        groups.setdefault(group, []).append((rel, _fe_header_first_line(p)))
    return groups


def _render(groups: dict[str, list[tuple[str, str]]]) -> list[str]:
    lines: list[str] = []
    for group in sorted(groups):
        lines.append(f"### `{group}/`\n")
        lines.append("| 文件 | 干什么 |")
        lines.append("|------|--------|")
        for rel, doc in groups[group]:
            name = Path(rel).name
            lines.append(f"| [{name}](../{rel}) | {doc or '—'} |")
        lines.append("")
    return lines


def main() -> None:
    """收集全部模块说明并写出 docs/MODULE_INDEX.md。"""
    lines = [
        "# 模块索引（自动生成）",
        "",
        "> 由 `python -m scripts.gen_module_index` 从各模块 docstring / 文件头注释提取。",
        "> **不要手改本文件**——改对应源文件的模块 docstring 后重新生成。",
        "> 架构导览与数据流见 [ARCHITECTURE.md](ARCHITECTURE.md)。",
        "",
        "## 后端（Python）",
        "",
    ]
    lines += _render(_collect_python())
    lines += ["## 前端（web/src）", ""]
    lines += _render(_collect_frontend())

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    py_count = sum(len(v) for v in _collect_python().values())
    fe_count = sum(len(v) for v in _collect_frontend().values())
    print(f"已生成 {OUT}（后端 {py_count} 模块 + 前端 {fe_count} 文件）")


if __name__ == "__main__":
    main()
