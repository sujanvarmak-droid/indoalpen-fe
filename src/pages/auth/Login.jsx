import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, status } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate to={ACCOUNT_ROUTES.DASHBOARD} replace />;

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      navigate(result.redirectTo, { replace: true });
      return;
    }
    if (result.code === 'EMAIL_NOT_VERIFIED') {
      setError('root', {
        message: 'Please verify your email before logging in. Check your inbox for the confirmation link.',
      });
    } else if (result.code === 'VALIDATION_ERROR') {
      setError('root', { message: result.message });
    } else {
      setError('root', { message: 'Incorrect email or password.' });
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-xl bg-white p-5 shadow sm:mt-20 sm:p-8">
      <h1 className="text-2xl font-bold text-brand mb-2">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-6">Sign in to your IndoAlpen Verlag account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
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
          Sign In
        </Button>
      </form>

      <div className="mt-4 flex flex-col gap-2 text-center text-sm text-gray-500">
        <Link to="/forgot-password" className="text-brand-light hover:underline">
          Forgot your password?
        </Link>
        <span>
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand font-medium hover:underline">
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Login;
