import json, httpx
from app.services.scraper import _extract_window_json

r = httpx.get(
    "https://jimeng.jianying.com/ai-tool/home/",
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"},
    follow_redirects=True, timeout=15,
)
html = r.text

raw = _extract_window_json(html, "__get_explore_result")
if not raw:
    print("NO SSR DATA FOUND")
    exit()

data = json.loads(raw, parse_constant=lambda _c: None)
items = ((data or {}).get("data") or {}).get("item_list") or []
print(f"Total items: {len(items)}")

video_count = 0
image_count = 0
for item in items:
    aigc = item.get("aigc_image_params") or {}
    t2v = aigc.get("text2video_params") or {}
    t2i = aigc.get("text2image_params") or {}
    v_prompt = (t2v.get("prompt") or t2v.get("actual_prompt") or "").strip()
    i_prompt = (t2i.get("prompt") or t2i.get("actual_prompt") or "").strip()
    if v_prompt:
        video_count += 1
        print(f"  VIDEO: {v_prompt[:80]}")
    elif i_prompt:
        image_count += 1

print(f"\nVideo: {video_count}, Image: {image_count}")

# Check if there's a tab_name or category
if items:
    sample = items[0]
    common = sample.get("common_attr") or {}
    print(f"\nSample common keys: {list(common.keys())[:10]}")
    print(f"type={common.get('type')}, category={common.get('category')}")
    # Check the outer URL for tab info
    print(f"\nFinal URL: {r.url}")
