export type StoryStarter = {
  id: string;
  label: string;
  name: string;
  idea: string;
  oneLine: string;
  sourceContent: string;
  visualStyle: string;
};

/**
 * 可编辑的创作起点，不是系统中已经存在的项目或成品剧本。
 * 桌面端可以套用到“新建故事”，手机端只会把 idea 带入输入框。
 */
export const MEMORY_SWORDSMAN_STARTER: StoryStarter = {
  id: 'memory-swordsman-future-self',
  label: '失忆剑客｜未来追杀者',
  name: '逆时追杀 · 30秒概念片',
  idea: '一个失忆剑客发现追杀自己的人是未来的自己',
  oneLine: '失忆剑客陆沉在雨夜被神秘人追杀，揭下面具后才发现对方是未来的自己，而这场追杀是为了阻止他恢复一段会毁掉整座城的记忆。',
  sourceContent: [
    '【创作起点】',
    '雨夜旧城，失忆剑客陆沉被一个熟悉他全部剑招的黑衣人追杀。两人受伤的位置完全相同，断裂玉佩也能严丝合缝地拼在一起。',
    '',
    '【核心反转】',
    '追杀者摘下面具，露出苍老的陆沉。他不是回来复仇，而是要阻止年轻的自己恢复记忆。',
    '',
    '【第二层悬念】',
    '陆沉失去的不是受害记忆，而是他亲手毁掉整座城的记忆。未来的他为什么仍然活着、这一次又准备牺牲谁，留作结尾追更钩子。',
    '',
    '【导演仍需逐项确认】',
    '主角此刻最想救谁；恢复记忆的直接代价；未来陆沉的真实底线；最后一秒希望观众带着恐惧、同情还是震惊离开。',
  ].join('\n'),
  visualStyle: '冷峻东方武侠动画，雨夜青黑主色，刀光与时间裂隙用少量琥珀金强调，电影感竖屏构图',
};

export const MOBILE_STARTER_IDEAS = [
  {
    label: MEMORY_SWORDSMAN_STARTER.label,
    idea: MEMORY_SWORDSMAN_STARTER.idea,
  },
  {
    label: '心声反转｜都市悬念',
    idea: '一个普通人突然发现今天能听见所有人的心声',
  },
  {
    label: '生活改编｜下班路上',
    idea: '帮我把一次下班路上的小事，变成有反转的短片',
  },
  {
    label: '参考图成片｜电影感',
    idea: '我拍了一张照片，想让它变成有电影感的小视频',
  },
] as const;

export const MOBILE_DISCOVERY_MIN_USER_TURNS = 4;
export const MOBILE_DIRECTION_READY_MARKER = '【方向已成形】';

export function getMobileDiscoveryProgress(
  messages: ReadonlyArray<{ role: string; content?: string }>,
  readyOverride = false,
) {
  const userTurns = messages.filter(item => item.role === 'user').length;
  const modelMarkedReady = messages.some(item => (
    item.role === 'assistant'
    && String(item.content || '').includes(MOBILE_DIRECTION_READY_MARKER)
  ));
  const userAskedToStart = messages.some(item => (
    item.role === 'user'
    && /(?:就这样|开始拍|直接拍|按这个做|按这个方向|直接开拍)/.test(String(item.content || ''))
  ));
  const ready = readyOverride
    || modelMarkedReady
    || userAskedToStart
    || userTurns >= MOBILE_DISCOVERY_MIN_USER_TURNS;
  return {
    ready,
    userTurns,
    remainingTurns: ready
      ? 0
      : Math.max(MOBILE_DISCOVERY_MIN_USER_TURNS - userTurns, 0),
  };
}
