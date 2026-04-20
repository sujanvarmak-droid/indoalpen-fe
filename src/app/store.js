import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import submissionsReducer from '@/features/submissions/submissionsSlice';
import uiReducer from '@/features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    submissions: submissionsReducer,
    ui: uiReducer,
  },
});

export default store;
