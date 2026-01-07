import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Search, Loader, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import {
  Conversation,
  ConversationMessage,
  getConversations,
  getConversation,
  markConversationAsRead,
  updateConversationStatus,
  addReaction,
} from '../../api/conversations';
import { SoftLayout, SoftCard, SoftButton } from '../../components/SoftUI';
import Input from '../../components/ui/Input';
import { ConversationsList } from '../../components/conversations/ConversationsList';
import { MessageThread } from '../../components/conversations/MessageThread';
import { ReplyComposer } from '../../components/conversations/ReplyComposer';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { designTokens } from '../../utils/designTokens';
import { useConversationSocket, RCSTypingEvent, RCSReadReceiptEvent } from '../../hooks/useConversationSocket';

export function ConversationsPage() {
  const auth = useAuthStore();
  const { isMobile } = useBreakpoint();

  // List state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected conversation state
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesPages, setMessagesPages] = useState(1);

  // Mobile navigation state - on mobile, show either list or messages
  const [showMessages, setShowMessages] = useState(false);

  // RCS typing indicator state (iMessage-style)
  const [isTyping, setIsTyping] = useState(false);

  // Reply-to message state (iMessage-style)
  const [replyToMessage, setReplyToMessage] = useState<ConversationMessage | null>(null);

  // Handle RCS typing events from WebSocket
  const handleTypingEvent = useCallback((event: RCSTypingEvent) => {
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
  const handleReadReceiptEvent = useCallback((event: RCSReadReceiptEvent) => {
    // Update message in current thread if it's in the selected conversation
    if (event.conversationId === selectedConversationId) {
      setMessages(prev => prev.map(msg =>
        msg.id === event.messageId
          ? { ...msg, rcsReadAt: event.readAt }
          : msg
      ));
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
      if (
        selectedConversationId &&
        !data.data.find((c) => c.id === selectedConversationId)
      ) {
        setSelectedConversationId(null);
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
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
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load conversation');
      setSelectedConversationId(null);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleLoadMoreMessages = async (newPage: number) => {
    if (!selectedConversationId) return;

    try {
      setIsLoadingMessages(true);
      const data = await getConversation(selectedConversationId, {
        page: newPage,
        limit: 50,
      });

      // Append to existing messages (prepend since we're loading older messages)
      setMessages((prev) => [...data.messages.reverse(), ...prev]);
      setMessagesPage(newPage);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleReply = async () => {
    if (!selectedConversationId) return;

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
    } catch (error) {
      toast.error((error as Error).message || 'Failed to send message');
    }
  };

  const handleUpdateStatus = async (
    conversationId: string,
    status: 'open' | 'closed' | 'archived'
  ) => {
    try {
      await updateConversationStatus(conversationId, status);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, status } : c
        )
      );
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation({ ...selectedConversation, status });
      }
      toast.success(`Conversation ${status}`);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to update conversation');
    }
  };

  // Handle adding reaction to a message (iMessage-style)
  const handleReaction = async (messageId: string, emoji: string) => {
    if (!selectedConversationId) return;

    try {
      const reaction = await addReaction(selectedConversationId, messageId, emoji);
      // Update message in local state
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
          : msg
      ));
    } catch (error) {
      toast.error((error as Error).message || 'Failed to add reaction');
    }
  };

  // Handle selecting a message to reply to (iMessage-style)
  const handleSelectReplyMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setReplyToMessage(message);
    }
  };

  // Handle canceling reply
  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  return (
    <SoftLayout>
      <div className="px-4 md:px-8 py-8 w-full h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Conversations
                </span>
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Members text your church number to start conversations
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-4 items-center">
            <Input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="flex-1 min-w-xs"
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Conversations List - Hidden on mobile when showing messages */}
          {!isMobile || !showMessages ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1 flex flex-col min-h-0"
            >
              <SoftCard className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border/40">
                <h2 className="font-semibold text-foreground">
                  {conversations.length} Conversations
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && !isLoadingConversations ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Conversations Yet
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Members who text your church number will appear here. Share your church number to get started!
                    </p>
                  </div>
                ) : (
                  <div className="p-4">
                    <ConversationsList
                      conversations={conversations}
                      selectedConversationId={selectedConversationId || undefined}
                      onSelectConversation={handleSelectConversation}
                      onUpdateStatus={handleUpdateStatus}
                      isLoading={isLoadingConversations}
                    />
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="p-4 border-t border-border/40 flex justify-between gap-2">
                  <SoftButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </SoftButton>
                  <span className="text-xs text-muted-foreground self-center">
                    Page {page} of {pages}
                  </span>
                  <SoftButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(Math.min(pages, page + 1))}
                    disabled={page === pages}
                  >
                    Next
                  </SoftButton>
                </div>
              )}
              </SoftCard>
            </motion.div>
          ) : null}

          {/* Message Thread - Hidden on mobile when showing list */}
          {!isMobile || showMessages ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 flex flex-col min-h-0"
            >
              {selectedConversation ? (
                <SoftCard className="flex-1 flex flex-col overflow-hidden">
                  {/* Thread Header with Back Button on Mobile */}
                  <div className="p-4 border-b border-border/40">
                    <div className="flex items-center justify-between">
                      {/* Back Button on Mobile */}
                      {isMobile && (
                        <motion.button
                          onClick={() => setShowMessages(false)}
                          style={{
                            minHeight: designTokens.touchTarget.enhanced,
                            minWidth: designTokens.touchTarget.enhanced,
                          }}
                          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mr-4"
                          title="Back to conversation list"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                      )}
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {selectedConversation.member.firstName} {selectedConversation.member.lastName}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.member.phone}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded ${
                        selectedConversation.status === 'open'
                          ? 'bg-blue-500/20 text-blue-400'
                          : selectedConversation.status === 'closed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {selectedConversation.status}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <MessageThread
                  conversation={selectedConversation}
                  messages={messages}
                  isLoading={isLoadingMessages}
                  page={messagesPage}
                  pages={messagesPages}
                  onLoadMore={handleLoadMoreMessages}
                  isTyping={isTyping}
                  onReact={handleReaction}
                  onSelectReplyMessage={handleSelectReplyMessage}
                />

                {/* Reply Composer */}
                <ReplyComposer
                  conversationId={selectedConversation.id}
                  onReply={handleReply}
                  replyToMessage={replyToMessage}
                  onCancelReply={handleCancelReply}
                />
              </SoftCard>
              ) : (
                <SoftCard className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Select a Conversation
                    </h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to view and reply to messages
                    </p>
                  </div>
                </SoftCard>
              )}
            </motion.div>
          ) : null}
        </div>
      </div>
    </SoftLayout>
  );
}

export default ConversationsPage;
