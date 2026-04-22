import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';

// Role values match the backend exactly (uppercase)
export const ROLES = {
  ADMIN:    'ADMIN',
  EDITOR:   'EDITOR',
  REVIEWER: 'REVIEWER',
  AUTHOR:   'AUTHOR',
};

export const ROLE_DASHBOARDS = {
  AUTHOR:   ACCOUNT_ROUTES.DASHBOARD,
  REVIEWER: '/reviewer/dashboard',
  EDITOR:   '/editor/dashboard',
  ADMIN:    '/admin/dashboard',
};
