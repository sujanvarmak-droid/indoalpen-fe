import api from '@/services/api';

export const getMySubmissions = async ({ page = 0, size = 10 } = {}) => {
  const response = await api.get('/submissions', { params: { page, size } });
  return response.data;
};

export const createDraft = async (data) => {
  const response = await api.post('/submissions', data);
  return response.data;
};

export const startSubmission = async ({ journalCode }) => {
  const response = await api.post('/submissions/start', { journalCode });
  return response.data;
};

export const updateDraft = async ({ id, data }) => {
  const response = await api.patch(`/submissions/${id}`, data);
  return response.data;
};

export const updateSubmissionStep = async ({ submissionId, stepType, data }) => {
  const response = await api.patch(`/submissions/${submissionId}/steps/${stepType}`, data);
  return response.data;
};

export const getSubmissionById = async (id) => {
  const response = await api.get(`/submissions/${id}`);
  return response.data;
};

export const submitForReview = async (id) => {
  const response = await api.post(`/submissions/${id}/submit`);
  return response.data;
};

export const getPresignedUrl = async ({ fileName, contentType, publicationId }) => {
  const response = await api.get('/files/presigned-url', {
    params: { fileName, contentType, publicationId },
  });
  return response.data;
};

export const attachFile = async ({
  publicationId,
  s3Key,
  fileName,
  contentType,
  fileType,
}) => {
  const response = await api.post('/files/attach', {
    publicationId,
    s3Key,
    fileName,
    contentType,
    fileType,
  });
  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};
