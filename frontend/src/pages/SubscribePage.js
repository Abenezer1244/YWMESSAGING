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
        description: 'Perfect for small churches',
        features: [
            'Up to 1 branch',
            'Up to 500 members',
            '1,000 messages/month',
            '1 co-admin',
            'Basic analytics',
            'Email support',
        ],
        cta: 'Get Started',
        highlighted: false,
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 79,
        description: 'For growing organizations',
        features: [
            'Up to 5 branches',
            'Up to 2,000 members',
            '5,000 messages/month',
            '3 co-admins',
            'Advanced analytics',
            'Priority support',
            'Message templates',
            'Recurring messages',
        ],
        cta: 'Get Started',
        highlighted: true,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 99,
        description: 'For large organizations',
        features: [
            'Up to 10 branches',
            'Unlimited members',
            'Unlimited messages',
            '3 co-admins',
            'Advanced analytics',
            'Premium support (24/7)',
            'Message templates',
            'Recurring messages',
            'Custom integrations',
            'API access',
        ],
        cta: 'Get Started',
        highlighted: false,
    },
];
export function SubscribePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const handleSubscribe = async (planId) => {
        try {
            setIsLoading(true);
            // Navigate to checkout page with plan parameter
            navigate(`/checkout?plan=${planId}`);
        }
        catch (error) {
            toast.error(error.message || 'Failed to start checkout');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950 p-6 transition-colors duration-normal", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-12", children: [_jsx("h1", { className: "text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-2", children: "Choose Your Plan" }), _jsx("p", { className: "text-secondary-600 dark:text-secondary-400", children: "Start with a 14-day free trial. No credit card required." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: PLANS.map((plan) => (_jsxs(Card, { variant: "default", className: `overflow-hidden transform transition hover:shadow-lg ${plan.highlighted
                            ? 'ring-2 ring-primary-500 md:scale-105 bg-primary-50 dark:bg-primary-900/20'
                            : ''}`, children: [_jsxs("div", { className: `-m-6 mb-6 px-6 py-8 ${plan.highlighted ? 'bg-primary-600 dark:bg-primary-700 text-white' : 'bg-secondary-100 dark:bg-secondary-800'}`, children: [plan.highlighted && (_jsx("div", { className: "text-sm font-semibold text-primary-100 mb-2", children: "\u2B50 Most Popular" })), _jsx("h2", { className: `text-2xl font-bold ${plan.highlighted ? 'text-white' : 'text-secondary-900 dark:text-secondary-50'}`, children: plan.name }), _jsx("p", { className: `text-sm mt-2 ${plan.highlighted ? 'text-primary-100' : 'text-secondary-600 dark:text-secondary-400'}`, children: plan.description })] }), _jsxs("div", { className: "pb-6 mb-6 border-b border-secondary-200 dark:border-secondary-700", children: [_jsxs("div", { className: "text-4xl font-bold text-secondary-900 dark:text-secondary-50", children: ["$", plan.price, _jsx("span", { className: "text-lg font-normal text-secondary-600 dark:text-secondary-400", children: "/month" })] }), _jsx("p", { className: "text-sm text-secondary-600 dark:text-secondary-400 mt-2", children: "Billed monthly, cancel anytime" })] }), _jsx("div", { className: "mb-6 flex-grow", children: _jsx("ul", { className: "space-y-4", children: plan.features.map((feature, idx) => (_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-success-500 dark:text-success-400 mr-3 mt-0.5", children: "\u2713" }), _jsx("span", { className: "text-secondary-700 dark:text-secondary-300", children: feature })] }, idx))) }) }), _jsx("div", { className: "pt-6 border-t border-secondary-200 dark:border-secondary-700", children: _jsx(Button, { onClick: () => handleSubscribe(plan.id), disabled: isLoading, variant: plan.highlighted ? 'primary' : 'secondary', size: "md", fullWidth: true, children: isLoading ? 'Processing...' : plan.cta }) })] }, plan.id))) }), _jsxs(Card, { variant: "default", className: "mt-16", children: [_jsx("h3", { className: "text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-6", children: "\u2753 Frequently Asked Questions" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-secondary-900 dark:text-secondary-50 mb-2", children: "Do you offer a free trial?" }), _jsx("p", { className: "text-secondary-600 dark:text-secondary-400", children: "Yes! All plans include a 14-day free trial with full access to all features. No credit card required." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-secondary-900 dark:text-secondary-50 mb-2", children: "Can I cancel anytime?" }), _jsx("p", { className: "text-secondary-600 dark:text-secondary-400", children: "Absolutely. You can cancel your subscription at any time from your billing settings. No questions asked." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-secondary-900 dark:text-secondary-50 mb-2", children: "Can I upgrade or downgrade?" }), _jsx("p", { className: "text-secondary-600 dark:text-secondary-400", children: "Yes, you can change your plan at any time. Changes take effect on your next billing cycle." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-secondary-900 dark:text-secondary-50 mb-2", children: "What payment methods do you accept?" }), _jsx("p", { className: "text-secondary-600 dark:text-secondary-400", children: "We accept all major credit and debit cards through Stripe's secure payment processing." })] })] })] })] }) }));
}
export default SubscribePage;
//# sourceMappingURL=SubscribePage.js.map