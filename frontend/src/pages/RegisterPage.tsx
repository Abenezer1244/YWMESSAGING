import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { register as registerChurch } from '../api/auth';
import { fetchCsrfToken } from '../api/client';
import useAuthStore from '../stores/authStore';
import BackButton from '../components/BackButton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  churchName: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch CSRF token on component mount
  useEffect(() => {
    fetchCsrfToken().catch(() => {
      // Token fetch failed, but continue anyway
      console.warn('Failed to fetch CSRF token, registration may fail');
    });
  }, []);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      churchName: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerChurch({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        churchName: data.churchName,
      });

      const { admin, church, accessToken, refreshToken } = response.data;
      console.log('Registration successful, setting auth:', { admin, church, accessToken: accessToken ? 'present' : 'missing' });
      setAuth(admin, church, accessToken, refreshToken);

      toast.success('Registration successful!');

      // Use replace: true to ensure clean navigation
      // and add a small delay to allow state to update
      setTimeout(() => {
        console.log('Navigating to dashboard');
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 py-8 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10 animate-fadeIn">
        <div className="mb-6">
          <BackButton variant="ghost" size="sm" />
        </div>

        <div className="text-center mb-12">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-accent-500 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <span className="text-slate-950 font-bold text-2xl">C</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300 font-light">
            Start your 14-day free trial • No credit card required
          </p>
        </div>

        {/* Registration Card */}
        <Card variant="default" className="p-8 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                disabled={isLoading}
                error={errors.firstName?.message}
                className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                {...register('firstName', { required: 'First name is required' })}
              />

              <Input
                label="Last Name"
                placeholder="Doe"
                disabled={isLoading}
                error={errors.lastName?.message}
                className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                {...register('lastName', { required: 'Last name is required' })}
              />
            </div>

            {/* Church Name */}
            <Input
              label="Church Name"
              placeholder="Grace Community Church"
              disabled={isLoading}
              error={errors.churchName?.message}
              className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              {...register('churchName', { required: 'Church name is required' })}
            />

            {/* Email Address */}
            <Input
              label="Email Address"
              type="email"
              placeholder="pastor@church.com"
              disabled={isLoading}
              error={errors.email?.message}
              className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
              })}
            />

            {/* Password Fields */}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              helperText="Must be at least 8 characters"
              disabled={isLoading}
              error={errors.password?.message}
              className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              error={errors.confirmPassword?.message}
              className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
              })}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
              className="font-semibold mt-6 bg-accent-500 hover:bg-accent-400 text-slate-950"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-8 border-t border-slate-300 dark:border-slate-700">
            <p className="text-center text-slate-700 dark:text-slate-300 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-accent-400 hover:text-accent-300 font-semibold transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Setup in Minutes</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Secure & Reliable</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">No Card Required</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
