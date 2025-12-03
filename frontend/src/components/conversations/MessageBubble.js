import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { Download } from 'lucide-react';
import { LazyImage } from '../LazyImage';
function MessageBubbleComponent(props) {
    const { content, direction, memberName, deliveryStatus, mediaUrl, mediaType, mediaName, mediaSizeBytes, mediaDuration, createdAt, } = props;
    const isOutbound = direction === 'outbound';
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
    return (_jsx("div", { className: `flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-4`, children: _jsxs("div", { className: `max-w-sm rounded-lg p-3 ${isOutbound
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground'}`, children: [!isOutbound && memberName && (_jsx("p", { className: "text-xs font-semibold mb-1 opacity-75", children: memberName })), mediaUrl && mediaType === 'image' && (_jsx("a", { href: mediaUrl, target: "_blank", rel: "noopener noreferrer", className: "block mb-2", children: _jsx(LazyImage, { src: mediaUrl, alt: "Message attachment", className: "max-w-xs rounded-lg hover:opacity-90 cursor-pointer" }) })), mediaUrl && mediaType === 'video' && (_jsx("a", { href: mediaUrl, target: "_blank", rel: "noopener noreferrer", className: "block mb-2 relative", children: _jsxs("video", { className: "max-w-xs rounded-lg", controls: true, poster: mediaUrl, children: [_jsx("source", { src: mediaUrl, type: "video/mp4" }), "Your browser does not support the video tag."] }) })), mediaUrl && mediaType === 'audio' && (_jsxs("div", { className: "mb-2", children: [_jsxs("audio", { controls: true, className: "max-w-xs rounded-lg", children: [_jsx("source", { src: mediaUrl, type: "audio/mpeg" }), "Your browser does not support the audio element."] }), mediaDuration && (_jsx("p", { className: "text-xs mt-1 opacity-75", children: formatDuration(mediaDuration) }))] })), mediaUrl && mediaType === 'document' && (_jsxs("a", { href: mediaUrl, target: "_blank", rel: "noopener noreferrer", className: `flex items-center gap-2 p-2 rounded-lg mb-2 ${isOutbound
                        ? 'bg-white/20 hover:bg-white/30'
                        : 'bg-foreground/10 hover:bg-foreground/20'}`, children: [_jsx("span", { children: "\uD83D\uDCC4" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: mediaName }), mediaSizeBytes && (_jsx("p", { className: "text-xs opacity-75", children: formatFileSize(mediaSizeBytes) }))] }), _jsx(Download, { size: 16, className: "flex-shrink-0" })] })), content && !content.startsWith('[') && (_jsx("p", { className: "text-sm break-words whitespace-pre-wrap", children: content })), _jsxs("div", { className: "flex items-center justify-between gap-2 mt-1", children: [_jsx("p", { className: `text-xs ${isOutbound ? 'text-white/80' : 'text-muted-foreground'}`, children: timestamp }), isOutbound && deliveryStatus && (_jsxs("span", { className: "text-xs opacity-75", children: [deliveryStatus === 'pending' && '⏱️', deliveryStatus === 'delivered' && '✓✓', deliveryStatus === 'failed' && '❌'] }))] })] }) }));
}
/**
 * Memoized MessageBubble component
 * Prevents re-renders of individual messages when conversation re-renders
 * Shallow comparison of all message props (content, direction, media, status, etc.)
 * Critical for performance in message lists with many messages
 */
export const MessageBubble = memo(MessageBubbleComponent);
//# sourceMappingURL=MessageBubble.js.map