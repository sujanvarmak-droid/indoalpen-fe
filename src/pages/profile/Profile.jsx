import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { forgotPassword } from '@/features/auth/authThunks';
import { addToast } from '@/features/ui/uiSlice';
import { updateMe } from '@/services/userService';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
});

const roleBadgeColor = {
  admin:  'bg-purple-100 text-purple-700',
  editor: 'bg-amber-100 text-amber-700',
  author: 'bg-blue-100 text-blue-700',
  public: 'bg-gray-100 text-gray-600',
};

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', bio: '' },
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name ?? '', bio: user.bio ?? '' });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      await updateMe(data);
      dispatch(addToast({ message: 'Profile updated successfully', type: 'success' }));
    } catch {
      dispatch(addToast({ message: 'Failed to update profile', type: 'error' }));
    }
  };

  const handleSendResetLink = async () => {
    if (!user?.email) {
      dispatch(addToast({ message: 'User email is not available', type: 'error' }));
      return;
    }
    try {
      const result = await dispatch(forgotPassword({ email: user.email }));
      if (forgotPassword.fulfilled.match(result)) {
        dispatch(addToast({ message: 'Password reset link sent to your email', type: 'success' }));
      } else {
        dispatch(addToast({ message: 'Failed to send reset link', type: 'error' }));
      }
    } catch {
      dispatch(addToast({ message: 'Failed to send reset link', type: 'error' }));
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xl shrink-0">
          {getInitials(user?.name)}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span
            className={cn(
              'inline-flex items-center mt-1 text-xs px-2 py-0.5 rounded-full font-medium',
              roleBadgeColor[user?.role] ?? 'bg-gray-100 text-gray-600'
            )}
          >
            {user?.role}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Edit Profile</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            id="name"
            placeholder="Dr. John Doe"
            error={errors.name?.message}
            {...register('name')}
          />
          <Textarea
            label="Bio"
            id="bio"
            rows={4}
            placeholder="Tell us about yourself and your research..."
            error={errors.bio?.message}
            {...register('bio')}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      <div id="security" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-base font-semibold text-gray-800 mb-2">Security - Reset Password</h3>
        <p className="text-sm text-gray-500 mb-4">
          A reset link will be sent to <span className="font-medium text-gray-700">{user?.email ?? 'your email'}</span>.
          Use that link to set a new password.
        </p>
        <div className="flex justify-end">
          <Button type="button" variant="primary" onClick={handleSendResetLink}>
            Send Password Reset Link
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
