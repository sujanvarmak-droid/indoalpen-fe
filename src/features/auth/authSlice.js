import { createSlice } from '@reduxjs/toolkit';
import {
  loginUser,
  registerUser,
  restoreSession,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '@/features/auth/authThunks';

const initialState = {
  user: null,   // { id, email, fullName?, role }
  status: 'idle',
  error: null,  // { code, message } | string | null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutAction(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading';
      state.error = null;
    };
    const rejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? { code: 'UNKNOWN', message: 'Something went wrong' };
    };

    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, rejected)

      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(registerUser.rejected, rejected)

      .addCase(restoreSession.pending, pending)
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
        state.error = null;
      })

      .addCase(logoutUser.fulfilled, () => ({ ...initialState }))

      .addCase(verifyEmail.pending, pending)
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, rejected)

      .addCase(forgotPassword.pending, pending)
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(forgotPassword.rejected, rejected)

      .addCase(resetPassword.pending, pending)
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(resetPassword.rejected, rejected);
  },
});

export const { logoutAction, clearAuthError } = authSlice.actions;

export const selectCurrentUser      = (state) => state.auth.user;
export const selectAuthStatus       = (state) => state.auth.status;
export const selectAuthError        = (state) => state.auth.error;
export const selectIsAuthenticated  = (state) => state.auth.user !== null;

export default authSlice.reducer;
