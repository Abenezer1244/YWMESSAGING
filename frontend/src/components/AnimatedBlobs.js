import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function AnimatedBlobs({ variant = 'default', className = '' }) {
    const isDark = document.documentElement.classList.contains('dark');
    // Orange gradient colors for dark and light modes
    const blobs = [
        // Top left
        {
            id: 'blob-1',
            color: isDark
                ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(234, 88, 12, 0.2))'
                : 'linear-gradient(135deg, rgba(251, 146, 60, 0.25), rgba(234, 88, 12, 0.15))',
            size: 'w-72 h-72',
            duration: 15,
            delay: 0,
            initialX: -200,
            initialY: -100,
            endX: 150,
            endY: 200,
        },
        // Top right
        {
            id: 'blob-2',
            color: isDark
                ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(251, 146, 60, 0.2))'
                : 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.15))',
            size: 'w-80 h-80',
            duration: 18,
            delay: 2,
            initialX: 400,
            initialY: -50,
            endX: 200,
            endY: 250,
        },
        // Middle left
        {
            id: 'blob-3',
            color: isDark
                ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(249, 115, 22, 0.15))'
                : 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(249, 115, 22, 0.1))',
            size: 'w-64 h-64',
            duration: 20,
            delay: 4,
            initialX: -150,
            initialY: 400,
            endX: 200,
            endY: -100,
        },
        // Middle right
        {
            id: 'blob-4',
            color: isDark
                ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.28), rgba(249, 115, 22, 0.18))'
                : 'linear-gradient(135deg, rgba(251, 146, 60, 0.22), rgba(249, 115, 22, 0.12))',
            size: 'w-96 h-96',
            duration: 22,
            delay: 1,
            initialX: 500,
            initialY: 350,
            endX: -150,
            endY: -200,
        },
        // Bottom left
        {
            id: 'blob-5',
            color: isDark
                ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.26), rgba(234, 88, 12, 0.17))'
                : 'linear-gradient(135deg, rgba(249, 115, 22, 0.19), rgba(234, 88, 12, 0.11))',
            size: 'w-80 h-80',
            duration: 19,
            delay: 3,
            initialX: -100,
            initialY: 800,
            endX: 250,
            endY: -150,
        },
        // Bottom right
        {
            id: 'blob-6',
            color: isDark
                ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.24), rgba(251, 146, 60, 0.19))'
                : 'linear-gradient(135deg, rgba(234, 88, 12, 0.18), rgba(251, 146, 60, 0.13))',
            size: 'w-72 h-72',
            duration: 21,
            delay: 5,
            initialX: 450,
            initialY: 750,
            endX: -200,
            endY: -100,
        },
        // Center
        {
            id: 'blob-7',
            color: isDark
                ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.22), rgba(251, 146, 60, 0.16))'
                : 'linear-gradient(135deg, rgba(244, 63, 94, 0.16), rgba(251, 146, 60, 0.11))',
            size: 'w-96 h-96',
            duration: 25,
            delay: 6,
            initialX: 150,
            initialY: 450,
            endX: -200,
            endY: 200,
        },
        // Bottom right (enhanced for better coverage)
        {
            id: 'blob-8',
            color: isDark
                ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.32), rgba(249, 115, 22, 0.22))'
                : 'linear-gradient(135deg, rgba(251, 146, 60, 0.28), rgba(249, 115, 22, 0.18))',
            size: 'w-96 h-96',
            duration: 23,
            delay: 2,
            initialX: 600,
            initialY: 600,
            endX: 200,
            endY: 400,
        },
    ];
    if (variant === 'minimal') {
        // Use specific blobs for better coverage: top-left, top-right, middle-right, bottom-right
        const minimalBlobs = [blobs[0], blobs[1], blobs[3], blobs[7]];
        return (_jsx("div", { className: `fixed inset-0 overflow-hidden pointer-events-none ${className}`, children: minimalBlobs.map((blob) => (_jsx(motion.div, { className: `absolute rounded-full blur-3xl ${blob.size}`, style: {
                    background: blob.color,
                    filter: 'blur(40px)',
                }, animate: {
                    x: [blob.initialX, blob.endX, blob.initialX],
                    y: [blob.initialY, blob.endY, blob.initialY],
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
                x: [blob.initialX, blob.endX, blob.initialX],
                y: [blob.initialY, blob.endY, blob.initialY],
            }, transition: {
                duration: blob.duration,
                delay: blob.delay,
                repeat: Infinity,
                ease: 'easeInOut',
            }, initial: { x: blob.initialX, y: blob.initialY } }, blob.id))) }));
}
export default AnimatedBlobs;
//# sourceMappingURL=AnimatedBlobs.js.map