"""
网页提示词采集器。

目前支持：
- jimeng（即梦 https://jimeng.jianying.com/ai-tool/home/）：首页服务端渲染了
  `window.__get_explore_result`（探索灵感 feed），内嵌真实提示词，无需登录即可抓取。
- xyq（小云雀）：首页为纯 SPA 空壳，提示词需登录后由 XHR 加载，服务端抓不到，
  抓取时抛出 ScraperNeedsLogin。

设计为可扩展：新增平台只需实现 _parse_xxx 并在 _PARSERS 中注册。
"""
from __future__ import annotations

import hashlib
import json
import logging
import re
from html.parser import HTMLParser
from typing import Callable
from urllib.parse import urlparse

import httpx

from app.models.scrape import CollectedPrompt

logger = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(30.0, connect=10.0)
_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

# 最终 URL 命中这些片段才判定为「被重定向到登录页」，避免用裸 'login' 子串误判
_LOGIN_URL_HINTS = ("/login", "passport.", "/passport", "account.", "sso.")


class ScraperError(Exception):
    """采集失败（网络错误、页面结构变化等）。"""


class ScraperNeedsLogin(ScraperError):
    """该平台的数据需要登录态，服务端无法抓取。"""


# ── HTML 正文提取器 ─────────────────────────────────────────────────

class _ArticleExtractor(HTMLParser):
    """从 HTML 中提取正文文本，跳过 script/style/nav/header/footer 等噪音标签。"""

    _SKIP_TAGS = frozenset([
        "script", "style", "noscript", "svg", "path", "nav", "header",
        "footer", "aside", "iframe", "object", "embed", "form", "button",
        "input", "select", "textarea",
    ])

    def __init__(self):
        super().__init__()
        self._skip_depth = 0
        self._chunks: list[str] = []
        self._title = ""
        self._in_title = False

    def handle_starttag(self, tag: str, attrs):
        if tag in self._SKIP_TAGS:
            self._skip_depth += 1
        if tag == "title" and not self._title:
            self._in_title = True

    def handle_endtag(self, tag: str):
        if tag in self._SKIP_TAGS and self._skip_depth > 0:
            self._skip_depth -= 1
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str):
        if self._in_title and not self._title:
            self._title = data.strip()
        if self._skip_depth == 0:
            text = data.strip()
            if text:
                self._chunks.append(text)

    def get_text(self) -> str:
        raw = "\n".join(self._chunks)
        lines = [line.strip() for line in raw.splitlines()]
        merged: list[str] = []
        for line in lines:
            if not line:
                if merged and merged[-1] != "":
                    merged.append("")
            elif len(line) > 15:
                merged.append(line)
            elif merged and len(merged[-1]) < 100:
                merged.append(line)
        return "\n".join(merged).strip()

    def get_title(self) -> str:
        return self._title


def _safe_int(value: object) -> int:
    try:
        return int(value)  # type: ignore[arg-type]
    except (ValueError, TypeError, OverflowError):
        return 0


def _extract_window_json(html: str, var_name: str) -> str | None:
    """提取 `window.<var_name> = <json对象或数组>` 的原始 JSON 文本，按括号配对扫描。"""
    m = re.search(r"window\." + re.escape(var_name) + r"\s*=\s*", html)
    if not m:
        return None
    i = m.end()
    while i < len(html) and html[i] in " \t\r\n":
        i += 1
    if i >= len(html) or html[i] not in "{[":
        return None
    open_ch = html[i]
    close_ch = "}" if open_ch == "{" else "]"
    depth = 0
    in_str = False
    esc = False
    start = i
    while i < len(html):
        c = html[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
        else:
            if c == '"':
                in_str = True
            elif c == open_ch:
                depth += 1
            elif c == close_ch:
                depth -= 1
                if depth == 0:
                    return html[start : i + 1]
        i += 1
    return None


def _coerce_prompt(item: dict) -> tuple[str, str]:
    """从一个 explore item 中取出 (prompt, item_type)。"""
    aigc = item.get("aigc_image_params") or {}

    t2v = aigc.get("text2video_params") or {}
    t2i = aigc.get("text2image_params") or {}

    # 视频优先判定：text2video_params 里有非空 prompt
    v_prompt = (t2v.get("prompt") or t2v.get("actual_prompt") or "").strip()
    if v_prompt:
        return v_prompt, "video"

    i_prompt = (t2i.get("prompt") or t2i.get("actual_prompt") or "").strip()
    if i_prompt:
        return i_prompt, "image"

    return "", "image"


def _looks_like_login_redirect(final_url: str) -> bool:
    low = final_url.lower()
    return any(h in low for h in _LOGIN_URL_HINTS)


def _parse_jimeng(
    html: str, source_code: str, max_items: int, final_url: str
) -> list[CollectedPrompt]:
    raw = _extract_window_json(html, "__get_explore_result")
    if raw is None:
        # 只有当最终 URL 确实被重定向到登录/认证域时，才判定为「需要登录」；
        # 否则按「页面结构变化」处理（更准确，避免误导用户去配 Cookie）。
        if _looks_like_login_redirect(final_url):
            raise ScraperNeedsLogin(
                f"即梦页面被重定向到登录页（{final_url}），需要登录态才能抓取。"
            )
        raise ScraperError(
            "未能在即梦页面中找到 __get_explore_result 数据块"
            "（页面结构可能已变化）。"
        )

    try:
        # parse_constant 把裸 NaN/Infinity 等非法常量收敛为 None，避免污染下游 int()
        data = json.loads(raw, parse_constant=lambda _c: None)
    except json.JSONDecodeError as exc:
        raise ScraperError(f"即梦探索数据 JSON 解析失败：{exc}") from exc

    item_list = (((data or {}).get("data") or {}).get("item_list")) or []
    results: list[CollectedPrompt] = []
    for item in item_list:
        if not isinstance(item, dict):
            continue
        prompt, item_type = _coerce_prompt(item)
        if not prompt:
            continue

        common = item.get("common_attr") or {}
        author = item.get("author") or {}
        stat = item.get("statistic") or {}

        image_url = ""
        cover = common.get("cover_url")
        if isinstance(cover, str):
            image_url = cover
        if not image_url:
            imgs = (item.get("image") or {}).get("large_images") or []
            if imgs and isinstance(imgs[0], dict):
                image_url = imgs[0].get("image_url", "") or ""

        ext_id = str(common.get("id") or common.get("effect_id") or "")
        if not ext_id:
            continue

        results.append(
            CollectedPrompt(
                external_id=ext_id,
                source_code=source_code,
                platform="jimeng",
                prompt=prompt,
                title=(common.get("title") or "").strip(),
                author=(author.get("name") or "").strip(),
                item_type=item_type,
                favorite_num=_safe_int(stat.get("favorite_num")),
                usage_num=_safe_int(stat.get("usage_num")),
                image_url=image_url,
                create_time=_safe_int(common.get("create_time")),
            )
        )
        if len(results) >= max_items:
            break

    if not results:
        raise ScraperError("即梦探索数据已获取，但未解析出任何带提示词的条目。")
    return results


def _parse_xyq(
    html: str, source_code: str, max_items: int, final_url: str
) -> list[CollectedPrompt]:
    raise ScraperNeedsLogin(
        "小云雀首页为纯前端渲染，提示词需登录后由接口加载，服务端无法直接抓取。"
        "请改用「浏览器采集」方式，或提供登录态 Cookie。"
    )


_PARSERS: dict[str, Callable[[str, str, int, str], list[CollectedPrompt]]] = {
    "jimeng": _parse_jimeng,
    "xyq": _parse_xyq,
}


async def scrape_source(
    platform: str,
    url: str,
    source_code: str,
    max_items: int = 40,
) -> list[CollectedPrompt]:
    """抓取一个采集源，返回解析出的提示词列表。"""
    parser = _PARSERS.get(platform)
    if parser is None:
        raise ScraperError(f"不支持的平台：{platform!r}")

    try:
        async with httpx.AsyncClient(
            timeout=_TIMEOUT,
            follow_redirects=True,
            headers={
                "User-Agent": _UA,
                "Accept-Language": "zh-CN,zh;q=0.9",
            },
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text
            final_url = str(resp.url)
    except httpx.HTTPError as exc:
        raise ScraperError(f"请求失败：{exc}") from exc

    return parser(html, source_code, max_items, final_url)


# ── 通用文章抓取（用于知识学习）────────────────────────────────────

class ArticleResult:
    """一篇文章的抓取结果。"""
    __slots__ = ("url", "title", "content", "content_hash", "char_count")

    def __init__(self, url: str, title: str, content: str):
        self.url = url
        self.title = title
        self.content = content
        self.content_hash = hashlib.md5(content.encode()).hexdigest()[:12]
        self.char_count = len(content)


async def scrape_article(url: str) -> ArticleResult:
    """抓取任意网页，提取正文文本。"""
    try:
        async with httpx.AsyncClient(
            timeout=_TIMEOUT,
            follow_redirects=True,
            headers={"User-Agent": _UA, "Accept-Language": "zh-CN,zh;q=0.9"},
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text
    except httpx.HTTPError as exc:
        raise ScraperError(f"请求失败：{exc}") from exc

    extractor = _ArticleExtractor()
    extractor.feed(html)
    text = extractor.get_text()
    title = extractor.get_title() or urlparse(url).path.split("/")[-1] or "untitled"

    if len(text) < 100:
        raise ScraperError(
            f"页面正文过短（{len(text)} 字符），可能是 SPA 空壳或需要登录。"
        )

    return ArticleResult(url=url, title=title, content=text)


async def scrape_and_summarize(
    url: str,
    employee_key: str,
    role_hint: str = "",
) -> dict:
    """抓取文章 → LLM 总结为该员工的专业知识 → 存入知识库 + 长期记忆。

    返回 {"title", "charCount", "knowledgeDocId", "memoriesAdded"} 。
    """
    from app.dependencies import ai_service, knowledge_store, long_term_memory
    from app.models.memory_types import SemanticMemory

    article = await scrape_article(url)

    truncated = article.content[:8000]
    prompt = f"""你是一个知识提取专家。以下是一篇关于「{role_hint}」领域的专业文章。

请完成两个任务：

## 任务1：整理为结构化知识文档
把文章中对「{role_hint}」有用的专业知识整理成 Markdown 格式，要求：
- 保留核心方法论、原则、技巧、案例
- 删除广告、作者简介、无关内容
- 用清晰的标题层级组织
- 保留具体的例子和数据

## 任务2：提取记忆条目
从文章中提取最重要的 3-5 条知识点，每条用一句话概括。

请用以下 JSON 格式输出：
```json
{{
  "knowledge_doc": "整理后的 Markdown 文档内容",
  "memories": [
    "第一条核心知识点",
    "第二条核心知识点"
  ]
}}
```

文章内容：
{truncated}"""

    client, model_id = ai_service.get_default_client()
    resp = client.chat.completions.create(
        model=model_id,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=4000,
    )
    raw = resp.choices[0].message.content or ""

    import json as _json
    json_match = re.search(r"\{[\s\S]*\}", raw)
    if not json_match:
        raise ScraperError("LLM 未返回有效 JSON")

    try:
        parsed = _json.loads(json_match.group())
    except _json.JSONDecodeError as exc:
        raise ScraperError(f"LLM 返回的 JSON 解析失败：{exc}") from exc

    knowledge_md = parsed.get("knowledge_doc", "")
    memories = parsed.get("memories", [])

    doc_result = None
    if knowledge_md and len(knowledge_md) > 50:
        safe_title = re.sub(r"[^\w一-鿿-]", "_", article.title)[:50]
        filename = f"learned-{safe_title}-{article.content_hash}.md"
        doc_result = knowledge_store.upload(
            employee_key, filename, knowledge_md.encode("utf-8")
        )

    memories_added = 0
    for mem in memories[:5]:
        if isinstance(mem, str) and len(mem) > 10:
            long_term_memory.add_semantic(
                employee_key,
                SemanticMemory(
                    employee_key=employee_key,
                    content=mem,
                    category="knowledge",
                    importance=0.8,
                ),
            )
            memories_added += 1

    return {
        "title": article.title,
        "charCount": article.char_count,
        "knowledgeDocId": doc_result.doc_id if doc_result else None,
        "memoriesAdded": memories_added,
    }
