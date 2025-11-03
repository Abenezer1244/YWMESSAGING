import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import Card from '../ui/Card';
const testimonials = [
    {
        name: 'Pastor Michael Thompson',
        role: 'Senior Pastor',
        church: 'Grace Community Church',
        content: 'Connect has transformed how we communicate with our congregation. Managing messages across our 5 locations is now seamless, and our members love the personal touch.',
    },
    {
        name: 'Sarah Johnson',
        role: 'Church Administrator',
        church: 'First Baptist Church',
        content: 'The analytics dashboard gives us incredible insights into engagement. We\'ve seen a 40% increase in member participation since using scheduled messages and templates.',
    },
    {
        name: 'Rev. David Martinez',
        role: 'Lead Pastor',
        church: 'Hope Chapel Ministries',
        content: 'The recurring message feature is a game-changer. Birthday messages, weekly reminders, and welcome messages all happen automatically. It\'s like having an extra staff member!',
    },
];
export default function Testimonials() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.2,
            },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 50, rotateX: -20 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: { duration: 0.7 },
        },
    };
    return (_jsxs("section", { id: "testimonials", className: "relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden transition-colors duration-normal", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx(motion.div, { className: "absolute top-1/3 right-0 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-3xl", animate: {
                            y: [0, 40, 0],
                            x: [0, 30, 0],
                        }, transition: {
                            duration: 12,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        } }), _jsx(motion.div, { className: "absolute bottom-0 left-1/4 w-80 h-80 bg-accent-400 opacity-15 rounded-full blur-3xl", animate: {
                            y: [0, -35, 0],
                            x: [0, -20, 0],
                        }, transition: {
                            duration: 13,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.7,
                        } })] }), _jsxs("div", { className: "relative max-w-7xl mx-auto", children: [_jsxs(motion.div, { className: "text-center mb-16", initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true, margin: '-100px' }, children: [_jsxs("h2", { className: "text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight", children: ["Trusted by", ' ', _jsx(motion.span, { className: "bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent inline-block", animate: {
                                            backgroundPosition: ['0%', '100%'],
                                        }, transition: {
                                            duration: 4,
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                        }, style: {
                                            backgroundSize: '200% 200%',
                                        }, children: "Church Leaders" })] }), _jsx(motion.p, { className: "text-lg text-slate-300 max-w-3xl mx-auto font-light leading-relaxed", initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.8, delay: 0.2 }, viewport: { once: true }, children: "See how churches across the country are using Connect to strengthen their communities." })] }), _jsx(motion.div, { className: "grid md:grid-cols-3 gap-6", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, children: testimonials.map((testimonial, index) => (_jsx(motion.div, { variants: itemVariants, children: _jsxs(Card, { variant: "default", className: "group relative p-8 bg-slate-900/50 border border-slate-700/50 hover:border-accent-400/50 backdrop-blur-xl rounded-lg transition-all duration-300 overflow-hidden h-full", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-accent-500/0 via-accent-400/0 to-accent-300/0 group-hover:from-accent-500/5 group-hover:via-accent-400/5 group-hover:to-accent-300/5 transition-all duration-300 pointer-events-none" }), _jsxs("div", { className: "relative z-10", children: [_jsx(motion.div, { className: "mb-6", animate: {
                                                    y: [0, -5, 0],
                                                    rotate: [0, 5, 0],
                                                }, transition: {
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    delay: index * 0.3,
                                                }, children: _jsx(Quote, { className: "w-10 h-10 text-accent-400 opacity-70" }) }), _jsxs("p", { className: "text-slate-100 mb-6 leading-relaxed italic text-sm", children: ["\"", testimonial.content, "\""] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center text-slate-950 font-semibold text-base flex-shrink-0", children: testimonial.name.charAt(0) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-white text-sm", children: testimonial.name }), _jsxs("div", { className: "text-xs text-slate-400", children: [testimonial.role, ", ", testimonial.church] })] })] })] })] }) }, index))) }), _jsx(motion.div, { className: "mt-16 pt-12 border-t border-accent-500/30", initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.8 }, viewport: { once: true }, children: _jsxs(motion.div, { className: "grid grid-cols-2 md:grid-cols-4 gap-8 text-center", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true }, children: [_jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, whileInView: { opacity: 1, scale: 1 }, transition: { duration: 0.6, delay: 0.2 }, viewport: { once: true }, children: [_jsx(motion.div, { className: "text-4xl font-bold bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent mb-2", animate: {
                                                y: [0, -3, 0],
                                            }, transition: {
                                                duration: 2,
                                                repeat: Infinity,
                                            }, children: "100+" }), _jsx("div", { className: "text-slate-300 text-sm", children: "Churches" })] }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, whileInView: { opacity: 1, scale: 1 }, transition: { duration: 0.6, delay: 0.3 }, viewport: { once: true }, children: [_jsx(motion.div, { className: "text-4xl font-bold bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent mb-2", animate: {
                                                y: [0, -3, 0],
                                            }, transition: {
                                                duration: 2.2,
                                                repeat: Infinity,
                                            }, children: "25K+" }), _jsx("div", { className: "text-slate-300 text-sm", children: "Members" })] }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, whileInView: { opacity: 1, scale: 1 }, transition: { duration: 0.6, delay: 0.4 }, viewport: { once: true }, children: [_jsx(motion.div, { className: "text-4xl font-bold bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent mb-2", animate: {
                                                y: [0, -3, 0],
                                            }, transition: {
                                                duration: 2.4,
                                                repeat: Infinity,
                                            }, children: "500K+" }), _jsx("div", { className: "text-slate-300 text-sm", children: "Messages Sent" })] }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, whileInView: { opacity: 1, scale: 1 }, transition: { duration: 0.6, delay: 0.5 }, viewport: { once: true }, children: [_jsx(motion.div, { className: "text-4xl font-bold bg-gradient-to-r from-accent-400 to-accent-500 bg-clip-text text-transparent mb-2", animate: {
                                                y: [0, -3, 0],
                                            }, transition: {
                                                duration: 2.6,
                                                repeat: Infinity,
                                            }, children: "99.9%" }), _jsx("div", { className: "text-slate-300 text-sm", children: "Uptime" })] })] }) })] })] }));
}
//# sourceMappingURL=Testimonials.js.map