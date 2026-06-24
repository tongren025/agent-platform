"""Scope builder utility."""
from __future__ import annotations


def build_scopes(agent_key: str, workflow_key: str | None = None) -> list[str]:
    """Build the ordered list of active scopes for an agent run.

    Returns ["global", agent_key] and optionally appends
    "{agent_key}.{workflow_key}" when a workflow is active.
    """
    scopes = ["global", agent_key]
    if workflow_key:
        scopes.append(f"{agent_key}.{workflow_key}")
    return scopes
