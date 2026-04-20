import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCurrentUser,
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
} from '@/features/auth/authSlice';
import { loginUser, logoutUser } from '@/features/auth/authThunks';
import { addToast } from '@/features/ui/uiSlice';
import { ROLE_DASHBOARDS } from '@/constants/roles';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user          = useSelector(selectCurrentUser);
  const status        = useSelector(selectAuthStatus);
  const authError     = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      dispatch(addToast({ message: 'Welcome back!', type: 'success' }));
      const role = result.payload.role;
      const dest = ROLE_DASHBOARDS[role] ?? '/dashboard';
      return { success: true, redirectTo: dest };
    }
    const err = result.payload;
    return { success: false, code: err?.code, message: err?.message };
  };

  const logout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return { user, isAuthenticated, status, authError, login, logout };
};
