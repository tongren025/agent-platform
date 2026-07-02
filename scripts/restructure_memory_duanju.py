"""
重构员工记忆：把"短剧"立成脊柱，电影/美术正典降级为工具，清掉矛盾的电影节奏。
原因：记忆电影:短剧≈137:21，地基偏向拍电影，导致产出全是电影节奏。

操作(对全部 comic-* 员工的 semantic.json)：
1. 注入【短剧第一准则】最高优先级 0.99 —— 统管脊柱
2. 清矛盾：删/改"单镜3-8秒"等电影节奏表述 → 1-2s剪辑beat
3. 抬权重：短剧内核(爆款/嘴替/钩子/反转/信息密度/快切/微短剧) → 0.96
4. 降权重：纯电影美术理论(category=knowledge/craft，且非AI一致性) → 0.55，留作"按需工具"
   —— 保留：角色DNA/场景/色彩体系/风格(项目级)、AI一致性(生产命脉)
"""
import json, os, sys, glob
os.environ["PYTHONUTF8"] = "1"
sys.stdout.reconfigure(encoding="utf-8")

SESS = "duanju_spine_20260630"
NOW = "2026-06-30T23:30:00Z"

LAW = ("【短剧第一准则·最高优先级,统管一切】你做的是高节奏竖屏短剧,不是电影。"
       "节奏=信息/反转密度:每1-2秒砸一个新事件/反转/钩子/嘴替台词,绝不靠氛围或漂亮镜头撑时间。"
       "剪辑beat 1-2秒(Seedance生成源片4-5s,之后在剪映剪碎),开口即钩子,硬切悬念收尾,一集15-25个事件beat。"
       "构图/色彩/布光/运镜/景别这些电影美术手艺只是工具,必须服从短剧节奏,不是目的。")

# 短剧内核关键词 → 抬到 0.96
ELEVATE = ["短剧","微短剧","爆款","嘴替","钩子","反转","留存","Beat Engine","信息密度",
           "前3秒","情绪过山车","1-2秒","快切","定格钩","也是"]
# AI一致性(生产命脉) → 保 0.9,不降
AICONS = ["一致性","参考图","转面","首帧","锚定","母版"]
# 电影/美术理论的来源标记(降级用)
FILM_SRC = ["StudioBinder","Adobe","No Film School","AnimeOutline","CharacterBazaar","vsquad",
            "TheDrawingSource","Anatomy Masterclass","Clip Studio","CreativeBloq","Evenant",
            "Studiovity","AMPAS","FlowHunt","Portkey","维基百科","蒙太奇","概念藝術","視覺效果",
            "電影製作","透視","構圖","色彩理論","动画12原则","形状语言","伦勃朗","三点布光"]

def has(c, kws): return any(k in c for k in kws)

stats = {"law":0,"fixed":0,"elevated":0,"demoted":0,"kept":0}
for f in sorted(glob.glob("data/memory/comic-*/semantic.json")):
    emp = f.split(os.sep)[-2]
    items = json.load(open(f, encoding="utf-8"))

    # 去掉本脚本旧注入的法则，避免重复
    items = [m for m in items if m.get("sourceSession") != SESS]

    for m in items:
        c = m.get("content", "")
        cat = m.get("category", "")

        # 清矛盾：电影节奏 3-8秒 → 短剧 1-2s
        if "3-8秒" in c or "3-8s" in c or "单镜3-8" in c:
            m["content"] = c = (c.replace("单镜3-8秒", "剪辑beat 1-2秒(生成源片4-5s后剪碎)")
                                  .replace("单镜 3-8 秒", "剪辑beat 1-2秒")
                                  .replace("3-8秒", "1-2秒").replace("3-8s", "1-2s"))
            stats["fixed"] += 1

        # 抬权重：短剧内核
        if has(c, ELEVATE) or cat in ("story", "shortdrama_law"):
            if m.get("importance", 0) < 0.96:
                m["importance"] = 0.96; stats["elevated"] += 1
        # 保命脉：AI一致性
        elif has(c, AICONS):
            m["importance"] = max(m.get("importance", 0.5), 0.9); stats["kept"] += 1
        # 降权重：纯电影美术理论
        elif cat in ("knowledge", "craft") or has(c, FILM_SRC):
            m["importance"] = 0.55; stats["demoted"] += 1
        else:
            stats["kept"] += 1

    # 注入最高准则
    items.insert(0, {
        "memoryId": f"{SESS}_{emp}_law", "employeeKey": emp, "content": LAW,
        "category": "shortdrama_law", "importance": 0.99, "sourceSession": SESS,
        "accessCount": 0, "createdAt": NOW, "lastAccessed": None, "updatedAt": NOW,
    })
    stats["law"] += 1

    items.sort(key=lambda m: m.get("importance", 0), reverse=True)
    json.dump(items, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print(f"注入短剧准则 {stats['law']} 个员工")
print(f"清矛盾(电影节奏→1-2s) {stats['fixed']} 条")
print(f"抬权重(短剧内核) {stats['elevated']} 条")
print(f"降权重(电影正典→工具) {stats['demoted']} 条")
print(f"保留(项目/DNA/场景/AI一致性) {stats['kept']} 条")
