import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Phone, Loader, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { linkPhoneNumber } from '../../api/admin';
import { SoftButton } from '../SoftUI';
import Input from '../ui/Input';
export function PhoneNumberManager({ currentPhoneNumber, onSuccess, }) {
    const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber || '');
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(!currentPhoneNumber);
    const [linkedPhoneNumber, setLinkedPhoneNumber] = useState(currentPhoneNumber);
    const [webhookStatus, setWebhookStatus] = useState(null);
    const handleLinkPhoneNumber = async (e) => {
        e.preventDefault();
        if (!phoneNumber.trim()) {
            toast.error('Please enter a phone number');
            return;
        }
        try {
            setIsLoading(true);
            const result = await linkPhoneNumber(phoneNumber);
            if (result.success) {
                setLinkedPhoneNumber(result.data.phoneNumber);
                setWebhookStatus(result.data.webhookId ? 'auto' : 'manual');
                setShowForm(false);
                setPhoneNumber('');
                toast.success(result.data.message);
                onSuccess?.(result.data.phoneNumber, result.data.webhookId);
            }
        }
        catch (error) {
            const errorMessage = error.message;
            toast.error(errorMessage || 'Failed to link phone number');
            setWebhookStatus(null);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [linkedPhoneNumber && !showForm && (_jsx("div", { className: "p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Check, { className: "w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: "Phone Number Linked" }), _jsx("p", { className: "text-lg font-bold text-green-500 mt-1", children: linkedPhoneNumber }), webhookStatus === 'auto' && (_jsx("p", { className: "text-xs text-green-600 mt-2", children: "\u2705 Webhook auto-created successfully" })), webhookStatus === 'manual' && (_jsx("p", { className: "text-xs text-yellow-600 mt-2", children: "\u26A0\uFE0F Please configure webhook manually in Telnyx dashboard" }))] })] }), _jsx(SoftButton, { variant: "secondary", size: "sm", onClick: () => setShowForm(true), className: "flex-shrink-0", children: "Change" })] }) })), showForm && (_jsxs("form", { onSubmit: handleLinkPhoneNumber, className: "space-y-4 p-4 bg-muted/50 rounded-lg border border-border/40", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "Telnyx Phone Number" }), _jsx(Input, { type: "tel", placeholder: "+1 (555) 123-4567", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), disabled: isLoading, autoFocus: true }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Enter the phone number you purchased from Telnyx (in any format)" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(SoftButton, { variant: "primary", type: "submit", disabled: isLoading || !phoneNumber.trim(), className: "flex-1", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader, { className: "w-4 h-4 animate-spin mr-2 inline" }), "Linking..."] })) : (_jsxs(_Fragment, { children: [_jsx(Phone, { className: "w-4 h-4 mr-2 inline" }), "Link Phone Number"] })) }), linkedPhoneNumber && (_jsx(SoftButton, { variant: "secondary", type: "button", onClick: () => {
                                    setShowForm(false);
                                    setPhoneNumber('');
                                }, disabled: isLoading, children: "Cancel" }))] }), _jsxs("div", { className: "p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" }), _jsx("p", { className: "text-xs text-blue-600", children: "When you link a phone number, we'll automatically create a webhook in your Telnyx account. Members can then start texting this number to send messages and media!" })] })] })), !showForm && linkedPhoneNumber && (_jsx("div", { className: "p-3 bg-primary/10 border border-primary/20 rounded-lg", children: _jsxs("p", { className: "text-xs text-primary/80", children: [_jsx("strong", { children: "What happens next?" }), " Your congregation can now text ", _jsx("strong", { children: linkedPhoneNumber }), " to start conversations with you. Messages and media will appear in your Conversations dashboard!"] }) }))] }));
}
//# sourceMappingURL=PhoneNumberManager.js.map