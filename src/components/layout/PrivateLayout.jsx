import { useEffect, useMemo, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSidebarOpen, toggleSidebar } from '@/features/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { getMe as getMyAccount } from '@/services/userService';
import { Toast } from '@/components/ui/Toast';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  { label: 'Dashboard',      path: ACCOUNT_ROUTES.DASHBOARD,      permission: PERMISSIONS.VIEW_DASHBOARD, icon: '📊' },
  { label: 'New Submission', path: ACCOUNT_ROUTES.NEW_SUBMISSION, permission: PERMISSIONS.SUBMIT_PAPER,   icon: '📝' },
  { label: 'My Submissions', path: ACCOUNT_ROUTES.DASHBOARD,      permission: PERMISSIONS.SUBMIT_PAPER,   icon: '📂' },
  { label: 'Profile',        path: ACCOUNT_ROUTES.PROFILE,        permission: PERMISSIONS.VIEW_DASHBOARD, icon: '👤' },
  { label: 'Review Queue',   path: null,               permission: PERMISSIONS.REVIEW_PAPER,   icon: '🔍', disabled: true, badge: 'Phase 2' },
  { label: 'Admin Panel',    path: null,               permission: PERMISSIONS.MANAGE_USERS,   icon: '⚙️', disabled: true, badge: 'Phase 2' },
];

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const roleBadgeColor = {
  admin:  'bg-purple-100 text-purple-700',
  editor: 'bg-amber-100 text-amber-700',
  author: 'bg-brand-muted text-brand',
  public: 'bg-gray-100 text-gray-600',
};

export const PrivateLayout = () => {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const pageTitle = NAV_LINKS.find((l) => l.path === location.pathname)?.label ?? 'IndoAlpenVerlag';
  const closeSidebar = () => dispatch(setSidebarOpen(false));
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    }
  }, [location.pathname, dispatch]);

  useEffect(() => {
    let isMounted = true;
    const loadMe = async () => {
      try {
        const profile = await getMyAccount();
        const feed = Array.isArray(profile?.notifications) ? profile.notifications : [];
        if (isMounted) {
          setNotifications(feed);
          setNotificationError(null);
        }
      } catch {
        if (isMounted) {
          setNotifications([]);
          setNotificationError('Failed to load notifications');
        }
      }
    };

    if (user) {
      loadMe();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    setIsNotificationOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-brand text-white shadow-lg transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-5 border-b border-white/10">
          <img src="/image.png" alt="IndoAlpen Verlag" className="h-9 w-auto" />
        </div>

        {user && (
          <div className="p-5 border-b border-white/10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-white font-semibold text-lg">
              {getInitials(user.name)}
            </div>
            <p className="text-sm font-medium text-white truncate max-w-full">{user.name}</p>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                roleBadgeColor[user.role] ?? 'bg-gray-100 text-gray-700'
              )}
            >
              {user.role}
            </span>
          </div>
        )}

        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {NAV_LINKS.filter((link) => hasPermission(link.permission)).map((link) => {
            if (link.disabled || !link.path) {
              return (
                <div
                  key={link.label}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-white/40 cursor-not-allowed select-none"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span>{link.icon}</span>
                    {link.label}
                  </span>
                  {link.badge && (
                    <span className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
                      {link.badge}
                    </span>
                  )}
                </div>
              );
            }
            return (
              <NavLink
                key={link.label}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                <span>{link.icon}</span>
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex min-w-0 flex-col">
        <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => dispatch(toggleSidebar())}
              variant="ghost"
              size="sm"
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            <h1 className="text-base font-semibold text-gray-800">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-400 hover:text-gray-600 relative"
                onClick={() => setIsNotificationOpen((open) => !open)}
                title="Notifications"
                aria-label="Notifications"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium leading-none text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </Button>
              {isNotificationOpen ? (
                <div className="absolute right-0 mt-2 w-80 rounded-md border border-gray-200 bg-white p-3 shadow-lg z-50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Notifications</p>
                  {notificationError ? (
                    <p className="text-sm text-red-500">{notificationError}</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">No notifications found in `/users/me`.</p>
                  ) : (
                    <div className="max-h-72 overflow-auto space-y-2">
                      {notifications.map((item, idx) => (
                        <div key={item.id ?? idx} className="rounded-md border border-gray-100 px-3 py-2">
                          <p className="text-sm text-gray-800">{item.title ?? item.message ?? 'Notification'}</p>
                          {item.description ? (
                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-brand"
            >
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
        <SiteFooter />
      </div>

      <Toast />
    </div>
  );
};
