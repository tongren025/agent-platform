"""M3 Embedding 服务 —— 调 DashScope text-embedding-v3 生成向量。

国内环境用阿里云 DashScope（通义千问系列），模型 text-embedding-v3 输出 1024 维。
API key 从 DASHSCOPE_API_KEY 环境变量读（见 core/settings.py）。

用法：
    from app.core.embedding import embed_texts
    vectors = await embed_texts(["你好世界", "hello world"])
    # vectors: list[list[float]]，每条 1024 维
"""
from __future__ import annotations

import logging
from typing import Sequence

from app.core.settings import settings

logger = logging.getLogger(__name__)

DIMENSION = 1024
MODEL = "text-embedding-v3"


async def embed_texts(
    texts: Sequence[str],
    *,
    model: str = MODEL,
    dimension: int = DIMENSION,
) -> list[list[float]]:
    """批量生成文本向量。失败返回空列表（fail-open，不阻断主流程）。"""
    if not texts:
        return []

    api_key = settings.dashscope_api_key
    if not api_key:
        logger.debug("DASHSCOPE_API_KEY 未配置，跳过 embedding")
        return []

    try:
        import dashscope
        from dashscope import TextEmbedding

        dashscope.api_key = api_key
        resp = TextEmbedding.call(
            model=model,
            input=list(texts),
            dimension=dimension,
        )
        if resp.status_code != 200:
            logger.warning("DashScope embedding 失败: %s %s", resp.status_code, resp.message)
            return []
        embeddings = resp.output.get("embeddings", [])
        return [e["embedding"] for e in embeddings]
    except Exception:
        logger.warning("embedding 调用异常", exc_info=True)
        return []


async def embed_single(text: str, **kwargs) -> list[float] | None:
    results = await embed_texts([text], **kwargs)
    return results[0] if results else None
