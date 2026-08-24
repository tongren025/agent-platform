"""漫剧生产提示词静态质量门禁回归测试。"""
from app.services.production_quality import evaluate_production_draft


def _codes(stage: str, content: str) -> set[str]:
    """返回指定草稿触发的问题代码。"""
    return {item["code"] for item in evaluate_production_draft(stage, "G1 测试", content, [])}


def test_storyboard_rejects_one_line_abstract_summary():
    """抽象的一句话分镜必须被拦截，不能再自动标为完成。"""
    codes = _codes("storyboard", "环境主导，角色欲言又止，场景自行演进。")
    assert "abstract_visual" in codes
    assert "storyboard_fields_missing" in codes


def test_complete_storyboard_fields_pass_static_gate():
    """含连续性与画面分层字段的逐镜分镜可通过静态字段检查。"""
    content = (
        "前景：门框；中景：R3 位于画面左下；背景：巷口。\n"
        "画面位置：左下；起始姿态：右膝跪地；动作：右手抬起；"
        "结束姿态：右手护胸；视线方向：画面右侧。"
    )
    assert _codes("storyboard", content) == set()


def test_image_prompt_flags_negative_language_and_texture_overload():
    """正向提示词混入负向表达或堆叠高频纹理时必须返工。"""
    codes = _codes("img_prompt", "不要噪点，避免裂纹，碎石、锁链、锈迹、尘埃、粒子铺满背景")
    assert "negative_language" in codes
    assert "visual_noise_risk" in codes


def test_video_prompt_rejects_unstable_words_and_over_six_seconds():
    """视频生成段超过 6 秒或使用高风险运动词时必须返工。"""
    codes = _codes("vid_prompt", "[00:00-00:14] 角色快速转身，镜头推进")
    assert "segment_too_long" in codes
    assert "unstable_motion" in codes


def test_clean_six_second_video_segment_passes():
    """正向、单运镜、6 秒内的连续动作不应误报。"""
    assert _codes("vid_prompt", "[00:00-00:06] 右手缓慢抬至胸前。运镜：固定(static)。") == set()
def test_controlled_ten_second_video_segment_passes():
    """有逐秒时间轴的连续表演镜头可使用当前模型支持的 7~15 秒档位。"""
    content = (
        "【时间轴】[00:00-00:04] 角色起身；"
        "[00:04-00:10] 中近景缓慢推进，角色低声说出台词。"
    )
    assert "segment_too_long" not in _codes("vid_prompt", content)


def test_video_segment_over_fifteen_seconds_still_fails_with_timeline():
    """即使带时间轴，当前视频接口也不能提交超过 15 秒的单段。"""
    codes = _codes(
        "vid_prompt",
        "【时间轴】[00:00-00:16] 角色连续表演，镜头缓慢推进。",
    )
    assert "segment_too_long" in codes
