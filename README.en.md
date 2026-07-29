# 🎬 Agent Platform

English | [简体中文](README.md)

**AI-powered vertical-video anime (manhua drama) production pipeline — from script to final cut.**

An open-source multi-agent platform purpose-built for AI-driven short-form anime production. Not another general-purpose agent framework — this is a **vertical production line**: a 10-stage kanban takes you from script → character/scene design → storyboard → image prompts → video prompts → generation → final cut, with a team of AI "digital employees" relaying work along a DAG workflow.

![Demo](docs/screenshots/demo.gif)

## Screenshots

### Production Kanban
![Production Kanban](docs/screenshots/production-kanban.png)

### Workflow Canvas
![Workflow Canvas](docs/screenshots/workflow-canvas.png)

### AI Workbench
![Workbench](docs/screenshots/workbench.png)

## Why this exists

Generic agent platforms (Dify, Coze, n8n) are great at chat and automation, but producing a serialized anime show needs domain structure: episodes, shots, character sheets, an Art Bible that keeps every frame on-model, and prompt engineering that survives 372 cards across 10 episodes. This platform bakes that structure in.

## Features

- **Digital employees** — each agent has an identity, role prompt, bound tools/skills, its own knowledge base (RAG) and long-term memory
- **Team delegation** — employees delegate subtasks to teammates (depth-limited, loop-detected), with human approval gates for risky actions
- **Visual workflow engine** — DIFY-style DAG canvas (ReactFlow): agent / knowledge-retrieval / condition / template / tool nodes, variables, branch pruning, parallel execution, full run traces
- **10-stage production kanban** — episode-organized cards (content + prompts + images + videos), stage-by-stage AI generation, series → episode → shot → asset drill-down view
- **Freeform canvas** — an infinite collage where nodes are production data (script beats, character sheets, storyboards, prompts) or images; point at any node and have an employee **derive** downstream data, with lineage edges; two-way sync with the kanban
- **Auto-learning** — scheduled scraping of prompt libraries and article digestion into employee knowledge bases
- **Production-grade backbone** — PostgreSQL + pgvector (optional, JSON files by default), Redis + arq task queue, API auth with role permissions, rate limiting + token quotas, cost accounting per run, Prometheus/Grafana observability, one-command Docker Compose

## Quick start

```bash
git clone https://github.com/tongren025/agent-platform.git
cd agent-platform
cp .env.example .env          # change passwords/secrets as needed
docker compose up -d --build
```

- App + frontend: http://localhost:8000 (default login `admin` / `admin123` — change it)
- Admin console: http://localhost:8001
- Grafana: http://localhost:3000

Local development (no Docker):

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000     # backend
cd web && npm install && npm run dev          # frontend (Vite, :5173)
```

Configure any OpenAI-compatible LLM endpoint in `appsettings.Development.json` or via the admin UI.

## Architecture

### Optional Yuxi Agent Runtime (integration in progress)

`modules/yuxi-runtime/` contains a pinned upstream Yuxi source snapshot for
AgentRun, checkpoints, Skills/MCP, subagents, sandboxing, and artifact delivery.
The default single-user mode continues to use JSON/Markdown, local files, and
in-process execution; PostgreSQL, Redis, MinIO, Milvus, and Neo4j remain optional
enhancements enabled only when configured in the admin UI. The module is not
part of the default Compose stack yet and does not change the current startup
path. See
[`modules/yuxi-runtime/UPSTREAM.md`](modules/yuxi-runtime/UPSTREAM.md) and
[`modules/yuxi-runtime/INTEGRATION.md`](modules/yuxi-runtime/INTEGRATION.md).

| Component | Port | Role |
|-----------|------|------|
| app (FastAPI) | 8000 | business API + SPA |
| admin (FastAPI) | 8001 | user/role/provider governance, separate auth |
| worker (arq) | — | async task consumer, scale independently |
| PostgreSQL + pgvector | 5432 | relational + vector search (optional; JSON store is the zero-dependency default) |
| Redis | 6379 | queue / rate limiting |
| Prometheus + Grafana | 9090 / 3000 | metrics + pre-provisioned dashboard |

Docs: [ARCHITECTURE.md](docs/ARCHITECTURE.md) (layering + core data flows) · [MODULE_INDEX.md](docs/MODULE_INDEX.md) (one-line responsibility of every module) · [CHANGELOG.md](docs/CHANGELOG.md).

## License

[AGPL-3.0](LICENSE). Free for personal use, self-hosting, and modification; if you offer a modified version as a network service (SaaS), you must open-source your changes under the same license. For commercial closed-source licensing, open an issue.
