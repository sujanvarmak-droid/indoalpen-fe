import { createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '@/services/authService';
import { getToken, setToken, removeToken } from '@/utils/tokenStorage';

const extractError = (error) =>
  error.response?.data ?? { code: 'UNKNOWN', message: error.message };

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      setToken(data.token);
      return { id: data.userId, email: data.email, role: data.role };
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

// Replaces the old refreshToken — reads stored token then calls GET /api/auth/me
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      if (!getToken()) return rejectWithValue({ code: 'NO_TOKEN' });
      return await authService.getMe(); // { id, email, fullName, role, isActive, createdAt }
    } catch (error) {
      removeToken();
      return rejectWithValue(extractError(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    removeToken();
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const data = await authService.verifyEmail(token);
      setToken(data.token);
      return { id: data.userId, email: data.email, role: data.role };
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
