import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useMessageStore from '../../stores/messageStore';
import { getMessageHistory } from '../../api/messages';
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
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Message History" }), _jsxs("p", { className: "text-gray-600 mt-1", children: [total, " total messages"] })] }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-4 mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Filter by Status" }), _jsxs("select", { value: statusFilter, onChange: (e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }, className: "px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "sent", children: "Sent" }), _jsx("option", { value: "failed", children: "Failed" })] })] }), isLoading ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "Loading messages..." }) })) : messages.length === 0 ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500 text-lg", children: "No messages found" }) })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Message" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Recipients" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Delivery" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Sent" })] }) }), _jsx("tbody", { className: "divide-y", children: messages.map((message) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsxs("td", { className: "px-6 py-4", children: [_jsxs("p", { className: "text-sm text-gray-900 font-medium truncate max-w-xs", children: [message.content.slice(0, 50), message.content.length > 50 ? '...' : ''] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: message.targetType === 'individual'
                                                                        ? 'Individual'
                                                                        : message.targetType === 'groups'
                                                                            ? 'Groups'
                                                                            : message.targetType === 'branches'
                                                                                ? 'Branches'
                                                                                : 'All Members' })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-900 font-medium", children: message.totalRecipients }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm", children: [_jsxs("p", { className: "text-gray-900 font-medium", children: [message.deliveredCount, "/", message.totalRecipients] }), _jsxs("p", { className: "text-gray-500 text-xs", children: [message.deliveryRate || 0, "%"] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(message.status)}`, children: message.status.charAt(0).toUpperCase() + message.status.slice(1) }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600", children: [new Date(message.createdAt).toLocaleDateString(), _jsx("br", {}), new Date(message.createdAt).toLocaleTimeString()] })] }, message.id))) })] }) }) }), pages > 1 && (_jsxs("div", { className: "mt-6 flex justify-center gap-2", children: [_jsx("button", { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50", children: "Previous" }), _jsxs("div", { className: "px-4 py-2 text-gray-700", children: ["Page ", page, " of ", pages] }), _jsx("button", { onClick: () => setPage(Math.min(pages, page + 1)), disabled: page === pages, className: "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50", children: "Next" })] }))] }))] })] }));
}
export default MessageHistoryPage;
//# sourceMappingURL=MessageHistoryPage.js.map