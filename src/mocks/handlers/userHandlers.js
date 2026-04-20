import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8080/api';

const mockUser = {
  id:        'usr-1',
  email:     'author@indoalpen.com',
  fullName:  'Dr. Anika Sharma',
  role:      'AUTHOR',
  isActive:  true,
  createdAt: '2026-01-01T00:00:00Z',
};

export const userHandlers = [
  http.get(`${BASE}/users/me`, () => HttpResponse.json(mockUser)),

  http.put(`${BASE}/users/me`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockUser, ...body });
  }),
];
