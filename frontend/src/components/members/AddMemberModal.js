import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { addMember } from '../../api/members';
export function AddMemberModal({ isOpen, onClose, onSuccess }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            // Trim and validate form data
            const firstName = data.firstName?.trim();
            const lastName = data.lastName?.trim();
            const phone = data.phone?.trim();
            if (!firstName || !lastName || !phone) {
                toast.error('First name, last name, and phone are required');
                return;
            }
            const member = await addMember({
                firstName,
                lastName,
                phone,
                email: data.email?.trim() || undefined,
            });
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
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none", children: _jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6 pointer-events-auto", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4", children: "Add Member" }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: ["First Name * ", errors.firstName && _jsx("span", { className: "text-red-500", children: "Required" })] }), _jsx("input", { type: "text", ...register('firstName', { required: 'First name is required' }), autoComplete: "given-name", className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "John" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: ["Last Name * ", errors.lastName && _jsx("span", { className: "text-red-500", children: "Required" })] }), _jsx("input", { type: "text", ...register('lastName', { required: 'Last name is required' }), autoComplete: "family-name", className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Doe" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: ["Phone Number * ", errors.phone && _jsx("span", { className: "text-red-500", children: "Required" })] }), _jsx("input", { type: "tel", ...register('phone', { required: 'Phone is required' }), autoComplete: "tel", className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "(202) 555-0173" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Any phone format" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Email (Optional)" }), _jsx("input", { type: "email", ...register('email'), autoComplete: "email", className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "john@example.com" })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition", disabled: isLoading, children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400", disabled: isLoading, children: isLoading ? 'Adding...' : 'Add Member' })] })] })] }) }));
}
//# sourceMappingURL=AddMemberModal.js.map