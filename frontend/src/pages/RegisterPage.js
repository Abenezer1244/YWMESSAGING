import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { register as registerChurch } from '../api/auth';
import useAuthStore from '../stores/authStore';
export function RegisterPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
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
            const { admin, church } = response.data;
            setAuth(admin, church);
            toast.success('Registration successful!');
            navigate('/dashboard');
        }
        catch (error) {
            const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
            toast.error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-8", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8", children: [_jsx("h1", { className: "text-3xl font-bold text-center mb-2 text-gray-900", children: "Connect YW" }), _jsx("p", { className: "text-center text-gray-600 mb-8", children: "Create your church account" }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "First Name" }), _jsx("input", { ...register('firstName', { required: 'First name is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "John", disabled: isLoading }), errors.firstName && (_jsx("p", { className: "text-sm text-red-500 mt-1", children: errors.firstName.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Last Name" }), _jsx("input", { ...register('lastName', { required: 'Last name is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "Doe", disabled: isLoading }), errors.lastName && (_jsx("p", { className: "text-sm text-red-500 mt-1", children: errors.lastName.message }))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Church Name" }), _jsx("input", { ...register('churchName', { required: 'Church name is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "Grace Community Church", disabled: isLoading }), errors.churchName && (_jsx("p", { className: "text-sm text-red-500 mt-1", children: errors.churchName.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", ...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: 'Invalid email format',
                                            },
                                        }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "you@example.com", disabled: isLoading }), errors.email && (_jsx("p", { className: "text-sm text-red-500 mt-1", children: errors.email.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), _jsx("input", { type: "password", ...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 8,
                                                message: 'Password must be at least 8 characters',
                                            },
                                        }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: isLoading }), errors.password && (_jsx("p", { className: "text-sm text-red-500 mt-1", children: errors.password.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Confirm Password" }), _jsx("input", { type: "password", ...register('confirmPassword', {
                                            required: 'Please confirm your password',
                                        }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: isLoading }), errors.confirmPassword && (_jsx("p", { className: "text-sm text-red-500 mt-1", children: errors.confirmPassword.message }))] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition", children: isLoading ? 'Creating account...' : 'Create Account' })] }), _jsxs("p", { className: "text-center text-gray-600 mt-6", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "text-blue-600 hover:text-blue-700 font-semibold", children: "Login" })] })] }) }) }));
}
export default RegisterPage;
//# sourceMappingURL=RegisterPage.js.map