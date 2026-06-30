"""真实调用一个数字员工干活，验证：学到的知识是否进 prompt、产出质量、闭环抽取经验。"""
import sys, asyncio, json, time
sys.path.insert(0, ".")

from app.models.conversation import AgentRunRequest
from app.runtime.snapshot import load_snapshot
from app.runtime.scope import build_scopes
from app.runtime.prompt import compile as compile_prompt
from app.services.invocation import run_invocation
from app.dependencies import long_term_memory as ltm

EMP = "comic-prompt-engineer"
TASK = (
    "为《九陆纪元》EP01 第1镜写 Seedance 2.0 视频提示词。\n"
    "镜头内容：黄昏废巷，暴徒一拳砸向蹲在地上的苍霖，他胸口的龙骨碎片第一次微弱闪烁蓝光。时长5秒。\n"
    "按你的规范输出。"
)

def stats(e):
    d = ltm.get_all_for_prompt(e)
    return len(d["semantic"]), len(d["episodic"]), len(d["procedural"])


async def main():
    # ── 1. 调用前基线 ──
    before = stats(EMP)
    print(f"[调用前] {EMP} 记忆 sem/epi/proc = {before}\n")

    # ── 2. 编译 prompt，验证学到的知识是否真注入 ──
    scopes = build_scopes(EMP, None)
    snap = load_snapshot(EMP, scopes)
    cp = compile_prompt(snap, scopes, None)
    sp = cp.system_prompt
    print(f"[系统prompt] 总长 {len(sp)} 字符")
    checks = {
        "长期记忆块<long_term_memory>": "<long_term_memory>" in sp,
        "习得行为<learned_behaviors>": "learned_behaviors" in sp,
        "知识事实<user_knowledge>": "user_knowledge" in sp,
        "维基出处": "维基百科" in sp,
        "手艺源(StudioBinder等)": any(x in sp for x in ["StudioBinder","No Film School","AnimeOutline","Real Reel"]),
        "AI一致性(参考图)": "参考图" in sp,
        "角色DNA(苍霖/碎片)": "龙骨碎片" in sp or "苍霖" in sp,
        "Seedance不读负向": "负向" in sp,
    }
    for k, v in checks.items():
        print(f"   {'✓' if v else '✗'} {k}")
    print()

    # ── 3. 真实调用（turn 1）──
    print("[调用中] 让员工产出 EP01-S01 提示词 ...")
    t = time.time()
    r1 = await run_invocation(AgentRunRequest(employeeKey=EMP, userInput=TASK))
    print(f"[完成] success={r1.success} 耗时{time.time()-t:.1f}s session={r1.session_id}\n")
    print("=" * 70)
    print("【员工产出】")
    print(r1.assistant_message)
    print("=" * 70)
    return r1


if __name__ == "__main__":
    r = asyncio.run(main())
