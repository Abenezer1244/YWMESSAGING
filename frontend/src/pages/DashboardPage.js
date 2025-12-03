import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Loader, Activity, Send, } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useBranchStore } from '../stores/branchStore';
import { getMessageStats, getSummaryStats } from '../api/analytics';
import { getMembers } from '../api/members';
import { getGroups } from '../api/groups';
import { getCurrentNumber } from '../api/numbers';
import { getProfile } from '../api/admin';
import { SoftLayout, SoftCard, SoftStat } from '../components/SoftUI';
import { DeliveryStatusBadge } from '../components/DeliveryStatusBadge';
import TrialBanner from '../components/TrialBanner';
import { ChatWidget } from '../components/ChatWidget';
import WelcomeModal from '../components/WelcomeModal';
import PhoneNumberPurchaseModal from '../components/PhoneNumberPurchaseModal';
// Get CSS variable value and convert oklch to hex approximation
const getCSSColor = (varName) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    // Return the oklch value or fallback to hex
    if (value)
        return value;
    return '#000000';
};
// Use theme colors from CSS variables
const getThemeColors = () => {
    return [
        getCSSColor('--chart-1'), // Blue
        getCSSColor('--chart-2'), // Orange
        getCSSColor('--chart-3'), // Green
        getCSSColor('--chart-4'), // Gray
    ];
};
// Initialize with theme colors, fallback to original if CSS vars unavailable
const COLORS = ['#4A9FBF', '#FFB81C', '#98C26E', '#505050']; // Theme-based hex colors
export function DashboardPage() {
    const { user, church } = useAuthStore();
    const { branches, currentBranchId } = useBranchStore();
    const [loading, setLoading] = useState(true);
    const [totalMembers, setTotalMembers] = useState(0);
    const [totalGroups, setTotalGroups] = useState(0);
    const [messageStats, setMessageStats] = useState(null);
    const [summaryStats, setSummaryStats] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showPhoneNumberModal, setShowPhoneNumberModal] = useState(false);
    const [hasPhoneNumber, setHasPhoneNumber] = useState(false);
    const [profile, setProfile] = useState(null);
    // Check if user should see welcome modal based on auth data
    useEffect(() => {
        // Check if user has completed welcome (from API data)
        const hasCompletedWelcome = user?.welcomeCompleted;
        if (!hasCompletedWelcome && user) {
            setShowWelcome(true);
        }
    }, [user]);
    const handleWelcomeComplete = useCallback((userRole, welcomeCompleted) => {
        // Update the user in auth store to reflect completion
        if (user && church) {
            const { setAuth } = useAuthStore.getState();
            setAuth({ ...user, welcomeCompleted, userRole }, church, useAuthStore.getState().accessToken || '', useAuthStore.getState().refreshToken || '');
        }
        // Show phone number purchase modal after welcome is complete
        // if church doesn't already have a phone number
        if (!hasPhoneNumber) {
            setShowPhoneNumberModal(true);
        }
    }, [user, church, hasPhoneNumber]);
    const handlePhoneNumberPurchased = useCallback((phoneNumber) => {
        setHasPhoneNumber(true);
        toast.success('Phone number configured successfully!');
    }, []);
    // Check if church has a phone number
    useEffect(() => {
        const checkPhoneNumber = async () => {
            try {
                await getCurrentNumber();
                setHasPhoneNumber(true);
            }
            catch (error) {
                // No phone number configured yet
                setHasPhoneNumber(false);
            }
        };
        if (user) {
            checkPhoneNumber();
        }
    }, [user]);
    useEffect(() => {
        loadDashboardData();
    }, [currentBranchId]);
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            // Load church profile for delivery tier status
            try {
                const profileData = await getProfile();
                setProfile(profileData);
            }
            catch (error) {
                console.debug('Failed to load profile:', error);
            }
            if (currentBranchId) {
                const groupsData = await getGroups(currentBranchId);
                setTotalGroups(groupsData.length);
                if (groupsData.length > 0) {
                    const membersData = await getMembers(groupsData[0].id, { limit: 1 });
                    setTotalMembers(membersData.pagination.total);
                }
            }
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
    // Memoize expensive chart data transformations to prevent unnecessary recalculations
    const barChartData = useMemo(() => messageStats?.byDay
        ? messageStats.byDay.map((day) => ({
            name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
            delivered: day.delivered,
            failed: day.failed,
        }))
        : [], [messageStats?.byDay]);
    const lineChartData = useMemo(() => messageStats?.byDay
        ? messageStats.byDay.map((day, idx) => ({
            name: `Day ${idx + 1}`,
            sent: day.count,
            delivered: day.delivered,
        }))
        : [], [messageStats?.byDay]);
    const pieData = useMemo(() => [
        { name: 'Delivered', value: messageStats?.deliveredCount || 0 },
        { name: 'Failed', value: messageStats?.failedCount || 0 },
        { name: 'Pending', value: messageStats?.pendingCount || 0 },
    ], [messageStats?.deliveredCount, messageStats?.failedCount, messageStats?.pendingCount]);
    return (_jsxs(_Fragment, { children: [_jsx(SoftLayout, { children: _jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsx("div", { className: "mb-8", children: _jsx(TrialBanner, {}) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "mb-8", children: [_jsxs("h1", { className: "text-4xl font-bold text-foreground mb-2", children: ["Welcome back, ", _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: user?.firstName })] }), _jsxs("p", { className: "text-muted-foreground mb-4", children: [church?.name, " \u2022 ", new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })] }), profile && (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5, delay: 0.2 }, children: _jsx(DeliveryStatusBadge, { dlcStatus: profile.dlcStatus, deliveryRate: profile.deliveryRate, wantsPremiumDelivery: profile.wantsPremiumDelivery, variant: "badge" }) }))] }), profile?.dlcStatus === 'shared_brand' && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.3 }, className: "mb-8 border-l-4 border-green-500 bg-green-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "\uD83D\uDE80 Ready for better SMS delivery?" }), _jsx("p", { className: "text-xs text-gray-700 mt-1", children: "Upgrade to Premium 10DLC for 99% delivery rate. Visit your settings to enable it." })] }), _jsx(motion.button, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: () => window.location.hash = '#/admin/settings', className: "text-xs font-semibold text-green-700 hover:text-green-800 whitespace-nowrap ml-4", children: "Upgrade \u2192" })] }) })), loading ? (_jsx("div", { className: "flex items-center justify-center h-96", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(SoftStat, { icon: Send, label: "Messages Sent", value: totalMessagesSent.toLocaleString(), change: 12, changeType: "positive", gradient: "from-primary to-accent", index: 0 }), _jsx(SoftStat, { icon: Users, label: "Total Members", value: totalMembers.toLocaleString(), change: 8, changeType: "positive", gradient: "from-green-500 to-emerald-500", index: 1 }), _jsx(SoftStat, { icon: TrendingUp, label: "Delivery Rate", value: `${deliveryRate.toFixed(1)}%`, change: -2, changeType: "negative", gradient: "from-purple-500 to-pink-500", index: 2 }), _jsx(SoftStat, { icon: Activity, label: "Active Groups", value: totalGroupsActive.toString(), change: 5, changeType: "positive", gradient: "from-orange-500 to-red-500", index: 3 })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(SoftCard, { variant: "gradient", index: 0, children: [_jsx("h3", { className: "text-lg font-bold text-foreground mb-4", children: "Messages Overview" }), _jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Last 7 days delivery rate" }), barChartData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: barChartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(120,120,120,0.1)" }), _jsx(XAxis, { dataKey: "name", stroke: "rgba(120,120,120,0.5)" }), _jsx(YAxis, { stroke: "rgba(120,120,120,0.5)" }), _jsx(Tooltip, { contentStyle: {
                                                                        backgroundColor: 'rgba(20,20,30,0.95)',
                                                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                        borderRadius: '8px',
                                                                    } }), _jsx(Bar, { dataKey: "delivered", fill: COLORS[0], radius: [8, 8, 0, 0] }), _jsx(Bar, { dataKey: "failed", fill: COLORS[3], radius: [8, 8, 0, 0] })] }) })) : (_jsx("div", { className: "h-80 flex items-center justify-center text-muted-foreground", children: "No data available" }))] }) }), _jsx("div", { children: _jsxs(SoftCard, { variant: "gradient", index: 1, children: [_jsx("h3", { className: "text-lg font-bold text-foreground mb-4", children: "Message Status" }), _jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Distribution" }), pieData.some((d) => d.value > 0) ? (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: pieData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 100, paddingAngle: 2, dataKey: "value", children: pieData.map((_, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                                                        backgroundColor: 'rgba(20,20,30,0.95)',
                                                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                        borderRadius: '8px',
                                                                    } })] }) })) : (_jsx("div", { className: "h-80 flex items-center justify-center text-muted-foreground", children: "No data available" }))] }) })] }), _jsx("div", { className: "mb-8", children: _jsxs(SoftCard, { variant: "gradient", index: 2, children: [_jsx("h3", { className: "text-lg font-bold text-foreground mb-4", children: "Message Trends" }), _jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Sent vs Delivered over time" }), lineChartData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 350, children: _jsxs(LineChart, { data: lineChartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(120,120,120,0.1)" }), _jsx(XAxis, { dataKey: "name", stroke: "rgba(120,120,120,0.5)" }), _jsx(YAxis, { stroke: "rgba(120,120,120,0.5)" }), _jsx(Tooltip, { contentStyle: {
                                                                backgroundColor: 'rgba(20,20,30,0.95)',
                                                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                borderRadius: '8px',
                                                            } }), _jsx(Line, { type: "monotone", dataKey: "sent", stroke: COLORS[0], strokeWidth: 3, dot: { fill: COLORS[0], r: 5 } }), _jsx(Line, { type: "monotone", dataKey: "delivered", stroke: COLORS[1], strokeWidth: 3, dot: { fill: COLORS[1], r: 5 } })] }) })) : (_jsx("div", { className: "h-96 flex items-center justify-center text-muted-foreground", children: "No data available" }))] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, children: _jsxs(SoftCard, { variant: "default", index: 3, children: [_jsx("h3", { className: "text-lg font-bold text-foreground mb-6", children: "Quick Stats" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                                                    { label: 'Branches', value: totalBranches },
                                                    { label: 'Groups', value: totalGroupsActive },
                                                    { label: 'Members', value: totalMembers },
                                                    { label: 'Messages', value: totalMessagesSent },
                                                ].map((stat, idx) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: idx * 0.1 }, className: "p-4 rounded-xl bg-muted/50 border border-border/40 text-center", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-2 font-medium", children: stat.label }), _jsx("p", { className: "text-2xl font-bold text-foreground", children: stat.value })] }, idx))) })] }) })] }))] }) }), _jsx(ChatWidget, { variant: "floating", position: "bottom-right" }), _jsx(WelcomeModal, { isOpen: showWelcome, onClose: () => setShowWelcome(false), onWelcomeComplete: handleWelcomeComplete }), _jsx(PhoneNumberPurchaseModal, { isOpen: showPhoneNumberModal, onClose: () => setShowPhoneNumberModal(false), onPurchaseComplete: handlePhoneNumberPurchased })] }));
}
export default DashboardPage;
//# sourceMappingURL=DashboardPage.js.map