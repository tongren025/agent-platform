# Nomi 营销 v1：战略 + 执行

> Status: 草案
> 适用阶段：v0.8 上架后 90 天
> 产品定位：本地 + 开源 + AI 视频创作工作台

## 0. 一句话定位

**"你的 AI 视频工作台。100% 本地。100% 开源。模型当天上线，当天就能用。"**

不打"更便宜"，不打"更快"，打 **拥有权 + 开放性**。

## 1. 为什么这个定位

竞品全景：

| 维度 | Runway / Pika / Sora / Luma | ComfyUI / Auto1111 | DaVinci / Premiere | **Nomi** |
|---|---|---|---|---|
| 本地运行 | ✗ | ✓ | ✓ | **✓** |
| 开源 | ✗ | ✓ | ✗ | **✓** |
| 视频剪辑 + 时间轴 | 弱 | ✗ | ✓ | **✓** |
| AI 生成集成 | ✓ | ✓（仅图） | ✗ | **✓** |
| 模型不限于某厂 | ✗ | 局部 | ✗ | **✓（Onboarding agent）** |
| 资产留在自己手里 | ✗ | ✓ | ✓ | **✓** |
| 无账号 / 无订阅 | ✗ | ✓ | ✓ | **✓** |

我们是**唯一**同时打钩这 7 项的工具。这就是营销的全部弹药。

## 2. 目标用户（按优先级）

| Tier | 群体 | 痛点 | 我们解决 |
|---|---|---|---|
| T1 | 已经在付 Runway + Pika + Kling 的独立创作者 | 多个订阅、资产分散、想换模型要等更新 | 一个工作台，按用量付费给模型方，无中间商 |
| T2 | 海外华人小工作室 / MCN | 数据合规、品牌素材不能上云 | 全本地，资产永远在自己机器 |
| T3 | AI 开发者 / 折腾型创作者 | 想用最新模型，但 SaaS 跟不上 | 新模型出来粘贴 docs，5 分钟接入 |
| T4 | 隐私敏感行业（法务 / 医疗 / 政务素材） | 不能用 SaaS | 同上 |

**先打 T1 + T3**。T1 是付费意愿，T3 是声量。

## 3. 三个差异化锤子

每次发声只允许讲这三件事的某一件，不要讲多了。

| 锤子 | 一句话 | 配套素材 |
|---|---|---|
| **A. 拥有权** | "成片、提示词、密钥都在你电脑上。删 app 你也带得走。" | 截图：项目文件夹 + 资产树。GIF：导出 .nomi-project 在另一台机器打开 |
| **B. 模型自由** | "今天 kie.ai 上了新模型？粘贴文档，5 分钟接入。" | 演示视频：Onboarding wizard 实时跑 90 秒接入 Kling 3.0 |
| **C. 真本地剪辑** | "AI 生成 + 真时间轴 + 真导出 MP4。不是浏览器里假装在剪辑。" | 演示视频：从 storyboard → 节点生成 → 拖到时间轴 → 导出 |

## 4. 渠道矩阵

| 渠道 | 优先级 | 适合锤子 | 产出形态 |
|---|---|---|---|
| Hacker News (Show HN) | P0 | A + B | 一篇技术博客 + 90s demo |
| X / Twitter（英文） | P0 | B + C | 30s clip / 周更 |
| Reddit (`r/aivideo` `r/filmmakers` `r/LocalLLaMA`) | P1 | A + B | 文字 + GIF |
| YouTube（英文长视频） | P1 | C | 真实工作流 10 分钟 |
| 即刻 / 小红书 / B站（中文） | P1 | A + C | 短视频 / 图文 |
| GitHub Discussions | P0 | All | 用户问答 = 长尾流量 |
| Producthunt | P2 | A + B + C | 一波集中曝光 |
| 微信公众号 / 即刻 / 推特个人号 | P1 | All | 每周一更迭代日志 |

## 5. 90 天执行表

| 周次 | 主线 | 具体任务 | 产出 |
|---|---|---|---|
| W1 | **预热** | 拍 Demo 视频 1（Onboarding Wizard 接入 Kling 3.0）；写 Show HN 草稿；GitHub README 重写 | 90s demo, README, HN draft |
| W2 | **正式发** | Show HN 周二 9am PT 发；同步 X 长 thread；Reddit r/aivideo | 上 HN 首页争取 |
| W3 | **回应 + 沉淀** | 回 HN / Reddit 评论；把热门质疑写成 FAQ 进 README；YouTube 长视频开拍 | FAQ.md + YouTube ep1 |
| W4 | **第二锤** | 主题：拥有权。一篇博客 + 一个 GIF（项目跨机器迁移） | 博客 + GIF |
| W5-6 | **生态启动** | 在 docs 里建 "Supported models" 列表；用 onboarding agent 周内接入 4 个新模型并放进列表 | Supported list + 4 fixture |
| W7-8 | **YouTube + B站** | 发英文 / 中文长视频各 1 条（实际剪一支短片） | 2 长视频 |
| W9 | **Producthunt** | 上 PH 当日；预约老用户支持；准备 30 张高质量截图 | PH launch |
| W10 | **小红书 / 即刻冷启动** | 招 3 个中文创作者免费用，换内容 | 3 篇外部内容 |
| W11 | **数据复盘** | 看 GitHub star / 下载 / Discussion 数；定 v0.9 优先级 | 数据 + 决策文档 |
| W12 | **第三锤** | 主题：真本地剪辑。展示完整 30 秒短片的全流程 | 终极 demo |

## 6. 内容生产模板

### 6.1 Show HN 标题候选

- "Show HN: Nomi – local-first AI video workspace, bring your own model"
- "Show HN: I built an open-source local alternative to Runway"
- "Show HN: Nomi – paste any AI model's docs, use it in 5 minutes"

测试用 X 投票 / 朋友圈试反应再选。

### 6.2 推文公式

```
[问题 1 句] + [我们怎么解决 1 句] + [证据 GIF / 视频] + [GitHub 链接]
```

例：

> 想接 Kling 3.0 但 Runway 还没支持？我做了个本地 AI 视频工作台，粘贴 kie.ai 的文档 90 秒接入。[demo gif] github.com/<repo>

### 6.3 README 顶部模板

```markdown
# Nomi

Your AI video workspace.  100% local.  100% open source.
New models the day they launch.

[Demo GIF]

→ Download for macOS / Windows / Linux
→ Watch 90s demo
→ Read why local
```

不要在 README 顶部放架构图、不要放团队介绍。

## 7. 不做的事（克制）

- 不打"AI 行业最强 X"——夸张是 SaaS 玩法，本地工具讲实在
- 不抹黑竞品——Runway 用户是你的潜在转化
- 不搞"早鸟优惠"——你没有订阅，没什么好优惠
- 不刷数据榜单——HN/PH 算法会惩罚
- 不写营销八股软文——开发者一眼看穿
- 不雇 KOL 推——预算花在帮真实创作者拍内容

## 8. 成功指标（90 天）

| 指标 | 目标 | 兜底 |
|---|---|---|
| GitHub Stars | 3,000 | 1,000 |
| 月活下载 | 5,000 | 1,500 |
| GitHub Discussions 帖 | 100 | 30 |
| 真实创作者作品（@ 或 tag） | 30 | 10 |
| Onboarding 接入的厂商 | 20 | 10 |
| 第三方文章 / 视频提及 | 15 | 5 |

不追订阅，不追付费，不追留存——这是开源工具，我们追**采用率**和**社区**。

## 9. 风险 + 兜底

| 风险 | 概率 | 兜底 |
|---|---|---|
| HN 发出去没人看（沉底） | 中 | 1 周后用 ShowHN 第二次发，改标题角度 |
| 用户装好 onboarding agent 跑挂了 | 中 | M4 把 fixture 测过 ≥10 个；用 trial 失败兜底 UI |
| 厂商抓我们模拟调用（封号） | 低 | onboarding agent 只调真实公开 API，不爬非授权资源 |
| 没钱继续 | 总会的 | 加 "Sponsor" 按钮 + 定明确的赞助等级，不上付费版 |
| 跟风出现 closed-source clone | 高 | 加快迭代节奏；开源 + 数据本地 = 用户难以背叛 |

---

## 附：第一周 7 件事（可立刻动手）

1. 录 90s Demo：从打开 app 到 Kling 3.0 出现在节点里
2. 重写 README 顶部 6 行 + 加一张大 GIF
3. 注册 Show HN / X 账号若没有
4. 写 Show HN 草稿（200 字以内，最难的一步）
5. 把 `docs/audit/2026-05-30-codebase-cleanup.md` 的 A 节执行掉，根目录干净点再发
6. 把 `RELEASE_NOTES_v0.7.x.md` 整理成 `CHANGELOG.md` 让人看到迭代节奏
7. 在 GitHub 开 Discussions
