import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { ROLE_PERMISSIONS } from '@/constants/permissions';

export const usePermissions = () => {
  const user = useSelector(selectCurrentUser);

  const hasPermission = (permission) => {
    if (!user?.role) return false;
    const perms = ROLE_PERMISSIONS[user.role] ?? [];
    return perms.includes(permission);
  };

  return { hasPermission };
};
