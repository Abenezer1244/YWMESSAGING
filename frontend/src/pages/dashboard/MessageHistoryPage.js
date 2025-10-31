import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useMessageStore from '../../stores/messageStore';
import { getMessageHistory } from '../../api/messages';
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
                return 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200';
            case 'pending':
                return 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200';
            case 'failed':
                return 'bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200';
            default:
                return 'bg-secondary-100 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200';
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-secondary-50 dark:from-secondary-900 to-secondary-100 dark:to-secondary-950 p-6 transition-colors duration-normal", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-2", children: "\uD83D\uDCDC Message History" }), _jsxs("p", { className: "text-secondary-600 dark:text-secondary-400", children: [total, " total messages"] })] }), _jsxs(Card, { variant: "default", className: "mb-6", children: [_jsx("label", { className: "block text-sm font-semibold text-secondary-900 dark:text-secondary-50 mb-3", children: "\uD83D\uDD0D Filter by Status" }), _jsxs("select", { value: statusFilter, onChange: (e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }, className: "px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-normal", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "sent", children: "Sent" }), _jsx("option", { value: "failed", children: "Failed" })] })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Spinner, { size: "lg", text: "Loading messages..." }) })) : messages.length === 0 ? (_jsxs(Card, { variant: "highlight", className: "text-center py-16", children: [_jsx("div", { className: "mb-6", children: _jsx("span", { className: "text-6xl", children: "\uD83D\uDCDC" }) }), _jsx("h2", { className: "text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-3", children: "No Messages Found" }), _jsx("p", { className: "text-secondary-600 dark:text-secondary-400", children: "Your message history will appear here after you send messages." })] })) : (_jsxs(_Fragment, { children: [_jsx(Card, { variant: "default", className: "overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-secondary-100 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50", children: "Message" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50", children: "Recipients" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50", children: "Delivery" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50", children: "Sent" })] }) }), _jsx("tbody", { className: "divide-y divide-secondary-200 dark:divide-secondary-700", children: messages.map((message) => (_jsxs("tr", { className: "hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors duration-normal", children: [_jsxs("td", { className: "px-6 py-4", children: [_jsxs("p", { className: "text-sm text-secondary-900 dark:text-secondary-50 font-medium truncate max-w-xs", children: [message.content.slice(0, 50), message.content.length > 50 ? '...' : ''] }), _jsx("p", { className: "text-xs text-secondary-600 dark:text-secondary-400 mt-1", children: message.targetType === 'individual'
                                                                    ? 'Individual'
                                                                    : message.targetType === 'groups'
                                                                        ? 'Groups'
                                                                        : message.targetType === 'branches'
                                                                            ? 'Branches'
                                                                            : 'All Members' })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-secondary-900 dark:text-secondary-50 font-medium", children: message.totalRecipients }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm", children: [_jsxs("p", { className: "text-secondary-900 dark:text-secondary-50 font-medium", children: [message.deliveredCount, "/", message.totalRecipients] }), _jsxs("p", { className: "text-secondary-600 dark:text-secondary-400 text-xs", children: [message.deliveryRate || 0, "%"] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(message.status)}`, children: message.status.charAt(0).toUpperCase() + message.status.slice(1) }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-secondary-600 dark:text-secondary-400", children: [new Date(message.createdAt).toLocaleDateString(), _jsx("br", {}), new Date(message.createdAt).toLocaleTimeString()] })] }, message.id))) })] }) }) }), pages > 1 && (_jsxs("div", { className: "mt-6 flex justify-center gap-2", children: [_jsx(Button, { variant: "secondary", size: "md", onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, children: "\u2190 Previous" }), _jsxs("div", { className: "px-4 py-2 text-secondary-700 dark:text-secondary-300 font-medium", children: ["Page ", page, " of ", pages] }), _jsx(Button, { variant: "secondary", size: "md", onClick: () => setPage(Math.min(pages, page + 1)), disabled: page === pages, children: "Next \u2192" })] }))] }))] }) }));
}
export default MessageHistoryPage;
//# sourceMappingURL=MessageHistoryPage.js.map