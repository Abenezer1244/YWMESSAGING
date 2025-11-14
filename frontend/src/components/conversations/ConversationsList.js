import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MessageSquare, Archive, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { SoftCard, SoftButton } from '../SoftUI';
export function ConversationsList({ conversations, selectedConversationId, onSelectConversation, onUpdateStatus, isLoading = false, }) {
    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
        if (diffHours < 1) {
            const diffMins = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
            return `${diffMins}m ago`;
        }
        if (diffHours < 24) {
            return `${Math.floor(diffHours)}h ago`;
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-blue-500/20 text-blue-400';
            case 'closed':
                return 'bg-red-500/20 text-red-400';
            case 'archived':
                return 'bg-gray-500/20 text-gray-400';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-6 h-6 text-primary" }) }) }));
    }
    if (conversations.length === 0) {
        return (_jsxs(SoftCard, { className: "text-center py-12", children: [_jsx(MessageSquare, { className: "w-12 h-12 text-muted-foreground/50 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: "No Conversations" }), _jsx("p", { className: "text-muted-foreground", children: "Conversations will appear here when members text your church number" })] }));
    }
    return (_jsx("div", { className: "space-y-2", children: conversations.map((conversation, idx) => (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: idx * 0.05 }, children: _jsx("button", { onClick: () => onSelectConversation(conversation.id), className: `w-full text-left p-4 rounded-lg border transition-all duration-200 ${selectedConversationId === conversation.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border/40 bg-card/50 hover:border-border hover:bg-card'}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [conversation.unreadCount > 0 && (_jsx("div", { className: "mt-1 flex-shrink-0", children: _jsx("div", { className: "w-2 h-2 bg-primary rounded-full" }) })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsxs("h3", { className: "font-semibold text-foreground truncate", children: [conversation.member.firstName, " ", conversation.member.lastName] }), conversation.unreadCount > 0 && (_jsx("span", { className: "bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0", children: conversation.unreadCount }))] }), _jsx("p", { className: "text-sm text-muted-foreground truncate mb-2", children: conversation.member.phone }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `text-xs font-medium px-2 py-1 rounded ${getStatusColor(conversation.status)}`, children: conversation.status }), _jsx("span", { className: "text-xs text-muted-foreground", children: formatDate(conversation.lastMessageAt) })] })] }), selectedConversationId === conversation.id && onUpdateStatus && (_jsx("div", { className: "flex-shrink-0 flex gap-1", onClick: (e) => e.stopPropagation(), children: conversation.status !== 'archived' && (_jsx(SoftButton, { variant: "secondary", size: "sm", onClick: () => {
                                    onUpdateStatus(conversation.id, 'archived');
                                }, className: "p-2", children: _jsx(Archive, { className: "w-4 h-4" }) })) }))] }) }) }, conversation.id))) }));
}
//# sourceMappingURL=ConversationsList.js.map