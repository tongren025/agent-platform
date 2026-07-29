# Yuxi Runtime 上游来源

- 上游仓库：<https://github.com/xerrors/Yuxi>
- 引入分支：`main`
- 固定提交：`2f8fa7fdc8d641ccc1b158ad7022a26087b6c99a`
- 引入日期：2026-07-29
- 上游许可证：MIT，原始许可证保留在本目录 `LICENSE`

本目录是 Yuxi 的固定源码快照，用于先以独立 Agent Runtime 模块验证，再逐步接入
Agent Platform。除本文件与 `INTEGRATION.md` 外，上游文件在初始引入时保持原样。

后续修改原则：

1. 上游源码修复优先以独立补丁记录，避免无来源地重写。
2. Agent Platform 的业务适配放在本目录外的集成层，不把漫剧数据模型写入上游内核。
3. 同步新版本前先核对上游提交、许可证、数据库迁移和破坏性变更。
4. 复用或修改上游文件时保留本来源声明和 MIT 许可证。
