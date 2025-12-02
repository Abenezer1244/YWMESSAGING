import React, { useMemo } from 'react';
import { MessageSquare, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { Conversation } from '../../api/conversations';
import { SoftCard } from '../SoftUI';
import { ConversationItem } from './ConversationItem';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onUpdateStatus?: (conversationId: string, status: 'open' | 'closed' | 'archived') => Promise<void>;
  isLoading?: boolean;
  containerHeight?: number; // Height of the virtual scroll container (default: 600px)
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    conversations: Conversation[];
    selectedConversationId?: string;
    onSelectConversation: (conversationId: string) => void;
    onUpdateStatus?: (conversationId: string, status: 'open' | 'closed' | 'archived') => Promise<void>;
  };
}

/**
 * Row renderer for virtual scrolling
 * Receives item index and style from FixedSizeList
 * Renders ConversationItem with memoization
 */
const Row = React.memo(function Row({ index, style, data }: RowProps) {
  const {
    conversations,
    selectedConversationId,
    onSelectConversation,
    onUpdateStatus,
  } = data;

  const conversation = conversations[index];

  return (
    <div style={style}>
      <div className="px-2">
        <ConversationItem
          conversation={conversation}
          isSelected={selectedConversationId === conversation.id}
          onSelect={onSelectConversation}
          onUpdateStatus={onUpdateStatus}
          index={index}
        />
      </div>
    </div>
  );
});

export function ConversationsList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onUpdateStatus,
  isLoading = false,
  containerHeight = 600,
}: ConversationsListProps) {
  /**
   * Memoized row data object
   * Prevents row renderer from being called unnecessarily
   * Only recalculates when conversations or selection changes
   */
  const rowData = useMemo(
    () => ({
      conversations,
      selectedConversationId,
      onSelectConversation,
      onUpdateStatus,
    }),
    [conversations, selectedConversationId, onSelectConversation, onUpdateStatus]
  );

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
    <List
      height={containerHeight}
      itemCount={conversations.length}
      itemSize={88} // Height of each conversation item (ConversationItem + padding)
      width="100%"
      itemData={rowData}
      overscanCount={5} // Render 5 extra items outside visible area for smooth scrolling
    >
      {Row}
    </List>
  );
}
