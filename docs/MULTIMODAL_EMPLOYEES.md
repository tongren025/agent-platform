# 多模态数字员工模型设计

这套系统把“会思考”和“会产出媒体”拆成独立能力。员工永远先用聊天模型理解任务、
制定方案和编排工具；只有用户明确要求最终图片或视频时，才调用对应的专用生成接口。

## 一、岗位与推荐模型

| 岗位 | 输出能力 | 思考模型 `model_id` | 专用媒体模型 | 原因 |
|---|---|---|---|---|
| 漫剧导演 | text | `gpt-5.6-sol` | — | 跨剧本、画面、节奏做高难度统筹 |
| 分镜师 | text | `gpt-5.6-sol` | — | 需要较强镜头连续性和结构推理 |
| 多模态质检 | text | `gpt-5.6-sol` high | `inspect_media` | 实际读取图片或视频抽帧；证据缺失时阻塞 |
| 编剧 | text | `gpt-5.6-terra` high | — | 高质量写作，调用频率高，兼顾成本 |
| 角色设计师 | text | `gpt-5.6-terra` medium | — | 产出身份、服装、比例、表情等文字规格 |
| 场景设计师 | text | `gpt-5.6-terra` medium | — | 产出空间、材质、光线与可复用场景规格 |
| 动作与特效设计 | text | `gpt-5.6-terra` high | — | 统一产出动作路径、受力因果与特效分层 |
| 媒体提示词工程师 | text | `gpt-5.6-terra` high | — | 分别生成图片与视频的结构化提交包 |
| 角色生成师 | text + image | `gpt-5.6-luna` none | `openrouter:openai/gpt-image-2` | 轻量编排已审核提示词，GPT Image 2 真正出图 |
| 布景生成师 | text + image | `gpt-5.6-luna` none | `openrouter:openai/gpt-image-2` | 轻量执行场景母版，不重新设计场景 |
| 关键帧生成师 | text + image | `gpt-5.6-luna` none | `openrouter:openai/gpt-image-2` | 只执行最终关键帧包，不兼任提示词设计 |
| 视频生成师 | text + video | `gpt-5.6-luna` none | `openrouter:bytedance/seedance-2.0` | 消费已审核视频包，异步产出 MP4 |

GPT-5.6 档位说明以 [OpenAI 模型指南](https://developers.openai.com/api/docs/guides/model-guidance?model=gpt-5.6)
为准；GPT Image 2 的能力与接口见
[OpenAI GPT Image 2 模型页](https://developers.openai.com/api/docs/models/gpt-image-2)。
第三方代理必须实际提供同名模型和对应端点，只有“兼容 OpenAI 地址”不代表它一定支持。

## 二、员工配置契约

```json
{
  "outputModalities": ["text", "image"],
  "defaultModelPolicy": {
    "model_id": "openai代理:gpt-5.6-terra",
    "image_model_id": "openrouter:openai/gpt-image-2",
    "reasoning_effort": "medium",
    "temperature": 0.7,
    "max_tokens": 8192
  }
}
```

- `model_id`：进入 Responses API 的文字思考与工具编排模型。
- `image_model_id`：仅在声明 `image` 能力时必填，通过图片专用接口调用。
- `video_model_id`：仅在声明 `video` 能力时必填，通过异步视频接口调用。
- `outputModalities`：必须包含 `text`；媒体能力只是员工可调用的工具，不替代思考模型。
- `openrouter:` 前缀表示固定走平台已配置的 OpenRouter 媒体供应商。
- 管理页保存 `供应商名:模型 ID`，避免多个供应商有同名模型时调用错地址；历史裸模型
  ID 继续兼容。
- GPT-5.6 的 `reasoning_effort` 可用 `none / low / medium / high / xhigh / max`。
  运行器默认始终使用 Responses API，不因无工具或 `none` 而改走 Chat。仅旧代理可
  显式配置 `api_surface: "chat_completions"`；`allow_chat_fallback: true` 也必须
  明确开启，且只允许在尚未执行任何工具时回退。

## 三、执行与故障边界

### 生产交接约定（2026-09-07）

- 12 个启用岗位的 `roleProfile` 包含“生产交接约定 v1”，保留原有专业判断框架。
  当前调用的输出合同优先于员工默认 JSON 示例；知识库和历史记忆不能覆盖当前项目。
- 文字阶段允许按本项目推导必要制作细节并记录 `assumptions`。首次角色/场景设计不需要
  已有母版图；缺少可选尾帧、完整表情集、表演视频或后续成片不能阻塞当前文本任务。
  已确认身份冲突、当前必需素材缺失、权限与付费授权仍必须阻塞，不能编造 URL 或验收证据。
- 看板与快速制作调用 `POST /production/projects/{pid}/generate` 时统一传递
  `PRODUCTION_CARDS_SCHEMA`。`cards[].metadata` 保存资产版本、镜头标识、假设和阻塞；
  非空 `blockers` 不会被标记为静态验收通过。历史 `---` 文本格式仍兼容。
- 漫剧团队 `setting` 在没有显式员工且没有单一岗位要求时，自动调用人物、场景两个岗位，
  先完成的人物资料传给场景岗。先校验两个员工都可用；全部成功才落卡，失败不清空旧卡。
  `design` 默认由媒体提示词工程师生成文字设计卡；实际生图仍是独立、需授权的操作。
- 下游上下文携带真实素材地址、当前状态及相关元数据。存在素材不等于通过视觉质检。
  单镜返工保留全局角色/场景设定，但不加入其他集的剧情卡片。
- 分镜必须给出起始姿态、结束姿态、画面位置、视线方向、前景、中景和背景；动作轨迹与
  相机轨迹分开。正向提示词的展示副本不参与重复纹理计数，真实负向表达仍被拦截。

配置源为 `data/employees/comic-*.json`，内置迁移清单为 revision 9。维护旧安装时，
`python scripts/upgrade_comic_handoffs.py` 仅预览；明确加 `--write` 才增补已启用岗位，
不覆盖原有画像、模型、工具或启用状态，重复运行不重复追加。随后运行
`python scripts/build_comic_team_manifest.py` 更新打包清单。用户认领的员工仍受迁移保护。

### 媒体执行

1. 运行时根据 `outputModalities` 自动给员工注入媒体工具。
2. 员工明确需要图片时调用 `generate_image`；`reference_urls` 可携带已审核角色、
   场景、风格母版，图片下载到平台本地并返回 URL。
3. 员工明确需要视频时调用 `generate_video`。首末帧模式与普通参考图模式互斥，
   响应中的 `jobId` 会强制保留在回复里。
4. 视频完成前使用 `check_video_generation` 查询；完成后下载 MP4 并在工作台显示播放器。
5. 图片/视频 QA 必须调用 `inspect_media`：图片读取真实像素，平台视频由 FFmpeg
   均匀抽取前、中、后段画面；不可访问时返回 `blocked`。
6. 媒体接口失败只使本次工具调用失败，不会把媒体模型回退到 Chat Completions。

当前边界：

- 普通对话附件仍按会话文件处理；工作流质检使用独立 `inspect_media` 工具读取视觉证据。
- 漫剧快速制作会把媒体请求绑定到关键帧/视频员工的模型配置，并把结果回填制作卡片；
  普通员工对话生成的素材仍先落到共享上传目录。
- 视频生成属于付费异步任务；工具只在用户明确提出最终视频时调用。跨会话后台轮询和统一
  媒体任务中心属于下一阶段能力。
