import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getActivityLogs } from '../../api/admin';
export function ActivityLogsPanel() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        loadLogs();
    }, [currentPage]);
    const loadLogs = async () => {
        try {
            setIsLoading(true);
            const result = await getActivityLogs(currentPage, 50);
            setData(result);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load activity logs');
        }
        finally {
            setIsLoading(false);
        }
    };
    if (isLoading) {
        return _jsx("p", { className: "text-gray-500", children: "Loading activity logs..." });
    }
    if (!data || data.logs.length === 0) {
        return (_jsx("div", { className: "bg-gray-50 rounded-lg p-8 text-center", children: _jsx("p", { className: "text-gray-600", children: "No activity logs yet" }) }));
    }
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-6", children: "Activity Logs" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Action" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Details" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Admin" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Timestamp" })] }) }), _jsx("tbody", { className: "divide-y", children: data.logs.map((log) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: log.action }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: log.details }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: log.adminEmail }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: new Date(log.timestamp).toLocaleString() })] }, log.id))) })] }) }), data.pagination.pages > 1 && (_jsxs("div", { className: "mt-6 flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Showing ", (currentPage - 1) * data.pagination.limit + 1, " to", ' ', Math.min(currentPage * data.pagination.limit, data.pagination.total), " of", ' ', data.pagination.total, " logs"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setCurrentPage(Math.max(1, currentPage - 1)), disabled: currentPage === 1, className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: "Previous" }), _jsxs("div", { className: "px-4 py-2 border border-gray-300 rounded-lg bg-gray-50", children: ["Page ", currentPage, " of ", data.pagination.pages] }), _jsx("button", { onClick: () => setCurrentPage(Math.min(data.pagination.pages, currentPage + 1)), disabled: currentPage === data.pagination.pages, className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: "Next" })] })] })), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6", children: _jsxs("p", { className: "text-sm text-blue-800", children: ["\uD83D\uDCCB ", _jsx("strong", { children: "Activity logs:" }), " All user actions are logged for security and compliance purposes. Logs are retained for 90 days."] }) })] }));
}
export default ActivityLogsPanel;
//# sourceMappingURL=ActivityLogsPanel.js.map