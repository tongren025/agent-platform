# Trial curl-first-gpt-image-2

- **Status**: ✅ SUCCESS
- **Docs**: https://docs.kie.ai/market/gpt/gpt-image-2-text-to-image
- **Kind**: image
- **Agent**: gpt-5.5
- **Time**: 60.1s
- **Rounds**: 7 LLM steps, 8 tool calls
- **Tokens**: 77,103 (prompt 75,239 + completion 1,864)
- **Est. cost**: ~$? (gpt-5.5 pricing unknown)

## Vendor
- Key: `kie`
- Base URL: `https://api.kie.ai`
- Auth: {"type":"bearer"}

## Model
- Key: `gpt-image-2-text-to-image`
- Display: GPT Image-2 Text to Image
- Fields extracted: 1

| Field | Type | Confidence | Evidence location |
|---|---|---|---|
| `aspect_ratio` | select | high | curl example in docs |

## Completeness check
- has: 2 / no: 6 / unsure: 0

## Test attempts
### Attempt 1 (create)
- ✅ HTTP 200
- POST https://api.kie.ai/api/v1/jobs/createTask
- diagnostics: HTTP OK
