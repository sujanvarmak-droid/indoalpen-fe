import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { addToast } from '@/features/ui/uiSlice';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  affiliation: z.string().min(2, 'Affiliation is required'),
});

export const AuthorProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      affiliation: user?.affiliation ?? '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        email: user.email ?? '',
        affiliation: user.affiliation ?? '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    reset(data);
    dispatch(addToast({ message: 'Profile details confirmed. Starting submission...', type: 'success' }));
    navigate(ACCOUNT_ROUTES.NEW_SUBMISSION);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand">Step 1 of 9 - Author Profile</p>
        <h1 className="text-2xl font-bold text-gray-900">Confirm Your Author Details</h1>
        <p className="mt-1 text-sm text-gray-500">
          These details will be used across your submission. Update them if needed before proceeding.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <Input
            id="name"
            type="text"
            placeholder="Dr. Jane Smith"
            label="Full Name"
            helperText={!errors.name ? 'Required field.' : undefined}
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div>
          <Input
            id="email"
            type="email"
            placeholder="you@institution.com"
            label="Email Address"
            helperText={!errors.email ? 'Submission notifications will be sent to this address.' : undefined}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div>
          <Input
            id="affiliation"
            type="text"
            placeholder="Department, University, Country"
            label="Affiliation / Institution"
            helperText={!errors.affiliation ? 'Required field.' : undefined}
            error={errors.affiliation?.message}
            {...register('affiliation')}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => navigate(ACCOUNT_ROUTES.DASHBOARD)} className="justify-start text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            loading={isSubmitting}
            fullWidth
            className="sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : 'Save & Continue →'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthorProfile;
