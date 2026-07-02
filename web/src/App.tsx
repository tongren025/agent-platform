import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Templates from './pages/Templates';
import Tools from './pages/Tools';
import Teams from './pages/Teams';
import Workflows from './pages/Workflows';
import WorkflowEditor from './pages/WorkflowEditor';
import Workbench from './pages/Workbench';
import AutoLearn from './pages/AutoLearn';
import ArticleLearn from './pages/ArticleLearn';
import Memory from './pages/Memory';
import Runs from './pages/Runs';
import Tasks from './pages/Tasks';
import Pipeline from './pages/Pipeline';
import Production from './pages/Production';
import ProductionHub from './pages/ProductionHub';
import EpisodeDetail from './pages/EpisodeDetail';
import Settings from './pages/Settings';
import SkillTracker from './pages/SkillTracker';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Evolution from './pages/Evolution';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRoles from './pages/admin/AdminRoles';
import AdminProviders from './pages/admin/AdminProviders';
import UserLogin from './pages/UserLogin';
import UserAuthGuard from './components/UserAuthGuard';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<UserLogin />} />
      <Route element={<UserAuthGuard />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/production" element={<Production />} />
          <Route path="/production/:pid" element={<ProductionHub />} />
          <Route path="/production/:pid/ep/:ep" element={<EpisodeDetail />} />
          <Route path="/production/:pid/pipeline" element={<Production />} />
          <Route path="/trends" element={<SkillTracker />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="/evolution" element={<Evolution />} />
          <Route path="/settings" element={<Settings />} />
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
    </Routes>
  );
}
