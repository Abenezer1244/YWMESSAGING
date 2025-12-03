import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';
export default function FinalCTA() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const handleStartTrial = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        else {
            navigate('/register');
        }
    };
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8 },
        },
    };
    return (_jsxs("section", { className: "relative py-20 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden transition-colors duration-normal", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx(motion.div, { className: "absolute top-0 right-1/3 w-96 h-96 bg-primary opacity-15 rounded-full blur-3xl", animate: {
                            y: [0, -40, 0],
                            x: [0, -25, 0],
                        }, transition: {
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        } }), _jsx(motion.div, { className: "absolute bottom-0 left-1/4 w-80 h-80 bg-primary opacity-20 rounded-full blur-3xl", animate: {
                            y: [0, 35, 0],
                            x: [0, 20, 0],
                        }, transition: {
                            duration: 12,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 1,
                        } }), _jsx(motion.div, { className: "absolute top-1/2 right-0 w-80 h-80 bg-primary opacity-10 rounded-full blur-3xl", animate: {
                            y: [0, 25, 0],
                            x: [0, 15, 0],
                        }, transition: {
                            duration: 11,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.7,
                        } })] }), _jsxs("div", { className: "relative max-w-4xl mx-auto text-center", children: [_jsxs(motion.div, { className: "mb-8", initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true, margin: '-100px' }, children: [_jsxs("h2", { className: "text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground dark:text-foreground mb-6 leading-tight tracking-tight", children: ["Ready to", ' ', _jsx(motion.span, { className: "bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent inline-block", animate: {
                                            backgroundPosition: ['0%', '100%'],
                                        }, transition: {
                                            duration: 4,
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                        }, style: {
                                            backgroundSize: '200% 200%',
                                        }, children: "Koinonia Your Church?" })] }), _jsx(motion.p, { className: "text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-light", initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.8, delay: 0.2 }, viewport: { once: true }, children: "Join hundreds of churches using Koinonia to strengthen their community communication. Start your 14-day free trial today\u00E2\u20AC\u201Dno credit card required." })] }), _jsxs(motion.div, { className: "flex flex-col sm:flex-row gap-4 justify-center mb-12", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true }, children: [_jsx(motion.div, { variants: itemVariants, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: _jsx(Button, { variant: "primary", size: "lg", onClick: handleStartTrial, className: "bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-background font-semibold shadow-lg hover:shadow-xl transition-all duration-300", children: "Start Free Trial" }) }), _jsx(motion.div, { variants: itemVariants, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: _jsx(Button, { variant: "outline", size: "lg", onClick: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), className: "border-2 border-primary/50 text-muted-foreground hover:bg-muted/40 hover:border-primary font-semibold backdrop-blur-sm transition-all duration-300", children: "View Pricing" }) })] }), _jsxs(motion.div, { className: "flex flex-col sm:flex-row gap-6 justify-center text-muted-foreground text-sm", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true }, children: [_jsxs(motion.div, { variants: itemVariants, className: "flex items-center gap-2", children: [_jsx(motion.div, { animate: {
                                            scale: [1, 1.2, 1],
                                        }, transition: {
                                            duration: 1.5,
                                            repeat: Infinity,
                                        }, children: _jsx(CheckCircle, { className: "w-5 h-5 text-primary flex-shrink-0" }) }), _jsx("span", { children: "No credit card required" })] }), _jsxs(motion.div, { variants: itemVariants, className: "flex items-center gap-2", children: [_jsx(motion.div, { animate: {
                                            scale: [1, 1.2, 1],
                                        }, transition: {
                                            duration: 1.5,
                                            repeat: Infinity,
                                            delay: 0.3,
                                        }, children: _jsx(CheckCircle, { className: "w-5 h-5 text-primary flex-shrink-0" }) }), _jsx("span", { children: "Setup in 5 minutes" })] }), _jsxs(motion.div, { variants: itemVariants, className: "flex items-center gap-2", children: [_jsx(motion.div, { animate: {
                                            scale: [1, 1.2, 1],
                                        }, transition: {
                                            duration: 1.5,
                                            repeat: Infinity,
                                            delay: 0.6,
                                        }, children: _jsx(CheckCircle, { className: "w-5 h-5 text-primary flex-shrink-0" }) }), _jsx("span", { children: "Cancel anytime" })] })] })] })] }));
}
//# sourceMappingURL=FinalCTA.js.map