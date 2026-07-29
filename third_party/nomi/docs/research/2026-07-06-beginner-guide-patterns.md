# 2026-07-06 新手文档调研：Nomi 官网上手页

## 目标

为 Nomi 写一份可部署到官网的新手文档。它不是 API 手册，而是让第一次打开 Nomi 的用户在 3-10 分钟内完成“第一条可见结果”，并理解 3D 导演台 / Image-to-Video 参考工作流。

## 参考对象

- Runway Academy：把视频创作拆成课程、教程、Prompt Guide，并把镜头运动词汇独立成可学习对象。参考点：视频工具的新手文档要把 camera movement / prompt / workflow 放在同一个学习路径里。来源：https://academy.runwayml.com/
- Runway Gen-4.5 Image to Video：单独给 Image-to-Video 开教程入口。参考点：Nomi 的“参考图 → 视频模型”必须作为独立路径，而不是藏在普通视频生成里。来源：https://academy.runwayml.com/tutorial/gen-45-image-to-video
- Figma Get started：用“Find your way around → starter projects → expand knowledge”的渐进结构。参考点：先导航、再做小项目、最后扩展。来源：https://help.figma.com/hc/en-us/categories/360002051613-Get-started
- Notion basics / Start here：用“building blocks”解释抽象产品。参考点：Nomi 应该用“剧本 / 画布节点 / 参考图 / 时间轴”这类积木隐喻解释，而不是一上来讲模型参数。来源：https://www.notion.com/help/category/new-to-notion 和 https://www.notion.com/help/start-here
- Canva beginner guide：从账号、顶部菜单、模板、媒体上传、分享导出串起来。参考点：新手教程应该围绕“创建、上传/引用素材、编辑、导出”走，不先讲概念百科。来源：https://www.canva.com/learn/how-to-canva-beginners-guide/

## 对 Nomi 的设计结论

1. 第一屏要回答“我现在点哪里能开始”，不能只讲愿景。
2. 文档结构采用四段：
   - 安装和第一屏
   - 模型接入最小闭环
   - 第一条成片路径
   - 3D / Image-to-Video 的高级但核心参考路径
3. 每段都配一张图，避免纯文字。图片优先使用可维护的 SVG 示意图：
   - 安装流程图
   - 模型接入流程图
   - 3D 导演台图
   - Image-to-Video 参考图/参考视频图
4. 真实卡点必须提前写：
   - macOS 未签名拦截
   - 缺文本模型导致 AI 助手 / 拆镜不能工作
   - 图生视频时没连参考图导致一致性差
   - 想要对口型这类暂不支持能力要诚实标注
5. 官网入口要从首页导航、下载区、footer 三处可达；sitemap 要加入新手页。
