import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { Send, Paperclip, X, AlertCircle } from 'lucide-react';
import { SoftButton } from '../SoftUI';
import Input from '../ui/Input';
import { Spinner } from '../ui';
export function ReplyComposer({ conversationId, onReply, isLoading, }) {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setError(null);
        // Validate file size (500MB)
        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(`File too large. Max 500MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB`);
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
                setFilePreview(e.target?.result);
            };
            reader.readAsDataURL(file);
        }
        else {
            setFilePreview(null);
        }
    };
    const handleSend = async () => {
        if (!message && !selectedFile)
            return;
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
                const response = await fetch(`/api/messages/conversations/${conversationId}/reply-with-media`, {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to send message with media');
                }
                // Clear state
                setMessage('');
                setSelectedFile(null);
                setFilePreview(null);
                if (fileInputRef.current)
                    fileInputRef.current.value = '';
                // Call onReply to refresh conversation
                await onReply('');
            }
            catch (err) {
                console.error('Upload error:', err);
                setError(err instanceof Error ? err.message : 'Failed to send media');
            }
            finally {
                setUploading(false);
            }
        }
        else {
            // Send text only
            try {
                const response = await fetch(`/api/messages/conversations/${conversationId}/reply`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: message }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to send message');
                }
                // Clear state
                setMessage('');
                await onReply('');
            }
            catch (err) {
                console.error('Send error:', err);
                setError(err instanceof Error ? err.message : 'Failed to send message');
            }
        }
    };
    const formatFileSize = (bytes) => {
        if (!bytes)
            return '';
        const mb = bytes / 1024 / 1024;
        return mb > 1 ? `${mb.toFixed(1)}MB` : `${(bytes / 1024).toFixed(0)}KB`;
    };
    return (_jsxs("div", { className: "bg-card border-t border-border p-4", children: [error && (_jsxs("div", { className: "mb-3 flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-lg", children: [_jsx(AlertCircle, { size: 16, className: "flex-shrink-0" }), _jsx("p", { className: "text-sm", children: error }), _jsx("button", { onClick: () => setError(null), className: "ml-auto text-red-600 hover:text-red-700", children: _jsx(X, { size: 16 }) })] })), filePreview && (_jsxs("div", { className: "mb-3 relative inline-block", children: [_jsx("img", { src: filePreview, alt: "Preview", className: "max-h-40 rounded-lg border border-border" }), _jsx("button", { onClick: () => {
                            setSelectedFile(null);
                            setFilePreview(null);
                            if (fileInputRef.current)
                                fileInputRef.current.value = '';
                        }, className: "absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600", children: _jsx(X, { size: 16 }) })] })), selectedFile && !filePreview && (_jsxs("div", { className: "mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg", children: [_jsx(Paperclip, { size: 16, className: "text-muted-foreground flex-shrink-0" }), _jsx("span", { className: "text-sm text-foreground flex-1 truncate", children: selectedFile.name }), _jsx("button", { onClick: () => {
                            setSelectedFile(null);
                            if (fileInputRef.current)
                                fileInputRef.current.value = '';
                        }, className: "text-red-500 hover:text-red-600 flex-shrink-0", children: _jsx(X, { size: 16 }) })] })), _jsxs("div", { className: "flex gap-2 items-end", children: [_jsx("input", { ref: fileInputRef, type: "file", onChange: handleFileSelect, style: { display: 'none' }, accept: "image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx", disabled: uploading || isLoading }), _jsx("div", { title: "Attach file (image, video, audio, document)", children: _jsx(SoftButton, { variant: "secondary", size: "md", onClick: () => fileInputRef.current?.click(), disabled: uploading || isLoading, className: "flex-shrink-0", children: _jsx(Paperclip, { size: 18 }) }) }), _jsx(Input, { placeholder: selectedFile
                            ? 'Add a caption (optional)...'
                            : 'Type a message...', value: message, onChange: (e) => setMessage(e.target.value), disabled: uploading || isLoading, onKeyPress: (e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }, className: "flex-1" }), _jsx(SoftButton, { variant: "primary", size: "md", onClick: handleSend, disabled: !message && !selectedFile || uploading || isLoading, className: "flex-shrink-0", children: uploading || isLoading ? _jsx(Spinner, { size: "sm" }) : _jsx(Send, { size: 18 }) })] }), selectedFile && (_jsxs("div", { className: "text-xs text-muted-foreground mt-2", children: [formatFileSize(selectedFile.size), " \u2022 Will be sent at full quality"] }))] }));
}
//# sourceMappingURL=ReplyComposer.js.map