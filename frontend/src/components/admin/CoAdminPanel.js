import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trash2, UserPlus, Loader } from 'lucide-react';
import { getCoAdmins, removeCoAdmin, inviteCoAdmin } from '../../api/admin';
import { SoftCard, SoftButton } from '../SoftUI';
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
        return _jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(Loader, { className: "w-6 h-6 text-primary animate-spin" }) });
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-foreground", children: "Co-Admin Management" }), _jsx(SoftButton, { variant: "primary", onClick: () => setShowInviteForm(!showInviteForm), icon: _jsx(UserPlus, { className: "w-4 h-4" }), children: showInviteForm ? 'Cancel' : 'Invite Co-Admin' })] }), showInviteForm && (_jsxs(SoftCard, { className: "mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground mb-4", children: "Invite New Co-Admin" }), _jsxs("form", { onSubmit: handleInvite, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-1", children: "First Name" }), _jsx("input", { type: "text", value: formData.firstName, onChange: (e) => setFormData({ ...formData, firstName: e.target.value }), className: "w-full px-4 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal backdrop-blur-sm", placeholder: "John", disabled: isInviting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-1", children: "Last Name" }), _jsx("input", { type: "text", value: formData.lastName, onChange: (e) => setFormData({ ...formData, lastName: e.target.value }), className: "w-full px-4 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal backdrop-blur-sm", placeholder: "Doe", disabled: isInviting })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-foreground mb-1", children: "Email" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full px-4 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal backdrop-blur-sm", placeholder: "john.doe@example.com", disabled: isInviting })] }), _jsx(SoftButton, { type: "submit", variant: "primary", fullWidth: true, disabled: isInviting, children: isInviting ? 'Inviting...' : 'Send Invite' })] })] })), inviteResult && (_jsxs(SoftCard, { variant: "gradient", className: "mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground mb-4", children: "Co-Admin Invited Successfully!" }), _jsxs("p", { className: "text-sm text-muted-foreground mb-4", children: ["Share the following credentials with ", _jsx("strong", { children: inviteResult.admin.email }), ":"] }), _jsxs(SoftCard, { className: "mb-4", children: [_jsxs("p", { className: "text-sm text-foreground mb-2", children: [_jsx("strong", { children: "Email:" }), " ", inviteResult.admin.email] }), _jsxs("p", { className: "text-sm text-foreground mb-2", children: [_jsx("strong", { children: "Temporary Password:" }), _jsx("code", { className: "ml-2 bg-muted/50 px-2 py-1 rounded font-mono text-primary", children: inviteResult.tempPassword }), _jsx("button", { onClick: () => {
                                            navigator.clipboard.writeText(inviteResult.tempPassword);
                                            toast.success('Password copied to clipboard');
                                        }, className: "ml-2 text-primary hover:text-primary/80 text-sm font-medium", children: "Copy" })] })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "They can log in with this temporary password and change it after first login." }), _jsx(SoftButton, { variant: "primary", onClick: () => setInviteResult(null), children: "Done" })] })), coAdmins.length === 0 ? (_jsxs(SoftCard, { className: "text-center py-12 mb-6", children: [_jsx("p", { className: "text-muted-foreground", children: "No co-admins yet" }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Click \"Invite Co-Admin\" to add your first co-admin" })] })) : (_jsx(SoftCard, { className: "mb-6 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "border-b border-border/40", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Added" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Last Login" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-border/40", children: coAdmins.map((admin) => (_jsxs("tr", { className: "hover:bg-muted/30 transition-colors", children: [_jsxs("td", { className: "px-6 py-4 text-sm font-medium text-foreground", children: [admin.firstName, " ", admin.lastName] }), _jsx("td", { className: "px-6 py-4 text-sm text-muted-foreground", children: admin.email }), _jsx("td", { className: "px-6 py-4 text-sm text-muted-foreground", children: new Date(admin.createdAt).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 text-sm text-muted-foreground", children: admin.lastLoginAt
                                                ? new Date(admin.lastLoginAt).toLocaleDateString()
                                                : 'Never' }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsxs("button", { onClick: () => handleRemove(admin.id), disabled: isRemoving === admin.id, className: "inline-flex items-center gap-1 text-danger hover:text-danger/80 disabled:opacity-50 font-medium", children: [_jsx(Trash2, { className: "w-4 h-4" }), isRemoving === admin.id ? 'Removing...' : 'Remove'] }) })] }, admin.id))) })] }) }) })), _jsx(SoftCard, { variant: "gradient", children: _jsxs("p", { className: "text-sm text-foreground", children: ["\u2139\uFE0F ", _jsx("strong", { children: "Tip:" }), " Co-admins can manage branches, groups, members, and messages. They cannot manage billing or other co-admins."] }) })] }));
}
export default CoAdminPanel;
//# sourceMappingURL=CoAdminPanel.js.map