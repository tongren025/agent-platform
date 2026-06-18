using NetMicro.Agent.App.Agents.Models;

namespace NetMicro.Agent.App.Agents.Services
{
    /// <summary>
    /// 装配数字员工运行时快照。
    /// </summary>
    public interface ISnapshotLoader
    {
        /// <summary>
        /// 按 employeeKey + activeScopes 装配快照。employeeKey 不存在时返回 null。
        /// </summary>
        Task<EmployeeRuntimeSnapshot?> LoadAsync(string employeeKey, IReadOnlyList<string> activeScopes);
    }
}
