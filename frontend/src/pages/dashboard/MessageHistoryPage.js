import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, History, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMessageStore } from '../../stores/messageStore';
import { getMessageHistory } from '../../api/messages';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
export function MessageHistoryPage() {
    const { messages, setMessages, isLoading, setLoading } = useMessageStore();
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const limit = 20;
    const pages = Math.ceil(total / limit);
    useEffect(() => {
        loadMessages();
    }, [page, statusFilter]);
    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await getMessageHistory({
                page,
                limit,
                status: statusFilter || undefined,
            });
            setMessages(data.data);
            setTotal(data.pagination.total);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load messages');
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'sent':
                return 'bg-green-500/20 text-green-400';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'failed':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-slate-700/50 text-slate-300';
        }
    };
    return (_jsx(SoftLayout, { children: _jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Message History" }) }), _jsxs("p", { className: "text-muted-foreground", children: [total, " total messages"] })] }), _jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: _jsxs(SoftCard, { className: "mb-6", children: [_jsxs("label", { className: "block text-sm font-semibold text-foreground mb-3 flex items-center gap-2", children: [_jsx(Filter, { className: "w-4 h-4" }), "Filter by Status"] }), _jsxs("select", { value: statusFilter, onChange: (e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }, className: "px-4 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal backdrop-blur-sm", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "sent", children: "Sent" }), _jsx("option", { value: "failed", children: "Failed" })] })] }) }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: "linear" }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : messages.length === 0 ? (_jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.2 }, children: _jsxs(SoftCard, { variant: "gradient", className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx(History, { className: "w-16 h-16 mx-auto text-muted-foreground" }) }), _jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: "No Messages Found" }), _jsx("p", { className: "text-muted-foreground", children: "Your message history will appear here after you send messages." })] }) })) : (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, children: _jsx(SoftCard, { className: "overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "border-b border-border/40", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Message" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Recipients" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Delivery" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Sent" })] }) }), _jsx("tbody", { className: "divide-y divide-border/40", children: messages.map((message) => (_jsxs("tr", { className: "hover:bg-muted/30 transition-colors duration-normal", children: [_jsxs("td", { className: "px-6 py-4", children: [_jsxs("p", { className: "text-sm text-foreground font-medium truncate max-w-xs", children: [message.content.slice(0, 50), message.content.length > 50 ? '...' : ''] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: message.targetType === 'individual'
                                                                        ? 'Individual'
                                                                        : message.targetType === 'groups'
                                                                            ? 'Groups'
                                                                            : message.targetType === 'branches'
                                                                                ? 'Branches'
                                                                                : 'All Members' })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-foreground font-medium", children: message.totalRecipients }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm", children: [_jsxs("p", { className: "text-foreground font-medium", children: [message.deliveredCount, "/", message.totalRecipients] }), _jsxs("p", { className: "text-muted-foreground text-xs", children: [message.deliveryRate || 0, "%"] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(message.status)}`, children: message.status.charAt(0).toUpperCase() + message.status.slice(1) }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-muted-foreground", children: [new Date(message.createdAt).toLocaleDateString(), _jsx("br", {}), new Date(message.createdAt).toLocaleTimeString()] })] }, message.id))) })] }) }) }) }), pages > 1 && (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "mt-6 flex justify-center gap-2", children: [_jsx(SoftButton, { variant: "secondary", size: "md", onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, icon: _jsx(ChevronLeft, { className: "w-4 h-4" }), children: "Previous" }), _jsxs("div", { className: "px-4 py-2 text-muted-foreground font-medium", children: ["Page ", page, " of ", pages] }), _jsx(SoftButton, { variant: "secondary", size: "md", onClick: () => setPage(Math.min(pages, page + 1)), disabled: page === pages, icon: _jsx(ChevronRight, { className: "w-4 h-4" }), children: "Next" })] }))] }))] }) }));
}
export default MessageHistoryPage;
//# sourceMappingURL=MessageHistoryPage.js.map