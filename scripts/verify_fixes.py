"""验证三个修复 + 清洗存量 LaTeX 脏数据。"""
import sys, asyncio, json, glob
sys.path.insert(0, ".")
from app.utils import strip_latex_artifacts as cl

# ── 清洗存量记忆里的 LaTeX 残留 ──
print("=== 清洗存量记忆 LaTeX 残留 ===")
cleaned = 0
for fp in glob.glob("data/memory/*/*.json"):
    if fp.endswith("distillation_logs.json"):
        continue
    try:
        data = json.load(open(fp, encoding="utf-8"))
    except Exception:
        continue
    changed = False
    for m in data:
        for k in ("content", "observation", "action", "result", "rule", "rationale"):
            if k in m and isinstance(m[k], str):
                nv = cl(m[k])
                if nv != m[k]:
                    m[k] = nv; changed = True; cleaned += 1
    if changed:
        json.dump(data, open(fp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        print(f"  清洗 {fp}")
print(f"  共清洗 {cleaned} 个字段\n")

# ── Fix2: 验证正典(craft/knowledge)现在进 always-on 注入 ──
print("=== Fix2: 注入是否含正典类别 ===")
from app.runtime.snapshot import load_snapshot
from app.runtime.scope import build_scopes
from app.runtime.prompt import compile as compile_prompt
scopes = build_scopes("comic-prompt-engineer", None)
snap = load_snapshot("comic-prompt-engineer", scopes)
sp = compile_prompt(snap, scopes, None).system_prompt
import re
m = re.search(r"<user_knowledge>(.*?)</user_knowledge>", sp, re.S)
block = m.group(1) if m else ""
cats = re.findall(r"- \[([^\]]+)\]", block)
from collections import Counter
print(f"  注入语义记忆 {len(cats)} 条，类别分布: {dict(Counter(cats))}")
print(f"  含手艺源(StudioBinder等): {'✓' if any(x in block for x in ['StudioBinder','No Film School','AnimeOutline']) else '✗'}")
print(f"  含维基出处: {'✓' if '维基百科' in block else '✗'}\n")

# ── Fix1: 跑 distillation 确认不再 KeyError ──
print("=== Fix1: distillation 不再 KeyError ===")
from app.services.distillation import run_distillation
async def t():
    log = await run_distillation("comic-qa-inspector")
    print(f"  status error={log.error!r}")
    print(f"  before={log.before_counts} after={log.after_counts}")
    print(f"  {'✓ 跑通(无KeyError)' if not (log.error and 'KeyError' in str(log.error)) else '✗ 仍报错'}")
asyncio.run(t())
