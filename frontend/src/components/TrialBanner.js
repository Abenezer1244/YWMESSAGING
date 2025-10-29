import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getTrial } from '../api/billing';
export function TrialBanner() {
    const [trialStatus, setTrialStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const loadTrialStatus = async () => {
            try {
                setIsLoading(true);
                const status = await getTrial();
                setTrialStatus(status);
            }
            catch (error) {
                console.error('Failed to load trial status:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadTrialStatus();
    }, []);
    if (isLoading || !trialStatus) {
        return null;
    }
    if (!trialStatus.onTrial) {
        return null;
    }
    const daysRemaining = trialStatus.daysRemaining;
    const isExpiringSoon = daysRemaining <= 3;
    const isExpired = daysRemaining <= 0;
    let bgColor = 'bg-green-50 border-green-200';
    let textColor = 'text-green-800';
    let icon = '✓';
    if (isExpired) {
        bgColor = 'bg-red-50 border-red-200';
        textColor = 'text-red-800';
        icon = '⚠';
    }
    else if (isExpiringSoon) {
        bgColor = 'bg-yellow-50 border-yellow-200';
        textColor = 'text-yellow-800';
        icon = '!';
    }
    return (_jsx("div", { className: `${bgColor} border rounded-lg p-4 mb-6`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: `text-lg font-bold ${textColor}`, children: icon }), _jsxs("div", { children: [_jsx("h3", { className: `font-semibold ${textColor}`, children: isExpired ? 'Trial Expired' : 'Free Trial Active' }), _jsx("p", { className: `text-sm ${textColor} mt-1`, children: isExpired
                                ? 'Your trial has expired. Please subscribe to continue using the platform.'
                                : daysRemaining === 1
                                    ? 'Your trial expires tomorrow. Subscribe now to keep your account active.'
                                    : `${daysRemaining} days remaining in your trial` }), !isExpired && (_jsx("button", { onClick: () => window.location.href = '/subscribe', className: "mt-2 text-sm font-semibold hover:underline", children: "View Plans \u2192" }))] })] }) }));
}
export default TrialBanner;
//# sourceMappingURL=TrialBanner.js.map