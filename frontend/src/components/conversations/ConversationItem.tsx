import React, { memo } from 'react';
import { Archive } from 'lucide-react';
import { motion } from 'framer-motion';
import { Conversation } from '../../api/conversations';
import { SoftButton } from '../SoftUI';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
  onUpdateStatus?: (conversationId: string, status: 'open' | 'closed' | 'archived') => Promise<void>;
  index: number;
}

function ConversationItemComponent({
  conversation,
  isSelected,
  onSelect,
  onUpdateStatus,
  index,
}: ConversationItemProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={() => onSelect(conversation.id)}
        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
          isSelected
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
          {isSelected && onUpdateStatus && (
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
  );
}

/**
 * Memoized ConversationItem component
 * Prevents re-renders of individual conversation items when list updates
 * Critical for performance when displaying many conversations
 * Shallow comparison of conversation object, selection state, and callbacks
 */
export const ConversationItem = memo(ConversationItemComponent);
