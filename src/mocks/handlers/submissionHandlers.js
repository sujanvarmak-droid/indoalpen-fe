import { http, HttpResponse } from 'msw';

const _rawBase = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').trim();
const BASE = _rawBase.endsWith('/api') ? _rawBase : `${_rawBase}/api`;

const mockSubmissions = [
  {
    originalSubmissionId: 'sub-1',
    title: 'Cardiac Biomarkers in Acute MI',
    abstract: 'This study examines the role of cardiac biomarkers in the early diagnosis of acute myocardial infarction and their prognostic significance.',
    keywords: ['cardiology', 'biomarkers', 'MI'],
    authors: [{ name: 'Dr. Anika Sharma', affiliation: 'AIIMS Hyderabad' }],
    category: 'Cardiology',
    latestStatus: 'SUBMITTED',
    versions: [{ submissionId: 'sub-1', version: 2, status: 'SUBMITTED' }],
    createdAt: '2026-04-10T10:00:00Z',
    files: [],
  },
  {
    originalSubmissionId: 'sub-2',
    title: 'Neural Plasticity Post-Stroke Rehabilitation',
    abstract: 'A retrospective analysis of neural plasticity mechanisms and their implications for post-stroke rehabilitation outcomes in adult patients.',
    keywords: ['neurology', 'stroke', 'rehabilitation'],
    authors: [{ name: 'Dr. Anika Sharma', affiliation: 'AIIMS Hyderabad' }],
    category: 'Neurology',
    latestStatus: 'DRAFT',
    versions: [{ submissionId: 'sub-2', version: 1, status: 'DRAFT' }],
    createdAt: '2026-04-18T09:00:00Z',
    files: [],
  },
];

export const submissionHandlers = [
  http.post(`${BASE}/submissions/start`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        submissionId: 'sub-new',
        journalCode: body?.journalCode ?? 'JRNL-001',
        status: 'DRAFT',
        version: 1,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.get(`${BASE}/files/presigned-url`, ({ request }) => {
    const url = new URL(request.url);
    const fileName = url.searchParams.get('fileName') ?? 'mock-paper.pdf';
    const contentType = url.searchParams.get('contentType') ?? 'application/octet-stream';
    const publicationId = url.searchParams.get('publicationId') ?? 'sub-new';
    const s3Key = `uploads/${publicationId}/${fileName}`;
    return HttpResponse.json({
      presignedUrl:
        `https://medpublish-dev.s3.amazonaws.com/${s3Key}?X-Amz-Signature=mocksig`,
      s3Key,
      fileUrl: `https://medpublish-dev.s3.amazonaws.com/${s3Key}`,
      contentType,
    });
  }),

  http.get(`${BASE}/submissions/my`, () => {
    return HttpResponse.json(mockSubmissions);
  }),

  http.get(`${BASE}/submissions/:id`, ({ params }) => {
    const found = mockSubmissions.find((submission) => submission.originalSubmissionId === params.id);
    return HttpResponse.json(
      found ?? {
        originalSubmissionId: params.id,
        latestStatus: 'DRAFT',
        versions: [{ submissionId: params.id, version: 1, status: 'DRAFT' }],
      }
    );
  }),

  http.post(`${BASE}/submissions`, () => {
    return HttpResponse.json(
      {
        id: 'sub-new',
        articleType: 'original-research',
        title: '',
        runningTitle: '',
        abstract: '',
        keywords: [],
        authors: [],
        fundingSource: '',
        manuscriptUrl: null,
        figureUrls: [],
        videoUrl: null,
        suggestedReviewers: [],
        coverLetter: '',
        declaration: null,
        status: 'SUBMITTED',
        version: 1,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.post(`${BASE}/submissions/:id/submit`, ({ params }) => {
    const found = mockSubmissions.find((s) => s.originalSubmissionId === params.id);
    const base =
      found ??
      {
        originalSubmissionId: params.id,
        versions: [{ submissionId: params.id, version: 1, status: 'DRAFT' }],
      };
    return HttpResponse.json({ ...base, latestStatus: 'SUBMITTED' });
  }),

  http.patch(`${BASE}/submissions/:id/steps/:stepType`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      stepType: params.stepType,
      ...body,
    });
  }),

  http.post(`${BASE}/files/attach`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      fileId: `file-${Math.random().toString(36).slice(2, 10)}`,
      publicationId: body?.publicationId,
      s3Url: body?.s3Url,
      fileName: body?.fileName,
      fileType: body?.fileType,
      fileSizeBytes: body?.fileSizeBytes ?? 0,
    });
  }),

  http.delete(`${BASE}/files/:fileId`, ({ params }) => {
    return HttpResponse.json({ deleted: true, fileId: params.fileId });
  }),

  http.patch(`${BASE}/submissions/:id`, async ({ params, request }) => {
    const body = await request.json();
    const found = mockSubmissions.find((s) => s.originalSubmissionId === params.id);
    const base = found ?? { originalSubmissionId: params.id };
    return HttpResponse.json({ ...base, ...body });
  }),

  http.put(/^https?:\/\/[^/]+\.amazonaws\.com\//, () => {
    return new HttpResponse(null, { status: 200 });
  }),
];
