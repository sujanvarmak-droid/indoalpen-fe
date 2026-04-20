import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '@/features/auth/authThunks';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z
  .object({
    newPassword:     z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Min 8 characters'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token  = searchParams.get('token') ?? '';
  const status = useSelector((state) => state.auth.status);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    const result = await dispatch(resetPassword({ token, newPassword: data.newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      navigate('/login', { state: { message: 'Your password has been reset successfully.' }, replace: true });
      return;
    }
    const err = result.payload;
    if (err?.code === 'NOT_FOUND') {
      setError('root', { message: 'This reset link is invalid or has already been used.' });
    } else if (err?.code === 'CONFLICT') {
      const msg = err.message ?? '';
      if (msg.toLowerCase().includes('already used')) {
        setError('root', { message: 'This link has already been used. Please request a new one.' });
      } else {
        setError('root', { message: 'This link has expired. Please request a new password reset.' });
      }
    } else if (err?.code === 'VALIDATION_ERROR') {
      setError('newPassword', { message: 'Password must be at least 8 characters.' });
    } else {
      setError('root', { message: err?.message ?? 'Something went wrong. Please try again.' });
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white shadow rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid reset link</h2>
        <p className="text-sm text-gray-500 mb-4">No reset token found in the URL.</p>
        <Link to="/forgot-password" className="text-brand font-medium hover:underline text-sm">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow rounded-xl p-8">
      <h1 className="text-2xl font-bold text-brand mb-2">Set new password</h1>
      <p className="text-sm text-gray-500 mb-6">Enter your new password below.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="New Password"
          id="newPassword"
          type="password"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="Confirm New Password"
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {errors.root && (
          <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={status === 'loading'}
          className="w-full mt-1"
        >
          Reset Password
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        <Link to="/login" className="text-brand font-medium hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;
