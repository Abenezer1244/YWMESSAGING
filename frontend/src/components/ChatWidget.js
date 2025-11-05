import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { sendChatMessage, createConversation } from '../api/chat';
import toast from 'react-hot-toast';
export function ChatWidget({ variant = 'floating', position = 'bottom-right' }) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const [visitorId] = useState(() => {
        // Generate unique visitor ID from localStorage or create new one
        let id = localStorage.getItem('visitor_id');
        if (!id) {
            id = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            localStorage.setItem('visitor_id', id);
        }
        return id;
    });
    const { conversationId, messages, isLoading, error, isOpen, setConversationId, addMessage, setLoading, setError, openChat, closeChat, } = useChatStore();
    // Initialize conversation on mount
    useEffect(() => {
        const initializeConversation = async () => {
            if (!conversationId && isOpen) {
                try {
                    const conversation = await createConversation(visitorId);
                    setConversationId(conversation.conversationId);
                }
                catch {
                    setError('Failed to start conversation');
                    toast.error('Failed to start conversation');
                }
            }
        };
        initializeConversation();
    }, [isOpen, conversationId, setConversationId, setError, visitorId]);
    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleSendMessage = async () => {
        if (!input.trim())
            return;
        const userMessage = input.trim();
        setInput('');
        // Add user message to UI
        addMessage({
            id: Date.now().toString(),
            role: 'user',
            content: userMessage,
            createdAt: new Date().toISOString(),
        });
        setLoading(true);
        setError(null);
        try {
            const response = await sendChatMessage(userMessage, conversationId || undefined, visitorId);
            // Add assistant response
            addMessage({
                id: `response_${Date.now()}`,
                role: 'assistant',
                content: response.message,
                createdAt: new Date().toISOString(),
            });
            // Update conversation ID if this was the first message
            if (!conversationId) {
                setConversationId(response.conversationId);
            }
        }
        catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to send message';
            setError(errorMessage);
            toast.error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    const positionClass = position === 'bottom-left' ? 'left-4' : 'right-4';
    if (variant === 'floating') {
        return (_jsx("div", { className: `fixed bottom-4 ${positionClass} z-50`, children: _jsxs(AnimatePresence, { children: [!isOpen && (_jsx(motion.button, { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0, opacity: 0 }, onClick: openChat, className: "w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center", children: _jsx(MessageCircle, { size: 24 }) })), isOpen && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 }, className: "w-96 h-[500px] bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: "Koinonia Assistant" }), _jsx("p", { className: "text-sm text-orange-100", children: "Ask me about Koinonia SMS" })] }), _jsx("button", { onClick: closeChat, className: "p-1 hover:bg-orange-700 rounded transition-colors", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-800", children: [messages.length === 0 && (_jsxs("div", { className: "text-center text-gray-500 dark:text-gray-400 py-8", children: [_jsx(MessageCircle, { size: 32, className: "mx-auto mb-2 opacity-30" }), _jsxs("p", { className: "text-sm", children: ["Hi! I'm the Koinonia Assistant.", _jsx("br", {}), "Ask me anything about our platform!"] })] })), messages.map((msg) => (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsx("div", { className: `max-w-xs px-3 py-2 rounded-lg text-sm ${msg.role === 'user'
                                                ? 'bg-orange-500 text-white rounded-br-none'
                                                : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-bl-none'}`, children: msg.content }) }, msg.id))), isLoading && (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "bg-white dark:bg-slate-700 px-3 py-2 rounded-lg rounded-bl-none", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" })] }) }) })), error && (_jsx("div", { className: "text-red-500 text-sm text-center", children: error })), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: "border-t border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleSendMessage(), placeholder: "Ask me something...", disabled: isLoading, className: "flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:text-white text-sm" }), _jsx("button", { onClick: handleSendMessage, disabled: isLoading || !input.trim(), className: "bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors", children: _jsx(Send, { size: 18 }) })] }) })] }))] }) }));
    }
    // Embedded variant for dashboard
    return (_jsxs("div", { className: "w-full h-full bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4", children: [_jsx("h3", { className: "font-semibold", children: "Koinonia Assistant" }), _jsx("p", { className: "text-sm text-orange-100", children: "Ask me about Koinonia features and support" })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-800", children: [messages.length === 0 && (_jsxs("div", { className: "text-center text-gray-500 dark:text-gray-400 py-8", children: [_jsx(MessageCircle, { size: 32, className: "mx-auto mb-2 opacity-30" }), _jsxs("p", { className: "text-sm", children: ["Hi! I'm the Koinonia Assistant.", _jsx("br", {}), "Ask me anything about our platform!"] })] })), messages.map((msg) => (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsx("div", { className: `max-w-xs px-3 py-2 rounded-lg text-sm ${msg.role === 'user'
                                ? 'bg-orange-500 text-white rounded-br-none'
                                : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-bl-none'}`, children: msg.content }) }, msg.id))), isLoading && (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "bg-white dark:bg-slate-700 px-3 py-2 rounded-lg rounded-bl-none", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" })] }) }) })), error && (_jsx("div", { className: "text-red-500 text-sm text-center", children: error })), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: "border-t border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleSendMessage(), placeholder: "Ask me something...", disabled: isLoading, className: "flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:text-white text-sm" }), _jsx("button", { onClick: handleSendMessage, disabled: isLoading || !input.trim(), className: "bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors", children: _jsx(Send, { size: 18 }) })] }) })] }));
}
//# sourceMappingURL=ChatWidget.js.map