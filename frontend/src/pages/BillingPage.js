import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPlan, cancelSubscription } from '../api/billing';
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
        return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Billing Settings" }) }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "Loading billing information..." }) }) })] }));
    }
    if (!planInfo) {
        return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Billing Settings" }) }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-red-600", children: "Failed to load billing information" }) }) })] }));
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
            return 'bg-red-500';
        if (percentage >= 70)
            return 'bg-yellow-500';
        return 'bg-green-500';
    };
    const UsageBar = ({ label, used, limit, }) => {
        const percentage = getUsagePercentage(used, limit);
        const isUnlimited = limit > 100000;
        return (_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: label }), _jsxs("span", { className: "text-sm text-gray-600", children: [used, " / ", isUnlimited ? '∞' : limit] })] }), !isUnlimited && (_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${getUsageColor(percentage)}`, style: { width: `${Math.min(percentage, 100)}%` } }) })), isUnlimited && (_jsx("div", { className: "text-sm text-green-600", children: "Unlimited" }))] }));
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Billing Settings" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Manage your subscription and view usage" })] }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-8 mb-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Current Plan" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs("div", { className: "md:col-span-1 border rounded-lg p-6 bg-blue-50", children: [_jsxs("h3", { className: "text-xl font-bold text-gray-900", children: [planNameMap[planInfo.plan], " Plan"] }), _jsxs("p", { className: "text-3xl font-bold text-blue-600 mt-2", children: ["$", planInfo.limits.price / 100, _jsx("span", { className: "text-lg text-gray-600", children: "/month" })] }), _jsx("button", { onClick: () => navigate('/subscribe'), className: "mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition", children: "Change Plan" }), _jsx("button", { onClick: handleCancel, disabled: isCancelling, className: "mt-2 w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition disabled:opacity-50", children: isCancelling ? 'Cancelling...' : 'Cancel Subscription' })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-4", children: "Features included:" }), _jsx("ul", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: planInfo.limits.features.map((feature, idx) => (_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-green-500 mr-3 mt-0.5", children: "\u2713" }), _jsx("span", { className: "text-gray-700", children: feature })] }, idx))) })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-8 mb-8", children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: ["Current Usage (", new Date().toLocaleDateString(), ")"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Organization" }), _jsx(UsageBar, { label: "Branches", used: planInfo.usage.branches, limit: planInfo.limits.branches }), _jsx(UsageBar, { label: "Co-Admins", used: planInfo.usage.coAdmins, limit: planInfo.limits.coAdmins })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Messaging" }), _jsx(UsageBar, { label: "Members", used: planInfo.usage.members, limit: planInfo.limits.members }), _jsx(UsageBar, { label: "Messages (This Month)", used: planInfo.usage.messagesThisMonth, limit: planInfo.limits.messagesPerMonth })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-8 border-t", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Remaining Branches" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: planInfo.remaining.branches === 999999
                                                    ? '∞'
                                                    : planInfo.remaining.branches })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Remaining Members" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: planInfo.remaining.members === 999999
                                                    ? '∞'
                                                    : planInfo.remaining.members })] }), _jsxs("div", { className: "bg-purple-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Remaining Messages" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: planInfo.remaining.messagesPerMonth === 999999
                                                    ? '∞'
                                                    : planInfo.remaining.messagesPerMonth })] }), _jsxs("div", { className: "bg-orange-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Remaining Co-Admins" }), _jsx("p", { className: "text-2xl font-bold text-orange-600", children: planInfo.remaining.coAdmins === 999999
                                                    ? '∞'
                                                    : planInfo.remaining.coAdmins })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Billing Information" }), _jsx("p", { className: "text-gray-600", children: "Your subscription is billed monthly. You can manage your payment method and invoices through Stripe." }), _jsx("button", { className: "mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition", children: "Manage in Stripe" })] })] })] }));
}
export default BillingPage;
//# sourceMappingURL=BillingPage.js.map