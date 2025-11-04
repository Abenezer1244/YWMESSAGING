import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import { getMessageStats, getBranchStats, getSummaryStats, } from '../../api/analytics';
import { SoftLayout, SoftCard } from '../../components/SoftUI';
import { themeColors } from '../../utils/themeColors';
import { designTokens } from '../../utils/designTokens';
import AnimatedBlobs from '../../components/AnimatedBlobs';
// Reusable tooltip style configuration
const tooltipStyle = {
    backgroundColor: themeColors.background.darkDim,
    border: `${designTokens.borderWidth.base} solid ${themeColors.border.darkDim}`,
    borderRadius: designTokens.borderRadius.md,
    color: themeColors.text.white,
};
export function AnalyticsPage() {
    const [messageStats, setMessageStats] = useState(null);
    const [branchStats, setBranchStats] = useState([]);
    const [summaryStats, setSummaryStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [days, setDays] = useState(30);
    useEffect(() => {
        loadAnalytics();
    }, [days]);
    const loadAnalytics = async () => {
        try {
            setIsLoading(true);
            const [msgStats, branchData, summaryData] = await Promise.all([
                getMessageStats({ days }),
                getBranchStats(),
                getSummaryStats(),
            ]);
            setMessageStats(msgStats);
            setBranchStats(branchData);
            setSummaryStats(summaryData);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load analytics');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs(SoftLayout, { children: [_jsx(AnimatedBlobs, { variant: "minimal" }), _jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "flex justify-between items-center mb-8 flex-wrap gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Analytics" }) }), _jsx("p", { className: "text-muted-foreground", children: "Track your messaging performance and engagement" })] }), _jsxs("select", { value: days, onChange: (e) => setDays(parseInt(e.target.value)), className: "px-4 py-2 border border-border/40 rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-normal backdrop-blur-sm", children: [_jsx("option", { value: 7, children: "Last 7 days" }), _jsx("option", { value: 30, children: "Last 30 days" }), _jsx("option", { value: 90, children: "Last 90 days" })] })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : (_jsxs("div", { className: "space-y-8", children: [summaryStats && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: [
                                    { label: 'Total Messages', value: summaryStats.totalMessages, color: 'text-primary' },
                                    { label: 'Delivery Rate', value: `${summaryStats.averageDeliveryRate}%`, color: 'text-green-400' },
                                    { label: 'Total Members', value: summaryStats.totalMembers, color: 'text-blue-400' },
                                    { label: 'Branches', value: summaryStats.totalBranches, color: 'text-amber-400' },
                                    { label: 'Total Groups', value: summaryStats.totalGroups, color: 'text-red-400' },
                                ].map((stat, idx) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: idx * 0.05 }, children: _jsxs(SoftCard, { variant: "gradient", className: "text-center", children: [_jsx("p", { className: "text-muted-foreground text-sm mb-2", children: stat.label }), _jsx("p", { className: `text-3xl font-bold ${stat.color}`, children: stat.value })] }) }, idx))) })), messageStats && messageStats.byDay.length > 0 && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: _jsxs(SoftCard, { children: [_jsx("h2", { className: "text-lg font-semibold text-foreground mb-4", children: "Message Volume" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: messageStats.byDay, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: themeColors.border.dark }), _jsx(XAxis, { dataKey: "date", tick: { fontSize: parseInt(designTokens.typography.fontSize.xs) }, angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, {}), _jsx(Tooltip, { contentStyle: tooltipStyle }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "count", stroke: themeColors.primary.base, name: "Messages Sent" }), _jsx(Line, { type: "monotone", dataKey: "delivered", stroke: themeColors.success.base, name: "Delivered" }), _jsx(Line, { type: "monotone", dataKey: "failed", stroke: themeColors.danger.base, name: "Failed" })] }) })] }) })), branchStats.length > 0 && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, children: _jsxs(SoftCard, { children: [_jsx("h2", { className: "text-lg font-semibold text-foreground mb-4", children: "Branch Comparison" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: branchStats, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: themeColors.border.dark }), _jsx(XAxis, { dataKey: "name", tick: { fontSize: parseInt(designTokens.typography.fontSize.xs) }, angle: -45, textAnchor: "end", height: 80 }), _jsx(YAxis, { yAxisId: "left" }), _jsx(YAxis, { yAxisId: "right", orientation: "right" }), _jsx(Tooltip, { contentStyle: tooltipStyle }), _jsx(Legend, {}), _jsx(Bar, { yAxisId: "left", dataKey: "messageCount", fill: themeColors.primary.base, name: "Messages Sent" }), _jsx(Bar, { yAxisId: "right", dataKey: "deliveryRate", fill: themeColors.success.base, name: "Delivery Rate (%)" })] }) })] }) })), branchStats.length > 0 && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: _jsxs(SoftCard, { className: "overflow-hidden", children: [_jsx("h2", { className: "text-lg font-semibold text-foreground mb-4", children: "Branch Details" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "border-b border-border/40", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Branch" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Members" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Groups" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Messages" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-foreground", children: "Delivery Rate" })] }) }), _jsx("tbody", { className: "divide-y divide-border/40", children: branchStats.map((branch, idx) => (_jsxs(motion.tr, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: idx * 0.02 }, className: "hover:bg-muted/30 transition-colors duration-normal", children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-foreground", children: branch.name }), _jsx("td", { className: "px-6 py-4 text-sm text-muted-foreground", children: branch.memberCount }), _jsx("td", { className: "px-6 py-4 text-sm text-muted-foreground", children: branch.groupCount }), _jsx("td", { className: "px-6 py-4 text-sm text-muted-foreground", children: branch.messageCount }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-32 bg-muted rounded-full h-2", children: _jsx("div", { className: "bg-green-500 h-2 rounded-full", style: {
                                                                                        width: `${branch.deliveryRate}%`,
                                                                                    } }) }), _jsxs("span", { className: "font-medium text-foreground", children: [branch.deliveryRate, "%"] })] }) })] }, branch.id))) })] }) })] }) })), messageStats && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.25 }, children: _jsxs(SoftCard, { children: [_jsx("h2", { className: "text-lg font-semibold text-foreground mb-4", children: "Message Statistics" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
                                                { label: 'Total Messages', value: messageStats.totalMessages, color: 'text-primary' },
                                                { label: 'Delivered', value: messageStats.deliveredCount, color: 'text-green-400' },
                                                { label: 'Failed', value: messageStats.failedCount, color: 'text-red-400' },
                                                { label: 'Pending', value: messageStats.pendingCount, color: 'text-amber-400' },
                                            ].map((stat, idx) => (_jsxs("div", { children: [_jsx("p", { className: "text-muted-foreground text-sm mb-1", children: stat.label }), _jsx("p", { className: `text-2xl font-bold ${stat.color}`, children: stat.value })] }, idx))) })] }) }))] }))] })] }));
}
export default AnalyticsPage;
//# sourceMappingURL=AnalyticsPage.js.map