import { createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '@/services/authService';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAuthTokens,
} from '@/utils/tokenStorage';

const extractError = (error) =>
  error.response?.data ?? { code: 'UNKNOWN', message: error.message };

const normalizeRole = (rawRole) => String(rawRole).replace(/^ROLE_/, '').toUpperCase();

const resolveRoles = (data) => {
  if (Array.isArray(data?.roles) && data.roles.length > 0) {
    return data.roles.map(normalizeRole).filter(Boolean);
  }
  if (Array.isArray(data?.authorities) && data.authorities.length > 0) {
    return data.authorities.map(normalizeRole).filter(Boolean);
  }
  if (data?.role) {
    return [normalizeRole(data.role)];
  }
  return [];
};

const normalizeAuthUser = (data) => {
  const roles = resolveRoles(data);
  return {
    id: data?.id ?? data?.userId ?? null,
    email: data?.email ?? '',
    fullName: data?.fullName ?? data?.name ?? '',
    role: roles[0] ?? null,
    roles,
    permissions: Array.isArray(data?.permissions) ? data.permissions : [],
  };
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      setAccessToken(data.accessToken ?? data.token);
      setRefreshToken(data.refreshToken);
      return normalizeAuthUser(data);
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.signup(userData);
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

// Restore session when either token cookie exists.
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      if (!getAccessToken() && !getRefreshToken()) return rejectWithValue({ code: 'NO_TOKEN' });
      const data = await authService.getMe();
      return normalizeAuthUser(data);
    } catch (error) {
      clearAuthTokens();
      return rejectWithValue(extractError(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    clearAuthTokens();
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const data = await authService.verifyEmail(token);
      setAccessToken(data.accessToken ?? data.token);
      setRefreshToken(data.refreshToken);
      return normalizeAuthUser(data);
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      await authService.forgotPassword({ email });
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      await authService.resetPassword({ token, newPassword });
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);
