import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createGroup, updateGroup } from '../../api/groups';
export function GroupFormModal({ isOpen, group, branchId, onClose, onSuccess }) {
    const { register, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            name: group?.name || '',
            description: group?.description || '',
            welcomeMessageEnabled: group?.welcomeMessageEnabled || false,
            welcomeMessageText: group?.welcomeMessageText || '',
        },
    });
    const [isLoading, setIsLoading] = useState(false);
    const welcomeEnabled = watch('welcomeMessageEnabled');
    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            if (group) {
                // Update existing group
                const updated = await updateGroup(group.id, {
                    name: data.name,
                    description: data.description || undefined,
                    welcomeMessageEnabled: data.welcomeMessageEnabled,
                    welcomeMessageText: data.welcomeMessageText || undefined,
                });
                toast.success('Group updated successfully');
                onSuccess(updated);
            }
            else {
                // Create new group
                const created = await createGroup(branchId, {
                    name: data.name,
                    description: data.description || undefined,
                    welcomeMessageEnabled: data.welcomeMessageEnabled,
                    welcomeMessageText: data.welcomeMessageText || undefined,
                });
                toast.success('Group created successfully');
                onSuccess(created);
            }
            reset();
            onClose();
        }
        catch (error) {
            toast.error(error.message || 'Failed to save group');
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: group ? 'Edit Group' : 'Create Group' }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Group Name *" }), _jsx("input", { type: "text", ...register('name', { required: true }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "e.g., Young Adults" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { ...register('description'), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Optional group description", rows: 3 })] }), _jsxs("div", { className: "space-y-3 border-t pt-4", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", ...register('welcomeMessageEnabled'), className: "w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Send welcome message when members join" })] }), welcomeEnabled && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Welcome Message" }), _jsx("textarea", { ...register('welcomeMessageText'), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Enter welcome message text", rows: 3 })] }))] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition", disabled: isLoading, children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400", disabled: isLoading, children: isLoading ? 'Saving...' : 'Save' })] })] })] }) }));
}
//# sourceMappingURL=GroupFormModal.js.map