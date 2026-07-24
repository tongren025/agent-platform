// 高级能力统一注册表：中心卡片、侧栏归属和子页面面包屑共同消费，避免任务名称漂移。
import type { ComponentType } from 'react';
import {
  ApartmentOutlined,
  ApiOutlined,
  AppstoreOutlined,
  BulbOutlined,
  CloudSyncOutlined,
  HistoryOutlined,
  PartitionOutlined,
  ReadOutlined,
  RiseOutlined,
  RocketOutlined,
  SettingOutlined,
  ShareAltOutlined,
  ToolOutlined,
} from '@ant-design/icons';

export type AdvancedTaskDefinition = {
  path: string;
  aliases?: string[];
  title: string;
  description: string;
  perm: string;
  icon: ComponentType;
};

export type AdvancedSectionDefinition = {
  key: string;
  path: string;
  title: string;
  description: string;
  icon: ComponentType;
  tasks: AdvancedTaskDefinition[];
};

export const advancedSections: AdvancedSectionDefinition[] = [
  {
    key: 'employees',
    path: '/advanced/employees',
    title: '增强数字员工',
    description: '为数字员工创建角色、补充参考资料，并持续积累可复用的经验。',
    icon: BulbOutlined,
    tasks: [
      { path: '/templates', title: '创建新员工角色', description: '从岗位模板开始定义它负责的工作。', perm: 'employee:manage', icon: AppstoreOutlined },
      {
        path: '/learning',
        aliases: ['/auto-learn', '/article-learn'],
        title: '给员工补充参考资料',
        description: '收集优秀提示词，或让员工学习专业文章。',
        perm: 'employee:manage',
        icon: ReadOutlined,
      },
      { path: '/memory', title: '管理长期记忆', description: '查看和整理员工在工作中沉淀的经验。', perm: 'employee:manage', icon: BulbOutlined },
      { path: '/knowledge-graph', title: '查看员工能力关系', description: '了解数字员工如何使用知识、记忆和工具。', perm: 'employee:manage', icon: ShareAltOutlined },
      { path: '/trends', title: '发现可用的新能力', description: '了解近期值得关注的 AI 能力和用法。', perm: 'employee:manage', icon: RocketOutlined },
      { path: '/evolution', title: '改进数字员工', description: '根据真实工作反馈持续优化它的能力。', perm: 'employee:manage', icon: RiseOutlined },
    ],
  },
  {
    key: 'automation',
    path: '/advanced/automation',
    title: '设计自动化工作',
    description: '把多人协作和重复步骤组织成可复用的自动化流程。',
    icon: PartitionOutlined,
    tasks: [
      { path: '/teams', title: '组织多人协作', description: '安排多个数字员工分工完成一项工作。', perm: 'team:manage', icon: ApartmentOutlined },
      { path: '/workflows', title: '设计自动化流程', description: '把固定步骤编排成可以重复运行的流程。', perm: 'workflow:manage', icon: PartitionOutlined },
    ],
  },
  {
    key: 'activity',
    path: '/advanced/activity',
    title: '查看运行与任务',
    description: '追踪已经发起的工作，检查结果、进度和失败原因。',
    icon: HistoryOutlined,
    tasks: [
      { path: '/runs', title: '查看工作运行结果', description: '回顾数字员工每次工作的输入、过程与结果。', perm: 'workbench:use', icon: HistoryOutlined },
      { path: '/tasks', title: '跟踪后台处理进度', description: '查看耗时任务是否正在处理、完成或需要重试。', perm: 'workbench:use', icon: CloudSyncOutlined },
    ],
  },
  {
    key: 'settings',
    path: '/advanced/settings',
    title: '配置系统能力',
    description: '连接模型和工具，并调整平台的公共设置。',
    icon: SettingOutlined,
    tasks: [
      { path: '/models', title: '配置 AI 服务', description: '选择平台可以使用的模型与服务商。', perm: 'settings:manage', icon: ApiOutlined },
      { path: '/tools', title: '管理工具与连接', description: '配置数字员工在工作中可以调用的工具。', perm: 'tool:manage', icon: ToolOutlined },
      { path: '/settings', title: '调整系统设置', description: '维护平台级别的通用参数。', perm: 'settings:manage', icon: SettingOutlined },
    ],
  },
];

export const matchesRoute = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export function findAdvancedRouteContext(pathname: string) {
  for (const section of advancedSections) {
    const task = section.tasks.find(candidate =>
      [candidate.path, ...(candidate.aliases ?? [])].some(route => matchesRoute(pathname, route)),
    );
    if (task) return { section, task };
  }
  return undefined;
}

export function findAdvancedSection(key: string) {
  return advancedSections.find(section => section.key === key);
}
