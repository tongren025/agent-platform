using NetMicro.Agent.App.Agents.Runtime;
using Newtonsoft.Json;

namespace NetMicro.Agent.App.Agents.Strategy
{
    /// <summary>
    /// 从工具参数或 extraContext 中解析 snapshot_id 的共用工具类。
    /// </summary>
    public static class SnapshotIdHelper
    {
        /// <summary>
        /// 优先从 LLM 参数取 snapshot_id，其次从 extraContext 取。
        /// </summary>
        public static string? Resolve(AgentToolContext context)
        {
            // 1. 从 LLM 传入的参数 JSON 中取
            if (!string.IsNullOrEmpty(context.ArgumentsJson))
            {
                try
                {
                    var args = JsonConvert.DeserializeObject<Dictionary<string, string>>(context.ArgumentsJson);
                    if (args != null)
                    {
                        if (args.TryGetValue("snapshot_id", out var id1) && !string.IsNullOrEmpty(id1)) return id1;
                        if (args.TryGetValue("snapshotId", out var id2) && !string.IsNullOrEmpty(id2)) return id2;
                    }
                }
                catch { /* 参数解析失败，fallback 到 extraContext */ }
            }

            // 2. 从调用方透传的 extraContext 中取
            if (context.ExtraContext.TryGetValue("snapshotId", out var ctxVal) && ctxVal is string s && !string.IsNullOrEmpty(s))
                return s;

            return null;
        }
    }
}
