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
  http.get(`${BASE}/submissions/presigned-url`, () => {
    return HttpResponse.json({
      presignedUrl:
        'https://medpublish-dev.s3.amazonaws.com/uploads/mock-paper.pdf?X-Amz-Signature=mocksig',
      objectUrl: 'https://medpublish-dev.s3.amazonaws.com/uploads/mock-paper.pdf',
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

  http.post(`${BASE}/submissions`, () => {
    return HttpResponse.json(
      {
        id: 'sub-new',
        title: '',
        abstract: '',
        keywords: [],
        authors: [],
        category: '',
        status: 'DRAFT',
        version: 1,
        createdAt: new Date().toISOString(),
        files: [],
      },
      { status: 201 }
    );
  }),

  http.patch(`${BASE}/submissions/:id/submit`, ({ params }) => {
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
