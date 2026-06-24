"""
工作流变量插值：把 {{node.field}} 解析成上游节点的输出。

这是节点之间唯一的数据传递契约——每个节点执行前，引擎用这里的函数把它配置里的
模板字段解析好再交给执行器；执行器自己绝不解析 {{}}。

安全性：纯字符串/字典查表，绝不 eval/exec（工作流会被持久化并重跑，eval 就是存储型 RCE）。
缺失的引用解析成空串（fail-soft，符合项目 fail-open 默认）。
"""
from __future__ import annotations

import json
import logging
import re

logger = logging.getLogger(__name__)

_PLACEHOLDER = re.compile(r"\{\{\s*([\w.]+)\s*\}\}")
_WHOLE = re.compile(r"^\s*\{\{\s*([\w.]+)\s*\}\}\s*$")


def _lookup(ref: str, variables: dict):
    """ref 形如 'node.field' 或 'node'（默认取 .output）。缺失返回 None。"""
    if "." in ref:
        node_key, field = ref.split(".", 1)
    else:
        node_key, field = ref, "output"
    node_vars = variables.get(node_key)
    if not isinstance(node_vars, dict) or field not in node_vars:
        logger.debug("工作流变量未命中：%s", ref)
        return None
    return node_vars[field]


def _stringify(value) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def resolve_template(text: str, variables: dict) -> str:
    """把字符串里所有 {{node.field}} 替换为对应值（字符串化）。"""
    if not isinstance(text, str) or "{{" not in text:
        return text if isinstance(text, str) else ("" if text is None else str(text))
    return _PLACEHOLDER.sub(lambda m: _stringify(_lookup(m.group(1), variables)), text)


def resolve_native(text, variables):
    """整串恰好是一个占位符时，保留原生类型（list/dict）；否则按字符串插值。"""
    if not isinstance(text, str):
        return text
    m = _WHOLE.match(text)
    if m:
        return _lookup(m.group(1), variables)
    return resolve_template(text, variables)


def resolve_value(value, variables):
    """递归解析 dict/list/str 中的模板（用于 tool 的 argsTemplate 等嵌套配置）。"""
    if isinstance(value, str):
        return resolve_native(value, variables)
    if isinstance(value, dict):
        return {k: resolve_value(v, variables) for k, v in value.items()}
    if isinstance(value, list):
        return [resolve_value(v, variables) for v in value]
    return value
