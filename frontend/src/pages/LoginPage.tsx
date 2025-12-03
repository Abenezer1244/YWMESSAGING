import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { login } from '../api/auth';
import { fetchCsrfToken } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import BackButton from '../components/BackButton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import AnimatedBlobs from '../components/AnimatedBlobs';

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
      // Token fetch failed, but continue anyway (non-critical)
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
      const response = await login(data);
      const { admin, church } = response.data;

      // Set auth with tokens and immediately navigate
      // Zustand setAuth is synchronous, so this updates state right away
      setAuth(admin, church, response.data.accessToken, response.data.refreshToken);

      // Navigate immediately without delay
      navigate('/dashboard', { replace: true });

      // Show toast after navigation (it will appear on dashboard)
      toast.success('Login successful!');

    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);

      // Handle rate limit errors (429)
      if (error.response?.status === 429) {
        const resetTime = error.response?.headers?.['ratelimit-reset'];
        if (resetTime) {
          const resetMs = parseInt(resetTime) * 1000;
          const now = Date.now();
          const waitSeconds = Math.ceil((resetMs - now) / 1000);
          const waitMinutes = Math.ceil(waitSeconds / 60);
          const message = `Too many login attempts. Please try again in ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''}.`;
          toast.error(message, { duration: 5000 });
        } else {
          toast.error('Too many login attempts. Please try again in 15 minutes.');
        }
      } else {
        const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  const handleGoogleSignIn = () => {
    toast.loading('Redirecting to Google Sign In...');
    // TODO: Implement Google OAuth flow
    // window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  const handleAppleSignIn = () => {
    toast.loading('Redirecting to Apple Sign In...');
    // TODO: Implement Apple OAuth flow
    // window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/apple`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBlobs variant="minimal" />
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        <div className="mb-6">
          <BackButton variant="ghost" size="sm" />
        </div>

        <div className="text-center mb-12">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.svg" alt="Koinonia" className="w-16 h-16 hover:opacity-80 transition-opacity" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Church SMS Communication Platform
          </p>
        </div>

        {/* Login Card */}
        <Card variant="default" className="p-8 border border-border bg-card shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div>
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
                className="bg-muted border-border text-foreground"
              />
            </div>

            {/* Password Input */}
            <div>
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
                className="bg-muted border-border text-foreground"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
              className="font-semibold mt-6 bg-primary hover:bg-primary/90 text-background"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* OAuth Divider */}
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-center text-muted-foreground text-xs font-medium uppercase tracking-wider mb-6">
              Or continue with
            </p>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Google</span>
              </button>

              {/* Apple Sign In */}
              <button
                type="button"
                onClick={handleAppleSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 13.5c-.91 0-1.82-.55-2.25-1.52-.1-.23-.37-.23-.47 0-.43.97-1.34 1.52-2.25 1.52-1.51 0-2.73-1.22-2.73-2.73 0-1.51 1.22-2.73 2.73-2.73.91 0 1.82.55 2.25 1.52.1.23.37.23.47 0 .43-.97 1.34-1.52 2.25-1.52 1.51 0 2.73 1.22 2.73 2.73 0 1.51-1.22 2.73-2.73 2.73m-5-9c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m8 0c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m-4 15c-5.52 0-10-4.48-10-10S2.48 2 8 2s10 4.48 10 10-4.48 10-10 10m0-18C4.48 2 1 5.48 1 10s3.48 8 7 8 8-3.48 8-8-3.48-8-8-8" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>

        {/* Trust Indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 8l3.293 3.293a1 1 0 11-1.414 1.414l-4-4z" clipRule="evenodd" />
          </svg>
          <span>Secure login • No password stored</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
