"""全局工具函数——消除各 model 文件中的 _now() 重复。"""
import re
from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ── LaTeX 残留清洗 ────────────────────────────────────────────
# 部分模型(如 Gemma)会把箭头/比较符输出成 LaTeX 行内公式 $\rightarrow$，
# 漫剧提示词/记忆里没有数学公式，统一还原成 unicode 符号。
_LATEX_REPL = {
    r"\rightarrow": "→", r"\Rightarrow": "⇒", r"\to": "→",
    r"\leftarrow": "←", r"\Leftarrow": "⇐",
    r"\leftrightarrow": "↔", r"\Leftrightarrow": "⇔",
    r"\leq": "≤", r"\le": "≤", r"\geq": "≥", r"\ge": "≥",
    r"\times": "×", r"\cdot": "·", r"\div": "÷",
    r"\approx": "≈", r"\neq": "≠", r"\ne": "≠", r"\pm": "±",
    r"\degree": "°", r"\circ": "°",
}
# 长命令先替换，避免 \le 把 \leq 误伤成 ≤q
_LATEX_KEYS = sorted(_LATEX_REPL, key=len, reverse=True)
# $ 包裹单个 unicode 符号(可带空格和数字)的残壳：$≤ 6$ -> ≤ 6
_DOLLAR_WRAP = re.compile(r"\$\s*([→⇒←⇐↔⇔≤≥×·÷≈≠±°]\s*\d*)\s*\$")


def strip_latex_artifacts(text: str) -> str:
    """把模型误用的 LaTeX 行内公式还原成普通 unicode 符号。"""
    if not text or ("\\" not in text and "$" not in text):
        return text
    for cmd in _LATEX_KEYS:
        if cmd in text:
            text = text.replace(cmd, _LATEX_REPL[cmd])
    text = _DOLLAR_WRAP.sub(r"\1", text)
    return text
