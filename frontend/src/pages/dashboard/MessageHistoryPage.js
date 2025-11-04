import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useMessageStore from '../../stores/messageStore';
import { getMessageHistory } from '../../api/messages';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui';
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
    return (_jsx("div", { className: "min-h-screen bg-white dark:bg-slate-950 p-6 transition-colors duration-normal", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("div", { className: "mb-6", children: _jsx(BackButton, { variant: "ghost" }) }), _jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-slate-900 dark:text-white mb-2", children: "\uD83D\uDCDC Message History" }), _jsxs("p", { className: "text-slate-700 dark:text-slate-300", children: [total, " total messages"] })] }), _jsxs(Card, { variant: "default", className: "mb-6 bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700", children: [_jsx("label", { className: "block text-sm font-semibold text-slate-900 dark:text-white mb-3", children: "\uD83D\uDD0D Filter by Status" }), _jsxs("select", { value: statusFilter, onChange: (e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }, className: "px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 transition-colors duration-normal", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "sent", children: "Sent" }), _jsx("option", { value: "failed", children: "Failed" })] })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Spinner, { size: "lg", text: "Loading messages..." }) })) : messages.length === 0 ? (_jsxs(Card, { variant: "highlight", className: "text-center py-16 bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700", children: [_jsx("div", { className: "mb-6", children: _jsx("span", { className: "text-6xl", children: "\uD83D\uDCDC" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-3", children: "No Messages Found" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300", children: "Your message history will appear here after you send messages." })] })) : (_jsxs(_Fragment, { children: [_jsx(Card, { variant: "default", className: "overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-slate-100 dark:bg-slate-800/70 border-b border-slate-300 dark:border-slate-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white", children: "Message" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white", children: "Recipients" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white", children: "Delivery" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white", children: "Sent" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-300 dark:divide-slate-700", children: messages.map((message) => (_jsxs("tr", { className: "hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-colors duration-normal", children: [_jsxs("td", { className: "px-6 py-4", children: [_jsxs("p", { className: "text-sm text-slate-900 dark:text-white font-medium truncate max-w-xs", children: [message.content.slice(0, 50), message.content.length > 50 ? '...' : ''] }), _jsx("p", { className: "text-xs text-slate-600 dark:text-slate-400 mt-1", children: message.targetType === 'individual'
                                                                    ? 'Individual'
                                                                    : message.targetType === 'groups'
                                                                        ? 'Groups'
                                                                        : message.targetType === 'branches'
                                                                            ? 'Branches'
                                                                            : 'All Members' })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-slate-900 dark:text-white font-medium", children: message.totalRecipients }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm", children: [_jsxs("p", { className: "text-slate-900 dark:text-white font-medium", children: [message.deliveredCount, "/", message.totalRecipients] }), _jsxs("p", { className: "text-slate-600 dark:text-slate-400 text-xs", children: [message.deliveryRate || 0, "%"] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(message.status)}`, children: message.status.charAt(0).toUpperCase() + message.status.slice(1) }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400", children: [new Date(message.createdAt).toLocaleDateString(), _jsx("br", {}), new Date(message.createdAt).toLocaleTimeString()] })] }, message.id))) })] }) }) }), pages > 1 && (_jsxs("div", { className: "mt-6 flex justify-center gap-2", children: [_jsx(Button, { variant: "secondary", size: "md", onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, children: "\u2190 Previous" }), _jsxs("div", { className: "px-4 py-2 text-slate-700 dark:text-slate-300 font-medium", children: ["Page ", page, " of ", pages] }), _jsx(Button, { variant: "secondary", size: "md", onClick: () => setPage(Math.min(pages, page + 1)), disabled: page === pages, children: "Next \u2192" })] }))] }))] }) }));
}
export default MessageHistoryPage;
//# sourceMappingURL=MessageHistoryPage.js.map