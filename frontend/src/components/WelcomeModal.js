import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import FocusTrap from 'focus-trap-react';
import Button from './ui/Button';
import client from '../api/client';
// Professional SVG Illustration
const WelcomeIllustration = () => (_jsxs("svg", { viewBox: "0 0 240 200", className: "w-full h-32", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "120", cy: "100", r: "80", fill: "var(--color-primary)", opacity: "0.08" }), _jsx("circle", { cx: "120", cy: "100", r: "60", fill: "var(--color-primary)", opacity: "0.05" }), _jsx("ellipse", { cx: "70", cy: "80", rx: "16", ry: "18", fill: "var(--color-primary)" }), _jsx("path", { d: "M 60 105 Q 70 115 75 130 M 60 105 L 50 125 M 75 105 L 85 125", stroke: "var(--color-primary)", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("ellipse", { cx: "120", cy: "70", rx: "18", ry: "20", fill: "var(--color-primary)" }), _jsx("path", { d: "M 108 95 Q 120 108 126 130 M 108 95 L 95 120 M 126 95 L 140 120", stroke: "var(--color-primary)", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("ellipse", { cx: "170", cy: "85", rx: "16", ry: "18", fill: "var(--color-primary)" }), _jsx("path", { d: "M 160 110 Q 170 120 175 135 M 160 110 L 150 130 M 175 110 L 190 130", stroke: "var(--color-primary)", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx(motion.circle, { cx: "50", cy: "50", r: "4", fill: "var(--color-primary)", opacity: "0.6", animate: { y: [-5, 5, -5], opacity: [0.3, 0.8, 0.3] }, transition: { duration: 2, repeat: Infinity } }), _jsx(motion.circle, { cx: "180", cy: "45", r: "4", fill: "var(--color-primary)", opacity: "0.6", animate: { y: [5, -5, 5], opacity: [0.3, 0.8, 0.3] }, transition: { duration: 2.5, repeat: Infinity } }), _jsx(motion.circle, { cx: "120", cy: "30", r: "3", fill: "var(--color-primary)", opacity: "0.6", animate: { y: [-8, 8, -8], opacity: [0.2, 0.7, 0.2] }, transition: { duration: 3, repeat: Infinity } })] }));
export default function WelcomeModal({ isOpen, onClose, onWelcomeComplete }) {
    const [isLoading, setIsLoading] = useState(false);
    // Complete welcome with default role
    const handleNext = async () => {
        setIsLoading(true);
        try {
            const response = await client.post('/auth/complete-welcome', {
                userRole: 'user',
            });
            if (response.data.success) {
                if (onWelcomeComplete) {
                    onWelcomeComplete('user', true);
                }
                onClose();
            }
        }
        catch (error) {
            console.error('Failed to complete welcome:', error);
            // Close modal even if there's an error - don't block the user
            onClose();
        }
        finally {
            setIsLoading(false);
        }
    };
    // Handle Escape key (WCAG 2.1.2 compliance)
    useEffect(() => {
        if (!isOpen)
            return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleNext();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, handleNext]);
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, type: 'tween' },
        },
    };
    return (_jsx(AnimatePresence, { children: isOpen && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 }, className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-md", children: _jsx(FocusTrap, { focusTrapOptions: {
                    escapeDeactivates: true,
                    clickOutsideDeactivates: true,
                }, children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.92, y: 30 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.92, y: 30 }, transition: { duration: 0.4, ease: 'easeOut' }, className: "bg-background border border-border/50 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden", role: "dialog", "aria-modal": "true", "aria-labelledby": "welcome-modal-title", children: [_jsx("div", { className: "absolute top-6 right-6 z-10", children: _jsx(motion.button, { whileHover: { scale: 1.1 }, whileTap: { scale: 0.95 }, onClick: handleNext, className: "w-11 h-11 flex items-center justify-center hover:bg-muted rounded-lg transition-colors duration-200", "aria-label": "Close modal and proceed (Escape key also works)", children: _jsx(X, { className: "w-5 h-5 text-muted-foreground" }) }) }), _jsx("div", { className: "grid grid-cols-1 gap-0", children: _jsxs(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "bg-gradient-to-br from-primary/5 to-primary/[0.02] p-6 md:p-8 flex flex-col items-center text-center", children: [_jsx(motion.div, { variants: itemVariants, className: "mb-4", children: _jsx(WelcomeIllustration, {}) }), _jsx(motion.div, { variants: itemVariants, children: _jsxs("h1", { id: "welcome-modal-title", className: "text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight", children: ["Welcome to", _jsx("br", {}), _jsx("span", { className: "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent", children: "Koinonia" })] }) }), _jsx(motion.p, { variants: itemVariants, className: "text-sm text-muted-foreground leading-relaxed mb-6", children: "Connect with your congregation. Send messages, manage groups, and build community." }), _jsx(motion.div, { variants: itemVariants, className: "bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 max-w-sm", children: _jsx("p", { className: "text-sm text-foreground", children: "You're all set! Let's get you started with Koinonia and connect with your congregation." }) }), _jsx(motion.div, { variants: itemVariants, children: _jsx(Button, { variant: "primary", size: "lg", onClick: handleNext, disabled: isLoading, isLoading: isLoading, className: "bg-primary hover:bg-primary/90 text-background font-medium shadow-lg hover:shadow-xl transition-all px-8", children: isLoading ? 'Getting started...' : 'Next' }) })] }) })] }) }) })) }));
}
//# sourceMappingURL=WelcomeModal.js.map