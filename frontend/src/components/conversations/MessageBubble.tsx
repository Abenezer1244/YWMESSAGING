import React from 'react';
import { Download, Play } from 'lucide-react';

interface MessageProps {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  memberName?: string;
  deliveryStatus?: string | null;
  // Media fields
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | 'audio' | 'document' | null;
  mediaName?: string | null;
  mediaSizeBytes?: number | null;
  mediaDuration?: number | null;
  createdAt: string | Date;
}

export function MessageBubble(props: MessageProps) {
  const {
    content,
    direction,
    memberName,
    deliveryStatus,
    mediaUrl,
    mediaType,
    mediaName,
    mediaSizeBytes,
    mediaDuration,
    createdAt,
  } = props;

  const isOutbound = direction === 'outbound';

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

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-sm rounded-lg p-3 ${
          isOutbound
            ? 'bg-primary text-white'
            : 'bg-muted text-foreground'
        }`}
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
            <img
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

        {/* Footer: Timestamp and delivery status */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <p
            className={`text-xs ${
              isOutbound ? 'text-white/80' : 'text-muted-foreground'
            }`}
          >
            {timestamp}
          </p>

          {/* Delivery status indicator (outbound only) */}
          {isOutbound && deliveryStatus && (
            <span className="text-xs opacity-75">
              {deliveryStatus === 'pending' && '⏱️'}
              {deliveryStatus === 'delivered' && '✓✓'}
              {deliveryStatus === 'failed' && '❌'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
