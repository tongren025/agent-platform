"""Agent 运行时包 —— 承载"一次员工调用"的完整执行链。

模块分工：snapshot 组装员工运行时快照 → prompt 编译系统提示词 →
runner 建 client/工具并驱动 loop 的工具调用循环（系统核心）；
另有 CLI 直调路径（cli_executor / cli_pipeline，走本地订阅额度而非 API Key）
与工作流模板插值（template）。
"""
