// 高级能力中心：以用户任务聚合低频工具，保留原功能页作为可直达的下一层。
import { ArrowRightOutlined } from '@ant-design/icons';
import { Navigate, Link, useParams } from 'react-router-dom';
import { findAdvancedSection } from '../advancedNavigation';
import { hasPerm } from '../userAuth';
import './AdvancedCenter.css';

export default function AdvancedCenter() {
  const { section = '' } = useParams();
  const definition = findAdvancedSection(section);

  if (!definition) return <Navigate to="/dashboard" replace />;

  const visibleTasks = definition.tasks.filter(task => hasPerm(task.perm));
  if (visibleTasks.length === 0) return <Navigate to="/dashboard" replace />;

  return (
    <main className="advanced-center" aria-labelledby="advanced-center-title">
      <header className="advanced-center__header">
        <Link className="advanced-center__back" to="/dashboard">返回今日工作</Link>
        <h1 id="advanced-center-title">{definition.title}</h1>
        <p>{definition.description}</p>
      </header>

      <section aria-label={`${definition.title}可用功能`} className="advanced-center__grid">
        {visibleTasks.map(({ path, title, description, icon: Icon }) => (
          <Link className="advanced-center__task" to={path} key={path}>
            <span className="advanced-center__icon" aria-hidden="true"><Icon /></span>
            <span className="advanced-center__task-copy">
              <strong>{title}</strong>
              <span>{description}</span>
            </span>
            <ArrowRightOutlined className="advanced-center__arrow" aria-hidden="true" />
          </Link>
        ))}
      </section>
    </main>
  );
}
