import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import Button from './ui/Button';
export function IdleLogoutWarning({ isOpen, secondsUntilLogout, onDismiss, onLogout, }) {
    if (!isOpen)
        return null;
    const minutes = Math.floor(secondsUntilLogout / 60);
    const seconds = secondsUntilLogout % 60;
    const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-card border border-border rounded-lg shadow-xl max-w-sm w-full mx-4 p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center", children: _jsx("span", { className: "text-2xl", children: "\u23F1\uFE0F" }) }), _jsx("h2", { className: "text-xl font-bold text-foreground", children: "Session Timeout Warning" })] }), _jsx("p", { className: "text-muted-foreground mb-6", children: "You've been inactive for a while. For your security, your session will expire in:" }), _jsxs("div", { className: "bg-muted rounded-lg p-4 mb-6 text-center", children: [_jsx("div", { className: "text-4xl font-bold text-primary", children: timeString }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Move your mouse or press a key to stay logged in" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "secondary", fullWidth: true, onClick: onDismiss, className: "flex-1", children: "Stay Logged In" }), _jsx(Button, { variant: "danger", fullWidth: true, onClick: onLogout, className: "flex-1", children: "Logout Now" })] })] }) }));
}
//# sourceMappingURL=IdleLogoutWarning.js.map