"""镜头控制包的自动路由与参考素材编译回归测试。"""
from app.models.production import ProductionCard
from app.services.shot_control import (
    ShotControlPack,
    ShotReference,
    build_shot_control_pack,
    compile_shot_control_plan,
)


def _card(stage: str, shot: int = 1, **kwargs) -> ProductionCard:
    return ProductionCard(
        card_id=f"{stage}-{shot}",
        project_id="demo",
        stage=stage,
        episode=1,
        shot_number=shot,
        title=f"G{shot} {stage}",
        content=f"{stage} content",
        prompts=[f"{stage} prompt"],
        **kwargs,
    )


def test_plain_approved_frame_uses_keyframe_mode():
    video_card = _card("vid_prompt")
    image_card = _card("img_prompt", images=["/uploads/frame.png"])
    pack = build_shot_control_pack(
        [image_card, video_card],
        video_card,
        image_card,
        current_image_url="/uploads/frame.png",
    )

    plan = compile_shot_control_plan("角色缓慢抬头", pack, duration=5)

    assert plan.mode == "keyframe"
    assert plan.first_frame_url == "/uploads/frame.png"
    assert plan.references == []


def test_video_and_audio_references_route_to_multimodal_mode():
    video_card = _card("vid_prompt")
    image_card = _card("img_prompt", images=["/uploads/frame.png"])
    override = ShotControlPack(
        generation_mode="auto",
        shot_type="dialogue",
        references=[
            ShotReference(
                url="https://example.test/performance.mp4",
                kind="video",
                role="performance",
            ),
            ShotReference(
                url="https://example.test/dialogue.mp3",
                kind="audio",
                role="dialogue",
            ),
        ],
        storyboard="[00:00-00:04] 起身；[00:04-00:08] 说出台词",
        camera_plan="中近景缓慢推进",
        performance_plan="克制，停顿后开口",
        audio_plan="低声对白，口型同步",
    )
    pack = build_shot_control_pack(
        [image_card, video_card],
        video_card,
        image_card,
        current_image_url="/uploads/frame.png",
        override=override,
    )

    plan = compile_shot_control_plan("角色起身说话", pack, duration=8)

    assert plan.mode == "reference"
    assert {item.kind for item in plan.references} == {"image", "video", "audio"}
    assert "参考视频1" in plan.prompt
    assert "参考音频1" in plan.prompt
    assert plan.summary["referenceCount"] == 3
    assert plan.warnings == []


def test_previous_shot_image_is_added_for_continuity():
    previous = _card(
        "img_prompt",
        shot=1,
        images=["/uploads/previous.png"],
        metadata={"active_image": "/uploads/previous.png"},
    )
    image_card = _card("img_prompt", shot=2, images=["/uploads/current.png"])
    video_card = _card("vid_prompt", shot=2)
    pack = build_shot_control_pack(
        [previous, image_card, video_card],
        video_card,
        image_card,
        current_image_url="/uploads/current.png",
    )

    continuity = [
        item for item in pack.references if item.role == "continuity"
    ]
    assert [item.url for item in continuity] == ["/uploads/previous.png"]
