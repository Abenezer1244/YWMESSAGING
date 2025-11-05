import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createTemplate, updateTemplate } from '../../api/templates';
export default function TemplateFormModal({ template, onClose }) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: template
            ? {
                name: template.name,
                content: template.content,
                category: template.category,
            }
            : {
                name: '',
                content: '',
                category: 'event',
            },
    });
    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            if (template) {
                await updateTemplate(template.id, data);
                toast.success('Template updated');
            }
            else {
                await createTemplate(data);
                toast.success('Template created');
            }
            onClose();
        }
        catch (error) {
            toast.error(error.message || 'Failed to save template');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-4", children: template ? 'Edit Template' : 'Create Template' }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Template Name" }), _jsx("input", { ...register('name', { required: 'Name is required' }), type: "text", className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "e.g., Sunday Reminder" }), errors.name && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: errors.name.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Category" }), _jsxs("select", { ...register('category', { required: 'Category is required' }), className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "service_reminder", children: "Service Reminder" }), _jsx("option", { value: "event", children: "Event" }), _jsx("option", { value: "prayer", children: "Prayer" }), _jsx("option", { value: "thank_you", children: "Thank You" }), _jsx("option", { value: "welcome", children: "Welcome" }), _jsx("option", { value: "offering", children: "Offering" })] }), errors.category && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: errors.category.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Content" }), _jsx("textarea", { ...register('content', { required: 'Content is required' }), className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", rows: 6, placeholder: "Message content..." }), errors.content && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: errors.content.message }))] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition", disabled: isLoading, children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400", disabled: isLoading, children: isLoading ? 'Saving...' : 'Save' })] })] })] }) }));
}
//# sourceMappingURL=TemplateFormModal.js.map