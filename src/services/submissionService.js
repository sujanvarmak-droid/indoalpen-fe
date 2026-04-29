import api from '@/services/api';

const unwrapData = (payload) =>
  payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object'
    ? payload.data
    : payload;

const normalizeSubmissionSummary = (submission = {}) => {
  const source = unwrapData(submission) ?? {};
  const versions = Array.isArray(source.versions) ? source.versions : [];
  const latestVersion = versions.reduce((acc, version) => {
    if (!acc) return version;
    return Number(version?.version ?? 0) > Number(acc?.version ?? 0) ? version : acc;
  }, null);

  return {
    ...source,
    id:
      source.id ??
      source.originalSubmissionId ??
      latestVersion?.submissionId ??
      null,
    status: source.status ?? source.latestStatus ?? latestVersion?.status ?? null,
    version: source.version ?? latestVersion?.version ?? 1,
    submissionId: source.submissionId ?? latestVersion?.submissionId ?? null,
  };
};

const resolveSubmissionId = (payload = {}) =>
  payload?.submissionId ??
  payload?.id ??
  payload?.originalSubmissionId ??
  payload?.versions?.[0]?.submissionId ??
  null;

const normalizeSubmissionDetails = (submission = {}, fallbackId = null) => {
  const source = unwrapData(submission) ?? {};
  const normalized = normalizeSubmissionSummary(source);
  const resolvedId = normalized.id ?? fallbackId;
  return {
    ...source,
    ...normalized,
    id: resolvedId,
    submissionId: normalized.submissionId ?? resolvedId,
  };
};

export const getMySubmissions = async ({ page = 0, size = 10 } = {}) => {
  const response = await api.get('/submissions/my', { params: { page, size } });
  const data = response.data;

  // Supports both paginated object responses and raw array responses.
  if (Array.isArray(data)) {
    const content = data.map(normalizeSubmissionSummary);
    return {
      content,
      totalElements: content.length,
      page,
      size,
    };
  }

  const content = Array.isArray(data?.content)
    ? data.content.map(normalizeSubmissionSummary)
    : [];

  return {
    ...data,
    content,
    totalElements: data?.totalElements ?? content.length,
    page: data?.page ?? page,
    size: data?.size ?? size,
  };
};

export const createDraft = async (data) => {
  const response = await api.post('/submissions', data);
  return normalizeSubmissionDetails(response.data ?? {});
};

export const startSubmission = async ({ journalCode }) => {
  const response = await api.post('/submissions/start', { journalCode });
  const data = response.data ?? {};
  return {
    ...data,
    submissionId: resolveSubmissionId(data),
  };
};

export const updateDraft = async ({ id, data }) => {
  const response = await api.patch(`/submissions/${id}`, data);
  return normalizeSubmissionDetails(response.data ?? {}, id);
};

export const updateSubmissionStep = async ({ submissionId, stepType, data }) => {
  const response = await api.patch(`/submissions/${submissionId}/steps/${stepType}`, data);
  return response.data;
};

export const getSubmissionById = async (id) => {
  const response = await api.get(`/submissions/${id}`);
  return normalizeSubmissionDetails(response.data ?? {}, id);
};

export const submitForReview = async (id) => {
  const response = await api.post(`/submissions/${id}/submit`);
  return normalizeSubmissionDetails(response.data ?? {}, id);
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
