import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getCoAdmins, removeCoAdmin } from '../../api/admin';
export function CoAdminPanel() {
    const [coAdmins, setCoAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRemoving, setIsRemoving] = useState(null);
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
    if (isLoading) {
        return _jsx("p", { className: "text-gray-500", children: "Loading co-admins..." });
    }
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-6", children: "Co-Admin Management" }), coAdmins.length === 0 ? (_jsxs("div", { className: "bg-gray-50 rounded-lg p-8 text-center", children: [_jsx("p", { className: "text-gray-600", children: "No co-admins yet" }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Co-admins will be listed here once you invite them" })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Added" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Last Login" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y", children: coAdmins.map((admin) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsxs("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: [admin.firstName, " ", admin.lastName] }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: admin.email }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: new Date(admin.createdAt).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: admin.lastLoginAt
                                            ? new Date(admin.lastLoginAt).toLocaleDateString()
                                            : 'Never' }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsx("button", { onClick: () => handleRemove(admin.id), disabled: isRemoving === admin.id, className: "text-red-600 hover:text-red-700 disabled:opacity-50 font-medium", children: isRemoving === admin.id ? 'Removing...' : 'Remove' }) })] }, admin.id))) })] }) })), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6", children: _jsxs("p", { className: "text-sm text-blue-800", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Tip:" }), " Co-admins can manage branches, groups, members, and messages. They cannot manage billing or other co-admins."] }) })] }));
}
export default CoAdminPanel;
//# sourceMappingURL=CoAdminPanel.js.map