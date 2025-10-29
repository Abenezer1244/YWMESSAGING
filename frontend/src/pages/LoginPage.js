import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { login } from '../api/auth';
import useAuthStore from '../stores/authStore';
export function LoginPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await login(data);
            const { admin, church } = response.data;
            setAuth(admin, church);
            toast.success('Login successful!');
            navigate('/dashboard');
        }
        catch (error) {
            const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
            toast.error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8", children: [_jsx("h1", { className: "text-3xl font-bold text-center mb-2 text-gray-900", children: "Connect YW" }), _jsx("p", { className: "text-center text-gray-600 mb-8", children: "Church SMS Platform" }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", ...register('email', {
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
                                        }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: isLoading }), errors.password && (_jsx("p", { className: "text-sm text-red-500 mt-1", children: errors.password.message }))] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition", children: isLoading ? 'Logging in...' : 'Login' })] }), _jsxs("p", { className: "text-center text-gray-600 mt-6", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", className: "text-blue-600 hover:text-blue-700 font-semibold", children: "Sign up" })] })] }) }) }));
}
export default LoginPage;
//# sourceMappingURL=LoginPage.js.map