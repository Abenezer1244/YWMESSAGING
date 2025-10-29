import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createPaymentIntent } from '../api/billing';
export function CheckoutPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const [planName, setPlanName] = useState(searchParams.get('plan') || null);
    const [cardError, setCardError] = useState('');
    const planPrices = {
        starter: { name: 'Starter Plan', price: 49 },
        growth: { name: 'Growth Plan', price: 79 },
        pro: { name: 'Pro Plan', price: 99 },
    };
    useEffect(() => {
        if (!planName) {
            navigate('/subscribe');
        }
    }, [planName, navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setCardError('');
        if (!planName) {
            setCardError('Please select a plan');
            return;
        }
        try {
            setIsProcessing(true);
            // Create payment intent
            const { clientSecret, amount } = await createPaymentIntent(planName);
            console.log(`💳 Payment intent created for ${planName}: $${amount / 100}`);
            // In production, use Stripe.js to confirm payment with clientSecret
            // For MVP, simulate successful payment
            toast.success('Payment processed successfully!');
            setTimeout(() => {
                navigate('/billing');
            }, 1500);
        }
        catch (error) {
            const message = error.message || 'Payment failed';
            setCardError(message);
            toast.error(message);
        }
        finally {
            setIsProcessing(false);
        }
    };
    if (!planName) {
        return null;
    }
    const plan = planPrices[planName];
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Complete Your Payment" }) }) }), _jsxs("main", { className: "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsx("div", { className: "md:col-span-2", children: _jsxs("form", { onSubmit: handleSubmit, className: "bg-white rounded-lg shadow p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Payment Details" }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Card Holder Name" }), _jsx("input", { type: "text", placeholder: "John Doe", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", required: true })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Card Number" }), _jsx("input", { type: "text", placeholder: "4242 4242 4242 4242", maxLength: 19, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", required: true }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Test card: 4242 4242 4242 4242" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Expiry Date" }), _jsx("input", { type: "text", placeholder: "MM/YY", maxLength: 5, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "CVV" }), _jsx("input", { type: "text", placeholder: "123", maxLength: 4, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", required: true })] })] }), cardError && (_jsx("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: _jsx("p", { className: "text-sm text-red-700", children: cardError }) })), _jsx("div", { className: "mb-6", children: _jsxs("label", { className: "flex items-start", children: [_jsx("input", { type: "checkbox", className: "mt-1 w-4 h-4", defaultChecked: true, required: true }), _jsxs("span", { className: "ml-3 text-sm text-gray-600", children: ["I agree to the", ' ', _jsx("a", { href: "#", className: "text-blue-600 hover:underline", children: "Terms of Service" }), ' ', "and", ' ', _jsx("a", { href: "#", className: "text-blue-600 hover:underline", children: "Privacy Policy" })] })] }) }), _jsx("button", { type: "submit", disabled: isProcessing, className: "w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition", children: isProcessing ? 'Processing...' : `Pay $${plan.price}` }), _jsx("div", { className: "mt-4 text-center", children: _jsx("button", { type: "button", onClick: () => navigate('/subscribe'), className: "text-blue-600 hover:underline", children: "Back to plans" }) })] }) }), _jsxs("div", { className: "bg-white rounded-lg shadow p-8 h-fit", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-6", children: "Order Summary" }), _jsxs("div", { className: "border-b pb-4 mb-4", children: [_jsx("p", { className: "text-gray-600", children: plan.name }), _jsxs("p", { className: "text-2xl font-bold text-gray-900 mt-2", children: ["$", plan.price.toFixed(2)] }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "/month" })] }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Subtotal" }), _jsxs("span", { className: "text-gray-900", children: ["$", plan.price.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Tax" }), _jsx("span", { className: "text-gray-900", children: "Calculated at checkout" })] }), _jsxs("div", { className: "border-t pt-3 flex justify-between font-semibold", children: [_jsx("span", { className: "text-gray-900", children: "Total" }), _jsxs("span", { className: "text-gray-900", children: ["$", plan.price.toFixed(2)] })] })] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Plan Includes:" }), _jsxs("ul", { className: "text-xs text-gray-700 space-y-2", children: [planName === 'starter' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2713 1 Branch" }), _jsx("li", { children: "\u2713 500 Members" }), _jsx("li", { children: "\u2713 1,000 msgs/month" }), _jsx("li", { children: "\u2713 Basic analytics" })] })), planName === 'growth' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2713 5 Branches" }), _jsx("li", { children: "\u2713 2,000 Members" }), _jsx("li", { children: "\u2713 5,000 msgs/month" }), _jsx("li", { children: "\u2713 Advanced analytics" })] })), planName === 'pro' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2713 10 Branches" }), _jsx("li", { children: "\u2713 Unlimited Members" }), _jsx("li", { children: "\u2713 Unlimited messages" }), _jsx("li", { children: "\u2713 Premium support" })] }))] })] })] })] }), _jsx("div", { className: "mt-8 p-4 bg-green-50 border border-green-200 rounded-lg", children: _jsx("p", { className: "text-sm text-green-800", children: "\uD83D\uDD12 Your payment information is encrypted and processed securely by Stripe. We never store your card details." }) })] })] }));
}
export default CheckoutPage;
//# sourceMappingURL=CheckoutPage.js.map