import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { getActivityLogs } from '../../api/admin';
import { SoftCard, SoftButton } from '../SoftUI';
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
        return _jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(Loader, { className: "w-6 h-6 text-primary animate-spin" }) });
    }
    if (!data || data.logs.length === 0) {
        return (_jsx(SoftCard, { className: "text-center py-12", children: _jsx("p", { className: "text-muted-foreground", children: "No activity logs yet" }) }));
    }
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-foreground mb-6", children: "Activity Logs" }), _jsx(SoftCard, { className: "mb-6 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "border-b border-border/40", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Action" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Details" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Admin" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Timestamp" })] }) }), _jsx("tbody", { className: "divide-y divide-border/40", children: data.logs.map((log) => (_jsxs("tr", { className: "hover:bg-muted/30 transition-colors", children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-foreground", children: log.action }), _jsx("td", { className: "px-6 py-4 text-sm text-muted-foreground", children: log.details }), _jsx("td", { className: "px-6 py-4 text-sm text-muted-foreground", children: log.adminEmail }), _jsx("td", { className: "px-6 py-4 text-sm text-muted-foreground", children: new Date(log.timestamp).toLocaleString() })] }, log.id))) })] }) }) }), data.pagination.pages > 1 && (_jsx(SoftCard, { className: "mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", (currentPage - 1) * data.pagination.limit + 1, " to", ' ', Math.min(currentPage * data.pagination.limit, data.pagination.total), " of", ' ', data.pagination.total, " logs"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(SoftButton, { variant: "secondary", size: "sm", onClick: () => setCurrentPage(Math.max(1, currentPage - 1)), disabled: currentPage === 1, icon: _jsx(ChevronLeft, { className: "w-4 h-4" }), children: "Previous" }), _jsxs("div", { className: "px-4 py-2 text-sm text-muted-foreground font-medium", children: ["Page ", currentPage, " of ", data.pagination.pages] }), _jsx(SoftButton, { variant: "secondary", size: "sm", onClick: () => setCurrentPage(Math.min(data.pagination.pages, currentPage + 1)), disabled: currentPage === data.pagination.pages, icon: _jsx(ChevronRight, { className: "w-4 h-4" }), children: "Next" })] })] }) })), _jsx(SoftCard, { variant: "gradient", children: _jsxs("p", { className: "text-sm text-foreground", children: ["\u2139\uFE0F ", _jsx("strong", { children: "Activity logs:" }), " All user actions are logged for security and compliance purposes. Logs are retained for 90 days."] }) })] }));
}
export default ActivityLogsPanel;
//# sourceMappingURL=ActivityLogsPanel.js.map