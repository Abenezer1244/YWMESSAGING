import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function AnimatedBlobs({ variant = 'default', className = '' }) {
    const isDark = document.documentElement.classList.contains('dark');
    // Orange gradient colors for dark and light modes
    const blobs = [
        {
            id: 'blob-1',
            color: isDark
                ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(234, 88, 12, 0.2))'
                : 'linear-gradient(135deg, rgba(251, 146, 60, 0.25), rgba(234, 88, 12, 0.15))',
            size: 'w-72 h-72',
            duration: 15,
            delay: 0,
            initialX: -100,
            initialY: 50,
        },
        {
            id: 'blob-2',
            color: isDark
                ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(251, 146, 60, 0.2))'
                : 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.15))',
            size: 'w-80 h-80',
            duration: 18,
            delay: 2,
            initialX: 100,
            initialY: -50,
        },
        {
            id: 'blob-3',
            color: isDark
                ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(249, 115, 22, 0.15))'
                : 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(249, 115, 22, 0.1))',
            size: 'w-64 h-64',
            duration: 20,
            delay: 4,
            initialX: 50,
            initialY: 100,
        },
    ];
    if (variant === 'minimal') {
        return (_jsx("div", { className: `fixed inset-0 overflow-hidden pointer-events-none ${className}`, children: blobs.slice(0, 1).map((blob) => (_jsx(motion.div, { className: `absolute rounded-full blur-3xl ${blob.size}`, style: {
                    background: blob.color,
                    filter: 'blur(40px)',
                }, animate: {
                    x: [blob.initialX, blob.initialX + 100, blob.initialX],
                    y: [blob.initialY, blob.initialY - 100, blob.initialY],
                }, transition: {
                    duration: blob.duration,
                    delay: blob.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }, initial: { x: blob.initialX, y: blob.initialY } }, blob.id))) }));
    }
    return (_jsx("div", { className: `fixed inset-0 overflow-hidden pointer-events-none ${className}`, children: blobs.map((blob) => (_jsx(motion.div, { className: `absolute rounded-full blur-3xl ${blob.size}`, style: {
                background: blob.color,
                filter: 'blur(40px)',
            }, animate: {
                x: [blob.initialX, blob.initialX + 150, blob.initialX],
                y: [blob.initialY, blob.initialY - 150, blob.initialY],
            }, transition: {
                duration: blob.duration,
                delay: blob.delay,
                repeat: Infinity,
                ease: 'easeInOut',
            }, initial: { x: blob.initialX, y: blob.initialY } }, blob.id))) }));
}
export default AnimatedBlobs;
//# sourceMappingURL=AnimatedBlobs.js.map