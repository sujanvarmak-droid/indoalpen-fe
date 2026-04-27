import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { ROLE_PERMISSIONS } from '@/constants/permissions';
import { getAccessToken } from '@/utils/tokenStorage';

const parseJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const payloadPart = token.split('.')[1];
  if (!payloadPart) return null;
  try {
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

const resolveRole = (user) => {
  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    return String(user.roles[0]).replace(/^ROLE_/, '').toUpperCase();
  }
  if (user?.role) return String(user.role).toUpperCase();

  const tokenPayload = parseJwtPayload(getAccessToken());
  if (!tokenPayload || typeof tokenPayload !== 'object') return null;

  if (tokenPayload.role) return String(tokenPayload.role).toUpperCase();

  if (Array.isArray(tokenPayload.roles) && tokenPayload.roles.length > 0) {
    return String(tokenPayload.roles[0]).replace(/^ROLE_/, '').toUpperCase();
  }

  if (Array.isArray(tokenPayload.authorities) && tokenPayload.authorities.length > 0) {
    return String(tokenPayload.authorities[0]).replace(/^ROLE_/, '').toUpperCase();
  }

  return null;
};

export const usePermissions = () => {
  const user = useSelector(selectCurrentUser);

  const hasPermission = (permission) => {
    if (!user) return false;

    // Prefer explicit permissions from backend when available.
    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
      return user.permissions.includes(permission);
    }

    const normalizedRole = resolveRole(user);
    if (!normalizedRole) return false;

    const perms = ROLE_PERMISSIONS[normalizedRole] ?? [];
    return perms.includes(permission);
  };

  return { hasPermission };
};
