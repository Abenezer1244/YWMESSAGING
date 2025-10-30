import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getCoAdmins, removeCoAdmin, inviteCoAdmin } from '../../api/admin';
export function CoAdminPanel() {
    const [coAdmins, setCoAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRemoving, setIsRemoving] = useState(null);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteResult, setInviteResult] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
    });
    useEffect(() => {
        loadCoAdmins();
    }, []);
    const loadCoAdmins = async () => {
        try {
            setIsLoading(true);
            const data = await getCoAdmins();
            setCoAdmins(data);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load co-admins');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleRemove = async (adminId) => {
        if (!confirm('Are you sure you want to remove this co-admin? They will lose access immediately.')) {
            return;
        }
        try {
            setIsRemoving(adminId);
            await removeCoAdmin(adminId);
            toast.success('Co-admin removed successfully');
            loadCoAdmins();
        }
        catch (error) {
            toast.error(error.message || 'Failed to remove co-admin');
        }
        finally {
            setIsRemoving(null);
        }
    };
    const handleInvite = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.firstName || !formData.lastName) {
            toast.error('Please fill in all fields');
            return;
        }
        try {
            setIsInviting(true);
            const result = await inviteCoAdmin({
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });
            setInviteResult(result.data);
            setFormData({ email: '', firstName: '', lastName: '' });
            toast.success('Co-admin invited successfully');
            loadCoAdmins();
        }
        catch (error) {
            toast.error(error.message || 'Failed to invite co-admin');
        }
        finally {
            setIsInviting(false);
        }
    };
    if (isLoading) {
        return _jsx("p", { className: "text-gray-500", children: "Loading co-admins..." });
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Co-Admin Management" }), _jsx("button", { onClick: () => setShowInviteForm(!showInviteForm), className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition", children: showInviteForm ? 'Cancel' : 'Invite Co-Admin' })] }), showInviteForm && (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6 mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Invite New Co-Admin" }), _jsxs("form", { onSubmit: handleInvite, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "First Name" }), _jsx("input", { type: "text", value: formData.firstName, onChange: (e) => setFormData({ ...formData, firstName: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "John", disabled: isInviting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Last Name" }), _jsx("input", { type: "text", value: formData.lastName, onChange: (e) => setFormData({ ...formData, lastName: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "Doe", disabled: isInviting })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "john.doe@example.com", disabled: isInviting })] }), _jsx("button", { type: "submit", disabled: isInviting, className: "w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition", children: isInviting ? 'Inviting...' : 'Send Invite' })] })] })), inviteResult && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-6 mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-green-900 mb-4", children: "Co-Admin Invited Successfully!" }), _jsxs("p", { className: "text-sm text-green-800 mb-4", children: ["Share the following credentials with ", _jsx("strong", { children: inviteResult.admin.email }), ":"] }), _jsxs("div", { className: "bg-white border border-green-300 rounded p-4 mb-4", children: [_jsxs("p", { className: "text-sm text-gray-700 mb-2", children: [_jsx("strong", { children: "Email:" }), " ", inviteResult.admin.email] }), _jsxs("p", { className: "text-sm text-gray-700 mb-2", children: [_jsx("strong", { children: "Temporary Password:" }), _jsx("code", { className: "ml-2 bg-gray-100 px-2 py-1 rounded font-mono text-green-700", children: inviteResult.tempPassword }), _jsx("button", { onClick: () => {
                                            navigator.clipboard.writeText(inviteResult.tempPassword);
                                            toast.success('Password copied to clipboard');
                                        }, className: "ml-2 text-blue-600 hover:text-blue-700 text-sm font-medium", children: "Copy" })] })] }), _jsx("p", { className: "text-sm text-green-700 mb-4", children: "They can log in with this temporary password and change it after first login." }), _jsx("button", { onClick: () => setInviteResult(null), className: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition", children: "Done" })] })), coAdmins.length === 0 ? (_jsxs("div", { className: "bg-gray-50 rounded-lg p-8 text-center", children: [_jsx("p", { className: "text-gray-600", children: "No co-admins yet" }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Click \"Invite Co-Admin\" to add your first co-admin" })] })) : (_jsx("div", { className: "overflow-x-auto mb-6", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Added" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Last Login" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y", children: coAdmins.map((admin) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsxs("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: [admin.firstName, " ", admin.lastName] }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: admin.email }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: new Date(admin.createdAt).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: admin.lastLoginAt
                                            ? new Date(admin.lastLoginAt).toLocaleDateString()
                                            : 'Never' }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsx("button", { onClick: () => handleRemove(admin.id), disabled: isRemoving === admin.id, className: "text-red-600 hover:text-red-700 disabled:opacity-50 font-medium", children: isRemoving === admin.id ? 'Removing...' : 'Remove' }) })] }, admin.id))) })] }) })), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-blue-800", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Tip:" }), " Co-admins can manage branches, groups, members, and messages. They cannot manage billing or other co-admins."] }) })] }));
}
export default CoAdminPanel;
//# sourceMappingURL=CoAdminPanel.js.map