"""生产就绪度回归测试：防止“文案卡 done”再次被误报为成片 100%。"""
from app.api.production import _compute_readiness, _compute_stats, _compute_story_preview
from app.models.production import ProductionCard


def _card(stage: str, unit: int, *, images=None, videos=None, status="done") -> ProductionCard:
    """构造同一集的最小 G 单元卡片。"""
    return ProductionCard(
        project_id="demo", stage=stage, episode=1, shot_number=unit,
        images=images or [], videos=videos or [], status=status,
    )


def test_done_spec_cards_are_not_reported_as_delivery_complete():
    """四阶段文案齐全但没有图/视频时，就绪度只能是 40%，不能是 100%。"""
    cards = [_card(stage, 1) for stage in ("script", "storyboard", "img_prompt", "vid_prompt")]
    stats = _compute_stats(cards)
    assert stats["card_status_progress"] == 100
    assert stats["overall_progress"] == 40
    assert stats["readiness"]["next_action"] == "还差 1 个镜头画面"


def test_readiness_exposes_blockers_and_next_action():
    """缺少必需规格时优先提示修复断链，而不是催促出图。"""
    cards = [_card("script", 1), _card("storyboard", 1), _card("script", 2)]
    readiness = _compute_readiness(cards)
    assert readiness["units"] == 2
    assert readiness["blockers"] == 2
    assert readiness["next_action"] == "补齐 2 个镜头的制作信息"


def test_full_unit_reaches_one_hundred_percent():
    """规格、图、视频和交付卡都齐全时才达到 100%。"""
    cards = [_card(stage, 1) for stage in ("script", "storyboard", "img_prompt", "vid_prompt")]
    cards += [_card("img_gen", 1, images=["a.png"]), _card("vid_gen", 1, videos=["a.mp4"]), _card("final", 1)]
    readiness = _compute_readiness(cards)
    assert readiness["overall_progress"] == 100
    assert readiness["next_action"] == "成片已经可以交付"


def test_gc_units_without_episode_are_still_counted():
    """旧 GC 把镜头挂在全局层；episode 为空也必须按真实镜头统计。"""
    cards = [
        ProductionCard(
            project_id="gc-demo",
            stage=stage,
            episode=None,
            shot_number=1,
            status="done",
            images=["frame.png"] if stage == "img_prompt" else [],
        )
        for stage in ("script", "storyboard", "img_prompt", "vid_prompt")
    ]
    readiness = _compute_readiness(cards)
    assert readiness["units"] == 1
    assert readiness["image_rate"] == 100
    assert readiness["next_action"] == "还差 1 个镜头视频"


def test_story_preview_expands_multi_panel_storyboards():
    """同一剧情镜头的 A/B 两张制片故事板都要展示，不能只取第一张。"""
    cards = [
        ProductionCard(
            project_id="gc-demo",
            stage="storyboard",
            episode=None,
            shot_number=5,
            status="done",
            images=["g5-a.png", "g5-b.png"],
            metadata={"panel_count": 2},
        ),
        ProductionCard(
            project_id="gc-demo",
            stage="storyboard",
            episode=None,
            shot_number=6,
            status="done",
            images=["g6.png"],
            metadata={"panel_count": 1},
        ),
    ]
    preview = _compute_story_preview(cards)
    assert preview["expected_images"] == 3
    assert preview["available_images"] == 3
    assert preview["preview_images"] == ["g5-a.png", "g5-b.png", "g6.png"]


def test_aggregate_gc_exposes_story_images_without_claiming_finished_video():
    """聚合式预告应识别 14 张画面，同时不能把“final 文案 done”冒充成片完成。"""
    order = [f"W{number:02d}" for number in range(1, 15)]
    images = [f"/frames/{code}.png" for code in order]
    cards = [
        ProductionCard(project_id="gc-v3", stage="script", episode=1, status="done"),
        ProductionCard(project_id="gc-v3", stage="storyboard", episode=1, status="done"),
        ProductionCard(
            project_id="gc-v3",
            stage="img_prompt",
            episode=1,
            status="done",
            images=images,
            metadata={"prompt_order": order, "shot_count": 14, "approved_image_count": 14},
        ),
        ProductionCard(project_id="gc-v3", stage="vid_prompt", episode=1, status="done"),
        ProductionCard(project_id="gc-v3", stage="final", episode=1, status="done"),
    ]

    preview = _compute_story_preview(cards)
    readiness = _compute_readiness(cards)

    assert preview["available_images"] == 14
    assert preview["approved_images"] == 14
    assert preview["expected_images"] == 14
    assert preview["missing_images"] == 0
    assert preview["preview_images"] == images[:4]
    assert readiness["units"] == 14
    assert readiness["image_rate"] == 100
    assert readiness["video_rate"] == 0
    assert readiness["delivery_rate"] == 0
    assert readiness["overall_progress"] == 70
    assert readiness["next_action"] == "还差 14 个镜头视频"
