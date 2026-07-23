// 路由总表：用户端页面（登录墙内）+ 管理端 /admin 页面（独立鉴权）；页面按路由懒加载以缩短首屏时间。
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import UserAuthGuard from './components/UserAuthGuard';
import { Spin } from 'antd';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const DirectorStudio = lazy(() => import('./pages/DirectorStudio'));
const Employees = lazy(() => import('./pages/Employees'));
const Templates = lazy(() => import('./pages/Templates'));
const Tools = lazy(() => import('./pages/Tools'));
const Teams = lazy(() => import('./pages/Teams'));
const Workflows = lazy(() => import('./pages/Workflows'));
const WorkflowEditor = lazy(() => import('./pages/WorkflowEditor'));
const Workbench = lazy(() => import('./pages/Workbench'));
const AutoLearn = lazy(() => import('./pages/AutoLearn'));
const ArticleLearn = lazy(() => import('./pages/ArticleLearn'));
const Memory = lazy(() => import('./pages/Memory'));
const Runs = lazy(() => import('./pages/Runs'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Production = lazy(() => import('./pages/Production'));
const Canvas = lazy(() => import('./pages/Canvas'));
const ProductionHub = lazy(() => import('./pages/ProductionHub'));
const ProductionMatrix = lazy(() => import('./pages/ProductionMatrix'));
const EpisodeDetail = lazy(() => import('./pages/EpisodeDetail'));
const Settings = lazy(() => import('./pages/Settings'));
const OpenRouterModels = lazy(() => import('./pages/OpenRouterModels'));
const SkillTracker = lazy(() => import('./pages/SkillTracker'));
const KnowledgeGraph = lazy(() => import('./pages/KnowledgeGraph'));
const Evolution = lazy(() => import('./pages/Evolution'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRoles = lazy(() => import('./pages/admin/AdminRoles'));
const AdminProviders = lazy(() => import('./pages/admin/AdminProviders'));
const UserLogin = lazy(() => import('./pages/UserLogin'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><div style={{ textAlign: 'center' }}><Spin size="large" /><div style={{ marginTop: 12, color: '#64748b' }}>正在打开页面</div></div></div>}>
    <Routes>
      <Route path="/login" element={<UserLogin />} />
      <Route element={<UserAuthGuard />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/studio" replace />} />
          <Route path="/studio" element={<DirectorStudio />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflows/:key/edit" element={<WorkflowEditor />} />
          <Route path="/workbench" element={<Workbench />} />
          <Route path="/auto-learn" element={<AutoLearn />} />
          <Route path="/article-learn" element={<ArticleLearn />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/runs" element={<Runs />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/production" element={<Production />} />
          {/* 必须排在 /production/:pid 之前，否则 "matrix" 会被当成 pid 匹配掉 */}
          <Route path="/production/matrix" element={<ProductionMatrix />} />
          <Route path="/production/:pid" element={<ProductionHub />} />
          <Route path="/production/:pid/ep/:ep" element={<EpisodeDetail />} />
          <Route path="/production/:pid/pipeline" element={<Production />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/trends" element={<SkillTracker />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="/evolution" element={<Evolution />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/models" element={<OpenRouterModels />} />
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
