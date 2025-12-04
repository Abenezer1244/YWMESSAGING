import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export function DeliveryRateCard({ deliveryRate = 65, dlcStatus = 'pending', }) {
    const navigate = useNavigate();
    const isPremiumActive = dlcStatus === 'approved';
    const showUpgradeCTA = dlcStatus === 'pending' || dlcStatus === 'shared_brand';
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.2 }, className: "relative overflow-hidden rounded-2xl p-6 text-white", style: {
            background: isPremiumActive
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        }, children: [_jsx("div", { className: "absolute inset-0 opacity-10", children: _jsx("div", { className: "absolute w-72 h-72 rounded-full blur-3xl", style: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        top: '-50%',
                        right: '-50%',
                    } }) }), _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: "flex justify-between items-start mb-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm opacity-90 font-medium", children: "Message Delivery Rate" }), _jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [_jsxs("p", { className: "text-4xl font-bold", children: [deliveryRate, "%"] }), isPremiumActive && (_jsx("span", { className: "text-sm bg-white/20 px-2 py-1 rounded-full", children: "Premium" }))] })] }), _jsx(motion.div, { animate: { scale: [1, 1.1, 1] }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Zap, { className: "w-8 h-8" }) })] }), _jsx("p", { className: "text-sm opacity-90 mb-6 max-w-xs", children: isPremiumActive
                            ? 'Your messages reach church members with enterprise-grade reliability'
                            : 'Upgrade to 10DLC registration for 99% delivery rate and faster message speeds' }), _jsxs("div", { className: "flex gap-3", children: [showUpgradeCTA && (_jsxs(motion.button, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: () => navigate('/admin/settings'), className: "bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center gap-2", children: ["Upgrade to 99% Delivery", _jsx(ArrowRight, { className: "w-4 h-4" })] })), isPremiumActive && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.3 }, className: "bg-white/20 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 backdrop-blur-sm border border-white/30", children: [_jsx(CheckCircle2, { className: "w-5 h-5" }), "Enterprise Delivery Enabled"] }))] }), _jsxs(motion.button, { whileHover: { x: 4 }, onClick: () => navigate('/admin/settings'), className: "mt-4 text-sm opacity-90 hover:opacity-100 transition-opacity flex items-center gap-1 group", children: ["Learn more about 10DLC", _jsx(ArrowRight, { className: "w-3 h-3 group-hover:translate-x-1 transition-transform" })] })] })] }));
}
//# sourceMappingURL=DeliveryRateCard.js.map