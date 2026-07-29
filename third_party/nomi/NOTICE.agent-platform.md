# Nomi / Agent Studio integration notice

This directory contains a source snapshot and modified derivative of
[Nomi](https://github.com/aqm857886159/Nomi), an open-source local-first AI
video creation workbench.

- Upstream commit: `4afb06452064b483a9cd2fb7b82523500b03c0a5`
- Upstream version: `0.17.0`
- License: Apache License 2.0 (see `LICENSE`)
- Local integration entry: `src/agentStudioMount.tsx`
- Local build configuration: `vite.agent-studio.config.ts`
- Local deployment artifact: `web/public/agent-canvas/`
- Host integration: `web/src/pages/CanvasHub.tsx`

Agent Platform modifications replace visible product branding, browser project
persistence, model catalog access, generation tasks, and AI assistant routing
with Agent Studio services. Internal upstream symbol and CSS token names are
retained where practical for compatibility and easier future source review.

The upstream copyright and Apache-2.0 license remain in force for the upstream
work. Agent Platform does not claim authorship of that work. Copyright in
original Agent Platform adapter code and later modifications belongs to their
respective contributors and is distributed under the root repository license.
