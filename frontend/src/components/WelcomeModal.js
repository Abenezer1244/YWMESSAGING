import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import FocusTrap from 'focus-trap-react';
import Button from './ui/Button';
import client from '../api/client';
// Professional SVG Illustration
const WelcomeIllustration = () => (_jsxs("svg", { viewBox: "0 0 240 200", className: "w-full h-32", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "120", cy: "100", r: "80", fill: "var(--color-primary)", opacity: "0.08" }), _jsx("circle", { cx: "120", cy: "100", r: "60", fill: "var(--color-primary)", opacity: "0.05" }), _jsx("ellipse", { cx: "70", cy: "80", rx: "16", ry: "18", fill: "var(--color-primary)" }), _jsx("path", { d: "M 60 105 Q 70 115 75 130 M 60 105 L 50 125 M 75 105 L 85 125", stroke: "var(--color-primary)", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("ellipse", { cx: "120", cy: "70", rx: "18", ry: "20", fill: "var(--color-primary)" }), _jsx("path", { d: "M 108 95 Q 120 108 126 130 M 108 95 L 95 120 M 126 95 L 140 120", stroke: "var(--color-primary)", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("ellipse", { cx: "170", cy: "85", rx: "16", ry: "18", fill: "var(--color-primary)" }), _jsx("path", { d: "M 160 110 Q 170 120 175 135 M 160 110 L 150 130 M 175 110 L 190 130", stroke: "var(--color-primary)", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx(motion.circle, { cx: "50", cy: "50", r: "4", fill: "var(--color-primary)", opacity: "0.6", animate: { y: [-5, 5, -5], opacity: [0.3, 0.8, 0.3] }, transition: { duration: 2, repeat: Infinity } }), _jsx(motion.circle, { cx: "180", cy: "45", r: "4", fill: "var(--color-primary)", opacity: "0.6", animate: { y: [5, -5, 5], opacity: [0.3, 0.8, 0.3] }, transition: { duration: 2.5, repeat: Infinity } }), _jsx(motion.circle, { cx: "120", cy: "30", r: "3", fill: "var(--color-primary)", opacity: "0.6", animate: { y: [-8, 8, -8], opacity: [0.2, 0.7, 0.2] }, transition: { duration: 3, repeat: Infinity } })] }));
export default function WelcomeModal({ isOpen, onClose, onWelcomeComplete }) {
    const [selectedRole, setSelectedRole] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Mark welcome as completed without selecting a role
    // Used for Skip button, close button, and Escape key
    const handleSkip = async () => {
        setIsLoading(true);
        try {
            const response = await client.post('/auth/complete-welcome', {
                userRole: 'skipped',
            });
            if (response.data.success) {
                if (onWelcomeComplete) {
                    onWelcomeComplete('skipped', true);
                }
                onClose();
            }
        }
        catch (error) {
            console.error('Failed to skip welcome:', error);
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
                handleSkip();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, handleSkip]);
    const roles = [
        {
            id: 'pastor',
            label: 'Pastor / Lead Minister',
            description: 'Lead your congregation spiritually',
            icon: '⛪',
        },
        {
            id: 'admin',
            label: 'Church Administrator',
            description: 'Manage operations and logistics',
            icon: '📋',
        },
        {
            id: 'communications',
            label: 'Communications Lead',
            description: 'Handle messaging and outreach',
            icon: '📢',
        },
        {
            id: 'volunteer',
            label: 'Volunteer Coordinator',
            description: 'Coordinate volunteer activities',
            icon: '👥',
        },
        {
            id: 'other',
            label: 'Other',
            description: 'Something else',
            icon: '⭐',
        },
    ];
    const handleNext = async () => {
        if (!selectedRole)
            return;
        setIsLoading(true);
        try {
            // Call backend to complete welcome
            const response = await client.post('/auth/complete-welcome', {
                userRole: selectedRole,
            });
            if (response.data.success) {
                toast.success('Welcome complete! Let\'s get started.');
                // Notify parent component to update auth state
                if (onWelcomeComplete) {
                    onWelcomeComplete(selectedRole, true);
                }
                onClose();
            }
        }
        catch (error) {
            console.error('Failed to complete welcome:', error);
            toast.error('Failed to save your preferences. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
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
                }, children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.92, y: 30 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.92, y: 30 }, transition: { duration: 0.4, ease: 'easeOut' }, className: "bg-background border border-border/50 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden", role: "dialog", "aria-modal": "true", "aria-labelledby": "welcome-modal-title", children: [_jsx("div", { className: "absolute top-6 right-6 z-10", children: _jsx(motion.button, { whileHover: { scale: 1.1 }, whileTap: { scale: 0.95 }, onClick: handleSkip, className: "w-11 h-11 flex items-center justify-center hover:bg-muted rounded-lg transition-colors duration-200", "aria-label": "Close modal (Escape key also works)", children: _jsx(X, { className: "w-5 h-5 text-muted-foreground" }) }) }), _jsxs("div", { className: "grid grid-cols-1 gap-0", children: [_jsxs(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "bg-gradient-to-br from-primary/5 to-primary/[0.02] p-6 md:p-8 flex flex-col items-center text-center", children: [_jsx(motion.div, { variants: itemVariants, className: "mb-4", children: _jsx(WelcomeIllustration, {}) }), _jsx(motion.div, { variants: itemVariants, children: _jsxs("h1", { id: "welcome-modal-title", className: "text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight", children: ["Welcome to", _jsx("br", {}), _jsx("span", { className: "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent", children: "Koinonia" })] }) }), _jsx(motion.p, { variants: itemVariants, className: "text-sm text-muted-foreground leading-relaxed", children: "Connect with your congregation. Send messages, manage groups, and build community." })] }), _jsxs(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "p-6 md:p-8 flex flex-col", children: [_jsxs(motion.div, { variants: itemVariants, children: [_jsx("h2", { className: "text-lg font-semibold text-foreground mb-1", children: "How would you describe your role?" }), _jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "We'll personalize your experience based on your position." })] }), _jsx(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "space-y-2 mb-6", children: roles.map((role) => (_jsxs(motion.label, { variants: itemVariants, whileHover: { scale: 1.02 }, className: `relative flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 group ${selectedRole === role.id
                                                    ? 'border-primary bg-primary/8 shadow-md'
                                                    : 'border-border/30 hover:border-primary/40 hover:bg-muted/40 bg-muted/20'}`, children: [_jsx("div", { className: "flex-shrink-0 mt-1", children: _jsx("div", { className: `w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedRole === role.id
                                                                ? 'border-primary bg-primary'
                                                                : 'border-border/50 group-hover:border-primary/50'}`, children: selectedRole === role.id && (_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: 'spring', stiffness: 200 }, children: _jsx(Check, { className: "w-3 h-3 text-background" }) })) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-1.5 mb-0.5", children: [_jsx("span", { className: "text-base", children: role.icon }), _jsx("span", { className: "font-medium text-foreground text-xs", children: role.label })] }), _jsx("p", { className: "text-[10px] text-muted-foreground leading-tight", children: role.description })] }), _jsx("input", { type: "radio", name: "role", value: role.id, checked: selectedRole === role.id, onChange: (e) => setSelectedRole(e.target.value), className: "hidden" })] }, role.id))) }), _jsxs(motion.div, { variants: itemVariants, className: "space-y-2", children: [_jsx(Button, { variant: "primary", size: "lg", fullWidth: true, onClick: handleNext, disabled: !selectedRole || isLoading, isLoading: isLoading, className: "bg-primary hover:bg-primary/90 text-background disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transition-all", children: isLoading ? 'Saving...' : selectedRole ? 'Continue' : 'Select a role to continue' }), _jsx("button", { onClick: handleSkip, disabled: isLoading, className: "w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed", children: "Skip for now" })] })] })] })] }) }) })) }));
}
//# sourceMappingURL=WelcomeModal.js.map