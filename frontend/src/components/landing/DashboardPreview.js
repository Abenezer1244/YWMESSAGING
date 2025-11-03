import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { motion } from 'framer-motion';
export default function DashboardPreview() {
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
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 1, ease: 'easeOut' },
        },
    };
    return (_jsxs("section", { className: "relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx(motion.div, { className: "absolute top-0 right-10 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-3xl", animate: {
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                        }, transition: {
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        } }), _jsx(motion.div, { className: "absolute bottom-0 left-1/4 w-80 h-80 bg-accent-400 opacity-5 rounded-full blur-3xl", animate: {
                            x: [0, -25, 0],
                            y: [0, 20, 0],
                        }, transition: {
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        } })] }), _jsxs("div", { className: "relative max-w-6xl mx-auto", children: [_jsxs(motion.div, { className: "text-center mb-16 space-y-4", initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true, margin: '-100px' }, children: [_jsxs("h2", { className: "text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white", children: ["Powerful Dashboard", _jsx("br", {}), _jsx(motion.span, { className: "bg-gradient-to-r from-accent-300 via-accent-500 to-primary-400 bg-clip-text text-transparent inline-block", animate: {
                                            backgroundPosition: ['0%', '100%'],
                                        }, transition: {
                                            duration: 4,
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                        }, style: {
                                            backgroundSize: '200% 200%',
                                        }, children: "Real-Time Insights" })] }), _jsx(motion.p, { className: "text-xl text-slate-700 dark:text-primary-100/90 max-w-2xl mx-auto", initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.8, delay: 0.2 }, viewport: { once: true }, children: "Monitor your church communication with comprehensive analytics, detailed activity logs, and actionable metrics." })] }), _jsxs(motion.div, { className: "relative group", initial: { opacity: 0, scale: 0.8, y: 50 }, whileInView: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true, margin: '-100px' }, children: [_jsx(motion.div, { className: "absolute -inset-1 bg-gradient-to-r from-blue-pacific via-blue-sky-blue to-blue-honolulu rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-500", animate: {
                                    opacity: [0.2, 0.4, 0.2],
                                    scale: [1, 1.05, 1],
                                }, transition: {
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                } }), _jsxs(motion.div, { className: "relative bg-gradient-to-br from-blue-700/40 to-blue-marian/40 rounded-2xl p-8 lg:p-12 border border-blue-600/40 backdrop-blur-xl shadow-2xl overflow-hidden group-hover:shadow-blue-900/50 transition-shadow duration-500", whileHover: {
                                    boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)',
                                }, children: [_jsx("div", { className: "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-pacific to-transparent" }), _jsxs(motion.div, { className: "mb-8 pb-6 border-b border-blue-600/20", initial: { opacity: 0, y: 10 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.2 }, viewport: { once: true }, children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(motion.div, { className: "w-3 h-3 rounded-full bg-blue-pacific", animate: {
                                                            scale: [1, 1.3, 1],
                                                            boxShadow: ['0 0 0px rgba(59, 130, 246, 0.5)', '0 0 10px rgba(59, 130, 246, 0.8)', '0 0 0px rgba(59, 130, 246, 0.5)'],
                                                        }, transition: {
                                                            duration: 2,
                                                            repeat: Infinity,
                                                        } }), _jsx("div", { className: "text-sm font-semibold text-blue-100", children: "Dashboard Preview" })] }), _jsx("h3", { className: "text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white", children: "Message Analytics" })] }), _jsxs(motion.div, { className: "grid grid-cols-2 gap-4 mb-8", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true }, children: [_jsxs(motion.div, { variants: itemVariants, className: "p-4 bg-blue-600/30 rounded-lg border border-blue-500/20", whileHover: {
                                                    scale: 1.05,
                                                    backgroundColor: 'rgba(37, 99, 235, 0.4)',
                                                }, children: [_jsx("div", { className: "text-xs text-blue-300 mb-2", children: "DELIVERED" }), _jsx(motion.div, { className: "text-2xl lg:text-3xl font-bold text-blue-pacific", initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 1, delay: 0.4 }, viewport: { once: true }, children: _jsx(CountUp, { target: 2847 }) })] }), _jsxs(motion.div, { variants: itemVariants, className: "p-4 bg-blue-600/30 rounded-lg border border-blue-500/20", whileHover: {
                                                    scale: 1.05,
                                                    backgroundColor: 'rgba(37, 99, 235, 0.4)',
                                                }, children: [_jsx("div", { className: "text-xs text-blue-300 mb-2", children: "ENGAGED" }), _jsx(motion.div, { className: "text-2xl lg:text-3xl font-bold text-success-500", initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 1, delay: 0.5 }, viewport: { once: true }, children: _jsx(CountUp, { target: 89, suffix: "%" }) })] })] }), _jsxs(motion.div, { className: "space-y-3 mb-8", initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.6, delay: 0.3 }, viewport: { once: true }, children: [_jsx("div", { className: "text-sm font-semibold text-blue-100", children: "Recent Activity" }), [80, 65, 90, 45, 75].map((height, i) => (_jsx(motion.div, { className: "flex items-end gap-2 h-8", initial: { scaleY: 0 }, whileInView: { scaleY: 1 }, transition: { duration: 0.5, delay: 0.4 + i * 0.1 }, viewport: { once: true }, style: { originY: 'bottom' }, children: _jsx(motion.div, { className: "flex-1 bg-gradient-to-t from-blue-pacific to-blue-sky-blue rounded-t opacity-80 hover:opacity-100 transition-opacity", style: { height: `${height}%` }, whileHover: { opacity: 1 }, animate: {
                                                        opacity: [0.8, 1, 0.8],
                                                    }, transition: {
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        delay: i * 0.2,
                                                    } }) }, i)))] }), _jsxs(motion.div, { className: "flex gap-2", initial: { opacity: 0, y: 10 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.5 }, viewport: { once: true }, children: [_jsx(motion.button, { className: "flex-1 py-3 px-4 bg-blue-pacific hover:bg-blue-sky-blue text-blue-900 font-semibold rounded-lg transition-colors duration-300", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: "Export" }), _jsx(motion.button, { className: "px-4 py-3 bg-blue-600/40 hover:bg-blue-600/60 text-blue-100 rounded-lg transition-colors duration-300", whileHover: { scale: 1.02, rotate: 90 }, whileTap: { scale: 0.98 }, transition: { type: 'spring', stiffness: 400 }, children: "\u22EF" })] })] })] }), _jsx(motion.div, { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mt-16", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, children: [
                            {
                                title: 'Real-Time Analytics',
                                description: 'Track delivery rates, engagement metrics, and member activity as it happens.'
                            },
                            {
                                title: 'Detailed Reporting',
                                description: 'Export comprehensive reports for board meetings and strategic planning.'
                            },
                            {
                                title: 'Smart Insights',
                                description: 'Get AI-powered recommendations to improve your communication strategy.'
                            }
                        ].map((feature, i) => (_jsxs(motion.div, { variants: itemVariants, className: "p-6 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg hover:border-accent-500/50 transition-colors duration-300 text-center", whileHover: {
                                scale: 1.05,
                                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                borderColor: 'rgba(234, 179, 8, 0.5)',
                            }, children: [_jsx(motion.h4, { className: "text-lg font-semibold text-slate-900 dark:text-white mb-3", animate: {
                                        y: [0, -5, 0],
                                    }, transition: {
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                    }, children: feature.title }), _jsx("p", { className: "text-slate-700 dark:text-slate-400", children: feature.description })] }, i))) })] })] }));
}
// Helper component for animated counter
function CountUp({ target, suffix = '' }) {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => {
                if (prev >= target) {
                    clearInterval(interval);
                    return target;
                }
                return Math.min(prev + Math.ceil(target / 30), target);
            });
        }, 30);
        return () => clearInterval(interval);
    }, [target]);
    return _jsxs(_Fragment, { children: [count.toLocaleString(), suffix] });
}
//# sourceMappingURL=DashboardPreview.js.map