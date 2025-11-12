import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, GitBranch, Users, MessageSquare, History, FileText, Clock, BarChart3, CreditCard, Settings, Menu, X, ChevronRight, LogOut, Zap, } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useBranchStore from '../../stores/branchStore';
export function SoftSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, church } = useAuthStore();
    const { currentBranchId } = useBranchStore();
    const [isOpen, setIsOpen] = useState(true);
    const [expandedItem, setExpandedItem] = useState(null);
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    const navigationItems = [
        {
            label: 'Dashboard',
            icon: _jsx(LayoutDashboard, { className: "w-5 h-5" }),
            path: '/dashboard',
        },
        {
            label: 'Branches',
            icon: _jsx(GitBranch, { className: "w-5 h-5" }),
            path: '/branches',
        },
        {
            label: 'Groups',
            icon: _jsx(Users, { className: "w-5 h-5" }),
            path: `/branches/${currentBranchId}/groups`,
            conditional: true,
        },
        {
            label: 'Members',
            icon: _jsx(Users, { className: "w-5 h-5" }),
            path: '/members',
            conditional: true,
        },
        {
            label: 'Messaging',
            icon: _jsx(MessageSquare, { className: "w-5 h-5" }),
            path: '#',
            subItems: [
                {
                    label: 'Send Message',
                    icon: _jsx(MessageSquare, { className: "w-4 h-4" }),
                    path: '/send-message',
                },
                {
                    label: 'History',
                    icon: _jsx(History, { className: "w-4 h-4" }),
                    path: '/message-history',
                },
                {
                    label: 'Templates',
                    icon: _jsx(FileText, { className: "w-4 h-4" }),
                    path: '/templates',
                },
                {
                    label: 'Recurring',
                    icon: _jsx(Clock, { className: "w-4 h-4" }),
                    path: '/recurring-messages',
                },
            ],
        },
        {
            label: 'Analytics',
            icon: _jsx(BarChart3, { className: "w-5 h-5" }),
            path: '/analytics',
        },
        {
            label: 'Billing',
            icon: _jsx(CreditCard, { className: "w-5 h-5" }),
            path: '/billing',
        },
        {
            label: 'Settings',
            icon: _jsx(Settings, { className: "w-5 h-5" }),
            path: '/admin/settings',
        },
    ];
    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path.split('?')[0]);
    };
    const filteredItems = navigationItems.filter((item) => !item.conditional || (item.conditional && currentBranchId));
    return (_jsxs(_Fragment, { children: [_jsx(motion.button, { whileHover: { scale: 1.05 }, onClick: () => setIsOpen(!isOpen), className: "fixed top-4 left-4 z-50 md:hidden p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white", children: isOpen ? _jsx(X, { className: "w-6 h-6" }) : _jsx(Menu, { className: "w-6 h-6" }) }), _jsx(AnimatePresence, { children: isOpen && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setIsOpen(false), className: "fixed inset-0 bg-black/50 z-30 md:hidden" })) }), _jsxs(motion.div, { initial: { x: -288 }, animate: { x: isOpen ? 0 : -288 }, transition: { duration: 0.3 }, className: "fixed left-0 top-0 h-screen w-72 bg-card/80 backdrop-blur-xl border-r border-border/40 z-40 flex flex-col overflow-hidden md:translate-x-0 shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-border/40", children: [_jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(Zap, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-bold text-foreground", children: "Koinonia" }), _jsx("p", { className: "text-xs text-muted-foreground truncate max-w-[150px]", children: church?.name })] })] }), _jsx(motion.button, { whileHover: { scale: 1.1 }, onClick: () => setIsOpen(false), className: "md:hidden p-1 hover:bg-muted/50 rounded-lg", children: _jsx(X, { className: "w-5 h-5 text-muted-foreground" }) })] }), _jsx("nav", { className: "flex-1 overflow-y-auto px-3 py-6 space-y-2 custom-scrollbar", children: filteredItems.map((item, index) => {
                            const hasSubItems = item.subItems && item.subItems.length > 0;
                            const isItemActive = isActive(item.path);
                            const isExpanded = expandedItem === item.label;
                            return (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.05 }, children: hasSubItems ? (_jsxs(_Fragment, { children: [_jsxs(motion.button, { whileHover: { backgroundColor: 'rgba(59, 130, 246, 0.1)' }, onClick: () => setExpandedItem(isExpanded ? null : item.label), className: `w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isItemActive
                                                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-primary border-l-2 border-primary'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [item.icon, _jsx("span", { className: "font-semibold", children: item.label })] }), _jsx(motion.div, { animate: { rotate: isExpanded ? 90 : 0 }, transition: { duration: 0.2 }, children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] }), _jsx(AnimatePresence, { children: isExpanded && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "overflow-hidden", children: _jsx("div", { className: "pl-9 space-y-1 mb-2", children: item.subItems?.map((subItem) => (_jsxs(motion.button, { whileHover: { x: 4 }, onClick: () => {
                                                            navigate(subItem.path);
                                                            setIsOpen(false);
                                                        }, className: `w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${isActive(subItem.path)
                                                            ? 'bg-primary/20 text-primary'
                                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`, children: [subItem.icon, _jsx("span", { children: subItem.label })] }, subItem.label))) }) })) })] })) : (_jsxs(motion.button, { whileHover: { x: 4 }, onClick: () => {
                                        navigate(item.path);
                                        setIsOpen(false);
                                    }, className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isItemActive
                                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-primary border-l-2 border-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`, children: [item.icon, _jsx("span", { className: "font-semibold", children: item.label })] })) }, item.label));
                        }) }), _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.3 }, className: "border-t border-border/40 p-4", children: _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: handleLogout, className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-semibold border border-red-500/20", children: [_jsx(LogOut, { className: "w-5 h-5" }), _jsx("span", { children: "Logout" })] }) })] }), _jsx("div", { className: "hidden md:block w-72" })] }));
}
//# sourceMappingURL=SoftSidebar.js.map