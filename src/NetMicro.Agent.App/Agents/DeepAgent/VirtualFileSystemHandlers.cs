using NetMicro.Agent.App.Agents.Runtime;
using Newtonsoft.Json.Linq;

namespace NetMicro.Agent.App.Agents.DeepAgent
{
    /// <summary>虚拟文件系统：列出文件。ls</summary>
    public class LsHandler : IAgentToolHandler
    {
        public string ToolCode => "ls";

        public Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            if (context.State == null)
                return Task.FromResult("{\"error\":\"未启用 DeepAgent 状态\"}");
            return Task.FromResult(context.State.RenderFileList());
        }
    }

    /// <summary>虚拟文件系统：读取文件，支持按行分页。read_file</summary>
    public class ReadFileHandler : IAgentToolHandler
    {
        public string ToolCode => "read_file";

        public Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            var state = context.State;
            if (state == null)
                return Task.FromResult("{\"error\":\"未启用 DeepAgent 状态\"}");

            JObject args;
            try { args = JObject.Parse(context.ArgumentsJson); }
            catch { return Task.FromResult("{\"error\":\"参数解析失败\"}"); }

            var path = args["path"]?.ToString();
            if (string.IsNullOrWhiteSpace(path))
                return Task.FromResult("{\"error\":\"缺少 path 参数\"}");
            if (!state.Files.TryGetValue(path, out var content))
                return Task.FromResult($"{{\"error\":\"文件不存在：{path}。当前文件：{state.RenderFileList()}\"}}");

            var offset = args["offset"]?.Value<int?>();
            var limit = args["limit"]?.Value<int?>();
            if (offset == null && limit == null)
                return Task.FromResult(content);

            var lines = content.Replace("\r\n", "\n").Split('\n');
            var start = Math.Max(0, offset ?? 0);
            var take = Math.Max(0, limit ?? lines.Length);
            var slice = lines.Skip(start).Take(take).ToArray();
            var more = start + slice.Length < lines.Length
                ? $"\n...（还有 {lines.Length - start - slice.Length} 行，调整 offset/limit 继续读）"
                : "";
            return Task.FromResult(string.Join("\n", slice) + more);
        }
    }

    /// <summary>虚拟文件系统：写入/覆盖文件。write_file</summary>
    public class WriteFileHandler : IAgentToolHandler
    {
        public string ToolCode => "write_file";

        public Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            var state = context.State;
            if (state == null)
                return Task.FromResult("{\"error\":\"未启用 DeepAgent 状态\"}");

            JObject args;
            try { args = JObject.Parse(context.ArgumentsJson); }
            catch { return Task.FromResult("{\"error\":\"参数解析失败\"}"); }

            var path = args["path"]?.ToString();
            if (string.IsNullOrWhiteSpace(path))
                return Task.FromResult("{\"error\":\"缺少 path 参数\"}");

            var content = args["content"]?.ToString() ?? "";
            state.Files[path] = content;
            return Task.FromResult($"已写入文件 \"{path}\"（{content.Length} 字符）。");
        }
    }

    /// <summary>虚拟文件系统：按字符串替换编辑文件。edit_file</summary>
    public class EditFileHandler : IAgentToolHandler
    {
        public string ToolCode => "edit_file";

        public Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            var state = context.State;
            if (state == null)
                return Task.FromResult("{\"error\":\"未启用 DeepAgent 状态\"}");

            JObject args;
            try { args = JObject.Parse(context.ArgumentsJson); }
            catch { return Task.FromResult("{\"error\":\"参数解析失败\"}"); }

            var path = args["path"]?.ToString();
            if (string.IsNullOrWhiteSpace(path))
                return Task.FromResult("{\"error\":\"缺少 path 参数\"}");
            if (!state.Files.TryGetValue(path, out var content))
                return Task.FromResult($"{{\"error\":\"文件不存在：{path}\"}}");

            var oldStr = args["old_string"]?.ToString() ?? "";
            var newStr = args["new_string"]?.ToString() ?? "";
            var replaceAll = args["replace_all"]?.Value<bool?>() ?? false;

            if (string.IsNullOrEmpty(oldStr))
                return Task.FromResult("{\"error\":\"old_string 不能为空\"}");
            if (!content.Contains(oldStr))
                return Task.FromResult($"{{\"error\":\"未找到要替换的内容（old_string）\"}}");
            if (!replaceAll)
            {
                var first = content.IndexOf(oldStr, StringComparison.Ordinal);
                var second = content.IndexOf(oldStr, first + oldStr.Length, StringComparison.Ordinal);
                if (second >= 0)
                    return Task.FromResult("{\"error\":\"old_string 匹配到多处，请提供更精确的内容或设置 replace_all=true\"}");
            }

            content = replaceAll
                ? content.Replace(oldStr, newStr)
                : ReplaceFirst(content, oldStr, newStr);
            state.Files[path] = content;
            return Task.FromResult($"已编辑文件 \"{path}\"。");
        }

        private static string ReplaceFirst(string text, string search, string replace)
        {
            var idx = text.IndexOf(search, StringComparison.Ordinal);
            return idx < 0 ? text : text[..idx] + replace + text[(idx + search.Length)..];
        }
    }
}
