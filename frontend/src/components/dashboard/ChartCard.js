import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function ChartCard({ title, subtitle, children, index = 0 }) {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1, duration: 0.4 }, whileHover: { boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }, className: "bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-xl font-bold text-foreground mb-2", children: title }), subtitle && _jsx("p", { className: "text-sm text-muted-foreground", children: subtitle })] }), _jsx("div", { className: "overflow-x-auto", children: children })] }));
}
//# sourceMappingURL=ChartCard.js.map