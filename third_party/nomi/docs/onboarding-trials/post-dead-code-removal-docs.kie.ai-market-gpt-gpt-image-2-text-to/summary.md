# Trial post-dead-code-removal

- **Status**: ✅ SUCCESS
- **Docs**: https://docs.kie.ai/market/gpt/gpt-image-2-text-to-image
- **Kind**: image
- **Agent**: gpt-5.5
- **Time**: 51.9s
- **Rounds**: 8 LLM steps, 7 tool calls
- **Tokens**: 82,356 (prompt 81,145 + completion 1,211)
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
| `aspect_ratio` | select | high | curl_examples[0] request body |

## Test attempts
### Attempt 1 (create)
- ✅ HTTP 200
- POST https://api.kie.ai/api/v1/jobs/createTask
- diagnostics: HTTP OK
