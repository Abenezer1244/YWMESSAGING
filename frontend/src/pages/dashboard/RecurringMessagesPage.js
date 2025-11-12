import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, RefreshCw, Plus, Edit, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRecurringMessages, deleteRecurringMessage, toggleRecurringMessage, } from '../../api/recurring';
import RecurringMessageModal from '../../components/recurring/RecurringMessageModal';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
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
    return (_jsxs(SoftLayout, { children: [_jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Recurring Messages" }) }), _jsx("p", { className: "text-muted-foreground", children: "Automate regular communications" })] }), _jsx(SoftButton, { variant: "primary", size: "lg", onClick: handleCreate, icon: _jsx(Plus, { className: "w-5 h-5" }), children: "Create Recurring Message" })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: "linear" }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : messages.length === 0 ? (_jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.1 }, children: _jsxs(SoftCard, { variant: "gradient", className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx(RefreshCw, { className: "w-16 h-16 mx-auto text-muted-foreground" }) }), _jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: "No Recurring Messages Yet" }), _jsx("p", { className: "text-muted-foreground mb-6 max-w-md mx-auto", children: "Create recurring messages to automatically send messages on a regular schedule." }), _jsx(SoftButton, { variant: "primary", size: "md", onClick: handleCreate, icon: _jsx(Plus, { className: "w-4 h-4" }), children: "Create First Message" })] }) })) : (_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: messages.map((message, index) => (_jsxs(SoftCard, { index: index, className: !message.isActive ? 'opacity-75' : '', children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground", children: message.name }), _jsx("p", { className: "text-sm text-foreground/80 mt-1", children: getFrequencyLabel(message.frequency) })] }), _jsx("button", { onClick: () => handleToggle(message.id, message.isActive), className: `px-3 py-1 rounded-full text-xs font-semibold transition-colors ${message.isActive
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-muted-foreground/20 text-muted-foreground'}`, children: message.isActive ? 'Active' : 'Paused' })] }), _jsx("p", { className: "text-muted-foreground text-sm mb-4 line-clamp-2", children: message.content }), _jsxs(SoftCard, { variant: "gradient", className: "mb-4", children: [_jsxs("p", { className: "text-foreground text-sm flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsx("strong", { children: "Next send:" }), " ", formatNextSend(message.nextSendAt)] }), _jsx("p", { className: "text-muted-foreground text-xs mt-2", children: new Date(message.nextSendAt).toLocaleString() })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(SoftButton, { variant: "secondary", size: "sm", onClick: () => handleEdit(message), fullWidth: true, icon: _jsx(Edit, { className: "w-3 h-3" }), children: "Edit" }), _jsx(SoftButton, { variant: "danger", size: "sm", onClick: () => handleDelete(message.id), fullWidth: true, icon: _jsx(Trash2, { className: "w-3 h-3" }), children: "Delete" })] })] }, message.id))) }))] }), showModal && (_jsx(RecurringMessageModal, { message: editingMessage, onClose: handleModalClose }))] }));
}
export default RecurringMessagesPage;
//# sourceMappingURL=RecurringMessagesPage.js.map