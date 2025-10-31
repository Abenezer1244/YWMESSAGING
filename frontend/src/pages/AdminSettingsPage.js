import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../api/admin';
import CoAdminPanel from '../components/admin/CoAdminPanel';
import ActivityLogsPanel from '../components/admin/ActivityLogsPanel';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Spinner } from '../components/ui';
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
    // Initial load effect would go here in real implementation
    // useEffect(() => { loadProfile(); }, []);
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
    return (_jsx("div", { className: "min-h-screen bg-white dark:bg-neutral-950 p-6 transition-colors duration-normal", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-neutral-900 dark:text-white mb-2", children: "\u2699\uFE0F Admin Settings" }), _jsx("p", { className: "text-neutral-600 dark:text-neutral-400", children: "Manage your church account and permissions" })] }), _jsxs(Card, { variant: "default", className: "mb-8 border border-neutral-200 dark:border-neutral-800", children: [_jsx("div", { className: "border-b border-neutral-200 dark:border-neutral-800", children: _jsxs("div", { className: "flex", children: [_jsx("button", { onClick: () => setActiveTab('profile'), className: `flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${activeTab === 'profile'
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'}`, children: "\u26EA Church Profile" }), _jsx("button", { onClick: () => setActiveTab('coadmins'), className: `flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${activeTab === 'coadmins'
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'}`, children: "\uD83D\uDC65 Co-Admins" }), _jsx("button", { onClick: () => setActiveTab('logs'), className: `flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${activeTab === 'logs'
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'}`, children: "\uD83D\uDCCB Activity Logs" })] }) }), _jsxs("div", { className: "p-8", children: [activeTab === 'profile' && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-neutral-900 dark:text-white mb-6", children: "Church Profile" }), isLoading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg", text: "Loading profile..." }) })) : (_jsxs("form", { onSubmit: handleSaveProfile, className: "max-w-2xl", children: [_jsx(Input, { label: "\u26EA Church Name", type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Your church name", className: "mb-6" }), _jsx(Input, { label: "\uD83D\uDCE7 Email Address", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), placeholder: "contact@church.com", className: "mb-6" }), profile && (_jsxs(Card, { variant: "highlight", className: "mb-6 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800", children: [_jsx("h3", { className: "font-semibold text-neutral-900 dark:text-white mb-3", children: "Account Information" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("p", { children: [_jsx("span", { className: "text-neutral-600 dark:text-neutral-400", children: "Status:" }), ' ', _jsx("span", { className: "font-medium text-neutral-900 dark:text-white", children: profile.subscriptionStatus })] }), _jsxs("p", { children: [_jsx("span", { className: "text-neutral-600 dark:text-neutral-400", children: "Created:" }), ' ', _jsx("span", { className: "font-medium text-neutral-900 dark:text-white", children: new Date(profile.createdAt).toLocaleDateString() })] })] })] })), _jsx(Button, { type: "submit", variant: "primary", size: "md", isLoading: isSaving, disabled: isSaving, children: "\uD83D\uDCBE Save Changes" })] }))] })), activeTab === 'coadmins' && _jsx(CoAdminPanel, {}), activeTab === 'logs' && _jsx(ActivityLogsPanel, {})] })] })] }) }));
}
export default AdminSettingsPage;
//# sourceMappingURL=AdminSettingsPage.js.map