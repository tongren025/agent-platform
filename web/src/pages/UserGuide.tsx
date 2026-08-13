// 面向普通创作者的系统使用手册：从第一次进入到逐镜出片，并提供术语和故障排查。
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Empty, Input, Tag, Typography } from 'antd';
import {
  ArrowRightOutlined,
  BookOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  ExperimentOutlined,
  MobileOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  SearchOutlined,
  SettingOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { START_USER_GUIDE_EVENT } from '../components/UserHelpCenter';
import { MEMORY_SWORDSMAN_STARTER } from '../storyStarters';
import './UserGuide.css';

const { Paragraph, Text, Title } = Typography;

type GuideSection = {
  id: string;
  title: string;
  summary: string;
  keywords: string;
  content: React.ReactNode;
};

const productionSteps = [
  ['01', '故事设定', '一句话创意、世界观、人物关系和剧情方向'],
  ['02', '剧本', '场次、动作、台词、情绪和预计时长'],
  ['03', '视觉母版', '统一画风、色彩、光影、画幅和时代质感'],
  ['04', '人物设定', '主角三视图、表情、服装、比例和标志配饰'],
  ['05', '场景设定', '高频场景全景、方向、日夜、灯光和主要道具'],
  ['06', '逐镜分镜', '每个镜头的构图、景别、人物位置和叙事作用'],
  ['07', '镜头动态', '人物走位、摄像机运动、时长和剪辑节奏'],
  ['08', '首尾关键帧', '把人物、场景与构图合成可直接生视频的干净画面'],
  ['09', '视频生成', '逐镜提交视频，失败只重做当前镜头'],
  ['10', '审片与成片', '检查一致性、排序、字幕、声音、转场和导出'],
];

export default function UserGuide() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const sections = useMemo<GuideSection[]>(() => [
    {
      id: 'mobile',
      title: '手机模式：灵感随手拍',
      summary: '手机只保留轻制作：说一个想法，一次完成一个下一步。',
      keywords: '手机 移动端 灵感 随手拍 热门 短视频 语音 竖屏 小制作',
      content: (
        <>
          <ol className="guide-numbered-list">
            <li><strong>说出灵感</strong><span>输入或语音说一句话，不需要先懂剧本、分镜和提示词。</span></li>
            <li><strong>和导演聊清楚</strong><span>导演每次只问一个关键问题，并帮你补前三秒钩子、冲突和结尾记忆点。</span></li>
            <li><strong>确认开拍</strong><span>选 15 或 30 秒竖屏视频，点击“按这个方向开拍”。系统自动建立真实项目。</span></li>
            <li><strong>看一眼，再继续</strong><span>系统按镜头逐个生成。满意才进入下一步，不满意只重做当前画面或视频。</span></li>
          </ol>
          <div className="guide-callout">
            <MobileOutlined />
            <p><strong>手机负责小制作，电脑负责大制作。</strong>手机适合随时记灵感、和导演讨论、做 15–30 秒短片；多集漫剧、复杂人物资产和精细时间线请回到电脑继续。</p>
          </div>
          <Button type="primary" icon={<MobileOutlined />} onClick={() => navigate('/mobile')}>
            打开灵感随手拍
          </Button>
        </>
      ),
    },
    {
      id: 'start',
      title: '电脑端：3 分钟开始',
      summary: '不知道从哪里开始，就只做这四步。',
      keywords: '开始 新手 一句话 快速制作 创建 项目 下一步',
      content: (
        <ol className="guide-numbered-list">
          <li><strong>打开“快速制作”</strong><span>点击左侧快速制作，再点“新建制作”。</span></li>
          <li><strong>说一句故事</strong><span>不用先写专业剧本。可套用示例灵感“{MEMORY_SWORDSMAN_STARTER.idea}”；它只是可编辑起点，创建后才会成为项目。</span></li>
          <li><strong>选择目标</strong><span>新手建议选“制作完整成片”；只想预演故事可以先选“文字分镜”。</span></li>
          <li><strong>完成当前下一步</strong><span>页面只会突出现在该做的事。完成后自动进入下一阶段。</span></li>
        </ol>
      ),
    },
    {
      id: 'workflow',
      title: '完整专业流程',
      summary: '系统把专业动画与 AI 视频流程拆成 10 个可执行阶段。',
      keywords: '流程 故事 剧本 视觉母版 人物三视图 场景 分镜 动态 首帧 尾帧 视频 后期',
      content: (
        <>
          <div className="guide-pipeline">
            {productionSteps.map(([number, title, description]) => (
              <div key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            ))}
          </div>
          <div className="guide-callout is-important">
            <QuestionCircleOutlined />
            <p><strong>为什么不能拿人物三视图直接生视频？</strong>三视图是一张角色参考表，视频模型可能把三个人并排当成真实画面。正确做法是“人物参考 + 场景参考 + 分镜构图 → 干净镜头首帧 → 视频”。</p>
          </div>
        </>
      ),
    },
    {
      id: 'pages',
      title: '每个页面是做什么的',
      summary: '找不到功能时，先看这张页面地图。',
      keywords: '今日制作 快速制作 我的项目 画布 员工 工作台 页面 导航',
      content: (
          <div className="guide-page-map">
          <div><MobileOutlined /><span><strong>灵感随手拍</strong><small>手机轻制作入口，聊天定方向，一次只生成一个镜头。</small></span></div>
          <div><CompassOutlined /><span><strong>今日制作</strong><small>查看最重要的项目、风险和系统推荐下一步。</small></span></div>
          <div><PlayCircleOutlined /><span><strong>快速制作</strong><small>新人主入口，从一句话沿单一路径做到成片。</small></span></div>
          <div><BookOutlined /><span><strong>我的项目</strong><small>打开已有作品，继续上次未完成的集和镜头。</small></span></div>
          <div><CameraOutlined /><span><strong>画布中心</strong><small>按集、按镜头管理剧本、参考资产、关键帧和视频。</small></span></div>
          <div><RobotOutlined /><span><strong>找数字员工帮忙</strong><small>直接向编剧、导演、设计师等员工提出专业问题。</small></span></div>
          <div><SettingOutlined /><span><strong>管理数字员工</strong><small>高级设置：分配文字、生图、视频模型与员工能力。</small></span></div>
        </div>
      ),
    },
    {
      id: 'canvas',
      title: '逐镜画布怎么用',
      summary: '画布不是无限堆卡片，而是一集中的一个镜头工作台。',
      keywords: '画布 集 镜头 G1 G2 节点 连线 当前镜头 创建任务 生图 视频',
      content: (
        <div className="guide-canvas-flow">
          <div>
            <Tag color="purple">1</Tag>
            <span><strong>先选集</strong><small>左侧展开“第 1 集、第 2 集……”</small></span>
          </div>
          <ArrowRightOutlined />
          <div>
            <Tag color="blue">2</Tag>
            <span><strong>再选镜头</strong><small>选择 G1、G2……画面只聚焦当前镜头。</small></span>
          </div>
          <ArrowRightOutlined />
          <div>
            <Tag color="cyan">3</Tag>
            <span><strong>按顶部按钮</strong><small>系统创建当前镜头缺少的节点或生成任务。</small></span>
          </div>
          <ArrowRightOutlined />
          <div>
            <Tag color="green">4</Tag>
            <span><strong>检查后进入下一镜</strong><small>失败只重做本镜头，不影响整集。</small></span>
          </div>
        </div>
      ),
    },
    {
      id: 'models',
      title: '模型和数字员工',
      summary: '员工负责思考和编排，图片/视频模型负责真正生成媒体。',
      keywords: '模型 员工 GPT OpenRouter 生图 视频 备用模型 慢 失败',
      content: (
        <>
          <div className="guide-comparison">
            <div><RobotOutlined /><strong>数字员工</strong><p>理解你的要求、使用专业提示词、决定调用哪些工具并组织生产步骤。</p></div>
            <div><ExperimentOutlined /><strong>文字模型</strong><p>负责剧本、导演规划、提示词和工具编排；失效时会尝试平台已配置的备用文字模型。</p></div>
            <div><CameraOutlined /><strong>图片模型</strong><p>负责人物、场景、分镜和关键帧；必须在员工配置中启用图片能力。</p></div>
            <div><VideoCameraOutlined /><strong>视频模型</strong><p>接收首帧、可选尾帧和运动说明，逐镜生成视频。</p></div>
          </div>
          <div className="guide-callout">
            <CheckCircleOutlined />
            <p><strong>新手无需手动挑每一个模型。</strong>先使用系统推荐配置；只有模型不可用、速度或成本不合适时，再到“管理数字员工”调整。</p>
          </div>
        </>
      ),
    },
    {
      id: 'prompts',
      title: '提示词与自我学习',
      summary: '系统提示词有默认专业模板，也可以继续学习你的风格。',
      keywords: '提示词 学习 人物 场景 分镜 风格 模板 知识库',
      content: (
        <div className="guide-text-block">
          <Paragraph>人物、场景、分镜、关键帧和视频都使用各自的生产提示词模板。你在画布里看到的输入是项目要求，不是系统提示词的全部内容。</Paragraph>
          <Paragraph>“自动化学习”可收集优秀提示词，“文章学习”可学习导演、摄影和美术资料；学习结果进入员工知识和长期记忆，用于后续创作。</Paragraph>
          <Paragraph>建议先完成一个短项目，再把满意结果标记为范例。没有质量反馈的盲目采集，通常比少量高质量范例更不稳定。</Paragraph>
        </div>
      ),
    },
    {
      id: 'troubleshooting',
      title: '常见问题',
      summary: '模型慢、画布卡、生成失败或不知道下一步时先看这里。',
      keywords: '问题 失败 卡 慢 不回答 模型 404 重试 刷新 排查',
      content: (
        <div className="guide-faq">
          <details><summary>模型为什么很慢？</summary><p>高推理模型、图片和视频本身需要更久。系统会处理流中断并尝试备用模型；若一直等待，可打开系统管家检查模型与运行状态（工作台入口在对话标题栏，其他页面在右下角）。</p></details>
          <details><summary>员工为什么不回答？</summary><p>先确认员工有文字模型；生图员工还需要图片模型，视频员工还需要视频模型。系统会自动过滤把图片模型当文字模型的错误配置。</p></details>
          <details><summary>画布为什么只看到几个节点？</summary><p>这是逐镜聚焦模式。系统只展示当前阶段和必要上游资产，避免整季节点一起渲染导致卡顿。可在左侧切换集和镜头。</p></details>
          <details><summary>生成错了会不会影响整季？</summary><p>不会。逐镜模式按当前 G 镜头创建和替换节点，重新生成只处理当前镜头。</p></details>
          <details><summary>仍然解决不了怎么办？</summary><p>点击耳机图标打开系统管家（工作台入口在对话标题栏，其他页面在右下角）。它会读取当前页面和最近运行状态；描述你点了什么、看到了什么即可。</p></details>
        </div>
      ),
    },
  ], []);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = normalizedQuery
    ? sections.filter(section => `${section.title} ${section.summary} ${section.keywords}`.toLowerCase().includes(normalizedQuery))
    : sections;

  const replayGuide = () => {
    window.dispatchEvent(new CustomEvent(START_USER_GUIDE_EVENT));
  };

  return (
    <main className="user-guide-page" aria-labelledby="user-guide-title">
      <header className="user-guide-hero">
        <div>
          <span className="user-guide-kicker">AGENT STUDIO HANDBOOK</span>
          <Title id="user-guide-title" level={1}>系统使用手册</Title>
          <Paragraph>从一句想法到一集成片：先告诉你现在按哪里，再解释背后的专业流程。</Paragraph>
          <div className="user-guide-actions">
            <Button type="primary" icon={<MobileOutlined />} onClick={() => navigate('/mobile')}>
              手机随手拍
            </Button>
            <Button icon={<PlayCircleOutlined />} onClick={() => navigate('/studio')}>
              电脑做完整项目
            </Button>
            <Button icon={<CompassOutlined />} onClick={replayGuide}>重新播放新手引导</Button>
          </div>
        </div>
        <div className="user-guide-hero-card" aria-label="最短制作路径">
          <span>一句话创意</span><ArrowRightOutlined />
          <span>跟随下一步</span><ArrowRightOutlined />
          <span>逐镜出片</span>
        </div>
      </header>

      <div className="user-guide-search">
        <Input
          allowClear
          size="large"
          prefix={<SearchOutlined aria-hidden="true" />}
          placeholder="搜索：人物三视图、画布、模型慢、提示词……"
          value={query}
          onChange={event => setQuery(event.target.value)}
          aria-label="搜索使用手册"
        />
        <Text>{visibleSections.length} 个相关章节</Text>
      </div>

      <div className="user-guide-layout">
        <aside className="user-guide-toc" aria-label="手册目录">
          <strong>目录</strong>
          <nav>
            {visibleSections.map((section, index) => (
              <a key={section.id} href={`#${section.id}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>{section.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="user-guide-content">
          {visibleSections.length ? visibleSections.map(section => (
            <section id={section.id} key={section.id} className="user-guide-section">
              <div className="user-guide-section-heading">
                <div>
                  <Title level={2}>{section.title}</Title>
                  <Paragraph>{section.summary}</Paragraph>
                </div>
                <a href="#user-guide-title">返回顶部</a>
              </div>
              {section.content}
            </section>
          )) : (
            <Empty description="没有找到相关章节，换个更短的关键词试试">
              <Button onClick={() => setQuery('')}>查看全部手册</Button>
            </Empty>
          )}
        </article>
      </div>
    </main>
  );
}
