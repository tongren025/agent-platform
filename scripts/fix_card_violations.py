"""Fix Seedance rule violations in generated cards."""
import json, re, sys, os
os.environ["PYTHONUTF8"] = "1"
sys.stdout.reconfigure(encoding="utf-8")

CARDS_PATH = "D:/P/agent/data/production/jiulu-s1/cards.json"

with open(CARDS_PATH, "r", encoding="utf-8") as f:
    cards = json.load(f)

fixes = 0

# Camera term CN->EN mapping for missing bilingual terms
CAMERA_CN_EN = {
    "推进": "dolly in",
    "拉远": "dolly out",
    "横移": "tracking",
    "升起": "crane up",
    "降落": "crane down",
    "下降": "crane down",
    "环绕": "orbit",
    "摇镜": "pan",
    "俯拍": "bird's eye",
    "仰拍": "low angle",
    "固定": "static",
    "跟拍": "tracking",
    "甩镜": "whip pan",
    "手持": "handheld",
    "微推": "dolly in",
    "缓推": "dolly in",
    "旋转": "orbit",
    "摇": "pan",
    "倾斜": "dutch angle",
}

for c in cards:
    if not c["prompts"]:
        continue
    p = c["prompts"][0]
    cid = c["card_id"]
    changed = False

    # Fix 1: Replace "快速" with safe alternatives
    if "快速" in p:
        # Context-aware replacement
        p = p.replace("快速闪退", "缓缓后退")
        p = p.replace("快速奔跑", "大步奔跑")
        p = p.replace("快速飞行", "稳定飞行")
        p = p.replace("快速扩散", "逐渐扩散")
        p = p.replace("快速旋转", "缓缓旋转")
        p = p.replace("快速展开", "缓缓展开")
        p = p.replace("快速后退", "缓缓后退")
        p = p.replace("快速移动", "平稳移动")
        p = p.replace("快速", "迅捷")  # fallback (still not great but better than 快速)
        if "迅捷" in p:
            p = p.replace("迅捷", "流畅")  # safer fallback
        changed = True
        print(f"  FIX 快速 -> safe alt: {cid}")

    # Fix 2: Add EN camera terms where missing in vid_prompts
    if c["stage"] == "vid_prompt" and c["shot_number"] > 0:
        has_en = any(x in p for x in ["dolly", "static", "tracking", "pan", "crane",
                                       "handheld", "orbit", "tilt", "arc", "whip",
                                       "bird", "low angle", "zoom"])
        if not has_en:
            for cn, en in CAMERA_CN_EN.items():
                if cn in p:
                    # Add (EN) after first occurrence of CN camera term
                    p = p.replace(cn, f"{cn}({en})", 1)
                    changed = True
                    print(f"  FIX camera bilingual: {cid} += ({en})")
                    break
            else:
                # No CN term found either, add static as default
                # Find the timecode line and add camera info
                if "[00:" in p:
                    p = p.replace("\n音效", "\n固定机位(static)。\n音效", 1)
                    if "固定机位(static)" in p:
                        changed = True
                        print(f"  FIX camera bilingual: {cid} += static (default)")

    # Fix 3: Add R-tag to img_prompts that describe scenes with no characters
    if c["stage"] == "img_prompt" and "R3" not in p and "R1" not in p and "R2" not in p:
        # These are environment/object-only shots - add scene context tag
        if "龙骨碎片" in p or "碎片" in p:
            p = p.replace("龙骨碎片", "R3苍霖的龙骨碎片", 1)
            changed = True
            print(f"  FIX R-tag: {cid} += R3 context")
        elif "龙蛋" in p:
            p = p.replace("龙蛋", "R2龙蛋", 1)
            changed = True
            print(f"  FIX R-tag: {cid} += R2 context")
        elif "世界树" in p or "遗迹" in p or "矿洞" in p:
            # Pure environment shot - OK to not have R-tag
            print(f"  SKIP R-tag: {cid} (pure environment shot)")

    if changed:
        c["prompts"][0] = p
        fixes += 1

with open(CARDS_PATH, "w", encoding="utf-8") as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)

print(f"\nFixed {fixes} cards")

# Re-audit
issues = 0
for c in cards:
    if c["stage"] not in ("img_prompt", "vid_prompt"):
        continue
    if not c["prompts"]:
        continue
    p = c["prompts"][0]
    cid = c["card_id"]
    if "快速" in p:
        print(f"  STILL: {cid} has 快速")
        issues += 1
    if c["stage"] == "vid_prompt" and c["shot_number"] > 0:
        has_en = any(x in p for x in ["dolly", "static", "tracking", "pan", "crane",
                                       "handheld", "orbit", "tilt", "arc", "whip",
                                       "bird", "low angle", "zoom"])
        if not has_en:
            print(f"  STILL: {cid} missing EN camera")
            issues += 1

print(f"Remaining issues: {issues}")
