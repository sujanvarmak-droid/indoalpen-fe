import api from '@/services/api';

export const login = async ({ email, password }) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data; // { token, role, userId, email }
};

export const signup = async ({ fullName, email, password, consentGiven }) => {
  const res = await api.post('/auth/signup', { fullName, email, password, consentGiven });
  return res.data; // { message }
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data; // { id, email, fullName, role, isActive, createdAt }
};

export const verifyEmail = async (token) => {
  const res = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  return res.data; // { token, role, userId, email }
};

export const forgotPassword = async ({ email }) => {
  await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async ({ token, newPassword }) => {
  await api.post('/auth/reset-password', { token, newPassword });
};
