import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { getMe as getMyAccount } from '@/services/userService';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { SiteFooter } from '@/components/layout/SiteFooter';

export const PublicLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const accountMenuRef = useRef(null);

  const navLinks = [
    { label: 'Journals & Books', to: '/' },
    { label: 'Browse', to: '/browse' },
  ];
  const accountLinks = [
    { label: 'Dashboard', to: ACCOUNT_ROUTES.DASHBOARD },
    { label: 'New Submission', to: ACCOUNT_ROUTES.NEW_SUBMISSION },
    { label: 'My Submissions', to: ACCOUNT_ROUTES.DASHBOARD },
    { label: 'Profile', to: ACCOUNT_ROUTES.PROFILE },
    { label: 'Change Password', to: `${ACCOUNT_ROUTES.PROFILE}#security` },
  ];
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );
  const displayName = user?.name ?? user?.fullName ?? user?.email ?? 'User';

  useEffect(() => {
    let isMounted = true;
    const loadMe = async () => {
      try {
        const profile = await getMyAccount();
        const feed = Array.isArray(profile?.notifications) ? profile.notifications : [];
        if (isMounted) {
          setNotifications(feed);
        }
      } catch {
        if (isMounted) {
          setNotifications([]);
        }
      }
    };

    if (isAuthenticated) {
      loadMe();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="shrink-0">
              <img src="/image.png" alt="IndoAlpen Verlag" className="h-10 w-auto" />
            </Link>

            {/* Center nav */}
            <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="hover:text-brand transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side — changes based on auth */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              {isAuthenticated ? (
                <>
                  <div className="relative hidden sm:block" ref={accountMenuRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAccountMenuOpen((open) => !open)}
                      className={`text-sm font-medium text-brand hover:text-brand-light relative ${unreadCount > 0 ? 'pr-7' : ''}`}
                    >
                      {displayName}
                      {unreadCount > 0 ? (
                        <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium leading-none text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      ) : null}
                    </Button>
                    {accountMenuOpen ? (
                      <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white py-2 shadow-lg z-50">
                        <div className="px-4 pb-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Notifications</p>
                          {notifications.length === 0 ? (
                            <p className="text-xs text-gray-500">No notifications.</p>
                          ) : (
                            <div className="max-h-32 overflow-auto space-y-2">
                              {notifications.slice(0, 3).map((item, idx) => (
                                <div key={item.id ?? idx} className="rounded-md border border-gray-100 px-2 py-1.5">
                                  <p className="text-xs text-gray-700">{item.title ?? item.message ?? 'Notification'}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="border-t border-gray-100 my-1" />
                        {accountLinks.map((link) => (
                          <Link
                            key={link.label}
                            to={link.to}
                            onClick={() => setAccountMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <Button variant="secondary" size="sm" onClick={logout}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 hover:text-brand transition-colors hidden sm:inline"
                  >
                    Sign In
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" size="sm">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      {mobileMenuOpen ? (
        <div className="border-b border-gray-200 bg-white px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-2 text-sm text-gray-700">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 hover:bg-gray-50 hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-50 hover:text-brand">
                  Sign In
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-50 hover:text-brand">
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="rounded-md px-3 py-2 text-sm text-gray-600">
                  Notifications
                  {unreadCount > 0 ? (
                    <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium leading-none text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
                </div>
                <p className="px-3 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">My Account</p>
                {accountLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2 hover:bg-gray-50 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>
      ) : null}
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <Toast />
    </div>
  );
};
