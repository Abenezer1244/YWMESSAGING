import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
const ProfileStep = ({ onNext, onBack }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        organization: '',
    });
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.organization.trim()) {
            newErrors.organization = 'Organization is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Store profile data in localStorage or state management
            localStorage.setItem('onboarding:profile', JSON.stringify(formData));
            onNext();
        }
    };
    return (_jsx(Card, { variant: "default", padding: "lg", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Set Up Your Profile" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Tell us a bit about yourself" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsx(Input, { label: "Full Name", name: "fullName", value: formData.fullName, onChange: handleChange, error: errors.fullName, placeholder: "John Doe", required: true }), _jsx(Input, { label: "Email Address", type: "email", name: "email", value: formData.email, onChange: handleChange, error: errors.email, placeholder: "you@company.com", required: true }), _jsx(Input, { label: "Organization", name: "organization", value: formData.organization, onChange: handleChange, error: errors.organization, placeholder: "Acme Corporation", required: true }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onBack, className: "flex-1 px-4 py-2.5 border border-border rounded-sm font-medium hover:bg-muted/50 transition-all", children: "Back" }), _jsx("button", { type: "submit", className: "flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-sm font-medium hover:opacity-90 transition-all", children: "Continue" })] })] })] }) }));
};
ProfileStep.displayName = 'ProfileStep';
export default ProfileStep;
//# sourceMappingURL=ProfileStep.js.map