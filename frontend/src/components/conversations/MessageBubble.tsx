import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Play, Reply, CornerUpLeft } from 'lucide-react';
import { LazyImage } from '../LazyImage';
import { MessageReaction, SendEffect } from '../../api/conversations';

// Available reactions (iMessage style)
const REACTION_EMOJIS = ['❤️', '👍', '👎', '😂', '😮', '😢'];

interface MessageProps {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  memberName?: string;
  deliveryStatus?: string | null;
  // RCS fields
  channel?: 'sms' | 'mms' | 'rcs';
  rcsReadAt?: string | Date | null;
  // Media fields
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | 'audio' | 'document' | null;
  mediaName?: string | null;
  mediaSizeBytes?: number | null;
  mediaDuration?: number | null;
  createdAt: string | Date;
  // Animation control
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  showTail?: boolean;
  // Reactions (iMessage-style)
  reactions?: MessageReaction[];
  onReact?: (messageId: string, emoji: string) => void;
  // Reply threading (iMessage-style)
  replyTo?: {
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
  } | null;
  onReplyClick?: (messageId: string) => void;
  onSelectForReply?: (messageId: string) => void; // Select this message to reply to
  // Send effect animation (iMessage-style)
  sendEffect?: SendEffect | null;
}

function MessageBubbleComponent(props: MessageProps) {
  const {
    id,
    content,
    direction,
    memberName,
    deliveryStatus,
    channel,
    rcsReadAt,
    mediaUrl,
    mediaType,
    mediaName,
    mediaSizeBytes,
    mediaDuration,
    createdAt,
    isFirstInGroup = true,
    isLastInGroup = true,
    showTail = true,
    reactions = [],
    onReact,
    replyTo,
    onReplyClick,
    onSelectForReply,
    sendEffect,
  } = props;

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const isOutbound = direction === 'outbound';

  // Group reactions by emoji for display
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction.reactedBy);
    return acc;
  }, {} as Record<string, string[]>);

  // Send effect animations
  const getSendEffectVariants = () => {
    switch (sendEffect) {
      case 'slam':
        return {
          initial: { scale: 3, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: 'spring' as const, damping: 8, stiffness: 200 }
        };
      case 'loud':
        return {
          initial: { scale: 0.5 },
          animate: { scale: [0.5, 1.3, 1] },
          transition: { duration: 0.4, times: [0, 0.6, 1] }
        };
      case 'gentle':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.8, ease: 'easeOut' as const }
        };
      case 'invisibleInk':
        return {
          initial: { filter: 'blur(20px)' },
          animate: { filter: 'blur(0px)' },
          transition: { duration: 2, ease: 'easeOut' as const }
        };
      default:
        return {
          initial: { opacity: 0, y: 10, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { duration: 0.2, ease: 'easeOut' as const }
        };
    }
  };

  const effectVariants = getSendEffectVariants();

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / 1024 / 1024;
    return mb > 1 ? `${mb.toFixed(1)}MB` : `${(bytes / 1024).toFixed(0)}KB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timestamp = new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine border radius based on grouping (iMessage style)
  const getBorderRadius = () => {
    if (isOutbound) {
      // Outbound: tail on right side
      if (isFirstInGroup && isLastInGroup) return 'rounded-2xl rounded-br-md'; // Single message
      if (isFirstInGroup) return 'rounded-2xl rounded-br-lg'; // First in group
      if (isLastInGroup) return 'rounded-2xl rounded-br-md rounded-tr-lg'; // Last in group
      return 'rounded-2xl rounded-r-lg'; // Middle of group
    } else {
      // Inbound: tail on left side
      if (isFirstInGroup && isLastInGroup) return 'rounded-2xl rounded-bl-md'; // Single message
      if (isFirstInGroup) return 'rounded-2xl rounded-bl-lg'; // First in group
      if (isLastInGroup) return 'rounded-2xl rounded-bl-md rounded-tl-lg'; // Last in group
      return 'rounded-2xl rounded-l-lg'; // Middle of group
    }
  };

  return (
    <motion.div
      initial={effectVariants.initial}
      animate={effectVariants.animate}
      transition={effectVariants.transition}
      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} ${isLastInGroup ? 'mb-3' : 'mb-1'}`}
    >
      <div className="relative group">
        {/* Reply preview (iMessage-style) */}
        {replyTo && (
          <div
            className={`mb-1 px-3 py-1.5 rounded-lg text-xs max-w-[200px] truncate cursor-pointer ${
              isOutbound
                ? 'bg-primary/30 text-white/80 ml-auto'
                : 'bg-muted/70 text-muted-foreground'
            }`}
            onClick={() => onReplyClick?.(replyTo.id)}
            title="Click to view original message"
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Reply size={10} />
              <span className="font-medium">
                {replyTo.direction === 'outbound' ? 'You' : 'Member'}
              </span>
            </div>
            <p className="truncate">{replyTo.content}</p>
          </div>
        )}

        {/* Message bubble with tail */}
        <div
          className={`max-w-sm p-3 ${
            isOutbound
              ? 'bg-primary text-white'
              : 'bg-muted text-foreground'
          } ${getBorderRadius()} cursor-pointer`}
          onDoubleClick={() => setShowReactionPicker(!showReactionPicker)}
        >

        {/* Member name for inbound messages */}
        {!isOutbound && memberName && (
          <p className="text-xs font-semibold mb-1 opacity-75">{memberName}</p>
        )}

        {/* Media attachment - Image */}
        {mediaUrl && mediaType === 'image' && (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-2"
          >
            <LazyImage
              src={mediaUrl}
              alt="Message attachment"
              className="max-w-xs rounded-lg hover:opacity-90 cursor-pointer"
            />
          </a>
        )}

        {/* Media attachment - Video */}
        {mediaUrl && mediaType === 'video' && (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-2 relative"
          >
            <video
              className="max-w-xs rounded-lg"
              controls
              poster={mediaUrl}
            >
              <source src={mediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </a>
        )}

        {/* Media attachment - Audio */}
        {mediaUrl && mediaType === 'audio' && (
          <div className="mb-2">
            <audio controls className="max-w-xs rounded-lg">
              <source src={mediaUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            {mediaDuration && (
              <p className="text-xs mt-1 opacity-75">
                {formatDuration(mediaDuration)}
              </p>
            )}
          </div>
        )}

        {/* Media attachment - Document */}
        {mediaUrl && mediaType === 'document' && (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${
              isOutbound
                ? 'bg-white/20 hover:bg-white/30'
                : 'bg-foreground/10 hover:bg-foreground/20'
            }`}
          >
            <span>📄</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{mediaName}</p>
              {mediaSizeBytes && (
                <p className="text-xs opacity-75">
                  {formatFileSize(mediaSizeBytes)}
                </p>
              )}
            </div>
            <Download size={16} className="flex-shrink-0" />
          </a>
        )}

        {/* Text content */}
        {content && !content.startsWith('[') && (
          <p className="text-sm break-words whitespace-pre-wrap">{content}</p>
        )}

        {/* Footer: Timestamp, channel, and delivery status */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-1">
            <p
              className={`text-xs ${
                isOutbound ? 'text-white/80' : 'text-muted-foreground'
              }`}
            >
              {timestamp}
            </p>
            {/* RCS channel indicator (subtle) */}
            {channel === 'rcs' && (
              <span className={`text-xs ${isOutbound ? 'text-white/60' : 'text-muted-foreground/60'}`}>
                •
              </span>
            )}
          </div>

          {/* Delivery/Read status indicator (outbound only) */}
          {isOutbound && (
            <span className="text-xs opacity-75 flex items-center gap-1">
              {/* RCS Read receipt with timestamp */}
              {rcsReadAt ? (
                <span title={`Read at ${new Date(rcsReadAt).toLocaleTimeString()}`}>
                  ✓✓ Read
                </span>
              ) : deliveryStatus === 'pending' ? (
                '⏱️'
              ) : deliveryStatus === 'delivered' ? (
                '✓✓'
              ) : deliveryStatus === 'failed' ? (
                '❌'
              ) : null}
            </span>
          )}
        </div>
        </div>

        {/* Bubble tail - iMessage style pointer (only on last message in group) */}
        {showTail && isLastInGroup && (
          <div
            className={`absolute bottom-0 w-3 h-3 ${
              isOutbound
                ? 'right-0 -mr-1 bg-primary'
                : 'left-0 -ml-1 bg-muted'
            }`}
            style={{
              clipPath: isOutbound
                ? 'polygon(0 0, 100% 0, 100% 100%)'
                : 'polygon(0 0, 100% 0, 0 100%)',
            }}
          />
        )}

        {/* Action buttons (show on hover) - Reply button */}
        {onSelectForReply && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
              isOutbound ? '-left-10' : '-right-10'
            }`}
          >
            <button
              onClick={() => onSelectForReply(id)}
              className="p-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              title="Reply to this message"
            >
              <CornerUpLeft size={14} />
            </button>
          </div>
        )}

        {/* Reaction picker (iMessage-style) - shows on double-click */}
        <AnimatePresence>
          {showReactionPicker && onReact && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className={`absolute -top-12 ${isOutbound ? 'right-0' : 'left-0'} z-10`}
            >
              <div className="flex items-center gap-1 px-2 py-1.5 bg-background border border-border rounded-full shadow-lg">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(id, emoji);
                      setShowReactionPicker(false);
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reactions display (iMessage-style) - shows below bubble */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={`flex items-center gap-1 mt-1 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(groupedReactions).map(([emoji, reactors]) => (
              <motion.div
                key={emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-0.5 px-1.5 py-0.5 bg-background border border-border rounded-full text-xs shadow-sm"
                title={reactors.map(r => r === 'church' ? 'You' : 'Member').join(', ')}
              >
                <span>{emoji}</span>
                {reactors.length > 1 && (
                  <span className="text-muted-foreground">{reactors.length}</span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Memoized MessageBubble component
 * Prevents re-renders of individual messages when conversation re-renders
 * Shallow comparison of all message props (content, direction, media, status, etc.)
 * Critical for performance in message lists with many messages
 */
export const MessageBubble = memo(MessageBubbleComponent);
