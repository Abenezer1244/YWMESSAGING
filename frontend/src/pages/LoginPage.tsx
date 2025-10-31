import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { login } from '../api/auth';
import { fetchCsrfToken } from '../api/client';
import useAuthStore from '../stores/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch CSRF token on component mount
  useEffect(() => {
    fetchCsrfToken().catch(() => {
      // Token fetch failed, but continue anyway
      console.warn('Failed to fetch CSRF token, login may fail');
    });
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log('Starting login with:', data.email);
      const response = await login(data);
      console.log('Login response:', response);
      console.log('response.data keys:', Object.keys(response.data));
      const { admin, church } = response.data;

      console.log('Extracted admin and church:', {
        admin,
        church,
        adminIsNull: admin === null,
        adminIsUndefined: admin === undefined,
      });

      console.log('Login successful, setting auth:', { admin, church, accessToken: response.data.accessToken ? 'present' : 'missing' });

      // Set auth with tokens and immediately navigate
      // Zustand setAuth is synchronous, so this updates state right away
      setAuth(admin, church, response.data.accessToken, response.data.refreshToken);

      console.log('After setAuth, checking store:', {
        isAuthenticated: useAuthStore.getState().isAuthenticated,
        user: useAuthStore.getState().user,
        church: useAuthStore.getState().church,
      });

      // Navigate immediately without delay
      console.log('Navigating to dashboard');
      navigate('/dashboard', { replace: true });

      // Show toast after navigation (it will appear on dashboard)
      toast.success('Login successful!');

    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 dark:from-secondary-900 via-white dark:via-secondary-950 to-primary-100 dark:to-secondary-900 flex items-center justify-center p-4 transition-colors duration-normal">
      <div className="w-full max-w-md animate-fadeIn">
        <Card variant="default" className="p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 dark:from-primary-500 to-primary-700 dark:to-primary-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">YW</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-secondary-900 dark:text-secondary-50">
            Welcome Back
          </h1>
          <p className="text-center text-secondary-600 dark:text-secondary-400 mb-8">
            Church SMS Communication Platform
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="pastor@church.com"
              disabled={isLoading}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-secondary-200 dark:border-secondary-700">
            <p className="text-center text-secondary-600 dark:text-secondary-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-secondary-600 dark:text-secondary-400">
          <p>14-day free trial • No credit card required</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
