import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '@/features/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { Toast } from '@/components/ui/Toast';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  { label: 'Dashboard',      path: '/dashboard',       permission: PERMISSIONS.VIEW_DASHBOARD, icon: '📊' },
  { label: 'New Submission', path: '/submissions/new', permission: PERMISSIONS.SUBMIT_PAPER,   icon: '📝' },
  { label: 'My Submissions', path: '/dashboard',       permission: PERMISSIONS.SUBMIT_PAPER,   icon: '📂' },
  { label: 'Profile',        path: '/profile',         permission: PERMISSIONS.VIEW_DASHBOARD, icon: '👤' },
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
  author: 'bg-blue-100 text-blue-700',
  public: 'bg-gray-100 text-gray-600',
};

export const PrivateLayout = () => {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();

  const pageTitle = NAV_LINKS.find((l) => l.path === location.pathname)?.label ?? 'IndoAlpenVerlag';

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside
        className={cn(
          'bg-brand text-white flex flex-col transition-all duration-300 shrink-0',
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base font-semibold text-gray-800">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Notifications (Phase 2)"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-brand transition-colors px-2 py-1 rounded hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Toast />
    </div>
  );
};
