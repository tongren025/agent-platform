from __future__ import annotations

from datetime import datetime, timedelta

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from yuxi.services.conversation_service import get_thread_history_view
from yuxi.storage.postgres.models_business import AgentRun, Base, Conversation, Message

pytestmark = [pytest.mark.unit, pytest.mark.asyncio]


@pytest_asyncio.fixture()
async def session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as db:
        yield db
    await engine.dispose()


async def test_queue_history_keeps_each_request_with_its_reply(session):
    started_at = datetime(2026, 7, 12, 9, 0, 0)
    session.add(Conversation(id=1, thread_id="thread-1", uid="user-1", agent_id="main", status="active"))
    session.add(
        AgentRun(
            id="run-a",
            conversation_thread_id="thread-1",
            agent_slug="main",
            uid="user-1",
            request_id="request-a",
            conversation_id=1,
            input_payload={},
            status="completed",
            created_at=started_at,
        )
    )
    session.add_all(
        [
            Message(
                id=1,
                conversation_id=1,
                role="user",
                content="A",
                request_id="request-a",
                run_id="run-a",
                delivery_status="complete",
                created_at=started_at,
            ),
            Message(
                id=2,
                conversation_id=1,
                role="user",
                content="B",
                request_id="request-b",
                delivery_status="queued",
                created_at=started_at + timedelta(seconds=1),
            ),
            Message(
                id=3,
                conversation_id=1,
                role="assistant",
                content="A reply",
                run_id="run-a",
                delivery_status="complete",
                created_at=started_at + timedelta(seconds=2),
            ),
        ]
    )
    await session.commit()

    queued_history = await get_thread_history_view(
        thread_id="thread-1",
        current_uid="user-1",
        db=session,
    )
    assert [message["content"] for message in queued_history["history"]] == ["A", "A reply"]

    request_b = await session.get(Message, 2)
    request_b.run_id = "run-b"
    request_b.delivery_status = "complete"
    session.add(
        AgentRun(
            id="run-b",
            conversation_thread_id="thread-1",
            agent_slug="main",
            uid="user-1",
            request_id="request-b",
            conversation_id=1,
            input_payload={},
            status="completed",
            created_at=started_at + timedelta(seconds=3),
        )
    )
    session.add(
        Message(
            id=4,
            conversation_id=1,
            role="assistant",
            content="B reply",
            run_id="run-b",
            delivery_status="complete",
            created_at=started_at + timedelta(seconds=4),
        )
    )
    await session.commit()

    completed_history = await get_thread_history_view(
        thread_id="thread-1",
        current_uid="user-1",
        db=session,
    )
    assert [message["content"] for message in completed_history["history"]] == [
        "A",
        "A reply",
        "B",
        "B reply",
    ]
