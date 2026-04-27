import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8080/api';

const mockSubmissions = [
  {
    id: 'sub-1',
    title: 'Cardiac Biomarkers in Acute MI',
    abstract: 'This study examines the role of cardiac biomarkers in the early diagnosis of acute myocardial infarction and their prognostic significance.',
    keywords: ['cardiology', 'biomarkers', 'MI'],
    authors: [{ name: 'Dr. Anika Sharma', affiliation: 'AIIMS Hyderabad' }],
    category: 'Cardiology',
    status: 'SUBMITTED',
    version: 2,
    createdAt: '2026-04-10T10:00:00Z',
    files: [],
  },
  {
    id: 'sub-2',
    title: 'Neural Plasticity Post-Stroke Rehabilitation',
    abstract: 'A retrospective analysis of neural plasticity mechanisms and their implications for post-stroke rehabilitation outcomes in adult patients.',
    keywords: ['neurology', 'stroke', 'rehabilitation'],
    authors: [{ name: 'Dr. Anika Sharma', affiliation: 'AIIMS Hyderabad' }],
    category: 'Neurology',
    status: 'DRAFT',
    version: 1,
    createdAt: '2026-04-18T09:00:00Z',
    files: [],
  },
];

export const submissionHandlers = [
  http.post(`${BASE}/submissions/start`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        submissionId: `sub-${Date.now()}`,
        journalCode: body?.journalCode ?? null,
        status: 'DRAFT',
      },
      { status: 201 }
    );
  }),

  http.get(`${BASE}/submissions/presigned-url`, () => {
    return HttpResponse.json({
      presignedUrl:
        'https://medpublish-dev.s3.amazonaws.com/uploads/mock-paper.pdf?X-Amz-Signature=mocksig',
      objectUrl: 'https://medpublish-dev.s3.amazonaws.com/uploads/mock-paper.pdf',
    });
  }),

  http.get(`${BASE}/files/presigned-url`, ({ request }) => {
    const url = new URL(request.url);
    const fileName = url.searchParams.get('fileName') ?? 'mock-file.bin';
    return HttpResponse.json({
      presignedUrl: `https://medpublish-dev.s3.amazonaws.com/uploads/${fileName}?X-Amz-Signature=mocksig`,
      s3Key: `uploads/${fileName}`,
    });
  }),

  http.post(`${BASE}/files/attach`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: `file-${Date.now()}`,
      publicationId: body?.publicationId ?? null,
      s3Key: body?.s3Key ?? null,
      fileName: body?.fileName ?? null,
      contentType: body?.contentType ?? null,
      fileType: body?.fileType ?? null,
      fileUrl: body?.s3Key ? `https://medpublish-dev.s3.amazonaws.com/${body.s3Key}` : null,
    });
  }),

  http.get(`${BASE}/files/publication/:pubId`, ({ params }) => {
    return HttpResponse.json({
      publicationId: params.pubId,
      files: [],
    });
  }),

  http.delete(`${BASE}/files/:fileId`, ({ params }) => {
    return HttpResponse.json({
      fileId: params.fileId,
      deleted: true,
    });
  }),

  http.get(`${BASE}/submissions`, () => {
    return HttpResponse.json({
      content: mockSubmissions,
      totalElements: 2,
      page: 0,
      size: 10,
    });
  }),

  http.get(`${BASE}/submissions/:id`, ({ params }) => {
    const found = mockSubmissions.find((s) => s.id === params.id);
    return HttpResponse.json(
      found ?? {
        id: params.id,
        status: 'DRAFT',
        title: 'Draft Submission',
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

  http.patch(`${BASE}/submissions/:id/steps/:step`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      step: params.step,
      status: 'saved',
      ...body,
    });
  }),

  http.post(`${BASE}/submissions/:id/submit`, ({ params }) => {
    const found = mockSubmissions.find((s) => s.id === params.id);
    const base = found ?? { id: params.id };
    return HttpResponse.json({ ...base, status: 'SUBMITTED' });
  }),

  http.patch(`${BASE}/submissions/:id/files`, () => {
    return HttpResponse.json({ message: 'File attached.' });
  }),

  http.patch(`${BASE}/submissions/:id`, async ({ params, request }) => {
    const body = await request.json();
    const found = mockSubmissions.find((s) => s.id === params.id);
    const base = found ?? { id: params.id };
    return HttpResponse.json({ ...base, ...body });
  }),
];
