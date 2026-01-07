import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Reply, CornerUpLeft } from 'lucide-react';
import { LazyImage } from '../LazyImage';
// Available reactions (iMessage style)
const REACTION_EMOJIS = ['❤️', '👍', '👎', '😂', '😮', '😢'];
function MessageBubbleComponent(props) {
    const { id, content, direction, memberName, deliveryStatus, channel, rcsReadAt, mediaUrl, mediaType, mediaName, mediaSizeBytes, mediaDuration, createdAt, isFirstInGroup = true, isLastInGroup = true, showTail = true, reactions = [], onReact, replyTo, onReplyClick, onSelectForReply, sendEffect, } = props;
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const isOutbound = direction === 'outbound';
    // Group reactions by emoji for display
    const groupedReactions = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction.reactedBy);
        return acc;
    }, {});
    // Send effect animations
    const getSendEffectVariants = () => {
        switch (sendEffect) {
            case 'slam':
                return {
                    initial: { scale: 3, opacity: 0 },
                    animate: { scale: 1, opacity: 1 },
                    transition: { type: 'spring', damping: 8, stiffness: 200 }
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
                    transition: { duration: 0.8, ease: 'easeOut' }
                };
            case 'invisibleInk':
                return {
                    initial: { filter: 'blur(20px)' },
                    animate: { filter: 'blur(0px)' },
                    transition: { duration: 2, ease: 'easeOut' }
                };
            default:
                return {
                    initial: { opacity: 0, y: 10, scale: 0.95 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                    transition: { duration: 0.2, ease: 'easeOut' }
                };
        }
    };
    const effectVariants = getSendEffectVariants();
    const formatFileSize = (bytes) => {
        if (!bytes)
            return '';
        const mb = bytes / 1024 / 1024;
        return mb > 1 ? `${mb.toFixed(1)}MB` : `${(bytes / 1024).toFixed(0)}KB`;
    };
    const formatDuration = (seconds) => {
        if (!seconds)
            return '';
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
            if (isFirstInGroup && isLastInGroup)
                return 'rounded-2xl rounded-br-md'; // Single message
            if (isFirstInGroup)
                return 'rounded-2xl rounded-br-lg'; // First in group
            if (isLastInGroup)
                return 'rounded-2xl rounded-br-md rounded-tr-lg'; // Last in group
            return 'rounded-2xl rounded-r-lg'; // Middle of group
        }
        else {
            // Inbound: tail on left side
            if (isFirstInGroup && isLastInGroup)
                return 'rounded-2xl rounded-bl-md'; // Single message
            if (isFirstInGroup)
                return 'rounded-2xl rounded-bl-lg'; // First in group
            if (isLastInGroup)
                return 'rounded-2xl rounded-bl-md rounded-tl-lg'; // Last in group
            return 'rounded-2xl rounded-l-lg'; // Middle of group
        }
    };
    return (_jsx(motion.div, { initial: effectVariants.initial, animate: effectVariants.animate, transition: effectVariants.transition, className: `flex ${isOutbound ? 'justify-end' : 'justify-start'} ${isLastInGroup ? 'mb-3' : 'mb-1'}`, children: _jsxs("div", { className: "relative group", children: [replyTo && (_jsxs("div", { className: `mb-1 px-3 py-1.5 rounded-lg text-xs max-w-[200px] truncate cursor-pointer ${isOutbound
                        ? 'bg-primary/30 text-white/80 ml-auto'
                        : 'bg-muted/70 text-muted-foreground'}`, onClick: () => onReplyClick?.(replyTo.id), title: "Click to view original message", children: [_jsxs("div", { className: "flex items-center gap-1 mb-0.5", children: [_jsx(Reply, { size: 10 }), _jsx("span", { className: "font-medium", children: replyTo.direction === 'outbound' ? 'You' : 'Member' })] }), _jsx("p", { className: "truncate", children: replyTo.content })] })), _jsxs("div", { className: `max-w-sm p-3 ${isOutbound
                        ? 'bg-primary text-white'
                        : 'bg-muted text-foreground'} ${getBorderRadius()} cursor-pointer`, onDoubleClick: () => setShowReactionPicker(!showReactionPicker), children: [!isOutbound && memberName && (_jsx("p", { className: "text-xs font-semibold mb-1 opacity-75", children: memberName })), mediaUrl && mediaType === 'image' && (_jsx("a", { href: mediaUrl, target: "_blank", rel: "noopener noreferrer", className: "block mb-2", children: _jsx(LazyImage, { src: mediaUrl, alt: "Message attachment", className: "max-w-xs rounded-lg hover:opacity-90 cursor-pointer" }) })), mediaUrl && mediaType === 'video' && (_jsx("a", { href: mediaUrl, target: "_blank", rel: "noopener noreferrer", className: "block mb-2 relative", children: _jsxs("video", { className: "max-w-xs rounded-lg", controls: true, poster: mediaUrl, children: [_jsx("source", { src: mediaUrl, type: "video/mp4" }), "Your browser does not support the video tag."] }) })), mediaUrl && mediaType === 'audio' && (_jsxs("div", { className: "mb-2", children: [_jsxs("audio", { controls: true, className: "max-w-xs rounded-lg", children: [_jsx("source", { src: mediaUrl, type: "audio/mpeg" }), "Your browser does not support the audio element."] }), mediaDuration && (_jsx("p", { className: "text-xs mt-1 opacity-75", children: formatDuration(mediaDuration) }))] })), mediaUrl && mediaType === 'document' && (_jsxs("a", { href: mediaUrl, target: "_blank", rel: "noopener noreferrer", className: `flex items-center gap-2 p-2 rounded-lg mb-2 ${isOutbound
                                ? 'bg-white/20 hover:bg-white/30'
                                : 'bg-foreground/10 hover:bg-foreground/20'}`, children: [_jsx("span", { children: "\uD83D\uDCC4" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: mediaName }), mediaSizeBytes && (_jsx("p", { className: "text-xs opacity-75", children: formatFileSize(mediaSizeBytes) }))] }), _jsx(Download, { size: 16, className: "flex-shrink-0" })] })), content && !content.startsWith('[') && (_jsx("p", { className: "text-sm break-words whitespace-pre-wrap", children: content })), _jsxs("div", { className: "flex items-center justify-between gap-2 mt-1", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("p", { className: `text-xs ${isOutbound ? 'text-white/80' : 'text-muted-foreground'}`, children: timestamp }), channel === 'rcs' && (_jsx("span", { className: `text-xs ${isOutbound ? 'text-white/60' : 'text-muted-foreground/60'}`, children: "\u2022" }))] }), isOutbound && (_jsx("span", { className: "text-xs opacity-75 flex items-center gap-1", children: rcsReadAt ? (_jsx("span", { title: `Read at ${new Date(rcsReadAt).toLocaleTimeString()}`, children: "\u2713\u2713 Read" })) : deliveryStatus === 'pending' ? ('⏱️') : deliveryStatus === 'delivered' ? ('✓✓') : deliveryStatus === 'failed' ? ('❌') : null }))] })] }), showTail && isLastInGroup && (_jsx("div", { className: `absolute bottom-0 w-3 h-3 ${isOutbound
                        ? 'right-0 -mr-1 bg-primary'
                        : 'left-0 -ml-1 bg-muted'}`, style: {
                        clipPath: isOutbound
                            ? 'polygon(0 0, 100% 0, 100% 100%)'
                            : 'polygon(0 0, 100% 0, 0 100%)',
                    } })), onSelectForReply && (_jsx("div", { className: `absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${isOutbound ? '-left-10' : '-right-10'}`, children: _jsx("button", { onClick: () => onSelectForReply(id), className: "p-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors", title: "Reply to this message", children: _jsx(CornerUpLeft, { size: 14 }) }) })), _jsx(AnimatePresence, { children: showReactionPicker && onReact && (_jsx(motion.div, { initial: { opacity: 0, scale: 0.8, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.8, y: 10 }, className: `absolute -top-12 ${isOutbound ? 'right-0' : 'left-0'} z-10`, children: _jsx("div", { className: "flex items-center gap-1 px-2 py-1.5 bg-background border border-border rounded-full shadow-lg", children: REACTION_EMOJIS.map((emoji) => (_jsx("button", { onClick: () => {
                                    onReact(id, emoji);
                                    setShowReactionPicker(false);
                                }, className: "w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors text-lg", children: emoji }, emoji))) }) })) }), Object.keys(groupedReactions).length > 0 && (_jsx("div", { className: `flex items-center gap-1 mt-1 ${isOutbound ? 'justify-end' : 'justify-start'}`, children: Object.entries(groupedReactions).map(([emoji, reactors]) => (_jsxs(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, className: "flex items-center gap-0.5 px-1.5 py-0.5 bg-background border border-border rounded-full text-xs shadow-sm", title: reactors.map(r => r === 'church' ? 'You' : 'Member').join(', '), children: [_jsx("span", { children: emoji }), reactors.length > 1 && (_jsx("span", { className: "text-muted-foreground", children: reactors.length }))] }, emoji))) }))] }) }));
}
/**
 * Memoized MessageBubble component
 * Prevents re-renders of individual messages when conversation re-renders
 * Shallow comparison of all message props (content, direction, media, status, etc.)
 * Critical for performance in message lists with many messages
 */
export const MessageBubble = memo(MessageBubbleComponent);
//# sourceMappingURL=MessageBubble.js.map