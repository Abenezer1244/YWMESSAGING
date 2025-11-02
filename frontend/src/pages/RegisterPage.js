import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { register as registerChurch } from '../api/auth';
import { fetchCsrfToken } from '../api/client';
import useAuthStore from '../stores/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
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
            const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-white to-primary-50 dark:from-primary-950 dark:to-primary-900 flex items-center justify-center p-4 py-8 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "w-full max-w-2xl relative z-10 animate-fadeIn", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("div", { className: "flex items-center justify-center mb-6", children: _jsx("div", { className: "w-14 h-14 bg-accent-500 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-shadow", children: _jsx("span", { className: "text-primary-900 font-bold text-2xl", children: "C" }) }) }), _jsx("h1", { className: "text-4xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight", children: "Create Your Account" }), _jsx("p", { className: "text-lg text-neutral-600 dark:text-neutral-400 font-light", children: "Start your 14-day free trial \u2022 No credit card required" })] }), _jsxs(Card, { variant: "default", className: "p-8 border border-neutral-200 dark:border-neutral-800 shadow-lg", children: [_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-5", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "First Name", placeholder: "John", disabled: isLoading, error: errors.firstName?.message, className: "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700", ...register('firstName', { required: 'First name is required' }) }), _jsx(Input, { label: "Last Name", placeholder: "Doe", disabled: isLoading, error: errors.lastName?.message, className: "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700", ...register('lastName', { required: 'Last name is required' }) })] }), _jsx(Input, { label: "Church Name", placeholder: "Grace Community Church", disabled: isLoading, error: errors.churchName?.message, className: "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700", ...register('churchName', { required: 'Church name is required' }) }), _jsx(Input, { label: "Email Address", type: "email", placeholder: "pastor@church.com", disabled: isLoading, error: errors.email?.message, className: "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700", ...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: 'Invalid email format',
                                            },
                                        }) }), _jsx(Input, { label: "Password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", helperText: "Must be at least 8 characters", disabled: isLoading, error: errors.password?.message, className: "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700", ...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 8,
                                                message: 'Password must be at least 8 characters',
                                            },
                                        }) }), _jsx(Input, { label: "Confirm Password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: isLoading, error: errors.confirmPassword?.message, className: "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700", ...register('confirmPassword', {
                                            required: 'Please confirm your password',
                                        }) }), _jsx(Button, { type: "submit", variant: "primary", size: "lg", fullWidth: true, isLoading: isLoading, disabled: isLoading, className: "font-semibold mt-6", children: isLoading ? 'Creating account...' : 'Create Account' })] }), _jsx("div", { className: "mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800", children: _jsxs("p", { className: "text-center text-neutral-600 dark:text-neutral-400 text-sm", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "text-accent-500 hover:text-accent-400 dark:text-accent-400 dark:hover:text-accent-300 font-semibold transition-colors", children: "Login here" })] }) })] }), _jsxs("div", { className: "mt-8 grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5 text-success-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400 font-medium", children: "Setup in Minutes" })] }), _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5 text-success-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400 font-medium", children: "Secure & Reliable" })] }), _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5 text-success-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400 font-medium", children: "No Card Required" })] })] })] })] }));
}
export default RegisterPage;
//# sourceMappingURL=RegisterPage.js.map