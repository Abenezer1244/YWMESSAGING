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
import { SoftLayout, SoftCard, SoftButton } from '../components/SoftUI';
import Input from '../components/ui/Input';
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
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        // Delivery Tier Selection
        wantsPremiumDelivery: false,
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
                // Delivery Tier Selection
                wantsPremiumDelivery: data.wantsPremiumDelivery ?? false,
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
            if (process.env.NODE_ENV === 'development') {
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
        // Validation - 10DLC Fields (only required if choosing premium delivery)
        if (formData.wantsPremiumDelivery) {
            if (!formData.ein.trim()) {
                toast.error('EIN (Employer Identification Number) is required for premium 10DLC');
                return;
            }
            if (!/^\d+$/.test(formData.ein.trim())) {
                toast.error('EIN must contain only digits');
                return;
            }
            if (!formData.brandPhoneNumber.trim()) {
                toast.error('Brand contact phone number is required for premium 10DLC');
                return;
            }
            if (!/^\+1\d{10}$/.test(formData.brandPhoneNumber.trim())) {
                toast.error('Phone must be in format: +1XXXXXXXXXX');
                return;
            }
            if (!formData.streetAddress.trim()) {
                toast.error('Street address is required for premium 10DLC');
                return;
            }
            if (!formData.city.trim()) {
                toast.error('City is required for premium 10DLC');
                return;
            }
            if (!formData.state.trim() || formData.state.length !== 2) {
                toast.error('State must be 2-letter code (e.g., CA, NY)');
                return;
            }
            if (!formData.postalCode.trim()) {
                toast.error('Postal code is required for premium 10DLC');
                return;
            }
            if (!/^\d{5}(-\d{4})?$/.test(formData.postalCode.trim())) {
                toast.error('Postal code must be 5 digits or 5+4 format');
                return;
            }
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
            if (process.env.NODE_ENV === 'development') {
                console.debug('Profile update error:', error);
            }
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(SoftLayout, { children: _jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Settings" }) }), _jsx("p", { className: "text-muted-foreground", children: "Manage your church account and permissions" })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.1 }, className: "mb-8", children: _jsxs(SoftCard, { children: [_jsx("div", { className: "border-b border-border/40", children: _jsx("div", { className: "flex flex-wrap", children: ['profile', 'coadmins', 'numbers', 'logs'].map((tab, idx) => (_jsxs(motion.button, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: idx * 0.05 }, onClick: () => setActiveTab(tab), className: `flex-1 min-w-[120px] px-4 py-4 text-center font-medium border-b-2 transition ${activeTab === tab
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: [tab === 'profile' && 'Church Profile', tab === 'coadmins' && 'Co-Admins', tab === 'numbers' && 'Phone Numbers', tab === 'logs' && 'Activity Logs'] }, tab))) }) }), _jsxs("div", { className: "p-8", children: [activeTab === 'profile' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-6", children: "Church Profile" }), isLoading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : (_jsxs("form", { onSubmit: handleSaveProfile, className: "max-w-2xl", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "mb-6", children: _jsx(Input, { label: "Church Name", type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Your church name" }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, className: "mb-6", children: _jsx(Input, { label: "Email Address", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), placeholder: "contact@church.com" }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.18 }, className: "mb-8", children: _jsxs(SoftCard, { variant: "gradient", children: [_jsx("h3", { className: "font-semibold text-foreground mb-2", children: "SMS Delivery Tier" }), _jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Choose your SMS delivery performance level. Standard is recommended for most churches. You can upgrade to Premium anytime." }), _jsx("div", { className: "mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg", children: _jsxs("p", { className: "text-xs text-blue-900", children: [_jsx("strong", { children: "\uD83D\uDCA1 Need help choosing?" }), " Standard works great for announcements and general messaging. Premium is best for time-sensitive or critical messages."] }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary cursor-pointer transition", style: { backgroundColor: !formData.wantsPremiumDelivery ? 'rgba(59, 130, 246, 0.05)' : '' }, children: [_jsx("input", { type: "radio", name: "deliveryTier", checked: !formData.wantsPremiumDelivery, onChange: () => setFormData({ ...formData, wantsPremiumDelivery: false }), className: "mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "font-medium text-foreground flex items-center gap-2", children: ["\uD83D\uDCCA Standard Delivery", _jsx("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: "Recommended" })] }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "65% delivery rate \u2022 Instant activation \u2022 No EIN required" }), _jsxs("div", { className: "text-xs text-muted-foreground mt-2 space-y-1", children: [_jsx("p", { children: "\u2713 Best for announcements, event notifications" }), _jsx("p", { children: "\u2713 No business information needed" }), _jsx("p", { children: "\u2713 Ready to use immediately" })] })] })] }), _jsxs("label", { className: "flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary cursor-pointer transition", style: { backgroundColor: formData.wantsPremiumDelivery ? 'rgba(34, 197, 94, 0.05)' : '' }, children: [_jsx("input", { type: "radio", name: "deliveryTier", checked: formData.wantsPremiumDelivery, onChange: () => setFormData({ ...formData, wantsPremiumDelivery: true }), className: "mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "font-medium text-foreground flex items-center gap-2", children: ["\uD83D\uDE80 Premium 10DLC", _jsx("span", { className: "text-xs bg-green-100 text-green-800 px-2 py-1 rounded", children: "Best Performance" })] }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "99% delivery rate \u2022 1-2 day approval \u2022 Requires EIN & business info" }), _jsxs("div", { className: "text-xs text-muted-foreground mt-2 space-y-1", children: [_jsx("p", { children: "\u2713 Best for critical or time-sensitive messages" }), _jsx("p", { children: "\u2713 Highest delivery reliability (99%)" }), _jsx("p", { children: "\u2713 Individually verified brand" })] })] })] })] }), profile?.dlcStatus && (_jsxs("div", { className: "mt-6 pt-6 border-t border-border", children: [_jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "Current Status:" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm font-medium text-foreground", children: [profile.dlcStatus === 'shared_brand' && '📊 Standard Delivery (65%)', profile.dlcStatus === 'pending' && '⏳ Awaiting Approval (99%)', profile.dlcStatus === 'approved' && '✅ Premium Active (99%)', profile.dlcStatus === 'rejected' && '❌ Failed - Contact support', !['shared_brand', 'pending', 'approved', 'rejected'].includes(profile.dlcStatus) && profile.dlcStatus] }), profile.deliveryRate && (_jsxs("span", { className: "text-xs bg-muted px-2 py-1 rounded", children: [(profile.deliveryRate * 100).toFixed(0), "% delivery"] }))] })] }))] }) }), formData.wantsPremiumDelivery && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "mb-8", children: _jsxs(SoftCard, { variant: "gradient", children: [_jsx("h3", { className: "font-semibold text-foreground mb-4", children: "10DLC Brand Information" }), _jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Required for SMS messaging approval. Fill in your church's legal information." }), _jsx("div", { className: "mb-6", children: _jsx(Input, { label: "EIN (Employer Identification Number)", type: "text", value: formData.ein, onChange: (e) => setFormData({ ...formData, ein: e.target.value }), placeholder: "123456789", required: true }) }), _jsx("div", { className: "mb-6", children: _jsx(Input, { label: "Brand Contact Phone", type: "tel", value: formData.brandPhoneNumber, onChange: (e) => setFormData({ ...formData, brandPhoneNumber: e.target.value }), placeholder: "+12025551234", required: true }) }), _jsx("div", { className: "mb-6", children: _jsx(Input, { label: "Street Address", type: "text", value: formData.streetAddress, onChange: (e) => setFormData({ ...formData, streetAddress: e.target.value }), placeholder: "123 Main Street", required: true }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsx(Input, { label: "City", type: "text", value: formData.city, onChange: (e) => setFormData({ ...formData, city: e.target.value }), placeholder: "New York", required: true }), _jsx(Input, { label: "State (2-letter)", type: "text", value: formData.state, onChange: (e) => setFormData({ ...formData, state: e.target.value.toUpperCase().slice(0, 2) }), placeholder: "NY", maxLength: 2, required: true })] }), _jsx("div", { className: "mb-6", children: _jsx(Input, { label: "Postal Code", type: "text", value: formData.postalCode, onChange: (e) => setFormData({ ...formData, postalCode: e.target.value }), placeholder: "10001", required: true }) }), _jsx("div", { className: "mb-6", children: _jsx(Input, { label: "Church Website (Optional)", type: "url", value: formData.website, onChange: (e) => setFormData({ ...formData, website: e.target.value }), placeholder: "https://yourchurch.com" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "Entity Type" }), _jsxs("select", { value: formData.entityType, onChange: (e) => setFormData({ ...formData, entityType: e.target.value }), className: "w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground", children: [_jsx("option", { value: "NON_PROFIT", children: "Non-Profit (Recommended for churches)" }), _jsx("option", { value: "PRIVATE_CORPORATION", children: "Private Corporation" }), _jsx("option", { value: "PUBLIC_CORPORATION", children: "Public Corporation" }), _jsx("option", { value: "GOVERNMENT_ENTITY", children: "Government Entity" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-2", children: "Industry Vertical" }), _jsxs("select", { value: formData.vertical, onChange: (e) => setFormData({ ...formData, vertical: e.target.value }), className: "w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground", children: [_jsx("option", { value: "NGO", children: "Non-Governmental Organization (NGO) - For churches" }), _jsx("option", { value: "EDUCATION", children: "Education" }), _jsx("option", { value: "HEALTHCARE", children: "Healthcare" }), _jsx("option", { value: "FINANCE", children: "Finance" })] })] })] })] }) })), profile && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "mb-6", children: _jsxs(SoftCard, { variant: "gradient", children: [_jsx("h3", { className: "font-semibold text-foreground mb-3", children: "Account Information" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("p", { children: [_jsx("span", { className: "text-muted-foreground", children: "Status:" }), ' ', _jsx("span", { className: "font-medium text-foreground", children: profile.subscriptionStatus })] }), _jsxs("p", { children: [_jsx("span", { className: "text-muted-foreground", children: "Created:" }), ' ', _jsx("span", { className: "font-medium text-foreground", children: new Date(profile.createdAt).toLocaleDateString() })] })] })] }) })), _jsx(SoftButton, { type: "submit", variant: "primary", disabled: isSaving, children: isSaving ? 'Saving...' : 'Save Changes' })] }))] })), activeTab === 'coadmins' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: _jsx(CoAdminPanel, {}) })), activeTab === 'numbers' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-6", children: "Phone Numbers" }), isLoadingNumber ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : (_jsxs("div", { className: "max-w-2xl space-y-6", children: [_jsx("div", { className: "mb-6", children: _jsx(PhoneNumberManager, { currentPhoneNumber: currentPhoneNumber, onSuccess: (phoneNumber, webhookId) => {
                                                                        setCurrentPhoneNumber(phoneNumber);
                                                                        loadPhoneNumber();
                                                                        if (phoneNumber) {
                                                                            toast.success('Phone number linked successfully!');
                                                                        }
                                                                        else {
                                                                            toast.success('Phone number deleted (30-day recovery window)');
                                                                        }
                                                                    } }) }), _jsxs(SoftCard, { variant: "gradient", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(Phone, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold text-foreground", children: "Current Phone Number" })] }), currentPhoneNumber ? (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-2xl font-bold text-primary", children: currentPhoneNumber }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Your active Telnyx phone number for receiving SMS messages and conversations." })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-muted-foreground", children: "No phone number linked yet. Link a number you've purchased from Telnyx above or buy one to start." }), _jsx(SoftButton, { variant: "primary", onClick: () => setShowPurchaseModal(true), children: "Buy Phone Number" })] }))] }), _jsxs(SoftCard, { variant: "default", children: [_jsx("h3", { className: "font-semibold text-foreground mb-3", children: "About Phone Numbers" }), _jsxs("ul", { className: "space-y-2 text-sm text-muted-foreground", children: [_jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "Each church gets one dedicated phone number for receiving member conversations" })] }), _jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "Members text your number to start conversations with your church" })] }), _jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "When you link a number, we automatically create a webhook for receiving messages" })] }), _jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "Numbers are powered by Telnyx for reliable SMS/MMS delivery" })] })] })] })] }))] })), activeTab === 'logs' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: _jsx(ActivityLogsPanel, {}) }))] })] }) })] }) }), _jsx(PhoneNumberPurchaseModal, { isOpen: showPurchaseModal, onClose: () => setShowPurchaseModal(false), onPurchaseComplete: (phoneNumber) => {
                    setCurrentPhoneNumber(phoneNumber);
                    setShowPurchaseModal(false);
                    toast.success('Phone number purchased successfully!');
                } })] }));
}
export default AdminSettingsPage;
//# sourceMappingURL=AdminSettingsPage.js.map