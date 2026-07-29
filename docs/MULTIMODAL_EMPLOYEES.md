# 多模态数字员工模型设计

这套系统把“会思考”和“会产出媒体”拆成独立能力。员工永远先用聊天模型理解任务、
制定方案和编排工具；只有用户明确要求最终图片或视频时，才调用对应的专用生成接口。

## 一、岗位与推荐模型

| 岗位 | 输出能力 | 思考模型 `model_id` | 专用媒体模型 | 原因 |
|---|---|---|---|---|
| 漫剧导演 | text | `gpt-5.6-sol` | — | 跨剧本、画面、节奏做高难度统筹 |
| 分镜师 | text | `gpt-5.6-sol` | — | 需要较强镜头连续性和结构推理 |
| 质量检查员 | text | `gpt-5.6-sol` | — | 负责跨阶段一致性、断链和成片质量判断 |
| 编剧 | text | `gpt-5.6-terra` | — | 高质量写作，调用频率高，兼顾成本 |
| 角色设计师 | text | `gpt-5.6-terra` | — | 产出身份、服装、比例、表情等文字规格 |
| 场景设计师 | text | `gpt-5.6-terra` | — | 产出空间、材质、光线与可复用场景规格 |
| 特效/轨迹设计师 | text | `gpt-5.6-terra` | — | 产出效果与运动轨迹规范 |
| 角色原画师 | text + image | `gpt-5.6-terra` | `gpt-image-2` | Terra 整理 Art Bible，GPT Image 2 真正出图 |
| 场景原画师 | text + image | `gpt-5.6-terra` | `gpt-image-2` | 文字规划与最终图片分开调用 |
| 关键帧原画师 | text + image | `gpt-5.6-terra` | `gpt-image-2` | 先锁定镜头要求，再生成关键帧 |
| 图片/视频提示词工程师 | text | `gpt-5.6-terra` | — | 只负责把上游资产整理为结构化生成提示词 |
| 视频生成师 | text + video | `gpt-5.6-terra` | `openrouter:bytedance/seedance-2.0` | 消费已审核提示词，异步产出 MP4 |

GPT-5.6 档位说明以 [OpenAI 最新模型指南](https://developers.openai.com/api/docs/guides/latest-model)
为准；GPT Image 2 的能力与接口见
[OpenAI GPT Image 2 模型页](https://developers.openai.com/api/docs/models/gpt-image-2)。
第三方代理必须实际提供同名模型和对应端点，只有“兼容 OpenAI 地址”不代表它一定支持。

## 二、员工配置契约

```json
{
  "outputModalities": ["text", "image"],
  "defaultModelPolicy": {
    "model_id": "openai代理:gpt-5.6-terra",
    "image_model_id": "openai代理:gpt-image-2",
    "temperature": 0.7,
    "max_tokens": 8192
  }
}
```

- `model_id`：唯一可以进入 Chat Completions 的思考模型。
- `image_model_id`：仅在声明 `image` 能力时必填，通过图片专用接口调用。
- `video_model_id`：仅在声明 `video` 能力时必填，通过异步视频接口调用。
- `outputModalities`：必须包含 `text`；媒体能力只是员工可调用的工具，不替代思考模型。
- `openrouter:` 前缀表示固定走平台已配置的 OpenRouter 媒体供应商。
- 管理页保存 `供应商名:模型 ID`，避免多个供应商有同名模型时调用错地址；历史裸模型
  ID 继续兼容。

## 三、执行与故障边界

1. 运行时根据 `outputModalities` 自动给员工注入媒体工具。
2. 员工明确需要图片时调用 `generate_image`，图片会下载到平台本地并返回 URL。
3. 员工明确需要视频时调用 `generate_video`，响应中的 `jobId` 会强制保留在回复里。
4. 视频完成前使用 `check_video_generation` 查询；完成后下载 MP4 并在工作台显示播放器。
5. 媒体接口失败只使本次工具调用失败，不会把媒体模型回退到 Chat Completions。

当前边界：

- 对话工作台上传图片目前仍以文件链接进入消息，不等同于把图片像素作为视觉输入发送给
  GPT-5.6；真正的“看图分析”需后续扩展消息内容协议。
- 员工对话生成的素材先落到共享上传目录，不自动写入制作看板卡片；制作看板继续使用现有
  导演媒体流水线和费用确认机制。
- 视频生成属于付费异步任务；工具只在用户明确提出最终视频时调用。跨会话后台轮询和统一
  媒体任务中心属于下一阶段能力。
