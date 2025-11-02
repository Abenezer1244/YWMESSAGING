import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getRecurringMessages, deleteRecurringMessage, toggleRecurringMessage, } from '../../api/recurring';
import RecurringMessageModal from '../../components/recurring/RecurringMessageModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';
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
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 dark:from-primary-900 to-primary-100 dark:to-primary-950 p-6 transition-colors duration-normal", children: [_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-primary-900 dark:text-primary-50 mb-2", children: "\uD83D\uDD04 Recurring Messages" }), _jsx("p", { className: "text-primary-600 dark:text-primary-400", children: "Automate regular communications" })] }), _jsx(Button, { variant: "primary", size: "lg", onClick: handleCreate, children: "+ Create Recurring Message" })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Spinner, { size: "lg", text: "Loading recurring messages..." }) })) : messages.length === 0 ? (_jsxs(Card, { variant: "highlight", className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx("span", { className: "text-6xl", children: "\uD83D\uDD04" }) }), _jsx("h2", { className: "text-2xl font-bold text-primary-900 dark:text-primary-50 mb-3", children: "No Recurring Messages Yet" }), _jsx("p", { className: "text-primary-600 dark:text-primary-400 mb-6 max-w-md mx-auto", children: "Create recurring messages to automatically send messages on a regular schedule." }), _jsx(Button, { variant: "primary", size: "md", onClick: handleCreate, children: "Create First Message" })] })) : (_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: messages.map((message) => (_jsxs(Card, { variant: "default", className: `hover:shadow-lg transition-shadow ${!message.isActive ? 'opacity-75' : ''}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-primary-900 dark:text-primary-50", children: message.name }), _jsx("p", { className: "text-sm text-primary-600 dark:text-primary-400 mt-1", children: getFrequencyLabel(message.frequency) })] }), _jsx("button", { onClick: () => handleToggle(message.id, message.isActive), className: `px-3 py-1 rounded-full text-xs font-semibold transition-colors ${message.isActive
                                                ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200'
                                                : 'bg-primary-200 dark:bg-primary-700 text-primary-800 dark:text-primary-300'}`, children: message.isActive ? '✅ Active' : '⏸️ Paused' })] }), _jsx("p", { className: "text-primary-700 dark:text-primary-300 text-sm mb-4 line-clamp-2", children: message.content }), _jsxs(Card, { variant: "highlight", className: "mb-4", children: [_jsxs("p", { className: "text-primary-900 dark:text-primary-50 text-sm", children: [_jsx("strong", { children: "\u23F1\uFE0F Next send:" }), " ", formatNextSend(message.nextSendAt)] }), _jsx("p", { className: "text-primary-600 dark:text-primary-400 text-xs mt-2", children: new Date(message.nextSendAt).toLocaleString() })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "secondary", size: "sm", onClick: () => handleEdit(message), fullWidth: true, children: "Edit" }), _jsx(Button, { variant: "danger", size: "sm", onClick: () => handleDelete(message.id), fullWidth: true, children: "Delete" })] })] }, message.id))) }))] }), showModal && (_jsx(RecurringMessageModal, { message: editingMessage, onClose: handleModalClose }))] }));
}
export default RecurringMessagesPage;
//# sourceMappingURL=RecurringMessagesPage.js.map