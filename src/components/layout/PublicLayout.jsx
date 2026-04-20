import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export const PublicLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: 'Journals & Books', to: '/' },
    { label: 'Browse', to: '/' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
              {isAuthenticated ? (
                <>
                  <span className="hidden sm:block text-sm text-gray-500">
                    Welcome, <span className="font-medium text-brand">{user?.name}</span>
                  </span>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-brand hover:underline hidden sm:inline"
                  >
                    My Account
                  </Link>
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
      <main>
        <Outlet />
      </main>
    </div>
  );
};
