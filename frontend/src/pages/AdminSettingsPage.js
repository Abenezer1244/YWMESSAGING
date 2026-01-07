import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../api/admin';
import { getCurrentNumber } from '../api/numbers';
import CoAdminPanel from '../components/admin/CoAdminPanel';
import ActivityLogsPanel from '../components/admin/ActivityLogsPanel';
import { PhoneNumberManager } from '../components/admin/PhoneNumberManager';
import PhoneNumberPurchaseModal from '../components/PhoneNumberPurchaseModal';
import { RCSSettingsPanel } from '../components/rcs';
import { SoftLayout, SoftCard, SoftButton } from '../components/SoftUI';
import Input from '../components/ui/Input';
import { MobileTabs } from '../components/responsive';
// Email validation regex (RFC 5322 simplified)
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
export function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [currentPhoneNumber, setCurrentPhoneNumber] = useState(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [isLoadingNumber, setIsLoadingNumber] = useState(false);
    const [showEIN, setShowEIN] = useState(false); // 🔒 SECURITY: EIN masking state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        // Premium 10DLC is required for all churches
        wantsPremiumDelivery: true,
        // 10DLC Brand Information
        ein: '',
        brandPhoneNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        website: '',
        entityType: 'NON_PROFIT', // Telnyx supported: NON_PROFIT, PRIVATE_CORPORATION, PUBLIC_CORPORATION, GOVERNMENT_ENTITY
        vertical: 'NGO', // NGO is the Telnyx supported value for churches/nonprofits
    });
    // Load profile on mount
    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await getProfile();
            setProfile(data);
            setFormData({
                name: data.name || '',
                email: data.email || '',
                // Premium 10DLC is required for all churches
                wantsPremiumDelivery: true,
                // 10DLC Brand Information
                ein: data.ein || '',
                brandPhoneNumber: data.brandPhoneNumber || '',
                streetAddress: data.streetAddress || '',
                city: data.city || '',
                state: data.state || '',
                postalCode: data.postalCode || '',
                website: data.website || '',
                entityType: data.entityType || 'NON_PROFIT', // Telnyx supported types only
                vertical: data.vertical || 'NGO', // Telnyx supported value for churches
            });
        }
        catch (error) {
            // Show generic error message without exposing backend details
            toast.error('Failed to load profile. Please refresh the page.');
            if (import.meta.env.DEV) {
                console.debug('Profile load error:', error);
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    // Load current phone number
    const loadPhoneNumber = async () => {
        try {
            setIsLoadingNumber(true);
            const data = await getCurrentNumber();
            setCurrentPhoneNumber(data.telnyxPhoneNumber);
        }
        catch (error) {
            // No phone number assigned yet
            setCurrentPhoneNumber(null);
        }
        finally {
            setIsLoadingNumber(false);
        }
    };
    // Load data on mount
    useEffect(() => {
        loadProfile();
        loadPhoneNumber();
    }, []);
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        // Validation - Basic Fields
        if (!formData.name.trim()) {
            toast.error('Church name is required');
            return;
        }
        if (!formData.email.trim()) {
            toast.error('Email address is required');
            return;
        }
        if (!isValidEmail(formData.email.trim())) {
            toast.error('Please enter a valid email address');
            return;
        }
        // Validation - 10DLC Fields (required for all churches)
        if (!formData.ein.trim()) {
            toast.error('EIN (Employer Identification Number) is required');
            return;
        }
        if (!/^\d+$/.test(formData.ein.trim())) {
            toast.error('EIN must contain only digits');
            return;
        }
        if (!formData.brandPhoneNumber.trim()) {
            toast.error('Brand contact phone number is required');
            return;
        }
        if (!/^\+1\d{10}$/.test(formData.brandPhoneNumber.trim())) {
            toast.error('Phone must be in format: +1XXXXXXXXXX');
            return;
        }
        if (!formData.streetAddress.trim()) {
            toast.error('Street address is required');
            return;
        }
        if (!formData.city.trim()) {
            toast.error('City is required');
            return;
        }
        if (!formData.state.trim() || formData.state.length !== 2) {
            toast.error('State must be 2-letter code (e.g., CA, NY)');
            return;
        }
        if (!formData.postalCode.trim()) {
            toast.error('Postal code is required');
            return;
        }
        if (!/^\d{5}(-\d{4})?$/.test(formData.postalCode.trim())) {
            toast.error('Postal code must be 5 digits or 5+4 format');
            return;
        }
        try {
            setIsSaving(true);
            await updateProfile({
                name: formData.name.trim(),
                email: formData.email.trim(),
                // Delivery Tier Selection
                wantsPremiumDelivery: formData.wantsPremiumDelivery,
                // 10DLC Brand Information
                ein: formData.ein.trim() || undefined,
                brandPhoneNumber: formData.brandPhoneNumber.trim() || undefined,
                streetAddress: formData.streetAddress.trim() || undefined,
                city: formData.city.trim() || undefined,
                state: formData.state.trim().toUpperCase() || undefined,
                postalCode: formData.postalCode.trim() || undefined,
                website: formData.website.trim() || undefined,
                entityType: formData.entityType,
                vertical: formData.vertical,
            });
            toast.success('Profile updated successfully');
            loadProfile();
        }
        catch (error) {
            // Show generic error message without exposing backend details
            toast.error('Failed to update profile. Please try again.');
            if (import.meta.env.DEV) {
                console.debug('Profile update error:', error);
            }
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(SoftLayout, { children: _jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Settings" }) }), _jsx("p", { className: "text-muted-foreground", children: "Manage your church account and permissions" })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.1 }, className: "mb-8", children: _jsxs(SoftCard, { children: [_jsx(MobileTabs, { tabs: [
                                            { label: 'Church Profile', value: 'profile' },
                                            { label: 'Co-Admins', value: 'coadmins' },
                                            { label: 'Phone Numbers', value: 'numbers' },
                                            { label: 'RCS Messaging', value: 'rcs' },
                                            { label: 'Activity Logs', value: 'logs' },
                                        ], value: activeTab, onChange: (value) => setActiveTab(value), variant: "auto", className: "p-0" }), _jsxs("div", { className: "p-8", children: [activeTab === 'profile' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-6", children: "Church Profile" }), isLoading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : (_jsxs("form", { onSubmit: handleSaveProfile, className: "max-w-2xl", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "mb-6", children: _jsx(Input, { label: "Church Name", type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Your church name" }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, className: "mb-6", children: _jsx(Input, { label: "Email Address", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), placeholder: "contact@church.com" }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "mb-8", children: _jsxs(SoftCard, { variant: "gradient", children: [_jsx("h3", { className: "font-semibold text-foreground mb-4", children: "10DLC Brand Information" }), _jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Required for SMS messaging approval. Fill in your church's legal information." }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "EIN (Employer Identification Number) *" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: formData.ein
                                                                                                ? showEIN
                                                                                                    ? // Show formatted: XX-XXXXXXX
                                                                                                        formData.ein.length >= 2
                                                                                                            ? `${formData.ein.slice(0, 2)}-${formData.ein.slice(2)}`
                                                                                                            : formData.ein
                                                                                                    : // Hide with clean masking: ••-•••••••
                                                                                                        formData.ein.length >= 2
                                                                                                            ? `••-${formData.ein.slice(2).replace(/./g, '•')}`
                                                                                                            : formData.ein.replace(/./g, '•')
                                                                                                : '', onChange: (e) => {
                                                                                                // Remove all non-digits and limit to 9
                                                                                                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 9);
                                                                                                setFormData({ ...formData, ein: digitsOnly });
                                                                                            }, placeholder: showEIN ? "12-3456789" : "••-•••••••", maxLength: 10, required: true, className: "w-full pl-10 pr-20 py-2.5 border border-border/40 rounded-lg bg-card/50 text-foreground font-mono text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-normal backdrop-blur-sm", style: { letterSpacing: '0.1em' } }), _jsx("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }) }), _jsx("button", { type: "button", onClick: () => setShowEIN(!showEIN), className: "absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center gap-1.5 text-foreground/70 hover:text-foreground", "aria-label": showEIN ? "Hide EIN" : "Show EIN", children: showEIN ? (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) }), _jsx("span", { children: "Hide" })] })) : (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })] }), _jsx("span", { children: "Show" })] })) })] }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5", children: [_jsx("svg", { className: "w-3.5 h-3.5 text-green-500 flex-shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }), _jsx("span", { children: "9-digit federal tax ID \u2022 AES-256 encrypted \u2022 Securely stored" })] })] }), _jsx("div", { className: "mb-6", children: _jsx(Input, { label: "Brand Contact Phone", type: "tel", value: formData.brandPhoneNumber, onChange: (e) => setFormData({ ...formData, brandPhoneNumber: e.target.value }), placeholder: "+12025551234", required: true }) }), _jsx("div", { className: "mb-6", children: _jsx(Input, { label: "Street Address", type: "text", value: formData.streetAddress, onChange: (e) => setFormData({ ...formData, streetAddress: e.target.value }), placeholder: "123 Main Street", required: true }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsx(Input, { label: "City", type: "text", value: formData.city, onChange: (e) => setFormData({ ...formData, city: e.target.value }), placeholder: "New York", required: true }), _jsx(Input, { label: "State (2-letter)", type: "text", value: formData.state, onChange: (e) => setFormData({ ...formData, state: e.target.value.toUpperCase().slice(0, 2) }), placeholder: "NY", maxLength: 2, required: true })] }), _jsx("div", { className: "mb-6", children: _jsx(Input, { label: "Postal Code", type: "text", value: formData.postalCode, onChange: (e) => setFormData({ ...formData, postalCode: e.target.value }), placeholder: "10001", required: true }) }), _jsx("div", { className: "mb-6", children: _jsx(Input, { label: "Church Website (Optional)", type: "url", value: formData.website, onChange: (e) => setFormData({ ...formData, website: e.target.value }), placeholder: "https://yourchurch.com" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "Entity Type" }), _jsxs("select", { value: formData.entityType, onChange: (e) => setFormData({ ...formData, entityType: e.target.value }), className: "w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground", children: [_jsx("option", { value: "NON_PROFIT", children: "Non-Profit (Recommended for churches)" }), _jsx("option", { value: "PRIVATE_CORPORATION", children: "Private Corporation" }), _jsx("option", { value: "PUBLIC_CORPORATION", children: "Public Corporation" }), _jsx("option", { value: "GOVERNMENT_ENTITY", children: "Government Entity" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "Industry Vertical" }), _jsxs("select", { value: formData.vertical, onChange: (e) => setFormData({ ...formData, vertical: e.target.value }), className: "w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground", children: [_jsx("option", { value: "NGO", children: "Non-Governmental Organization (NGO) - For churches" }), _jsx("option", { value: "EDUCATION", children: "Education" }), _jsx("option", { value: "HEALTHCARE", children: "Healthcare" }), _jsx("option", { value: "FINANCE", children: "Finance" })] })] })] })] }) }), profile && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "mb-6", children: _jsxs(SoftCard, { variant: "gradient", children: [_jsx("h3", { className: "font-semibold text-foreground mb-3", children: "Account Information" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("p", { children: [_jsx("span", { className: "text-muted-foreground", children: "Status:" }), ' ', _jsx("span", { className: "font-medium text-foreground", children: profile.subscriptionStatus })] }), _jsxs("p", { children: [_jsx("span", { className: "text-muted-foreground", children: "Created:" }), ' ', _jsx("span", { className: "font-medium text-foreground", children: new Date(profile.createdAt).toLocaleDateString() })] })] })] }) })), _jsx(SoftButton, { type: "submit", variant: "primary", disabled: isSaving, children: isSaving ? 'Saving...' : 'Save Changes' })] }))] })), activeTab === 'coadmins' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: _jsx(CoAdminPanel, {}) })), activeTab === 'numbers' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-6", children: "Phone Numbers" }), isLoadingNumber ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : (_jsxs("div", { className: "max-w-2xl space-y-6", children: [_jsx("div", { className: "mb-6", children: _jsx(PhoneNumberManager, { currentPhoneNumber: currentPhoneNumber, onSuccess: (phoneNumber, webhookId) => {
                                                                        setCurrentPhoneNumber(phoneNumber);
                                                                        // Don't call loadPhoneNumber() here - we already have the number from the link response
                                                                        // Calling it could overwrite the number if the API call fails
                                                                        if (phoneNumber) {
                                                                            toast.success('Phone number linked successfully!');
                                                                        }
                                                                        else {
                                                                            toast.success('Phone number deleted (30-day recovery window)');
                                                                        }
                                                                    } }) }), _jsxs(SoftCard, { variant: "gradient", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(Phone, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold text-foreground", children: "Current Phone Number" })] }), currentPhoneNumber ? (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-2xl font-bold text-primary", children: currentPhoneNumber }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Your active Telnyx phone number for receiving SMS messages and conversations." })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-muted-foreground", children: "No phone number linked yet. Link a number you've purchased from Telnyx above or buy one to start." }), _jsx(SoftButton, { variant: "primary", onClick: () => setShowPurchaseModal(true), children: "Buy Phone Number" })] }))] }), _jsxs(SoftCard, { variant: "default", children: [_jsx("h3", { className: "font-semibold text-foreground mb-3", children: "About Phone Numbers" }), _jsxs("ul", { className: "space-y-2 text-sm text-muted-foreground", children: [_jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "Each church gets one dedicated phone number for receiving member conversations" })] }), _jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "Members text your number to start conversations with your church" })] }), _jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "When you link a number, we automatically create a webhook for receiving messages" })] }), _jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "Numbers are powered by Telnyx for reliable SMS/MMS delivery" })] })] })] })] }))] })), activeTab === 'rcs' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: _jsx(RCSSettingsPanel, {}) })), activeTab === 'logs' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: _jsx(ActivityLogsPanel, {}) }))] })] }) })] }) }), _jsx(PhoneNumberPurchaseModal, { isOpen: showPurchaseModal, onClose: () => setShowPurchaseModal(false), onPurchaseComplete: (phoneNumber) => {
                    setCurrentPhoneNumber(phoneNumber);
                    setShowPurchaseModal(false);
                    toast.success('Phone number purchased successfully!');
                } })] }));
}
export default AdminSettingsPage;
//# sourceMappingURL=AdminSettingsPage.js.map