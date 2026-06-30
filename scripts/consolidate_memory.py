"""
统一记忆沉淀脚本 —— 把项目积累的全部领域知识，按平台三层记忆 schema
写入每个数字员工 data/memory/<emp>/{semantic,episodic,procedural}.json。

幂等：每次运行先清掉本脚本 sourceSession 的旧记忆，再重新写入；
不碰已有的 seed_* / 其它来源记忆。

运行时注入（app/runtime/prompt.py）：
  procedural -> <learned_behaviors>   (前10)
  semantic   -> <user_knowledge>      (前20, 带 category)
  episodic   -> <past_experiences>    (前5)
"""
import json, os, sys, secrets
from datetime import datetime, timezone
from pathlib import Path

os.environ["PYTHONUTF8"] = "1"
sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path("D:/P/agent/data/memory")
SESS = "learn_consolidation_20260630"
NOW = datetime.now(timezone.utc).isoformat()

def sid(emp, typ, n): return f"{SESS}_{emp}_{typ}_{n:02d}"

def sem(emp, n, content, category, importance):
    return {"memoryId": sid(emp,"sem",n), "employeeKey": emp, "content": content,
            "category": category, "importance": importance, "sourceSession": SESS,
            "accessCount": 0, "createdAt": NOW, "lastAccessed": None, "updatedAt": NOW}

def epi(emp, n, obs, act, res, score):
    return {"memoryId": sid(emp,"epi",n), "employeeKey": emp, "observation": obs,
            "action": act, "result": res, "successScore": score, "sourceSession": SESS,
            "accessCount": 0, "createdAt": NOW, "lastAccessed": None}

def proc(emp, n, rule, rationale, conf):
    return {"memoryId": sid(emp,"proc",n), "employeeKey": emp, "rule": rule,
            "rationale": rationale, "confidence": conf, "activationCount": 0,
            "sourceSession": SESS, "createdAt": NOW, "updatedAt": NOW}

# ══════════════════════════════════════════════════════════════
# 共享知识常量（多个角色复用）
# ══════════════════════════════════════════════════════════════

DNA_R3 = "R3苍霖三阶段：EP01-03早期=16岁少年/黑色短碎发凌乱/左脸颊竖向旧伤疤/偏瘦有韧劲/深褐近黑瞳孔/破烂灰褐麻布短衣/赤脚/胸口布条绑龙骨碎片；EP04-08中期=同上+旧毯子当披风；EP09-10后期=深灰龙翼披风龙鳞纹/粗绳项链挂龙骨碎片/不再赤脚。每镜必完整复述。"
DNA_R1 = "R1艾拉(EP03起)：成年年轻女性/修长/黑长发银蓝高光/蓝瞳/偏白肤/黑蓝露肩星环法师战斗装/透明纱质外摆/大腿绑带/膝上长靴/暗金属法杖。"
DNA_R2 = "R2龙三阶段：EP04幼龙=巴掌大/鳞片稀疏湿润/锋利小角冠/半透明翼膜薄如蝉翼/熔金龙瞳圆润；EP05-07少龙=猫大/鳞片渐密深灰/翼展约一米/尾巴灵活/爪尖火星；EP09-10巨龙=马大可骑乘/宽阔翼展/翼膜血管可见/长吻/胸腔白热龙焰。"
DNA_MINER = "老矿工(EP08一次性)：老年男性/白发稀疏/满脸矿灰深刻皱纹/破旧深灰褐矿工服/手里转旧矿石。"
STYLE_ANCHOR = "风格锚点句(所有提示词必带)：干净半写实东方幻想漫剧插画，电影级高特效动作关键帧，柔和漫射光，清晰主体，低描边，蓝白魔法阵与赤金龙焰对撞。"
POS_SUFFIX = "正向约束后缀(每条提示词结尾必带)：画面干净无描边/无墨线/无裂纹/无草稿线/无脏黑边/无死黑阴影/无文字水印/保持角色一致性/服装不漂移/保持面部一致/无变形/无拉伸/面部清晰/人体结构正常/动作自然流畅/画面稳定/竖屏9:16/电影质感。"
SEEDANCE_NEG = "⚠️ Seedance 2.0 不读负向提示词，只用正向约束词；所有禁止项必须转成正向表述（不要水印→画面干净无遮挡，不要模糊→面部清晰）。"
SEEDANCE_FAST = "「快速」「fast」是禁止词，会导致运动模糊；改用「缓慢/轻微/小幅度/逐渐/平稳」。优先慢速连续小动作。"
SEG_6S = "每段视频≤6秒，超过角色会变形；10秒拆≥2段，15秒拆≥3段，用[00:00-00:05]时间码格式。"
COLOR = "色彩体系：龙骨碎片=蓝白脉动光(苍霖核心符号)/龙焰=赤金白热/星环治疗阵=蓝白+数据流(艾拉)/世界树=金绿光脉/矿洞=幽暗+碎片微光/废巷=暖色午后光/云海飞行=金色阳光+体积光。"
SCENES = "7核心场景：scene01废巷(暖色午后散射光)/scene02废矿坑(30米深,碎片蓝光+裂缝金绿光丝)/scene03矿洞口(半明半暗过渡)/scene04矿洞深处(全黑只有碎片光)/scene05世界树遗迹(枯根迷宫,金绿光脉,体积光)/scene06悬崖(断崖云海,日落暖橙侧光)/cloud云海(金色无边际,阳光穿云体积光)。"
EMOTION = "10集情绪曲线：EP02/EP07两个最低谷,EP04/EP09两个最高点,EP05唯一纯喜剧,EP10安静收尾不是高潮收尾。落差而非恒定。"
ZHEYESHI = "「也是」贯穿线：EP02苍霖被光拒绝后说「也是」(自嘲接受)→EP08老矿工笑着说「也是」(释然共鸣)。同词,六集成长后完全不同的重量。"
CAMERA = "景别×情绪：大远景=渺小/孤独(crane down)/远景=格局(tracking)/全景=客观建立(static)/中景=对话日常(dolly in)/近景=情绪(dolly in)/特写=高情绪(static+震动)/微距=奇观(dolly in)。每镜只一个运镜,中英双写。"
LIGHT = "光影×情绪：伦勃朗光=压迫戏剧/逆光轮廓光=神秘孤独/底光=恐怖不安/顶光=审判神圣/双色温=冲突对峙/体积光=史诗希望/环境柔光=日常温柔。"
SILENCE = "寂静=最强情绪工具：EP02「也是」、EP08老矿工笑了都是完全寂静只有台词。音乐骤停用于高潮崩塌(EP02假觉醒管弦乐最高点断裂)。龙鸣极远处只在EP03/EP08/EP09转折点各一声。"
AT_REF = "@引用系统：@图片1=R3苍霖母版(所有镜头必引)/@视频1=风格锁定视频(最强风格锚)/@音频1-3=配音BGM。总计≤12素材,最优4-5个。关键句「画风动作严格对齐@视频1的风格」。"
SHORT_RHYTHM = "竖屏短剧节奏：前3秒必须有情绪炸点不慢热/单句台词≤10字/单镜3-8秒/单集15-25分镜总时长1-3分钟/结尾5秒必有反转或悬念钩子。"

# ══════════════════════════════════════════════════════════════
# 每个员工的记忆包
# ══════════════════════════════════════════════════════════════

PACKS = {}

# ─── 总导演 ───
PACKS["comic-director"] = {
    "semantic": [
        (EMOTION, "emotion", 0.96),
        (ZHEYESHI, "story", 0.95),
        (SCENES, "scene", 0.90),
        ("交付目录标准：00交付说明/01剧本提示词/02人物图/03场景图/04轨迹图/05特效图与说明/06视频提示词/07质检报告。", "workflow", 0.92),
        ("第一季10集三幕：第一幕活着(EP01-03)/第二幕成长(EP04-07)/第三幕出发(EP08-10)。苍霖线做入口,其它角色线留后续季。", "story", 0.93),
    ],
    "procedural": [
        ("每集开工先确认情绪锚点和嘴替台词,再委派下游;情绪曲线必须有落差不能恒定。", "情绪过山车是漫剧留人的核心,平铺直叙会掉人。", 0.95),
        ("跨集复用资产(角色母版/场景母版)必须引用同一ID,不允许下游各画各的。", "一人团队的一致性靠总导演的资产编号纪律保证。", 0.94),
    ],
    "episodic": [
        ("用户只说『做EP08』没给情绪定位", "自动补齐：EP08=决然离开,嘴替『也是』(老矿工释然),完全寂静处理,背影不回头", "下游围绕同一情绪目标产出,质检一次通过", 0.93),
    ],
}

# ─── 编剧分镜 ───
PACKS["comic-screenwriter"] = {
    "semantic": [
        (EMOTION, "emotion", 0.95),
        (ZHEYESHI, "story", 0.96),
        ("核心问题永远是：屏幕前刷手机的人心里堵着什么?我怎么替他说出来?观众看的不是故事,是自己的倒影。", "story", 0.97),
        ("每集必须有：①嘴替台词(可截图传播)②前3秒钩子(不解释设定)③至少1个反转(以为A其实B)④结尾悬念钩子⑤情绪过山车⑥按秒拆解。", "story", 0.96),
        ("嘴替台词样例：『也是。』(EP02自嘲/EP08释然)、『你的血流到样本上了。』(EP03艾拉冷淡)、『不是我们的事。』(EP07自欺)、『好大……』(EP10渺小)。", "story", 0.94),
        (SHORT_RHYTHM, "story", 0.90),
    ],
    "procedural": [
        ("写剧本必须按秒拆镜头,每镜标注动作+台词+情绪+音效+运镜,绝不写大纲式概述。", "概述不是编剧,爆款差距在按秒拆解的思维不在技巧。", 0.96),
        ("主角成长来自选择和经历,严禁『觉醒/天命/血统开挂』叙事;苍霖是被打到泥里自己爬起来的。", "用户对天选之人套路有明确反叛意图。", 0.95),
        ("台词不超过10字,情绪最重的点用寂静(去掉BGM和音效只留台词)。", "短台词适配竖屏,寂静是最强情绪工具。", 0.93),
    ],
    "episodic": [
        ("要写EP02假觉醒", "设计管弦乐推到最高点→光柱掐灭→音乐骤停→彻底寂静→苍霖一句『也是』", "情绪从炸亮跌到最低谷,『也是』成为可截图的嘴替", 0.95),
    ],
}

# ─── 人物设定 ───
PACKS["comic-character-designer"] = {
    "semantic": [
        (DNA_R3, "character", 0.99),
        (DNA_R1, "character", 0.97),
        (DNA_R2, "character", 0.97),
        (DNA_MINER, "character", 0.90),
        (STYLE_ANCHOR, "style", 0.93),
        ("视觉符号每镜必写：苍霖左脸竖疤+胸口龙骨碎片;艾拉银蓝高光+暗金属法杖;龙的熔金龙瞳。独特标记是角色一致性的锚。", "character", 0.95),
    ],
    "procedural": [
        ("输出角色设定时必须给5-8个固定视觉DNA词,标注分阶段变化(R3三阶段服装/R2三阶段体型)。", "AI不记得上一镜,固定词每次完整复述才能保持一致。", 0.96),
        ("生成三视图母版(正面/侧面/背面),供下游@图片1引用。", "母版图是角色一致性工作流的基准。", 0.94),
    ],
    "episodic": [
        ("需要EP09苍霖形象", "调用R3后期DNA:深灰龙翼披风龙鳞纹+粗绳项链挂碎片+不再赤脚,与EP01早期形成成长对照", "下游提示词角色不漂移,EP01到EP09有可见成长", 0.93),
    ],
}

# ─── 场景美术 ───
PACKS["comic-scene-designer"] = {
    "semantic": [
        (SCENES, "scene", 0.98),
        (COLOR, "scene", 0.95),
        (LIGHT, "light", 0.92),
        (STYLE_ANCHOR, "style", 0.90),
        ("场景使用分布：废巷=EP01/05/08,废矿坑=EP02,矿洞=EP03,世界树遗迹=EP06/07,悬崖=EP09,云海=EP09/10。控制在10核心场景提高复用率。", "scene", 0.91),
    ],
    "procedural": [
        ("每个场景给固定ID+光源方向/色温+氛围元素,生成场景母版供复用。", "10核心场景复用率高,母版锁定风格一致。", 0.95),
        ("光影描述是质量ROI最高的部分,必须写清光源类型/方向/色温。", "同样主体不同光影,情绪完全不同。", 0.93),
    ],
    "episodic": [
        ("要EP02废矿坑场景", "锁定scene02:30米深竖井+碎片蓝光+裂缝金绿光丝+幽暗冷调,环境音滴水回声+碎片脉动", "场景母版可被EP02所有镜头复用,风格统一", 0.92),
    ],
}

# ─── 特效设计 ───
PACKS["comic-vfx-designer"] = {
    "semantic": [
        (COLOR, "vfx", 0.97),
        (LIGHT, "light", 0.95),
        ("核心特效元素：龙骨碎片蓝白脉动光/龙焰赤金白热/星环治疗阵蓝白数据流/世界树金绿光脉/体积光穿云。", "vfx", 0.95),
        (STYLE_ANCHOR, "style", 0.90),
        ("禁止：死黑阴影/裂纹划痕纹理/黑色粗描边墨线。特效要干净通透不脏。", "vfx", 0.92),
    ],
    "procedural": [
        ("特效服从情绪和色彩体系,每个魔法/光效绑定固定颜色(碎片=蓝白,龙焰=赤金)。", "颜色是叙事符号,乱配会破坏视觉识别。", 0.94),
        ("用体积光/逆光制造史诗和希望感,用底光/伦勃朗光制造压迫。", "光型直接对应情绪,选错光情绪就错。", 0.92),
    ],
    "episodic": [
        ("EP01碎片激活需要特效", "设计胸口龙骨碎片从暗到蓝白脉动渐亮,微光初现不要炸裂(留给EP02假觉醒)", "EP01微光与EP02炸亮形成递进,情绪不提前透支", 0.91),
    ],
}

# ─── 动作轨迹 ───
PACKS["comic-trajectory-artist"] = {
    "semantic": [
        (CAMERA, "camera", 0.97),
        ("常用20运镜:dolly in/out,zoom in/out,tracking,truck,arc,crane up/down,boom,pan,tilt,dutch angle,360 orbit,static,handheld,whip pan,bird's eye,low angle。", "camera", 0.95),
        ("运镜情绪组合拳:dolly in+浅景深=世界只剩这个/crane down+雨=命运降临/static+寂静=最痛没声音/tracking+背影=你跟不上/whip pan=时空转换/dutch angle+底光=世界崩塌。", "camera", 0.94),
        (SEEDANCE_FAST, "camera", 0.93),
        ("镜头运动和角色动作必须分开描述,混写模型分不清谁在动。每镜只一个运镜动作。", "camera", 0.94),
    ],
    "procedural": [
        ("每镜只标一个运镜,中英双写如『缓慢推进(dolly in)』,给机位高度/焦段/速度/角度参数。", "多运镜叠加会画面崩坏,参数化才能稳定复现。", 0.95),
        ("动作写身体部位级动作链,优先慢速连续小动作,严禁快速/剧烈/夸张。", "Seedance遇快速会运动模糊,慢动作更稳。", 0.94),
    ],
    "episodic": [
        ("EP09骑龙飞翔要运镜", "设计crane up升起+arc环绕展现翼展,角色动作(苍霖抓龙角)与镜头动作(环绕)分两句写", "飞行的自由感出来了,角色不变形", 0.92),
    ],
}

# ─── 分镜师（空）───
PACKS["comic-storyboard"] = {
    "semantic": [
        (CAMERA, "camera", 0.96),
        (DNA_R3, "character", 0.94),
        (SCENES, "scene", 0.93),
        (SHORT_RHYTHM, "story", 0.92),
        ("分镜要标景别+主体位置+运镜+情绪,每镜对应一个Shot编号供下游(人物/场景/特效/轨迹)统一引用。", "workflow", 0.93),
        (EMOTION, "emotion", 0.90),
    ],
    "procedural": [
        ("把剧本拆成带编号的分镜表,每镜含景别/主体/动作/运镜/时长/情绪,下游按Shot编号对齐。", "Shot编号是一人团队各角色协同的唯一锚点。", 0.95),
        ("前3秒第1镜必须是情绪炸点或强视觉,不能用建立镜头慢热。", "竖屏短剧前3秒决定留存。", 0.93),
        ("按景别×情绪选镜:高情绪用特写+static,孤独感用大远景+crane down。", "景别本身就是情绪语言。", 0.92),
    ],
    "episodic": [
        ("拿到EP02剧本要拆分镜", "拆7镜并编号S01-S07,S01碎片引路(中景handheld),高潮假觉醒(近景dolly in),『也是』(特写static+寂静)", "下游所有角色按S01-S07对齐,可逐镜整合视频提示词", 0.93),
        ("剧本只有文字没有镜头", "主动补景别和运镜,情绪最重处选static+寂静,转场用whip pan", "文字剧本变成可执行分镜表", 0.90),
    ],
}

# ─── AI视频提示词（已较全,补充）───
PACKS["comic-prompt-engineer"] = {
    "semantic": [
        (SEEDANCE_NEG, "quality", 0.99),
        (SEG_6S, "quality", 0.97),
        (AT_REF, "prompt", 0.96),
        (DNA_R3, "character", 0.95),
        (SCENES, "scene", 0.92),
        (POS_SUFFIX, "quality", 0.95),
    ],
    "procedural": [
        ("八层结构组装:素材声明→镜头标签→景别主体→动作→运镜→场景光影→音频→全局收尾。每层缺一返工。", "八层是S-A-C-S-C的生产展开,漏层质量不可控。", 0.96),
        ("角色描述每镜完整复述视觉DNA,@图片1锚定,绝不简写。", "AI不记得上一镜,简写必导致角色漂移。", 0.96),
    ],
    "episodic": [
        ("要把EP04养龙10秒做成提示词", "分2段每段5秒:段1幼龙破壳(中景dolly in),段2拱入怀(近景static),@图片1锁苍霖@图片2锁幼龙,音频细弱叫声", "10秒不变形,角色一致,温暖峰值情绪到位", 0.94),
    ],
}

# ─── 质检（补充）───
PACKS["comic-qa-inspector"] = {
    "semantic": [
        (SEEDANCE_NEG, "qa", 0.98),
        (SEEDANCE_FAST, "qa", 0.96),
        (SEG_6S, "qa", 0.95),
        ("质检红线清单:①缺风格锚点句②缺正向后缀③出现快速/fast④角色DNA被改写⑤无@引用⑥无R编号⑦单段超6秒⑧多运镜叠加⑨运镜没中英双写⑩负向提示词⑪缺口型字幕行。", "qa", 0.97),
        (DNA_R3, "character", 0.92),
    ],
    "procedural": [
        ("逐条对照红线清单检查,任何一条不过就点名返工字段,不许放行。", "质量闸是一人团队可靠性的来源。", 0.96),
        ("重点查角色DNA是否每镜完整复述、是否出现快速/fast、单段是否超6秒。", "这三项是角色变形和运动模糊的最高频诱因。", 0.95),
    ],
    "episodic": [
        ("收到一条vid_prompt含『快速展开龙翼』", "判定不合格,点名:快速是禁止词→改『缓缓展开龙翼』,并检查该段时长是否超6秒", "运动模糊风险消除,提示词回炉合格", 0.94),
    ],
}

# ─── 角色生成师（空）───
PACKS["comic-character-artist"] = {
    "semantic": [
        (DNA_R3, "character", 0.99),
        (DNA_R1, "character", 0.97),
        (DNA_R2, "character", 0.97),
        (STYLE_ANCHOR, "style", 0.94),
        (POS_SUFFIX, "quality", 0.94),
        (AT_REF, "prompt", 0.92),
        ("七要素图片公式:风格+主体描述(视觉DNA)+动作表情+景别构图+光影质感+情绪氛围+画质后缀。", "prompt", 0.93),
    ],
    "procedural": [
        ("生成角色图必须完整带视觉DNA固定词+@图片1引用母版,脸和服装一个字都不能改。", "AI不记得角色,简写或改词必漂移。", 0.96),
        ("按集次选对应阶段DNA(R3三阶段/R2三阶段),不能跨阶段混用。", "苍霖EP01赤脚EP09有靴,龙从巴掌大到马大,阶段错了就穿帮。", 0.95),
        ("结尾必带正向约束后缀,所有禁止项转正向表述(Seedance不读负向)。", "负向提示词无效,只有正向约束能保证画质。", 0.94),
    ],
    "episodic": [
        ("要出EP05少龙图", "用R2少龙DNA:猫大/鳞片渐密深灰/翼展约一米/尾巴灵活/爪尖火星,@图片2引用幼龙母版保持血统连续", "少龙与EP04幼龙是同一条龙的成长,体型对但脸一致", 0.92),
        ("只说『画苍霖』没说哪集", "默认确认集次再画,不同阶段服装差异大(早期赤脚麻布vs后期龙翼披风)", "避免画错阶段返工", 0.90),
    ],
}

# ─── 布景生成师（空）───
PACKS["comic-scene-artist"] = {
    "semantic": [
        (SCENES, "scene", 0.98),
        (COLOR, "scene", 0.95),
        (LIGHT, "light", 0.93),
        (STYLE_ANCHOR, "style", 0.93),
        (POS_SUFFIX, "quality", 0.93),
        ("七要素图片公式:风格+主体描述+动作表情+景别构图+光影质感+情绪氛围+画质后缀。场景图重点在光影质感层。", "prompt", 0.91),
    ],
    "procedural": [
        ("按场景ID生成,锁定光源方向/色温/氛围元素,@引用场景母版保证同场景跨镜一致。", "同一场景不同镜头风格漂移会让观众出戏。", 0.95),
        ("场景图不放角色或只放剪影,角色由角色生成师单独出,后期合成。", "分层生成可控性高,角色和背景分开锁一致性。", 0.93),
        ("结尾带正向约束后缀,禁死黑阴影/裂纹纹理,保持画面干净通透。", "Seedance只读正向,脏黑边破坏漫剧质感。", 0.93),
    ],
    "episodic": [
        ("要EP06世界树遗迹背景", "用scene05:枯根迷宫+金绿残留光脉+体积光从裂缝穿入,冷调带衰败感,不放角色", "遗迹的神秘衰败氛围出来,可承载全息求救剧情", 0.92),
        ("要EP10云海", "用cloud:金色云海无边际+阳光穿云体积光,大远景留白给九大陆剪影", "渺小感和史诗感兼具,服务EP10安静收尾", 0.91),
    ],
}

# ─── 关键参考图生成师（空）───
PACKS["comic-keyframe-artist"] = {
    "semantic": [
        (DNA_R3, "character", 0.97),
        (SCENES, "scene", 0.95),
        (CAMERA, "camera", 0.93),
        (STYLE_ANCHOR, "style", 0.94),
        (POS_SUFFIX, "quality", 0.94),
        (AT_REF, "prompt", 0.93),
        ("关键帧=每镜首帧,是图生视频的起点,必须景别/构图/角色位置/光影一次到位,@图片1锁角色@场景母版锁背景。", "prompt", 0.94),
    ],
    "procedural": [
        ("每个Shot出一张关键参考图,合成角色DNA+场景母版+该镜景别构图,作为该镜vid_prompt的首帧。", "首帧锁定后图生视频才不会风格漂移。", 0.96),
        ("关键帧的景别和构图必须匹配分镜表的Shot定义(特写/中景/大远景),光影匹配场景母版。", "首帧定调,景别错整镜都错。", 0.94),
        ("每镜批量出10+张备选,挑最符合风格锚点和角色一致性的作为正片关键帧。", "批量+优选是工业化稳定出片的方法。", 0.92),
    ],
    "episodic": [
        ("EP02『也是』那一镜要关键帧", "出特写首帧:苍霖左脸疤侧光,胸口碎片暗下来,表情自嘲,static构图,完全留白配合寂静", "首帧情绪到位,图生视频可直接展开这一镜的最低谷", 0.93),
        ("分镜给了S03大远景但没给参考图", "按大远景+crane down构图出首帧,角色小、环境大,体现渺小孤独", "大远景关键帧锁定,下游运镜有据可依", 0.90),
    ],
}

# ══════════════════════════════════════════════════════════════
# 写入（幂等）
# ══════════════════════════════════════════════════════════════

def load(fp):
    if fp.exists():
        try: return json.loads(fp.read_text("utf-8"))
        except Exception: return []
    return []

def write(fp, data):
    fp.parent.mkdir(parents=True, exist_ok=True)
    fp.write_text(json.dumps(data, ensure_ascii=False, indent=2), "utf-8")

def strip_mine(items): return [x for x in items if x.get("sourceSession") != SESS]

total = {"sem":0, "epi":0, "proc":0}
for emp, pack in PACKS.items():
    d = ROOT / emp
    d.mkdir(parents=True, exist_ok=True)

    sp, ep, pp = d/"semantic.json", d/"episodic.json", d/"procedural.json"
    sems, epis, procs = strip_mine(load(sp)), strip_mine(load(ep)), strip_mine(load(pp))

    for i,(c,cat,imp) in enumerate(pack.get("semantic",[]),1):
        sems.append(sem(emp,i,c,cat,imp)); total["sem"]+=1
    for i,(o,a,r,s) in enumerate(pack.get("episodic",[]),1):
        epis.append(epi(emp,i,o,a,r,s)); total["epi"]+=1
    for i,(ru,ra,cf) in enumerate(pack.get("procedural",[]),1):
        procs.append(proc(emp,i,ru,ra,cf)); total["proc"]+=1

    sems.sort(key=lambda m: m["importance"], reverse=True)
    epis.sort(key=lambda m: m["successScore"], reverse=True)
    procs.sort(key=lambda m: m["confidence"], reverse=True)

    write(sp, sems); write(ep, epis); write(pp, procs)
    print(f"OK {emp:28s} | sem={len(sems):2d} epi={len(epis):2d} proc={len(procs):2d}")

print(f"\n本次注入 sem={total['sem']} epi={total['epi']} proc={total['proc']} 跨 {len(PACKS)} 个员工")
