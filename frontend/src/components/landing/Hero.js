import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Zap, Smartphone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../stores/authStore';
import Button from '../ui/Button';
import { themeColors } from '../../utils/themeColors';
export default function Hero() {
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
    const handleLearnMore = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
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
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8 },
        },
    };
    const floatingVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6 },
        },
    };
    return (_jsxs("section", { className: "relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-muted to-background dark:from-background dark:via-muted dark:to-background overflow-hidden pt-24", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx(motion.div, { className: "absolute top-20 right-10 w-96 h-96 bg-primary opacity-15 rounded-full blur-3xl", animate: {
                            y: [0, 20, 0],
                            x: [0, 10, 0],
                        }, transition: {
                            duration: 6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        } }), _jsx(motion.div, { className: "absolute bottom-0 left-0 w-80 h-80 bg-primary opacity-10 rounded-full blur-3xl", animate: {
                            y: [0, -15, 0],
                            x: [0, -10, 0],
                        }, transition: {
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        } }), _jsx(motion.div, { className: "absolute top-1/2 right-1/4 w-64 h-64 bg-primary opacity-10 rounded-full blur-3xl", animate: {
                            y: [0, 25, 0],
                            x: [0, 15, 0],
                        }, transition: {
                            duration: 7,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        } })] }), _jsxs("div", { className: "relative max-w-4xl mx-auto w-full", children: [_jsx("div", { className: "w-full", children: _jsxs(motion.div, { className: "text-center space-y-8", variants: containerVariants, initial: "hidden", animate: "visible", children: [_jsx(motion.div, { variants: floatingVariants, className: "flex justify-center", children: _jsxs(motion.div, { className: "inline-flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary/50 rounded-full text-sm font-medium text-primary dark:text-primary backdrop-blur-sm hover:bg-primary/25 transition-colors duration-300", whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: [_jsx(motion.div, { className: "w-2 h-2 bg-gradient-to-r from-primary to-primary rounded-full", animate: {
                                                    scale: [1, 1.2, 1],
                                                    opacity: [1, 0.6, 1],
                                                }, transition: {
                                                    duration: 2,
                                                    repeat: Infinity,
                                                } }), _jsx("span", { children: "Trusted by 100+ churches nationwide" })] }) }), _jsx(motion.div, { variants: itemVariants, className: "space-y-4", children: _jsxs("h1", { className: "text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight", children: [_jsx(motion.span, { className: "text-foreground dark:text-foreground inline-block", animate: {
                                                    opacity: [0.5, 1, 0.5],
                                                }, transition: {
                                                    duration: 3,
                                                    repeat: Infinity,
                                                }, children: "Koinonia Your" }), _jsx("br", {}), _jsx(motion.span, { className: "bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent inline-block", animate: {
                                                    backgroundPosition: ['0%', '100%'],
                                                }, transition: {
                                                    duration: 4,
                                                    repeat: Infinity,
                                                    repeatType: 'reverse',
                                                }, style: {
                                                    backgroundSize: '200% 200%',
                                                }, children: "Church Community" })] }) }), _jsx(motion.p, { variants: itemVariants, className: "text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground max-w-sm leading-relaxed font-light mx-auto", children: "Enterprise SMS communication platform built for churches. Strengthen community engagement, manage multiple locations, and communicate with confidence." }), _jsxs(motion.div, { variants: itemVariants, className: "flex flex-col sm:flex-row gap-3 pt-4 justify-center", children: [_jsx(motion.div, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: _jsxs(Button, { size: "md", onClick: handleStartTrial, className: "bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-background font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group", children: [_jsx("span", { children: "Start Free Trial" }), _jsx(ArrowRight, { className: "w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" })] }) }), _jsx(motion.div, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: _jsx(Button, { variant: "outline", size: "md", onClick: handleLearnMore, className: "border-2 border-primary/50 text-primary hover:bg-primary/30 hover:border-primary font-semibold rounded-lg backdrop-blur-sm transition-all duration-300", children: "Learn More" }) })] }), _jsx(motion.div, { variants: itemVariants, className: "grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6", children: [
                                        { icon: CheckCircle2, text: 'No credit card needed' },
                                        { icon: Zap, text: 'Setup in 5 minutes' },
                                        { icon: Smartphone, text: 'Mobile access included' },
                                    ].map((item, i) => (_jsxs(motion.div, { className: "flex items-center gap-3 p-3 bg-muted/50 dark:bg-primary/20 rounded-lg border border-border dark:border-primary/30 backdrop-blur-sm hover:bg-muted/50 dark:hover:bg-primary/40 transition-colors duration-300", whileHover: {
                                            scale: 1.05,
                                            backgroundColor: themeColors.muted.op50,
                                        }, transition: { type: 'spring', stiffness: 300 }, children: [_jsx(motion.div, { animate: {
                                                    rotate: [0, 10, -10, 0],
                                                }, transition: {
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    delay: i * 0.3,
                                                }, children: _jsx(item.icon, { className: "w-5 h-5 text-primary flex-shrink-0" }) }), _jsx("span", { className: "text-sm text-muted-foreground", children: item.text })] }, i))) })] }) }), _jsx(motion.div, { className: "absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center", animate: {
                            y: [0, 10, 0],
                        }, transition: {
                            duration: 2,
                            repeat: Infinity,
                        }, children: _jsxs("div", { className: "flex flex-col items-center gap-2 text-muted-foreground", children: [_jsx("span", { className: "text-sm font-medium", children: "Scroll to explore" }), _jsx("svg", { className: "w-6 h-6 animate-bounce", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 14l-7 7m0 0l-7-7m7 7V3" }) })] }) })] })] }));
}
//# sourceMappingURL=Hero.js.map