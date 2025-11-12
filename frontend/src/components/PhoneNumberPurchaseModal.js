import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import { searchAvailableNumbers, setupPaymentIntent, confirmPayment, purchaseNumber } from '../api/numbers';
const US_STATES = [
    { code: 'CA', name: 'California' },
    { code: 'NY', name: 'New York' },
    { code: 'TX', name: 'Texas' },
    { code: 'FL', name: 'Florida' },
    { code: 'IL', name: 'Illinois' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'OH', name: 'Ohio' },
    { code: 'GA', name: 'Georgia' },
    { code: 'MI', name: 'Michigan' },
    { code: 'NC', name: 'North Carolina' },
];
export default function PhoneNumberPurchaseModal({ isOpen, onClose, onPurchaseComplete, }) {
    const [step, setStep] = useState('search');
    const [areaCode, setAreaCode] = useState('');
    const [state, setState] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentIntentId, setPaymentIntentId] = useState(null);
    // Card form states
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [cardName, setCardName] = useState('');
    const handleSearch = async () => {
        if (!areaCode && !state) {
            toast.error('Please enter an area code or select a state');
            return;
        }
        setIsLoading(true);
        try {
            const results = await searchAvailableNumbers({
                areaCode: areaCode || undefined,
                state: state || undefined,
                quantity: 10,
            });
            if (results.length === 0) {
                toast.error('No numbers found for that search');
                setSearchResults([]);
            }
            else {
                setSearchResults(results);
                setStep('select');
            }
        }
        catch (error) {
            console.error('Search failed:', error);
            toast.error(error.message || 'Failed to search numbers');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSelectNumber = async (number) => {
        setSelectedNumber(number);
        setStep('confirm');
    };
    const handleConfirmSelection = async () => {
        if (!selectedNumber)
            return;
        setIsLoading(true);
        try {
            // Create payment intent for $4.99 setup fee
            const paymentResponse = await setupPaymentIntent(selectedNumber.phoneNumber);
            if (!paymentResponse.success || !paymentResponse.data?.paymentIntentId) {
                throw new Error('Failed to create payment intent');
            }
            setPaymentIntentId(paymentResponse.data.paymentIntentId);
            setStep('payment');
        }
        catch (error) {
            console.error('Payment intent creation failed:', error);
            toast.error(error.message || 'Failed to create payment intent');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handlePayment = async () => {
        if (!selectedNumber || !paymentIntentId)
            return;
        setIsLoading(true);
        try {
            // Validate card details
            if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
                toast.error('Please fill in all card details');
                setIsLoading(false);
                return;
            }
            toast.loading('Processing payment...');
            // Step 1: Confirm payment with card details
            const paymentConfirm = await confirmPayment(paymentIntentId, cardNumber, cardExpiry, cardCvc, cardName);
            if (!paymentConfirm.success || paymentConfirm.data?.status !== 'succeeded') {
                throw new Error('Payment confirmation failed');
            }
            // Step 2: Complete the purchase with verified payment
            const result = await purchaseNumber(selectedNumber.phoneNumber, paymentIntentId);
            if (result.success) {
                toast.success(`Successfully purchased ${selectedNumber.formattedNumber}!`);
                if (onPurchaseComplete) {
                    onPurchaseComplete(selectedNumber.phoneNumber);
                }
                // Reset form
                resetForm();
                onClose();
            }
        }
        catch (error) {
            console.error('Purchase failed:', error);
            toast.error(error.message || 'Failed to purchase number');
        }
        finally {
            setIsLoading(false);
        }
    };
    const resetForm = () => {
        setStep('search');
        setAreaCode('');
        setState('');
        setSearchResults([]);
        setSelectedNumber(null);
        setPaymentIntentId(null);
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
        setCardName('');
    };
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, type: 'tween' },
        },
    };
    return (_jsx(AnimatePresence, { children: isOpen && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 }, className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-md", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.92, y: 30 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.92, y: 30 }, transition: { duration: 0.4, ease: 'easeOut' }, className: "bg-background border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/30 p-6 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-primary/20 rounded-lg", children: _jsx(Phone, { className: "w-5 h-5 text-primary" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Buy Phone Number" }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [step === 'search' && 'Search available numbers', step === 'select' && 'Choose a number', step === 'confirm' && 'Confirm purchase'] })] })] }), _jsx(motion.button, { whileHover: { scale: 1.1 }, whileTap: { scale: 0.95 }, onClick: onClose, disabled: isLoading, className: "p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50", children: _jsx(X, { className: "w-5 h-5 text-muted-foreground" }) })] }), _jsx("div", { className: "p-6", children: _jsxs(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", children: [step === 'search' && (_jsxs(motion.div, { variants: itemVariants, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "Area Code" }), _jsx("input", { type: "text", placeholder: "e.g., 415, 212, 310", value: areaCode, onChange: (e) => setAreaCode(e.target.value), maxLength: 3, className: "w-full px-3 py-2 border border-border/50 rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "State (Optional)" }), _jsxs("select", { value: state, onChange: (e) => setState(e.target.value), className: "w-full px-3 py-2 border border-border/50 rounded-lg bg-background text-foreground focus:border-primary focus:outline-none transition-colors appearance-none", style: {
                                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'right 0.5rem center',
                                                        paddingRight: '2rem',
                                                    }, children: [_jsx("option", { value: "", children: "Select a state..." }), US_STATES.map((s) => (_jsx("option", { value: s.code, children: s.name }, s.code)))] })] }), _jsx(Button, { variant: "primary", fullWidth: true, size: "lg", onClick: handleSearch, disabled: isLoading, isLoading: isLoading, className: "bg-primary hover:bg-primary/90 text-background font-medium mt-6", children: isLoading ? 'Searching...' : 'Search Numbers' })] })), step === 'select' && (_jsxs(motion.div, { variants: itemVariants, className: "space-y-3", children: [_jsx("div", { className: "space-y-2 max-h-72 overflow-y-auto", children: searchResults.map((number) => (_jsx(motion.button, { whileHover: { scale: 1.02 }, onClick: () => handleSelectNumber(number), className: "w-full p-4 border-2 border-border/30 rounded-lg bg-muted/20 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold text-foreground text-lg", children: number.formattedNumber }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: number.region })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium text-foreground", children: ["$", number.costPerSms.toFixed(4), "/SMS"] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["$", number.costPerMinute.toFixed(4), "/min"] })] })] }) }, number.id))) }), _jsx(Button, { variant: "secondary", fullWidth: true, size: "sm", onClick: () => {
                                                setStep('search');
                                                setSearchResults([]);
                                                setSelectedNumber(null);
                                            }, className: "mt-4", children: "Back to Search" })] })), step === 'confirm' && selectedNumber && (_jsxs(motion.div, { variants: itemVariants, className: "space-y-4", children: [_jsx("div", { className: "bg-primary/10 border border-primary/20 rounded-lg p-4", children: _jsxs("div", { className: "text-center", children: [_jsx(Phone, { className: "w-8 h-8 text-primary mx-auto mb-3" }), _jsx("div", { className: "text-2xl font-bold text-foreground mb-1", children: selectedNumber.formattedNumber }), _jsx("div", { className: "text-sm text-muted-foreground", children: selectedNumber.region })] }) }), _jsxs("div", { className: "space-y-2 bg-muted/30 rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Per SMS:" }), _jsxs("span", { className: "font-medium text-foreground", children: ["$", selectedNumber.costPerSms.toFixed(4)] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Per minute:" }), _jsxs("span", { className: "font-medium text-foreground", children: ["$", selectedNumber.costPerMinute.toFixed(4)] })] }), _jsxs("div", { className: "border-t border-border/30 pt-2 mt-2 flex justify-between font-semibold", children: [_jsx("span", { className: "text-foreground", children: "One-time setup:" }), _jsx("span", { className: "text-primary", children: "$4.99" })] })] }), _jsx("div", { className: "text-xs text-muted-foreground bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3", children: "By purchasing, you agree to Telnyx's terms and will be charged the one-time setup fee. Usage charges apply separately." }), _jsxs("div", { className: "space-y-2", children: [_jsx(Button, { variant: "primary", fullWidth: true, size: "lg", onClick: handleConfirmSelection, disabled: isLoading, isLoading: isLoading, className: "bg-primary hover:bg-primary/90 text-background font-medium", children: isLoading ? 'Processing...' : 'Continue to Payment' }), _jsx(Button, { variant: "secondary", fullWidth: true, size: "sm", onClick: () => {
                                                        setStep('select');
                                                        setSelectedNumber(null);
                                                    }, disabled: isLoading, children: "Choose Different Number" })] })] })), step === 'payment' && selectedNumber && (_jsxs(motion.div, { variants: itemVariants, className: "space-y-4", children: [_jsxs("div", { className: "bg-primary/10 border border-primary/20 rounded-lg p-4", children: [_jsxs("h3", { className: "font-semibold text-foreground mb-2", children: ["Payment for ", selectedNumber.formattedNumber] }), _jsx("div", { className: "text-2xl font-bold text-primary", children: "$4.99" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "One-time setup fee" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-1", children: "Cardholder Name" }), _jsx("input", { type: "text", placeholder: "John Doe", value: cardName, onChange: (e) => setCardName(e.target.value), disabled: isLoading, className: "w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-1", children: "Card Number" }), _jsx("input", { type: "text", placeholder: "4242 4242 4242 4242", value: cardNumber, onChange: (e) => setCardNumber(e.target.value.replace(/\s/g, '')), disabled: isLoading, maxLength: 19, className: "w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 font-mono" }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Test card: 4242 4242 4242 4242" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-1", children: "Expiry (MM/YY)" }), _jsx("input", { type: "text", placeholder: "12/25", value: cardExpiry, onChange: (e) => setCardExpiry(e.target.value), disabled: isLoading, maxLength: 5, className: "w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-1", children: "CVC" }), _jsx("input", { type: "text", placeholder: "123", value: cardCvc, onChange: (e) => setCardCvc(e.target.value.replace(/\D/g, '')), disabled: isLoading, maxLength: 4, className: "w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 font-mono" })] })] })] }), _jsx("div", { className: "text-xs text-muted-foreground bg-blue-500/10 border border-blue-500/20 rounded-lg p-3", children: "\uD83D\uDD12 Payment is processed securely. Your card details are only used to process this transaction." }), _jsxs("div", { className: "space-y-2", children: [_jsx(Button, { variant: "primary", fullWidth: true, size: "lg", onClick: handlePayment, disabled: isLoading || !cardNumber || !cardExpiry || !cardCvc || !cardName, isLoading: isLoading, className: "bg-primary hover:bg-primary/90 text-background font-medium", children: isLoading ? 'Processing Payment...' : 'Complete Purchase' }), _jsx(Button, { variant: "secondary", fullWidth: true, size: "sm", onClick: () => setStep('confirm'), disabled: isLoading, children: "Back" })] })] }))] }) })] }) })) }));
}
//# sourceMappingURL=PhoneNumberPurchaseModal.js.map