import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '@/features/auth/authThunks';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z
  .object({
    fullName:        z.string().min(1, 'Full name is required'),
    email:           z.string().email('Enter a valid email'),
    password:        z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string().min(8, 'Min 8 characters'),
    consentGiven:    z.literal(true, { errorMap: () => ({ message: 'You must consent to data processing' }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state) => state.auth.status);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    const result = await dispatch(
      registerUser({
        fullName:     data.fullName,
        email:        data.email,
        password:     data.password,
        consentGiven: data.consentGiven,
      })
    );
    if (registerUser.fulfilled.match(result)) {
      navigate('/verify-email-pending', { state: { email: data.email }, replace: true });
      return;
    }
    const err = result.payload;
    if (err?.code === 'CONFLICT') {
      setError('email', { message: 'An account with this email already exists.' });
    } else if (err?.code === 'VALIDATION_ERROR') {
      setError('root', { message: err.message });
    } else {
      setError('root', { message: err?.message ?? 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-xl bg-white p-5 shadow sm:mt-20 sm:p-8">
      <h1 className="text-2xl font-bold text-brand mb-2">Create an account</h1>
      <p className="text-sm text-gray-500 mb-6">Join IndoAlpen Verlag and start submitting your research</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          id="fullName"
          placeholder="Dr. John Smith"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
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
        <Input
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {/* Consent checkbox */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              id="consentGiven"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
              {...register('consentGiven')}
            />
            <span className="text-sm text-gray-600">
              I consent to the processing of my personal data in accordance with the{' '}
              <a href="#" className="text-brand-light hover:underline">Privacy Policy</a>.
            </span>
          </label>
          {errors.consentGiven && (
            <p className="text-xs text-danger ml-6">{errors.consentGiven.message}</p>
          )}
        </div>

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
          Create Account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-brand font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
