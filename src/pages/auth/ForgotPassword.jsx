import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '@/features/auth/authThunks';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [submitted, setSubmitted] = useState(false);
  const status = useSelector((state) => state.auth.status);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    // Always show success — backend intentionally stays silent whether email exists
    await dispatch(forgotPassword({ email: data.email }));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto mt-8 max-w-md rounded-xl bg-white p-5 text-center shadow sm:mt-20 sm:p-8">
        <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Check your inbox</h2>
        <p className="text-sm text-gray-500 mb-4">
          If an account exists for that email, you will receive a password reset link shortly.
        </p>
        <Link to="/login" className="text-brand font-medium hover:underline text-sm">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-md rounded-xl bg-white p-5 shadow sm:mt-20 sm:p-8">
      <h1 className="text-2xl font-bold text-brand mb-2">Reset your password</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your email address and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          variant="primary"
          loading={status === 'loading'}
          className="w-full mt-1"
        >
          Send Reset Link
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Remember your password?{' '}
        <Link to="/login" className="text-brand font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
