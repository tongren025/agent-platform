# Onboarding Trials

Output directory for `pnpm run lab:onboard` runs.

Each trial creates a subfolder `<timestamp>-<slug>/` containing:
- `trace.json` — full event log
- `final-mapping.json` — vendor+model+mapping draft (even on failure)
- `summary.md` — human-readable report

## Running a trial

```bash
# Required env (or pass as flags)
export AGENT_API_KEY=sk-...                      # the LLM that runs the agent
export AGENT_BASE_URL=https://api.openai.com     # default
export AGENT_MODEL_ID=gpt-5                       # default gpt-4o
export AGENT_PROVIDER_KIND=openai-compatible     # default

# Required per-trial
pnpm run lab:onboard -- \
  --docs https://piapi.ai/docs/kling \
  --kind video \
  --key sk-target-api-key
```

## Reading a `*.key` file

To avoid keys in shell history:

```bash
echo "sk-..." > .secrets/agent.key
echo "sk-..." > .secrets/target.key

pnpm run lab:onboard -- \
  --docs https://piapi.ai/docs/kling \
  --kind video \
  --key @.secrets/target.key \
  --agent-key @.secrets/agent.key
```

## What "success" means

- LLM finished without error
- `commit_model` returned `{ ok: true }`
- That requires: vendor + model + mapping all set AND at least one successful `execute_test_curl` AND no "unsure" items in completeness check

## What "partial" means

- LLM finished without error but didn't reach commit
- Some fields extracted but mapping or test failed

## What "failure" means

- LLM crashed
- Or agent gave up before extracting anything

## Iterating

When a trial fails:
1. Read `summary.md` — what's missing? Which test failed?
2. Read `trace.json` for the exact tool call sequence
3. Identify whether it's prompt issue (agent didn't try X) or tool issue (X failed)
4. Update prompt / tool / schema
5. Re-run with same trial ID to compare

## Privacy

- API keys are redacted from `trace.json` (only `[REDACTED]` shown in headers/body)
- Raw HTML fetched from doc URLs is NOT stored — only structured extracts in trace
- Trials are local. Nothing leaves your machine unless you push the trial dir to git
