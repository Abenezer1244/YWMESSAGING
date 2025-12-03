import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { memo } from 'react';
import Button from '../ui/Button';
function FeaturedCardComponent({ title, description, gradient, imageSrc, imageAlt, actionLabel, onAction, isDark = false, index = 0, }) {
    return (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.15, duration: 0.4 }, whileHover: { y: -8, boxShadow: '0 30px 60px rgba(0,0,0,0.15)' }, className: `relative overflow-hidden rounded-3xl p-8 min-h-80 flex flex-col justify-between ${gradient} shadow-lg hover:shadow-2xl transition-all duration-300`, children: [_jsx("div", { className: "absolute inset-0 opacity-10", children: _jsx("div", { className: "absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" }) }), _jsxs("div", { className: "relative z-10", children: [_jsx("h3", { className: `text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`, children: title }), _jsx("p", { className: `text-lg leading-relaxed ${isDark ? 'text-slate-100' : 'text-slate-700'}`, children: description })] }), _jsxs("div", { className: "relative z-10 flex items-end justify-between", children: [imageSrc && (_jsx("img", { src: imageSrc, alt: imageAlt || title, className: "w-32 h-32 object-cover opacity-80 hover:opacity-100 transition-opacity" })), actionLabel && (_jsxs(Button, { variant: "primary", size: "sm", onClick: onAction, className: "bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20", children: [actionLabel, " \u2192"] }))] })] }));
}
/**
 * Memoized FeaturedCard component
 * Prevents re-renders when parent component updates but props remain the same
 * Optimized for featured content sections that render multiple cards
 */
export const FeaturedCard = memo(FeaturedCardComponent);
//# sourceMappingURL=FeaturedCard.js.map