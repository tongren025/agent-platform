import json, httpx
from app.services.scraper import _extract_window_json

URLS = [
    "https://jimeng.jianying.com/ai-tool/video/home",
    "https://jimeng.jianying.com/ai-tool/home/?tab=video",
    "https://jimeng.jianying.com/ai-tool/home?tab_name=video",
]

for url in URLS:
    print(f"\n{'='*60}")
    print(f"URL: {url}")
    try:
        r = httpx.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}, follow_redirects=True, timeout=15)
        html = r.text
        print(f"Final URL: {r.url}")
        print(f"Status: {r.status_code}")

        raw = _extract_window_json(html, "__get_explore_result")
        if not raw:
            # Try other window vars
            import re
            vars_found = re.findall(r"window\.(\w+)\s*=\s*[{\[]", html)
            print(f"No __get_explore_result. Window vars found: {vars_found[:10]}")
            continue

        data = json.loads(raw, parse_constant=lambda _c: None)
        items = ((data or {}).get("data") or {}).get("item_list") or []
        print(f"Items: {len(items)}")

        vc, ic = 0, 0
        for item in items:
            aigc = item.get("aigc_image_params") or {}
            t2v = aigc.get("text2video_params") or {}
            v_prompt = (t2v.get("prompt") or t2v.get("actual_prompt") or "").strip()
            if v_prompt:
                vc += 1
                if vc <= 3:
                    print(f"  VIDEO: {v_prompt[:100]}")
            else:
                ic += 1
        print(f"Video: {vc}, Image: {ic}")
    except Exception as e:
        print(f"Error: {e}")
