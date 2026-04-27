import api from '@/services/api';

export const getMySubmissions = async ({ page = 0, size = 10 } = {}) => {
  const response = await api.get('/submissions', { params: { page, size } });
  return response.data;
};

export const createDraft = async (data) => {
  const response = await api.post('/submissions', data);
  return response.data;
};

export const updateDraft = async ({ id, data }) => {
  const response = await api.patch(`/submissions/${id}`, data);
  return response.data;
};

export const submitForReview = async (id) => {
  const response = await api.patch(`/submissions/${id}/submit`);
  return response.data;
};

export const getPresignedUrl = async ({ filename, contentType }) => {
  const response = await api.get('/submissions/presigned-url', {
    params: { filename, contentType },
  });
  return response.data;
};

export const attachFile = async ({ submissionId, fileUrl, fileName, fileType }) => {
  const response = await api.patch(`/submissions/${submissionId}/files`, {
    fileUrl,
    fileName,
    fileType,
  });
  return response.data;
};
