export const ACCOUNT_ROUTES = {
  BASE: '/my-account',
  DASHBOARD: '/my-account/dashboard',
  ROLE_SELECTION: '/my-account/select-role',
  NEW_SUBMISSION: '/my-account/submissions/new',
  EDIT_SUBMISSION: (id = ':id') => `/my-account/submissions/${id}/edit`,
  PROFILE: '/my-account/profile',
  AUTHOR_PROFILE: '/my-account/author-profile',
};
