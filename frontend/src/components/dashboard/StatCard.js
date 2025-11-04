import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function StatCard({ icon: Icon, label, value, change, changeType = 'neutral', bgColor = 'bg-blue-500', iconColor = 'text-blue-500', index = 0, }) {
    const changeColor = changeType === 'positive'
        ? 'text-green-500'
        : changeType === 'negative'
            ? 'text-red-500'
            : 'text-gray-500';
    const changeSign = change !== undefined && change > 0 ? '+' : '';
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1, duration: 0.4 }, whileHover: { y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }, className: "bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-default", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsx("div", { className: `${bgColor} rounded-xl p-3 shadow-md`, children: _jsx(Icon, { className: `w-6 h-6 ${iconColor}` }) }), change !== undefined && (_jsx("div", { className: `text-sm font-semibold ${changeColor} flex items-center gap-1`, children: _jsxs("span", { className: "text-xs", children: [changeSign, change, "%"] }) }))] }), _jsx("p", { className: "text-muted-foreground text-sm font-medium mb-2", children: label }), _jsx("div", { className: "text-3xl font-bold text-foreground", children: value })] }));
}
//# sourceMappingURL=StatCard.js.map