import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import Button from '../ui/Button';
export default function FinalCTA() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const handleStartTrial = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        else {
            navigate('/register');
        }
    };
    return (_jsxs("section", { className: "relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden transition-colors duration-normal", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-0 right-1/3 w-96 h-96 bg-accent-500 opacity-15 rounded-full blur-3xl animate-pulse" }), _jsx("div", { className: "absolute bottom-0 left-1/4 w-80 h-80 bg-accent-400 opacity-20 rounded-full blur-3xl animate-pulse delay-1000" }), _jsx("div", { className: "absolute top-1/2 right-0 w-80 h-80 bg-accent-300 opacity-10 rounded-full blur-3xl animate-pulse delay-700" })] }), _jsxs("div", { className: "relative max-w-4xl mx-auto text-center", children: [_jsxs("div", { className: "mb-8 animate-fadeIn", children: [_jsxs("h2", { className: "text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight", children: ["Ready to", ' ', _jsx("span", { className: "bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent", children: "Connect Your Church?" })] }), _jsx("p", { className: "text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light", children: "Join hundreds of churches using Connect to strengthen their community communication. Start your 14-day free trial today\u2014no credit card required." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center mb-12", children: [_jsx(Button, { variant: "primary", size: "lg", onClick: handleStartTrial, className: "bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-400 hover:to-accent-300 text-slate-950 font-semibold shadow-lg hover:shadow-xl transition-all duration-300", children: "Start Free Trial" }), _jsx(Button, { variant: "outline", size: "lg", onClick: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), className: "border-2 border-accent-400/50 text-slate-300 hover:bg-slate-900/40 hover:border-accent-400 font-semibold backdrop-blur-sm transition-all duration-300", children: "View Pricing" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-6 justify-center text-slate-300 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-accent-500 flex-shrink-0" }), _jsx("span", { children: "No credit card required" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-accent-500 flex-shrink-0" }), _jsx("span", { children: "Setup in 5 minutes" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-accent-500 flex-shrink-0" }), _jsx("span", { children: "Cancel anytime" })] })] })] })] }));
}
//# sourceMappingURL=FinalCTA.js.map