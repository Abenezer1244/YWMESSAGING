import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../api/admin';
import CoAdminPanel from '../components/admin/CoAdminPanel';
import ActivityLogsPanel from '../components/admin/ActivityLogsPanel';
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
                name: data.name,
                email: data.email,
            });
        }
        catch (error) {
            toast.error(error.message || 'Failed to load profile');
        }
        finally {
            setIsLoading(false);
        }
    };
    // Initial load effect would go here in real implementation
    // useEffect(() => { loadProfile(); }, []);
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim()) {
            toast.error('Name and email are required');
            return;
        }
        try {
            setIsSaving(true);
            await updateProfile({
                name: formData.name,
                email: formData.email,
            });
            toast.success('Profile updated successfully');
            loadProfile();
        }
        catch (error) {
            toast.error(error.message || 'Failed to save profile');
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Admin Settings" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Manage your church account and permissions" })] }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs("div", { className: "bg-white rounded-lg shadow mb-8", children: [_jsx("div", { className: "border-b border-gray-200", children: _jsxs("div", { className: "flex", children: [_jsx("button", { onClick: () => setActiveTab('profile'), className: `flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${activeTab === 'profile'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-700 hover:text-gray-900'}`, children: "Church Profile" }), _jsx("button", { onClick: () => setActiveTab('coadmins'), className: `flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${activeTab === 'coadmins'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-700 hover:text-gray-900'}`, children: "Co-Admins" }), _jsx("button", { onClick: () => setActiveTab('logs'), className: `flex-1 px-4 py-4 text-center font-medium border-b-2 transition ${activeTab === 'logs'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-700 hover:text-gray-900'}`, children: "Activity Logs" })] }) }), _jsxs("div", { className: "p-8", children: [activeTab === 'profile' && (_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-6", children: "Church Profile" }), isLoading ? (_jsx("p", { className: "text-gray-500", children: "Loading profile..." })) : (_jsxs("form", { onSubmit: handleSaveProfile, className: "max-w-2xl", children: [_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Church Name" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Your church name" })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Email Address" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "contact@church.com" })] }), profile && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4 mb-6", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Account Information" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("p", { children: [_jsx("span", { className: "text-gray-600", children: "Status:" }), ' ', _jsx("span", { className: "font-medium text-gray-900", children: profile.subscriptionStatus })] }), _jsxs("p", { children: [_jsx("span", { className: "text-gray-600", children: "Created:" }), ' ', _jsx("span", { className: "font-medium text-gray-900", children: new Date(profile.createdAt).toLocaleDateString() })] })] })] })), _jsx("button", { type: "submit", disabled: isSaving, className: "bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium", children: isSaving ? 'Saving...' : 'Save Changes' })] }))] })), activeTab === 'coadmins' && _jsx(CoAdminPanel, {}), activeTab === 'logs' && _jsx(ActivityLogsPanel, {})] })] }) })] }));
}
export default AdminSettingsPage;
//# sourceMappingURL=AdminSettingsPage.js.map