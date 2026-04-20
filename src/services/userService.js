import api from '@/services/api';

export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateMe = async (data) => {
  const response = await api.put('/users/me', data);
  return response.data;
};
