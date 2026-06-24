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
from app.services.knowledge import KnowledgeStore, KeywordRetriever
from app.services.scrape_store import (
    CollectedPromptStore,
    ScrapeHistoryStore,
    ScrapeSourceStore,
)
from app.services.learn_store import LearnHistoryStore, LearnSourceStore
from app.services.scheduler import DailyScheduler
from app.services.long_term_memory import LongTermMemoryStore

skill_registry = SkillRegistryService()
mcp_server_registry = McpServerRegistryService()
tool_registry = ToolRegistryService()
employee_registry = EmployeeRegistryService()
team_registry = TeamRegistryService()
role_template_registry = RoleTemplateRegistryService()

ai_provider_store = AiProviderStore()
ai_service = AIService(settings.ai_models, ai_provider_store)

memory_store = ConversationMemoryStore()

knowledge_store = KnowledgeStore()
knowledge_retriever = KeywordRetriever(knowledge_store)

# ── 自动学习 / 提示词采集 ────────────────────────────────────────
scrape_source_store = ScrapeSourceStore()
collected_prompt_store = CollectedPromptStore()
scrape_history_store = ScrapeHistoryStore()
learn_source_store = LearnSourceStore()
learn_history_store = LearnHistoryStore()
daily_scheduler = DailyScheduler()

# ── 长期记忆（LangMem 三层体系）────────────────────────────────
long_term_memory = LongTermMemoryStore()

# ── 工作流编排引擎 ──────────────────────────────────────────────
workflow_registry = WorkflowRegistryService()
workflow_run_store = WorkflowRunStore()
