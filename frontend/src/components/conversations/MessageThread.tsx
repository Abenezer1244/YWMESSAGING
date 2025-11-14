import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { ConversationMessage, Conversation } from '../../api/conversations';
import { MessageBubble } from './MessageBubble';
import { SoftButton } from '../SoftUI';

interface MessageThreadProps {
  conversation: Conversation;
  messages: ConversationMessage[];
  isLoading?: boolean;
  page?: number;
  pages?: number;
  onLoadMore?: (page: number) => Promise<void>;
}

export function MessageThread({
  conversation,
  messages,
  isLoading = false,
  page = 1,
  pages = 1,
  onLoadMore,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

        {/* Messages */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            {...message}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Loader className="w-6 h-6 text-primary" />
            </motion.div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
