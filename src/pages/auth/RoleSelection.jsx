import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { ROLE_DASHBOARDS } from '@/constants/roles';

const formatRoleLabel = (role) =>
  String(role ?? '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ROLE_ICON = {
  AUTHOR: '📝',
  REVIEWER: '🔍',
  EDITOR: '✍️',
  ADMIN: '⚙️',
};

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, status, chooseRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState('');

  const availableRoles = useMemo(() => {
    if (!Array.isArray(user?.roles)) return [];
    return user.roles.filter(Boolean);
  }, [user?.roles]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.requiresRoleSelection) {
    const fallbackRole = user?.role;
    const destination = ROLE_DASHBOARDS[fallbackRole] ?? ACCOUNT_ROUTES.DASHBOARD;
    return <Navigate to={destination} replace />;
  }

  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Please choose a role to continue.');
      return;
    }
    setError('');
    const result = await chooseRole(selectedRole);
    if (result.success) {
      navigate(result.redirectTo, { replace: true });
      return;
    }
    setError(result.message ?? 'Unable to switch role. Please try again.');
  };

  return (
    <div className="mx-auto mt-8 max-w-xl rounded-xl bg-white p-6 shadow sm:mt-16 sm:p-8">
      <h1 className="text-2xl font-bold text-brand">Choose your role</h1>
      <p className="mt-2 text-sm text-gray-600">
        Your account has multiple roles. Select one to load the correct permissions and dashboard.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {availableRoles.map((role) => {
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                isSelected
                  ? 'border-brand bg-brand-muted text-brand'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-brand-light'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                  {ROLE_ICON[role] ?? '👤'}
                </span>
                <div>
                  <p className="font-medium">{formatRoleLabel(role)}</p>
                  <p className="text-xs text-gray-500">Continue as {formatRoleLabel(role)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        variant="primary"
        className="mt-6 w-full"
        onClick={handleContinue}
        loading={status === 'loading'}
      >
        Continue
      </Button>
    </div>
  );
};

export default RoleSelection;
