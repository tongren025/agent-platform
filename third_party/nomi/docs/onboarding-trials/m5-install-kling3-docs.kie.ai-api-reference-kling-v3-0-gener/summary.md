# Trial m5-install-kling3

- **Status**: ✅ SUCCESS
- **Docs**: https://docs.kie.ai/api-reference/kling/v3-0/generate-video
- **Kind**: video
- **Agent**: gpt-5.5
- **Time**: 176.6s
- **Rounds**: 20 LLM steps, 26 tool calls
- **Tokens**: 494,207 (prompt 488,399 + completion 5,808)
- **Est. cost**: ~$? (gpt-5.5 pricing unknown)

## Vendor
- Key: `kie`
- Base URL: `https://api.kie.ai/api/v1`
- Auth: {"type":"bearer"}

## Model
- Key: `kling-3.0/video`
- Display: Kling 3.0
- Fields extracted: 9

| Field | Type | Confidence | Evidence location |
|---|---|---|---|
| `duration` | select | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.duration |
| `aspect_ratio` | select | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.aspect_ratio |
| `mode` | select | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.mode |
| `sound` | boolean | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.sound |
| `image_urls` | text | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.image_urls |
| `multi_shots` | boolean | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.multi_shots |
| `multi_prompt` | text | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.multi_prompt |
| `kling_elements` | text | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.kling_elements |
| `callBackUrl` | text | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody callBackUrl |

## Completeness check
- has: 8 / no: 5 / unsure: 0

## Test attempts
### Attempt 1 (create)
- ✅ HTTP 200
- POST https://api.kie.ai/api/v1/jobs/createTask
- diagnostics: HTTP OK

### Attempt 2 (create)
- ✅ HTTP 200
- POST https://api.kie.ai/api/v1/jobs/createTask
- diagnostics: HTTP OK

### Attempt 3 (create)
- ✅ HTTP 200
- POST https://api.kie.ai/api/v1/jobs/createTask/
- diagnostics: HTTP OK
