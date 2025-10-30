import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { login } from '../api/auth';
import { fetchCsrfToken } from '../api/client';
import useAuthStore from '../stores/authStore';

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
      const { admin, church } = response.data;

      console.log('Login successful, setting auth:', { admin, church });

      // Set auth and immediately navigate
      // Zustand setAuth is synchronous, so this updates state right away
      setAuth(admin, church);

      console.log('Auth state updated, checking state:', {
        isAuthenticated: useAuthStore.getState().isAuthenticated,
        user: useAuthStore.getState().user,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
            Connect YW
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Church SMS Platform
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email format',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
