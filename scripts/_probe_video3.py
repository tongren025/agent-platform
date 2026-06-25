import json, httpx
from app.services.scraper import _extract_window_json

r = httpx.get(
    "https://jimeng.jianying.com/ai-tool/video/home",
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"},
    follow_redirects=True, timeout=15,
)
html = r.text

# Try _SSR_DATA
for var in ["_SSR_DATA", "_ROUTER_DATA"]:
    raw = _extract_window_json(html, var)
    if not raw:
        print(f"{var}: not found")
        continue
    data = json.loads(raw, parse_constant=lambda _c: None)

    # Dump structure to find where video prompts live
    out = json.dumps(data, ensure_ascii=False, indent=2)
    # Write to file for inspection
    with open(f"_ssr_{var}.json", "w", encoding="utf-8") as f:
        f.write(out)
    print(f"{var}: {len(out)} chars, saved to _ssr_{var}.json")

    # Quick scan for prompt-like keys
    text = out.lower()
    for keyword in ["prompt", "text2video", "t2v", "video_prompt", "describe"]:
        count = text.count(keyword)
        if count:
            print(f"  '{keyword}' appears {count} times")
