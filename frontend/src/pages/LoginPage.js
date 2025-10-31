import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const onSubmit = async (data) => {
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
        }
        catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 dark:from-secondary-900 via-white dark:via-secondary-950 to-primary-100 dark:to-secondary-900 flex items-center justify-center p-4 transition-colors duration-normal", children: _jsxs("div", { className: "w-full max-w-md animate-fadeIn", children: [_jsxs(Card, { variant: "default", className: "p-8", children: [_jsx("div", { className: "flex items-center justify-center mb-8", children: _jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-primary-600 dark:from-primary-500 to-primary-700 dark:to-primary-600 rounded-lg flex items-center justify-center shadow-md", children: _jsx("span", { className: "text-white font-bold text-2xl", children: "YW" }) }) }), _jsx("h1", { className: "text-3xl font-bold text-center mb-2 text-secondary-900 dark:text-secondary-50", children: "Welcome Back" }), _jsx("p", { className: "text-center text-secondary-600 dark:text-secondary-400 mb-8", children: "Church SMS Communication Platform" }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-5", children: [_jsx(Input, { label: "Email Address", type: "email", placeholder: "pastor@church.com", disabled: isLoading, error: errors.email?.message, ...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Invalid email format',
                                        },
                                    }) }), _jsx(Input, { label: "Password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: isLoading, error: errors.password?.message, ...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters',
                                        },
                                    }) }), _jsx(Button, { type: "submit", variant: "primary", size: "md", fullWidth: true, isLoading: isLoading, disabled: isLoading, children: isLoading ? 'Logging in...' : 'Login' })] }), _jsx("div", { className: "mt-8 pt-8 border-t border-secondary-200 dark:border-secondary-700", children: _jsxs("p", { className: "text-center text-secondary-600 dark:text-secondary-400", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", className: "text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors", children: "Create account" })] }) })] }), _jsx("div", { className: "mt-8 text-center text-sm text-secondary-600 dark:text-secondary-400", children: _jsx("p", { children: "14-day free trial \u2022 No credit card required" }) })] }) }));
}
export default LoginPage;
//# sourceMappingURL=LoginPage.js.map