"""清洗存量被JSON破坏的LaTeX残留(CR+ightarrow) + 重跑抽取验证 extractor 修复。"""
import sys, re, json, glob, asyncio
sys.path.insert(0, ".")

# 处理被 json 解析破坏的残留：$\rightarrow$ -> $<CR>ightarrow$（r被\r吃掉）
def clean_existing(t):
    if not isinstance(t, str) or not t:
        return t
    t = re.sub(r"\$[\x00-\x1f\s]*ightarrow[\x00-\x1f\s]*\$", "→", t)
    t = re.sub(r"\$[\x00-\x1f\s]*eftarrow[\x00-\x1f\s]*\$", "←", t)
    t = re.sub(r"\$[\x00-\x1f\s]*imes[\x00-\x1f\s]*\$", "×", t)
    t = re.sub(r"\$[\x00-\x1f\s]*eq[\x00-\x1f\s]*\$", "≠", t)
    t = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", t)  # 剩余杂散控制字符
    return t

print("=== 清洗存量(含CR破坏型) ===")
fixed = 0
for fp in glob.glob("data/memory/*/*.json"):
    if fp.endswith("distillation_logs.json"):
        continue
    try:
        data = json.load(open(fp, encoding="utf-8"))
    except Exception:
        continue
    ch = False
    for m in data:
        for k in ("content", "observation", "action", "result", "rule", "rationale"):
            if k in m and isinstance(m[k], str):
                nv = clean_existing(m[k])
                if nv != m[k]:
                    m[k] = nv; ch = True; fixed += 1
    if ch:
        json.dump(data, open(fp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        print(f"  修复 {fp}")
print(f"  共修复 {fixed} 个字段\n")

# 扫描是否还有控制字符残留
print("=== 全员记忆控制字符扫描 ===")
bad = 0
for fp in glob.glob("data/memory/*/*.json"):
    if fp.endswith("distillation_logs.json"):
        continue
    try:
        txt = open(fp, encoding="utf-8").read()
    except Exception:
        continue
    ctrl = re.findall(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", txt)
    if ctrl:
        bad += len(ctrl); print(f"  残留 {len(ctrl)} 控制字符: {fp}")
print(f"  {'✓ 无控制字符残留' if bad == 0 else f'✗ 还有{bad}个'}\n")

# 重跑抽取验证 extractor 修复
print("=== 重跑抽取(验证 extractor 修复) ===")
from app.dependencies import memory_store, long_term_memory as ltm
from app.services.memory_extractor import extract_and_store
PE = "comic-prompt-engineer"; SESS = "ses_1211078d3a79ebf1"
sess = memory_store.load_session(SESS)
if sess:
    msgs = [{"role": m.role, "content": m.content} for m in sess.messages]
    async def go():
        await extract_and_store(msgs, PE, SESS)
    asyncio.run(go())
    # 检查新抽取的有没有控制字符
    epi = ltm.list_episodic(PE)
    fresh = [m for m in epi if m.source_session == SESS]
    clean = all(not re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", f"{m.observation}{m.action}{m.result}") for m in fresh)
    print(f"  本session经验 {len(fresh)} 条，{'✓ 全部干净(无控制字符)' if clean else '✗ 仍有残留'}")
    for m in fresh[:2]:
        print(f"    · {m.action[:70]}")
else:
    print("  会话不存在")
