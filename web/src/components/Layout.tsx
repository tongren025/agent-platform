// 用户端主布局：左侧导航（按权限显隐）+ 内容区；含折叠与窄屏适配。
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import {
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
import { COLORS } from '../theme';
import { hasPerm, userAuth } from '../userAuth';
import TaskCompletionNotifier from './TaskCompletionNotifier';
import SystemManagerDrawer from './SystemManagerDrawer';

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
      { key: '/workbench', icon: <MessageOutlined />, label: '找数字员工帮忙', perm: 'workbench:use' },
      { key: '/employees', icon: <TeamOutlined />, label: '管理数字员工', perm: 'employee:manage' },
    ],
  },
];

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
    <div key={`${section.title || 'section'}-${si}`} style={{ marginBottom: 8 }}>
      {section.title && !navCollapsed && (
        <div style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.68)',
          padding: '10px 12px 6px',
        }}>
          {section.title}
        </div>
      )}
      {section.title && navCollapsed && (
        <div style={{
          height: 1, background: 'rgba(255,255,255,0.06)',
          margin: '8px 6px',
        }} />
      )}

      {section.items.map(item => {
        const isActive = currentNavKey === item.key;
        const navItem = (
          <button
            type="button"
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            key={item.key}
            onClick={() => handleNav(item.key)}
            style={{
              display: 'flex', alignItems: 'center',
              gap: 12, padding: navCollapsed ? '10px 0' : '10px 12px',
              justifyContent: navCollapsed ? 'center' : 'flex-start',
              borderRadius: 10, cursor: 'pointer',
              marginBottom: 2, minHeight: 40,
              transition: 'all 0.15s',
              background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              fontWeight: isActive ? 600 : 400,
              position: 'relative',
              border: 0, width: '100%', fontFamily: 'inherit', textAlign: 'left',
            }}
            onMouseEnter={event => {
              if (!isActive) {
                event.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                event.currentTarget.style.color = 'rgba(255,255,255,0.8)';
              }
            }}
            onMouseLeave={event => {
              if (!isActive) {
                event.currentTarget.style.background = 'transparent';
                event.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              }
            }}
          >
            {isActive && (
              <span aria-hidden="true" style={{
                position: 'absolute', left: navCollapsed ? '50%' : -12, top: navCollapsed ? 'auto' : '50%',
                bottom: navCollapsed ? -2 : 'auto',
                transform: navCollapsed ? 'translateX(-50%)' : 'translateY(-50%)',
                width: navCollapsed ? 20 : 3,
                height: navCollapsed ? 3 : 20,
                borderRadius: 2,
                background: COLORS.iris,
              }} />
            )}
            <span aria-hidden="true" style={{ fontSize: 16 }}>{item.icon}</span>
            {!navCollapsed && <span style={{ fontSize: 14 }}>{item.label}</span>}
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100vw', overflowX: 'hidden' }}>
      <TaskCompletionNotifier />
      <SystemManagerDrawer />
      {/* Mobile header */}
      {isMobile && (
        <div style={{
          height: 52, display: 'flex', alignItems: 'center', padding: '0 16px',
          background: COLORS.ink, position: 'sticky', top: 0, zIndex: 101,
          gap: 12, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            type="button"
            ref={mobileMenuButtonRef}
            aria-label={drawerOpen ? '关闭导航' : '打开导航'}
            aria-expanded={drawerOpen}
            aria-controls="primary-navigation"
            onClick={() => setDrawerOpen(value => !value)}
            style={{
              width: 40, height: 40, background: 'none', border: 0, color: '#fff',
              fontSize: 20, cursor: 'pointer', padding: 0, marginLeft: -8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {drawerOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
          <img src="/favicon.svg" alt="Agent Studio" width={28} height={28} style={{ borderRadius: 8 }} />
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Agent Studio</div>
        </div>
      )}

      {/* Backdrop */}
      {isMobile && drawerOpen && (
        <button type="button" aria-label="关闭导航" onClick={() => {
          setDrawerOpen(false);
          window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
        }} style={{
          position: 'fixed', inset: 0, top: 52, background: 'rgba(0,0,0,0.5)',
          zIndex: 199, transition: 'opacity 0.2s', border: 0, padding: 0,
        }} />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        aria-label="主导航"
        aria-hidden={isMobile && !drawerOpen}
        style={{
          width: isMobile ? 260 : siderWidth,
          background: `linear-gradient(180deg, ${COLORS.inkLight} 0%, ${COLORS.ink} 100%)`,
          borderRight: '1px solid rgba(255,255,255,0.04)',
          overflow: 'hidden auto',
          position: 'fixed',
          left: isMobile ? (drawerOpen ? 0 : -260) : 0,
          top: isMobile ? 52 : 0, bottom: 0,
          zIndex: isMobile ? 200 : 100,
          transition: isMobile ? 'left 0.25s ease' : 'width 0.2s',
          visibility: isMobile && !drawerOpen ? 'hidden' : 'visible',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Brand — hidden on mobile (shown in header) */}
        {!isMobile && <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          justifyContent: navCollapsed ? 'center' : 'flex-start',
          padding: navCollapsed ? '0' : '0 20px',
          gap: 10, flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <img src="/favicon.svg" alt="Agent Studio" width={34} height={34} style={{ borderRadius: 10, flexShrink: 0 }} />
          {!navCollapsed && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Agent Studio
              </div>
              <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: 10, fontWeight: 500 }}>
                Creative AI Platform
              </div>
            </div>
          )}
        </div>}

        {/* Navigation */}
        <nav id="primary-navigation" aria-label="功能导航" style={{ flex: 1, padding: navCollapsed ? '12px 8px' : '12px 12px' }}>
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
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            justifyContent: navCollapsed ? 'center' : 'flex-start',
            padding: navCollapsed ? '11px 0' : '11px 24px',
            cursor: 'pointer', color: 'rgba(255,255,255,0.72)', fontSize: 13,
            border: 0, borderTop: '1px solid rgba(255,255,255,0.06)',
            width: '100%', background: 'transparent', fontFamily: 'inherit',
          }}
        >
          <ControlOutlined />
          {!navCollapsed && <><span style={{ flex: 1, textAlign: 'left' }}>高级功能</span>{advancedVisible ? <UpOutlined /> : <DownOutlined />}</>}
        </button>}

        {/* Logout */}
        <button
          type="button"
          aria-label="退出登录"
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            justifyContent: navCollapsed ? 'center' : 'flex-start',
            padding: navCollapsed ? '12px 0' : '12px 24px',
            cursor: 'pointer',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.72)', fontSize: 13,
            transition: 'color 0.15s', flexShrink: 0,
            border: 0, width: '100%', background: 'transparent', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = COLORS.rose; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; }}
        >
          <LogoutOutlined style={{ fontSize: 15 }} />
          {!navCollapsed && <span>退出登录</span>}
        </button>

        {/* Collapse toggle */}
        <button
          type="button"
          aria-label={collapsed ? '展开导航' : '折叠导航'}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            padding: '14px 0', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.72)', fontSize: 14,
            transition: 'color 0.15s', flexShrink: 0,
            visibility: (isNarrow || isMobile || isImmersiveCanvas) ? 'hidden' : 'visible',
            border: 0, width: '100%', background: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.95)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; }}
        >
          {collapsed ? <RightOutlined /> : <LeftOutlined />}
        </button>
      </aside>

      {/* Main content */}
      <div style={{
        marginLeft: isMobile ? 0 : siderWidth,
        flex: 1,
        width: isMobile ? '100vw' : `calc(100vw - ${siderWidth}px)`,
        minWidth: 0,
        transition: isMobile ? 'none' : 'margin-left 0.2s',
        background: COLORS.canvas,
        minHeight: isMobile ? 'calc(100vh - 52px)' : '100vh',
        overflowX: 'hidden',
      }}>
        <div style={{
          padding: pageIsWorkspace ? (isMobile ? '6px' : isImmersiveCanvas ? '6px' : isNarrow ? '8px' : '14px') : (isMobile ? '12px' : isNarrow ? '16px' : '28px'),
          minWidth: 0,
          height: isImmersiveCanvas ? (isMobile ? 'calc(100dvh - 52px)' : '100dvh') : undefined,
          boxSizing: 'border-box',
          overflow: isImmersiveCanvas ? 'hidden' : undefined,
        }}>
          {advancedRouteContext && (
            <nav aria-label="当前位置" style={{ marginBottom: isMobile ? 12 : 18, overflowX: 'auto', whiteSpace: 'nowrap' }}>
              <ol style={{
                alignItems: 'center',
                display: 'flex',
                gap: 8,
                listStyle: 'none',
                margin: 0,
                minWidth: 'max-content',
                padding: 0,
                color: '#64748b',
                fontSize: 13,
              }}>
                <li><Link to="/dashboard" style={{ color: '#64748b' }}>今日工作</Link></li>
                <li aria-hidden="true" style={{ color: '#94a3b8' }}>›</li>
                <li>
                  <Link to={advancedRouteContext.section.path} style={{ color: '#64748b' }}>
                    {advancedRouteContext.section.title}
                  </Link>
                </li>
                <li aria-hidden="true" style={{ color: '#94a3b8' }}>›</li>
                <li aria-current="page" style={{ color: '#334155', fontWeight: 600 }}>
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
