import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail } from '@/features/auth/authThunks';
import { ROLE_DASHBOARDS } from '@/constants/roles';
import { MountainLoader } from '@/components/ui/MountainLoader';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token  = searchParams.get('token') ?? '';
  const status = useSelector((state) => state.auth.status);
  const error  = useSelector((state) => state.auth.error);

  useEffect(() => {
    if (!token) return;
    dispatch(verifyEmail(token)).then((result) => {
      if (verifyEmail.fulfilled.match(result)) {
        const role = result.payload.role;
        const dest = ROLE_DASHBOARDS[role] ?? '/dashboard';
        setTimeout(() => navigate(dest, { replace: true }), 2500);
      }
    });
  }, [token, dispatch, navigate]);

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white shadow rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Missing verification token</h2>
        <p className="text-sm text-gray-500 mb-4">No token found in the URL. Please use the link from your email.</p>
        <Link to="/login" className="text-brand font-medium hover:underline text-sm">Back to Login</Link>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white shadow rounded-xl p-8 text-center">
        <MountainLoader size="md" text="Verifying your email..." />
      </div>
    );
  }

  if (status === 'succeeded') {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white shadow rounded-xl p-8 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-7 w-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Email verified!</h2>
        <p className="text-sm text-gray-500">Your email has been verified. Welcome to IndoAlpen Verlag!</p>
        <p className="text-xs text-gray-400 mt-1">Redirecting you to your dashboard...</p>
      </div>
    );
  }

  if (status === 'failed') {
    const code    = error?.code;
    const message = error?.message ?? '';

    let heading = 'Verification failed';
    let body    = 'This verification link is invalid. It may have already been used.';

    if (code === 'CONFLICT') {
      if (message.toLowerCase().includes('already verified')) {
        heading = 'Already verified';
        body    = 'Your email is already verified. You can sign in.';
      } else {
        heading = 'Link expired';
        body    = 'Your verification link has expired. Please sign up again or contact support.';
      }
    } else if (code === 'NOT_FOUND') {
      body = 'This verification link is invalid. It may have already been used.';
    }

    return (
      <div className="max-w-md mx-auto mt-20 bg-white shadow rounded-xl p-8 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-7 w-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{heading}</h2>
        <p className="text-sm text-gray-600 mb-4">{body}</p>
        <Link to="/login" className="text-brand font-medium hover:underline text-sm">Back to Login</Link>
      </div>
    );
  }

  return null;
};

export default VerifyEmail;
