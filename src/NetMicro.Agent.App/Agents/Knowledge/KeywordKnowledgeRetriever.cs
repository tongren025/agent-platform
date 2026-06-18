using System.Text;

namespace NetMicro.Agent.App.Agents.Knowledge
{
    /// <summary>
    /// 知识库召回器抽象。一期实现为关键词 + Jaccard 词项重合度的轻量召回，
    /// 不引入向量库 / Embedding / Lucene / jieba 等任何第三方检索依赖。
    /// </summary>
    public interface IKnowledgeRetriever
    {
        /// <summary>
        /// 在指定员工的本地知识库中召回与 query 最相关的若干文档片段。
        /// </summary>
        /// <param name="employeeKey">员工唯一键（仅允许字母数字 / 下划线 / 短横线，调用方需保证已校验）。</param>
        /// <param name="query">用户查询串，可为中文或英文。</param>
        /// <param name="topK">返回片段数上限；&lt;=0 按默认 5 处理，&gt;20 夹紧到 20。</param>
        /// <param name="ct">取消令牌。</param>
        Task<List<KnowledgeSnippet>> SearchAsync(string employeeKey, string query, int topK, CancellationToken ct);
    }

    /// <summary>
    /// 单条召回结果：文档定位 + 命中片段 + 综合得分。
    /// </summary>
    public class KnowledgeSnippet
    {
        /// <summary>来源文档 ID（对应 index.json 中的 DocId）。</summary>
        public string DocId { get; set; } = "";

        /// <summary>来源文档原始文件名（含扩展名）。</summary>
        public string FileName { get; set; } = "";

        /// <summary>命中片段（前后各约 100 字 context，长内容截断）。</summary>
        public string Excerpt { get; set; } = "";

        /// <summary>综合得分，归一化到 [0, 1]。</summary>
        public double Score { get; set; }
    }

    /// <summary>
    /// 基于关键词子串匹配 + Jaccard 词项重合度的简易召回实现。
    /// 仅支持 .txt / .md 等纯文本文档；超大文档（&gt;1MB 文本）跳过以避免 OOM。
    /// </summary>
    public class KeywordKnowledgeRetriever : IKnowledgeRetriever
    {
        // 单文档文本上限：避免一次性把过大的文件读入内存
        private const long MaxDocumentBytesForScan = 1L * 1024 * 1024;

        // 上下文窗口（命中位置前后各 100 字）
        private const int SnippetContextRadius = 100;

        // topK 默认值与上限
        private const int DefaultTopK = 5;
        private const int MaxTopK = 20;

        // query 子串命中的加成（与 Jaccard 相加后再夹紧到 1.0）
        private const double SubstringBonus = 0.3;

        private readonly IEmployeeKnowledgeStore _store;
        private readonly ILogger<KeywordKnowledgeRetriever> _logger;

        public KeywordKnowledgeRetriever(
            IEmployeeKnowledgeStore store,
            ILogger<KeywordKnowledgeRetriever> logger)
        {
            _store = store;
            _logger = logger;
        }

        public async Task<List<KnowledgeSnippet>> SearchAsync(
            string employeeKey,
            string query,
            int topK,
            CancellationToken ct)
        {
            // topK 入参夹紧：<=0 按默认 5，>20 夹紧到 20
            var effectiveTopK = topK <= 0 ? DefaultTopK : Math.Min(topK, MaxTopK);

            var result = new List<KnowledgeSnippet>();
            if (string.IsNullOrWhiteSpace(query))
            {
                return result;
            }

            // 1) 列出该员工所有文档元数据
            List<KnowledgeDocument> documents;
            try
            {
                documents = await _store.ListAsync(employeeKey, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "读取员工 {EmployeeKey} 知识库元数据失败，退化为空结果", employeeKey);
                return result;
            }

            if (documents.Count == 0)
            {
                return result;
            }

            // 预处理 query：分词 + 小写化
            var queryTerms = Tokenize(query);
            var normalizedQuery = query.Trim().ToLowerInvariant();

            // 2-5) 逐篇打分
            var scored = new List<(KnowledgeDocument Doc, string Text, double Score, int HitPosition)>();
            foreach (var doc in documents)
            {
                ct.ThrowIfCancellationRequested();

                // 超大文档跳过，避免 OOM
                if (doc.SizeBytes > MaxDocumentBytesForScan)
                {
                    _logger.LogWarning(
                        "员工 {EmployeeKey} 文档 {DocId}({FileName}) 大小 {Size} 字节超过 {Limit} 字节，本次召回跳过",
                        employeeKey, doc.DocId, doc.FileName, doc.SizeBytes, MaxDocumentBytesForScan);
                    continue;
                }

                string text;
                try
                {
                    text = await _store.ReadTextAsync(employeeKey, doc.DocId, ct);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "读取员工 {EmployeeKey} 文档 {DocId}({FileName}) 文本失败，跳过",
                        employeeKey, doc.DocId, doc.FileName);
                    continue;
                }

                if (string.IsNullOrEmpty(text))
                {
                    continue;
                }

                var normalizedText = text.ToLowerInvariant();

                // 3) 分词并计算 Jaccard 词项重合度
                var docTerms = Tokenize(text);
                var jaccard = ComputeJaccard(queryTerms, docTerms);

                // 4) 子串加成：query 整串出现于文档原文 → +0.3
                int substringIndex = -1;
                if (!string.IsNullOrEmpty(normalizedQuery))
                {
                    substringIndex = normalizedText.IndexOf(normalizedQuery, StringComparison.Ordinal);
                }
                var substringHit = substringIndex >= 0;
                var rawScore = jaccard + (substringHit ? SubstringBonus : 0.0);
                if (rawScore <= 0)
                {
                    continue;
                }

                // 综合分夹紧到 [0, 1]
                var score = Math.Min(1.0, rawScore);

                // 找到首个命中 term 的位置，用于截取片段
                var hitPosition = substringHit
                    ? substringIndex
                    : FindFirstTermPosition(normalizedText, queryTerms);
                if (hitPosition < 0)
                {
                    hitPosition = 0;
                }

                scored.Add((doc, text, score, hitPosition));
            }

            if (scored.Count == 0)
            {
                return result;
            }

            // 6) 按分数降序取 topK，并为每篇截取最佳片段
            foreach (var item in scored.OrderByDescending(x => x.Score).Take(effectiveTopK))
            {
                result.Add(new KnowledgeSnippet
                {
                    DocId = item.Doc.DocId,
                    FileName = item.Doc.FileName,
                    Excerpt = BuildExcerpt(item.Text, item.HitPosition),
                    Score = item.Score
                });
            }

            return result;
        }

        /// <summary>
        /// 轻量分词：按空白与常见中英文标点切分，统一小写化，去空与去重交给调用方按需处理。
        /// 中文不做精细分词（保留整段作为 token 是合理的——本期是 keyword 级匹配，不追求语义切分）。
        /// </summary>
        private static HashSet<string> Tokenize(string input)
        {
            var tokens = new HashSet<string>(StringComparer.Ordinal);
            if (string.IsNullOrWhiteSpace(input))
            {
                return tokens;
            }

            var buffer = new StringBuilder(32);
            foreach (var ch in input)
            {
                if (IsSeparator(ch))
                {
                    if (buffer.Length > 0)
                    {
                        tokens.Add(buffer.ToString().ToLowerInvariant());
                        buffer.Clear();
                    }
                }
                else
                {
                    buffer.Append(ch);
                }
            }

            if (buffer.Length > 0)
            {
                tokens.Add(buffer.ToString().ToLowerInvariant());
            }

            return tokens;
        }

        /// <summary>
        /// 判断字符是否为 token 分隔符：空白 + 常见 ASCII 标点 + 中文常见标点。
        /// </summary>
        private static bool IsSeparator(char ch)
        {
            if (char.IsWhiteSpace(ch))
            {
                return true;
            }

            // ASCII 标点
            switch (ch)
            {
                case ',':
                case '.':
                case ';':
                case ':':
                case '!':
                case '?':
                case '"':
                case '\'':
                case '(':
                case ')':
                case '[':
                case ']':
                case '{':
                case '}':
                case '<':
                case '>':
                case '/':
                case '\\':
                case '|':
                case '`':
                case '~':
                case '@':
                case '#':
                case '$':
                case '%':
                case '^':
                case '&':
                case '*':
                case '+':
                case '=':
                case '-':
                case '_':
                    return true;
            }

            // 中文常见标点
            switch (ch)
            {
                case '，':
                case '。':
                case '；':
                case '：':
                case '！':
                case '？':
                case '“':
                case '”':
                case '‘':
                case '’':
                case '（':
                case '）':
                case '【':
                case '】':
                case '《':
                case '》':
                case '、':
                case '·':
                case '—':
                    return true;
            }

            return false;
        }

        /// <summary>
        /// 计算两个词集合的 Jaccard 系数：|A ∩ B| / |A ∪ B|。
        /// 任一集合为空时返回 0。
        /// </summary>
        private static double ComputeJaccard(HashSet<string> a, HashSet<string> b)
        {
            if (a.Count == 0 || b.Count == 0)
            {
                return 0.0;
            }

            var intersect = 0;
            // 遍历较小集合以减少哈希查找次数
            var (small, large) = a.Count <= b.Count ? (a, b) : (b, a);
            foreach (var token in small)
            {
                if (large.Contains(token))
                {
                    intersect++;
                }
            }

            if (intersect == 0)
            {
                return 0.0;
            }

            var union = a.Count + b.Count - intersect;
            return union <= 0 ? 0.0 : (double)intersect / union;
        }

        /// <summary>
        /// 在文档（已小写化）中查找任一 query term 的最早出现位置。
        /// </summary>
        private static int FindFirstTermPosition(string normalizedText, HashSet<string> queryTerms)
        {
            var earliest = -1;
            foreach (var term in queryTerms)
            {
                if (string.IsNullOrEmpty(term))
                {
                    continue;
                }

                var idx = normalizedText.IndexOf(term, StringComparison.Ordinal);
                if (idx >= 0 && (earliest < 0 || idx < earliest))
                {
                    earliest = idx;
                }
            }

            return earliest;
        }

        /// <summary>
        /// 取命中位置前后各 SnippetContextRadius 个字符作为片段，并在被截断时附省略号。
        /// </summary>
        private static string BuildExcerpt(string text, int hitPosition)
        {
            if (string.IsNullOrEmpty(text))
            {
                return string.Empty;
            }

            var start = Math.Max(0, hitPosition - SnippetContextRadius);
            var end = Math.Min(text.Length, hitPosition + SnippetContextRadius);
            var excerpt = text.Substring(start, end - start);

            var prefix = start > 0 ? "..." : string.Empty;
            var suffix = end < text.Length ? "..." : string.Empty;
            // 把片段内的换行折叠为空格，避免破坏外层 JSON 输出排版
            excerpt = excerpt.Replace("\r\n", " ").Replace('\n', ' ').Replace('\r', ' ');
            return prefix + excerpt + suffix;
        }
    }
}
