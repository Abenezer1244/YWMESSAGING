import React, { useState, useRef } from 'react';
import { Button, Input, Spinner } from '@nextui-org/react';
import { Send, Paperclip, X, AlertCircle } from 'lucide-react';

interface ReplyComposerProps {
  conversationId: string;
  onReply: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReplyComposer({
  conversationId,
  onReply,
  isLoading,
}: ReplyComposerProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      reader.onload = (e) => {
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
            body: JSON.stringify({ content: message }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }

        // Clear state
        setMessage('');
        await onReply('');
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
        <Button
          isIconOnly
          variant="light"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isLoading}
          className="text-primary flex-shrink-0"
          title="Attach file (image, video, audio, document)"
        >
          <Paperclip size={20} />
        </Button>

        {/* Message input */}
        <Input
          placeholder={
            selectedFile
              ? 'Add a caption (optional)...'
              : 'Type a message...'
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={uploading || isLoading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          size="lg"
          className="flex-1"
        />

        {/* Send button */}
        <Button
          isIconOnly
          color="primary"
          onClick={handleSend}
          disabled={!message && !selectedFile}
          isLoading={uploading || isLoading}
          className="flex-shrink-0"
        >
          {uploading || isLoading ? <Spinner size="sm" /> : <Send size={20} />}
        </Button>
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
