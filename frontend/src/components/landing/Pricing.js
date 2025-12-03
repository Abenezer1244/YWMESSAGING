import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';
const plans = [
    {
        name: 'Starter',
        price: '$49',
        description: 'Perfect for smaller churches getting started',
        features: [
            'Up to 3 branches',
            'Up to 150 members',
            '1,000 messages/month',
            'Basic templates',
            'Email support',
            '14-day free trial',
        ],
        ctaText: 'Start Free Trial',
    },
    {
        name: 'Growth',
        price: '$79',
        description: 'Best for growing multi-location churches',
        features: [
            'Up to 6 branches',
            'Up to 250 members',
            '5,000 messages/month',
            'All templates & scheduling',
            'Recurring messages',
            'Priority support',
            '14-day free trial',
        ],
        highlight: true,
        ctaText: 'Start Free Trial',
    },
    {
        name: 'Pro',
        price: '$99',
        description: 'For established churches with advanced needs',
        features: [
            'Up to 10 branches',
            'Unlimited members',
            '15,000 messages/month',
            'Advanced analytics',
            'Co-admin support (3 admins)',
            'Custom integrations',
            '24/7 priority support',
            '14-day free trial',
        ],
        ctaText: 'Start Free Trial',
    },
];
export default function Pricing() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6 },
        },
    };
    const handleStartTrial = () => {
        if (isAuthenticated) {
            navigate('/subscribe');
        }
        else {
            navigate('/register');
        }
    };
    return (_jsxs("section", { id: "pricing", className: "relative py-20 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden transition-colors duration-normal", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx(motion.div, { className: "absolute top-0 right-1/3 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl", animate: {
                            y: [0, -30, 0],
                            x: [0, 20, 0],
                        }, transition: {
                            duration: 9,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        } }), _jsx(motion.div, { className: "absolute bottom-0 left-1/4 w-80 h-80 bg-primary opacity-15 rounded-full blur-3xl", animate: {
                            y: [0, 25, 0],
                            x: [0, -15, 0],
                        }, transition: {
                            duration: 11,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 1,
                        } })] }), _jsxs("div", { className: "relative max-w-7xl mx-auto", children: [_jsxs(motion.div, { className: "text-center mb-16", initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true, margin: '-100px' }, children: [_jsxs("h2", { className: "text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground dark:text-foreground mb-4 leading-tight tracking-tight", children: ["Simple, Transparent", ' ', _jsx(motion.span, { className: "bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent inline-block", animate: {
                                            backgroundPosition: ['0%', '100%'],
                                        }, transition: {
                                            duration: 4,
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                        }, style: {
                                            backgroundSize: '200% 200%',
                                        }, children: "Pricing" })] }), _jsx(motion.p, { className: "text-lg text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed", initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.8, delay: 0.2 }, viewport: { once: true }, children: "Choose the plan that fits your church. All plans include a 14-day free trial. No credit card required." })] }), _jsx(motion.div, { className: "grid md:grid-cols-3 gap-6 max-w-6xl mx-auto", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: '-100px' }, children: plans.map((plan, index) => (_jsxs(motion.div, { variants: itemVariants, className: `group relative transition-all duration-300 ${plan.highlight ? 'md:scale-105' : ''}`, children: [plan.highlight && (_jsx("div", { className: "absolute -inset-1 bg-gradient-to-r from-primary via-primary to-primary rounded-lg blur-2xl opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse -z-10" })), _jsxs("div", { className: `relative bg-gradient-to-br rounded-lg p-8 border transition-all duration-300 overflow-hidden h-full ${plan.highlight
                                        ? 'from-muted/60 to-muted/60 border-primary/50 shadow-2xl'
                                        : 'from-muted/50 to-muted/50 border-border/50 hover:border-primary/50'}`, children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-muted/20 to-transparent pointer-events-none" }), plan.highlight && (_jsx("div", { className: "absolute -top-3 left-1/2 transform -translate-x-1/2 z-10", children: _jsxs("div", { className: "flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary to-primary rounded-full text-background text-xs font-semibold", children: [_jsx(Zap, { className: "w-3 h-3" }), "Most Popular"] }) })), _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: "text-center mb-8 pt-4", children: [_jsx("h3", { className: "text-2xl font-semibold text-foreground dark:text-foreground mb-3", children: plan.name }), _jsxs("div", { className: "mb-4", children: [_jsx("span", { className: "text-5xl font-bold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent", children: plan.price }), _jsx("span", { className: "text-muted-foreground text-sm", children: "/month" })] }), _jsx("p", { className: "text-muted-foreground text-sm", children: plan.description })] }), _jsx("ul", { className: "space-y-3 mb-8", children: plan.features.map((feature, featureIndex) => (_jsxs("li", { className: "flex items-start gap-3", children: [_jsx(Check, { className: "w-5 h-5 text-primary flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-muted-foreground text-sm", children: feature })] }, featureIndex))) }), _jsx(Button, { variant: plan.highlight ? 'primary' : 'outline', size: "md", onClick: handleStartTrial, fullWidth: true, className: plan.highlight ? 'bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-background' : '', children: plan.ctaText })] })] })] }, index))) }), _jsxs(motion.div, { className: "mt-16 text-center", initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.8, delay: 0.3 }, viewport: { once: true }, children: [_jsx("p", { className: "text-muted-foreground mb-4 text-sm", children: "All plans include: Secure messaging, message history, reply inbox, and mobile access" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Need a custom plan?", ' ', _jsx("a", { href: "mailto:support@koinoniasms.com", className: "text-primary hover:text-primary/80 font-semibold transition-colors", children: "Contact us" })] })] })] })] }));
}
//# sourceMappingURL=Pricing.js.map