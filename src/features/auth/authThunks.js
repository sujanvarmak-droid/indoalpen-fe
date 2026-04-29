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
const ACTIVE_ROLE_STORAGE_KEY = 'activeRole';

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
  const apiRole = data?.role ? normalizeRole(data.role) : null;
  const selectedRole = roles.find((role) => role === getStoredActiveRole()) ?? null;
  const role = apiRole ?? selectedRole ?? (roles.length === 1 ? roles[0] : null);
  return {
    id: data?.id ?? data?.userId ?? null,
    email: data?.email ?? '',
    fullName: data?.fullName ?? data?.name ?? '',
    role,
    roles,
    permissions: Array.isArray(data?.permissions) ? data.permissions : [],
    requiresRoleSelection: roles.length > 1 && !role,
  };
};

const getStoredActiveRole = () => {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(ACTIVE_ROLE_STORAGE_KEY);
  return value ? normalizeRole(value) : null;
};

const setStoredActiveRole = (role) => {
  if (typeof window === 'undefined') return;
  if (!role) {
    window.localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, normalizeRole(role));
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const loginData = await authService.login(credentials);
      setAccessToken(loginData.accessToken ?? loginData.token);
      setRefreshToken(loginData.refreshToken);
      const storedRole = getStoredActiveRole();
      const meData = await authService.getMe({ role: storedRole ?? undefined });
      const normalizedUser = normalizeAuthUser(meData);
      if (normalizedUser.role) {
        setStoredActiveRole(normalizedUser.role);
      } else if (normalizedUser.roles.length > 1) {
        setStoredActiveRole(null);
      }
      return normalizedUser;
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
      const storedRole = getStoredActiveRole();
      const data = await authService.getMe({ role: storedRole ?? undefined });
      const normalizedUser = normalizeAuthUser(data);
      if (normalizedUser.role) {
        setStoredActiveRole(normalizedUser.role);
      }
      return normalizedUser;
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
    setStoredActiveRole(null);
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const data = await authService.verifyEmail(token);
      setAccessToken(data.accessToken ?? data.token);
      setRefreshToken(data.refreshToken);
      const normalizedUser = normalizeAuthUser(data);
      if (normalizedUser.role) {
        setStoredActiveRole(normalizedUser.role);
      } else if (normalizedUser.roles.length > 1) {
        setStoredActiveRole(null);
      }
      return normalizedUser;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const switchActiveRole = createAsyncThunk(
  'auth/switchActiveRole',
  async (role, { rejectWithValue }) => {
    try {
      const normalizedRole = normalizeRole(role);
      const data = await authService.getMe({ role: normalizedRole });
      const normalizedUser = normalizeAuthUser(data);
      if (!normalizedUser.roles.includes(normalizedRole)) {
        throw new Error('Selected role is not available for this user.');
      }
      setStoredActiveRole(normalizedRole);
      return { ...normalizedUser, role: normalizedRole, requiresRoleSelection: false };
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
