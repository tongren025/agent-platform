namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// 构建当前调用的作用域栈（global → agent → agent.workflow）。
    /// </summary>
    public static class ScopeBuilder
    {
        public const string GlobalScope = "global";

        public static List<string> Build(string agentKey, string? workflowKey = null)
        {
            var scopes = new List<string> { GlobalScope, agentKey };
            if (!string.IsNullOrWhiteSpace(workflowKey))
            {
                scopes.Add($"{agentKey}.{workflowKey}");
            }
            return scopes;
        }
    }
}
