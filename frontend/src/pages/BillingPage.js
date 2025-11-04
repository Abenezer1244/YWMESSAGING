import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPlan, cancelSubscription } from '../api/billing';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Spinner } from '../components/ui';
export function BillingPage() {
    const navigate = useNavigate();
    const [planInfo, setPlanInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    useEffect(() => {
        const loadPlanInfo = async () => {
            try {
                setIsLoading(true);
                const info = await getPlan();
                setPlanInfo(info);
            }
            catch (error) {
                toast.error(error.message || 'Failed to load billing info');
            }
            finally {
                setIsLoading(false);
            }
        };
        loadPlanInfo();
    }, []);
    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel your subscription?')) {
            return;
        }
        try {
            setIsCancelling(true);
            await cancelSubscription();
            toast.success('Subscription cancelled');
            navigate('/dashboard');
        }
        catch (error) {
            toast.error(error.message || 'Failed to cancel subscription');
        }
        finally {
            setIsCancelling(false);
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-white dark:bg-slate-950 p-6 transition-colors duration-normal", children: _jsx("div", { className: "max-w-7xl mx-auto", children: _jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Spinner, { size: "lg", text: "Loading billing information..." }) }) }) }));
    }
    if (!planInfo) {
        return (_jsx("div", { className: "min-h-screen bg-white dark:bg-slate-950 p-6 transition-colors duration-normal", children: _jsx("div", { className: "max-w-7xl mx-auto", children: _jsxs(Card, { variant: "default", className: "text-center py-16 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-3", children: "Failed to Load Billing Information" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300", children: "Please try refreshing the page or contact support if the issue persists." })] }) }) }));
    }
    const planNameMap = {
        starter: 'Starter',
        growth: 'Growth',
        pro: 'Pro',
    };
    const getUsagePercentage = (used, limit) => {
        if (limit > 100000)
            return 0; // unlimited
        return Math.round((used / limit) * 100);
    };
    const getUsageColor = (percentage) => {
        if (percentage >= 90)
            return 'bg-danger-500';
        if (percentage >= 70)
            return 'bg-warning-500';
        return 'bg-success-500';
    };
    const UsageBar = ({ label, used, limit, }) => {
        const percentage = getUsagePercentage(used, limit);
        const isUnlimited = limit > 100000;
        return (_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium text-slate-900 dark:text-white", children: label }), _jsxs("span", { className: "text-sm text-slate-600 dark:text-slate-400", children: [used, " / ", isUnlimited ? '∞' : limit] })] }), !isUnlimited && (_jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${getUsageColor(percentage)}`, style: { width: `${Math.min(percentage, 100)}%` } }) })), isUnlimited && (_jsx("div", { className: "text-sm text-success-500 dark:text-success-400", children: "Unlimited" }))] }));
    };
    return (_jsx("div", { className: "min-h-screen bg-white dark:bg-slate-950 p-6 transition-colors duration-normal", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight", children: "\uD83D\uDCB3 Billing Settings" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300", children: "Manage your subscription and view usage" })] }), _jsxs(Card, { variant: "default", className: "mb-8 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-6", children: "Current Plan" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs(Card, { variant: "default", className: "border border-accent-500/30 bg-accent-500/10", children: [_jsxs("h3", { className: "text-xl font-bold text-slate-900 dark:text-white", children: [planNameMap[planInfo.plan], " Plan"] }), _jsxs("p", { className: "text-3xl font-bold text-accent-400 mt-2", children: ["$", planInfo.limits.price / 100, _jsx("span", { className: "text-lg text-slate-600 dark:text-slate-400", children: "/month" })] }), _jsx(Button, { variant: "primary", size: "md", onClick: () => navigate('/subscribe'), className: "mt-4 w-full", children: "Change Plan" }), _jsx(Button, { variant: "outline", size: "md", onClick: handleCancel, disabled: isCancelling, className: "mt-2 w-full", children: isCancelling ? 'Cancelling...' : 'Cancel Subscription' })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("h4", { className: "font-semibold text-slate-900 dark:text-white mb-4", children: "Features included:" }), _jsx("ul", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: planInfo.limits.features.map((feature, idx) => (_jsxs("li", { className: "flex items-start gap-3", children: [_jsx("span", { className: "text-green-400 flex-shrink-0 mt-0.5", children: "\u2713" }), _jsx("span", { className: "text-slate-700 dark:text-slate-300", children: feature })] }, idx))) })] })] })] }), _jsxs(Card, { variant: "default", className: "mb-8 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50", children: [_jsxs("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-6", children: ["Current Usage (", new Date().toLocaleDateString(), ")"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-slate-900 dark:text-white mb-4", children: "Organization" }), _jsx(UsageBar, { label: "Branches", used: planInfo.usage.branches, limit: planInfo.limits.branches }), _jsx(UsageBar, { label: "Co-Admins", used: planInfo.usage.coAdmins, limit: planInfo.limits.coAdmins })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-slate-900 dark:text-white mb-4", children: "Messaging" }), _jsx(UsageBar, { label: "Members", used: planInfo.usage.members, limit: planInfo.limits.members }), _jsx(UsageBar, { label: "Messages (This Month)", used: planInfo.usage.messagesThisMonth, limit: planInfo.limits.messagesPerMonth })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-300 dark:border-slate-700", children: [_jsxs(Card, { variant: "default", className: "border border-accent-500/30 bg-accent-500/10", children: [_jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400", children: "Remaining Branches" }), _jsx("p", { className: "text-2xl font-bold text-accent-400 mt-2", children: planInfo.remaining.branches === 999999
                                                ? '∞'
                                                : planInfo.remaining.branches })] }), _jsxs(Card, { variant: "default", className: "border border-green-500/30 bg-green-500/10", children: [_jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400", children: "Remaining Members" }), _jsx("p", { className: "text-2xl font-bold text-green-400 mt-2", children: planInfo.remaining.members === 999999
                                                ? '∞'
                                                : planInfo.remaining.members })] }), _jsxs(Card, { variant: "default", className: "border border-blue-500/30 bg-blue-500/10", children: [_jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400", children: "Remaining Messages" }), _jsx("p", { className: "text-2xl font-bold text-blue-400 mt-2", children: planInfo.remaining.messagesPerMonth === 999999
                                                ? '∞'
                                                : planInfo.remaining.messagesPerMonth })] }), _jsxs(Card, { variant: "default", className: "border border-amber-500/30 bg-amber-500/10", children: [_jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400", children: "Remaining Co-Admins" }), _jsx("p", { className: "text-2xl font-bold text-amber-400 mt-2", children: planInfo.remaining.coAdmins === 999999
                                                ? '∞'
                                                : planInfo.remaining.coAdmins })] })] })] }), _jsxs(Card, { variant: "default", className: "border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-4", children: "Billing Information" }), _jsx("p", { className: "text-slate-700 dark:text-slate-300", children: "Your subscription is billed monthly. You can manage your payment method and invoices through Stripe." }), _jsx(Button, { variant: "primary", size: "md", className: "mt-4", children: "Manage in Stripe" })] })] }) }));
}
export default BillingPage;
//# sourceMappingURL=BillingPage.js.map