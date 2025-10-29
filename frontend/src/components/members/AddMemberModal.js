import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { addMember } from '../../api/members';
export function AddMemberModal({ isOpen, groupId, onClose, onSuccess }) {
    const { register, handleSubmit, reset } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            const member = await addMember(groupId, {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                email: data.email || undefined,
            });
            toast.success('Member added successfully');
            onSuccess(member);
            reset();
            onClose();
        }
        catch (error) {
            toast.error(error.message || 'Failed to add member');
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Add Member" }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "First Name *" }), _jsx("input", { type: "text", ...register('firstName', { required: true }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "John" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Last Name *" }), _jsx("input", { type: "text", ...register('lastName', { required: true }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Doe" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone Number *" }), _jsx("input", { type: "tel", ...register('phone', { required: true }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "(202) 555-0173" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Any phone format" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email (Optional)" }), _jsx("input", { type: "email", ...register('email'), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "john@example.com" })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition", disabled: isLoading, children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400", disabled: isLoading, children: isLoading ? 'Adding...' : 'Add Member' })] })] })] }) }));
}
//# sourceMappingURL=AddMemberModal.js.map