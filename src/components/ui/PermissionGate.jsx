import { usePermissions } from '@/hooks/usePermissions';

export const PermissionGate = ({ permission, fallback = null, children }) => {
  const { hasPermission } = usePermissions();
  return hasPermission(permission) ? children : fallback;
};
