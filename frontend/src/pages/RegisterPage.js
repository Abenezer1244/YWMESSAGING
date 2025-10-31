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
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 dark:from-secondary-900 via-white dark:via-secondary-950 to-primary-100 dark:to-secondary-900 flex items-center justify-center p-4 py-8 transition-colors duration-normal", children: _jsxs("div", { className: "w-full max-w-2xl animate-fadeIn", children: [_jsxs(Card, { variant: "default", className: "p-8", children: [_jsx("div", { className: "flex items-center justify-center mb-8", children: _jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-primary-600 dark:from-primary-500 to-primary-700 dark:to-primary-600 rounded-lg flex items-center justify-center shadow-md", children: _jsx("span", { className: "text-white font-bold text-2xl", children: "YW" }) }) }), _jsx("h1", { className: "text-3xl font-bold text-center mb-2 text-secondary-900 dark:text-secondary-50", children: "Start Your Free Trial" }), _jsx("p", { className: "text-center text-secondary-600 dark:text-secondary-400 mb-8", children: "Create your church account in minutes \u2022 14-day free trial" }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-5", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "First Name", placeholder: "John", disabled: isLoading, error: errors.firstName?.message, ...register('firstName', { required: 'First name is required' }) }), _jsx(Input, { label: "Last Name", placeholder: "Doe", disabled: isLoading, error: errors.lastName?.message, ...register('lastName', { required: 'Last name is required' }) })] }), _jsx(Input, { label: "Church Name", placeholder: "Grace Community Church", disabled: isLoading, error: errors.churchName?.message, ...register('churchName', { required: 'Church name is required' }) }), _jsx(Input, { label: "Email Address", type: "email", placeholder: "pastor@church.com", disabled: isLoading, error: errors.email?.message, ...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Invalid email format',
                                        },
                                    }) }), _jsx(Input, { label: "Password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", helperText: "Must be at least 8 characters", disabled: isLoading, error: errors.password?.message, ...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters',
                                        },
                                    }) }), _jsx(Input, { label: "Confirm Password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: isLoading, error: errors.confirmPassword?.message, ...register('confirmPassword', {
                                        required: 'Please confirm your password',
                                    }) }), _jsx(Button, { type: "submit", variant: "primary", size: "md", fullWidth: true, isLoading: isLoading, disabled: isLoading, children: isLoading ? 'Creating account...' : 'Create Account' })] }), _jsx("div", { className: "mt-8 pt-8 border-t border-secondary-200 dark:border-secondary-700", children: _jsxs("p", { className: "text-center text-secondary-600 dark:text-secondary-400", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors", children: "Login here" })] }) })] }), _jsxs("div", { className: "mt-8 grid grid-cols-3 gap-4 text-center text-sm", children: [_jsxs("div", { className: "text-secondary-600 dark:text-secondary-400", children: [_jsx("div", { className: "text-2xl mb-2", children: "\u26A1" }), _jsx("p", { className: "font-medium", children: "Setup in Minutes" })] }), _jsxs("div", { className: "text-secondary-600 dark:text-secondary-400", children: [_jsx("div", { className: "text-2xl mb-2", children: "\uD83D\uDD12" }), _jsx("p", { className: "font-medium", children: "Secure & Reliable" })] }), _jsxs("div", { className: "text-secondary-600 dark:text-secondary-400", children: [_jsx("div", { className: "text-2xl mb-2", children: "\uD83D\uDCB3" }), _jsx("p", { className: "font-medium", children: "No Card Required" })] })] })] }) }));
}
export default RegisterPage;
//# sourceMappingURL=RegisterPage.js.map