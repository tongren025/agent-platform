"""生产就绪度回归测试：防止“文案卡 done”再次被误报为成片 100%。"""
from app.api.production import _compute_readiness, _compute_stats
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
    assert stats["readiness"]["next_action"] == "完成剩余 1 个单元出图"


def test_readiness_exposes_blockers_and_next_action():
    """缺少必需规格时优先提示修复断链，而不是催促出图。"""
    cards = [_card("script", 1), _card("storyboard", 1), _card("script", 2)]
    readiness = _compute_readiness(cards)
    assert readiness["units"] == 2
    assert readiness["blockers"] == 2
    assert readiness["next_action"] == "修复 2 个断链单元"


def test_full_unit_reaches_one_hundred_percent():
    """规格、图、视频和交付卡都齐全时才达到 100%。"""
    cards = [_card(stage, 1) for stage in ("script", "storyboard", "img_prompt", "vid_prompt")]
    cards += [_card("img_gen", 1, images=["a.png"]), _card("vid_gen", 1, videos=["a.mp4"]), _card("final", 1)]
    readiness = _compute_readiness(cards)
    assert readiness["overall_progress"] == 100
    assert readiness["next_action"] == "项目已具备交付条件"
