/**
 * 应用路由总表：用户端页面由 UserAuthGuard 保护，/admin 使用独立的管理端布局与鉴权。
 * 页面按路由懒加载，Suspense 统一显示加载状态；历史入口通过 Navigate 保留兼容。
 * 新增页面时，应在这里选择对应的布局与鉴权边界。
 */
import Layout from '@/app/components/Layout';
import AdminLayout from '@/features/identity/components/AdminLayout';
import UserAuthGuard from '@/features/identity/components/UserAuthGuard';
import { Spin } from 'antd';
import { lazy,Suspense } from 'react';
import { Navigate,Route,Routes } from 'react-router-dom';

const Dashboard = lazy(() => import('@/app/pages/Dashboard'));
const DirectorStudio = lazy(() => import('@/features/production/pages/DirectorStudio'));
const Employees = lazy(() => import('@/features/workforce/pages/Employees'));
const Templates = lazy(() => import('@/features/workforce/pages/Templates'));
const Tools = lazy(() => import('@/features/workforce/pages/Tools'));
const Teams = lazy(() => import('@/features/workforce/pages/Teams'));
const Workflows = lazy(() => import('@/features/automation/pages/Workflows'));
const WorkflowEditor = lazy(() => import('@/features/automation/pages/WorkflowEditor'));
const Workbench = lazy(() => import('@/features/execution/pages/Workbench'));
const LearningCenter = lazy(() => import('@/features/knowledge/pages/LearningCenter'));
const Memory = lazy(() => import('@/features/knowledge/pages/Memory'));
const Runs = lazy(() => import('@/features/execution/pages/Runs'));
const Tasks = lazy(() => import('@/features/execution/pages/Tasks'));
const Production = lazy(() => import('@/features/production/pages/Production'));
const ProjectsHome = lazy(() => import('@/features/production/pages/ProjectsHome'));
const Canvas = lazy(() => import('@/features/canvas/pages/CanvasHub'));
const ProductionHub = lazy(() => import('@/features/production/pages/ProductionHub'));
const ProductionMatrix = lazy(() => import('@/features/production/pages/ProductionMatrix'));
const EpisodeDetail = lazy(() => import('@/features/production/pages/EpisodeDetail'));
const Settings = lazy(() => import('@/features/system/pages/Settings'));
const OpenRouterModels = lazy(() => import('@/features/system/pages/OpenRouterModels'));
const SkillTracker = lazy(() => import('@/features/knowledge/pages/SkillTracker'));
const KnowledgeGraph = lazy(() => import('@/features/knowledge/pages/KnowledgeGraph'));
const Evolution = lazy(() => import('@/features/knowledge/pages/Evolution'));
const AdvancedCenter = lazy(() => import('@/app/pages/AdvancedCenter'));
const AdminLogin = lazy(() => import('@/features/identity/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@/features/identity/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/features/identity/pages/admin/AdminUsers'));
const AdminRoles = lazy(() => import('@/features/identity/pages/admin/AdminRoles'));
const AdminProviders = lazy(() => import('@/features/identity/pages/admin/AdminProviders'));
const UserLogin = lazy(() => import('@/features/identity/pages/UserLogin'));
const NotFound = lazy(() => import('@/app/pages/NotFound'));
const McpOAuthCallback = lazy(() => import('@/features/system/pages/McpOAuthCallback'));
const UserGuide = lazy(() => import('@/app/pages/UserGuide'));
const MobileCreator = lazy(() => import('@/features/production/pages/MobileCreator'));
const ShanhaijingPortal = lazy(() => import('@/features/shanhaijing/pages/ShanhaijingPortal'));

/** 根路径按当前视口宽度选择手机创作页或桌面仪表盘；不订阅后续窗口尺寸变化。 */
function ResponsiveLanding() {
  const isPhone = typeof window !== 'undefined'
    && window.matchMedia('(max-width: 768px)').matches;
  return <Navigate to={isPhone ? '/mobile' : '/dashboard'} replace />;
}

/** 组织公开登录页、受保护业务页、管理页和兜底页面；全局 Provider 由 main.tsx 装配。 */
export default function App() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><div style={{ textAlign: 'center' }}><Spin size="large" /><div style={{ marginTop: 12, color: '#64748b' }}>正在打开页面</div></div></div>}>
    <Routes>
      <Route path="/login" element={<UserLogin />} />
      <Route element={<UserAuthGuard />}>
        <Route element={<Layout />}>
          <Route path="/" element={<ResponsiveLanding />} />
          <Route path="/mobile" element={<MobileCreator />} />
          <Route path="/studio" element={<DirectorStudio />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guide" element={<UserGuide />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflows/:key/edit" element={<WorkflowEditor />} />
          <Route path="/workbench" element={<Workbench />} />
          <Route path="/learning" element={<LearningCenter />} />
          {/* 兼容历史收藏与外部链接，并精确落到原功能对应的页签。 */}
          <Route path="/auto-learn" element={<Navigate to="/learning?tab=prompts" replace />} />
          <Route path="/article-learn" element={<Navigate to="/learning?tab=articles" replace />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/runs" element={<Runs />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/production" element={<ProjectsHome />} />
          {/* 全局矩阵使用固定路径；下方带 :pid 的路由用于项目内视图。 */}
          <Route path="/production/matrix" element={<ProductionMatrix />} />
          <Route path="/production/:pid/matrix" element={<ProductionMatrix />} />
          <Route path="/production/:pid/ep/:ep" element={<EpisodeDetail />} />
          <Route path="/production/:pid/pipeline" element={<Production />} />
          <Route path="/production/:pid" element={<ProductionHub />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/shanhaijing" element={<ShanhaijingPortal />} />
          <Route path="/trends" element={<SkillTracker />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="/evolution" element={<Evolution />} />
          <Route path="/advanced/:section" element={<AdvancedCenter />} />
          <Route path="/advanced" element={<Navigate to="/dashboard" replace />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/models" element={<OpenRouterModels />} />
          <Route path="/oauth/callback" element={<McpOAuthCallback />} />
        </Route>
      </Route>

      {/* 管理端：独立 Layout + 独立鉴权，与用户端隔离 */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="providers" element={<AdminProviders />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}
