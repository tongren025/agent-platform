# Nomi integration notice

This directory contains an unmodified source snapshot of
[Nomi](https://github.com/aqm857886159/Nomi), an open-source local-first AI
video creation workbench.

- Upstream commit: `4afb06452064b483a9cd2fb7b82523500b03c0a5`
- Upstream version: `0.17.0`
- License: Apache License 2.0 (see `LICENSE`)
- Local integration: the upstream renderer is built into
  `web/public/nomi/` and embedded by `web/src/pages/CanvasHub.tsx`.

Agent Platform does not claim authorship of the upstream Nomi source. Local
changes should be kept as small adapter patches and documented here when
introduced.
