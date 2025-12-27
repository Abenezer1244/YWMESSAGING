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
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      try {
        const response = await login(data);

        // Check if MFA is required
        if (response.mfaRequired) {
          // MFA is enabled - need to redirect to MFA verification page
          // For now, show error. In future, redirect to MFA page with session token
          toast.error('MFA verification required. Please contact support for now.');
          setIsLoading(false);
          return;
        }

        const { admin, church, accessToken, refreshToken } = response.data;

        // Set auth with tokens and immediately navigate
        // Zustand setAuth is synchronous, so this updates state right away
        if (!admin || !church || !accessToken || !refreshToken) {
          toast.error('Invalid login response. Please try again.');
          setIsLoading(false);
          return;
        }

        setAuth(admin, church, accessToken, refreshToken);

        // Navigate immediately without delay
        navigate('/dashboard', { replace: true });

        // Show toast after navigation (it will appear on dashboard)
        toast.success('Login successful!');

      } catch (error: any) {
        console.error('[LoginPage] Login error caught:', error);
        console.error('[LoginPage] Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
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
        } else if (error.response?.status === 401) {
          // 401 - Authentication failed
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else {
          // Generic error handling - show user-friendly message
          const errorMessage = error.response?.data?.error;

          // Check if error is technical/database error - show friendly message instead
          if (errorMessage && (errorMessage.includes('Invalid') || errorMessage.includes('prisma') || errorMessage.includes('database'))) {
            toast.error('An error occurred. Please try again in a moment.');
          } else {
            toast.error(errorMessage || 'Login failed. Please try again.');
          }
        }
      }
    } catch (outerError) {
      console.error('[LoginPage] OUTER ERROR - callback wrapper failed:', outerError);
      setIsLoading(false);
    }
  };

  // OAuth handlers would go here when implementing Google/Apple sign-in
  // For now, these are disabled to avoid confusing users with non-functional buttons

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
                autoComplete="email"
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
                autoComplete="current-password"
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

          {/* Note: OAuth integration coming soon - currently disabled */}

          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                data-testid="signup-link"
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
