// Role values match the backend exactly (uppercase)
export const ROLES = {
  ADMIN:    'ADMIN',
  EDITOR:   'EDITOR',
  REVIEWER: 'REVIEWER',
  AUTHOR:   'AUTHOR',
};

export const ROLE_DASHBOARDS = {
  AUTHOR:   '/dashboard',
  REVIEWER: '/reviewer/dashboard',
  EDITOR:   '/editor/dashboard',
  ADMIN:    '/admin/dashboard',
};
