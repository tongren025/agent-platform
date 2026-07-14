"""现有分镜深化迁移器的结构与语义回归测试。"""
from scripts.rewrite_storyboards_v2 import rewrite_storyboard_content


SAMPLE = """G2 废墟·强者登场 | 生成2s | 1段（「镜头N」分段≤6s）
首帧：e01_u2.png→e01_u2.mp4|强度强
镜头1 ｜00:18-00:20｜2s
景别·机位：特写 / 正面平视
画面：他手指在龙鳞上无意识轻叩|脸/手/物细节占满画幅|神情落在「慵懒」上
调度：他静态调度·面向左侧·镜头固定
运镜：固定(static)
光影：暖光落指节·主光45°侧位·暖色低色温
音效：指叩鳞甲｜转场：天际线亮起→切镜头2
目标：一次生成全部可用(零丢弃)
"""


def test_rewrite_adds_production_level_storyboard_fields():
    """迁移后必须包含空间、逐时动作、首末姿态、轴线与逐镜生成边界。"""
    result, count = rewrite_storyboard_content(SAMPLE)
    assert count == 1
    for field in (
        "空间分层", "前景", "中景", "背景", "画面位置", "起始姿态", "分时动作",
        "结束姿态", "屏幕方向与轴线", "独立生成2s", "生成验收",
    ):
        assert field in result


def test_rewrite_removes_abstract_filler_and_zero_discard_promise():
    """旧模板的抽象填充句和不现实的零丢弃承诺不得进入新版正文。"""
    result, _ = rewrite_storyboard_content(SAMPLE)
    assert "神情落在" not in result
    assert "自行演进" not in result
    assert "一次生成全部可用" not in result
    assert "不承诺“零丢弃”" in result


def test_hand_action_contains_joint_level_timing():
    """手部镜头必须深化到肩、肘、腕和指尖的动作传递。"""
    result, _ = rewrite_storyboard_content(SAMPLE)
    assert "肩到肘、再到腕和指尖" in result
    assert "指尖与目标发生一次明确接触" in result


def test_script_action_replaces_conceptual_storyboard_summary():
    """同 G 剧本中的可见动作必须覆盖“题眼/伏笔”等概念化分镜摘要。"""
    overrides = {
        "00:18-00:20": {
            "action": "少年右手食指在第三排龙鳞上轻叩两次",
            "dialogue": "（无）", "camera": "固定(static)",
            "audio": "两次指叩", "lighting": "暖光落在右手指节",
        }
    }
    result, _ = rewrite_storyboard_content(SAMPLE, overrides)
    assert "少年右手食指在第三排龙鳞上轻叩两次" in result
    assert "神情落在" not in result


def test_unreadable_wide_face_action_is_corrected_to_close_shot():
    """半脸、眼部等细节动作不能继续沿用广景或中景。"""
    sample = SAMPLE.replace("特写 / 正面平视", "广 / 正面平视").replace(
        "他手指在龙鳞上无意识轻叩", "锁定红光扫过苍霖半张脸"
    )
    result, _ = rewrite_storyboard_content(sample)
    assert "景别·机位：近景 / 正面平视" in result
    assert "由原景别“广 / 正面平视”修正" in result


def test_expression_is_not_misused_as_background_layer():
    """表情与情绪说明属于主体表演，不能被误当成空间背景。"""
    sample = SAMPLE.replace(
        "脸/手/物细节占满画幅|神情落在「慵懒」上",
        "脸/手/物细节占满画幅|嘴角挑起玩味弧度·眼神懒散",
    )
    result, _ = rewrite_storyboard_content(sample)
    assert "- 背景：嘴角挑起玩味弧度·眼神懒散" not in result
    assert "- 背景：延续上一镜永久地标与光源方向" in result


def test_dialogue_with_hand_action_has_staggered_performance_timing():
    """边说边做手部动作时，手和口型必须错峰启动并在句末共同落点。"""
    overrides = {
        "00:18-00:20": {
            "action": "他用手指沿铭文划过并开口",
            "dialogue": "这一笔，该还了。", "camera": "固定(static)",
            "audio": "指尖摩擦石面", "lighting": "暖光落在指尖",
        }
    }
    result, _ = rewrite_storyboard_content(SAMPLE, overrides)
    assert "手部启动早于第一字" in result
    assert "最后一字落下时指尖同时停在明确落点" in result
    assert "。。" not in result


def test_trigger_word_is_not_misread_as_hand_contact():
    """“触发/触动”属于状态变化，不能因为含“触”字生成手指关节动作。"""
    sample = SAMPLE.replace("他手指在龙鳞上无意识轻叩", "海底震动，重启协议被触发")
    result, _ = rewrite_storyboard_content(sample)
    assert "肩到肘、再到腕和指尖" not in result
    assert "主体与焦点：海底" in result


def test_object_pointing_at_them_keeps_object_as_subject():
    """“转向他们”中的代词不能盖过句首的明确装置主体。"""
    sample = SAMPLE.replace("他手指在龙鳞上无意识轻叩", "封锁圈内火箭炮塔转向他们")
    result, _ = rewrite_storyboard_content(sample)
    assert "主体与焦点：火箭炮塔" in result
    assert "主体与焦点：苍霖" not in result


def test_theme_sentence_is_not_used_as_physical_background():
    """“秩序遇上体温”等主题句不可作为图像模型的背景空间描述。"""
    sample = SAMPLE.replace(
        "脸/手/物细节占满画幅|神情落在「慵懒」上",
        "主体清楚|白城的绝对秩序遇上活物的体温",
    )
    result, _ = rewrite_storyboard_content(sample)
    assert "- 背景：白城的绝对秩序遇上活物的体温" not in result
    assert "- 背景：延续上一镜永久地标与光源方向" in result
