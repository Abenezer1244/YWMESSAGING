import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
export default function Navigation() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const handleSignIn = () => {
        navigate('/login');
    };
    const handleStartTrial = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        else {
            navigate('/register');
        }
    };
    return (_jsx("nav", { className: "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsxs(Link, { to: "/", className: "flex items-center space-x-2 group", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center shadow-medium group-hover:shadow-large transition-shadow", children: _jsx("span", { className: "text-white font-bold text-xl", children: "YW" }) }), _jsx("span", { className: "text-xl font-bold text-gray-900", children: "Connect YW" })] }), _jsxs("div", { className: "hidden md:flex items-center space-x-8", children: [_jsx("a", { href: "#features", className: "text-gray-700 hover:text-primary-600 transition-colors font-medium", children: "Features" }), _jsx("a", { href: "#pricing", className: "text-gray-700 hover:text-primary-600 transition-colors font-medium", children: "Pricing" }), _jsx("a", { href: "#testimonials", className: "text-gray-700 hover:text-primary-600 transition-colors font-medium", children: "Testimonials" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [!isAuthenticated && (_jsx("button", { onClick: handleSignIn, className: "hidden sm:block text-gray-700 hover:text-primary-600 font-medium transition-colors", children: "Sign In" })), _jsx("button", { onClick: handleStartTrial, className: "px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all shadow-soft hover:shadow-medium hover:scale-105 active:scale-95", children: isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial' })] })] }) }) }));
}
//# sourceMappingURL=Navigation.js.map