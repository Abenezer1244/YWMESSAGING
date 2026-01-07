import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, AlertCircle, Reply, Sparkles, ChevronDown } from 'lucide-react';
import { SoftButton } from '../SoftUI';
import Input from '../ui/Input';
import { Spinner } from '../ui';
import { SendEffect, ConversationMessage } from '../../api/conversations';

// Available send effects (iMessage-style)
const SEND_EFFECTS: { value: SendEffect; label: string; icon: string }[] = [
  { value: 'none', label: 'Normal', icon: '💬' },
  { value: 'slam', label: 'Slam', icon: '💥' },
  { value: 'loud', label: 'Loud', icon: '📢' },
  { value: 'gentle', label: 'Gentle', icon: '🌸' },
  { value: 'invisibleInk', label: 'Invisible Ink', icon: '🔮' },
];

interface ReplyComposerProps {
  conversationId: string;
  onReply: (message: string, options?: { replyToId?: string; sendEffect?: SendEffect }) => Promise<void>;
  isLoading?: boolean;
  // Reply-to message (iMessage-style)
  replyToMessage?: ConversationMessage | null;
  onCancelReply?: () => void;
}

export function ReplyComposer({
  conversationId,
  onReply,
  isLoading,
  replyToMessage,
  onCancelReply,
}: ReplyComposerProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendEffect, setSendEffect] = useState<SendEffect>('none');
  const [showEffectPicker, setShowEffectPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size (500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(
        `File too large. Max 500MB, got ${(file.size / 1024 / 1024).toFixed(
          1
        )}MB`
      );
      return;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'audio/mpeg',
      'audio/wav',
      'audio/aac',
      'audio/ogg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(`File type not allowed: ${file.type}`);
      return;
    }

    setSelectedFile(file);

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSend = async () => {
    if (!message && !selectedFile) return;

    setError(null);

    if (selectedFile) {
      // Send with media
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (message) {
          formData.append('content', message);
        }

        const response = await fetch(
          `/api/messages/conversations/${conversationId}/reply-with-media`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to send message with media'
          );
        }

        // Clear state
        setMessage('');
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Call onReply to refresh conversation
        await onReply('');
      } catch (err) {
        console.error('Upload error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to send media'
        );
      } finally {
        setUploading(false);
      }
    } else {
      // Send text only
      try {
        const response = await fetch(
          `/api/messages/conversations/${conversationId}/reply`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: message,
              replyToId: replyToMessage?.id,
              sendEffect: sendEffect !== 'none' ? sendEffect : undefined,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }

        // Clear state
        setMessage('');
        setSendEffect('none');
        onCancelReply?.();
        await onReply('', {
          replyToId: replyToMessage?.id,
          sendEffect: sendEffect !== 'none' ? sendEffect : undefined,
        });
      } catch (err) {
        console.error('Send error:', err);
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / 1024 / 1024;
    return mb > 1 ? `${mb.toFixed(1)}MB` : `${(bytes / 1024).toFixed(0)}KB`;
  };

  return (
    <div className="bg-card border-t border-border p-4">
      {/* Reply-to preview (iMessage-style) */}
      {replyToMessage && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-muted/50 rounded-lg border-l-4 border-primary">
          <Reply size={14} className="text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Replying to {replyToMessage.direction === 'outbound' ? 'yourself' : 'member'}
            </p>
            <p className="text-sm truncate">{replyToMessage.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-3 flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-lg">
          <AlertCircle size={16} className="flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* File preview */}
      {filePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={filePreview}
            alt="Preview"
            className="max-h-40 rounded-lg border border-border"
          />
          <button
            onClick={() => {
              setSelectedFile(null);
              setFilePreview(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* File name for documents */}
      {selectedFile && !filePreview && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg">
          <Paperclip size={16} className="text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-foreground flex-1 truncate">
            {selectedFile.name}
          </span>
          <button
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="text-red-500 hover:text-red-600 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 items-end">
        {/* File input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          disabled={uploading || isLoading}
        />

        {/* Attach button */}
        <div title="Attach file (image, video, audio, document)">
          <SoftButton
            variant="secondary"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isLoading}
            className="flex-shrink-0"
          >
            <Paperclip size={18} />
          </SoftButton>
        </div>

        {/* Message input */}
        <Input
          placeholder={
            selectedFile
              ? 'Add a caption (optional)...'
              : 'Type a message...'
          }
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
          disabled={uploading || isLoading}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1"
        />

        {/* Send effect picker (iMessage-style) */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowEffectPicker(!showEffectPicker)}
            className={`p-2 rounded-lg transition-colors ${
              sendEffect !== 'none'
                ? 'bg-primary/20 text-primary'
                : 'hover:bg-muted text-muted-foreground'
            }`}
            title="Send with effect"
          >
            <Sparkles size={18} />
          </button>
          {showEffectPicker && (
            <div className="absolute bottom-full right-0 mb-2 bg-background border border-border rounded-lg shadow-lg p-2 min-w-[150px] z-10">
              <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Send with effect</p>
              {SEND_EFFECTS.map((effect) => (
                <button
                  key={effect.value}
                  onClick={() => {
                    setSendEffect(effect.value);
                    setShowEffectPicker(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted ${
                    sendEffect === effect.value ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <span>{effect.icon}</span>
                  <span>{effect.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Send button */}
        <SoftButton
          variant="primary"
          size="md"
          onClick={handleSend}
          disabled={!message && !selectedFile || uploading || isLoading}
          className="flex-shrink-0"
        >
          {uploading || isLoading ? <Spinner size="sm" /> : <Send size={18} />}
        </SoftButton>
      </div>

      {/* File size info */}
      {selectedFile && (
        <div className="text-xs text-muted-foreground mt-2">
          {formatFileSize(selectedFile.size)} • Will be sent at full quality
        </div>
      )}
    </div>
  );
}
