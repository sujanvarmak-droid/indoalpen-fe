import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLE_DASHBOARDS } from '@/constants/roles';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';

export const AppRoute = ({
  element,
  requireAuth = false,
  requiredPermission = null,
  guestOnly = false,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();
  const needsRoleSelection = isAuthenticated && user?.requiresRoleSelection;

  if (guestOnly && isAuthenticated) {
    if (needsRoleSelection) {
      return <Navigate to={ACCOUNT_ROUTES.ROLE_SELECTION} replace />;
    }
    const dest = ROLE_DASHBOARDS[user?.role] ?? ACCOUNT_ROUTES.DASHBOARD;
    return <Navigate to={dest} replace />;
  }
  if (requireAuth && !isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAuth && needsRoleSelection && !location.pathname.startsWith(ACCOUNT_ROUTES.ROLE_SELECTION)) {
    return <Navigate to={ACCOUNT_ROUTES.ROLE_SELECTION} replace />;
  }
  if (requiredPermission && !hasPermission(requiredPermission))
    return <Navigate to="/unauthorized" replace />;

  return element;
};
