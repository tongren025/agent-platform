"""Agent 工具包 —— 提供给数字员工在 agent loop 中调用的各类工具 Handler。

各模块（builtin / deep / delegate / strategy 等）在被 import 时把 Handler
实例注册进 app.tools.base 的全局注册表；运行时 runner 按 tool_code 查找执行。
"""
