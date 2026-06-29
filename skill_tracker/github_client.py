"""GitHub 搜索 API 客户端。

只依赖 httpx（项目已自带）。无 token 也能用，但匿名限流为 10 次/分钟，
配置 GITHUB_TOKEN 环境变量后提升到 30 次/分钟。
"""
from __future__ import annotations

import os
import time
from dataclasses import dataclass
from datetime import datetime, timezone

import httpx

GITHUB_SEARCH_URL = "https://api.github.com/search/repositories"
MAX_PER_PAGE = 100  # GitHub 单页上限


@dataclass
class Repo:
    """单个仓库的精简视图。"""

    full_name: str
    html_url: str
    description: str
    stars: int
    forks: int
    language: str | None
    created_at: datetime
    pushed_at: datetime
    topics: list[str]

    @property
    def age_days(self) -> float:
        """仓库存在天数（至少 1，避免除零）。"""
        delta = datetime.now(timezone.utc) - self.created_at
        return max(delta.total_seconds() / 86400, 1.0)

    @property
    def stars_per_day(self) -> float:
        """星/天：用作"增长速度"的代理指标。"""
        return self.stars / self.age_days

    @classmethod
    def from_api(cls, item: dict) -> "Repo":
        return cls(
            full_name=item["full_name"],
            html_url=item["html_url"],
            description=(item.get("description") or "").strip(),
            stars=item["stargazers_count"],
            forks=item["forks_count"],
            language=item.get("language"),
            created_at=_parse_dt(item["created_at"]),
            pushed_at=_parse_dt(item["pushed_at"]),
            topics=item.get("topics", []) or [],
        )


def _parse_dt(value: str) -> datetime:
    # GitHub 返回形如 2024-01-02T03:04:05Z
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


class GitHubClient:
    def __init__(self, token: str | None = None, timeout: float = 20.0):
        self.token = token or os.getenv("GITHUB_TOKEN")
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "skill-tracker",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        self._client = httpx.Client(headers=headers, timeout=timeout)

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "GitHubClient":
        return self

    def __exit__(self, *exc) -> None:
        self.close()

    def search(
        self,
        query: str,
        sort: str = "stars",
        order: str = "desc",
        limit: int = 30,
    ) -> list[Repo]:
        """搜索仓库。

        query: GitHub 搜索语法，例如 'skill'、'topic:mcp'、'skill created:>2025-01-01'
        sort:  stars | forks | updated | help-wanted-issues
        limit: 返回多少条（自动翻页）
        """
        repos: list[Repo] = []
        page = 1
        while len(repos) < limit:
            per_page = min(MAX_PER_PAGE, limit - len(repos))
            data = self._get_page(query, sort, order, per_page, page)
            items = data.get("items", [])
            if not items:
                break
            repos.extend(Repo.from_api(it) for it in items)
            if len(items) < per_page:
                break  # 没有更多结果了
            page += 1
        return repos[:limit]

    def _get_page(
        self, query: str, sort: str, order: str, per_page: int, page: int
    ) -> dict:
        params = {
            "q": query,
            "sort": sort,
            "order": order,
            "per_page": per_page,
            "page": page,
        }
        for attempt in range(3):
            resp = self._client.get(GITHUB_SEARCH_URL, params=params)
            if resp.status_code == 403 and "rate limit" in resp.text.lower():
                reset = int(resp.headers.get("X-RateLimit-Reset", "0"))
                wait = max(reset - time.time(), 1)
                if attempt < 2 and wait < 90:
                    time.sleep(wait + 1)
                    continue
                raise RuntimeError(
                    "GitHub 触发限流。设置 GITHUB_TOKEN 环境变量可提高额度。"
                )
            resp.raise_for_status()
            return resp.json()
        raise RuntimeError("GitHub 请求多次失败")
