"""第二步：质检员真审上一步产出 + 闭环抽取经验，验证团队协作和学习闭环。"""
import sys, asyncio, time
sys.path.insert(0, ".")

from app.models.conversation import AgentRunRequest
from app.services.invocation import run_invocation
from app.services.memory_extractor import extract_and_store
from app.dependencies import memory_store, long_term_memory as ltm

PE_SESSION = "ses_1211078d3a79ebf1"   # 上一步 prompt-engineer 的会话
PE = "comic-prompt-engineer"
QA = "comic-qa-inspector"


def stats(e):
    d = ltm.get_all_for_prompt(e)
    return len(d["semantic"]), len(d["episodic"]), len(d["procedural"])


async def main():
    sess = memory_store.load_session(PE_SESSION)
    pe_output = sess.messages[-1].content if sess and sess.messages else ""
    print(f"[载入] prompt-engineer 产出 {len(pe_output)} 字符\n")

    # ── 第二个员工：质检员真审 ──
    print(f"[调用 {QA}] 让质检员按红线清单审这条提示词 ...")
    review_task = (
        "审核下面这条 Seedance 视频提示词，按你的质检红线清单逐条检查，"
        "指出问题或判定合格：\n\n" + pe_output[:3000]
    )
    t = time.time()
    rq = await run_invocation(AgentRunRequest(employeeKey=QA, userInput=review_task))
    print(f"[完成] {time.time()-t:.1f}s\n")
    print("=" * 70)
    print("【质检员判定】")
    print(rq.assistant_message)
    print("=" * 70, "\n")

    # ── 闭环：从真实工作抽取经验写回 prompt-engineer ──
    print("[闭环] 从这次真实工作抽取长期记忆 ...")
    before = stats(PE)
    msgs = [{"role": m.role, "content": m.content} for m in sess.messages]
    t = time.time()
    try:
        await extract_and_store(msgs, PE, PE_SESSION)
    except Exception as e:
        print("  抽取异常:", type(e).__name__, str(e)[:150])
    after = stats(PE)
    print(f"[抽取完成] {time.time()-t:.1f}s")
    print(f"  prompt-engineer 记忆: sem/epi/proc {before} -> {after}")
    delta = tuple(a - b for a, b in zip(after, before))
    print(f"  本次工作新增: sem+{delta[0]} epi+{delta[1]} proc+{delta[2]}")

    # 显示新抽取的经验记忆
    d = ltm.get_all_for_prompt(PE)
    fresh = [m for m in d["episodic"] if m.source_session == PE_SESSION]
    if fresh:
        print("\n  新攒下的经验(episodic):")
        for m in fresh[:3]:
            print(f"    · 情境:{m.observation[:40]} → 做法:{m.action[:40]} → 结果:{m.result[:30]}")
    fresh_s = [m for m in d["semantic"] if m.source_session == PE_SESSION]
    if fresh_s:
        print("\n  新抽取的知识(semantic):")
        for m in fresh_s[:4]:
            print(f"    · [{m.category}] {m.content[:60]}")


if __name__ == "__main__":
    asyncio.run(main())
