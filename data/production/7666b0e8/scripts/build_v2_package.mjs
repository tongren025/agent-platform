/**
 * 从 V2_SHOTS.json 生成可被现有制作看板直接读取的逐镜卡片、总制作包与提示词清单。
 *
 * 接入点：
 * - cards.json：Production / EpisodeDetail / DirectorStudio 的现有卡片数据源。
 * - GC_MASTER_PACKAGE.md：导演、分镜、图像与视频团队共用的阅读版总包。
 * - IMAGE_PROMPTS_V2.md / VIDEO_PROMPTS_V2.md：逐镜生成执行单。
 * - QA_STATUS_V2.json：正式资产质量门与当前 P0 状态。
 *
 * 运行方式：node data/production/7666b0e8/scripts/build_v2_package.mjs
 */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, '..');
const projectId = '7666b0e8';
const now = '2026-07-24T05:26:52.096Z';

const shotDoc = JSON.parse(await readFile(path.join(projectDir, 'V2_SHOTS.json'), 'utf8'));
const shots = shotDoc.shots;

const commonImageHeader = [
  '电影级写实东方幻想漫剧关键帧，远古神话与末世灾变气质，厚重而克制。',
  '深炭黑、风化岩灰与深靛蓝构成低饱和基底，仅使用本镜指定的一种叙事光。',
  '真实风化石材、化石骨、氧化金属、旧织物、湿润生命纤维、水体或冰层材质。',
  '电影级明暗塑形、体积云雾、空气透视、受控高光；先读大轮廓，再读唯一奇观，最后读文明细节。',
  '前中后三层纵深，巨物配明确尺度锚；9:16 竖屏；画面内无文字、字幕、边框、编号、UI、标志或水印。'
].join('');

const commonNegative = [
  '明亮通透国漫插画', '均匀柔光', '糖果色', '彩色UI光环', '通用赛博朋克',
  '欧美手游海报', '塑料CG', '橡胶鳞片', '扁平渐变', '过曝白边', '死黑欠曝',
  '灰雾糊成一片', '廉价粒子瀑布', '无意义高频细节', '过度锐化', '重复龙',
  '重复虫', '复制粘贴人群', '融化建筑', '漂浮结构错误', '错误透视', '微缩玩具感',
  '多个主事件', '普通金色枝繁叶茂大树', '对称圣诞树', '树旁随机浮岛',
  '藤蔓电缆', '粗发光管', '九根中心辐射光线', '随机文字', '字幕', '边框',
  '分格线', '编号', 'Logo', 'UI', '水印'
].join('，');

const styleReferenceUrls = [
  '01_盘古初源_EP01_关键帧分镜.png',
  '02_巨神大陆_EP01_24帧.png',
  '03_苍霖竞技场_EP01_24帧.png',
  '04_龙族大陆_EP01_24帧.png',
  '05_海洋大陆_EP01_24帧.png',
  '06_盘古初源_龙核战纪_24帧.png'
].map((name) => `/api/v1/agentapp/production/resource/production/${projectId}/style-references/user-approved-2026-07-24/${name}`);

const assetUrl = (assetPath) =>
  `/api/v1/agentapp/production/resource/production/${projectId}/${assetPath}`;

const p0Assets = {
  world_tree_cosmic: {
    status: 'approved',
    asset: 'uploads/images/P0_world_tree_cosmic_final.png',
    sha256: 'e56cef1c1dedfa1fca87fd689bae343052995236dd978a913030da5afbe6a9e0',
    scores: { world_identity: 5, shot_narrative: 4, style_consistency: 5, scale_and_space: 5, technical_integrity: 5 },
    total: 24,
    note: '九个大陆接口、断冠中空树体与低亮金绿生命脉均清晰，可作为宇宙尺度共同锚点。'
  },
  world_tree_continent_scale: {
    status: 'approved',
    asset: 'uploads/images/P0_world_tree_continent_interface_final.png',
    sha256: '023e071ae0410a606ba33ad644c1e74fd134d970abfc0540b4c91380c17d2ec1',
    scores: { world_identity: 5, shot_narrative: 4, style_consistency: 5, scale_and_space: 5, technical_integrity: 5 },
    total: 24,
    note: '粗根托举、夹持并刺穿大陆地壳，城市与飞行器建立文明尺度。'
  },
  world_tree_human_scale: {
    status: 'approved',
    asset: 'uploads/images/P0_world_tree_human_scale_final.png',
    sha256: '427acdc593e252e043da44bf762616e52ceca9528034e0ae7d06d1250fc3a2b9',
    scores: { world_identity: 5, shot_narrative: 5, style_consistency: 5, scale_and_space: 5, technical_integrity: 5 },
    total: 25,
    note: '湿润树纤维、神殿遗构、人物尺度与冷白无菌删除面均已锁定。'
  },
  nine_continents_silhouette: {
    status: 'approved',
    asset: 'uploads/images/P0_nine_continents_silhouette_final.png',
    sha256: 'c4e0723259ced8a9ef928b40220d385b2c70abe302f8b94114901d41bcffb387',
    scores: { world_identity: 5, shot_narrative: 4, style_consistency: 5, scale_and_space: 5, technical_integrity: 5 },
    total: 24,
    note: '九种大陆黑色剪影彼此可辨，作为远景轮廓与构图约束。'
  },
  canglin_identity: {
    status: 'approved',
    asset: 'uploads/images/P0_canglin_identity_final.png',
    sha256: '2d81ad724bf5797163e72886b6f047dc481c4b9abcfbc918c8847b6d8c32ac06',
    scores: { world_identity: 5, shot_narrative: 4, style_consistency: 5, scale_and_space: 5, technical_integrity: 5 },
    total: 24,
    note: '16岁少年比例、画面右侧面颊旧伤、旧矿工衣与哑光龙骨碎片已锁定。'
  },
  jinlong_story: {
    status: 'approved',
    asset: 'uploads/images/P0_jinlong_story_final.png',
    sha256: '3e6fa435a2a3903b4d3278919fa73dd888161bbd8add819d71c8964d5d395fd5',
    scores: { world_identity: 5, shot_narrative: 5, style_consistency: 5, scale_and_space: 5, technical_integrity: 4 },
    total: 24,
    note: '龙骸长弧、肋骨矿镇、少年尺度锚与冷白静默删除构成正式剧情母版。'
  },
  jushen_story: {
    status: 'approved',
    asset: 'uploads/images/P0_jushen_story_final.png',
    sha256: '863faca7ba5d8abc066d875b2e5b9c3e1071d38a9925f3ea6f1e039e4708d4b3',
    scores: { world_identity: 5, shot_narrative: 4, style_consistency: 5, scale_and_space: 5, technical_integrity: 5 },
    total: 24,
    note: '横卧巨神即大陆，眼谷城市与微小观察者建立了可靠尺度。'
  },
  chaosheng_story: {
    status: 'approved',
    asset: 'uploads/images/P0_chaosheng_story_final.png',
    sha256: 'e69e44338cc2e45430512642734df9bec0dd5c70977ad09af205d82dc5bd1737',
    scores: { world_identity: 5, shot_narrative: 4, style_consistency: 5, scale_and_space: 5, technical_integrity: 5 },
    total: 24,
    note: '倒碗海体、悬挂海城与船队尺度均成立。'
  },
  purification_deletion: {
    status: 'approved',
    asset: 'uploads/images/P0_purification_deletion_final.png',
    sha256: '24049b51a5a358b2cb9140f100e3640123ee8ff3f5540f930525cae48a533394',
    scores: { world_identity: 5, shot_narrative: 5, style_consistency: 5, scale_and_space: 5, technical_integrity: 5 },
    total: 25,
    note: '绝对平直的冷青白无菌切面可读为物质删除，而非光柱、窗户或传送门。'
  }
};

const p0FormalPaths = Object.values(p0Assets).map(({ asset }) => asset);
const p0FormalUrls = p0FormalPaths.map(assetUrl);

function formalFrameAssets(shotId) {
  return Object.fromEntries(
    ['A', 'B', 'C'].map((key) => {
      const asset = `uploads/images/${shotId}${key}.png`;
      return [key, existsSync(path.join(projectDir, asset)) ? asset : null];
    })
  );
}

const approvedKeyframeIds = shots.flatMap((shot) =>
  Object.entries(formalFrameAssets(shot.id))
    .filter(([, asset]) => asset)
    .map(([key]) => `${shot.id}${key}`)
);

const approvedKeyframePaths = approvedKeyframeIds.map((frameId) =>
  `uploads/images/${frameId}.png`
);

function cardId(stage, unit = 'global') {
  return createHash('sha256')
    .update(`${projectId}:${shotDoc.version}:${stage}:${unit}`)
    .digest('hex')
    .slice(0, 8);
}

function card(stage, title, content, extra = {}) {
  return {
    card_id: cardId(stage, extra.unit ?? title),
    project_id: projectId,
    stage,
    title,
    content,
    episode: extra.episode ?? 1,
    shot_number: extra.shot_number ?? 0,
    prompts: extra.prompts ?? [],
    negative_prompts: extra.negative_prompts ?? [],
    images: extra.images ?? [],
    videos: extra.videos ?? [],
    metadata: extra.metadata ?? {},
    status: extra.status ?? 'review',
    assignee: '',
    created_at: extra.created_at ?? now,
    updated_at: now
  };
}

function fullImagePrompt(shot, key, description) {
  return [
    commonImageHeader,
    `镜头：${shot.id}《${shot.title}》；时间 ${shot.start.toFixed(2)}–${shot.end.toFixed(2)} 秒。`,
    `剧情唯一事件：${shot.event}`,
    `本镜空间与主体：${shot.image_core}`,
    `关键位 ${shot.id}${key}：${description}`,
    `景别与机位：${shot.camera}。`,
    `本镜色光：${shot.palette}。`,
    '只生成一个凝固瞬间；不得把A/B/C做成拼贴、三联画、宫格或同屏多时刻。'
  ].join('\n');
}

function storyboardContent(shot) {
  return [
    `时间：${shot.start.toFixed(2)}–${shot.end.toFixed(2)} 秒`,
    `事件：${shot.event}`,
    `景别 / 运镜：${shot.camera}`,
    `光色：${shot.palette}`,
    `旁白 / 声音：${shot.audio}`,
    '',
    `- ${shot.id}A：${shot.keyframes.A}`,
    `- ${shot.id}B：${shot.keyframes.B}`,
    `- ${shot.id}C：${shot.keyframes.C}`
  ].join('\n');
}

function assertShotContract() {
  if (shots.length !== 24) throw new Error(`期望24镜，实际${shots.length}`);
  if (shots[0].start !== 0 || shots.at(-1).end !== 30) throw new Error('时间轴必须覆盖0–30秒');
  for (let i = 0; i < shots.length; i += 1) {
    const shot = shots[i];
    const expectedId = `S${String(i + 1).padStart(2, '0')}`;
    if (shot.id !== expectedId) throw new Error(`镜号不连续：${shot.id} != ${expectedId}`);
    if (i > 0 && shot.start !== shots[i - 1].end) throw new Error(`时间轴不连续：${shot.id}`);
    if (Object.keys(shot.keyframes).join(',') !== 'A,B,C') throw new Error(`${shot.id} 缺少A/B/C关键位`);
  }
}

assertShotContract();

const aggregateCards = [
  card(
    'idea',
    '导演重制命题 · 一陆都不献',
    [
      '九陆并非九座互不相干的浮岛，而是寄生在同一具濒死世界树上的共生体。',
      '净化从断冠伤口反向入侵；古律为了维持系统，要求献祭一陆续命八陆。',
      '被判死的烬龙陆少年苍霖拒绝把刀转向任何另一陆，而是以龙骨碎片建立生命旁路。',
      '动作命题：一陆，都不献。',
      '结尾钩子：净化没有停机，它把下一次切除目标转向了苍霖。'
    ].join('\n\n'),
    {
      unit: 'idea-v2',
      status: 'done',
      metadata: {
        version: shotDoc.version,
        director_rebuild: true,
        previous_version_archived: true,
        archive_path: 'archive/style-overhaul-v1-original-2026-07-24'
      }
    }
  ),
  card(
    'design',
    'V2 视觉宪法、用户样片与 P0 锚点',
    [
      '世界结构、九陆轮廓与苍霖年龄服从《九陆纪元视觉宪法 v1》。',
      '六张用户样片只锁定电影级东方幻想的画风、光影、材质、尺度、镜头密度与情绪，不继承其中的文字和宫格。',
      '旧九陆、旧世界树、旧角色图只允许参考剧情动作、构图与情绪。',
      'P0 已全部通过：世界树宇宙 / 大陆 / 人物三尺度、九陆剪影、苍霖身份、烬龙 / 巨神 / 潮生剧情锚点与净化删除面。'
    ].join('\n\n'),
    {
      unit: 'design-v2',
      status: 'done',
      images: [...styleReferenceUrls, ...p0FormalUrls],
      metadata: {
        visual_canon_version: 'visual-rebase-v1',
        style_bible: 'STYLE_BIBLE_V2.md',
        style_reference_manifest: 'style-references/user-approved-2026-07-24/REFERENCE_MANIFEST.md',
        p0_assets: Object.fromEntries(
          Object.entries(p0Assets).map(([key, value]) => [key, value.status])
        )
      }
    }
  ),
  card(
    'script',
    '30秒剧本 · 共生体 / 古律 / 反抗',
    [
      '第一章 00:00–00:10《共生体正在死》：九陆的九种轮廓被同一世界树承托；净化从断冠倒灌，树心启用古律。',
      '第二章 00:10–00:20《古律选择烬龙陆》：系统宣告“献一陆，续八陆”；烬龙陆开始被静音删除，苍霖闯入树心阻断执行夹具。',
      '第三章 00:20–00:30《一陆都不献》：苍霖以龙骨碎片建立共同生命旁路，替九陆争回一次心跳；净化随即把目标转向他。',
      '',
      '完整旁白 / 对白：',
      '九陆，并非悬空而生。',
      '它们活在同一具身躯上。',
      '可这具身躯，正在死。',
      '净化，已从伤口倒灌。',
      '系统：续存不足。启用古律。',
      '系统：献一陆，续八陆。',
      '系统：切除目标，烬龙陆。',
      '一条命脉，被迫喂给另外八条。',
      '苍霖：谁准你选？',
      '他没有换一个牺牲者。',
      '他把一口活气，重新接回九陆。',
      '苍霖：听清了——一陆，都不献。',
      '九陆，只多活了一次心跳。',
      '系统：净化目标，转移。'
    ].join('\n'),
    {
      unit: 'script-v2',
      status: 'done',
      metadata: {
        version: shotDoc.version,
        duration_seconds: 30,
        chapter_count: 3,
        shot_count: 24,
        keyframe_count: 72
      }
    }
  ),
  card(
    'setting',
    '世界结构、角色与净化系统硬锁',
    [
      '世界树：中空、断冠、失衡倾斜的活体基础设施；九个根枝接口分别托住、刺穿或缝合九陆。',
      '生命系统：湿润纤维、半透明树脂、玉质汁液与低亮金绿脉搏。',
      '净化系统：冷白陶瓷、无缝金属、无纹理平面；以绝对直线和无菌切面把材质归零，不使用爆炸。',
      '苍霖：16岁、黑色短碎发、窄肩长肢、轻微含胸、左脸旧伤、胸前龙骨碎片、风化黑褐补丁衣。',
      '角色成长不靠成年肌肉、裸露或英雄披风；力量来自姿态、杠杆、受力和选择。',
      '九陆形状与禁串台详见 STYLE_BIBLE_V2.md。'
    ].join('\n\n'),
    {
      unit: 'setting-v2',
      status: 'done',
      metadata: {
        canon_path: 'resouce/漫剧/九陆纪元_视觉宪法_v1.md',
        character_anchor_required: true,
        world_tree_states: ['濒死', '被删除', '短暂稳住']
      }
    }
  ),
  card(
    'storyboard',
    'S01–S24 导演分镜总览 · 72关键位',
    [
      '结构：3个10秒章节，每章8个真实镜头；每镜A/B/C三个关键位，共72帧。',
      'A为入镜或承接，B为决定性动作，C为末帧或下一镜交接。',
      'S03、S04、S05、S21 的A/B/C是顺序匹配切，需要分别生成，不得做成同屏拼贴。',
      '每张逐镜卡已经记录时间、事件、机位、光色、声音与三关键位。'
    ].join('\n\n'),
    {
      unit: 'storyboard-overview-v2',
      status: 'done',
      metadata: {
        source: 'V2_SHOTS.json',
        shot_count: 24,
        keyframe_count: 72,
        image_asset_pattern: 'S{NN}{A|B|C}'
      }
    }
  ),
  card(
    'final',
    'V2 交付与质量门',
    [
      '正式图片必须通过：世界观身份、镜头叙事、风格一致性、尺度空间、技术完整性。',
      '任一项低于4分或总分低于22/25，不得进入 uploads/images。',
      '旧图已经全部迁入 trash/style-overhaul-v2/legacy-v1，不删除。',
      '当前先完成P0视觉锚点，再按第一包、第二包、第三包逐包生成72关键帧。',
      '字幕、地名、片名全部后期制作，不交给图片模型。'
    ].join('\n\n'),
    {
      unit: 'delivery-v2',
      status: 'pending',
      metadata: {
        delivery_status: 'director_package_ready_keyframe_generation_in_progress',
        image_generation_status: `${approvedKeyframeIds.length}_of_72_approved`,
        video_generation_status: 'locked_until_keyframes_approved',
        approved_formal_assets: [...p0FormalPaths, ...approvedKeyframePaths],
        legacy_assets_archived: true
      }
    }
  )
];

const shotCards = shots.flatMap((shot, index) => {
  const shotNumber = index + 1;
  const framePrompts = Object.entries(shot.keyframes).map(([key, description]) =>
    fullImagePrompt(shot, key, description)
  );
  const frameAssets = formalFrameAssets(shot.id);
  const formalShotAssets = Object.values(frameAssets).filter(Boolean);
  const formalShotUrls = formalShotAssets.map(assetUrl);
  const frameStatus = Object.fromEntries(
    Object.entries(frameAssets).map(([key, asset]) => [key, asset ? 'approved' : 'not_started'])
  );

  return [
    card(
      'storyboard',
      `${shot.id} ${shot.title}`,
      storyboardContent(shot),
      {
        unit: `${shot.id}:storyboard`,
        shot_number: shotNumber,
        status: 'done',
        metadata: {
          shot_id: shot.id,
          chapter: shot.chapter,
          start_seconds: shot.start,
          end_seconds: shot.end,
          duration_seconds: Number((shot.end - shot.start).toFixed(2)),
          keyframe_ids: [`${shot.id}A`, `${shot.id}B`, `${shot.id}C`],
          source: 'V2_SHOTS.json'
        }
      }
    ),
    card(
      'img_prompt',
      `${shot.id} A/B/C 图片提示词`,
      [
        `${shot.id} 共3个独立关键位，必须分别生成。`,
        `A：${shot.keyframes.A}`,
        `B：${shot.keyframes.B}`,
        `C：${shot.keyframes.C}`,
        '',
        '统一风格与负面约束由 STYLE_BIBLE_V2.md 锁定。'
      ].join('\n'),
      {
        unit: `${shot.id}:img`,
        shot_number: shotNumber,
        prompts: framePrompts,
        negative_prompts: [commonNegative],
        images: formalShotUrls,
        status: formalShotAssets.length === 3 ? 'done' : 'review',
        metadata: {
          shot_id: shot.id,
          prompt_order: [`${shot.id}A`, `${shot.id}B`, `${shot.id}C`],
          frame_assets: frameAssets,
          frame_status: frameStatus,
          requires_style_references: true,
          quality_gate_min_each: 4,
          quality_gate_min_total: 22
        }
      }
    ),
    card(
      'vid_prompt',
      `${shot.id} 视频运动提示词`,
      [
        `首帧与关键位必须沿用 ${shot.id} 已验收图片，不重新设计角色、地标和比例。`,
        shot.video_prompt,
        '巨物运动慢，环境反应延迟；单镜不随机切换镜头，不新增角色、道具或特效。'
      ].join('\n'),
      {
        unit: `${shot.id}:vid`,
        shot_number: shotNumber,
        prompts: [shot.video_prompt],
        status: 'review',
        metadata: {
          shot_id: shot.id,
          duration_seconds: Number((shot.end - shot.start).toFixed(2)),
          video_generation_ready: false,
          requires_approved_keyframes: true,
          edit_assembled_match_cuts: ['S03', 'S04', 'S05', 'S21'].includes(shot.id)
        }
      }
    )
  ];
});

const cards = [...aggregateCards, ...shotCards];

function shotRow(shot) {
  const audio = shot.audio.replaceAll('\n', ' ');
  return `| ${shot.id} | ${shot.start.toFixed(2)}–${shot.end.toFixed(2)} | ${shot.title} | ${shot.event} | ${shot.camera} | ${audio} |`;
}

const keyframeSections = shots.map((shot) => [
  `### ${shot.id} ${shot.title}`,
  '',
  `- 时间：${shot.start.toFixed(2)}–${shot.end.toFixed(2)} 秒`,
  `- 事件：${shot.event}`,
  `- 运镜：${shot.camera}`,
  `- 光色：${shot.palette}`,
  `- 声音：${shot.audio}`,
  `- ${shot.id}A：${shot.keyframes.A}`,
  `- ${shot.id}B：${shot.keyframes.B}`,
  `- ${shot.id}C：${shot.keyframes.C}`,
  ''
].join('\n')).join('\n');

const masterPackage = [
  '# 《九陆纪元 · 一陆都不献》30秒导演重制包',
  '',
  `版本：\`${shotDoc.version}\`  `,
  '画幅：9:16 竖屏  ',
  '结构：3个10秒章节 / 24个真实镜头 / 72个A-B-C关键位  ',
  '当前阶段：导演包已锁，P0视觉锚点生成中',
  '',
  '## 核心命题',
  '',
  '九陆寄生在同一具濒死世界树上。净化从断冠反向入侵，古律为了让系统继续运转，要求“献一陆，续八陆”。当祭刃选中烬龙陆，16岁的苍霖没有把牺牲转嫁给另一片大陆，而是以胸前龙骨碎片建立共同生命旁路。',
  '',
  '> 听清了——一陆，都不献。',
  '',
  '## 导演与视觉依据',
  '',
  '- 世界结构、九陆轮廓和角色年龄：`resouce/漫剧/九陆纪元_视觉宪法_v1.md`。',
  '- 画风、光影、质感、尺度和镜头密度：`style-references/user-approved-2026-07-24/` 六张用户样片。',
  '- 本项目执行规则：`STYLE_BIBLE_V2.md`。',
  '- 逐镜数据单一事实源：`V2_SHOTS.json`。',
  '- 旧版与旧图：`archive/style-overhaul-v1-original-2026-07-24/` 和 `trash/style-overhaul-v2/legacy-v1/`，均不删除。',
  '',
  '## 三幕节奏',
  '',
  '1. 00:00–00:10《共生体正在死》：世界树、九接口、九陆身份、生命脉停搏、净化倒灌、古律苏醒。',
  '2. 00:10–00:20《古律选择烬龙陆》：献一续八、烬龙开始被删除、苍霖闯入树心并卡停夹具。',
  '3. 00:20–00:30《一陆都不献》：建立共同旁路、九陆争回一次心跳、净化把目标转向苍霖。',
  '',
  '## 24镜执行表',
  '',
  '| 镜号 | 时间 | 标题 | 唯一事件 | 景别 / 运镜 | 旁白 / 声音 |',
  '|---|---:|---|---|---|---|',
  ...shots.map(shotRow),
  '',
  '## 72关键位',
  '',
  keyframeSections,
  '## 图片生成与验收',
  '',
  '- 每个关键位独立生成，命名 `S01A` 至 `S24C`。',
  '- S03、S04、S05、S21 是编辑装配的顺序匹配切，严禁做成同屏三联画。',
  '- 每张图按五项各0–5分验收：世界观身份、镜头叙事、风格一致性、尺度空间、技术完整性。',
  '- 任一项低于4分或总分低于22/25，不得进入 `uploads/images/`。',
  '- 图片全部通过后才解锁视频生成；字幕、地名、片名只做后期。',
  ''
].join('\n');

const imagePromptDoc = [
  '# 《九陆纪元 · 一陆都不献》图片提示词 V2',
  '',
  '每个代码块是一张独立图片。A/B/C不得同屏。',
  '',
  ...shots.flatMap((shot) =>
    Object.entries(shot.keyframes).flatMap(([key, description]) => [
      `## ${shot.id}${key} · ${shot.title}`,
      '',
      '```text',
      fullImagePrompt(shot, key, description),
      `负面约束：${commonNegative}`,
      '```',
      ''
    ])
  )
].join('\n');

const videoPromptDoc = [
  '# 《九陆纪元 · 一陆都不献》视频提示词 V2',
  '',
  '视频生成前必须先锁定对应关键帧；每条只执行一个主动作和一个运镜。',
  '',
  ...shots.flatMap((shot) => [
    `## ${shot.id} · ${shot.title} · ${(shot.end - shot.start).toFixed(2)}秒`,
    '',
    '```text',
    `严格沿用 ${shot.id} 已验收关键帧的角色、地标、比例、材质与光色。${shot.video_prompt}巨物运动慢，环境反应延迟；无随机切镜、无突然缩放、无新增角色和特效。`,
    '```',
    ''
  ])
].join('\n');

const qaStatus = {
  schema_version: 1,
  project_id: projectId,
  version: shotDoc.version,
  quality_gate: {
    dimensions: ['world_identity', 'shot_narrative', 'style_consistency', 'scale_and_space', 'technical_integrity'],
    min_each: 4,
    min_total: 22,
    max_total: 25
  },
  p0_assets: p0Assets,
  image_progress: {
    planned_keyframes: 72,
    approved_keyframes: approvedKeyframeIds.length,
    approved_keyframe_ids: approvedKeyframeIds,
    formal_assets: approvedKeyframePaths
  },
  legacy_assets: {
    status: 'archived_never_delete',
    frozen_snapshot: 'archive/style-overhaul-v1-original-2026-07-24',
    trash_manifest: 'trash/style-overhaul-v2/legacy-v1/TRASH_MANIFEST.md'
  },
  updated_at: now
};

await Promise.all([
  writeFile(path.join(projectDir, 'cards.json'), `${JSON.stringify(cards, null, 2)}\n`, 'utf8'),
  writeFile(path.join(projectDir, 'GC_MASTER_PACKAGE.md'), `${masterPackage}\n`, 'utf8'),
  writeFile(path.join(projectDir, 'IMAGE_PROMPTS_V2.md'), `${imagePromptDoc}\n`, 'utf8'),
  writeFile(path.join(projectDir, 'VIDEO_PROMPTS_V2.md'), `${videoPromptDoc}\n`, 'utf8'),
  writeFile(path.join(projectDir, 'QA_STATUS_V2.json'), `${JSON.stringify(qaStatus, null, 2)}\n`, 'utf8')
]);

console.log(JSON.stringify({
  project_id: projectId,
  cards: cards.length,
  aggregate_cards: aggregateCards.length,
  shot_cards: shotCards.length,
  shots: shots.length,
  keyframes: shots.length * 3,
  generated: [
    'cards.json',
    'GC_MASTER_PACKAGE.md',
    'IMAGE_PROMPTS_V2.md',
    'VIDEO_PROMPTS_V2.md',
    'QA_STATUS_V2.json'
  ]
}, null, 2));
