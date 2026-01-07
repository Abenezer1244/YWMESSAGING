import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { ConversationMessage, Conversation } from '../../api/conversations';
import { MessageBubble } from './MessageBubble';
import { SoftButton } from '../SoftUI';

/**
 * Format date for time separators
 * Returns "Today", "Yesterday", or formatted date
 */
function formatDateSeparator(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (messageDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    // Format as "Mon, Jan 5" or "Mon, Jan 5, 2024" if different year
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric';
    }
    return date.toLocaleDateString('en-US', options);
  }
}

/**
 * Get the date key for a message (YYYY-MM-DD format)
 */
function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Time separator component - iMessage style
 */
function TimeSeparator({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/50 rounded-full">
        {formatDateSeparator(date)}
      </span>
    </div>
  );
}

/**
 * Group consecutive messages from the same sender
 * Returns messages with isFirstInGroup and isLastInGroup flags
 */
function groupMessages(messages: ConversationMessage[]) {
  return messages.map((message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

    // Check if this message is from the same direction as previous/next
    const sameDirAsPrev = prevMessage?.direction === message.direction;
    const sameDirAsNext = nextMessage?.direction === message.direction;

    // Check time proximity (messages within 2 minutes are grouped)
    const TIME_THRESHOLD = 2 * 60 * 1000; // 2 minutes
    const prevTime = prevMessage ? new Date(prevMessage.createdAt).getTime() : 0;
    const currentTime = new Date(message.createdAt).getTime();
    const nextTime = nextMessage ? new Date(nextMessage.createdAt).getTime() : 0;

    const closeTooPrev = prevMessage && (currentTime - prevTime) < TIME_THRESHOLD;
    const closeTooNext = nextMessage && (nextTime - currentTime) < TIME_THRESHOLD;

    // Determine grouping
    const isFirstInGroup = !sameDirAsPrev || !closeTooPrev;
    const isLastInGroup = !sameDirAsNext || !closeTooNext;

    return {
      ...message,
      isFirstInGroup,
      isLastInGroup,
    };
  });
}

interface MessageThreadProps {
  conversation: Conversation;
  messages: ConversationMessage[];
  isLoading?: boolean;
  isTyping?: boolean; // RCS typing indicator
  page?: number;
  pages?: number;
  onLoadMore?: (page: number) => Promise<void>;
  // iMessage-style features
  onReact?: (messageId: string, emoji: string) => void;
  onSelectReplyMessage?: (messageId: string) => void;
}

export function MessageThread({
  conversation,
  messages,
  isLoading = false,
  isTyping = false,
  page = 1,
  pages = 1,
  onLoadMore,
  onReact,
  onSelectReplyMessage,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Group consecutive messages from same sender (memoized for performance)
  const groupedMessages = useMemo(() => groupMessages(messages), [messages]);

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
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium mb-2">No messages yet</p>
          <p className="text-sm">This conversation is just getting started. Send a message to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {/* Load older messages button */}
        {page < pages && (
          <div className="flex justify-center mb-4">
            <SoftButton
              variant="secondary"
              size="sm"
              onClick={() => onLoadMore?.(page + 1)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                    <Loader className="w-4 h-4 inline mr-2" />
                  </motion.div>
                  Loading...
                </>
              ) : (
                'Load Older Messages'
              )}
            </SoftButton>
          </div>
        )}

        {/* Messages with grouping and time separators */}
        {groupedMessages.map((message, index) => {
          const prevMessage = index > 0 ? groupedMessages[index - 1] : null;
          const currentDate = new Date(message.createdAt);
          const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;

          // Show time separator if this is first message or date changed
          const showDateSeparator = !prevDate || getDateKey(currentDate) !== getDateKey(prevDate);

          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && <TimeSeparator date={currentDate} />}
              <MessageBubble
                {...message}
                showTail={true}
                onReact={onReact}
                onReplyClick={onSelectReplyMessage}
                onSelectForReply={onSelectReplyMessage}
              />
            </React.Fragment>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Loader className="w-6 h-6 text-primary" />
            </motion.div>
          </div>
        )}

        {/* RCS Typing indicator - iMessage style */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-muted rounded-lg px-4 py-3">
              <div className="flex items-center gap-1">
                <motion.span
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
