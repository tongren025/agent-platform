"""Agent 输出质量 eval 套件。

L4 的回归网：distillation 会让数字员工"进化"，但没有固定 case + 断言，就无法判断
进化后是变好还是变坏。这里提供 check 引擎（确定性评分）+ harness（跑 case）+ 运行入口。
golden cases 本身是你的领域内容，放在 evals/cases/ 下。
"""
