import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import AnimatedBlobs from '../components/AnimatedBlobs';
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
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
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
    const onSubmit = async (data) => {
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
        }
        catch (error) {
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
                }
                else {
                    toast.error('Too many registration attempts. Please try again in 1 hour.');
                }
            }
            else {
                const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
                toast.error(errorMessage);
            }
        }
    };
    const handleGoogleSignUp = () => {
        toast.loading('Redirecting to Google Sign Up...');
        // TODO: Implement Google OAuth flow
        // window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
    };
    const handleAppleSignUp = () => {
        toast.loading('Redirecting to Apple Sign Up...');
        // TODO: Implement Apple OAuth flow
        // window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/apple`;
    };
    return (_jsxs("div", { className: "min-h-screen bg-background flex items-center justify-center p-4 py-8 relative overflow-hidden", children: [_jsx(AnimatedBlobs, { variant: "minimal" }), _jsx("div", { className: "absolute top-0 right-0 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "w-full max-w-2xl relative z-10 animate-fadeIn", children: [_jsx("div", { className: "mb-6", children: _jsx(BackButton, { variant: "ghost", size: "sm" }) }), _jsxs("div", { className: "text-center mb-12", children: [_jsx("div", { className: "flex items-center justify-center mb-6", children: _jsx("img", { src: "/logo.svg", alt: "Koinonia", className: "w-16 h-16 hover:opacity-80 transition-opacity" }) }), _jsx("h1", { className: "text-4xl font-bold text-foreground mb-3 tracking-tight", children: "Create Your Account" }), _jsx("p", { className: "text-lg text-muted-foreground font-light", children: "Start your 14-day free trial \u2022 No credit card required" })] }), _jsxs(Card, { variant: "default", className: "p-8 border border-border bg-card shadow-lg", children: [_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-5", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "First Name", placeholder: "John", disabled: isLoading, error: errors.firstName?.message, className: "bg-muted border-border text-foreground", ...register('firstName', { required: 'First name is required' }) }), _jsx(Input, { label: "Last Name", placeholder: "Doe", disabled: isLoading, error: errors.lastName?.message, className: "bg-muted border-border text-foreground", ...register('lastName', { required: 'Last name is required' }) })] }), _jsx(Input, { label: "Church Name", placeholder: "Grace Community Church", disabled: isLoading, error: errors.churchName?.message, className: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white", ...register('churchName', { required: 'Church name is required' }) }), _jsx(Input, { label: "Email Address", type: "email", placeholder: "pastor@church.com", disabled: isLoading, error: errors.email?.message, className: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white", ...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: 'Invalid email format',
                                            },
                                        }) }), _jsx(Input, { label: "Password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", helperText: "Must be at least 8 characters", disabled: isLoading, error: errors.password?.message, className: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white", ...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 8,
                                                message: 'Password must be at least 8 characters',
                                            },
                                        }) }), _jsx(Input, { label: "Confirm Password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: isLoading, error: errors.confirmPassword?.message, className: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white", ...register('confirmPassword', {
                                            required: 'Please confirm your password',
                                        }) }), _jsx(Button, { type: "submit", variant: "primary", size: "lg", fullWidth: true, isLoading: isLoading, disabled: isLoading, className: "font-semibold mt-6 bg-primary hover:bg-primary/90 text-background", children: isLoading ? 'Creating account...' : 'Create Account' })] }), _jsxs("div", { className: "mt-8 pt-8 border-t border-border", children: [_jsx("p", { className: "text-center text-muted-foreground text-xs font-medium uppercase tracking-wider mb-6", children: "Or sign up with" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("button", { type: "button", onClick: handleGoogleSignUp, disabled: isLoading, className: "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm", children: [_jsx("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", children: _jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2" }) }), _jsx("span", { children: "Google" })] }), _jsxs("button", { type: "button", onClick: handleAppleSignUp, disabled: isLoading, className: "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm", children: [_jsx("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M17.05 13.5c-.91 0-1.82-.55-2.25-1.52-.1-.23-.37-.23-.47 0-.43.97-1.34 1.52-2.25 1.52-1.51 0-2.73-1.22-2.73-2.73 0-1.51 1.22-2.73 2.73-2.73.91 0 1.82.55 2.25 1.52.1.23.37.23.47 0 .43-.97 1.34-1.52 2.25-1.52 1.51 0 2.73 1.22 2.73 2.73 0 1.51-1.22 2.73-2.73 2.73m-5-9c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m8 0c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m-4 15c-5.52 0-10-4.48-10-10S2.48 2 8 2s10 4.48 10 10-4.48 10-10 10m0-18C4.48 2 1 5.48 1 10s3.48 8 7 8 8-3.48 8-8-3.48-8-8-8" }) }), _jsx("span", { children: "Apple" })] })] })] }), _jsx("div", { className: "mt-6 pt-6 border-t border-border", children: _jsxs("p", { className: "text-center text-muted-foreground text-sm", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "text-primary hover:text-primary/80 font-semibold transition-colors", children: "Login here" })] }) })] }), _jsxs("div", { className: "mt-8 grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5 text-success-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("p", { className: "text-sm text-muted-foreground font-medium", children: "Setup in Minutes" })] }), _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5 text-success-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("p", { className: "text-sm text-muted-foreground font-medium", children: "Secure & Reliable" })] }), _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5 text-success-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("p", { className: "text-sm text-muted-foreground font-medium", children: "No Card Required" })] })] })] })] }));
}
export default RegisterPage;
//# sourceMappingURL=RegisterPage.js.map