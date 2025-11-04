import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { createPaymentIntent } from '../api/billing';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
// Initialize Stripe - use environment variable for key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
// Separate component for payment form
function PaymentForm({ planName, planPrice, onSubmit }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardError, setCardError] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setCardError('');
        if (!stripe || !elements) {
            setCardError('Payment processing not available');
            return;
        }
        if (!cardholderName.trim()) {
            setCardError('Cardholder name is required');
            return;
        }
        try {
            setIsProcessing(true);
            // Create payment intent
            const { clientSecret } = await createPaymentIntent(planName);
            // Confirm card payment securely through Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: cardholderName,
                    },
                },
            });
            if (error) {
                // Show generic error message without exposing payment system details
                const userMessage = 'Payment failed. Please verify your card details and try again.';
                setCardError(userMessage);
                toast.error(userMessage);
                if (process.env.NODE_ENV === 'development') {
                    console.debug('Stripe error:', error.message);
                }
            }
            else if (paymentIntent?.status === 'succeeded') {
                toast.success('Payment successful!');
                // Handle successful payment
                onSubmit();
            }
        }
        catch (err) {
            // Generic error message without exposing details
            const userMessage = 'Payment processing error. Please try again.';
            setCardError(userMessage);
            toast.error(userMessage);
            if (process.env.NODE_ENV === 'development') {
                console.debug('Payment error:', err);
            }
        }
        finally {
            setIsProcessing(false);
        }
    };
    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                    color: '#94a3b8',
                },
            },
            invalid: {
                color: '#EF4444',
            },
        },
    };
    return (_jsxs("form", { onSubmit: handleSubmit, children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-6", children: "Payment Details" }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 dark:text-white mb-2", children: "Cardholder Name" }), _jsx("input", { type: "text", placeholder: "John Doe", value: cardholderName, onChange: (e) => setCardholderName(e.target.value), required: true, className: "w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors placeholder-slate-400 dark:placeholder-slate-500" })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 dark:text-white mb-2", children: "Card Details" }), _jsx("div", { className: "p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-800", children: _jsx(CardElement, { options: cardElementOptions }) }), _jsx("p", { className: "text-xs text-slate-600 dark:text-slate-400 mt-2", children: "Your card information is processed securely by Stripe." })] }), cardError && (_jsx(Card, { variant: "default", className: "mb-6 bg-red-950/30 border border-red-800", children: _jsx("p", { className: "text-sm text-red-400", children: cardError }) })), _jsx("div", { className: "mb-6", children: _jsxs("label", { className: "flex items-start gap-3", children: [_jsx("input", { type: "checkbox", className: "mt-1 w-4 h-4 border-slate-300 dark:border-slate-600 rounded text-accent-500 focus:ring-accent-500 bg-slate-100 dark:bg-slate-800", defaultChecked: true, required: true }), _jsxs("span", { className: "text-sm text-slate-700 dark:text-slate-300", children: ["I agree to the", ' ', _jsx("a", { href: "/terms", className: "text-accent-400 hover:text-accent-300 font-semibold", children: "Terms of Service" }), ' ', "and", ' ', _jsx("a", { href: "/privacy", className: "text-accent-400 hover:text-accent-300 font-semibold", children: "Privacy Policy" })] })] }) }), _jsx(Button, { type: "submit", variant: "primary", size: "lg", disabled: isProcessing || !stripe, className: "w-full", children: isProcessing ? 'Processing...' : `Pay $${planPrice}` }), _jsx("div", { className: "mt-4 text-center", children: _jsx("a", { href: "/subscribe", className: "text-accent-400 hover:text-accent-300 font-semibold", children: "Back to plans" }) })] }));
}
// Validate plan name against allowed values
const getValidatedPlan = (plan) => {
    const validPlans = ['starter', 'growth', 'pro'];
    return validPlans.includes(plan) ? plan : null;
};
export function CheckoutPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [planName, setPlanName] = useState(getValidatedPlan(searchParams.get('plan')));
    const planPrices = {
        starter: { name: 'Starter Plan', price: 49 },
        growth: { name: 'Growth Plan', price: 79 },
        pro: { name: 'Pro Plan', price: 99 },
    };
    useEffect(() => {
        if (!planName) {
            // Use timer to prevent multiple redirects
            const redirectTimer = setTimeout(() => navigate('/subscribe'), 0);
            return () => clearTimeout(redirectTimer);
        }
    }, [planName, navigate]);
    const handlePaymentSuccess = () => {
        navigate('/billing');
    };
    if (!planName) {
        return null;
    }
    const plan = planPrices[planName];
    return (_jsx("div", { className: "min-h-screen bg-white dark:bg-slate-950 p-6 transition-colors duration-normal", children: _jsxs("div", { className: "max-w-5xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-slate-900 dark:text-white mb-2", children: "\uD83D\uDCB3 Complete Your Payment" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300", children: "Secure checkout powered by Stripe" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsx("div", { className: "md:col-span-2", children: _jsx(Card, { variant: "default", className: "bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700", children: _jsx(Elements, { stripe: stripePromise, children: _jsx(PaymentForm, { planName: planName, planPrice: plan.price, onSubmit: handlePaymentSuccess }) }) }) }), _jsxs(Card, { variant: "default", className: "h-fit border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-6", children: "Order Summary" }), _jsxs("div", { className: "border-b border-slate-300 dark:border-slate-700 pb-4 mb-4", children: [_jsx("p", { className: "text-slate-700 dark:text-slate-300", children: plan.name }), _jsxs("p", { className: "text-2xl font-bold text-slate-900 dark:text-white mt-2", children: ["$", plan.price.toFixed(2)] }), _jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400 mt-1", children: "/month" })] }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-600 dark:text-slate-400", children: "Subtotal" }), _jsxs("span", { className: "text-slate-900 dark:text-white", children: ["$", plan.price.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-600 dark:text-slate-400", children: "Tax" }), _jsx("span", { className: "text-slate-900 dark:text-white", children: "Calculated at checkout" })] }), _jsxs("div", { className: "border-t border-slate-300 dark:border-slate-700 pt-3 flex justify-between font-semibold", children: [_jsx("span", { className: "text-slate-900 dark:text-white", children: "Total" }), _jsxs("span", { className: "text-slate-900 dark:text-white", children: ["$", plan.price.toFixed(2)] })] })] }), _jsxs(Card, { variant: "highlight", className: "bg-accent-500/10 border border-accent-500/30", children: [_jsx("p", { className: "text-sm font-semibold text-slate-900 dark:text-white mb-3", children: "Plan Includes:" }), _jsxs("ul", { className: "text-xs text-slate-700 dark:text-slate-300 space-y-2", children: [planName === 'starter' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2713 1 Branch" }), _jsx("li", { children: "\u2713 500 Members" }), _jsx("li", { children: "\u2713 1,000 msgs/month" }), _jsx("li", { children: "\u2713 Basic analytics" })] })), planName === 'growth' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2713 5 Branches" }), _jsx("li", { children: "\u2713 2,000 Members" }), _jsx("li", { children: "\u2713 5,000 msgs/month" }), _jsx("li", { children: "\u2713 Advanced analytics" })] })), planName === 'pro' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2713 10 Branches" }), _jsx("li", { children: "\u2713 Unlimited Members" }), _jsx("li", { children: "\u2713 Unlimited messages" }), _jsx("li", { children: "\u2713 Premium support" })] }))] })] })] })] }), _jsx(Card, { variant: "highlight", className: "mt-8 bg-green-500/10 border border-green-500/30", children: _jsx("p", { className: "text-sm text-green-300", children: "\uD83D\uDD12 Your payment information is encrypted and processed securely by Stripe. We never store your card details." }) })] }) }));
}
export default CheckoutPage;
//# sourceMappingURL=CheckoutPage.js.map