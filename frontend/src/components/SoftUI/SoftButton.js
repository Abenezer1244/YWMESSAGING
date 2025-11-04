import { jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function SoftButton({ children, variant = 'primary', size = 'md', onClick, disabled = false, fullWidth = false, icon, className = '', }) {
    const baseClasses = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2';
    const variants = {
        primary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg disabled:opacity-50',
        secondary: 'bg-muted hover:bg-muted/80 text-foreground disabled:opacity-50',
        danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50',
        ghost: 'text-foreground hover:bg-muted/50 disabled:opacity-50',
    };
    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };
    return (_jsxs(motion.button, { whileHover: !disabled ? { scale: 1.02 } : {}, whileTap: !disabled ? { scale: 0.98 } : {}, onClick: onClick, disabled: disabled, className: `${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`, children: [icon, children] }));
}
//# sourceMappingURL=SoftButton.js.map