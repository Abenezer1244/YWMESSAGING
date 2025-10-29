import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Choose Your Plan" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Start with a 14-day free trial. No credit card required." })] }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: PLANS.map((plan) => (_jsxs("div", { className: `rounded-lg shadow-lg overflow-hidden transform transition hover:scale-105 ${plan.highlighted
                                ? 'ring-2 ring-blue-500 md:scale-105 bg-blue-50'
                                : 'bg-white'}`, children: [_jsxs("div", { className: `px-6 py-8 ${plan.highlighted ? 'bg-blue-500 text-white' : 'bg-gray-50'}`, children: [plan.highlighted && (_jsx("div", { className: "text-sm font-semibold text-blue-100 mb-2", children: "Most Popular" })), _jsx("h2", { className: "text-2xl font-bold", children: plan.name }), _jsx("p", { className: `text-sm mt-2 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`, children: plan.description })] }), _jsxs("div", { className: "px-6 py-6 border-b", children: [_jsxs("div", { className: "text-4xl font-bold text-gray-900", children: ["$", plan.price, _jsx("span", { className: "text-lg font-normal text-gray-600", children: "/month" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: "Billed monthly, cancel anytime" })] }), _jsx("div", { className: "px-6 py-6", children: _jsx("ul", { className: "space-y-4", children: plan.features.map((feature, idx) => (_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-green-500 mr-3 mt-0.5", children: "\u2713" }), _jsx("span", { className: "text-gray-700", children: feature })] }, idx))) }) }), _jsx("div", { className: "px-6 py-6 border-t", children: _jsx("button", { onClick: () => handleSubscribe(plan.id), disabled: isLoading, className: `w-full py-3 px-4 rounded-lg font-semibold transition ${plan.highlighted
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`, children: isLoading ? 'Processing...' : plan.cta }) })] }, plan.id))) }), _jsxs("div", { className: "mt-16 bg-white rounded-lg shadow p-8", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Frequently Asked Questions" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Do you offer a free trial?" }), _jsx("p", { className: "text-gray-600", children: "Yes! All plans include a 14-day free trial with full access to all features. No credit card required." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Can I cancel anytime?" }), _jsx("p", { className: "text-gray-600", children: "Absolutely. You can cancel your subscription at any time from your billing settings. No questions asked." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Can I upgrade or downgrade?" }), _jsx("p", { className: "text-gray-600", children: "Yes, you can change your plan at any time. Changes take effect on your next billing cycle." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "What payment methods do you accept?" }), _jsx("p", { className: "text-gray-600", children: "We accept all major credit and debit cards through Stripe's secure payment processing." })] })] })] })] })] }));
}
export default SubscribePage;
//# sourceMappingURL=SubscribePage.js.map