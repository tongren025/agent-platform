from __future__ import annotations

import httpx

PYTEST_RESOURCE_PREFIXES = ("pytest", "py_test")


def _is_pytest_resource(name: object) -> bool:
    """判断资源名称是否属于 pytest 约定的测试数据。"""

    return isinstance(name, str) and name.casefold().startswith(PYTEST_RESOURCE_PREFIXES)


async def cleanup_pytest_knowledge_resources(
    client: httpx.AsyncClient,
    headers: dict[str, str],
) -> None:
    """通过公开 API 删除 pytest 前缀的评估资源和知识库。"""

    list_response = await client.get("/api/knowledge/databases", headers=headers)
    if list_response.status_code != 200:
        raise RuntimeError(f"Failed to list knowledge databases for cleanup: {list_response.text}")

    payload = list_response.json()
    if payload.get("message"):
        raise RuntimeError(f"Failed to list knowledge databases for cleanup: {payload['message']}")

    databases = payload.get("databases")
    if not isinstance(databases, list):
        raise RuntimeError("Knowledge database cleanup response is missing a databases list")

    failures: list[str] = []
    for database in databases:
        kb_id = database.get("kb_id") if isinstance(database, dict) else None
        if not kb_id:
            failures.append("Knowledge database cleanup entry is missing kb_id")
            continue

        resource_specs = (
            (f"/api/evaluation/databases/{kb_id}/runs", "run_id", f"/api/evaluation/databases/{kb_id}/runs"),
            (f"/api/evaluation/databases/{kb_id}/datasets", "dataset_id", "/api/evaluation/datasets"),
        )
        for list_path, id_field, delete_prefix in resource_specs:
            response = await client.get(list_path, headers=headers)
            if response.status_code != 200:
                failures.append(f"Failed to list evaluation resources for {kb_id}: {response.text}")
                continue

            resources = response.json().get("data")
            if not isinstance(resources, list):
                failures.append(f"Evaluation cleanup response for {kb_id} is missing a data list")
                continue

            for resource in resources:
                if not isinstance(resource, dict) or not _is_pytest_resource(resource.get("name")):
                    continue
                resource_id = resource.get(id_field)
                if not resource_id:
                    failures.append(f"Evaluation cleanup resource for {kb_id} is missing {id_field}")
                    continue

                delete_response = await client.delete(f"{delete_prefix}/{resource_id}", headers=headers)
                if delete_response.status_code not in {200, 404}:
                    failures.append(f"Failed to delete evaluation resource {resource_id}: {delete_response.text}")

    for database in databases:
        if not isinstance(database, dict) or not _is_pytest_resource(database.get("name")):
            continue
        kb_id = database.get("kb_id")
        if not kb_id:
            continue

        delete_response = await client.delete(f"/api/knowledge/databases/{kb_id}", headers=headers)
        if delete_response.status_code not in {200, 404}:
            failures.append(f"Failed to delete knowledge database {kb_id}: {delete_response.text}")

    if failures:
        raise RuntimeError("; ".join(failures))
