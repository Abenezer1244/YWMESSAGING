import React from 'react';
import { MessageSquare, Archive, X, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { Conversation } from '../../api/conversations';
import { SoftCard, SoftButton } from '../SoftUI';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onUpdateStatus?: (conversationId: string, status: 'open' | 'closed' | 'archived') => Promise<void>;
  isLoading?: boolean;
}

export function ConversationsList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onUpdateStatus,
  isLoading = false,
}: ConversationsListProps) {
  const formatDate = (date: string) => {
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

  const getStatusColor = (status: string) => {
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
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Loader className="w-6 h-6 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <SoftCard className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Conversations</h3>
        <p className="text-muted-foreground">
          Conversations will appear here when members text your church number
        </p>
      </SoftCard>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation, idx) => (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <button
            onClick={() => onSelectConversation(conversation.id)}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
              selectedConversationId === conversation.id
                ? 'border-primary bg-primary/5'
                : 'border-border/40 bg-card/50 hover:border-border hover:bg-card'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Unread indicator */}
              {conversation.unreadCount > 0 && (
                <div className="mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
              )}

              {/* Member info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {conversation.member.firstName} {conversation.member.lastName}
                  </h3>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground truncate mb-2">
                  {conversation.member.phone}
                </p>

                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(conversation.status)}`}>
                    {conversation.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(conversation.lastMessageAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {selectedConversationId === conversation.id && onUpdateStatus && (
                <div className="flex-shrink-0 flex gap-1" onClick={(e) => e.stopPropagation()}>
                  {conversation.status !== 'archived' && (
                    <SoftButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onUpdateStatus(conversation.id, 'archived');
                      }}
                      className="p-2"
                    >
                      <Archive className="w-4 h-4" />
                    </SoftButton>
                  )}
                </div>
              )}
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
