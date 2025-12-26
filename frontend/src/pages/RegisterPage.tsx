import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { register as registerChurch } from '../api/auth';
import { fetchCsrfToken } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import BackButton from '../components/BackButton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import AnimatedBlobs from '../components/AnimatedBlobs';

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

  const { register, handleSubmit, watch, formState, trigger } = useForm<RegisterFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      churchName: '',
    },
  });

  const { errors } = formState;
  const watchedValues = watch();

  const onSubmit = async (data: RegisterFormData) => {
    // Trigger validation to populate errors
    const isValid = await trigger();

    if (!isValid) {
      // Build error message from validation errors
      const errorMessages: string[] = [];

      if (errors.firstName) errorMessages.push(`First name: ${errors.firstName.message}`);
      if (errors.lastName) errorMessages.push(`Last name: ${errors.lastName.message}`);
      if (errors.churchName) errorMessages.push(`Church name: ${errors.churchName.message}`);
      if (errors.email) errorMessages.push(`Email: ${errors.email.message}`);
      if (errors.password) errorMessages.push(`Password: ${errors.password.message}`);
      if (errors.confirmPassword) errorMessages.push(`Confirm password: ${errors.confirmPassword.message}`);

      // Show errors as toast
      const errorText = errorMessages.length > 0
        ? errorMessages.join('\n')
        : 'Please check your form for errors';

      toast.error(errorText);
      return;
    }

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
      if (!admin || !church || !accessToken || !refreshToken) {
        toast.error('Invalid registration response. Please try again.');
        setIsLoading(false);
        return;
      }
      setAuth(admin, church as any, accessToken, refreshToken);

      // Navigate immediately - setAuth is synchronous (Zustand)
      navigate('/dashboard', { replace: true });

      toast.success('Registration successful!');
    } catch (error: any) {
      setIsLoading(false);

      // Handle rate limit errors (429)
      if (error.response?.status === 429) {
        const resetTime = error.response?.headers?.['ratelimit-reset'];
        if (resetTime) {
          const resetMs = parseInt(resetTime) * 1000;
          const now = Date.now();
          const waitSeconds = Math.ceil((resetMs - now) / 1000);
          const waitMinutes = Math.ceil(waitSeconds / 60);
          const message = `Too many registration attempts. Please try again in ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''}.`;
          toast.error(message, { duration: 5000 });
        } else {
          toast.error('Too many registration attempts. Please try again in 1 hour.');
        }
      } else {
        const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  // OAuth handlers would go here when implementing Google/Apple sign-in
  // For now, these are disabled to avoid confusing users with non-functional buttons

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8 relative overflow-hidden">
      <AnimatedBlobs variant="minimal" />
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl pointer-events-none"></div>


      <div className="w-full max-w-2xl relative z-10 animate-fadeIn">
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
            Create Your Account
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Start your 14-day free trial • No credit card required
          </p>
        </div>

        {/* Registration Card */}
        <Card variant="default" className="p-8 border border-border bg-card shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                disabled={isLoading}
                error={errors.firstName?.message}
                autoComplete="given-name"
                className="bg-muted border-border text-foreground"
                {...register('firstName', {
                  required: 'First name is required',
                  maxLength: {
                    value: 100,
                    message: 'First name is too long (max 100 characters)',
                  },
                })}
              />

              <Input
                label="Last Name"
                placeholder="Doe"
                disabled={isLoading}
                error={errors.lastName?.message}
                autoComplete="family-name"
                className="bg-muted border-border text-foreground"
                {...register('lastName', {
                  required: 'Last name is required',
                  maxLength: {
                    value: 100,
                    message: 'Last name is too long (max 100 characters)',
                  },
                })}
              />
            </div>

            {/* Church Name */}
            <Input
              label="Church Name"
              placeholder="Grace Community Church"
              disabled={isLoading}
              error={errors.churchName?.message}
              autoComplete="organization"
              className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              {...register('churchName', {
                required: 'Church name is required',
                maxLength: {
                  value: 255,
                  message: 'Church name is too long (max 255 characters)',
                },
              })}
            />

            {/* Email Address */}
            <Input
              label="Email Address"
              type="email"
              placeholder="pastor@church.com"
              disabled={isLoading}
              error={errors.email?.message}
              autoComplete="email"
              className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
                maxLength: {
                  value: 255,
                  message: 'Email is too long (max 255 characters)',
                },
              })}
            />

            {/* Password Fields */}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              helperText="At least 8 characters, 1 uppercase letter, 1 number"
              disabled={isLoading}
              error={errors.password?.message}
              autoComplete="new-password"
              className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                validate: {
                  hasUppercase: (value) => /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                  hasNumber: (value) => /[0-9]/.test(value) || 'Password must contain at least one number',
                },
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
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
              className="font-semibold mt-6 bg-primary hover:bg-primary/90 text-background"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Note: OAuth integration coming soon - currently disabled */}

          {/* Sign In Link */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </Card>

        {/* Trust Indicators - Responsive Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-muted-foreground font-medium">Setup in Minutes</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-muted-foreground font-medium">Secure & Reliable</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-muted-foreground font-medium">No Card Required</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
