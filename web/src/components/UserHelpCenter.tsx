// 全局新人帮助：首次进入自动播放聚焦引导，问号抽屉提供快速说明、手册入口和重播能力。
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Drawer, Space, Tour, Typography, type TourProps } from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import './UserHelp.css';

const { Paragraph, Text, Title } = Typography;

export const START_USER_GUIDE_EVENT = 'agent-studio:start-user-guide';
const GUIDE_STORAGE_KEY = 'agent-studio:user-guide:v1';

type UserHelpCenterProps = {
  isMobile: boolean;
  onMobileGuideOpen: () => void;
  onMobileGuideClose: () => void;
};

function findTourTarget(name: string): HTMLElement {
  // 导航按权限渲染；极端情况下目标不可见时回退到页面本身，保证引导仍可关闭。
  return document.querySelector<HTMLElement>(`[data-user-guide="${name}"]`) ?? document.body;
}

export default function UserHelpCenter({
  isMobile,
  onMobileGuideOpen,
  onMobileGuideClose,
}: UserHelpCenterProps) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideCurrent, setGuideCurrent] = useState(0);

  const startGuide = () => {
    setDrawerOpen(false);
    setGuideCurrent(0);
    setGuideOpen(true);
    if (isMobile) onMobileGuideOpen();
  };

  const finishGuide = () => {
    localStorage.setItem(GUIDE_STORAGE_KEY, new Date().toISOString());
    setGuideOpen(false);
    if (isMobile) onMobileGuideClose();
  };

  useEffect(() => {
    const startFromEvent = () => startGuide();
    window.addEventListener(START_USER_GUIDE_EVENT, startFromEvent);
    const timer = window.setTimeout(() => {
      // 手机轻制作有自己的四步引导，避免两个弹层首次进入时互相遮挡。
      if (window.location.pathname !== '/mobile' && !localStorage.getItem(GUIDE_STORAGE_KEY)) startGuide();
    }, 900);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(START_USER_GUIDE_EVENT, startFromEvent);
    };
    // 首次进入只在组件挂载时判断；响应式状态变化不能重复触发。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = useMemo<TourProps['steps']>(() => [
    {
      title: '欢迎来到 Agent Studio',
      description: '你不需要先学模型或节点。最简单的方式是进入“快速制作”，输入一句故事想法，然后一直按系统给出的下一步。',
      target: () => findTourTarget('brand'),
      nextButtonProps: { children: '开始认识' },
    },
    {
      title: '第一站：快速制作',
      description: '新手从这里开始。系统会按剧本、视觉母版、人物、场景、分镜、镜头图、视频和成片的顺序带你制作。',
      target: () => findTourTarget('quick-production'),
    },
    {
      title: '已有项目都在这里',
      description: '“我的项目”保存你的作品。下次回来直接打开原项目继续，不需要重新创建。',
      target: () => findTourTarget('projects'),
    },
    {
      title: '画布按集和镜头工作',
      description: '进入画布后先选第几集，再选镜头 G1、G2……每次只制作当前镜头，主角、场景和分镜会作为上游参考。',
      target: () => findTourTarget('canvas'),
    },
    {
      title: '遇到问题先看手册',
      description: '使用手册包含从一句话到成片的完整操作、术语解释、模型与员工说明，以及常见问题。',
      target: () => findTourTarget('manual'),
    },
    {
      title: '问号随时可以重播',
      description: '以后看到不懂的术语，可点页面里的小问号；也可以点这个固定问号打开快速帮助或重新播放本引导。',
      target: () => findTourTarget('help-trigger'),
      nextButtonProps: { children: '我知道了' },
    },
  ], []);

  return (
    <>
      <button
        type="button"
        className="global-help-trigger"
        data-user-guide="help-trigger"
        aria-label="打开帮助与新手指引"
        onClick={() => setDrawerOpen(true)}
      >
        <QuestionCircleOutlined aria-hidden="true" />
        <span className="global-help-label">帮助</span>
      </button>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width="min(440px, 100vw)"
        title={(
          <Space>
            <CompassOutlined />
            <span>帮助与新手指引</span>
          </Space>
        )}
        className="user-help-drawer"
      >
        <div className="user-help-welcome">
          <span className="user-help-kicker">第一次使用？</span>
          <Title level={3}>记住一件事：跟着“下一步”走</Title>
          <Paragraph>
            从一句故事想法开始，系统负责把专业流程拆成你现在只需要完成的一步。
          </Paragraph>
          <Space wrap>
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={startGuide}>
              播放新手引导
            </Button>
            <Button icon={<BookOutlined />} onClick={() => {
              setDrawerOpen(false);
              navigate('/guide');
            }}>
              打开完整手册
            </Button>
          </Space>
        </div>

        <section className="user-help-section" aria-labelledby="help-fast-path">
          <Title id="help-fast-path" level={4}>最短使用路径</Title>
          <ol className="user-help-steps">
            <li><span>1</span><div><strong>说一句故事</strong><Text>例如：失忆剑客发现追杀自己的人是未来的自己。</Text></div></li>
            <li><span>2</span><div><strong>选择交付目标</strong><Text>只要分镜、要镜头图，或直接做到完整成片。</Text></div></li>
            <li><span>3</span><div><strong>一直完成下一步</strong><Text>先定故事和角色，再逐镜出图、生视频、审片。</Text></div></li>
          </ol>
        </section>

        <section className="user-help-section" aria-labelledby="help-where">
          <Title id="help-where" level={4}>我现在该去哪里？</Title>
          <div className="user-help-destinations">
            <button type="button" onClick={() => { setDrawerOpen(false); navigate('/studio'); }}>
              <VideoCameraOutlined /><span><strong>我要做一个新作品</strong><small>进入快速制作</small></span>
            </button>
            <button type="button" onClick={() => { setDrawerOpen(false); navigate('/production'); }}>
              <ReloadOutlined /><span><strong>我要继续以前的作品</strong><small>打开我的项目</small></span>
            </button>
            <button type="button" onClick={() => { setDrawerOpen(false); navigate('/workbench'); }}>
              <MessageOutlined /><span><strong>我想直接问员工</strong><small>进入员工工作台</small></span>
            </button>
          </div>
        </section>

        <div className="user-help-tip">
          <CheckCircleOutlined />
          <span>人物三视图和场景设定是参考资产，不能直接作为视频首帧；系统会先合成干净的镜头关键帧。</span>
        </div>
      </Drawer>

      <Tour
        open={guideOpen}
        current={guideCurrent}
        onChange={setGuideCurrent}
        onClose={finishGuide}
        steps={steps}
        mask={{ color: 'rgba(9, 13, 29, 0.72)' }}
        gap={{ offset: 0, radius: 12 }}
        indicatorsRender={(current, total) => <span>{current + 1} / {total}</span>}
        zIndex={2200}
      />
    </>
  );
}
