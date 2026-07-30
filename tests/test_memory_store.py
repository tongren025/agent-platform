from app.models.conversation import ConversationSession
from app.services.memory import ConversationMemoryStore


def test_session_id_with_colons_uses_portable_filename(tmp_path):
    store = ConversationMemoryStore(session_dir=str(tmp_path))
    session_id = "nomi:workbench:jiulu-s1:generation"
    store.save_session(ConversationSession(session_id=session_id, employee_key="video"))

    files = list(tmp_path.glob("*.json"))
    assert len(files) == 1
    assert ":" not in files[0].name
    assert files[0].name.startswith("session_")
    assert store.load_session(session_id).session_id == session_id


def test_session_id_cannot_escape_session_directory(tmp_path):
    store = ConversationMemoryStore(session_dir=str(tmp_path))
    session_id = "../outside-session"
    store.save_session(ConversationSession(session_id=session_id, employee_key="video"))

    assert len(list(tmp_path.glob("*.json"))) == 1
    assert not (tmp_path.parent / "outside-session.json").exists()
    assert store.delete_session(session_id) is True
    assert store.load_session(session_id) is None


def test_simple_session_id_keeps_readable_filename(tmp_path):
    store = ConversationMemoryStore(session_dir=str(tmp_path))
    store.save_session(ConversationSession(session_id="session_123", employee_key="director"))

    assert (tmp_path / "session_123.json").exists()
    assert store.load_session("session_123").employee_key == "director"
