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
        // Validation
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
        try {
            setIsSaving(true);
            await updateProfile({
                name: formData.name.trim(),
                email: formData.email.trim(),
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
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: [tab === 'profile' && 'Church Profile', tab === 'coadmins' && 'Co-Admins', tab === 'numbers' && 'Phone Numbers', tab === 'logs' && 'Activity Logs'] }, tab))) }) }), _jsxs("div", { className: "p-8", children: [activeTab === 'profile' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-6", children: "Church Profile" }), isLoading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : (_jsxs("form", { onSubmit: handleSaveProfile, className: "max-w-2xl", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "mb-6", children: _jsx(Input, { label: "Church Name", type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Your church name" }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, className: "mb-6", children: _jsx(Input, { label: "Email Address", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), placeholder: "contact@church.com" }) }), profile && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "mb-6", children: _jsxs(SoftCard, { variant: "gradient", children: [_jsx("h3", { className: "font-semibold text-foreground mb-3", children: "Account Information" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("p", { children: [_jsx("span", { className: "text-muted-foreground", children: "Status:" }), ' ', _jsx("span", { className: "font-medium text-foreground", children: profile.subscriptionStatus })] }), _jsxs("p", { children: [_jsx("span", { className: "text-muted-foreground", children: "Created:" }), ' ', _jsx("span", { className: "font-medium text-foreground", children: new Date(profile.createdAt).toLocaleDateString() })] })] })] }) })), _jsx(SoftButton, { type: "submit", variant: "primary", disabled: isSaving, children: isSaving ? 'Saving...' : 'Save Changes' })] }))] })), activeTab === 'coadmins' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: _jsx(CoAdminPanel, {}) })), activeTab === 'numbers' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-6", children: "Phone Numbers" }), isLoadingNumber ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : (_jsxs("div", { className: "max-w-2xl space-y-6", children: [_jsx("div", { className: "mb-6", children: _jsx(PhoneNumberManager, { currentPhoneNumber: currentPhoneNumber, onSuccess: (phoneNumber) => {
                                                                        setCurrentPhoneNumber(phoneNumber);
                                                                        loadPhoneNumber();
                                                                        toast.success('Phone number linked successfully!');
                                                                    } }) }), _jsxs(SoftCard, { variant: "gradient", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(Phone, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold text-foreground", children: "Current Phone Number" })] }), currentPhoneNumber ? (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-2xl font-bold text-primary", children: currentPhoneNumber }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Your active Telnyx phone number for receiving SMS messages and conversations." })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-muted-foreground", children: "No phone number linked yet. Link a number you've purchased from Telnyx above or buy one to start." }), _jsx(SoftButton, { variant: "primary", onClick: () => setShowPurchaseModal(true), children: "Buy Phone Number" })] }))] }), _jsxs(SoftCard, { variant: "default", children: [_jsx("h3", { className: "font-semibold text-foreground mb-3", children: "About Phone Numbers" }), _jsxs("ul", { className: "space-y-2 text-sm text-muted-foreground", children: [_jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "Each church gets one dedicated phone number for receiving member conversations" })] }), _jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "Members text your number to start conversations with your church" })] }), _jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "When you link a number, we automatically create a webhook for receiving messages" })] }), _jsxs("li", { className: "flex gap-2", children: [_jsx("span", { className: "text-primary font-bold", children: "\u2022" }), _jsx("span", { children: "Numbers are powered by Telnyx for reliable SMS/MMS delivery" })] })] })] })] }))] })), activeTab === 'logs' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, children: _jsx(ActivityLogsPanel, {}) }))] })] }) })] }) }), _jsx(PhoneNumberPurchaseModal, { isOpen: showPurchaseModal, onClose: () => setShowPurchaseModal(false), onPurchaseComplete: (phoneNumber) => {
                    setCurrentPhoneNumber(phoneNumber);
                    setShowPurchaseModal(false);
                    toast.success('Phone number purchased successfully!');
                } })] }));
}
export default AdminSettingsPage;
//# sourceMappingURL=AdminSettingsPage.js.map