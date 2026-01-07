import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { getConversations, getConversation, markConversationAsRead, updateConversationStatus, addReaction, } from '../../api/conversations';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
import Input from '../../components/ui/Input';
import { ConversationsList } from '../../components/conversations/ConversationsList';
import { MessageThread } from '../../components/conversations/MessageThread';
import { ReplyComposer } from '../../components/conversations/ReplyComposer';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { designTokens } from '../../utils/designTokens';
import { useConversationSocket } from '../../hooks/useConversationSocket';
export function ConversationsPage() {
    const auth = useAuthStore();
    const { isMobile } = useBreakpoint();
    // List state
    const [conversations, setConversations] = useState([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    // Selected conversation state
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [messagesPage, setMessagesPage] = useState(1);
    const [messagesPages, setMessagesPages] = useState(1);
    // Mobile navigation state - on mobile, show either list or messages
    const [showMessages, setShowMessages] = useState(false);
    // RCS typing indicator state (iMessage-style)
    const [isTyping, setIsTyping] = useState(false);
    // Reply-to message state (iMessage-style)
    const [replyToMessage, setReplyToMessage] = useState(null);
    // Handle RCS typing events from WebSocket
    const handleTypingEvent = useCallback((event) => {
        // Only update typing state if it's for the currently selected conversation
        if (event.conversationId === selectedConversationId) {
            setIsTyping(event.isTyping);
            // Auto-clear typing indicator after 5 seconds (in case we miss the stop event)
            if (event.isTyping) {
                setTimeout(() => setIsTyping(false), 5000);
            }
        }
    }, [selectedConversationId]);
    // Handle RCS read receipt events from WebSocket
    const handleReadReceiptEvent = useCallback((event) => {
        // Update message in current thread if it's in the selected conversation
        if (event.conversationId === selectedConversationId) {
            setMessages(prev => prev.map(msg => msg.id === event.messageId
                ? { ...msg, rcsReadAt: event.readAt }
                : msg));
        }
    }, [selectedConversationId]);
    // Connect to WebSocket for real-time RCS features
    const { isConnected } = useConversationSocket({
        onTyping: handleTypingEvent,
        onReadReceipt: handleReadReceiptEvent,
    });
    // Load conversations on mount and when page/search changes
    useEffect(() => {
        loadConversations();
    }, [page, searchQuery]);
    const loadConversations = async () => {
        try {
            setIsLoadingConversations(true);
            const data = await getConversations({
                page,
                limit: 20,
            });
            setConversations(data.data);
            setPages(data.pagination.pages);
            // Reset selected if current selection is not in new list
            if (selectedConversationId &&
                !data.data.find((c) => c.id === selectedConversationId)) {
                setSelectedConversationId(null);
                setSelectedConversation(null);
                setMessages([]);
            }
        }
        catch (error) {
            toast.error(error.message || 'Failed to load conversations');
        }
        finally {
            setIsLoadingConversations(false);
        }
    };
    const handleSelectConversation = async (conversationId) => {
        try {
            setSelectedConversationId(conversationId);
            setIsLoadingMessages(true);
            setMessagesPage(1);
            setIsTyping(false); // Clear typing state when switching conversations
            const data = await getConversation(conversationId, {
                page: 1,
                limit: 50,
            });
            setSelectedConversation(data.conversation);
            setMessages(data.messages.reverse()); // Reverse to show newest at bottom
            setMessagesPages(data.pagination.pages);
            // On mobile, show messages instead of list
            if (isMobile) {
                setShowMessages(true);
            }
            // Mark as read
            await markConversationAsRead(conversationId);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load conversation');
            setSelectedConversationId(null);
        }
        finally {
            setIsLoadingMessages(false);
        }
    };
    const handleLoadMoreMessages = async (newPage) => {
        if (!selectedConversationId)
            return;
        try {
            setIsLoadingMessages(true);
            const data = await getConversation(selectedConversationId, {
                page: newPage,
                limit: 50,
            });
            // Append to existing messages (prepend since we're loading older messages)
            setMessages((prev) => [...data.messages.reverse(), ...prev]);
            setMessagesPage(newPage);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load messages');
        }
        finally {
            setIsLoadingMessages(false);
        }
    };
    const handleReply = async () => {
        if (!selectedConversationId)
            return;
        try {
            // Clear reply-to state
            setReplyToMessage(null);
            // Reload conversation to get new messages
            const data = await getConversation(selectedConversationId, {
                page: messagesPages,
                limit: 50,
            });
            setMessages((prev) => [...prev, ...data.messages.reverse()]);
            // Also refresh conversation list to update lastMessageAt
            await loadConversations();
            toast.success('Message sent');
        }
        catch (error) {
            toast.error(error.message || 'Failed to send message');
        }
    };
    const handleUpdateStatus = async (conversationId, status) => {
        try {
            await updateConversationStatus(conversationId, status);
            setConversations((prev) => prev.map((c) => c.id === conversationId ? { ...c, status } : c));
            if (selectedConversation?.id === conversationId) {
                setSelectedConversation({ ...selectedConversation, status });
            }
            toast.success(`Conversation ${status}`);
        }
        catch (error) {
            toast.error(error.message || 'Failed to update conversation');
        }
    };
    // Handle adding reaction to a message (iMessage-style)
    const handleReaction = async (messageId, emoji) => {
        if (!selectedConversationId)
            return;
        try {
            const reaction = await addReaction(selectedConversationId, messageId, emoji);
            // Update message in local state
            setMessages(prev => prev.map(msg => msg.id === messageId
                ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
                : msg));
        }
        catch (error) {
            toast.error(error.message || 'Failed to add reaction');
        }
    };
    // Handle selecting a message to reply to (iMessage-style)
    const handleSelectReplyMessage = (messageId) => {
        const message = messages.find(m => m.id === messageId);
        if (message) {
            setReplyToMessage(message);
        }
    };
    // Handle canceling reply
    const handleCancelReply = () => {
        setReplyToMessage(null);
    };
    return (_jsx(SoftLayout, { children: _jsxs("div", { className: "px-4 md:px-8 py-8 w-full h-full flex flex-col", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "mb-8", children: [_jsx("div", { className: "flex items-start justify-between mb-6 flex-wrap gap-4", children: _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-foreground mb-2", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: "Conversations" }) }), _jsxs("p", { className: "text-muted-foreground flex items-center gap-2", children: [_jsx(Phone, { className: "w-4 h-4" }), "Members text your church number to start conversations"] })] }) }), _jsx("div", { className: "flex gap-4 items-center", children: _jsx(Input, { type: "text", placeholder: "Search by name or phone...", value: searchQuery, onChange: (e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }, className: "flex-1 min-w-xs" }) })] }), _jsxs("div", { className: "flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0", children: [!isMobile || !showMessages ? (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5 }, className: "lg:col-span-1 flex flex-col min-h-0", children: _jsxs(SoftCard, { className: "flex-1 overflow-hidden flex flex-col", children: [_jsx("div", { className: "p-4 border-b border-border/40", children: _jsxs("h2", { className: "font-semibold text-foreground", children: [conversations.length, " Conversations"] }) }), _jsx("div", { className: "flex-1 overflow-y-auto", children: conversations.length === 0 && !isLoadingConversations ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-full p-8 text-center", children: [_jsx(MessageSquare, { className: "w-16 h-16 text-muted-foreground/40 mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: "No Conversations Yet" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Members who text your church number will appear here. Share your church number to get started!" })] })) : (_jsx("div", { className: "p-4", children: _jsx(ConversationsList, { conversations: conversations, selectedConversationId: selectedConversationId || undefined, onSelectConversation: handleSelectConversation, onUpdateStatus: handleUpdateStatus, isLoading: isLoadingConversations }) })) }), pages > 1 && (_jsxs("div", { className: "p-4 border-t border-border/40 flex justify-between gap-2", children: [_jsx(SoftButton, { variant: "secondary", size: "sm", onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, children: "Previous" }), _jsxs("span", { className: "text-xs text-muted-foreground self-center", children: ["Page ", page, " of ", pages] }), _jsx(SoftButton, { variant: "secondary", size: "sm", onClick: () => setPage(Math.min(pages, page + 1)), disabled: page === pages, children: "Next" })] }))] }) })) : null, !isMobile || showMessages ? (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.1 }, className: "lg:col-span-2 flex flex-col min-h-0", children: selectedConversation ? (_jsxs(SoftCard, { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx("div", { className: "p-4 border-b border-border/40", children: _jsxs("div", { className: "flex items-center justify-between", children: [isMobile && (_jsx(motion.button, { onClick: () => setShowMessages(false), style: {
                                                        minHeight: designTokens.touchTarget.enhanced,
                                                        minWidth: designTokens.touchTarget.enhanced,
                                                    }, className: "flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mr-4", title: "Back to conversation list", children: _jsx(ChevronLeft, { className: "w-5 h-5" }) })), _jsxs("div", { children: [_jsxs("h2", { className: "font-semibold text-foreground", children: [selectedConversation.member.firstName, " ", selectedConversation.member.lastName] }), _jsx("p", { className: "text-sm text-muted-foreground", children: selectedConversation.member.phone })] }), _jsx("span", { className: `text-xs font-medium px-3 py-1 rounded ${selectedConversation.status === 'open'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : selectedConversation.status === 'closed'
                                                            ? 'bg-red-500/20 text-red-400'
                                                            : 'bg-gray-500/20 text-gray-400'}`, children: selectedConversation.status })] }) }), _jsx(MessageThread, { conversation: selectedConversation, messages: messages, isLoading: isLoadingMessages, page: messagesPage, pages: messagesPages, onLoadMore: handleLoadMoreMessages, isTyping: isTyping, onReact: handleReaction, onSelectReplyMessage: handleSelectReplyMessage }), _jsx(ReplyComposer, { conversationId: selectedConversation.id, onReply: handleReply, replyToMessage: replyToMessage, onCancelReply: handleCancelReply })] })) : (_jsx(SoftCard, { className: "flex-1 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(MessageSquare, { className: "w-16 h-16 text-muted-foreground/50 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: "Select a Conversation" }), _jsx("p", { className: "text-muted-foreground", children: "Choose a conversation from the list to view and reply to messages" })] }) })) })) : null] })] }) }));
}
export default ConversationsPage;
//# sourceMappingURL=ConversationsPage.js.map