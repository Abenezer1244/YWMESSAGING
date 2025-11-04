import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { SoftCard } from './SoftCard';
export function SoftStat({ icon: Icon, label, value, change, changeType = 'neutral', gradient = 'from-blue-500 to-cyan-500', index = 0, }) {
    const changeColor = changeType === 'positive'
        ? 'text-green-400'
        : changeType === 'negative'
            ? 'text-red-400'
            : 'text-muted-foreground';
    const changeSign = change !== undefined && change > 0 ? '+' : '';
    return (_jsxs(SoftCard, { variant: "gradient", index: index, children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsx(motion.div, { animate: { scale: [1, 1.05, 1] }, transition: { duration: 3, repeat: Infinity }, className: `bg-gradient-to-br ${gradient} rounded-xl p-3 shadow-lg`, children: _jsx(Icon, { className: "w-6 h-6 text-white" }) }), change !== undefined && (_jsxs("div", { className: `text-sm font-bold ${changeColor}`, children: [changeSign, change, "%"] }))] }), _jsx("p", { className: "text-muted-foreground text-sm font-medium mb-2", children: label }), _jsx("p", { className: "text-3xl font-bold text-foreground", children: value })] }));
}
//# sourceMappingURL=SoftStat.js.map