# Trial m4-retest-kling3

- **Status**: ⚠️ PARTIAL
- **Reason**: No successful test attempt
- **Docs**: https://docs.kie.ai/api-reference/kling/v3-0/generate-video
- **Kind**: video
- **Agent**: gpt-5.5
- **Time**: 91.6s
- **Rounds**: 10 LLM steps, 10 tool calls
- **Tokens**: 138,809 (prompt 135,730 + completion 3,079)
- **Est. cost**: ~$? (gpt-5.5 pricing unknown)

## Vendor
- Key: `kie`
- Base URL: `https://api.kie.ai`
- Auth: {"type":"bearer"}

## Model
- Key: `kling-3.0/video`
- Display: Kling 3.0
- Fields extracted: 10

| Field | Type | Confidence | Evidence location |
|---|---|---|---|
| `prompt` | text | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.prompt |
| `image_urls` | text | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.image_urls |
| `sound` | boolean | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.sound |
| `duration` | select | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.duration |
| `aspect_ratio` | select | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.aspect_ratio |
| `mode` | select | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.mode |
| `multi_shots` | boolean | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.multi_shots |
| `multi_prompt` | text | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.multi_prompt |
| `kling_elements` | text | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody input.kling_elements |
| `callBackUrl` | text | high | https://docs.kie.ai/market/kling/kling-3-0.md requestBody callBackUrl |

## Test attempts
- (none — agent never tested the mapping)