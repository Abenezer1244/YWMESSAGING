import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createBranch, updateBranch } from '../../api/branches';
export function BranchFormModal({ isOpen, onClose, onSuccess, churchId, branch, }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: branch?.name || '',
            address: branch?.address || '',
            phone: branch?.phone || '',
            description: branch?.description || '',
        },
    });
    if (!isOpen)
        return null;
    const onSubmit = async (data) => {
        if (!data.name || !data.name.trim()) {
            toast.error('Branch name is required');
            return;
        }
        setIsSubmitting(true);
        try {
            let result;
            if (branch) {
                result = await updateBranch(branch.id, data);
                toast.success('Branch updated successfully');
            }
            else {
                result = await createBranch(churchId, data);
                toast.success('Branch created successfully');
            }
            reset();
            onSuccess(result);
            onClose();
        }
        catch (error) {
            const message = error.response?.data?.error || 'Failed to save branch';
            toast.error(message);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleClose = () => {
        reset();
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsx("div", { className: "bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-4", children: branch ? 'Edit Branch' : 'Create New Branch' }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Branch Name *" }), _jsx("input", { type: "text", ...register('name', { required: 'Branch name is required' }), placeholder: "e.g., Main Location, Downtown Campus", className: "w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none", disabled: isSubmitting }), errors.name && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.name.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Address" }), _jsx("input", { type: "text", ...register('address'), placeholder: "123 Main St, City, State", className: "w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none", disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Phone" }), _jsx("input", { type: "tel", ...register('phone'), placeholder: "(555) 123-4567", className: "w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none", disabled: isSubmitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Description" }), _jsx("textarea", { ...register('description'), placeholder: "Additional details about this branch...", rows: 3, className: "w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none", disabled: isSubmitting })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: handleClose, disabled: isSubmitting, className: "flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:bg-gray-100 dark:disabled:bg-slate-700 transition", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition", children: isSubmitting ? 'Saving...' : branch ? 'Update' : 'Create' })] })] })] }) }) }));
}
export default BranchFormModal;
//# sourceMappingURL=BranchFormModal.js.map