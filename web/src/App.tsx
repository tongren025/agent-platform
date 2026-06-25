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
import Pipeline from './pages/Pipeline';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
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
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
