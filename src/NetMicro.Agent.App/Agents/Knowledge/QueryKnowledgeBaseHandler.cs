using NetMicro.Agent.App.Agents.Runtime;
using Newtonsoft.Json;

namespace NetMicro.Agent.App.Agents.Knowledge
{
    /// <summary>
    /// query_knowledge_base 工具处理器：在当前数字员工的本地知识库中检索关键词，
    /// 返回 topK 命中片段。仅当 EmployeeRuntimeSnapshot.HasKnowledgeBase = true
    /// 时此工具才会被注入（条件注入由 Phase 2 的 PlatformInfraToolRegistry 完成）。
    ///
    /// 设计要点（与 design.md §知识库设计 / per-employee-knowledge-base spec 对齐）：
    /// - 轻量方案：仅本地目录 + index.json + 关键词召回，不引入向量库 / Embedding / Lucene / jieba
    /// - 参数 snake_case：top_k 范围 1~20，默认 5
    /// - 调用方（LLM）误传 0、负数、超大值均按上下限夹紧，避免异常退出
    /// - 返回 JSON 形如 { query, top_k, hits: [{ docId, fileName, excerpt, score }] }
    /// </summary>
    public class QueryKnowledgeBaseHandler : IAgentToolHandler
    {
        // 默认 topK
        private const int DefaultTopK = 5;

        // topK 上限（与 KeywordKnowledgeRetriever 内部保持一致，防御性夹紧）
        private const int MaxTopK = 20;

        private readonly IKnowledgeRetriever _retriever;
        private readonly ILogger<QueryKnowledgeBaseHandler> _logger;

        public string ToolCode => "query_knowledge_base";

        public QueryKnowledgeBaseHandler(
            IKnowledgeRetriever retriever,
            ILogger<QueryKnowledgeBaseHandler> logger)
        {
            _retriever = retriever;
            _logger = logger;
        }

        public async Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            // 参数反序列化：容错处理空串 / 非法 JSON
            QueryArgs? args = null;
            if (!string.IsNullOrWhiteSpace(context.ArgumentsJson))
            {
                try
                {
                    args = JsonConvert.DeserializeObject<QueryArgs>(context.ArgumentsJson);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "query_knowledge_base 参数 JSON 解析失败，EmployeeKey={EmployeeKey}, Raw={Raw}",
                        context.EmployeeKey, context.ArgumentsJson);
                    return JsonConvert.SerializeObject(new
                    {
                        error = "参数 JSON 解析失败，请按 schema 传入 { query, top_k? }"
                    });
                }
            }

            if (args == null || string.IsNullOrWhiteSpace(args.Query))
            {
                return JsonConvert.SerializeObject(new
                {
                    error = "缺少必填参数 query"
                });
            }

            if (string.IsNullOrWhiteSpace(context.EmployeeKey))
            {
                return JsonConvert.SerializeObject(new
                {
                    error = "上下文缺少 EmployeeKey，无法定位知识库"
                });
            }

            // top_k 范围夹紧 [1, 20]，缺省 5
            var topK = args.TopK ?? DefaultTopK;
            topK = Math.Max(1, Math.Min(MaxTopK, topK));

            List<KnowledgeSnippet> snippets;
            try
            {
                snippets = await _retriever.SearchAsync(context.EmployeeKey, args.Query, topK, cancellationToken);
            }
            catch (OperationCanceledException)
            {
                // 协作式取消，向上抛出由调用方处理
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "query_knowledge_base 检索失败，EmployeeKey={EmployeeKey}, Query={Query}",
                    context.EmployeeKey, args.Query);
                return JsonConvert.SerializeObject(new
                {
                    error = "知识库检索失败",
                    detail = ex.Message
                });
            }

            _logger.LogInformation(
                "query_knowledge_base 命中 {HitCount} 条，EmployeeKey={EmployeeKey}, TopK={TopK}, Query={Query}",
                snippets.Count, context.EmployeeKey, topK, args.Query);

            return JsonConvert.SerializeObject(new
            {
                query = args.Query,
                top_k = topK,
                hits = snippets.Select(s => new
                {
                    docId = s.DocId,
                    fileName = s.FileName,
                    excerpt = s.Excerpt,
                    // 保留 3 位小数即可，避免噪声尾数干扰 LLM 判读
                    score = Math.Round(s.Score, 3)
                })
            });
        }

        /// <summary>
        /// 工具入参 DTO。字段名使用 snake_case，与对外暴露给 LLM 的 schema 对齐。
        /// </summary>
        private sealed class QueryArgs
        {
            [JsonProperty("query")]
            public string Query { get; set; } = string.Empty;

            [JsonProperty("top_k")]
            public int? TopK { get; set; }
        }
    }
}
