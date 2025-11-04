import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Users, MessageSquare, Clock, FileText, BarChart3, UserPlus } from 'lucide-react';
import Card from '../ui/Card';
import { themeColors } from '../../utils/themeColors';
const features = [
    {
        icon: _jsx(Users, { className: "w-8 h-8" }),
        title: 'Multi-Branch Management',
        description: 'Manage 3-10 church locations from one unified dashboard. Coordinate messaging across all branches seamlessly.',
    },
    {
        icon: _jsx(MessageSquare, { className: "w-8 h-8" }),
        title: 'SMS Messaging',
        description: 'Send messages to individuals, groups, entire branches, or your whole congregation. Support for one-way and two-way communication.',
    },
    {
        icon: _jsx(Clock, { className: "w-8 h-8" }),
        title: 'Message Scheduling',
        description: 'Schedule messages in advance or set up recurring messages (daily, weekly, monthly). Send welcome messages automatically.',
    },
    {
        icon: _jsx(FileText, { className: "w-8 h-8" }),
        title: 'Message Templates',
        description: 'Save time with pre-built and custom message templates. Maintain consistent communication while personalizing your messages.',
    },
    {
        icon: _jsx(BarChart3, { className: "w-8 h-8" }),
        title: 'Analytics & Insights',
        description: 'Track delivery rates, reply rates, and engagement metrics. Understand your congregation\'s communication patterns with detailed analytics.',
    },
    {
        icon: _jsx(UserPlus, { className: "w-8 h-8" }),
        title: 'Member Management',
        description: 'Import members via CSV, organize by groups and tags, and maintain detailed member profiles. Segment your congregation for targeted messaging.',
    },
];
export default function Features() {
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
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
    };
    return (_jsxs("section", { id: "features", className: "relative py-20 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden transition-colors duration-normal", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx(motion.div, { className: "absolute top-20 left-1/4 w-80 h-80 bg-primary opacity-10 rounded-full blur-3xl", animate: {
                            y: [0, -30, 0],
                            x: [0, 15, 0],
                        }, transition: {
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        } }), _jsx(motion.div, { className: "absolute bottom-20 right-1/4 w-96 h-96 bg-primary opacity-15 rounded-full blur-3xl", animate: {
                            y: [0, 20, 0],
                            x: [0, -20, 0],
                        }, transition: {
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 1,
                        } })] }), _jsxs("div", { className: "relative max-w-7xl mx-auto", children: [_jsxs(motion.div, { className: "text-center mb-16", initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true, margin: '-100px' }, children: [_jsxs("h2", { className: "text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground dark:text-foreground mb-4 leading-tight tracking-tight", children: ["Everything You Need to", ' ', _jsx(motion.span, { className: "bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent inline-block", animate: {
                                            backgroundPosition: ['0%', '100%'],
                                        }, transition: {
                                            duration: 4,
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                        }, style: {
                                            backgroundSize: '200% 200%',
                                        }, children: "Stay Connected" })] }), _jsx(motion.p, { className: "text-lg text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed", initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.8, delay: 0.2 }, viewport: { once: true }, children: "Powerful features designed specifically for churches managing multiple locations and hundreds of members." })] }), _jsx(motion.div, { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, children: features.map((feature, index) => (_jsx(motion.div, { variants: itemVariants, children: _jsxs(Card, { variant: "default", className: "group relative p-8 bg-muted/50 border border-border/50 hover:border-primary/50 backdrop-blur-xl rounded-lg overflow-hidden h-full", children: [_jsx(motion.div, { whileHover: {
                                            scale: 1.02,
                                            backgroundColor: themeColors.background.op80,
                                            borderColor: themeColors.accent.op50,
                                        }, transition: { duration: 0.3 }, className: "absolute inset-0 rounded-lg" }), _jsx(motion.div, { className: "absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-primary/5 rounded-lg pointer-events-none", animate: {
                                            opacity: [0, 0.3, 0],
                                        }, transition: {
                                            duration: 3,
                                            repeat: Infinity,
                                            delay: index * 0.3,
                                        } }), _jsxs(motion.div, { className: "relative z-10", initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.6, delay: index * 0.1 + 0.2 }, viewport: { once: true }, children: [_jsx(motion.div, { className: "w-12 h-12 bg-primary text-background rounded-lg flex items-center justify-center mb-5 group-hover:shadow-lg group-hover:shadow-primary/50", whileHover: {
                                                    scale: 1.15,
                                                    rotate: [0, -10, 10, -5, 5, 0],
                                                }, transition: { type: 'spring', stiffness: 300 }, children: feature.icon }), _jsx("h3", { className: "text-lg font-semibold text-foreground dark:text-foreground mb-3", children: feature.title }), _jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: feature.description })] })] }) }, index))) })] })] }));
}
//# sourceMappingURL=Features.js.map