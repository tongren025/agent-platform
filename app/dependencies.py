from app.config import settings
from app.services.registry import (
    EmployeeRegistryService,
    McpServerRegistryService,
    RoleTemplateRegistryService,
    SkillRegistryService,
    TeamRegistryService,
    ToolRegistryService,
    WorkflowRegistryService,
)
from app.services.workflow_store import WorkflowRunStore
from app.services.ai import AIService, AiProviderStore
from app.services.memory import ConversationMemoryStore
from app.services.run_store import AgentRunStore
from app.services.knowledge import KnowledgeStore, KeywordRetriever
from app.services.scrape_store import (
    CollectedPromptStore,
    ScrapeHistoryStore,
    ScrapeSourceStore,
)
from app.services.learn_store import LearnHistoryStore, LearnSourceStore
from app.services.scheduler import DailyScheduler
from app.services.long_term_memory import LongTermMemoryStore
from app.services.user_store import RoleStore, UserStore

skill_registry = SkillRegistryService()
mcp_server_registry = McpServerRegistryService()
tool_registry = ToolRegistryService()
employee_registry = EmployeeRegistryService()
team_registry = TeamRegistryService()
role_template_registry = RoleTemplateRegistryService()

ai_provider_store = AiProviderStore()
ai_service = AIService(settings.ai_models, ai_provider_store)

# M1 迁移：use_db_stores=True 时"要查的"运行态（会话 / 运行记录 / 长期记忆）走 PostgreSQL，
# 否则维持 JSON store。开关默认 False（见 app/core/settings.py），PG 未就绪不影响现有功能。
from app.core.settings import settings as core_settings

if core_settings.use_db_stores:
    from app.core.db import init_db
    from app.services.memory_db import ConversationMemoryDbStore
    from app.services.run_store_db import AgentRunDbStore
    from app.services.long_term_memory_db import PgMemoryBackend
    init_db()
    memory_store = ConversationMemoryDbStore()
    agent_run_store = AgentRunDbStore()
    long_term_memory = LongTermMemoryStore(backend=PgMemoryBackend())
else:
    memory_store = ConversationMemoryStore()
    agent_run_store = AgentRunStore()
    long_term_memory = LongTermMemoryStore()

knowledge_store = KnowledgeStore()
knowledge_retriever = KeywordRetriever(knowledge_store)

# ── M3 向量检索（需 use_db_stores + DASHSCOPE_API_KEY）──────────────
if core_settings.use_db_stores:
    from app.services.vector_store import VectorStore, SemanticRetriever
    vector_store = VectorStore()
    semantic_retriever = SemanticRetriever(vector_store, knowledge_store)
else:
    vector_store = None
    semantic_retriever = None

# ── 自动学习 / 提示词采集 ────────────────────────────────────────
scrape_source_store = ScrapeSourceStore()
collected_prompt_store = CollectedPromptStore()
scrape_history_store = ScrapeHistoryStore()
learn_source_store = LearnSourceStore()
learn_history_store = LearnHistoryStore()
daily_scheduler = DailyScheduler()

# ── 长期记忆（LangMem 三层体系）——— 已在上方 use_db_stores 分支实例化 ──────────

# ── 工作流编排引擎 ──────────────────────────────────────────────
workflow_registry = WorkflowRegistryService()
workflow_run_store = WorkflowRunStore()

# ── 平台用户与角色 ─────────────────────────────────────────────
role_store = RoleStore()
user_store = UserStore(role_store)
