import { COLORS } from '../../theme';
import type { WorkflowNodeType } from '../../types';

/** 各节点类型的视觉元数据（颜色 / 图标字符 / 标签）。图标用 emoji 省依赖。 */
export const NODE_META: Record<WorkflowNodeType, { label: string; color: string; icon: string }> = {
  start: { label: '开始', color: COLORS.mint, icon: '▶' },
  agent: { label: '智能体', color: COLORS.iris, icon: '🤖' },
  knowledge: { label: '知识检索', color: '#06b6d4', icon: '📚' },
  condition: { label: '条件分支', color: '#f59e0b', icon: '◇' },
  template: { label: '文本拼装', color: '#8b5cf6', icon: '✎' },
  tool: { label: '工具', color: '#ec4899', icon: '🔧' },
  end: { label: '结束', color: COLORS.rose, icon: '■' },
};

export const NODE_ORDER: WorkflowNodeType[] = [
  'start', 'agent', 'knowledge', 'condition', 'template', 'tool', 'end',
];
