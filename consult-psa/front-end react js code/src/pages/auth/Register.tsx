import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthLayout } from '../../layouts/AuthLayout';

const registerSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setServerError(null);
      await api.post('/auth/register-owner', data);
      navigate('/login'); // Redirect to login after successful registration
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || 'Failed to create account. Please try again.'
      );
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create an Office
          </h1>
          <p className="text-sm text-gray-500">
            Enter your details below to set up your Consulting OS workspace
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="company_name"
            label="Company Name"
            placeholder="Acme Consulting"
            {...register('company_name')}
            error={errors.company_name?.message}
          />
          <Input
            id="name"
            label="Full Name"
            placeholder="John Doe"
            autoComplete="name"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            id="email"
            type="email"
            label="Work Email"
            placeholder="john@acme.com"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('password')}
            error={errors.password?.message}
          />

          {serverError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
