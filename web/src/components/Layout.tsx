// 用户端主布局：左侧导航（按权限显隐）+ 内容区；含折叠与窄屏适配。
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import {
  BookOutlined,
  DashboardOutlined,
  TeamOutlined,
  MessageOutlined,
  LeftOutlined,
  RightOutlined,
  MenuOutlined,
  CloseOutlined,
  VideoCameraOutlined,
  ExpandOutlined,
  LogoutOutlined,
  PlaySquareOutlined,
  ControlOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  advancedSections,
  findAdvancedRouteContext,
  matchesRoute,
} from '../advancedNavigation';
import { hasPerm, userAuth } from '../userAuth';
import TaskCompletionNotifier from './TaskCompletionNotifier';
import SystemManagerDrawer from './SystemManagerDrawer';
import UserHelpCenter from './UserHelpCenter';
import './Layout.css';

// perm 为空的条目所有登录用户可见;有 perm 的按角色权限显隐(与后端中间件的映射一致)
type NavItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  perm?: string;
  anyPerms?: string[];
};
type NavSection = { title?: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    title: '开始工作',
    items: [
      { key: '/dashboard', icon: <DashboardOutlined />, label: '今日制作' },
      { key: '/studio', icon: <PlaySquareOutlined />, label: '快速制作', perm: 'production:manage' },
      { key: '/production', icon: <VideoCameraOutlined />, label: '我的项目', perm: 'production:manage' },
      { key: '/canvas', icon: <ExpandOutlined />, label: '画布中心', perm: 'production:manage' },
    ],
  },
  {
    title: '获得帮助',
    items: [
      { key: '/guide', icon: <BookOutlined />, label: '系统使用手册' },
      { key: '/workbench', icon: <MessageOutlined />, label: '找数字员工帮忙', perm: 'workbench:use' },
      { key: '/employees', icon: <TeamOutlined />, label: '管理数字员工', perm: 'employee:manage' },
    ],
  },
];

const guideTargetByRoute: Record<string, string> = {
  '/studio': 'quick-production',
  '/production': 'projects',
  '/canvas': 'canvas',
  '/workbench': 'employees',
  '/guide': 'manual',
};

// 高级能力不再逐页平铺；每个入口先回答“要完成什么任务”，再在能力中心内选具体工具。
const advancedNavSections: NavSection[] = [
  {
    title: '高级工作',
    items: advancedSections.map(({ path, title, icon: Icon, tasks }) => ({
      key: path,
      icon: <Icon />,
      label: title,
      anyPerms: [...new Set(tasks.map(task => task.perm))],
    })),
  },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches,
  );
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [advancedVisible, setAdvancedVisible] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pageIsWorkspace = location.pathname === '/studio'
    || location.pathname === '/workbench'
    || location.pathname.startsWith('/production')
    || location.pathname === '/canvas';
  const isImmersiveCanvas = location.pathname === '/canvas';

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const mobile = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsNarrow(media.matches);
    const syncMobile = () => { setIsMobile(mobile.matches); if (!mobile.matches) setDrawerOpen(false); };
    sync(); syncMobile();
    media.addEventListener('change', sync);
    mobile.addEventListener('change', syncMobile);
    return () => { media.removeEventListener('change', sync); mobile.removeEventListener('change', syncMobile); };
  }, []);

  // 直接打开高级功能地址时同步展开导航，确保当前位置可见。
  useEffect(() => {
    const isAdvancedRoute = location.pathname.startsWith('/advanced/')
      || Boolean(findAdvancedRouteContext(location.pathname));
    if (isAdvancedRoute) setAdvancedVisible(true);
  }, [location.pathname]);

  // 移动抽屉打开后把焦点送入导航；Esc 关闭并把焦点还给菜单按钮。
  useEffect(() => {
    if (!isMobile || !drawerOpen) return;
    // 等本次点击的浏览器默认聚焦结束，再把焦点送进已经可见的抽屉。
    const focusTimer = window.setTimeout(() => {
      sidebarRef.current?.querySelector<HTMLButtonElement>('nav button')?.focus();
    }, 50);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setDrawerOpen(false);
      window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [drawerOpen, isMobile]);

  // 画布内部已有项目/集/镜头目录，外层主导航固定收成图标栏，避免双侧栏挤掉创作区。
  const navCollapsed = isMobile ? false : (isImmersiveCanvas || collapsed || isNarrow);
  const siderWidth = navCollapsed ? 64 : 240;

  // 按当前用户权限过滤导航;整段为空的分组连标题和“高级功能”开关一起隐藏。
  const filterPermitted = (sections: NavSection[]) => sections
    .map((section) => ({
      ...section,
      items: section.items.filter(item => {
        if (item.perm) return hasPerm(item.perm);
        if (item.anyPerms) return item.anyPerms.some(hasPerm);
        return true;
      }),
    }))
    .filter(section => section.items.length > 0);
  const permittedMainSections = filterPermitted(navSections);
  const permittedAdvancedSections = filterPermitted(advancedNavSections);
  const permittedAdvancedItemCount = permittedAdvancedSections
    .reduce((count, section) => count + section.items.length, 0);
  const shouldPromoteAdvancedNavigation = permittedAdvancedItemCount === 1;
  const hasAdvancedNavigation = permittedAdvancedItemCount >= 2;
  const displayedMainSections = shouldPromoteAdvancedNavigation
    ? [...permittedMainSections, ...permittedAdvancedSections]
    : permittedMainSections;
  const allPermittedItems = [
    ...displayedMainSections,
    ...(hasAdvancedNavigation ? permittedAdvancedSections : []),
  ].flatMap(section => section.items);
  const advancedRouteContext = findAdvancedRouteContext(location.pathname);
  const legacyAdvancedOwner = advancedRouteContext?.section.path;
  const currentNavKey = legacyAdvancedOwner && allPermittedItems.some(item => item.key === legacyAdvancedOwner)
    ? legacyAdvancedOwner
    : allPermittedItems.map(item => item.key)
      .filter(key => matchesRoute(location.pathname, key))
      .sort((a, b) => b.length - a.length)[0];

  const logout = () => {
    userAuth.logout();
    navigate('/login', { replace: true });
  };

  const handleNav = (key: string) => {
    navigate(key);
    if (isMobile) setDrawerOpen(false);
  };

  const renderSections = (sections: NavSection[]) => sections.map((section, si) => (
    <div className="app-nav-section" key={`${section.title || 'section'}-${si}`}>
      {section.title && !navCollapsed && (
        <div className="app-nav-section__title">
          {section.title}
        </div>
      )}
      {section.title && navCollapsed && (
        <div className="app-nav-section__divider" />
      )}

      {section.items.map(item => {
        const isActive = currentNavKey === item.key;
        const navItem = (
          <button
            type="button"
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            data-user-guide={guideTargetByRoute[item.key]}
            key={item.key}
            onClick={() => handleNav(item.key)}
            className={[
              'app-nav-item',
              isActive ? 'is-active' : '',
              navCollapsed ? 'is-collapsed' : '',
            ].filter(Boolean).join(' ')}
          >
            {isActive && (
              <span aria-hidden="true" className="app-nav-item__marker" />
            )}
            <span aria-hidden="true" className="app-nav-item__icon">{item.icon}</span>
            {!navCollapsed && <span className="app-nav-item__label">{item.label}</span>}
          </button>
        );

        return navCollapsed ? (
          <Tooltip key={item.key} title={item.label} placement="right">
            {navItem}
          </Tooltip>
        ) : (
          <div key={item.key}>{navItem}</div>
        );
      })}
    </div>
  ));

  return (
    <div className={`app-shell${isMobile ? ' is-mobile' : ''}`}>
      <TaskCompletionNotifier />
      <SystemManagerDrawer />
      <UserHelpCenter
        isMobile={isMobile}
        onMobileGuideOpen={() => setDrawerOpen(true)}
        onMobileGuideClose={() => setDrawerOpen(false)}
      />
      {/* Mobile header */}
      {isMobile && (
        <header data-user-guide="brand" className="app-mobile-header">
          <button
            type="button"
            ref={mobileMenuButtonRef}
            aria-label={drawerOpen ? '关闭导航' : '打开导航'}
            aria-expanded={drawerOpen}
            aria-controls="primary-navigation"
            onClick={() => setDrawerOpen(value => !value)}
            className="app-mobile-menu"
          >
            {drawerOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
          <img src="/favicon.svg" alt="" width={28} height={28} className="app-brand__logo" />
          <div className="app-mobile-brand">Agent Studio</div>
          <span className="app-mobile-context">创作工作台</span>
        </header>
      )}

      {/* Backdrop */}
      {isMobile && drawerOpen && (
        <button type="button" aria-label="关闭导航" onClick={() => {
          setDrawerOpen(false);
          window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
        }} className="app-nav-backdrop" />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        aria-label="主导航"
        aria-hidden={isMobile && !drawerOpen}
        className={[
          'app-sidebar',
          navCollapsed ? 'is-collapsed' : '',
          isMobile ? 'is-mobile' : '',
          drawerOpen ? 'is-open' : '',
        ].filter(Boolean).join(' ')}
        style={{
          width: isMobile ? 260 : siderWidth,
          left: isMobile ? (drawerOpen ? 0 : -260) : 0,
          top: isMobile ? 52 : 0, bottom: 0,
          visibility: isMobile && !drawerOpen ? 'hidden' : 'visible',
        }}
      >
        {/* Brand — hidden on mobile (shown in header) */}
        {!isMobile && <div
          data-user-guide="brand"
          className={`app-brand${navCollapsed ? ' is-collapsed' : ''}`}
        >
          <img src="/favicon.svg" alt="" width={34} height={34} className="app-brand__logo" />
          {!navCollapsed && (
            <div className="app-brand__copy">
              <div className="app-brand__name">
                Agent Studio
              </div>
              <div className="app-brand__caption">
                AI Production OS
              </div>
            </div>
          )}
        </div>}

        {/* Navigation */}
        <nav
          id="primary-navigation"
          aria-label="功能导航"
          className={`app-navigation${navCollapsed ? ' is-collapsed' : ''}`}
        >
          {renderSections(displayedMainSections)}
          {hasAdvancedNavigation && (
            <div id="advanced-navigation" hidden={!advancedVisible}>
              {renderSections(permittedAdvancedSections)}
            </div>
          )}
        </nav>

        {hasAdvancedNavigation && <button
          type="button"
          aria-label={advancedVisible ? '收起高级功能' : '展开高级功能'}
          aria-expanded={advancedVisible}
          aria-controls="advanced-navigation"
          onClick={() => setAdvancedVisible(value => !value)}
          className={`app-sidebar-action${navCollapsed ? ' is-collapsed' : ''}`}
        >
          <ControlOutlined />
          {!navCollapsed && <><span>高级功能</span>{advancedVisible ? <UpOutlined /> : <DownOutlined />}</>}
        </button>}

        {/* Logout */}
        <button
          type="button"
          aria-label="退出登录"
          onClick={logout}
          className={`app-sidebar-action app-sidebar-action--logout${navCollapsed ? ' is-collapsed' : ''}`}
        >
          <LogoutOutlined />
          {!navCollapsed && <span>退出登录</span>}
        </button>

        {/* Collapse toggle */}
        <button
          type="button"
          aria-label={collapsed ? '展开导航' : '折叠导航'}
          onClick={() => setCollapsed(!collapsed)}
          className="app-sidebar-collapse"
          style={{
            visibility: (isNarrow || isMobile || isImmersiveCanvas) ? 'hidden' : 'visible',
          }}
        >
          {collapsed ? <RightOutlined /> : <LeftOutlined />}
        </button>
      </aside>

      {/* Main content */}
      <div className="app-main" style={{
        marginLeft: isMobile ? 0 : siderWidth,
        width: isMobile ? '100vw' : `calc(100vw - ${siderWidth}px)`,
        transition: isMobile ? 'none' : 'margin-left 0.2s',
        minHeight: isMobile ? 'calc(100vh - 52px)' : '100vh',
      }}>
        <div className={`app-content${pageIsWorkspace ? ' is-workspace' : ''}${isImmersiveCanvas ? ' is-canvas' : ''}`} style={{
          padding: pageIsWorkspace ? (isMobile ? '6px' : isImmersiveCanvas ? '6px' : isNarrow ? '8px' : '14px') : (isMobile ? '12px' : isNarrow ? '16px' : '28px'),
          height: isImmersiveCanvas ? (isMobile ? 'calc(100dvh - 52px)' : '100dvh') : undefined,
          overflow: isImmersiveCanvas ? 'hidden' : undefined,
        }}>
          {advancedRouteContext && (
            <nav aria-label="当前位置" className="app-breadcrumb" style={{ marginBottom: isMobile ? 12 : 18 }}>
              <ol>
                <li><Link to="/dashboard">今日工作</Link></li>
                <li aria-hidden="true">›</li>
                <li>
                  <Link to={advancedRouteContext.section.path}>
                    {advancedRouteContext.section.title}
                  </Link>
                </li>
                <li aria-hidden="true">›</li>
                <li aria-current="page">
                  {advancedRouteContext.task.title}
                </li>
              </ol>
            </nav>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
