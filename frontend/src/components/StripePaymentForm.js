import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import Button from './ui/Button';
const cardElementOptions = {
    style: {
        base: {
            fontSize: '14px',
            color: 'var(--foreground)',
            '::placeholder': {
                color: 'var(--muted-foreground)',
            },
            fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        invalid: {
            color: '#ff4444',
        },
    },
};
export default function StripePaymentForm({ amount, phoneNumber, paymentIntentId, onSuccess, onError, isLoading = false, }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processingPayment, setProcessingPayment] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            toast.error('Payment system not initialized');
            return;
        }
        setProcessingPayment(true);
        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('Card element not found');
            }
            // Create payment method from card element
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                // Could add name/email here if needed
                },
            });
            if (error) {
                console.error('Payment method creation failed:', error);
                toast.error(error.message || 'Failed to process card');
                onError?.(error.message || 'Failed to process card');
                setProcessingPayment(false);
                return;
            }
            if (!paymentMethod) {
                throw new Error('No payment method returned');
            }
            // Call success callback with payment method ID
            onSuccess(paymentMethod.id);
        }
        catch (error) {
            console.error('Payment form error:', error);
            const errorMessage = error.message || 'Payment processing failed';
            toast.error(errorMessage);
            onError?.(errorMessage);
        }
        finally {
            setProcessingPayment(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "bg-primary/10 border border-primary/20 rounded-lg p-4", children: [_jsxs("h3", { className: "font-semibold text-foreground mb-2", children: ["Payment for ", phoneNumber] }), _jsxs("div", { className: "text-2xl font-bold text-primary", children: ["$", (amount / 100).toFixed(2)] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "One-time setup fee" })] }), _jsx("div", { className: "space-y-3", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "Card Details" }), _jsx("div", { className: "p-3 border border-border rounded-lg bg-muted", children: _jsx(CardElement, { options: cardElementOptions }) }), _jsxs("div", { className: "mt-3 space-y-2 text-xs", children: [_jsx("p", { className: "text-muted-foreground font-semibold", children: "Test Cards:" }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded", children: [_jsx("span", { className: "font-mono text-muted-foreground", children: "4242 4242 4242 4242" }), _jsx("span", { className: "text-green-600 font-medium", children: "\u2713 Successful" })] }), _jsxs("div", { className: "flex items-center justify-between p-2 bg-red-500/10 border border-red-500/20 rounded", children: [_jsx("span", { className: "font-mono text-muted-foreground", children: "4000 0000 0000 0002" }), _jsx("span", { className: "text-red-600 font-medium", children: "\u2717 Declined" })] }), _jsxs("div", { className: "flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/20 rounded", children: [_jsx("span", { className: "font-mono text-muted-foreground", children: "4000 0000 0000 0069" }), _jsx("span", { className: "text-amber-600 font-medium", children: "\u2717 Invalid CVC" })] })] }), _jsx("p", { className: "text-muted-foreground italic pt-1", children: "Use any future date and any 3-digit CVC" })] })] }) }), _jsx("div", { className: "text-xs text-muted-foreground bg-blue-500/10 border border-blue-500/20 rounded-lg p-3", children: "\uD83D\uDD12 Payment is processed securely by Stripe. Your card details are encrypted and never stored on our servers." }), _jsx("div", { className: "space-y-2", children: _jsx(Button, { type: "submit", variant: "primary", fullWidth: true, size: "lg", disabled: !stripe || processingPayment || isLoading, isLoading: processingPayment || isLoading, className: "bg-primary hover:bg-primary/90 text-background font-medium", children: processingPayment ? 'Processing...' : 'Complete Purchase' }) })] }));
}
//# sourceMappingURL=StripePaymentForm.js.map