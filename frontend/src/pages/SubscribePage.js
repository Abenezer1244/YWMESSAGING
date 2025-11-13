import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 49,
        description: 'Perfect for small churches and organizations',
        features: [
            '1 dedicated phone number',
            'Up to 1,000 SMS/month',
            'Up to 500 members',
            'Up to 1 branch',
            'Basic analytics',
            'Message templates',
            'Email support',
            '1 co-admin',
        ],
        cta: 'Get Started',
        highlighted: false,
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 79,
        description: 'For growing organizations with more messaging needs',
        features: [
            '3 dedicated phone numbers',
            'Up to 10,000 SMS/month',
            'Up to 2,000 members',
            'Up to 5 branches',
            'Advanced analytics & insights',
            'Message templates & scheduling',
            'Recurring messages',
            'Priority support',
            '3 co-admins',
            'Bulk messaging',
        ],
        cta: 'Get Started',
        highlighted: true,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 129,
        description: 'For large organizations with unlimited reach',
        features: [
            'Unlimited dedicated phone numbers',
            'Unlimited SMS/month',
            'Unlimited members',
            'Up to 10 branches',
            'Real-time delivery tracking',
            'Advanced analytics & reporting',
            'Message templates & scheduling',
            'Recurring messages & auto-replies',
            'Premium 24/7 support',
            'Custom integrations & API access',
            '5 co-admins',
            'Bulk messaging & segmentation',
        ],
        cta: 'Get Started',
        highlighted: false,
    },
];
export function SubscribePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const ANNUAL_DISCOUNT = 0.15; // 15% discount for annual billing
    const getPrice = (monthlyPrice) => {
        if (billingPeriod === 'annual') {
            return Math.round(monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT));
        }
        return monthlyPrice;
    };
    const handleSubscribe = async (planId) => {
        try {
            setIsLoading(true);
            // Navigate to checkout page with plan parameter
            navigate(`/checkout?plan=${planId}&billing=${billingPeriod}`);
        }
        catch (error) {
            toast.error(error.message || 'Failed to start checkout');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-background p-6 transition-colors duration-normal", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-12", children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: "Choose Your Plan" }), _jsx("p", { className: "text-muted-foreground mb-1", children: "Start with a 14-day free trial. No credit card required." }), _jsx("p", { className: "text-sm text-green-500/80 font-medium", children: "\uD83D\uDCA1 Save 15% with annual billing" })] }), _jsxs("div", { className: "mb-12 flex items-center justify-center gap-6", children: [_jsx("button", { onClick: () => setBillingPeriod('monthly'), className: `px-6 py-3 rounded-lg font-medium transition-all duration-300 ${billingPeriod === 'monthly'
                                ? 'bg-primary text-background'
                                : 'bg-muted text-foreground border border-border hover:border-primary/50'}`, children: "Monthly Billing" }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setBillingPeriod('annual'), className: `px-6 py-3 rounded-lg font-medium transition-all duration-300 ${billingPeriod === 'annual'
                                        ? 'bg-primary text-background'
                                        : 'bg-muted text-foreground border border-border hover:border-primary/50'}`, children: "Annual Billing" }), billingPeriod === 'annual' && (_jsx("div", { className: "absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full", children: "Save 15%" }))] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-20", children: PLANS.map((plan, idx) => (_jsxs("div", { className: `relative group transition-all duration-300 ${plan.highlighted ? 'md:scale-105' : ''}`, children: [plan.highlighted && (_jsx("div", { className: "absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" })), _jsxs(Card, { variant: "default", className: `relative overflow-hidden transform transition-all duration-300 hover:shadow-xl border h-full ${plan.highlighted
                                    ? 'ring-2 ring-primary border-primary bg-gradient-to-br from-muted to-muted/50'
                                    : 'border-border bg-muted/30 hover:border-primary/50'}`, children: [plan.highlighted && (_jsx("div", { className: "absolute top-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg", children: "\u2B50 Most Popular" })), _jsxs("div", { className: `px-6 py-8 ${plan.highlighted ? 'bg-gradient-to-br from-primary/10 to-primary/5' : 'bg-gradient-to-br from-muted/50 to-transparent'}`, children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-2", children: plan.name }), _jsx("p", { className: `text-sm ${plan.highlighted ? 'text-primary/90' : 'text-foreground/70'}`, children: plan.description })] }), _jsxs("div", { className: "px-6 pt-6 pb-6 border-b border-border/40", children: [_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsxs("span", { className: "text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70", children: ["$", getPrice(plan.price)] }), _jsx("span", { className: "text-muted-foreground font-medium", children: billingPeriod === 'annual' ? '/year' : '/month' })] }), billingPeriod === 'annual' && (_jsxs("p", { className: "text-xs text-green-500 mt-2 font-medium", children: ["Save $", (plan.price * 12 * ANNUAL_DISCOUNT).toFixed(0), "/year"] })), _jsxs("p", { className: "text-xs text-muted-foreground mt-3", children: [billingPeriod === 'annual' ? 'Billed annually' : 'Billed monthly', " \u2022 Cancel anytime"] })] }), _jsx("div", { className: "px-6 py-6 flex-grow", children: _jsx("ul", { className: "space-y-3.5", children: plan.features.map((feature, featureIdx) => (_jsxs("li", { className: "flex items-start gap-3 group/item", children: [_jsx("div", { className: "flex-shrink-0 mt-0.5", children: _jsx("div", { className: `w-5 h-5 rounded-full flex items-center justify-center ${plan.highlighted
                                                                ? 'bg-primary/20 text-primary'
                                                                : 'bg-primary/10 text-primary/70'}`, children: _jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }) }) }), _jsx("span", { className: "text-sm text-foreground/85 leading-relaxed", children: feature })] }, featureIdx))) }) }), _jsx("div", { className: "px-6 py-6 border-t border-border/40 mt-auto", children: _jsx(Button, { onClick: () => handleSubscribe(plan.id), disabled: isLoading, variant: plan.highlighted ? 'primary' : 'secondary', size: "md", fullWidth: true, className: `transition-all duration-300 ${plan.highlighted
                                                ? 'hover:shadow-lg hover:shadow-primary/30'
                                                : 'hover:border-primary/50'}`, children: isLoading ? 'Processing...' : plan.cta }) })] })] }, plan.id))) }), _jsxs(Card, { variant: "default", className: "mt-16 border border-border bg-muted p-8", children: [_jsx("h3", { className: "text-2xl font-bold text-foreground mb-6", children: "\u2753 Frequently Asked Questions" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-foreground mb-2", children: "Do you offer a free trial?" }), _jsx("p", { className: "text-muted-foreground", children: "Yes! All plans include a 14-day free trial with full access to all features. No credit card required." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-foreground mb-2", children: "Can I cancel anytime?" }), _jsx("p", { className: "text-muted-foreground", children: "Absolutely. You can cancel your subscription at any time from your billing settings. No questions asked." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-foreground mb-2", children: "Can I upgrade or downgrade?" }), _jsx("p", { className: "text-muted-foreground", children: "Yes, you can change your plan at any time. Changes take effect on your next billing cycle." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-foreground mb-2", children: "What payment methods do you accept?" }), _jsx("p", { className: "text-muted-foreground", children: "We accept all major credit and debit cards through Stripe's secure payment processing." })] })] })] })] }) }));
}
export default SubscribePage;
//# sourceMappingURL=SubscribePage.js.map