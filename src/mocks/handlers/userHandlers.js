import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8080/api';

const mockUser = {
  id:        'usr-1',
  email:     'author@indoalpen.com',
  name:      'Dr. Anika Sharma',
  fullName:  'Dr. Anika Sharma',
  affiliation: 'AIIMS Hyderabad',
  role:      'AUTHOR',
  isActive:  true,
  createdAt: '2026-01-01T00:00:00Z',
  notifications: [
    {
      id: 'notif-1',
      title: 'Submission moved to review',
      description: 'Your manuscript "Applied Mechanics Review" is now under peer review.',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Profile reminder',
      description: 'Please verify your affiliation details in your profile.',
      read: true,
    },
  ],
};

export const userHandlers = [
  http.get(`${BASE}/users/me`, () => HttpResponse.json(mockUser)),

  http.put(`${BASE}/users/me`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockUser, ...body });
  }),
];
