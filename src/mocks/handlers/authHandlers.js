import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8080/api';

const mockAccessToken = 'eyJ.mock.access.token';
const mockRefreshToken = 'eyJ.mock.refresh.token';
const mockUser = {
  id:        'usr-1',
  email:     'author@indoalpen.com',
  fullName:  'Dr. Anika Sharma',
  role:      'AUTHOR',
  isActive:  true,
  createdAt: '2026-01-01T00:00:00Z',
};

export const authHandlers = [
  // POST /auth/login → { accessToken, refreshToken, role, userId, email }
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      role:   mockUser.role,
      userId: mockUser.id,
      email:  mockUser.email,
    })
  ),

  // POST /auth/signup → 201 { message }
  http.post(`${BASE}/auth/signup`, () =>
    HttpResponse.json(
      { message: 'Account created. Please check your email to confirm your address.' },
      { status: 201 }
    )
  ),

  // GET /auth/me → { id, email, fullName, role, isActive, createdAt }
  http.get(`${BASE}/auth/me`, () => HttpResponse.json(mockUser)),

  // GET /auth/verify-email?token= → { accessToken, refreshToken, role, userId, email }
  http.get(`${BASE}/auth/verify-email`, () =>
    HttpResponse.json({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      role:   mockUser.role,
      userId: mockUser.id,
      email:  mockUser.email,
    })
  ),

  // POST /auth/forgot-password → 202 (empty body)
  http.post(`${BASE}/auth/forgot-password`, () =>
    new HttpResponse(null, { status: 202 })
  ),

  // POST /auth/reset-password → 200 (empty body)
  http.post(`${BASE}/auth/reset-password`, () =>
    new HttpResponse(null, { status: 200 })
  ),
];
