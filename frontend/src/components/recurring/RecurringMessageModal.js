import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useGroupStore from '../../stores/groupStore';
import { createRecurringMessage, updateRecurringMessage } from '../../api/recurring';
export default function RecurringMessageModal({ message, onClose }) {
    const { groups } = useGroupStore();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        defaultValues: message
            ? {
                name: message.name,
                content: message.content,
                targetType: message.targetType === 'all' ? 'all' : 'groups',
                selectedGroupIds: message.targetIds ? JSON.parse(message.targetIds) : [],
                frequency: message.frequency,
                timeOfDay: message.timeOfDay || '09:00',
                dayOfWeek: message.dayOfWeek || 0,
            }
            : {
                name: '',
                content: '',
                targetType: 'groups',
                selectedGroupIds: [],
                frequency: 'daily',
                timeOfDay: '09:00',
                dayOfWeek: 0,
            },
    });
    const targetType = watch('targetType');
    const selectedGroupIds = watch('selectedGroupIds');
    const frequency = watch('frequency');
    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            const payload = {
                name: data.name,
                content: data.content,
                targetType: data.targetType === 'all' ? 'all' : 'groups',
                targetIds: data.targetType === 'all' ? undefined : data.selectedGroupIds,
                frequency: data.frequency,
                timeOfDay: data.timeOfDay,
                dayOfWeek: data.frequency === 'weekly' ? data.dayOfWeek : undefined,
            };
            if (message) {
                await updateRecurringMessage(message.id, payload);
                toast.success('Recurring message updated');
            }
            else {
                await createRecurringMessage(payload);
                toast.success('Recurring message created');
            }
            onClose();
        }
        catch (error) {
            toast.error(error.message || 'Failed to save recurring message');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-4", children: message ? 'Edit Recurring Message' : 'Create Recurring Message' }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Name *" }), _jsx("input", { ...register('name', { required: 'Name is required' }), type: "text", className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "e.g., Sunday Reminder" }), errors.name && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: errors.name.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Content *" }), _jsx("textarea", { ...register('content', { required: 'Content is required' }), className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", rows: 4, placeholder: "Message content..." }), errors.content && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: errors.content.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Send To *" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center gap-2 dark:text-gray-300", children: [_jsx("input", { ...register('targetType'), type: "radio", value: "groups" }), _jsx("span", { className: "text-sm", children: "Select Groups" })] }), targetType === 'groups' && (_jsx("div", { className: "ml-6 space-y-1 bg-gray-50 dark:bg-slate-700 p-2 rounded", children: groups.map((group) => (_jsxs("label", { className: "flex items-center gap-2 dark:text-gray-300", children: [_jsx("input", { type: "checkbox", value: group.id, ...register('selectedGroupIds') }), _jsx("span", { className: "text-sm", children: group.name })] }, group.id))) })), _jsxs("label", { className: "flex items-center gap-2 dark:text-gray-300", children: [_jsx("input", { ...register('targetType'), type: "radio", value: "all" }), _jsx("span", { className: "text-sm", children: "All Members" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Frequency *" }), _jsxs("select", { ...register('frequency'), className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "daily", children: "Daily" }), _jsx("option", { value: "weekly", children: "Weekly" }), _jsx("option", { value: "monthly", children: "Monthly" })] })] }), frequency === 'weekly' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Day of Week *" }), _jsxs("select", { ...register('dayOfWeek', { valueAsNumber: true }), className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: 0, children: "Sunday" }), _jsx("option", { value: 1, children: "Monday" }), _jsx("option", { value: 2, children: "Tuesday" }), _jsx("option", { value: 3, children: "Wednesday" }), _jsx("option", { value: 4, children: "Thursday" }), _jsx("option", { value: 5, children: "Friday" }), _jsx("option", { value: 6, children: "Saturday" })] })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Time of Day *" }), _jsx("input", { ...register('timeOfDay'), type: "time", className: "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition", disabled: isLoading, children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400", disabled: isLoading, children: isLoading ? 'Saving...' : 'Save' })] })] })] }) }));
}
//# sourceMappingURL=RecurringMessageModal.js.map