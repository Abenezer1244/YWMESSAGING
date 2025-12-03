import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * NPS Survey Component
 * Simple, non-intrusive survey widget for collecting customer feedback
 * Appears after user has been active for 5+ minutes
 */
import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea, Select, SelectItem } from '@nextui-org/react';
import { X } from 'lucide-react';
export function NPSSurvey({ onSubmit, onClose }) {
    const [score, setScore] = useState(null);
    const [category, setCategory] = useState('general');
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const submitSurvey = async () => {
        if (score === null) {
            setError('Please select a rating');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/nps/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score,
                    category,
                    feedback: feedback || undefined,
                    followupEmail: email || undefined,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to submit survey');
            }
            setSubmitted(true);
            onSubmit?.();
            // Auto-close after 2 seconds
            setTimeout(() => {
                onClose?.();
            }, 2000);
        }
        catch (err) {
            setError(err.message || 'Error submitting survey');
            setIsSubmitting(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        await submitSurvey();
    };
    if (submitted) {
        return (_jsx("div", { className: "fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4", children: _jsxs(Card, { className: "w-full max-w-md p-8 text-center", children: [_jsx("h2", { className: "text-xl font-semibold mb-2 text-gray-800", children: "Thank you for your feedback!" }), _jsx("p", { className: "text-gray-600", children: "Your response helps us improve YW Messaging." })] }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4", children: _jsxs(Card, { className: "w-full max-w-md p-6", children: [_jsx("button", { onClick: onClose, className: "absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition", "aria-label": "Close survey", children: _jsx(X, { size: 20, className: "text-gray-500" }) }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("h2", { className: "text-2xl font-bold mb-2 text-gray-800", children: "How are we doing?" }), _jsx("p", { className: "text-gray-600 text-sm mb-6", children: "Your feedback helps us improve YW Messaging" }), _jsxs("div", { className: "mb-6", children: [_jsx("p", { className: "text-sm font-medium text-gray-700 mb-3", children: "How likely are you to recommend us? (0-10)" }), _jsx("div", { className: "grid grid-cols-11 gap-1", children: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (_jsx("button", { type: "button", onClick: () => setScore(num), className: `
                    p-2 rounded font-semibold text-sm transition-all
                    ${score === num
                                            ? 'bg-blue-500 text-white scale-110'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `, children: num }, num))) }), _jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-2", children: [_jsx("span", { children: "Not likely" }), _jsx("span", { children: "Very likely" })] })] }), _jsx("div", { className: "mb-4", children: _jsxs(Select, { label: "Category", value: category, onChange: (e) => setCategory(e.target.value), size: "sm", className: "w-full", children: [_jsx(SelectItem, { children: "General feedback" }, "general"), _jsx(SelectItem, { children: "Feature request" }, "feature_request"), _jsx(SelectItem, { children: "Bug report" }, "bug"), _jsx(SelectItem, { children: "Feedback" }, "feedback"), _jsx(SelectItem, { children: "Other" }, "other")] }) }), _jsx("div", { className: "mb-4", children: _jsx(Textarea, { label: "Comments (optional)", placeholder: "Tell us what you think...", value: feedback, onValueChange: setFeedback, minRows: 3, maxRows: 5, maxLength: 1000, size: "sm" }) }), _jsx("div", { className: "mb-4", children: _jsx(Input, { type: "email", label: "Email (optional)", placeholder: "you@example.com", value: email, onValueChange: setEmail, size: "sm", description: "For follow-up communication" }) }), error && _jsx("p", { className: "text-red-500 text-sm mb-4", children: error }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "light", onPress: onClose, className: "flex-1", isDisabled: isSubmitting, children: "Skip" }), _jsx(Button, { color: "primary", onPress: () => submitSurvey(), className: "flex-1", isLoading: isSubmitting, isDisabled: score === null || isSubmitting, children: "Submit" })] })] })] }) }));
}
/**
 * Hook to manage NPS survey visibility
 */
export function useNPSSurvey() {
    const [showSurvey, setShowSurvey] = useState(false);
    useEffect(() => {
        // Check if user has already been surveyed recently
        const lastSurvey = localStorage.getItem('nps_last_survey');
        const lastSurveyTime = lastSurvey ? parseInt(lastSurvey) : 0;
        const daysSinceLastSurvey = (Date.now() - lastSurveyTime) / (1000 * 60 * 60 * 24);
        // Show survey if:
        // 1. Never surveyed before, OR
        // 2. Haven't been surveyed in 30 days
        if (daysSinceLastSurvey > 30) {
            // Wait 5 minutes of user activity before showing
            const timer = setTimeout(() => {
                setShowSurvey(true);
            }, 5 * 60 * 1000);
            return () => clearTimeout(timer);
        }
    }, []);
    const handleClose = () => {
        setShowSurvey(false);
    };
    const handleSubmit = () => {
        localStorage.setItem('nps_last_survey', Date.now().toString());
        setShowSurvey(false);
    };
    return {
        showSurvey,
        handleClose,
        handleSubmit,
    };
}
//# sourceMappingURL=NPSSurvey.js.map