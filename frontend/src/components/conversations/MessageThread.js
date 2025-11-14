import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { SoftButton } from '../SoftUI';
export function MessageThread({ conversation, messages, isLoading = false, page = 1, pages = 1, onLoadMore, }) {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        // Only scroll on initial load or when new messages arrive on current page
        if (page === pages) {
            scrollToBottom();
        }
    }, [messages, page, pages]);
    if (!messages.length && !isLoading) {
        return (_jsx("div", { className: "flex flex-col items-center justify-center h-full py-12 text-center", children: _jsxs("div", { className: "text-muted-foreground", children: [_jsx("p", { className: "text-lg font-medium mb-2", children: "No messages yet" }), _jsx("p", { className: "text-sm", children: "This conversation is just getting started. Send a message to get started!" })] }) }));
    }
    return (_jsx("div", { className: "flex flex-col h-full", children: _jsxs("div", { ref: messagesContainerRef, className: "flex-1 overflow-y-auto px-4 py-6 space-y-4", children: [page < pages && (_jsx("div", { className: "flex justify-center mb-4", children: _jsx(SoftButton, { variant: "secondary", size: "sm", onClick: () => onLoadMore?.(page + 1), disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-4 h-4 inline mr-2" }) }), "Loading..."] })) : ('Load Older Messages') }) })), messages.map((message) => (_jsx(MessageBubble, { ...message }, message.id))), isLoading && (_jsx("div", { className: "flex justify-center py-4", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Loader, { className: "w-6 h-6 text-primary" }) }) })), _jsx("div", { ref: messagesEndRef })] }) }));
}
//# sourceMappingURL=MessageThread.js.map