import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Users, MessageSquare, TrendingUp, Loader, } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/authStore';
import useBranchStore from '../stores/branchStore';
import { getMessageStats, getSummaryStats } from '../api/analytics';
import { getMembers } from '../api/members';
import { getGroups } from '../api/groups';
import { Sidebar } from '../components/Sidebar';
import TrialBanner from '../components/TrialBanner';
import Card from '../components/ui/Card';
import { StatCard } from '../components/dashboard/StatCard';
import { FeaturedCard } from '../components/dashboard/FeaturedCard';
import { ChartCard } from '../components/dashboard/ChartCard';
export function DashboardPage() {
    const navigate = useNavigate();
    const { user, church } = useAuthStore();
    const { branches, currentBranchId } = useBranchStore();
    const [loading, setLoading] = useState(true);
    const [totalMembers, setTotalMembers] = useState(0);
    const [totalGroups, setTotalGroups] = useState(0);
    const [messageStats, setMessageStats] = useState(null);
    const [summaryStats, setSummaryStats] = useState(null);
    useEffect(() => {
        loadDashboardData();
    }, [currentBranchId]);
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            // Load members count
            if (currentBranchId) {
                const groupsData = await getGroups(currentBranchId);
                setTotalGroups(groupsData.length);
                // Try to load members from first group
                if (groupsData.length > 0) {
                    const membersData = await getMembers(groupsData[0].id, { limit: 1 });
                    setTotalMembers(membersData.pagination.total);
                }
            }
            // Load analytics
            const stats = await getSummaryStats();
            setSummaryStats(stats);
            const msgStats = await getMessageStats({ days: 7 });
            setMessageStats(msgStats);
        }
        catch (error) {
            console.error('Failed to load dashboard data:', error);
            toast.error('Failed to load dashboard data');
        }
        finally {
            setLoading(false);
        }
    };
    const totalBranches = branches.length;
    const totalMessagesSent = summaryStats?.totalMessages || 0;
    const deliveryRate = messageStats?.deliveryRate || 0;
    const totalGroupsActive = summaryStats?.totalGroups || 0;
    // Transform message stats for chart
    const barChartData = messageStats?.byDay
        ? messageStats.byDay.map((day) => ({
            name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
            delivered: day.delivered,
            failed: day.failed,
        }))
        : [];
    const lineChartData = messageStats?.byDay
        ? messageStats.byDay.map((day, idx) => ({
            name: `Day ${idx + 1}`,
            sent: day.count,
            delivered: day.delivered,
        }))
        : [];
    return (_jsxs("div", { className: "min-h-screen bg-background flex", children: [_jsx(Sidebar, {}), _jsxs("main", { className: "flex-1 md:ml-0 ml-0 pt-16 md:pt-0 px-4 md:px-8 py-8", children: [_jsx("div", { className: "mb-8", children: _jsx(TrialBanner, {}) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "mb-12", children: [_jsxs("h2", { className: "text-4xl font-bold text-foreground mb-2", children: ["Welcome back, ", _jsx("span", { className: "bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent", children: user?.firstName })] }), _jsx("p", { className: "text-lg text-muted-foreground", children: "Here's what's happening with your church today" })] }), loading ? (_jsx("div", { className: "flex items-center justify-center h-96", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12", children: [_jsx(StatCard, { icon: MessageSquare, label: "Messages Sent", value: totalMessagesSent.toLocaleString(), change: 12, changeType: "positive", bgColor: "bg-blue-500", iconColor: "text-blue-500", index: 0 }), _jsx(StatCard, { icon: Users, label: "Total Members", value: totalMembers.toLocaleString(), change: 8, changeType: "positive", bgColor: "bg-green-500", iconColor: "text-green-500", index: 1 }), _jsx(StatCard, { icon: TrendingUp, label: "Delivery Rate", value: `${deliveryRate.toFixed(1)}%`, change: -2, changeType: "negative", bgColor: "bg-purple-500", iconColor: "text-purple-500", index: 2 }), _jsx(StatCard, { icon: Zap, label: "Active Groups", value: totalGroupsActive.toString(), change: 5, changeType: "positive", bgColor: "bg-orange-500", iconColor: "text-orange-500", index: 3 })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12", children: [_jsx(FeaturedCard, { title: "Send Messages", description: "Reach your congregation instantly with personalized SMS messages. Segment by groups or broadcast to everyone.", gradient: "bg-gradient-to-br from-blue-400 to-blue-600", actionLabel: "Send Now", onAction: () => navigate('/send-message'), index: 0 }), _jsx(FeaturedCard, { title: "Manage Members", description: "Keep your member database organized. Add, update, or import members in bulk with our easy-to-use interface.", gradient: "bg-gradient-to-br from-slate-800 to-slate-900", actionLabel: "View Members", isDark: true, index: 1 })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12", children: [_jsx(ChartCard, { title: "Delivery Rate", subtitle: "Last 7 days", index: 0, children: barChartData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: barChartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(120,120,120,0.1)" }), _jsx(XAxis, { dataKey: "name", stroke: "rgba(120,120,120,0.5)" }), _jsx(YAxis, { stroke: "rgba(120,120,120,0.5)" }), _jsx(Tooltip, { contentStyle: {
                                                            backgroundColor: 'rgba(20,20,30,0.8)',
                                                            border: '1px solid rgba(120,120,120,0.2)',
                                                            borderRadius: '8px',
                                                        } }), _jsx(Bar, { dataKey: "delivered", fill: "url(#colorGradient)", radius: [8, 8, 0, 0], animationDuration: 800 }), _jsx("defs", { children: _jsxs("linearGradient", { id: "colorGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#06b6d4", stopOpacity: 0.1 })] }) })] }) })) : (_jsx("div", { className: "h-80 flex items-center justify-center text-muted-foreground", children: "No data available yet" })) }), _jsx(ChartCard, { title: "Message Trend", subtitle: "Sent vs Delivered", index: 1, children: lineChartData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: lineChartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(120,120,120,0.1)" }), _jsx(XAxis, { dataKey: "name", stroke: "rgba(120,120,120,0.5)" }), _jsx(YAxis, { stroke: "rgba(120,120,120,0.5)" }), _jsx(Tooltip, { contentStyle: {
                                                            backgroundColor: 'rgba(20,20,30,0.8)',
                                                            border: '1px solid rgba(120,120,120,0.2)',
                                                            borderRadius: '8px',
                                                        } }), _jsx(Line, { type: "monotone", dataKey: "sent", stroke: "#3b82f6", strokeWidth: 3, dot: { fill: '#3b82f6', r: 5 }, activeDot: { r: 7 } }), _jsx(Line, { type: "monotone", dataKey: "delivered", stroke: "#06b6d4", strokeWidth: 3, dot: { fill: '#06b6d4', r: 5 }, activeDot: { r: 7 } })] }) })) : (_jsx("div", { className: "h-80 flex items-center justify-center text-muted-foreground", children: "No data available yet" })) })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5, duration: 0.5 }, children: _jsxs(Card, { variant: "default", className: "border border-border bg-card", children: [_jsx("h3", { className: "text-xl font-bold text-foreground mb-6", children: "Summary" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "p-4 rounded-lg bg-muted/50", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Branches" }), _jsx("p", { className: "text-2xl font-bold text-foreground", children: totalBranches })] }), _jsxs("div", { className: "p-4 rounded-lg bg-muted/50", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Groups" }), _jsx("p", { className: "text-2xl font-bold text-foreground", children: totalGroupsActive })] }), _jsxs("div", { className: "p-4 rounded-lg bg-muted/50", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Members" }), _jsx("p", { className: "text-2xl font-bold text-foreground", children: totalMembers })] }), _jsxs("div", { className: "p-4 rounded-lg bg-muted/50", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Messages" }), _jsx("p", { className: "text-2xl font-bold text-foreground", children: totalMessagesSent })] })] })] }) })] }))] })] }));
}
export default DashboardPage;
//# sourceMappingURL=DashboardPage.js.map