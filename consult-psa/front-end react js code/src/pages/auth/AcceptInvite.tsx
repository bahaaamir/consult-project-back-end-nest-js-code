import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthLayout } from '../../layouts/AuthLayout';

const acceptSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AcceptFormValues = z.infer<typeof acceptSchema>;

export const AcceptInvite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptFormValues>({
    resolver: zodResolver(acceptSchema),
  });

  const onSubmit = async (data: AcceptFormValues) => {
    try {
      setServerError(null);
      await api.post('/auth/accept-invite', {
        token,
        password: data.password
      });
      navigate('/login');
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || 'Failed to accept invitation. The link may have expired.'
      );
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Link</h1>
          <p className="text-gray-500">
            This invitation link is missing the secure token. Please ask your administrator for a new invitation link.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome Aboard!
          </h1>
          <p className="text-sm text-gray-500">
            Set a strong password to complete your account setup and join the workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="password"
            type="password"
            label="Create Password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('password')}
            error={errors.password?.message}
          />
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          {serverError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Join Workspace
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};
