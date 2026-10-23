"""
山海经专栏与角色图鉴 API。

提供山海经神兽/神祇/异禽等角色的检索、详情管理、网络图片抓取与图片防盗链代理服务。
Prefix: /api/v1/agentapp/shanhaijing
"""

from __future__ import annotations

import hashlib
import json
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, Response
from pydantic import BaseModel, Field

from app.config import BASE_DIR
from app.api.common import ok as _ok, validate_key as _validate

router = APIRouter(prefix="/api/v1/agentapp/shanhaijing", tags=["shanhaijing"])

DATA_DIR = BASE_DIR / "data" / "shanhaijing"
CHARACTERS_FILE = DATA_DIR / "characters.json"
CACHE_DIR = DATA_DIR / "cache"


# ── 数据结构定义 ─────────────────────────────────────────────────────


class CharacterImage(BaseModel):
    """角色图片元数据。"""

    id: str = Field(default_factory=lambda: hashlib.md5(f"{datetime.now().timestamp()}".encode()).hexdigest()[:8])
    url: str
    title: str = "山海经图谱"
    source: str = "网络检索"
    is_cover: bool = False


class ShanhaiCharacter(BaseModel):
    """山海经角色全量模型。"""

    id: str
    name: str
    pinyin: str = ""
    title: str = ""
    category: str = "异兽"
    mountain: str = ""
    classic_quote: str = ""
    modern_desc: str = ""
    ability: str = ""
    mortal_identity: Optional[str] = ""
    divine_form: Optional[str] = ""
    visual_prompt: Optional[str] = ""
    images: List[CharacterImage] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CharacterCreateRequest(BaseModel):
    """新建角色请求。"""

    id: Optional[str] = None
    name: str
    pinyin: str = ""
    title: str = ""
    category: str = "异兽"
    mountain: str = ""
    classic_quote: str = ""
    modern_desc: str = ""
    ability: str = ""
    mortal_identity: Optional[str] = ""
    divine_form: Optional[str] = ""
    visual_prompt: Optional[str] = ""
    images: List[CharacterImage] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    auto_fetch_images: bool = False


class CharacterUpdateRequest(BaseModel):
    """更新角色请求。"""

    name: Optional[str] = None
    pinyin: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    mountain: Optional[str] = None
    classic_quote: Optional[str] = None
    modern_desc: Optional[str] = None
    ability: Optional[str] = None
    mortal_identity: Optional[str] = None
    divine_form: Optional[str] = None
    visual_prompt: Optional[str] = None
    images: Optional[List[CharacterImage]] = None
    tags: Optional[List[str]] = None


# ── 默认经典角色数据集（12+位典籍经典角色，每位配有1~3张真实网络图片） ──────

DEFAULT_CHARACTERS = [
    {
        "id": "jiuweihu",
        "name": "九尾狐",
        "pinyin": "jiǔ wěi hú",
        "title": "青丘祥瑞 · 灵狐仙影",
        "category": "瑞兽",
        "mountain": "《南山经》· 青丘之山",
        "classic_quote": "又东三百里，曰青丘之山，其阳多玉，其阴多青䨼。有兽焉，其状如狐而九尾，其音如婴儿，能食人，食者不蛊。",
        "modern_desc": "青丘之山的祥瑞神兽，身具九尾，啼鸣如赤子初诞。其肉能御百毒妖邪，上古视其为多子昌盛与王道太平之天命祥兆。",
        "ability": "辟邪防蛊、灵慧幻化、通晓人言",
        "tags": ["青丘", "祥瑞", "九尾", "食者不蛊", "天狐仙灵"],
        "images": [
            {
                "id": "img_jwh_1",
                "url": "https://upload.wikimedia.org/wikipedia/commons/0/05/NineTailsFox.JPG",
                "title": "古籍《山海经》刻本·青丘九尾狐图",
                "source": "Wikimedia Commons / 传世刻本",
                "is_cover": True,
            },
            {
                "id": "img_jwh_2",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Hokusai_Sangoku_Yoko-den.jpg/500px-Hokusai_Sangoku_Yoko-den.jpg",
                "title": "葛饰北斋《三国妖狐传》·九尾金毛仙狐画卷",
                "source": "大都会艺术博物馆藏品",
                "is_cover": False,
            },
            {
                "id": "img_jwh_3",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Prince_Hanzoku_terrorised_by_a_nine-_tailed_fox.jpg/800px-Prince_Hanzoku_terrorised_by_a_nine-_tailed_fox.jpg",
                "title": "九尾神狐降凡显圣图卷",
                "source": "典籍版画辑录",
                "is_cover": False,
            },
        ],
    },
    {
        "id": "zhulong",
        "name": "烛龙",
        "pinyin": "zhú lóng",
        "title": "钟山之神 · 创世烛阴",
        "category": "创世神祇",
        "mountain": "《海外北经》· 钟山",
        "classic_quote": "钟山之神，名曰烛阴，视为昼，瞑为夜，吹为冬，呼为夏，不饮，不食，不息，息为风。身长千里。人面，蛇身，赤色，居钟山下。",
        "modern_desc": "极北钟山的盘古化身级尊神。人面蛇躯，身长万里赤红如烈火。开眸天地破晓为白昼，闭目寰宇沉沦为黑夜，吐气成夏，吸气凝冬。",
        "ability": "执掌昼夜更迭、司掌寒暑节候、吐纳乾坤狂风",
        "tags": ["钟山之神", "烛阴", "千里赤龙", "昼夜主宰", "人面蛇身"],
        "images": [
            {
                "id": "img_zl_1",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Shan_hai_jing_Zhuyin.jpg/500px-Shan_hai_jing_Zhuyin.jpg",
                "title": "明清《山海经》版画·钟山烛阴神图",
                "source": "明代《山海经图》",
                "is_cover": True,
            },
            {
                "id": "img_zl_2",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/SekienShokuin.jpg/500px-SekienShokuin.jpg",
                "title": "鸟山石燕《画图百鬼夜行》·烛阴法相",
                "source": "古典绘本图鉴",
                "is_cover": False,
            },
            {
                "id": "img_zl_3",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Imperial_Encyclopaedia_-_Spirits_and_the_Supernatural_-_pic45_-_%E7%87%AD%E9%99%B0%E7%A5%9E%E5%9C%96.png/600px-Imperial_Encyclopaedia_-_Spirits_and_the_Supernatural_-_pic45_-_%E7%87%AD%E9%99%B0%E7%A5%9E%E5%9C%96.png",
                "title": "《古今图书集成》神异典·烛阴神像全图",
                "source": "故宫文渊阁藏本",
                "is_cover": False,
            },
        ],
    },
    {
        "id": "xingtian",
        "name": "刑天",
        "pinyin": "xíng tiān",
        "title": "常羊战尊 · 猛志常在",
        "category": "远古战神",
        "mountain": "《海外西经》· 常羊之山",
        "classic_quote": "刑天与帝至此争神，帝断其首，葬之於常羊之山，乃以乳为目，以脐为口，操干戚以舞。",
        "modern_desc": "炎帝麾下至烈战神，与天帝逐鹿于常羊之野。虽身首分离，犹以双乳化为烈日神目，以肚脐化作雷霆怒口，执巨斧重盾舞动战意。",
        "ability": "不灭战魂、干戚碎天、断首战神、怒目撼神",
        "tags": ["常羊山", "以乳为目", "以脐为口", "操干戚以舞", "不屈战魂"],
        "images": [
            {
                "id": "img_xt_1",
                "url": "https://upload.wikimedia.org/wikipedia/commons/b/b4/Xingtian.jpg",
                "title": "古籍《山海经》刻本·刑天断首舞干戚",
                "source": "清代刻本珍藏",
                "is_cover": True,
            },
            {
                "id": "img_xt_2",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Imperial_Encyclopaedia_-_Spirits_and_the_Supernatural_-_pic18_-_%E5%BD%A2%E5%A4%A9%E5%9C%96.png/600px-Imperial_Encyclopaedia_-_Spirits_and_the_Supernatural_-_pic18_-_%E5%BD%A2%E5%A4%A9%E5%9C%96.png",
                "title": "《古今图书集成》神异典·形天战神真容",
                "source": "武英殿聚珍版",
                "is_cover": False,
            },
        ],
    },
    {
        "id": "taotie",
        "name": "饕餮",
        "pinyin": "tāo tiè",
        "title": "钩吾凶神 · 吞天狍鸮",
        "category": "上古四凶",
        "mountain": "《北山经》· 钩吾之山",
        "classic_quote": "钩吾之山，其上多玉，其下多铜。有兽焉，其状如羊身人面，其目在腋下，虎齿人爪，其音如婴儿，名曰狍鸮，是食人。",
        "modern_desc": "山海经本名狍鸮，四凶之一。羊躯人面，目藏双腋之下，虎齿钢爪。贪暴嗜食，能吞天地万物。商周青铜鼎彝常刻其威严神纹用以镇煞。",
        "ability": "吞噬万物、摄魂威慑、青铜镇邪、凶威滔天",
        "tags": ["上古四凶", "钩吾山", "目在腋下", "羊身人面", "吞噬万象"],
        "images": [
            {
                "id": "img_tt_1",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Liu_Ding_part.jpg/600px-Liu_Ding_part.jpg",
                "title": "商周青铜重器·神秘饕餮神面原纹",
                "source": "中国国家博物馆",
                "is_cover": True,
            },
            {
                "id": "img_tt_2",
                "url": "https://upload.wikimedia.org/wikipedia/commons/8/8d/Han_Bronze_Door_Knocker_Taotie_Face.jpg",
                "title": "汉代青铜饕餮衔环铺首像",
                "source": "故宫博物院藏品",
                "is_cover": False,
            },
        ],
    },
    {
        "id": "baize",
        "name": "白泽",
        "pinyin": "bái zé",
        "title": "昆仑德兽 · 万象通晓",
        "category": "瑞兽",
        "mountain": "《海内经》轶传 / 《白泽精怪图》",
        "classic_quote": "东望山有兽，名曰白泽，能言语，达万物之情，通万物之貌。黄帝巡狩至海滨，白泽出，帝令图写之以示天下。",
        "modern_desc": "至圣祥瑞神兽，生有重瞳异角，通晓世间万国人言。洞悉天下精怪一万一千五百二十种之名讳形貌与克制之道，黄帝尊其为天相圣兽。",
        "ability": "洞悉万物名貌、禳灾辟易百鬼、通人言晓阴阳、趋吉避凶",
        "tags": ["昆仑圣兽", "白泽图", "万象皆知", "辟邪禳灾", "百鬼克星"],
        "images": [
            {
                "id": "img_bz_1",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Gusukuma_Portrait_of_the_Sacred_Beast_Baize.jpg/600px-Gusukuma_Portrait_of_the_Sacred_Beast_Baize.jpg",
                "title": "宫廷秘藏传世绢本·《白泽之图》真迹",
                "source": "古琉球王府藏画",
                "is_cover": True,
            },
            {
                "id": "img_bz_2",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/SekienHakutaku.jpg/400px-SekienHakutaku.jpg",
                "title": "鸟山石燕经典笔录《白泽神兽像》",
                "source": "古典珍本绘本",
                "is_cover": False,
            },
            {
                "id": "img_bz_3",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Pelliot_chinois_2682.jpg/600px-Pelliot_chinois_2682.jpg",
                "title": "法国国家图书馆藏敦煌遗书 P.2682《白泽精怪图》唐写本",
                "source": "敦煌藏经洞手卷",
                "is_cover": False,
            },
        ],
    },
    {
        "id": "qiongqi",
        "name": "穷奇",
        "pinyin": "qióng qí",
        "title": "邽山凶虎 · 飞翼煞星",
        "category": "上古四凶",
        "mountain": "《西山经》· 邽山 / 《海内北经》",
        "classic_quote": "邽山，其上有兽焉，其状如虎，猬毛，名曰穷奇，音如嗥狗，是食人。穷奇状如虎，有翼，食人从首始，所食被发。",
        "modern_desc": "西方邽山凶煞异兽，外形如同一只生有双翼的玄虎，毛发坚韧如钢针猬刺，叫声如恶犬长嗥。性喜惩善扬恶，为四凶中最为凌厉的空中捕猎者。",
        "ability": "凌空扑袭、钢刺猬毛、摄杀煞气、凶威压世",
        "tags": ["上古四凶", "邽山之兽", "生翼玄虎", "猬毛刚刺", "食人从首"],
        "images": [
            {
                "id": "img_qq_1",
                "url": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Shan_Hai_Jing_Qiongji.jpg",
                "title": "《山海经》刻本古图·飞天凶虎穷奇",
                "source": "明代《山海经图》",
                "is_cover": True,
            },
            {
                "id": "img_qq_2",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Imperial_Encyclopaedia_-_Animal_Kingdom_-_pic186_-_%E7%AA%AE%E5%A5%87%E5%9C%96.png/600px-Imperial_Encyclopaedia_-_Animal_Kingdom_-_pic186_-_%E7%AA%AE%E5%A5%87%E5%9C%96.png",
                "title": "《古今图书集成》禽虫典·穷奇双翼灵兽图",
                "source": "清代官修大典",
                "is_cover": False,
            },
        ],
    },
    {
        "id": "bifang",
        "name": "毕方",
        "pinyin": "bì fāng",
        "title": "章莪火灵 · 独足神禽",
        "category": "神禽异鸟",
        "mountain": "《西山经》· 章莪之山",
        "classic_quote": "章莪之山，有鸟焉，其状如鹤，一足，赤文青质而白喙，名曰毕方，其鸣自叫也，见则其邑有讹火。",
        "modern_desc": "火神祝融的乘骑侍禽。形似青色神鹤却只生单足，青翠羽翼间密布朱砂烈火纹章，喙洁如雪。鸣声自呼其名“毕方——”，现世则引天降灵火。",
        "ability": "御天火、聚炽焰、单足踏焰、木生火灵",
        "tags": ["章莪山", "独足青鹤", "引天火", "祝融侍禽", "赤文青羽"],
        "images": [
            {
                "id": "img_bf_1",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Imperial_Encyclopaedia_-_Animal_Kingdom_-_pic113_-_%E7%95%A2%E6%96%B9%E5%9C%96.svg/600px-Imperial_Encyclopaedia_-_Animal_Kingdom_-_pic113_-_%E7%95%A2%E6%96%B9%E5%9C%96.svg.png",
                "title": "《古今图书集成》禽虫典·毕方独足神鸟全图",
                "source": "文渊阁藏本图录",
                "is_cover": True,
            },
            {
                "id": "img_bf_2",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Wu-Renchen-Shanhai-jing-guangzhu-Bifang.jpg/500px-Wu-Renchen-Shanhai-jing-guangzhu-Bifang.jpg",
                "title": "吴任臣《山海经广注》清初珍本·毕方图刻",
                "source": "清康熙刻本",
                "is_cover": False,
            },
        ],
    },
    {
        "id": "yinglong",
        "name": "应龙",
        "pinyin": "yìng lóng",
        "title": "创世真龙 · 双翼战祖",
        "category": "创世神祇",
        "mountain": "《大荒东经》· 凶犁土丘",
        "classic_quote": "大荒东北隅有山，名曰凶犁土丘。应龙处南极，杀蚩尤与夸父，不得复上，故下数旱。旱而为应龙之状，乃得大雨。",
        "modern_desc": "华夏神话中具翼之祖龙。助轩辕黄帝斩蚩尤平九黎，又助大禹开山治水，以龙尾画地成江河，引洪入沧海。翻云覆雨，神威无匹。",
        "ability": "布云施雨、御雷破空、龙尾划江、战阵降魔",
        "tags": ["凶犁土丘", "生翼应龙", "助禹治水", "司掌风雨", "战祖真龙"],
        "images": [
            {
                "id": "img_yl_1",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Shan_Hai_Jing_Yinglong.jpg/500px-Shan_Hai_Jing_Yinglong.jpg",
                "title": "《山海经》典藏版画·应龙腾云展翅像",
                "source": "古籍雕版原图",
                "is_cover": True,
            },
            {
                "id": "img_yl_2",
                "url": "https://upload.wikimedia.org/wikipedia/commons/b/be/Wakan_Sansai_Zue_-_Oryu.jpg",
                "title": "《和汉三才图会》卷之四十一·双翼应龙法相图",
                "source": "传统百科全书绘本",
                "is_cover": False,
            },
            {
                "id": "img_yl_3",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/%E5%BA%94%E9%BE%99.jpg/600px-%E5%BA%94%E9%BE%99.jpg",
                "title": "历代帝陵石刻与典籍·应龙潜渊图",
                "source": "传世碑刻典籍",
                "is_cover": False,
            },
        ],
    },
    {
        "id": "dijiang",
        "name": "帝江",
        "pinyin": "dì jiāng",
        "title": "天山神明 · 浑敦仙乐",
        "category": "异兽",
        "mountain": "《西山经》· 天山",
        "classic_quote": "有神焉，其状如黄囊，赤如丹火，六足四翼，浑敦无面目，是识歌舞，实惟帝江也。",
        "modern_desc": "西方天山神圣，宛若一轮赤红丹火凝聚之球囊，生有六足与四副羽翼。虽无七窍面目，却极通灵犀，精通天地旋律，能踏空起舞。",
        "ability": "浑沌大道、御空翔舞、天籁之音、造化初元",
        "tags": ["天山", "六足四翼", "浑敦无面目", "通晓歌舞", "丹火仙囊"],
        "images": [
            {
                "id": "img_dj_1",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/%E8%A5%BF%E5%B1%B1%E7%B6%93-%E5%B8%9D%E6%B1%9F.svg/600px-%E8%A5%BF%E5%B1%B1%E7%B6%93-%E5%B8%9D%E6%B1%9F.svg.png",
                "title": "《西山经》清代彩绘善本·神明帝江图",
                "source": "典籍精绘插图",
                "is_cover": True,
            },
            {
                "id": "img_dj_2",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Imperial_Encyclopaedia_-_Spirits_and_the_Supernatural_-_pic19_-_%E5%B8%9D%E6%B1%9F%E7%A5%9E%E5%9C%96.png/600px-Imperial_Encyclopaedia_-_Spirits_and_the_Supernatural_-_pic19_-_%E5%B8%9D%E6%B1%9F%E7%A5%9E%E5%9C%96.png",
                "title": "《古今图书集成》神异典·帝江神尊原刻",
                "source": "清康熙铜活字本",
                "is_cover": False,
            },
        ],
    },
    {
        "id": "jingwei",
        "name": "精卫",
        "pinyin": "jīng wèi",
        "title": "发鸠义鸟 · 矢志填海",
        "category": "神禽异鸟",
        "mountain": "《北山经》· 发鸠之山",
        "classic_quote": "发鸠之山，有鸟焉，其状如乌，文首，白喙，赤足，名曰精卫，其鸣自詨。是炎帝之少女，名曰女娃。女娃游于东海，溺而不返，故为精卫，常衔西山之木石，以堙于东海。",
        "modern_desc": "炎帝稚女溺于东海，精魂化作神鸟。生有五彩花纹之额，洁白喙喙，赤红双爪。衔西山木石誓填汪洋，成为中华民族百折不挠的象征。",
        "ability": "誓志不磨、衔石破浪、炎帝仙脉、万死不辞",
        "tags": ["发鸠山", "精卫填海", "炎帝少女", "文首白喙", "坚毅不拔"],
        "images": [
            {
                "id": "img_jw_1",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/%E4%B8%89%E6%89%8D%E5%9C%96%E6%9C%83_13%E9%B8%9F%E5%85%BD_%E7%B2%BE%E5%8D%AB.svg/500px-%E4%B8%89%E6%89%8D%E5%9C%96%E6%9C%83_13%E9%B8%9F%E5%85%BD_%E7%B2%BE%E5%8D%AB.svg.png",
                "title": "明代王圻《三才图会》鸟兽十三卷·精卫神鸟像",
                "source": "明万历原刊本",
                "is_cover": True,
            },
            {
                "id": "img_jw_2",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Tianjin_railway_station_ceiling_0857.jpg/800px-Tianjin_railway_station_ceiling_0857.jpg",
                "title": "大型古典穹顶壁画·《精卫填海》悲壮史诗图",
                "source": "艺术壁画摄影集",
                "is_cover": False,
            },
        ],
    },
    {
        "id": "kui",
        "name": "夔牛",
        "pinyin": "kuí niú",
        "title": "流波雷兽 · 鼓震五百里",
        "category": "异兽",
        "mountain": "《大荒东经》· 流波之山",
        "classic_quote": "东海中有流波山，入海七千里。其上有兽，状如牛，苍身而无角，一足，出入水则必风雨，其光如日月，其声如雷，其名曰夔。黄帝得之，以其皮为鼓，橛以雷兽之骨，声闻五百里，以威天下。",
        "modern_desc": "东海流波仙山上的独足雷神座兽。苍青色无角如硕牛，入海则狂风骤雨齐至，二目闪耀如悬日月，吼声若惊雷炸裂。黄帝制其皮为神鼓以震退蚩尤。",
        "ability": "召唤狂风暴雨、目若日月、声震五百里、雷霆天威",
        "tags": ["流波山", "一足雷兽", "苍身无角", "夔牛神鼓", "声如雷霆"],
        "images": [
            {
                "id": "img_kui_1",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Wu-Renchen-Shanhai-jing-guangzhu-Kui.jpg/500px-Wu-Renchen-Shanhai-jing-guangzhu-Kui.jpg",
                "title": "吴任臣《山海经广注》清刻本·流波山夔牛全图",
                "source": "清康熙刻本",
                "is_cover": True,
            },
            {
                "id": "img_kui_2",
                "url": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Shan_Hai_Jing_Kui.jpg",
                "title": "古刻《山海经图》·独足青身夔兽像",
                "source": "传世木刻版画",
                "is_cover": False,
            },
        ],
    },
    {
        "id": "luwu",
        "name": "开明兽 / 陆吾",
        "pinyin": "kāi míng shòu / lù wú",
        "title": "昆仑司都 · 天门九首天卫",
        "category": "镇山神兽",
        "mountain": "《海内西经》/《西山经》· 昆仑之丘",
        "classic_quote": "昆仑南渊深三百仞。开明兽身大类虎而九首，皆人面，东向立昆仑上。神陆吾司之，其神状虎身而九尾，人面而虎爪，司天之九部及帝之囿时。",
        "modern_desc": "昆仑帝之下都第一天卫。虎躯而长九颗人面首级，目空四海，威慑天界九门。又作陆吾天神，虎躯九尾人面，代天帝镇守天界苑圃九野。",
        "ability": "九面观八荒、守御天门、虎威荡秽、镇守昆仑",
        "tags": ["昆仑之丘", "开明兽", "陆吾神", "九首人面", "天门禁卫"],
        "images": [
            {
                "id": "img_lw_1",
                "url": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Shan_Hai_Jing_Kaimeiju.jpg",
                "title": "古版《山海经图》·昆仑九首开明兽",
                "source": "明代古版木刻",
                "is_cover": True,
            },
            {
                "id": "img_lw_2",
                "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Imperial_Encyclopaedia_-_Spirits_and_the_Supernatural_-_pic17_-_%E9%99%B8%E5%90%BE%E7%A5%9E%E5%9C%96.png/600px-Imperial_Encyclopaedia_-_Spirits_and_the_Supernatural_-_pic17_-_%E9%99%B8%E5%90%BE%E7%A5%9E%E5%9C%96.png",
                "title": "《古今图书集成》神异典·昆仑司都陆吾天神图",
                "source": "故宫文渊阁藏典",
                "is_cover": False,
            },
        ],
    },
]


# ── 数据持久化辅助函数 ─────────────────────────────────────────────────


def _ensure_data_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    if not CHARACTERS_FILE.exists():
        data = [ShanhaiCharacter(**item).model_dump(mode="json") for item in DEFAULT_CHARACTERS]
        CHARACTERS_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _load_characters() -> List[ShanhaiCharacter]:
    _ensure_data_dir()
    try:
        content = CHARACTERS_FILE.read_text(encoding="utf-8")
        raw_list = json.loads(content)
        return [ShanhaiCharacter(**item) for item in raw_list]
    except Exception:
        # 若读取异常则回退默认
        return [ShanhaiCharacter(**item) for item in DEFAULT_CHARACTERS]


def _save_characters(characters: List[ShanhaiCharacter]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    data = [c.model_dump(mode="json") for c in characters]
    CHARACTERS_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# ── 在线网络图片检索模块（支持 Wikipedia / Wikimedia 跨源检索） ───────


def search_web_images_for_character(keyword: str, max_count: int = 3) -> List[dict]:
    """从网络检索 1-3 张山海经角色相关的高清图片。

    优先通过中文维基百科的媒体列表抓取历史文物/古籍插画，
    若不足则补充检索维基媒体共享资源（Wikimedia Commons）。
    """
    headers = {
        "User-Agent": "ShanhaijingApp/1.0 (https://agent-platform; contact: platform@agent.local)",
        "Accept": "application/json, text/plain, */*",
    }
    found_urls = set()
    results: List[dict] = []

    # 1. 尝试维基百科 media-list API
    search_terms = [keyword]
    if " " in keyword:
        search_terms.extend(keyword.split())
    if not keyword.startswith("山海经"):
        search_terms.append(f"山海经 {keyword}")

    for term in search_terms:
        if len(results) >= max_count:
            break
        try:
            encoded = urllib.parse.quote(term.strip())
            url = f"https://zh.wikipedia.org/api/rest_v1/page/media-list/{encoded}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=6) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for item in data.get("items", []):
                    if item.get("type") == "image":
                        title = item.get("title", "")
                        lower = title.lower()
                        # 过滤非角色插图的常见 UI 图标、旗帜、地图、占位图
                        if any(bad in lower for bad in ["logo", "icon", "stub", "flag", "arrow", "question", "map"]):
                            continue
                        srcs = item.get("srcset", [])
                        if not srcs:
                            continue
                        img_url = srcs[-1].get("src", "")
                        if img_url.startswith("//"):
                            img_url = f"https:{img_url}"
                        if img_url and img_url not in found_urls:
                            found_urls.add(img_url)
                            clean_title = title.replace("File:", "").replace(".jpg", "").replace(".png", "").replace(".svg", "").replace("_", " ")
                            results.append({
                                "id": hashlib.md5(img_url.encode()).hexdigest()[:8],
                                "url": img_url,
                                "title": f"《山海经》网络典藏 · {clean_title[:30]}",
                                "source": "网络百科典籍库",
                                "is_cover": len(results) == 0,
                            })
                            if len(results) >= max_count:
                                break
        except Exception:
            continue

    # 2. 如果结果未满，尝试维基媒体 Commons 搜索
    if len(results) < max_count:
        try:
            query_str = f"山海经 {keyword}"
            encoded = urllib.parse.quote(query_str)
            url = (
                f"https://commons.wikimedia.org/w/api.php?action=query&generator=search"
                f"&gsrsearch={encoded}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json"
            )
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=6) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                pages = data.get("query", {}).get("pages", {})
                for page in pages.values():
                    raw_title = page.get("title", "")
                    if any(ext in raw_title.lower() for ext in [".jpg", ".png", ".jpeg", ".webp"]):
                        info = page.get("imageinfo", [{}])[0]
                        img_url = info.get("url")
                        if img_url and img_url not in found_urls:
                            found_urls.add(img_url)
                            clean_title = raw_title.replace("File:", "").replace("_", " ")
                            results.append({
                                "id": hashlib.md5(img_url.encode()).hexdigest()[:8],
                                "url": img_url,
                                "title": f"网络检索文物图谱 · {clean_title[:30]}",
                                "source": "维基媒体共享库",
                                "is_cover": len(results) == 0,
                            })
                            if len(results) >= max_count:
                                break
        except Exception:
            pass

    return results


# ── HTTP 端点路由 ─────────────────────────────────────────────────────


@router.get("/categories")
def get_categories():
    """获取山海经专栏分类与山系分布统计。"""
    chars = _load_characters()
    categories = sorted(list({c.category for c in chars if c.category}))
    mountains = sorted(list({c.mountain.split("·")[0].strip() for c in chars if c.mountain}))
    total_images = sum(len(c.images) for c in chars)
    return _ok({
        "categories": categories,
        "mountains": mountains,
        "stats": {
            "total_characters": len(chars),
            "total_images": total_images,
            "category_counts": {cat: sum(1 for c in chars if c.category == cat) for cat in categories},
        },
    })


@router.get("/characters")
def list_characters(
    category: Optional[str] = Query(None, description="分类筛选（如瑞兽、上古四凶、神禽异鸟等）"),
    mountain: Optional[str] = Query(None, description="山系经卷筛选（如南山经、西山经、海外经等）"),
    query: Optional[str] = Query(None, description="按名字、拼音、典籍古文检索"),
):
    """GET /characters：查询山海经专栏角色列表。"""
    chars = _load_characters()

    filtered = chars
    if category and category != "全部":
        filtered = [c for c in filtered if c.category == category]
    if mountain and mountain != "全部":
        filtered = [c for c in filtered if mountain in c.mountain]
    if query:
        q = query.strip().lower()
        filtered = [
            c
            for c in filtered
            if q in c.name.lower()
            or q in c.pinyin.lower()
            or q in c.classic_quote.lower()
            or q in c.modern_desc.lower()
            or any(q in t.lower() for t in c.tags)
        ]

    return _ok([c.model_dump(mode="json") for c in filtered])


@router.get("/characters/{char_id}")
def get_character(char_id: str):
    """GET /characters/{char_id}：获取单个山海经角色详情。"""
    _validate(char_id)
    chars = _load_characters()
    found = next((c for c in chars if c.id == char_id), None)
    if not found:
        raise HTTPException(status_code=404, detail=f"山海角色未找到: {char_id}")
    return _ok(found.model_dump(mode="json"))


@router.post("/characters")
def create_character(body: CharacterCreateRequest):
    """POST /characters：新增山海经角色（支持根据名称自动从网上检索1~3张图片）。"""
    chars = _load_characters()
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="角色名称不能为空")

    char_id = body.id or re.sub(r"[^a-zA-Z0-9_]+", "", body.pinyin.lower().replace(" ", "_")) or hashlib.md5(name.encode()).hexdigest()[:8]
    _validate(char_id)

    if any(c.id == char_id for c in chars):
        raise HTTPException(status_code=409, detail=f"角色标识已存在: {char_id}")

    images = list(body.images)
    # 若勾选自动从网上检索图片且当前无图片
    if body.auto_fetch_images or not images:
        fetched = search_web_images_for_character(name, max_count=3)
        for item in fetched:
            images.append(CharacterImage(**item))

    new_char = ShanhaiCharacter(
        id=char_id,
        name=name,
        pinyin=body.pinyin,
        title=body.title or f"山海异兽 · {name}",
        category=body.category or "异兽",
        mountain=body.mountain or "《山海经》大荒遗卷",
        classic_quote=body.classic_quote,
        modern_desc=body.modern_desc,
        ability=body.ability,
        mortal_identity=body.mortal_identity or "",
        divine_form=body.divine_form or "",
        visual_prompt=body.visual_prompt or "",
        images=images,
        tags=body.tags or [name, body.category],
    )
    chars.append(new_char)
    _save_characters(chars)
    return _ok(new_char.model_dump(mode="json"))


@router.put("/characters/{char_id}")
def update_character(char_id: str, body: CharacterUpdateRequest):
    """PUT /characters/{char_id}：更新山海经角色资料或图片。"""
    _validate(char_id)
    chars = _load_characters()
    idx = next((i for i, c in enumerate(chars) if c.id == char_id), -1)
    if idx == -1:
        raise HTTPException(status_code=404, detail=f"角色未找到: {char_id}")

    current = chars[idx]
    update_data = body.model_dump(exclude_unset=True)

    if "images" in update_data and update_data["images"] is not None:
        update_data["images"] = [CharacterImage(**img) for img in update_data["images"]]

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    updated = current.model_copy(update=update_data)
    chars[idx] = updated
    _save_characters(chars)
    return _ok(updated.model_dump(mode="json"))


@router.delete("/characters/{char_id}")
def delete_character(char_id: str):
    """DELETE /characters/{char_id}：删除指定山海经角色。"""
    _validate(char_id)
    chars = _load_characters()
    idx = next((i for i, c in enumerate(chars) if c.id == char_id), -1)
    if idx == -1:
        raise HTTPException(status_code=404, detail=f"角色未找到: {char_id}")

    removed = chars.pop(idx)
    _save_characters(chars)
    return _ok({"deleted": char_id, "name": removed.name})


@router.post("/characters/{char_id}/fetch-web-images")
def fetch_character_web_images(
    char_id: str,
    count: int = Query(3, ge=1, le=5, description="检索图片数量（1-3张）"),
    apply_to_character: bool = Query(True, description="是否直接保存到该角色的画廊中"),
):
    """为指定角色从网上检索 1-3 张图片，并可一键存入专栏中。"""
    _validate(char_id)
    chars = _load_characters()
    idx = next((i for i, c in enumerate(chars) if c.id == char_id), -1)
    if idx == -1:
        raise HTTPException(status_code=404, detail=f"角色未找到: {char_id}")

    char = chars[idx]
    images = search_web_images_for_character(char.name, max_count=count)
    if not images:
        # 尝试使用拼音或标签扩大搜索
        for tag in char.tags:
            images = search_web_images_for_character(tag, max_count=count)
            if images:
                break

    if apply_to_character and images:
        existing_urls = {img.url for img in char.images}
        new_images = list(char.images)
        for item in images:
            if item["url"] not in existing_urls:
                new_images.append(CharacterImage(**item))
        # 确保只有一张封面
        has_cover = any(img.is_cover for img in new_images)
        if not has_cover and new_images:
            new_images[0].is_cover = True

        char = char.model_copy(update={
            "images": new_images,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
        chars[idx] = char
        _save_characters(chars)

    return _ok({
        "character_id": char_id,
        "name": char.name,
        "retrieved_count": len(images),
        "images": images,
        "character": char.model_dump(mode="json"),
    })


@router.get("/search-web-images")
def search_web_images(
    query: str = Query(..., description="要检索的山海经角色或神兽名称"),
    count: int = Query(3, ge=1, le=5, description="检索图片数量"),
):
    """GET /search-web-images：自由从网上检索 1-3 张山海经相关图片。"""
    q = query.strip()
    if not q:
        raise HTTPException(status_code=400, detail="检索词不能为空")
    images = search_web_images_for_character(q, max_count=count)
    return _ok({
        "query": q,
        "count": len(images),
        "images": images,
    })


@router.get("/image-proxy")
def image_proxy(url: str = Query(..., description="需要代理加载的网络图片 URL")):
    """GET /image-proxy：图片代理与本地缓存服务。

    避免外部图床防盗链（Referer限制）或跨域拦截，确保专栏中所有网络图片稳定渲染。
    """
    if not url.startswith("http://") and not url.startswith("https://"):
        raise HTTPException(status_code=400, detail="非法 URL 协议")

    # 本地缓存判定
    url_hash = hashlib.sha256(url.encode()).hexdigest()
    cached_file = CACHE_DIR / f"{url_hash}.bin"
    meta_file = CACHE_DIR / f"{url_hash}.json"

    if cached_file.exists() and meta_file.exists():
        try:
            meta = json.loads(meta_file.read_text(encoding="utf-8"))
            content_type = meta.get("content_type", "image/jpeg")
            data = cached_file.read_bytes()
            return Response(
                content=data,
                media_type=content_type,
                headers={"Cache-Control": "public, max-age=604800"},
            )
        except Exception:
            pass

    # 发起服务端请求
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://zh.wikipedia.org/",
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = resp.read()
            content_type = resp.headers.get("Content-Type", "image/jpeg")

            # 写入缓存
            try:
                CACHE_DIR.mkdir(parents=True, exist_ok=True)
                cached_file.write_bytes(data)
                meta_file.write_text(json.dumps({"content_type": content_type}), encoding="utf-8")
            except Exception:
                pass

            return Response(
                content=data,
                media_type=content_type,
                headers={"Cache-Control": "public, max-age=604800"},
            )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"图片代理拉取失败: {e}")


@router.post("/reset-defaults")
def reset_default_characters():
    """POST /reset-defaults：重置为系统预设的 12 位典籍经典角色与全量图片。"""
    defaults = [ShanhaiCharacter(**item) for item in DEFAULT_CHARACTERS]
    _save_characters(defaults)
    return _ok({
        "message": "已重置为系统预设山海经专栏角色",
        "count": len(defaults),
    })
