"""项目知识库检索与源码基线检查（仅用 Python 标准库）。

用法：python -m scripts.project_kb search "Redis 队列"
      python -m scripts.project_kb check
      python -m scripts.project_kb refresh
检索实时读取文档，不依赖网络、数据库、模型或员工运行时知识库。
refresh 只记录文件哈希，不能代替人工核对文档事实。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASELINE = Path("docs/knowledge/SOURCE_SNAPSHOT.json")
SOURCE_DIRS = ("app", "admin", "web/src", "migrations", "scripts", "tests", "evals")
SOURCE_EXTENSIONS = {".py", ".ts", ".tsx", ".css", ".yml", ".yaml"}
ROOT_SOURCES = (
    "README.md", "AGENTS.md", "CLAUDE.md", "pyproject.toml", "requirements.txt",
    "requirements-dev.txt", ".env.example", "docker-compose.yml",
    "docker-compose.prod.yml", "Dockerfile", "Dockerfile.prod",
    "web/package.json", "web/vite.config.ts", "alembic.ini",
)
LEGACY_DOCS = (
    "docs/ARCHITECTURE.md", "docs/MODULE_INDEX.md", "docs/RUNBOOK.md",
    "docs/USER_GUIDE.md", "docs/SYSTEM_MANAGER.md", "docs/MULTIMODAL_EMPLOYEES.md",
    "docs/VISUAL_ASSET_ROLES.md", "docs/GC_STORYBOARD_PROMPTS.md",
    "docs/GUIDED_PRODUCTION_QA.md", "docs/PROMPT_STANDARD_V3.md",
)


def document_paths(root: Path) -> list[Path]:
    """返回人工知识页和已有主平台手册，排除历史日志及运行生成的数据。"""
    paths = set((root / "docs/knowledge").glob("*.md"))
    paths.update(root / name for name in LEGACY_DOCS if (root / name).is_file())
    return sorted(paths)


def source_hashes(root: Path) -> dict[str, str]:
    """对主平台源码、测试、配置样例与知识文档建立哈希；不读取 .env 和业务数据。"""
    paths = set(document_paths(root))
    paths.update(root / name for name in ROOT_SOURCES if (root / name).is_file())
    for name in SOURCE_DIRS:
        directory = root / name
        if directory.is_dir():
            paths.update(
                path for path in directory.rglob("*")
                if path.is_file() and path.suffix in SOURCE_EXTENSIONS
                and not {"__pycache__", "node_modules", ".pytest_cache"}.intersection(path.parts)
            )
    return {
        path.relative_to(root).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in sorted(paths)
    }


def refresh(root: Path) -> int:
    """记录已核对的源码基线；调用前应先人工更新专题和生成模块索引。"""
    files = source_hashes(root)
    target = root / BASELINE
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps({"version": 1, "files": files}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"记录 {len(files)} 个文件哈希。此命令只更新基线，不证明文档已与源码一致。")
    return 0


def check(root: Path) -> int:
    """显示相对基线新增、修改和删除的文件；有变化返回 1，缺少基线返回 2。"""
    target = root / BASELINE
    if not target.is_file():
        print("缺少 SOURCE_SNAPSHOT.json；先核对文档，再执行 refresh。")
        return 2
    previous = json.loads(target.read_text(encoding="utf-8"))["files"]
    current = source_hashes(root)
    changes = [
        (name, "新增" if name not in previous else "删除" if name not in current else "修改")
        for name in sorted(previous.keys() | current.keys())
        if previous.get(name) != current.get(name)
    ]
    if not changes:
        print(f"基线范围内 {len(current)} 个文件未变化；文档内容仍以源码核对为准。")
        return 0
    print(f"{len(changes)} 个文件相对知识库基线发生变化：")
    for name, status in changes[:60]:
        print(f"  {status} {name}")
    if len(changes) > 60:
        print(f"  其余 {len(changes) - 60} 项省略。")
    return 1


def tokens(text: str) -> Counter[str]:
    """按英文标识符与中文二元片段切词，支持不安装中文分词器的本地查询。"""
    terms = re.findall(r"[a-z0-9_]+", text.lower())
    for phrase in re.findall(r"[\u4e00-\u9fff]+", text):
        terms.extend(phrase[i:i + 2] for i in range(len(phrase) - 1))
        if len(phrase) == 1:
            terms.append(phrase)
    return Counter(terms)


def chunks(root: Path) -> list[dict]:
    """按 Markdown 标题切块，保留相对路径与当前行号用于引用。"""
    result = []
    for path in document_paths(root):
        title, start, body = path.stem, 1, []
        lines = path.read_text(encoding="utf-8-sig").splitlines()
        for number, line in enumerate(lines, 1):
            if line.startswith("#"):
                if body:
                    result.append({"path": path.relative_to(root).as_posix(), "line": start, "title": title, "text": "\n".join(body)})
                title, start, body = line.lstrip("# ").strip(), number, [line]
            else:
                body.append(line)
        if body:
            result.append({"path": path.relative_to(root).as_posix(), "line": start, "title": title, "text": "\n".join(body)})
    return result


def search(root: Path, query: str, limit: int = 5) -> list[dict]:
    """用词项权重和标题加权检索知识块，返回附路径/行号的最相关片段。"""
    query_terms = tokens(query)
    if not query_terms:
        return []
    records = chunks(root)
    frequencies = [tokens(record["text"]) for record in records]
    df = Counter(term for frequency in frequencies for term in frequency)
    ranked = []
    for record, frequency in zip(records, frequencies):
        title_terms = tokens(record["title"])
        score = sum(
            (1 + math.log(frequency[term])) * math.log(1 + (len(records) + 1) / (df[term] + 1))
            * (2 if term in title_terms else 1)
            for term in query_terms if frequency[term]
        )
        # 同一词出现很多次不应让长模块目录压过直接回答的短专题。
        score /= 1 + math.log(1 + sum(frequency.values())) / 8
        if query.casefold() in record["text"].casefold():
            score += 5
        if score > 0:
            ranked.append({**record, "score": score})
    return sorted(ranked, key=lambda item: (-item["score"], item["path"], item["line"]))[:limit]


def main() -> int:
    """提供无外部依赖的 search/check/refresh 命令行入口。"""
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    query_parser = commands.add_parser("search", help="实时搜索知识文档")
    query_parser.add_argument("query")
    query_parser.add_argument("--limit", type=int, choices=range(1, 21), default=5)
    query_parser.add_argument("--json", action="store_true")
    commands.add_parser("check", help="检查源码是否偏离知识库基线")
    commands.add_parser("refresh", help="人工核对文档后记录文件哈希")
    args = parser.parse_args()
    if args.command == "check":
        return check(ROOT)
    if args.command == "refresh":
        return refresh(ROOT)
    results = search(ROOT, args.query, args.limit)
    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        if not results:
            print("没有匹配结果；可改用主题名、英文符号，或查询 CodeGraph。")
        for item in results:
            print(f"\n{item['path']}:{item['line']} — {item['title']}")
            print(item["text"][:900])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
