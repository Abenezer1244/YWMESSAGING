import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPlan, cancelSubscription } from '../api/billing';
import { SoftLayout, SoftCard, SoftButton } from '../components/SoftUI';
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
        return (_jsx(SoftLayout, { children: _jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-6", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-8 h-8 text-primary" }) }) }) }));
    }
    if (!planInfo) {
        return (_jsx(SoftLayout, { children: _jsx("div", { className: "px-4 md:px-8 py-8 w-full", children: _jsxs(SoftCard, { className: "text-center py-16", children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: "Failed to Load Billing Information" }), _jsx("p", { className: "text-muted-foreground", children: "Please try refreshing the page or contact support if the issue persists." })] }) }) }));
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
        return (_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium text-foreground", children: label }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [used, " / ", isUnlimited ? '∞' : limit] })] }), !isUnlimited && (_jsx("div", { className: "w-full bg-muted-foreground/20 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${getUsageColor(percentage)}`, style: { width: `${Math.min(percentage, 100)}%` } }) })), isUnlimited && (_jsx("div", { className: "text-sm text-success-500 dark:text-success-400", children: "Unlimited" }))] }));
    };
    return (_jsx(SoftLayout, { children: _jsxs("div", { className: "px-4 md:px-8 py-8 w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Billing" }) }), _jsx("p", { className: "text-muted-foreground", children: "Manage your subscription and view usage" })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.1 }, className: "mb-8", children: _jsxs(SoftCard, { children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-6", children: "Current Plan" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs(SoftCard, { variant: "gradient", children: [_jsxs("h3", { className: "text-xl font-bold text-foreground", children: [planNameMap[planInfo.plan], " Plan"] }), _jsxs("p", { className: "text-3xl font-bold text-primary mt-2", children: ["$", planInfo.limits.price / 100, _jsx("span", { className: "text-lg text-muted-foreground", children: "/month" })] }), _jsx(SoftButton, { variant: "primary", onClick: () => navigate('/subscribe'), fullWidth: true, className: "mt-4", children: "Change Plan" }), _jsx(SoftButton, { variant: "danger", onClick: handleCancel, disabled: isCancelling, fullWidth: true, className: "mt-3", children: isCancelling ? 'Cancelling...' : 'Cancel Subscription' })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("h4", { className: "font-semibold text-foreground mb-4", children: "Features included:" }), _jsx("ul", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: planInfo.limits.features.map((feature, idx) => (_jsxs(motion.li, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: idx * 0.05 }, className: "flex items-start gap-3", children: [_jsx(Check, { className: "w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-muted-foreground", children: feature })] }, idx))) })] })] })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.2 }, className: "mb-8", children: _jsxs(SoftCard, { children: [_jsxs("h2", { className: "text-2xl font-bold text-foreground mb-6", children: ["Current Usage (", new Date().toLocaleDateString(), ")"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-foreground mb-4", children: "Organization" }), _jsx(UsageBar, { label: "Branches", used: planInfo.usage.branches, limit: planInfo.limits.branches }), _jsx(UsageBar, { label: "Co-Admins", used: planInfo.usage.coAdmins, limit: planInfo.limits.coAdmins })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-foreground mb-4", children: "Messaging" }), _jsx(UsageBar, { label: "Members", used: planInfo.usage.members, limit: planInfo.limits.members }), _jsx(UsageBar, { label: "Messages (This Month)", used: planInfo.usage.messagesThisMonth, limit: planInfo.limits.messagesPerMonth })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/40", children: [_jsxs(SoftCard, { variant: "gradient", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Remaining Branches" }), _jsx("p", { className: "text-2xl font-bold text-primary mt-2", children: planInfo.remaining.branches === 999999
                                                    ? '∞'
                                                    : planInfo.remaining.branches })] }), _jsxs(SoftCard, { variant: "gradient", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Remaining Members" }), _jsx("p", { className: "text-2xl font-bold text-green-400 mt-2", children: planInfo.remaining.members === 999999
                                                    ? '∞'
                                                    : planInfo.remaining.members })] }), _jsxs(SoftCard, { variant: "gradient", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Remaining Messages" }), _jsx("p", { className: "text-2xl font-bold text-cyan-400 mt-2", children: planInfo.remaining.messagesPerMonth === 999999
                                                    ? '∞'
                                                    : planInfo.remaining.messagesPerMonth })] }), _jsxs(SoftCard, { variant: "gradient", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Remaining Co-Admins" }), _jsx("p", { className: "text-2xl font-bold text-amber-400 mt-2", children: planInfo.remaining.coAdmins === 999999
                                                    ? '∞'
                                                    : planInfo.remaining.coAdmins })] })] })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.3 }, children: _jsxs(SoftCard, { children: [_jsx("h2", { className: "text-2xl font-bold text-foreground mb-4", children: "Billing Information" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Your subscription is billed monthly. You can manage your payment method and invoices through Stripe." }), _jsx(SoftButton, { variant: "primary", children: "Manage in Stripe" })] }) })] }) }));
}
export default BillingPage;
//# sourceMappingURL=BillingPage.js.map