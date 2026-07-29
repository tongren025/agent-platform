// 面向非制作人员的故事展示层：把 GC、G 单元、聚合卡等内部结构翻译成可顺序阅读的剧情画面。

export interface StoryCardLike {
  card_id: string;
  stage: string;
  title: string;
  content: string;
  episode: number | null;
  shot_number: number;
  prompts?: string[];
  images: string[];
  videos: string[];
  status: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface StoryProjectLike {
  name: string;
  description?: string;
  source_type?: string;
  source_content?: string;
}

export interface StoryBeat {
  key: string;
  order: number;
  label: string;
  title: string;
  description: string;
  timeRange: string;
  image?: string;
  video?: string;
  sourceCard?: StoryCardLike;
}

export interface StoryArcItem {
  label: string;
  text: string;
}

export interface WorldAsset {
  key: string;
  title: string;
  kind: '角色' | '场景' | '视觉参考';
  image: string;
  sourceCard: StoryCardLike;
}

const IMAGE_STAGE_PRIORITY: Record<string, number> = {
  img_gen: 0,
  // 阅读页优先展示制片故事板；它表达剧情节拍，首帧图主要服务视频模型。
  storyboard: 1,
  img_prompt: 2,
  final: 3,
  vid_prompt: 4,
};

export function friendlyCopy(value = ''): string {
  return value
    .replace(/GC/gi, '概念预告片')
    .replace(/G\s*生成单元/g, '镜头')
    .replace(/G\s*单元/g, '镜头')
    .replace(/断链单元/g, '缺少制作信息的镜头')
    .trim();
}

export function friendlyProjectName(name = ''): string {
  return friendlyCopy(name)
    .replace(/概念预告片概念宣传片/g, '概念预告片')
    .replace(/（完整V\d+）/gi, '')
    .replace(/\s{2,}/g, ' ');
}

export function projectTypePresentation(sourceType = ''): {
  label: string;
  explanation: string;
  color: string;
} {
  if (sourceType === 'gc') {
    return {
      label: '概念预告片',
      explanation: '用 15–30 秒高光画面先看懂世界、人物和悬念；它不是完整一集。',
      color: 'purple',
    };
  }
  if (sourceType === 'novel') {
    return { label: '小说改编剧集', explanation: '从原著内容改编成连续剧集。', color: 'geekblue' };
  }
  if (sourceType === 'script') {
    return { label: '剧本项目', explanation: '已有剧本，继续制作人物、画面与成片。', color: 'blue' };
  }
  if (sourceType === 'outline') {
    return { label: '连续剧集', explanation: '按大纲推进的分集故事。', color: 'cyan' };
  }
  return { label: '故事创意', explanation: '从一个想法开始发展成可观看的故事。', color: 'default' };
}

function cleanMarkdown(value = ''): string {
  return friendlyCopy(value)
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function clampText(value: string, maxLength: number): string {
  const clean = cleanMarkdown(value);
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).replace(/[，、；：,\s]+$/, '')}…`;
}

function extractSection(content: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(
    new RegExp(`(?:^|\\n)\\s*(?:#{1,6}\\s*)?(?:\\*\\*)?${escaped}(?:\\*\\*)?[：:]?\\s*(?:\\n|\\s)([\\s\\S]*?)(?=\\n\\s*#{1,6}\\s|\\n\\s*\\*\\*[^\\n]+\\*\\*[：:]|$)`, 'i'),
  );
  return match?.[1]?.trim() || '';
}

function extractLabeledLine(content: string, labels: string[]): string {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = content.match(
      new RegExp(`(?:^|\\n)\\s*(?:[-*]\\s*)?(?:\\*\\*)?${escaped}(?:\\*\\*)?[：:]\\s*([^\\n]+)`, 'i'),
    );
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

export function extractOneLineStory(project: StoryProjectLike, cards: StoryCardLike[] = []): string {
  const storyCards = [...cards].sort((a, b) => {
    const score = (card: StoryCardLike) => (
      card.stage === 'script' ? 0 : card.stage === 'idea' ? 1 : 2
    );
    return score(a) - score(b);
  });
  for (const card of storyCards) {
    const section = extractSection(card.content || '', '一句话故事');
    if (section) return clampText(section.split(/\n\s*\n/)[0], 150);
  }
  const sourceLogline = extractLabeledLine(
    project.source_content || '',
    ['一句话故事', '核心命题', '故事梗概'],
  );
  if (sourceLogline) return clampText(sourceLogline, 150);
  if (project.description?.trim()) return clampText(project.description, 150);
  if (project.source_content?.trim()) {
    const firstUsefulLine = project.source_content
      .split(/\r?\n/)
      .map(line => cleanMarkdown(line))
      .find(line => line.length > 8 && !line.startsWith('《'));
    if (firstUsefulLine) return clampText(firstUsefulLine, 150);
  }
  return '这个项目还没有写清一句话故事。补上一句话后，任何人都能先看懂它讲什么。';
}

export function extractStoryTheme(project: StoryProjectLike, cards: StoryCardLike[] = []): string {
  const sourceTheme = extractLabeledLine(project.source_content || '', ['核心命题', '主题']);
  if (sourceTheme) return clampText(sourceTheme, 100);
  for (const card of cards) {
    const theme = extractLabeledLine(card.content || '', ['核心命题', '主题', '结尾钩子']);
    if (theme) return clampText(theme, 100);
  }
  return '';
}

export function extractStoryArc(
  project: StoryProjectLike,
  cards: StoryCardLike[],
  beats: StoryBeat[],
): StoryArcItem[] {
  const explicit = (project.source_content || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .map(line => {
      const phase = line.match(
        /^((?:第一|第二|第三|第四)(?:幕|阶段)(?:「[^」]+」)?)(?:\s*[^：:]*)?[：:]\s*(.+)$/,
      );
      if (phase) return { label: cleanMarkdown(phase[1]), text: clampText(phase[2], 100) };
      const named = line.match(/^(开场|发展|转折|结尾)[：:]\s*(.+)$/);
      return named ? { label: cleanMarkdown(named[1]), text: clampText(named[2], 100) } : null;
    })
    .filter((item): item is StoryArcItem => Boolean(item?.text))
    .slice(0, 4)
    ;
  if (explicit.length >= 2) return explicit;

  const hook = extractLabeledLine(project.source_content || '', ['结尾钩子', '悬念钩子'])
    || cards.map(card => extractLabeledLine(card.content || '', ['结尾钩子', '悬念钩子'])).find(Boolean)
    || '';
  if (!beats.length) return hook ? [{ label: '最后悬念', text: clampText(hook, 100) }] : [];

  const indexes = Array.from(new Set([
    0,
    Math.min(beats.length - 1, Math.floor(beats.length * 0.38)),
    Math.min(beats.length - 1, Math.floor(beats.length * 0.72)),
    beats.length - 1,
  ]));
  const labels = ['开场', '危机升级', '真相显露', '最后悬念'];
  return indexes.map((beatIndex, index) => ({
    label: labels[Math.min(index, labels.length - 1)],
    text: index === indexes.length - 1 && hook
      ? clampText(hook, 100)
      : clampText(beats[beatIndex].description, 100),
  }));
}

export function protagonistAppearsAtEnding(beats: StoryBeat[]): boolean {
  if (beats.length < 6) return false;
  const protagonist = /苍霖|主角|主人公|少年|少女|女主|男主/;
  return !beats.slice(0, -2).some(beat => protagonist.test(beat.description))
    && beats.slice(-2).some(beat => protagonist.test(beat.description));
}

interface StoryboardRow {
  code: string;
  timeRange: string;
  description: string;
}

function parseStoryboardRows(cards: StoryCardLike[]): Map<string, StoryboardRow> {
  const rows = new Map<string, StoryboardRow>();
  cards
    .filter(card => card.stage === 'storyboard')
    .forEach(card => {
      (card.content || '').split(/\r?\n/).forEach(line => {
        const match = line.match(
          /^\|\s*([A-Za-z]+[\d]+[A-Za-z]?)\s*\|\s*([^|]+)\|\s*([^|]+)\|/,
        );
        if (!match || /^-+$/.test(match[1].replace(/\s/g, ''))) return;
        rows.set(match[1].toUpperCase(), {
          code: match[1].toUpperCase(),
          timeRange: cleanMarkdown(match[2]),
          description: cleanMarkdown(match[3]),
        });
      });
    });
  return rows;
}

function shotTitle(value: string): string {
  return friendlyCopy(value)
    .replace(/^(?:EP\d+\s*)?(?:G|W)\d+(?:[-–][A-Za-z0-9]+)?\s*/i, '')
    .replace(/\[[^\]]*s\]\s*$/i, '')
    .replace(/\s*(?:首帧提示词|视频提示词|图片提示词|制作分镜|故事板)\s*$/g, '')
    .trim();
}

function narrativeDescription(card: StoryCardLike | undefined): string {
  if (!card) return '';
  const metadata = card.metadata || {};
  const preferred = metadata.retention_job
    || extractLabeledLine(card.content || '', ['叙事任务', '画面内容', '画面', '核心画面']);
  if (preferred) return clampText(String(preferred), 120);
  const firstParagraph = (card.content || '')
    .split(/\n\s*\n/)
    .map(part => cleanMarkdown(part))
    .find(part => part.length > 5 && !part.startsWith('|'));
  return firstParagraph ? clampText(firstParagraph, 120) : '';
}

function alignedAggregateBeats(cards: StoryCardLike[]): StoryBeat[] {
  const candidates = cards
    .filter(card => (
      card.images?.length
      && Array.isArray(card.metadata?.prompt_order)
      && card.metadata?.prompt_order.length
    ))
    .sort((a, b) => (
      (IMAGE_STAGE_PRIORITY[a.stage] ?? 99) - (IMAGE_STAGE_PRIORITY[b.stage] ?? 99)
      || b.images.length - a.images.length
    ));
  const source = candidates[0];
  if (!source) return [];

  const rows = parseStoryboardRows(cards);
  const order = source.metadata?.prompt_order as string[];
  return order.map((rawCode, index) => {
    const code = String(rawCode).toUpperCase();
    const row = rows.get(code);
    const description = row?.description
      || clampText(source.prompts?.[index] || '', 120)
      || `第 ${index + 1} 个剧情画面`;
    return {
      key: `${source.card_id}-${code}`,
      order: index + 1,
      label: `第 ${index + 1} 幕`,
      title: clampText(description.split(/[，；。]/)[0], 24) || code,
      description,
      timeRange: row?.timeRange || '',
      image: source.images[index],
      sourceCard: source,
    };
  });
}

function imageVariantTitle(image: string, fallback: string): string {
  let filename = image.split('/').pop() || '';
  try {
    filename = decodeURIComponent(filename);
  } catch {
    // 非标准 URL 仍可继续使用原文件名。
  }
  const readable = filename
    .replace(/\.[^.]+$/, '')
    .replace(/^.*?(?:G|W)\d+[A-Z]?[_-]/i, '')
    .replace(/[_-]?(?:制作分镜|故事板|v\d+).*$/i, '')
    .split(/[_-]+/)
    .filter(Boolean)
    .join(' · ')
    .trim();
  return readable || fallback;
}

function shotLevelBeats(cards: StoryCardLike[]): StoryBeat[] {
  const grouped = new Map<string, StoryCardLike[]>();
  cards
    .filter(card => card.shot_number > 0)
    .forEach(card => {
      const key = `${card.episode ?? 'global'}-${card.shot_number}`;
      grouped.set(key, [...(grouped.get(key) || []), card]);
    });

  const beats: StoryBeat[] = [];
  Array.from(grouped.values())
    .sort((a, b) => (
      (a[0].episode ?? 0) - (b[0].episode ?? 0)
      || a[0].shot_number - b[0].shot_number
    ))
    .forEach(unitCards => {
      const storyCard = unitCards.find(card => card.stage === 'script')
        || unitCards.find(card => card.stage === 'storyboard')
        || unitCards[0];
      const visualCard = [...unitCards]
        .filter(card => card.images?.length)
        .sort((a, b) => (
          (IMAGE_STAGE_PRIORITY[a.stage] ?? 99) - (IMAGE_STAGE_PRIORITY[b.stage] ?? 99)
          || b.images.length - a.images.length
        ))[0];
      const videoCard = unitCards.find(card => card.videos?.length);
      const episode = storyCard.episode;
      const shot = storyCard.shot_number;
      const baseTitle = shotTitle(storyCard.title) || `第 ${shot} 幕`;
      const images = visualCard?.images?.length ? visualCard.images : [undefined];
      images.forEach((image, imageIndex) => {
        const variantMatch = image?.match(/(?:G|W)\d+([A-Z])/i);
        const variant = variantMatch?.[1]?.toUpperCase() || String(imageIndex + 1);
        const baseLabel = episode == null
          ? `第 ${shot} 幕`
          : `第 ${episode} 集 · 第 ${shot} 幕`;
        beats.push({
          key: `${episode ?? 'global'}-${shot}-${imageIndex}`,
          order: beats.length + 1,
          label: images.length > 1 ? `${baseLabel} · 画面 ${variant}` : baseLabel,
          title: image && images.length > 1 ? imageVariantTitle(image, baseTitle) : baseTitle,
          description: narrativeDescription(storyCard) || baseTitle,
          timeRange: String(storyCard.metadata?.time_range || ''),
          image,
          video: imageIndex === 0 ? videoCard?.videos[0] : undefined,
          sourceCard: visualCard || storyCard,
        });
      });
    });
  return beats;
}

function fallbackImageBeats(cards: StoryCardLike[]): StoryBeat[] {
  const seen = new Set<string>();
  const result: StoryBeat[] = [];
  [...cards]
    .filter(card => card.images?.length && !['idea', 'setting', 'design'].includes(card.stage))
    .sort((a, b) => (
      (IMAGE_STAGE_PRIORITY[a.stage] ?? 99) - (IMAGE_STAGE_PRIORITY[b.stage] ?? 99)
    ))
    .forEach(card => {
      card.images.forEach(image => {
        if (seen.has(image)) return;
        seen.add(image);
        const order = result.length + 1;
        result.push({
          key: `${card.card_id}-${order}`,
          order,
          label: `第 ${order} 幕`,
          title: shotTitle(card.title) || `剧情画面 ${order}`,
          description: narrativeDescription(card) || '这个画面已经生成，可以直接查看。',
          timeRange: '',
          image,
          sourceCard: card,
        });
      });
    });
  return result;
}

export function extractStoryBeats(cards: StoryCardLike[]): StoryBeat[] {
  const aggregate = alignedAggregateBeats(cards);
  if (aggregate.length) return aggregate;
  const shots = shotLevelBeats(cards);
  if (shots.length) return shots;
  return fallbackImageBeats(cards);
}

export function extractWorldAssets(cards: StoryCardLike[], limit = 8): WorldAsset[] {
  const seen = new Set<string>();
  const assets: WorldAsset[] = [];
  cards
    .filter(card => (
      ['setting', 'design'].includes(card.stage)
      && card.images?.length
      && !/禁止继承|旧AI画风|旧版参考/.test(card.title)
    ))
    .forEach(card => {
      const metadata = card.metadata || {};
      const hint = `${card.card_id} ${card.title} ${metadata.asset_type || ''}`.toLowerCase();
      const kind: WorldAsset['kind'] = (
        hint.includes('character') || hint.includes('char') || /角色|人物|苍霖|巨龙|幼龙/.test(card.title)
      ) ? '角色' : (
        hint.includes('scene') || /场景|大陆|遗迹|荒原|天穹|矿坑/.test(card.title)
      ) ? '场景' : '视觉参考';
      card.images.forEach((image, index) => {
        // 故事页只展示项目内可持续访问的正式资产；旧外部资料路径可能已迁移或失效，
        // 不让这些 404 参考图重新制造“是不是没生成”的困惑。
        if (!image.includes('/resource/production/')) return;
        if (seen.has(image) || assets.length >= limit) return;
        seen.add(image);
        assets.push({
          key: `${card.card_id}-${index}`,
          title: card.images.length > 1
            ? `${friendlyCopy(card.title)} · ${index + 1}`
            : friendlyCopy(card.title),
          kind,
          image,
          sourceCard: card,
        });
      });
    });
  return assets;
}
