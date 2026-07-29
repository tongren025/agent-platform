// 项目故事总览：先用一句话和已生成画面讲清故事，再把制作数据收进次级区域。
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Breadcrumb,
  Button,
  Collapse,
  Empty,
  Image,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  EyeOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  RightOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { thumbUrl, onImageError } from '../media';
import ProjectViewNav from '../components/ProjectViewNav';
import {
  extractOneLineStory,
  extractStoryArc,
  extractStoryBeats,
  extractStoryTheme,
  extractWorldAssets,
  friendlyCopy,
  friendlyProjectName,
  protagonistAppearsAtEnding,
  projectTypePresentation,
  type StoryCardLike,
} from '../storyPresentation';
import './StoryProjects.css';

const { Text, Title, Paragraph } = Typography;

interface StageInfo {
  key: string;
  name: string;
  order: number;
  auto: boolean;
}

interface StoryPreview {
  available_images: number;
  approved_images?: number;
  expected_images: number;
  missing_images: number;
  preview_images: string[];
  video_count: number;
  has_final_video: boolean;
}

interface Readiness {
  units: number;
  spec_rate: number;
  image_rate: number;
  video_rate: number;
  delivery_rate: number;
  overall_progress: number;
  blockers: number;
  next_action: string;
}

interface Project {
  project_id: string;
  name: string;
  description: string;
  source_type: string;
  source_content: string;
  settings?: Record<string, any>;
  cards?: StoryCardLike[];
  stages?: StageInfo[];
  stats?: {
    readiness?: Readiness;
    story_preview?: StoryPreview;
  };
  updated_at: string;
}

interface EpisodeInfo {
  episode: number;
  title: string;
  unitCount: number;
  imageCount: number;
  imageRate: number;
  thumbnail: string;
}

function extractEpisodeTitle(cards: StoryCardLike[], episode: number): string {
  const episodeCards = cards.filter(card => card.episode === episode);
  const brief = episodeCards.find(card => card.stage === 'idea');
  const script = episodeCards.find(card => card.stage === 'script' && card.shot_number === 0)
    || episodeCards.find(card => card.stage === 'script');
  const raw = brief?.title || script?.title || '';
  return friendlyCopy(raw)
    .replace(/^导演Brief\s*/i, '')
    .replace(/^EP\d+\s*/i, '')
    .replace(/^(?:G|W)\d+(?:[-–][A-Za-z0-9]+)?\s*/i, '')
    .trim();
}

function ProgressItem({
  label,
  percent,
  detail,
}: {
  label: string;
  percent: number;
  detail: string;
}) {
  return (
    <div className="story-progress-item">
      <div className="story-progress-item__label">
        <span>{label}</span>
        <strong>{percent}%</strong>
      </div>
      <Progress
        percent={percent}
        showInfo={false}
        size="small"
        strokeColor={percent === 100 ? '#10b981' : '#6366f1'}
      />
      <Text type="secondary" style={{ fontSize: 11 }}>{detail}</Text>
    </div>
  );
}

export default function ProductionHub() {
  const navigate = useNavigate();
  const { pid = '' } = useParams<{ pid: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectError, setProjectError] = useState('');

  useEffect(() => {
    void api.listProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  const loadProject = useCallback(async () => {
    if (!pid) return;
    setLoading(true);
    setProjectError('');
    try {
      setProject(await api.getProject(pid));
    } catch {
      setProject(null);
      setProjectError('暂时无法打开这个故事，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }, [pid]);

  useEffect(() => { void loadProject(); }, [loadProject]);

  const cards = project?.cards || [];
  const storyBeats = useMemo(() => extractStoryBeats(cards), [cards]);
  const generatedBeats = useMemo(
    () => storyBeats.filter(beat => Boolean(beat.image)),
    [storyBeats],
  );
  const storyArc = useMemo(
    () => project ? extractStoryArc(project, cards, storyBeats) : [],
    [project, cards, storyBeats],
  );
  const isWorldFirstPreview = project?.source_type === 'gc'
    && protagonistAppearsAtEnding(storyBeats);
  const visibleBeats = useMemo(() => (
    project?.source_type === 'gc' ? generatedBeats.slice(0, 30) : generatedBeats.slice(0, 12)
  ), [generatedBeats, project?.source_type]);
  const worldAssets = useMemo(() => extractWorldAssets(cards), [cards]);

  const episodes = useMemo<EpisodeInfo[]>(() => {
    if (project?.source_type === 'gc') return [];
    const episodeNumbers = Array.from(new Set(
      cards.map(card => card.episode).filter((episode): episode is number => episode != null),
    )).sort((a, b) => a - b);
    return episodeNumbers.map(episode => {
      const episodeCards = cards.filter(card => card.episode === episode);
      const episodeBeats = extractStoryBeats(episodeCards);
      const units = new Set(
        episodeCards.filter(card => card.shot_number > 0).map(card => card.shot_number),
      );
      const imageCount = episodeBeats.filter(beat => beat.image).length;
      const unitCount = units.size || episodeBeats.length;
      return {
        episode,
        title: extractEpisodeTitle(cards, episode) || `第 ${episode} 集`,
        unitCount,
        imageCount,
        imageRate: unitCount ? Math.min(100, Math.round(imageCount / unitCount * 100)) : 0,
        thumbnail: episodeBeats.find(beat => beat.image)?.image || '',
      };
    });
  }, [cards, project?.source_type]);

  if (loading) {
    return (
      <div className="story-centered-state" role="status" aria-live="polite">
        <Spin size="large" />
        <Text type="secondary">正在把故事和画面整理成阅读顺序…</Text>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <main className="story-page">
        <Alert
          type="error"
          showIcon
          message="故事打开失败"
          description={projectError || '没有找到这个项目。'}
          action={<Button onClick={() => void loadProject()}>重试</Button>}
        />
      </main>
    );
  }

  const type = projectTypePresentation(project.source_type);
  const oneLineStory = extractOneLineStory(project, cards);
  const theme = extractStoryTheme(project, cards);
  const backendReadiness = project.stats?.readiness;
  const preview = project.stats?.story_preview;
  const availableImages = preview?.available_images ?? generatedBeats.length;
  const approvedImages = preview?.approved_images
    || Math.min(Number(project.settings?.approved_image_count) || 0, availableImages);
  const expectedImages = preview?.expected_images || storyBeats.length;
  const missingImages = preview?.missing_images ?? Math.max(expectedImages - availableImages, 0);
  const localVideoCount = storyBeats.filter(beat => beat.video).length;
  const videoCount = preview?.video_count ?? localVideoCount;
  const shotUnitCount = new Set(
    cards
      .filter(card => card.shot_number > 0)
      .map(card => `${card.episode ?? 'global'}-${card.shot_number}`),
  ).size;
  const expectedVideos = shotUnitCount || expectedImages;
  const hasFinalVideo = preview?.has_final_video ?? cards.some(card => (
    card.stage === 'final' && card.status === 'done' && card.videos.length > 0
  ));
  const hasAllSpecs = ['script', 'storyboard', 'img_prompt', 'vid_prompt']
    .every(stage => cards.some(card => card.stage === stage));
  const shouldDeriveReadiness = expectedImages > 0 && (!backendReadiness || backendReadiness.units === 0);
  const derivedVideoRate = expectedVideos
    ? Math.min(100, Math.round(videoCount / expectedVideos * 100))
    : 0;
  const derivedSpecRate = hasAllSpecs ? 100 : 0;
  const derivedImageRate = expectedImages
    ? Math.min(100, Math.round(availableImages / expectedImages * 100))
    : 0;
  const derivedDeliveryRate = hasFinalVideo ? 100 : 0;
  const readiness: Readiness | undefined = shouldDeriveReadiness ? {
    units: expectedVideos,
    spec_rate: derivedSpecRate,
    image_rate: derivedImageRate,
    video_rate: derivedVideoRate,
    delivery_rate: derivedDeliveryRate,
    overall_progress: Math.round(
      derivedSpecRate * 0.4
      + derivedImageRate * 0.3
      + derivedVideoRate * 0.2
      + derivedDeliveryRate * 0.1,
    ),
    blockers: hasAllSpecs ? 0 : expectedVideos,
    next_action: !hasAllSpecs
      ? '先补齐故事与镜头说明'
      : missingImages > 0
        ? `还差 ${missingImages} 张剧情画面`
        : videoCount < expectedVideos
          ? `还差 ${expectedVideos - videoCount} 个镜头视频`
          : hasFinalVideo ? '成片已经可以交付' : '完成剪辑并导出成片',
  } : backendReadiness;
  const heroImage = generatedBeats[0]?.image || preview?.preview_images?.[0] || '';
  const hiddenGeneratedCount = Math.max(generatedBeats.length - visibleBeats.length, 0);

  return (
    <main className="story-page">
      <header className="story-detail-header">
        <div className="story-detail-heading">
          <Breadcrumb
            items={[
              {
                title: (
                  <a onClick={event => { event.preventDefault(); navigate('/production'); }} href="/production">
                    <HomeOutlined /> 我的项目
                  </a>
                ),
              },
              { title: friendlyProjectName(project.name) },
            ]}
          />
          <Title level={3}>{friendlyProjectName(project.name)}</Title>
        </div>
        <div className="story-detail-actions">
          {projects.length > 1 && (
            <Select
              value={pid}
              aria-label="切换故事项目"
              onChange={projectId => navigate(`/production/${projectId}`)}
              style={{ width: 220 }}
              options={projects.map(item => ({
                value: item.project_id,
                label: friendlyProjectName(item.name),
              }))}
            />
          )}
          <ProjectViewNav projectId={pid} current="overview" />
        </div>
      </header>

      <section className="story-summary-card" aria-labelledby="story-summary-title">
        <div className="story-summary-card__copy">
          <Text className="story-eyebrow">这个故事讲什么？</Text>
          <Title id="story-summary-title" level={2}>{oneLineStory}</Title>
          {theme && theme !== oneLineStory && (
            <Paragraph className="story-summary-card__theme">故事核心：{theme}</Paragraph>
          )}
          <div className="story-type-explainer">
            <Tag color={type.color}>{type.label}</Tag>
            <span>{type.explanation}</span>
          </div>
        </div>
        {heroImage ? (
          <div className="story-summary-card__visual">
            <img
              src={thumbUrl(heroImage, 512)}
              alt="故事第一幕预览"
              onError={onImageError}
            />
          </div>
        ) : (
          <div className="story-summary-card__visual story-summary-card__visual--empty">
            <PictureOutlined />
            <span>故事文字已经有了，剧情画面还没生成</span>
          </div>
        )}
      </section>

      {project.source_type === 'gc' && (
        <Alert
          className="story-narrative-alert"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message={isWorldFirstPreview ? '这版先讲世界，主角在最后两幕登场' : '这是高光概念预告，不是完整一集'}
          description={isWorldFirstPreview
            ? `前 ${Math.max(storyBeats.length - 2, 1)} 幕是在展示九大陆和灾变，最后两幕才由苍霖进入故事。所以前面的图更像世界奇观，这是这版预告的刻意安排，不是图片生成错了。`
            : '概念预告会挑最能说明世界、人物和悬念的画面，不一定像完整剧集那样连续表演。'}
        />
      )}

      {storyArc.length > 0 && (
        <section className="story-arc-section" aria-labelledby="story-arc-title">
          <div className="story-section-heading">
            <div>
              <Title id="story-arc-title" level={3}>先看懂故事怎么发展</Title>
              <Text type="secondary">四步看懂整体，再往下逐张看画面。</Text>
            </div>
          </div>
          <div className="story-arc-grid">
            {storyArc.map((item, index) => (
              <article className="story-arc-card" key={`${item.label}-${index}`}>
                <span className="story-arc-card__number">{index + 1}</span>
                <Text strong>{item.label}</Text>
                <Paragraph>{item.text}</Paragraph>
              </article>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="story-gallery-title">
        <div className="story-section-heading">
          <div>
            <Title id="story-gallery-title" level={3}>按顺序看故事</Title>
            <Text type="secondary">
              这里只放已经生成的剧情画面，不用翻提示词，也不展示空白占位。
            </Text>
          </div>
          {availableImages > 0 && (
            <span className="story-reading-hint">
              <CheckCircleOutlined />
              {approvedImages === availableImages
                ? `${availableImages} 张已经生成并通过`
                : `${availableImages} 张已经生成，可以直接看`}
            </span>
          )}
        </div>

        {visibleBeats.length ? (
          <div className="story-beat-grid">
            {visibleBeats.map(beat => (
              <article className="story-beat-card" key={beat.key}>
                <div className="story-beat-image">
                  <Image
                    src={thumbUrl(beat.image || '', 512)}
                    preview={{ src: beat.image, mask: '放大查看' }}
                    alt={`${beat.label}：${beat.description}`}
                    fallback=""
                    onError={onImageError}
                  />
                  <span className="story-beat-image__order">{beat.label}</span>
                </div>
                <div className="story-beat-body">
                  <div className="story-beat-meta">
                    <span>{beat.timeRange || '剧情画面'}</span>
                    {beat.video && <Tag color="green">可播放</Tag>}
                  </div>
                  <Title level={5}>{beat.title}</Title>
                  <div className="story-beat-description">{beat.description}</div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="story-empty-card">
            <Empty
              image={<img src="/empty-data.svg" alt="" width={160} />}
              description={(
                <Space direction="vertical" size={4}>
                  <Text strong>还没有能直接看的剧情图</Text>
                  <Text type="secondary">
                    文字、设定或提示词不会冒充成品画面；生成第一批图后会按故事顺序出现在这里。
                  </Text>
                </Space>
              )}
            >
              <Button
                type="primary"
                icon={<PictureOutlined />}
                onClick={() => navigate(`/production/${pid}/pipeline`)}
              >
                去生成剧情画面
              </Button>
            </Empty>
          </div>
        )}

        <div className="story-generation-note">
          <div className="story-generation-note__copy">
            <EyeOutlined />
            <div>
              <Text strong>
                {availableImages > 0
                  ? `现在可以顺着看 ${availableImages} 张剧情画面`
                  : '目前只能先读故事文字'}
              </Text>
              <br />
              <Text type="secondary">
                {missingImages > 0
                  ? `另外 ${missingImages} 张还没生成，已收起，不会混在现有画面中。`
                  : videoCount > 0
                    ? `剧情画面已齐，已有 ${videoCount} 段动态视频。`
                    : '剧情画面已经齐了；动态视频尚未生成。'}
                {hiddenGeneratedCount > 0 && ` 其余 ${hiddenGeneratedCount} 张请按分集继续查看。`}
              </Text>
            </div>
          </div>
          <Button
            icon={missingImages > 0 ? <PictureOutlined /> : <VideoCameraOutlined />}
            onClick={() => navigate(`/production/${pid}/pipeline`)}
          >
            {missingImages > 0 ? '进入制作，补齐画面' : '进入制作'}
          </Button>
        </div>
      </section>

      {worldAssets.length > 0 && (
        <section className="story-secondary-section" aria-labelledby="story-world-title">
          <div className="story-section-heading">
            <div>
              <Title id="story-world-title" level={4}>人物与世界</Title>
              <Text type="secondary">这些是角色、场景和画风参考，不会混进剧情顺序。</Text>
            </div>
          </div>
          <div className="story-world-grid">
            {worldAssets.map(asset => (
              <article className="story-world-card" key={asset.key}>
                <Image
                  src={thumbUrl(asset.image, 512)}
                  preview={{ src: asset.image, mask: '放大查看' }}
                  alt={`${asset.kind}：${asset.title}`}
                  fallback=""
                  onError={onImageError}
                />
                <div className="story-world-card__copy">
                  <Text type="secondary">{asset.kind}</Text>
                  <Text strong ellipsis={{ tooltip: asset.title }}>{asset.title}</Text>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {episodes.length > 0 && (
        <section className="story-secondary-section" aria-labelledby="story-episodes-title">
          <div className="story-section-heading">
            <div>
              <Title id="story-episodes-title" level={4}>分集故事</Title>
              <Text type="secondary">打开一集，继续按镜头查看剧情和画面。</Text>
            </div>
          </div>
          <div className="story-episode-grid">
            {episodes.map(episode => (
              <article
                className="story-episode-card"
                key={episode.episode}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/production/${pid}/ep/${episode.episode}`)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/production/${pid}/ep/${episode.episode}`);
                  }
                }}
              >
                <div className="story-episode-card__image">
                  {episode.thumbnail ? (
                    <img
                      src={thumbUrl(episode.thumbnail, 512)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={onImageError}
                    />
                  ) : <PlayCircleOutlined />}
                </div>
                <div className="story-episode-card__copy">
                  <Text type="secondary">第 {episode.episode} 集</Text>
                  <Title level={5} style={{ margin: '3px 0 0' }}>{episode.title}</Title>
                  <div className="story-episode-card__stats">
                    <span>{episode.unitCount} 个镜头</span>
                    <span>{episode.imageCount} 张画面可看</span>
                    <span>{episode.imageRate}% 已有画面</span>
                  </div>
                  <Progress
                    percent={episode.imageRate}
                    size="small"
                    showInfo={false}
                    strokeColor={episode.imageRate === 100 ? '#10b981' : '#6366f1'}
                    style={{ marginTop: 7 }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {readiness && (
        <section className="story-secondary-section" aria-label="制作进度">
          <Collapse
            items={[{
              key: 'production-progress',
              label: (
                <Space>
                  <Text strong>制作进度（需要时再看）</Text>
                  <Tag>{friendlyCopy(readiness.next_action)}</Tag>
                </Space>
              ),
              extra: <RightOutlined style={{ color: '#98a1b3' }} />,
              children: (
                <div className="story-progress-panel">
                  <ProgressItem
                    label="故事与镜头说明"
                    percent={readiness.spec_rate}
                    detail="剧本、分镜和生成说明"
                  />
                  <ProgressItem
                    label="剧情画面"
                    percent={readiness.image_rate}
                    detail={`${availableImages}/${expectedImages || readiness.units} 张可看`}
                  />
                  <ProgressItem
                    label="动态视频"
                    percent={readiness.video_rate}
                    detail={videoCount ? `${videoCount} 段已生成` : '尚未生成'}
                  />
                  <ProgressItem
                    label="最终成片"
                    percent={readiness.delivery_rate}
                    detail={hasFinalVideo ? '已经可以播放' : '尚未导出'}
                  />
                </div>
              ),
            }]}
          />
        </section>
      )}
    </main>
  );
}
