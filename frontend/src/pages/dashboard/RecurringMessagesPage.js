import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getRecurringMessages, deleteRecurringMessage, toggleRecurringMessage, } from '../../api/recurring';
import RecurringMessageModal from '../../components/recurring/RecurringMessageModal';
export function RecurringMessagesPage() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    useEffect(() => {
        loadMessages();
    }, []);
    const loadMessages = async () => {
        try {
            setIsLoading(true);
            const data = await getRecurringMessages();
            setMessages(data);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load recurring messages');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreate = () => {
        setEditingMessage(null);
        setShowModal(true);
    };
    const handleEdit = (message) => {
        setEditingMessage(message);
        setShowModal(true);
    };
    const handleDelete = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this recurring message?')) {
            return;
        }
        try {
            await deleteRecurringMessage(messageId);
            setMessages(messages.filter((m) => m.id !== messageId));
            toast.success('Recurring message deleted');
        }
        catch (error) {
            toast.error(error.message || 'Failed to delete recurring message');
        }
    };
    const handleToggle = async (messageId, currentStatus) => {
        try {
            const updated = await toggleRecurringMessage(messageId, !currentStatus);
            setMessages(messages.map((m) => (m.id === messageId ? updated : m)));
            toast.success(!currentStatus ? 'Recurring message resumed' : 'Recurring message paused');
        }
        catch (error) {
            toast.error(error.message || 'Failed to toggle recurring message');
        }
    };
    const handleModalClose = () => {
        setShowModal(false);
        setEditingMessage(null);
        loadMessages();
    };
    const formatNextSend = (nextSendAt) => {
        const date = new Date(nextSendAt);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (diffDays > 0) {
            return `in ${diffDays}d ${diffHours}h`;
        }
        else if (diffHours > 0) {
            return `in ${diffHours}h`;
        }
        else {
            return 'soon';
        }
    };
    const getFrequencyLabel = (frequency) => {
        const labels = {
            daily: 'Daily',
            weekly: 'Weekly',
            monthly: 'Monthly',
        };
        return labels[frequency] || frequency;
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Recurring Messages" }), _jsx("button", { onClick: handleCreate, className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition", children: "Create Recurring Message" })] }) }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: isLoading ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "Loading recurring messages..." }) })) : messages.length === 0 ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500 text-lg", children: "No recurring messages yet" }) })) : (_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: messages.map((message) => (_jsxs("div", { className: `bg-white rounded-lg shadow p-6 ${!message.isActive ? 'opacity-60' : ''}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: message.name }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: getFrequencyLabel(message.frequency) })] }), _jsx("button", { onClick: () => handleToggle(message.id, message.isActive), className: `px-3 py-1 rounded-full text-xs font-semibold ${message.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'}`, children: message.isActive ? 'Active' : 'Paused' })] }), _jsx("p", { className: "text-gray-700 text-sm mb-4 line-clamp-2", children: message.content }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm", children: [_jsxs("p", { className: "text-gray-700", children: [_jsx("strong", { children: "Next send:" }), " ", formatNextSend(message.nextSendAt)] }), _jsx("p", { className: "text-gray-600 text-xs mt-1", children: new Date(message.nextSendAt).toLocaleString() })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEdit(message), className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm", children: "Edit" }), _jsx("button", { onClick: () => handleDelete(message.id), className: "flex-1 px-3 py-2 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-50 transition text-sm", children: "Delete" })] })] }, message.id))) })) }), showModal && (_jsx(RecurringMessageModal, { message: editingMessage, onClose: handleModalClose }))] }));
}
export default RecurringMessagesPage;
//# sourceMappingURL=RecurringMessagesPage.js.map